(function(){
  'use strict';
  const pending=new WeakSet(),cache=new Map();
  function storagePath(value){
    try{const url=new URL(value,location.origin);if(url.origin!==window.KBDatabase.url)return null;
      const match=url.pathname.match(/^\/storage\/v1\/object\/public\/(befaring-bilder|prosjekt-bilder|avvik-bilder)\/(.+)$/);
      return match?{bucket:match[1],path:decodeURIComponent(match[2])}:null;
    }catch{return null;}
  }
  async function secureImage(img){
    if(pending.has(img))return;
    const original=img.dataset.kbOriginal||img.getAttribute('src'),object=storagePath(original);
    if(!object)return;pending.add(img);img.dataset.kbOriginal=original;
    try{
      const key=object.bucket+'/'+object.path;let signed=cache.get(key);
      if(!signed||signed.expires<Date.now()){
        const {data,error}=await window.KBDatabase.getClient().storage.from(object.bucket).createSignedUrl(object.path,900);
        if(error)throw error;signed={url:data.signedUrl,expires:Date.now()+12*60*1000};cache.set(key,signed);
      }
      if(img.getAttribute('src')!==signed.url)img.src=signed.url;
    }catch{img.removeAttribute('src');img.alt='Bildet kunne ikke hentes. Prøv å åpne siden på nytt.';}
    finally{pending.delete(img);}
  }
  function scan(root){if(root instanceof HTMLImageElement)secureImage(root);if(root.querySelectorAll)root.querySelectorAll('img').forEach(secureImage);}
  function start(){
    new MutationObserver(records=>{for(const record of records){if(record.type==='attributes'){if(!record.target.hasAttribute('src'))continue;if(!pending.has(record.target)&&storagePath(record.target.getAttribute('src')))record.target.dataset.kbOriginal=record.target.getAttribute('src');scan(record.target);}else record.addedNodes.forEach(scan);}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    scan(document.body);setInterval(()=>scan(document.body),10*60*1000);
  }
  window.KBMedia=Object.freeze({start,storagePath});
})();
