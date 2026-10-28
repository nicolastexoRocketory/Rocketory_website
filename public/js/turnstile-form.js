(function () {
  'use strict'

  var SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  var scriptPromise = null
  var settingsPromise = null

  function loadScript() {
    if (window.turnstile) return Promise.resolve()
    if (scriptPromise) return scriptPromise

    scriptPromise = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-rk-turnstile]')
      if (existing) {
        existing.addEventListener('load', function () {
          resolve()
        })
        existing.addEventListener('error', function () {
          reject(new Error('Turnstile konnte nicht geladen werden.'))
        })
        return
      }

      var script = document.createElement('script')
      script.src = SCRIPT_URL
      script.async = true
      script.defer = true
      script.dataset.rkTurnstile = '1'
      script.onload = function () {
        resolve()
      }
      script.onerror = function () {
        scriptPromise = null
        reject(new Error('Turnstile konnte nicht geladen werden.'))
      }
      document.head.appendChild(script)
    })

    return scriptPromise
  }

  function loadSettings() {
    if (settingsPromise) return settingsPromise
    settingsPromise = fetch('/api/form-settings', { credentials: 'same-origin' })
      .then(function (res) {
        return res.json()
      })
      .catch(function () {
        return {
          kontakt: { siteKey: '', enabled: false },
          kiCheck: { siteKey: '', enabled: false },
        }
      })
    return settingsPromise
  }

  /**
   * @param {HTMLElement|null} container
   * @param {'kontakt'|'kiCheck'} formKey
   * @returns {Promise<{ enabled: boolean, getToken: function(): string, reset: function(): void }>}
   */
  function mount(container, formKey) {
    if (!container) {
      return Promise.resolve({
        enabled: false,
        getToken: function () {
          return ''
        },
        reset: function () {},
      })
    }

    return loadSettings().then(function (settings) {
      var cfg = (settings && settings[formKey]) || { siteKey: '', enabled: false }
      if (!cfg.enabled || !cfg.siteKey) {
        container.hidden = true
        container.innerHTML = ''
        return {
          enabled: false,
          getToken: function () {
            return ''
          },
          reset: function () {},
        }
      }

      container.hidden = false
      container.innerHTML = ''

      return loadScript().then(function () {
        var widgetId = null
        var token = ''

        widgetId = window.turnstile.render(container, {
          sitekey: cfg.siteKey,
          theme: 'light',
          callback: function (value) {
            token = value || ''
          },
          'expired-callback': function () {
            token = ''
          },
          'error-callback': function () {
            token = ''
          },
        })

        return {
          enabled: true,
          getToken: function () {
            if (token) return token
            if (widgetId != null && window.turnstile && window.turnstile.getResponse) {
              return window.turnstile.getResponse(widgetId) || ''
            }
            return ''
          },
          reset: function () {
            token = ''
            if (widgetId != null && window.turnstile && window.turnstile.reset) {
              window.turnstile.reset(widgetId)
            }
          },
        }
      })
    })
  }

  window.rkTurnstileForm = {
    mount: mount,
    loadSettings: loadSettings,
  }
})()
