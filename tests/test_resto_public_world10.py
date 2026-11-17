"""RESTO PUBLIC WORLD10: all public routes, owned restaurant data, and 10 languages."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET = (ROOT / "assets/resto-public-world10.js").read_text(encoding="utf-8")
PAGES = {
    "index.html": (ROOT / "index.html").read_text(encoding="utf-8"),
    "resa-resto/index.html": (ROOT / "resa-resto/index.html").read_text(encoding="utf-8"),
    "menu-qr.html": (ROOT / "menu-qr.html").read_text(encoding="utf-8"),
    "fiche-le-malraux.html": (ROOT / "fiche-le-malraux.html").read_text(encoding="utf-8"),
    "fiche-lentre2.html": (ROOT / "fiche-lentre2.html").read_text(encoding="utf-8"),
}


def dictionary():
    raw = ASSET.split("  const rows = ", 1)[1].split(";\n  const phrases = new Map();", 1)[0]
    return json.loads(raw)


class PublicWorld10(unittest.TestCase):
    def test_five_real_public_routes_load_world10(self):
        for path, html in PAGES.items():
            rel = "../assets/resto-public-world10.js" if path.startswith("resa-resto/") else "./assets/resto-public-world10.js"
            self.assertEqual(html.count(f'<script src="{rel}" defer></script>'), 1, path)
        self.assertIn('data-lang="wo"', PAGES["index.html"])
        self.assertIn('data-lang="zh"', PAGES["index.html"])
        self.assertIn("window.DIGIY_RESTO_PUBLIC_WORLD10.setLang(lang)", PAGES["index.html"])
        self.assertIn("digiy_resto_public_lang", PAGES["index.html"])
        self.assertIn('id="ownerAccess"', PAGES["resa-resto/index.html"])
        self.assertIn('id="refresh"', PAGES["menu-qr.html"])

    def test_ten_languages_complete_without_duplicate(self):
        rows = dictionary()
        self.assertGreaterEqual(len(rows), 160)
        self.assertEqual(len({r[0] for r in rows}), len(rows))
        for row in rows:
            self.assertEqual(len(row), 10, row[0])
            self.assertTrue(all(isinstance(t, str) and t.strip() for t in row), row[0])
        script = ASSET
        self.assertIn('const langs = ["fr","en","es","pt","de","it","nl","ar","wo","zh"]', script)
        mapping = {r[0]: r for r in rows}
        for phrase in [
            "0 % COMMISSION", "Réserver une table.", "CONFIRMER MA RÉSERVATION →",
            "Créneaux disponibles", "Réservation confirmée.",
            "Carte numérique · Contact direct", " · Épuisé / indisponible",
            "· Épuisé / indisponible", "Version publiée le ",
            "← Restaurants DIGIY", "🍽️ TOUS LES RESTAURANTS",
            "🥡 À emporter — renseignements directs", "🍕 À emporter — aperçu L’Entre 2",
            "Pas encore d’évaluation vérifiée.", "Qualité des plats", "Rapport qualité-prix",
        ]:
            self.assertIn(phrase, mapping)
            self.assertNotEqual(mapping[phrase][0], mapping[phrase][9], phrase)

    def test_all_visible_editorial_copy_is_supported(self):
        rows = {r[0] for r in dictionary()}
        root_locale = PAGES["index.html"].split("const T = ", 1)[1].split(";\nfunction setLang", 1)[0]
        root_keys = set(json.loads(root_locale)["fr"].values())
        # These are genuine restaurant identifiers, brands, addresses or localized
        # flag symbols. Business names and real data must NOT be translated.
        real_data = {
            "LE MALRAUX", "L’ENTRE 2", "Le Malraux", "L’Entre 2",
            "QR · LE MALRAUX", "QR · L’ENTRE 2",
            "17 Rue Albéric Cahuet", "21 Rue Albéric Cahuet",
            "24200 Sarlat-la-Canéda",
            "+33 6 42 16 06 57", "+33 6 73 27 44 27",
            "🍽️ DIGIY RESA RESTO", "🍽️ DIGIY RESTO", "← DIGIY RESTO",
            "🌍 DIGIYLYFE", "0 %", "DIGIYLYFE",
        }
        for path, html in PAGES.items():
            plain = re.sub(r"<script\b[^>]*>[\s\S]*?</script>", "", html, flags=re.I)
            plain = re.sub(r"<style\b[^>]*>[\s\S]*?</style>", "", plain, flags=re.I)
            labels = {
                t.strip() for t in
                re.sub(r"<[^>]+>", "|", plain).replace("&amp;", "&").split("|")
                if len(t.strip()) > 3 and re.search("[À-ÿA-Za-z]", t)
            }
            missing = {
                v for v in labels
                if v not in rows and v not in root_keys and v not in real_data
                and not v.startswith("DIGIY ")
                and not v.startswith("📍 Sarlat")
                and not v.startswith(("🇫🇷", "🇬🇧", "🇪🇸", "🇵🇹", "🇩🇪",
                                      "🇮🇹", "🇳🇱", "🇸🇦", "🇸🇳", "🇨🇳"))
            }
            self.assertFalse(missing, f"{path}: {sorted(missing)}")

    def test_booking_and_menu_business_flows_intact(self):
        booking = PAGES["resa-resto/index.html"]
        qr = PAGES["menu-qr.html"]
        self.assertIn("digiy_resa_resto_public_book_v1", booking)
        self.assertIn("digiy_resa_resto_public_availability_v1", booking)
        self.assertIn("digiy_resa_resto_public_zones_v1", booking)
        self.assertIn("digiy_resa_resto_public_settings_v1", booking)
        self.assertIn("digiy_resto_qr_public", qr)
        self.assertIn("core.publishable(", qr)
        self.assertIn("site.owner_id", (ROOT/"resa-resto/ma-carte.html").read_text(encoding="utf-8"))
        self.assertIn('if (location.pathname.endsWith("/menu-qr.html"))', ASSET)
        self.assertIn("return !!el.closest", ASSET)
        self.assertIn("#title, #intro, #sections h2, .dish-name, .desc, .price", ASSET)
        self.assertNotIn("fetch(", ASSET)
        self.assertNotIn(".rpc(", ASSET)
        self.assertNotIn(".update(", ASSET)
        self.assertNotIn(".upsert(", ASSET)
        self.assertNotIn("supabase.createClient", ASSET)
        self.assertNotIn("innerHTML", ASSET)

    def test_js_parses_and_preserves_lookups(self):
        result = subprocess.run(
            ["node", "--check", str(ROOT/"assets/resto-public-world10.js")],
            text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        for path, html in PAGES.items():
            for attrs, script in re.findall(
                r"<script\b([^>]*)>([\s\S]*?)</script>", html
            ):
                if "src=" in attrs or not script.strip() or "application/ld+json" in attrs:
                    continue
                checked = subprocess.run(["node", "--check", "-"], input=script,
                                         text=True, capture_output=True)
                self.assertEqual(checked.returncode, 0, f"{path}: {checked.stderr}")


if __name__ == "__main__":
    unittest.main()
