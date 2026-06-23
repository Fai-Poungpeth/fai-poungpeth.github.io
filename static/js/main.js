(function () {
  'use strict';

  // ── Custom cursor ──────────────────────────────────────────────
  var cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.innerHTML = '<i class="fas fa-hand-pointer"></i>';
  document.body.appendChild(cursor);

  var N = 10;
  var dots = [];
  for (var i = 0; i < N; i++) {
    var d = document.createElement('div');
    d.className = 'cursor-dot';
    var frac = (N - i) / N;
    d.style.opacity = (frac * 0.7).toFixed(2);
    var sz = (3 + frac * 5).toFixed(1) + 'px';
    d.style.width = sz;
    d.style.height = sz;
    document.body.appendChild(d);
    dots.push(d);
  }

  var mx = -200, my = -200;
  var hx = [], hy = [];
  for (var j = 0; j < N; j++) { hx.push(-200); hy.push(-200); }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  document.addEventListener('mousedown', function (e) {
    cursor.classList.add('clicking');
    var burst = document.createElement('div');
    burst.className = 'cursor-burst';
    burst.style.left = e.clientX + 'px';
    burst.style.top = e.clientY + 'px';
    document.body.appendChild(burst);
    setTimeout(function () { burst.parentNode && burst.parentNode.removeChild(burst); }, 400);
  });

  document.addEventListener('mouseup', function () {
    cursor.classList.remove('clicking');
  });

  function frame() {
    hx.unshift(mx); hx.pop();
    hy.unshift(my); hy.pop();
    for (var k = 0; k < N; k++) {
      dots[k].style.left = (hx[k] + 15) + 'px';
      dots[k].style.top = (hy[k] + 20) + 'px';
    }
    requestAnimationFrame(frame);
  }
  frame();

  // ── Scroll-reveal for sections ─────────────────────────────────
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.page-section:not(#overview)').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.page-section').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ── Publication year filter ────────────────────────────────────
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = this.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      document.querySelectorAll('.pub-card').forEach(function (card) {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.year !== filter);
      });
    });
  });

  // ── Abstract expand/collapse ───────────────────────────────────
  document.querySelectorAll('.abstract-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var abs = document.getElementById(this.dataset.target);
      if (!abs) return;
      var isOpen = abs.classList.contains('open');
      abs.classList.toggle('open', !isOpen);
      this.classList.toggle('open', !isOpen);
    });
  });

  // ── Active nav highlight (scroll-based on homepage only) ─────
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    var sections = document.querySelectorAll('.page-section[id]');
    var navLinks = document.querySelectorAll('.nav a');

    function updateNav() {
      var pos = window.scrollY + 90;
      var current = '';
      sections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '/#' + current);
      });
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }
}());
