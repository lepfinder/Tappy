/**
 * Tappy Landing Page - Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Typewriter effect
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const texts = [
            '小手哒哒，打字顶呱呱！',
            'Type Happy, Grow Fast.',
            '边打字，边学习古诗词',
            '中英双语，全面提升'
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function type() {
            const currentText = texts[textIndex];

            if (isDeleting) {
                // Deleting text
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;

                if (charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                    typeSpeed = 500; // Pause before typing next text
                }
            } else {
                // Typing text
                typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;

                if (charIndex === currentText.length) {
                    isDeleting = true;
                    typeSpeed = 2000; // Pause at end of text
                }
            }

            setTimeout(type, typeSpeed);
        }

        // Start typewriter effect
        setTimeout(type, 500);
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-links-open');

            // Toggle icon
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                const isOpen = navLinks.classList.contains('nav-links-open');
                icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                lucide.createIcons();
            }
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation
    document.querySelectorAll('.feature-card, .screenshot-card, .testimonial-card, .tech-card, .step').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Navigation background on scroll
    const nav = document.querySelector('.nav');
    if (nav) {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 100) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }

            // Hide/show nav on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 300) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }

            lastScrollY = currentScrollY;
        });
    }

    // Add CSS for mobile menu and scroll animations
    const style = document.createElement('style');
    style.textContent = `
    @media (max-width: 768px) {
      .nav-links {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background: rgba(253, 252, 250, 0.98);
        backdrop-filter: blur(12px);
        flex-direction: column;
        padding: var(--space-lg);
        gap: var(--space-sm);
        border-bottom: 1px solid var(--color-border-light);
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
      }
      
      .nav-links-open {
        display: flex !important;
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }
    }
    
    .nav-scrolled {
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
    }
    
    .nav-hidden {
      transform: translateY(-100%);
    }
    
    .nav {
      transition: all 0.3s ease;
    }
    
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .feature-card:nth-child(1) { transition-delay: 0.05s; }
    .feature-card:nth-child(2) { transition-delay: 0.1s; }
    .feature-card:nth-child(3) { transition-delay: 0.15s; }
    .feature-card:nth-child(4) { transition-delay: 0.2s; }
    .feature-card:nth-child(5) { transition-delay: 0.25s; }
    .feature-card:nth-child(6) { transition-delay: 0.3s; }
    .feature-card:nth-child(7) { transition-delay: 0.35s; }
    .feature-card:nth-child(8) { transition-delay: 0.4s; }
  `;
    document.head.appendChild(style);

    console.log('Tappy Landing Page initialized');
});
