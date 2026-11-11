(() => {
  'use strict';
  const trigger = document.getElementById('kb-inspection-open');
  const dialog = document.getElementById('kb-inspection');
  if (!trigger || !dialog || !window.KBAuth?.can('projects')) return;
  const db = window.KBDatabase.getClient();
  const templates = {
    'tak-rehabilitering': { title: 'Egenkontroll – takrehabilitering', points: ['Arbeid kontrollert mot relevant monteringsanvisning og produktunderlag','Eksisterende rupanel/underlag kontrollert, nødvendige skader utbedret','Undertak, skjøter, oppbrett og avslutninger kontrollert','Sløyfer, lekter, lufting og innfesting kontrollert','Takstein og innfesting/stormklips kontrollert','Møne, takfot og fuglesperre kontrollert','Beslag, overganger, renner og gjennomføringer kontrollert','Taksikring/snøfangere/takstige kontrollert der dette inngår','Vindskier og pannebord kontrollert der dette inngår'] },
    'tak-for-vinter': { title: 'Høstsjekk av tak', points: [
      'Taksluk, rister og løvfang er kontrollert og renset ved behov',
      'Synlige taknedløp og utløp er kontrollert for blokkering og skader',
      'Nødoverløp er frie og synlig avrenning er kontrollert',
      'Lavpunkter og områder med stående vann er kontrollert',
      'Takbelegg, skjøter og oppkanter er kontrollert for synlige skader',
      'Beslag og gjennomføringer er kontrollert for synlige skader',
      'Løse gjenstander, vegetasjon og rusk er fjernet ved behov',
      'Synlige varmekabler ved sluk og nedløp er kontrollert der de finnes'
    ] },
    'tak-etter-vinter': { title: 'Vårsjekk av tak', points: [
      'Taksluk, løvfang, taknedløp og nødoverløp er kontrollert for blokkering og frostskader',
      'Avrenning og områder med stående smeltevann er kontrollert',
      'Takbelegg, skjøter og oppkanter er kontrollert for synlige vinter- og frostskader',
      'Beslag, gjennomføringer og innfestinger er kontrollert for synlige skader',
      'Synlige tegn på lekkasje eller fukt er registrert',
      'Renner og utløp er kontrollert for deformasjon eller løse deler',
      'Rusk og løse gjenstander er fjernet ved behov'
    ] }
  };
  const bucket = db.storage.from('kb-tak-vedlegg');
  const table = () => db.from('kb_tak_kontroller');
  const host = document.createElement('div');
  dialog.append(host);
  const stylesheet = document.createElement('style');
  stylesheet.textContent = '#kb-inspection{width:min(100% - 24px,1000px);max-width:none;max-height:94dvh;padding:0;border:1px solid var(--border,#dce4e9);border-radius:12px;background:var(--bg,#f1f5f8);color:inherit}#kb-inspection::backdrop{background:#12334288}@media(max-width:600px){#kb-inspection{width:100%;max-width:100%;max-height:100dvh;height:100dvh;margin:0;border:0;border-radius:0}}';
  document.head.append(stylesheet);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = "<style>\n*{box-sizing:border-box}.card{background:var(--white,#fff);border:1px solid var(--border,#dce4e9);border-radius:13px;padding:22px;margin:15px 0;box-shadow:0 2px 9px #122b3b09}h1{font-size:27px;margin:8px 0}h2{font-size:18px;margin:0 0 15px}.muted{color:#637986;font-size:13px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}label{font-size:13px;font-weight:650;display:block}input,textarea,select{font:inherit;display:block;width:100%;border:1px solid #b8cbd5;border-radius:7px;padding:10px;margin-top:5px;background:white;color:#183244}textarea{min-height:80px}button{background:#16747a;color:white;border:0;border-radius:8px;padding:11px 17px;font:inherit;font-weight:650;cursor:pointer}button.alt{background:#e4eef1;color:#143644}button:disabled{opacity:.5;cursor:wait}.actions{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}.line{display:grid;grid-template-columns:1fr 165px;gap:12px;align-items:center;border-bottom:1px solid #e7edf1;padding:10px 0}.line label{font-size:14px;font-weight:500}.photos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.photo{border:1px solid #dae5ea;border-radius:9px;padding:8px;break-inside:avoid}.photo img{width:100%;height:145px;object-fit:contain}.photo p{font-size:12px;overflow-wrap:anywhere}.hidden{display:none!important}#notice{font-weight:650}.error{color:#b02c31}.ok{color:#147050}@media(max-width:650px){.grid{grid-template-columns:1fr}.line{grid-template-columns:1fr 135px}.photos{grid-template-columns:1fr 1fr}.card{padding:15px}}\n    article{padding:16px} .line{grid-template-columns:minmax(0,1fr) minmax(105px,26%)} [hidden]{display:none!important}\n    @media(max-width:600px){\n      article{padding:12px 12px max(16px,env(safe-area-inset-bottom))}\n      .actions>*{flex:1 1 auto} button,input,select{min-height:44px;font-size:16px}\n      .line{grid-template-columns:1fr;gap:4px} .line select{margin-top:0}\n    }\n  </style><article><button type=\"button\" id=\"close\" class=\"alt no-print\">← Mine verktøy</button><div class=\"actions no-print\"><button class=\"alt\" id=\"new\">Ny taksjekk</button><button id=\"save\">Lagre kontroll</button><button class=\"alt\" id=\"print\">Last ned PDF</button></div><p id=\"notice\" role=\"status\" class=\"no-print\"></p><section class=\"card no-print\"><h2>Velg sjekkliste og kontroll</h2><label>Sjekkliste<select id=\"template\"></select></label><label>Lagrede kontroller<select id=\"projects\"><option value=\"\">Velg prosjekt</option></select></label><p class=\"muted\">Alle godkjente ansatte ser de samme prosjektene.</p></section><section class=\"card\"><h1 id=\"report-title\"></h1><h2>Prosjektinformasjon</h2><div class=\"grid\"><label>Prosjektnavn / nummer<input id=\"project_name\"></label><label>Kunde / tiltakshaver<input id=\"customer\"></label><label>Adresse<input id=\"address\"></label><label>Kontrollør<input id=\"inspector\"></label><label>Arbeid startet<input type=\"date\" id=\"start_date\"></label><label>Arbeid ferdigstilt<input type=\"date\" id=\"end_date\"></label></div><label>Beskrivelse av utført arbeid<textarea id=\"description\"></textarea></label></section><section class=\"card\"><h2>Kontrollpunkter</h2><p class=\"muted no-print\">Velg OK, Avvik eller Ikke aktuelt. Punkter merket Ikke aktuelt blir utelatt fra PDF.</p><div id=\"checks\"></div></section><section class=\"card\"><h2>Avvik og avgrensninger</h2><label>Beskriv eventuelle avvik og tiltak<textarea id=\"deviations\"></textarea></label></section><section class=\"card\"><h2>Vedlegg og FDV</h2><p class=\"muted no-print\">Kontrollen lagres når du laster opp. Bilder blir med i PDF. FDV-PDF-er lastes ned separat fra vedleggslisten og legges ved i Boligmappa.</p><label class=\"no-print\">Velg flere bilder fra bildebiblioteket, eller legg ved FDV. Maks 15 MB per fil.<input type=\"file\" id=\"uploads\" accept=\"image/jpeg,image/png,image/webp,application/pdf\" multiple></label><div class=\"actions no-print\"><button id=\"upload\">Last opp vedlegg</button></div><div id=\"attachments\" class=\"photos\"></div><label>FDV og øvrige dokumenter (merknad)<textarea id=\"fdv_notes\"></textarea></label></section><section class=\"card\"><h2>Bekreftelse</h2><p>Kontrollpunkter merket OK er kontrollert. Avvik er beskrevet ovenfor.</p><div class=\"grid\"><label>Kontrollert av<input id=\"signed_by\"></label><label>Kontrolldato<input type=\"date\" id=\"signed_date\"></label></div></section></article>";
  const $ = id => root.getElementById(id);
  const fields = ['project_name','customer','address','inspector','start_date','end_date','description','deviations','fdv_notes'];
  const points = () => templates[$('template').value].points;
  const isRoofCheck = () => $('template').value !== 'tak-rehabilitering';
  const notice = (message, error = false) => {
    $('notice').textContent = message;
    $('notice').className = error ? 'error no-print' : 'ok no-print';
  };
  let current = null;
  let busy = false;

  async function run(action) {
    if (busy || !window.KBAuth.can('projects')) return;
    busy = true;
    const controls = [...root.querySelectorAll('button, input, textarea, select')];
    controls.forEach(control => control.disabled = true);
    notice('');
    try { await action(); }
    catch (error) { notice(error.message, true); }
    finally {
      root.querySelectorAll('button, input, textarea, select').forEach(control => control.disabled = false);
      busy = false;
    }
  }

  for (const [key, template] of Object.entries(templates)) {
    $('template').add(new Option(template.title, key));
  }

  function fill(record = {}) {
    $('report-title').textContent = templates[$('template').value].title;
    for (const id of ['project_name', 'start_date', 'end_date']) $(id).closest('label').hidden = isRoofCheck();
    for (const id of fields) $(id).value = record[id] ?? (id === 'inspector' ? window.KBAuth.employee?.name ?? '' : '');
    $('signed_by').value = record.checks?.signed_by ?? '';
    $('signed_date').value = record.checks?.signed_date ?? (isRoofCheck() ? new Date().toLocaleDateString('sv-SE') : '');
    $('checks').replaceChildren(...points().map((point, index) => {
      const row = document.createElement('div');
      row.className = 'line';
      const label = document.createElement('label');
      label.htmlFor = 'c' + index;
      label.textContent = point;
      const select = document.createElement('select');
      select.id = label.htmlFor;
      for (const [text, value] of [['Ikke vurdert',''],['OK','OK'],['Avvik','Avvik'],['Ikke aktuelt','NA']]) {
        select.add(new Option(text, value));
      }
      select.value = record.checks?.[index] ?? '';
      select.disabled = busy;
      row.append(label, select);
      return row;
    }));
    $('uploads').value = '';
    $('attachments').replaceChildren();
  }

  async function list() {
    const { data, error } = await table().select('id,project_name,address')
      .eq('checklist_type', $('template').value).order('updated_at', { ascending: false });
    if (error) throw error;
    $('projects').replaceChildren(new Option('Velg kontroll', ''));
    for (const row of data) $('projects').add(new Option([row.project_name,row.address].filter(Boolean).join(' – '), row.id));
    $('projects').value = current ?? '';
  }

  async function loadAttachments() {
    const objects = [];
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await bucket.list(current, { limit: 100, offset });
      if (error) throw error;
      objects.push(...data.filter(file => file.id));
      if (data.length < 100) break;
    }
    $('attachments').replaceChildren();
    if (!objects.length) return;
    const paths = objects.map(file => current + '/' + file.name);
    const { data, error } = await bucket.createSignedUrls(paths, 3600);
    if (error) throw error;
    for (const file of data) {
      if (!file.signedUrl) throw Error('Kunne ikke åpne alle vedlegg.');
      const name = file.path.split('/').pop().replace(/^[a-f0-9-]{36}-/, '');
      const box = document.createElement('div');
      box.className = 'photo';
      if (/\.(jpg|jpeg|png|webp)$/i.test(name)) {
        const img = document.createElement('img');
        img.src = file.signedUrl;
        img.alt = name;
        box.append(img);
      }
      const caption = document.createElement('p');
      caption.textContent = name;
      const link = document.createElement('a');
      link.href = file.signedUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Åpne vedlegg';
      link.className = 'no-print';
      box.append(caption, link);
      $('attachments').append(box);
    }
  }

  trigger.hidden = false;
  trigger.style.removeProperty('display');
  trigger.onclick = () => {
    dialog.showModal();
    run(list);
  };
  $('close').onclick = () => dialog.close();
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  $('template').onchange = () => run(async () => {
    current = null;
    fill();
    $('projects').replaceChildren(new Option('Velg kontroll', ''));
    await list();
  });
  $('new').onclick = () => run(async () => {
    current = null;
    $('template').value = new Date().getMonth() >= 6 ? 'tak-for-vinter' : 'tak-etter-vinter';
    $('projects').replaceChildren(new Option('Velg kontroll', ''));
    fill();
    await list();
    requestAnimationFrame(() => $('customer').focus());
  });
  $('projects').onchange = () => run(async () => {
    const id = $('projects').value;
    if (!id) {
      current = null;
      fill();
      return;
    }
    const { data, error } = await table().select('*').eq('id', id)
      .eq('checklist_type', $('template').value).single();
    if (error) {
      $('projects').value = current ?? '';
      throw error;
    }
    current = data.id;
    fill(data);
    await loadAttachments();
  });
  async function save() {
    const record = Object.fromEntries(fields.map(id => [id, $(id).value.trim() || null]));
    if (isRoofCheck()) {
      if (!record.customer || !record.address) throw Error('Fyll ut kunde og adresse.');
      record.project_name = [record.customer, $('signed_date').value].filter(Boolean).join(' – ');
    }
    if (!record.project_name) throw Error('Fyll ut prosjektnavn eller prosjektnummer.');
    record.checks = Object.fromEntries(points().map((_, index) => [index, $('c' + index).value]));
    record.checks.signed_by = $('signed_by').value;
    record.checks.signed_date = $('signed_date').value;
    record.checklist_type = $('template').value;
    record.updated_at = new Date().toISOString();
    const query = current ? table().update(record).eq('id', current).eq('checklist_type', record.checklist_type) : table().insert(record);
    const { data, error } = await query.select('id').single();
    if (error) throw error;
    current = data.id;
    await list();
  }
  $('save').onclick = () => run(async () => {
    await save();
    notice('Kontroll lagret.');
  });
  $('upload').onclick = () => run(async () => {
    const files = [...$('uploads').files];
    if (!files.length) throw Error('Velg minst én fil.');
    notice('Laster opp ' + files.length + ' vedlegg …');
    for (const file of files) {
      if (file.size > 15728640 || !['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)) {
        throw Error('Ugyldig fil: ' + file.name);
      }
    }
    await save();
    const pending = new DataTransfer();
    for (const file of files) pending.items.add(file);
    while (pending.files.length) {
      const f = pending.files[0];
      let uploadFile = f;
      if (f.type.startsWith('image/')) {
        const bitmap=await createImageBitmap(f,{imageOrientation:'from-image'});
        const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(bitmap.width*scale));
        canvas.height=Math.max(1,Math.round(bitmap.height*scale));
        const ctx=canvas.getContext('2d');
        ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
        bitmap.close();
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.78));
        if(!blob)throw Error('Kunne ikke komprimere bildet');
        uploadFile=new File([blob],f.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});
      }
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const { error } = await bucket.upload(current + '/' + crypto.randomUUID() + '-' + safeName, uploadFile, { contentType: uploadFile.type });
      if (error) throw Error(f.name + ': ' + error.message);
      pending.items.remove(0);
      $('uploads').files = pending.files;
    }
    await loadAttachments();
    notice('Vedlegg lastet opp.');
  });
  $('print').onclick = () => run(async () => {
    if (points().some((_, index) => !$('c' + index).value) &&
        !confirm('Noen kontrollpunkter er ikke vurdert. Vil du likevel laste ned rapporten?')) return;
    await save();
    await loadAttachments();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
    const margin = 15;
    const width = 180;
    const title = $('report-title').textContent;
    let y = 16;
    pdf.setProperties({ title, author: 'Komplett Byggdrift AS' });

    function room(height) {
      if (y + height > 280) {
        pdf.addPage();
        y = 16;
      }
    }

    function text(value, size = 11, bold = false) {
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      const height = size * 0.43;
      for (const line of pdf.splitTextToSize(value, width)) {
        room(height);
        pdf.text(line, margin, y);
        y += height;
      }
    }

    function heading(value) {
      room(15);
      y += 4;
      text(value, 13, true);
    }

    function field(label, id) {
      const value = $(id).value.trim();
      if (value) text(label + ': ' + value);
    }

    text('Komplett Byggdrift AS', 11, true);
    y += 4;
    text(title, 20, true);
    y += 4;
    if (!isRoofCheck()) field('Prosjekt', 'project_name');
    field('Kunde', 'customer');
    field('Adresse', 'address');
    field('Kontrollør', 'inspector');
    field('Kontrolldato', 'signed_date');
    if (!isRoofCheck()) {
      field('Arbeid startet', 'start_date');
      field('Arbeid ferdigstilt', 'end_date');
    }
    field('Beskrivelse', 'description');
    heading('Kontrollpunkter');
    points().forEach((point, index) => {
      const status = $('c' + index).value;
      if (status !== 'NA') text((status || 'Ikke vurdert') + ' – ' + point);
    });
    if ($('deviations').value.trim()) {
      heading('Avvik og tiltak');
      text($('deviations').value);
    }
    field('Kontrollert av', 'signed_by');
    field('FDV og øvrige dokumenter', 'fdv_notes');

    const images = [...$('attachments').querySelectorAll('img')];
    if (images.length) heading('Bilder');
    for (let index = 0; index < images.length; index += 2) {
      room(63);
      for (const [column, image] of images.slice(index, index + 2).entries()) {
        const response = await fetch(image.src);
        if (!response.ok) throw Error('Kunne ikke hente bildet ' + image.alt);
        const bitmap = await createImageBitmap(await response.blob());
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext('2d');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const ratio = Math.min(86 / canvas.width, 57 / canvas.height);
        const imageWidth = canvas.width * ratio;
        const imageHeight = canvas.height * ratio;
        const x = margin + column * 92 + (86 - imageWidth) / 2;
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.82), 'JPEG', x, y, imageWidth, imageHeight);
      }
      y += 63;
    }

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      pdf.setPage(page);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(page + ' / ' + pageCount, 195, 288, { align: 'right' });
    }
    const locationName = ($('address').value || $('project_name').value)
      .trim().slice(0, 70).replace(/[^a-zA-Z0-9æøåÆØÅ_-]+/g, '-');
    pdf.save(title.replaceAll(' ', '-') + '-' + locationName + '.pdf');
    notice('PDF klar til å legges ved i e-post.');
  });
  fill();
  if (location.hash === '#egenkontroll') trigger.click();
})();
