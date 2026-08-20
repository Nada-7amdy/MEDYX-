import { chromium } from 'playwright';
const b=await chromium.launch();
const T=(l,v)=>console.log(`  ${v?'PASS':'FAIL'}  ${l}`);
async function login(p){
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
  await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
  await p.getByRole('button',{name:/Patient/i}).first().click({force:true}); await p.waitForTimeout(800);
  const li=p.getByRole('button',{name:/^Log in$/i}); if(await li.count()){await li.first().click({force:true});await p.waitForTimeout(400);}
  await p.fill('#medyx-email','patient1@demo.medyx.test'); await p.fill('#medyx-password','MedyxDemo123');
  await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});
  await p.waitForSelector('text=/Find the medicine/i',{timeout:15000}); await p.waitForTimeout(2200);
}
const ctx=await b.newContext({viewport:{width:1440,height:900}}); const p=await ctx.newPage();
await login(p);
console.log('--- account menu keyboard ---');
const acct=p.getByRole('button',{name:/Account menu/i}).first();
T('aria-haspopup', await acct.getAttribute('aria-haspopup')==='menu');
T('aria-expanded=false initially', await acct.getAttribute('aria-expanded')==='false');
await acct.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
T('opens with Enter', await acct.getAttribute('aria-expanded')==='true');
T('menu role present', (await p.locator('[role="menu"]').count())>0);
T('logout is a menuitem', (await p.getByRole('menuitem',{name:/Log out/i}).count())>0);
await p.keyboard.press('Escape'); await p.waitForTimeout(400);
T('closes with Escape', await acct.getAttribute('aria-expanded')==='false');
// keyboard logout
await acct.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
await p.getByRole('menuitem',{name:/Log out/i}).focus(); await p.keyboard.press('Enter');
await p.waitForTimeout(2400);
T('keyboard logout -> splash', (await p.locator('text=/Tap to begin|Open MEDYX/i').count())>0);
await ctx.close();

console.log('--- reduced motion ---');
const rctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const rp=await rctx.newPage();
const t0=Date.now(); await login(rp); const dt=Date.now()-t0;
T('reaches Home', (await rp.locator('text=/Find the medicine/i').count())>0);
const anim=await rp.evaluate(()=>{
  let long=0;
  for(const el of document.querySelectorAll('*')){
    const cs=getComputedStyle(el);
    const d=parseFloat(cs.animationDuration)||0, t=parseFloat(cs.transitionDuration)||0;
    if(d>0.15||t>0.15) long++;
  } return long;});
T('no long animations/transitions under reduce', anim===0);
console.log('    elements with >150ms motion:', anim);
await rp.fill('input[aria-label="Search for a medicine"]','Ventolin');
await rp.getByRole('button',{name:/Find medicine/i}).click({force:true});
await rp.waitForTimeout(3000);
T('search still works under reduce', /Salbutamol|Ventolin/.test(await rp.textContent('body')));
await rctx.close();
await b.close();
