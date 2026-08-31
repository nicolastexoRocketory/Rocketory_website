(function () {
  var DELAY_MS = 3000;
  var NUDGE_PX = 80;
  var DOWN_MS = 380;
  var HOLD_MS = 120;
  var UP_MS = 280;
  var TOP_THRESHOLD = 8;

  var waitTimer = null;
  var holdTimer = null;
  var runId = 0;
  var bound = false;
  var nudging = false;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isHome() {
    return Boolean(document.querySelector('#top.rk-hero'));
  }

  function scrollY() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function atTop() {
    return scrollY() < TOP_THRESHOLD;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function stopNudge() {
    runId += 1;
    nudging = false;
    if (waitTimer) {
      window.clearTimeout(waitTimer);
      waitTimer = null;
    }
    if (holdTimer) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function animateScroll(toY, duration, easing, token, onDone) {
    var fromY = scrollY();
    var start = performance.now();

    function frame(now) {
      if (token !== runId) return;
      var t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, fromY + (toY - fromY) * easing(t));
      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }
      if (onDone) onDone();
    }

    requestAnimationFrame(frame);
  }

  function runNudge() {
    waitTimer = null;
    if (!isHome() || !atTop() || prefersReducedMotion() || document.hidden) return;

    var token = (runId += 1);
    var startY = scrollY();
    nudging = true;

    animateScroll(startY + NUDGE_PX, DOWN_MS, easeOutCubic, token, function () {
      if (token !== runId) return;
      holdTimer = window.setTimeout(function () {
        holdTimer = null;
        if (token !== runId) return;
        animateScroll(startY, UP_MS, easeInOutCubic, token, function () {
          if (token === runId) nudging = false;
        });
      }, HOLD_MS);
    });
  }

  function schedule() {
    stopNudge();
    if (!isHome() || prefersReducedMotion() || window.location.hash || !atTop()) return;
    waitTimer = window.setTimeout(runNudge, DELAY_MS);
  }

  function onUserIntent() {
    stopNudge();
  }

  function onKeydown(event) {
    if (
      event.key === ' ' ||
      event.key === 'PageDown' ||
      event.key === 'PageUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      onUserIntent();
    }
  }

  function onScroll() {
    if (nudging) return;
    if (!atTop()) stopNudge();
  }

  function bind() {
    if (bound) return;
    bound = true;
    window.addEventListener('wheel', onUserIntent, { passive: true });
    window.addEventListener('touchstart', onUserIntent, { passive: true });
    window.addEventListener('pointerdown', onUserIntent, { passive: true });
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopNudge();
    });
    document.addEventListener('rk:ready', schedule);
  }

  bind();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
})();
