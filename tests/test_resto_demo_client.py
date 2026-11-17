"""RESTO client demo: safe booking simulation with no backend, complete WORLD10."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DEMO=(ROOT/"resa-resto/demo-client.html").read_text(encoding="utf-8")
PRO=(ROOT/"resa-resto/demo-pro.html").read_text(encoding="utf-8")
OWNER=(ROOT/"resa-resto/acces-proprietaire.html").read_text(encoding="utf-8")
REAL=(ROOT/"resa-resto/index.html").read_text(encoding="utf-8")
WORLD10=(ROOT/"resa-resto/world10-pro.js").read_text(encoding="utf-8")


def script_block():
    scripts=re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>",DEMO)
    assert len(scripts)==1
    assert not scripts[0][0]
    return scripts[0][1]


def demo_locales():
    script=script_block()
    snippet="""
const vm=require('node:vm');
const fs=require('node:fs');
const html=fs.readFileSync(process.argv[1],'utf8');
const script=html.match(/<script>([\\s\\S]*?)<\\/script>/)[1];
const start=script.indexOf('  const keys=');
const stop=script.indexOf('  const $=', start);
if(start<0 || stop<0) process.exit(3);
const declaration=script.slice(start,stop);
process.stdout.write(vm.runInNewContext('(function(){'+declaration+
  'return JSON.stringify({keys,translations,fields});})()'));
"""
    r=subprocess.run(["node","-e",snippet,str(ROOT/"resa-resto/demo-client.html")],
                     capture_output=True,text=True,check=True)
    return json.loads(r.stdout)


class RestoDemoClient(unittest.TestCase):
    def test_real_booking_logic_is_not_touched(self):
        self.assertIn("digiy_resa_resto_public_book_v1",REAL)
        self.assertIn("digiy_resa_resto_public_availability_v1",REAL)
        self.assertIn("id=\"book\"",REAL)
        self.assertIn("id=\"confirmation\"",DEMO)
        self.assertIn("id=\"confirm\"",DEMO)
        self.assertIn("id=\"slots\"",DEMO)
        self.assertIn('href="./demo-client.html"',PRO)
        self.assertIn('href="./demo-pro.html"',DEMO)
        self.assertIn("👁 VOIR LA DÉMONSTRATION CLIENT →",WORLD10)
        self.assertIn('name="robots" content="noindex,nofollow,noarchive,nosnippet"',DEMO)

    def test_no_network_no_database_no_real_orders(self):
        script=script_block()
        self.assertNotIn("supabase",DEMO.lower())
        self.assertNotIn("fetch(",DEMO)
        self.assertNotIn("XMLHttpRequest",DEMO)
        self.assertNotIn("WebSocket",DEMO)
        self.assertNotIn("sendBeacon",DEMO)
        self.assertNotIn("localStorage",DEMO)
        self.assertNotIn("sessionStorage",DEMO)
        self.assertNotIn("navigator",DEMO)
        self.assertNotIn("digiy_resa_resto_public_book_v1",DEMO)
        self.assertNotIn('type="submit"',DEMO)
        self.assertNotIn("<form",DEMO)
        self.assertIn("lastResult={day,guests,time,zone:",script)
        self.assertIn("panel.replaceChildren()",script)

    def test_ten_complete_languages(self):
        data=demo_locales()
        langs={"fr","wo","zh","en","es","pt","it","de","nl","ar"}
        self.assertEqual(set(data["keys"]),langs)
        self.assertEqual(set(data["translations"]),langs)
        self.assertEqual(len(data["fields"]),22)
        self.assertEqual(len(data["fields"]),len(set(data["fields"])))
        for language,values in data["translations"].items():
            self.assertEqual(len(values),len(data["fields"]),language)
            self.assertTrue(all(isinstance(v,str) and v.strip() for v in values),language)
        self.assertNotEqual(data["translations"]["fr"][2],data["translations"]["zh"][2])
        self.assertNotEqual(data["translations"]["fr"][2],data["translations"]["wo"][2])

    def test_js_syntax_and_essential_guards(self):
        r=subprocess.run(["node","--check","-"],input=script_block(),
                         capture_output=True,text=True)
        self.assertEqual(r.returncode,0,r.stderr)
        self.assertIn("document.documentElement.dir=lang==='ar'?'rtl':'ltr'",DEMO)
        self.assertIn("guests>12",DEMO)
        self.assertIn("!$('name').value.trim()",DEMO)
        self.assertIn("!$('phone').value.trim()",DEMO)


if __name__=="__main__":
    unittest.main()
