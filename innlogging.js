'use strict';
const statusElement = document.getElementById('status');
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
async function showIdentity() {
  try {
    const employee = await window.KBAuth.getEmployee();
    statusElement.textContent = employee ? `Innlogging bekreftet. Hei, ${employee.name}! Du bruker ${employee.email}.` : '';
    loginButton.hidden = !!employee;
    logoutButton.hidden = !employee;
    document.getElementById('tools').hidden = !employee;
    if(employee){
      const modules={'/anbudskalkulator.html':'projects','/hms.html':'hms','/kalender.html':'calendar','/demokoder.html':'demo','/okonomi.html':'finance'};
      const nav=document.getElementById('tools');
      if(!nav.querySelector('[data-extra]')){for(const [href,label] of [['/okonomi.html','Økonomi'],['/tilganger.html','Innstillinger – ansattes tilganger']]){const p=document.createElement('p'),a=document.createElement('a');a.href=href;a.textContent=label;a.dataset.extra='true';p.append(a);nav.append(p);}}
      for(const a of nav.querySelectorAll('a')){const p=new URL(a.href).pathname;a.parentElement.hidden=p==='/tilganger.html'?!employee.isAdmin:!KBAuth.can(modules[p]);}

      const next=sessionStorage.getItem('kb_return_to');sessionStorage.removeItem('kb_return_to');
      if(next&&((modules[next]&&KBAuth.can(modules[next]))||(next==='/tilganger.html'&&employee.isAdmin)))location.replace(next);
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
