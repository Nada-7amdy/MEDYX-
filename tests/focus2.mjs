import { chromium } from 'playwright';
import { PNG } from 'pngjs';
const b=await chromium.launch();
async function login(p){
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
  await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
  await p.getByRole('button',{name:/Patient/i}).first().click({force:true}); await p.waitForTimeout(800);
  const li=p.getByRole('button',{name:/^Log in$/i}); if(await li.count()){await li.first().click({force:true});await p.waitForTimeout(400);}
  await p.fill('#medyx-email','patient1@demo.medyx.test'); await p.fill('#medyx-password','MedyxDemo123');
  await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});
  await p.waitForSelector('text=/Find the medicine/i',{timeout:15000}); await p.waitForTimeout(2200);
}
function diff(a,b){const A=PNG.sync.read(a),B=PNG.sync.read(b);let n=0;
  for(let i=0;i<A.data.length;i+=4){if(Math.abs(A.data[i]-B.data[i])>12||Math.abs(A.data[i+1]-B.data[i+1])>12||Math.abs(A.data[i+2]-B.data[i+2])>12)n++;}
  return n;}
for(const theme of ['light','dark']){
  const ctx=await b.newContext({viewport:{width:1440,height:900}}); const p=await ctx.newPage();
  await login(p);
  const isDark=await p.evaluate(()=>document.documentElement.classList.contains('dark'));
  if((theme==='dark')!==isDark){await p.getByRole('switch').first().click({force:true});await p.waitForTimeout(900);}
  console.log(`--- ${theme.toUpperCase()} (real Tab focus) ---`);
  await p.evaluate(()=>{document.activeElement.blur();window.scrollTo(0,0);});
  await p.waitForTimeout(200);
  let prevShot=null, prevName=null, prevBox=null;
  for(let i=0;i<9;i++){
    // capture the region of the element that is ABOUT to lose focus vs gain
    const beforeAll=await p.screenshot();
    await p.keyboard.press('Tab'); await p.waitForTimeout(220);
    const info=await p.evaluate(()=>{const a=document.activeElement;const r=a.getBoundingClientRect();
      return {name:(a.getAttribute('aria-label')||a.textContent||a.tagName).trim().slice(0,26),
              fv:a.matches(':focus-visible'), x:r.x,y:r.y,w:r.width,h:r.height};});
    if(info.w===0){continue;}
    const clip={x:Math.max(0,info.x-10),y:Math.max(0,info.y-10),
                width:Math.min(1440-Math.max(0,info.x-10),info.w+20),height:Math.min(900-Math.max(0,info.y-10),info.h+20)};
    const focused=await p.screenshot({clip});
    // blur to compare
    await p.evaluate(()=>document.activeElement.blur()); await p.waitForTimeout(200);
    const blurred=await p.screenshot({clip});
    const d=diff(blurred,focused);
    console.log(`  ${d>60?'PASS':'FAIL'}  ${info.name.padEnd(28)} :focus-visible=${info.fv}  px=${d}`);
    // restore focus position for next Tab
    await p.evaluate(()=>window.scrollTo(0,0));
    await p.keyboard.press('Tab');
    for(let k=0;k<i;k++) await p.keyboard.press('Tab');
  }
  await ctx.close();
}
await b.close();
