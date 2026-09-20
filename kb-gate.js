(async function(){
  'use strict';
  const screen = document.createElement('section');
  screen.id='kb-secure-gate';
  screen.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#f1f5f8;display:grid;place-items:center;padding:24px;font-family:system-ui,sans-serif;color:#17324d';
  screen.innerHTML='<div style="background:white;padding:36px;border-radius:16px;max-width:440px;width:100%"><p>KOMPLETT BYGGDRIFT</p><h1>Logg inn</h1><p id="kb-gate-status" role="status">Kontrollerer innlogging …</p><button id="kb-google" hidden style="padding:14px;width:100%;background:#17324d;color:white;border:0;border-radius:8px;font:inherit">Logg på med Google</button><p><a href="/demo.html">Har du en gjestekode? Åpne demo</a></p><a href="/">Til forsiden</a></div>';
  document.body.append(screen);
  const button=screen.querySelector('button'),status=screen.querySelector('[role=status]');
  button.addEventListener('click',async()=>{button.disabled=true;try{await window.KBAuth.signIn();}catch(e){status.textContent=e.message;button.disabled=false;}});
  try {
    const employee=await window.KBAuth.getEmployee();
    if(!employee){status.textContent='Bruk Google-kontoen med firmaadressen din.';button.hidden=false;return;}
    // The legacy flags are not accepted for authentication. Only the verified identity is used below.
    for(const key of ['kb_auth','kb_bruker','kb_via_firmakode'])sessionStorage.removeItem(key);
    window.KBMedia.start();
    for(const placeholder of document.querySelectorAll('script[data-kb-script]')){
      await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=placeholder.dataset.kbScript;script.onload=resolve;script.onerror=()=>reject(Error('Verktøyet kunne ikke lastes. Last siden på nytt.'));document.body.append(script);});
    }
    for(const id of ['passordSperre','pwd-screen']){const old=document.getElementById(id);if(old)old.remove();}
    // Existing initialization listeners run after the verified scripts are loaded.
    document.dispatchEvent(new Event('DOMContentLoaded',{bubbles:true}));
    for(const button of document.querySelectorAll('[onclick*="Passord"],[onclick*="passord"]'))button.hidden=true;
    screen.remove();
    const tools=document.createElement('nav');tools.setAttribute('aria-label','Din konto');
    tools.style.cssText='position:fixed;bottom:12px;right:12px;z-index:1000;display:flex;gap:12px;padding:10px 14px;background:white;border:1px solid #dbe3ea;border-radius:8px;box-shadow:0 3px 12px #0001;font:13px system-ui';
    const who=document.createElement('span');who.textContent=employee.name;
    const demos=document.createElement('a');demos.href='/demokoder.html';demos.textContent='Lag demokode';
    const logout=document.createElement('button');logout.textContent='Logg ut';logout.addEventListener('click',()=>window.KBAuth.logoutAndReturn());
    tools.append(who,demos,logout);document.body.append(tools);
    window.KBDatabase.getClient().auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){document.body.style.visibility='hidden';location.replace('/innlogging.html');}});
    let lastActivity=Date.now();
    for(const event of ['pointerdown','keydown','touchstart'])document.addEventListener(event,()=>{lastActivity=Date.now();},{passive:true});
    setInterval(()=>{if(Date.now()-lastActivity>30*60*1000)window.KBAuth.logoutAndReturn();},30000);
    if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
  }catch(error){status.textContent=error.message||'Innloggingen kunne ikke bekreftes.';button.hidden=false;}
})();
