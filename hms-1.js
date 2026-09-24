
// ============================================
// KONFIGURASJON
// ============================================
const SUPABASE_URL=window.KBDatabase.url;
const SUPABASE_KEY=window.KBDatabase.key;
let sb=null;
try{ if(window.supabase) sb=window.KBDatabase.getClient(); }catch(e){console.error(e);}

// Standard sjekkpunkter for vernerunde
const VR_SJEKKPUNKTER=[
  'Personlig verneutstyr brukes',
  'Verktøy er i orden og sikret',
  'Stillas/stige korrekt montert',
  'Stillas: bunnseksjon låst og sikret (ingen kan vippe det)',
  'Stillas: hjul/bjelkesko stabile og uten skade',
  'Stillas: rekkverk og fotlist på plass i alle nivåer',
  'Stillas: adkomst (stiger/luker) tett og fungerer',
  'Lift: daglig sjekk gjennomført, kontrollskjema utfylt',
  'Lift: nødstopp og horn testet',
  'Lift: hydraulikk uten lekkasje, dekk OK',
  'Fallsikring-utstyr: sjekket for slitasje og dato',
  'Branninstrukser tilgjengelige',
  'Førstehjelpsutstyr tilgjengelig',
  'Stoffkartotek for kjemikalier oppdatert',
  'Avfall håndteres etter plan',
  'Strøm og el-utstyr i orden',
  'Skilting og avsperring riktig',
  'Orden og ryddighet'
];

// Type vernerunde - definerer frekvens
const VR_TYPER={
  'Mandagssjekk':'Ukentlig stillas- og utstyrssjekk før jobben starter mandag morgen',
  'Vanlig vernerunde':'Standard kvartalsvis HMS-gjennomgang av arbeidsplass',
  'Daglig sikkerhetsbrief':'Kort gjennomgang før jobbstart - farer, oppgaver, sikkerhet',
  'Etter hendelse':'Vernerunde etter avvik/nestenulykke for å forhindre gjentakelse'
};

// ============================================
// STATE
// ============================================
let aktivSub='sja';
let sjaListe=[], avvikListe=[], vrListe=[], stoffListe=[];
let redigerSjaId=null, redigerAvvikId=null, redigerVrId=null, redigerStoffId=null;

// ============================================
// PASSORD OG BRUKER
// ============================================
function visApp(){
  document.getElementById('pwd-screen').style.display='none';
  document.getElementById('app-content').style.display='block';
  visBrukerVelger();
  if(window.KBAuth.employee?.name)hentAlt();
}

function hentBruker(){ return window.KBAuth.employee?.name||'Ukjent'; }

function visBrukerVelger(){ /* Identity comes from verified Google sign-in. */ }
function velgBruker(){ /* Identity comes from verified Google sign-in. */ }

// ============================================
// SKY-SYNC
// ============================================
function visStatus(tekst,klasse){
  const el=document.getElementById('sky-status');
  if(!el)return;
  el.textContent=tekst;
  el.className=klasse||'';
  if(klasse==='ok')setTimeout(()=>{if(el.textContent===tekst)el.textContent='';},2000);
}

async function hentAlt(){
  if(!sb)return;
  visStatus('Henter...','');
  await Promise.all([hentSja(),hentAvvik(),hentVernerunde(),hentStoffer()]);
  visStatus('✓ Synket','ok');
  if(aktivSub==='oversikt')byggOversikt();
}

async function hentSja(){
  try{const {data,error}=await sb.from('hms_sja').select('*').order('dato',{ascending:false});
    if(error)throw error;sjaListe=data||[];renderSjaListe();
  }catch(e){console.error(e);visStatus('⚠ Sync feilet','feil');}
}
async function hentAvvik(){
  try{const {data,error}=await sb.from('hms_avvik').select('*').order('dato',{ascending:false});
    if(error)throw error;avvikListe=data||[];renderAvvikListe();
  }catch(e){console.error(e);visStatus('⚠ Sync feilet','feil');}
}
async function hentVernerunde(){
  try{const {data,error}=await sb.from('hms_vernerunde').select('*').order('dato',{ascending:false});
    if(error)throw error;vrListe=data||[];renderVernerundeListe();
  }catch(e){console.error(e);}
}
async function hentStoffer(){
  try{const {data,error}=await sb.from('hms_stoffer').select('*').order('navn',{ascending:true});
    if(error)throw error;stoffListe=data||[];renderStoffListe();
  }catch(e){console.error(e);}
}

// ============================================
// TABS
// ============================================
function settSub(sub){
  aktivSub=sub;
  document.querySelectorAll('.sub-tab').forEach(t=>t.classList.toggle('active',t.dataset.sub===sub));
  ['oversikt','sja','avvik','vernerunde','stoffer','policy'].forEach(s=>{
    const p=document.getElementById('panel-'+s);
    if(p)p.classList.toggle('hidden',s!==sub);
  });
  if(sub==='oversikt')byggOversikt();
}

function byggOversikt(){
  // Statistikk-kort
  const apneAvvik=avvikListe.filter(a=>a.status!=='lukket').length;
  const lukkedeAvvik=avvikListe.filter(a=>a.status==='lukket').length;
  const sisteAr=new Date();sisteAr.setFullYear(sisteAr.getFullYear()-1);
  const vrSisteAr=vrListe.filter(v=>new Date(v.dato)>sisteAr).length;
  const sjaSisteAr=sjaListe.filter(s=>new Date(s.dato)>sisteAr).length;
  const farligeAvvik=avvikListe.filter(a=>a.alvorlighet==='hoy'&&a.status!=='lukket').length;

  const statsEl=document.getElementById('oversikt-stats');
  if(statsEl){
    statsEl.innerHTML=`
      <div class="card" style="text-align:center;padding:20px 14px">
        <div style="font-size:36px;font-weight:800;color:${apneAvvik>0?'#dc2626':'#16a34a'}">${apneAvvik}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">Åpne avvik</div>
      </div>
      <div class="card" style="text-align:center;padding:20px 14px">
        <div style="font-size:36px;font-weight:800;color:${farligeAvvik>0?'#dc2626':'#16a34a'}">${farligeAvvik}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">Høy alvorlighet</div>
      </div>
      <div class="card" style="text-align:center;padding:20px 14px">
        <div style="font-size:36px;font-weight:800;color:#1a3a5c">${vrSisteAr}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">Vernerunder siste år (mål: 4+)</div>
      </div>
      <div class="card" style="text-align:center;padding:20px 14px">
        <div style="font-size:36px;font-weight:800;color:#1a3a5c">${sjaSisteAr}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">SJA siste år</div>
      </div>
      <div class="card" style="text-align:center;padding:20px 14px">
        <div style="font-size:36px;font-weight:800;color:#16a34a">${lukkedeAvvik}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">Lukkede avvik (totalt)</div>
      </div>
    `;
  }

  // Siste SJA
  const sjaEl=document.getElementById('oversikt-sja-liste');
  if(sjaEl){
    const siste=sjaListe.slice(0,5);
    if(siste.length===0)sjaEl.innerHTML='<div style="color:var(--muted);padding:10px 0">Ingen SJA registrert ennå</div>';
    else sjaEl.innerHTML=siste.map(s=>`<div style="padding:8px 0;border-bottom:1px solid #eee"><strong>${escapeHtml(s.prosjekt||'(uten navn)')}</strong><div style="font-size:12px;color:var(--muted)">${formaterDato(s.dato)} · ${(s.farer||[]).length} farer</div></div>`).join('');
  }

  // Åpne avvik
  const avEl=document.getElementById('oversikt-avvik-liste');
  if(avEl){
    const apne=avvikListe.filter(a=>a.status!=='lukket').slice(0,5);
    if(apne.length===0)avEl.innerHTML='<div style="color:#16a34a;padding:10px 0">✓ Ingen åpne avvik – bra jobbet!</div>';
    else avEl.innerHTML=apne.map(a=>`<div style="padding:8px 0;border-bottom:1px solid #eee"><strong>${escapeHtml((a.beskrivelse||'').slice(0,60))}</strong><div style="font-size:12px;color:var(--muted)">${formaterDato(a.dato)} · ${a.alvorlighet||'lav'} · ${escapeHtml(a.melder||'-')}</div></div>`).join('');
  }

  // Siste vernerunder
  const vrEl=document.getElementById('oversikt-vr-liste');
  if(vrEl){
    const siste=vrListe.slice(0,5);
    if(siste.length===0)vrEl.innerHTML='<div style="color:var(--muted);padding:10px 0">Ingen vernerunder registrert ennå</div>';
    else vrEl.innerHTML=siste.map(v=>{
      const sj=v.sjekkpunkter||{};
      const avvik=Object.values(sj).filter(x=>x==='avvik').length;
      return `<div style="padding:8px 0;border-bottom:1px solid #eee"><strong>${escapeHtml(v.lokasjon||'(uten lokasjon)')}</strong><div style="font-size:12px;color:var(--muted)">${formaterDato(v.dato)} · ${avvik>0?avvik+' avvik':'OK'}</div></div>`;
    }).join('');
  }
}

