document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Processing...';
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                form.innerHTML = `
                    <div class="success-message">
                        <h3>Registration Successful!</h3>
                        <p>Thank you for registering for the Vaisakhi 5K. Check your email for confirmation details.</p>
                        <div class="confirmation-details">
                            <p><strong>Registration ID:</strong> ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            <p><strong>Name:</strong> ${data.fullName}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                        </div>
                        <a href="/" class="btn btn-primary">Return to Home</a>
                    </div>
                `;
            } catch (error) {
                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'An error occurred. Please try again.';
                form.insertBefore(errorDiv, form.firstChild);
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + '-' + value.slice(3);
                } else {
                    value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
                }
            }
            e.target.value = value;
        });
    });
});
