(function(){
'use strict';
window.downloadCalculatorOffer=async function(button){
 if(!KBAuth.can('projects'))return;
 const content=document.getElementById('tilbudContent'),status=document.getElementById('quote-pdf-status');
 const blocks=[];const read=n=>(n.innerText||n.textContent||'').trim();
 function walk(n){
 if(n.nodeType!==1)return;
 if(n.matches('.tilbud-runningheader,.tilbud-logo,.tilbud-pagenum,img,script,button'))return;
 if(n.matches('table')){blocks.push({kind:'table',rows:Array.from(n.rows).map(r=>({cells:Array.from(r.cells).map(read),header:!!r.querySelector('th'),bold:r.classList.contains('total')||!!r.querySelector('strong')}))});return;}
 if(n.matches('h1,h2,h3')){blocks.push({kind:'heading',level:Number(n.tagName[1]),text:read(n)});return;}
 if(n.matches('.tilbud-signature')){blocks.push({kind:'signature',text:read(n)});return;}
 if(n.matches('p,li,.tilbud-subtitle,.tilbud-type,.tilbud-price-box')){const text=read(n);if(text)blocks.push({kind:n.matches('.tilbud-price-box')?'price':'text',text:(n.tagName==='LI'?'- ':'')+text});return;}
 // Company footer is rendered once per PDF page; exclude only the fixed legacy footer.
 if(n.parentElement?.classList.contains('tilbud-page')&&n.tagName==='DIV'&&!n.className&&read(n).includes('Org.nr: 926 335 758'))return;
 if(!n.children.length){const text=read(n);if(text)blocks.push({kind:'text',text});return;}
 Array.from(n.children).forEach(walk);
 }
 if(!content||!content.children.length){status.textContent='Åpne tilbudsbrevet før du laster ned PDF.';return;}
 Array.from(content.children).forEach(walk);
 button.disabled=true;status.textContent='Lager PDF …';
 try{const title=content.querySelector('h1')?.textContent.trim()||'Tilbud';const pdf=KBQuotePDF.create(blocks,jspdf.jsPDF,title);await pdf.save(('Tilbud-'+title).replace(/[^a-zA-Z0-9ÆØÅæøå_-]/g,'-').slice(0,100)+'.pdf',{returnPromise:true});status.textContent='PDF-en er klar for nedlasting.';}catch{status.textContent='PDF-en kunne ikke lages. Prøv igjen.';}finally{button.disabled=false;}
};
})();
