/**
 * BSS1815 PRO-MAX DMP
 * Central Dashboard Controller
 * Version: 1.0.0
 */

"use strict";

const PRO_MAX_DASHBOARD = {
  projects: [
    {
      id: "bss1815",
      name: "Briyant Solèy Signo 1815",
      description: {
        ht: "Jesyon òganizasyon, manm, evènman ak kominote.",
        fr: "Gestion de l’organisation, des membres, des événements et de la communauté.",
        en: "Organization, member, event, and community management."
      },
      icon: "🏛️",
      path: "pages/bss1815/index.html",
      permission: "projects.view"
    },
    {
      id: "pro-max-fm",
      name: "PRO-MAX FM",
      description: {
        ht: "Radyo dijital, emisyon, mizik, podcast ak nouvèl.",
        fr: "Radio numérique, émissions, musique, podcasts et actualités.",
        en: "Digital radio, shows, music, podcasts, and news."
      },
      icon: "📻",
      path: "pages/pro-max-fm/index.html",
      permission: "projects.view"
    },
    {
      id: "maximax",
      name: "Maximax Multi Services",
      description: {
        ht: "Sèvis pwofesyonèl, dokiman ak asistans kliyan.",
        fr: "Services professionnels, documents et assistance clientèle.",
        en: "Professional services, documents, and customer assistance."
      },
      icon: "🏢",
      path: "pages/maximax/index.html",
      permission: "projects.view"
    },
    {
      id: "academy",
      name: "PRO-MAX Academy",
      description: {
        ht: "Kou, fòmasyon, egzamen ak sètifika nan twa lang.",
        fr: "Cours, formations, examens et certificats en trois langues.",
        en: "Courses, training, exams, and certificates in three languages."
      },
      icon: "🎓",
      path: "pages/academy/index.html",
      permission: "academy.view"
    }
  ],

  modules: [
    {
      id: "ai-center",
      name: {
        ht: "Sant AI",
        fr: "Centre IA",
        en: "AI Center"
      },
      icon: "🤖",
      path: "modules/ai-center/index.html",
      permission: "modules.view"
    },
    {
      id: "communication",
      name: {
        ht: "Sant Kominikasyon",
        fr: "Centre de communication",
        en: "Communication Center"
      },
      icon: "📢",
      path: "modules/communication/index.html",
      permission: "communication.view"
    },
    {
      id: "documents",
      name: {
        ht: "Sant Dokiman",
        fr: "Centre de documents",
        en: "Document Center"
      },
      icon: "📄",
      path: "modules/documents/index.html",
      permission: "documents.view"
    },
    {
      id: "registry",
      name: {
        ht: "Rejis Dijital",
        fr: "Registre numérique",
        en: "Digital Registry"
      },
      icon: "👥",
      path: "modules/registry/index.html",
      permission: "modules.view"
    },
    {
      id: "reports",
      name: {
        ht: "Rapò ak Analiz",
        fr: "Rapports et analyses",
        en: "Reports and Analytics"
      },
      icon: "📊",
      path: "modules/reports/index.html",
      permission: "reports.view"
    },
    {
      id: "settings",
      name: {
        ht: "Paramèt Sistèm",
        fr: "Paramètres du système",
        en: "System Settings"
      },
      icon: "⚙️",
      path: "modules/settings/index.html",
      permission: "modules.manage"
    }
  ],

  statistics: {
    users: 0,
    projects: 4,
    modules: 6,
    notifications: 0
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard();
});

function initializeDashboard() {
  protectDashboard();
  displayDashboardUser();
  displayDashboardDate();
  renderProjectCards();
  renderModuleCards();
  renderDashboardStatistics();
  initializeDashboardSearch();
  initializeDashboardButtons();
  initializeDashboardLanguageUpdates();

  console.info("BSS1815 PRO-MAX DMP dashboard initialized.");
}

/**
 * Verify that the user can access the dashboard.
 */
function protectDashboard() {
  const requiresAuthentication =
    document.body?.dataset.authRequired === "true";

  if (
    requiresAuthentication &&
    typeof window.isAuthenticated === "function" &&
    !window.isAuthenticated()
  ) {
    window.location.replace("login.html");
  }
}

/**
 * Display current user information.
 */
