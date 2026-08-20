import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:8787',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1400);
await p.getByRole('button',{name:/Open MEDYX/i}).click({force:true}); await p.waitForTimeout(900);
await p.getByRole('button',{name:/Patient/i}).first().click({force:true}); await p.waitForTimeout(800);
const li=p.getByRole('button',{name:/^Log in$/i}); if(await li.count()){await li.first().click({force:true});await p.waitForTimeout(400);}
await p.fill('#medyx-email','patient1@demo.medyx.test'); await p.fill('#medyx-password','MedyxDemo123');
await p.getByRole('button',{name:/Log in|Sign in|Continue/i}).last().click({force:true});
await p.waitForSelector('text=/Find the medicine/i',{timeout:15000}); await p.waitForTimeout(2500);
await p.screenshot({path:'/tmp/F1-light.png'});
await p.fill('input[aria-label="Search for a medicine"]','Insulin Glargine');
await p.getByRole('button',{name:/Find medicine/i}).click({force:true}); await p.waitForTimeout(3200);
await p.evaluate(()=>{const e=document.querySelector('#rescue-search'); e&&window.scrollTo(0,e.getBoundingClientRect().top+window.scrollY-70);});
await p.waitForTimeout(800); await p.screenshot({path:'/tmp/F2-results-light.png'});
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(300);
await p.getByRole('switch').first().click({force:true}); await p.waitForTimeout(1200);
await p.screenshot({path:'/tmp/F3-dark.png'});
await b.close();
