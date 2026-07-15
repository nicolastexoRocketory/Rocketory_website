(function () {
  var author = window.__RK_AUTHOR;
  if (!author) return;

  var modalId = 'rk-author-modal';
  var openClass = 'is-open';
  var lastFocus = null;

  function getModal() {
    return document.getElementById(modalId);
  }

  function socialLabel(url) {
    if (/instagram\.com/i.test(url)) return 'Instagram';
    if (/youtube\.com|youtu\.be/i.test(url)) return 'YouTube';
    if (/linkedin\.com/i.test(url)) return 'LinkedIn';
    return 'Profil';
  }

  function socialIcon(url) {
    if (/instagram\.com/i.test(url)) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A4.5 4.5 0 1111.5 16 4.5 4.5 0 0112 7.5zm6.1-1.4a1 1 0 110 2 1 1 0 010-2z"/></svg>';
    }
    if (/youtube\.com|youtu\.be/i.test(url)) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.6 2.6 0 00-1.8-1.9C17.8 5 12 5 12 5s-5.8 0-7.8.3a2.6 2.6 0 00-1.8 1.9A27 27 0 002 12a27 27 0 00.4 4.8 2.6 2.6 0 001.8 1.9C6.2 19 12 19 12 19s5.8 0 7.8-.3a2.6 2.6 0 001.8-1.9A27 27 0 0022 12a27 27 0 00-.4-4.8zM10 15.5V8.5l6 3.5-6 3.5z"/></svg>';
    }
    if (/linkedin\.com/i.test(url)) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5h3v10h-3v-10zM8 5.5a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zM11 8.5h2.9v1.4h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6v5.56h-3v-4.93c0-1.18-.02-2.7-1.64-2.7-1.64 0-1.89 1.28-1.89 2.6v4.93h-3V8.5z"/></svg>';
    }
    return '';
  }

  function buildModal() {
    if (getModal()) return;

    var socialLinks = (author.sameAs || [])
      .map(function (url) {
        return (
          '<a href="' + url + '" class="rk-author-modal-social-link" target="_blank" rel="noopener noreferrer">' +
          socialIcon(url) +
          '<span>' + socialLabel(url) + '</span></a>'
        );
      })
      .join('');

    var expertise = (author.knowsAbout || [])
      .map(function (topic) {
        return '<li>' + topic + '</li>';
      })
      .join('');

    var modal = document.createElement('div');
    modal.className = 'rk-author-modal';
    modal.id = modalId;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'rk-author-modal-title');
    modal.setAttribute('hidden', '');
    modal.innerHTML =
      '<div class="rk-author-modal-backdrop" data-rk-author-close aria-hidden="true"></div>' +
      '<div class="rk-author-modal-panel" role="document">' +
      '<button type="button" class="rk-author-modal-close" data-rk-author-close aria-label="Schließen">' +
      'Schließen<div class="dot-ring" aria-hidden="true"><span></span></div></button>' +
      '<div class="rk-author-modal-head">' +
      '<img class="rk-author-modal-photo" src="' + author.image + '" alt="" width="96" height="96" loading="lazy">' +
      '<div><p class="rk-author-modal-kicker">Autor</p>' +
      '<h2 class="rk-author-modal-title" id="rk-author-modal-title">' + author.name + '</h2>' +
      '<p class="rk-author-modal-role">' + author.jobTitle + '</p></div></div>' +
      '<p class="rk-author-modal-bio">' + author.bio + '</p>' +
      (expertise ? '<div class="rk-author-modal-expertise"><p class="rk-author-modal-label">Expertise</p><ul>' + expertise + '</ul></div>' : '') +
      '<div class="rk-author-modal-social" aria-label="Social Media">' + socialLinks + '</div>' +
      '</div>';

    document.body.appendChild(modal);
  }

  function openModal(trigger) {
    var modal = getModal();
    if (!modal) return;
    lastFocus = trigger || document.activeElement;
    modal.removeAttribute('hidden');
    modal.classList.add(openClass);
    document.body.classList.add('rk-author-modal-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    var closeBtn = modal.querySelector('.rk-author-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    var modal = getModal();
    if (!modal) return;
    modal.setAttribute('hidden', '');
    modal.classList.remove(openClass);
    document.body.classList.remove('rk-author-modal-open');
    document.querySelectorAll('.rk-author-widget-trigger[aria-expanded="true"]').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function bindTriggers() {
    document.querySelectorAll('.rk-author-widget-trigger').forEach(function (btn) {
      if (btn.dataset.rkAuthorBound) return;
      btn.dataset.rkAuthorBound = '1';
      btn.addEventListener('click', function () {
        openModal(btn);
      });
    });
  }

  function bindModal() {
    var modal = getModal();
    if (!modal || modal.dataset.rkAuthorBound) return;
    modal.dataset.rkAuthorBound = '1';

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-rk-author-close]')) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains(openClass)) closeModal();
    });
  }



  function ensureWidgetInSidebar() {
    var sidebar = document.querySelector('.rk-blog-sidebar');
    if (!sidebar || sidebar.querySelector('.rk-author-widget-trigger')) return;

    var block = document.createElement('div');
    block.className = 'rk-blog-sidebar-block rk-author-widget';
    block.innerHTML =
      '<p class="rk-blog-sidebar-label">Autor</p>' +
      '<button type="button" class="rk-author-widget-trigger" aria-expanded="false" aria-controls="rk-author-modal">' +
      '<img class="rk-author-widget-photo" src="' + author.image + '" alt="" width="56" height="56" loading="lazy">' +
      '<span class="rk-author-widget-meta">' +
      '<span class="rk-author-widget-name">' + author.name + '</span>' +
      '<span class="rk-author-widget-role">' + author.jobTitle + '</span></span>' +
      '<span class="rk-author-widget-hint" aria-hidden="true">Profil</span></button>';

    sidebar.insertBefore(block, sidebar.firstChild);
  }

  function init() {
    ensureWidgetInSidebar();
    buildModal();
    bindTriggers();
    bindModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('rk:ready', init);
})();