function displayDashboardUser() {
  const user =
    typeof window.getCurrentUser === "function"
      ? window.getCurrentUser()
      : null;

  const name =
    user?.displayName ||
    user?.name ||
    user?.email ||
    getDashboardText(
      "Itilizatè",
      "Utilisateur",
      "User"
    );

  document
    .querySelectorAll("[data-dashboard-user-name]")
    .forEach((element) => {
      element.textContent = name;
    });

  document
    .querySelectorAll("[data-dashboard-user-role]")
    .forEach((element) => {
      element.textContent = formatDashboardRole(
        user?.role || "guest"
      );
    });

  document
    .querySelectorAll("[data-dashboard-user-initials]")
    .forEach((element) => {
      element.textContent = createUserInitials(name);
    });
}

/**
 * Display today's date.
 */
function displayDashboardDate() {
  const language = getDashboardLanguage();

  const locales = {
    ht: "fr-HT",
    fr: "fr-FR",
    en: "en-US"
  };

  const formattedDate = new Intl.DateTimeFormat(
    locales[language] || "fr-HT",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  ).format(new Date());

  document
    .querySelectorAll("[data-dashboard-date]")
    .forEach((element) => {
      element.textContent = formattedDate;
    });
}

/**
 * Create the four project cards.
 */
function renderProjectCards() {
  const container = document.querySelector(
    "#dashboard-projects, [data-dashboard-projects]"
  );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const availableProjects =
    PRO_MAX_DASHBOARD.projects.filter((project) =>
      canAccessDashboardItem(project.permission)
    );

  availableProjects.forEach((project) => {
    const card = createProjectCard(project);
    container.appendChild(card);
  });

  if (availableProjects.length === 0) {
    container.innerHTML = `
      <p class="dashboard-empty-message">
        ${getDashboardText(
          "Ou pa gen aksè ak okenn pwojè.",
          "Vous n’avez accès à aucun projet.",
          "You do not have access to any projects."
        )}
      </p>
    `;
  }
}

function createProjectCard(project) {
  const article = document.createElement("article");

  article.className = "dashboard-card project-card";
  article.dataset.projectId = project.id;
  article.tabIndex = 0;

  article.innerHTML = `
    <div class="dashboard-card-icon" aria-hidden="true">
      ${project.icon}
    </div>

    <div class="dashboard-card-content">
      <h3>${escapeDashboardHTML(project.name)}</h3>

      <p>
        ${escapeDashboardHTML(
          getLocalizedDashboardValue(project.description)
        )}
      </p>

      <button
        type="button"
        class="dashboard-card-button"
        data-dashboard-project="${project.id}"
      >
        ${getDashboardText(
          "Louvri pwojè a",
          "Ouvrir le projet",
          "Open project"
        )}
      </button>
    </div>
  `;

  article
    .querySelector("[data-dashboard-project]")
    .addEventListener("click", () => {
      openDashboardProject(project.id);
    });

  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openDashboardProject(project.id);
    }
  });

  return article;
}

/**
 * Create shared module cards.
 */
function renderModuleCards() {
  const container = document.querySelector(
    "#dashboard-modules, [data-dashboard-modules]"
  );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const availableModules =
    PRO_MAX_DASHBOARD.modules.filter((module) =>
      canAccessDashboardItem(module.permission)
    );

  availableModules.forEach((module) => {
    const card = createModuleCard(module);
    container.appendChild(card);
  });

  if (availableModules.length === 0) {
    container.innerHTML = `
      <p class="dashboard-empty-message">
        ${getDashboardText(
          "Ou pa gen aksè ak okenn modil.",
          "Vous n’avez accès à aucun module.",
          "You do not have access to any modules."
        )}
      </p>
    `;
  }
}

function createModuleCard(module) {
  const article = document.createElement("article");

  article.className = "dashboard-card module-card";
  article.dataset.moduleId = module.id;
  article.tabIndex = 0;

  article.innerHTML = `
    <div class="dashboard-card-icon" aria-hidden="true">
      ${module.icon}
    </div>

    <div class="dashboard-card-content">
      <h3>
        ${escapeDashboardHTML(
          getLocalizedDashboardValue(module.name)
        )}
      </h3>

      <button
        type="button"
        class="dashboard-card-button"
        data-dashboard-module="${module.id}"
      >
        ${getDashboardText(
          "Louvri modil la",
          "Ouvrir le module",
          "Open module"
        )}
      </button>
    </div>
  `;

  article
    .querySelector("[data-dashboard-module]")
    .addEventListener("click", () => {
      openDashboardModule(module.id);
    });

  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openDashboardModule(module.id);
    }
  });

  return article;
}

