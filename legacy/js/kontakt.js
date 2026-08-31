(function () {
  window.sendPrompt = function () {
    var target = document.getElementById('kontakt-form');
    if (!target) return;
    if (window.rkSmoothScrollTo) {
      window.rkSmoothScrollTo(target);
      return;
    }
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  };

  function initContactForm() {
    var form = document.getElementById('rkContactForm');
    var success = document.getElementById('rkFormSuccess');
    if (!form || form.dataset.rkKontaktBound === '1') return;
    form.dataset.rkKontaktBound = '1';

  var TOTAL_STEPS = 6;
  var currentStep = 1;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var progressBar = document.getElementById('rkFormProgressBar');
  var progressEl = document.getElementById('rkFormProgress');
  var progressLabel = document.getElementById('rkFormProgressLabel');
  var backBtn = document.getElementById('rkFormBack');
  var nextBtn = document.getElementById('rkFormNext');
  var submitBtn = document.getElementById('rkFormSubmit');
  var summaryEl = document.getElementById('rkFormSummary');

  var INTENT_LABELS = {
    individuell: 'Individuelles Projekt',
    festpreis: 'Festpreiswebsite',
    seo: 'Suchmaschinenoptimierung (SEO)',
    redesign: 'Webseite ReDesign oder ReLaunch',
    beratung: 'Hierzu brauche ich Beratung'
  };

  var fields = {
    projectBrief: document.getElementById('rkProjectBrief'),
    projectPages: document.getElementById('rkProjectPages'),
    projectTimeline: document.getElementById('rkProjectTimeline'),
    name: document.getElementById('rkName'),
    company: document.getElementById('rkCompany'),
    email: document.getElementById('rkEmail'),
    phone: document.getElementById('rkPhone'),
    message: document.getElementById('rkMessage'),
    referral: document.getElementById('rkReferral')
  };

  var errors = {
    intent: document.getElementById('rkIntentError'),
    festpreis: document.getElementById('rkFestpreisError'),
    festpreisTech: document.getElementById('rkFestpreisTechError'),
    seo: document.getElementById('rkSeoError'),
    redesign: document.getElementById('rkRedesignError'),
    budget: document.getElementById('rkBudgetError'),
    projectBrief: document.getElementById('rkProjectBriefError'),
    name: document.getElementById('rkNameError'),
    email: document.getElementById('rkEmailError'),
    message: document.getElementById('rkMessageError')
  };

  function getIntent() {
    var checked = form.querySelector('input[name="intent"]:checked');
    return checked ? checked.value : '';
  }

  function skipsDetailStep() {
    return getIntent() === 'beratung';
  }

  function getStepEl(step) {
    if (step === 2) {
      var intent = getIntent();
      if (!intent || skipsDetailStep()) return null;
      return form.querySelector('.rk-form-step[data-step="2"][data-branch="' + intent + '"]');
    }
    return form.querySelector('.rk-form-step[data-step="' + step + '"]:not([data-branch])');
  }

  function resolveStep(step, direction) {
    if (step === 2 && skipsDetailStep()) {
      return direction > 0 ? 3 : 1;
    }
    return step;
  }

  function getCheckedValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : '';
  }

  function getIntentLabel() {
    return INTENT_LABELS[getIntent()] || getIntent();
  }

  function festpreisNeedsTech() {
    var paket = getCheckedValue('festpreis_paket');
    return paket === 'Smart' || paket === 'Business';
  }

  function shouldAutoAdvance() {
    return window.matchMedia('(min-width:769px)').matches;
  }

  function scheduleAdvance(fromStep) {
    window.setTimeout(function () {
      if (currentStep !== fromStep) return;
      advanceFromStep(fromStep);
    }, 280);
  }

  function toggleFestpreisTech() {
    var techWrap = document.getElementById('rkFestpreisTech');
    if (!techWrap) return;
    var needsTech = festpreisNeedsTech();
    techWrap.hidden = !needsTech;
    if (!needsTech) {
      form.querySelectorAll('input[name="festpreis_tech"]').forEach(function (radio) {
        radio.checked = false;
      });
      if (errors.festpreisTech) {
        errors.festpreisTech.textContent = '';
        errors.festpreisTech.classList.remove('is-visible');
      }
    }
  }

  function getDetailSummary() {
    var intent = getIntent();
    if (intent === 'festpreis') {
      var paket = getCheckedValue('festpreis_paket');
      var tech = getCheckedValue('festpreis_tech');
      if (festpreisNeedsTech() && tech) {
        return paket + ' · ' + tech;
      }
      return paket;
    }
    if (intent === 'seo') {
      return getCheckedValue('seo_laufzeit');
    }
    if (intent === 'redesign') {
      return getCheckedValue('redesign_typ');
    }
    if (intent === 'individuell') {
      var parts = [];
      var brief = fields.projectBrief && fields.projectBrief.value.trim();
      if (brief) parts.push(brief);
      if (fields.projectPages && fields.projectPages.value) {
        parts.push('Umfang: ' + fields.projectPages.value);
      }
      if (fields.projectTimeline && fields.projectTimeline.value) {
        parts.push('Start: ' + fields.projectTimeline.value);
      }
      return parts.join(' · ');
    }
    return '';
  }

  function clearErrors() {
    Object.keys(errors).forEach(function (key) {
      if (errors[key]) {
        errors[key].textContent = '';
        errors[key].classList.remove('is-visible');
      }
    });
    form.querySelectorAll('.rk-field.is-error').forEach(function (el) {
      el.classList.remove('is-error');
    });
  }

  function showError(fieldKey, message) {
    var map = {
      projectBrief: fields.projectBrief,
      name: fields.name,
      email: fields.email,
      message: fields.message
    };
    if (map[fieldKey] && map[fieldKey].closest('.rk-field')) {
      map[fieldKey].closest('.rk-field').classList.add('is-error');
    }
    if (errors[fieldKey]) {
      errors[fieldKey].textContent = message;
      errors[fieldKey].classList.add('is-visible');
    }
  }

  function showBranchError(intent, message) {
    if (errors[intent]) {
      errors[intent].textContent = message;
      errors[intent].classList.add('is-visible');
    }
    var firstRadio = form.querySelector(
      '.rk-form-step[data-branch="' + intent + '"] input[type="radio"]'
    );
    if (firstRadio) firstRadio.focus();
  }

  function validateStep(step) {
    clearErrors();
    if (step === 1) {
      if (!getIntent()) {
        if (errors.intent) {
          errors.intent.textContent = 'Bitte wähle dein Anliegen.';
          errors.intent.classList.add('is-visible');
        }
        var firstIntent = form.querySelector('input[name="intent"]');
        if (firstIntent) firstIntent.focus();
        return false;
      }
      return true;
    }
    if (step === 2) {
      var intent = getIntent();
      if (intent === 'festpreis' && !getCheckedValue('festpreis_paket')) {
        showBranchError('festpreis', 'Bitte wähle ein Paket.');
        return false;
      }
      if (intent === 'festpreis' && festpreisNeedsTech() && !getCheckedValue('festpreis_tech')) {
        if (errors.festpreisTech) {
          errors.festpreisTech.textContent = 'Bitte wähle eine Technologie (HTML, WordPress oder Next.js & Payload).';
          errors.festpreisTech.classList.add('is-visible');
        }
        var firstTech = form.querySelector('input[name="festpreis_tech"]');
        if (firstTech) firstTech.focus();
        return false;
      }
      if (intent === 'seo' && !getCheckedValue('seo_laufzeit')) {
        showBranchError('seo', 'Bitte wähle eine Laufzeit.');
        return false;
      }
      if (intent === 'redesign' && !getCheckedValue('redesign_typ')) {
        showBranchError('redesign', 'Bitte wähle ReDesign oder ReLaunch.');
        return false;
      }
      if (intent === 'individuell') {
        if (!fields.projectBrief || !fields.projectBrief.value.trim()) {
          showError('projectBrief', 'Bitte beschreibe kurz dein Projekt.');
          if (fields.projectBrief) fields.projectBrief.focus();
          return false;
        }
      }
      return true;
    }
    if (step === 3) {
      if (!getCheckedValue('budget')) {
        if (errors.budget) {
          errors.budget.textContent = 'Bitte wähle einen Budgetrahmen.';
          errors.budget.classList.add('is-visible');
        }
        var firstBudget = form.querySelector('input[name="budget"]');
        if (firstBudget) firstBudget.focus();
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!fields.name.value.trim()) {
        showError('name', 'Bitte gib deinen Namen ein.');
        fields.name.focus();
        return false;
      }
      return true;
    }
    if (step === 5) {
      var email = fields.email.value.trim();
      if (!email) {
        showError('email', 'Bitte gib deine E-Mail-Adresse ein.');
        fields.email.focus();
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Bitte gib eine gültige E-Mail-Adresse ein.');
        fields.email.focus();
        return false;
      }
      return true;
    }
    if (step === 6) {
      if (!fields.message.value.trim()) {
        showError('message', 'Bitte beschreibe kurz dein Anliegen.');
        fields.message.focus();
        return false;
      }
      return true;
    }
    return true;
  }

  function buildSummary() {
    if (!summaryEl) return;
    var intentLabel = getIntentLabel();
    var detail = getDetailSummary();
    var budget = getCheckedValue('budget');
    var phone = fields.phone.value.trim();
    summaryEl.innerHTML =
      '<dl>' +
      '<dt>Anliegen</dt><dd><strong>' + escapeHtml(intentLabel) + '</strong></dd>' +
      (detail ? '<dt>Details</dt><dd>' + escapeHtml(detail) + '</dd>' : '') +
      (budget ? '<dt>Budget</dt><dd>' + escapeHtml(budget) + '</dd>' : '') +
      '<dt>Name</dt><dd>' + escapeHtml(fields.name.value.trim()) + '</dd>' +
      (fields.company.value.trim()
        ? '<dt>Unternehmen</dt><dd>' + escapeHtml(fields.company.value.trim()) + '</dd>'
        : '') +
      '<dt>E-Mail</dt><dd>' + escapeHtml(fields.email.value.trim()) + '</dd>' +
      (phone ? '<dt>Telefon</dt><dd>' + escapeHtml(phone) + '</dd>' : '') +
      (fields.referral && fields.referral.value
        ? '<dt>Von uns erfahren über</dt><dd>' + escapeHtml(fields.referral.value) + '</dd>'
        : '') +
      '</dl>';
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateUI() {
    var progress = (currentStep / TOTAL_STEPS) * 100;
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressEl) progressEl.setAttribute('aria-valuenow', String(Math.round(progress)));
    if (progressLabel) {
      progressLabel.innerHTML =
        '<span class="rk-form-progress-current">' +
        String(currentStep).padStart(2, '0') +
        '</span> / ' +
        String(TOTAL_STEPS).padStart(2, '0');
    }

    if (backBtn) backBtn.hidden = currentStep === 1;
    if (nextBtn) nextBtn.hidden = currentStep === TOTAL_STEPS;
    if (submitBtn) submitBtn.hidden = currentStep !== TOTAL_STEPS;

    if (currentStep === TOTAL_STEPS) buildSummary();
  }

  function hideBranchSteps() {
    form.querySelectorAll('.rk-form-step[data-branch]').forEach(function (el) {
      el.hidden = true;
      el.classList.remove('is-active', 'is-leaving');
    });
  }

  function focusStepField(stepEl) {
    if (!stepEl) return;
    var checkedRadio = stepEl.querySelector('input[type="radio"]:checked');
    if (checkedRadio) {
      checkedRadio.focus();
      return;
    }
    var firstRadio = stepEl.querySelector('input[type="radio"]');
    if (firstRadio) {
      firstRadio.focus();
      return;
    }
    var focusTarget = stepEl.querySelector('input:not([type="radio"]), textarea, select');
    if (focusTarget) focusTarget.focus();
  }

  function goToStep(nextStep) {
    var direction = nextStep > currentStep ? 1 : -1;
    nextStep = resolveStep(nextStep, direction);
    if (nextStep < 1 || nextStep > TOTAL_STEPS) return;

    var fromEl = getStepEl(currentStep);
    var toEl = getStepEl(nextStep);
    if (!fromEl || !toEl) return;

    var goingForward = nextStep > currentStep;
    if (goingForward && !validateStep(currentStep)) return;

    if (nextStep !== 2) hideBranchSteps();

    if (reducedMotion) {
      fromEl.classList.remove('is-active');
      fromEl.hidden = true;
      toEl.hidden = false;
      toEl.classList.add('is-active');
    } else {
      fromEl.classList.remove('is-active');
      fromEl.classList.add('is-leaving');
      toEl.hidden = false;
      toEl.classList.add('is-active');

      window.setTimeout(function () {
        fromEl.classList.remove('is-leaving');
        fromEl.hidden = true;
      }, 350);
    }

    currentStep = nextStep;
    updateUI();
    clearErrors();
    if (currentStep === 2 && getIntent() === 'festpreis') toggleFestpreisTech();
    focusStepField(toEl);
  }

  function advanceFromStep(step) {
    var next = step + 1;
    if (step === 1 && skipsDetailStep()) next = 3;
    goToStep(next);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      advanceFromStep(currentStep);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      var prev = currentStep - 1;
      if (currentStep === 3 && skipsDetailStep()) prev = 1;
      goToStep(prev);
    });
  }

  form.querySelectorAll('input[name="intent"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (errors.intent) {
        errors.intent.textContent = '';
        errors.intent.classList.remove('is-visible');
      }
    });
    radio.addEventListener('click', function () {
      if (errors.intent) {
        errors.intent.textContent = '';
        errors.intent.classList.remove('is-visible');
      }
      if (currentStep !== 1 || !shouldAutoAdvance()) return;
      scheduleAdvance(1);
    });
  });

  ['festpreis_paket', 'seo_laufzeit', 'redesign_typ', 'festpreis_tech'].forEach(function (groupName) {
    form.querySelectorAll('input[name="' + groupName + '"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var intent =
          groupName === 'festpreis_paket' || groupName === 'festpreis_tech'
            ? 'festpreis'
            : groupName === 'seo_laufzeit'
              ? 'seo'
              : 'redesign';
        if (groupName === 'festpreis_paket') {
          toggleFestpreisTech();
        }
        if (errors[intent]) {
          errors[intent].textContent = '';
          errors[intent].classList.remove('is-visible');
        }
        if (groupName === 'festpreis_tech' && errors.festpreisTech) {
          errors.festpreisTech.textContent = '';
          errors.festpreisTech.classList.remove('is-visible');
        }
      });
      radio.addEventListener('click', function () {
        var intent =
          groupName === 'festpreis_paket' || groupName === 'festpreis_tech'
            ? 'festpreis'
            : groupName === 'seo_laufzeit'
              ? 'seo'
              : 'redesign';
        if (groupName === 'festpreis_paket') {
          toggleFestpreisTech();
        }
        if (errors[intent]) {
          errors[intent].textContent = '';
          errors[intent].classList.remove('is-visible');
        }
        if (groupName === 'festpreis_tech' && errors.festpreisTech) {
          errors.festpreisTech.textContent = '';
          errors.festpreisTech.classList.remove('is-visible');
        }
        if (currentStep !== 2 || !shouldAutoAdvance()) return;
        if (groupName === 'festpreis_paket' && festpreisNeedsTech()) return;
        scheduleAdvance(2);
      });
    });
  });

  form.querySelectorAll('input[name="budget"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (errors.budget) {
        errors.budget.textContent = '';
        errors.budget.classList.remove('is-visible');
      }
    });
    radio.addEventListener('click', function () {
      if (errors.budget) {
        errors.budget.textContent = '';
        errors.budget.classList.remove('is-visible');
      }
      if (currentStep !== 3 || !shouldAutoAdvance()) return;
      scheduleAdvance(3);
    });
  });

  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.tagName === 'TEXTAREA') return;
    if (currentStep < TOTAL_STEPS) {
      e.preventDefault();
      advanceFromStep(currentStep);
    }
  });

  [fields.projectBrief, fields.name, fields.email, fields.message].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      var key = input.id.replace('rk', '');
      key = key.charAt(0).toLowerCase() + key.slice(1);
      if (errors[key]) {
        errors[key].classList.remove('is-visible');
        var fieldWrap = input.closest('.rk-field');
        if (fieldWrap) fieldWrap.classList.remove('is-error');
      }
    });
  });

  if (fields.referral) {
    fields.referral.addEventListener('change', function () {
      if (currentStep === TOTAL_STEPS) buildSummary();
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(6)) return;

    var name = fields.name.value.trim();
    var company = fields.company.value.trim();
    var email = fields.email.value.trim();
    var phone = fields.phone.value.trim();
    var intentLabel = getIntentLabel();
    var detail = getDetailSummary();
    var budget = getCheckedValue('budget');
    var message = fields.message.value.trim();
    var referral = fields.referral && fields.referral.value ? fields.referral.value : '';

    if (submitBtn) submitBtn.disabled = true;
    var label = submitBtn && submitBtn.querySelector('.rk-dot-cta-label');
    if (label) label.textContent = 'Wird gesendet …';

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: getIntent(),
        intentLabel: intentLabel,
        detailSummary: detail,
        budget: budget,
        message: message,
        name: name,
        company: company,
        email: email,
        phone: phone,
        referral: referral,
        projectBrief: fields.projectBrief ? fields.projectBrief.value.trim() : '',
        projectPages: fields.projectPages ? fields.projectPages.value : '',
        projectTimeline: fields.projectTimeline ? fields.projectTimeline.value : '',
        festpreisPaket: getCheckedValue('festpreis_paket'),
        festpreisTech: getCheckedValue('festpreis_tech'),
        seoLaufzeit: getCheckedValue('seo_laufzeit'),
        redesignTyp: getCheckedValue('redesign_typ')
      })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error((result.data && result.data.error) || 'Senden fehlgeschlagen.');
        }

        form.classList.add('is-submitted');
        if (label) label.textContent = 'Gesendet ✓';
        if (success) success.classList.add('is-visible');
      })
      .catch(function (err) {
        if (submitBtn) submitBtn.disabled = false;
        if (label) label.textContent = 'Anfrage absenden';
        showError('message', err.message || 'Senden fehlgeschlagen. Bitte versuche es später erneut.');
      });
  });

  updateUI();
  }

  initContactForm();
  document.addEventListener('rk:ready', initContactForm);
  document.addEventListener('rk:legacy-content', initContactForm);
})();
