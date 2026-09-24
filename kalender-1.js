
// ============================================
// KONFIGURASJON - bytt ut med riktige kalender-ID-er
// Se GOOGLE_KALENDER_OPPSETT.md for hvordan du finner ID-ene
// ============================================
const KALENDERE = {
  felles: {
    id: 'c_20de9ccacfce1609c2a2e13a6cd6b0648d1190ddb66f47c1832c7a023779ae74@group.calendar.google.com',
    navn: 'Felles',
    farge: '%23e8a317'   // gul (URL-encoded #)
  },
  stephen: {
    id: 'stephen@komplettbyggdrift.no',
    navn: 'Stephen',
    farge: '%231a3a5c'   // mørkeblå
  },
  eirik: {
    id: 'eirik@komplettbyggdrift.no',
    navn: 'Eirik',
    farge: '%2316a34a'   // grønn
  },
  eivind: {
    id: 'eivind@komplettbyggdrift.no',
    navn: 'Eivind',
    farge: '%23dc2626'   // rød
  }
};

const TIDSSONE = 'Europe/Oslo';

// ============================================
// STATE
// ============================================
let aktiveBrukere = {felles:true, stephen:true, eirik:true, eivind:true};
let aktivVisning = matchMedia('(max-width: 650px)').matches ? 'AGENDA' : 'WEEK';
const calendarPreferenceKey='kb_calendar_view_v2_'+KBAuth.employee.id;
try{const saved=JSON.parse(localStorage.getItem(calendarPreferenceKey));if(saved){if(['WEEK','MONTH','AGENDA'].includes(saved.view))aktivVisning=saved.view;for(const key of Object.keys(aktiveBrukere))if(typeof saved.users?.[key]==='boolean')aktiveBrukere[key]=saved.users[key];}}catch{}
function saveCalendarPreferences(){try{localStorage.setItem(calendarPreferenceKey,JSON.stringify({view:aktivVisning,users:aktiveBrukere}));}catch{}}

// ============================================
// PASSORD
// ============================================
function visApp(){
  document.getElementById('pwd-screen').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';
  bygg();
}

// Enter-tast i passord-felt
document.getElementById('pwd-input').addEventListener('keypress', e => {
  if(e.key === 'Enter') sjekkPassord();
});

// ============================================
// BYGGER GRENSESNITT
// ============================================
function bygg(){
  // Sjekk om kalender-IDer er konfigurert
  const ikkeKonfigurert = Object.values(KALENDERE).some(k => k.id.includes('xxxxxxxxx'));
  if(ikkeKonfigurert){
    document.getElementById('config-banner').style.display = 'block';
  }

  // Bygg brukerfilter-chips
  const wrap = document.getElementById('user-filter');
  Object.entries(KALENDERE).forEach(([nokkel, kal]) => {
    const chip = document.createElement('button');
    chip.className = 'user-chip'+(aktiveBrukere[nokkel]?' active':'');
    chip.setAttribute('aria-pressed',String(aktiveBrukere[nokkel]));
    chip.dataset.key = nokkel;
    chip.innerHTML = `<span class="dot" style="background:${decodeURIComponent(kal.farge)}"></span>${kal.navn}`;
    chip.onclick = () => toggleBruker(nokkel, chip);
    wrap.appendChild(chip);
  });

  oppdaterKalender();
}

function toggleBruker(nokkel, chip){
  aktiveBrukere[nokkel] = !aktiveBrukere[nokkel];
  chip.classList.toggle('active',aktiveBrukere[nokkel]);
  chip.setAttribute('aria-pressed',String(aktiveBrukere[nokkel]));
  oppdaterKalender();
}

function settVisning(visning){
  aktivVisning = visning;
  document.querySelectorAll('.view-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === visning);
  });
  oppdaterKalender();
}

function oppdaterKalender(){
  saveCalendarPreferences();
  document.querySelectorAll('.view-btn').forEach(b=>{b.classList.toggle('active',b.dataset.view===aktivVisning);b.setAttribute('aria-pressed',String(b.dataset.view===aktivVisning));});
  const any=Object.values(aktiveBrukere).some(Boolean);
  document.getElementById('calendar-empty').hidden=any;
  document.getElementById('calendar-frame').hidden=!any;
  if(!any){document.getElementById('calendar-frame').src='about:blank';return;}
  let url = 'https://calendar.google.com/calendar/embed?';
  url += 'ctz=' + encodeURIComponent(TIDSSONE);
  url += '&mode=' + aktivVisning;
  url += '&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0';
  url += '&wkst=2'; // Mandag som første ukedag

  Object.entries(KALENDERE).forEach(([nokkel, kal]) => {
    if(aktiveBrukere[nokkel] && !kal.id.includes('xxxxxxxxx')){
      url += '&src=' + encodeURIComponent(kal.id);
      url += '&color=' + kal.farge;
    }
  });

  document.getElementById('calendar-frame').src = url;
}

