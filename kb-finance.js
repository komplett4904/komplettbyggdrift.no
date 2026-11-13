(function(){
'use strict';
// Share one request queue so dashboard sections do not create Tripletex sessions concurrently.
window.KBFinanceRequest=window.KBFinanceRequest||function(body){
 const run=()=>KBDatabase.getClient().functions.invoke('tripletex-overview',{body});
 const next=(window.KBFinancePending||Promise.resolve()).then(run,run);
 window.KBFinancePending=next.catch(()=>{});return next;
};

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
help.innerHTML='<h3>Økonomi forklart enkelt</h3><p><strong>Inntekter</strong> er det vi har tjent på jobber og salg. <strong>Kostnader</strong> er blant annet materialer, lønn og bilhold. Det som står igjen, er <strong>driftsresultatet</strong>.</p>'+
'<div class="finance-help-example"><strong>Eksempel</strong><p>100 000 kr i inntekter og 85 000 kr i kostnader gir 15 000 kr i driftsoverskudd. Det er <strong>15 % driftsmargin</strong>, eller 15 kr igjen av hver hundrelapp før renter og skatt.</p></div>'+
'<p>En faktura kan telle som inntekt før kunden har betalt. For å se hvor mye penger vi har tilgjengelig, sjekk bankkontoen og regningene som forfaller.</p>'+
'<p><strong>Grafen:</strong> Pek på eller trykk på en måned for å se månedens tall og samlet driftsresultat fra januar til den måneden.</p>'+
'<p><strong>Mot i fjor:</strong> Vi sammenligner de samme avsluttede månedene. Denne måneden er foreløpig. «Oppdater tall» henter det som er bokført i Tripletex nå.</p>';
info.append(help);
const summary=document.createElement('div');summary.className='finance-summary';
for(const [title,value] of [['Driftsresultat',income-cost],['Driftsinntekter',income],['Driftskostnader',cost]]){const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=nok(value);p.append(document.createTextNode(title),strong);summary.append(p);}
const svg=svgEl('svg',{viewBox:'0 0 900 330',class:'finance-chart',role:'group','aria-label':'Månedlige driftsinntekter og driftskostnader, med akkumulert driftsresultat. Nøyaktige tall finnes i tabellen nedenfor.'});
const values=rows.flatMap(r=>[r.income,r.cost,r.accumulated]).filter(v=>v!==null),min=Math.min(0,...values),max=Math.max(1,...values),range=max-min,y=v=>25+(max-v)/range*245,zero=y(0);
for(let t=0;t<=4;t++){const v=min+range*t/4,yp=y(v);svg.append(svgEl('line',{x1:80,x2:890,y1:yp,y2:yp,stroke:'#e4ebf0'}),svgEl('text',{x:72,y:yp+4,'text-anchor':'end','font-size':11,fill:'#566979'},new Intl.NumberFormat('nb-NO',{notation:'compact'}).format(v)));}
const points=[];
rows.forEach((r,i)=>{const x=92+i*66;svg.append(svgEl('text',{x:x+23,y:293,'text-anchor':'middle','font-size':12,fill:'#566979'},names[i]));if(r.income===null)return;
for(const [v,dx,color] of [[r.income,0,'#718dff'],[r.cost,26,'#ffbf70']]){const rect=svgEl('rect',{x:x+dx,y:Math.min(zero,y(v)),width:24,height:Math.max(1,Math.abs(y(v)-zero)),rx:4,fill:color});svg.append(rect);}
points.push((x+23)+','+y(r.accumulated));
});svg.append(svgEl('polyline',{points:points.join(' '),fill:'none',stroke:'#204ecf','stroke-width':4,'stroke-linejoin':'round'}));
const legend=document.createElement('p');legend.textContent='Blå søyler: inntekter · Oransje søyler: kostnader · Blå linje: akkumulert driftsresultat';legend.className='finance-note';
const details=document.createElement('details'),caption=document.createElement('summary');caption.textContent='Vis månedstall';details.append(caption);const table=document.createElement('table');
const header=document.createElement('tr');for(const t of ['Måned','Inntekter','Kostnader','Akkumulert']){const th=document.createElement('th');th.scope='col';th.textContent=t;header.append(th);}table.append(header);
for(const r of rows){const tr=document.createElement('tr');for(const v of [names[r.month-1],r.income===null?'–':nok(r.income),r.cost===null?'–':nok(r.cost),r.accumulated===null?'–':nok(r.accumulated)]){const td=document.createElement('td');td.textContent=v;tr.append(td);}table.append(tr);}details.append(table);
const note=document.createElement('p');note.className='finance-note';note.textContent='Bokførte bevegelser på konto 3000–3999 (inntekter) og 4000–7999 (kostnader), i NOK. Finansposter og skatt er ikke med. Tallene kan endres ved årsoppgjøret. Pågående måned er foreløpig. Fremtidige måneder vises uten tall.';
const chartFrame=document.createElement('div');chartFrame.className='finance-chart-frame';chartFrame.tabIndex=0;chartFrame.setAttribute('aria-label','Økonomigraf. Sveip sidelengs på små skjermer.');chartFrame.append(svg);
const tooltip=document.createElement('div');
tooltip.hidden=true;
tooltip.style.cssText='position:fixed;z-index:200;pointer-events:none;max-width:calc(100vw - 16px);padding:12px 14px;border:1px solid var(--border,#9cb3c6);border-radius:10px;background:var(--card,#fff);color:var(--text,#183244);box-shadow:0 4px 18px #0003;font-size:14px;line-height:1.55';

const percent=new Intl.NumberFormat('nb-NO',{style:'percent',maximumFractionDigits:1});
let selected=null;
function hideTooltip(){tooltip.hidden=true;selected?.setAttribute('fill-opacity','0');selected=null;}
rows.forEach((row,index)=>{
 if(row.income===null)return;
 const month=names[index]+' '+data.year;
 const result=row.income-row.cost;
 const lines=[month,'Inntekter: '+nok(row.income),'Kostnader: '+nok(row.cost),'Driftsresultat: '+nok(result),
  'Driftsmargin: '+(row.income>0?percent.format(result/row.income):'–'),'Driftsresultat hittil i år: '+nok(row.accumulated)];
 const target=svgEl('rect',{x:82+index*66,y:23,width:66,height:280,fill:'currentColor','fill-opacity':0,tabindex:0,role:'button','aria-label':lines.join('. ')});
 target.style.cursor='pointer';
 function show(){
  hideTooltip();selected=target;target.setAttribute('fill-opacity','0.09');
  tooltip.replaceChildren(...lines.map((line,i)=>{const node=document.createElement(i===0?'strong':'div');node.textContent=line;return node;}));
  tooltip.hidden=false;
  const anchor=target.getBoundingClientRect(),box=tooltip.getBoundingClientRect();
  const left=Math.min(window.innerWidth-box.width-8,anchor.right+8);
  tooltip.style.left=Math.max(8,left)+'px';
  tooltip.style.top=Math.max(8,Math.min(anchor.top+8,window.innerHeight-box.height-8))+'px';
 }
 target.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')show();});
 target.addEventListener('pointerleave',()=>{if(document.activeElement!==target)hideTooltip();});
 target.addEventListener('focus',show);
 target.addEventListener('blur',hideTooltip);
 target.addEventListener('click',show);
 target.addEventListener('keydown',event=>{
  if(event.key==='Escape'){hideTooltip();return;}
  if(event.key==='Enter'||event.key===' '){event.preventDefault();show();}
 });
 svg.append(target);
});
chartFrame.addEventListener('scroll',hideTooltip);
const dismiss=event=>{if(!svg.contains(event.target))hideTooltip();};
const onViewportChange=()=>hideTooltip();
window.financeChartCleanup?.();
document.addEventListener('pointerdown',dismiss);
window.addEventListener('scroll',onViewportChange,{passive:true});
window.addEventListener('resize',onViewportChange);
window.financeChartCleanup=()=>{
 document.removeEventListener('pointerdown',dismiss);
 window.removeEventListener('scroll',onViewportChange);
 window.removeEventListener('resize',onViewportChange);
 hideTooltip();
};
if(host.classList.contains('kb-finance-home')){const more=document.createElement('details'),toggle=document.createElement('summary');toggle.textContent='Vis graf og forklaring';more.append(toggle,info,chartFrame,tooltip,legend,details,note);results.replaceChildren(summary,more);}else results.replaceChildren(info,summary,chartFrame,tooltip,legend,details,note);
const insights=document.createElement('div');
insights.className='finance-note';
const period=document.createElement('p');
const osloDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const [currentYear,currentMonth]=osloDate.split('-').map(Number);
const lastAvailable=rows.findLast(row=>Number.isFinite(row.income))?.month;
const monthSpan=count=>count===1?'jan':'jan–'+names[count-1];
if(lastAvailable)period.textContent='Bokført periode: '+monthSpan(lastAvailable)+' '+data.year+(Number(data.year)===currentYear&&lastAvailable===currentMonth?' · inneværende måned er foreløpig':'');
const margin=document.createElement('p');
if(income>0&&Number.isFinite((income-cost)/income*100)){
 const value=(income-cost)/income*100;
 const amount=new Intl.NumberFormat('nb-NO',{maximumFractionDigits:1}).format(Math.abs(value));
 const percent=new Intl.NumberFormat('nb-NO',{maximumFractionDigits:1}).format(value);
 margin.textContent='Driftsmargin: '+percent+' % · '+amount+' kr '+(value<0?'i underskudd':'igjen')+' per 100 kr i driftsinntekt, før renter og skatt.';
}
const comparison=document.createElement('p');
comparison.setAttribute('role','status');
const guide=document.createElement('section');
guide.className='finance-benchmark';
const guideHeading=document.createElement('h3');
guideHeading.textContent='Sammenlign med Frydendal og andre lokale bedrifter';
guideHeading.style.marginBottom='6px';
guide.append(guideHeading);
const benchmark=document.createElement('p');
const frydendal=3432/19103*100;
const localFormat=new Intl.NumberFormat('nb-NO',{maximumFractionDigits:1});
const ownMargin=income>0?(income-cost)/income*100:null;
const gap=ownMargin===null?null:Math.round((ownMargin-frydendal)*10)/10;
benchmark.textContent='Frydendal er en lokal målestokk. '+(gap===null?'':gap===0?'Dere ligger omtrent likt i prosent. ': 'Dere ligger '+localFormat.format(Math.abs(gap))+' prosentpoeng '+(gap>0?'over':'under')+' Frydendals 2025-margin. ')+' Tallene deres gjelder perioden over. De lokale regnskapstallene gjelder hele 2025.';
guide.append(benchmark);
for(const [group, companies] of [
 ['Tømrer og bygg',[
 ['Tømrermester Frydendal',18.0,'https://www.proff.no/regnskap/t%C3%B8mrermester-frydendal-as/tvedestrand/bygg-og-anleggsleverand%C3%B8rer/IF3QBNH0CVG'],
 ['Sørensen & Moen Bygg',7.1,'https://firmadatabasen.no/selskap/sorensen-moen-bygg-as/996546438'],
 ['Multiflis',5.8,'https://www.proff.no/regnskap/multiflis-as/arendal/bygningsh%C3%A5ndverkere/IGESFB507TR']]],
 ['Rørlegger og VVS',[
 ['Olsen Erling',9.3,'https://www.proff.no/regnskap/olsen-erling-as/tvedestrand/r%C3%B8rleggertjenester/IG2KZNF07RG'],
 ['Velure AS',-0.1,'https://www.proff.no/selskap/bvs-klima-og-r%C3%B8r-as/tvedestrand/-/IDP7W8W0000'],
 ['Sørlandet VVS',2.4,'https://aktie.no/bedrift/933001539']]]
]){
 const heading=document.createElement('h4');heading.textContent=group+' · helår 2025';
 const examples=document.createElement('ul');
 for(const [name,margin,url] of companies){
  const item=document.createElement('li'),link=document.createElement('a');
  link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=name;
  const value=document.createElement('strong');
  value.textContent=localFormat.format(margin)+' %';
  value.setAttribute('aria-label',value.textContent+' driftsmargin');
  item.append(link,value);examples.append(item);
 }
 guide.append(heading,examples);
}
insights.append(period,margin,comparison,guide);
summary.after(insights);
const selectedYear=Number(data.year);
const closedMonths=selectedYear===currentYear?currentMonth-1:selectedYear<currentYear?12:0;
const completedResult=(months,count)=>{
 if(!Array.isArray(months)||months.length!==12)return null;
 const window=months.slice(0,count);
 if(!window.every((month,index)=>month?.month===index+1&&Number.isFinite(month.income)&&Number.isFinite(month.cost)))return null;
 return window.reduce((sum,month)=>sum+month.income-month.cost,0);
};
const currentResult=closedMonths?completedResult(rows,closedMonths):null;
if(!closedMonths)comparison.textContent='Sammenligning blir tilgjengelig når første måned er avsluttet.';
else if(currentResult===null)comparison.textContent='Sammenligning krever tall for alle avsluttede måneder.';
else{
 const comparisonPeriod=monthSpan(closedMonths)+' '+selectedYear+' mot '+(selectedYear-1);
 comparison.textContent='Henter sammenligning for '+comparisonPeriod+' …';
 KBFinanceRequest({year:selectedYear-1}).then(({data:previous,error})=>{
  if(error||!previous?.connected||Number(previous.year)!==selectedYear-1||previous.basis!==data.basis)throw Error();
  const previousResult=completedResult(previous.months,closedMonths);
  if(previousResult===null)throw Error();
  const delta=currentResult-previousResult;
  comparison.textContent='Driftsresultat '+comparisonPeriod+': '+nok(currentResult)+' mot '+nok(previousResult)+'. '+(Math.round(Math.abs(delta))===0?'Omtrent likt.':nok(Math.abs(delta))+(delta>0?' høyere.':' lavere.'));
 }).catch(()=>{comparison.textContent='Sammenligning for '+comparisonPeriod+' er ikke tilgjengelig.';});
}
const top=document.createElement('section'),heading=document.createElement('h3'),explain=document.createElement('p'),list=document.createElement('ol');top.className='finance-top-customers';heading.textContent='Våre fem største kunder · '+data.year;explain.className='finance-note';explain.textContent='Henter fakturert omsetning …';top.append(heading,explain,list);(host.classList.contains('kb-finance-home')?results.querySelector('details'):results).append(top);
KBFinanceRequest({view:'topCustomers',year:data.year}).then(({data:ranking,error})=>{
 if(error||!ranking?.ok||ranking.basis!=='invoiced_ex_vat_nok_credit_notes_net'||!Array.isArray(ranking.customers))throw Error('Kundeoversikten kunne ikke hentes. Trykk «Oppdater tall» for å prøve igjen.');
 explain.textContent='Fakturert omsetning uten MVA i valgt år, i NOK. Kreditnotaer er trukket fra. Dette viser salg, ikke fortjeneste eller innbetalinger.';
 for(const customer of ranking.customers){if(!Number.isSafeInteger(customer.cents))throw Error('Kundebeløpene kunne ikke bekreftes.');const item=document.createElement('li');item.textContent=customer.name+' — '+nok(customer.cents/100);item.style.padding='8px 0';list.append(item);}if(!ranking.customers.length)list.append(document.createTextNode('Ingen kunder med positiv fakturert omsetning i perioden.'));
}).catch(e=>{list.replaceChildren();explain.textContent=e.message;});
}
async function load(){window.financeChartCleanup?.();button.disabled=true;year.disabled=true;results.replaceChildren();status.textContent='Henter økonomitall fra Tripletex …';try{
const {data,error}=await KBFinanceRequest({year:Number(year.value)});
if(error){let code='';try{code=(await error.context.json()).error||'';}catch{}const messages={ledger_access_failed:'Tripletex gir ikke integrasjonen tilgang til regnskapstallene ennå.',login_required:'Logg inn på nytt.',employee_required:'Du har ikke tilgang til økonomi.',tripletex_auth_failed:'Tripletex-nøkkelen kunne ikke bekreftes.'};throw Error(messages[code]||'Økonomitallene kunne ikke hentes'+(code?' ('+code+')':'')+'. Prøv igjen.');}
if(!data?.connected)throw Error('Forbindelsen er ikke bekreftet.');render(data);status.textContent=data.company+' · Oppdatert '+new Date(data.checkedAt).toLocaleString('nb-NO');
}catch(e){results.replaceChildren();status.textContent=e.message;}finally{button.disabled=false;year.disabled=false;}}
button.addEventListener('click',load);year.addEventListener('change',load);load();
})();
