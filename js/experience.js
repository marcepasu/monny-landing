/**
 * Moony — parallax, revelado, header, micro-movimiento hero (pointer fino).
 */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('site-header');
  var parallaxRoot = document.getElementById('hero-parallax');
  var hero = document.querySelector('.hero');
  var scrollHint = document.querySelector('.hero__scroll-hint');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 48);
    if (scrollHint) {
      var o = Math.max(0, 1 - y / 240);
      scrollHint.style.opacity = String(0.3 + o * 0.65);
    }
    if (!reduce && parallaxRoot) {
      var max = Math.min(y * 0.38, 100);
      var layers = parallaxRoot.querySelectorAll('[data-parallax]');
      layers.forEach(function (el) {
        var f = parseFloat(el.getAttribute('data-parallax'), 10) || 0.2;
        el.style.transform = 'translate3d(0,' + (max * f).toFixed(2) + 'px,0)';
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var revealEls = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          var delay = parseInt(el.getAttribute('data-reveal-delay'), 10);
          if (!isNaN(delay) && delay > 0) el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-visible');
          io.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (!reduce && hero && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener(
      'pointermove',
      function (ev) {
        var r = hero.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        var glow = hero.querySelector('.hero__glow');
        var mesh = hero.querySelector('.hero__mesh');
        if (glow) {
          glow.style.transform =
            'translate(-50%, -50%) translate(' + (x * 20).toFixed(1) + 'px,' + (y * 16).toFixed(1) + 'px)';
        }
        if (mesh) {
          mesh.style.transform =
            'translate(' + (x * 18).toFixed(1) + 'px,' + (y * 14).toFixed(1) + 'px)';
        }
      },
      { passive: true }
    );
    hero.addEventListener(
      'pointerleave',
      function () {
        var glow = hero.querySelector('.hero__glow');
        var mesh = hero.querySelector('.hero__mesh');
        if (glow) glow.style.transform = 'translate(-50%, -50%)';
        if (mesh) mesh.style.transform = '';
      },
      { passive: true }
    );
  }

  document.documentElement.classList.add('js-ready');

  /* Historias: modal nativo <dialog> */
  var storyDialog = document.getElementById('story-dialog');
  if (storyDialog && typeof storyDialog.showModal === 'function') {
    if (storyDialog.open) {
      storyDialog.close();
    }

    var storyCards = document.querySelectorAll('.glass-card--interactive');
    var closeBtn = storyDialog.querySelector('.story-dialog__close');
    var dlgPanel = storyDialog.querySelector('.story-dialog__panel');
    var dlgMedia = storyDialog.querySelector('.story-dialog__media');
    var dlgImg = storyDialog.querySelector('.story-dialog__img');
    var dlgTitle = storyDialog.querySelector('.story-dialog__title');
    var dlgQuote = storyDialog.querySelector('.story-dialog__quote');
    var dlgBody = storyDialog.querySelector('.story-dialog__body');
    var lastCard = null;

    function populateFromCard(card) {
      var imgEl = card.querySelector('.glass-card__visual img');
      var regionEl = card.querySelector('.glass-card__region');
      var pulseEl = card.querySelector('.glass-card__pulse');
      var tmpl = card.querySelector('template.glass-card__story');
      if (dlgMedia) dlgMedia.classList.remove('story-dialog__media--empty');
      if (imgEl && dlgImg) {
        dlgImg.removeAttribute('hidden');
        dlgImg.onload = function () {
          if (dlgMedia) dlgMedia.classList.remove('story-dialog__media--empty');
        };
        dlgImg.onerror = function () {
          dlgImg.setAttribute('hidden', '');
          if (dlgMedia) dlgMedia.classList.add('story-dialog__media--empty');
        };
        dlgImg.src = imgEl.currentSrc || imgEl.src;
        dlgImg.alt = imgEl.alt || '';
      }
      if (regionEl && dlgTitle) dlgTitle.textContent = regionEl.textContent.trim();
      if (pulseEl && dlgQuote) dlgQuote.innerHTML = pulseEl.innerHTML;
      if (dlgBody && tmpl) {
        dlgBody.innerHTML = '';
        dlgBody.appendChild(tmpl.content.cloneNode(true));
      }
    }

    function openStory(card) {
      lastCard = card;
      populateFromCard(card);
      card.setAttribute('aria-expanded', 'true');
      storyDialog.showModal();
      if (closeBtn) closeBtn.focus();
    }

    function closeStory() {
      if (storyDialog.open) storyDialog.close();
    }

    storyCards.forEach(function (card) {
      card.addEventListener('click', function () {
        openStory(card);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openStory(card);
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeStory();
      });
    }

    if (dlgPanel) {
      dlgPanel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    storyDialog.addEventListener('click', function (e) {
      if (e.target === storyDialog) closeStory();
    });

    storyDialog.addEventListener('close', function () {
      storyCards.forEach(function (c) {
        c.setAttribute('aria-expanded', 'false');
      });
      if (dlgImg) {
        dlgImg.removeAttribute('src');
        dlgImg.setAttribute('hidden', '');
      }
      if (dlgMedia) dlgMedia.classList.remove('story-dialog__media--empty');
      if (lastCard && document.contains(lastCard)) {
        lastCard.focus();
      }
      lastCard = null;
    });
  }

  /* Navegacion activa por capitulo */
  (function navSpy() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;
    var links = nav.querySelectorAll('a[data-nav]');
    var ids = [];
    links.forEach(function (a) {
      ids.push(a.getAttribute('data-nav'));
    });

    function tickNav() {
      var scrollY = window.scrollY || document.documentElement.scrollTop;
      var docEl = document.documentElement;
      var nearBottom = window.innerHeight + scrollY >= docEl.scrollHeight - 72;
      var trigger = scrollY + Math.min(140, window.innerHeight * 0.22);
      var current = 'inicio';
      if (nearBottom) {
        current = 'contacto';
      } else {
        for (var i = 0; i < ids.length; i++) {
          var sec = document.getElementById(ids[i]);
          if (!sec) continue;
          if (sec.offsetTop <= trigger) current = ids[i];
        }
      }
      links.forEach(function (link) {
        var on = link.getAttribute('data-nav') === current;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    window.addEventListener('scroll', tickNav, { passive: true });
    window.addEventListener('resize', tickNav, { passive: true });
    tickNav();
  })();
})();
