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
    var lastTrigger = null;

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
      lastTrigger = card.querySelector('.glass-card__visual--trigger');
      populateFromCard(card);
      if (lastTrigger) lastTrigger.setAttribute('aria-expanded', 'true');
      storyDialog.showModal();
      if (closeBtn) closeBtn.focus();
    }

    function closeStory() {
      if (storyDialog.open) storyDialog.close();
    }

    storyCards.forEach(function (card) {
      var trigger = card.querySelector('.glass-card__visual--trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        openStory(card);
      });
      trigger.addEventListener('keydown', function (e) {
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
        var t = c.querySelector('.glass-card__visual--trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      if (dlgImg) {
        dlgImg.removeAttribute('src');
        dlgImg.setAttribute('hidden', '');
      }
      if (dlgMedia) dlgMedia.classList.remove('story-dialog__media--empty');
      if (lastTrigger && document.contains(lastTrigger)) {
        lastTrigger.focus();
      }
      lastCard = null;
      lastTrigger = null;
    });
  }

  /* Menú comprimido (móvil): panel tipo Apple, colores Moony */
  (function mobileNav() {
    var toggle = document.getElementById('nav-compress-toggle');
    var panel = document.getElementById('moony-nav-panel');
    if (!toggle || !panel) return;
    var scrim = panel.querySelector('[data-close-nav]');
    var panelLinks = panel.querySelectorAll('.nav-panel__links a');
    var mqWide = window.matchMedia('(min-width: 901px)');

    function isCompressedLayout() {
      return window.matchMedia('(max-width: 900px)').matches;
    }

    function openNav() {
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
      document.body.style.overflow = 'hidden';
      if (header) header.classList.add('site-header--nav-open');
      var first = panel.querySelector('.nav-panel__links a');
      if (first) {
        window.setTimeout(function () {
          first.focus();
        }, 150);
      }
    }

    function closeNav() {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú de navegación');
      document.body.style.overflow = '';
      if (header) header.classList.remove('site-header--nav-open');
    }

    toggle.addEventListener('click', function () {
      if (!isCompressedLayout()) return;
      if (panel.classList.contains('is-open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (scrim) {
      scrim.addEventListener('click', function () {
        closeNav();
      });
    }

    panelLinks.forEach(function (a) {
      a.addEventListener('click', function () {
        closeNav();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        e.preventDefault();
        closeNav();
        toggle.focus();
      }
    });

    function onBreakpoint() {
      if (mqWide.matches) closeNav();
    }

    if (mqWide.addEventListener) {
      mqWide.addEventListener('change', onBreakpoint);
    } else if (mqWide.addListener) {
      mqWide.addListener(onBreakpoint);
    }

    onBreakpoint();
  })();

  /* Navegacion activa por capitulo */
  (function navSpy() {
    var links = document.querySelectorAll('a[data-nav]');
    if (!links.length) return;
    var ids = [];
    links.forEach(function (a) {
      var id = a.getAttribute('data-nav');
      if (id && ids.indexOf(id) === -1) ids.push(id);
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
