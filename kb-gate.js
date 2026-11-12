(async function(){
  'use strict';
  const themeScript=document.createElement('script');themeScript.src='/kb-theme.js?v=20261108-polish';document.head.append(themeScript);
  const screen = document.createElement('section');
  screen.id='kb-secure-gate';
  screen.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#f1f5f8;display:grid;place-items:center;padding:24px;font-family:system-ui,sans-serif;color:#17324d';
  screen.className='kb-login-page kb-logo-loading';
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='/kb-login.css?v=20261112-k-animasjon';document.head.append(stylesheet);
  screen.innerHTML="<div class=\"kb-login-card\"><div class=\"kb-login-brand\"><span class=\"kb-login-mark\" aria-hidden=\"true\"><img src=\"/kb-k-192-dark.png\" alt=\"\"><span class=\"kb-k-piece\"></span><span class=\"kb-k-piece\"></span><span class=\"kb-k-piece\"></span></span><span>Komplett Byggdrift<span class=\"kb-login-caption\">Arbeidsplassen din, samlet.</span></span></div><h1>Velkommen tilbake</h1><p class=\"kb-login-intro\">Logg inn for å åpne verktøyene dine.</p><p id=\"kb-gate-status\" class=\"kb-login-status\" role=\"status\" aria-live=\"polite\">Kontrollerer innlogging …</p><button id=\"kb-google\" class=\"kb-google-button\" hidden><img src=\"/google-g.png\" width=\"20\" height=\"20\" alt=\"\" aria-hidden=\"true\"><span>Logg på med Google</span></button><p class=\"kb-login-hint\">Bruk Google-kontoen med firmaadressen din.</p><div class=\"kb-login-footer\"><span>Har du en gjestekode?</span><a href=\"/demo.html\">Åpne demo <span aria-hidden=\"true\">→</span></a></div><a class=\"kb-login-back\" href=\"/\">← Til forsiden</a></div>";
  document.body.append(screen);
  const button=screen.querySelector('button'),status=screen.querySelector('[role=status]');
  button.addEventListener('click',async()=>{button.disabled=true;screen.classList.add('kb-logo-loading');try{await window.KBAuth.signIn();}catch(e){screen.classList.remove('kb-logo-loading');status.textContent=e.message;button.disabled=false;}});
  try {
    const employee=await window.KBAuth.getEmployee();
    if(!employee){screen.classList.remove('kb-logo-loading');status.textContent='';button.hidden=false;return;}
    const pageModules={'/timer.html':'projects','/tilbud.html':'projects','/anbudskalkulator.html':'projects','/sjekklister.html':'projects','/hms.html':'hms','/kalender.html':'calendar','/okonomi.html':'finance'};
    const required=pageModules[location.pathname];
    if((required&&!KBAuth.can(required))||(location.pathname==='/tilganger.html'&&!employee.isAdmin)){
      screen.classList.remove('kb-logo-loading');
      status.textContent='Du har ikke tilgang til dette verktøyet. Kontakt Stephen eller Eirik.';
      const back=document.createElement('a');back.href='/innlogging.html';back.textContent='Til mine verktøy';status.after(back);return;
    }
    // The legacy flags are not accepted for authentication. Only the verified identity is used below.
    for(const key of ['kb_auth','kb_bruker','kb_via_firmakode'])sessionStorage.removeItem(key);
    window.KBMedia.start();
    for(const placeholder of document.querySelectorAll('script[data-kb-script]')){
      if(placeholder.dataset.kbScript==='/kb-feedback.js'&&!KBAuth.can('feedback'))continue;
      await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=placeholder.dataset.kbScript==='/kb-feedback.js'?'/kb-feedback.js?v=20261108-polish':placeholder.dataset.kbScript;if(script.src.includes('/kb-finance.js'))script.src='/kb-finance.js?v=20261108-workday';script.onload=resolve;script.onerror=()=>reject(Error('Verktøyet kunne ikke lastes. Last siden på nytt.'));document.body.append(script);});
    }
    for(const id of ['passordSperre','pwd-screen']){const old=document.getElementById(id);if(old)old.remove();}
    // Existing initialization listeners run after the verified scripts are loaded.
    document.dispatchEvent(new Event('DOMContentLoaded',{bubbles:true}));
    for(const button of document.querySelectorAll('[onclick*="Passord"],[onclick*="passord"]'))button.hidden=true;
    screen.remove();
    const contextScript=document.createElement('script');contextScript.src='/kb-project-context.js?v=20261108';document.body.append(contextScript);
    const uxScript=document.createElement('script');uxScript.src='/kb-ux.js?v=20261112-prosjekter';uxScript.onload=()=>{const workday=document.createElement('script');workday.src='/kb-workday.js?v=20261112-fortsett-del';document.body.append(workday);};document.body.append(uxScript);
    const floatingStyle=document.createElement('style');floatingStyle.textContent=`
      body{padding-bottom:100px!important}
      #kb-settings-button{appearance:none;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:8px 13px;border:1px solid #9db4c9;border-radius:10px;background:#eef5fb;color:#17324d;font:650 14px/1.2 system-ui,sans-serif;cursor:pointer}
      #kb-settings-button .kb-settings-icon{display:grid;place-items:center;width:24px;height:24px;border-radius:6px;background:#dbe9f5;font-size:16px}
      #kb-settings-button:hover{background:#deedf9;border-color:#5c84a7}
      #kb-settings-button:focus-visible{outline:3px solid #e8a317;outline-offset:3px}
      html[data-kb-theme=dark] #kb-settings-button{background:#284863;color:#edf6ff;border-color:#648098}
      html[data-kb-theme=dark] #kb-settings-button .kb-settings-icon{background:#173550}
      html[data-kb-theme=dark] #kb-settings-button:hover{background:#335b7a}
      @media(max-width:700px){nav[aria-label="Din konto"]{position:static!important;inset:auto!important;display:flex!important;max-width:none!important;margin:24px 12px 12px!important;gap:8px 16px!important;padding:12px!important;box-sizing:border-box}nav[aria-label="Din konto"] a,nav[aria-label="Din konto"] button{min-height:44px;display:inline-flex;align-items:center}nav[aria-label="Din konto"] button{padding:8px 12px}}
      @media print{nav[aria-label="Din konto"],.kb-feedback-dock,#tilbakemeldingBoble{display:none!important}body{padding-bottom:0!important}}
    `;document.head.append(floatingStyle);
    const tools=document.createElement('nav');tools.setAttribute('aria-label','Din konto');
    tools.style.cssText='position:static;margin:12px 20px;z-index:1000;display:flex;flex-wrap:wrap;max-width:calc(100vw - 24px);align-items:center;gap:12px;padding:10px 14px;background:white;border:1px solid #dbe3ea;border-radius:8px;box-shadow:0 3px 12px #0001;font:13px system-ui';
    const settingsButton=document.createElement('button');settingsButton.type='button';settingsButton.id='kb-settings-button';
    const settingsIcon=document.createElement('span');
    settingsIcon.className='kb-settings-icon';settingsIcon.textContent='⚙';settingsIcon.setAttribute('aria-hidden','true');
    settingsButton.append(settingsIcon,'Innstillinger');
    const settingsSlot=document.getElementById('kb-checklist-settings');
    if(settingsSlot) settingsSlot.append(settingsButton);
    else tools.append(settingsButton);
    const settingsScript=document.createElement('script');settingsScript.src='/kb-settings.js?v=20261108-tools';document.body.append(settingsScript);
    for(const a of document.querySelectorAll('a[href]')){const m=pageModules[new URL(a.href,location.href).pathname];if(m&&!KBAuth.can(m))a.hidden=true;}
    if(!KBAuth.can('demo')){const b=document.getElementById('engangskoderBtn');if(b)b.style.display='none';}
    setInterval(async()=>{try{const fresh=await KBAuth.getEmployee();if(!fresh||(required&&!KBAuth.can(required))||(location.pathname==='/tilganger.html'&&!fresh.isAdmin))location.replace('/innlogging.html');}catch{location.replace('/innlogging.html');}},60000);if(!settingsSlot)document.body.append(tools);
    window.KBDatabase.getClient().auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){document.body.style.visibility='hidden';location.replace('/innlogging.html');}});
    let lastActivity=Date.now();
    for(const event of ['pointerdown','keydown','touchstart'])document.addEventListener(event,()=>{lastActivity=Date.now();},{passive:true});
    setInterval(()=>{if(window.parent===window&&Date.now()-lastActivity>30*60*1000)window.KBAuth.logoutAndReturn();},30000);
    if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
  }catch(error){screen.classList.remove('kb-logo-loading');status.textContent=error.message||'Innloggingen kunne ikke bekreftes.';button.hidden=false;}
})();
