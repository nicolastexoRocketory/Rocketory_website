(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var observer = null;
  var abortController = null;

  var REVEAL_SELECTORS = [
    'main .rk-split-grid > *',
    'main .rk-trust-grid > *',
    'main .rk-card-grid > *',
    'main .rk-card-grid-2 > *',
    'main .rk-card-grid-3 > *',
    'main .rk-usp-grid > *',
    'main .rk-vt-stack > .rk-vt-pin',
    'main .rk-vt-hero-inner > *',
    'main .rk-vt-system-axiom',
    'main .rk-vt-journey-head > *',
    'main .rk-pillars > *',
    'main .rk-featured-grid > *',
    'main .rk-featured-layout > *',
    'main .rk-plan-duo > *',
    'main #preise .rk-plan-row',
    'main .rk-plan-card',
    'main .rk-pricing-card',
    'main .rk-trust-bar > *',
    'main .rk-process-steps > *',
    'main .rk-faq-item',
    'main .rk-cta-band',
    'main .rk-cta-layout > *',
    'main .rk-interstitial-inner > *',
    'main .rk-contact-form',
    'main .rk-about-card',
    'main .rk-post-card',
    'main .rk-featured-card',
    'main .rk-featured-slider',
    'main .rk-post-grid > *',
    'main .rk-blog-cover-wrap',
    'main .rk-ref-section-intro',
    'main .rk-page-hero:not(.rk-hero) .rk-inner > *',
    'main .rk-ag-contact-list',
    'main .rk-pricing-switchers',
    'main .rk-plan-list',
    'main .rk-plan-note',
    'main section:not(.rk-hero) .rk-section-head',
    'main section:not(.rk-hero) .rk-page-header',
    'main section:not(.rk-hero) .rk-page-lead',
    'main section:not(.rk-hero) > .rk-inner > .rk-h1',
    'main section:not(.rk-hero) > .rk-inner > .rk-h2',
    'main section:not(.rk-hero) > .rk-inner > .rk-h3',
    'main section:not(.rk-hero) > .rk-inner > .rk-inkl-intro',
    'main section:not(.rk-hero) > .rk-inner > .rk-trust-intro',
    'main section:not(.rk-hero) > .rk-inner > .rk-featured-intro',
    'main section:not(.rk-hero) > .rk-inner > .rk-inkl-head',
    'main section:not(.rk-hero) > .rk-inner > .rk-tech-teaser',
    'main section:not(.rk-hero) > .rk-inner > .rk-dot-cta',
    'main .rk-split-text > .rk-split-body',
    'main .rk-split-media',
    'main .rk-inkl-row',
    'main .rk-tech-grid > *',
  ].join(', ');

  var SKIP_SELECTOR =
    '.rk-marquee-wrap, .rk-hero, nav, footer, [data-rk-reveal="off"], [aria-hidden="true"]';

  var MEDIA_SELECTOR = '.rk-split-media, .rk-blog-cover-wrap, .rk-featured-media, .rk-split-photo-mask';

  var CARD_PARENT_SELECTOR =
    '.rk-card-grid, .rk-card-grid-2, .rk-card-grid-3, .rk-usp-grid, .rk-trust-grid, .rk-pillars, .rk-featured-grid, .rk-tech-grid, .rk-process-steps, .rk-vt-stack';

  var CARD_SELECTOR =
    '.rk-plan-card, .rk-pricing-card, .rk-post-card, .rk-featured-card, .rk-about-card, .rk-faq-item';

  function isSkipped(el) {
    return Boolean(el.closest(SKIP_SELECTOR));
  }

  function isRevealMedia(el) {
    return Boolean(el && el.matches && el.matches(MEDIA_SELECTOR));
  }

  function isRevealCard(el) {
    if (!el || !el.matches) return false;
    if (el.matches(CARD_SELECTOR)) return true;
    var parent = el.parentElement;
    return Boolean(parent && parent.matches && parent.matches(CARD_PARENT_SELECTOR));
  }

  function pruneNested(nodes) {
    return nodes.filter(function (el) {
      return !nodes.some(function (other) {
        return other !== el && other.contains(el);
      });
    });
  }

  function getStaggerDelay(el) {
    var parent = el.parentElement;
    if (!parent) return 0;

    var siblings = Array.prototype.filter.call(parent.children, function (child) {
      return child.classList.contains('rk-reveal') && !child.classList.contains('is-visible');
    });

    var index = siblings.indexOf(el);
    if (index < 0) index = 0;
    return Math.min(index, 8) * 90;
  }

  function revealNow(el) {
    el.classList.add('is-visible');
  }

  function scheduleReveal(el) {
    if (el.classList.contains('is-visible')) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-visible');
      });
    });
  }

  function collectTargets(root) {
    var scope = root || document;
    var found = Array.prototype.slice.call(scope.querySelectorAll(REVEAL_SELECTORS));
    var unique = [];
    var seen = new Set();

    found.forEach(function (el) {
      if (seen.has(el) || isSkipped(el)) return;
      seen.add(el);
      unique.push(el);
    });

    return pruneNested(unique);
  }

  function resetTargets() {
    document.querySelectorAll('.rk-reveal').forEach(function (el) {
      el.classList.remove('rk-reveal', 'rk-reveal--media', 'rk-reveal--card', 'is-visible');
      el.style.removeProperty('--rk-reveal-delay');
    });
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  }

  function isInViewport(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.94 && rect.bottom > 0;
  }

  function boot() {
    destroy();
    resetTargets();

    var targets = collectTargets();
    if (!targets.length) return;

    if (reducedMotion.matches) {
      targets.forEach(revealNow);
      return;
    }

    targets.forEach(function (el) {
      el.classList.add('rk-reveal');
      if (isRevealMedia(el)) {
        el.classList.add('rk-reveal--media');
      } else if (isRevealCard(el)) {
        el.classList.add('rk-reveal--card');
      }
    });

    targets.forEach(function (el) {
      el.style.setProperty('--rk-reveal-delay', getStaggerDelay(el) + 'ms');
    });

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          scheduleReveal(el);
          observer.unobserve(el);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px 10% 0px',
        threshold: 0,
      },
    );

    targets.forEach(function (el) {
      if (isInViewport(el)) {
        scheduleReveal(el);
        return;
      }
      observer.observe(el);
    });

    abortController = new AbortController();
    var signal = abortController.signal;

    reducedMotion.addEventListener(
      'change',
      function () {
        if (reducedMotion.matches) {
          targets.forEach(revealNow);
          destroy();
        }
      },
      { signal: signal },
    );
  }

  window.__RK_BOOT_SCROLL_REVEAL = boot;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('rk:legacy-content', boot);
  document.addEventListener('rk:ready', boot);
})();
