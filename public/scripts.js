// Particle background
function createParticles() {
  const particles = document.getElementById('particles');
  if (!particles) return;
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

// Tagline rotator
function rotateTaglines() {
  const taglines = [
    'Plan Events Seamlessly',
    'Unleash Epic Moments',
    'Your Events, Elevated'
  ];
  const taglineEl = document.querySelector('.tagline');
  if (!taglineEl) return;
  let index = 0;
  gsap.to(taglineEl, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      taglineEl.textContent = taglines[index];
      gsap.to(taglineEl, { opacity: 1, duration: 0.5 });
      index = (index + 1) % taglines.length;
    }
  });
  setInterval(() => {
    gsap.to(taglineEl, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        taglineEl.textContent = taglines[index];
        gsap.to(taglineEl, { opacity: 1, duration: 0.5 });
        index = (index + 1) % taglines.length;
      }
    });
  }, 4000);
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  document.documentElement.style.setProperty('--bg-dark', isLight ? '#f1f5f9' : '#0f172a');
  document.documentElement.style.setProperty('--bg-light', isLight ? '#e2e8f0' : '#1e293b');
  document.documentElement.style.setProperty('--text-light', isLight ? '#0f172a' : '#e2e8f0');
}

// Ripple effect
function addRipple(e) {
  const btn = e.currentTarget;
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// GSAP animations and popup handlers
function initializeAnimations() {
  try {
    createParticles();
    rotateTaglines();

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

    // Button interactions
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-google').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { scale: 1.05, duration: 0.3 });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.3 });
      });
      btn.addEventListener('click', addRipple);
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

    // Theme toggle
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    // Club and highlight card hover
    document.querySelectorAll('.club-card, .highlight-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.05, duration: 0.3 });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.3 });
      });
    });

  } catch (error) {
    console.error('Animation error:', error);
  }
}

// Popup handlers
function initializePopups() {
  const aboutLink = document.getElementById('about-link');
  const aboutPopup = document.getElementById('about-popup');
  const contactLink = document.getElementById('contact-link');
  const contactPopup = document.getElementById('contact-popup');
  const highlightsLink = document.getElementById('highlights-link');

  if (aboutLink && aboutPopup) {
    console.log('Binding About popup events');
    aboutLink.addEventListener('mouseenter', (e) => {
      const rect = aboutLink.getBoundingClientRect();
      aboutPopup.style.left = `${rect.left + window.scrollX}px`;
      aboutPopup.style.top = `${rect.top + window.scrollY - aboutPopup.offsetHeight - 10}px`;
      aboutPopup.classList.add('visible');
      gsap.to(aboutPopup, { opacity: 1, duration: 0.3 });
    });
    aboutLink.addEventListener('mouseleave', () => {
      aboutPopup.classList.remove('visible');
      gsap.to(aboutPopup, { opacity: 0, duration: 0.3 });
    });
  } else {
    console.error('About link or popup not found:', { aboutLink, aboutPopup });
  }

  if (contactLink && contactPopup) {
    console.log('Binding Contact popup events');
    contactLink.addEventListener('mouseenter', (e) => {
      const rect = contactLink.getBoundingClientRect();
      contactPopup.style.left = `${rect.left + window.scrollX}px`;
      contactPopup.style.top = `${rect.top + window.scrollY - contactPopup.offsetHeight - 10}px`;
      contactPopup.classList.add('visible');
      gsap.to(contactPopup, { opacity: 1, duration: 0.3 });
    });
    contactLink.addEventListener('mouseleave', () => {
      contactPopup.classList.remove('visible');
      gsap.to(contactPopup, { opacity: 0, duration: 0.3 });
    });
  } else {
    console.error('Contact link or popup not found:', { contactLink, contactPopup });
  }

  if (highlightsLink) {
    console.log('Binding Highlights link events');
    highlightsLink.addEventListener('click', (e) => {
      e.preventDefault();
      const highlightsSection = document.getElementById('highlights');
      if (highlightsSection) {
        highlightsSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error('Highlights section not found');
      }
    });
  } else {
    console.error('Highlights link not found');
  }
}

// Initialize on window load to ensure DOM is ready
window.addEventListener('load', () => {
  console.log('Window loaded, initializing animations and popups');
  initializeAnimations();
  initializePopups();
});

// Simulate slot availability
function checkSlot(formData) {
  try {
    const status = document.getElementById('status');
    status.innerText = 'Checking...';
    setTimeout(() => {
      const isAvailable = Math.random() > 0.5;
      status.innerText = isAvailable ? 'Slot Available' : 'Slot Unavailable';
      if (isAvailable) {
        document.getElementById('pay-button').classList.remove('hidden');
        localStorage.setItem('event-form-data', JSON.stringify(formData));
      }
    }, 1000);
  } catch (error) {
    console.error('Slot check error:', error);
    document.getElementById('status').innerText = 'Error checking slot';
  }
}

// Particle keyframes
const style = document.createElement('style');
style.innerHTML = `
  @keyframes float {
    0% { transform: translateY(0); opacity: 0.5; }
    50% { opacity: 1; }
    100% { transform: translateY(-100vh); opacity: 0.5; }
  }
  .light-theme .form-container, .light-theme .event-card, .light-theme .club-card, .light-theme .highlight-card {
    background: rgba(255, 255, 255, 0.9);
    color: #0f172a;
  }
  .light-theme input, .light-theme select {
    background: rgba(0, 0, 0, 0.05);
    color: #0f172a;
  }
  .light-theme .popup {
    background: rgba(255, 255, 255, 0.9);
    color: #0f172a;
  }
`;
document.head.appendChild(style);