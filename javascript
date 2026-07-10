```javascript
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNavigation = document.getElementById("mainNavigation");
const currentYear = document.getElementById("currentYear");
const heroParticles = document.getElementById("heroParticles");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function updateHeaderOnScroll() {
  if (!siteHeader) return;

  siteHeader.classList.toggle("scrolled", window.scrollY > 24);
}

updateHeaderOnScroll();

window.addEventListener("scroll", updateHeaderOnScroll, {
  passive: true
});

if (menuToggle && mainNavigation) {
  menuToggle.addEventListener("click", () => {
    const menuIsOpen = mainNavigation.classList.toggle("is-open");

    document.body.classList.toggle("menu-open", menuIsOpen);

    menuToggle.setAttribute(
      "aria-expanded",
      String(menuIsOpen)
    );
  });

  mainNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNavigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });
}

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
    threshold: 0.16
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

const navigationLinks = [
  ...document.querySelectorAll(".main-navigation a")
];

const pageSections = navigationLinks
  .map((link) => {
    const selector = link.getAttribute("href");

    if (!selector || !selector.startsWith("#")) {
      return null;
    }

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
    threshold: 0
  }
);

pageSections.forEach((section) => {
  activeSectionObserver.observe(section);
});

if (heroParticles) {
  const particleCount =
    window.innerWidth < 700 ? 20 : 40;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");

    particle.className = "particle";

    particle.style.left =
      `${Math.random() * 100}%`;

    particle.style.animationDuration =
      `${6 + Math.random() * 9}s`;

    particle.style.animationDelay =
      `${Math.random() * -14}s`;

    particle.style.opacity =
      `${0.25 + Math.random() * 0.75}`;

    heroParticles.appendChild(particle);
  }
}

const statisticCounters =
  document.querySelectorAll("[data-count]");

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const targetValue =
        Number(counter.dataset.count || 0);

      const animationDuration = 1200;
      const startTime = performance.now();

      function animateCounter(currentTime) {
        const elapsedTime =
          currentTime - startTime;

        const progress = Math.min(
          elapsedTime / animationDuration,
          1
        );

        const easedProgress =
          1 - Math.pow(1 - progress, 3);

        counter.textContent =
          Math.round(targetValue * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animateCounter);
        }
      }

      requestAnimationFrame(animateCounter);

      counterObserver.unobserve(counter);
    });
  },
  {
    threshold: 0.65
  }
);

statisticCounters.forEach((counter) => {
  counterObserver.observe(counter);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetSelector =
      link.getAttribute("href");

    if (!targetSelector || targetSelector === "#") {
      return;
    }

    const targetElement =
      document.querySelector(targetSelector);

    if (!targetElement) {
      return;
    }

    event.preventDefault();

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860 && mainNavigation) {
    mainNavigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (mainNavigation) {
    mainNavigation.classList.remove("is-open");
  }

  document.body.classList.remove("menu-open");

  if (menuToggle) {
    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }
});
```
