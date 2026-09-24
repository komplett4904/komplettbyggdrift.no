(function(){
  const KB_SUPABASE_URL=window.KBDatabase.url;
  const KB_SUPABASE_KEY=window.KBDatabase.key;
  let kbSb=null;
  try{ if(window.supabase) kbSb=window.KBDatabase.getClient(); }catch(e){console.error(e);}

  function hentSidenavn(){
    const p=location.pathname;
    if(p.includes('hms'))return 'HMS';
    if(p.includes('kalender'))return 'Kalender';
    return 'Anbudskalkulator';
  }

  function erStephen(){
    return window.KBAuth.employee?.name==='Stephen';
  }

  function settInnBoble(){
    if(document.getElementById('tilbakemeldingBoble'))return;
    if((window.KBAuth.employee ? '1' : null)!=='1')return;

    const b=document.createElement('div');
    b.id='tilbakemeldingBoble';
    b.innerHTML=`
      <button id="tmKnapp" title="Send tilbakemelding eller rapporter feil" style="position:fixed;bottom:20px;left:20px;width:54px;height:54px;border-radius:50%;background:#1a3a5c;color:#fff;border:none;cursor:pointer;font-size:24px;box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:8000;display:flex;align-items:center;justify-content:center;transition:transform .15s">💬</button>
      <span id="tmBadge" style="display:none;position:fixed;bottom:60px;left:58px;background:#dc2626;color:#fff;border-radius:50%;width:22px;height:22px;font-size:11px;font-weight:700;align-items:center;justify-content:center;z-index:8001;border:2px solid #fff"></span>
      <div id="tmSkjema" style="display:none;position:fixed;bottom:90px;left:20px;width:340px;max-width:calc(100vw - 40px);max-height:calc(100vh - 110px);overflow:auto;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.25);z-index:8000;padding:16px;border:1px solid #dde3ec">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <strong style="color:#1a3a5c;font-size:15px">💬 Tilbakemelding</strong>
          <button onclick="tmLukk()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#667085;padding:4px 8px">✕</button>
        </div>
        <div style="background:#eef4fb;border:1px solid #bbd5ee;border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:12px;color:#1e40af;line-height:1.5">
          <strong>Hva er dette?</strong><br>
          Skriv hvis du finner en feil, mangler noe, eller har et forslag. Tilbakemeldingen blir tilgjengelig for Stephen i innboksen. Du kan skrive fra hvilken som helst side - anbudskalkulator, kalender eller HMS.
        </div>
        <p style="font-size:12px;color:#667085;margin-bottom:8px;line-height:1.4">Eksempel: "Pris på takstein virker feil" eller "Kan vi få mulighet til å..." eller "Knappen X gjør ingenting".</p>
        <textarea id="tmTekst" placeholder="Beskriv feilen eller forslaget..." style="width:100%;padding:10px;border:1.5px solid #dde3ec;border-radius:8px;font-size:14px;font-family:inherit;min-height:90px;resize:vertical;box-sizing:border-box"></textarea>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button onclick="tmSend()" style="flex:1;background:#1a3a5c;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px">Send</button>
          <button onclick="tmLukk()" style="background:#fff;color:#1a3a5c;border:1.5px solid #dde3ec;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px">Avbryt</button>
        </div>
        <div id="tmStatus" style="font-size:12px;margin-top:8px;text-align:center"></div>
      </div>`;
    document.body.appendChild(b);
    window.KBAttachments.mount();

    document.getElementById('tmKnapp').onclick=()=>{
      const s=document.getElementById('tmSkjema');
      s.style.display=s.style.display==='none'?'block':'none';
      if(s.style.display==='block')document.getElementById('tmTekst').focus();
    };

    if(erStephen()) sjekkUlesteTilbakemeldinger();
  }

  let tmSending=false, tmDraftId=null;
  window.tmLukk=function(){
    if(tmSending)return;
    window.KBAttachments.clear();tmDraftId=null;
    document.getElementById('tmSkjema').style.display='none';
    document.getElementById('tmTekst').value='';
    document.getElementById('tmStatus').textContent='';
  };

  window.tmSend=async function(){
    if(tmSending)return;
    const tekst=document.getElementById('tmTekst').value.trim();
    if(!tekst){alert('Skriv noe først.');return;}
    if(!kbSb){alert('Sky utilgjengelig.');return;}
    const status=document.getElementById('tmStatus');
    tmSending=true;window.KBAttachments.setBusy(true);
    status.textContent='Sender...';
    status.style.color='#667085';
    try{
      const vedlegg=await window.KBAttachments.upload(kbSb);
      tmDraftId=tmDraftId||crypto.randomUUID();
      const {error}=await kbSb.from('tilbakemeldinger').upsert({
        id:tmDraftId,vedlegg,
        melding:tekst,
        fra:window.KBAuth.employee?.name||'Ukjent',
        side:hentSidenavn(),
        url:location.pathname,
        bruker_agent:navigator.userAgent.slice(0,200)
      });
      if(error)throw error;
      status.textContent='✓ Sendt! Takk for tilbakemelding';
      status.style.color='#16a34a';
      document.getElementById('tmTekst').value='';
      window.KBAttachments.clear();tmDraftId=null;
      setTimeout(()=>{if(!document.getElementById('tmTekst').value)window.tmLukk();},2000);
    }catch(e){
      status.textContent='⚠ Feil: '+e.message;
      status.style.color='#dc2626';
    }finally{tmSending=false;window.KBAttachments.setBusy(false);}
  };

  async function sjekkUlesteTilbakemeldinger(){
    if(!kbSb)return;
    try{
      const {data,error}=await kbSb.from('tilbakemeldinger').select('id').eq('status','ny');
      if(error)throw error;
      const badge=document.getElementById('tmBadge');
      badge.style.display='none';
      if(data && data.length>0){
        badge.textContent=data.length;
        badge.style.display='flex';
        // Erstatte knappen-funksjon for Stephen
        document.getElementById('tmKnapp').onclick=()=>tmVisInnboks();
        document.getElementById('tmKnapp').title='Du har '+data.length+' nye tilbakemeldinger';
      }
    }catch(e){console.error(e);}
  }

  window.tmVisInnboks=async function(){
    if(!kbSb){alert('Sky utilgjengelig.');return;}
    let modal=document.getElementById('tmInnboksModal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='tmInnboksModal';
      modal.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9500;overflow:auto;padding:30px 0';
      modal.innerHTML=`
        <div style="background:#fff;max-width:780px;margin:0 auto;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.25);overflow:hidden">
          <div style="background:#1a3a5c;color:#fff;padding:18px 24px;display:flex;justify-content:space-between;align-items:center">
            <h2 style="font-size:20px;margin:0">💬 Tilbakemeldinger fra teamet</h2>
            <button onclick="tmLukkInnboks()" style="background:#fff;color:#1a3a5c;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:600">Lukk</button>
          </div>
          <div style="background:#eef4fb;padding:10px 24px;font-size:13px;color:#1e40af"><button onclick="tmLukkInnboks();document.getElementById('tmSkjema').style.display='block'">Ny tilbakemelding</button>
            <button onclick="tmVisInnboksFilter('ny')" id="tmFilterNy" style="background:#1a3a5c;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;margin-right:6px;font-size:12px">Nye</button>
            <button onclick="tmVisInnboksFilter('alle')" id="tmFilterAlle" style="background:#fff;color:#1a3a5c;border:1px solid #dde3ec;padding:6px 12px;border-radius:6px;cursor:pointer;margin-right:6px;font-size:12px">Alle</button>
            <button onclick="tmVisInnboksFilter('fikset')" id="tmFilterFikset" style="background:#fff;color:#1a3a5c;border:1px solid #dde3ec;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px">Fiksede</button>
          </div>
          <div style="max-height:70vh;overflow-y:auto;padding:20px" id="tmInnboksInnhold"></div>
        </div>`;
      document.body.appendChild(modal);
    }
    modal.style.display='block';
    document.body.style.overflow='hidden';
    window.tmVisInnboksFilter('ny');
  };

  window.tmLukkInnboks=function(){
    const m=document.getElementById('tmInnboksModal');
    if(m)m.style.display='none';
    document.body.style.overflow='';
  };

  window.tmVisInnboksFilter=async function(filter){
    ['Ny','Alle','Fikset'].forEach(f=>{
      const btn=document.getElementById('tmFilter'+f);
      if(btn){
        const active=f.toLowerCase()===filter;
        btn.style.background=active?'#1a3a5c':'#fff';
        btn.style.color=active?'#fff':'#1a3a5c';
        btn.style.border=active?'none':'1px solid #dde3ec';
      }
    });
    const el=document.getElementById('tmInnboksInnhold');
    el.innerHTML='<p style="color:#667085">Henter...</p>';
    try{
      let q=kbSb.from('tilbakemeldinger').select('*').order('opprettet_dato',{ascending:false});
      if(filter==='ny')q=q.eq('status','ny');
      else if(filter==='fikset')q=q.eq('status','fikset');
      const {data,error}=await q;
      if(error)throw error;
      if(!data||data.length===0){el.innerHTML='<p style="color:#667085;text-align:center;padding:30px">Ingen tilbakemeldinger her.</p>';return;}
      el.innerHTML=data.map(t=>{
        const dato=new Date(t.opprettet_dato).toLocaleString('nb-NO');
        const statusFarge=t.status==='fikset'?'#dcfce7':t.status==='lest'?'#dbeafe':'#fef3c7';
        const statusText=t.status==='fikset'?'Fikset':t.status==='lest'?'Lest':'Ny';
        return `<div style="background:${statusFarge};border:1px solid #ddd;border-radius:10px;padding:14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px;flex-wrap:wrap">
            <div>
              <strong style="color:#1a3a5c">${escapeHTML(t.fra||'Ukjent')}</strong>
              <span style="font-size:12px;color:#667085;margin-left:8px">${escapeHTML(t.side||'')} · ${dato}</span>
            </div>
            <span style="background:#fff;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;color:#1a3a5c">${statusText}</span>
          </div>
          <div style="white-space:pre-wrap;font-size:14px;color:#1d2939;line-height:1.5;margin-bottom:10px">${escapeHTML(t.melding)}</div>${window.KBAttachments.markup(t.vedlegg)}
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${t.status!=='fikset'?`<button onclick="tmSettStatus('${t.id}','fikset')" style="background:#16a34a;color:#fff;border:none;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600">Marker som fikset</button>`:''}
            ${t.status==='ny'?`<button onclick="tmSettStatus('${t.id}','lest')" style="background:#1a3a5c;color:#fff;border:none;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600">Marker lest</button>`:''}
            <button onclick="tmSlett('${t.id}')" style="background:#fff;color:#dc2626;border:1px solid #fca5a5;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600">Slett</button>
          </div>
        </div>`;
      }).join('');
    }catch(e){
      el.innerHTML='<p style="color:#dc2626">Feil: '+e.message+'</p>';
    }
  };

  window.tmSettStatus=async function(id,status){
    try{
      const {error}=await kbSb.from('tilbakemeldinger').update({status}).eq('id',id);if(error)throw error;
      window.tmVisInnboksFilter(document.getElementById('tmFilterNy').style.background==='rgb(26, 58, 92)'?'ny':document.getElementById('tmFilterFikset').style.background==='rgb(26, 58, 92)'?'fikset':'alle');
      sjekkUlesteTilbakemeldinger();
    }catch(e){alert(e.message);}
  };

  window.tmSlett=async function(id){
    if(!confirm('Slette tilbakemeldingen permanent?'))return;
    try{
      await kbSb.from('tilbakemeldinger').delete().eq('id',id);
      window.tmVisInnboksFilter('ny');
      sjekkUlesteTilbakemeldinger();
    }catch(e){alert(e.message);}
  };

  function escapeHTML(s){if(!s)return '';return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

  // Init: vises etter bruker-velger har valgt
  function vent(){
    if((window.KBAuth.employee ? '1' : null)==='1' && window.KBAuth.employee?.name){
      settInnBoble();
    } else {
      setTimeout(vent,1000);
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',vent);
  } else {
    vent();
  }
})();
