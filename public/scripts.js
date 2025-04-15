// GSAP animations for cinematic effects
document.addEventListener('DOMContentLoaded', () => {
  // Animate buttons on hover (removed boxShadow to avoid conflict with CSS)
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { scale: 1.1, duration: 0.3 });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.3 });
    });
  });

  // Animate form inputs on focus
  document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, { boxShadow: '0 0 0 2px #8b5cf6', duration: 0.2 });
    });
    input.addEventListener('blur', () => {
      gsap.to(input, { boxShadow: 'none', duration: 0.2 });
    });
  });

  // Page load animations
  gsap.from('.animate-fade-in', { opacity: 0, duration: 1, stagger: 0.2 });
  gsap.from('.animate-slide-up', { y: 20, opacity: 0, duration: 0.8, stagger: 0.2 });
});

// Simulate slot availability
function checkSlot(formData) {
  const status = document.getElementById('status');
  // Randomly simulate available/booked for demo
  const isAvailable = Math.random() > 0.5;
  status.innerText = isAvailable ? 'Slot Available' : 'Slot Unavailable';
  if (isAvailable) {
    document.getElementById('pay-button').classList.remove('hidden');
    // Store form data for success page
    localStorage.setItem('event-form-data', JSON.stringify(formData));
  }
}