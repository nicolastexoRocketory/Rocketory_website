(function () {
  function getListingScope() {
    var grid = document.querySelector('[data-rk-post-grid]');
    if (!grid) return null;

    var inner = grid.closest('.rk-inner');
    if (!inner) return null;

    var filterBar = inner.querySelector('[data-rk-post-filter]');
    if (!filterBar) return null;

    return {
      filterBar: filterBar,
      grid: grid,
      emptyState: inner.querySelector('[data-rk-post-filter-empty]'),
      cards: Array.prototype.slice.call(grid.querySelectorAll('.rk-post-card[data-category]')),
    };
  }

  function applyFilter(category, scope) {
    scope = scope || getListingScope();
    if (!scope) return;

    var visibleCount = 0;

    scope.cards.forEach(function (card) {
      var show = category === 'all' || card.getAttribute('data-category') === category;
      card.classList.toggle('is-hidden', !show);
      card.hidden = !show;
      if (show) visibleCount += 1;
    });

    if (scope.emptyState) {
      scope.emptyState.hidden = visibleCount > 0;
    }
  }

  function setActiveButton(activeBtn, filterBar) {
    filterBar.querySelectorAll('.rk-post-filter-btn').forEach(function (btn) {
      var isActive = btn === activeBtn;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function initPostFilter() {
    var scope = getListingScope();
    if (!scope) return;

    var activeBtn =
      scope.filterBar.querySelector('.rk-post-filter-btn.is-active') ||
      scope.filterBar.querySelector('.rk-post-filter-btn[data-filter="all"]') ||
      scope.filterBar.querySelector('.rk-post-filter-btn');

    if (activeBtn) {
      setActiveButton(activeBtn, scope.filterBar);
      applyFilter(activeBtn.getAttribute('data-filter') || 'all', scope);
      return;
    }

    applyFilter('all', scope);
  }

  if (!window.__RK_POST_FILTER_BOUND) {
    window.__RK_POST_FILTER_BOUND = true;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.rk-post-filter-btn');
      if (!btn) return;

      var filterBar = btn.closest('[data-rk-post-filter]');
      if (!filterBar) return;

      var scope = getListingScope();
      if (!scope || scope.filterBar !== filterBar) return;

      var category = btn.getAttribute('data-filter') || 'all';
      setActiveButton(btn, filterBar);
      applyFilter(category, scope);
    });
  }

  window.__RK_INIT_POST_FILTER = initPostFilter;

  initPostFilter();
  document.addEventListener('rk:ready', initPostFilter);
  document.addEventListener('rk:legacy-content', initPostFilter);
})();
