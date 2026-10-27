(function () {
  var banners = document.querySelectorAll('[data-rk-town-banner]');
  if (!banners.length) return;

  var desktopMq = window.matchMedia('(min-width: 1024px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getBaseItems(track) {
    return Array.prototype.slice.call(track.children).filter(function (el) {
      return el.classList.contains('rk-town-banner-item') && !el.hasAttribute('data-rk-loop-clone');
    });
  }

  function clearClones(track) {
    Array.prototype.slice
      .call(track.querySelectorAll('.rk-town-banner-item[data-rk-loop-clone], .rk-town-banner-item[aria-hidden="true"]'))
      .forEach(function (el) {
        el.remove();
      });
  }

  function measureSetHeight(items) {
    var height = 0;
    items.forEach(function (item) {
      height += item.getBoundingClientRect().height;
    });
    return height;
  }

  function cloneSet(track, baseItems) {
    baseItems.forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-rk-loop-clone', '1');
      track.appendChild(clone);
    });
  }

  function ensureInfiniteLoop(banner) {
    var viewport = banner.querySelector('.rk-town-banner-viewport');
    var track = banner.querySelector('.rk-town-banner-track');
    if (!viewport || !track) return;

    clearClones(track);
    var baseItems = getBaseItems(track);
    if (!baseItems.length) return;

    if (reducedMotion) {
      track.style.animation = 'none';
      track.style.transform = '';
      track.style.removeProperty('--rk-town-shift');
      return;
    }

    var setHeight = measureSetHeight(baseItems);
    if (setHeight < 1) return;

    var viewportHeight = viewport.getBoundingClientRect().height || viewport.clientHeight || 0;

    // Duplicate until we have at least two full sets and cover 2× viewport height.
    var targetHeight = Math.max(setHeight * 2, viewportHeight * 2 + setHeight);
    var guard = 0;
    while (track.scrollHeight < targetHeight && guard < 12) {
      cloneSet(track, baseItems);
      guard += 1;
    }

    // Exact pixel shift = one original set (seamless jump at loop restart).
    setHeight = measureSetHeight(baseItems);
    track.style.setProperty('--rk-town-shift', setHeight + 'px');
    track.style.animationDuration = Math.max(18, Math.round(setHeight / 28)) + 's';
  }

  function syncBannerHeights() {
    document.querySelectorAll('.rk-article-split--towns').forEach(function (split) {
      var copy = split.querySelector('.rk-article-split-copy');
      var banner = split.querySelector('.rk-town-banner');
      var viewport = banner && banner.querySelector('.rk-town-banner-viewport');
      if (!copy || !banner || !viewport) return;

      if (!desktopMq.matches) {
        banner.style.height = '';
        viewport.style.height = '';
        return;
      }

      var copyHeight = copy.getBoundingClientRect().height;
      banner.style.height = copyHeight + 'px';

      var style = window.getComputedStyle(banner);
      var padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      viewport.style.height = Math.max(0, copyHeight - padY) + 'px';
    });
  }

  function boot() {
    syncBannerHeights();
    banners.forEach(ensureInfiniteLoop);
  }

  boot();
  window.addEventListener('resize', boot, { passive: true });
  window.addEventListener('load', boot);
  document.addEventListener('rk:ready', boot);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  }
})();
