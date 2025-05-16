let countdownInterval = null;

function initializeCountdown() {
    const raceDate = new Date('2025-05-14T07:00:00-04:00');
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');

    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Make sure all elements exist
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        console.warn('Countdown elements not found');
        return;
    }

    function updateCountdown() {
        const now = new Date();
        const diff = raceDate - now;

        if (diff <= 0) {
            // Race day has arrived
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Add leading zeros
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');

        // Add animation class when numbers change
        if (seconds === 59) {
            minutesEl.classList.add('flip');
            setTimeout(() => minutesEl.classList.remove('flip'), 300);
        }
        if (minutes === 59 && seconds === 59) {
            hoursEl.classList.add('flip');
            setTimeout(() => hoursEl.classList.remove('flip'), 300);
        }
        if (hours === 23 && minutes === 59 && seconds === 59) {
            daysEl.classList.add('flip');
            setTimeout(() => daysEl.classList.remove('flip'), 300);
        }
    }

    // Update countdown every second
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}
