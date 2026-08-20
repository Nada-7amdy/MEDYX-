import { chromium } from 'playwright';
const b = await chromium.launch();
const C = o => o.click({force:true});
const p = await (await b.newContext({viewport:{width:1280,height:900},deviceScaleFactor:2})).newPage();
await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
await C(p.getByRole('button',{name:/Open MEDYX/i})); await p.waitForTimeout(1300);
await p.screenshot({path:'/tmp/m-roles-v2.png'});
await C(p.getByRole('button',{name:/^Patient —/})); await p.waitForTimeout(1000);
await p.screenshot({path:'/tmp/n-login-v2.png'});
// signup (taller form)
await C(p.getByRole('button',{name:/New patient\? Create an account/})); await p.waitForTimeout(900);
await p.screenshot({path:'/tmp/o-signup-v2.png'});
await b.close();
