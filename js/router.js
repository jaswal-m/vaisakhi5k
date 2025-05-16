class Router {
    constructor() {
        this.registerServiceWorker();
        this.currentVersion = localStorage.getItem('appVersion') || null;
        this._lastNavigation = 0;
        this.routes = {
            '/': '/pages/home.html',
            '/registration': '/pages/registration.html',
            '/registration.html': '/pages/registration.html',
            '/course': '/pages/course.html',
            '/course.html': '/pages/course.html',
            '/faq': '/pages/faq.html',
            '/faq.html': '/pages/faq.html',
            '/login': '/pages/login.html',
            '/login.html': '/pages/login.html',
            '/404': '/pages/404.html'
        };
        this.currentPath = this.normalizeUrl(window.location.pathname);

        // Handle initial page load
        window.addEventListener('DOMContentLoaded', () => {
            this.checkVersion();
            this.handleRoute();
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const url = new URL(link.href);
                this.navigate(url.pathname, url.hash);
            }
        });
    }

    updateActiveNav() {
        const path = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === path) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            } else {
                link.removeAttribute('aria-current');
                link.classList.remove('active');
            }
        });
    }

    async checkVersion() {
        try {
            const response = await fetch('/version.json?t=' + Date.now());
            if (response.ok) {
                const { version } = await response.json();
                if (version !== this.currentVersion) {
                    localStorage.clear();
                    localStorage.setItem('appVersion', version);
                    this.currentVersion = version;
                }
            }
        } catch (error) {
            console.error('Error checking version:', error);
        }
    }

    normalizeUrl(url) {
        return url.replace(/\.html$/, '');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registration successful');
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }

    preloadNextPages() {
        document.querySelectorAll('a').forEach(link => {
            if (link.href.startsWith(window.location.origin)) {
                const url = new URL(link.href);
                const pagePath = this.routes[url.pathname];
                if (pagePath) {
                    const preloadLink = document.createElement('link');
                    preloadLink.rel = 'prefetch';
                    preloadLink.href = pagePath;
                    document.head.appendChild(preloadLink);
                }
            }
        });
    }

    addSocialSharing() {
        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share';
        if (navigator.share) {
            shareContainer.innerHTML = `
                <button class="share-btn" aria-label="Share this page">
                    Share <i class="fas fa-share-alt"></i>
                </button>
            `;
            shareContainer.querySelector('.share-btn').addEventListener('click', () => {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                }).catch(console.error);
            });
        }
        document.querySelector('main')?.appendChild(shareContainer);
    }

    initializeRealtimeUpdates() {
        if ('EventSource' in window && 
            (window.location.pathname === '/course' || window.location.pathname === '/')) {
            const events = new EventSource('/api/events');
            events.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealtimeUpdate(data);
            };
        }
    }

    handleRealtimeUpdate(data) {
        const updateMap = {
            raceUpdate: this.updateRaceStatus.bind(this),
            weatherUpdate: this.updateWeather.bind(this)
        };
        
        if (data.type in updateMap) {
            updateMap[data.type](data);
        }
    }

    updateRaceStatus(data) {
        const statusElement = document.querySelector('.race-status');
        if (statusElement) {
            statusElement.textContent = data.status;
        }
    }

    updateWeather(data) {
        const weatherElement = document.querySelector('.weather-info');
        if (weatherElement) {
            weatherElement.innerHTML = `
                <div class="weather-update">
                    <i class="fas fa-${data.icon}"></i>
                    <span>${data.temperature}°C</span>
                    <span>${data.conditions}</span>
                </div>
            `;
        }
    }

    async loadPageStyles(path) {
        const stylesheets = {
            '/': '/css/home.css'
        };

        const stylesheet = stylesheets[path];
        if (stylesheet) {
            const existingLink = document.querySelector(`link[href="${stylesheet}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = stylesheet;
                document.head.appendChild(link);
                await new Promise(resolve => {
                    link.onload = resolve;
                });
            }
        }
    }

    async initPageScripts(path) {
        await this.loadPageStyles(path);

        if (path === '/') {
            await new Promise(resolve => setTimeout(resolve, 100));

            if (typeof initializeCountdown === 'function') {
                initializeCountdown();
            }
            
            document.querySelectorAll('.page-header, .countdown-section, .features-section').forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                requestAnimationFrame(() => {
                    section.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                });
            });

            const header = document.querySelector('.page-header');
            if (header) {
                header.style.setProperty('--pattern-opacity', '0');
                setTimeout(() => {
                    header.style.setProperty('--pattern-opacity', '0.1');
                }, 100);
            }
        } else if (path === '/faq' && typeof initializeFAQ === 'function') {
            initializeFAQ();
        } else if (path === '/registration' && typeof initializeRegistration === 'function') {
            initializeRegistration();
        }
    }

    async handleRoute() {
        let path = window.location.pathname;
        const hash = window.location.hash;
        
        // Rate limiting for navigation
        const now = Date.now();
        if (now - this._lastNavigation < 500) { // 500ms cooldown
            return;
        }
        this._lastNavigation = now;

        let pagePath = this.routes[path];
        if (!pagePath) {
            path = this.normalizeUrl(path);
            pagePath = this.routes[path];
        }
        
        if (!pagePath) {
            path = '/404';
            pagePath = this.routes['/404'];
        }

        const loader = document.querySelector('.page-loader');
        
        try {
            await this.checkVersion();
            if (loader) loader.classList.add('active');
            
            const fetchOptions = {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-App-Version': this.currentVersion || 'unknown'
                }
            };
            
            let response = await fetch(pagePath + '?t=' + Date.now(), fetchOptions);
            if (!response.ok) {
                if (response.status === 404) {
                    const altResponse = await fetch(pagePath.replace('.html', '') + '?t=' + Date.now(), fetchOptions);
                    if (!altResponse.ok) {
                        throw new Error(`Page not found: ${path}`);
                    }
                    response = altResponse;
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            
            const content = await response.text();
            let mainContent = content;
            let pageTitle = 'Vaisakhi 5K';
            
            const mainMatch = content.match(/<main[^>]*>([\s\S]*)<\/main>/i);
            if (mainMatch) {
                mainContent = mainMatch[1];
            }
            
            const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
            if (titleMatch) {
                pageTitle = titleMatch[1];
            }
            
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = mainContent;
                document.title = pageTitle;
                await this.initPageScripts(path);
                this.updateActiveNav();
                this.preloadNextPages();
                this.addSocialSharing();
                this.initializeRealtimeUpdates();


                if (hash) {
                    const targetElement = document.querySelector(hash);
                    if (targetElement) {
                        setTimeout(() => {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }
                } else {
                    window.scrollTo(0, 0);
                }
            }

            if (loader) loader.classList.remove('active');
        } catch (error) {
            console.error('Error loading page:', error);
            if (loader) loader.classList.remove('active');
            
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = `
                    <div class="error-message">
                        <h1>Error</h1>
                        <p>${error.message}</p>
                        <a href="/" class="btn btn-primary">Return Home</a>
                    </div>
                `;
            }
        }
    }

    navigate(path, hash = '') {
        path = this.normalizeUrl(path);
        const newPath = hash ? `${path}${hash}` : path;
        if (path === this.currentPath && hash === window.location.hash) return;
        this.currentPath = path;
        window.history.pushState({ path, hash }, '', newPath);
        this.handleRoute();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('main').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

const router = new Router();

    updateActiveNav() {
        const path = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === path) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            } else {
                link.removeAttribute('aria-current');
                link.classList.remove('active');
            }
        });
    }

    async checkVersion() {
        try {
            const response = await fetch('/version.json?t=' + Date.now());
            if (response.ok) {
                const { version } = await response.json();
                if (version !== this.currentVersion) {
                    // Clear cache if version is different
                    localStorage.clear();
                    localStorage.setItem('appVersion', version);
                    this.currentVersion = version;
                    // Force reload all cached content
                    this.pageCache = new Map();
                }
            }
        } catch (error) {
            console.error('Error checking version:', error);
        }
    }

    normalizeUrl(url) {
        // Remove .html extension if present
        return url.replace(/\.html$/, '');
    }

    async handleRoute() {
        let path = window.location.pathname;
        const hash = window.location.hash;

        // Try the exact path first, then try without .html
        let pagePath = this.routes[path];
        if (!pagePath) {
            path = this.normalizeUrl(path);
            pagePath = this.routes[path];
        }
        
        // If still not found, use 404
        if (!pagePath) {
            path = '/404';
            pagePath = this.routes['/404'];
        }

        const loader = document.querySelector('.page-loader');
        
        try {
            // Check version before loading content
            await this.checkVersion();
            
            // Show loading state
            if (loader) loader.classList.add('active');
            
            // Set up fetch options
            const fetchOptions = {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-App-Version': this.currentVersion || 'unknown'
                }
            };
            
            // Fetch page content
            let response = await fetch(pagePath + '?t=' + Date.now(), fetchOptions);
            if (!response.ok) {
                if (response.status === 404) {
                    // Try without .html extension
                    const altResponse = await fetch(pagePath.replace('.html', '') + '?t=' + Date.now(), fetchOptions);
                    if (!altResponse.ok) {
                        throw new Error(`Page not found: ${path}`);
                    }
                    response = altResponse;
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            
            const content = await response.text();
            
            // Extract content between <main> tags and title
            let mainContent = content;
            let pageTitle = 'Vaisakhi 5K';
            
            // Try to extract main content
            const mainMatch = content.match(/<main[^>]*>([\s\S]*)<\/main>/i);
            if (mainMatch) {
                mainContent = mainMatch[1];
            }
            
            // Try to extract title
            const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
            if (titleMatch) {
                pageTitle = titleMatch[1];
            }
            
            // Update page content
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = mainContent;
                document.title = pageTitle;

                // Initialize page-specific scripts
                await this.initPageScripts(path);

                // Update navigation
                this.updateActiveNav();

                // Handle hash navigation after content is loaded
                if (hash) {
                    const targetElement = document.querySelector(hash);
                    if (targetElement) {
                        setTimeout(() => {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                            // For FAQ page, expand the relevant accordion item
                            if (path === '/faq' && window.initializeFAQ) {
                                const accordionItem = targetElement.querySelector('.accordion-header');
                                if (accordionItem) {
                                    accordionItem.setAttribute('aria-expanded', 'true');
                                    accordionItem.nextElementSibling.hidden = false;
                                    accordionItem.click();
                                }
                            }
                        }, 100);
                    }
                } else {
                    window.scrollTo(0, 0);
                }
            }

            // Hide loading state
            if (loader) loader.classList.remove('active');
        } catch (error) {
            console.error('Error loading page:', error);
            if (loader) loader.classList.remove('active');
            
            // Show error message to user
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = `
                    <div class="error-message">
                        <h1>Error</h1>
                        <p>${error.message}</p>
                        <a href="/" class="btn btn-primary">Return Home</a>
                    </div>
                `;
            }
        }
    }

    navigate(path, hash = '') {
        path = this.normalizeUrl(path);
        const newPath = hash ? `${path}${hash}` : path;
        if (path === this.currentPath && hash === window.location.hash) return;
        this.currentPath = path;
        window.history.pushState({ path, hash }, '', newPath);
        this.handleRoute();
    }

    updateNavigation(path) {
        // Remove active state from all links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active state to current link
        const activeLink = document.querySelector(`.nav-link[href="${path}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    async loadPageStyles(path) {
        // Load page-specific styles
        const stylesheets = {
            '/': '/css/home.css'
        };

        const stylesheet = stylesheets[path];
        if (stylesheet) {
            // Check if stylesheet is already loaded
            const existingLink = document.querySelector(`link[href="${stylesheet}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = stylesheet;
                document.head.appendChild(link);
                // Wait for stylesheet to load
                await new Promise(resolve => {
                    link.onload = resolve;
                });
            }
        }
    }

    async initPageScripts(path) {
        // Load page-specific styles first
        await this.loadPageStyles(path);

        // Initialize page-specific scripts
        if (path === '/') {
            // Home page
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 100));

            if (typeof initializeCountdown === 'function') {
                initializeCountdown();
            }

            // Initialize animations
            document.querySelectorAll('.page-header, .countdown-section, .features-section').forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                requestAnimationFrame(() => {
                    section.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                });
            });

            // Reinitialize background patterns
            const header = document.querySelector('.page-header');
            if (header) {
                header.style.setProperty('--pattern-opacity', '0');
                setTimeout(() => {
                    header.style.setProperty('--pattern-opacity', '0.1');
                }, 100);
            }
        } else if (path === '/faq') {
            // FAQ page
            if (typeof initializeFAQ === 'function') {
                initializeFAQ();
            }
        } else if (path === '/registration') {
            // Registration page
            if (typeof initializeRegistration === 'function') {
                initializeRegistration();
            }
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('main').prepend(errorDiv);

}
}
}, 100);
}
} else {
window.scrollTo(0, 0);
}
}

// Hide loading state
if (loader) loader.classList.remove('active');
} catch (error) {
console.error('Error loading page:', error);
if (loader) loader.classList.remove('active');

// Show error message to user
const mainElement = document.querySelector('main');
if (mainElement) {
mainElement.innerHTML = `
<div class="error-message">
<h1>Error</h1>
<p>${error.message}</p>
<a href="/" class="btn btn-primary">Return Home</a>
</div>
`;
}
}
}

navigate(path, hash = '') {
path = this.normalizeUrl(path);
const newPath = hash ? `${path}${hash}` : path;
if (path === this.currentPath && hash === window.location.hash) return;
this.currentPath = path;
window.history.pushState({ path, hash }, '', newPath);
this.handleRoute();
}

updateNavigation(path) {
// Remove active state from all links
document.querySelectorAll('.nav-link').forEach(link => {
link.classList.remove('active');
});

// Add active state to current link
const activeLink = document.querySelector(`.nav-link[href="${path}"]`);
if (activeLink) {
activeLink.classList.add('active');
}
}

async loadScript(src) {
return new Promise((resolve, reject) => {
// Check if script is already loaded
if (document.querySelector(`script[src="${src}"]`)) {
resolve();
return;
}
const script = document.createElement('script');
script.src = src;
script.onload = resolve;
script.onerror = reject;
document.body.appendChild(script);
});
}

async loadPageStyles(path) {
// Load page-specific styles
const stylesheets = {
'/': '/css/home.css'
};

const stylesheet = stylesheets[path];
if (stylesheet) {
// Check if stylesheet is already loaded
const existingLink = document.querySelector(`link[href="${stylesheet}"]`);
if (!existingLink) {
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = stylesheet;
document.head.appendChild(link);
// Wait for stylesheet to load
await new Promise(resolve => {
link.onload = resolve;
});
}
}
}

async initPageScripts(path) {
// Load page-specific styles first
await this.loadPageStyles(path);

// Initialize page-specific scripts
if (path === '/') {
// Home page
// Wait a bit for DOM to be ready
await new Promise(resolve => setTimeout(resolve, 100));

if (typeof initializeCountdown === 'function') {
initializeCountdown();
}

// Initialize animations
document.querySelectorAll('.page-header, .countdown-section, .features-section').forEach(section => {
section.style.opacity = '0';
section.style.transform = 'translateY(20px)';
requestAnimationFrame(() => {
section.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
section.style.opacity = '1';
section.style.transform = 'translateY(0)';
});
});

// Reinitialize background patterns
const header = document.querySelector('.page-header');
if (header) {
header.style.setProperty('--pattern-opacity', '0');
setTimeout(() => {
header.style.setProperty('--pattern-opacity', '0.1');
}, 100);
}
} else if (path === '/faq') {
// FAQ page
if (typeof initializeFAQ === 'function') {
initializeFAQ();
}
} else if (path === '/registration') {
// Registration page
if (typeof initializeRegistration === 'function') {
initializeRegistration();
}
}
}

showError(message) {
const errorDiv = document.createElement('div');
errorDiv.className = 'error-message';
errorDiv.textContent = message;
document.querySelector('main').prepend(errorDiv);

setTimeout(() => errorDiv.remove(), 5000);
}
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize router
const router = new Router();
