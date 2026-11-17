"""RESTO : la porte propriétaire exige une fiche ciblée et un Magic Link."""
import re
import subprocess
import unittest
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
HTML = (BASE / "resa-resto/acces-proprietaire.html").read_text(encoding="utf-8")


class RestoOwnerFicheOnly(unittest.TestCase):
    def test_no_public_test_site_picker(self):
        self.assertNotIn('class="site"', HTML)
        self.assertNotIn('data-site="test-resa-resto-saly"', HTML)
        self.assertNotIn('data-site="modele-resa-resto-sarlat"', HTML)
        self.assertNotIn("document.querySelectorAll('.site')", HTML)
        self.assertIn('id="chosenRestaurantName"', HTML)
        self.assertIn('id="email"', HTML)
        self.assertIn("Aucun restaurant associé à ce lien", HTML)

    def test_magic_link_proprietary_guard_is_intact(self):
        for token in [
            "const allowed=new Set(",
            "if(!allowed.has(site))site='';",
            "const needsOwnerOnboarding=new Set(['entre2-sarlat']);",
            "const eligible=()=>allowed.has(site)&&!needsOwnerOnboarding.has(site);",
            "$('email').disabled=!ready",
            "$('send').disabled=!ready",
            "if(!eligible())return msg(",
            "shouldCreateUser:false",
            "db.auth.signInWithOtp(",
            "db.auth.verifyOtp(",
            "db.auth.getSession()",
            "function managementUrl(){return './gestion.html?site='+encodeURIComponent(site)}",
            "if(data&&data.session)location.replace(managementUrl())",
            "L’Entre 2 : accès propriétaire en préparation.",
        ]:
            self.assertIn(token, HTML, f"Missing security invariant: {token}")
        self.assertNotIn("location.replace('https://digiylyfe.com/", HTML)

    def test_script_syntax(self):
        scripts = re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>", HTML)
        self.assertTrue(scripts)
        for attrs, script in scripts:
            if not script.strip() or "src=" in attrs:
                continue
            r = subprocess.run(["node", "--check", "-"], input=script,
                               text=True, capture_output=True)
            self.assertEqual(r.returncode, 0, r.stderr)


if __name__ == "__main__":
    unittest.main()
