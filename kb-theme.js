(function(){
 const key='kb-theme',media=matchMedia('(prefers-color-scheme: dark)');
 const get=()=>{try{return localStorage.getItem(key)||'dark';}catch{return 'dark';}};
 function apply(){document.documentElement.dataset.kbTheme=get()==='dark'||(get()==='system'&&media.matches)?'dark':'light';}
 window.KBTheme={get,set(value){if(!['light','dark','system'].includes(value))return;try{localStorage.setItem(key,value);}catch{}apply();document.querySelectorAll('iframe').forEach(f=>{try{f.contentWindow.KBTheme?.refresh();}catch{}});},refresh:apply};
 apply();media.addEventListener('change',apply);window.addEventListener('storage',e=>{if(e.key===key)apply();});
 const css=document.createElement('link');css.rel='stylesheet';css.href='/kb-theme.css?v=20260928-fix';document.head.append(css);
})();
