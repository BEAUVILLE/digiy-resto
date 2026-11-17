"""RESTO : démo emporter fictive, 10 langues, sans commande ni paiement réel."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TAKEAWAY = (ROOT / "resa-resto/demo-emporter.html").read_text(encoding="utf-8")
CLIENT = (ROOT / "resa-resto/demo-client.html").read_text(encoding="utf-8")
PRO = (ROOT / "resa-resto/demo-pro.html").read_text(encoding="utf-8")
WORLD10 = (ROOT / "resa-resto/world10-pro.js").read_text(encoding="utf-8")
MENU_QR = (ROOT / "resa-resto/ma-menu-qr.html").read_text(encoding="utf-8")


def inline_script():
    scripts = re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>", TAKEAWAY)
    if len(scripts) != 1 or scripts[0][0].strip():
        raise AssertionError("Un seul script local est autorisé")
    return scripts[0][1]


def locales():
    js = r"""
const fs = require('node:fs'), vm = require('node:vm');
const html = fs.readFileSync(process.argv[1], 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const start = script.indexOf('  const languages=');
const end = script.indexOf('  const $=', start);
if (start < 0 || end < 0) process.exit(2);
const declarations = script.slice(start, end);
process.stdout.write(vm.runInNewContext('(function(){'+declarations+
  'return JSON.stringify({languages,keys,translations});})()'));
"""
    r = subprocess.run(["node", "-e", js, str(ROOT / "resa-resto/demo-emporter.html")],
                       capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


class RestoEmporterDemo(unittest.TestCase):
    def test_demo_is_reachable_from_both_sides(self):
        self.assertIn('href="./demo-emporter.html"', CLIENT)
        self.assertIn('id="takeawayLink"', CLIENT)
        self.assertIn('href="./demo-emporter.html"', PRO)
        self.assertIn('href="./demo-client.html"', TAKEAWAY)
        self.assertIn('href="./demo-pro.html"', TAKEAWAY)
        self.assertIn("🥡 VOIR L’EMPORTER (DÉMO) →", WORLD10)

    def test_safe_demo_only_no_real_order(self):
        for banned in [
            "supabase", "fetch(", "XMLHttpRequest", "WebSocket", "sendBeacon",
            "navigator", "localStorage", "sessionStorage",
            "digiy_resa_resto_public_book_v1", "stripe", "checkout", "wave",
            'type="submit"', "<form",
        ]:
            self.assertNotIn(banned.lower(), TAKEAWAY.lower(), banned)
        self.assertIn("SIMULATION", TAKEAWAY)
        self.assertIn("Aucun panier n’est envoyé", TAKEAWAY)
        self.assertIn('name="robots" content="noindex,nofollow,noarchive,nosnippet"', TAKEAWAY)
        self.assertIn("Pas de commande ni de paiement automatique.", MENU_QR)
        self.assertIn("qty={a:0,b:0}", TAKEAWAY)
        self.assertIn("prices={a:4500,b:6000}", TAKEAWAY)
        self.assertIn("Math.min(10,Math.max(0,", TAKEAWAY)
        self.assertIn("panel.replaceChildren()", TAKEAWAY)

    def test_ten_languages_are_complete(self):
        data = locales()
        self.assertEqual(set(data["languages"]),
            {"fr","wo","zh","en","es","pt","it","de","nl","ar"})
        self.assertEqual(set(data["translations"]), set(data["languages"]))
        self.assertEqual(len(data["keys"]), 20)
        self.assertEqual(len(set(data["keys"])), len(data["keys"]))
        for lang, values in data["translations"].items():
            self.assertEqual(len(values), len(data["keys"]), lang)
            self.assertTrue(all(isinstance(v, str) and v.strip() for v in values), lang)
        self.assertNotEqual(data["translations"]["wo"][1], data["translations"]["fr"][1])
        self.assertNotEqual(data["translations"]["zh"][1], data["translations"]["fr"][1])
        self.assertIn("const takeawayCopy=", CLIENT)

    def test_js_syntax_and_RTL(self):
        r = subprocess.run(["node", "--check", "-"], input=inline_script(),
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("document.documentElement.dir=lang==='ar'?'rtl':'ltr'", TAKEAWAY)
        self.assertIn("aria-label", TAKEAWAY)


if __name__ == "__main__":
    unittest.main()
