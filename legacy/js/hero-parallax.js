(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var heroes = [];
  var enabled = false;
  var rafId = null;

  function queryElements() {
    heroes = Array.prototype.slice.call(
      document.querySelectorAll('.rk-hero[data-rk-hero-parallax]')
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
  }

  function applyHeroParallax() {
    var vh = window.innerHeight;
    var i;
    var mobile = window.innerWidth < 769;

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
      var bgFactor = mobile ? 0.35 : 0.5;
      var contentFactor = mobile ? -0.12 : -0.2;
      var bgY = progress * bgFactor;
      var bgS = Math.max(0.95, 1 - (progress / heroH) * 0.05);

      if (hero._rkBg) {
        hero._rkBg.style.transform =
          'translate3d(0,' + bgY + 'px,0) scale(' + bgS + ')';
      }

      if (hero._rkContent) {
        hero._rkContent.style.transform =
          'translate3d(0,' + progress * contentFactor + 'px,0)';
      }
    }
  }

  function onFrame() {
    rafId = null;
    applyHeroParallax();
  }

  function scheduleUpdate() {
    if (!rafId) rafId = requestAnimationFrame(onFrame);
  }

  function resetTransforms() {
    var i;

    for (i = 0; i < heroes.length; i++) {
      if (heroes[i]._rkBg) heroes[i]._rkBg.style.transform = '';
      if (heroes[i]._rkContent) heroes[i]._rkContent.style.transform = '';
    }
  }

  function init() {
    if (enabled) return;
    if (!heroes.length) return;

    enabled = true;
    cacheElements();
    applyHeroParallax();
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

  function boot() {
    destroy();
    queryElements();
    init();
    scheduleUpdate();
  }

  window.addEventListener('resize', function () {
    cacheElements();
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
