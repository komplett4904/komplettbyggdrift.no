(function(){
 'use strict';
 const key='kb-project-context';let context;
 try{context=JSON.parse(sessionStorage.getItem(key)||'null');}catch{return;}
 if(!context)return;
 const page=location.pathname;
 const matching=page==='/hms.html'&&['sja','avvik'].includes(context.kind)||page==='/timer.html'&&context.kind==='time';
 if(!matching)return;
 sessionStorage.removeItem(key);
 if(context.employee!==KBAuth.employee?.id||!Number.isFinite(context.created)||Date.now()-context.created>30*60*1000||context.created>Date.now()+60000)return;
 const name=String(context.name||'').slice(0,200),address=String(context.address||'').slice(0,300);
 if(page==='/hms.html'&&KBAuth.can('hms')){
  const kind=context.kind;if(typeof settSub==='function')settSub(kind);if(kind==='sja'&&typeof nySja==='function')nySja();else if(kind==='avvik'&&typeof nyttAvvik==='function')nyttAvvik();else return;
  const project=document.getElementById(kind+'-prosjekt'),place=document.getElementById(kind+'-sted');
  if(project)project.value=name;if(place)place.value=address;
  const date=document.getElementById(kind+'-dato');if(date)date.value=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  project?.focus();
 }
 if(page==='/timer.html'&&KBAuth.can('projects')){
  const search=document.getElementById('project-search'),select=document.getElementById('time-project');if(!search||!select)return;
  const note=document.createElement('p');note.className='note';note.setAttribute('role','status');note.textContent='Fra prosjekt: '+name+'. Velg riktig prosjekt i listen. Ingen klokke er startet.';search.before(note);
  // Filter only. A local calculation and a Tripletex project need not share an ID.
  search.value=name;search.dispatchEvent(new Event('input',{bubbles:true}));
 }
})();
