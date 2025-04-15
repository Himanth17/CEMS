// Particle background
function createParticles() {
  const particles = document.getElementById('particles');
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.background = 'rgba(255, 255, 255, 0.2)';
    particle.style.borderRadius = '50%';
    particle.style.width = `${Math.random() * 3 + 1}px`;
    particle.style.height = particle.style.width;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animation = `float ${Math.random() * 10 + 5}s infinite`;
    particles.appendChild(particle);
  }
}

// GSAP animations
document.addEventListener('DOMContentLoaded', () => {
  try {
    createParticles();

    // Hero animations
    gsap.from('.animate-hero', {
      opacity: 0,
      y: 50,
      duration: 2,
      stagger: 0.3,
      ease: 'power3.out'
    });

    // Card animations
    gsap.from('.animate-card', {
      opacity: 0,
      x: -30,
      duration: 1.5,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Button hover
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });

    // Input focus
    document.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('focus', () => {
        gsap.to(input, { borderColor: '#06b6d4', duration: 0.2 });
      });
      input.addEventListener('blur', () => {
        gsap.to(input, { borderColor: '#a78bfa', duration: 0.2 });
      });
    });
  } catch (error) {
    console.error('Animation error:', error);
  }
});

// Simulate slot availability
function checkSlot(formData) {
  try {
    const status = document.getElementById('status');
    status.innerText = '';
    // Simulate network delay
    setTimeout(() => {
      const isAvailable = Math.random() > 0.5;
      status.innerText = isAvailable ? 'Slot Available' : 'Slot Unavailable';
      if (isAvailable) {
        document.getElementById('pay-button').classList.remove('hidden');
        localStorage.setItem('event-form-data', JSON.stringify(formData));
      }
    }, 500);
  } catch (error) {
    console.error('Slot check error:', error);
    document.getElementById('status').innerText = 'Error checking slot';
  }
}

// Particle animation keyframes
const style = document.createElement('style');
style.innerHTML = `
  @keyframes float {
    0% { transform: translateY(0); opacity: 0.5; }
    50% { opacity: 1; }
    100% { transform: translateY(-100vh); opacity: 0.5; }
  }
`;
document.head.appendChild(style);