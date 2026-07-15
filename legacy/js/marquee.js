(function () {
  function getSharedTip(root) {
    var tip = root.querySelector('.rk-marquee-tip-float');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'rk-marquee-tip-float';
      tip.setAttribute('role', 'tooltip');
      tip.setAttribute('aria-hidden', 'true');
      root.appendChild(tip);
    }
    return tip;
  }

  function destroyMarquee(wrap) {
    if (wrap.__rkMarqueeCleanup) {
      wrap.__rkMarqueeCleanup();
      wrap.__rkMarqueeCleanup = null;
    }

    wrap.removeAttribute('data-rk-marquee-bound');
    wrap.classList.remove('is-user-engaged', 'is-tip-active', 'is-at-start', 'is-at-end');
    wrap.querySelectorAll('.rk-marquee-arrow').forEach(function (btn) {
      btn.remove();
    });
    wrap.querySelectorAll('.rk-marquee-logo.is-active').forEach(function (logo) {
      logo.classList.remove('is-active');
    });

    var clip = wrap.querySelector('.rk-marquee-clip');
    if (clip) clip.scrollLeft = 0;
  }

  function initMarquee() {
    var wrap = document.querySelector('.rk-marquee-wrap');
    if (!wrap) return;

    var clip = wrap.querySelector('.rk-marquee-clip');
    var logos = wrap.querySelectorAll(
      '.rk-marquee-track:not([aria-hidden="true"]) .rk-marquee-logo[data-tip]'
    );
    if (!logos.length) return;

    destroyMarquee(wrap);
    wrap.setAttribute('data-rk-marquee-bound', '1');

    var root = document.querySelector('.rk-shell') || document.body;
    var tip = getSharedTip(root);
    var controller = new AbortController();
    var signal = controller.signal;

    wrap.__rkMarqueeCleanup = function () {
      controller.abort();
      tip.classList.remove('is-visible', 'is-below', 'is-centered');
      tip.setAttribute('aria-hidden', 'true');
      tip.innerHTML = '';
      tip.style.left = '';
      tip.style.right = '';
      tip.style.top = '';
      tip.style.width = '';
      tip.style.maxWidth = '';
      tip.style.transform = '';
    };

    var activeLogo = null;
    var mobileMq = window.matchMedia('(max-width: 768px)');
    var touchMq = window.matchMedia('(hover: none)');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var userEngaged = false;
    var engageBound = false;

    function isMobileMode() {
      return mobileMq.matches || touchMq.matches;
    }

    function isInteractiveLogo(node) {
      return (
        node &&
        node.closest &&
        node.closest('.rk-marquee-track:not([aria-hidden="true"]) .rk-marquee-logo[data-tip]')
      );
    }

    function engageMarquee() {
      if (userEngaged || !isMobileMode()) return;
      userEngaged = true;
      wrap.classList.add('is-user-engaged');
      if (clip) clip.scrollLeft = 0;
      updateScrollArrows();
    }

    function bindAutoMarqueeEngage() {
      if (!isMobileMode()) return;
      if (reducedMotion.matches) {
        engageMarquee();
        return;
      }
      if (engageBound || userEngaged) return;
      engageBound = true;

      ['touchstart', 'pointerdown', 'mousedown', 'wheel', 'keydown'].forEach(function (evt) {
        wrap.addEventListener(evt, engageMarquee, { passive: true, signal: signal });
      });

      if (clip) {
        clip.addEventListener(
          'scroll',
          function () {
            if (clip.scrollLeft > 2) engageMarquee();
          },
          { passive: true, signal: signal }
        );
      }
    }

    function createArrow(direction) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rk-marquee-arrow rk-marquee-arrow--' + direction;
      btn.setAttribute(
        'aria-label',
        direction === 'prev' ? 'Nach links scrollen' : 'Nach rechts scrollen'
      );
      btn.innerHTML =
        direction === 'prev'
          ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
      return btn;
    }

    function setupScrollArrows() {
      if (wrap.querySelector('.rk-marquee-arrow--prev')) return;

      var prev = createArrow('prev');
      var next = createArrow('next');
      wrap.insertBefore(prev, wrap.firstChild);
      wrap.appendChild(next);

      function scrollBy(direction) {
        if (!clip) return;
        clip.scrollBy({ left: direction * Math.max(clip.clientWidth * 0.55, 120), behavior: 'smooth' });
      }

      prev.addEventListener(
        'click',
        function () {
          scrollBy(-1);
        },
        { signal: signal }
      );
      next.addEventListener(
        'click',
        function () {
          scrollBy(1);
        },
        { signal: signal }
      );

      updateScrollArrows();
    }

    function updateScrollArrows() {
      if (!clip || !isMobileMode()) return;
      var atStart = clip.scrollLeft <= 2;
      var atEnd = clip.scrollLeft + clip.clientWidth >= clip.scrollWidth - 2;
      wrap.classList.toggle('is-at-start', atStart);
      wrap.classList.toggle('is-at-end', atEnd);
    }

    setupScrollArrows();
    bindAutoMarqueeEngage();

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function resetTipStyles() {
      tip.style.left = '';
      tip.style.right = '';
      tip.style.top = '';
      tip.style.width = '';
      tip.style.maxWidth = '';
      tip.style.transform = '';
    }

    function positionTipDesktop(logo) {
      resetTipStyles();
      tip.classList.remove('is-centered', 'is-below');

      var rect = logo.getBoundingClientRect();
      var gap = 12;
      var centerX = rect.left + rect.width / 2;
      var tipHeight = tip.offsetHeight;

      tip.style.left = centerX + 'px';

      if (rect.top - tipHeight - gap < 8) {
        tip.classList.add('is-below');
        tip.style.top = rect.bottom + gap + 'px';
        tip.style.transform = 'translate(-50%, 0)';
      } else {
        tip.style.top = rect.top - gap + 'px';
        tip.style.transform = 'translate(-50%, -100%)';
      }
    }

    function positionTipMobile() {
      resetTipStyles();
      tip.classList.add('is-centered');
      tip.classList.remove('is-below');

      var margin = 16;
      var wrapRect = wrap.getBoundingClientRect();
      var gap = 10;
      var tipHeight = tip.offsetHeight;

      tip.style.left = margin + 'px';
      tip.style.right = margin + 'px';
      tip.style.width = 'auto';
      tip.style.maxWidth = 'none';
      tip.style.transform = 'none';

      if (wrapRect.top - tipHeight - gap >= 8) {
        tip.style.top = wrapRect.top - tipHeight - gap + 'px';
      } else {
        tip.classList.add('is-below');
        tip.style.top = wrapRect.bottom + gap + 'px';
      }
    }

    function positionTip(logo) {
      if (isMobileMode()) positionTipMobile();
      else positionTipDesktop(logo);
    }

    function showTip(logo) {
      if (activeLogo && activeLogo !== logo) {
        activeLogo.classList.remove('is-active');
      }

      activeLogo = logo;
      logo.classList.add('is-active');

      var name = logo.getAttribute('data-tip-name') || '';
      var text = logo.getAttribute('data-tip') || '';
      tip.innerHTML =
        (name ? '<strong>' + escapeHtml(name) + '</strong>' : '') +
        '<span>' + escapeHtml(text) + '</span>';
      tip.setAttribute('aria-hidden', 'false');
      tip.classList.add('is-visible');
      wrap.classList.add('is-tip-active');

      requestAnimationFrame(function () {
        positionTip(logo);
      });
    }

    function hideTip() {
      if (activeLogo) activeLogo.classList.remove('is-active');
      activeLogo = null;
      tip.classList.remove('is-visible', 'is-below', 'is-centered');
      tip.setAttribute('aria-hidden', 'true');
      tip.innerHTML = '';
      wrap.classList.remove('is-tip-active');
      resetTipStyles();
    }

    logos.forEach(function (logo) {
      logo.addEventListener(
        'click',
        function (e) {
          if (!isMobileMode()) return;
          e.preventDefault();
          e.stopPropagation();
          if (activeLogo === logo) hideTip();
          else showTip(logo);
        },
        { signal: signal }
      );

      logo.addEventListener(
        'pointerenter',
        function () {
          if (isMobileMode()) return;
          showTip(logo);
        },
        { signal: signal }
      );

      logo.addEventListener(
        'pointerleave',
        function (e) {
          if (isMobileMode()) return;
          if (isInteractiveLogo(e.relatedTarget)) return;
          hideTip();
        },
        { signal: signal }
      );

      logo.addEventListener(
        'focus',
        function () {
          if (isMobileMode()) return;
          showTip(logo);
        },
        { signal: signal }
      );

      logo.addEventListener(
        'blur',
        function (e) {
          if (isMobileMode()) return;
          if (isInteractiveLogo(e.relatedTarget)) return;
          hideTip();
        },
        { signal: signal }
      );
    });

    wrap.addEventListener(
      'pointerleave',
      function (e) {
        if (isMobileMode()) return;
        if (wrap.contains(e.relatedTarget)) return;
        hideTip();
      },
      { signal: signal }
    );

    document.addEventListener(
      'click',
      function (e) {
        if (isMobileMode() && !wrap.contains(e.target)) hideTip();
      },
      { signal: signal }
    );

    if (clip) {
      clip.addEventListener(
        'scroll',
        function () {
          updateScrollArrows();
          if (activeLogo && isMobileMode()) positionTip(activeLogo);
        },
        { passive: true, signal: signal }
      );
    }

    function onViewportChange() {
      hideTip();
      userEngaged = false;
      engageBound = false;
      wrap.classList.remove('is-user-engaged');
      if (clip) clip.scrollLeft = 0;
      bindAutoMarqueeEngage();
      updateScrollArrows();
    }

    mobileMq.addEventListener('change', onViewportChange, { signal: signal });
    touchMq.addEventListener('change', onViewportChange, { signal: signal });

    window.addEventListener(
      'scroll',
      function () {
        if (activeLogo) positionTip(activeLogo);
      },
      { passive: true, signal: signal }
    );

    window.addEventListener(
      'resize',
      function () {
        updateScrollArrows();
        if (activeLogo) positionTip(activeLogo);
      },
      { passive: true, signal: signal }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarquee);
  } else {
    initMarquee();
  }

  document.addEventListener('rk:legacy-content', initMarquee);
  document.addEventListener('rk:ready', initMarquee);
})();
