'use strict';
/* Local-only preview tests. No real menu, personal details, network service, or approval. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const {parse,buildHtml,startServer}=require('../scripts/resto-v34-pilot-review.cjs');

const site='entre2-sarlat';
const sample=()=>({
  restaurantSlug:site,restaurantName:"Restaurant fictif <img src=x onerror=alert(1)>",
  currency:'EUR',timezone:'Europe/Paris',enabled:false,ownerApproved:false,
  whatsapp:'+33600000000',phone:null,preparationMinutes:25,
  pickupWindows:[{weekdays:[1,2,3,4,5,6],from:'11:30',to:'14:30'}],
  items:[
    {id:'plat-factice',name:'Plat <script>alert(1)</script> fictif',priceMinor:1495,available:true},
    {id:'indisponible-test',name:'Jus fictif',priceMinor:350,available:false}
  ]
});
function request(url,opts={}){
  return new Promise((resolve,reject)=>{
    const req=http.request(url,opts,res=>{
      let data='';res.setEncoding('utf8');
      res.on('data',part=>data+=part);
      res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:data}));
    });
    req.once('error',reject);req.end();
  });
}
test('private preview works even before approval without changing draft approval flags',()=>{
  const raw=sample(),html=buildHtml(raw,site);
  assert.equal(raw.enabled,false);assert.equal(raw.ownerApproved,false);
  assert.match(html,/PRÉVISUALISATION LOCALE/);
  assert.match(html,/11:30–14:30/);
  assert.match(html,/14,95/);
  assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html,/<script|<form|<button|wa\.me|tel:|<a /i);
  assert.doesNotMatch(html,/\+33600000000/);
});
test('preview rejects mismatched restaurant, malformed schedule and missing draft contact',()=>{
  for(const [draft,expected] of [
    [sample(),'le-malraux-sarlat'],
    [{...sample(),pickupWindows:[{weekdays:[1],from:'22:30',to:'01:00'}]},site],
    [{...sample(),whatsapp:null},site],
    [{...sample(),items:[]},site]
  ])assert.throws(()=>buildHtml(draft,expected),/Draft structure invalid/);
});
test('CLI rejects missing or conflicting required inputs',()=>{
  assert.throws(()=>parse([]));
  assert.throws(()=>parse(['--draft','x.json','--site','entre2-sarlat','--site','le-malraux-sarlat']));
  assert.deepEqual(Object.assign({},parse(['--draft','private.json','--site',site])),
    {'--draft':'private.json','--site':site});
});
test('review server listens on loopback only, serves no files, no scripts and no upload',async t=>{
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'resto-v34-review-'));
  const draftPath=path.join(folder,'private-candidate-menu.json');
  fs.writeFileSync(draftPath,JSON.stringify(sample()),{mode:0o600});
  let server;
  t.after(async()=>{
    if(server)await new Promise(resolve=>server.close(resolve));
    fs.rmSync(folder,{recursive:true,force:true});
  });
  let startupMessage='';
  server=startServer(['--draft',draftPath,'--site',site],{log:msg=>{startupMessage=msg}});
  await new Promise(resolve=>{
    if(server.listening)resolve();
    else server.once('listening',resolve);
  });
  const address=server.address();
  assert.equal(address.address,'127.0.0.1');
  const url='http://127.0.0.1:'+address.port+'/';
  assert.equal(startupMessage,'RESTO_V34_REVIEW_LOCAL_ONLY '+url);
  const ok=await request(url);
  assert.equal(ok.status,200);
  assert.match(ok.headers['content-security-policy'],/default-src 'none'/);
  assert.match(ok.headers['content-security-policy'],/connect-src 'none'/);
  assert.equal(ok.headers['cache-control'],'no-store');
  assert.match(ok.body,/Prévisualisation locale/i);
  assert.doesNotMatch(ok.body,/\+33600000000/);
  assert.equal((await request(url+'private-candidate-menu.json')).status,404);
  assert.equal((await request(url,{method:'POST'})).status,404);
  assert.equal((await request(url,{headers:{Host:'evil.example'}})).status,404);
});
