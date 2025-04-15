document.addEventListener('DOMContentLoaded', () => {
    // Animate buttons on hover
    gsap.utils.toArray('.btn-primary, .btn-secondary').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { scale: 1.1, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)', duration: 0.3 });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, boxShadow: 'none', duration: 0.3 });
      });
    });
  
    // Form input focus animation
    gsap.utils.toArray('input, select').forEach(input => {
      input.addEventListener('focus', () => {
        gsap.to(input, { ringColor: '#8b5cf6', duration: 0.2 });
      });
      input.addEventListener('blur', () => {
        gsap.to(input, { ringColor: 'transparent', duration: 0.2 });
      });
    });
  
    // Page load animations
    gsap.from('.animate-fade-in', { opacity: 0, duration: 1, stagger: 0.2 });
    gsap.from('.animate-slide-up', { y: 20, opacity: 0, duration: 0.8, stagger: 0.2 });
  });