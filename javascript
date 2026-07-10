Absolutely. The main issues were:

Missing } after the currentYear block.
The text CHEK THIS CODE OUT SEE WHATS WRONG WITH IT inside the script.
HTML entities (&gt;, &lt;, &amp;&amp;, =&gt;) that need to be normal JavaScript operators.

Here's a cleaned and fixed version:

const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNavigation = document.getElementById("mainNavigation");
const currentYear = document.getElementById("currentYear");
const heroParticles = document.getElementById("heroParticles");

// Current Year
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// Header Scroll Effect
function updateHeaderOnScroll() {
  if (!siteHeader) return;

  siteHeader.classList.toggle("scrolled", window.scrollY > 24);
}

updateHeaderOnScroll();

window.addEventListener("scroll", updateHeaderOnScroll, {
  passive: true,
});

// Mobile Menu
if (menuToggle && mainNavigation) {
  menuToggle.addEventListener("click", () => {
    const menuIsOpen = mainNavigation.classList.toggle("is-open");

    document.body.classList.toggle("menu-open", menuIsOpen);

    menuToggle.setAttribute("aria-expanded", String(menuIsOpen));
  });

  mainNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNavigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Reveal Elements
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

// Active Navigation Links
const navigationLinks = [
  ...document.querySelectorAll(".main-navigation a"),
];

const pageSections = navigationLinks
  .map((link) => {
    const selector = link.getAttribute("href");

    if (!selector || !selector.startsWith("#")) return null;

    return document.querySelector(selector);
  })
  .filter(Boolean);

const activeSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navigationLinks.forEach((link) => {
        const sectionId = `#${entry.target.id}`;

        link.classList.toggle(
          "active",
          link.getAttribute("href") === sectionId
        );
      });
    });
  },
  {
    rootMargin: "-42% 0px -48% 0px",
    threshold: 0,
  }
);

pageSections.forEach((section) => {
  activeSectionObserver.observe(section);
});

// Hero Particles
if (heroParticles) {
  const particleCount = window.innerWidth < 700 ? 20 : 40;

  for (let index = 0; index < particleCount; index++) {
    const particle = document.createElement("span");

    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${6 + Math.random() * 9}s`;
    particle.style.animationDelay = `${Math.random() * -14}s`;
    particle.style.opacity = `${0.25 + Math.random() * 0.75}`;

    heroParticles.appendChild(particle);
  }
}

// Counter Animation
const statisticCounters = document.querySelectorAll("[data-count]");

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const targetValue = Number(counter.dataset.count || 0);

      const animationDuration = 1200;
      const startTime = performance.now();

      function animateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(
          elapsedTime / animationDuration,
          1
        );

        const easedProgress =
          1 - Math.pow(1 - progress, 3);

        counter.textContent = Math.round(
          targetValue * easedProgress
        );

        if (progress < 1) {
          requestAnimationFrame(animateCounter);
        }
      }

      requestAnimationFrame(animateCounter);
      counterObserver.unobserve(counter);
    });
  },
  {
    threshold: 0.65,
  }
);

statisticCounters.forEach((counter) => {
  counterObserver.observe(counter);
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetSelector = link.getAttribute("href");

    if (!targetSelector || targetSelector === "#") return;

    const targetElement = document.querySelector(targetSelector);

    if (!targetElement) return;

    event.preventDefault();

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

// Window Resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 860 && mainNavigation) {
    mainNavigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }
});

// Escape Key Closes Menu
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (mainNavigation) {
    mainNavigation.classList.remove("is-open");
  }

  document.body.classList.remove("menu-open");

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }
});


This version is valid JavaScript and should run correctly as long as your HTML contains the required IDs and classes (siteHeader, menuToggle, mainNavigation, heroParticles, etc.).
