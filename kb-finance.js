(function(){
'use strict';
const host=document.getElementById('kb-finance');if(!host||!KBAuth.can('finance'))return;host.hidden=false;
const status=document.getElementById('finance-status'),button=document.getElementById('finance-retry'),section=button.parentElement;
const year=document.createElement('select'),label=document.createElement('label');label.textContent='Regnskapsår';year.setAttribute('aria-label','Regnskapsår');
for(let y=new Date().getFullYear();y>=2020;y--){const o=document.createElement('option');o.value=y;o.textContent=y;year.append(o);}label.append(year);section.prepend(label);
const results=document.createElement('div');section.append(results);button.textContent='Oppdater tall';
const names=['jan','feb','mars','apr','mai','juni','juli','aug','sep','okt','nov','des'];
const nok=n=>new Intl.NumberFormat('nb-NO',{maximumFractionDigits:0}).format(n)+' kr';
const svgNS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs,text){const n=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function render(data){
const report=section.querySelector('a');report.textContent='Se detaljert rapport i Tripletex →';report.href='https://tripletex.no/execute/report/view?period.endDate='+data.year+'-12-31&period.periodType=1&period.startDate='+data.year+'-01-01&reportId=16834&contextId=24707790';
if(!Array.isArray(data.months)||data.months.length!==12||data.basis!=='operating_accounts_3000_7999')throw Error('Tallgrunnlaget kunne ikke bekreftes.');
let accumulated=0,income=0,cost=0;
const rows=data.months.map((m,i)=>{if(m.month!==i+1||!(m.income===null&&m.cost===null)&&(!Number.isFinite(m.income)||!Number.isFinite(m.cost)))throw Error('Ugyldig tallgrunnlag.');if(m.income===null)return {...m,accumulated:null};income+=m.income;cost+=m.cost;accumulated+=m.income-m.cost;return {...m,accumulated};});
const info=document.createElement('details');info.className='finance-help';
const infoButton=document.createElement('summary');infoButton.textContent='ⓘ Hva betyr tallene?';info.append(infoButton);
const help=document.createElement('div');help.className='finance-help-content';
help.innerHTML='<h3>Økonomi forklart enkelt</h3><p>Disse tallene viser hvordan selve driften går i året du har valgt. De bygger på det som er ført i regnskapet i Tripletex, og summerer månedene som vises i grafen.</p>'+
'<h4>Driftsinntekter – det firmaet har tjent på jobber og salg</h4><p>For eksempel inntekter fra rørleggerarbeid, byggearbeid og materialer dere selger. En faktura kan være registrert som inntekt selv om kunden ikke har betalt ennå. Innbetalinger av lån er ikke driftsinntekter.</p>'+
'<h4>Driftskostnader – det det koster å drive firmaet</h4><p>For eksempel materialer, lønn, arbeidsgiveravgift, underleverandører, bilhold, forsikring og husleie. Det er kostnadene som er bokført i perioden som teller, også når regningen ikke er betalt ennå. Større kjøp kan fordeles over flere år i regnskapet; derfor er ikke alle utbetalinger en kostnad med en gang.</p>'+
'<h4>Driftsresultat – inntekter minus kostnader</h4><p>Dette er forskjellen mellom de to første tallene. Pluss betyr at driften har gitt overskudd i perioden. Minus betyr at de bokførte driftskostnadene er større enn driftsinntektene.</p>'+
'<div class="finance-help-example"><strong>Et enkelt eksempel</strong><p>Dere har 100 000 kr i driftsinntekter og 75 000 kr i driftskostnader.</p><p><strong>100 000 − 75 000 = 25 000 kr i driftsresultat.</strong></p><p>Alle beløp i eksemplet er uten MVA.</p></div>'+
'<h4>Betyr overskudd at vi har så mye penger på konto?</h4><p>Nei. Kunden kan fortsatt skylde dere penger, og dere kan ha regninger, MVA, skatt eller lån å betale. Resultatet er derfor ikke beløpet dere fritt kan bruke eller ta ut. MVA dere krever inn for staten er normalt ikke en driftsinntekt.</p>'+
'<h4>Slik leser du grafen</h4><p>Blå søyler viser inntektene hver måned. Oransje søyler viser kostnadene. Den blå linjen legger sammen månedenes driftsresultat fra januar og fremover. Det er dette «akkumulert» betyr. En god måned kan løfte linjen selv om året samlet fortsatt går i minus.</p>'+
'<h4>Hva er ikke med, og hvor oppdaterte er tallene?</h4><p>Denne oversikten viser driften, uten finansinntekter, finanskostnader (for eksempel renter), og skatt. Tallene kan også endres ved årsoppgjøret. Visningen er derfor ikke et ferdig årsresultat. Bilag som ikke er bokført ennå, er heller ikke med. Inneværende måned er foreløpig, og tallene kan endre seg når flere bilag føres eller korrigeres.</p><p>Bruk «Oppdater tall» for å hente på nytt. Tidspunktet over viser når tallene sist ble hentet. Åpne «Se detaljert rapport i Tripletex» for å undersøke hva som ligger bak dem.</p>';
info.append(help);
const summary=document.createElement('div');summary.className='finance-summary';
for(const [title,value] of [['Driftsinntekter',income],['Driftskostnader',cost],['Driftsresultat',income-cost]]){const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=nok(value);p.append(document.createTextNode(title),strong);summary.append(p);}
const svg=svgEl('svg',{viewBox:'0 0 900 330',class:'finance-chart',role:'img','aria-label':'Månedlige driftsinntekter og driftskostnader, med akkumulert driftsresultat. Nøyaktige tall finnes i tabellen nedenfor.'});
const values=rows.flatMap(r=>[r.income,r.cost,r.accumulated]).filter(v=>v!==null),min=Math.min(0,...values),max=Math.max(1,...values),range=max-min,y=v=>25+(max-v)/range*245,zero=y(0);
for(let t=0;t<=4;t++){const v=min+range*t/4,yp=y(v);svg.append(svgEl('line',{x1:80,x2:890,y1:yp,y2:yp,stroke:'#e4ebf0'}),svgEl('text',{x:72,y:yp+4,'text-anchor':'end','font-size':11,fill:'#566979'},new Intl.NumberFormat('nb-NO',{notation:'compact'}).format(v)));}
const points=[];
rows.forEach((r,i)=>{const x=92+i*66;svg.append(svgEl('text',{x:x+23,y:293,'text-anchor':'middle','font-size':12,fill:'#566979'},names[i]));if(r.income===null)return;
for(const [v,dx,color] of [[r.income,0,'#718dff'],[r.cost,26,'#ffbf70']]){const rect=svgEl('rect',{x:x+dx,y:Math.min(zero,y(v)),width:24,height:Math.max(1,Math.abs(y(v)-zero)),rx:4,fill:color});rect.append(svgEl('title',{},names[i]+': '+nok(v)));svg.append(rect);}
points.push((x+23)+','+y(r.accumulated));
});svg.append(svgEl('polyline',{points:points.join(' '),fill:'none',stroke:'#204ecf','stroke-width':4,'stroke-linejoin':'round'}));
const legend=document.createElement('p');legend.textContent='Blå søyler: inntekter · Oransje søyler: kostnader · Blå linje: akkumulert driftsresultat';legend.className='finance-note';
const details=document.createElement('details'),caption=document.createElement('summary');caption.textContent='Vis månedstall';details.append(caption);const table=document.createElement('table');
const header=document.createElement('tr');for(const t of ['Måned','Inntekter','Kostnader','Akkumulert']){const th=document.createElement('th');th.scope='col';th.textContent=t;header.append(th);}table.append(header);
for(const r of rows){const tr=document.createElement('tr');for(const v of [names[r.month-1],r.income===null?'–':nok(r.income),r.cost===null?'–':nok(r.cost),r.accumulated===null?'–':nok(r.accumulated)]){const td=document.createElement('td');td.textContent=v;tr.append(td);}table.append(tr);}details.append(table);
const note=document.createElement('p');note.className='finance-note';note.textContent='Bokførte bevegelser på konto 3000–3999 (inntekter) og 4000–7999 (kostnader), i NOK. Finansposter og skatt er ikke med. Tallene kan endres ved årsoppgjøret. Pågående måned er foreløpig. Fremtidige måneder vises uten tall.';
const chartFrame=document.createElement('div');chartFrame.className='finance-chart-frame';chartFrame.tabIndex=0;chartFrame.setAttribute('aria-label','Økonomigraf. Sveip sidelengs på små skjermer.');chartFrame.append(svg);
results.replaceChildren(info,summary,chartFrame,legend,details,note);
}
async function load(){button.disabled=true;year.disabled=true;results.replaceChildren();status.textContent='Henter økonomitall fra Tripletex …';try{
const {data,error}=await KBDatabase.getClient().functions.invoke('tripletex-overview',{body:{year:Number(year.value)}});
if(error){let code='';try{code=(await error.context.json()).error||'';}catch{}const messages={ledger_access_failed:'Tripletex gir ikke integrasjonen tilgang til regnskapstallene ennå.',login_required:'Logg inn på nytt.',employee_required:'Du har ikke tilgang til økonomi.',tripletex_auth_failed:'Tripletex-nøkkelen kunne ikke bekreftes.'};throw Error(messages[code]||'Økonomitallene kunne ikke hentes'+(code?' ('+code+')':'')+'. Prøv igjen.');}
if(!data?.connected)throw Error('Forbindelsen er ikke bekreftet.');render(data);status.textContent=data.company+' · Oppdatert '+new Date(data.checkedAt).toLocaleString('nb-NO');
}catch(e){results.replaceChildren();status.textContent=e.message;}finally{button.disabled=false;year.disabled=false;}}
button.addEventListener('click',load);year.addEventListener('change',load);load();
})();
