import { chromium } from 'playwright';

// Log out now lives inside the account menu in the merged TopNav.
async function logoutViaMenu(p){
  await p.getByRole('button',{name:/Account menu/i}).first().click({force:true});
  await p.waitForTimeout(400);
  await p.getByRole('menuitem',{name:/Log out/i}).click({force:true});
}
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
p.on('console', m => m.type()==='error' && errs.push(m.text()));

await p.goto('http://localhost:8787', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1200);
console.log('1. splash heading:', await p.locator('h1').first().innerText());
await p.screenshot({ path: '/tmp/a-closed-light.png' });

// theme toggle -> dark
await p.getByRole('switch').click({ force: true });
await p.waitForTimeout(700);
console.log('2. html class after toggle:', await p.locator('html').getAttribute('class'));
await p.screenshot({ path: '/tmp/b-closed-dark.png' });

// persistence across reload
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(900);
console.log('3. theme persisted:', await p.locator('html').getAttribute('class'));

// back to light for the rest
await p.getByRole('switch').click({ force: true });
await p.waitForTimeout(500);

// open capsule
await p.getByRole('button', { name: /Open MEDYX/i }).click({ force: true });
await p.waitForTimeout(1100);
const patient = p.getByRole('button', { name: /^Patient —/ });
const pharmacy = p.getByRole('button', { name: /^Pharmacy —/ });
console.log('4. role halves visible:', await patient.isVisible(), await pharmacy.isVisible());
await p.screenshot({ path: '/tmp/c-roles.png' });

// select patient
await patient.click({ force: true });
await p.waitForTimeout(800);
console.log('5. form appeared, aria-pressed patient:', await patient.getAttribute('aria-pressed'), '| pharmacy:', await pharmacy.getAttribute('aria-pressed'));
await p.screenshot({ path: '/tmp/d-login.png' });

// ERROR path: wrong password, capsule must stay open
await p.locator('#medyx-email').fill('patient1@demo.medyx.test');
await p.locator('#medyx-password').fill('WrongPassword1');
await p.getByRole('button', { name: /^Sign in$/ }).click({ force: true });
await p.waitForTimeout(2200);
const alert = await p.getByRole('alert').innerText().catch(()=>'(none)');
console.log('6. ERROR alert:', alert);
console.log('   capsule still open (form present):', await p.locator('#medyx-email').isVisible());
console.log('   email value preserved:', await p.locator('#medyx-email').inputValue());
await p.screenshot({ path: '/tmp/e-error.png' });

// SUCCESS path
await p.locator('#medyx-password').fill('MedyxDemo123');
await p.getByRole('button', { name: /^Sign in$/ }).click({ force: true });
await p.waitForTimeout(1000);
console.log('7. authenticating text:', await p.locator('text=/Verifying/').count() > 0);
await p.waitForTimeout(3500);
const welcome = await p.locator('h1').first().innerText().catch(()=>'-');
console.log('8. after success:', welcome);
console.log('   session probe:', (await p.request.get('http://localhost:8787/auth/protected/patient')).status()===200);
await p.screenshot({ path: '/tmp/f-authed.png' });

// session persistence
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
console.log('9. session persisted after reload:', await p.locator('h1').first().innerText());

// logout
await logoutViaMenu(p);
await p.waitForTimeout(1500);
console.log('10. after logout, back to splash:', (await p.locator('h1').first().innerText()).includes('Find the medicine'));

console.log('ERRORS:', errs.length ? errs : 'none');
await b.close();
