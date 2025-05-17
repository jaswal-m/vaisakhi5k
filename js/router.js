import toast from './toast.js';

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
        this.pageCache = new Map();

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
                    this.pageCache.clear();
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

    async loadPageStyles(path) {
        const stylesheets = {
            '/': '/css/home.css',
            '/faq': '/css/faq.css',
            '/registration': '/css/forms.css',
            '/course': '/css/course.css',
            '/login': '/css/auth.css'
        };

        const stylesheet = stylesheets[path];
        if (stylesheet) {
            const existingLink = document.querySelector(`link[href="${stylesheet}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = stylesheet;
                document.head.appendChild(link);
                await new Promise((resolve, reject) => {
                    link.onload = resolve;
                    link.onerror = reject;
                }).catch(error => {
                    console.error('Error loading stylesheet:', error);
                });
            }
        }
    }

    async initPageScripts(path) {
        try {
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
            } else if (path === '/course' && typeof initializeCourse === 'function') {
                // Load Mapbox and Chart.js when needed
                if (!window.mapboxgl) {
                    await Promise.all([
                        this.loadScript('https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js'),
                        this.loadScript('https://cdn.jsdelivr.net/npm/chart.js')
                    ]);
                }
                initializeCourse();
            } else if (path === '/login' && typeof initializeAuth === 'function') {
                initializeAuth();
            }
        } catch (error) {
            console.error('Error initializing page scripts:', error);
            this.showError('Failed to initialize page functionality');
        }
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async handleRoute() {
        let path = window.location.pathname;
        const hash = window.location.hash;
        
        const now = Date.now();
        if (now - this._lastNavigation < 500) {
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.text();
            
            const mainMatch = content.match(/<main[^>]*>([\s\S]*)<\/main>/i);
            const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
            
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = mainMatch ? mainMatch[1] : content;
                document.title = titleMatch ? titleMatch[1] : 'Vaisakhi 5K';
                
                await this.initPageScripts(path);
                this.updateActiveNav();
                this.preloadNextPages();

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

        } catch (error) {
            console.error('Error loading page:', error);
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
            this.showError(error.message);
        } finally {
            if (loader) loader.classList.remove('active');
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
        toast.error({
            title: 'Error',
            message: message,
            duration: 5000
        });
    }
}

const router = new Router();
