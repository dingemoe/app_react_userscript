// DialButton WC (vanilla). Minimert = liten “dial”-knapp. Ekspandert = card-panel med <tabs-view> inni.
// API:
//  el.setup({
//    button:{ label:'D', icon:'☰' },
//    position:{ bottom:12, right:12 },
//    size:{ btn:56, panelW:420, panelH:320 },
//    tabs:[{id:'a',label:'A',content:'<b>Hei</b>'}],
//    onToggle: (open)=>{},
//    onAction: (ev)=>{}, // ev: {type:'tabChange', detail:{...}} eller {type:'click', ...}
//  })

class DialPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;
    this._cfg = {
      button: { label: 'D', icon: '☰' },
      position: { bottom: 12, right: 12 },
      size: { btn: 56, panelW: 420, panelH: 320 },
      tabs: [],
      onToggle: null,
      onAction: null
    };
  }

  connectedCallback() {
    if (!this.shadowRoot.innerHTML) this.render();
  }

  setup(cfg = {}) {
    this._cfg = this._merge(this._cfg, cfg);
    if (!this._cfg.tabs?.length) this._cfg.tabs = [{ id: 'main', label: 'Main', content: '' }];
    this.render();
    return this;
  }

  toggle(force) {
    this._open = typeof force === 'boolean' ? force : !this._open;
    this.render();
    this._cfg.onToggle?.(this._open);
    this.dispatchEvent(new CustomEvent('toggle', { detail: { open: this._open } }));
  }

  render() {
    const { button, position, size, tabs } = this._cfg;
    const open = this._open;

    this.shadowRoot.innerHTML = `
      <style>
        :host{ position:fixed; inset:auto; z-index:2147483647; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; }
        .wrap{ position:fixed; right:${position.right}px; bottom:${position.bottom}px; }
        .dial{
          width:${size.btn}px; height:${size.btn}px; border-radius:999px;
          border:1px solid rgba(255,255,255,.18);
          background:rgba(0,0,0,.75);
          color:#fff; cursor:pointer;
          display:grid; place-items:center;
          box-shadow:0 10px 30px rgba(0,0,0,.35);
          user-select:none;
        }
        .dial:active{ transform:translateY(1px); }
        .panel{
          width:${size.panelW}px; height:${size.panelH}px;
          margin-bottom:10px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(0,0,0,.72);
          color:#fff;
          box-shadow:0 18px 60px rgba(0,0,0,.45);
          overflow:hidden;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .panelHeader{
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 12px;
          border-bottom:1px solid rgba(255,255,255,.10);
          background:rgba(255,255,255,.04);
        }
        .title{ font-size:12px; opacity:.9; letter-spacing:.2px; }
        .close{
          width:34px; height:28px; border-radius:10px;
          border:1px solid rgba(255,255,255,.14);
          background:transparent; color:#fff;
          cursor:pointer;
        }
        tabs-view{ display:block; height:calc(100% - 49px); }
        /* gjennomsiktig “card content” */
        tabs-view::part(root){} /* hvis du senere legger parts i TabsView */
      </style>

      <div class="wrap">
        ${open ? `
          <div class="panel" part="panel">
            <div class="panelHeader">
              <div class="title">Panel</div>
              <button class="close" title="Close">✕</button>
            </div>
            <tabs-view orientation="vertical"></tabs-view>
          </div>
        ` : ''}

        <button class="dial" part="dial" title="Toggle">
          <span>${button.icon || button.label}</span>
        </button>
      </div>
    `;

    const $dial = this.shadowRoot.querySelector('.dial');
    const $close = this.shadowRoot.querySelector('.close');
    const $tabs = this.shadowRoot.querySelector('tabs-view');

    $dial?.addEventListener('click', () => {
      this._cfg.onAction?.({ type: 'click', detail: { target: 'dial' } });
      this.toggle();
    });

    $close?.addEventListener('click', () => {
      this._cfg.onAction?.({ type: 'click', detail: { target: 'close' } });
      this.toggle(false);
    });

    if ($tabs) {
      $tabs.tabs = tabs;
      $tabs.activeId = ($tabs.activeId ?? tabs?.[0]?.id) ?? null;

      $tabs.addEventListener('tabChange', (e) => {
        this._cfg.onAction?.({ type: 'tabChange', detail: e.detail });
        this.dispatchEvent(new CustomEvent('action', { detail: { type: 'tabChange', ...e.detail } }));
      });
    }
  }

  _merge(a, b) {
    const out = { ...a };
    for (const k in (b || {})) {
      const v = b[k];
      out[k] = v && typeof v === 'object' && !Array.isArray(v) ? this._merge(a[k] || {}, v) : v;
    }
    return out;
  }
}

customElements.define('dial-panel', DialPanel);

// --- eksempelbruk ---
/*
const el = document.createElement('dial-panel');
document.body.appendChild(el);

el.setup({
  button: { icon: '☰' },
  position: { bottom: 14, right: 14 },
  size: { btn: 56, panelW: 520, panelH: 360 },
  tabs: [
    { id: 'a', label: 'A', content: '<div>Innhold A</div>' },
    { id: 'b', label: 'B', content: '<div>Innhold B</div>' },
  ],
  onToggle: (open) => console.log('open=', open),
  onAction: (ev) => console.log('action', ev),
});
*/
