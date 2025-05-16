document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lines background
    if (typeof Lines !== 'undefined') {
        new Lines({
            container: document.getElementById('lines-container'),
            color: 'rgba(79, 70, 229, 0.2)',
            lineWidth: 1.5,
            numberOfLines: 50,
            backgroundColor: 'white',
            speed: 0.5,
            amplitude: 0.8
        }).init();
    }

    // Hide loader after content is loaded
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.remove('active');
        }, 500);
    }

    // Mobile menu toggle
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.setAttribute('aria-label', 'Toggle navigation menu');
    menuButton.innerHTML = '<span class="hamburger"></span>';
    
    const nav = document.querySelector('#main-nav .nav-container');
    const navLinks = document.querySelector('.nav-links');
    
    if (nav && navLinks) {
        nav.insertBefore(menuButton, navLinks);

        menuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuButton.classList.toggle('active');
            
            // Toggle aria-expanded
            const isExpanded = menuButton.classList.contains('active');
            menuButton.setAttribute('aria-expanded', isExpanded);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuButton.classList.remove('active');
                menuButton.setAttribute('aria-expanded', false);
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const animateOnScroll = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.animate-on-scroll').forEach((element) => {
            observer.observe(element);
        });
    };

    animateOnScroll();
});
