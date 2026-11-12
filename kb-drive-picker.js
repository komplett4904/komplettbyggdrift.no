(() => {
  'use strict';
  const config = document.querySelector('[data-drive-picker]');
  if (!config?.dataset.clientId || !config.dataset.apiKey || !config.dataset.projectNumber) return;
  const allowed = ['image/jpeg','image/png','image/webp','application/pdf'];
  const maxBytes = 15 * 1024 * 1024;
  const load = src => new Promise((resolve,reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(Error('Kunne ikke laste Google Disk.'));
    document.head.append(script);
  });
  const ready = Promise.all([
    load('https://accounts.google.com/gsi/client'),
    load('https://apis.google.com/js/api.js').then(() => new Promise((resolve,reject) => {
      window.gapi.load('picker', {callback:resolve,onerror:reject,timeout:10000,ontimeout:reject});
    }))
  ]);
  ready.catch(() => {});
  function select() {
    return new Promise((resolve,reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: config.dataset.clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        include_granted_scopes: false,
        login_hint: window.KBAuth.employee?.email,
        error_callback: () => reject(Error('Google-vinduet ble lukket eller blokkert.')),
        callback: response => {
          if (!response.access_token) {
            reject(Error('Google Disk ga ikke tilgang.'));
            return;
          }
          const picker = window.google.picker;
          try {
            const view = new picker.DocsView(picker.ViewId.DOCS);
            view.setMimeTypes(allowed.join(','));
            const builder = new picker.PickerBuilder()
              .setDeveloperKey(config.dataset.apiKey)
              .setAppId(config.dataset.projectNumber)
              .setOAuthToken(response.access_token)
              .setOrigin(location.origin)
              .enableFeature(picker.Feature.MULTISELECT_ENABLED)
              .addView(view);
            builder.setCallback(result => {
              if (result.action === picker.Action.PICKED) resolve({docs:result.docs,token:response.access_token});
              if (result.action === picker.Action.CANCEL) resolve(null);
              if (result.action === picker.Action.ERROR) reject(Error('Google Disk kunne ikke åpne filvelgeren.'));
            }).build().setVisible(true);
          } catch (error) { reject(error); }
        }
      });
      client.requestAccessToken();
    });
  }
  async function getFile(item, token) {
    const url = new URL('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(item.id));
    url.searchParams.set('supportsAllDrives','true');
    const options = {headers:{Authorization:'Bearer ' + token}};
    if (item.resourceKey) options.headers['X-Goog-Drive-Resource-Keys'] = item.id + '/' + item.resourceKey;
    url.searchParams.set('fields','name,size,mimeType,capabilities(canDownload)');
    const metadataResponse = await fetch(url,options);
    if (!metadataResponse.ok) throw Error('Kunne ikke lese filen «' + item.name + '».');
    const info = await metadataResponse.json();
    if (!allowed.includes(info.mimeType) || Number(info.size) > maxBytes || info.capabilities?.canDownload === false) {
      throw Error('«' + info.name + '» kan ikke importeres. Velg JPG, PNG, WebP eller PDF på opptil 15 MB.');
    }
    url.searchParams.delete('fields');
    url.searchParams.set('alt','media');
    const response = await fetch(url,options);
    if (!response.ok) throw Error('Kunne ikke hente «' + info.name + '» fra Google Disk.');
    const blob = await response.blob();
    if (blob.size > maxBytes) throw Error('«' + info.name + '» er større enn 15 MB.');
    return new File([blob],info.name,{type:info.mimeType});
  }
  window.KBDrivePicker = Object.freeze({ready, async pick() {
    const selection = await select();
    if (!selection) return [];
    const files = [];
    for (const item of selection.docs) files.push(await getFile(item,selection.token));
    return files;
  }});
})();
