(function () {
  var DURATION_MS = 440;
  var MORE_FADE_MS = 360;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function wrapPanel(el) {
    var body = el.querySelector('.rk-readmore-body');
    if (!body) return null;

    var panel = body.closest('.rk-readmore-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'rk-readmore-panel';
      body.parentNode.insertBefore(panel, body);

      var inner = document.createElement('div');
      inner.className = 'rk-readmore-panel-inner';
      panel.appendChild(inner);
      inner.appendChild(body);
    } else if (!panel.querySelector('.rk-readmore-panel-inner')) {
      var wrap = document.createElement('div');
      wrap.className = 'rk-readmore-panel-inner';
      while (panel.firstChild) {
        wrap.appendChild(panel.firstChild);
      }
      panel.appendChild(wrap);
    }

    return panel;
  }

  function ensureLessButton(el) {
    var body = el.querySelector('.rk-readmore-body');
    if (!body) return;

    var less = el.querySelector('.rk-readmore-less');
    if (!less) {
      var label = el.querySelector('.rk-readmore-label');
      less = document.createElement('button');
      less.type = 'button';
      less.className = 'rk-readmore-less';
      less.textContent = (label && label.getAttribute('data-less')) || 'Weniger anzeigen';
    }

    var paragraphs = body.querySelectorAll('p');
    var anchor = paragraphs.length ? paragraphs[paragraphs.length - 1] : body;
    if (less.parentElement !== anchor) {
      if (less.parentElement) less.parentElement.removeChild(less);
      anchor.appendChild(document.createTextNode(' '));
      anchor.appendChild(less);
    }
  }

  function waitForTransition(panel, cb) {
    var done = false;

    function finish() {
      if (done) return;
      done = true;
      panel.removeEventListener('transitionend', onEnd);
      cb();
    }

    function onEnd(e) {
      if (e.target !== panel) return;
      finish();
    }

    panel.addEventListener('transitionend', onEnd);
    window.setTimeout(finish, DURATION_MS + 80);
  }

  function fadeInMore(el) {
    el.classList.remove('rk-readmore--more-in');
    void el.offsetHeight;
    el.classList.add('rk-readmore--more-in');
    window.setTimeout(function () {
      el.classList.remove('rk-readmore--more-in');
    }, MORE_FADE_MS);
  }

  function openReadmore(el) {
    var panel = el.querySelector('.rk-readmore-panel');
    if (!panel) return;

    el.classList.remove('rk-readmore--show', 'rk-readmore--more-in');
    void panel.offsetHeight;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('rk-readmore--show');
      });
    });
  }

  function closeReadmore(el) {
    if (!el || !el.open || el.dataset.rkReadmoreClosing) return;

    var panel = el.querySelector('.rk-readmore-panel');

    el.dataset.rkReadmoreClosing = '1';
    el.classList.remove('rk-readmore--show');

    function finishClose() {
      el.open = false;
      el.classList.remove('rk-readmore--show');
      delete el.dataset.rkReadmoreClosing;
      fadeInMore(el);
    }

    if (!panel || reducedMotion.matches) {
      finishClose();
      return;
    }

    waitForTransition(panel, finishClose);
  }

  function initReadmore(root) {
    (root || document).querySelectorAll('.rk-readmore').forEach(function (el) {
      if (el.dataset.rkReadmoreInit) return;
      el.dataset.rkReadmoreInit = '1';

      var panel = wrapPanel(el);
      if (!panel) return;

      var summary = el.querySelector('summary');
      if (summary) summary.classList.add('rk-readmore-more');

      ensureLessButton(el);

      el.addEventListener('toggle', function () {
        if (el.open) {
          ensureLessButton(el);
          openReadmore(el);
        } else if (!el.dataset.rkReadmoreClosing) {
          el.classList.remove('rk-readmore--show');
        }
      });
    });
  }

  document.addEventListener('click', function (e) {
    var less = e.target.closest && e.target.closest('.rk-readmore-less');
    if (!less) return;

    var el = less.closest('.rk-readmore');
    if (!el) return;

    e.preventDefault();
    e.stopPropagation();
    closeReadmore(el);
  });

  initReadmore();

  document.addEventListener('rk:ready', function () {
    initReadmore();
  });
})();
