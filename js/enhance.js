// enhance.js — Animations, preloader, counters, theme, before/after, CTA behavior

/* Preloader: hide after load */
(function preloader() {
  window.addEventListener('load', () => {
    const p = document.getElementById('preloader');
    if (!p) return;
    p.classList.add('hidden');
    setTimeout(() => p.remove(), 700);
  });
})();

/* Scroll reveal using IntersectionObserver */
(function scrollReveal() {
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* Counters animation */
(function counters() {
  const els = document.querySelectorAll('.counter');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.animated) return;
      el.dataset.animated = '1';
      const end = parseInt(el.textContent.replace(/[^\d]/g, '')) || 0;
      const dur = 1400;
      const startTime = performance.now();
      function step(now) {
        const p = Math.min(1, (now - startTime) / dur);
        const val = Math.floor(p * end);
        el.textContent = val.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = end.toLocaleString();
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });
  els.forEach(e => obs.observe(e));
})();

/* Theme toggle with localStorage */
(function themeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  const saved = localStorage.getItem('fm_theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('fm_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('fm_theme', 'dark');
    }
  });
})();

/* Before/After slider */
(function beforeAfter() {
  document.querySelectorAll('.before-after').forEach(wrapper => {
    const after = wrapper.querySelector('.after');
    if (!after) return;
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    const handle = document.createElement('div');
    handle.className = 'handle';
    resizer.appendChild(handle);
    wrapper.appendChild(resizer);

    let dragging = false;
    function setPos(clientX) {
      const rect = wrapper.getBoundingClientRect();
      let pos = clientX - rect.left;
      pos = Math.max(10, Math.min(rect.width - 10, pos));
      const pct = (pos / rect.width) * 100;
      after.style.width = pct + '%';
      resizer.style.left = pct + '%';
    }

    resizer.addEventListener('pointerdown', (e) => {
      dragging = true;
      wrapper.setPointerCapture?.(e.pointerId);
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setPos(e.clientX);
    });
    window.addEventListener('pointerup', () => { dragging = false; });

    // init center
    const init = 50;
    after.style.width = init + '%';
    resizer.style.left = init + '%';
  });
})();

/* Floating CTA hide on scroll down */
(function floatingCTA() {
  const btn = document.getElementById('floatingContact');
  if (!btn) return;
  let last = window.scrollY;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > last && current > 200) {
      btn.style.transform = 'translateY(18px) scale(.98)';
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';
    } else {
      btn.style.transform = '';
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
    }
    last = current;
  });
})();

/* Smooth anchor scrolling (offset for fixed header) */
(function smoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