// ============================================
// SJA
// ============================================
let sjaSignaturer=[];

let sjaFritekstDeltakere=[];

function oppdaterDeltakere(){
  const faste=Array.from(document.querySelectorAll('[data-fast-deltaker]:checked')).map(c=>c.dataset.fastDeltaker);
  const fritekst=sjaFritekstDeltakere.slice();
  const alle=[...faste,...fritekst];
  const h=document.getElementById('sja-deltakere');
  if(h)h.value=alle.join(', ');
  const hf=document.getElementById('sja-deltakere-fritekst');
  if(hf)hf.value=fritekst.join(', ');
  byggFritekstListe();
  if(typeof byggSignaturListe==='function')byggSignaturListe();
}

function leggTilFritekstDeltaker(){
  const inp=document.getElementById('sja-deltakere-nyfritekst');
  if(!inp)return;
  const navn=inp.value.trim();
  if(!navn)return;
  // Ikke tillat duplikater eller KB-ansatte
  const eksisterer=sjaFritekstDeltakere.some(d=>d.toLowerCase()===navn.toLowerCase());
  const erKB=['stephen','eirik','eivind'].includes(navn.toLowerCase());
  if(erKB){alert('Bruk sjekkboksen over for '+navn);inp.value='';return;}
  if(eksisterer){alert(navn+' er allerede lagt til');inp.value='';return;}
  sjaFritekstDeltakere.push(navn);
  inp.value='';
  inp.focus();
  oppdaterDeltakere();
}

function fjernFritekstDeltaker(idx){
  sjaFritekstDeltakere.splice(idx,1);
  oppdaterDeltakere();
}

function byggFritekstListe(){
  const el=document.getElementById('sja-fritekst-liste');
  if(!el)return;
  el.innerHTML=sjaFritekstDeltakere.map((navn,i)=>`<span style="background:#eef4fb;color:#1a3a5c;padding:6px 10px;border-radius:14px;font-size:13px;display:inline-flex;align-items:center;gap:6px;font-weight:600">${escapeHtml(navn)} <button onclick="fjernFritekstDeltaker(${i})" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:16px;padding:0;line-height:1" title="Fjern">×</button></span>`).join('');
}

function byggSignaturListe(){
  const el=document.getElementById('sja-signaturer');
  if(!el)return;
  const deltakereRaw=document.getElementById('sja-deltakere')?.value||'';
  const deltakere=deltakereRaw.split(/[,;]/).map(s=>s.trim()).filter(Boolean);
  if(deltakere.length===0){
    el.innerHTML='<div style="background:#f5f7fa;padding:12px;border-radius:8px;color:var(--muted);font-size:13px;text-align:center">Legg til deltakere over først</div>';
    return;
  }
  const innloggetBruker=(window.KBAuth.employee?.name||'').toLowerCase();
  const kbAnsatte=['stephen','eirik','eivind'];
  el.innerHTML=deltakere.map(navn=>{
    const sig=sjaSignaturer.find(s=>s.navn.toLowerCase()===navn.toLowerCase());
    const erKBAnsatt=kbAnsatte.includes(navn.toLowerCase());
    // Egen signering hvis innlogget som seg selv, ELLER hvis dette er en ekstern (fritekst) deltaker og du er KB-ansatt
    const kanSignere=(navn.toLowerCase()===innloggetBruker) || (!erKBAnsatt && kbAnsatte.includes(innloggetBruker));
    if(sig){
      const dato=new Date(sig.signert_dato).toLocaleString('nb-NO');
      const kanFjerne=(sig.navn.toLowerCase()===innloggetBruker) || (!erKBAnsatt && kbAnsatte.includes(innloggetBruker));
      const signertPa=sig.signert_av_annen?`<div style="font-size:11px;color:#166534;margin-top:2px">Signert av ${escapeHtml(sig.signert_av_annen)} på vegne av deltakeren</div>`:'';
      return `<div style="background:#dcfce7;border:1px solid #86efac;padding:10px 12px;border-radius:8px;margin-bottom:6px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <div><strong style="color:#15803d">✓ ${escapeHtml(navn)}</strong> <span style="font-size:12px;color:#166534">signert ${dato}</span>${signertPa}</div>
          ${kanFjerne?`<button onclick="fjernSignatur('${escapeHtml(navn).replace(/'/g,'&#39;')}')" style="background:#fff;color:#dc2626;border:1px solid #fca5a5;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:12px">Fjern</button>`:''}
        </div>
        ${sig.bilde?`<img src="${sig.bilde}" style="max-width:200px;background:#fff;border:1px solid #86efac;border-radius:4px;padding:4px">`:''}
      </div>`;
    } else if(kanSignere){
      const knappTekst=erKBAnsatt?'✍ Signer':'✍ Signer for '+navn;
      const forklaring=erKBAnsatt?'– venter på din signatur':'– ekstern deltaker, du kan signere for dem';
      return `<div style="background:#fff8e6;border:1px solid #f0d68a;padding:10px 12px;border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <div><strong>${escapeHtml(navn)}</strong> <span style="font-size:12px;color:#92400e">${forklaring}</span></div>
        <button onclick="signerSja('${escapeHtml(navn).replace(/'/g,'&#39;')}')" style="background:#16a34a;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700">${knappTekst}</button>
      </div>`;
    } else {
      return `<div style="background:#fff;border:1px solid var(--border);padding:10px 12px;border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <div><strong>${escapeHtml(navn)}</strong> <span style="font-size:12px;color:var(--muted)">– må selv logge inn for å signere</span></div>
        <span style="font-size:12px;color:var(--muted);font-style:italic">Ikke signert</span>
      </div>`;
    }
  }).join('');
}

function signerSja(navn){
  vissignaturModal(navn);
}

function vissignaturModal(navn){
  const eksisterer=document.getElementById('signaturModal');
  if(eksisterer)eksisterer.remove();
  const d=document.createElement('div');
  d.id='signaturModal';
  d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;font-family:-apple-system,sans-serif';
  d.innerHTML=`
    <div style="background:#fff;padding:24px;border-radius:14px;max-width:520px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <h2 style="color:#1a3a5c;font-size:20px;margin-bottom:6px">Signer som ${escapeHtml(navn)}</h2>
      <p style="color:#667085;font-size:13px;margin-bottom:14px;line-height:1.4">Tegn signaturen din med finger eller mus. Du bekrefter at du har lest og forstått SJA-en, og at du kjenner farene og tiltakene.</p>
      <div style="border:2px dashed #dde3ec;border-radius:8px;background:#fff;position:relative;height:200px;overflow:hidden">
        <canvas id="signaturCanvas" style="width:100%;height:100%;touch-action:none;cursor:crosshair;display:block"></canvas>
        <div id="signaturPlaceholder" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;pointer-events:none">Tegn signatur her</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button onclick="nullstillSignatur()" style="background:#fff;color:#667085;border:1px solid #dde3ec;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;flex:1">Prøv igjen</button>
        <button onclick="avbrytSignatur()" style="background:#fff;color:#dc2626;border:1px solid #fca5a5;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;flex:1">Avbryt</button>
        <button onclick="godkjennSignatur('${escapeHtml(navn).replace(/'/g,"&#39;")}')" style="background:#16a34a;color:#fff;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;flex:2">✓ Signer</button>
      </div>
    </div>`;
  document.body.appendChild(d);
  settOppSignaturCanvas();
}

