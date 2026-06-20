/**
 * PWA 应用启动脚本
 *
 * 功能：
 * 1. 自动检测基础路径（兼容 GitHub Pages 子目录 / 自定义域名）
 * 2. Service Worker 注册 + 更新检测
 * 3. 在线/离线状态监听
 * 4. 安装提示（Chromium beforeinstallprompt + iOS 分享引导）
 * 5. iOS 独立模式检测
 * 6. 标签栏导航
 */
(function () {
  'use strict';

  /* ===================================================================
   * 1. 基础路径自动检测
   * =================================================================== */
  function getBasePath() {
    var pathname = window.location.pathname;
    var hostname = window.location.hostname;
    // GitHub Pages 项目仓库：username.github.io/repo-name/
    if (hostname.includes('github.io')) {
      var parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        return '/' + parts[0] + '/';
      }
    }
    // 根目录部署（自定义域名 或 username.github.io 仓库）
    return '/';
  }

  var BASE = getBasePath();

  /* ===================================================================
   * 2. iOS 独立模式检测
   *
   * iOS Safari 不支持 CSS display-mode media query，
   * 但提供了 navigator.standalone 属性。
   * =================================================================== */
  function isIOSStandalone() {
    return window.navigator.standalone === true;
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           isIOSStandalone();
  }

  // 给 <html> 添加 class，CSS 可据此调整样式
  if (isStandalone()) {
    document.documentElement.classList.add('is-standalone');
  }

  /* ===================================================================
   * 3. Service Worker 注册
   * =================================================================== */
  var updateReady = false;
  var waitingWorker = null;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register(BASE + 'sw.js', { scope: BASE })
        .then(function (registration) {
          console.log('[PWA] Service Worker 已注册:', registration.scope);

          // 监听 SW 更新
          registration.addEventListener('updatefound', function () {
            var newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', function () {
              // 新 SW 安装完毕但等待激活 → 有更新可用
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] 新版本可用');
                updateReady = true;
                waitingWorker = newWorker;
                showUpdateBanner();
              }
            });
          });
        })
        .catch(function (error) {
          console.error('[PWA] Service Worker 注册失败:', error);
        });
    });

    // 页面加载完成后检查是否有等待中的 SW
    navigator.serviceWorker.ready.then(function (registration) {
      if (registration.waiting) {
        updateReady = true;
        waitingWorker = registration.waiting;
        showUpdateBanner();
      }
    });

    // 监听 controllerchange — SW 更新后刷新
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      console.log('[PWA] Service Worker 已切换');
    });
  }

  /* ===================================================================
   * 4. 在线/离线状态检测
   * =================================================================== */
  var offlineBanner = document.getElementById('offline-banner');

  function updateOnlineStatus() {
    if (!offlineBanner) return;
    if (navigator.onLine) {
      offlineBanner.classList.add('hidden');
    } else {
      offlineBanner.classList.remove('hidden');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  /* ===================================================================
   * 5. 更新横幅
   * =================================================================== */
  var updateBanner = document.getElementById('update-banner');
  var updateBtn = document.getElementById('update-now');

  function showUpdateBanner() {
    if (updateBanner) {
      updateBanner.classList.remove('hidden');
    }
  }

  if (updateBtn) {
    updateBtn.addEventListener('click', function () {
      if (waitingWorker) {
        // 告诉等待中的 SW 跳过等待
        waitingWorker.postMessage({ action: 'skipWaiting' });
      }
      // 隐藏横幅
      if (updateBanner) {
        updateBanner.classList.add('hidden');
      }
    });
  }

  // SW 激活后自动刷新以显示新内容
  var refreshing = false;
  navigator.serviceWorker &&
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

  /* ===================================================================
   * 6. 安装提示
   * =================================================================== */

  // 6.1 Chromium 浏览器 beforeinstallprompt
  var deferredPrompt = null;
  var installButton = document.getElementById('install-button');

  window.addEventListener('beforeinstallprompt', function (e) {
    // 阻止默认的 mini-infobar
    e.preventDefault();
    deferredPrompt = e;

    // 显示安装按钮
    if (installButton && !isStandalone()) {
      installButton.classList.remove('hidden');
    }
  });

  if (installButton) {
    installButton.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] 用户接受了安装');
        } else {
          console.log('[PWA] 用户拒绝了安装');
        }
        deferredPrompt = null;
        installButton.classList.add('hidden');
      });
    });
  }

  // 6.2 iOS 安装引导（iOS 没有 beforeinstallprompt）
  var installHint = document.getElementById('install-hint');
  var dismissHintBtn = document.getElementById('dismiss-hint');

  // 检查是否已显示过引导
  var hintDismissed = sessionStorage.getItem('pwa-install-hint-dismissed');

  if (installHint && !isStandalone() && !hintDismissed && !deferredPrompt) {
    // 检测 iOS 设备
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || isIOSStandalone();
    if (isIOS) {
      // 延迟显示，让页面先加载完成
      setTimeout(function () {
        installHint.classList.remove('hidden');
      }, 2000);
    }
  }

  if (dismissHintBtn) {
    dismissHintBtn.addEventListener('click', function () {
      installHint.classList.add('hidden');
      sessionStorage.setItem('pwa-install-hint-dismissed', '1');
    });
  }

  // 6.3 安装完成事件
  window.addEventListener('appinstalled', function () {
    console.log('[PWA] 应用已安装');
    deferredPrompt = null;
    if (installButton) installButton.classList.add('hidden');
    if (installHint) installHint.classList.add('hidden');
  });

  /* ===================================================================
   * 7. 标签栏导航
   * =================================================================== */
  var tabs = document.querySelectorAll('.tab');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // 移除所有 active
      tabs.forEach(function (t) { t.classList.remove('active'); });
      // 设置当前 active
      tab.classList.add('active');

      var tabName = tab.getAttribute('data-tab');
      console.log('[PWA] 切换到标签:', tabName);

      // 此处可扩展为实际的页面切换逻辑
      // 例如：通过 SPA 路由器渲染对应视图
    });
  });

  /* ===================================================================
   * 8. 内部链接拦截（iOS 独立模式下避免跳转 Safari）
   *
   * 在 iOS PWA 独立模式下，任何跨域链接都会跳转到 Safari。
   * 这里拦截同域链接，使用 history.pushState 进行 SPA 导航。
   * =================================================================== */
  document.addEventListener('click', function (e) {
    var target = e.target.closest('a');
    if (!target) return;

    var href = target.getAttribute('href');
    if (!href) return;

    // 外部链接（跨域）→ 让 Safari 处理
    if (href.startsWith('http') && !href.startsWith(window.location.origin)) {
      return;
    }

    // 锚点链接 → 不拦截
    if (href.startsWith('#')) return;

    // javascript: 伪协议 → 不拦截
    if (href.startsWith('javascript:')) return;

    // download 属性 → 不拦截
    if (target.hasAttribute('download')) return;

    // 同域链接 → SPA 路由
    e.preventDefault();
    window.history.pushState({}, '', href);
    console.log('[PWA] SPA 导航到:', href);

    // 此处可扩展为实际的 SPA 路由逻辑
  });

  /* ===================================================================
   * 9. 启动日志
   * =================================================================== */
  console.log('[PWA] 基础路径:', BASE);
  console.log('[PWA] 独立模式:', isStandalone());
  console.log('[PWA] 在线状态:', navigator.onLine);

})();
