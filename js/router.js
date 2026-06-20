/**
 * 轻量 SPA 路由器（基于 hash）
 *
 * 支持底部标签栏联动：
 *   路由切换 → 自动高亮对应标签
 *   标签点击 → 更新 hash 并渲染
 */
var Router = (function () {
  'use strict';

  var routes = {};
  var currentRoute = null;
  var defaultRoute = 'expense';

  function parse() {
    var hash = window.location.hash.replace('#', '') || '/' + defaultRoute;
    if (hash[0] === '/') hash = hash.slice(1);
    var parts = hash.split('/');
    var route = parts[0];
    var params = {};
    if (parts.length > 1) {
      params = { splat: parts.slice(1) };
      var def = routes[route];
      if (def && def.paramNames) {
        for (var i = 0; i < def.paramNames.length && i + 1 < parts.length; i++) {
          params[def.paramNames[i]] = parts[i + 1];
        }
      }
    }
    return { route: route, params: params };
  }

  function dispatch() {
    var parsed = parse();
    var def = routes[parsed.route];
    if (!def) {
      window.location.hash = '#/' + defaultRoute;
      return;
    }
    currentRoute = parsed.route;
    Router.params = parsed.params;

    // 更新导航标题
    var titleEl = document.getElementById('nav-title');
    if (titleEl && def.title) titleEl.textContent = def.title;

    // 更新标签栏高亮
    updateTabBar(parsed.route);

    // 渲染
    var container = document.getElementById('view-container');
    if (container && typeof def.render === 'function') {
      container.innerHTML = '';
      def.render(parsed.params, container);
    }
  }

  function updateTabBar(route) {
    var tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(function (tab) {
      var tabRoute = tab.getAttribute('data-route');
      if (tabRoute === route || (route === defaultRoute && tabRoute === defaultRoute)) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  /** 构建标签栏 */
  function buildTabBar() {
    var tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    var tabs = ToolRegistry.getTabs();
    tabBar.innerHTML = tabs.map(function (tool) {
      return '<button class="tab-item" data-route="' + tool.id + '">' +
        (tool.tabIcon || '<span class="tab-emoji">' + tool.icon + '</span>') +
        '<span class="tab-label">' + tool.title + '</span>' +
      '</button>';
    }).join('');

    // 绑定点击
    tabBar.querySelectorAll('.tab-item').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var route = tab.getAttribute('data-route');
        if (route) Router.go(route);
      });
    });
  }

  window.addEventListener('hashchange', dispatch);

  window.addEventListener('DOMContentLoaded', function () {
    buildTabBar();
    if (!window.location.hash) {
      window.location.hash = '#/' + defaultRoute;
    } else {
      dispatch();
    }
  });

  return {
    register: function (name, def) {
      routes[name] = def;
    },

    go: function (route, params) {
      var hash = '#/' + route;
      if (params) {
        var def = routes[route];
        var extra = [];
        if (def && def.paramNames) {
          def.paramNames.forEach(function (p) {
            if (params[p] !== undefined) extra.push(encodeURIComponent(params[p]));
          });
        } else if (Array.isArray(params)) {
          extra = params.map(function (p) { return encodeURIComponent(p); });
        }
        if (extra.length) hash += '/' + extra.join('/');
      }
      window.location.hash = hash;
    },

    current: function () {
      return currentRoute;
    },

    params: {},

    refresh: function () {
      dispatch();
    }
  };
})();
