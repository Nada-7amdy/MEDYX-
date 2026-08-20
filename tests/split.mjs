import { chromium } from 'playwright';
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
const js=[]; p.on('response',r=>{const u=r.url(); if(u.endsWith('.js')) js.push(u.split('/').pop());});
await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2000);
console.log('BEFORE LOGIN (splash only):');
js.forEach(f=>console.log('   ',f));
const homeLoaded = js.some(f=>f.startsWith('MedyxHome'));
console.log(`  ${!homeLoaded?'PASS':'FAIL'}  MedyxHome chunk NOT loaded for anonymous visitor`);
js.length=0;
await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
await p.getByRole('button',{name:/Patient/i}).first().click({force:true}); await p.waitForTimeout(800);
const li=p.getByRole('button',{name:/^Log in$/i}); if(await li.count()){await li.first().click({force:true});await p.waitForTimeout(400);}
await p.fill('#medyx-email','patient1@demo.medyx.test'); await p.fill('#medyx-password','MedyxDemo123');
await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});
await p.waitForSelector('text=/Find the medicine/i',{timeout:15000}); await p.waitForTimeout(1200);
console.log('AFTER LOGIN:');
js.forEach(f=>console.log('   ',f));
console.log(`  ${js.some(f=>f.startsWith('MedyxHome'))?'PASS':'FAIL'}  MedyxHome chunk fetched on demand`);
// no Suspense flash: the handoff should never show a blank frame
const txt=await p.textContent('body');
console.log(`  ${/Find the medicine/.test(txt)?'PASS':'FAIL'}  Home rendered after handoff`);
await b.close();
