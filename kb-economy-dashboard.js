(function(){
'use strict';
// Share one request queue so dashboard sections do not create Tripletex sessions concurrently.
window.KBFinanceRequest=window.KBFinanceRequest||function(body){
 const run=()=>KBDatabase.getClient().functions.invoke('tripletex-overview',{body});
 const next=(window.KBFinancePending||Promise.resolve()).then(run,run);
 window.KBFinancePending=next.catch(()=>{});return next;
};

if(!KBAuth.can('finance'))return;
const client=KBDatabase.getClient(),status=document.getElementById('invoices-status'),results=document.getElementById('invoices-results'),refresh=document.getElementById('invoices-refresh');
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function money(cents,currency){return new Intl.NumberFormat('nb-NO',{style:'currency',currency,maximumFractionDigits:2}).format(cents/100);}
function date(d){return d?new Date(d+'T12:00:00Z').toLocaleDateString('nb-NO'):'Ikke oppgitt';}
function render(data){
if(!data.ok||!Array.isArray(data.groups))throw Error('Fakturaoversikten kunne ikke bekreftes.');
const fragment=document.createDocumentFragment();
if(!data.groups.length)fragment.append(el('p','Ingen åpne fakturaer med restbeløp ble funnet i Tripletex.'));
for(const g of data.groups){
if(!/^[A-Z]{3}$/.test(g.currency)||!Array.isArray(g.items)||!['outstandingCents','overdue30Cents','overdueOlderCents','due14Cents','creditCents'].every(k=>Number.isSafeInteger(g[k])&&g[k]>=0))throw Error('Fakturabeløpene kunne ikke bekreftes.');
const group=el('div',undefined,'invoice-currency-group');if(data.groups.length>1)group.append(el('h3',g.currency+' – vises separat, uten valutaomregning'));
const cards=el('div',undefined,'invoice-metrics');
for(const [label,key,description,tone] of [
['Kunder skylder','outstandingCents',g.count+' fakturaer med positivt restbeløp. Før eventuelle åpne kreditnotaer.',''],
['Forfalt 1–30 dager','overdue30Cents','Beløp med betalingsfrist som er passert. Del av summen «Kunder skylder».','attention'],
['Forfalt over 30 dager','overdueOlderCents','De eldste forfalte beløpene. Del av summen «Kunder skylder».','late'],
['Forfaller neste 14 dager','due14Cents','Fra og med i dag til og med om 14 dager. Del av summen «Kunder skylder».','']]){
const card=el('div',undefined,'invoice-metric '+tone);card.append(el('span',label),el('strong',money(g[key],g.currency)),el('small',description));cards.append(card);
}group.append(cards);
if(g.creditCents>0)group.append(el('p',g.creditCount+' åpne kreditnotaer / beløp til gode: '+money(g.creditCents,g.currency)+'. Disse er vist separat. Kontroller i Tripletex hvilke fakturaer de skal gjøres opp mot.','invoice-credit'));
if(g.missingDueDateCount)group.append(el('p',g.missingDueDateCount+' fakturaer mangler gyldig forfallsdato og er bare med i totalen. Kontroller dem i Tripletex.','invoice-credit'));
if(g.items.length){
group.append(el('h3','Fakturaer – eldste forfall først'),el('p','Viser opptil 20 åpne fakturaer. Kontroller innbetalinger og avtaler med kunden før du følger opp.','economy-note'));
const wrap=el('div',undefined,'invoice-table-wrap');wrap.tabIndex=0;wrap.setAttribute('aria-label','Fakturaliste, kan rulles sidelengs på små skjermer');const table=el('table'),thead=el('thead'),tr=el('tr');for(const title of ['Faktura','Kunde','Forfallsdato','Status','Restbeløp']){const th=el('th',title);th.scope='col';tr.append(th);}thead.append(tr);table.append(thead);const body=el('tbody');
for(const item of g.items){const row=el('tr');const days=item.daysOverdue;const text=days===null?'Mangler dato':days>0?days+' dager over forfall':days===0?'Forfaller i dag':'Forfaller om '+(-days)+' dager';for(const value of [String(item.number??'–'),item.customer||'Se Tripletex',date(item.dueDate),text,money(item.amountCents,g.currency)])row.append(el('td',value));if(days>30)row.className='invoice-row-late';body.append(row);}table.append(body);wrap.append(table);group.append(wrap);
}fragment.append(group);
}
results.replaceChildren(fragment);status.textContent='Status per '+date(data.asOf)+' · Hentet '+new Date(data.checkedAt).toLocaleString('nb-NO');
}
async function load(){refresh.disabled=true;results.replaceChildren();status.textContent='Henter fakturaoversikt fra Tripletex …';try{
const {data,error}=await KBFinanceRequest({view:'dashboard'});
if(error){let code='';try{code=(await error.context.json()).error||'';}catch{}const messages={invoice_access_failed:'Fakturaoversikten er ikke tilgjengelig fra Tripletex med dagens tilgang.',invoices_changed_retry:'Fakturaene ble oppdatert mens vi hentet dem. Trykk Oppdater fakturaer.',employee_required:'Du har ikke tilgang til økonomi.',login_required:'Logg inn på nytt.'};throw Error(messages[code]||'Fakturaoversikten kunne ikke hentes'+(code?' ('+code+')':'')+'. Prøv igjen.');}render(data);
}catch(e){results.replaceChildren();status.textContent=e.message;}finally{refresh.disabled=false;}}
refresh.addEventListener('click',load);load();
})();
