// ==UserScript==
// @name         A-Tabs-Injector
// @match        https://*/*
// @require      file:///Users/x/app_react_userscript/dial_panel.js
// @grant        none
// @run-at       document-end
// @grant        unsafeWindow
// ==/UserScript==

(() => {
  'use strict';

  (async () => {
    if (!document.body) {
      await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
    }

    await customElements.whenDefined('dial-panel');

    const el = document.createElement('dial-panel');
    document.body.appendChild(el);

    el.setup({
      button: { icon: '☰' },
      position: { bottom: 14, right: 14 },
      size: { btn: 56, panelW: 520, panelH: 360 },
      tabs: [
        { id: 'a', label: 'A', content: '<div>A</div>' },
        { id: 'b', label: 'B', content: '<div>B</div>' },
      ],
    });

  })().catch(console.error);
})();
