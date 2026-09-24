(function(){
  'use strict';
  const bucket='avvik-bilder', entries=[];
  let busy=false;
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(){
    const el=document.getElementById('tmVedleggListe'); if(!el)return;
    el.replaceChildren();
    entries.forEach((e,i)=>{
      const row=document.createElement('div'),img=document.createElement('img'),button=document.createElement('button');
      img.src=e.preview;img.alt=e.name;img.style.cssText='width:70px;height:48px;object-fit:contain';
      button.type='button';button.textContent='Fjern '+e.name;button.disabled=busy;
      button.onclick=()=>{URL.revokeObjectURL(e.preview);entries.splice(i,1);render();};
      row.append(img,button);el.append(row);
    });
  }
  async function add(files){
    if(busy)return;
    setBusy(true);
    const status=document.getElementById('tmStatus');
    for(const file of files){
      if(entries.length>=3){status.textContent='Du kan legge ved opptil 3 bilder.';break;}
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){status.textContent='Velg PNG, JPG eller WebP, maks 5 MB per bilde.';continue;}
      try{
        const bitmap=await createImageBitmap(file);
        if(bitmap.width*bitmap.height>40000000){bitmap.close();throw Error('Bildet er for stort.');}
        // Re-encode to remove metadata and reject disguised non-image files.
        const canvas=document.createElement('canvas'),scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
        canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
        canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
        if(!blob||blob.size>5*1024*1024)throw Error('Bildet er for stort etter behandling. Velg et mindre bilde.');
        entries.push({blob,name:file.name.slice(0,120),preview:URL.createObjectURL(blob),path:null});
      }catch(e){status.textContent=e.message||'Bildet kunne ikke leses.';}
    }
    setBusy(false);
  }
  function mount(){
    const text=document.getElementById('tmTekst'); if(!text)return;
    const block=document.createElement('div');
    block.innerHTML='<label for="tmBilder" style="display:block;margin-top:10px">Legg ved skjermbilder (valgfritt)</label><input id="tmBilder" type="file" accept="image/png,image/jpeg,image/webp" multiple><small style="display:block">Opptil 3 bilder, maks 5 MB hver. Du kan også lime inn et skjermbilde i tekstfeltet.</small><div id="tmVedleggListe"></div>';
    text.after(block);
    block.querySelector('input').onchange=async e=>{await add([...e.target.files]);e.target.value='';};
    text.addEventListener('paste',e=>{const files=[...(e.clipboardData?.files||[])];if(files.length){e.preventDefault();add(files);}});
  }
  function setBusy(value){busy=value;document.querySelectorAll('#tmSkjema button,#tmSkjema input,#tmSkjema textarea').forEach(el=>el.disabled=value);render();}
  function clear(){entries.forEach(e=>URL.revokeObjectURL(e.preview));entries.length=0;render();}
  async function upload(client){
    const user=window.KBAuth.employee;if(!user)throw Error('Logg inn på nytt før du sender.');
    for(const e of entries){
      if(e.path)continue;
      const path='tilbakemeldinger/'+user.id+'/'+crypto.randomUUID()+'.png';
      const {error}=await client.storage.from(bucket).upload(path,e.blob,{contentType:'image/png',upsert:false});
      if(error)throw error;e.path=path;
    }
    return entries.map(e=>({bucket,path:e.path,name:e.name}));
  }
  function markup(items){
    return (Array.isArray(items)?items:[]).filter(e=>e.bucket===bucket&&/^tilbakemeldinger\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.png$/.test(e.path)).map(e=>'<button type="button" class="kb-attachment-open" data-path="'+esc(e.path)+'">Åpne skjermbilde: '+esc(e.name)+'</button>').join('');
  }
  document.addEventListener('click',async e=>{
    const button=e.target.closest('.kb-attachment-open');if(!button)return;
    button.disabled=true;
    try{
      const {data,error}=await window.KBDatabase.getClient().storage.from(bucket).createSignedUrl(button.dataset.path,300);
      if(error)throw error;
      const dialog=document.createElement('dialog');dialog.style.cssText='margin:auto;max-width:95vw;max-height:90vh;border:1px solid #ddd;border-radius:12px;padding:16px';
      const close=document.createElement('button'),img=document.createElement('img');close.textContent='Lukk bildet';close.onclick=()=>dialog.close();
      img.src=data.signedUrl;img.alt='Vedlagt skjermbilde';img.style.cssText='display:block;max-width:85vw;max-height:75vh;object-fit:contain;margin-top:12px';
      dialog.append(close,img);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
    }catch{alert('Bildet kunne ikke hentes. Kontroller forbindelsen og prøv igjen.');}
    finally{button.disabled=false;}
  });
  window.KBAttachments=Object.freeze({mount,clear,upload,markup,setBusy});
})();
