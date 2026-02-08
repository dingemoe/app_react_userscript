// mount.js
(() => {
  const root = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

  class Boot {
    static Mount(Render){
      const run = () => {
        const host = document.body;
        if (!host) return;

        let dial = document.getElementById('tm_dial');
        if (!dial) {
          dial = document.createElement('dial-toggle');
          dial.id = 'tm_dial';
          host.appendChild(dial);
          dial.setup?.({
            button: { icon: '☰', closeIcon: '✕' },
            position: { bottom: 12, right: 12 },
            size: { btn: 44, panelW: 420, panelH: 320 }
          });
        }

        let wrap = document.getElementById('tm_root');
        if (!wrap) {
          wrap = UI.Elem('div', 'app_wrap', { id:'tm_root' });
          wrap.setAttribute('slot', 'panel');
          dial.appendChild(wrap);
        }

        // page brightness (affects opacity / readability)
        const isLight = UI?.PageIsLight?.() ?? true;
        dial.setAttribute('data-page', isLight ? 'light' : 'dark');
        wrap.setAttribute('data-page', isLight ? 'light' : 'dark');

        // inject global CSS (scoped) from config (after #tm_root exists)
        UI?.InjectFromConfig?.();

        wrap.replaceChildren(UI.Card(Render(), 'app_card'));
      };

      if (document.body) run();
      else document.addEventListener('DOMContentLoaded', run, { once:true });
    }
  }

  root.Boot = Boot;
})();
