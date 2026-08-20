import { chromium } from 'playwright';

const AXE = `
// Minimal WCAG contrast auditor (no network deps).
function lum(c){const s=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});
  return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2];}
function ratio(a,b){const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);}
function parse(c){const m=c.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
  return m?{rgb:[+m[1],+m[2],+m[3]],a:m[4]===undefined?1:+m[4]}:null;}
function over(fg,bg){ // composite fg alpha onto bg
  return fg.rgb.map((v,i)=>Math.round(v*fg.a+bg[i]*(1-fg.a)));}
function effBg(el){
  let n=el;
  while(n && n!==document.documentElement){
    const c=parse(getComputedStyle(n).backgroundColor);
    if(c && c.a>0.999) return c.rgb;
    if(c && c.a>0) { const p=effBg(n.parentElement||document.body); return over(c,p); }
    n=n.parentElement;
  }
  const b=parse(getComputedStyle(document.body).backgroundColor);
  return b?b.rgb:[255,255,255];
}
window.__audit=()=>{
  const out={contrast:[],names:[],focus:[]};
  const vis=el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);
    return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>0.05;};
  // --- text contrast ---
  for(const el of document.querySelectorAll('body *')){
    if(!vis(el)) continue;
    if(el.closest('[aria-hidden="true"],[aria-hidden=""]')) continue;
    const txt=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('');
    if(!txt) continue;
    const cs=getComputedStyle(el);
    const fg=parse(cs.color); if(!fg) continue;
    if(fg.a===0) continue; // gradient-clipped text: measured separately
    const bg=effBg(el);
    const fgc=fg.a<1?over(fg,bg):fg.rgb;
    const size=parseFloat(cs.fontSize), weight=+cs.fontWeight||400;
    const large=size>=24||(size>=18.66&&weight>=700);
    const need=large?3:4.5;
    const r=ratio(fgc,bg);
    if(r<need) out.contrast.push({txt:txt.slice(0,42),ratio:+r.toFixed(2),need,
      size:+size.toFixed(1),weight,color:cs.color,tag:el.tagName,cls:(el.className+'').slice(0,40)});
  }
  // --- accessible names ---
  const nameOf=el=>{
    const al=el.getAttribute('aria-label'); if(al&&al.trim()) return al.trim();
    const lb=el.getAttribute('aria-labelledby');
    if(lb){const t=lb.split(/\\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ').trim(); if(t) return t;}
    if(el.tagName==='INPUT'){
      const id=el.id; if(id){const l=document.querySelector('label[for="'+CSS.escape(id)+'"]'); if(l&&l.textContent.trim()) return l.textContent.trim();}
      if(el.closest('label')?.textContent.trim()) return el.closest('label').textContent.trim();
      if(el.getAttribute('title')) return el.getAttribute('title');
      if(el.getAttribute('placeholder')) return '(placeholder only) '+el.getAttribute('placeholder');
    }
    const t=(el.textContent||'').trim(); if(t) return t;
    if(el.getAttribute('title')) return el.getAttribute('title');
    return '';
  };
  for(const el of document.querySelectorAll('button,a[href],input,select,textarea,[role="button"],[role="switch"],[role="menuitem"]')){
    if(!vis(el)) continue;
    const n=nameOf(el);
    if(!n||n.startsWith('(placeholder only)')) out.names.push({tag:el.tagName,role:el.getAttribute('role')||'',
      name:n||'(NONE)',cls:(el.className+'').slice(0,46)});
  }
  return out;
};
`;

const b = await chromium.launch();
async function login(p){
  await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
  await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
  await p.getByRole('button',{name:/Patient/i}).first().click({force:true}); await p.waitForTimeout(800);
  const li=p.getByRole('button',{name:/^Log in$/i}); if(await li.count()){await li.first().click({force:true});await p.waitForTimeout(400);}
  await p.fill('#medyx-email','patient1@demo.medyx.test'); await p.fill('#medyx-password','MedyxDemo123');
  await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});
  await p.waitForSelector('text=/Find the medicine/i',{timeout:15000}); await p.waitForTimeout(2200);
}
const report={};
for (const theme of ['light','dark']) {
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const p=await ctx.newPage(); await p.addInitScript(AXE);
  await login(p);
  const isDark=await p.evaluate(()=>document.documentElement.classList.contains('dark'));
  if((theme==='dark')!==isDark){ await p.getByRole('switch').first().click({force:true}); await p.waitForTimeout(900); }
  // run a search so result states are audited too
  await p.fill('input[aria-label="Search for a medicine"]','Insulin Glargine');
  await p.getByRole('button',{name:/Find medicine/i}).click({force:true});
  await p.waitForTimeout(3200);
  // expand a secondary capsule so its content is audited
  await p.locator('[data-capsule] button[aria-expanded]').filter({hasText:'Gemini AI'}).first().click({force:true});
  await p.waitForTimeout(700);
  const r=await p.evaluate(()=>window.__audit());
  report[theme]=r;
  await ctx.close();
}
for(const [theme,r] of Object.entries(report)){
  console.log(`\n########## ${theme.toUpperCase()} ##########`);
  console.log(`CONTRAST FAILURES: ${r.contrast.length}`);
  const seen=new Set();
  r.contrast.forEach(c=>{const k=c.txt+c.ratio; if(seen.has(k))return; seen.add(k);
    console.log(`  ${String(c.ratio).padStart(5)} (need ${c.need})  ${c.size}px/${c.weight}  "${c.txt}"  ${c.color}`);});
  console.log(`MISSING NAMES: ${r.names.length}`);
  r.names.forEach(n=>console.log(`  <${n.tag}> role=${n.role} name=${n.name} .${n.cls}`));
}
await b.close();
