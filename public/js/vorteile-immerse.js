(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  var desktopQuery = window.matchMedia('(min-width: 1024px)')
  var page = null
  var journey = null
  var pins = []
  var railDots = []
  var progressEl = null
  var heroImg = null
  var systemImg = null
  var axiom = null
  var rafId = null
  var dirty = false
  var activeIndex = -1
  var enabled = false

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n))
  }

  function progressThrough(el) {
    if (!el) return 0
    var rect = el.getBoundingClientRect()
    var vh = window.innerHeight || document.documentElement.clientHeight
    var total = rect.height + vh
    if (total <= 0) return 0
    return clamp((vh - rect.top) / total, 0, 1)
  }

  function setActive(index) {
    if (index === activeIndex) return
    activeIndex = index
    pins.forEach(function (pin, i) {
      pin.classList.toggle('is-active', i === index)
      pin.classList.toggle('is-leaving', i < index)
    })
    railDots.forEach(function (dot, i) {
      var on = i === index
      dot.classList.toggle('is-active', on)
      if (on) dot.setAttribute('aria-current', 'true')
      else dot.removeAttribute('aria-current')
    })
  }

  function updateJourney() {
    if (!journey || !pins.length) return

    if (!desktopQuery.matches || reducedMotion.matches) {
      pins.forEach(function (pin) {
        pin.classList.remove('is-active', 'is-leaving')
      })
      if (progressEl) progressEl.style.width = '0%'
      return
    }

    var vh = window.innerHeight || document.documentElement.clientHeight
    var best = 0
    var bestScore = -Infinity

    pins.forEach(function (pin, i) {
      var rect = pin.getBoundingClientRect()
      var mid = rect.top + rect.height * 0.35
      var score = 1 - Math.abs(mid - vh * 0.42) / vh
      if (score > bestScore) {
        bestScore = score
        best = i
      }
    })

    setActive(best)

    if (progressEl) {
      var p = progressThrough(journey)
      progressEl.style.width = (p * 100).toFixed(2) + '%'
    }
  }

  function updateParallax() {
    if (reducedMotion.matches) return
    var vh = window.innerHeight || document.documentElement.clientHeight

    if (heroImg) {
      var hero = heroImg.closest('[data-rk-vt-hero]')
      if (hero) {
        var rect = hero.getBoundingClientRect()
        if (rect.bottom > 0 && rect.top < vh) {
          var p = clamp(-rect.top / Math.max(rect.height, 1), 0, 1)
          heroImg.style.transform = 'translate3d(0,' + (p * 12).toFixed(2) + '%,0)'
        }
      }
    }

    if (systemImg) {
      var media = systemImg.closest('.rk-vt-system-media') || systemImg.closest('.rk-split-media')
      if (media) {
        var mRect = media.getBoundingClientRect()
        if (mRect.bottom > 0 && mRect.top < vh) {
          var mp = clamp((vh - mRect.top) / (vh + mRect.height), 0, 1)
          var scale = 1.08 - mp * 0.08
          var y = (mp - 0.5) * 18
          systemImg.style.transform =
            'translate3d(0,' + y.toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ')'
        }
      }
    }

    if (axiom && desktopQuery.matches) {
      axiom.classList.add('is-pinned')
    } else if (axiom) {
      axiom.classList.remove('is-pinned')
    }
  }

  function onFrame() {
    rafId = null
    if (!dirty) return
    dirty = false
    updateJourney()
    updateParallax()
  }

  function schedule() {
    dirty = true
    if (!rafId) rafId = requestAnimationFrame(onFrame)
  }

  function gotoPin(index) {
    var pin = pins[index]
    if (!pin) return
    var offset = -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rk-nav-h')) || 56) - 20
    var top = pin.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({
      top: top,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    })
  }

  function bindRail() {
    railDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = Number(dot.getAttribute('data-vt-goto') || '0')
        gotoPin(idx)
      })
    })
  }

  function destroy() {
    if (!enabled) return
    enabled = false
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (heroImg) heroImg.style.transform = ''
    if (systemImg) systemImg.style.transform = ''
    pins.forEach(function (pin) {
      pin.classList.remove('is-active', 'is-leaving')
    })
  }

  function boot() {
    destroy()
    page = document.querySelector('.rk-page-vorteile')
    if (!page) return

    journey = page.querySelector('[data-rk-vt-journey]')
    pins = Array.prototype.slice.call(page.querySelectorAll('[data-rk-vt-stack] > .rk-vt-pin'))
    railDots = Array.prototype.slice.call(page.querySelectorAll('[data-rk-vt-rail] [data-vt-goto]'))
    progressEl = page.querySelector('[data-rk-vt-progress]')
    heroImg = page.querySelector('[data-rk-vt-hero] [data-rk-vt-parallax]')
    systemImg = page.querySelector('[data-rk-vt-system] [data-rk-vt-parallax]')
    axiom = page.querySelector('[data-rk-vt-axiom]')

    bindRail()
    enabled = true
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    schedule()
  }

  window.__RK_BOOT_VORTEILE_IMMERSE = boot

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }

  document.addEventListener('rk:legacy-content', boot)
  document.addEventListener('rk:ready', boot)
})()
