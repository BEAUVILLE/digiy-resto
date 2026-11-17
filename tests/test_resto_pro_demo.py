"""RESTO PRO : exemple fictif consultable sans Magic Link et sans écriture."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = (ROOT / "resa-resto/demo-pro.html").read_text(encoding="utf-8")
LOGIN = (ROOT / "resa-resto/acces-proprietaire.html").read_text(encoding="utf-8")
SCRIPT = (ROOT / "resa-resto/world10-pro.js").read_text(encoding="utf-8")


def dictionary():
    js = r"""
const fs = require('node:fs'), vm = require('node:vm');
const source = fs.readFileSync(process.argv[1], 'utf8');
const begin = source.indexOf('  const langs = ');
const end = source.indexOf('  const phrases = new Map();', begin);
const part = source.slice(begin, end);
process.stdout.write(vm.runInNewContext('(function(){'+part+'return JSON.stringify({langs,rows});})()'));
"""
    result = subprocess.run(["node", "-e", js, str(ROOT / "resa-resto/world10-pro.js")],
                            text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


class SafeDemo(unittest.TestCase):
    def test_demo_reachable_from_actual_owner_entrance(self):
        self.assertIn('href="./demo-pro.html"', LOGIN)
        self.assertIn("👁 VOIR UNE DÉMONSTRATION (SANS COMPTE) →", LOGIN)
        self.assertIn('src="./world10-pro.js"', PAGE)
        self.assertIn('href="./acces-proprietaire.html"', PAGE)

    def test_fictitious_readonly_not_authenticated(self):
        self.assertIn("DÉMONSTRATION · AUCUNE DONNÉE RÉELLE", PAGE)
        self.assertIn("MODE LECTURE SEULE", PAGE)
        self.assertIn('name="robots" content="noindex,nofollow,noarchive,nosnippet"', PAGE)
        self.assertGreaterEqual(PAGE.count(" disabled>"), 4)
        self.assertNotIn("<form", PAGE.lower())
        self.assertNotIn("<input", PAGE.lower())
        self.assertNotIn("supabase", PAGE.lower())
        self.assertNotIn("resto-qr-menu-core", PAGE)
        self.assertNotIn("fetch(", PAGE)
        self.assertNotIn("navigator.clipboard", PAGE)
        self.assertNotIn("localStorage", PAGE)
        self.assertNotIn("sessionStorage", PAGE)
        self.assertNotIn("auth.signIn", PAGE)
        self.assertNotIn("test-resa-resto-saly", PAGE)
        self.assertNotIn("window.location.replace(", PAGE)

    def test_all_new_copy_in_ten_languages(self):
        data = dictionary()
        self.assertEqual(set(data["langs"]), {"fr","wo","zh","en","es","pt","it","de","nl","ar"})
        rows = data["rows"]
        mapping = {r[0]: r for r in rows}
        self.assertEqual(len(mapping), len(rows), "Duplicate translation key")
        for row in rows:
            self.assertEqual(len(row), 10, row[0])
            self.assertTrue(all(x.strip() for x in row), row[0])
        new_text = [
          "👁 VOIR UNE DÉMONSTRATION (SANS COMPTE) →",
          "DÉMONSTRATION · AUCUNE DONNÉE RÉELLE",
          "🍽️ RESTAURANT DÉMO · SALY",
          "Voici un exemple du cockpit du restaurateur. Les horaires, tables et réservations ci-dessous sont entièrement fictifs.",
          "MODE LECTURE SEULE · Aucune réservation, aucun paiement et aucune modification ne sont possibles ici. Le vrai logiciel exige un Magic Link et des droits propriétaire vérifiés.",
          "DEMO · Service midi", "DEMO · Service soir",
          "DEMO · Terrasse", "DEMO · Salle",
          "Client démo A · 2 pers.", "Client démo B · 4 pers.",
          "Plat démo A", "Plat démo B",
          "EXEMPLE FICTIF · Aucun compte ni aucune donnée réelle utilisés.",
        ]
        for label in new_text:
            self.assertIn(label, mapping)
            self.assertGreaterEqual(len(set(mapping[label])), 8, label)
        for forbidden_global_key in ['"Terrasse","Terrace"', '"Salle","Dining room"']:
            self.assertNotIn(forbidden_global_key, SCRIPT)

    def test_js_syntax(self):
        result = subprocess.run(["node", "--check", str(ROOT / "resa-resto/world10-pro.js")],
                                text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
