import toast from './toast.js';

function initializeFAQ() {
    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            answer.style.maxHeight = isOpen ? '0' : `${answer.scrollHeight}px`;
        });
    });

    // Contact Form handling
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            
            try {
                // Basic validation
                const email = formData.get('email');
                const message = formData.get('message');
                
                if (!email || !message) {
                    toast.error({
                        title: 'Missing Information',
                        message: 'Please fill in all required fields.'
                    });
                    return;
                }

                // Show loading state
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Success notification
                toast.success({
                    title: 'Message Sent',
                    message: 'Thank you for your message. We\'ll get back to you soon!',
                    duration: 4000
                });

                // Reset form
                contactForm.reset();

            } catch (error) {
                toast.error({
                    title: 'Message Failed',
                    message: 'Failed to send message. Please try again later.'
                });
            } finally {
                // Reset button state
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Search functionality
    const searchInput = document.querySelector('#faq-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            let matchFound = false;

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(query) || answer.includes(query)) {
                    item.style.display = '';
                    matchFound = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // Show no results message
            const noResults = document.querySelector('.no-results');
            if (query && !matchFound) {
                toast.info({
                    title: 'No Results',
                    message: 'No matching questions found. Try a different search term.',
                    duration: 3000
                });
            }
        });
    }

    // Copy answer to clipboard functionality
    const copyButtons = document.querySelectorAll('.copy-answer');
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const answer = button.closest('.faq-item').querySelector('.faq-answer').textContent.trim();
            
            try {
                await navigator.clipboard.writeText(answer);
                toast.success({
                    title: 'Copied!',
                    message: 'Answer copied to clipboard',
                    duration: 2000
                });
            } catch (err) {
                toast.error({
                    title: 'Copy Failed',
                    message: 'Failed to copy text to clipboard',
                    duration: 3000
                });
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeFAQ);

export { initializeFAQ };