// ============================================
// INIT
// ============================================
if((window.KBAuth.employee ? '1' : null) === '1'){
  visApp();
} else {
  setTimeout(() => document.getElementById('pwd-input').focus(), 100);
}


// =========================================
// PWA: installer som app
// =========================================
(function(){
  // Registrer service worker
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    });
  }

  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt',(e)=>{
    e.preventDefault();
    deferredPrompt=e;
    visInstallerBanner();
  });

  function visInstallerBanner(){
    if(sessionStorage.getItem('kb_install_avvist')==='1')return;
    if(window.matchMedia('(display-mode: standalone)').matches)return;
    if(document.getElementById('installerBanner'))return;
    const d=document.createElement('div');
    d.id='installerBanner';
    d.style.cssText='position:fixed;bottom:16px;left:16px;right:16px;background:#1a3a5c;color:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:9000;display:flex;gap:12px;align-items:center;max-width:480px;margin:0 auto;font-family:-apple-system,sans-serif;animation:kbSlideUp 0.3s ease-out';
    d.innerHTML=`
      <div style="font-size:32px">📱</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:14px;margin-bottom:2px">Installer som app</div>
        <div style="font-size:12px;opacity:0.85;line-height:1.4">Få Komplett Byggdrift som app på hjemskjermen for raskere tilgang.</div>
      </div>
      <button onclick="kbInstaller()" style="background:#e8a317;color:#1a3a5c;border:none;padding:10px 16px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;flex-shrink:0">Installer</button>
      <button onclick="kbAvvisInstaller()" style="background:transparent;color:rgba(255,255,255,0.7);border:none;padding:6px;cursor:pointer;font-size:18px;flex-shrink:0" title="Lukk">✕</button>`;
    document.body.appendChild(d);
    const stil=document.createElement('style');
    stil.textContent='@keyframes kbSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(stil);
  }

  window.kbInstaller=async function(){
    if(!deferredPrompt){kbAvvisInstaller();return;}
    deferredPrompt.prompt();
    const result=await deferredPrompt.userChoice;
    deferredPrompt=null;
    kbAvvisInstaller();
  };

  window.kbAvvisInstaller=function(){
    sessionStorage.setItem('kb_install_avvist','1');
    const el=document.getElementById('installerBanner');
    if(el)el.remove();
  };

  // iOS Safari: ingen beforeinstallprompt, må vise egen melding
  function erIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;}
  function erIOSStandalone(){return window.navigator.standalone===true;}

  if(erIOS() && !erIOSStandalone() && sessionStorage.getItem('kb_install_avvist')!=='1'){
    setTimeout(()=>{
      if(document.getElementById('installerBanner'))return;
      const d=document.createElement('div');
      d.id='installerBanner';
      d.style.cssText='position:fixed;bottom:16px;left:16px;right:16px;background:#1a3a5c;color:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:9000;display:flex;gap:12px;align-items:center;max-width:480px;margin:0 auto;font-family:-apple-system,sans-serif';
      d.innerHTML=`
        <div style="font-size:32px">📱</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;margin-bottom:2px">Installer som app</div>
          <div style="font-size:12px;opacity:0.85;line-height:1.4">Trykk <strong>Del</strong>-ikonet nederst (eller øverst) og velg <strong>"Legg til på Hjem-skjerm"</strong>.</div>
        </div>
        <button onclick="kbAvvisInstaller()" style="background:transparent;color:rgba(255,255,255,0.7);border:none;padding:6px;cursor:pointer;font-size:18px;flex-shrink:0" title="Lukk">✕</button>`;
      document.body.appendChild(d);
    },3000);
  }
})();


// =========================================
// TILBAKEMELDINGER / FEILMELDINGER
// =========================================
// Shared feedback lives in kb-feedback.js.

// =========================================
async function loggUt(){ await window.KBAuth.logoutAndReturn(); }

// Session expiry and inactivity handled by kb-gate.js.
