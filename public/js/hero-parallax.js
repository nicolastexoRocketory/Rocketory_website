(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var heroes = [];
  var interstitials = [];
  var enabled = false;
  var rafId = null;
  var dirty = false;

  function queryElements() {
    heroes = Array.prototype.slice.call(
      document.querySelectorAll('.rk-hero[data-rk-hero-parallax]')
    );
    interstitials = Array.prototype.slice.call(
      document.querySelectorAll('.rk-interstitial[data-rk-interstitial-parallax]')
    );
  }

  function cacheElements() {
    var i;

    for (i = 0; i < heroes.length; i++) {
      var hero = heroes[i];
      hero._rkBg = hero.querySelector('.rk-hero-bg');
      hero._rkContent = hero.querySelector('.rk-hero-main');
      hero._rkHeroH = hero.offsetHeight;
    }

    for (i = 0; i < interstitials.length; i++) {
      var section = interstitials[i];
      section._rkBg = section.querySelector('.rk-interstitial-bg');
      section._rkImg = section._rkBg ? section._rkBg.querySelector('img') : null;
      section._rkSectionH = section.offsetHeight;
    }
  }

  function applyHeroParallax() {
    var vh = window.innerHeight;
    var i;

    for (i = 0; i < heroes.length; i++) {
      var hero = heroes[i];
      var rect = hero.getBoundingClientRect();

      if (rect.bottom <= 0 || rect.top >= vh) {
        if (hero._rkBg) hero._rkBg.style.transform = '';
        if (hero._rkContent) hero._rkContent.style.transform = '';
        continue;
      }

      var progress = Math.max(0, -rect.top);
      var heroH = hero._rkHeroH || hero.offsetHeight;
      var bgY = progress * 0.5;
      var bgS = Math.max(0.95, 1 - (progress / heroH) * 0.05);

      if (hero._rkBg) {
        hero._rkBg.style.transform =
          'translate3d(0,' + bgY.toFixed(1) + 'px,0) scale(' + bgS.toFixed(4) + ')';
      }

      if (hero._rkContent) {
        hero._rkContent.style.transform =
          'translate3d(0,' + (progress * -0.2).toFixed(1) + 'px,0)';
      }
    }
  }

  function applyInterstitialParallax() {
    var vh = window.innerHeight;
    var i;

    for (i = 0; i < interstitials.length; i++) {
      var section = interstitials[i];
      var img = section._rkImg;
      if (!img) continue;

      var rect = section.getBoundingClientRect();
      var sectionH = section._rkSectionH || section.offsetHeight;
      var imgH = Math.max(vh, sectionH);

      if (rect.bottom <= 0) {
        img.style.transform =
          'translate3d(0,' + (sectionH - imgH).toFixed(1) + 'px,0)';
        continue;
      }

      if (rect.top >= vh) {
        img.style.transform = '';
        continue;
      }

      img.style.transform = 'translate3d(0,' + (-rect.top).toFixed(1) + 'px,0)';
    }
  }

  function applyParallax() {
    applyHeroParallax();
    applyInterstitialParallax();
  }

  function onFrame() {
    rafId = null;
    if (dirty) {
      dirty = false;
      applyParallax();
    }
  }

  function scheduleUpdate() {
    dirty = true;
    if (!rafId) rafId = requestAnimationFrame(onFrame);
  }

  function resetTransforms() {
    var i;

    for (i = 0; i < heroes.length; i++) {
      if (heroes[i]._rkBg) heroes[i]._rkBg.style.transform = '';
      if (heroes[i]._rkContent) heroes[i]._rkContent.style.transform = '';
    }

    for (i = 0; i < interstitials.length; i++) {
      if (interstitials[i]._rkImg) interstitials[i]._rkImg.style.transform = '';
    }
  }

  function init() {
    if (enabled) return;
    if (!heroes.length && !interstitials.length) return;

    enabled = true;
    cacheElements();
    applyParallax();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
  }

  function destroy() {
    if (!enabled) return;
    enabled = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    window.removeEventListener('scroll', scheduleUpdate);
    resetTransforms();
  }

  function checkBreakpoint() {
    destroy();
    queryElements();
    if (window.innerWidth >= 769) {
      init();
    }
  }

  function boot() {
    checkBreakpoint();
    scheduleUpdate();
  }

  window.addEventListener('resize', function () {
    checkBreakpoint();
    scheduleUpdate();
  }, { passive: true });

  window.__RK_BOOT_PARALLAX = boot;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('rk:legacy-content', boot);
  document.addEventListener('rk:ready', boot);
})();
