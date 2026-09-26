(function(){
  'use strict';
  const employee=KBAuth.employee;
  if(!employee)return;
  const planningPanel=document.getElementById('planning-panel');
  if(planningPanel)planningPanel.open=window.matchMedia('(min-width:769px)').matches;
  const mine=employee.email.split('@')[0];
  function filter(mode){
    for(const key of Object.keys(aktiveBrukere))aktiveBrukere[key]=mode==='all'||(mode==='mine'&&key===mine)||(mode==='team'&&key==='felles');
    document.querySelectorAll('.user-chip').forEach(chip=>{const active=aktiveBrukere[chip.dataset.key];chip.classList.toggle('active',active);chip.setAttribute('aria-pressed',String(active));});
    oppdaterKalender();
  }
  document.getElementById('show-all').onclick=()=>filter('all');
  document.getElementById('show-mine').onclick=()=>filter('mine');
  document.getElementById('show-team').onclick=()=>filter('team');
  const apps={drive:'https://drive.google.com/drive/',tasks:'https://tasks.google.com/',meet:'https://meet.google.com/'};
  document.querySelectorAll('[data-google]').forEach(a=>{const url=new URL(apps[a.dataset.google]);url.searchParams.set('authuser',employee.email);a.href=url.href;});
  const el=id=>document.getElementById('plan-'+id);
  const now=new Date(),today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  el('date').value=today;el('end-date').value=today;
  el('date').addEventListener('change',()=>{if(el('end-date').value<el('date').value)el('end-date').value=el('date').value;});
  try{
    const draft=JSON.parse(sessionStorage.getItem('kb_work_plan_draft')||'null');sessionStorage.removeItem('kb_work_plan_draft');
    if(draft&&draft.employee===employee.id&&Date.now()-draft.created<30*60*1000){
      if(planningPanel)planningPanel.open=true;
      el('title').value=String(draft.title||'').slice(0,160);el('address').value=String(draft.address||'').slice(0,200);
      el('notes').value=('Ansvarlig: '+employee.name+'\n'+String(draft.notes||'')).slice(0,1800);
      el('status').textContent='Prosjektet er hentet inn. Velg dato og klokkeslett for arbeidet.';
    }
  }catch{}
  const form=document.getElementById('work-plan');
  form.addEventListener('input',()=>{el('draft').hidden=true;el('map').hidden=true;el('status').textContent='';});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const start=el('date').value+'T'+el('start').value,end=el('end-date').value+'T'+el('end').value;
    const title=el('title').value.trim();
    if(!title||end<=start){el('status').textContent='Fyll inn arbeid og velg en slutt etter start.';return;}
    const stamp=value=>value.replace(/[-:]/g,'')+'00';
    const calendar=el('calendar').value==='mine'?employee.email:KALENDERE.felles.id;
    const url=new URL('https://calendar.google.com/calendar/r/eventedit');
    const params={action:'TEMPLATE',text:el('type').value+' – '+title,dates:stamp(start)+'/'+stamp(end),ctz:'Europe/Oslo',stz:'Europe/Oslo',etz:'Europe/Oslo',src:calendar,authuser:employee.email,location:el('address').value.trim(),details:el('notes').value.trim()};
    for(const [key,value]of Object.entries(params))if(value)url.searchParams.set(key,value);
    el('draft').href=url.href;el('draft').hidden=false;
    if(params.location){const maps=new URL('https://www.google.com/maps/search/');maps.searchParams.set('api','1');maps.searchParams.set('query',params.location);el('map').href=maps.href;el('map').hidden=false;}
    el('status').textContent='Utkastet er klart. Åpne det i Google Kalender, kontroller at riktig kalender er valgt, og lagre der. Ingen avtale er opprettet ennå.';
    el('draft').focus();
  });
})();
