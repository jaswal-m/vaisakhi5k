class Toast {
    constructor() {
        this.maxVisibleToasts = 5;
        this.initContainer();
    }

    initContainer() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000, onClose = null) {
        if (this.container.children.length >= this.maxVisibleToasts) {
            this.container.removeChild(this.container.firstChild);
        }

        const toast = this.createToast(message, type, onClose);
        this.container.appendChild(toast);

        // Trigger reflow for animation
        toast.offsetHeight;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                if (onClose) onClose();
            }, 300);
        }, duration);
    }

    createToast(message, type, onClose) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = this.getIconForType(type);

        const iconEl = document.createElement('div');
        iconEl.className = 'toast-icon';
        iconEl.innerHTML = icon;

        const contentEl = document.createElement('div');
        contentEl.className = 'toast-content';

        const messageEl = document.createElement('div');
        messageEl.className = 'toast-message';
        messageEl.innerHTML = this.escapeHTML(message);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '<span class="material-icons">close</span>';
        closeBtn.setAttribute('aria-label', 'Close toast');
        closeBtn.addEventListener('click', () => {
            toast.remove();
            if (onClose) onClose();
        });

        contentEl.appendChild(messageEl);
        toast.appendChild(iconEl);
        toast.appendChild(contentEl);
        toast.appendChild(closeBtn);

        return toast;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    getIconForType(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return `<span class="material-icons">${icons[type]}</span>`;
    }

    success(message, duration, onClose) {
        this.show(message, 'success', duration, onClose);
    }

    error(message, duration, onClose) {
        this.show(message, 'error', duration, onClose);
    }

    warning(message, duration, onClose) {
        this.show(message, 'warning', duration, onClose);
    }

    info(message, duration, onClose) {
        this.show(message, 'info', duration, onClose);
    }
}

// Create and export a singleton instance
const toast = new Toast();
export default toast;
