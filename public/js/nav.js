(function () {
  function initNav() {
    var btn = document.getElementById('rkMenuBtn');
    if (!btn || btn.getAttribute('data-rk-bound') === '1') return;
    btn.setAttribute('data-rk-bound', '1');

    var panel = document.getElementById('rkMenuPanel');
    var closeBtn = document.getElementById('rkMenuClose');

    function closeMenu() {
      if (!panel || !btn) return;
      resetMenuSubViews(true);
      panel.classList.remove('is-open', 'is-reveal');
      panel.setAttribute('aria-hidden', 'true');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      btn.focus({ preventScroll: true });
    }

    function openMenu() {
      if (!panel || !btn) return;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (!menuMotionReduced.matches) {
        panel.classList.remove('is-reveal');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            panel.classList.add('is-reveal');
          });
        });
      } else {
        panel.classList.add('is-reveal');
      }
    }

    if (btn && panel) {
      btn.addEventListener('click', function () {
        panel.classList.contains('is-open') ? closeMenu() : openMenu();
      });
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);
      panel.querySelectorAll('[data-rk-close]').forEach(function (el) {
        el.addEventListener('click', closeMenu);
      });
    }

    var navEl = document.querySelector('.rk-nav');

    function removeMegaMenuRemnants() {
      document
        .querySelectorAll('.rk-nav-mega, #rkNavMega, .rk-nav-overlay, #rkNavOverlay')
        .forEach(function (el) {
          el.remove();
        });
      document.querySelectorAll('.rk-nav, .rk-shell').forEach(function (el) {
        el.classList.remove('is-mega-open');
      });
      var legacyMegaBtn = document.getElementById('rkMegaBtn');
      if (legacyMegaBtn) {
        var paketeLink = document.createElement('a');
        var path = location.pathname;
        var onIndex =
          /(^|\/)index\.html$/i.test(path) ||
          path.endsWith('/') ||
          !/\.html$/i.test(path.split('/').pop() || '');
        paketeLink.href = onIndex ? '#inklusive' : '/leistungen#inklusive';
        paketeLink.textContent = 'Kosten';
        var host = legacyMegaBtn.closest('.rk-nav-item') || legacyMegaBtn.parentElement;
        if (host) host.replaceWith(paketeLink);
        else legacyMegaBtn.replaceWith(paketeLink);
      }
    }

    removeMegaMenuRemnants();

    var menuMotionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    function blurIfInside(container) {
      var active = document.activeElement;
      if (active && container && container.contains(active) && typeof active.blur === 'function') {
        active.blur();
      }
    }

    function resetMenuSubViews(skipFocus) {
      if (!panel) return;
      var activeSub = panel.querySelector('.rk-menu-view--sub.is-active');
      var trigger = activeSub
        ? panel.querySelector('[data-rk-menu-sub="' + activeSub.id + '"]')
        : null;

      if (activeSub) blurIfInside(activeSub);

      panel.classList.remove('is-sub-open');
      var subnav = panel.querySelector('.rk-menu-panel-subnav');
      if (subnav) subnav.setAttribute('aria-hidden', 'true');
      panel.querySelectorAll('.rk-menu-view--sub').forEach(function (view) {
        view.classList.remove('is-active', 'is-reveal', 'is-closing');
        view.setAttribute('aria-hidden', 'true');
      });
      var main = document.getElementById('rkMenuMainView');
      if (main) {
        main.classList.add('is-active');
        main.setAttribute('aria-hidden', 'false');
      }
      panel.querySelectorAll('[data-rk-menu-sub]').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
      });
      if (!skipFocus && trigger && typeof trigger.focus === 'function') {
        trigger.focus({ preventScroll: true });
      }
    }

    function openMenuSubView(subId) {
      if (!panel) return;
      var sub = document.getElementById(subId);
      if (!sub) return;
      var main = document.getElementById('rkMenuMainView');
      var trigger = panel.querySelector('[data-rk-menu-sub="' + subId + '"]');
      var backBtn =
        panel.querySelector('.rk-menu-head-back') || sub.querySelector('[data-rk-menu-back]');

      panel.classList.add('is-sub-open');
      var subnav = panel.querySelector('.rk-menu-panel-subnav');
      if (subnav) subnav.setAttribute('aria-hidden', 'false');
      sub.classList.add('is-active');
      sub.setAttribute('aria-hidden', 'false');
      if (backBtn && typeof backBtn.focus === 'function') {
        backBtn.focus({ preventScroll: true });
      }
      if (main) {
        blurIfInside(main);
        main.classList.remove('is-active');
        main.setAttribute('aria-hidden', 'true');
      }
      if (trigger) trigger.setAttribute('aria-expanded', 'true');

      if (!menuMotionReduced.matches) {
        sub.classList.remove('is-closing', 'is-reveal');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            sub.classList.add('is-reveal');
          });
        });
      } else {
        sub.classList.add('is-reveal');
      }
    }

    function closeMenuSubView() {
      if (!panel || !panel.classList.contains('is-sub-open')) return;
      var active = panel.querySelector('.rk-menu-view--sub.is-active');
      if (!active) {
        resetMenuSubViews();
        return;
      }

      if (menuMotionReduced.matches) {
        resetMenuSubViews();
        return;
      }

      active.classList.remove('is-reveal');
      active.classList.add('is-closing');
      panel.classList.remove('is-sub-open');
      window.setTimeout(function () {
        if (active.classList.contains('is-closing')) resetMenuSubViews();
      }, 320);
    }

    if (panel) {
      panel.querySelectorAll('[data-rk-menu-sub]').forEach(function (drillBtn) {
        drillBtn.addEventListener('click', function () {
          openMenuSubView(drillBtn.getAttribute('data-rk-menu-sub'));
        });
      });
      panel.querySelectorAll('[data-rk-menu-back]').forEach(function (backBtn) {
        backBtn.addEventListener('click', closeMenuSubView);
      });
    }

    var agenturNavItem = document.getElementById('rkAgenturNavItem');
    var agenturBtn = document.getElementById('rkAgenturBtn');
    var agenturDrop = document.getElementById('rkAgenturDrop');
    var servicesNavItem = document.getElementById('rkServicesNavItem');
    var servicesBtn = document.getElementById('rkServicesBtn');
    var servicesDrop = document.getElementById('rkServicesDrop');
    var agenturDropdown;
    var servicesDropdown;

    function initNavDropdown(navItem, trigger, drop, onOpen) {
      if (!navItem || !trigger || !drop) return null;
      var closeTimer;

      function open() {
        clearTimeout(closeTimer);
        if (onOpen) onOpen();
        navItem.classList.add('is-drop-open');
        drop.setAttribute('aria-hidden', 'false');
        trigger.classList.add('is-active');
        if (trigger.hasAttribute('aria-expanded')) {
          trigger.setAttribute('aria-expanded', 'true');
        }
      }

      function close() {
        clearTimeout(closeTimer);
        navItem.classList.remove('is-drop-open');
        drop.setAttribute('aria-hidden', 'true');
        trigger.classList.remove('is-active');
        if (trigger.hasAttribute('aria-expanded')) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      }

      function scheduleClose() {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(close, 200);
      }

      navItem.addEventListener('mouseenter', open);
      navItem.addEventListener('mouseleave', function (e) {
        var related = e.relatedTarget;
        if (related && navItem.contains(related)) return;
        scheduleClose();
      });

      if (trigger.tagName === 'BUTTON') {
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (navItem.classList.contains('is-drop-open')) close();
          else open();
        });
      }

      drop.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', close);
      });

      return { open: open, close: close };
    }

    function initServicesMegaDropdown(navItem, trigger, drop, onOpen) {
      if (!navItem || !trigger || !drop) return null;
      var closeTimer;
      var nav = drop.closest('.rk-nav');

      function isInZone(node) {
        if (!node) return false;
        return navItem.contains(node) || drop.contains(node);
      }

      function open() {
        clearTimeout(closeTimer);
        if (onOpen) onOpen();
        navItem.classList.add('is-drop-open');
        if (nav) nav.classList.add('is-services-mega-open');
        drop.setAttribute('aria-hidden', 'false');
        trigger.classList.add('is-active');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function close() {
        clearTimeout(closeTimer);
        navItem.classList.remove('is-drop-open');
        if (nav) nav.classList.remove('is-services-mega-open');
        drop.setAttribute('aria-hidden', 'true');
        trigger.classList.remove('is-active');
        trigger.setAttribute('aria-expanded', 'false');
      }

      function scheduleClose() {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(close, 220);
      }

      [navItem, drop].forEach(function (zone) {
        zone.addEventListener('mouseenter', open);
        zone.addEventListener('mouseleave', function (e) {
          if (isInZone(e.relatedTarget)) return;
          scheduleClose();
        });
      });

      trigger.addEventListener('click', function (e) {
        if (trigger.tagName === 'A') {
          close();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (navItem.classList.contains('is-drop-open')) close();
        else open();
      });

      drop.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', close);
      });

      return { open: open, close: close };
    }

    agenturDropdown = initNavDropdown(agenturNavItem, agenturBtn, agenturDrop, function () {
      if (servicesDropdown) servicesDropdown.close();
    });

    servicesDropdown = initServicesMegaDropdown(servicesNavItem, servicesBtn, servicesDrop, function () {
      if (agenturDropdown) agenturDropdown.close();
    });

    function closeAllNavDrops() {
      if (agenturDropdown) agenturDropdown.close();
      if (servicesDropdown) servicesDropdown.close();
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (panel && panel.classList.contains('is-sub-open')) {
          closeMenuSubView();
          return;
        }
        closeMenu();
        closeAllNavDrops();
      }
    });

    function buildNavLetters(el, text, startIndex) {
      startIndex = startIndex || 0;
      el.textContent = '';
      el.setAttribute('aria-label', text);
      var wrap = document.createElement('span');
      wrap.className = 'rk-nav-letters';
      wrap.setAttribute('aria-hidden', 'true');
      ['', '--hover'].forEach(function (suffix) {
        var word = document.createElement('span');
        word.className = 'rk-nav-word' + (suffix ? ' rk-nav-word' + suffix : '');
        Array.from(text).forEach(function (ch, i) {
          var span = document.createElement('span');
          span.className = 'rk-nav-ch';
          span.style.setProperty('--rk-i', startIndex + i);
          span.textContent = ch === ' ' ? '\u00a0' : ch;
          word.appendChild(span);
        });
        wrap.appendChild(word);
      });
      el.appendChild(wrap);
    }

    function wrapLogoIcon(icon, index) {
      var wrap = document.createElement('span');
      wrap.className = 'rk-logo-icon-letters rk-nav-letters';
      wrap.setAttribute('aria-hidden', 'true');
      ['', '--hover'].forEach(function (suffix) {
        var word = document.createElement('span');
        word.className = 'rk-nav-word' + (suffix ? ' rk-nav-word' + suffix : '');
        var slot = document.createElement('span');
        slot.className = 'rk-nav-ch rk-logo-icon-ch';
        slot.style.setProperty('--rk-i', index);
        var img = icon.cloneNode(true);
        img.className = 'rk-logo-icon' + (suffix ? ' rk-logo-icon--hover' : '');
        img.removeAttribute('id');
        slot.appendChild(img);
        word.appendChild(slot);
        wrap.appendChild(word);
      });
      icon.replaceWith(wrap);
      return wrap;
    }

    function buildLogoLockupHover(lockup) {
      if (lockup.dataset.rkLetters === '1') return;
      var words = lockup.querySelectorAll('.rk-logo-word');
      var icon = lockup.querySelector('.rk-logo-icon');
      if (words.length < 2 || !icon) return;

      var rocketText = (words[0].dataset.rkLabel || words[0].textContent || '').trim();
      var oryText = (words[1].dataset.rkLabel || words[1].textContent || '').trim();
      if (!rocketText || !oryText) return;

      var index = 0;
      words[0].dataset.rkLabel = rocketText;
      buildNavLetters(words[0], rocketText, index);
      index += rocketText.length;
      wrapLogoIcon(icon, index);
      index += 1;
      words[1].dataset.rkLabel = oryText;
      buildNavLetters(words[1], oryText, index);
      lockup.dataset.rkLetters = '1';
    }

    function initNavLetterHover() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var mq = window.matchMedia('(min-width:769px)');
      function apply() {
        if (mq.matches) {
          document.querySelectorAll('.rk-logo-lockup').forEach(function (lockup) {
            buildLogoLockupHover(lockup);
          });
        }
        document
          .querySelectorAll('.rk-nav-center > a, .rk-nav-center .rk-nav-link, .rk-nav-cta-label, .rk-dot-cta-label, .rk-logo-label')
          .forEach(function (el) {
            var text = (el.dataset.rkLabel || el.textContent || '').trim();
            if (!text) return;
            if (mq.matches) {
              if (el.dataset.rkLetters === '1') return;
              el.dataset.rkLabel = text;
              buildNavLetters(el, text);
              el.dataset.rkLetters = '1';
            }
          });
      }
      apply();
      if (mq.addEventListener) mq.addEventListener('change', apply);
      else mq.addListener(apply);
    }

    initNavLetterHover();

    function initPriceToggle() {
      var lists = [
        document.getElementById('rkPlanList'),
        document.getElementById('rkMenuPlanList')
      ].filter(Boolean);
      if (!lists.length) return;

      var switches = [
        document.getElementById('rkPriceSwitch'),
        document.getElementById('rkMenuPriceSwitch')
      ].filter(Boolean);
      var labelsMonthly = [
        document.getElementById('rkToggleLabelMonthly'),
        document.getElementById('rkMenuToggleLabelMonthly')
      ].filter(Boolean);
      var labelsOnce = [
        document.getElementById('rkToggleLabelOnce'),
        document.getElementById('rkMenuToggleLabelOnce')
      ].filter(Boolean);

      function setPriceMode(mode) {
        lists.forEach(function (list) {
          list.setAttribute('data-rk-price-mode', mode);
        });
        switches.forEach(function (sw) {
          sw.setAttribute('aria-checked', mode === 'once' ? 'true' : 'false');
        });
        labelsMonthly.forEach(function (label) {
          label.classList.toggle('rk-plan-toggle-label--active', mode === 'monthly');
        });
        labelsOnce.forEach(function (label) {
          label.classList.toggle('rk-plan-toggle-label--active', mode === 'once');
        });
      }

      switches.forEach(function (sw) {
        sw.addEventListener('click', function (e) {
          e.stopPropagation();
          setPriceMode(lists[0].getAttribute('data-rk-price-mode') === 'monthly' ? 'once' : 'monthly');
        });
      });

      labelsMonthly.forEach(function (label) {
        label.addEventListener('click', function (e) {
          e.stopPropagation();
          setPriceMode('monthly');
        });
        label.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setPriceMode('monthly');
          }
        });
      });

      labelsOnce.forEach(function (label) {
        label.addEventListener('click', function (e) {
          e.stopPropagation();
          setPriceMode('once');
        });
        label.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setPriceMode('once');
          }
        });
      });

      setPriceMode('monthly');
    }

    initPriceToggle();
  }

  function bootNav() {
    initNav();
  }

  bootNav();
  document.addEventListener('rk:ready', bootNav);
  document.addEventListener('rk:legacy-content', bootNav);
})();
