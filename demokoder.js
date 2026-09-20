'use strict';
const statusEl=document.getElementById('status'),generate=document.getElementById('generate');let latestHash=null;
async function digest(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
(async()=>{try{const user=await KBAuth.getEmployee();if(!user){sessionStorage.setItem('kb_return_to','/demokoder.html');location.replace('/innlogging.html');return;}statusEl.textContent='Hei, '+user.name+'. Du kan lage demokoder her.';generate.hidden=false;}catch(e){statusEl.textContent=e.message;}})();
generate.addEventListener('click',async()=>{generate.disabled=true;try{
 if(!await KBAuth.getEmployee())throw Error('Logg inn på nytt.');
 const code=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
 const hash=await digest(code);
 const {data,error}=await KBDatabase.getClient().from('kb_demo_invites').insert({code_hash:hash}).select('expires_at').single();
 if(error)throw Error('Demokoden kunne ikke lagres. Prøv igjen.');
 latestHash=hash;document.getElementById('demo-link').value=location.origin+'/demo.html#code='+code;
 document.getElementById('expires').textContent='Gyldig til '+new Date(data.expires_at).toLocaleString('nb-NO')+'. Lagre lenken nå; koden vises bare her.';
 document.getElementById('result').hidden=false;document.getElementById('revoke').disabled=false;statusEl.textContent='Demokoden er klar.';
 }catch(e){statusEl.textContent=e.message;}finally{generate.disabled=false;}});
document.getElementById('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.getElementById('demo-link').value);statusEl.textContent='Lenken er kopiert.';}catch{document.getElementById('demo-link').select();statusEl.textContent='Marker og kopier lenken fra feltet.';}});
document.getElementById('revoke').addEventListener('click',async()=>{const {error}=await KBDatabase.getClient().from('kb_demo_invites').update({revoked:true}).eq('code_hash',latestHash);statusEl.textContent=error?'Koden kunne ikke deaktiveres. Prøv igjen.':'Koden er deaktivert.';if(!error)document.getElementById('revoke').disabled=true;});
