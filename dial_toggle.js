/* dial_toggle.js
   dial-toggle: toggler for main container (panel slot)
   NOTE: Ingen UserScript-header her. Lastes via @require.
*/
(() => {
  'use strict';

  class DialToggle extends HTMLElement {
    static get observedAttributes() { return ['open']; }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._open = false;
      this._cfg = {
        button: { icon: '☰', closeIcon: '✕' },
        position: { bottom: 12, right: 12 },
        size: { btn: 44, panelW: 420, panelH: 320 },
        onToggle: null,
        onAction: null,
      };
    }

    connectedCallback() { if (!this.shadowRoot.innerHTML) this.render(); }

    attributeChangedCallback(n, o, v) {
      if (o === v) return;
      if (n === 'open') this._open = this.hasAttribute('open');
      this.render();
    }

    setup(cfg = {}) {
      this._cfg = this._merge(this._cfg, cfg);
      if (cfg?.open != null) this._open = !!cfg.open;
      this.render();
      return this;
    }

    _setOpen(v) {
      this._open = !!v;
      if (this._open) this.setAttribute('open', '');
      else this.removeAttribute('open');
      this._cfg.onToggle?.(this._open);
      this.dispatchEvent(new CustomEvent('toggle', { detail: { open: this._open } }));
      this.render();
    }

    render() {
      const { button, position, size } = this._cfg;
      const open = this._open;

      const root = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
      const cssFn = root?.UI?.cfg?.css?.dialToggle;
      const css = (typeof cssFn === 'function') ? cssFn({ position, size, open }) : '';

      this.shadowRoot.innerHTML = `
        <style>${css}</style>

        <div class="panel ${open ? '' : 'closed'}" aria-hidden="${open ? 'false' : 'true'}">
          <slot name="panel"></slot>
        </div>

        <button class="dial" title="Toggle">
          <span class="icon-open"><slot name="dial-close">${button.closeIcon || '✕'}</slot></span>
          <span class="icon-close"><slot name="dial-open">${button.icon || '☰'}</slot></span>
        </button>
      `;

      const $dial = this.shadowRoot.querySelector('.dial');
      const $panel = this.shadowRoot.querySelector('.panel');

      const pulse = () => {
        $dial.classList.add('pulse');
        setTimeout(() => $dial && $dial.classList.remove('pulse'), 160);
      };

      const toggle = () => {
        pulse();
        this._cfg.onAction?.({ type: 'click', detail: { target: 'dial', open: !open } });
        if (open) {
          if ($panel) {
            $panel.classList.add('closed');
            setTimeout(() => this._setOpen(false), 180);
          } else {
            this._setOpen(false);
          }
        } else {
          this._setOpen(true);
        }
      };

      $dial.onclick = toggle;
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

  if (!customElements.get('dial-toggle')) customElements.define('dial-toggle', DialToggle);
})();
