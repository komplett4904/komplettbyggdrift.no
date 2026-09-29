(async function(){
 'use strict';
 const $=id=>document.getElementById(id), db=KBDatabase.getClient();
 let state={active:null,recent:[]}, offset=0, busy=false, ready=false, projects=[], pending=null, editing=null, dayVersion=0;
 const osloDay=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 $('review-date').value=osloDay();
 const seconds=(row,now=Date.now()+offset)=>Math.max(0,Math.floor(((row.ended_at?Date.parse(row.ended_at):row.pause_started?Date.parse(row.pause_started):now)-Date.parse(row.started_at))/1000-Number(row.pause_seconds)));
 const duration=s=>[Math.floor(s/3600),Math.floor(s%3600/60),Math.floor(s%60)].map(n=>String(n).padStart(2,'0')).join(':');
 const when=s=>new Date(s).toLocaleString('nb-NO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 function element(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
 let favorites=new Set(),favoriteBusy=false;
 const searchLabel=element('label','Søk i prosjektene'),search=element('input','');search.type='search';search.id='project-search';search.placeholder='Søk på prosjektnavn eller nummer';searchLabel.htmlFor=search.id;
 const favoriteButton=element('button','☆ Merk som favoritt'),projectStatus=element('p','Henter prosjekter fra Tripletex …');favoriteButton.type='button';favoriteButton.id='project-favorite';favoriteButton.setAttribute('aria-pressed','false');projectStatus.id='project-load-status';projectStatus.setAttribute('role','status');projectStatus.className='note';
 $('time-project').before(searchLabel,search);$('time-project').after(favoriteButton,projectStatus);
 function favoriteState(){const selected=$('time-project').value,starred=favorites.has(selected);favoriteButton.textContent=starred?'★ Fjern fra favoritter':'☆ Merk som favoritt';favoriteButton.setAttribute('aria-pressed',String(starred));favoriteButton.disabled=!selected||favoriteBusy||busy||!ready;}
 function renderProjects(){const selected=$('time-project').value,q=search.value.trim().toLocaleLowerCase('nb-NO');const filtered=projects.filter(p=>p.active!==false&&(p.id===selected||p.navn.toLocaleLowerCase('nb-NO').includes(q))).sort((a,b)=>a.navn.localeCompare(b.navn,'nb-NO',{numeric:true}));
  $('time-project').replaceChildren(new Option('Velg prosjekt …',''));
  for(const [title,predicate] of [['★ Mine favoritter',p=>favorites.has(p.id)],['Prosjekter fra Tripletex',p=>!favorites.has(p.id)&&p.tripletex_id],['Lokale prosjekter',p=>!favorites.has(p.id)&&!p.tripletex_id]]){const group=element('optgroup','');group.label=title;for(const p of filtered.filter(predicate))group.append(new Option(p.navn,p.id));if(group.children.length)$('time-project').append(group);}
  $('time-project').value=selected;favoriteState();
 }
 search.oninput=renderProjects;
 favoriteButton.onclick=async()=>{const pid=$('time-project').value;if(!pid||favoriteBusy)return;favoriteBusy=true;favoriteState();try{const was=favorites.has(pid);const result=was?await db.from('kb_time_favorites').delete().eq('project_id',pid):await db.from('kb_time_favorites').insert({project_id:pid});if(result.error)throw result.error;if(was)favorites.delete(pid);else favorites.add(pid);renderProjects();projectStatus.textContent=was?'Stjernen er fjernet. Prosjektet er fortsatt tilgjengelig.':'Stjernemerket. Prosjektet ligger øverst i listen på kontoen din.';}catch(e){projectStatus.textContent='Kunne ikke lagre stjernen. Prøv igjen. '+(e.message||'');}finally{favoriteBusy=false;favoriteState();}};
 function controls(){
  const a=state.active,paused=a?.status==='paused';
  $('active-controls').hidden=!a;$('start').hidden=!!a;$('switch-open').hidden=!a;
  $('pause').hidden=paused;$('resume').hidden=!paused;$('errand').hidden=paused||a?.mode==='errand';$('return').hidden=paused||a?.mode!=='errand';
  $('clock-title').textContent=a?a.project_name:'Klar for jobb?';
  $('clock-help').textContent=a?(paused?'Pauset. Trykk «Fortsett arbeidet» når du er klar.':a.mode==='errand'?'På hentetur. Klokken fortsetter på dette prosjektet.':'Klokken går, også når du lukker siden. Husk å avslutte jobben.'): 'Velg prosjekt fra Tripletex og trykk «Start jobb». Bruk stjernen for jobbene du bruker ofte.';
  for(const b of document.querySelectorAll('main button'))b.disabled=busy||!ready;
  $('start').disabled=busy||!ready||!$('time-project').value;
  $('switch-open').disabled=busy||!ready||!$('time-project').value||$('time-project').value===a?.project_id;
  $('clock').textContent=a?duration(seconds(a)):'00:00:00';
  favoriteState();
 }
 function render(){controls();$('time-history').replaceChildren();
  if(!state.recent.length)$('time-history').append(element('p','Ingen avsluttede timeutkast ennå.'));
  for(const row of state.recent){const card=element('article','');card.className='time-entry';card.append(element('h3',row.corrected_project_name||row.project_name),element('p',when(row.started_at)+' – '+when(row.ended_at)),element('strong',duration(row.corrected_seconds??seconds(row))+' arbeid · '+duration(Math.floor(Number(row.pause_seconds)))+' pause'),element('p',row.note||'Ingen arbeidsbeskrivelse.'));$('time-history').append(card);}
  loadDay();
 }
 async function action(name,extra={}){
  if(busy)return false;busy=true;controls();$('time-status').textContent='Lagrer …';
  try{const {data,error}=await db.rpc('kb_time_action',{p_action:name,p_expected:state.active?.id||null,...extra});if(error)throw error;if(!data||!Array.isArray(data.recent))throw Error('Uventet svar fra lagringen.');state=data;offset=Date.parse(data.server_now)-Date.now();ready=true;$('time-status').textContent=name==='status'?'Oppdatert.':'Lagret på kontoen din.';render();return true;}
  catch(e){$('time-status').textContent='Kunne ikke bekrefte lagringen. '+(e.message||'Sjekk nettet.')+' Trykk «Oppdater» før du prøver igjen.';return false;}
  finally{busy=false;controls();$('refresh').disabled=false;}
 }
 $('time-project').onchange=()=>{const p=projects.find(p=>p.id===$('time-project').value);$('project-address').textContent=p?.state?.tilbud?.sted||'';controls();};
 $('start').onclick=()=>action('start',{p_new_id:crypto.randomUUID(),p_project:$('time-project').value});
 for(const b of document.querySelectorAll('[data-action]'))b.onclick=()=>action(b.dataset.action);
 function finish(kind){if(!state.active)return;pending={kind,id:state.active.id,project:$('time-project').value,newId:crypto.randomUUID()};$('finish-title').textContent=kind==='switch'?'Bytt prosjekt':'Avslutt jobb';$('finish-info').textContent='Avslutter '+state.active.project_name+(kind==='switch'?' og starter på '+projects.find(p=>p.id===pending.project)?.navn:'')+'.';$('finish-note').value=state.active.note||'';$('finish-dialog').showModal();}
 $('stop-open').onclick=()=>finish('stop');$('switch-open').onclick=()=>finish('switch');
 $('finish-confirm').onclick=async()=>{if(!pending)return;const ok=await action(pending.kind,{p_expected:pending.id,p_project:pending.project,p_new_id:pending.newId,p_note:$('finish-note').value});if(ok){$('finish-dialog').close();pending=null;}else $('finish-info').textContent=$('time-status').textContent;};
 $('refresh').onclick=()=>action('status');
 async function loadDay(){const version=++dayVersion;$('review-day').disabled=true;$('day-status').textContent='Henter dagen …';try{const {data,error}=await db.rpc('kb_time_day',{p_day:$('review-date').value});if(error)throw error;if(version!==dayVersion)return;if(!Array.isArray(data))throw Error('Kunne ikke lese dagens utkast.');$('day-entries').replaceChildren();let total=0;
  for(const row of data){const card=element('article','');card.className='time-entry';const value=row.corrected_seconds??seconds(row);total+=value;card.append(element('h3',row.corrected_project_name||row.project_name),element('p',when(row.started_at)+' – '+(row.ended_at?when(row.ended_at):'pågår')),element('strong',duration(value)+(row.status==='completed'?'':' (foreløpig)')),element('p',row.note||'Ingen arbeidsbeskrivelse.'),element('p',row.reviewed_at?'✓ Utkast godkjent · se overføringsstatus nedenfor':'Ikke godkjent'));
   if(row.corrected_seconds!==null&&row.corrected_seconds!==undefined)card.append(element('p','Opprinnelig klokketid: '+duration(seconds(row))+' på '+row.project_name));
   if(row.status==='completed'){const b=element('button','Endre prosjekt eller timer');b.onclick=()=>{editing=row;$('edit-project').replaceChildren();for(const p of projects){const o=element('option',p.navn);o.value=p.id;$('edit-project').append(o);}$('edit-project').value=row.corrected_project_id||row.project_id;$('edit-hours').value=Math.floor(value/3600);$('edit-minutes').value=Math.floor(value%3600/60);$('edit-note').value=row.note||'';$('edit-status').textContent='Opprinnelig klokketid beholdes. Endringen lagres i hele minutter.';$('edit-time-dialog').showModal();};card.append(b);}$('day-entries').append(card);
  }
  $('day-status').textContent=data.length?'Totalt '+duration(total)+' · '+data.length+' økter':'Ingen økter startet denne dagen.';$('review-day').disabled=!data.length||data.some(r=>r.status!=='completed')||data.every(r=>r.reviewed_at);
 }catch(e){$('day-status').textContent='Kunne ikke hente dagen. '+(e.message||'Prøv igjen.');}}
 $('review-date').onchange=loadDay;
 $('edit-save').onclick=async()=>{const hours=Number($('edit-hours').value),minutes=Number($('edit-minutes').value);if(!Number.isInteger(hours)||!Number.isInteger(minutes)||hours<0||minutes<0||minutes>59||hours*60+minutes>1440){$('edit-status').textContent='Oppgi 0–24 timer og 0–59 minutter.';return;}$('edit-save').disabled=true;try{const {error}=await db.rpc('kb_time_correct',{p_id:editing.id,p_project:$('edit-project').value,p_seconds:hours*3600+minutes*60,p_note:$('edit-note').value});if(error)throw error;$('edit-time-dialog').close();await action('status');}catch(e){$('edit-status').textContent='Ikke lagret. '+e.message;}finally{$('edit-save').disabled=false;}};
 $('review-day').onclick=async()=>{$('review-day').disabled=true;try{const {error}=await db.rpc('kb_time_review_day',{p_day:$('review-date').value});if(error)throw error;await loadDay();$('time-status').textContent='Dagens utkast er godkjent. Klargjør og send dagen til Tripletex nedenfor.';}catch(e){$('day-status').textContent=e.message;$('review-day').disabled=false;}};
 setInterval(()=>{if(state.active)$('clock').textContent=duration(seconds(state.active));},1000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!$('finish-dialog').open)action('status');});
 $('locate').onclick=async()=>{
  const message=$('location-status'),options=$('location-options');options.replaceChildren();$('locate').disabled=true;message.textContent='Ber om posisjon én gang …';
  try{
   if(!navigator.geolocation)throw Error('Denne nettleseren kan ikke finne posisjonen.');
   const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:15000,maximumAge:0}));
   if(pos.coords.accuracy>150)throw Error('Posisjonen er for unøyaktig til å foreslå riktig prosjekt.');
   const nearby=[];const candidates=projects.filter(p=>p.state?.tilbud?.sted).slice(0,20);
   message.textContent='Sammenligner med prosjektadressene …';
   for(const p of candidates){
    try{const response=await fetch('https://ws.geonorge.no/adresser/v1/sok?sok='+encodeURIComponent(p.state.tilbud.sted)+'&treffPerSide=2',{signal:AbortSignal.timeout(5000)});if(!response.ok)continue;const json=await response.json();if(json.adresser?.length!==1)continue;const point=json.adresser[0].representasjonspunkt;if(!point)continue;const rad=Math.PI/180,lat=pos.coords.latitude,lon=pos.coords.longitude;const h=Math.sin((point.lat-lat)*rad/2)**2+Math.cos(lat*rad)*Math.cos(point.lat*rad)*Math.sin((point.lon-lon)*rad/2)**2;const distance=6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));if(distance<250)nearby.push({p,distance});}catch{}
   }
   message.textContent=nearby.length?'Er du på en av disse jobbene? Velg prosjektet, og start klokken selv.':'Fant ingen sikker match blant de 20 siste prosjektene med adresse. Velg prosjekt selv.';
   for(const {p} of nearby.sort((a,b)=>a.distance-b.distance)){const b=element('button','Velg '+p.navn);b.type='button';b.onclick=()=>{$('time-project').value=p.id;$('time-project').onchange();message.textContent=p.navn+' er valgt. Klokken er ikke endret.';};options.append(b);}
  }catch(e){message.textContent=(e.code===1?'Posisjon ble ikke delt.':e.code===2||e.code===3?'Kunne ikke finne posisjonen.':e.message)+' Velg prosjekt i listen. Klokken er ikke endret.';}
  finally{$('locate').disabled=false;}
 };
 controls();
 try{
  let syncProblem=false;try{const {data,error}=await db.functions.invoke('tripletex-time',{body:{action:'options',day:osloDay()}});if(error||data?.error)throw error||Error(data.error);}catch{syncProblem=true;}
  const [{data,error},stars]=await Promise.all([db.from('kb_time_projects').select('id,navn,state,active,tripletex_id'),db.from('kb_time_favorites').select('project_id')]);if(error)throw error;
  projects=data||[];favorites=new Set((stars.data||[]).map(p=>p.project_id));renderProjects();
  projectStatus.textContent=syncProblem?'Tripletex kunne ikke oppdateres akkurat nå. Viser sist hentede prosjekter. Last siden på nytt for å prøve igjen.':`${projects.filter(p=>p.tripletex_id&&p.active).length} åpne Tripletex-prosjekter. Velg et prosjekt og trykk ☆ for å legge det øverst. Trykk ★ for å fjerne stjernen.`;
  if(stars.error)projectStatus.textContent+=' Favorittene kunne ikke lastes.';await action('status');
 }
 catch(e){$('time-status').textContent='Prosjektene kunne ikke lastes. Last siden på nytt. '+(e.message||'');}
})();
