(function () {
  var scrollBound = false;
  var resizeBound = false;
  var hashBound = false;
  var readyBound = false;
  var observer = null;
  var lockTimer = null;
  var lockedId = null;
  var ticking = false;
  var instances = [];
  var allEntries = [];

  function navOffset() {
    var nav = document.querySelector('.rk-nav');
    if (nav) {
      var h = nav.getBoundingClientRect().height;
      if (h > 0 && h < 200) return h + 24;
    }
    var raw = getComputedStyle(document.documentElement).getPropertyValue('--rk-nav-h').trim();
    return (parseFloat(raw) || 56) + 24;
  }

  function hashId(href) {
    if (!href) return '';
    var i = href.indexOf('#');
    if (i === -1) return '';
    try {
      return decodeURIComponent(href.slice(i + 1));
    } catch (e) {
      return href.slice(i + 1);
    }
  }

  function clearInstance(instance) {
    instance.entries.forEach(function (entry) {
      entry.link.classList.remove('is-active');
      entry.link.removeAttribute('aria-current');
    });
  }

  function applyActive(activeId) {
    instances.forEach(function (instance) {
      var hasMatch = instance.entries.some(function (entry) {
        return entry.id === activeId;
      });

      if (!hasMatch) {
        clearInstance(instance);
        return;
      }

      instance.entries.forEach(function (entry) {
        var active = entry.id === activeId;
        entry.link.classList.toggle('is-active', active);
        if (active) {
          entry.link.setAttribute('aria-current', 'location');
        } else {
          entry.link.removeAttribute('aria-current');
        }
      });
    });
  }

  /** Which article-page owns the sticky TOC the user is looking at. */
  function pickCurrentInstance(offset) {
    var current = null;

    instances.forEach(function (instance) {
      var top = instance.page.getBoundingClientRect().top;
      // Last page that has reached the sticky zone
      if (top <= offset + 48) current = instance;
    });

    if (current) return current;

    for (var i = 0; i < instances.length; i++) {
      var rect = instances[i].page.getBoundingClientRect();
      if (rect.bottom > offset && rect.top < window.innerHeight) {
        return instances[i];
      }
    }

    return instances[0] || null;
  }

  function pickActiveFromScroll() {
    if (!instances.length) return;

    if (lockedId) {
      applyActive(lockedId);
      return;
    }

    var offset = navOffset();
    var instance = pickCurrentInstance(offset);
    if (!instance) {
      instances.forEach(clearInstance);
      return;
    }

    var best = null;
    var bestTop = -Infinity;

    instance.entries.forEach(function (entry) {
      var top = entry.section.getBoundingClientRect().top;
      if (top <= offset + 12 && top > bestTop) {
        bestTop = top;
        best = entry;
      }
    });

    // Nothing crossed yet → first item (so sticky TOC is never empty)
    if (!best) {
      best = instance.entries[0];
    }

    var last = instance.entries[instance.entries.length - 1];
    var lastBottom = last.section.getBoundingClientRect().bottom;
    var pageBottom = instance.page.getBoundingClientRect().bottom;
    if (lastBottom < offset && pageBottom > offset) {
      best = last;
    }

    applyActive(best.id);
  }

  function lockActive(id, ms) {
    lockedId = id;
    applyActive(id);
    if (lockTimer) window.clearTimeout(lockTimer);
    lockTimer = window.setTimeout(function () {
      lockedId = null;
      pickActiveFromScroll();
    }, ms || 900);
  }

  function scrollToSection(section) {
    if (window.rkSmoothScrollTo) {
      window.rkSmoothScrollTo(section);
      return;
    }
    var top = section.getBoundingClientRect().top + window.scrollY - navOffset();
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function setTocOpen(toc, open) {
    toc.classList.toggle('is-open', open);
    var toggle = toc.querySelector('.rk-article-toc-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function bindMobileToggle(toc) {
    var toggle = toc.querySelector('.rk-article-toc-toggle');
    if (!toggle || toggle.getAttribute('data-rk-toc-toggle-bound') === '1') return;
    toggle.setAttribute('data-rk-toc-toggle-bound', '1');
    toggle.addEventListener('click', function () {
      setTocOpen(toc, !toc.classList.contains('is-open'));
    });
  }

  function bindClicks(instance) {
    bindMobileToggle(instance.toc);
    instance.entries.forEach(function (entry) {
      if (entry.link.getAttribute('data-rk-toc-bound') === '1') return;
      entry.link.setAttribute('data-rk-toc-bound', '1');
      entry.link.addEventListener('click', function (event) {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        setTocOpen(instance.toc, false);
        lockActive(entry.id, 1200);
        scrollToSection(entry.section);
        if (history.replaceState) {
          history.replaceState(null, '', '#' + entry.id);
        } else {
          window.location.hash = entry.id;
        }
      });
    });
  }

  function bindObserver() {
    if (observer) observer.disconnect();
    if (!allEntries.length || typeof IntersectionObserver === 'undefined') return;

    var offset = navOffset();
    observer = new IntersectionObserver(
      function () {
        pickActiveFromScroll();
      },
      {
        root: null,
        rootMargin: '-' + offset + 'px 0px -45% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 1],
      },
    );
    allEntries.forEach(function (item) {
      observer.observe(item.entry.section);
    });
  }

  function collectInstances() {
    var pages = Array.prototype.slice.call(document.querySelectorAll('.rk-article-page'));
    instances = pages
      .map(function (page) {
        var toc = page.querySelector('.rk-article-toc');
        if (!toc) return null;

        var links = Array.prototype.slice.call(toc.querySelectorAll('a[href*="#"]'));
        if (!links.length) return null;

        var entries = links
          .map(function (link) {
            var id = hashId(link.getAttribute('href'));
            var section = id ? document.getElementById(id) : null;
            return section ? { link: link, section: section, id: id } : null;
          })
          .filter(Boolean);

        if (!entries.length) return null;
        return { page: page, toc: toc, entries: entries };
      })
      .filter(Boolean);

    allEntries = [];
    instances.forEach(function (instance) {
      bindClicks(instance);
      instance.entries.forEach(function (entry) {
        allEntries.push({ instance: instance, entry: entry });
      });
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      pickActiveFromScroll();
      ticking = false;
    });
  }

  function boot() {
    collectInstances();
    if (!instances.length) return;
    bindObserver();
    pickActiveFromScroll();
  }

  if (!scrollBound) {
    scrollBound = true;
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (!resizeBound) {
    resizeBound = true;
    window.addEventListener(
      'resize',
      function () {
        boot();
      },
      { passive: true },
    );
  }
  if (!hashBound) {
    hashBound = true;
    window.addEventListener('hashchange', function () {
      var id = hashId(window.location.hash);
      if (id && document.getElementById(id)) lockActive(id, 1000);
      else pickActiveFromScroll();
    });
  }
  if (!readyBound) {
    readyBound = true;
    document.addEventListener('rk:ready', boot);
    document.addEventListener('rk:legacy-content', boot);
  }

  boot();
  window.setTimeout(boot, 120);
  window.setTimeout(boot, 500);

  var initialId = hashId(window.location.hash);
  if (initialId && document.getElementById(initialId)) {
    lockActive(initialId, 1000);
  }
})();
