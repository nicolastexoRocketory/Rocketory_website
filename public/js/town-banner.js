(function () {
  var banners = document.querySelectorAll('[data-rk-town-banner]');
  if (!banners.length) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopMq = window.matchMedia('(min-width: 1024px)');

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

  banners.forEach(function (banner) {
    var viewport = banner.querySelector('.rk-town-banner-viewport');
    var track = banner.querySelector('.rk-town-banner-track');
    if (!viewport || !track) return;

    // Include loop clones (aria-hidden) – they are often the ones visually centered.
    var items = Array.prototype.slice.call(track.querySelectorAll('.rk-town-banner-item'));
    if (!items.length) return;

    if (reducedMotion) {
      track.style.animation = 'none';
      var mid = items[Math.floor(items.length / 4)] || items[0];
      if (mid) mid.classList.add('is-focus');
      return;
    }

    banner.addEventListener('mouseenter', function () {
      track.style.animationPlayState = 'paused';
    });
    banner.addEventListener('mouseleave', function () {
      track.style.animationPlayState = 'running';
    });

    function updateFocus() {
      var vpRect = viewport.getBoundingClientRect();
      // Below mid: words scroll up, so focus earlier (lower) — feels less laggy once they enlarge.
      var focusY =
        vpRect.height >= 1
          ? vpRect.top + vpRect.height * 0.55
          : vpRect.top + 40;
      var closest = null;
      var closestDist = Infinity;

      items.forEach(function (item) {
        item.classList.remove('is-focus', 'is-near');
        var rect = item.getBoundingClientRect();
        // Skip items fully outside the viewport (cheap filter)
        if (vpRect.height >= 1 && (rect.bottom < vpRect.top || rect.top > vpRect.bottom)) return;

        var dist = Math.abs(rect.top + rect.height / 2 - focusY);
        if (dist < closestDist) {
          closestDist = dist;
          closest = item;
        }
      });

      if (!closest) {
        // Fallback if none intersect (e.g. mid-transform): pick absolute closest
        items.forEach(function (item) {
          var rect = item.getBoundingClientRect();
          var dist = Math.abs(rect.top + rect.height / 2 - focusY);
          if (dist < closestDist) {
            closestDist = dist;
            closest = item;
          }
        });
      }

      if (closest) {
        closest.classList.add('is-focus');
      }

      if (vpRect.height < 1) return;

      items.forEach(function (item) {
        if (item === closest) return;
        var rect = item.getBoundingClientRect();
        if (rect.bottom < vpRect.top || rect.top > vpRect.bottom) return;
        var dist = Math.abs(rect.top + rect.height / 2 - focusY);
        if (dist < vpRect.height * 0.38) {
          item.classList.add('is-near');
        }
      });
    }

    var running = true;
    function loop() {
      if (!running) return;
      updateFocus();
      window.requestAnimationFrame(loop);
    }

    window.addEventListener(
      'resize',
      function () {
        updateFocus();
      },
      { passive: true },
    );

    document.addEventListener('visibilitychange', function () {
      running = document.visibilityState !== 'hidden';
      if (running) window.requestAnimationFrame(loop);
    });

    window.requestAnimationFrame(loop);
  });

  function boot() {
    syncBannerHeights();
    banners.forEach(function (banner) {
      var viewport = banner.querySelector('.rk-town-banner-viewport');
      var track = banner.querySelector('.rk-town-banner-track');
      if (!viewport || !track) return;
      var items = Array.prototype.slice.call(track.querySelectorAll('.rk-town-banner-item'));
      if (!items.length) return;
      // Ensure one word is focused immediately (before first rAF / after height sync)
      var focused = track.querySelector('.rk-town-banner-item.is-focus');
      if (!focused) {
        var vpRect = viewport.getBoundingClientRect();
        var focusY = vpRect.top + Math.max(vpRect.height, 1) * 0.55;
        var closest = items[0];
        var closestDist = Infinity;
        items.forEach(function (item) {
          var rect = item.getBoundingClientRect();
          var dist = Math.abs(rect.top + rect.height / 2 - focusY);
          if (dist < closestDist) {
            closestDist = dist;
            closest = item;
          }
        });
        items.forEach(function (item) {
          item.classList.toggle('is-focus', item === closest);
        });
      }
    });
  }

  boot();
  window.addEventListener('resize', boot, { passive: true });
  window.addEventListener('load', boot);
  document.addEventListener('rk:ready', boot);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  }
})();
