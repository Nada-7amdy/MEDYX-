import { chromium } from 'playwright';
const b = await chromium.launch();
const T=(l,v)=>console.log(`  ${v?'PASS':'FAIL'}  ${l}`);
async function login(p, email='patient1@demo.medyx.test'){
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
  await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
  const role = email.startsWith('pharmacy') ? /Pharmacy/i : /Patient/i;
  await p.getByRole('button',{name:role}).first().click({force:true}); await p.waitForTimeout(800);
  const li=p.getByRole('button',{name:/^Log in$/i}); if(await li.count()){await li.first().click({force:true});await p.waitForTimeout(400);}
  await p.fill('#medyx-email',email); await p.fill('#medyx-password','MedyxDemo123');
  await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});
  await p.waitForSelector('text=/Find the medicine/i',{timeout:15000}); await p.waitForTimeout(1600);
}

console.log('=== MOBILE 390x844 ===');
{
  const ctx = await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const p = await ctx.newPage(); await login(p);
  const ov = await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
  T('no horizontal overflow (home)', !ov);
  T('search field full width', await p.evaluate(()=>{
    const i=document.querySelector('input[aria-label="Search for a medicine"]');
    return i.getBoundingClientRect().width > window.innerWidth*0.6;}));
  await p.screenshot({path:'/tmp/P6-mobile-home.png'});
  // TAP to search
  await p.fill('input[aria-label="Search for a medicine"]','Ventolin');
  await p.getByRole('button',{name:/Find medicine/i}).tap();
  await p.waitForTimeout(3200);
  const ov2 = await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
  T('no overflow (results)', !ov2);
  T('results rendered on mobile', /Ventolin/.test(await p.textContent('body')));
  await p.evaluate(()=>{const e=document.querySelector('#rescue-search'); e&&window.scrollTo(0,e.getBoundingClientRect().top+window.scrollY-60);});
  await p.waitForTimeout(700);
  await p.screenshot({path:'/tmp/P7-mobile-results.png'});
  // account menu via tap
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(400);
  await p.getByRole('button',{name:/Demo|Account/i}).first().tap(); await p.waitForTimeout(500);
  T('account menu opens by tap', (await p.getByRole('menuitem',{name:/Log out/i}).count())>0);
  await p.screenshot({path:'/tmp/P8-mobile-menu.png'});
  await ctx.close();
}

console.log('=== KEYBOARD / A11Y ===');
{
  const ctx = await b.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage(); await login(p);
  const order=[];
  for(let i=0;i<9;i++){ await p.keyboard.press('Tab');
    order.push(await p.evaluate(()=>{const a=document.activeElement;
      return (a.getAttribute('aria-label')||a.textContent||a.tagName).trim().slice(0,38);}));}
  console.log('  tab order:'); order.forEach(o=>console.log('    -',o));
  // reach search field by keyboard and submit
  await p.focus('input[aria-label="Search for a medicine"]');
  await p.keyboard.type('Metformin'); await p.keyboard.press('Enter');
  await p.waitForTimeout(3000);
  T('keyboard-only search works', /Metformin/.test(await p.textContent('body')));
  // capsule expand via keyboard
  const gem = p.locator('[data-capsule] button[aria-expanded]').filter({hasText:'Gemini AI'}).first();
  await gem.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  T('secondary capsule expands via Enter', await gem.getAttribute('aria-expanded')==='true');
  T('expanded panel content revealed', (await p.locator('text=/Brand, generic and local-name matching/i').count())>0);
  await p.keyboard.press('Enter'); await p.waitForTimeout(600);
  T('collapses again via Enter', await gem.getAttribute('aria-expanded')==='false');
  T('aria-expanded present on capsules', (await p.locator('[aria-expanded]').count())>0);
  await ctx.close();
}

console.log('=== REDUCED MOTION ===');
{
  const ctx = await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const p = await ctx.newPage();
  const t0=Date.now(); await login(p);
  console.log('  login->home ms:', Date.now()-t0);
  T('home reachable under reduced motion', (await p.locator('text=/Find the medicine/i').count())>0);
  await ctx.close();
}

console.log('=== PHARMACY LOGIN -> HOME ===');
{
  const ctx = await b.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage(); await login(p,'pharmacy1@demo.medyx.test');
  T('pharmacy lands on Home', (await p.locator('text=/Find the medicine/i').count())>0);
  await p.getByRole('button',{name:/Demo|Account/i}).first().click({force:true}); await p.waitForTimeout(500);
  const menu = await p.textContent('[role="menu"]');
  T('role badge = pharmacy', /pharmacy/i.test(menu));
  console.log('  menu:', menu.replace(/\s+/g,' ').trim().slice(0,80));
  await ctx.close();
}
await b.close();
