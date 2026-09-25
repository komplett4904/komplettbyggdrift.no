(function(root){
'use strict';
function create(data,PDF){
 const doc=new PDF({unit:'mm',format:'a4'});const left=20,width=170,bottom=269;let y=44;
 const clean=s=>String(s??'').replace(/\u00a0|\u202f/g,' ').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
 function heading(){
 doc.setFillColor(23,50,77);doc.rect(0,0,210,2,'F');
 if(root.KBBrand?.logo)doc.addImage(root.KBBrand.logo,'PNG',20,9,30,18,undefined,'FAST');
 doc.setTextColor(23,50,77);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Komplett Byggdrift AS',59,17);
 doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(95,117,136);doc.text('Tømrerarbeid · Rørleggertjenester · Drift og vedlikehold',59,23);
 doc.setFontSize(8);doc.text('TILBUDSBREV',190,30,{align:'right'});doc.setDrawColor(190,205,218);doc.line(left,34,190,34);
 }
 function need(height){if(y+height>bottom){doc.addPage();heading();y=44;}}
 function text(value,size=10.5,bold=false,gap=2){doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(23,50,77);const lines=doc.splitTextToSize(clean(value),width);const lineHeight=size*.45;for(const line of lines){need(lineHeight);doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);doc.setTextColor(23,50,77);doc.text(line,left,y);y+=lineHeight;}y+=gap;}
 function section(title,value){if(!value)return;need(20);text(title,12,true,2);text(value);}
 heading();text(data.title,23,true,4);text('Tilbudsreferanse: '+data.reference+'   |   Dato: '+data.dateLabel,10,false,5);
 section('Kunde og prosjekt',data.customer+(data.email?'\n'+data.email:'')+'\n'+data.address);
 section('Innledning',data.intro);section('Arbeid som inngår',data.work);
 need(58);text('Pris – '+data.priceType,13,true,3);
 for(const row of data.rows){if(row.total){doc.setFillColor(23,50,77);doc.roundedRect(left-2,y-5,174,9,1.5,1.5,'F');doc.setTextColor(255,255,255);}else{doc.setTextColor(23,50,77);doc.setDrawColor(231,237,242);doc.line(left,y+2,190,y+2);}doc.setFont('helvetica',row.total?'bold':'normal');doc.setFontSize(row.total?12:11);doc.text(row.label,left,y);doc.text(clean(row.value),190,y,{align:'right'});y+=row.total?9:6.5;}y+=5;
 section('Forbehold og avgrensninger',data.terms);section('Fremdrift',data.schedule);section('Betalingsbetingelser',data.payment);
 need(32);text('Tilbudet gjelder til '+data.validLabel+'.',11,true,5);text('For Komplett Byggdrift AS\n'+data.senderName+'\n'+data.senderEmail+' · '+data.phone,11,false,2);
 const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setDrawColor(200);doc.line(left,278,190,278);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(90);doc.text('Komplett Byggdrift AS · Org.nr. 926 335 758 MVA · komplettbyggdrift.no',left,284);doc.text('Side '+i+' av '+pages,190,289,{align:'right'});}
 doc.setProperties({title:data.title,author:'Komplett Byggdrift AS',subject:'Tilbud '+data.reference});return doc;
}
root.KBOfferPDF={create};
})(typeof window!=='undefined'?window:globalThis);

