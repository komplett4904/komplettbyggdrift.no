(function(root){
 'use strict';
 function create({storage,key,write,status}){
  let pending={},running=null,broken=false,revision=0;
  try{pending=JSON.parse(storage.getItem(key)||'{}');if(!pending||Array.isArray(pending)||typeof pending!=='object')throw Error();}catch{broken=true;status('Lagringskøen kunne ikke leses. Ikke tøm nettleserdata.','error');}
  function persist(){try{storage.setItem(key,JSON.stringify(pending));return true;}catch{status('Nettleseren kunne ikke beholde endringene. Hold siden åpen og prøv igjen.','error');return false;}}
  function enqueue(id,operation){if(broken)return false;revision++;pending[String(id)]=JSON.parse(JSON.stringify(operation));persist();return true;}
  async function drain(){
   if(running)return running;
   if(broken)return false;
   running=(async()=>{
    while(Object.keys(pending).length){
     const id=Object.keys(pending)[0],operation=pending[id],version=JSON.stringify(operation);
     status('Lagrer i skyen …','saving');
     try{await write(id,operation);}catch{status('Ikke lagret i skyen. Endringene venter på nytt forsøk.','error');return false;}
     if(JSON.stringify(pending[id])===version){delete pending[id];persist();}
    }
    status('Lagret i skyen','saved');return true;
   })();
   try{return await running;}finally{running=null;}
  }
  return {enqueue,drain,revision:()=>revision,hasPending:()=>broken||Object.keys(pending).length>0};
 }
 root.KBSaveQueue={create};
})(typeof window==='undefined'?globalThis:window);
