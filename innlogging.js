'use strict';
const statusElement = document.getElementById('status');
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
async function showIdentity() {
  try {
    const employee = await window.KBAuth.getEmployee();
    statusElement.textContent = employee ? `Innlogging bekreftet. Hei, ${employee.name}! Du bruker ${employee.email}.` : 'Du er ikke innlogget.';
    loginButton.hidden = !!employee;
    logoutButton.hidden = !employee;
    document.getElementById('tools').hidden = !employee;
    if(employee){
      const next=sessionStorage.getItem('kb_return_to');sessionStorage.removeItem('kb_return_to');
      if(['/anbudskalkulator.html','/hms.html','/kalender.html','/demokoder.html'].includes(next))location.replace(next);
    }
  } catch (error) {
    statusElement.textContent = error.message || 'Innloggingen kunne ikke kontrolleres.';
    loginButton.hidden = false;
    logoutButton.hidden = false;
  }
}
loginButton.addEventListener('click', async () => {
  loginButton.disabled = true;
  try { await window.KBAuth.signIn(); }
  catch(error) { statusElement.textContent = error.message; loginButton.disabled = false; }
});
logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  try { await window.KBAuth.signOut(); await showIdentity(); }
  catch(error) { statusElement.textContent = error.message; }
  finally { logoutButton.disabled = false; }
});
showIdentity();
