(function () {
  function initTechCompare() {
    var root = document.getElementById('rkTechCompare');
    if (!root || root.dataset.rkTechCompareReady === '1') return;

    var tabs = root.querySelectorAll('[data-rk-tech-tab]');
    var panels = root.querySelectorAll('[data-rk-tech-panel]');
    if (!tabs.length || !panels.length) return;

    function activate(id) {
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-rk-tech-tab') === id;
        tab.classList.toggle('rk-plan-toggle-label--active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panels.forEach(function (panel) {
        var active = panel.getAttribute('data-rk-tech-panel') === id;
        panel.hidden = !active;
      });
    }

    tabs.forEach(function (tab) {
      if (tab.dataset.rkTechTabBound === '1') return;
      tab.dataset.rkTechTabBound = '1';
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-rk-tech-tab'));
      });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(tab.getAttribute('data-rk-tech-tab'));
        }
      });
    });

    activate('html');
    root.dataset.rkTechCompareReady = '1';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTechCompare);
  } else {
    initTechCompare();
  }
  document.addEventListener('rk:ready', initTechCompare);
  document.addEventListener('rk:legacy-content', initTechCompare);
})();
