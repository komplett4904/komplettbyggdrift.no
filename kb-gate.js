(async function(){
  'use strict';
  const screen = document.createElement('section');
  screen.id='kb-secure-gate';
  screen.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#f1f5f8;display:grid;place-items:center;padding:24px;font-family:system-ui,sans-serif;color:#17324d';
  screen.className='kb-login-page';
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='/kb-login.css';document.head.append(stylesheet);
  screen.innerHTML="<div class=\"kb-login-card\"><div class=\"kb-login-brand\"><span class=\"kb-login-mark\" aria-hidden=\"true\">KB</span><span>Komplett Byggdrift<span class=\"kb-login-caption\">Arbeidsplassen din, samlet.</span></span></div><h1>Velkommen tilbake</h1><p class=\"kb-login-intro\">Logg inn for å åpne verktøyene dine.</p><p id=\"kb-gate-status\" class=\"kb-login-status\" role=\"status\" aria-live=\"polite\">Kontrollerer innlogging …</p><button id=\"kb-google\" class=\"kb-google-button\" hidden><img src=\"/google-g.png\" width=\"20\" height=\"20\" alt=\"\" aria-hidden=\"true\"><span>Logg på med Google</span></button><p class=\"kb-login-hint\">Bruk Google-kontoen med firmaadressen din.</p><div class=\"kb-login-footer\"><span>Har du en gjestekode?</span><a href=\"/demo.html\">Åpne demo <span aria-hidden=\"true\">→</span></a></div><a class=\"kb-login-back\" href=\"/\">← Til forsiden</a></div>";
  document.body.append(screen);
  const button=screen.querySelector('button'),status=screen.querySelector('[role=status]');
  button.addEventListener('click',async()=>{button.disabled=true;try{await window.KBAuth.signIn();}catch(e){status.textContent=e.message;button.disabled=false;}});
  try {
    const employee=await window.KBAuth.getEmployee();
    if(!employee){status.textContent='';button.hidden=false;return;}
    const pageModules={'/anbudskalkulator.html':'projects','/hms.html':'hms','/kalender.html':'calendar','/okonomi.html':'finance'};
    const required=pageModules[location.pathname];
    if((required&&!KBAuth.can(required))||(location.pathname==='/tilganger.html'&&!employee.isAdmin)){
      status.textContent='Du har ikke tilgang til dette verktøyet. Kontakt Stephen eller Eirik.';
      const back=document.createElement('a');back.href='/innlogging.html';back.textContent='Til mine verktøy';status.after(back);return;
    }
    // The legacy flags are not accepted for authentication. Only the verified identity is used below.
    for(const key of ['kb_auth','kb_bruker','kb_via_firmakode'])sessionStorage.removeItem(key);
    window.KBMedia.start();
    for(const placeholder of document.querySelectorAll('script[data-kb-script]')){
      if(placeholder.dataset.kbScript==='/kb-feedback.js'&&!KBAuth.can('feedback'))continue;
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
    tools.append(who);if(KBAuth.can('demo'))tools.append(demos);
    if(employee.isAdmin){const settings=document.createElement('a');settings.href='/tilganger.html';settings.textContent='Tilganger';tools.append(settings);}
    if(KBAuth.can('finance')){const finance=document.createElement('a');finance.href='/okonomi.html';finance.textContent='Økonomi';tools.append(finance);}
    tools.append(logout);
    for(const a of document.querySelectorAll('a[href]')){const m=pageModules[new URL(a.href,location.href).pathname];if(m&&!KBAuth.can(m))a.hidden=true;}
    if(!KBAuth.can('demo')){const b=document.getElementById('engangskoderBtn');if(b)b.style.display='none';}
    setInterval(async()=>{try{const fresh=await KBAuth.getEmployee();if(!fresh||(required&&!KBAuth.can(required))||(location.pathname==='/tilganger.html'&&!fresh.isAdmin))location.replace('/innlogging.html');}catch{location.replace('/innlogging.html');}},60000);document.body.append(tools);
    window.KBDatabase.getClient().auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){document.body.style.visibility='hidden';location.replace('/innlogging.html');}});
    let lastActivity=Date.now();
    for(const event of ['pointerdown','keydown','touchstart'])document.addEventListener(event,()=>{lastActivity=Date.now();},{passive:true});
    setInterval(()=>{if(Date.now()-lastActivity>30*60*1000)window.KBAuth.logoutAndReturn();},30000);
    if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
  }catch(error){status.textContent=error.message||'Innloggingen kunne ikke bekreftes.';button.hidden=false;}
})();
