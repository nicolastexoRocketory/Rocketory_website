(function () {
  'use strict';

  var desktopMq = window.matchMedia('(min-width: 769px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function imageSrc(img) {
    return img.currentSrc || img.getAttribute('src') || img.src || '';
  }

  function apply() {
    var useFixed = desktopMq.matches && !reducedMotion.matches;

    document.querySelectorAll('.rk-interstitial[data-rk-interstitial-parallax] .rk-interstitial-bg').forEach(function (bg) {
      var img = bg.querySelector('img');
      if (!img) return;

      if (useFixed) {
        var src = imageSrc(img);
        if (src) {
          bg.style.backgroundImage = 'url("' + src + '")';
        } else if (!img.complete) {
          img.addEventListener('load', boot, { once: true });
        }
      } else {
        bg.style.backgroundImage = '';
      }
    });
  }

  function boot() {
    apply();
  }

  if (typeof desktopMq.addEventListener === 'function') {
    desktopMq.addEventListener('change', boot);
  } else if (typeof desktopMq.addListener === 'function') {
    desktopMq.addListener(boot);
  }

  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', boot);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(boot);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('rk:legacy-content', boot);
  document.addEventListener('rk:ready', boot);
})();
