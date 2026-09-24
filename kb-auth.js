// UI authentication adapter. Server-side policies must independently authorize users.
(function () {
  'use strict';
  const employees = new Map([
    ['eirik@komplettbyggdrift.no', 'Eirik'],
    ['eivind@komplettbyggdrift.no', 'Eivind'],
    ['stephen@komplettbyggdrift.no', 'Stephen']
  ]);
  function client() { return window.KBDatabase.getClient(); }
  let currentEmployee = null;
  function accessError(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
  }
  async function getEmployee() {
    currentEmployee = null;
    const { data: sessionData, error: sessionError } = await client().auth.getSession();
    if (sessionError) throw accessError('Innloggingen kunne ikke kontrolleres. Prøv igjen.', 'session_error');
    if (!sessionData.session) return null;
    // Validate with Auth; never authorize from sessionStorage or editable user metadata.
    const { data, error } = await client().auth.getUser();
    if (error || !data.user) throw accessError('Innloggingen kunne ikke bekreftes. Logg inn på nytt.', 'verification_error');
    const user = data.user;
    const email = (user.email || '').trim().toLowerCase();
    if (!user.id || !user.email_confirmed_at || !email.endsWith('@komplettbyggdrift.no')) {
      throw accessError('Denne Google-kontoen har ikke tilgang. Bruk firmaadressen din.', 'forbidden');
    }
    const { data: allowed, error: permissionError } = await client().rpc('kb_employee_access');
    if(permissionError || allowed !== true) throw accessError('Kontotilgangen kunne ikke bekreftes. Prøv igjen eller kontakt Stephen.', 'forbidden');
    const {data: access,error: accessFailure}=await client().from('kb_access').select('name,modules,active').eq('email',email).single();
    const {data: admin,error: adminFailure}=await client().rpc('kb_is_admin');
    if(accessFailure||adminFailure||!access?.active)throw accessError('Tilgangen kunne ikke bekreftes.','forbidden');
    currentEmployee = Object.freeze({id:user.id,email,name:access.name,isAdmin:admin===true,modules:Object.freeze(access.modules||[])});
    return currentEmployee;
  }
  async function signIn() {
    const allowedPages = ['/tilbud.html','/tilganger.html','/okonomi.html','/innlogging.html', '/anbudskalkulator.html', '/hms.html', '/kalender.html'];
    if(allowedPages.includes(window.location.pathname) && window.location.pathname !== '/innlogging.html') window.sessionStorage.setItem('kb_return_to',window.location.pathname);
    // Fixed production origin prevents untrusted redirect query parameters from being reused.
    const { error } = await client().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://komplettbyggdrift.no/innlogging.html', queryParams: { prompt: 'select_account' } }
    });
    if (error) throw accessError('Google-innlogging kunne ikke startes. Prøv igjen.', 'login_error');
  }
  async function signOut() {
    currentEmployee = null;
    const { error } = await client().auth.signOut();
    if (error) throw accessError('Utloggingen kunne ikke fullføres. Prøv igjen.', 'logout_error');
    // Remove obsolete UI flags so they cannot reopen legacy screens after migration.
    for (const key of ['kb_auth', 'kb_bruker', 'kb_via_firmakode']) window.sessionStorage.removeItem(key);
  }
  async function logoutAndReturn() {
    document.body.style.visibility='hidden';
    try { await signOut(); }
    finally { window.location.replace('/innlogging.html'); }
  }
  function can(moduleName){return !!currentEmployee&&(currentEmployee.isAdmin||currentEmployee.modules.includes(moduleName));}
  window.KBAuth = Object.freeze({ can, getEmployee, signIn, signOut, logoutAndReturn, get employee(){return currentEmployee;} });
})();
