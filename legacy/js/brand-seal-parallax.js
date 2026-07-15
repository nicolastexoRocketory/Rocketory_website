(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var seals = Array.prototype.slice.call(
    document.querySelectorAll('[data-rk-seal-parallax]')
  );
  if (!seals.length) return;

  var enabled = false;
  var rafId = null;
  var dirty = false;

  function applyParallax() {
    var vh = window.innerHeight;

    for (var i = 0; i < seals.length; i++) {
      var seal = seals[i];
      var section = seal.closest('#ueber-uns') || seal.closest('.rk-section');
      if (!section) {
        seal.style.transform = '';
        continue;
      }

      var rect = section.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= vh) {
        seal.style.transform = '';
        continue;
      }

      var progress = (vh - rect.top) / (vh + rect.height);
      var offset = (Math.max(0, Math.min(1, progress)) - 0.5) * 2;
      var moveX = offset * 18;
      var moveY = offset * -42;
      var rotate = offset * 6;

      seal.style.transform =
        'translate3d(' + moveX.toFixed(1) + 'px,' + moveY.toFixed(1) + 'px,0) rotate(' + rotate.toFixed(2) + 'deg)';
    }
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

  function init() {
    if (enabled) return;
    enabled = true;
    applyParallax();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
  }

  function destroy() {
    if (!enabled) return;
    enabled = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    window.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
    for (var i = 0; i < seals.length; i++) seals[i].style.transform = '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('rk:legacy-content', function () {
    seals = Array.prototype.slice.call(document.querySelectorAll('[data-rk-seal-parallax]'));
    destroy();
    init();
  });
})();
