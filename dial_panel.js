// dial-panel + tabs-view (fixed dial som aldri flytter seg)

// ---------- TabsView ----------
class TabsView extends HTMLElement {
  static get observedAttributes() { return ['orientation', 'active-id']; }
  constructor(){ super(); this.attachShadow({mode:'open'}); this._tabs=[]; this._activeId=null; }
  set tabs(v){ this._tabs=Array.isArray(v)?v:[]; if(this._tabs.length&&this._activeId==null)this._activeId=this._tabs[0].id; this.render(); }
  get activeId(){ return this._activeId; }
  set activeId(v){ this._activeId=v; this.setAttribute('active-id',String(v)); this.render(); }
  attributeChangedCallback(n,o,v){ if(o===v)return; if(n==='active-id'){ const p=Number(v); this._activeId=Number.isNaN(p)?v:p; } this.render(); }
  get orientation(){ return this.getAttribute('orientation')||'vertical'; }
  set orientation(v){ this.setAttribute('orientation',v||'vertical'); }
  onSelect(id){ this._activeId=id; this.render(); const tab=this._tabs.find(t=>t.id===id)||null;
    this.dispatchEvent(new CustomEvent('tabChange',{detail:{activeId:id,tab}})); }
  parseId(v){ const p=Number(v); return Number.isNaN(p)?v:p; }
  render(){
    const o=this.orientation==='horizontal'?'horizontal':'vertical';
    const a=this._activeId; const c=this._tabs.find(t=>t.id===a);
    const html=c?(c.content??''):'';
    this.shadowRoot.innerHTML=`
      <style>
        :host{display:block;height:100%}
        .tabs{display:flex;gap:8px;border:1px solid #d0d0d0;border-radius:6px;overflow:hidden;height:100%}
        .tabs.vertical{flex-direction:row}
        .tabs.horizontal{flex-direction:column}
        .tab-list{display:flex;gap:6px;padding:8px;background:#f6f6f6}
        .tabs.vertical .tab-list{flex-direction:column;min-width:160px;border-right:1px solid #e0e0e0}
        .tabs.horizontal .tab-list{flex-direction:row;border-bottom:1px solid #e0e0e0}
        .tab-btn{cursor:pointer;padding:8px 10px;border-radius:4px;border:1px solid transparent;background:transparent;text-align:left}
        .tab-btn.active{background:#1f6feb;color:#fff}
        .tab-content{flex:1;padding:12px;background:#fff;color:#111;overflow:auto}
      </style>
      <div class="tabs ${o}">
        <div class="tab-list" role="tablist">
          ${this._tabs.map(t=>`
            <button class="tab-btn ${t.id===a?'active':''}" data-id="${t.id}" role="tab" aria-selected="${t.id===a}">
              ${t.label}
            </button>`).join('')}
        </div>
        <div class="tab-content" role="tabpanel">${html}</div>
      </div>`;
    this.shadowRoot.querySelectorAll('.tab-btn').forEach(b=>b.onclick=()=>this.onSelect(this.parseId(b.dataset.id)));
  }
}
customElements.define('tabs-view', TabsView);

// ---------- DialPanel ----------
class DialPanel extends HTMLElement {
  constructor(){
    super(); this.attachShadow({mode:'open'}); this._open=false;
    this._cfg={ button:{icon:'☰'}, position:{bottom:14,right:14}, size:{btn:56,panelW:520,panelH:360},
      tabs:[], onToggle:null, onAction:null };
  }
  connectedCallback(){ if(!this.shadowRoot.innerHTML) this.render(); }
  setup(cfg={}){ this._cfg=this._merge(this._cfg,cfg);
    if(!this._cfg.tabs?.length) this._cfg.tabs=[{id:'main',label:'Main',content:''}];
    this.render(); return this; }
  toggle(force){ this._open=typeof force==='boolean'?force:!this._open; this.render();
    this._cfg.onToggle?.(this._open);
    this.dispatchEvent(new CustomEvent('toggle',{detail:{open:this._open}})); }
  render(){
    const {button,position,size,tabs}=this._cfg; const open=this._open;
    this.shadowRoot.innerHTML=`
      <style>
        :host{z-index:2147483647;font-family:system-ui}
        .dial{
          position:fixed; right:${position.right}px; bottom:${position.bottom}px;
          width:${size.btn}px;height:${size.btn}px;border-radius:999px;
          border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.75);color:#fff;
          display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.35);
        }
        .panel{
          position:fixed; right:${position.right}px; bottom:${position.bottom+size.btn+10}px;
          width:${size.panelW}px;height:${size.panelH}px;border-radius:16px;
          border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.72);color:#fff;
          box-shadow:0 18px 60px rgba(0,0,0,.45);overflow:hidden;
          backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
        }
        .panelHeader{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;
          border-bottom:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04)}
        .title{font-size:12px;opacity:.9}
        .close{width:34px;height:28px;border-radius:10px;border:1px solid rgba(255,255,255,.14);
          background:transparent;color:#fff;cursor:pointer}
        tabs-view{display:block;height:calc(100% - 49px)}
      </style>
      ${open?`
        <div class="panel">
          <div class="panelHeader">
            <div class="title">Panel</div>
            <button class="close">✕</button>
          </div>
          <tabs-view orientation="vertical"></tabs-view>
        </div>`:''}
      <button class="dial"><span>${button.icon||'☰'}</span></button>
    `;
    const $dial=this.shadowRoot.querySelector('.dial');
    const $close=this.shadowRoot.querySelector('.close');
    const $tabs=this.shadowRoot.querySelector('tabs-view');

    $dial.onclick=()=>{ this._cfg.onAction?.({type:'click',detail:{target:'dial'}}); this.toggle(); };
    $close?.addEventListener('click',()=>{ this._cfg.onAction?.({type:'click',detail:{target:'close'}}); this.toggle(false); });

    if($tabs){ $tabs.tabs=tabs; $tabs.activeId=$tabs.activeId??tabs?.[0]?.id??null;
      $tabs.addEventListener('tabChange',e=>{
        this._cfg.onAction?.({type:'tabChange',detail:e.detail});
        this.dispatchEvent(new CustomEvent('action',{detail:{type:'tabChange',...e.detail}}));
      });
    }
  }
  _merge(a,b){ const o={...a}; for(const k in (b||{})){ const v=b[k];
      o[k]=v&&typeof v==='object'&&!Array.isArray(v)?this._merge(a[k]||{},v):v; } return o; }
}
customElements.define('dial-panel', DialPanel);

// --- bruk ---
/*
const el=document.createElement('dial-panel');
document.body.appendChild(el);
el.setup({
  button:{icon:'☰'},
  position:{bottom:14,right:14},
  size:{btn:56,panelW:520,panelH:360},
  tabs:[
    {id:'a',label:'A',content:'<div>Innhold A</div>'},
    {id:'b',label:'B',content:'<div>Innhold B</div>'}
  ]
});
*/
