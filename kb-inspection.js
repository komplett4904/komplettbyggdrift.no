(() => {
  'use strict';
  const trigger = document.getElementById('kb-inspection-open');
  const dialog = document.getElementById('kb-inspection');
  if (!trigger || !dialog || !window.KBAuth?.can('projects')) return;
  const db = window.KBDatabase.getClient();
  const templates = {
    'tak-rehabilitering': { title: 'Egenkontroll – takrehabilitering', points: ['Arbeid kontrollert mot relevant monteringsanvisning og produktunderlag','Eksisterende rupanel/underlag kontrollert, nødvendige skader utbedret','Undertak, skjøter, oppbrett og avslutninger kontrollert','Sløyfer, lekter, lufting og innfesting kontrollert','Takstein og innfesting/stormklips kontrollert','Møne, takfot og fuglesperre kontrollert','Beslag, overganger, renner og gjennomføringer kontrollert','Taksikring/snøfangere/takstige kontrollert der dette inngår','Vindskier og pannebord kontrollert der dette inngår'] },
    'tak-for-vinter': { title: 'Taksjekk før vinter', points: [
      'Taksluk, rister og løvfang er kontrollert og renset ved behov',
      'Synlige taknedløp og utløp er kontrollert for blokkering og skader',
      'Nødoverløp er frie og synlig avrenning er kontrollert',
      'Lavpunkter og områder med stående vann er kontrollert',
      'Takbelegg, skjøter og oppkanter er kontrollert for synlige skader',
      'Beslag og gjennomføringer er kontrollert for synlige skader',
      'Løse gjenstander, vegetasjon og rusk er fjernet ved behov',
      'Synlige varmekabler ved sluk og nedløp er kontrollert der de finnes'
    ] },
    'tak-etter-vinter': { title: 'Taksjekk etter vinter', points: [
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
  stylesheet.textContent = '#kb-inspection{width:min(100% - 24px,1000px);max-width:none;max-height:94dvh;padding:0;border:1px solid var(--border,#dce4e9);border-radius:12px;background:var(--bg,#f1f5f8);color:inherit}#kb-inspection::backdrop{background:#12334288}';
  document.head.append(stylesheet);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = "<style>\n*{box-sizing:border-box}.card{background:var(--white,#fff);border:1px solid var(--border,#dce4e9);border-radius:13px;padding:22px;margin:15px 0;box-shadow:0 2px 9px #122b3b09}h1{font-size:27px;margin:8px 0}h2{font-size:18px;margin:0 0 15px}.muted{color:#637986;font-size:13px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}label{font-size:13px;font-weight:650;display:block}input,textarea,select{font:inherit;display:block;width:100%;border:1px solid #b8cbd5;border-radius:7px;padding:10px;margin-top:5px;background:white;color:#183244}textarea{min-height:80px}button{background:#16747a;color:white;border:0;border-radius:8px;padding:11px 17px;font:inherit;font-weight:650;cursor:pointer}button.alt{background:#e4eef1;color:#143644}button:disabled{opacity:.5;cursor:wait}.actions{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}.line{display:grid;grid-template-columns:1fr 165px;gap:12px;align-items:center;border-bottom:1px solid #e7edf1;padding:10px 0}.line label{font-size:14px;font-weight:500}.photos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.photo{border:1px solid #dae5ea;border-radius:9px;padding:8px;break-inside:avoid}.photo img{width:100%;height:145px;object-fit:contain}.photo p{font-size:12px;overflow-wrap:anywhere}.hidden{display:none!important}#notice{font-weight:650}.error{color:#b02c31}.ok{color:#147050}@media(max-width:650px){.grid{grid-template-columns:1fr}.line{grid-template-columns:1fr 135px}.photos{grid-template-columns:1fr 1fr}.card{padding:15px}}\n    article{padding:16px} .line{grid-template-columns:minmax(0,1fr) minmax(105px,26%)} [hidden]{display:none!important}\n  </style><article><button type=\"button\" id=\"close\" class=\"alt no-print\">← Mine verktøy</button><div class=\"actions no-print\"><button class=\"alt\" id=\"new\">Ny kontroll</button><button id=\"save\">Lagre kontroll</button><button class=\"alt\" id=\"print\">Last ned PDF / skriv ut</button></div><p id=\"notice\" role=\"status\" class=\"no-print\"></p><section class=\"card no-print\"><h2>Velg sjekkliste og kontroll</h2><label>Sjekkliste<select id=\"template\"></select></label><label>Lagrede kontroller<select id=\"projects\"><option value=\"\">Velg prosjekt</option></select></label><p class=\"muted\">Alle godkjente ansatte ser de samme prosjektene.</p></section><section class=\"card\"><h1 id=\"report-title\"></h1><h2>Prosjektinformasjon</h2><div class=\"grid\"><label>Prosjektnavn / nummer<input id=\"project_name\"></label><label>Kunde / tiltakshaver<input id=\"customer\"></label><label>Adresse<input id=\"address\"></label><label>Kontrollør<input id=\"inspector\"></label><label>Arbeid startet<input type=\"date\" id=\"start_date\"></label><label>Arbeid ferdigstilt<input type=\"date\" id=\"end_date\"></label></div><label>Beskrivelse av utført arbeid<textarea id=\"description\"></textarea></label></section><section class=\"card\"><h2>Kontrollpunkter</h2><p class=\"muted no-print\">Velg OK, Avvik eller Ikke aktuelt. Punkter merket Ikke aktuelt blir utelatt fra PDF.</p><div id=\"checks\"></div></section><section class=\"card\"><h2>Avvik og avgrensninger</h2><label>Beskriv eventuelle avvik og tiltak<textarea id=\"deviations\"></textarea></label></section><section class=\"card\"><h2>Vedlegg og FDV</h2><p class=\"muted no-print\">Lagre kontrollen før opplasting. Bilder blir med i PDF. FDV-PDF-er lastes ned separat fra vedleggslisten og legges ved i Boligmappa.</p><label class=\"no-print\">Last opp bilder eller FDV (JPG, PNG, WebP eller PDF, maks 15 MB per fil; bilder nedskaleres automatisk)<input type=\"file\" id=\"uploads\" accept=\"image/jpeg,image/png,image/webp,application/pdf\" multiple></label><div class=\"actions no-print\"><button id=\"upload\">Last opp vedlegg</button></div><div id=\"attachments\" class=\"photos\"></div><label>FDV og øvrige dokumenter (merknad)<textarea id=\"fdv_notes\"></textarea></label></section><section class=\"card\"><h2>Bekreftelse</h2><p>Kontrollpunkter merket OK er kontrollert. Avvik er beskrevet ovenfor.</p><div class=\"grid\"><label>Kontrollert av<input id=\"signed_by\"></label><label>Kontrolldato<input type=\"date\" id=\"signed_date\"></label></div></section></article>";
  const $ = id => root.getElementById(id);
  const fields = ['project_name','customer','address','inspector','start_date','end_date','description','deviations','fdv_notes'];
  const points = () => templates[$('template').value].points;
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
    for (const id of fields) $(id).value = record[id] ?? '';
    $('signed_by').value = record.checks?.signed_by ?? '';
    $('signed_date').value = record.checks?.signed_date ?? '';
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
  $('new').onclick = () => run(() => {
    current = null;
    $('projects').value = '';
    fill();
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
  $('save').onclick = () => run(async () => {
    const record = Object.fromEntries(fields.map(id => [id, $(id).value.trim() || null]));
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
    notice('Kontroll lagret.');
  });
  $('upload').onclick = () => run(async () => {
    if (!current) throw Error('Lagre kontrollen før opplasting.');
    const files = [...$('uploads').files];
    if (!files.length) throw Error('Velg minst én fil.');
    for (const file of files) {
      if (file.size > 15728640 || !['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)) {
        throw Error('Ugyldig fil: ' + file.name);
      }
    }
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
    if (!current) throw Error('Lagre kontrollen før PDF-eksport.');
    if (points().some((_, index) => !$('c' + index).value) &&
        !confirm('Noen kontrollpunkter er ikke vurdert. Vil du likevel skrive ut?')) return;
    await loadAttachments();
    const report = root.querySelector('article').cloneNode(true);
    report.querySelectorAll('.no-print').forEach(element => element.remove());
    for (const input of report.querySelectorAll('input, textarea, select')) {
      const original = $(input.id);
      if (original.value === 'NA' && original.matches('.line select')) {
        input.closest('.line').remove();
        continue;
      }
      const value = document.createElement('div');
      value.className = 'value';
      value.textContent = original.selectedOptions?.[0]?.textContent || original.value || '–';
      input.replaceWith(value);
    }
    const company = document.createElement('strong');
    company.textContent = 'Komplett Byggdrift AS';
    report.prepend(company);
    const frame = document.createElement('iframe');
    frame.title = 'A4-rapport';
    frame.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;border:0;pointer-events:none';
    document.body.append(frame);
    try {
      const doc = frame.contentDocument;
      doc.title = $('report-title').textContent;
      doc.documentElement.lang = 'nb';
      const style = doc.createElement('style');
      style.textContent = '@page{size:A4;margin:14mm}body{font:11pt system-ui;color:#111}h1{font-size:18pt}h2{font-size:13pt;break-after:avoid}.card{margin:0 0 6mm}.grid,.photos{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.line{display:grid;grid-template-columns:1fr 30mm;gap:4mm;border-bottom:1px solid #ddd;padding:2mm 0;break-inside:avoid}.value{white-space:pre-wrap;overflow-wrap:anywhere;font-weight:normal}label{display:block;font-weight:600}.photo{break-inside:avoid;overflow-wrap:anywhere}.photo img{display:block;width:100%;height:56mm;object-fit:contain}';
      doc.head.append(style);
      doc.body.append(report);
      await Promise.all([...report.querySelectorAll('img')].map(img => img.decode()));
      frame.contentWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
      frame.contentWindow.print();
    } catch (error) {
      frame.remove();
      throw error;
    }
  });
  fill();
  if (location.hash === '#egenkontroll') trigger.click();
})();
