import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('http://localhost:8787', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const btn = p.getByRole('button', { name: /Open MEDYX/i });
// force:true skips the stability wait -> proves a real user click lands
await btn.click({ force: true });
await p.waitForTimeout(1200);
console.log('roles visible after forced click:',
  await p.getByRole('button', { name: /^Patient —/ }).isVisible(),
  await p.getByRole('button', { name: /^Pharmacy —/ }).isVisible());
// keyboard path
await p.reload({ waitUntil:'networkidle' }); await p.waitForTimeout(1000);
await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
const focused = await p.evaluate(()=>document.activeElement?.getAttribute('aria-label')||document.activeElement?.tagName);
console.log('focus after 2 tabs:', focused);
await p.keyboard.press('Enter');
await p.waitForTimeout(1200);
console.log('keyboard opened capsule:', await p.getByRole('button', { name: /^Patient —/ }).isVisible());
await b.close();
