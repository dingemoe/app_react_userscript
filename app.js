// app.js
(() => {
  'use strict';

  const root = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
  const { UI, Boot, Router, View } = root;

  if (!UI || !Boot || !Router || !View) {
    console.error('Missing globals', { UI, Boot, Router, View });
    return;
  }

  // Router API-compat: add/register
  const addRoute =
    Router.add ||
    Router.register ||
    Router.addRoute;

  const getPath =
    Router.get ||
    Router.path ||
    (() => location.hash.slice(1) || '/');

  const start =
    Router.start;

  if (typeof addRoute !== 'function' || typeof start !== 'function') {
    console.error('Router API mismatch', Router);
    return;
  }

  const { Elem, Text } = UI;

  const register = {
    Tabs: () => Elem('tabs-box'),
    Home: () => Elem('div', 'card', {}, Text('HOME PAGE')),
    Contact: () => Elem('div', 'card', {}, Text('CONTACT PAGE')),
    NotFound: () => Elem('div', 'card', {}, Text('404')),
  };

  const routes = [
    { path: '/', label: 'Tabs', factory: register.Tabs },
    { path: '/home', label: 'Home', factory: register.Home },
    { path: '/contact', label: 'Contact', factory: register.Contact },
  ];

  routes.forEach(r => addRoute.call(Router, r.path, r.factory));
  addRoute.call(Router, '/404', register.NotFound);

  start.call(Router, (factory) => {
    Boot.Mount(() => View.Render(factory(), routes, getPath.call(Router)));
  });
})();
