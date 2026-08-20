import { chromium } from 'playwright';

// Log out now lives inside the account menu in the merged TopNav.
async function logoutViaMenu(p){
  await p.getByRole('button',{name:/Account menu/i}).first().click({force:true});
  await p.waitForTimeout(400);
  await p.getByRole('menuitem',{name:/Log out/i}).click({force:true});
}
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1280,height:900} });
const p = await ctx.newPage();
const C = o => o.click({ force:true });
await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1500);
await C(p.getByRole('button',{name:/Open MEDYX/i})); await p.waitForTimeout(1100);
await C(p.getByRole('button',{name:/^Patient —/})); await p.waitForTimeout(900);
await p.locator('#medyx-email').fill('patient1@demo.medyx.test');
await p.locator('#medyx-password').fill('MedyxDemo123');

// catch AUTHENTICATING quickly after click
await C(p.getByRole('button',{name:/^Sign in$/}));
for (const d of [120, 260, 420]) {
  await p.waitForTimeout(d===120?120:140);
  const verifying = await p.locator('text=/Verifying/').count();
  const btn = await p.getByRole('button',{name:/Verifying|Authenticated|Sign in/}).innerText().catch(()=>'-');
  console.log(`  @${d}ms  statusLine=${verifying>0}  button="${btn}"`);
}
await p.waitForTimeout(4000);
console.log('landed:', await p.locator('h1').first().innerText());

// reload with domcontentloaded (networkidle never settles: animations/polling)
await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(2000);
console.log('session persists:', /Find the medicine/.test(await p.locator('h1').first().innerText()));
await logoutViaMenu(p); await p.waitForTimeout(1800);
console.log('logout -> splash:', (await p.locator('h1').first().innerText()).includes('Find the medicine'));
await b.close();
