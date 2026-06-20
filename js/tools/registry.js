/**
 * 工具注册表 — 以闪亮之名衣橱
 */
var ToolRegistry = (function () {
  'use strict';
  var tools = [];
  return {
    register: function (tool) { tools.push(tool); Router.register(tool.id, {
      title: tool.title, render: tool.render, paramNames: tool.paramNames || []
    });},
    getAll: function () { return tools.slice(); },
    getTabs: function () { return tools.filter(function (t) { return t.tab; }); },
    get: function (id) {
      for (var i = 0; i < tools.length; i++) { if (tools[i].id === id) return tools[i]; }
      return null;
    }
  };
})();
