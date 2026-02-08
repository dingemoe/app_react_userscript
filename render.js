// render.js
(() => {
  'use strict';
  const root = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
  const UI = root.UI;
  if (!UI) return;

  class View {
    static Render(pageNode, routes = [], activePath = '/') {
      const { Card, Elem, Text } = UI;

      const MenuItem = (r) => {
        const cls = r.path === activePath ? 'menu_item menu_item_active' : 'menu_item';
        return Elem('a', cls, { href: `#${r.path}` }, Text(r.label));
      };

      const header = Card(
        Elem('div', 'menu', {}, ...routes.map(MenuItem)),
        { height:'auto', flex:'0 0 auto', background:'transparent' }
      );

      const main = Card(
        Elem('div', { style:{ width:'100%', height:'100%', overflow:'auto' } }, pageNode),
        { flex:'1 1 auto', minHeight:0 }
      );

      return Elem('div', {
        style:{
          display:'flex',
          flexDirection:'column',
          gap:'8px',
          width:'100%',
          height:'100%',
          minHeight:0
        }
      }, header, main);
    }
  }

  root.View = View;
})();
