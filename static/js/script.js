document.addEventListener('DOMContentLoaded', function () {

  /* =====================================================
     TEMA CLARO / OSCURO
     ===================================================== */
  const html        = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    html.dataset.theme = theme;
    localStorage.setItem('dd-theme', theme);

    if (themeToggle) {
      themeToggle.innerHTML = (theme === 'light')
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
    }
  }

  // Inicializar (el anti-flash ya aplicó el tema al html, solo actualizamos el botón/logo)
  applyTheme(html.dataset.theme || 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(html.dataset.theme === 'light' ? 'dark' : 'light');
    });
  }


  /* =====================================================
     NAVBAR — efecto al hacer scroll
     ===================================================== */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();


  /* =====================================================
     MENÚ MOBILE
     ===================================================== */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }


  /* =====================================================
     CAROUSEL
     ===================================================== */
  const slides = document.querySelectorAll('.carousel-slide');
  const dots   = document.querySelectorAll('.dot');
  let currentSlideIndex = 0;
  let autoPlayTimer;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (slides[index]) slides[index].classList.add('active');
    if (dots[index])   dots[index].classList.add('active');
  }

  function changeSlide(direction) {
    currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
    showSlide(currentSlideIndex);
    resetAutoPlay();
  }

  function currentSlide(index) {
    currentSlideIndex = index - 1;
    showSlide(currentSlideIndex);
    resetAutoPlay();
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => changeSlide(1), 5500);
  }

  if (slides.length > 0) {
    resetAutoPlay();
  }

  window.changeSlide = changeSlide;
  window.currentSlide = currentSlide;


  /* =====================================================
     SCROLL REVEAL — Intersection Observer
     ===================================================== */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  }

});
