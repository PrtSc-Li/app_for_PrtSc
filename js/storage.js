/**
 * localStorage 封装
 * - 自动 JSON 序列化/反序列化
 * - 提供默认值回退
 * - 命名空间前缀避免冲突
 */
var Storage = (function () {
  'use strict';

  var PREFIX = 'pwa_';

  function _key(k) {
    return PREFIX + k;
  }

  return {
    /** 读取数据，不存在时返回 defaultValue */
    get: function (key, defaultValue) {
      try {
        var raw = localStorage.getItem(_key(key));
        if (raw === null || raw === undefined) return defaultValue;
        return JSON.parse(raw);
      } catch (e) {
        console.warn('[Storage] 读取失败:', key, e);
        return defaultValue;
      }
    },

    /** 写入数据 */
    set: function (key, value) {
      try {
        localStorage.setItem(_key(key), JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('[Storage] 写入失败:', key, e);
        return false;
      }
    },

    /** 删除数据 */
    remove: function (key) {
      try {
        localStorage.removeItem(_key(key));
        return true;
      } catch (e) {
        return false;
      }
    },

    /** 获取所有带前缀的 key */
    keys: function () {
      var result = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) {
          result.push(k.slice(PREFIX.length));
        }
      }
      return result;
    }
  };
})();
