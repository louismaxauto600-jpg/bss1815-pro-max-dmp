/**
 * BSS1815 PRO-MAX DMP
 * Core Application Controller
 * Version: 1.0.0
 */

"use strict";

const PRO_MAX_APP = {
  name: "BSS1815 PRO-MAX DMP",
  version: "1.0.0",
  defaultProject: "dashboard",

  projects: {
    dashboard: {
      id: "dashboard",
      name: "Dashboard",
      path: "index.html"
    },

    bss1815: {
      id: "bss1815",
      name: "Briyant Solèy Signo 1815",
      path: "pages/bss1815/index.html"
    },

    proMaxFM: {
      id: "pro-max-fm",
      name: "PRO-MAX FM",
      path: "pages/pro-max-fm/index.html"
    },

    maximax: {
      id: "maximax",
      name: "Maximax Multi Services",
      path: "pages/maximax/index.html"
    },

    academy: {
      id: "academy",
      name: "PRO-MAX Academy",
      path: "pages/academy/index.html"
    }
  },

  sharedModules: {
    aiCenter: {
      id: "ai-center",
      name: "AI Center",
      path: "modules/ai-center/index.html"
    },

    communication: {
      id: "communication",
      name: "Communication Center",
      path: "modules/communication/index.html"
    },

    documents: {
      id: "documents",
      name: "Document Center",
      path: "modules/documents/index.html"
    },

    registry: {
      id: "registry",
      name: "Digital Registry",
      path: "modules/registry/index.html"
    },

    reports: {
      id: "reports",
      name: "Reports & Analytics",
      path: "modules/reports/index.html"
    },

    settings: {
      id: "settings",
      name: "System Settings",
      path: "modules/settings/index.html"
    }
  }
};

/**
 * Start the platform.
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeApplication();
});

function initializeApplication() {
  initializeMobileMenu();
  initializeNavigation();
  initializeProjectCards();
  initializeModuleCards();
  initializeLanguageDisplay();
  initializeActiveNavigation();
  initializeBackButtons();
  initializeCurrentYear();

  console.info(
    `${PRO_MAX_APP.name} v${PRO_MAX_APP.version} initialized successfully.`
  );
}

/**
 * Mobile navigation menu.
 */
function initializeMobileMenu() {
  const menuButton = document.querySelector(
    "[data-menu-toggle], #menu-toggle, .menu-toggle"
  );

  const navigation = document.querySelector(
    "[data-main-nav], #main-nav, .main-nav"
  );

  if (!menuButton || !navigation) {
    return;
  }

  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");

    menuButton.classList.toggle("is-active", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      menuButton.classList.remove("is-active");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

/**
 * Standard navigation links.
 *
 * Example:
 * <a href="pages/academy/index.html" data-navigation-link>
 */
function initializeNavigation() {
  const navigationLinks = document.querySelectorAll(
    "[data-navigation-link]"
  );

  navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const destination = link.getAttribute("href");

      if (!destination || destination === "#") {
        event.preventDefault();
        return;
      }

      setLastVisitedPage(window.location.pathname);
    });
  });
}

/**
 * Project cards.
 *
 * Example:
 * <button data-project="academy">Open Academy</button>
 */
function initializeProjectCards() {
  const projectButtons = document.querySelectorAll("[data-project]");

  projectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const projectId = button.dataset.project;
      openProject(projectId);
    });
  });
}

/**
 * Shared module cards.
 *
 * Example:
 * <button data-module="ai-center">Open AI Center</button>
 */
function initializeModuleCards() {
  const moduleButtons = document.querySelectorAll("[data-module]");

  moduleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const moduleId = button.dataset.module;
      openModule(moduleId);
    });
  });
}

/**
 * Open one of the four principal projects.
 */
function openProject(projectId) {
  const project = Object.values(PRO_MAX_APP.projects).find(
    (item) => item.id === projectId
  );

  if (!project) {
    showApplicationMessage(
      "Pwojè sa a poko disponib.",
      "error"
    );
    return;
  }

  saveActiveProject(project.id);
  navigateTo(project.path);
}

/**
 * Open a shared platform module.
 */
