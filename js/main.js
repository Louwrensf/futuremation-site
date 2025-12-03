// js/main.js (module) — full file (imports gallery + enhancements + services)

const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

mobileToggle?.addEventListener('click', () => {
  if (!navLinks) return;
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  mobileToggle.innerHTML = navLinks.style.display === 'flex' ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Contact form (demo)
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  const name = contactForm.elements['name']?.value || 'Client';
  const email = contactForm.elements['email']?.value || '';
  alert(`Thanks ${name}! We will contact you at ${email}.`);
  contactForm.reset();
});

// Global click handler for dynamically created quote buttons
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.open-quote-modal');
  if (!btn) return;

  ev.preventDefault();

  import('./quote-tool.js')
    .then(mod => mod.openQuoteModal(btn.dataset.quote || ''))
    .catch(err => console.error('Quote tool load failed', err));
});

// Load galleries and recent projects from gallery.js
import { initGalleries, initRecentProjects } from './gallery.js';
initGalleries();
initRecentProjects();

// Load enhancements (preloader, counters, theme, before/after, CTA)
import './enhance.js';

// Load services tabs
import { initServices } from './services.js';
initServices();
