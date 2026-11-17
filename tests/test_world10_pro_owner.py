"""WORLD10 RESTO PRO : vrais écrans propriétaire, zéro réseau, zéro mutation métier."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ACCESS = (ROOT / "resa-resto/acces-proprietaire.html").read_text(encoding="utf-8")
MANAGER = (ROOT / "resa-resto/gestion.html").read_text(encoding="utf-8")
JS_PATH = ROOT / "resa-resto/world10-pro.js"
SCRIPT = JS_PATH.read_text(encoding="utf-8")
LANGS = ["fr", "en", "es", "pt", "de", "it", "nl", "ar", "wo", "zh"]


def translations():
    # Évalue uniquement les constantes de traduction, PAS l'application navigateur.
    js = r"""
const fs = require('node:fs'), vm = require('node:vm');
const source = fs.readFileSync(process.argv[1], 'utf8');
const begin = source.indexOf('  const langs = ');
const end = source.indexOf('  const phrases = new Map();', begin);
if (begin < 0 || end < 0) process.exit(1);
const part = source.slice(begin, end);
const result = vm.runInNewContext('(function(){' + part +
  '\nreturn JSON.stringify({langs,names,rows});})()');
process.stdout.write(result);
"""
    result = subprocess.run(["node", "-e", js, str(JS_PATH)],
                            capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


class RestoProWorld10(unittest.TestCase):
    def test_real_owner_entries_and_languages(self):
        for html in [ACCESS, MANAGER]:
            self.assertIn('<script src="./world10-pro.js" defer></script>', html)
            self.assertIn('<html lang="fr">', html)
        self.assertIn("select", SCRIPT)
        self.assertIn("restoProWorld10", SCRIPT)
        self.assertIn('document.documentElement.lang = lang', SCRIPT)
        self.assertIn('lang === "ar" ? "rtl" : "ltr"', SCRIPT)
        self.assertIn("MutationObserver", SCRIPT)

    def test_dictionary_is_complete_and_distinct(self):
        data = translations()
        self.assertEqual(data["langs"], LANGS)
        self.assertEqual(len(data["names"]), 10)
        self.assertGreaterEqual(len(data["rows"]), 105)
        fr_keys = [row[0] for row in data["rows"]]
        self.assertEqual(len(fr_keys), len(set(fr_keys)), "Clés françaises dupliquées")
        for row in data["rows"]:
            self.assertEqual(len(row), 10, f"Traduction absente pour {row[0]}")
            self.assertTrue(all(isinstance(x, str) and x.strip() for x in row))
        for lang in ["en","es","pt","de","it","nl","ar","wo","zh"]:
            index = LANGS.index(lang)
            translated = sum(row[index] != row[0] for row in data["rows"])
            self.assertGreaterEqual(translated, 85, lang)
        for text in ["MON RESTAURANT", "Lien de restaurant requis",
                     "Aucun restaurant associé à ce lien",
                     "Ouvrez votre espace professionnel avec votre lien sécurisé par e-mail. L’accès dépend de votre restaurant et de vos droits de propriétaire.",
                     "Ce lien ne désigne aucun restaurant. Ouvrez « Accès propriétaire » depuis votre propre fiche DIGIY RESTO. Aucun établissement de test ne sera choisi à votre place.",
                     "Le lien envoyé par e-mail (Magic Link) et le code reçu ouvrent la même gestion sécurisée, après vérification des droits de votre compte. Chaque restaurant conserve ses propres données.",
                     "Code reçu", "Déconnexion", "Enregistrer les horaires",
                     "Aucune réservation à venir.", "⚠️ Ce compte n’est pas autorisé à gérer ce restaurant.",
                     "✅ Réservation mise à jour.", "Oui", "Non", "confirmed", "Arrivé protège la table du no-show. Annulé la libère et retire la contrainte de rotation si elle n’est plus nécessaire."]:
            self.assertIn(text, fr_keys)

    def test_js_and_existing_inline_logic_parse(self):
        result = subprocess.run(["node", "--check", str(JS_PATH)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        for html in [ACCESS, MANAGER]:
            for attrs, script in re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>", html):
                if not script.strip() or "src=" in attrs:
                    continue
                result = subprocess.run(["node", "--check", "-"], input=script,
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)

    def test_business_ids_and_auth_are_untouched(self):
        self.assertIn("shouldCreateUser:false", ACCESS)
        self.assertIn("db.auth.verifyOtp", ACCESS)
        self.assertIn("data.owner_id!==session.user.id", MANAGER)
        self.assertIn("digiy_resa_resto_owner_set_booking_status_v1", MANAGER)
        self.assertIn("digiy_resa_resto_claim_site_by_email_v1", MANAGER)
        self.assertIn('p_status:status', MANAGER)
        self.assertIn('p_booking_id:bid', MANAGER)
        self.assertIn('type="number" min="1" value="20"', MANAGER)
        for forbidden in ["db.from(", "db.rpc(", "signInWithOtp(", "verifyOtp(",
                          ".insert(", ".delete(", ".update(", "fetch(",
                          "innerHTML", 'setAttribute("value"']:
            self.assertNotIn(forbidden, SCRIPT)
        # Les valeurs d'option changent JAMAIS (seul le texte du noeud est traduit).
        self.assertIn('parent.closest("script,style,textarea,code")', SCRIPT)
        self.assertNotIn('textarea,option,code', SCRIPT)
        self.assertIn("originalText", SCRIPT)
        self.assertIn("originalPlaceholder", SCRIPT)

    def test_language_persists_without_changing_site(self):
        self.assertIn('url.searchParams.set("lang", lang)', SCRIPT)
        self.assertIn("sessionStorage.setItem", SCRIPT)
        self.assertIn("localStorage.setItem", SCRIPT)
        self.assertIn('url.searchParams.get("lang")', SCRIPT)
        self.assertNotIn('searchParams.delete("site")', SCRIPT)


if __name__ == "__main__":
    unittest.main()
