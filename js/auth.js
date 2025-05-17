import toast from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

function initializeAuth() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const form = document.querySelector('#login-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            try {
                // Basic validation
                const email = formData.get('email');
                const password = formData.get('password');
                
                if (!email || !password) {
                    toast.error({
                        title: 'Missing Information',
                        message: 'Please enter both email and password.'
                    });
                    return;
                }

                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Success notification
                toast.success({
                    title: 'Welcome Back!',
                    message: 'Successfully logged in.',
                    duration: 3000
                });

                // Redirect to home page after success
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);

            } catch (error) {
                toast.error({
                    title: 'Login Failed',
                    message: error.message || 'Invalid email or password.'
                });
            } finally {
                // Reset button state
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });

        // Real-time validation
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

    // Handle tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.dataset.tab;
            
            // Update active states
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target form
            document.querySelector(`form#${targetForm}Form`).classList.add('active');
        });
    });

    // Handle password visibility toggles
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            toggle.setAttribute('aria-label', `${type === 'password' ? 'Show' : 'Hide'} password`);
        });
    });

    // Password strength checker
    const passwordInput = document.getElementById('signupPassword');
    const strengthIndicator = document.querySelector('.password-strength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = checkPasswordStrength(password);
            
            strengthIndicator.className = 'password-strength';
            strengthIndicator.classList.add(strength.class);
            strengthIndicator.textContent = strength.message;
        });
    }

    // Form submissions
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }
}

function checkPasswordStrength(password) {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const strength = 
        (hasLower ? 1 : 0) + 
        (hasUpper ? 1 : 0) + 
        (hasNumber ? 1 : 0) + 
        (hasSpecial ? 1 : 0) + 
        (isLongEnough ? 1 : 0);
    
    if (strength < 3) {
        return { class: 'weak', message: 'Weak - Add uppercase, numbers, or special characters' };
    } else if (strength < 5) {
        return { class: 'moderate', message: 'Moderate - Add more character types for stronger password' };
    }
    return { class: 'strong', message: 'Strong password' };
}

async function handleSignIn(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#email').value;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Signing in...';
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Successful login would redirect here
        window.location.href = '/dashboard';
        
    } catch (error) {
        showError(form, 'Invalid email or password');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const password = form.querySelector('#signupPassword').value;
    const confirmPassword = form.querySelector('#signupPasswordConfirm').value;
    
    if (password !== confirmPassword) {
        showError(form, 'Passwords do not match');
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating account...';
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success and switch to sign in
        showSuccess(form, 'Account created successfully! You can now sign in.');
        setTimeout(() => {
            document.querySelector('[data-tab="signin"]').click();
        }, 2000);
        
    } catch (error) {
        showError(form, 'Error creating account. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create account';
    }
}

function showError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-message error';
    errorDiv.textContent = message;
    
    // Remove any existing messages
    form.querySelectorAll('.auth-message').forEach(msg => msg.remove());
    
    // Add new message
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(form, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'auth-message success';
    successDiv.textContent = message;
    
    // Remove any existing messages
    form.querySelectorAll('.auth-message').forEach(msg => msg.remove());
    
    // Add new message
    form.insertBefore(successDiv, form.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => successDiv.remove(), 5000);
}

export { initializeAuth };
