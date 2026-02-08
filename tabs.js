// tabs.js  (definer web component globalt)
class TabsBox extends HTMLElement {
  connectedCallback(){
    this.innerHTML = `
      <div class="tm_tabs_box">
        Tabs component OK
      </div>`;
  }
}
customElements.define('tabs-box', TabsBox);
