// Particle background
function createParticles() {
  const particles = document.getElementById("particles");
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.style.position = "absolute";
    particle.style.background = "rgba(255, 255, 255, 0.2)";
    particle.style.borderRadius = "50%";
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
    "Plan Events Seamlessly",
    "Unleash Epic Moments",
    "Your Events, Elevated",
  ];
  const taglineEl = document.querySelector(".tagline");
  if (!taglineEl) return;
  let index = 0;
  gsap.to(taglineEl, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      taglineEl.textContent = taglines[index];
      gsap.to(taglineEl, { opacity: 1, duration: 0.5 });
      index = (index + 1) % taglines.length;
    },
  });
  setInterval(() => {
    gsap.to(taglineEl, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        taglineEl.textContent = taglines[index];
        gsap.to(taglineEl, { opacity: 1, duration: 0.5 });
        index = (index + 1) % taglines.length;
      },
    });
  }, 4000);
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  document.documentElement.style.setProperty(
    "--bg-dark",
    isLight ? "#f1f5f9" : "#0f172a"
  );
  document.documentElement.style.setProperty(
    "--bg-light",
    isLight ? "#e2e8f0" : "#1e293b"
  );
  document.documentElement.style.setProperty(
    "--text-light",
    isLight ? "#0f172a" : "#e2e8f0"
  );
}

// Ripple effect
function addRipple(e) {
  const btn = e.currentTarget;
  const ripple = document.createElement("span");
  ripple.classList.add("ripple");
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// GSAP animations
document.addEventListener("DOMContentLoaded", () => {
  try {
    createParticles();
    rotateTaglines();

    // Hero animations
    gsap.from(".animate-hero", {
      opacity: 0,
      y: 50,
      duration: 2,
      stagger: 0.3,
      ease: "power3.out",
    });

    // Card animations
    gsap.from(".animate-card", {
      opacity: 0,
      x: -30,
      duration: 1.5,
      stagger: 0.2,
      ease: "power3.out",
    });

    // Button interactions
    document.querySelectorAll(".btn-primary, .btn-secondary").forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, { scale: 1.05, duration: 0.3 });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { scale: 1, duration: 0.3 });
      });
      btn.addEventListener("click", addRipple);
    });

    // Input focus
    document.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("focus", () => {
        gsap.to(input, { borderColor: "#06b6d4", duration: 0.2 });
      });
      input.addEventListener("blur", () => {
        gsap.to(input, { borderColor: "#a78bfa", duration: 0.2 });
      });
    });

    // Theme toggle
    document
      .querySelector(".theme-toggle")
      .addEventListener("click", toggleTheme);
  } catch (error) {
    console.error("Animation error:", error);
  }
});

// Simulate slot availability
function checkSlot(formData) {
  try {
    const status = document.getElementById("status");
    status.innerText = "Checking...";
    setTimeout(() => {
      const isAvailable = Math.random() > 0.5;
      status.innerText = isAvailable ? "Slot Available" : "Slot Unavailable";
      if (isAvailable) {
        document.getElementById("pay-button").classList.remove("hidden");
        localStorage.setItem("event-form-data", JSON.stringify(formData));
      }
    }, 1000);
  } catch (error) {
    console.error("Slot check error:", error);
    document.getElementById("status").innerText = "Error checking slot";
  }
}

// Particle keyframes
const style = document.createElement("style");
style.innerHTML = `
  @keyframes float {
    0% { transform: translateY(0); opacity: 0.5; }
    50% { opacity: 1; }
    100% { transform: translateY(-100vh); opacity: 0.5; }
  }
  .light-theme .form-container, .light-theme .event-card {
    background: rgba(255, 255, 255, 0.9);
    color: #0f172a;
  }
  .light-theme input, .light-theme select {
    background: rgba(0, 0, 0, 0.05);
    color: #0f172a;
  }
`;
document.head.appendChild(style);
