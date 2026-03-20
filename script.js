/* ===========================
   PORTFOLIO – FRANCK AXEL KOUAMÉ
   script.js
   =========================== */

/* ---------- CURSOR ---------- */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

// Ne pas activer le curseur custom sur les appareils tactiles
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

if (!isTouchDevice && cursor && cursorTrail) {
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth trail
  (function animTrail() {
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';
    requestAnimationFrame(animTrail);
  })();

  // Cursor scale on hover
  document.querySelectorAll('a, button, .glass-card, .tech-tag').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
      cursor.style.background = 'rgba(108,99,255,0.3)';
      cursorTrail.style.transform = 'translate(-50%,-50%) scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      cursor.style.background = 'var(--primary)';
      cursorTrail.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
}

/* ---------- NAVBAR ---------- */
const navbar  = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveLink();
});

navToggle.addEventListener('click', () => {
  navbar.classList.toggle('mobile-open');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navbar.classList.remove('mobile-open'));
});

/* ---------- ACTIVE NAV LINK ---------- */
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';

  sections.forEach(sec => {
    const sTop = sec.offsetTop - 100;
    if (window.scrollY >= sTop) current = sec.getAttribute('id');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

/* ---------- TYPEWRITER ---------- */
const roles = [
  'Admin Systèmes & Réseaux',
  'Virtualisation Proxmox',
  'Supervision Zabbix',
  'Automatisation Ansible',
  'Support IT & Infrastructure'
];

let roleIdx  = 0;
let charIdx  = 0;
let deleting = false;

const typeElem = document.getElementById('typewriter');

function type() {
  const current = roles[roleIdx];
  if (!deleting) {
    typeElem.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typeElem.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(type, deleting ? 60 : 90);
}
setTimeout(type, 800);

/* ---------- COUNTER ANIMATION ---------- */
function animateCounter(el) {
  const target = +el.getAttribute('data-target');
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- SKILL BARS ---------- */
function animateSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(bar => {
    const w = bar.getAttribute('data-width');
    bar.style.width = w + '%';
  });
}

/* ---------- INTERSECTION OBSERVER ---------- */
const observerOpts = { threshold: 0.15 };

// Reveal cards
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOpts);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Counters
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// Skill bars
const skillsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateSkillBars();
      skillsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const skillsSection = document.getElementById('skills');
if (skillsSection) skillsObserver.observe(skillsSection);

/* ---------- STAGGER REVEAL for cards ---------- */
function staggerReveal(selector, delay = 100) {
  const items = document.querySelectorAll(selector);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(items).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
}

staggerReveal('.project-card', 120);
staggerReveal('.cert-card', 100);
staggerReveal('.edu-card', 120);
staggerReveal('.about-card', 100);
staggerReveal('.skill-category', 100);
staggerReveal('.timeline-item', 150);

/* ---------- CONTACT FORM – Web3Forms ---------- */
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const success   = document.getElementById('formSuccess');
const error     = document.getElementById('formError');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Envoi en cours...';
    if (success) success.style.display = 'none';
    if (error)   error.style.display   = 'none';

    const data = new FormData(form);

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      });
      const json = await res.json();

      if (json.success) {
        if (success) success.style.display = 'flex';
        form.reset();
        setTimeout(() => { if (success) success.style.display = 'none'; }, 6000);
      } else {
        if (error) error.style.display = 'flex';
      }
    } catch (err) {
      if (error) error.style.display = 'flex';
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Envoyer le message';
    }
  });

  // Live label animation
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.form-group').classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.form-group').classList.remove('focused');
    });
  });
}

/* ---------- SMOOTH SECTION ENTRANCE ---------- */
document.querySelectorAll('.section-header').forEach(header => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  header.style.opacity = '0';
  header.style.transform = 'translateY(30px)';
  header.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  obs.observe(header);
});

/* ---------- PARTICLE on click ---------- */
document.addEventListener('click', e => {
  for (let i = 0; i < 6; i++) {
    createParticle(e.clientX, e.clientY);
  }
});

function createParticle(x, y) {
  const p = document.createElement('div');
  p.style.cssText = `
    position: fixed;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: hsl(${Math.random() * 60 + 240}, 80%, 65%);
    pointer-events: none;
    z-index: 9999;
    left: ${x}px; top: ${y}px;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(p);

  const angle  = Math.random() * Math.PI * 2;
  const speed  = Math.random() * 80 + 40;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  let opacity  = 1;

  let startTime = null;
  function anim(ts) {
    if (!startTime) startTime = ts;
    const dt = (ts - startTime) / 1000;
    opacity -= dt * 2;
    p.style.opacity = Math.max(opacity, 0);
    p.style.left  = (x + vx * dt) + 'px';
    p.style.top   = (y + vy * dt + 80 * dt * dt) + 'px';
    if (opacity > 0) requestAnimationFrame(anim);
    else p.remove();
  }
  requestAnimationFrame(anim);
}

/* ---------- TECH TAG hover pulse ---------- */
document.querySelectorAll('.tech-tag').forEach(tag => {
  tag.addEventListener('mouseenter', () => {
    tag.style.boxShadow = '0 0 20px rgba(108,99,255,0.3)';
  });
  tag.addEventListener('mouseleave', () => {
    tag.style.boxShadow = '';
  });
});

/* ---------- BACK TO TOP on scroll indicator click ---------- */
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
  scrollIndicator.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------- INIT ---------- */
console.log('%c🔐 FRANCK AXEL KOUAMÉ – Portfolio', 
  'color: #6c63ff; font-size: 16px; font-weight: bold;');
console.log('%c Admin Réseau & Cybersécurité | IPI Toulouse', 
  'color: #00d4aa; font-size: 12px;');
