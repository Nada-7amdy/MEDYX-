import { chromium } from 'playwright';
const b = await chromium.launch();
const C = o => o.click({ force:true });
const stamp = Date.now();

// ---- PATIENT SIGNUP ----
{
  const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
  await C(p.getByRole('button',{name:/Open MEDYX/i})); await p.waitForTimeout(1000);
  await C(p.getByRole('button',{name:/^Patient —/})); await p.waitForTimeout(800);
  await C(p.getByRole('button',{name:/New patient\? Create an account/})); await p.waitForTimeout(700);
  await p.locator('#medyx-fullName').fill('Sandbox Patient');
  await p.locator('#medyx-email').fill(`sbpatient${stamp}@example.com`);
  await p.locator('#medyx-phone').fill('+20 100 555 0101');
  await p.locator('#medyx-password').fill('SandboxPass1');
  await p.locator('#medyx-confirmPassword').fill('SandboxPass1');
  await C(p.getByRole('button',{name:/^Create account$/})); await p.waitForTimeout(4500);
  console.log('PATIENT SIGNUP ->', await p.locator('h1').first().innerText());
  await p.close();
}

// ---- PHARMACY SIGNUP ----
{
  const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
  await C(p.getByRole('button',{name:/Open MEDYX/i})); await p.waitForTimeout(1000);
  await C(p.getByRole('button',{name:/^Pharmacy —/})); await p.waitForTimeout(800);
  await C(p.getByRole('button',{name:/New pharmacy\? Create an account/})); await p.waitForTimeout(700);
  await p.locator('#medyx-pharmacyName').fill('Sandbox Test Pharmacy');
  await p.locator('#medyx-fullName').fill('Sandbox Owner');
  await p.locator('#medyx-email').fill(`sbpharm${stamp}@example.com`);
  await p.locator('#medyx-phone').fill('+20 100 555 0202');
  await p.locator('#medyx-password').fill('SandboxPass1');
  await p.locator('#medyx-confirmPassword').fill('SandboxPass1');
  await p.locator('#medyx-address').fill('9 Sandbox Street, Cairo');
  await p.screenshot({path:'/tmp/g-signup-pharmacy.png'});
  await C(p.getByRole('button',{name:/^Create account$/})); await p.waitForTimeout(4500);
  console.log('PHARMACY SIGNUP ->', await p.locator('h1').first().innerText());
  const me = await (await p.request.get('http://localhost:8787/auth/me')).json();
  console.log('  pharmacy linked via /auth/me:', me.user?.pharmacy?.name === 'Sandbox Test Pharmacy');
  console.log('  verification:', me.user?.pharmacy?.verified ? 'VERIFIED' : 'Pending review');
  await p.screenshot({path:'/tmp/h-pharmacy-authed.png'});
  await p.close();
}

// ---- DUPLICATE EMAIL (inline field error) ----
{
  const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
  await C(p.getByRole('button',{name:/Open MEDYX/i})); await p.waitForTimeout(1000);
  await C(p.getByRole('button',{name:/^Patient —/})); await p.waitForTimeout(800);
  await C(p.getByRole('button',{name:/New patient\? Create an account/})); await p.waitForTimeout(700);
  await p.locator('#medyx-fullName').fill('Dup Test');
  await p.locator('#medyx-email').fill('patient1@demo.medyx.test');
  await p.locator('#medyx-phone').fill('+20 100 555 0303');
  await p.locator('#medyx-password').fill('SandboxPass1');
  await p.locator('#medyx-confirmPassword').fill('SandboxPass1');
  await C(p.getByRole('button',{name:/^Create account$/})); await p.waitForTimeout(3000);
  console.log('DUPLICATE ->', await p.getByRole('alert').innerText().catch(()=>'(none)'));
  console.log('  inline field error:', await p.locator('#medyx-email-error').innerText().catch(()=>'(none)'));
  console.log('  aria-invalid:', await p.locator('#medyx-email').getAttribute('aria-invalid'));
  await p.screenshot({path:'/tmp/i-duplicate.png'});
  await p.close();
}

// ---- MOBILE ----
{
  const p = await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1500);
  const ov = () => p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
  console.log('MOBILE overflow closed:', await ov());
  await p.screenshot({path:'/tmp/j-mobile-closed.png'});
  await C(p.getByRole('button',{name:/Open MEDYX/i})); await p.waitForTimeout(1200);
  console.log('  overflow roles:', await ov());
  await p.screenshot({path:'/tmp/k-mobile-roles.png'});
  await C(p.getByRole('button',{name:/^Pharmacy —/})); await p.waitForTimeout(900);
  await C(p.getByRole('button',{name:/New pharmacy\? Create an account/})); await p.waitForTimeout(900);
  console.log('  overflow signup form:', await ov());
  await p.screenshot({path:'/tmp/l-mobile-form.png', fullPage:true});
  await p.close();
}

// ---- REDUCED MOTION ----
{
  const p = await (await b.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'})).newPage();
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1200);
  await C(p.getByRole('button',{name:/Open MEDYX/i})); await p.waitForTimeout(400);
  console.log('REDUCED MOTION roles appear fast:', await p.getByRole('button',{name:/^Patient —/}).isVisible());
  await p.close();
}
await b.close();
