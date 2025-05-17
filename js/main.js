import toast from './toast.js';

// Initialize toast system
window.toast = toast;

// Global error handling
window.addEventListener('error', (event) => {
    toast.error({
        title: 'Error',
        message: 'Something went wrong. Please try refreshing the page.',
        duration: 7000
    });
    console.error(event.error);
});

// Handle network errors
window.addEventListener('offline', () => {
    toast.warning({
        title: 'No Connection',
        message: 'You are currently offline. Some features may not work.',
        duration: 0 // Won't auto-dismiss
    });
});

window.addEventListener('online', () => {
    toast.success({
        title: 'Connected',
        message: 'Your internet connection has been restored.',
        duration: 3000
    });
});

// Initialize any global features
document.addEventListener('DOMContentLoaded', async () => {
    // Listen for dynamic content loading
    document.addEventListener('contentLoaded', (e) => {
        toast.info({
            title: 'Content Updated',
            message: e.detail?.message || 'Page content has been updated',
            duration: 2000
        });
    });

    // Handle form submissions globally
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (!form.hasAttribute('data-no-toast')) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                setTimeout(() => {
                    submitBtn.disabled = false;
                }, 1500);
            }
        }
    });

    // Check for new version and clear cache
    await checkForNewVersion();

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

async function checkForNewVersion() {
    try {
        // Fetch current version from server
        const response = await fetch('/version.json?t=' + Date.now());
        const { version } = await response.json();
        
        // Get stored version from localStorage
        const storedVersion = localStorage.getItem('appVersion');
        
        if (version !== storedVersion) {
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }
            
            // Clear localStorage except for user preferences
            const userPrefs = localStorage.getItem('userPreferences');
            localStorage.clear();
            if (userPrefs) localStorage.setItem('userPreferences', userPrefs);
            
            // Store new version
            localStorage.setItem('appVersion', version);
            
            // Show toast for app update
            if (storedVersion) {
                toast.success({
                    title: 'App Updated',
                    message: 'The application has been updated to the latest version.',
                    duration: 4000
                });
                window.location.reload(true);
            }
        }
    } catch (error) {
        console.warn('Version check failed:', error);
        toast.error({
            title: 'Update Check Failed',
            message: 'Failed to check for updates. Please try again later.',
            duration: 5000
        });
    }
}

// Export toast for use in other modules
export { toast as default };
