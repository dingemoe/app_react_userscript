/* dial_panel.js
   dial-panel + tabs-view (STRICT DARK) + fixed dial + ✕ on open + fuzzy pop (NO ORBIT RING)
   NOTE: Ingen UserScript-header her. Lastes via @require.
*/
(() => {
  'use strict';

  // ---------- TabsView ----------
  class TabsView extends HTMLElement {
    static get observedAttributes() { return ['orientation', 'active-id']; }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._tabs = [];
      this._activeId = null;
    }

    set tabs(v) {
      this._tabs = Array.isArray(v) ? v : [];
      if (this._tabs.length && this._activeId == null) this._activeId = this._tabs[0].id;
      this.render();
    }
    get activeId() { return this._activeId; }
    set activeId(v) {
      this._activeId = v;
      this.setAttribute('active-id', String(v));
      this.render();
    }

    attributeChangedCallback(n, o, v) {
      if (o === v) return;
      if (n === 'active-id') {
        const p = Number(v);
        this._activeId = Number.isNaN(p) ? v : p;
      }
      this.render();
    }

    get orientation() { return this.getAttribute('orientation') || 'vertical'; }
    set orientation(v) { this.setAttribute('orientation', v || 'vertical'); }

    parseId(v) { const p = Number(v); return Number.isNaN(p) ? v : p; }

    onSelect(id) {
      this._activeId = id;
      this.render();
      const tab = this._tabs.find(t => t.id === id) || null;
      this.dispatchEvent(new CustomEvent('tabChange', { detail: { activeId: id, tab } }));
    }

    render() {
      const o = this.orientation === 'horizontal' ? 'horizontal' : 'vertical';
      const a = this._activeId;
      const c = this._tabs.find(t => t.id === a);
      const html = c ? (c.content ?? '') : '';

      this.shadowRoot.innerHTML = `
        <style>
          :host{
            display:block;height:100%;
            background:#0a0b0d; color:rgba(232,236,244,.92);
          }
          .tabs{
            display:flex; gap:10px; height:100%;
            border:1px solid rgba(255,255,255,.06);
            border-radius:18px; overflow:hidden;
            background:rgba(10,10,12,.72);
            box-shadow:inset 0 1px 0 rgba(255,255,255,.03);
          }
          .tabs.vertical{flex-direction:row}
          .tabs.horizontal{flex-direction:column}

          .tab-list{
            display:flex; gap:8px; padding:12px;
            background:rgba(5,5,7,.88);
          }
          .tabs.vertical .tab-list{
            flex-direction:column; min-width:160px;
            border-right:1px solid rgba(255,255,255,.10)
          }
          .tabs.horizontal .tab-list{
            flex-direction:row;
            border-bottom:1px solid rgba(255,255,255,.10)
          }

          .tab-btn{
            cursor:pointer;
            padding:10px 12px;
            border-radius:12px;
            border:1px solid rgba(255,255,255,.08);
            background:rgba(8,8,12,.55);
            color:rgba(232,236,244,.86);
            text-align:left;
            transition: background .15s ease, border-color .15s ease, transform .08s ease, filter .15s ease;
          }
          .tab-btn:hover{
            background:rgba(255,255,255,.04);
            border-color:rgba(255,255,255,.12);
          }
          .tab-btn:active{ transform:translateY(1px) }

          .tab-btn.active{
            background:rgba(32,96,210,.28);
            border-color:rgba(80,140,255,.55);
            color:#eaf0ff;
            filter:saturate(1.05);
          }

          .tab-content{
            flex:1;
            padding:14px;
            overflow:auto;
            background:rgba(6,6,9,.72);
            color:rgba(232,236,244,.90);
          }
          .tab-content :is(p,div,span,pre,code,li,a){ color:inherit; }
        </style>

        <div class="tabs ${o}">
          <div class="tab-list" role="tablist">
            ${this._tabs.map(t => `
              <button class="tab-btn ${t.id === a ? 'active' : ''}"
                      data-id="${t.id}"
                      role="tab"
                      aria-selected="${t.id === a}">
                ${t.label}
              </button>`).join('')}
          </div>
          <div class="tab-content" role="tabpanel">${html}</div>
        </div>
      `;

      this.shadowRoot.querySelectorAll('.tab-btn')
        .forEach(b => b.onclick = () => this.onSelect(this.parseId(b.dataset.id)));
    }
  }

  if (!customElements.get('tabs-view')) customElements.define('tabs-view', TabsView);

  // ---------- DialPanel ----------
  class DialPanel extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._open = false;
      this._cfg = {
        button: { icon: '☰', closeIcon: '✕' },
        position: { bottom: 14, right: 14 },
        size: { btn: 56, panelW: 520, panelH: 360 },
        tabs: [],
        title: 'Panel',
        onToggle: null,
        onAction: null
      };
    }

    connectedCallback() { if (!this.shadowRoot.innerHTML) this.render(); }

    setup(cfg = {}) {
      this._cfg = this._merge(this._cfg, cfg);
      if (!this._cfg.tabs?.length) this._cfg.tabs = [{ id: 'main', label: 'Main', content: '' }];
      this.render();
      return this;
    }

    _setOpen(v) {
      this._open = !!v;
      this.render();
      this._cfg.onToggle?.(this._open);
      this.dispatchEvent(new CustomEvent('toggle', { detail: { open: this._open } }));
    }

    render() {
      const { button, position, size, tabs, title } = this._cfg;
      const open = this._open;
      const dialIcon = open ? (button.closeIcon || '✕') : (button.icon || '☰');

      this.shadowRoot.innerHTML = `
        <style>
          :host{ z-index:2147483647; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial }

          @keyframes tmPopIn{
            0%{opacity:0; transform:translateY(10px) scale(.985); filter:blur(10px) saturate(1.2)}
            100%{opacity:1; transform:translateY(0) scale(1); filter:blur(0) saturate(1)}
          }
          @keyframes tmPopOut{
            0%{opacity:1; transform:translateY(0) scale(1); filter:blur(0)}
            100%{opacity:0; transform:translateY(10px) scale(.985); filter:blur(10px)}
          }

          .dial{
            position:fixed; right:${position.right}px; bottom:${position.bottom}px;
            width:${size.btn}px; height:${size.btn}px; border-radius:999px;
            border:1px solid rgba(255,255,255,.10);
            background:rgba(8,8,10,.88);
            color:#eaf0ff;
            display:grid; place-items:center;
            cursor:pointer;
            box-shadow:0 14px 46px rgba(0,0,0,.72);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition: transform .12s ease, box-shadow .2s ease, filter .2s ease, background .2s ease;
          }
          .dial:hover{ background:rgba(12,12,16,.92); }
          .dial:active{ transform:translateY(1px) scale(.98); }
          .dial.pulse{
            filter: brightness(1.10);
            box-shadow:0 16px 58px rgba(0,0,0,.82);
          }

          .panel{
            position:fixed;
            right:${position.right}px;
            bottom:${position.bottom + size.btn + 10}px;
            width:${size.panelW}px; height:${size.panelH}px;
            border-radius:20px;
            border:1px solid rgba(255,255,255,.07);
            background:linear-gradient(180deg, rgba(10,10,12,.98), rgba(6,6,8,.98)) !important;
            color:rgba(232,236,244,.92);
            box-shadow:0 26px 100px rgba(0,0,0,.82);
            overflow:hidden;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            transform-origin: 85% 100%;
            animation: tmPopIn .22s ease forwards;
          }
          .panel.closing{ animation: tmPopOut .20s ease forwards; }

          .panelHeader{
            display:flex; align-items:center; justify-content:space-between;
            padding:12px 14px;
            border-bottom:1px solid rgba(255,255,255,.06);
            background:rgba(8,8,10,.55);
          }
          .title{ font-size:12px; opacity:.86; letter-spacing:.3px }

          .close{
            width:34px; height:28px; border-radius:10px;
            border:1px solid rgba(255,255,255,.10);
            background:rgba(8,8,12,.55);
            color:rgba(232,236,244,.9);
            cursor:pointer;
            transition: background .15s ease, border-color .15s ease, transform .08s ease;
          }
          .close:hover{
            background:rgba(255,255,255,.05);
            border-color:rgba(255,255,255,.14);
          }

          tabs-view{
            display:block;
            height:calc(100% - 53px);
            background:#0b0c10;
          }
        </style>

        ${open ? `
          <div class="panel">
            <div class="panelHeader">
              <div class="title">${title}</div>
              <button class="close" title="Close">✕</button>
            </div>
            <tabs-view orientation="vertical"></tabs-view>
          </div>` : ''}

        <button class="dial" title="Toggle">${dialIcon}</button>
      `;

      const $dial = this.shadowRoot.querySelector('.dial');
      const $close = this.shadowRoot.querySelector('.close');
      const $tabs = this.shadowRoot.querySelector('tabs-view');
      const $panel = this.shadowRoot.querySelector('.panel');

      const pulse = () => {
        $dial.classList.add('pulse');
        setTimeout(() => $dial && $dial.classList.remove('pulse'), 160);
      };

      const openNow = () => {
        pulse();
        this._cfg.onAction?.({ type: 'click', detail: { target: 'dial', open: true } });
        this._setOpen(true);
      };

      const closeNow = () => {
        pulse();
        this._cfg.onAction?.({ type: 'click', detail: { target: 'dial', open: false } });
        if ($panel) {
          $panel.classList.add('closing');
          setTimeout(() => this._setOpen(false), 180);
        } else {
          this._setOpen(false);
        }
      };

      $dial.onclick = () => open ? closeNow() : openNow();
      $close?.addEventListener('click', closeNow);

      if ($tabs) {
        $tabs.tabs = tabs;
        $tabs.activeId = $tabs.activeId ?? tabs?.[0]?.id ?? null;
        $tabs.addEventListener('tabChange', (e) => {
          this._cfg.onAction?.({ type: 'tabChange', detail: e.detail });
          this.dispatchEvent(new CustomEvent('action', { detail: { type: 'tabChange', ...e.detail } }));
        });
      }
    }

    _merge(a, b) {
      const o = { ...a };
      for (const k in (b || {})) {
        const v = b[k];
        o[k] = v && typeof v === 'object' && !Array.isArray(v) ? this._merge(a[k] || {}, v) : v;
      }
      return o;
    }
  }

  function define() {
    if (!customElements.get('dial-panel')) customElements.define('dial-panel', DialPanel);
  }

  // API for loader: window.DialPanel.define()
  window.DialPanel = { define };
})();
