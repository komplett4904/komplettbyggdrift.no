(function(root){
'use strict';
function create(blocks,PDF,title,kind='TILBUD'){
const doc=new PDF({unit:'mm',format:'a4'}),left=18,width=174,bottom=273;let y=35;
const clean=s=>String(s??'').replace(/[\u00a0\u202f]/g,' ').replace(/✓/g,'-').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
function header(){doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(23,50,77);doc.text('KOMPLETT BYGGDRIFT AS',left,17);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(kind,192,17,{align:'right'});doc.setDrawColor(190,204,215);doc.line(left,23,192,23);}
function page(){doc.addPage();header();y=34;}
function need(h){if(y+h>bottom)page();}
function font(size,bold){doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(23,50,77);}
function text(value,size=10,bold=false,gap=3){font(size,bold);const lines=doc.splitTextToSize(clean(value),width);for(const line of lines){need(size*.44);font(size,bold);doc.text(line,left,y);y+=size*.44;}y+=gap;}
function table(rows){if(!rows.length)return;const count=Math.max(...rows.map(r=>r.cells.length)),widths=count===3?[103,29,42]:count===2?[120,54]:Array(count).fill(width/count);let headerRow=rows[0].header?rows[0]:null;
function row(r,repeat=false){font(9,r.header||r.bold);const cells=r.cells.length===1?[doc.splitTextToSize(clean(r.cells[0]),width-4)]:r.cells.map((v,i)=>doc.splitTextToSize(clean(v),(widths[i]||width/count)-4));const lines=Math.max(...cells.map(c=>c.length));const height=lines*4.2+2.2;
if(y+height>bottom){page();if(headerRow&&!repeat&&r!==headerRow)row(headerRow,true);}
for(let n=0;n<lines;n++){if(y+4.2>bottom){page();if(headerRow&&!repeat&&r!==headerRow)row(headerRow,true);}font(9,r.header||r.bold);let x=left;for(let i=0;i<cells.length;i++){if(cells[i][n])doc.text(cells[i][n],i===0?x+2:x+widths[i]-2,y,{align:i===0?'left':'right'});x+=widths[i]||width/count;}y+=4.2;}doc.setDrawColor(224,231,237);doc.line(left,y-2,192,y-2);y+=2.2;}
for(const r of rows)row(r);y+=3;}
header();for(const b of blocks){if(b.kind==='table'){table(b.rows);continue;}if(b.kind==='heading'){need(18);text(b.text,b.level===1?22:b.level===2?12:10.5,true,4);}else if(b.kind==='signature'){need(32);text(b.text,10,false,4);}else text(b.text,10,b.kind==='price',3);}
const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(95);doc.setDrawColor(210);doc.line(left,280,192,280);doc.text('Komplett Byggdrift AS · Org.nr. 926 335 758 MVA · komplettbyggdrift.no',left,285);doc.text('Tlf. 416 02 078 / 920 34 199 · post@komplettbyggdrift.no',left,289);doc.text('Side '+i+' av '+pages,192,289,{align:'right'});}doc.setProperties({title,author:'Komplett Byggdrift AS'});return doc;
}
root.KBQuotePDF={create};
})(typeof window!=='undefined'?window:globalThis);
