document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            authForms.forEach(form => {
                if (form.id === `${targetTab}Form`) {
                    form.classList.remove('hidden');
                } else {
                    form.classList.add('hidden');
                }
            });
        });
    });

    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            
            // Update toggle icon
            const icon = toggle.querySelector('.eye-icon');
            icon.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });

    // Form validation and submission
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Redirect to dashboard (in real app, this would happen after successful API response)
                window.location.href = '/dashboard';
            } catch (error) {
                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Invalid email or password';
                loginForm.insertBefore(errorDiv, loginForm.firstChild);
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validate passwords match
            if (data.password !== data.confirmPassword) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Passwords do not match';
                signupForm.insertBefore(errorDiv, signupForm.firstChild);
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = signupForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating account...';
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                signupForm.innerHTML = `
                    <div class="success-message">
                        <h3>Account Created!</h3>
                        <p>Welcome to Vaisakhi 5K! Please check your email to verify your account.</p>
                        <div class="verification-info">
                            <p>We've sent a verification link to:</p>
                            <p><strong>${data.email}</strong></p>
                        </div>
                        <button class="btn btn-primary" onclick="location.reload()">Return to Login</button>
                    </div>
                `;
            } catch (error) {
                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'An error occurred. Please try again.';
                signupForm.insertBefore(errorDiv, signupForm.firstChild);
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Password strength indicator
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        if (input.id === 'signupPassword') {
            const strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            input.parentElement.appendChild(strengthIndicator);
            
            input.addEventListener('input', () => {
                const password = input.value;
                let strength = 0;
                let message = '';
                
                // Length check
                if (password.length >= 8) strength++;
                
                // Uppercase check
                if (/[A-Z]/.test(password)) strength++;
                
                // Lowercase check
                if (/[a-z]/.test(password)) strength++;
                
                // Number check
                if (/[0-9]/.test(password)) strength++;
                
                // Special character check
                if (/[^A-Za-z0-9]/.test(password)) strength++;
                
                // Update indicator
                switch(strength) {
                    case 0:
                    case 1:
                        message = 'Weak';
                        strengthIndicator.className = 'password-strength weak';
                        break;
                    case 2:
                    case 3:
                        message = 'Moderate';
                        strengthIndicator.className = 'password-strength moderate';
                        break;
                    case 4:
                    case 5:
                        message = 'Strong';
                        strengthIndicator.className = 'password-strength strong';
                        break;
                }
                
                strengthIndicator.textContent = message;
            });
        }
    });
});
