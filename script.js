/* ========================================
   PORTFOLIO – Julien Gauzere
   JavaScript Interactions
   ======================================== */

'use strict';

// ——— DOM Elements ———
const header      = document.getElementById('header');
const navToggle   = document.getElementById('nav-toggle');
const navList     = document.getElementById('nav-list');
const navLinks    = document.querySelectorAll('.nav__link');
const scrollTopBtn = document.getElementById('scroll-top');
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');
const reveals     = document.querySelectorAll('.reveal');
const sections    = document.querySelectorAll('section[id]');
const projectsCarousel = document.getElementById('projects-carousel');

// ——— Mobile Navigation ———
function toggleMenu() {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navList.classList.toggle('open');
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

function closeMenu() {
  navToggle.setAttribute('aria-expanded', 'false');
  navList.classList.remove('open');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', toggleMenu);

// Close menu when a link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// ——— Header scroll effect ———
function handleHeaderScroll() {
  header.classList.toggle('header--scrolled', window.scrollY > 50);
}

// ——— Active navigation link on scroll ———
function highlightActiveLink() {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop    = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId     = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ——— Scroll to top button ———
function handleScrollTopVisibility() {
  if (window.scrollY > 500) {
    scrollTopBtn.hidden = false;
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
    // Wait for transition before hiding
    setTimeout(() => {
      if (!scrollTopBtn.classList.contains('visible')) {
        scrollTopBtn.hidden = true;
      }
    }, 300);
  }
}

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ——— Scroll event (throttled) ———
let ticking = false;

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleHeaderScroll();
      highlightActiveLink();
      handleScrollTopVisibility();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

// ——— Reveal on scroll (Intersection Observer) ———
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animations slightly
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  }
);

reveals.forEach(el => revealObserver.observe(el));

// ——— Projects Carousel (Infinite 3D Rotation) ———
if (projectsCarousel) {
  const ring = projectsCarousel.querySelector('.projects__ring');
  const cards = ring ? ring.querySelectorAll('.project-card') : [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const radius = 360;
  let currentAngle = 0;
  let wheelTimer = null;

  function renderCarousel() {
    if (!cards.length) return;
    const step = 360 / cards.length;

    cards.forEach((card, index) => {
      const angle = currentAngle + index * step;
      const rad = (angle * Math.PI) / 180;
      const depth = Math.cos(rad);
      const scale = reducedMotion ? 1 : 0.8 + depth * 0.2;
      const opacity = reducedMotion ? 1 : Math.max(0.2, 0.4 + depth * 0.6);
      const zIndex = Math.round(100 + depth * 50);

      card.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px) scale(${scale})`;
      card.style.opacity = `${opacity}`;
      card.style.zIndex = `${zIndex}`;
    });
  }

  function snapToNearest() {
    if (!cards.length) return;
    const step = 360 / cards.length;
    currentAngle = Math.round(currentAngle / step) * step;
    renderCarousel();
  }

  // Drag to rotate
  let isDragging = false;
  let startX = 0;
  let startAngle = 0;

  projectsCarousel.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startAngle = currentAngle;
    projectsCarousel.setPointerCapture(e.pointerId);
  });

  projectsCarousel.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    currentAngle = startAngle + dx * 0.3;
    renderCarousel();
  });

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    if (e && projectsCarousel.hasPointerCapture(e.pointerId)) {
      projectsCarousel.releasePointerCapture(e.pointerId);
    }
    snapToNearest();
  };

  projectsCarousel.addEventListener('pointerup', endDrag);
  projectsCarousel.addEventListener('pointerleave', endDrag);

  // Wheel to rotate
  projectsCarousel.addEventListener('wheel', (e) => {
    e.preventDefault();
    currentAngle += e.deltaY * 0.2;
    renderCarousel();
    if (wheelTimer) {
      clearTimeout(wheelTimer);
    }
    wheelTimer = setTimeout(() => {
      snapToNearest();
      wheelTimer = null;
    }, 150);
  }, { passive: false });

  window.addEventListener('resize', renderCarousel);

  renderCarousel();
}

// ——— Contact Form Validation & Handling ———
function validateField(field) {
  const errorSpan = field.parentElement.querySelector('.form__error');
  let message = '';

  if (!field.value.trim()) {
    message = 'Ce champ est requis.';
  } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
    message = 'Veuillez entrer un e-mail valide.';
  }

  if (message) {
    field.classList.add('invalid');
    if (errorSpan) errorSpan.textContent = message;
    return false;
  } else {
    field.classList.remove('invalid');
    if (errorSpan) errorSpan.textContent = '';
    return true;
  }
}

// Real-time validation on blur
if (contactForm) {
  const fields = contactForm.querySelectorAll('input, textarea');
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) {
        validateField(field);
      }
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = contactForm.querySelectorAll('input, textarea');
    let isValid = true;

    fields.forEach(field => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) return;

    // Simulate form submission (replace with real endpoint)
    const submitBtn = contactForm.querySelector('.form__submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    setTimeout(() => {
      formStatus.textContent = '✓ Message envoyé avec succès ! Je vous répondrai rapidement.';
      formStatus.style.color = 'var(--clr-accent)';
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer';

      // Clear success message after 5 seconds
      setTimeout(() => {
        formStatus.textContent = '';
      }, 5000);
    }, 1200);
  });
}

// ——— Init on load ———
handleHeaderScroll();
highlightActiveLink();
