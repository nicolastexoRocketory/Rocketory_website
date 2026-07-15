(function () {
  function initSeoToggle() {
    var list = document.getElementById('rkSeoPlanList');
    if (!list) return;

    var sw = document.getElementById('rkSeoSwitch');
    var label6 = document.getElementById('rkSeoLabel6');
    var label12 = document.getElementById('rkSeoLabel12');

    function setMode(mode) {
      list.setAttribute('data-rk-seo-mode', mode);
      if (sw) sw.setAttribute('aria-checked', mode === '12' ? 'true' : 'false');
      if (label6) label6.classList.toggle('rk-plan-toggle-label--active', mode === '6');
      if (label12) label12.classList.toggle('rk-plan-toggle-label--active', mode === '12');
    }

    function toggleMode() {
      setMode(list.getAttribute('data-rk-seo-mode') === '6' ? '12' : '6');
    }

    if (sw && !sw.dataset.rkSeoBound) {
      sw.dataset.rkSeoBound = '1';
      sw.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMode();
      });
    }

    [label6, label12].forEach(function (label, index) {
      if (!label || label.dataset.rkSeoBound) return;
      label.dataset.rkSeoBound = '1';
      var mode = index === 0 ? '6' : '12';
      label.addEventListener('click', function (e) {
        e.stopPropagation();
        setMode(mode);
      });
      label.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          setMode(mode);
        }
      });
    });

    setMode(list.getAttribute('data-rk-seo-mode') || '6');
  }

  function bootSeoToggle() {
    initSeoToggle();
  }

  bootSeoToggle();
  document.addEventListener('rk:ready', bootSeoToggle);
  document.addEventListener('rk:legacy-content', bootSeoToggle);
})();
