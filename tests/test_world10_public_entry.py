"""DIGIY RESTO : dix langues réelles sur la page publique (sans réseau)."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
LANGS = {"fr","en","es","pt","it","de","nl","ar","wo","zh"}


class World10Entry(unittest.TestCase):
    def test_language_buttons_and_dictionary(self):
        buttons = re.findall(r'<button data-lang="([^"]+)"',HTML)
        self.assertEqual(len(buttons),10)
        self.assertEqual(set(buttons),LANGS)
        start=HTML.index("const T = ")+len("const T = ")
        end=HTML.index(";\nfunction setLang",start)
        d=json.loads(HTML[start:end])
        self.assertEqual(set(d),LANGS)
        for l in LANGS:
            self.assertEqual(set(d[l]),set(d["fr"]))
            self.assertTrue(all(d[l].values()))
        self.assertNotEqual(d["wo"]["joinq"],d["fr"]["joinq"])
        self.assertNotEqual(d["zh"]["joinq"],d["fr"]["joinq"])

    def test_doctrine_and_contact_preserved(self):
        self.assertIn("0 %",HTML)
        self.assertIn("DIGIY",HTML)
        self.assertIn("document.documentElement.lang=lang",HTML)
        self.assertIn("history.replaceState(null,'',u)",HTML)
        self.assertNotIn("checkout.stripe",HTML)
        self.assertNotIn('href="/?lang=wo"',HTML)

    def test_language_in_tariff_link(self):
        self.assertIn("tarifs-",HTML)
        self.assertIn("searchParams.set('lang',lang)",HTML)

    def test_javascript_inline_parses(self):
        scripts=re.findall(r"<script\\b([^>]*)>([\\s\\S]*?)</script>",HTML)
        for attrs,script in scripts:
            if not script.strip() or "application/ld+json" in attrs:
                continue
            result=subprocess.run(["node","--check","-"],input=script,capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr)


if __name__ == "__main__":
    unittest.main()
