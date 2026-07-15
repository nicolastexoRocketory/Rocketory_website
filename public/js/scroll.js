(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function getNavOffset() {
    var navH = getComputedStyle(document.documentElement).getPropertyValue('--rk-nav-h').trim();
    return (parseFloat(navH) || 56) + 12;
  }

  function smoothScrollTo(target) {
    if (!target) return;
    var offset = -getNavOffset();
    var top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({
      top: top,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  window.rkSmoothScrollTo = function (target) {
    smoothScrollTo(target);
  };

  window.sendPrompt = window.sendPrompt || function () {
    window.location.href = '/kontakt';
  };

  function resolveHashTarget(hash) {
    if (!hash || hash === '#') return null;
    return document.getElementById(hash.slice(1));
  }

  function scrollToHash(hash, delay) {
    var target = resolveHashTarget(hash);
    if (!target) return;
    var run = function () {
      smoothScrollTo(target);
    };
    if (delay) {
      window.setTimeout(run, delay);
    } else {
      requestAnimationFrame(run);
    }
  }

  if (window.location.hash) {
    var onReady = function () {
      scrollToHash(window.location.hash, 80);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
    document.addEventListener('rk:legacy-content', function () {
      scrollToHash(window.location.hash, 80);
    });
  }
})();
