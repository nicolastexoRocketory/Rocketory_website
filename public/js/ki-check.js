(function () {
  'use strict'

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  var TOTAL_STEPS = 5
  var ANALYZE_MS = 5200

  var USE_LABELS = {
    weiss_nicht: 'Ich weiß es nicht',
    bilder: 'KI-Bilder / Grafiken',
    texte: 'KI-Texte',
    chatbot: 'Chatbot / Assistent',
    keine: 'Keine KI erkennbar',
  }

  var LABEL_LABELS = {
    weiss_nicht: 'Ich weiß es nicht',
    ja: 'Ja, durchgängig',
    teilweise: 'Nur teilweise',
    nein: 'Nein',
    nicht_noetig: 'Nicht nötig',
  }

  var ANALYZE_STATUSES = [
    'URL und Seitenstruktur werden gelesen…',
    'Kennzeichnung von KI-Inhalten wird geprüft…',
    'Medien und Alternativtexte werden eingeordnet…',
    'Zugänglichkeit von Interaktionen wird gesichtet…',
    'Einschätzung wird vorbereitet…',
  ]

  function initKiCheck() {
    var form = document.getElementById('rkKiCheckForm')
    if (!form || form.dataset.rkKiBound === '1') return
    form.dataset.rkKiBound = '1'

    var steps = Array.prototype.slice.call(form.querySelectorAll('[data-step]'))
    var progressBar = document.getElementById('rkKiProgressBar')
    var progressEl = document.getElementById('rkKiProgress')
    var progressLabel = document.getElementById('rkKiProgressLabel')
    var progressWrap = document.getElementById('rkKiProgressWrap')
    var backBtn = document.getElementById('rkKiBack')
    var nextBtn = document.getElementById('rkKiNext')
    var startBtn = document.getElementById('rkKiStartAnalyze')
    var submitBtn = document.getElementById('rkKiSubmit')
    var actions = document.getElementById('rkKiActions')
    var success = document.getElementById('rkKiSuccess')
    var analyzingBar = document.getElementById('rkKiAnalyzingBar')
    var analyzingStatus = document.getElementById('rkKiAnalyzingStatus')
    var analyzingList = document.getElementById('rkKiAnalyzingList')
    var urlInput = document.getElementById('rkKiUrl')
    var nameInput = document.getElementById('rkKiName')
    var emailInput = document.getElementById('rkKiEmail')
    var phoneInput = document.getElementById('rkKiPhone')

    var current = 1
    var analyzeTimer = null
    var analyzeTick = null
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function pad(n) {
      return n < 10 ? '0' + n : String(n)
    }

    function clearErrors() {
      form.querySelectorAll('.rk-field-error').forEach(function (el) {
        el.textContent = ''
        el.classList.remove('is-visible')
      })
      form.querySelectorAll('.rk-field.is-error').forEach(function (el) {
        el.classList.remove('is-error')
      })
    }

    function showError(id, message, fieldEl) {
      var el = document.getElementById(id)
      if (el) {
        el.textContent = message
        el.classList.add('is-visible')
      }
      if (fieldEl && fieldEl.closest) {
        var wrap = fieldEl.closest('.rk-field')
        if (wrap) wrap.classList.add('is-error')
      }
    }

    function selectedUses() {
      return Array.prototype.slice
        .call(form.querySelectorAll('input[name="ki_use"]:checked'))
        .map(function (el) {
          return el.value
        })
    }

    function selectedLabel() {
      var el = form.querySelector('input[name="ki_label"]:checked')
      return el ? el.value : ''
    }

    function updateProgress() {
      var pct = Math.round((current / TOTAL_STEPS) * 100)
      if (progressBar) progressBar.style.width = pct + '%'
      if (progressEl) progressEl.setAttribute('aria-valuenow', String(pct))
      if (progressLabel) {
        progressLabel.innerHTML =
          '<span class="rk-form-progress-current">' + pad(current) + '</span> / ' + pad(TOTAL_STEPS)
      }
    }

    function showStep(step) {
      current = step
      steps.forEach(function (el) {
        var n = Number(el.getAttribute('data-step'))
        var active = n === step
        el.classList.toggle('is-active', active)
        el.hidden = !active
      })
      updateProgress()

      var analyzing = step === 4
      var lead = step === 5
      var urlStep = step === 3

      if (actions) actions.hidden = analyzing
      if (backBtn) backBtn.hidden = step === 1 || analyzing
      if (nextBtn) nextBtn.hidden = analyzing || lead || urlStep
      if (startBtn) startBtn.hidden = !urlStep
      if (submitBtn) submitBtn.hidden = !lead

      if (analyzing) startAnalyze()
    }

    function validateStep(step) {
      clearErrors()
      if (step === 1) {
        if (!selectedUses().length) {
          showError('rkKiUseError', 'Bitte mindestens eine Option wählen.')
          return false
        }
        return true
      }
      if (step === 2) {
        if (!selectedLabel()) {
          showError('rkKiLabelError', 'Bitte eine Option wählen.')
          return false
        }
        return true
      }
      if (step === 3) {
        var url = urlInput ? urlInput.value.trim() : ''
        if (!url) {
          showError('rkKiUrlError', 'Bitte gib eine Webseiten-URL ein.', urlInput)
          if (urlInput) urlInput.focus()
          return false
        }
        try {
          var parsed = new URL(url.indexOf('://') === -1 ? 'https://' + url : url)
          if (!parsed.hostname || parsed.hostname.indexOf('.') === -1) throw new Error('bad')
          if (urlInput) urlInput.value = parsed.href
        } catch (err) {
          showError(
            'rkKiUrlError',
            'Bitte gib eine gültige URL ein (z. B. https://deine-seite.de).',
            urlInput,
          )
          if (urlInput) urlInput.focus()
          return false
        }
        return true
      }
      if (step === 5) {
        var name = nameInput ? nameInput.value.trim() : ''
        var email = emailInput ? emailInput.value.trim() : ''
        if (!name) {
          showError('rkKiNameError', 'Bitte gib deinen Namen ein.', nameInput)
          if (nameInput) nameInput.focus()
          return false
        }
        if (!email || !EMAIL_RE.test(email)) {
          showError('rkKiEmailError', 'Bitte gib eine gültige E-Mail-Adresse ein.', emailInput)
          if (emailInput) emailInput.focus()
          return false
        }
        return true
      }
      return true
    }

    function clearAnalyzeTimers() {
      if (analyzeTimer) {
        window.clearTimeout(analyzeTimer)
        analyzeTimer = null
      }
      if (analyzeTick) {
        window.clearInterval(analyzeTick)
        analyzeTick = null
      }
    }

    function startAnalyze() {
      clearAnalyzeTimers()
      var phase = 0
      if (analyzingBar) analyzingBar.style.width = reducedMotion ? '100%' : '8%'
      if (analyzingStatus) analyzingStatus.textContent = ANALYZE_STATUSES[0]
      if (analyzingList) {
        analyzingList.querySelectorAll('li').forEach(function (li) {
          li.classList.remove('is-done', 'is-active')
        })
        var first = analyzingList.querySelector('li[data-phase="0"]')
        if (first) first.classList.add('is-active')
      }

      if (reducedMotion) {
        analyzeTimer = window.setTimeout(function () {
          showStep(5)
        }, 600)
        return
      }

      analyzeTick = window.setInterval(function () {
        phase += 1
        var pct = Math.min(92, 8 + phase * 22)
        if (analyzingBar) analyzingBar.style.width = pct + '%'
        if (analyzingStatus) {
          analyzingStatus.textContent =
            ANALYZE_STATUSES[Math.min(phase, ANALYZE_STATUSES.length - 1)]
        }
        if (analyzingList) {
          analyzingList.querySelectorAll('li').forEach(function (li) {
            var p = Number(li.getAttribute('data-phase'))
            li.classList.toggle('is-done', p < phase)
            li.classList.toggle('is-active', p === phase)
          })
        }
      }, 900)

      analyzeTimer = window.setTimeout(function () {
        clearAnalyzeTimers()
        if (analyzingBar) analyzingBar.style.width = '100%'
        if (analyzingList) {
          analyzingList.querySelectorAll('li').forEach(function (li) {
            li.classList.add('is-done')
            li.classList.remove('is-active')
          })
        }
        window.setTimeout(function () {
          showStep(5)
        }, 320)
      }, ANALYZE_MS)
    }

    function buildMessage() {
      var uses = selectedUses()
        .map(function (v) {
          return USE_LABELS[v] || v
        })
        .join(', ')
      var label = LABEL_LABELS[selectedLabel()] || selectedLabel()
      var url = urlInput ? urlInput.value.trim() : ''
      return (
        'KI-Check Anfrage\n' +
        'Webseite: ' +
        url +
        '\n' +
        'KI-Einsatz: ' +
        uses +
        '\n' +
        'Kennzeichnung: ' +
        label +
        '\n\n' +
        'Bitte Rückmeldung zum KI-Check senden.'
      )
    }

    function setupExclusive() {
      var boxes = form.querySelectorAll('input[name="ki_use"]')
      boxes.forEach(function (box) {
        box.addEventListener('change', function () {
          if (!box.checked) return
          if (box.getAttribute('data-exclusive') === 'true') {
            boxes.forEach(function (other) {
              if (other !== box) other.checked = false
            })
          } else {
            boxes.forEach(function (other) {
              if (other.getAttribute('data-exclusive') === 'true') other.checked = false
            })
          }
          clearErrors()
        })
      })
    }

    setupExclusive()
    showStep(1)

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (!validateStep(current)) return
        showStep(Math.min(current + 1, TOTAL_STEPS))
      })
    }

    if (startBtn) {
      startBtn.addEventListener('click', function () {
        if (!validateStep(3)) return
        showStep(4)
      })
    }

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (current <= 1 || current === 4) return
        clearAnalyzeTimers()
        showStep(Math.max(current - 1, 1))
      })
    }

    form.querySelectorAll('input[name="ki_label"]').forEach(function (radio) {
      radio.addEventListener('change', clearErrors)
    })

    ;[urlInput, nameInput, emailInput].forEach(function (input) {
      if (!input) return
      input.addEventListener('input', clearErrors)
    })

    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return
      if (e.target && e.target.tagName === 'TEXTAREA') return
      if (current === 4) return
      e.preventDefault()
      if (current === 3) {
        if (startBtn) startBtn.click()
        return
      }
      if (current === 5) {
        form.requestSubmit()
        return
      }
      if (nextBtn) nextBtn.click()
    })

    form.addEventListener('submit', function (e) {
      e.preventDefault()
      if (!validateStep(5)) return

      var name = nameInput.value.trim()
      var email = emailInput.value.trim()
      var phone = phoneInput ? phoneInput.value.trim() : ''
      var url = urlInput ? urlInput.value.trim() : ''
      var uses = selectedUses()
      var label = selectedLabel()

      if (submitBtn) submitBtn.disabled = true
      var ctaLabel = submitBtn && submitBtn.querySelector('.rk-dot-cta-label')
      if (ctaLabel) ctaLabel.textContent = 'Wird gesendet …'

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'ki-check',
          intentLabel: 'KI-Check',
          detailSummary:
            'URL: ' +
            url +
            ' · KI: ' +
            uses
              .map(function (v) {
                return USE_LABELS[v] || v
              })
              .join(', ') +
            ' · Kennzeichnung: ' +
            (LABEL_LABELS[label] || label),
          message: buildMessage(),
          name: name,
          email: email,
          phone: phone,
          projectBrief: url,
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data }
          })
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error((result.data && result.data.error) || 'Senden fehlgeschlagen.')
          }
          form.classList.add('is-submitted')
          if (progressWrap) progressWrap.hidden = true
          if (actions) actions.hidden = true
          if (ctaLabel) ctaLabel.textContent = 'Gesendet ✓'
          if (success) success.classList.add('is-visible')
        })
        .catch(function (err) {
          if (submitBtn) submitBtn.disabled = false
          if (ctaLabel) ctaLabel.textContent = 'Rückmeldung anfordern'
          showError(
            'rkKiEmailError',
            err.message || 'Senden fehlgeschlagen. Bitte später erneut versuchen.',
          )
        })
    })
  }

  initKiCheck()
  document.addEventListener('rk:ready', initKiCheck)
  document.addEventListener('rk:legacy-content', initKiCheck)
})()
