// UI authentication adapter. Server-side policies must independently authorize users.
(function () {
  'use strict';
  const employees = new Map([
    ['eirik@komplettbyggdrift.no', 'Eirik'],
    ['eivind@komplettbyggdrift.no', 'Eivind'],
    ['stephen@komplettbyggdrift.no', 'Stephen']
  ]);
  function client() { return window.KBDatabase.getClient(); }
  function accessError(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
  }
  async function getEmployee() {
    const { data: sessionData, error: sessionError } = await client().auth.getSession();
    if (sessionError) throw accessError('Innloggingen kunne ikke kontrolleres. Prøv igjen.', 'session_error');
    if (!sessionData.session) return null;
    // Validate with Auth; never authorize from sessionStorage or editable user metadata.
    const { data, error } = await client().auth.getUser();
    if (error || !data.user) throw accessError('Innloggingen kunne ikke bekreftes. Logg inn på nytt.', 'verification_error');
    const user = data.user;
    const email = (user.email || '').trim().toLowerCase();
    if (!user.id || !user.email_confirmed_at || !employees.has(email)) {
      throw accessError('Denne Google-kontoen har ikke tilgang. Bruk firmaadressen din.', 'forbidden');
    }
    return Object.freeze({ id: user.id, email, name: employees.get(email) });
  }
  async function signIn() {
    const allowedPages = ['/innlogging.html', '/anbudskalkulator.html', '/hms.html', '/kalender.html'];
    const page = allowedPages.includes(window.location.pathname) ? window.location.pathname : '/anbudskalkulator.html';
    // Fixed production origin prevents untrusted redirect query parameters from being reused.
    const { error } = await client().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://komplettbyggdrift.no' + page, queryParams: { prompt: 'select_account' } }
    });
    if (error) throw accessError('Google-innlogging kunne ikke startes. Prøv igjen.', 'login_error');
  }
  async function signOut() {
    const { error } = await client().auth.signOut();
    if (error) throw accessError('Utloggingen kunne ikke fullføres. Prøv igjen.', 'logout_error');
    // Remove obsolete UI flags so they cannot reopen legacy screens after migration.
    for (const key of ['kb_auth', 'kb_bruker', 'kb_via_firmakode']) window.sessionStorage.removeItem(key);
  }
  window.KBAuth = Object.freeze({ getEmployee, signIn, signOut });
})();
