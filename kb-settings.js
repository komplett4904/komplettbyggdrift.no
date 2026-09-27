(function(){
 'use strict';
 const employee=KBAuth.employee;if(!employee)return;
 const embedded=window.parent!==window && new URLSearchParams(location.search).get('kbSettingsEmbed')==='1';
 const style=document.createElement('link');style.rel='stylesheet';style.href='/kb-settings.css?v=20260927';document.head.append(style);
 if(embedded){
   document.documentElement.classList.add('kb-settings-embedded');
   if(location.pathname==='/anbudskalkulator.html'){
     document.documentElement.classList.add('kb-settings-prices');
     openPrisInnstillinger();
   }
   return;
 }
 // Keep a single entry point; existing actions remain inside the settings window.
 document.querySelectorAll('[onclick*="loggUt()"],#engangskoderBtn').forEach(el=>el.style.setProperty('display','none','important'));
 const headerButton=document.querySelector('[onclick*="openPrisInnstillinger()"]');
 const floatingButton=document.getElementById('kb-settings-button');
 if(headerButton){headerButton.removeAttribute('onclick');headerButton.addEventListener('click',event=>{event.stopPropagation();open();});floatingButton.parentElement.hidden=true;floatingButton.parentElement.style.setProperty('display','none','important');}
 else floatingButton.addEventListener('click',()=>open());
 const dialog=document.createElement('dialog');dialog.id='kb-settings';dialog.setAttribute('aria-labelledby','kb-settings-title');
 dialog.innerHTML='<header class="kbs-header"><h2 id="kb-settings-title">Innstillinger</h2><button type="button" class="kbs-close" aria-label="Lukk innstillinger">✕</button></header><div class="kbs-layout"><aside><label class="kbs-search-label">Søk i innstillinger<input type="search" placeholder="Søk …" aria-label="Søk i innstillinger"></label><nav aria-label="Innstillingskategorier"></nav><button type="button" class="kbs-logout">Logg ut</button></aside><section class="kbs-content" aria-live="polite"></section></div>';
 document.body.append(dialog);
 const content=dialog.querySelector('.kbs-content'),nav=dialog.querySelector('nav');let selected='account';
 const categories=[{id:'account',name:'Min konto',hint:'Navn, e-post og innlogging'}];
 if(KBAuth.can('projects'))categories.push({id:'prices',name:'Priser og påslag',hint:'Prisliste, import og eksport'});
 if(KBAuth.can('demo'))categories.push({id:'demo',name:'Demokoder',hint:'Vis frem med eksempeldata'});
 if(employee.isAdmin)categories.push({id:'access',name:'Ansatte og tilganger',hint:'Administrer ansatte og verktøy'});
 categories.push({id:'tools',name:'Verktøy og integrasjoner',hint:'Kalender, Google og økonomi'});
 let priceModal=null;
 function show(id){
   selected=id;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.category===id?'page':'false'));
   Array.from(content.children).forEach(el=>el.hidden=true);
   let pane=content.querySelector('[data-pane="'+id+'"]');
   if(!pane){pane=document.createElement('div');pane.dataset.pane=id;content.append(pane);
     if(id==='account'){
       pane.innerHTML='<h3>Min konto</h3><p class="kbs-muted">Du bruker firmakontoen din fra Google.</p><div class="kbs-card"><h4></h4><p></p><span></span></div><p class="kbs-muted">Kontakt Stephen eller Eirik hvis du trenger tilgang til flere verktøy.</p>';
       pane.querySelector('h4').textContent=employee.name;pane.querySelector('.kbs-card p').textContent=employee.email;pane.querySelector('.kbs-card span').textContent=employee.isAdmin?'Administrator':'Ansatt';
     }else if(id==='tools'){
       pane.innerHTML='<h3>Verktøy og integrasjoner</h3><p class="kbs-muted">Åpne verktøyene du har tilgang til.</p>';
       for(const [module,label,url] of [['projects','Prosjekter og kalkulator','/anbudskalkulator.html'],['hms','HMS og stoffkartotek','/hms.html'],['calendar','Google Kalender / arbeidsplan','/kalender.html'],['finance','Økonomi / Tripletex','/okonomi.html']])if(KBAuth.can(module)){const a=document.createElement('a');a.className='kbs-tool';a.href=url;a.textContent=label+' →';pane.append(a);}
     }else if(id==='prices'&&document.getElementById('prisModal')){
       priceModal=document.getElementById('prisModal');pane.append(priceModal);priceModal.classList.add('kbs-inline-prices');openPrisInnstillinger();
     }else{
       const frame=document.createElement('iframe');frame.title=categories.find(c=>c.id===id).name;
       frame.src=({prices:'/anbudskalkulator.html',demo:'/demokoder.html',access:'/tilganger.html'})[id]+'?kbSettingsEmbed=1';pane.append(frame);
       frame.addEventListener('load',()=>{try{const doc=frame.contentDocument;if(!doc)return;for(const event of ['pointerdown','keydown','touchstart'])doc.addEventListener(event,()=>document.dispatchEvent(new Event('pointerdown')),{passive:true});doc.documentElement.classList.add('kb-settings-embedded');const link=doc.createElement('link');link.rel='stylesheet';link.href='/kb-settings.css?v=20260927';doc.head.append(link);}catch{}});
     }
   }
   pane.hidden=false;
   if(id==='prices'&&priceModal)priceModal.style.display='block';
 }
 for(const item of categories){const b=document.createElement('button');b.type='button';b.dataset.category=item.id;b.innerHTML='<strong></strong><small></small>';b.querySelector('strong').textContent=item.name;b.querySelector('small').textContent=item.hint;b.addEventListener('click',()=>show(item.id));nav.append(b);}
 dialog.querySelector('input').addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase('nb');nav.querySelectorAll('button').forEach(b=>b.hidden=!b.textContent.toLocaleLowerCase('nb').includes(q));});
 dialog.querySelector('.kbs-close').onclick=()=>dialog.close();
 dialog.querySelector('.kbs-logout').onclick=()=>KBAuth.logoutAndReturn();
 dialog.addEventListener('close',()=>{document.body.style.overflow='';});
 function open(){if(!dialog.open)dialog.showModal();document.body.style.overflow='hidden';show(selected);}
 window.KBSettings={open};
})();
