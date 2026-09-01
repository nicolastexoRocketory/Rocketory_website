(function () {
  var COARSE = window.matchMedia('(hover: none), (pointer: coarse)');

  function closeAll(root) {
    root.querySelectorAll('.rk-team-hotspot.is-open').forEach(function (btn) {
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function initRoot(root) {
    if (root.getAttribute('data-rk-bound') === '1') return;
    root.setAttribute('data-rk-bound', '1');

    var buttons = root.querySelectorAll('.rk-team-hotspot');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        if (!COARSE.matches) return;
        event.stopPropagation();
        var wasOpen = btn.classList.contains('is-open');
        closeAll(root);
        if (!wasOpen) {
          btn.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      btn.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeAll(root);
          btn.blur();
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!COARSE.matches) return;
      if (root.contains(event.target)) return;
      closeAll(root);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAll(root);
    });
  }

  function boot() {
    document.querySelectorAll('.rk-team-hotspots').forEach(initRoot);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('rk:legacy-content', boot);
  document.addEventListener('rk:ready', boot);
})()