/**
 * Open a project.
 */
function openDashboardProject(projectId) {
  const project = PRO_MAX_DASHBOARD.projects.find(
    (item) => item.id === projectId
  );

  if (!project) {
    showDashboardMessage(
      getDashboardText(
        "Pwojè sa a poko disponib.",
        "Ce projet n’est pas encore disponible.",
        "This project is not available yet."
      ),
      "error"
    );

    return;
  }

  if (!canAccessDashboardItem(project.permission)) {
    showDashboardMessage(
      getDashboardText(
        "Ou pa gen pèmisyon pou louvri pwojè sa a.",
        "Vous n’avez pas la permission d’ouvrir ce projet.",
        "You do not have permission to open this project."
      ),
      "error"
    );

    return;
  }

  localStorage.setItem("proMaxActiveProject", project.id);
  window.location.href = project.path;
}

/**
 * Open a shared module.
 */
function openDashboardModule(moduleId) {
  const module = PRO_MAX_DASHBOARD.modules.find(
    (item) => item.id === moduleId
  );

  if (!module) {
    showDashboardMessage(
      getDashboardText(
        "Modil sa a poko disponib.",
        "Ce module n’est pas encore disponible.",
        "This module is not available yet."
      ),
      "error"
    );

    return;
  }

  if (!canAccessDashboardItem(module.permission)) {
    showDashboardMessage(
      getDashboardText(
        "Ou pa gen pèmisyon pou louvri modil sa a.",
        "Vous n’avez pas la permission d’ouvrir ce module.",
        "You do not have permission to open this module."
      ),
      "error"
    );

    return;
  }

  localStorage.setItem("proMaxActiveModule", module.id);
  window.location.href = module.path;
}

/**
 * Display dashboard statistics.
 */
function renderDashboardStatistics() {
  const statistics = {
    ...PRO_MAX_DASHBOARD.statistics,
    projects: PRO_MAX_DASHBOARD.projects.length,
    modules: PRO_MAX_DASHBOARD.modules.length
  };

  Object.entries(statistics).forEach(([key, value]) => {
    document
      .querySelectorAll(`[data-stat="${key}"]`)
      .forEach((element) => {
        animateStatistic(element, Number(value) || 0);
      });
  });
}

function animateStatistic(element, targetValue) {
  const duration = 500;
  const startingTime = performance.now();

  function updateStatistic(currentTime) {
    const elapsedTime = currentTime - startingTime;
    const progress = Math.min(elapsedTime / duration, 1);

    element.textContent = String(
      Math.floor(targetValue * progress)
    );

    if (progress < 1) {
      requestAnimationFrame(updateStatistic);
    }
  }

  requestAnimationFrame(updateStatistic);
}

/**
 * Search projects and modules.
 */
function initializeDashboardSearch() {
  const searchInput = document.querySelector(
    "#dashboard-search, [data-dashboard-search]"
  );

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", () => {
    const searchValue =
      searchInput.value.trim().toLowerCase();

    filterDashboardCards(searchValue);
  });
}

function filterDashboardCards(searchValue) {
  const cards = document.querySelectorAll(
    ".dashboard-card"
  );

  let visibleCards = 0;

  cards.forEach((card) => {
    const cardText =
      card.textContent.toLowerCase();

    const matchesSearch =
      !searchValue ||
      cardText.includes(searchValue);

    card.hidden = !matchesSearch;

    if (matchesSearch) {
      visibleCards += 1;
    }
  });

  const noResultsMessage = document.querySelector(
    "#dashboard-no-results, [data-dashboard-no-results]"
  );

  if (noResultsMessage) {
    noResultsMessage.hidden =
      visibleCards !== 0;

    noResultsMessage.textContent =
      getDashboardText(
        "Pa gen okenn rezilta.",
        "Aucun résultat trouvé.",
        "No results found."
      );
  }
}

