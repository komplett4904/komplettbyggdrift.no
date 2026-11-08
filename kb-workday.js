(function(){
 'use strict';
 if(window.parent!==window)return;
 const home=document.getElementById('hovedmeny');if(!home)return;
 const employee=KBAuth.employee;
 const style=document.createElement('link');style.rel='stylesheet';style.href='/kb-workday.css?v=20261108';document.head.append(style);
 const day=document.createElement('section');day.id='kb-workday';day.className='kb-quick';
 const date=document.createElement('p');date.className='workday-date';date.textContent=new Intl.DateTimeFormat('nb-NO',{timeZone:'Europe/Oslo',weekday:'long',day:'numeric',month:'long'}).format(new Date());
 const heading=document.createElement('h1');heading.textContent='Hei, '+(employee?.name||'kollega')+'!';
 const intro=document.createElement('p');intro.textContent='Hva vil du starte med i dag?';
 const actions=document.createElement('div');actions.className='workday-actions';
 function action(label,run){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=run;actions.append(b);}
 function link(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;actions.append(a);return a;}
 if(KBAuth.can('projects')){action('+ Nytt prosjekt',()=>nyttProsjekt());action('Finn prosjekt',()=>openProsjekter());link('Lag tilbud','/tilbud.html');}
 if(KBAuth.can('calendar')){
  link('Arbeidsplan','/kalender.html');
  const url=new URL('https://calendar.google.com/calendar/u/0/r/day');url.searchParams.set('authuser',employee.email);
  const calendar=link('Dagens kalender ↗',url.href);calendar.target='_blank';calendar.rel='noopener noreferrer';
 }
 if(KBAuth.can('hms'))link('Åpne HMS','/hms.html');
 const network=document.createElement('p');network.id='workday-network';network.setAttribute('role','status');
 function connectivity(){network.hidden=navigator.onLine;network.textContent=navigator.onLine?'':'Du er uten nett. Skylagring og oppdatering kan vente. Behold siden åpen og kontroller lagringsstatus når nettet er tilbake.';}
 window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);connectivity();
 day.append(date,heading,intro,actions,network);home.prepend(day);
 const recent=home.querySelector('.kb-quick:not(#kb-workday)');if(recent)day.after(recent);
 const finance=document.getElementById('kb-finance');if(finance){finance.classList.add('workday-finance');home.append(finance);finance.querySelector('.finance-scroll')?.remove();}
 const title=document.getElementById('hovedmenyTittel');if(title){title.textContent='Kalkulator og flere verktøy';const sub=title.nextElementSibling;if(sub?.classList.contains('page-sub'))sub.textContent='Velg verktøyet du trenger til oppdraget.';}
 const dialog=document.createElement('dialog');dialog.id='kb-project-overview';dialog.setAttribute('aria-labelledby','project-overview-title');document.body.append(dialog);
 window.KBProjectOverview=function(id){
  const p=lasteProsjekter().find(item=>item.id===id);if(!p)return;
  dialog.replaceChildren();
  const close=document.createElement('button');close.type='button';close.className='project-close';close.textContent='Lukk';close.onclick=()=>dialog.close();
  const h=document.createElement('h2');h.id='project-overview-title';h.textContent=p.navn||'Prosjekt';
  const customer=document.createElement('p');customer.textContent=p.kunde||'Kunde er ikke lagt inn ennå.';
  const address=p.state?.tilbud?.sted||'';
  const addressLine=document.createElement('p');addressLine.textContent=address||'Adresse er ikke lagt inn ennå.';
  const buttons=document.createElement('div');buttons.className='workday-actions';
  function button(label,run){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=run;buttons.append(b);}
  button('Åpne prosjekt og bilder',()=>{dialog.close();lastInnProsjekt(id);});
  if(KBAuth.can('calendar'))button('Planlegg arbeidet',()=>{dialog.close();startProsjekt(id);});
  if(address){const map=document.createElement('a');const url=new URL('https://www.google.com/maps/search/');url.searchParams.set('api','1');url.searchParams.set('query',address);map.href=url.href;map.target='_blank';map.rel='noopener noreferrer';map.textContent='Vis adresse i kart ↗';buttons.append(map);}
  const note=document.createElement('p');note.className='project-note';note.textContent='Kundedetaljer, kalkyle og prosjektbilder finnes i prosjektet. Arbeidsplanen åpnes med prosjektnavn og adresse ferdig utfylt.';
  dialog.append(close,h,customer,addressLine,buttons,note);dialog.showModal();
 };
})();
