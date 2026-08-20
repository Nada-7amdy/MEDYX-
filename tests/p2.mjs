import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1440,height:900} });
const p = await ctx.newPage();
const errs=[]; p.on('console',m=>m.type()==='error'&&errs.push(m.text())); p.on('pageerror',e=>errs.push('PAGEERROR '+e));
const T=(l,v)=>console.log(`  ${v?'PASS':'FAIL'}  ${l}`);

await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1400);

console.log('--- 1. login as patient ---');
await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
await p.getByRole('button',{name:/Patient/i}).first().click({force:true}); await p.waitForTimeout(800);
const li=p.getByRole('button',{name:/^Log in$/i}); if(await li.count()) { await li.first().click({force:true}); await p.waitForTimeout(400); }
await p.fill('#medyx-email','patient1@demo.medyx.test');
await p.fill('#medyx-password','MedyxDemo123');
await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});

console.log('--- 2. handoff -> MedyxHome ---');
await p.waitForSelector('text=/Find the medicine/i',{timeout:15000});
T('landed on MedyxHome', true);
T('greeting shown', (await p.locator('text=/Welcome back, Demo/i').count())>0);
T('single header (one nav)', (await p.locator('nav[aria-label="Primary"]').count())===1);
T('no duplicate logout bar', (await p.getByRole('button',{name:/^Log out$/}).count())===0);
T('Rescue Search capsule present', (await p.locator('text=Rescue Search').count())>0);
const secondary = await p.locator('[data-capsule]').count();
console.log('  capsules on page:', secondary);
for (const n of ['Gemini AI','Shortage Radar','Rescue Support','Pharmacy Network'])
  T(`secondary: ${n}`, (await p.locator(`text=${n}`).count())>0);
for (const n of ['Stock Pulse','Supply Intelligence'])
  T(`withheld: ${n}`, (await p.locator(`text=${n}`).count())===0);
await p.screenshot({path:'/tmp/P1-home-light.png',fullPage:false});

console.log('--- 3. RESCUE SEARCH interaction ---');
await p.fill('input[aria-label="Search for a medicine"]','Insulin Glargine');
await p.getByRole('button',{name:/Find medicine/i}).click({force:true});
await p.waitForTimeout(600);
T('loading state visible', (await p.locator('text=/Searching|Checking pharmacies/i').count())>0);
await p.waitForTimeout(2600);
const bodyTxt = await p.textContent('body');
T('resolved medicine header', /Insulin Glargine/.test(bodyTxt));
T('ring summary rendered', /checked|stock/i.test(bodyTxt));
T('demo data labelled', /demo|synthetic|simulated/i.test(bodyTxt));
await p.screenshot({path:'/tmp/P2-results.png',fullPage:false});

console.log('--- 4. radius expansion ---');
const exp = p.getByRole('button',{name:/Expand to \d+ km/i});
if (await exp.count()) { await exp.first().click({force:true}); await p.waitForTimeout(2400);
  T('radius expanded', /km ring/i.test(await p.textContent('body')));
  await p.screenshot({path:'/tmp/P3-expanded.png'});
} else console.log('  (found in first ring; no expansion offered)');

console.log('--- 5. DARK MODE ---');
await p.getByRole('switch').first().click({force:true}); await p.waitForTimeout(700);
const isDark = await p.evaluate(()=>document.documentElement.classList.contains('dark'));
T('dark class applied', isDark);
const contrast = await p.evaluate(()=>{
  const h=document.querySelector('h1'); const cs=getComputedStyle(h);
  return {color:cs.color, bg:getComputedStyle(document.body).backgroundColor};
});
console.log('  h1 color:',contrast.color,'| body bg:',contrast.bg);
await p.screenshot({path:'/tmp/P4-home-dark.png',fullPage:false});
// check no white slabs remain
const whiteish = await p.evaluate(()=>{
  let n=0; for(const el of document.querySelectorAll('main *')){
    const bg=getComputedStyle(el).backgroundColor;
    const m=bg.match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
    if(!m) continue; const [r,g,bl]=[+m[1],+m[2],+m[3]]; const a=m[4]===undefined?1:+m[4];
    if(a>0.5 && r>235 && g>235 && bl>235) n++;
  } return n;});
T('no opaque white slabs in dark main', whiteish===0);
if(whiteish) console.log('    white-ish elements:', whiteish);

console.log('--- 6. reload persistence -> straight to Home ---');
await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(2600);
T('returns to Home (no auth capsule)', (await p.locator('text=/Find the medicine/i').count())>0);
T('theme persisted dark', await p.evaluate(()=>document.documentElement.classList.contains('dark')));

console.log('--- 7. logout ---');
await p.getByRole('button',{name:/Demo|Account/i}).first().click({force:true}); await p.waitForTimeout(400);
await p.getByRole('menuitem',{name:/Log out/i}).click({force:true}); await p.waitForTimeout(2200);
T('back to auth splash', (await p.locator('text=/Tap to begin|Open MEDYX/i').count())>0);

console.log('errors:', errs.filter(e=>!/401/.test(e)).length ? errs : 'none (401 = expected anon probe)');
await b.close();
