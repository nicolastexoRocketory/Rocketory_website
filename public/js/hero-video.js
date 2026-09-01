(function () {
  var IN_APP_RE =
    /WhatsApp\/|FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|LinkedInApp|Snapchat|Pinterest|TikTok|BytedanceWebview|MicroMessenger|GSA\/|; wv\)/i

  function isInAppBrowser() {
    if (document.documentElement.classList.contains('is-in-app-browser')) return true
    var ua = navigator.userAgent || ''
    var ref = document.referrer || ''
    return (
      IN_APP_RE.test(ua) ||
      /whatsapp|instagram|facebook|fb\.com/i.test(ref)
    )
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 768px)').matches
  }

  function preferStatic() {
    return (
      isInAppBrowser() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }

  function lockInline(video) {
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('x5-playsinline', '')
    video.setAttribute('x5-video-player-type', 'h5')
    video.setAttribute('x5-video-player-fullscreen', 'false')
    video.setAttribute('disablepictureinpicture', '')
    video.playsInline = true
    video.muted = true
    video.defaultMuted = true
    video.controls = false

    function exitNativeFullscreen() {
      try {
        if (typeof video.webkitExitFullscreen === 'function') {
          video.webkitExitFullscreen()
        } else if (typeof video.webkitExitFullScreen === 'function') {
          video.webkitExitFullScreen()
        } else if (document.fullscreenElement === video && document.exitFullscreen) {
          document.exitFullscreen()
        }
      } catch (e) {
        /* ignore */
      }
    }

    ;[
      'webkitbeginfullscreen',
      'webkitfullscreenchange',
      'fullscreenchange',
    ].forEach(function (type) {
      video.addEventListener(type, exitNativeFullscreen)
    })
  }

  function stripVideo(video) {
    video.pause()
    video.removeAttribute('autoplay')
    video.removeAttribute('src')
    video.querySelectorAll('source').forEach(function (source) {
      source.removeAttribute('src')
    })
    try {
      video.load()
    } catch (e) {
      /* ignore */
    }
  }

  function useStatic(container, video, staticClass) {
    if (isInAppBrowser()) {
      document.documentElement.classList.add('is-in-app-browser')
    }
    container.classList.add(staticClass)
    stripVideo(video)
  }

  function tryPlay(video) {
    var playPromise = video.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        /* Autoplay blocked — poster/static remains fine. */
      })
    }
  }

  function primeVideo(video) {
    if (video.querySelector('source[src]') && !video.getAttribute('src')) {
      var source = video.querySelector('source[src]')
      if (source) video.setAttribute('src', source.getAttribute('src'))
    }
    video.setAttribute('preload', 'metadata')
  }

  function setupHero(hero) {
    var video = hero.querySelector('video.rk-hero-video')
    if (!video) return

    lockInline(video)

    if (!isMobileViewport() || preferStatic()) {
      useStatic(hero, video, 'rk-hero--static-bg')
      return
    }

    primeVideo(video)
    tryPlay(video)
  }

  function setupBentoVideo(cell) {
    var video = cell.querySelector('video.rk-home-bento-video')
    if (!video) return

    lockInline(video)

    if (preferStatic()) {
      useStatic(cell, video, 'rk-home-bento--static-bg')
      return
    }

    primeVideo(video)
    tryPlay(video)
  }

  function boot() {
    document.querySelectorAll('.rk-hero').forEach(setupHero)
    document.querySelectorAll('.rk-home-bento-cell--video').forEach(setupBentoVideo)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }

  document.addEventListener('rk:legacy-content', boot)
  document.addEventListener('rk:ready', boot)
})()
