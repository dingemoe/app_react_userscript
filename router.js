// router.js
(() => {
  const root = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

  class Router {
    static routes = {};
    static register(path, factory) { Router.routes[path] = factory; }
    static path() { return location.hash.slice(1) || '/'; }
    static resolve() { return Router.routes[Router.path()] || Router.routes['/404'] || Router.routes['/']; }
    static start(render) {
      const tick = () => render(Router.resolve());
      window.addEventListener('hashchange', tick);
      tick();
    }
  }

  root.Router = Router;
})();
