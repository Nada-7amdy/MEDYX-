import { chromium } from 'playwright';

// Log out now lives inside the account menu in the merged TopNav.
async function logoutViaMenu(p){
  await p.getByRole('button',{name:/Account menu/i}).first().click({force:true});
  await p.waitForTimeout(400);
  await p.getByRole('menuitem',{name:/Log out/i}).click({force:true});
}
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1280,height:900}, deviceScaleFactor:2 });
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const C = o => o.click({ force:true });

await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1200);
await p.screenshot({path:'/tmp/a-closed-light.png'});

// dark screenshot
await C(p.getByRole('switch')); await p.waitForTimeout(800);
await p.screenshot({path:'/tmp/b-closed-dark.png'});
await C(p.getByRole('switch')); await p.waitForTimeout(600);

// open -> roles
await C(p.getByRole('button',{name:/Open MEDYX/i})); await p.waitForTimeout(1200);
const patient=p.getByRole('button',{name:/^Patient —/}), pharmacy=p.getByRole('button',{name:/^Pharmacy —/});
console.log('roles:',await patient.isVisible(),await pharmacy.isVisible());
await p.screenshot({path:'/tmp/c-roles.png'});

// select patient -> selected/dimmed
await C(patient); await p.waitForTimeout(900);
console.log('aria-pressed patient/pharmacy:',await patient.getAttribute('aria-pressed'),await pharmacy.getAttribute('aria-pressed'));
await p.screenshot({path:'/tmp/d-login.png'});

// ERROR
await p.locator('#medyx-email').fill('patient1@demo.medyx.test');
await p.locator('#medyx-password').fill('WrongPassword1');
await C(p.getByRole('button',{name:/^Sign in$/})); await p.waitForTimeout(2500);
console.log('ERROR alert:',await p.getByRole('alert').innerText().catch(()=>'(none)'));
console.log('  form still open:',await p.locator('#medyx-email').isVisible(),'| email kept:',await p.locator('#medyx-email').inputValue());
await p.screenshot({path:'/tmp/e-error.png'});

// SUCCESS
await p.locator('#medyx-password').fill('MedyxDemo123');
await C(p.getByRole('button',{name:/^Sign in$/}));
await p.waitForTimeout(700);
console.log('AUTHENTICATING shown:', await p.locator('text=/Verifying/').count()>0);
await p.waitForTimeout(4000);
console.log('landed:',await p.locator('h1').first().innerText().catch(()=>'-'));
console.log('  protected probe:',(await p.request.get('http://localhost:8787/auth/protected/patient')).status()===200);
await p.screenshot({path:'/tmp/f-authed.png'});

// session persistence
await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(1600);
console.log('session persists:',/Find the medicine/.test(await p.locator('h1').first().innerText()));

// logout
await logoutViaMenu(p); await p.waitForTimeout(1600);
console.log('logout -> splash:',(await p.locator('h1').first().innerText()).includes('Find the medicine'));
console.log('ERRORS:',errs.length?errs:'none');
await b.close();
