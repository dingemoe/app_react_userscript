class TabsView extends HTMLElement {
  static get observedAttributes() { return ['orientation', 'active-id']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._tabs = [];
    this._activeId = null;
  }

  set tabs(value) {
    this._tabs = Array.isArray(value) ? value : [];
    if (this._tabs.length && this._activeId == null) {
      this._activeId = this._tabs[0].id;
    }
    this.render();
  }

  get activeId() {
    return this._activeId;
  }

  set activeId(value) {
    this._activeId = value;
    this.setAttribute('active-id', String(value));
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'active-id') {
      const parsed = Number(newValue);
      this._activeId = Number.isNaN(parsed) ? newValue : parsed;
    }
    this.render();
  }

  get orientation() {
    return this.getAttribute('orientation') || 'vertical';
  }

  set orientation(value) {
    this.setAttribute('orientation', value || 'vertical');
  }

  onSelect(id) {
    this._activeId = id;
    this.render();
    const tab = this._tabs.find(t => t.id === id) || null;
    this.dispatchEvent(new CustomEvent('tabChange', {
      detail: { activeId: id, tab }
    }));
  }

  render() {
    const orientation = this.orientation === 'horizontal' ? 'horizontal' : 'vertical';
    const activeId = this._activeId;

    const content = this._tabs.find(t => t.id === activeId);
    const contentHtml = content ? (content.content ?? '') : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .tabs { display: flex; gap: 8px; border: 1px solid #d0d0d0; border-radius: 6px; overflow: hidden; }
        .tabs.vertical { flex-direction: row; }
        .tabs.horizontal { flex-direction: column; }
        .tab-list { display: flex; gap: 6px; padding: 8px; background: #f6f6f6; }
        .tabs.vertical .tab-list { flex-direction: column; min-width: 160px; border-right: 1px solid #e0e0e0; }
        .tabs.horizontal .tab-list { flex-direction: row; border-bottom: 1px solid #e0e0e0; }
        .tab-btn { cursor: pointer; padding: 8px 10px; border-radius: 4px; border: 1px solid transparent; background: transparent; text-align: left; }
        .tab-btn.active { background: #1f6feb; color: #fff; }
        .tab-content { flex: 1; padding: 12px; background: #fff; }
      </style>
      <div class="tabs ${orientation}">
        <div class="tab-list" role="tablist">
          ${this._tabs.map(t => `
            <button class="tab-btn ${t.id === activeId ? 'active' : ''}" data-id="${t.id}" role="tab" aria-selected="${t.id === activeId}">
              ${t.label}
            </button>
          `).join('')}
        </div>
        <div class="tab-content" role="tabpanel">
          ${contentHtml}
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => this.onSelect(this.parseId(btn.dataset.id));
    });
  }

  parseId(value) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
}

customElements.define('tabs-view', TabsView);
