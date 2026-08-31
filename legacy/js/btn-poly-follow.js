(function () {
  'use strict';

  var VIEW_W = 320;
  var VIEW_H = 80;

  var FACETS = [
    { fill: '#b01f28', points: '0,0 118,0 0,80' },
    { fill: '#c1272d', points: '118,0 196,0 88,80 0,80' },
    { fill: '#d93622', points: '196,0 268,0 210,80 88,80' },
    { fill: '#ef4a12', points: '268,0 320,0 320,80 210,80' },
    { fill: '#ff5c00', points: '232,18 320,0 320,46' },
    { fill: '#ffffff', opacity: '0.14', points: '0,0 86,0 38,46' },
    { fill: '#ffffff', opacity: '0.1', points: '196,0 268,0 224,50' },
    { fill: '#000000', opacity: '0.1', points: '88,80 210,80 148,34' },
  ];

  function wrapLabel(btn) {
    if (btn.querySelector('.rk-btn-solid-label')) return;
    var label = document.createElement('span');
    label.className = 'rk-btn-solid-label';
    while (btn.firstChild) label.appendChild(btn.firstChild);
    btn.appendChild(label);
  }

  function createSvg() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'rk-btn-poly-bg');
    svg.setAttribute('viewBox', '0 0 ' + VIEW_W + ' ' + VIEW_H);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    FACETS.forEach(function (facet) {
      var node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      node.setAttribute('points', facet.points);
      node.setAttribute('fill', facet.fill);
      if (facet.opacity) node.setAttribute('fill-opacity', facet.opacity);
      svg.appendChild(node);
    });

    return svg;
  }

  function bind(btn) {
    if (btn.dataset.rkPolyBound === '1') return;
    btn.dataset.rkPolyBound = '1';
    wrapLabel(btn);

    var existing = btn.querySelector('.rk-btn-poly-bg, .rk-btn-poly');
    if (existing) existing.remove();

    btn.insertBefore(createSvg(), btn.firstChild);
  }

  function init() {
    document.querySelectorAll('.rk-btn-solid').forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('rk:ready', init);
})();
