(function () {
  var MOBILE_QUERY = '(max-width: 768px)'

  var SELECTORS = [
    '#leistungen .rk-usp-grid',
    '#angebote-leistungen .rk-usp-grid',
    '#kernvorteile .rk-bento-grid',
    '#werte .rk-home-bento-grid',
  ]

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n))
  }

  function isMobile() {
    return window.matchMedia(MOBILE_QUERY).matches
  }

  function createIcon(direction) {
    var path = direction < 0 ? 'M14 6l-6 6 6 6' : 'M10 6l6 6-6 6'
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="' +
      path +
      '" />' +
      '</svg>'
    )
  }

  function getWrap(grid) {
    return grid.closest('.rk-usp-carousel')
  }

  function teardown(grid) {
    if (!grid) return

    var wrap = getWrap(grid)
    if (wrap) {
      var ui = wrap.querySelector('.rk-usp-carousel-ui')
      if (ui) ui.remove()
      wrap.parentNode.insertBefore(grid, wrap)
      wrap.remove()
    } else {
      var sibling = grid.nextElementSibling
      if (sibling && sibling.classList && sibling.classList.contains('rk-usp-carousel-ui')) {
        sibling.remove()
      }
    }

    delete grid.dataset.rkUspCarouselInit
  }

  function setup(grid) {
    if (!grid) return

    if (!isMobile()) {
      teardown(grid)
      return
    }

    if (grid.dataset.rkUspCarouselInit) return

    var slides = Array.prototype.slice.call(
      grid.querySelectorAll(
        ':scope > .rk-usp-cell, :scope > .rk-bento-cell, :scope > .rk-home-bento-cell, :scope > .rk-vt-pin, :scope > .rk-trust-item'
      )
    )
    if (slides.length <= 1) return

    grid.dataset.rkUspCarouselInit = '1'

    var wrap = getWrap(grid)
    if (!wrap) {
      wrap = document.createElement('div')
      wrap.className = 'rk-usp-carousel'
      wrap.setAttribute('data-rk-reveal', 'off')
      grid.parentNode.insertBefore(wrap, grid)
      wrap.appendChild(grid)
    }

    var ui = document.createElement('div')
    ui.className = 'rk-usp-carousel-ui'
    ui.setAttribute('aria-label', 'USP Karten Navigation')
    ui.setAttribute('data-rk-reveal', 'off')

    var prevBtn = document.createElement('button')
    prevBtn.type = 'button'
    prevBtn.className = 'rk-usp-carousel-arrow rk-usp-carousel-arrow--prev'
    prevBtn.setAttribute('aria-label', 'Vorherige Karte')
    prevBtn.innerHTML = createIcon(-1)

    var dotsWrap = document.createElement('div')
    dotsWrap.className = 'rk-usp-carousel-dots'
    dotsWrap.setAttribute('role', 'tablist')

    var nextBtn = document.createElement('button')
    nextBtn.type = 'button'
    nextBtn.className = 'rk-usp-carousel-arrow rk-usp-carousel-arrow--next'
    nextBtn.setAttribute('aria-label', 'Nächste Karte')
    nextBtn.innerHTML = createIcon(1)

    var dots = slides.map(function (_, idx) {
      var dot = document.createElement('button')
      dot.type = 'button'
      dot.className = 'rk-usp-carousel-dot'
      dot.setAttribute('role', 'tab')
      dot.setAttribute('aria-label', 'Karte ' + (idx + 1))
      dot.dataset.rkUspCarouselIndex = String(idx)
      dot.addEventListener('click', function () {
        scrollToIndex(Number(dot.dataset.rkUspCarouselIndex || '0'))
      })
      dotsWrap.appendChild(dot)
      return dot
    })

    ui.appendChild(prevBtn)
    ui.appendChild(dotsWrap)
    ui.appendChild(nextBtn)
    wrap.appendChild(ui)

    function getIndex() {
      var w = grid.clientWidth
      if (!w) return 0
      return clamp(Math.round(grid.scrollLeft / w), 0, slides.length - 1)
    }

    function setActive(index) {
      index = clamp(index, 0, slides.length - 1)
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index)
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false')
        dot.tabIndex = i === index ? 0 : -1
      })
      prevBtn.disabled = index === 0
      nextBtn.disabled = index === slides.length - 1
    }

    function scrollToIndex(index) {
      index = clamp(index, 0, slides.length - 1)
      var w = grid.clientWidth
      if (!w) return
      grid.scrollTo({
        left: index * w,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
      setActive(index)
    }

    prevBtn.addEventListener('click', function () {
      scrollToIndex(getIndex() - 1)
    })

    nextBtn.addEventListener('click', function () {
      scrollToIndex(getIndex() + 1)
    })

    var raf = 0
    grid.addEventListener('scroll', function () {
      if (raf) return
      raf = window.requestAnimationFrame(function () {
        raf = 0
        setActive(getIndex())
      })
    })

    setActive(0)
  }

  function init(root) {
    var rootEl = root || document
    SELECTORS.forEach(function (sel) {
      setup(rootEl.querySelector(sel))
    })
  }

  function boot() {
    init()
  }

  boot()

  document.addEventListener('rk:ready', boot)

  window.addEventListener('resize', function () {
    SELECTORS.forEach(function (sel) {
      var grid = document.querySelector(sel)
      if (!grid) return
      if (!isMobile()) {
        teardown(grid)
        return
      }
      if (!grid.dataset.rkUspCarouselInit) {
        setup(grid)
      }
    })
  })
})()
