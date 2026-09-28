'use strict';
let tourOffered=false,tourIndex=0;
const tourSteps=[
 ['day','Velkommen! Her starter arbeidsdagen','Her får du en rask oversikt over dagens oppdrag, prosjekter og ting som må følges opp. Vi viser deg rundt med noen få steg. Du kan hoppe over når som helst.'],
 ['finance','Her ser du økonomien','Se inntekter, kostnader og resultat samlet. I den ekte løsningen hentes tallene fra Tripletex. Administratorene bestemmer hvilke ansatte som får se økonomien. Her i demoen er alle beløp oppdiktet.'],
 ['projects','Her samles prosjektene','Trykk på et prosjektkort for å åpne det. I denne demoen ser du eksempler på arbeidsbeskrivelse og fremdrift. Alt tilhører fiktive kunder.'],
 ['calendar','Her ser du arbeidsplanen','Se hvem som skal gjøre hva, og når. I den ekte løsningen brukes Google Kalender. Denne planen er et eksempel og viser ingen private avtaler.'],
 ['hours','Prøv å føre noen timer','Velg prosjekt, start, slutt og pause. Skriv kort hva som ble gjort, og trykk «Legg til demotimer». Deretter kan du prøve «Simuler godkjenning». Ingen timer sendes til Tripletex. Demoen viser en enklere prøve enn ansattes timeassistent.'],
 ['hms','Her følger du opp HMS','Prøv å krysse av sjekklisten. Dette er en liten smakebit på HMS-verktøyene. Listen er bare et eksempel, ikke en fullstendig risikovurdering.'],
 ['calculator','Prøv selv – du kan ikke ødelegge noe','Endre timer og materialkostnader for å se eksempelprisen. Denne enkle kalkylen er ikke et ekte tilbud. Bruk menyen for å utforske videre. «Vis omvisning» starter denne gjennomgangen på nytt.']
];
function tourStep(){const [view,title,text]=tourSteps[tourIndex];showView(view);document.getElementById('tour-title').textContent=title;document.getElementById('tour-text').textContent=text;document.getElementById('tour-step').textContent='Kort omvisning · '+(tourIndex+1)+' av '+tourSteps.length;document.getElementById('tour-back').disabled=tourIndex===0;document.getElementById('tour-next').textContent=tourIndex===tourSteps.length-1?'Ferdig – prøv selv':'Neste →';document.querySelector('[data-panel="'+view+'"]').scrollIntoView({block:'start'});document.getElementById('tour-title').focus({preventScroll:true});}
function startTour(){if(demo.hidden)return;tourIndex=0;document.getElementById('demo-tour').showModal();tourStep();}
document.getElementById('tour-open').onclick=startTour;
for(const id of ['tour-close','tour-skip'])document.getElementById(id).onclick=()=>document.getElementById('demo-tour').close();
document.getElementById('demo-tour').addEventListener('close',()=>{if(!demo.hidden)document.getElementById('tour-open').focus({preventScroll:true});});
document.getElementById('tour-back').onclick=()=>{if(tourIndex>0){tourIndex--;tourStep();}};
document.getElementById('tour-next').onclick=()=>{if(tourIndex<tourSteps.length-1){tourIndex++;tourStep();}else document.getElementById('demo-tour').close();};
// This page never loads employee tools, their storage, or business tables.
const form=document.getElementById('entry'),demo=document.getElementById('demo'),statusEl=document.getElementById('status');let activeCode='';
async function verify(code){
 if(!/^[a-f0-9]{48}$/.test(code))return false;
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code))),b=>b.toString(16).padStart(2,'0')).join('');
 const response=await fetch(KBDatabase.url+'/rest/v1/kb_demo_invites?select=expires_at&code_hash=eq.'+hash,{headers:{apikey:KBDatabase.key,Authorization:'Bearer '+KBDatabase.key},cache:'no-store'});
 if(!response.ok)throw Error('Kunne ikke kontrollere koden. Prøv igjen når du har nett.');
 const rows=await response.json();return rows.length===1&&new Date(rows[0].expires_at).getTime()>Date.now();
}
async function open(code){try{if(!await verify(code))throw Error('Koden er ugyldig, utløpt eller deaktivert.');activeCode=code;demo.hidden=false;form.hidden=true;statusEl.textContent='';if(!tourOffered){tourOffered=true;startTour();}}catch(e){activeCode='';document.getElementById('demo-tour').close();demo.hidden=true;form.hidden=false;statusEl.textContent=e.message;}}
form.addEventListener('submit',event=>{event.preventDefault();open(document.getElementById('code').value.trim());});
function calculate(){const hours=Math.max(0,Math.min(10000,Number(document.getElementById('hours').value)||0)),materials=Math.max(0,Math.min(10000000,Number(document.getElementById('materials').value)||0));document.getElementById('estimate').textContent=(hours*750+materials).toLocaleString('nb-NO')+' kr eks. mva.';}
for(const id of ['hours','materials'])document.getElementById(id).addEventListener('input',calculate);calculate();
document.getElementById('exit').addEventListener('click',()=>{activeCode='';location.replace('/demo.html');});
const supplied=new URLSearchParams(location.hash.slice(1)).get('code');if(supplied){history.replaceState(null,'',location.pathname);open(supplied);}
setInterval(()=>{if(activeCode)open(activeCode);},60000);

