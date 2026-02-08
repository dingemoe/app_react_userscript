// dial-panel + tabs-view (ALL DARK) + fixed dial + ✕ on open + fuzzy pop + orbiting border ring

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
        .tabs{
          display:flex;gap:10px;height:100%;
          border:1px solid rgba(255,255,255,.10);
          border-radius:14px; overflow:hidden;
          background:rgba(255,255,255,.03);
        }
        .tabs.vertical{flex-direction:row}
        .tabs.horizontal{flex-direction:column}
        .tab-list{
          display:flex;gap:8px;padding:10px;
          background:rgba(255,255,255,.04);
        }
        .tabs.vertical .tab-list{
          flex-direction:column;min-width:160px;
          border-right:1px solid rgba(255,255,255,.10)
        }
        .tabs.horizontal .tab-list{
          flex-direction:row;border-bottom:1px solid rgba(255,255,255,.10)
        }
        .tab-btn{
          cursor:pointer;padding:10px 12px;border-radius:10px;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(0,0,0,.10);
          text-align:left;color:rgba(255,255,255,.9);
          transition: background .15s ease, border-color .15s ease, transform .08s ease;
        }
        .tab-btn:hover{background:rgba(255,255,255,.06)}
        .tab-btn:active{transform:translateY(1px)}
        .tab-btn.active{
          background:rgba(31,111,235,.92);
          border-color:rgba(31,111,235,.92);
          color:#fff;
        }
        .tab-content{
          flex:1;padding:14px;overflow:auto;
          background:rgba(0,0,0,.18);
          color:rgba(255,255,255,.92);
        }
        .tab-content :is(p,div,span,pre,code,li,a){color:inherit}
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
    this._cfg={
      button:{ icon:'☰', closeIcon:'✕' },
      position:{ bottom:14, right:14 },
      size:{ btn:56, panelW:520, panelH:360 },
      tabs:[],
      title:'Panel',
      onToggle:null,
      onAction:null
    };
  }
  connectedCallback(){ if(!this.shadowRoot.innerHTML) this.render(); }
  setup(cfg={}){ this._cfg=this._merge(this._cfg,cfg);
    if(!this._cfg.tabs?.length) this._cfg.tabs=[{id:'main',label:'Main',content:''}];
    this.render(); return this; }

  // internal toggle (no animation orchestration here)
  _setOpen(v){
    this._open=!!v;
    this.render();
    this._cfg.onToggle?.(this._open);
    this.dispatchEvent(new CustomEvent('toggle',{detail:{open:this._open}}));
  }

  render(){
    const {button,position,size,tabs,title}=this._cfg;
    const open=this._open;
    const dialIcon = open ? (button.closeIcon || '✕') : (button.icon || '☰');

    this.shadowRoot.innerHTML=`
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
        @keyframes tmSweep{
          0%{ transform:translate(-50%,-50%) rotate(0deg) }
          100%{ transform:translate(-50%,-50%) rotate(360deg) }
        }

        .dial{
          position:fixed; right:${position.right}px; bottom:${position.bottom}px;
          width:${size.btn}px;height:${size.btn}px;border-radius:999px;
          border:1px solid rgba(255,255,255,.16);
          background:rgba(20,20,20,.82); color:#fff;
          display:grid;place-items:center;cursor:pointer;
          box-shadow:0 12px 40px rgba(0,0,0,.55);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          transition: transform .12s ease, box-shadow .2s ease, filter .2s ease, background .2s ease;
        }
        .dial:hover{ background:rgba(28,28,28,.88); }
        .dial:active{ transform:translateY(1px) scale(.98); }
        .dial.pulse{
          filter: brightness(1.15);
          box-shadow:0 16px 50px rgba(0,0,0,.65);
        }

        .panel{
          position:fixed; right:${position.right}px;
          bottom:${position.bottom + size.btn + 10}px;
          width:${size.panelW}px;height:${size.panelH}px;border-radius:18px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(18,18,18,.82); color:#fff;
          box-shadow:0 22px 80px rgba(0,0,0,.65);
          overflow:hidden;
          backdrop-filter: blur(12px);-webkit-backdrop-filter: blur(12px);
          transform-origin: 85% 100%;
          animation: tmPopIn .22s ease forwards;
        }
        .panel.closing{ animation: tmPopOut .20s ease forwards; }

        /* fuzzy bloom */
        .panel::before{
          content:"";
          position:absolute; inset:-18px;
          border-radius:22px;
          background:
            radial-gradient(closest-side, rgba(31,111,235,.18), transparent 70%),
            radial-gradient(closest-side, rgba(255,255,255,.08), transparent 65%);
          filter: blur(18px);
          opacity:.85;
          pointer-events:none;
        }

        /* orbit border ring */
        .panel::after{
          content:"";
          position:absolute; left:50%; top:50%;
          width:140%; height:140%;
          border-radius:999px;
          background:
            conic-gradient(
              from 0deg,
              transparent 0 320deg,
              rgba(31,111,235,0) 320deg 336deg,
              rgba(31,111,235,.85) 336deg 352deg,
              rgba(255,255,255,.65) 352deg 360deg
            );
          animation: tmSweep 2.2s linear infinite;
          opacity:.9;
          pointer-events:none;
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px));
          mix-blend-mode: screen;
        }

        .panelHeader{
          display:flex;align-items:center;justify-content:space-between;
          padding:12px 14px;
          border-bottom:1px solid rgba(255,255,255,.10);
          background:rgba(255,255,255,.04);
          position:relative;
        }
        .title{font-size:12px;opacity:.92;letter-spacing:.2px}
        .close{
          width:34px;height:28px;border-radius:10px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(0,0,0,.15);
          color:#fff; cursor:pointer;
          transition: background .15s ease;
        }
        .close:hover{background:rgba(255,255,255,.06)}
        tabs-view{display:block;height:calc(100% - 53px)}
      </style>

      ${open?`
        <div class="panel">
          <div class="panelHeader">
            <div class="title">${title}</div>
            <button class="close" title="Close">✕</button>
          </div>
          <tabs-view orientation="vertical"></tabs-view>
        </div>`:''}

      <button class="dial" title="Toggle">${dialIcon}</button>
    `;

    const $dial=this.shadowRoot.querySelector('.dial');
    const $close=this.shadowRoot.querySelector('.close');
    const $tabs=this.shadowRoot.querySelector('tabs-view');
    const $panel=this.shadowRoot.querySelector('.panel');

    const pulse=()=>{
      $dial.classList.add('pulse');
      setTimeout(()=> $dial && $dial.classList.remove('pulse'), 160);
    };

    const openNow=()=>{
      pulse();
      this._cfg.onAction?.({type:'click',detail:{target:'dial',open:true}});
      this._setOpen(true);
    };

    const closeNow=()=>{
      pulse();
      this._cfg.onAction?.({type:'click',detail:{target:'dial',open:false}});
      if($panel){
        $panel.classList.add('closing');
        setTimeout(()=> this._setOpen(false), 180);
      } else this._setOpen(false);
    };

    $dial.onclick=()=> open ? closeNow() : openNow();
    $close?.addEventListener('click', closeNow);

    if($tabs){
      $tabs.tabs=tabs;
      $tabs.activeId=$tabs.activeId ?? tabs?.[0]?.id ?? null;
      $tabs.addEventListener('tabChange',e=>{
        this._cfg.onAction?.({type:'tabChange',detail:e.detail});
        this.dispatchEvent(new CustomEvent('action',{detail:{type:'tabChange',...e.detail}}));
      });
    }
  }

  _merge(a,b){
    const o={...a};
    for(const k in (b||{})){
      const v=b[k];
      o[k]=v && typeof v==='object' && !Array.isArray(v) ? this._merge(a[k]||{},v) : v;
    }
    return o;
  }
}
customElements.define('dial-panel', DialPanel);