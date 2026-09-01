(function () {
  function initNav() {
    var btn = document.getElementById('rkMenuBtn');
    if (!btn || btn.getAttribute('data-rk-bound') === '1') return;
    btn.setAttribute('data-rk-bound', '1');

    var panel = document.getElementById('rkMenuPanel');
    var closeBtn = document.getElementById('rkMenuClose');

    var menuCloseTimer = null;
    var menuQuietTimer = null;
    var menuOpenTimer = null;
    var menuSubCloseTimer = null;
    var menuMotionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var shellEl = document.querySelector('.rk-shell');
    var MENU_STAGGER_OPEN = [70, 130, 190, 250, 310, 370, 430, 490];
    var MENU_STAGGER_CLOSE = [180, 140, 100, 60, 30, 0, 0, 0];
    var MENU_ACCORDION_MS = 280;
    var MENU_PANEL_CLOSE_MS = 400;

    function applyMenuStagger(root, phase) {
      if (!root) return;
      var delays = phase === 'close' ? MENU_STAGGER_CLOSE : MENU_STAGGER_OPEN;
      root.querySelectorAll('.rk-menu-stagger-item').forEach(function (el, i) {
        if (menuMotionReduced.matches) {
          el.style.transitionDelay = '0ms';
          return;
        }
        var delay = delays[i] !== undefined ? delays[i] : delays[delays.length - 1];
        el.style.transitionDelay = delay + 'ms';
      });
    }

    function clearMenuStagger(root) {
      if (!root) return;
      root.querySelectorAll('.rk-menu-stagger-item').forEach(function (el) {
        el.style.transitionDelay = '';
      });
    }

    function setBurgerFly(active) {
      if (!shellEl) return;
      shellEl.classList.toggle('is-burger-fly', !!active);
    }

    function clearMenuTimers() {
      if (menuOpenTimer) {
        clearTimeout(menuOpenTimer);
        menuOpenTimer = null;
      }
      if (menuCloseTimer) {
        clearTimeout(menuCloseTimer);
        menuCloseTimer = null;
      }
      if (menuQuietTimer) {
        clearTimeout(menuQuietTimer);
        menuQuietTimer = null;
      }
      if (menuSubCloseTimer) {
        clearTimeout(menuSubCloseTimer);
        menuSubCloseTimer = null;
      }
    }

    var navEl = document.querySelector('.rk-nav');
    var navSolidBound = false;
    var NAV_SOLID_AFTER = 24;
    var navOverHero = !!(navEl && document.querySelector('#top.rk-hero'));

    function setNavSolid(on) {
      if (!navEl) return;
      navEl.classList.toggle('is-solid', !!on);
    }

    function readScrollY() {
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    }

    function isInAppBrowser() {
      if (document.documentElement.classList.contains('is-in-app-browser')) return true;
      var ua = navigator.userAgent || '';
      var ref = document.referrer || '';
      return (
        /WhatsApp\/|FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|LinkedInApp|Snapchat|Pinterest|TikTok|BytedanceWebview|MicroMessenger|GSA\/|; wv\)/i.test(
          ua
        ) || /whatsapp|instagram|facebook|fb\.com/i.test(ref)
      );
    }

    function syncNavSolid() {
      if (!navEl || !navOverHero) {
        setNavSolid(true);
        return;
      }
      var menuOpen =
        (panel && panel.classList.contains('is-open')) ||
        (btn && btn.classList.contains('is-open'));
      setNavSolid(menuOpen || readScrollY() > NAV_SOLID_AFTER);
    }

    function syncNavSolidFromHero(entry) {
      if (!navEl || !navOverHero) return;
      var menuOpen =
        (panel && panel.classList.contains('is-open')) ||
        (btn && btn.classList.contains('is-open'));
      if (menuOpen) {
        setNavSolid(true);
        return;
      }
      var top = entry.boundingClientRect.top;
      setNavSolid(!entry.isIntersecting || top < -NAV_SOLID_AFTER);
    }

    if (navEl && navOverHero) {
      navEl.classList.add('rk-nav--over-hero');
    } else if (navEl) {
      setNavSolid(true);
    }

    function closeMenu() {
      if (!panel || !btn) return;
      if (panel.getAttribute('data-rk-closing') === '1') return;
      resetMenuAccordions(true);
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Menü öffnen');
      document.body.style.overflow = '';

      clearMenuTimers();

      function finishClose() {
        panel.classList.add('is-close-quiet');
        panel.classList.remove('is-open', 'is-reveal', 'is-closing');
        panel.removeAttribute('data-rk-closing');
        panel.setAttribute('inert', '');
        btn.classList.remove('is-open', 'is-closing');
        menuQuietTimer = setTimeout(function () {
          panel.classList.remove('is-close-quiet');
          menuQuietTimer = null;
        }, menuMotionReduced.matches ? 0 : 50);
        setBurgerFly(false);
        syncNavSolid();
      }

      if (menuMotionReduced.matches || !panel.classList.contains('is-open')) {
        finishClose();
        btn.focus({ preventScroll: true });
        return;
      }

      panel.setAttribute('data-rk-closing', '1');
      panel.classList.add('is-closing');
      btn.classList.add('is-closing');
      btn.classList.remove('is-open');
      setBurgerFly(true);
      menuCloseTimer = setTimeout(function () {
        finishClose();
        menuCloseTimer = null;
      }, MENU_PANEL_CLOSE_MS);

      btn.focus({ preventScroll: true });
    }

    function openMenu() {
      if (!panel || !btn) return;
      if (panel.getAttribute('data-rk-closing') === '1') return;
      clearMenuTimers();
      setNavSolid(true);
      panel.classList.remove('is-closing', 'is-close-quiet');
      panel.removeAttribute('data-rk-closing');
      btn.classList.remove('is-closing');
      setBurgerFly(true);
      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Menü schließen');
      document.body.style.overflow = 'hidden';

      var panelDelay = menuMotionReduced.matches ? 0 : 40;
      menuOpenTimer = setTimeout(function () {
        panel.classList.add('is-open');
        panel.removeAttribute('inert');
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
        setTimeout(function () {
          setBurgerFly(false);
        }, menuMotionReduced.matches ? 0 : 400);
        menuOpenTimer = null;
      }, panelDelay);
    }

    if (btn && panel) {
      btn.addEventListener('click', function () {
        if (panel.classList.contains('is-open') || btn.classList.contains('is-open')) {
          closeMenu();
        } else {
          openMenu();
        }
      });
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);
      panel.querySelectorAll('[data-rk-close]').forEach(function (el) {
        el.addEventListener('click', closeMenu);
      });
    }

    if (navEl && navOverHero && !navSolidBound) {
      navSolidBound = true;
      window.addEventListener('scroll', syncNavSolid, { passive: true });
      navEl.addEventListener('pointerdown', function () {
        setNavSolid(true);
      });
      syncNavSolid();
    }

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

    function blurIfInside(container) {
      var active = document.activeElement;
      if (active && container && container.contains(active) && typeof active.blur === 'function') {
        active.blur();
      }
    }

    function resetMenuAccordions(immediate) {
      if (!panel) return;
      panel.querySelectorAll('[data-rk-menu-accordion]').forEach(function (btn) {
        var subId = btn.getAttribute('data-rk-menu-accordion');
        var sub = subId ? document.getElementById(subId) : null;
        btn.setAttribute('aria-expanded', 'false');
        if (!sub) return;
        if (menuSubCloseTimer) {
          clearTimeout(menuSubCloseTimer);
          menuSubCloseTimer = null;
        }
        sub.classList.remove('is-open', 'is-reveal', 'is-closing');
        sub.setAttribute('aria-hidden', 'true');
      });
    }

    function closeMenuAccordion(btn, immediate) {
      if (!btn) return;
      var subId = btn.getAttribute('data-rk-menu-accordion');
      var sub = subId ? document.getElementById(subId) : null;
      if (!sub || !sub.classList.contains('is-open')) {
        btn.setAttribute('aria-expanded', 'false');
        if (sub) {
          sub.classList.remove('is-open', 'is-reveal', 'is-closing');
          sub.setAttribute('aria-hidden', 'true');
        }
        return;
      }

      if (immediate || menuMotionReduced.matches) {
        btn.setAttribute('aria-expanded', 'false');
        sub.classList.remove('is-open', 'is-reveal', 'is-closing');
        sub.setAttribute('aria-hidden', 'true');
        return;
      }

      if (menuSubCloseTimer) {
        clearTimeout(menuSubCloseTimer);
        menuSubCloseTimer = null;
      }

      sub.classList.remove('is-reveal');
      sub.classList.add('is-closing');
      btn.setAttribute('aria-expanded', 'false');
      menuSubCloseTimer = setTimeout(function () {
        sub.classList.remove('is-closing', 'is-open', 'is-reveal');
        sub.setAttribute('aria-hidden', 'true');
        menuSubCloseTimer = null;
      }, MENU_ACCORDION_MS);
    }

    function openMenuAccordion(btn) {
      if (!btn || !panel) return;
      var subId = btn.getAttribute('data-rk-menu-accordion');
      var sub = subId ? document.getElementById(subId) : null;
      if (!sub) return;

      panel.querySelectorAll('[data-rk-menu-accordion]').forEach(function (otherBtn) {
        if (otherBtn === btn) return;
        closeMenuAccordion(otherBtn, true);
      });

      if (menuSubCloseTimer) {
        clearTimeout(menuSubCloseTimer);
        menuSubCloseTimer = null;
      }

      btn.setAttribute('aria-expanded', 'true');
      sub.setAttribute('aria-hidden', 'false');
      sub.classList.remove('is-closing');
      sub.classList.add('is-open');

      if (!menuMotionReduced.matches) {
        sub.classList.remove('is-reveal');
        void sub.offsetHeight;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            sub.classList.add('is-reveal');
          });
        });
      } else {
        sub.classList.add('is-reveal');
      }
    }

    function toggleMenuAccordion(btn) {
      if (btn.getAttribute('aria-expanded') === 'true') closeMenuAccordion(btn);
      else openMenuAccordion(btn);
    }

    if (panel) {
      panel.querySelectorAll('[data-rk-menu-accordion]').forEach(function (accordionBtn) {
        accordionBtn.addEventListener('click', function () {
          toggleMenuAccordion(accordionBtn);
        });
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
        if (panel && panel.querySelector('.rk-menu-sub.is-open')) {
          resetMenuAccordions(true);
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
