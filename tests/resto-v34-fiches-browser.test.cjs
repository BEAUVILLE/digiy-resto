'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');

const root=path.resolve(__dirname,'..');
const allowed=new Set(['index.html','fiche-lentre2.html','fiche-le-malraux.html','resa-resto/acces-proprietaire.html']);
function serve(){
  return new Promise((resolve,reject)=>{
    const server=http.createServer((req,res)=>{
      const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\//,'');
      if(req.method!=='GET'||!allowed.has(pathname)){res.writeHead(404);res.end('Not found');return;}
      const file=path.join(root,pathname);
      res.setHeader('Content-Type','text/html; charset=utf-8');
      fs.createReadStream(file).on('error',()=>{res.writeHead(404);res.end('Not found')}).pipe(res);
    });
    server.once('error',reject);
    server.listen(0,'127.0.0.1',()=>resolve({server,url:'http://127.0.0.1:'+server.address().port}));
  });
}
test('RESTO V34: individual owner-enabled fiches with non-transactional Entre 2 pizza example',async t=>{
  const {server,url}=await serve();t.after(()=>new Promise(done=>server.close(done)));
  const browser=await chromium.launch({headless:true,...(process.env.RESTO_CHROME_PATH?{executablePath:process.env.RESTO_CHROME_PATH}:{})});
  t.after(()=>browser.close());

  await t.test('L’Entre 2: seven real-source pizzas, quantities and demo price only',async()=>{
    const page=await browser.newPage();
    const external=[];
    page.on('request',req=>{if(!req.url().startsWith(url+'/'))external.push(req.url())});
    await page.goto(url+'/fiche-lentre2.html');
    assert.match(await page.title(),/L’Entre 2/);
    assert.equal(await page.locator('meta[http-equiv="refresh"]').count(),0);
    assert.equal(await page.locator('#emporter .product').count(),7);
    assert.match(await page.locator('#emporter .notice').innerText(),/DÉMONSTRATION NON ACTIVE/);
    assert.equal(await page.locator('#total').innerText(),'0,00 €');
    assert.match(await page.locator('#emporter .product').first().innerText(),/Margarita/);
    assert.match(await page.locator('#emporter .product').last().innerText(),/La Truffe/);
    await page.locator('#emporter .product').first().locator('button').last().click();
    await page.locator('#emporter .product').nth(4).locator('button').last().click();
    assert.match(await page.locator('#total').innerText(),/26,40/);
    await page.locator('#emporter .product').first().locator('button').first().click();
    assert.match(await page.locator('#total').innerText(),/16,50/);
    const owner=page.locator('#owner a[href*="acces-proprietaire.html"]');
    assert.equal(await owner.count(),1);
    assert.match(await owner.getAttribute('href'),/site=entre2-sarlat/);
    assert.match(await page.locator('#owner .notice').innerText(),/en attente/);
    assert.equal(await page.locator('form').count(),0);
    assert.equal(await page.locator('a[href^="https://wa.me/"]').count(),0);
    assert.deepEqual(external,[],'Demo must never call external services');
    await page.close();
  });

  await t.test('Le Malraux: own fiche and correct owner slug, no fictitious takeaway order',async()=>{
    const page=await browser.newPage();
    await page.goto(url+'/fiche-le-malraux.html');
    assert.equal(await page.locator('meta[http-equiv="refresh"]').count(),0);
    assert.match(await page.title(),/Le Malraux/);
    assert.match(await page.locator('#owner a').getAttribute('href'),/site=le-malraux-sarlat/);
    assert.match(await page.locator('.notice').innerText(),/pas activé/);
    assert.equal(await page.locator('#emporter').count(),0);
    await page.close();
  });

  await t.test('owner entry: Entre 2 is gated; Malraux selectable, unknown slug cannot fall back',async()=>{
    const page=await browser.newPage();
    await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({
      status:200,contentType:'text/javascript',
      body:"window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({}),signInWithOtp:async()=>({error:null}),verifyOtp:async()=>({data:null,error:null})}})};"
    }));
    await page.goto(url+'/resa-resto/acces-proprietaire.html?site=entre2-sarlat');
    assert.equal(await page.locator('#send').isDisabled(),true);
    assert.match(await page.locator('#status').innerText(),/rattachement propriétaire en attente/);
    await page.goto(url+'/resa-resto/acces-proprietaire.html?site=le-malraux-sarlat');
    assert.equal(await page.locator('#send').isDisabled(),false);
    assert.equal(await page.locator('.site.active').getAttribute('data-site'),'le-malraux-sarlat');
    await page.goto(url+'/resa-resto/acces-proprietaire.html?site=non-existent-restaurant');
    assert.equal(await page.locator('#send').isDisabled(),true);
    assert.match(await page.locator('#status').innerText(),/Lien restaurant non reconnu/);
    await page.close();
  });

  await t.test('RESTO directory points to independent fiches without external redirect',async()=>{
    const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
    assert.match(html,/class="visual" href="fiche-le-malraux.html"/);
    assert.match(html,/class="visual" href="fiche-lentre2.html"/);
    assert.equal((html.match(/href="fiche-le-malraux\.html"/g)||[]).length,2);
    assert.equal((html.match(/href="fiche-lentre2\.html"/g)||[]).length,2);
    const owner=fs.readFileSync(path.join(root,'resa-resto/acces-proprietaire.html'),'utf8');
    assert.match(owner,/new Set\(\['test-resa-resto-saly','modele-resa-resto-sarlat','entre2-sarlat','le-malraux-sarlat'\]\)/);
    const menu=fs.readFileSync(path.join(root,'resa-resto/takeaway-catalog.js'),'utf8');
    assert.match(menu,/DIGIY_TAKEAWAY_CATALOG=Object\.freeze\(\{\}\)/);
  });
});
