import { chromium } from 'playwright';

// Log out now lives inside the account menu in the merged TopNav.
async function logoutViaMenu(p){
  await p.getByRole('button',{name:/Account menu/i}).first().click({force:true});
  await p.waitForTimeout(400);
  await p.getByRole('menuitem',{name:/Log out/i}).click({force:true});
}
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
const errs=[]; p.on('console',m=>m.type()==='error'&&errs.push(m.text())); p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);

// --- PHARMACY LOGIN (browser) ---
await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
await p.getByRole('button',{name:/Pharmacy/i}).first().click({force:true}); await p.waitForTimeout(800);
const li = p.getByRole('button',{name:/^Log in$/i});
if (await li.count()) { await li.first().click({force:true}); await p.waitForTimeout(500); }
await p.fill('#medyx-email','pharmacy1@demo.medyx.test');
await p.fill('#medyx-password','MedyxDemo123');
await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});
await p.waitForTimeout(3200);
const body = await p.textContent('body');
console.log('PHARMACY LOGIN ->', /Welcome/.test(body) ? body.match(/Welcome[^\n]{0,40}/)[0] : 'FAILED');
console.log('  role badge pharmacy:', /pharmacy/i.test(body));
console.log('  RBAC probe:', (await p.request.get('http://localhost:8787/auth/protected/pharmacy')).status());
await p.screenshot({path:'/tmp/t-pharm-login.png'});

// --- LOGOUT, then FOCUS RINGS + KEYBOARD TRAVERSAL ---
await logoutViaMenu(p);
await p.waitForTimeout(2200);
await p.keyboard.press('Tab');
const ring = async () => p.evaluate(()=>{const a=document.activeElement;const cs=getComputedStyle(a);
  return {tag:a.tagName,label:(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,34),
  outline:cs.outlineWidth+' '+cs.outlineStyle, shadow:cs.boxShadow.slice(0,40)};});
const seen=[];
for(let i=0;i<7;i++){ seen.push(await ring()); await p.keyboard.press('Tab'); }
console.log('TAB ORDER (pre-open):'); seen.forEach(s=>console.log('  ',s.tag,'|',s.label,'| outline:',s.outline));

// open capsule with keyboard only
await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
let lbl = await p.evaluate(()=>document.activeElement.getAttribute('aria-label')||document.activeElement.textContent);
if(!/Open MEDYX/i.test(lbl||'')){ await p.keyboard.press('Tab'); }
await p.keyboard.press('Enter'); await p.waitForTimeout(1000);
await p.keyboard.press('Tab');
const afterOpen = await ring();
console.log('KEYBOARD OPEN -> first focus:', afterOpen.tag, '|', afterOpen.label, '| outline:', afterOpen.outline);
await p.screenshot({path:'/tmp/u-focus-ring.png'});
console.log('console errors:', errs.length ? errs : 'none');
await b.close();
