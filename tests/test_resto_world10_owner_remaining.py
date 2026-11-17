"""WORLD10 RESTO PRO: real owner settings, dishes and QR menu, without business changes."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORLD10=(ROOT/"resa-resto/world10-pro.js").read_text(encoding="utf-8")
PAGES={
    name:(ROOT/f"resa-resto/{name}.html").read_text(encoding="utf-8")
    for name in ("reglages","ma-carte","ma-menu-qr")
}
LANGS=["fr","en","es","pt","de","it","nl","ar","wo","zh"]


def rows():
    code=r"""
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(process.argv[1],'utf8');
const start=source.indexOf('  const langs = ');
const stop=source.indexOf('  const phrases = new Map();',start);
if(start<0 || stop<0) process.exit(2);
const part=source.slice(start,stop);
process.stdout.write(vm.runInNewContext('(function(){'+part+
  'return JSON.stringify({langs,names,rows});})()'));
"""
    p=subprocess.run(["node","-e",code,str(ROOT/"resa-resto/world10-pro.js")],
                     capture_output=True,text=True,check=True)
    return json.loads(p.stdout)


class RealProOwnerWorld10(unittest.TestCase):
    def test_all_three_real_pages_load_shared_translator(self):
        for name,html in PAGES.items():
            self.assertEqual(html.count('<script src="./world10-pro.js" defer></script>'),1,name)
            self.assertIn('<html lang="fr">',html)
            self.assertIn('name="robots" content="noindex,nofollow,noarchive"',html)
        self.assertIn('document.querySelector("body > header .wrap")',WORLD10)
        self.assertIn('document.querySelector("body > header")',WORLD10)
        self.assertIn('"reglages.html": "Réglages RESA RESTO — DIGIYLYFE"',WORLD10)
        self.assertIn('"ma-carte.html": "Mes plats · Espace propriétaire DIGIY RESTO"',WORLD10)
        self.assertIn('"ma-menu-qr.html": "Ma carte QR · Gestion DIGIY RESTO"',WORLD10)

    def test_no_untranslated_static_owner_labels(self):
        data=rows()
        self.assertEqual(data["langs"],LANGS)
        self.assertEqual(len(data["names"]),10)
        mapping={row[0]:row for row in data["rows"]}
        self.assertEqual(len(mapping),len(data["rows"]),"Duplicate French keys")
        for row in data["rows"]:
            self.assertEqual(len(row),10,row[0])
            self.assertTrue(all(isinstance(v,str) and v.strip() for v in row),row[0])
        # Read only literal UI labels outside <script> and <style>. Never inspect
        # restaurant-owned item data or user input values as translatable.
        exempt={"FCFA","RESA RESTO","DIGIY RESTO"}
        for name,html in PAGES.items():
            static=re.sub(r"<script\b[^>]*>[\s\S]*?</script>","",html,flags=re.I)
            static=re.sub(r"<style\b[^>]*>[\s\S]*?</style>","",static,flags=re.I)
            static=re.sub(r"<[^>]*>","|",static)
            static=static.replace("&amp;","&").replace("&nbsp;"," ")
            labels={value.strip() for value in static.split("|")
                    if len(value.strip())>3 and re.search(r"[À-ÿA-Za-z]",value)}
            missing={value for value in labels if value not in mapping
                     and value not in exempt and not value.startswith("DIGIY ")}
            self.assertFalse(missing,f"{name} untranslated: {sorted(missing)}")

    def test_business_and_permissions_are_untouched(self):
        for name in ("reglages","ma-carte","ma-menu-qr"):
            html=PAGES[name]
            self.assertIn("createClient(",html,name)
            self.assertIn("digiy_resa_resto_sites",html,name)
        self.assertIn("shouldCreateUser:false",PAGES["reglages"])
        self.assertIn("site.owner_id!==user.id",PAGES["ma-carte"])
        self.assertIn("s.owner_id!==identity.data.user.id",PAGES["ma-menu-qr"])
        self.assertIn("digiy_resto_qr_drafts",PAGES["ma-menu-qr"])
        self.assertIn("digiy_resto_qr_public",PAGES["ma-menu-qr"])
        self.assertIn("Aucun accès à la gestion d’un autre établissement.",PAGES["ma-carte"])
        self.assertIn("restaurantTitle",WORLD10)
        self.assertIn('source.slice(prefix.length)',WORLD10)
        self.assertIn('originalAria',WORLD10)
        self.assertIn('originalTitleAttr',WORLD10)
        self.assertIn('isOwnerName',WORLD10)

    def test_dynamic_owner_copy_has_all_ten_languages(self):
        mapping={row[0]:row for row in rows()["rows"]}
        keys=[
            "Lun","Mar","Mer","Jeu","Ven","Sam","Dim","Fermé",
            "Restaurant vérifié : ","Restaurant : ","Rubrique ",
            "Disponible (décocher si épuisé)","Nom de rubrique (ex. Plats, Boissons, Desserts)",
            "✅ Carte publiée. Le client verra cette version en ouvrant ou en actualisant le QR.",
            "✅ Règles enregistrées. RESA les applique immédiatement.",
            "⚠️ Sauvegarde refusée : ",
            "⚠️ Accès au stockage des menus indisponible : "
        ]
        for key in keys:
            self.assertIn(key,mapping,key)
            self.assertNotEqual(mapping[key][0],mapping[key][9],key)

    def test_script_and_inline_js_syntax(self):
        r=subprocess.run(["node","--check",str(ROOT/"resa-resto/world10-pro.js")],
                         capture_output=True,text=True)
        self.assertEqual(r.returncode,0,r.stderr)
        for name,html in PAGES.items():
            scripts=re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>",html)
            for attrs,script in scripts:
                if "src=" in attrs or not script.strip(): continue
                r=subprocess.run(["node","--check","-"],input=script,
                                 capture_output=True,text=True)
                self.assertEqual(r.returncode,0,f"{name}: {r.stderr}")


if __name__=="__main__":
    unittest.main()
