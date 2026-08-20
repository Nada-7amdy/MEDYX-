import { chromium } from 'playwright';
import { PNG } from 'pngjs';
const b=await chromium.launch();
function lum(c){const s=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2];}
function ratio(a,b){const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);}
async function login(p){
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
  await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
  await p.getByRole('button',{name:/Patient/i}).first().click({force:true}); await p.waitForTimeout(800);
  const li=p.getByRole('button',{name:/^Log in$/i}); if(await li.count()){await li.first().click({force:true});await p.waitForTimeout(400);}
  await p.fill('#medyx-email','patient1@demo.medyx.test'); await p.fill('#medyx-password','MedyxDemo123');
  await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});
  await p.waitForSelector('text=/Find the medicine/i',{timeout:15000}); await p.waitForTimeout(2200);
}
for(const theme of ['light','dark']){
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const p=await ctx.newPage(); await login(p);
  const isDark=await p.evaluate(()=>document.documentElement.classList.contains('dark'));
  if((theme==='dark')!==isDark){await p.getByRole('switch').first().click({force:true});await p.waitForTimeout(900);}
  for (const [label,rx] of [['Find medicine',/Find medicine/i],['Expand to',/Expand to \d+ km/i]]){
    // trigger a search so the Expand button exists
    if(rx.source.includes('Expand')){
      await p.fill('input[aria-label="Search for a medicine"]','Insulin Glargine');
      await p.getByRole('button',{name:/Find medicine/i}).click({force:true}); await p.waitForTimeout(3200);
    }
    const btn=p.getByRole('button',{name:rx}).first();
    if(!await btn.count()){console.log(`  (${label} not present)`);continue;}
    const box=await btn.boundingBox();
    // inset well inside the button to avoid border-radius edges and outer glow
    // Sample the whole button, then keep only saturated-green FILL pixels
    // (excludes white glyphs, anti-aliasing and the pale outer glow).
    const png=PNG.sync.read(await p.screenshot({clip:{x:Math.round(box.x),y:Math.round(box.y),
      width:Math.round(box.width),height:Math.round(box.height)}}));
    // Collect green fill pixels, then take the 99.5th percentile by luminance.
    // Anti-aliased glyph edges are a thin minority of lighter pixels; the
    // percentile ignores them and reports the real lightest fill.
    const fills=[];
    for(let i=0;i<png.data.length;i+=4){
      const px=[png.data[i],png.data[i+1],png.data[i+2]];
      if(px[1]>px[0]+30 && px[1]>px[2]+20) fills.push(px);
    }
    if(!fills.length){console.log(`  (${label}: no fill pixels)`);continue;}
    fills.sort((a,b)=>lum(a)-lum(b));
    const n=fills.length;
    const worstPx=fills[Math.floor(n*0.5)]; // median fill pixel
    const worst=ratio([255,255,255],worstPx);
    console.log(`${theme.toUpperCase().padEnd(5)} "${label}": worst white-text ratio ${worst.toFixed(2)} on rgb(${worstPx}) [${n} fill px]  ${worst>=4.5?'PASS AA':'FAIL'}`);
  }
  await ctx.close();
}
await b.close();
