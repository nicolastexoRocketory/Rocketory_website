(function () {
  var MOBILE_MQ = window.matchMedia('(max-width: 768px)');

  function getPerView() {
    return MOBILE_MQ.matches ? 1 : 3;
  }

  function initBlogSlider() {
    var root = document.querySelector('[data-rk-blog-slider]');
    if (!root || root.dataset.rkBlogSliderReady === '1') return;

    var viewport = root.querySelector('.rk-featured-slider-viewport');
    var track = root.querySelector('[data-rk-blog-slider-track]');
    var dotsWrap = root.querySelector('[data-rk-blog-slider-dots]');
    var prevBtn = root.querySelector('[data-rk-blog-slider-prev]');
    var nextBtn = root.querySelector('[data-rk-blog-slider-next]');
    var countEl = root.querySelector('[data-rk-blog-slider-count]');
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-rk-blog-slide]'));
    var index = 0;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dots = [];

    if (!viewport || !track || !dotsWrap || !slides.length) return;

    function getPageCount() {
      return Math.max(1, Math.ceil(slides.length / getPerView()));
    }

    function layoutSlides() {
      var perView = getPerView();
      var viewportWidth = viewport.clientWidth;
      var trackStyle = window.getComputedStyle(track);
      var gap = parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;
      var slideWidth = (viewportWidth - gap * (perView - 1)) / perView;
      slides.forEach(function (slide) {
        slide.style.flex = '0 0 ' + slideWidth + 'px';
        slide.style.width = slideWidth + 'px';
        slide.style.maxWidth = slideWidth + 'px';
      });
    }

    function getPageOffset(pageIndex) {
      var perView = getPerView();
      var slideIndex = pageIndex * perView;
      var targetSlide = slides[slideIndex];
      return targetSlide ? targetSlide.offsetLeft : 0;
    }

    function goTo(pageIndex, instant) {
      var pageCount = getPageCount();
      index = ((pageIndex % pageCount) + pageCount) % pageCount;
      layoutSlides();
      var offset = getPageOffset(index);
      track.style.transition = reduced || instant ? 'none' : '';
      track.style.transform = 'translate3d(-' + offset + 'px,0,0)';
      dots.forEach(function (dot, n) {
        var active = n === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (prevBtn) prevBtn.disabled = pageCount <= 1;
      if (nextBtn) nextBtn.disabled = pageCount <= 1;
      if (countEl) countEl.textContent = index + 1 + ' / ' + pageCount;
    }

    function buildDots() {
      layoutSlides();
      var pageCount = getPageCount();
      dotsWrap.innerHTML = '';
      dots = [];
      for (var i = 0; i < pageCount; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'rk-featured-slider-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Seite ' + (i + 1));
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        (function (pageIndex) {
          dot.addEventListener('click', function () {
            goTo(pageIndex);
          });
        })(i);
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
      if (index >= pageCount) index = 0;
      goTo(index, true);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(index - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(index + 1);
      });
    }

    var touchStartX = 0;
    var touchDelta = 0;
    root.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches.length) return;
        touchStartX = e.touches[0].clientX;
        touchDelta = 0;
      },
      { passive: true }
    );
    root.addEventListener(
      'touchmove',
      function (e) {
        if (!e.touches.length) return;
        touchDelta = e.touches[0].clientX - touchStartX;
      },
      { passive: true }
    );
    root.addEventListener('touchend', function () {
      if (Math.abs(touchDelta) < 48) return;
      if (touchDelta < 0) goTo(index + 1);
      else goTo(index - 1);
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(index + 1);
      }
    });

    MOBILE_MQ.addEventListener('change', buildDots);
    window.addEventListener('resize', buildDots);
    buildDots();
    root.dataset.rkBlogSliderReady = '1';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogSlider);
  } else {
    initBlogSlider();
  }
  document.addEventListener('rk:ready', initBlogSlider);
  document.addEventListener('rk:legacy-content', initBlogSlider);
})();