let signaturHarTegning=false;
function settOppSignaturCanvas(){
  const canvas=document.getElementById('signaturCanvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const rect=canvas.getBoundingClientRect();
  const dpr=window.devicePixelRatio||1;
  canvas.width=rect.width*dpr;
  canvas.height=rect.height*dpr;
  ctx.scale(dpr,dpr);
  ctx.lineWidth=2.5;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.strokeStyle='#1a3a5c';
  signaturHarTegning=false;
  let tegner=false;
  let sistX=0,sistY=0;
  function hentPos(e){
    const r=canvas.getBoundingClientRect();
    if(e.touches){
      return {x:e.touches[0].clientX-r.left,y:e.touches[0].clientY-r.top};
    }
    return {x:e.clientX-r.left,y:e.clientY-r.top};
  }
  function start(e){
    e.preventDefault();
    tegner=true;
    const p=hentPos(e);
    sistX=p.x;sistY=p.y;
    document.getElementById('signaturPlaceholder').style.display='none';
  }
  function beveg(e){
    if(!tegner)return;
    e.preventDefault();
    const p=hentPos(e);
    ctx.beginPath();
    ctx.moveTo(sistX,sistY);
    ctx.lineTo(p.x,p.y);
    ctx.stroke();
    sistX=p.x;sistY=p.y;
    signaturHarTegning=true;
  }
  function stopp(e){
    if(e)e.preventDefault();
    tegner=false;
  }
  canvas.addEventListener('mousedown',start);
  canvas.addEventListener('mousemove',beveg);
  canvas.addEventListener('mouseup',stopp);
  canvas.addEventListener('mouseleave',stopp);
  canvas.addEventListener('touchstart',start,{passive:false});
  canvas.addEventListener('touchmove',beveg,{passive:false});
  canvas.addEventListener('touchend',stopp,{passive:false});
}

function nullstillSignatur(){
  const canvas=document.getElementById('signaturCanvas');
  if(canvas){
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  const ph=document.getElementById('signaturPlaceholder');
  if(ph)ph.style.display='flex';
  signaturHarTegning=false;
}

function avbrytSignatur(){
  const m=document.getElementById('signaturModal');
  if(m)m.remove();
}

function godkjennSignatur(navn){
  if(!signaturHarTegning){alert('Tegn signaturen din først.');return;}
  const canvas=document.getElementById('signaturCanvas');
  const signaturBilde=canvas.toDataURL('image/png');
  const innloggetBruker=window.KBAuth.employee?.name||'Ukjent';
  const erSegSelv=navn.toLowerCase()===innloggetBruker.toLowerCase();
  sjaSignaturer=sjaSignaturer.filter(s=>s.navn.toLowerCase()!==navn.toLowerCase());
  sjaSignaturer.push({
    navn,
    signert_dato:new Date().toISOString(),
    ip_bruker:innloggetBruker,
    signert_av_annen:erSegSelv?null:innloggetBruker,
    bilde:signaturBilde
  });
  const m=document.getElementById('signaturModal');
  if(m)m.remove();
  byggSignaturListe();
}

function fjernSignatur(navn){
  if(!confirm('Fjerne signaturen til '+navn+'?'))return;
  sjaSignaturer=sjaSignaturer.filter(s=>s.navn.toLowerCase()!==navn.toLowerCase());
  byggSignaturListe();
}

function nySja(){
  redigerSjaId=null;
  sjaSignaturer=[];
  document.getElementById('sja-tittel').textContent='Ny SJA';
  document.getElementById('sja-slett-btn').style.display='none';
  document.getElementById('sja-dato').value=new Date().toISOString().slice(0,10);
  document.getElementById('sja-sted').value='';
  document.getElementById('sja-prosjekt').value='';
  document.getElementById('sja-deltakere').value='';
  document.querySelectorAll('[data-fast-deltaker]').forEach(c=>{c.checked=c.dataset.fastDeltaker===hentBruker();});
  sjaFritekstDeltakere=[];
  const nyftEl=document.getElementById('sja-deltakere-nyfritekst');if(nyftEl)nyftEl.value='';
  oppdaterDeltakere();
  document.getElementById('sja-beskrivelse').value='';
  document.getElementById('sja-ppe').value='';
  document.querySelectorAll('[data-pvu]').forEach(c=>c.checked=false);
  document.getElementById('sja-status').value='utkast';
  document.getElementById('sja-godkjent-av').value='';
  document.getElementById('sja-farer-liste').innerHTML='';
  if(typeof nullstillFareKnapper==='function')nullstillFareKnapper();
  leggTilFare();
  byggSignaturListe();
  document.getElementById('sja-skjema').classList.remove('hidden');
  document.getElementById('sja-skjema').scrollIntoView({behavior:'smooth',block:'start'});
  if(typeof aktiverAdresseSokHMS==='function')setTimeout(aktiverAdresseSokHMS,100);
}

function risikoNiva(s,k){
  if(!s||!k)return null;
  if(s==='hoy'&&k==='hoy')return 'rod';
  if(s==='middels'&&k==='hoy')return 'rod';
  if(s==='hoy'&&k==='middels')return 'rod';
  if(s==='lav'&&k==='hoy')return 'gul';
  if(s==='middels'&&k==='middels')return 'gul';
  if(s==='hoy'&&k==='lav')return 'gul';
  return 'gronn';
}

function oppdaterRisikoBadge(radElement){
  const s=radElement.querySelector('[data-felt="sannsynlighet"]')?.value;
  const k=radElement.querySelector('[data-felt="konsekvens"]')?.value;
  const niva=risikoNiva(s,k);
  let badge=radElement.querySelector('.risiko-badge');
  if(!badge){
    badge=document.createElement('div');
    badge.className='risiko-badge';
    badge.style.cssText='grid-column:1/-1;text-align:center;padding:6px;font-weight:700;font-size:12px;border-radius:5px;margin-top:4px;letter-spacing:0.5px;text-transform:uppercase';
    radElement.appendChild(badge);
  }
  if(niva==='rod'){badge.textContent='🛑 RØD – STOPP';badge.style.background='#fee2e2';badge.style.color='#991b1b';}
  else if(niva==='gul'){badge.textContent='⚠ GUL – tiltak kreves';badge.style.background='#fef3c7';badge.style.color='#92400e';}
  else if(niva==='gronn'){badge.textContent='✓ GRØNN – aksept';badge.style.background='#dcfce7';badge.style.color='#15803d';}
  else badge.textContent='';
}

function leggTilFare(data){
  const wrap=document.getElementById('sja-farer-liste');
  const div=document.createElement('div');
  div.className='fare-rad';
  div.innerHTML=`
    <input type="text" placeholder="Fare (f.eks. fall fra høyde)" value="${data?.fare||''}" data-felt="fare">
    <select data-felt="sannsynlighet">
      <option value="lav" ${data?.sannsynlighet==='lav'?'selected':''}>Lav sannsynlighet</option>
      <option value="middels" ${data?.sannsynlighet==='middels'?'selected':''}>Middels sannsynlighet</option>
      <option value="hoy" ${data?.sannsynlighet==='hoy'?'selected':''}>Høy sannsynlighet</option>
    </select>
    <select data-felt="konsekvens">
      <option value="lav" ${data?.konsekvens==='lav'?'selected':''}>Lav konsekvens</option>
      <option value="middels" ${data?.konsekvens==='middels'?'selected':''}>Middels konsekvens</option>
      <option value="hoy" ${data?.konsekvens==='hoy'?'selected':''}>Høy konsekvens</option>
    </select>
    <textarea placeholder="Tiltak for å redusere risiko" data-felt="tiltak">${data?.tiltak||''}</textarea>
    <button class="btn btn-danger btn-sm" onclick="slettFareRad(this)" title="Fjern denne faren" style="min-width:70px">✕ Slett</button>`;
  wrap.appendChild(div);
  oppdaterRisikoBadge(div);
  div.querySelectorAll('[data-felt="sannsynlighet"],[data-felt="konsekvens"]').forEach(el=>{
    el.addEventListener('change',()=>oppdaterRisikoBadge(div));
  });
}

function leggTilStandardFare(type,knapp){
  const _prevKnapp=knapp;
  const standardFarer={
    hoyde:{fare:'Arbeid i høyden (>2m)',sannsynlighet:'middels',konsekvens:'hoy',tiltak:'Stillas eller godkjent stige. Personlig fallsikring ved arbeid over 2m. Sjekk at festepunkt tåler belastning.',pvu:['hjelm','fallsikring','hansker','sko']},
    varme:{fare:'Varme arbeider (sliping, sveising, lodding)',sannsynlighet:'middels',konsekvens:'hoy',tiltak:'Brannvakt min 60 min etter avsluttet arbeid. Brannslukker tilgjengelig. Fjern brennbart materiale i 1m radius. Tildekk det som ikke kan fjernes.',pvu:['briller','hansker','sko','maske']},
    strom:{fare:'Elektrisk strøm – berøring/kortslutning',sannsynlighet:'lav',konsekvens:'hoy',tiltak:'Vi er IKKE autorisert elektriker. Arbeid på fast installasjon må gjøres av elektriker. Hovedstrøm kobles ut og sikres før vi starter arbeid i bad/våtrom. Hold kabler tørre.',pvu:['sko','hansker']},
    loft:{fare:'Tunge løft – belastningsskade rygg',sannsynlighet:'middels',konsekvens:'middels',tiltak:'Bruk hjelpemiddel (sekketralle, løfteanordning). Løft i to. Bøy i knærne, hold rett rygg. Maksimal anbefalt enmannsløft: 25 kg.',pvu:['hansker','sko']},
    fallende:{fare:'Fallende verktøy/materialer',sannsynlighet:'middels',konsekvens:'middels',tiltak:'Hjelm påbudt. Sikre verktøy med snor ved arbeid i høyden. Sperret område under arbeid på tak. Bruk bøtte/sekk for å sende verktøy og materialer trygt ned, aldri slipp.',pvu:['hjelm','sko','briller']},
    trange:{fare:'Trange rom (kryperom, kjeller, tank)',sannsynlighet:'lav',konsekvens:'hoy',tiltak:'Gassmåler før inngang (CO, CO2, O2). Sikker kommunikasjon ut. Person utenfor som kan tilkalle hjelp. Rømningsvei sikret.',pvu:['hjelm','maske','sko','hansker']},
    stov:{fare:'Støv og kjemikalier ved arbeid',sannsynlighet:'middels',konsekvens:'middels',tiltak:'Åndedrettsvern (P2/P3). Beskyttelsesbriller. Ventilasjon eller arbeid utendørs. SDS lest for kjemikalier.',pvu:['maske','briller','hansker','dress']},
    verktoy:{fare:'Skade fra maskiner/verktøy (sirkelsag, vinkelsliper)',sannsynlighet:'middels',konsekvens:'hoy',tiltak:'Hansker, briller, hørselsvern. Sjekk verktøy før bruk. Bryterstein og deksel på plass. Konsentrasjon – ingen distraksjoner.',pvu:['hansker','briller','horsel','sko']},
    asbest:{fare:'Mulig asbest eller andre farlige stoffer',sannsynlighet:'lav',konsekvens:'hoy',tiltak:'STOPP arbeid hvis mistanke om asbest. Få profesjonell prøvetaking. Hvis kjent: P3-filter, engangsdrakt, sertifisert håndtering. Bygg fra før 1985 = ekstra varsomhet.',pvu:['maske','dress','hansker','briller']},
    vann:{fare:'Vannskade-risiko ved feil utførelse',sannsynlighet:'lav',konsekvens:'hoy',tiltak:'Steng vann ved hovedkran før jobb. Trykktest membran og rør før skjuling. Foto av membran/skjult opplegg. Bløtfuge i overganger.',pvu:['hansker','sko']}
  };
  const data=standardFarer[type];
  if(!data)return;
  leggTilFare(data);
  // Merk raden med type så vi kan gjenåpne knappen ved sletting
  const farer=document.querySelectorAll('#sja-farer-liste .fare-rad');
  const sisteFare=farer[farer.length-1];
  if(sisteFare)sisteFare.dataset.fareType=type;
  // Auto-huk PVU-checkboxer
  if(data.pvu){
    data.pvu.forEach(p=>{
      const cb=document.querySelector('[data-pvu="'+p+'"]');
      if(cb && !cb.checked)cb.checked=true;
    });
  }
  // Marker knappen som "lagt til"
  if(knapp){
    knapp.style.background='#dcfce7';
    knapp.style.borderColor='#86efac';
    knapp.style.color='#15803d';
    knapp.style.fontWeight='700';
    // Legg til checkmark hvis ikke allerede der
    if(!knapp.textContent.startsWith('✓')){
      knapp.textContent='✓ '+knapp.textContent;
    }
  }
}

function nullstillFareKnapper(){
  document.querySelectorAll('.fare-knapp').forEach(k=>{
    k.style.background='';
    k.style.borderColor='';
    k.style.color='';
    k.style.fontWeight='';
    k.textContent=k.textContent.replace(/^✓\s*/,'');
  });
}

function slettFareRad(btn){
  const rad=btn.closest('.fare-rad');
  if(!rad)return;
  const type=rad.dataset.fareType;
  rad.remove();
  // Hvis raden var laget fra en standard-knapp, tilbakestill den
  if(type){
    const knapp=document.querySelector('.fare-knapp[data-fare="'+type+'"]');
    if(knapp){
      knapp.style.background='';
      knapp.style.borderColor='';
      knapp.style.color='';
      knapp.style.fontWeight='';
      knapp.textContent=knapp.textContent.replace(/^✓\s*/,'');
    }
  }
}

function lesFarer(){
  const farer=[];
  document.querySelectorAll('#sja-farer-liste .fare-rad').forEach(r=>{
    const obj={};
    r.querySelectorAll('[data-felt]').forEach(el=>{obj[el.dataset.felt]=el.value;});
    if(obj.fare?.trim())farer.push(obj);
  });
  return farer;
}

async function lagreSja(){
  if(!sb){alert('Sky ikke tilkoblet');return;}
  const dato=document.getElementById('sja-dato').value;
  if(!dato){alert('Dato må fylles inn');return;}
  const data={
    id:redigerSjaId||Date.now().toString(),
    dato,
    sted:document.getElementById('sja-sted').value.trim(),
    prosjekt:document.getElementById('sja-prosjekt').value.trim(),
    deltakere:document.getElementById('sja-deltakere').value.trim(),
    arbeidsbeskrivelse:document.getElementById('sja-beskrivelse').value.trim(),
    farer:lesFarer(),
    signaturer:sjaSignaturer,
    ppe:(function(){
      const valgt=Array.from(document.querySelectorAll('[data-pvu]:checked')).map(c=>c.dataset.pvu);
      const labels={hjelm:'Hjelm',briller:'Vernebriller',horsel:'Hørselsvern',hansker:'Hansker',sko:'Vernesko',maske:'Åndedrettsvern',fallsikring:'Fallsikring',refleks:'Refleksvest',dress:'Verne-/engangsdrakt',knebeskytter:'Knebeskyttere'};
      const tekst=valgt.map(k=>labels[k]||k).join(', ');
      const annet=document.getElementById('sja-ppe').value.trim();
      return tekst+(annet?(tekst?' | Annet: '+annet:annet):'');
    })(),
    status:document.getElementById('sja-status').value,
    godkjent_av:document.getElementById('sja-godkjent-av').value.trim(),
    godkjent_dato:document.getElementById('sja-status').value==='godkjent'?new Date().toISOString().slice(0,10):null,
    opprettet_av:hentBruker(),
    oppdatert_dato:new Date().toISOString()
  };
  visStatus('Lagrer...','');
  const {error}=await sb.from('hms_sja').upsert(data);
  if(error){alert('Feil: '+error.message);visStatus('⚠ Feilet','feil');return;}
  visStatus('✓ Lagret','ok');
  lukkSjaSkjema();
  hentSja();
}

function lukkSjaSkjema(){
  document.getElementById('sja-skjema').classList.add('hidden');
  const pb=document.getElementById('sja-pdf-btn');if(pb)pb.style.display='none';
  redigerSjaId=null;
}

function redigerSja(id){
  const s=sjaListe.find(x=>x.id===id);if(!s)return;
  redigerSjaId=id;
  sjaSignaturer=s.signaturer||[];
  document.getElementById('sja-tittel').textContent='Rediger SJA';
  document.getElementById('sja-slett-btn').style.display='inline-flex';
  document.getElementById('sja-pdf-btn').style.display='inline-flex';
  document.getElementById('sja-dato').value=s.dato||'';
  document.getElementById('sja-sted').value=s.sted||'';
  document.getElementById('sja-prosjekt').value=s.prosjekt||'';
  (function(){
    const deltakereRaw=s.deltakere||'';
    document.getElementById('sja-deltakere').value=deltakereRaw;
    const alle=deltakereRaw.split(/[,;]/).map(x=>x.trim()).filter(Boolean);
    const faste=['Stephen','Eirik','Eivind'];
    document.querySelectorAll('[data-fast-deltaker]').forEach(c=>{
      c.checked=alle.some(a=>a.toLowerCase()===c.dataset.fastDeltaker.toLowerCase());
    });
    sjaFritekstDeltakere=alle.filter(a=>!faste.some(f=>f.toLowerCase()===a.toLowerCase()));
    byggFritekstListe();
    const ft=document.getElementById('sja-deltakere-fritekst');
    if(ft)ft.value=sjaFritekstDeltakere.join(', ');
  })();
  document.getElementById('sja-beskrivelse').value=s.arbeidsbeskrivelse||'';
  const fullPpe=s.ppe||'';
  const annetIdx=fullPpe.indexOf(' | Annet: ');
  let pvuTekst='',annetTekst='';
  if(annetIdx>=0){pvuTekst=fullPpe.slice(0,annetIdx);annetTekst=fullPpe.slice(annetIdx+10);}
  else if(fullPpe.split(',').every(t=>['Hjelm','Vernebriller','Hørselsvern','Hansker','Vernesko','Åndedrettsvern','Fallsikring','Refleksvest','Verne-/engangsdrakt','Knebeskyttere'].includes(t.trim()))){pvuTekst=fullPpe;}
  else{annetTekst=fullPpe;}
  document.getElementById('sja-ppe').value=annetTekst;
  const labels={Hjelm:'hjelm',Vernebriller:'briller',Hørselsvern:'horsel',Hansker:'hansker',Vernesko:'sko','Åndedrettsvern':'maske',Fallsikring:'fallsikring',Refleksvest:'refleks','Verne-/engangsdrakt':'dress',Knebeskyttere:'knebeskytter'};
  const pvuValgte=pvuTekst.split(',').map(t=>labels[t.trim()]).filter(Boolean);
  document.querySelectorAll('[data-pvu]').forEach(c=>{c.checked=pvuValgte.includes(c.dataset.pvu);});
  document.getElementById('sja-status').value=s.status||'utkast';
  document.getElementById('sja-godkjent-av').value=s.godkjent_av||'';
  document.getElementById('sja-farer-liste').innerHTML='';
  if(typeof nullstillFareKnapper==='function')nullstillFareKnapper();
  (s.farer||[]).forEach(f=>leggTilFare(f));
  if((s.farer||[]).length===0)leggTilFare();
  byggSignaturListe();
  document.getElementById('sja-skjema').classList.remove('hidden');
  document.getElementById('sja-skjema').scrollIntoView({behavior:'smooth',block:'start'});
  if(typeof aktiverAdresseSokHMS==='function')setTimeout(aktiverAdresseSokHMS,100);
}

async function slettSja(){
  if(!redigerSjaId)return;
  if(!confirm('Slette denne SJA permanent?'))return;
  await sb.from('hms_sja').delete().eq('id',redigerSjaId);
  lukkSjaSkjema();
  hentSja();
}

function renderSjaListe(){
  const sok=(document.getElementById('sja-sok')?.value||'').toLowerCase().trim();
  const liste=sjaListe.filter(s=>{
    if(!sok)return true;
    return (s.prosjekt||'').toLowerCase().includes(sok)||(s.sted||'').toLowerCase().includes(sok)||(s.dato||'').includes(sok);
  });
  const el=document.getElementById('sja-liste');
  if(liste.length===0){el.innerHTML='<div class="empty-state">Ingen SJA-er ennå. Klikk <strong>+ Ny SJA</strong> for å starte.</div>';return;}
  el.innerHTML=liste.map(s=>`
    <div class="liste-rad" onclick="redigerSja('${s.id}')">
      <div class="liste-rad-info">
        <div class="liste-rad-tittel">${escapeHtml(s.prosjekt||'(uten navn)')}</div>
        <div class="liste-rad-meta">${escapeHtml(s.sted||'-')} · ${formaterDato(s.dato)} · ${escapeHtml(s.deltakere||'-')} · ${(s.farer||[]).length} farer</div>
      </div>
      <div class="liste-rad-handlinger">
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();pdfSja('${s.id}')" title="Last ned PDF">📄</button><span class="tag tag-${s.status||'utkast'}">${s.status==='godkjent'?'Godkjent':'Utkast'}</span>
      </div>
    </div>`).join('');
}

// ============================================
// AVVIK
// ============================================
function nyttAvvik(){
  redigerAvvikId=null;
  document.getElementById('avvik-tittel').textContent='Nytt avvik';
  document.getElementById('avvik-slett-btn').style.display='none';
  document.getElementById('avvik-dato').value=new Date().toISOString().slice(0,10);
  document.getElementById('avvik-melder').value=hentBruker();
  document.getElementById('avvik-sted').value='';
  document.getElementById('avvik-prosjekt').value='';
  document.getElementById('avvik-type').value='annet';
  document.getElementById('avvik-alvor').value='lav';
  document.getElementById('avvik-beskrivelse').value='';
  document.getElementById('avvik-umiddelbart').value='';
  document.getElementById('avvik-permanente').value='';
  avvikBildeListe=[];renderAvvikBilder();
  const sEl=document.getElementById('avvik-opplasting-status');if(sEl)sEl.textContent='';
  document.getElementById('avvik-ansvarlig').value='';
  document.getElementById('avvik-status').value='apen';
  const fristEl=document.getElementById('avvik-frist');if(fristEl){const d=new Date();d.setDate(d.getDate()+14);fristEl.value=d.toISOString().slice(0,10);}
  const psEl=document.getElementById('avvik-personskade');if(psEl)psEl.value='nei';
  document.getElementById('avvik-skjema').classList.remove('hidden');
  document.getElementById('avvik-skjema').scrollIntoView({behavior:'smooth',block:'start'});
  if(typeof aktiverAdresseSokHMS==='function')setTimeout(aktiverAdresseSokHMS,100);
}

async function lagreAvvik(){
  if(!sb){alert('Sky ikke tilkoblet');return;}
  const dato=document.getElementById('avvik-dato').value;
  if(!dato){alert('Dato må fylles inn');return;}
  const status=document.getElementById('avvik-status').value;
  const data={
    id:redigerAvvikId||Date.now().toString(),
    dato,
    melder:document.getElementById('avvik-melder').value.trim()||hentBruker(),
    sted:document.getElementById('avvik-sted').value.trim(),
    prosjekt:document.getElementById('avvik-prosjekt').value.trim(),
    type:document.getElementById('avvik-type').value,
    alvorlighet:document.getElementById('avvik-alvor').value,
    beskrivelse:document.getElementById('avvik-beskrivelse').value.trim(),
    umiddelbart_tiltak:document.getElementById('avvik-umiddelbart').value.trim(),
    permanente_tiltak:document.getElementById('avvik-permanente').value.trim(),
    bilder:avvikBildeListe,
    ansvarlig:document.getElementById('avvik-ansvarlig').value.trim(),
    frist:document.getElementById('avvik-frist')?.value||null,
    personskade:document.getElementById('avvik-personskade')?.value||'nei',
    status,
    lukket_dato:status==='lukket'?new Date().toISOString().slice(0,10):null,
    lukket_av:status==='lukket'?hentBruker():null
  };
  visStatus('Lagrer...','');
  const {error}=await sb.from('hms_avvik').upsert(data);
  if(error){alert('Feil: '+error.message);visStatus('⚠ Feilet','feil');return;}
  visStatus('✓ Lagret','ok');
  lukkAvvikSkjema();
  hentAvvik();
}

function lukkAvvikSkjema(){document.getElementById('avvik-skjema').classList.add('hidden');redigerAvvikId=null;}

function redigerAvvik(id){
  const a=avvikListe.find(x=>x.id===id);if(!a)return;
  redigerAvvikId=id;
  document.getElementById('avvik-tittel').textContent='Rediger avvik';
  document.getElementById('avvik-slett-btn').style.display='inline-flex';
  document.getElementById('avvik-dato').value=a.dato||'';
  document.getElementById('avvik-melder').value=a.melder||'';
  document.getElementById('avvik-sted').value=a.sted||'';
  document.getElementById('avvik-prosjekt').value=a.prosjekt||'';
  document.getElementById('avvik-type').value=a.type||'annet';
  document.getElementById('avvik-alvor').value=a.alvorlighet||'lav';
  document.getElementById('avvik-beskrivelse').value=a.beskrivelse||'';
  document.getElementById('avvik-umiddelbart').value=a.umiddelbart_tiltak||'';
  document.getElementById('avvik-permanente').value=a.permanente_tiltak||'';
  avvikBildeListe=a.bilder||[];renderAvvikBilder();
  document.getElementById('avvik-ansvarlig').value=a.ansvarlig||'';
  document.getElementById('avvik-status').value=a.status||'apen';
  const fEl=document.getElementById('avvik-frist');if(fEl)fEl.value=a.frist||'';
  const pEl=document.getElementById('avvik-personskade');if(pEl)pEl.value=a.personskade||'nei';
  document.getElementById('avvik-skjema').classList.remove('hidden');
  document.getElementById('avvik-skjema').scrollIntoView({behavior:'smooth',block:'start'});
}

async function slettAvvik(){
  if(!redigerAvvikId)return;
  if(!confirm('Slette dette avviket permanent?'))return;
  await sb.from('hms_avvik').delete().eq('id',redigerAvvikId);
  lukkAvvikSkjema();
  hentAvvik();
}

function renderAvvikListe(){
  const sok=(document.getElementById('avvik-sok')?.value||'').toLowerCase().trim();
  const liste=avvikListe.filter(a=>{
    if(!sok)return true;
    return (a.beskrivelse||'').toLowerCase().includes(sok)||(a.sted||'').toLowerCase().includes(sok)||(a.prosjekt||'').toLowerCase().includes(sok);
  });
  const el=document.getElementById('avvik-liste');
  if(liste.length===0){el.innerHTML='<div class="empty-state">Ingen avvik registrert. Klikk <strong>+ Nytt avvik</strong> for å registrere.</div>';return;}
  const typeLabels={ulykke:'Ulykke',naestenulykke:'Nestenulykke',kvalitet:'Kvalitet',miljo:'Miljø',annet:'Annet'};
  el.innerHTML=liste.map(a=>`
    <div class="liste-rad" onclick="redigerAvvik('${a.id}')">
      <div class="liste-rad-info">
        <div class="liste-rad-tittel">${escapeHtml((a.beskrivelse||'(uten beskrivelse)').slice(0,80))}${(a.beskrivelse||'').length>80?'...':''}</div>
        <div class="liste-rad-meta">${typeLabels[a.type]||'Annet'} · ${escapeHtml(a.sted||'-')} · ${formaterDato(a.dato)} · ${escapeHtml(a.melder||'-')}</div>
      </div>
      <div class="liste-rad-handlinger">
        <span class="tag tag-${a.alvorlighet||'lav'}">${a.alvorlighet||'lav'}</span>
        ${(a.bilder&&a.bilder.length>0)?`<span class="btn btn-outline btn-sm" style="text-decoration:none;cursor:default">📷 ${a.bilder.length}</span>`:''}<button class="btn btn-outline btn-sm" onclick="event.stopPropagation();pdfAvvik('${a.id}')" title="Last ned PDF">📄</button><span class="tag tag-${a.status||'apen'}">${a.status==='lukket'?'Lukket':a.status==='behandling'?'Behandling':'Åpen'}</span>
      </div>
    </div>`).join('');
}

// ============================================
// VERNERUNDE
// ============================================
function nyVernerunde(){
  redigerVrId=null;
  document.getElementById('vr-tittel').textContent='Ny vernerunde';
  document.getElementById('vr-slett-btn').style.display='none';
  document.getElementById('vr-dato').value=new Date().toISOString().slice(0,10);
  document.getElementById('vr-lokasjon').value='';
  const typeEl=document.getElementById('vr-type');if(typeEl){const d=new Date();typeEl.value=d.getDay()===1?'Mandagssjekk':'Vanlig vernerunde';oppdaterVrTypeInfo();}
  document.getElementById('vr-utfort').value=hentBruker();
  document.getElementById('vr-deltakere').value='';
  document.getElementById('vr-funn').value='';
  document.getElementById('vr-tiltak').value='';
  document.getElementById('vr-status').value='utkast';
  byggVrSjekkliste({});
  document.getElementById('vr-skjema').classList.remove('hidden');
  document.getElementById('vr-skjema').scrollIntoView({behavior:'smooth',block:'start'});
  if(typeof aktiverAdresseSokHMS==='function')setTimeout(aktiverAdresseSokHMS,100);
}

function oppdaterVrTypeInfo(){
  const type=document.getElementById('vr-type')?.value;
  const el=document.getElementById('vr-type-info');
  if(el)el.textContent=VR_TYPER[type]||'';
}

function byggVrSjekkliste(data){
  const wrap=document.getElementById('vr-sjekkliste');
  wrap.innerHTML=VR_SJEKKPUNKTER.map(p=>{
    const v=data[p]||'ok';
    return `<div style="display:grid;grid-template-columns:1fr 200px;gap:8px;padding:8px;background:#f9fbfd;border:1px solid var(--border);border-radius:6px;margin-bottom:6px;align-items:center">
      <label style="margin:0">${p}</label>
      <select data-vrp="${p}">
        <option value="ok" ${v==='ok'?'selected':''}>OK</option>
        <option value="anmerkning" ${v==='anmerkning'?'selected':''}>Anmerkning</option>
        <option value="avvik" ${v==='avvik'?'selected':''}>Avvik</option>
        <option value="ikke_aktuelt" ${v==='ikke_aktuelt'?'selected':''}>Ikke aktuelt</option>
      </select>
    </div>`;
  }).join('');
}

function lesSjekkpunkter(){
  const obj={};
  document.querySelectorAll('[data-vrp]').forEach(el=>{obj[el.dataset.vrp]=el.value;});
  return obj;
}

async function lagreVr(){
  if(!sb){alert('Sky ikke tilkoblet');return;}
  const dato=document.getElementById('vr-dato').value;
  if(!dato){alert('Dato må fylles inn');return;}
  const data={
    id:redigerVrId||Date.now().toString(),
    dato,
    lokasjon:document.getElementById('vr-lokasjon').value.trim()+(document.getElementById('vr-type')?.value?' ('+document.getElementById('vr-type').value+')':''),
    utfort_av:document.getElementById('vr-utfort').value.trim()||hentBruker(),
    deltakere:document.getElementById('vr-deltakere').value.trim(),
    sjekkpunkter:lesSjekkpunkter(),
    funn:document.getElementById('vr-funn').value.trim(),
    tiltak:document.getElementById('vr-tiltak').value.trim(),
    status:document.getElementById('vr-status').value
  };
  visStatus('Lagrer...','');
  const {error}=await sb.from('hms_vernerunde').upsert(data);
  if(error){alert('Feil: '+error.message);visStatus('⚠ Feilet','feil');return;}
  visStatus('✓ Lagret','ok');
  lukkVrSkjema();
  hentVernerunde();
}

function lukkVrSkjema(){document.getElementById('vr-skjema').classList.add('hidden');redigerVrId=null;}

function redigerVr(id){
  const v=vrListe.find(x=>x.id===id);if(!v)return;
  redigerVrId=id;
  document.getElementById('vr-tittel').textContent='Rediger vernerunde';
  document.getElementById('vr-slett-btn').style.display='inline-flex';
  document.getElementById('vr-dato').value=v.dato||'';
  document.getElementById('vr-lokasjon').value=v.lokasjon||'';
  document.getElementById('vr-utfort').value=v.utfort_av||'';
  document.getElementById('vr-deltakere').value=v.deltakere||'';
  document.getElementById('vr-funn').value=v.funn||'';
  document.getElementById('vr-tiltak').value=v.tiltak||'';
  document.getElementById('vr-status').value=v.status||'utkast';
  byggVrSjekkliste(v.sjekkpunkter||{});
  document.getElementById('vr-skjema').classList.remove('hidden');
  document.getElementById('vr-skjema').scrollIntoView({behavior:'smooth',block:'start'});
  if(typeof aktiverAdresseSokHMS==='function')setTimeout(aktiverAdresseSokHMS,100);
}

async function slettVr(){
  if(!redigerVrId)return;
  if(!confirm('Slette denne vernerunden permanent?'))return;
  await sb.from('hms_vernerunde').delete().eq('id',redigerVrId);
  lukkVrSkjema();
  hentVernerunde();
}

function renderVernerundeListe(){
  const sok=(document.getElementById('vr-sok')?.value||'').toLowerCase().trim();
  const liste=vrListe.filter(v=>{
    if(!sok)return true;
    return (v.lokasjon||'').toLowerCase().includes(sok)||(v.funn||'').toLowerCase().includes(sok)||(v.dato||'').includes(sok);
  });
  const el=document.getElementById('vr-liste');
  if(liste.length===0){el.innerHTML='<div class="empty-state">Ingen vernerunder ennå. Klikk <strong>+ Ny vernerunde</strong> for å starte.</div>';return;}
  el.innerHTML=liste.map(v=>{
    const sj=v.sjekkpunkter||{};
    const avvik=Object.values(sj).filter(x=>x==='avvik').length;
    return `<div class="liste-rad" onclick="redigerVr('${v.id}')">
      <div class="liste-rad-info">
        <div class="liste-rad-tittel">${escapeHtml(v.lokasjon||'(uten lokasjon)')}</div>
        <div class="liste-rad-meta">${formaterDato(v.dato)} · ${escapeHtml(v.utfort_av||'-')} · ${avvik>0?avvik+' avvik':'ingen avvik'}</div>
      </div>
      <div class="liste-rad-handlinger">
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();pdfVernerunde('${v.id}')" title="Last ned PDF">📄</button><span class="tag tag-${v.status||'utkast'}">${v.status==='lukket'?'Lukket':v.status==='pagar'?'Pågår':'Utkast'}</span>
      </div>
    </div>`;
  }).join('');
}

// ============================================
// STOFFKARTOTEK
// ============================================
function nyttStoff(){
  window.KBStoff.prepare(null);
  redigerStoffId=null;
  document.getElementById('stoff-tittel').textContent='Nytt stoff';
  document.getElementById('stoff-slett-btn').style.display='none';
  ['stoff-navn','stoff-leverandor','stoff-sds','stoff-farer','stoff-lagring','stoff-ppe','stoff-notater'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('stoff-skjema').classList.remove('hidden');
  document.getElementById('stoff-skjema').scrollIntoView({behavior:'smooth',block:'start'});
}

async function lagreStoff(){
  if(!sb){alert('Sky ikke tilkoblet');return;}
  const navn=document.getElementById('stoff-navn').value.trim();
  if(!navn){alert('Stoffnavn må fylles inn');return;}
  if(!window.KBStoff.validLink(document.getElementById('stoff-sds').value.trim())){alert('Bruk en gyldig HTTPS-lenke til databladet.');return;}
  const data={
    ...window.KBStoff.values(),
    id:redigerStoffId||Date.now().toString(),
    navn,
    leverandor:document.getElementById('stoff-leverandor').value.trim(),
    sds_lenke:document.getElementById('stoff-sds').value.trim(),
    farer:document.getElementById('stoff-farer').value.trim(),
    lagring:document.getElementById('stoff-lagring').value.trim(),
    ppe:document.getElementById('stoff-ppe').value.trim(),
    notater:document.getElementById('stoff-notater').value.trim()
  };
  visStatus('Lagrer...','');
  const {error}=await sb.from('hms_stoffer').upsert(data);
  if(error){alert('Feil: '+error.message);visStatus('⚠ Feilet','feil');return;}
  visStatus('✓ Lagret','ok');
  lukkStoffSkjema();
  hentStoffer();
}

function lukkStoffSkjema(){document.getElementById('stoff-skjema').classList.add('hidden');redigerStoffId=null;}

function redigerStoff(id){
  const s=stoffListe.find(x=>x.id===id);if(!s)return;
  redigerStoffId=id;
  window.KBStoff.prepare(s);
  document.getElementById('stoff-tittel').textContent='Rediger stoff';
  document.getElementById('stoff-slett-btn').style.display='inline-flex';
  document.getElementById('stoff-navn').value=s.navn||'';
  document.getElementById('stoff-leverandor').value=s.leverandor||'';
  document.getElementById('stoff-sds').value=s.sds_lenke||'';
  document.getElementById('stoff-farer').value=s.farer||'';
  document.getElementById('stoff-lagring').value=s.lagring||'';
  document.getElementById('stoff-ppe').value=s.ppe||'';
  document.getElementById('stoff-notater').value=s.notater||'';
  document.getElementById('stoff-skjema').classList.remove('hidden');
  document.getElementById('stoff-skjema').scrollIntoView({behavior:'smooth',block:'start'});
}

async function slettStoff(){
  if(!redigerStoffId)return;
  if(!confirm('Slette dette stoffet permanent?'))return;
  await sb.from('hms_stoffer').delete().eq('id',redigerStoffId);
  lukkStoffSkjema();
  hentStoffer();
}

function renderStoffListe(){
  const sok=(document.getElementById('stoff-sok')?.value||'').toLowerCase().trim();
  const liste=stoffListe.filter(s=>{
    if(!sok)return true;
    return (s.navn||'').toLowerCase().includes(sok)||(s.leverandor||'').toLowerCase().includes(sok)||(s.farer||'').toLowerCase().includes(sok);
  });
  const el=document.getElementById('stoff-liste');
  if(liste.length===0){el.innerHTML='<div class="empty-state">Ingen stoffer registrert. Klikk <strong>+ Nytt stoff</strong> for å legge til.</div>';return;}
  el.replaceChildren();
  liste.forEach(s=>{
    const row=document.createElement('button');row.type='button';row.className='liste-rad';row.style.cssText='width:100%;text-align:left;color:inherit;font:inherit';
    const info=document.createElement('span'),title=document.createElement('strong'),meta=document.createElement('span');
    title.textContent=s.navn;meta.textContent=(s.leverandor||'-')+' · '+(s.farer||'').slice(0,100);meta.style.cssText='display:block;font-size:13px;margin-top:6px';info.append(title,meta);
    const action=document.createElement('span');action.textContent='Les mer →';row.append(info,action);row.onclick=()=>visStoff(s.id);el.append(row);
  });
}

// ============================================
// HJELPERE
// ============================================
function escapeHtml(s){if(!s)return '';return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}
function formaterDato(d){if(!d)return '-';try{return new Date(d).toLocaleDateString('nb-NO');}catch(e){return d;}}

// ============================================
// INIT
// ============================================
if((window.KBAuth.employee ? '1' : null)==='1'){
  visApp();
} else {
  setTimeout(()=>document.getElementById('pwd-input').focus(),100);
}



// =========================================
// BILDE-OPPLASTING for avvik
// =========================================
const AVVIK_BUCKET='avvik-bilder';
let avvikBildeListe=[]; // URLs av opplastede bilder for aktivt avvik

async function lastOppAvvikBilder(event){
  const filer=event.target.files;
  if(!filer||!filer.length)return;
  const status=document.getElementById('avvik-opplasting-status');
  for(let i=0;i<filer.length;i++){
    const fil=filer[i];
    status.textContent=`Laster opp ${i+1}/${filer.length}...`;
    status.style.color='#1a3a5c';
    try{
      const komprimert=await komprimerBilde(fil);
      const filnavn=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
      const {data,error}=await sb.storage.from(AVVIK_BUCKET).upload(filnavn,komprimert,{contentType:'image/jpeg',upsert:false});
      if(error)throw error;
      const {data:urlData}=sb.storage.from(AVVIK_BUCKET).getPublicUrl(filnavn);
      avvikBildeListe.push({url:urlData.publicUrl,sti:filnavn,opplastet:new Date().toISOString(),av:hentBruker()});
      renderAvvikBilder();
    }catch(e){
      console.error(e);
      status.textContent='⚠ Feil: '+e.message;
      status.style.color='var(--danger)';
      return;
    }
  }
  status.textContent=`✓ ${filer.length} bilde${filer.length>1?'r':''} lastet opp`;
  status.style.color='var(--success)';
  setTimeout(()=>{if(status.textContent.startsWith('✓'))status.textContent='';},3000);
  event.target.value='';
}

function komprimerBilde(fil){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{
      const maks=1920;
      let b=img.width,h=img.height;
      if(b>maks||h>maks){
        if(b>h){h=Math.round(h*maks/b);b=maks;}
        else{b=Math.round(b*maks/h);h=maks;}
      }
      const c=document.createElement('canvas');
      c.width=b;c.height=h;
      c.getContext('2d').drawImage(img,0,0,b,h);
      c.toBlob(blob=>{
        if(blob)resolve(blob);else reject(new Error('Komprimering feilet'));
      },'image/jpeg',0.85);
    };
    img.onerror=()=>reject(new Error('Kunne ikke lese bilde'));
    img.src=URL.createObjectURL(fil);
  });
}

function renderAvvikBilder(){
  const el=document.getElementById('avvik-bilde-galleri');
  if(!el)return;
  if(avvikBildeListe.length===0){el.innerHTML='';return;}
  el.innerHTML=avvikBildeListe.map((b,i)=>`
    <div style="position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;border:1px solid var(--border);background:#000">
      <img src="${escapeHtml(b.url)}" alt="" style="width:100%;height:100%;object-fit:cover;cursor:pointer" onclick="visAvvikBildeFullskjerm('${escapeHtml(b.url)}')">
      <button onclick="slettAvvikBilde(${i})" style="position:absolute;top:4px;right:4px;background:rgba(220,38,38,0.95);color:#fff;border:none;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center" title="Slett bilde">×</button>
    </div>`).join('');
}

function visAvvikBildeFullskjerm(url){
  const d=document.createElement('div');
  d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;cursor:pointer';
  d.innerHTML=`<img src="${url}" style="max-width:100%;max-height:100%;object-fit:contain">`;
  d.onclick=()=>d.remove();
  document.body.appendChild(d);
}

async function slettAvvikBilde(idx){
  if(!confirm('Slette dette bildet?'))return;
  const b=avvikBildeListe[idx];
  if(b.sti){
    try{ await sb.storage.from(AVVIK_BUCKET).remove([b.sti]); }catch(e){console.error(e);}
  }
  avvikBildeListe.splice(idx,1);
  renderAvvikBilder();
}


// =========================================
// PDF-EKSPORT
// =========================================
const KB_LOGO_HTML='<svg width="56" height="56" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="14" fill="#1a3a5c"/><text x="50" y="65" font-family="Arial" font-size="42" font-weight="800" text-anchor="middle" fill="#e8a317">KB</text></svg>';

function pdfTopp(tittel,undertittel){
  return `<div style="display:flex;align-items:center;gap:14px;border-bottom:2px solid #1a3a5c;padding-bottom:12px;margin-bottom:18px">
    ${KB_LOGO_HTML}
    <div style="flex:1">
      <h1 style="font-size:20px;margin:0;color:#1a3a5c">Komplett Byggdrift AS</h1>
      <p style="font-size:12px;color:#666;margin:2px 0 0">${undertittel}</p>
    </div>
    <div style="text-align:right;font-size:11px;color:#666">
      <div>Generert: ${new Date().toLocaleString('nb-NO')}</div>
      <div>Av: ${escapeHtml(hentBruker())}</div>
    </div>
  </div>
  <h2 style="color:#1a3a5c;font-size:24px;margin-bottom:14px">${tittel}</h2>`;
}

function pdfFelt(label,verdi){
  if(!verdi)return '';
  return `<div style="margin-bottom:8px"><strong style="color:#1a3a5c">${label}:</strong> ${escapeHtml(String(verdi))}</div>`;
}

function pdfAvsnitt(label,verdi){
  if(!verdi)return '';
  return `<div style="margin-top:14px"><strong style="color:#1a3a5c;font-size:14px">${label}</strong><div style="margin-top:4px;padding:10px;background:#f5f7fa;border-left:3px solid #1a3a5c;white-space:pre-wrap">${escapeHtml(String(verdi))}</div></div>`;
}

function aapnePdf(html){
  const w=window.open('','_blank','width=900,height=700');
  if(!w){alert('Pop-up blokkert. Tillat pop-ups for denne siden.');return;}
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>KB-dokument</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1d2939;line-height:1.5;max-width:780px;margin:30px auto;padding:0 30px;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}
    th,td{padding:6px 8px;text-align:left;border:1px solid #ddd;vertical-align:top}
    th{background:#1a3a5c;color:#fff;font-weight:600}
    .tag{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
    @media print{body{margin:0;padding:0 20px}}
    @page{margin:15mm}
  </style></head><body>${html}<div style="margin-top:30px;padding-top:12px;border-top:1px solid #ddd;font-size:10px;color:#999;text-align:center">Komplett Byggdrift AS · Org.nr 926 335 758 · komplettbyggdrift.no</div>
  <scr`+`ipt>setTimeout(()=>{window.print();},400);</scr`+`ipt>
  </body></html>`);
  w.document.close();
}

function pdfSja(id){
  const s=sjaListe.find(x=>x.id===id);if(!s)return;
  let html=pdfTopp('SJA – Sikker Jobb Analyse','HMS-internkontroll');
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">';
  html+=pdfFelt('Dato',formaterDato(s.dato));
  html+=pdfFelt('Status',s.status==='godkjent'?'Godkjent':'Utkast');
  html+=pdfFelt('Prosjekt',s.prosjekt);
  html+=pdfFelt('Sted',s.sted);
  html+=pdfFelt('Deltakere',s.deltakere);
  html+=pdfFelt('Opprettet av',s.opprettet_av);
  html+='</div>';
  html+=pdfAvsnitt('Beskrivelse av arbeidet',s.arbeidsbeskrivelse);

  if((s.farer||[]).length>0){
    html+='<h3 style="margin-top:18px;color:#1a3a5c">Farer og tiltak</h3>';
    html+='<table><thead><tr><th>Fare</th><th>Sannsynlighet</th><th>Konsekvens</th><th>Tiltak</th></tr></thead><tbody>';
    s.farer.forEach(f=>{
      html+=`<tr><td>${escapeHtml(f.fare||'')}</td><td>${escapeHtml(f.sannsynlighet||'')}</td><td>${escapeHtml(f.konsekvens||'')}</td><td>${escapeHtml(f.tiltak||'')}</td></tr>`;
    });
    html+='</tbody></table>';
  }

  html+=pdfAvsnitt('Personlig verneutstyr (PVU)',s.ppe);
  if((s.signaturer||[]).length>0){
    html+='<h3 style="margin-top:18px;color:#1a3a5c">Signaturer</h3>';
    html+='<table><thead><tr><th>Navn</th><th style="width:180px">Signert</th><th style="width:180px">Signatur</th></tr></thead><tbody>';
    s.signaturer.forEach(sig=>{
      const dato=new Date(sig.signert_dato).toLocaleString('nb-NO');
      const bilde=sig.bilde?`<img src="${sig.bilde}" style="max-width:160px;max-height:60px">`:'—';
      html+=`<tr><td>✓ ${escapeHtml(sig.navn)}</td><td>${dato}</td><td>${bilde}</td></tr>`;
    });
    html+='</tbody></table>';
  }

  if(s.godkjent_av){
    html+='<div style="margin-top:24px;padding-top:14px;border-top:1px solid #ddd;display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    html+=pdfFelt('Godkjent av',s.godkjent_av);
    html+=pdfFelt('Godkjent dato',formaterDato(s.godkjent_dato));
    html+='</div>';
  }

  aapnePdf(html);
}

function pdfAvvik(id){
  const a=avvikListe.find(x=>x.id===id);if(!a)return;
  const typeLabels={ulykke:'Ulykke',naestenulykke:'Nestenulykke',kvalitet:'Kvalitetsfeil',miljo:'Miljø',annet:'Annet'};
  let html=pdfTopp('Avviksrapport','HMS-internkontroll');
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">';
  html+=pdfFelt('Dato',formaterDato(a.dato));
  html+=pdfFelt('Melder',a.melder);
  html+=pdfFelt('Type',typeLabels[a.type]||a.type);
  html+=pdfFelt('Alvorlighet',a.alvorlighet);
  html+=pdfFelt('Sted',a.sted);
  html+=pdfFelt('Prosjekt',a.prosjekt);
  html+=pdfFelt('Status',a.status);
  html+=pdfFelt('Ansvarlig',a.ansvarlig);
  html+='</div>';
  html+=pdfAvsnitt('Beskrivelse',a.beskrivelse);
  html+=pdfAvsnitt('Umiddelbart tiltak',a.umiddelbart_tiltak);
  html+=pdfAvsnitt('Permanente tiltak',a.permanente_tiltak);
  if(a.bilder&&a.bilder.length>0){
    html+=`<div style="margin-top:18px"><strong style="color:#1a3a5c">📷 Bilder (${a.bilder.length}):</strong></div>`;
    html+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:6px">';
    a.bilder.forEach(b=>{
      html+=`<img src="${escapeHtml(b.url)}" style="width:100%;border:1px solid #ddd;border-radius:6px">`;
    });
    html+='</div>';
  }
  if(a.lukket_dato){
    html+='<div style="margin-top:24px;padding-top:14px;border-top:1px solid #ddd;display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    html+=pdfFelt('Lukket dato',formaterDato(a.lukket_dato));
    html+=pdfFelt('Lukket av',a.lukket_av);
    html+='</div>';
  }
  aapnePdf(html);
}

function pdfVernerunde(id){
  const v=vrListe.find(x=>x.id===id);if(!v)return;
  let html=pdfTopp('Vernerunderapport','HMS-internkontroll');
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">';
  html+=pdfFelt('Dato',formaterDato(v.dato));
  html+=pdfFelt('Lokasjon',v.lokasjon);
  html+=pdfFelt('Utført av',v.utfort_av);
  html+=pdfFelt('Deltakere',v.deltakere);
  html+=pdfFelt('Status',v.status);
  html+='</div>';

  const sj=v.sjekkpunkter||{};
  if(Object.keys(sj).length>0){
    html+='<h3 style="margin-top:18px;color:#1a3a5c">Sjekkpunkter</h3>';
    html+='<table><thead><tr><th>Punkt</th><th style="width:140px">Status</th></tr></thead><tbody>';
    const statusLabels={ok:'OK',anmerkning:'Anmerkning',avvik:'Avvik',ikke_aktuelt:'Ikke aktuelt'};
    Object.entries(sj).forEach(([punkt,status])=>{
      html+=`<tr><td>${escapeHtml(punkt)}</td><td>${statusLabels[status]||status}</td></tr>`;
    });
    html+='</tbody></table>';
  }

  html+=pdfAvsnitt('Funn',v.funn);
  html+=pdfAvsnitt('Tiltak',v.tiltak);
  aapnePdf(html);
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


async function loggUt(){ await window.KBAuth.logoutAndReturn(); }


// =========================================
// ADRESSE-AUTOCOMPLETE (Kartverket)
// =========================================
const adresseDebouncer={};
async function sokAdresse(sok){
  if(!sok||sok.length<3)return [];
  try{
    const r=await fetch('https://ws.geonorge.no/adresser/v1/sok?sok='+encodeURIComponent(sok)+'&treffPerSide=8&asciiKompatibel=true');
    if(!r.ok)return [];
    const data=await r.json();
    return data.adresser||[];
  }catch(e){return [];}
}

function settOppAdresseSok(inputId){
  const input=document.getElementById(inputId);
  if(!input||input.dataset.adresseSokSatt)return;
  input.dataset.adresseSokSatt='1';
  input.setAttribute('autocomplete','off');
  input.addEventListener('input',()=>{
    clearTimeout(adresseDebouncer[inputId]);
    adresseDebouncer[inputId]=setTimeout(async()=>{
      const sok=input.value.trim();
      if(sok.length<3){lukkAdresseForslag(inputId);return;}
      const resultater=await sokAdresse(sok);
      visAdresseForslag(input,resultater);
    },250);
  });
  input.addEventListener('blur',()=>{
    setTimeout(()=>lukkAdresseForslag(inputId),200);
  });
}

function lukkAdresseForslag(inputId){
  const eksisterer=document.getElementById('adr-forslag-'+inputId);
  if(eksisterer)eksisterer.remove();
}

function visAdresseForslag(input,resultater){
  lukkAdresseForslag(input.id);
  if(!resultater||resultater.length===0)return;
  const rect=input.getBoundingClientRect();
  const d=document.createElement('div');
  d.id='adr-forslag-'+input.id;
  d.style.cssText='position:fixed;top:'+(rect.bottom+2)+'px;left:'+rect.left+'px;width:'+Math.max(rect.width,280)+'px;background:#fff;border:1px solid #dde3ec;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);z-index:99999;max-height:280px;overflow-y:auto';
  resultater.forEach(adr=>{
    const item=document.createElement('div');
    item.style.cssText='padding:10px 12px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:14px;line-height:1.3';
    const hoved=adr.adressetekst||adr.adressenavn||'';
    const sted=(adr.postnummer||'')+' '+(adr.poststed||'');
    const kommune=adr.kommunenavn||'';
    item.innerHTML='<div style="font-weight:600;color:#1a3a5c">'+hoved+'</div><div style="font-size:12px;color:#667085;margin-top:2px">'+sted+(kommune?' · '+kommune:'')+'</div>';
    item.addEventListener('mousedown',(e)=>{
      e.preventDefault();
      input.value=hoved+', '+sted.trim();
      lukkAdresseForslag(input.id);
      input.dispatchEvent(new Event('input',{bubbles:true}));
    });
    item.onmouseover=()=>item.style.background='#f5f7fa';
    item.onmouseout=()=>item.style.background='';
    d.appendChild(item);
  });
  document.body.appendChild(d);
}

function aktiverAdresseSokHMS(){
  ['sja-sted','avvik-sted','vr-lokasjon'].forEach(id=>{
    if(document.getElementById(id))settOppAdresseSok(id);
  });
}

// =========================================
// Session expiry and inactivity handled by kb-gate.js.
