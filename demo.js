'use strict';
// This page never loads employee tools, their storage, or business tables.
const form=document.getElementById('entry'),demo=document.getElementById('demo'),statusEl=document.getElementById('status');let activeCode='';
async function verify(code){
 if(!/^[a-f0-9]{48}$/.test(code))return false;
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code))),b=>b.toString(16).padStart(2,'0')).join('');
 const response=await fetch(KBDatabase.url+'/rest/v1/kb_demo_invites?select=expires_at&code_hash=eq.'+hash,{headers:{apikey:KBDatabase.key,Authorization:'Bearer '+KBDatabase.key},cache:'no-store'});
 if(!response.ok)throw Error('Kunne ikke kontrollere koden. Prøv igjen når du har nett.');
 const rows=await response.json();return rows.length===1&&new Date(rows[0].expires_at).getTime()>Date.now();
}
async function open(code){try{if(!await verify(code))throw Error('Koden er ugyldig, utløpt eller deaktivert.');activeCode=code;demo.hidden=false;form.hidden=true;statusEl.textContent='Demo åpnet. Alt innhold er eksempler.';}catch(e){activeCode='';demo.hidden=true;form.hidden=false;statusEl.textContent=e.message;}}
form.addEventListener('submit',event=>{event.preventDefault();open(document.getElementById('code').value.trim());});
function calculate(){const hours=Math.max(0,Math.min(10000,Number(document.getElementById('hours').value)||0)),materials=Math.max(0,Math.min(10000000,Number(document.getElementById('materials').value)||0));document.getElementById('estimate').textContent=(hours*750+materials).toLocaleString('nb-NO')+' kr eks. mva.';}
for(const id of ['hours','materials'])document.getElementById(id).addEventListener('input',calculate);calculate();
document.getElementById('exit').addEventListener('click',()=>{activeCode='';location.replace('/demo.html');});
const supplied=new URLSearchParams(location.hash.slice(1)).get('code');if(supplied){history.replaceState(null,'',location.pathname);open(supplied);}
setInterval(()=>{if(activeCode)open(activeCode);},60000);
