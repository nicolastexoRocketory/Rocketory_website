(function () {
  var mobileMq = window.matchMedia('(max-width: 768px)');
  var instances = [];

  function getNavBottom() {
    var nav = document.querySelector('.rk-nav');
    if (nav) return nav.getBoundingClientRect().bottom;
    var raw = getComputedStyle(document.documentElement).getPropertyValue('--rk-nav-h').trim();
    return parseFloat(raw) || 56;
  }

  function unpin(inst) {
    if (!inst.toggle) return;
    inst.pinned = false;
    inst.toggle.classList.remove('is-pinned');
    inst.toggle.style.top = '';
    if (inst.anchor) inst.anchor.style.height = '0px';
  }

  function updateInstance(inst) {
    if (!inst.section || !inst.toggle || !inst.anchor) return;

    if (!mobileMq.matches) {
      unpin(inst);
      return;
    }

    var navBottom = getNavBottom();
    var toggleH = inst.toggle.offsetHeight;
    var sectionRect = inst.section.getBoundingClientRect();
    var anchorRect = inst.anchor.getBoundingClientRect();
    var shouldPin = anchorRect.top <= navBottom && sectionRect.bottom > navBottom + toggleH + 4;

    if (shouldPin) {
      inst.toggle.style.top = navBottom + 'px';
      if (!inst.pinned) {
        inst.anchor.style.height = toggleH + 'px';
        inst.toggle.classList.add('is-pinned');
        inst.pinned = true;
      } else if (parseFloat(inst.anchor.style.height) !== toggleH) {
        inst.anchor.style.height = toggleH + 'px';
      }
      return;
    }

    unpin(inst);
  }

  function update() {
    instances.forEach(updateInstance);
  }

  function initSection(section) {
    if (!section) return;
    var toggle =
      section.querySelector('.rk-pricing-switchers') ||
      section.querySelector('.rk-plan-toggle, .rk-tu-mode-toggle');
    if (!toggle) return;

    var anchor = document.createElement('div');
    anchor.className = 'rk-plan-toggle-anchor';
    anchor.setAttribute('aria-hidden', 'true');
    toggle.parentNode.insertBefore(anchor, toggle);

    instances.push({
      section: section,
      toggle: toggle,
      anchor: anchor,
      pinned: false
    });
  }

  function init() {
    initSection(document.getElementById('preise'));
    initSection(document.getElementById('vergleich'));
    if (!instances.length) return;

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    if (mobileMq.addEventListener) mobileMq.addEventListener('change', update);
    else mobileMq.addListener(update);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
