
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // Contact form handling
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
            this.reset();
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Carousel functionality
    let currentSlideIndex = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (slides[index]) {
            slides[index].classList.add('active');
            dots[index].classList.add('active');
        }
    }
    
    function changeSlide(direction) {
        currentSlideIndex += direction;
        if (currentSlideIndex >= slides.length) {
            currentSlideIndex = 0;
        } else if (currentSlideIndex < 0) {
            currentSlideIndex = slides.length - 1;
        }
        showSlide(currentSlideIndex);
    }
    
    function currentSlide(index) {
        currentSlideIndex = index - 1;
        showSlide(currentSlideIndex);
    }
    
    // Auto-advance carousel
    setInterval(() => {
        changeSlide(1);
    }, 5000);
    
    // Make functions global for onclick handlers
    window.changeSlide = changeSlide;
    window.currentSlide = currentSlide;

    // Add loading animation to buttons
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent === 'Próximamente') {
                this.style.background = '#666';
                this.textContent = 'Disponible pronto...';
                setTimeout(() => {
                    this.style.background = '#e50914';
                    this.textContent = 'Próximamente';
                }, 2000);
            }
        });
    });
});