/**
 * Dashboard action buttons.
 */
function initializeDashboardButtons() {
  document
    .querySelectorAll("[data-dashboard-refresh]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        refreshDashboard();
      });
    });

  document
    .querySelectorAll("[data-dashboard-notifications]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        showDashboardMessage(
          getDashboardText(
            "Sant notifikasyon an ap prepare.",
            "Le centre de notifications est en préparation.",
            "The notification center is being prepared."
          ),
          "info"
        );
      });
    });
}

function refreshDashboard() {
  displayDashboardUser();
  displayDashboardDate();
  renderProjectCards();
  renderModuleCards();
  renderDashboardStatistics();

  showDashboardMessage(
    getDashboardText(
      "Tablo kontwòl la mete ajou.",
      "Le tableau de bord a été actualisé.",
      "The dashboard was refreshed."
    ),
    "success"
  );
}

/**
 * Refresh the dashboard after a language change.
 */
function initializeDashboardLanguageUpdates() {
  document.addEventListener(
    "proMaxLanguageChanged",
    () => {
      displayDashboardDate();
      renderProjectCards();
      renderModuleCards();

      const searchInput = document.querySelector(
        "#dashboard-search, [data-dashboard-search]"
      );

      if (searchInput) {
        searchInput.placeholder =
          getDashboardText(
            "Chèche yon pwojè oswa yon modil...",
            "Rechercher un projet ou un module...",
            "Search for a project or module..."
          );
      }
    }
  );
}

/**
 * Permission checking.
 */
function canAccessDashboardItem(permission) {
  const user =
    typeof window.getCurrentUser === "function"
      ? window.getCurrentUser()
      : null;

  if (!user) {
    return permission === "public.view";
  }

  if (
    typeof window.userHasPermission !== "function"
  ) {
    return true;
  }

  if (
    user.role === "super-admin" ||
    window.userHasPermission("*")
  ) {
    return true;
  }

  /*
   * Academy students and instructors can access Academy,
   * even if they do not have the general projects.view permission.
   */
  if (
    permission === "academy.view" &&
    ["student", "instructor"].includes(user.role)
  ) {
    return true;
  }

  return window.userHasPermission(permission);
}

/**
 * Language helpers.
 */
function getDashboardLanguage() {
  if (
    typeof window.getCurrentLanguage === "function"
  ) {
    return window.getCurrentLanguage();
  }

  return localStorage.getItem("proMaxLanguage") || "ht";
}

function getDashboardText(
  creoleText,
  frenchText,
  englishText
) {
  const language = getDashboardLanguage();

  if (language === "fr") {
    return frenchText;
  }

  if (language === "en") {
    return englishText;
  }

  return creoleText;
}

function getLocalizedDashboardValue(value) {
  if (typeof value === "string") {
    return value;
  }

  const language = getDashboardLanguage();

  return (
    value?.[language] ||
    value?.ht ||
    value?.fr ||
    value?.en ||
    ""
  );
}

/**
 * General helpers.
 */
function showDashboardMessage(message, type = "info") {
  if (
    typeof window.showApplicationMessage === "function"
  ) {
    window.showApplicationMessage(message, type);
    return;
  }

  window.alert(message);
}

function formatDashboardRole(role) {
  const roles = {
    "super-admin": "Super Admin",
    admin: "Admin",
    moderator: getDashboardText(
      "Moderatè",
      "Modérateur",
      "Moderator"
    ),
    instructor: getDashboardText(
      "Fòmatè",
      "Formateur",
      "Instructor"
    ),
    student: getDashboardText(
      "Elèv",
      "Étudiant",
      "Student"
    ),
    member: getDashboardText(
      "Manm",
      "Membre",
      "Member"
    ),
    staff: "Staff",
    guest: "Guest"
  };

  return roles[role] || role;
}

function createUserInitials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function escapeDashboardHTML(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

/**
 * Public dashboard functions.
 */
window.PRO_MAX_DASHBOARD = PRO_MAX_DASHBOARD;
window.openDashboardProject = openDashboardProject;
window.openDashboardModule = openDashboardModule;
window.refreshDashboard = refreshDashboard;
