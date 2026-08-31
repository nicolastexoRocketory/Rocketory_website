(function () {
  var navMount = document.getElementById('rk-nav-mount');
  var footerMount = document.getElementById('rk-footer-mount');
  var blogSidebarMount = document.getElementById('rk-blog-sidebar-mount');
  if (!navMount && !footerMount && !blogSidebarMount) return;

  function getAssetBase() {
    return /\/blog\//i.test(location.pathname) ? '../' : '';
  }

  function isIndexPage() {
    var path = location.pathname;
    return (
      /(^|\/)index\.html$/i.test(path) ||
      path.endsWith('/') ||
      !/\.html$/i.test(path.split('/').pop() || '')
    );
  }

  function isContactPage() {
    return /(^|\/)kontakt\.html$/i.test(location.pathname);
  }

  function fixLinksForIndex(container) {
    if (!isIndexPage()) return;
    container.querySelectorAll('a[href^="index.html#"]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').replace(/^index\.html/, ''));
    });
    container.querySelectorAll('a[href="index.html"]').forEach(function (a) {
      a.setAttribute('href', '#top');
    });
  }

  function fixLinksForContact(container) {
    if (!isContactPage()) return;
    container.querySelectorAll('.rk-nav-cta[href="kontakt.html"], .rk-nav-actions .rk-btn-solid[href="kontakt.html"]').forEach(function (a) {
      a.setAttribute('href', '#kontakt-form');
    });
  }

  function fixLinksForSubdir(container) {
    var base = getAssetBase();
    if (!base) return;
    container.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return;
      if (href.indexOf('../') === 0) return;
      if (href.indexOf('blog/') === 0) {
        a.setAttribute('href', href.slice(5));
        return;
      }
      a.setAttribute('href', base + href);
    });
  }

  function mountComponent(html, mount) {
    if (!mount || !html) return;
    mount.innerHTML = html;
    fixLinksForSubdir(mount);
    fixLinksForIndex(mount);
    fixLinksForContact(mount);
  }

  function mountAll() {
    var components = window.__RK_COMPONENTS || {};
    mountComponent(components.nav, navMount);
    mountComponent(components.footer, footerMount);
    mountComponent(components.blogSidebar, blogSidebarMount);
    document.dispatchEvent(new CustomEvent('rk:ready'));
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error('Failed to load ' + src));
      };
      document.head.appendChild(script);
    });
  }

  function loadComponents() {
    var components = window.__RK_COMPONENTS || {};
    var base = getAssetBase();
    var v = '?v=17';
    var loads = [];

    if (navMount && !components.nav) {
      loads.push(loadScript(base + 'js/components/nav.js' + v));
    }
    if (footerMount && !components.footer) {
      loads.push(loadScript(base + 'js/components/footer.js' + v));
    }
    if (blogSidebarMount && !components.blogSidebar) {
      loads.push(loadScript(base + 'js/components/blog-sidebar.js' + v));
    }

    var authorLoads = Promise.resolve();
    if (blogSidebarMount) {
      authorLoads = loadScript(base + 'js/author-data.js' + v).then(function () {
        return Promise.all([
          loadScript(base + 'js/author-schema.js' + v),
          loadScript(base + 'js/author-widget.js' + v)
        ]);
      });
    }

    if (loads.length === 0) {
      authorLoads.then(mountAll).then(function () {
        return loadScript(base + 'js/readmore.js' + v);
      }).catch(function (err) {
        console.error('[Rocketory] Komponenten konnten nicht geladen werden:', err);
      });
      return;
    }

    Promise.all(loads)
      .then(function () { return authorLoads; })
      .then(mountAll)
      .then(function () {
        return loadScript(base + 'js/readmore.js' + v);
      })
      .catch(function (err) {
        console.error('[Rocketory] Komponenten konnten nicht geladen werden:', err);
      });
  }

  loadComponents();
})();
