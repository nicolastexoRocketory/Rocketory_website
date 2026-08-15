(function () {
  'use strict';

  var AI_SRC =
    /team-raketenstart|angebote-teaser-astronaut|inklusive-raketenstart|(?:^|\/)Raketenstart\.|mobile-hero|technologien-hero|kontakt-cosmos|team-rocketory/i;
  var markedHosts = new WeakSet();

  function isAiImage(img) {
    if (img.closest('[data-rk-ai-image="false"]')) return false;
    if (img.hasAttribute('data-rk-ai-image') || img.closest('[data-rk-ai-image]:not([data-rk-ai-image="false"])')) {
      return true;
    }
    var src = img.currentSrc || img.getAttribute('src') || '';
    return AI_SRC.test(src);
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
    var explicit = img.closest('[data-rk-ai-image]:not([data-rk-ai-image="false"])');
    if (explicit) return explicit;

    if (img.closest('.rk-hero-bg')) return img.closest('.rk-hero');
    if (img.closest('.rk-interstitial-bg')) return img.closest('.rk-interstitial');
    if (img.closest('.rk-contact-bg')) return img.closest('.rk-contact-main');

    return (
      img.closest(
        '.rk-page-hero-media, .rk-split-media, .rk-blog-cover, .rk-article-split-media, .rk-loc-figure',
      ) || img.parentElement
    );
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

  function init() {
    document.querySelectorAll('img').forEach(function (img) {
      if (!isAiImage(img)) return;
      var host = resolveHost(img);
      if (!host) return;
      mountBadge(host, resolveVariant(host));
    });

    document.querySelectorAll('[data-rk-ai-image]:not([data-rk-ai-image="false"])').forEach(function (host) {
      mountBadge(host, resolveVariant(host));
    });
  }

  function boot() {
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('rk:ready', boot);
})();
