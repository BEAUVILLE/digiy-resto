"""WORLD10 for the two temporary dish editors embedded in real RESTO PRO."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PAGES={
 "week":(ROOT/"prototypes/resto-v35-ma-semaine.html").read_text(encoding="utf-8"),
 "regular":(ROOT/"prototypes/resto-v35-plats-salades-apercu-valide.html").read_text(encoding="utf-8")
}
PARENT=(ROOT/"resa-resto/ma-carte.html").read_text(encoding="utf-8")
DICTIONARY=(ROOT/"resa-resto/world10-pro.js").read_text(encoding="utf-8")


def translated_rows():
    script=r"""
const fs=require('node:fs'), vm=require('node:vm');
const file=fs.readFileSync(process.argv[1],'utf8');
const first=file.indexOf('  const langs = '),last=file.indexOf('  const phrases = new Map();',first);
if(first<0||last<0) process.exit(3);
const src=file.slice(first,last);
process.stdout.write(vm.runInNewContext('(function(){'+src+
  'return JSON.stringify({langs,rows});})()'));
"""
    p=subprocess.run(["node","-e",script,str(ROOT/"resa-resto/world10-pro.js")],
                     capture_output=True,text=True,check=True)
    return json.loads(p.stdout)


class EmbeddedProWorld10(unittest.TestCase):
    def test_shared_translator_loaded_in_both_iframes(self):
        for name,html in PAGES.items():
            self.assertEqual(html.count('<script src="../resa-resto/world10-pro.js" defer></script>'),1,name)
        self.assertIn('id="menuPrototype"',PARENT)
        self.assertIn('id="cartePrototype"',PARENT)
        self.assertIn("DIGIY_RESTO_WORLD10_LANG",DICTIONARY)
        self.assertIn('e.origin !== location.origin',DICTIONARY)
        self.assertIn('e.source !== window.parent',DICTIONARY)
        self.assertIn('frame.addEventListener("load", signalEmbeddedEditors)',DICTIONARY)
        self.assertIn('window.self === window.top',DICTIONARY)
        self.assertIn('signalEmbeddedEditors()',DICTIONARY)
        # Changing languages sends a message: no iframe reload, no draft reset.
        self.assertNotIn('frame.src=',DICTIONARY)
        self.assertNotIn('frame.src =',DICTIONARY)

    def test_every_static_prototype_label_is_translated(self):
        result=translated_rows()
        self.assertEqual(result["langs"],["fr","en","es","pt","de","it","nl","ar","wo","zh"])
        labels={row[0]:row for row in result["rows"]}
        self.assertEqual(len(labels),len(result["rows"]))
        for row in result["rows"]:
            self.assertEqual(len(row),10,row[0])
            self.assertTrue(all(isinstance(v,str) and v.strip() for v in row),row[0])
        for name,html in PAGES.items():
            plain=re.sub(r"<script\b[^>]*>[\s\S]*?</script>","",html,flags=re.I)
            plain=re.sub(r"<style\b[^>]*>[\s\S]*?</style>","",plain,flags=re.I)
            plain=re.sub(r"<[^>]+>","|",plain)
            labels_on_page={x.strip() for x in plain.replace("&amp;","&").split("|")
                            if len(x.strip())>3 and re.search(r"[À-ÿA-Za-z]",x)}
            missing=labels_on_page-set(labels)
            self.assertFalse(missing,f"{name} missing UI: {sorted(missing)}")
            for attr,value in re.findall(r'\b(placeholder|alt|aria-label|title)="([^"]+)"',html):
                if value in {"ex. 16.50"} or re.search(r"[A-Za-zÀ-ÿ]",value):
                    self.assertIn(value,labels,f"{name}: {attr}={value}")

    def test_dynamic_copy_localized_without_translating_user_data(self):
        labels={row[0]:row for row in translated_rows()["rows"]}
        for phrase in [
            "Jour sélectionné : "," · votre brouillon est privé et non enregistré.",
            "Plat ajouté au brouillon temporaire du ",". Rien n’a été publié.",
            "Photo temporaire : ","Photo de ","Supprimer le plat ",
            " élément"," éléments",
            "Brouillon effacé.","Aucun plat ou salade ajouté."
        ]:
            self.assertIn(phrase,labels)
        self.assertIn('parent.id === "selection"',DICTIONARY)
        self.assertIn('parent.id === "formStatus"',DICTIONARY)
        self.assertIn('parent.id === "count"',DICTIONARY)
        self.assertIn(".card strong, .card p, .preview-card strong, .preview-card p",DICTIONARY)
        self.assertIn("variants.includes(current)",DICTIONARY)

    def test_clear_draft_confirmation_uses_active_language(self):
        weekly=(ROOT/"prototypes/resto-v35-ma-semaine.js").read_text(encoding="utf-8")
        regular=PAGES["regular"]
        self.assertIn("translate: t",DICTIONARY)
        self.assertIn("DIGIY_RESTO_PRO_WORLD10?.translate?.(",weekly)
        self.assertIn("DIGIY_RESTO_PRO_WORLD10?.translate?.(",regular)
        translation={row[0]:row for row in translated_rows()["rows"]}
        for text in [
            "Effacer tous les plats de cette maquette ? Ils ne sont pas enregistrés.",
            "Effacer tous les plats et salades de cette démonstration ?"
        ]:
            self.assertIn(text,translation)
            self.assertEqual(len(translation[text]),10)
            self.assertNotEqual(translation[text][0],translation[text][9])
        result=subprocess.run(["node","--check",
                               str(ROOT/"prototypes/resto-v35-ma-semaine.js")],
                              capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        inline=re.search(r"<script>([\\s\\S]*?)</script>",regular)
        self.assertIsNotNone(inline)
        result=subprocess.run(["node","--check","-"],input=inline.group(1),
                              capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_no_prototype_business_code_changed(self):
        self.assertIn('src="../src/resto-v35-weekly-core.js" defer',PAGES["week"])
        self.assertIn('src="./resto-v35-ma-semaine.js" defer',PAGES["week"])
        self.assertIn('id="dishForm"',PAGES["week"])
        self.assertIn('id="dishForm"',PAGES["regular"])
        self.assertIn('id="previewBtn"',PAGES["regular"])
        self.assertIn('id="clearBtn"',PAGES["regular"])
        self.assertIn('Publication verrouillée',PAGES["week"])
        self.assertIn('Publication verrouillée.',PAGES["regular"])
        r=subprocess.run(["node","--check",str(ROOT/"resa-resto/world10-pro.js")],
                         capture_output=True,text=True)
        self.assertEqual(r.returncode,0,r.stderr)


if __name__=="__main__":
    unittest.main()
