(async function(){
 'use strict';
 const client=KBDatabase.getClient(),status=document.getElementById('access-status'),list=document.getElementById('access-list');
 const labels={projects:'Prosjekter og kalkulator',hms:'HMS og stoffkartotek',calendar:'Kalender',demo:'Opprette demokoder',feedback:'Tilbakemeldinger',finance:'Økonomi / Tripletex'};
 const admins=new Set(['stephen@komplettbyggdrift.no','eirik@komplettbyggdrift.no']);
 async function load(){
  const {data,error}=await client.from('kb_access').select('email,name,active,modules').order('name');
  if(error)throw Error('Tilgangene kunne ikke lastes. Prøv å laste siden på nytt.');
  list.replaceChildren();
  for(const row of data){
   const card=document.createElement('section'),heading=document.createElement('h2'),email=document.createElement('small');heading.textContent=row.name;email.textContent=row.email;card.append(heading,email);
   if(admins.has(row.email)){const p=document.createElement('p');p.textContent='Administrator · tilgang til alle verktøy. Denne rollen er beskyttet mot utilsiktet endring.';card.append(p);list.append(card);continue;}
   const form=document.createElement('form'),choices=document.createElement('div');choices.className='permissions';
   function checkbox(key,label,checked){const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.name=key;c.checked=checked;l.append(c,document.createTextNode(label));return l;}
   form.append(checkbox('active','Aktiv ansatt',row.active));
   for(const [key,label] of Object.entries(labels))choices.append(checkbox(key,label,row.modules.includes(key)));
   const save=document.createElement('button'),message=document.createElement('p');save.textContent='Lagre tilganger';message.setAttribute('role','status');form.append(choices,save,message);
   form.addEventListener('submit',async e=>{e.preventDefault();save.disabled=true;message.textContent='Lagrer …';
    try{const modules=Object.keys(labels).filter(k=>form.elements[k].checked),active=form.elements.active.checked;
     const {data: saved,error}=await client.from('kb_access').update({modules,active}).eq('email',row.email).select('email').single();
     if(error||!saved)throw Error('Tilgangene kunne ikke lagres. Last siden på nytt og prøv igjen.');
     message.textContent='Lagret. Nye dataforespørsler følger tilgangen med en gang. Åpne verktøysider kontrolleres innen ett minutt.';
    }catch(error){message.textContent=error.message;}finally{save.disabled=false;}
   });card.append(form);list.append(card);
  }
 }
 document.getElementById('add-employee').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('button');b.disabled=true;
  try{const name=f.elements.name.value.trim(),email=f.elements.email.value.trim().toLowerCase();if(!/^[a-z0-9._%+-]+@komplettbyggdrift\.no$/.test(email))throw Error('Bruk en e-postadresse på komplettbyggdrift.no.');
   const {error}=await client.from('kb_access').insert({name,email,active:true,modules:[]});if(error)throw Error(error.code==='23505'?'Denne ansatte er allerede lagt til.':'Den ansatte kunne ikke legges til.');
   f.reset();await load();status.textContent='Ansatt lagt til. Velg tilganger i listen over.';
  }catch(error){status.textContent=error.message;}finally{b.disabled=false;}
 });
 try{await load();status.textContent='';}catch(e){status.textContent=e.message;}
})();
