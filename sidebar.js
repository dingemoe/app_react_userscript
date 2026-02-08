class NavFinder extends HTMLElement {
  static get observedAttributes() { return ['multiselect']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = [];
    this._selectedIds = new Set();
  }

  // Input data via setter
  set items(value) {
    this._items = value;
    this.render();
  }

  attributeChangedCallback() { this.render(); }

  toggleSelect(id) {
    const isMulti = this.hasAttribute('multiselect');
    if (!isMulti) this._selectedIds.clear();
    
    this._selectedIds.has(id) ? this._selectedIds.delete(id) : this._selectedIds.add(id);
    
    this.render();
    this.dispatchEvent(new CustomEvent('selectionChange', {
      detail: { 
        selectedIds: Array.from(this._selectedIds),
        items: this._items.filter(i => this._selectedIds.has(i.id))
      }
    }));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .sidebar { width: 200px; border-right: 1px solid #ccc; padding: 10px; }
        .item { cursor: pointer; padding: 8px; border-radius: 4px; }
        .item.active { background: #007bff; color: white; }
        .wrapper { display: flex; flex-direction: column; gap: 5px; background: #f9f9f9; padding: 10px; border-radius: 4px; }      
        </style>
      <div class="sidebar">
        <div class="wrapper">
        ${this._items.map(item => `
          <div class="item ${this._selectedIds.has(item.id) ? 'active' : ''}" 
               data-id="${item.id}">
            ${item.label}
          </div>
        `).join('')}
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('.item').forEach(el => {
      el.onclick = () => this.toggleSelect(Number(el.dataset.id));
    });
  }
}

customElements.define('nav-finder', NavFinder);