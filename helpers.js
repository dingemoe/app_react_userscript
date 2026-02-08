// helpers.js
(() => {
  const root = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

  class UI {
    static cfg = { classes:{} };

    static Config(c){ UI.cfg = c || { classes:{} }; return UI.cfg; }

    static InjectFromConfig() {
      const cssText = UI.cfg?.cssText;
      if (!cssText || typeof cssText !== 'string') return;
      UI.InjectCss(cssText);
    }

    static InjectCss(cssText, id = 'tm_userscript_styles') {
      try {
        const d = document;
        if (!d?.head) return;
        let el = d.getElementById(id);
        if (!el) {
          el = d.createElement('style');
          el.id = id;
          d.head.appendChild(el);
        }
        el.textContent = cssText;
      } catch (_) {
        // ignore
      }
    }

    static _parseRgb(str) {
      // supports: rgb(r,g,b) / rgba(r,g,b,a)
      if (!str || typeof str !== 'string') return null;
      const m = str.trim().match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
      if (!m) return null;
      const r = Number(m[1]), g = Number(m[2]), b = Number(m[3]);
      const a = (m[4] == null) ? 1 : Number(m[4]);
      if (![r,g,b,a].every(n => Number.isFinite(n))) return null;
      return { r, g, b, a };
    }

    static _relLuminance({ r, g, b }) {
      // WCAG relative luminance (sRGB)
      const f = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? (s / 12.92) : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const R = f(r), G = f(g), B = f(b);
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    static PageIsLight() {
      try {
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
        let rgb = UI._parseRgb(bodyBg);
        if (!rgb || rgb.a < 0.12) rgb = UI._parseRgb(htmlBg);
        // hvis fortsatt "transparent"/ukjent, anta lys side (tryggest for lesbarhet)
        if (!rgb || rgb.a < 0.12) return true;
        const lum = UI._relLuminance(rgb);
        return lum > 0.62;
      } catch (_) {
        return true;
      }
    }

    static IsPlainObject(v){
      if (!v || typeof v !== 'object') return false;
      const proto = Object.getPrototypeOf(v);
      return proto === Object.prototype || proto === null;
    }

    static Style(classNames=''){
      const out = {};
      const names = String(classNames || '').trim().split(/\s+/).filter(Boolean);
      for (const n of names) {
        const s = UI.cfg?.classes?.[n];
        if (UI.IsPlainObject(s)) Object.assign(out, s);
      }
      return out;
    }

    static Text(s){ return document.createTextNode(String(s)); }

    // Elem(tag, className, attrs, ...children)
    static Elem(tag, cls='', attrs={}, ...kids){
      const el = document.createElement(tag);

      // normalize args: allow (tag, attrs, ...kids) or (tag, class, attrs, ...kids)
      let className = '';
      let attrObj = {};
      let children = [];

      if (typeof cls === 'string' || typeof cls === 'number') {
        className = String(cls);
        if (UI.IsPlainObject(attrs)) {
          attrObj = attrs;
          children = kids;
        } else {
          attrObj = {};
          children = [attrs, ...kids];
        }
      } else if (UI.IsPlainObject(cls)) {
        className = '';
        attrObj = cls;
        children = [attrs, ...kids];
      } else if (cls == null) {
        className = '';
        if (UI.IsPlainObject(attrs)) {
          attrObj = attrs;
          children = kids;
        } else {
          attrObj = {};
          children = [attrs, ...kids];
        }
      } else {
        className = '';
        attrObj = {};
        children = [cls, attrs, ...kids];
      }

      // class + styles from config
      className = (className == null) ? '' : String(className);
      if (className) el.className = className;

      const styleFromCfg = UI.Style(className);
      Object.assign(el.style, styleFromCfg);

      // attrs/events
      if (!UI.IsPlainObject(attrObj)) attrObj = {};
      for (const k in attrObj){
        const v = attrObj[k];
        if (v == null) continue;
        if (k === 'style' && UI.IsPlainObject(v)) Object.assign(el.style, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, String(v));
      }

      // children
      children.flat().forEach(c => {
        if (c == null) return;
        el.appendChild(typeof c === 'string' ? UI.Text(c) : c);
      });

      return el;
    }

    static Card(child, cls='card', attrs){
      if (UI.IsPlainObject(cls) && attrs == null) return UI.Elem('div', cls, child);
      if (attrs == null) return UI.Elem('div', cls, {}, child);
      return UI.Elem('div', cls, attrs, child);
    }
  }

  root.UI = UI;
})();
