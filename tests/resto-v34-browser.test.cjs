'use strict';
/* Browser-only synthetic smoke test for V34. NO live restaurant data, never published.
 * Tests real HTML/JS in local headless Chromium and intercepts ONLY the catalog JS.
 * No API, checkout, booking RPC or production services contacted.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');

const root=path.resolve(__dirname,'../resa-resto');
const allowed=new Set(['a-emporter.html','takeaway-core.js','takeaway-page.js','takeaway-catalog.js']);
function serverStart(){
  return new Promise((resolve,reject)=>{
    const server=http.createServer((req,res)=>{
      const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'');
      if(!allowed.has(name)){res.writeHead(404);res.end('not found');return;}
      const file=path.join(root,name);
      res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript; charset=utf-8':'text/html; charset=utf-8');
      fs.createReadStream(file).on('error',()=>{res.writeHead(404);res.end()}).pipe(res);
    });
    server.once('error',reject);
    server.listen(0,'127.0.0.1',()=>resolve({server,url:'http://127.0.0.1:'+server.address().port}));
  });
}
const fixture={
  'fictional-pilot':{
    restaurantSlug:'fictional-pilot',restaurantName:'Restaurant fictif CI',
    enabled:true,ownerApproved:true,currency:'XOF',timezone:'Africa/Dakar',
    whatsapp:'+221770000000',phone:'+221770000000',preparationMinutes:30,
    pickupWindows:[{weekdays:[1,2,3,4,5,6,7],from:'12:00',to:'14:00'}],
    items:[
      {id:'plat-test',name:'Plat fictif (test)',priceMinor:3500,available:true},
      {id:'jus-test',name:'Jus fictif (test)',priceMinor:1000,available:true},
      {id:'plat-epuise',name:'Plat indisponible (test)',priceMinor:1000,available:false}
    ]
  }
};
const mockScript='window.DIGIY_TAKEAWAY_CATALOG=Object.freeze('+JSON.stringify(fixture)+');';
function freezeClock(page){
  return page.addInitScript(()=>{
    const RealDate=Date;
    class FakeDate extends RealDate {
      constructor(...args){super(...(args.length?args:['2026-10-09T12:00:00.000Z']));}
      static now(){return RealDate.parse('2026-10-09T12:00:00.000Z')}
    }
    window.Date=FakeDate;
  });
}
test('RESTO V34 real browser: locked until verified menu; synthetic-only happy path',async t=>{
  const {server,url}=await serverStart();
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const browser=await chromium.launch({headless:true,...(process.env.RESTO_CHROME_PATH?{executablePath:process.env.RESTO_CHROME_PATH}:{} )});
  t.after(()=>browser.close());

  await t.test('unconfigured page stays off with no menu or contact action',async()=>{
    const page=await browser.newPage();
    await page.goto(url+'/a-emporter.html?site=fictional-pilot');
    assert.equal(await page.locator('#unavailable').isVisible(),true);
    assert.equal(await page.locator('#ordering').isVisible(),false);
    assert.match(await page.locator('#unavailableTitle').innerText(),/non disponible/);
    assert.equal(await page.locator('#whatsapp').isVisible(),false);
    assert.equal(await page.locator('#menu .dish').count(),0);
    await page.close();
  });

  await t.test('synthetic approved menu displays quantities, correct total, valid pickup and direct request',async()=>{
    const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
    const page=await context.newPage();
    const external=[];
    page.on('request',request=>{
      if(!request.url().startsWith(url+'/'))external.push(request.url());
    });
    await freezeClock(page);
    await page.route('**/takeaway-catalog.js',route=>route.fulfill({
      status:200,contentType:'application/javascript',body:mockScript
    }));
    await page.goto(url+'/a-emporter.html?site=fictional-pilot&lang=fr');
    assert.equal(await page.locator('#unavailable').isVisible(),false);
    assert.equal(await page.locator('#ordering').isVisible(),true);
    assert.equal(await page.locator('#restaurantName').innerText(),'Restaurant fictif CI');
    assert.equal(await page.locator('#menu .dish').count(),3);
    assert.equal(await page.locator('#menu .dish').nth(2).locator('button').nth(1).isDisabled(),true);
    assert.equal(await page.locator('#pickupDate').inputValue(),'2026-10-09');
    assert.equal(await page.locator('#pickupTime option[value="12:30"]').count(),0);
    assert.equal(await page.locator('#pickupTime option[value="13:00"]').count(),1);
    await page.locator('#menu .dish').nth(0).locator('button').nth(1).click();
    await page.locator('#menu .dish').nth(0).locator('button').nth(1).click();
    await page.locator('#menu .dish').nth(1).locator('button').nth(1).click();
    assert.match(await page.locator('#total').innerText(),/8[\s\u00a0\u202f]?000/);
    await page.locator('#pickupTime').selectOption('13:00');
    assert.equal(await page.locator('#whatsapp').isVisible(),true);
    const whatsapp=await page.locator('#whatsapp').getAttribute('href');
    assert.ok(whatsapp.startsWith('https://wa.me/221770000000?text='));
    const message=new URL(whatsapp).searchParams.get('text');
    assert.match(message,/non confirmée/);
    assert.match(message,/2 × Plat fictif/);
    assert.match(message,/1 × Jus fictif/);
    assert.match(message,/2026-10-09 13:00/);
    assert.match(message,/Paiement direct au restaurant/);
    assert.equal(await page.locator('#phone').getAttribute('href'),'tel:+221770000000');

    await page.locator('#copyRequest').click();
    assert.match(await page.locator('#status').innerText(),/Demande copiée/);
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),message);
    assert.deepEqual(external,[],'No backend or external request was made while composing the order');

    await page.locator('#pickupDate').fill('2026-10-08');
    await page.locator('#pickupDate').dispatchEvent('change');
    assert.equal(await page.locator('#whatsapp').isVisible(),false,'Past-day request must be hidden');
    assert.equal(await page.locator('#pickupTime').isDisabled(),true);
    await context.close();
  });

  await t.test('hostile dish label rendered as text, not executable HTML',async()=>{
    const page=await browser.newPage();
    await freezeClock(page);
    const hostile=JSON.parse(JSON.stringify(fixture));
    hostile['fictional-pilot'].items[0].name='<img src=x onerror="window.__xss=1">';
    await page.route('**/takeaway-catalog.js',route=>route.fulfill({
      status:200,contentType:'application/javascript',
      body:'window.DIGIY_TAKEAWAY_CATALOG=Object.freeze('+JSON.stringify(hostile)+');'
    }));
    await page.goto(url+'/a-emporter.html?site=fictional-pilot');
    assert.equal(await page.locator('#menu img').count(),0);
    assert.match(await page.locator('#menu .dish').first().innerText(),/<img src=x onerror/);
    assert.equal(await page.evaluate(()=>window.__xss===1),false);
    await page.close();
  });
});
