/**
 * PWA 应用启动脚本（精简版）
 *
 * 功能：
 * 1. 基础路径检测（兼容 GitHub Pages 子目录 / 自定义域名）
 * 2. Service Worker 注册 + 更新检测
 * 3. 在线/离线状态监听
 * 4. 安装提示（Chromium beforeinstallprompt + iOS 分享引导）
 * 5. iOS 独立模式检测
 *
 * 路由逻辑已移至 router.js，页面视图由各 tools/*.js 负责
 */
(function () {
  'use strict';

  /* ===================================================================
   * 1. 基础路径自动检测
   * =================================================================== */
  function getBasePath() {
    var pathname = window.location.pathname;
    var hostname = window.location.hostname;
    if (hostname.includes('github.io')) {
      var parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        return '/' + parts[0] + '/';
      }
    }
    return '/';
  }

  var BASE = getBasePath();

  /* ===================================================================
   * 2. iOS 独立模式检测
   * =================================================================== */
  function isIOSStandalone() {
    return window.navigator.standalone === true;
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           isIOSStandalone();
  }

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

          registration.addEventListener('updatefound', function () {
            var newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', function () {
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

    navigator.serviceWorker.ready.then(function (registration) {
      if (registration.waiting) {
        updateReady = true;
        waitingWorker = registration.waiting;
        showUpdateBanner();
      }
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
        waitingWorker.postMessage({ action: 'skipWaiting' });
      }
      if (updateBanner) {
        updateBanner.classList.add('hidden');
      }
    });
  }

  var refreshing = false;
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  /* ===================================================================
   * 6. 安装提示
   * =================================================================== */

  // 6.1 Chromium 浏览器 beforeinstallprompt
  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    // 已安装或独立模式下不提示
    if (isStandalone()) return;
    // 不显示独立按钮，但保留事件以便后续触发
  });

  // 6.2 iOS 安装引导
  var installHint = document.getElementById('install-hint');
  var dismissHintBtn = document.getElementById('dismiss-hint');
  var hintDismissed = sessionStorage.getItem('pwa-install-hint-dismissed');

  if (installHint && !isStandalone() && !hintDismissed && !deferredPrompt) {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || isIOSStandalone();
    if (isIOS) {
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

  window.addEventListener('appinstalled', function () {
    console.log('[PWA] 应用已安装');
    deferredPrompt = null;
    if (installHint) installHint.classList.add('hidden');
  });

  /* ===================================================================
   * 7. 启动日志
   * =================================================================== */
  console.log('[PWA] 基础路径:', BASE);
  console.log('[PWA] 独立模式:', isStandalone());
  console.log('[PWA] 在线状态:', navigator.onLine);

})();
