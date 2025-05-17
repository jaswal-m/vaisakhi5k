import toast from './toast.js';

function initializeRegistration() {
    const form = document.querySelector('#registration-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            // Basic validation
            const email = formData.get('email');
            const name = formData.get('name');
            
            if (!email || !name) {
                toast.error({
                    title: 'Missing Information',
                    message: 'Please fill in all required fields.'
                });
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success notification
            toast.success({
                title: 'Registration Complete',
                message: 'Thank you for registering! Check your email for confirmation.'
            });

            // Reset form
            form.reset();

        } catch (error) {
            toast.error({
                title: 'Registration Failed',
                message: error.message || 'Please try again later.'
            });
        } finally {
            // Reset button state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Real-time validation feedback
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            if (emailInput.value && !emailInput.value.includes('@')) {
                toast.warning({
                    title: 'Invalid Email',
                    message: 'Please enter a valid email address.',
                    duration: 3000
                });
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeRegistration);

export { initializeRegistration };