// All demonstration data is authored here, independently of company records.
function showView(name){document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==name);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view===name?'page':'false'));}
document.querySelectorAll('[data-view],[data-open]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view||b.dataset.open)));
const demoMonths=[['Jan',640000,570000],['Feb',710000,620000],['Mar',780000,685000],['Apr',730000,655000],['Mai',860000,740000],['Jun',920000,810000],['Jul',560000,535000],['Aug',990000,845000],['Sep',880000,770000]];
const money=n=>n.toLocaleString('nb-NO')+' kr';let income=0,cost=0,running=0;
for(const [month,inc,exp] of demoMonths){income+=inc;cost+=exp;running+=inc-exp;const tr=document.createElement('tr');for(const value of [month,money(inc),money(exp),money(running)]){const td=document.createElement('td');td.textContent=value;tr.append(td);}document.getElementById('finance-rows').append(tr);const column=document.createElement('div');column.className='month';const bars=document.createElement('div');bars.className='bars';for(const [value,cls] of [[inc,'bar'],[exp,'bar cost']]){const bar=document.createElement('div');bar.className=cls;bar.style.height=(value/1000000*100)+'%';bars.append(bar);}column.append(bars,document.createTextNode(month));document.getElementById('demo-chart').append(column);}
for(const [label,value] of [['Driftsinntekter',income],['Driftskostnader',cost],['Driftsresultat',income-cost]]){const card=document.createElement('article');card.className='card';const span=document.createElement('span'),strong=document.createElement('strong');span.textContent=label;strong.textContent=money(value);card.append(span,strong);document.getElementById('finance-metrics').append(card);}
document.querySelectorAll('[data-hms]').forEach(c=>c.addEventListener('change',()=>document.getElementById('hms-progress').textContent=document.querySelectorAll('[data-hms]:checked').length+' av 3 punkter krysset av.'));
const now=new Date();document.getElementById('time-date').value=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
let timeEntries=[];const hoursText=n=>(n/60).toLocaleString('nb-NO',{maximumFractionDigits:2})+' t';
function renderTimes(){const list=document.getElementById('time-list');list.replaceChildren();const sum=timeEntries.reduce((n,e)=>n+e.minutes,0);document.getElementById('time-total').textContent=sum?hoursText(sum)+' registrert i denne demoøkten.':'Ingen nye timer ennå.';document.getElementById('week-hours').textContent=hoursText(1350+sum);document.getElementById('approve-hours').disabled=!timeEntries.some(e=>!e.approved);timeEntries.forEach((entry,index)=>{const row=document.createElement('div');row.className='time-row';const title=document.createElement('strong'),text=document.createElement('p'),state=document.createElement('p'),remove=document.createElement('button');title.textContent=entry.project+' · '+hoursText(entry.minutes);text.textContent=entry.date+' · '+entry.note;state.textContent=entry.approved?'Godkjent (simulert)':'Til kontroll (demo)';remove.type='button';remove.className='secondary';remove.textContent='Fjern demolinje';remove.onclick=()=>{timeEntries.splice(index,1);renderTimes();};row.append(title,text,state,remove);list.append(row);});}
document.getElementById('time-form').addEventListener('submit',event=>{event.preventDefault();const value=id=>document.getElementById(id).value;const minutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};const start=minutes(value('time-start')),end=minutes(value('time-end')),pause=Number(value('time-break'));const error=document.getElementById('time-error');if(end<=start||!Number.isInteger(pause)||pause<0||pause>=end-start){error.textContent='Slutt må være etter start samme dag, og pausen må være kortere enn arbeidsperioden.';return;}const note=value('time-note').trim();if(!note){error.textContent='Beskriv kort hva som ble gjort.';return;}timeEntries.push({project:value('time-project'),date:value('time-date'),minutes:end-start-pause,note,approved:false});error.textContent='Demotimene er lagt til. Ingen data er sendt til Tripletex.';renderTimes();});
document.getElementById('approve-hours').onclick=()=>{timeEntries.forEach(e=>e.approved=true);renderTimes();};renderTimes();
