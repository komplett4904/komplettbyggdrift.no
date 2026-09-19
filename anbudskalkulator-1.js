
// KB_PASSORD_LIST: alle gyldige passord. Slett en linje for å fjerne et passord.
// Lagres bare i denne fila - last opp på nytt etter endring.
const KB_PASSORD_LIST=[
  '671342' // Hovedpassord - alle ansatte
];
const KB_SB_URL=window.KBDatabase.url;
const KB_SB_KEY=window.KBDatabase.key;

async function hashPassord(passord){
  const buffer=new TextEncoder().encode(passord);
  const hashBuffer=await crypto.subtle.digest('SHA-256',buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function sjekkPersonligPassord(kode){
  try{
    if(!window.supabase)return null;
    const sbLoc=window.KBDatabase.getClient();
    const hash=await hashPassord(kode);
    const {data,error}=await sbLoc.from('brukere').select('*').eq('passord_hash',hash).maybeSingle();
    if(error||!data)return null;
    sbLoc.from('brukere').update({sist_innlogget:new Date().toISOString()}).eq('navn',data.navn).then(()=>{});
    return data.navn;
  }catch(e){console.error(e);return null;}
}

async function harPersonligPassord(navn){
  try{
    if(!window.supabase)return false;
    const sbLoc=window.KBDatabase.getClient();
    const {data,error}=await sbLoc.from('brukere').select('passord_hash').eq('navn',navn).maybeSingle();
    if(error||!data)return false;
    return !!data.passord_hash;
  }catch(e){return false;}
}

async function settPersonligPassord(navn,kode){
  if(!window.supabase)return false;
  const sbLoc=window.KBDatabase.getClient();
  const hash=await hashPassord(kode);
  const {error}=await sbLoc.from('brukere').upsert({navn,passord_hash:hash,endret_dato:new Date().toISOString()});
  return !error;
}

async function sjekkEngangskode(kode){
  try{
    if(!window.supabase)return false;
    const sb=window.KBDatabase.getClient();
    const {data,error}=await sb.from('engangskoder').select('*').eq('kode',kode).eq('brukt',false).maybeSingle();
    if(error||!data)return false;
    if(data.gyldig_til && new Date(data.gyldig_til)<new Date())return false;
    await sb.from('engangskoder').update({brukt:true,brukt_dato:new Date().toISOString(),brukt_av:'gjest'}).eq('id',data.id);
    return true;
  }catch(e){console.error('Engangskode-sjekk feilet:',e);return false;}
}

async function sjekkPassord(){
  const inp=document.getElementById('passordInput').value.trim();
  // 1. Prøv personlig passord først
  const bruker=await sjekkPersonligPassord(inp);
  if(bruker){
    sessionStorage.setItem('kb_auth','1');
    sessionStorage.setItem('kb_bruker',bruker);
    document.getElementById('passordSperre').style.display='none';
    return;
  }
  // 2. Firmakode
  if(KB_PASSORD_LIST.includes(inp)){
    sessionStorage.setItem('kb_auth','1');
    sessionStorage.setItem('kb_via_firmakode','1');
    document.getElementById('passordSperre').style.display='none';
    setTimeout(()=>{if(typeof visBrukerVelger==='function')visBrukerVelger();},100);
    return;
  }
  // 3. Engangskode
  if(await sjekkEngangskode(inp)){
    sessionStorage.setItem('kb_auth','1');
    sessionStorage.setItem('kb_bruker','Gjest');
    document.getElementById('passordSperre').style.display='none';
    return;
  }
  document.getElementById('passordFeil').style.display='block';
  document.getElementById('passordInput').value='';
}
// Skjul sperren hvis allerede innlogget i denne sesjonen
if(sessionStorage.getItem('kb_auth')==='1'){
  document.addEventListener('DOMContentLoaded',()=>{document.getElementById('passordSperre').style.display='none';});
} else {
  // Fokus på input
  document.addEventListener('DOMContentLoaded',()=>{document.getElementById('passordInput').focus();});
}
