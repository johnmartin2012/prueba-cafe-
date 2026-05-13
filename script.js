/* Café Luna — script.js */

// --- Nav scroll ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// --- Burger menu ---
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// --- Reviews carousel ---
const track = document.getElementById('resenasTrack');
const dotsContainer = document.getElementById('resenaDots');
const prevBtn = document.getElementById('resenaPrev');
const nextBtn = document.getElementById('resenaNext');

const cards = Array.from(track.children);
let current = 0;
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

function getCardWidth() {
  const card = cards[0];
  const style = getComputedStyle(track);
  const gap = parseFloat(style.gap) || 24;
  return card.offsetWidth + gap;
}

function goTo(index) {
  const total = cards.length;
  current = (index + total) % total;

  const wrap = track.parentElement;
  const wrapW = wrap.offsetWidth;
  const cardW = getCardWidth();
  const paddingLeft = wrapW * 0.05;

  let offset = paddingLeft + current * cardW;
  const maxOffset = track.scrollWidth - wrapW;
  offset = Math.min(offset, maxOffset);

  track.style.transform = `translateX(-${offset}px)`;
  updateDots();
}

function buildDots() {
  dotsContainer.innerHTML = '';
  cards.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'resenas__dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Reseña ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(btn);
  });
}

function updateDots() {
  dotsContainer.querySelectorAll('.resenas__dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

// Touch / mouse drag
track.parentElement.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.pageX;
  track.style.transition = 'none';
});

window.addEventListener('mouseup', e => {
  if (!isDragging) return;
  isDragging = false;
  track.style.transition = '';
  const diff = e.pageX - startX;
  if (Math.abs(diff) > 50) goTo(diff < 0 ? current + 1 : current - 1);
  else goTo(current);
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const cardW = getCardWidth();
  const wrap = track.parentElement;
  const wrapW = wrap.offsetWidth;
  const paddingLeft = wrapW * 0.05;
  const base = paddingLeft + current * cardW;
  const delta = e.pageX - startX;
  track.style.transform = `translateX(-${base - delta}px)`;
});

track.parentElement.addEventListener('touchstart', e => {
  startX = e.touches[0].pageX;
  track.style.transition = 'none';
}, { passive: true });

track.parentElement.addEventListener('touchend', e => {
  track.style.transition = '';
  const diff = e.changedTouches[0].pageX - startX;
  if (Math.abs(diff) > 50) goTo(diff < 0 ? current + 1 : current - 1);
  else goTo(current);
});

// Auto-advance
let autoplay = setInterval(() => goTo(current + 1), 6000);
[prevBtn, nextBtn, ...dotsContainer.querySelectorAll('button')].forEach(el => {
  el.addEventListener('click', () => { clearInterval(autoplay); });
});

buildDots();
goTo(0);

// Re-calc on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => goTo(current), 150);
}, { passive: true });

// --- Intersection Observer fade-in ---
const fadeEls = document.querySelectorAll('.section, .resena-card, .origen-card');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section, .resena-card, .origen-card').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  });
});


// Add visible class handling
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: none !important; }';
document.head.appendChild(style);