function openModule(moduleId) {
  const module = Object.values(PRO_MAX_APP.sharedModules).find(
    (item) => item.id === moduleId
  );

  if (!module) {
    showApplicationMessage(
      "Modil sa a poko disponib.",
      "error"
    );
    return;
  }

  saveActiveModule(module.id);
  navigateTo(module.path);
}

/**
 * Secure page navigation.
 */
function navigateTo(path) {
  if (!path || typeof path !== "string") {
    showApplicationMessage(
      "Adrès paj la pa valab.",
      "error"
    );
    return;
  }

  window.location.href = path;
}

/**
 * Highlight active navigation link.
 */
function initializeActiveNavigation() {
  const currentPage = normalizePath(window.location.pathname);

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    const linkPath = normalizePath(
      new URL(href, window.location.href).pathname
    );

    if (linkPath === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function normalizePath(path) {
  return path
    .replace(/\/index\.html$/i, "/")
    .replace(/\/+$/, "/")
    .toLowerCase();
}

/**
 * Back buttons.
 *
 * Example:
 * <button data-back-button>Back</button>
 */
function initializeBackButtons() {
  document.querySelectorAll("[data-back-button]").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      navigateTo(getPlatformHomePath());
    });
  });
}

/**
 * Return the correct homepage path based on folder depth.
 */
function getPlatformHomePath() {
  const pathname = window.location.pathname;
  const depth = pathname.split("/").filter(Boolean).length;

  if (depth <= 1) {
    return "index.html";
  }

  return "../".repeat(Math.max(depth - 1, 1)) + "index.html";
}

/**
 * Display the current selected language.
 */
function initializeLanguageDisplay() {
  const savedLanguage =
    localStorage.getItem("proMaxLanguage") || "ht";

  document.documentElement.lang = savedLanguage;

  document
    .querySelectorAll("[data-current-language]")
    .forEach((element) => {
      element.textContent = savedLanguage.toUpperCase();
    });
}

/**
 * Save and retrieve platform state.
 */
function saveActiveProject(projectId) {
  localStorage.setItem("proMaxActiveProject", projectId);
}

function getActiveProject() {
  return (
    localStorage.getItem("proMaxActiveProject") ||
    PRO_MAX_APP.defaultProject
  );
}

function saveActiveModule(moduleId) {
  localStorage.setItem("proMaxActiveModule", moduleId);
}

function getActiveModule() {
  return localStorage.getItem("proMaxActiveModule");
}

function setLastVisitedPage(path) {
  sessionStorage.setItem("proMaxLastVisitedPage", path);
}

function getLastVisitedPage() {
  return sessionStorage.getItem("proMaxLastVisitedPage");
}

/**
 * Current copyright year.
 *
 * Example:
 * <span data-current-year></span>
 */
function initializeCurrentYear() {
  const year = new Date().getFullYear();

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(year);
  });
}

/**
 * Platform notification message.
 */
function showApplicationMessage(message, type = "info") {
  const existingMessage = document.querySelector(
    ".pro-max-app-message"
  );

  if (existingMessage) {
    existingMessage.remove();
  }

  const messageBox = document.createElement("div");

  messageBox.className =
    `pro-max-app-message pro-max-app-message--${type}`;

  messageBox.setAttribute("role", "alert");
  messageBox.textContent = message;

  document.body.appendChild(messageBox);

  window.setTimeout(() => {
    messageBox.classList.add("is-visible");
  }, 20);

  window.setTimeout(() => {
    messageBox.classList.remove("is-visible");

    window.setTimeout(() => {
      messageBox.remove();
    }, 300);
  }, 3500);
}

/**
 * Generic confirmation utility.
 */
function confirmPlatformAction(message) {
  return window.confirm(message);
}

/**
 * Expose selected functions globally so HTML buttons
 * can call them when necessary.
 */
window.PRO_MAX_APP = PRO_MAX_APP;
window.openProject = openProject;
window.openModule = openModule;
window.navigateTo = navigateTo;
window.showApplicationMessage = showApplicationMessage;
window.confirmPlatformAction = confirmPlatformAction;
window.getActiveProject = getActiveProject;
window.getActiveModule = getActiveModule;
