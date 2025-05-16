function initializeFAQ() {
    // Accordion functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        // Initialize aria-expanded attribute
        if (!header.hasAttribute('aria-expanded')) {
            header.setAttribute('aria-expanded', 'false');
        }

        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            
            // Close all other items in the same section
            const section = header.closest('.faq-section');
            section.querySelectorAll('.accordion-header').forEach(otherHeader => {
                if (otherHeader !== header && otherHeader.getAttribute('aria-expanded') === 'true') {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherHeader.nextElementSibling.hidden = true;
                }
            });

            // Toggle current item
            const newExpandedState = !isExpanded;
            header.setAttribute('aria-expanded', newExpandedState);
            content.hidden = !newExpandedState;
        });
    });

    // URL hash handling for direct links to FAQ sections
    const handleHash = () => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const targetSection = document.querySelector(`#${hash}`);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash(); // Handle hash on page load
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeFAQ);

// Export for router
window.initializeFAQ = initializeFAQ;
