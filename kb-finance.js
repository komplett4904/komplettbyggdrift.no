(function(){'use strict';const status=document.getElementById('finance-status'),button=document.getElementById('finance-retry');
 async function load(){button.disabled=true;status.textContent='Kontrollerer forbindelsen …';try{
 const {data,error}=await KBDatabase.getClient().functions.invoke('tripletex-overview',{body:{}});
 if(error){let code='';try{code=(await error.context.json()).error||'';}catch{}throw Error('Forbindelsen kunne ikke bekreftes'+(code?' ('+code+')':'')+'. Prøv igjen eller kontakt Stephen.');}
 if(!data?.connected)throw Error('Forbindelsen er ikke bekreftet.');status.textContent='Tilkoblet '+data.company+'. Kontrollert '+new Date(data.checkedAt).toLocaleString('nb-NO')+'. Økonomigrafen klargjøres.';
 }catch(e){status.textContent=e.message;}finally{button.disabled=false;}}
 button.addEventListener('click',load);load();})();
