(function () {
  var IN_APP_RE =
    /FBAN|FBAV|Facebook|Instagram|Line\/|WhatsApp|Twitter|LinkedInApp|Snapchat|Pinterest|TikTok|BytedanceWebview|MicroMessenger|GSA\//i

  function isInAppBrowser() {
    return IN_APP_RE.test(navigator.userAgent || '')
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

  function useStatic(hero, video) {
    hero.classList.add('rk-hero--static-bg')
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

  function tryPlay(video) {
    var playPromise = video.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        /* Autoplay blocked — poster/static remains fine. */
      })
    }
  }

  function setupHero(hero) {
    var video = hero.querySelector('video.rk-hero-video')
    if (!video) return

    lockInline(video)

    if (!isMobileViewport() || preferStatic()) {
      useStatic(hero, video)
      return
    }

    tryPlay(video)
  }

  function boot() {
    document.querySelectorAll('.rk-hero').forEach(setupHero)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }

  document.addEventListener('rk:legacy-content', boot)
  document.addEventListener('rk:ready', boot)
})()
