#!/usr/bin/env node
'use strict';
/*
 * RESTO V34 — LOCAL OWNER REVIEW ONLY, not an ordering, payment or booking server.
 *
 * This tool reads a private candidate menu, validates its STRUCTURE, and serves
 * a passive, escaped HTML review on 127.0.0.1 with no scripts and no outbound links.
 * Preview-only flags added in memory are NOT commercial approval.
 * Never log or commit the menu, professional phone, consent evidence or client info.
 */
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {validate,money}=require('../resa-resto/takeaway-core.js');
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const h=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const weekdaysFR=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
function parse(args){
  const out=Object.create(null);
  for(let i=0;i<args.length;i+=2){
    const key=args[i],value=args[i+1];
    if(!['--draft','--site'].includes(key)||typeof value!=='string'||!value||out[key])
      throw Error('Usage: node scripts/resto-v34-pilot-review.cjs --draft PRIVATE_MENU.json --site SLUG');
    out[key]=value;
  }
  if(!out['--draft']||!out['--site']||!slugPattern.test(out['--site']))
    throw Error('Need --draft private menu and --site verified slug');
  return out;
}
function readPrivateDraft(file){
  const filepath=path.resolve(file);
  const stat=fs.statSync(filepath);
  if(!stat.isFile()||stat.size>262144)throw Error('Private review file must be a small JSON file');
  return JSON.parse(fs.readFileSync(filepath,'utf8'));
}
function buildHtml(draft,site){
  if(!draft||typeof draft!=='object'||Array.isArray(draft))
    throw Error('Missing review draft');
  // A preview verifies the same shape as customer ordering, but not ownership.
  // Forced flags are ephemeral and may never be written to takeaway-catalog.js.
  const check=validate({...draft,enabled:true,ownerApproved:true},site);
  if(!check.ok)throw Error('Draft structure invalid: '+check.reason);
  const data=check.data;
  const dishes=data.items.map(i=>'<li class="dish"><div><b>'+h(i.name)+'</b>'+
    (i.available?'':' <small>— indisponible / non disponible</small>')+'</div><strong>'+
    h(money(i.priceMinor,data.currency,'fr'))+'</strong></li>').join('');
  const windows=data.pickupWindows.map(w=>{
    const days=w.weekdays.map(n=>weekdaysFR[n-1]).join(', ');
    const hm=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
    return '<li>'+h(days)+' : '+h(hm(w.from))+'–'+h(hm(w.to))+'</li>';
  }).join('');
  const title=h(data.restaurantName);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>RELECTURE PRIVÉE — ${title} — DIGIY RESTO</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}
body{margin:0;background:#f7f3e7;color:#123e33;font:16px/1.55 system-ui,-apple-system,sans-serif}
header{background:#073f32;color:white;padding:25px 16px 50px}header>div,main{max-width:720px;margin:auto}
small{font-size:12px}header strong{color:#d9b553}
h1{font-size:clamp(25px,5vw,40px);line-height:1.12;margin:16px 0}
main{margin:-28px auto 40px;padding:22px;position:relative;background:white;border-radius:18px;border:1px solid #dce8df;box-shadow:0 10px 25px #143a2719}
h2{font-size:20px;margin:22px 0 10px}.notice{padding:15px;background:#fff5d9;border-left:4px solid #d9b553;border-radius:8px}
.dish{list-style:none;display:flex;gap:12px;justify-content:space-between;align-items:baseline;padding:12px 0;border-bottom:1px solid #e3eae5}.dish strong{white-space:nowrap}
ul{padding:0}.hours{padding:0 0 0 20px}.hours li{padding:5px 0}
footer{font-size:13px;color:#596c61;padding-top:15px}
@media(max-width:640px){main{margin:-25px 12px 30px;padding:17px}}
</style></head><body>
<header><div><strong>DIGIY RESTO · 0 % COMMISSION</strong>
<h1>Relecture privée de la carte à emporter</h1><p>${title}</p></div></header>
<main>
<p class="notice"><b>PRÉVISUALISATION LOCALE — NON PUBLIÉE.</b> Ce document n'est ni une commande, ni une caisse, ni une validation du restaurateur. Aucun bouton de commande ou de paiement.</p>
<h2>Carte proposée à la validation du restaurateur</h2><ul aria-label="Carte proposée">${dishes}</ul>
<h2>Horaires de retrait proposés</h2><ul class="hours">${windows}</ul>
<p>Préparation minimale proposée : <b>${h(data.preparationMinutes)} minutes</b> · Fuseau : <b>${h(data.timezone)}</b>.</p>
<p>Prix et disponibilité à confirmer par l'établissement. Paiement direct, aucune commission DIGIYLYFE.</p>
<footer>Version de relecture privée · Les contacts, preuves d'accord et données des clients ne sont pas affichés · Pas de publication automatique.</footer>
</main></body></html>`;
}
function startServer(args,logger=console){
  const options=parse(args);
  const html=buildHtml(readPrivateDraft(options['--draft']),options['--site']);
  const server=http.createServer((req,res)=>{
    // Local-only, read-only page; never serve files or submit requests.
    const expectedHost='127.0.0.1:'+server.address().port;
    if(req.headers.host!==expectedHost||req.method!=='GET'||req.url!=='/'){
      res.writeHead(404,{'Cache-Control':'no-store'});res.end('Not found');return;
    }
    res.writeHead(200,{
      'Content-Type':'text/html; charset=utf-8',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
      'X-Frame-Options':'DENY',
      'Referrer-Policy':'no-referrer',
      'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'"
    });
    res.end(html);
  });
  server.listen(0,'127.0.0.1',()=>{
    // Never log the name, phone or menu. Print only the local review URL.
    logger.log('RESTO_V34_REVIEW_LOCAL_ONLY http://127.0.0.1:'+server.address().port+'/');
  });
  return server;
}
if(require.main===module){
  try{startServer(process.argv.slice(2));}
  catch(e){process.stderr.write('RESTO_V34_REVIEW_BLOCKED: '+e.message+'\n');process.exitCode=1}
}
module.exports={parse,buildHtml,readPrivateDraft,startServer};
