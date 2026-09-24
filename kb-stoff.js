(function(){
  'use strict';
  const fields=[['forstehjelp','Førstehjelp'],['handtering','Trygg håndtering'],['sol','Tiltak ved søl'],['sds_dato','Databladets dato'],['sds_versjon','Databladets versjon']];
  const form=document.getElementById('stoff-skjema'),notes=document.getElementById('stoff-notater');
  for(const [key,label] of fields){
    const wrapper=document.createElement('div'),l=document.createElement('label');l.htmlFor='stoff-'+key;l.textContent=label;
    const input=document.createElement(key.startsWith('sds_')?'input':'textarea');input.id='stoff-'+key;wrapper.append(l,input);notes.after(wrapper);
  }
  const card=document.createElement('section');card.id='stoff-lesemodus';card.className='hidden card';card.setAttribute('aria-label','Stoffinformasjon');form.before(card);
  const esc=escapeHtml;
  window.visStoff=function(id){
    const s=stoffListe.find(x=>x.id===id);if(!s)return;
    lukkStoffSkjema();
    card.classList.remove('hidden');card.replaceChildren();
    const heading=document.createElement('h2');heading.textContent=s.navn;card.append(heading);
    const meta=document.createElement('p');meta.textContent=[s.leverandor,s.sds_dato?'Datablad: '+s.sds_dato:null,s.sds_versjon?'Versjon '+s.sds_versjon:null].filter(Boolean).join(' · ');card.append(meta);
    const actions=document.createElement('div');actions.className='btn-row';
    const edit=document.createElement('button');edit.className='btn btn-accent';edit.textContent='Rediger';edit.onclick=()=>redigerStoff(id);
    const close=document.createElement('button');close.className='btn btn-outline';close.textContent='Lukk';close.onclick=()=>card.classList.add('hidden');actions.append(edit,close);card.append(actions);
    if(s.sds_lenke){const link=document.createElement('a');link.textContent='Henter originaldatablad …';link.className='btn btn-outline';link.target='_blank';link.rel='noopener noreferrer';card.append(link);resolveDocument(s.sds_lenke,link);}
    if(s.sds_dato?.endsWith('2014')){const warning=document.createElement('p');warning.textContent='Dette databladet er fra 2014. Innhent oppdatert utgave før bruk.';warning.style.cssText='padding:12px;background:#fff3cd;color:#713f12';card.append(warning);}
    for(const [key,label] of [['farer','Viktigste farer'],['ppe','Verneutstyr'],['handtering','Trygg håndtering'],['forstehjelp','Førstehjelp'],['lagring','Lagring'],['sol','Tiltak ved søl'],['notater','Notater og kilde']]){
      const h=document.createElement('h3'),p=document.createElement('p');h.textContent=label;p.textContent=s[key]||'Ikke registrert – se originaldatabladet.';p.style.whiteSpace='pre-wrap';card.append(h,p);
    }
    card.scrollIntoView({behavior:'smooth',block:'start'});
  };
  async function resolveDocument(value,link){
    try{
      let url;
      const match=value.match(/^storage:hms-datablader\/([a-f0-9]{64}\.pdf)$/);
      if(match){const {data,error}=await sb.storage.from('hms-datablader').createSignedUrl(match[1],900);if(error)throw error;url=data.signedUrl;}
      else{const parsed=new URL(value);if(parsed.protocol!=='https:')throw Error('Ugyldig lenke');url=parsed.href;}
      link.href=url;link.textContent='Åpne originaldatablad (PDF)';
    }catch{link.textContent='Kunne ikke hente databladet. Åpne stoffet på nytt for å prøve igjen.';}
  }
  window.KBStoff={
    prepare(s){card.classList.add('hidden');for(const [key] of fields)document.getElementById('stoff-'+key).value=s?.[key]||'';},
    values(){return Object.fromEntries(fields.map(([key])=>[key,document.getElementById('stoff-'+key).value.trim()]));},
    validLink(value){return !value||/^storage:hms-datablader\/[a-f0-9]{64}\.pdf$/.test(value)||(()=>{try{return new URL(value).protocol==='https:';}catch{return false;}})();}
  };
})();
