// Navigation
const nav = document.getElementById('nav');
const menuToggle = document.querySelector('.nav__toggle');
const navMenu = document.getElementById('nav-menu');
const navScrim = document.querySelector('.nav__scrim');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setNavState = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 8);
};

setNavState();
window.addEventListener('scroll', setNavState, { passive: true });

const closeMenu = (returnFocus = false) => {
  navMenu.classList.remove('is-open');
  navScrim.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('menu-open');
  if (returnFocus) menuToggle.focus();
};

const openMenu = () => {
  navMenu.classList.add('is-open');
  navScrim.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Fechar menu');
  document.body.classList.add('menu-open');
  requestAnimationFrame(() => navMenu.querySelector('a').focus());
};

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});
navScrim.addEventListener('click', () => closeMenu(true));
navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navMenu.classList.contains('is-open')) closeMenu(true);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860 && navMenu.classList.contains('is-open')) closeMenu();
});

// Internal links
const navHeight = () => nav.getBoundingClientRect().height;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (hash === '#') return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight() - 12;
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.pushState(null, '', hash);
  });
});

// Scroll reveal
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

// Portfolio filters
const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('[data-category]');
const portfolioStatus = document.getElementById('portfolio-status');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    projectCards.forEach((card) => {
      const isVisible = filter === 'todos' || card.dataset.category === filter;
      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
        card.classList.add('is-visible');
      }
    });

    const label = visibleCount === 1 ? '1 projeto exibido.' : `${visibleCount} projetos exibidos.`;
    portfolioStatus.textContent = label;
  });
});

// Contact form
const form = document.getElementById('quote-form');
const formStatus = document.getElementById('form-status');
const emailFallback = document.getElementById('email-fallback');

const validators = {
  name: (value) => value.trim().length > 1 || 'Digite seu nome.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Digite um e-mail válido.',
  service: (value) => Boolean(value) || 'Selecione o tipo de projeto.',
  message: (value) => value.trim().length > 9 || 'Conte um pouco mais sobre o projeto (mínimo de 10 caracteres).',
};

const validateField = (fieldName) => {
  const input = form.elements[fieldName];
  const wrapper = input.closest('.field');
  const errorElement = document.getElementById(`${fieldName}-error`);
  const result = validators[fieldName](input.value);
  const isValid = result === true;

  wrapper.classList.toggle('has-error', !isValid);
  input.setAttribute('aria-invalid', String(!isValid));
  errorElement.textContent = isValid ? '' : result;
  return isValid;
};

Object.keys(validators).forEach((fieldName) => {
  const input = form.elements[fieldName];
  input.addEventListener('blur', () => validateField(fieldName));
  input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('has-error')) validateField(fieldName);
    emailFallback.hidden = true;
  });
  input.addEventListener('change', () => {
    if (fieldName === 'service') validateField(fieldName);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = Object.keys(validators);
  const results = fields.map((fieldName) => validateField(fieldName));
  const isValid = results.every(Boolean);

  if (!isValid) {
    formStatus.textContent = 'Revise os campos destacados antes de continuar.';
    emailFallback.hidden = true;
    form.elements[fields[results.indexOf(false)]].focus();
    return;
  }

  const data = new FormData(form);
  const subject = `Solicitação de orçamento — ${data.get('service')}`;
  const body = [
    'Olá, equipe GCampos!',
    '',
    `Meu nome é ${data.get('name')} e gostaria de conversar sobre um projeto.`,
    '',
    `Tipo de projeto: ${data.get('service')}`,
    `E-mail para retorno: ${data.get('email')}`,
    '',
    'Sobre o projeto:',
    data.get('message'),
  ].join('\n');
  const mailto = `mailto:gabriel@gcamposengenharia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  formStatus.textContent = 'Abrindo seu aplicativo de e-mail com a mensagem pronta.';
  emailFallback.href = mailto;
  emailFallback.hidden = false;
  window.location.href = mailto;
});

document.getElementById('current-year').textContent = new Date().getFullYear();
