(function () {
  'use strict';

  var markedHosts = new WeakSet();
  var aiMatchers = null;
  var fetchPromise = null;

  function normalizeSrc(src) {
    return String(src || '').split('?')[0];
  }

  function basename(src) {
    var parts = normalizeSrc(src).split('/');
    return parts[parts.length - 1] || '';
  }

  function readInlineMatchers() {
    var list = window.__RK_AI_IMAGES;
    return Array.isArray(list) ? list.filter(Boolean) : [];
  }

  function fetchMatchers() {
    if (fetchPromise) return fetchPromise;

    fetchPromise = fetch('/api/ai-images', { credentials: 'same-origin' })
      .then(function (response) {
        if (!response.ok) throw new Error('ai-images request failed');
        return response.json();
      })
      .then(function (payload) {
        return Array.isArray(payload.images) ? payload.images.filter(Boolean) : [];
      })
      .catch(function () {
        return [];
      });

    return fetchPromise;
  }

  function getMatchers() {
    if (aiMatchers) return Promise.resolve(aiMatchers);

    var inline = readInlineMatchers();
    if (inline.length) {
      aiMatchers = inline;
      return Promise.resolve(aiMatchers);
    }

    return fetchMatchers().then(function (list) {
      aiMatchers = list;
      return aiMatchers;
    });
  }

  function srcMatchesList(src, list) {
    if (!src || !list || !list.length) return false;

    var normalized = normalizeSrc(src);
    var file = basename(src);

    for (var i = 0; i < list.length; i++) {
      var token = normalizeSrc(list[i]);
      if (!token) continue;
      if (normalized === token || file === token || file === basename(token)) return true;
      if (normalized.endsWith(token) || token.endsWith('/' + file)) return true;
    }

    return false;
  }

  function isAiImage(img, list) {
    if (img.closest('[data-rk-ai-image="false"]')) return false;
    if (img.getAttribute('data-rk-ai-image') === 'true') return true;
    if (img.closest('[data-rk-ai-image="true"]')) return true;

    var src = img.currentSrc || img.getAttribute('src') || '';
    return srcMatchesList(src, list);
  }

  function resolveVariant(host) {
    var badge = host.dataset.rkAiBadge;
    if (badge === 'light' || badge === 'dark') return badge;
    if (
      host.closest('.rk-page-hero--dark, .rk-hero, .rk-interstitial, .rk-contact-main, .rk-blog-cover-wrap')
    ) {
      return 'dark';
    }
    if (host.classList.contains('rk-split-media') || host.closest('.rk-tone-a, .rk-tone-b')) {
      return 'light';
    }
    return 'dark';
  }

  function resolveHost(img) {
    var explicit = img.closest('[data-rk-ai-image="true"]');
    if (explicit && explicit.tagName !== 'IMG') return explicit;

    if (img.closest('.rk-hero-bg')) return img.closest('.rk-hero');
    if (img.closest('.rk-interstitial-bg')) return img.closest('.rk-interstitial');
    if (img.closest('.rk-contact-bg')) return img.closest('.rk-contact-main');

    var structural = img.closest(
      '.rk-page-hero-media, .rk-split-media, .rk-team-photo, .rk-blog-cover, .rk-article-split-media, .rk-loc-figure, .rk-home-bento-cell--photo',
    );
    if (structural) return structural;

    if (explicit) return explicit.parentElement || explicit;

    return img.parentElement;
  }

  function resolveHostFromMarkedNode(node) {
    if (!node) return null;
    if (node.tagName === 'IMG') return resolveHost(node);
    return node;
  }

  function createBadge(variant) {
    var badge = document.createElement('span');
    badge.className = 'rk-ai-badge' + (variant === 'light' ? ' rk-ai-badge--light' : '');
    badge.setAttribute('role', 'note');
    badge.setAttribute('aria-label', 'KI-generiertes Bild');
    badge.innerHTML =
      '<span class="rk-ai-badge-dot" aria-hidden="true"></span><span class="rk-ai-badge-label">KI-Bild</span>';
    return badge;
  }

  function mountBadge(host, variant) {
    if (!host || markedHosts.has(host)) return;
    if (host.querySelector('.rk-ai-badge')) {
      markedHosts.add(host);
      return;
    }

    host.classList.add('rk-ai-badge-host');
    if (host.classList.contains('rk-split-media') || host.classList.contains('rk-article-split-media')) {
      host.classList.add('rk-ai-badge-host--split');
    }
    if (host.classList.contains('rk-hero')) {
      host.classList.add('rk-ai-badge-host--hero');
    }

    host.appendChild(createBadge(variant));
    markedHosts.add(host);
  }

  function init(list) {
    document.querySelectorAll('img').forEach(function (img) {
      if (!isAiImage(img, list)) return;
      var host = resolveHost(img);
      if (!host) return;
      mountBadge(host, resolveVariant(host));
    });

    document.querySelectorAll('[data-rk-ai-image="true"]').forEach(function (host) {
      var mountHost = resolveHostFromMarkedNode(host);
      if (!mountHost) return;
      mountBadge(mountHost, resolveVariant(mountHost));
    });
  }

  function boot() {
    getMatchers().then(function (list) {
      init(list);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('rk:ready', boot);
})();
