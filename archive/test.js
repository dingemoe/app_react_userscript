// /Users/x/app_react_userscript/test.js
(() => {
  const id = 'tm_hello_world_panel';
  const old = document.getElementById(id);
  if (old) old.remove();

  const el = document.createElement('div');
  el.id = id;
  el.textContent = 'Hello World';
  el.style.cssText = [
    'position:fixed',
    'right:14px',
    'bottom:14px',
    'z-index:2147483647',
    'background:#000',
    'color:#fff',
    'padding:10px 12px',
    'border:1px solid rgba(255,255,255,.18)',
    'border-radius:12px',
    'font:12px system-ui,-apple-system,Segoe UI,Roboto,Arial'
  ].join(';');

  (document.body || document.documentElement).appendChild(el);
})();
