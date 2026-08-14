(function () {
  function getSection(root) {
    return (root || document).querySelector('#inklusive');
  }

  function closeSiblings(section, current) {
    section.querySelectorAll('.rk-inkl-row.is-open').forEach(function (row) {
      if (row === current) return;
      row.classList.remove('is-open');
      row.setAttribute('aria-expanded', 'false');
    });
  }

  function ensureToggle(head) {
    if (head.querySelector('.rk-inkl-toggle')) return;
    var toggle = document.createElement('span');
    toggle.className = 'rk-inkl-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    head.appendChild(toggle);
  }

  function initRow(section, row) {
    if (row.dataset.rkInklInit) return;
    row.dataset.rkInklInit = '1';

    var head = row.querySelector('.rk-inkl-row-head');
    if (!head) return;

    ensureToggle(head);

    if (!row.hasAttribute('tabindex')) row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'button');
    row.setAttribute('aria-expanded', 'false');

    function setOpen(open) {
      row.classList.toggle('is-open', open);
      row.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function toggleRow() {
      var open = row.classList.contains('is-open');
      if (open) {
        setOpen(false);
        return;
      }
      closeSiblings(section, row);
      setOpen(true);
    }

    row.addEventListener('click', function (e) {
      if (e.target.closest('.rk-inkl-row-link')) return;
      if (e.target.closest('a[href]')) return;
      e.preventDefault();
      toggleRow();
    });

    row.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.closest('.rk-inkl-row-link')) return;
      e.preventDefault();
      toggleRow();
    });
  }

  function init(root) {
    var section = getSection(root);
    if (!section) return;
    section.querySelectorAll('.rk-inkl-row').forEach(function (row) {
      initRow(section, row);
    });
  }

  init();

  document.addEventListener('rk:ready', function () {
    init();
  });
})();
