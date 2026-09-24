(function(){
 'use strict';
 const $=id=>document.getElementById(id),client=window.KBDatabase.getClient();let prepared=[];
 const fields=['id','navn','leverandor','sds_dato','sds_versjon','sds_sha256','sds_lenke','farer','ppe','handtering','lagring','forstehjelp','sol','notater'];
 for(const id of ['records','pdfs'])$(id).onchange=()=>{prepared=[];$('import').disabled=true;$('preview').replaceChildren();};
 $('inspect').onclick=async()=>{
  prepared=[];$('import').disabled=true;$('preview').replaceChildren();$('result').textContent='Kontrollerer …';
  try{
   const file=$('records').files[0];if(!file||file.size>1000000)throw Error('Velg en gyldig oversiktsfil.');
   const rows=JSON.parse(await file.text());if(!Array.isArray(rows)||!rows.length||rows.length>100)throw Error('Oversikten må inneholde 1–100 produkter.');
   const pdfs=new Map([...$('pdfs').files].map(f=>[f.name,f])),seen=new Set();
   for(const row of rows){
    if(!fields.every(k=>typeof row[k]==='string'&&row[k].length<12000)||!row.navn.trim()||!/^[a-f0-9]{64}$/.test(row.sds_sha256)||row.id!=='sds-'+row.sds_sha256.slice(0,24)||row.sds_lenke!=='storage:hms-datablader/'+row.sds_sha256+'.pdf'||seen.has(row.id))throw Error('Oversikten inneholder ugyldige eller dupliserte produkter.');
    seen.add(row.id);const pdf=pdfs.get(row.sds_sha256+'.pdf');if(!pdf||pdf.size>20*1024*1024)throw Error('PDF mangler eller er for stor: '+row.navn);
    const bytes=await pdf.arrayBuffer();if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Ugyldig PDF: '+row.navn);
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(hash!==row.sds_sha256)throw Error('PDF stemmer ikke med oversikten: '+row.navn);
    prepared.push({row:Object.fromEntries(fields.map(k=>[k,row[k]])),pdf});
    const li=document.createElement('li');li.textContent=row.navn+' · '+row.sds_dato+(row.sds_dato.endsWith('2014')?' – gammel utgave, må oppdateres':'');$('preview').append(li);
   }
   $('result').textContent=prepared.length+' datablader kontrollert. Klare for innlegging.';$('import').disabled=false;
  }catch(e){prepared=[];$('result').textContent=e.message;}
 };
 $('import').onclick=async()=>{
  if(!prepared.length)return;document.querySelectorAll('input,button').forEach(e=>e.disabled=true);let count=0;
  try{
   for(const {row,pdf} of prepared){
    $('result').textContent='Legger til '+(count+1)+' av '+prepared.length+': '+row.navn;
    const {data:existing,error:readError}=await client.from('hms_stoffer').select('id,sds_sha256').eq('id',row.id);if(readError)throw readError;
    if(existing?.length){if(existing[0].sds_sha256!==row.sds_sha256)throw Error('Eksisterende stoff har annen kilde: '+row.navn);count++;continue;}
    const {error:uploadError}=await client.storage.from('hms-datablader').upload(row.sds_sha256+'.pdf',pdf,{contentType:'application/pdf',upsert:true});if(uploadError)throw uploadError;
    const {error}=await client.from('hms_stoffer').upsert(row,{onConflict:'id',ignoreDuplicates:true});if(error)throw error;
    const {data:verified,error:verifyError}=await client.from('hms_stoffer').select('id,sds_sha256').eq('id',row.id);if(verifyError||verified?.[0]?.sds_sha256!==row.sds_sha256)throw Error('Kunne ikke bekrefte lagringen: '+row.navn);
    count++;
   }
   $('result').textContent='Ferdig: '+count+' datablader bekreftet i stoffkartoteket.';prepared=[];
  }catch(e){$('result').textContent=count+' ferdige. Stoppet: '+e.message+'. Kontroller filene og prøv igjen; ferdige oppføringer hoppes over.';}
  finally{document.querySelectorAll('input,button').forEach(e=>e.disabled=false);$('import').disabled=true;}
 };
})();
