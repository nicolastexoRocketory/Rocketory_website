(function () {
  var WARTUNG_MONTHLY_DISCOUNT = 25;
  var MINIMUM_MONTHS = 24;

  var PRICING = {
    html: {
      klein: 2800,
      gross: 4200,
      wartung: 50,
      focus: 'Hosting, Performance, Text-Updates',
    },
    wp: {
      klein: 4500,
      gross: 6500,
      wartung: 150,
      focus: 'Plugins, Security, Backups',
    },
    np: {
      klein: 8500,
      gross: 12500,
      wartung: 250,
      focus: 'System-Updates, DevOps, Datenbank',
    },
  };

  function formatEuro(value) {
    return value.toLocaleString('de-DE') + ' €';
  }

  function monthlyWebseite(einmal) {
    return Math.round(einmal / MINIMUM_MONTHS);
  }

  function monthlyWartung(wartung) {
    return Math.max(0, wartung - WARTUNG_MONTHLY_DISCOUNT);
  }

  function completeOnceCompare(einmal, wartungOnce) {
    return einmal + MINIMUM_MONTHS * wartungOnce;
  }

  function setPriceHtml(el, value, suffix) {
    if (!el) return;
    el.innerHTML = formatEuro(value) + (suffix ? '<sub> ' + suffix + '</sub>' : '');
  }

  function setOnceCompare(el, value) {
    if (!el) return;
    el.textContent = '(' + formatEuro(value) + ')';
  }

  function setOnceCompareAll(list, selector, value) {
    list.querySelectorAll(selector).forEach(function (el) {
      setOnceCompare(el, value);
    });
  }

  function updatePricing() {
    var list = document.getElementById('rkPlanList');
    if (!list) return;

    var tech = list.getAttribute('data-rk-pricing-tech') || 'html';
    var data = PRICING[tech];
    if (!data) return;

    var wartungOnce = data.wartung;
    var wartungMonthly = monthlyWartung(wartungOnce);

    setPriceHtml(list.querySelector('[data-rk-price-klein-once]'), data.klein, 'netto');
    setPriceHtml(list.querySelector('[data-rk-price-gross-once]'), data.gross, 'netto');

    setOnceCompareAll(list, '[data-rk-price-klein-once-compare]', data.klein);
    setOnceCompareAll(list, '[data-rk-price-gross-once-compare]', data.gross);
    setOnceCompareAll(
      list,
      '[data-rk-price-klein-total-once-compare]',
      completeOnceCompare(data.klein, wartungOnce),
    );
    setOnceCompareAll(
      list,
      '[data-rk-price-gross-total-once-compare]',
      completeOnceCompare(data.gross, wartungOnce),
    );

    var kleinMonthlyNet = monthlyWebseite(data.klein);
    var grossMonthlyNet = monthlyWebseite(data.gross);

    setPriceHtml(list.querySelector('[data-rk-price-klein-monthly-net]'), kleinMonthlyNet, '/ Monat');
    setPriceHtml(
      list.querySelector('[data-rk-price-klein-monthly-total]'),
      kleinMonthlyNet + wartungMonthly,
      '/ Monat',
    );
    setPriceHtml(list.querySelector('[data-rk-price-gross-monthly-net]'), grossMonthlyNet, '/ Monat');
    setPriceHtml(
      list.querySelector('[data-rk-price-gross-monthly-total]'),
      grossMonthlyNet + wartungMonthly,
      '/ Monat',
    );

    list.querySelectorAll('[data-rk-wartung-once-amount]').forEach(function (el) {
      el.textContent = formatEuro(wartungOnce);
    });
    list.querySelectorAll('[data-rk-wartung-monthly-amount]').forEach(function (el) {
      el.textContent = formatEuro(wartungMonthly);
    });
    list.querySelectorAll('[data-rk-wartung-focus]').forEach(function (el) {
      el.textContent = data.focus;
    });
  }

  function setTech(tech) {
    var list = document.getElementById('rkPlanList');
    if (!list) return;

    list.setAttribute('data-rk-pricing-tech', tech);
    document.querySelectorAll('[data-rk-pricing-tech-tab]').forEach(function (btn) {
      var active = btn.getAttribute('data-rk-pricing-tech-tab') === tech;
      btn.classList.toggle('rk-plan-toggle-label--active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    updatePricing();
  }

  function init() {
    var list = document.getElementById('rkPlanList');
    if (!list) return;

    document.querySelectorAll('[data-rk-pricing-tech-tab]').forEach(function (btn) {
      if (btn.dataset.rkPricingBound) return;
      btn.dataset.rkPricingBound = '1';
      btn.addEventListener('click', function () {
        setTech(btn.getAttribute('data-rk-pricing-tech-tab'));
      });
    });

    if (!list.dataset.rkPricingObserved) {
      list.dataset.rkPricingObserved = '1';
      new MutationObserver(updatePricing).observe(list, {
        attributes: true,
        attributeFilter: ['data-rk-price-mode', 'data-rk-pricing-tech'],
      });
    }

    updatePricing();
  }

  document.addEventListener('rk:ready', init);
  document.addEventListener('rk:legacy-content', init);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
