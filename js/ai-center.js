/**
 * BSS1815 PRO-MAX DMP
 * Central AI Center Controller
 * Version: 1.0.0
 *
 * Shared by:
 * - Briyant Solèy Signo 1815
 * - PRO-MAX FM
 * - Maximax Multi Services
 * - PRO-MAX Academy
 */

"use strict";

const PRO_MAX_AI_CENTER = {
  version: "1.0.0",

  storageKeys: {
    activeProject: "proMaxActiveProject",
    activeTool: "proMaxActiveAITool",
    history: "proMaxAIHistory",
    settings: "proMaxAISettings"
  },

  projects: {
    bss1815: {
      id: "bss1815",
      name: "Briyant Solèy Signo 1815",
      icon: "🏛️"
    },

    "pro-max-fm": {
      id: "pro-max-fm",
      name: "PRO-MAX FM",
      icon: "📻"
    },

    maximax: {
      id: "maximax",
      name: "Maximax Multi Services",
      icon: "🏢"
    },

    academy: {
      id: "academy",
      name: "PRO-MAX Academy",
      icon: "🎓"
    }
  },

  tools: [
    {
      id: "assistant",
      icon: "🤖",
      name: {
        ht: "Asistan AI",
        fr: "Assistant IA",
        en: "AI Assistant"
      },
      description: {
        ht: "Poze kesyon epi jwenn asistans selon pwojè w ap itilize a.",
        fr: "Posez des questions et obtenez une assistance adaptée au projet utilisé.",
        en: "Ask questions and receive assistance adapted to the active project."
      }
    },

    {
      id: "writer",
      icon: "✍️",
      name: {
        ht: "AI Writer",
        fr: "Rédacteur IA",
        en: "AI Writer"
      },
      description: {
        ht: "Kreye lèt, anons, script, rapò ak lòt dokiman.",
        fr: "Créez des lettres, annonces, scripts, rapports et autres documents.",
        en: "Create letters, announcements, scripts, reports, and other documents."
      }
    },

    {
      id: "translator",
      icon: "🌐",
      name: {
        ht: "Tradiktè AI",
        fr: "Traducteur IA",
        en: "AI Translator"
      },
      description: {
        ht: "Tradui kontni ant Kreyòl, Fransè ak Anglè.",
        fr: "Traduisez du contenu entre le créole, le français et l’anglais.",
        en: "Translate content between Haitian Creole, French, and English."
      }
    },

    {
      id: "voice",
      icon: "🎙️",
      name: {
        ht: "AI Voice Studio",
        fr: "Studio vocal IA",
        en: "AI Voice Studio"
      },
      description: {
        ht: "Prepare script pou radyo, prezantasyon, videyo ak narasyon.",
        fr: "Préparez des scripts pour la radio, les présentations, les vidéos et la narration.",
        en: "Prepare scripts for radio, presentations, videos, and narration."
      }
    },

    {
      id: "image",
      icon: "🎨",
      name: {
        ht: "AI Image Studio",
        fr: "Studio d’images IA",
        en: "AI Image Studio"
      },
      description: {
        ht: "Prepare deskripsyon ak prompt pou kreye vizyèl pwofesyonèl.",
        fr: "Préparez des descriptions et des prompts pour créer des visuels professionnels.",
        en: "Prepare descriptions and prompts for professional visuals."
      }
    },

    {
      id: "analytics",
      icon: "📊",
      name: {
        ht: "AI Analytics",
        fr: "Analyse IA",
        en: "AI Analytics"
      },
      description: {
        ht: "Analize aktivite, rapò ak done platfòm nan.",
        fr: "Analysez l’activité, les rapports et les données de la plateforme.",
        en: "Analyze platform activity, reports, and data."
      }
    },

    {
      id: "tutor",
      icon: "🧑‍🏫",
      name: {
        ht: "AI Tutor",
        fr: "Tuteur IA",
        en: "AI Tutor"
      },
      description: {
        ht: "Ede elèv yo konprann leson, fè egzèsis ak prepare egzamen.",
        fr: "Aidez les étudiants à comprendre les leçons, pratiquer et préparer les examens.",
        en: "Help students understand lessons, practice, and prepare for exams."
      }
    }
  ]
};

const AI_PROJECT_CONTEXTS = {
  bss1815: {
    ht: "Ou ap travay pou Briyant Solèy Signo 1815. Konsantre sou òganizasyon, kominote, manm, evènman, istwa, anons ak dokiman ofisyèl.",
    fr: "Vous travaillez pour Briyant Solèy Signo 1815. Concentrez-vous sur l’organisation, la communauté, les membres, les événements, l’histoire, les annonces et les documents officiels.",
    en: "You are working for Briyant Solèy Signo 1815. Focus on organization, community, members, events, history, announcements, and official documents."
  },

  "pro-max-fm": {
    ht: "Ou ap travay pou PRO-MAX FM. Konsantre sou radyo, nouvèl, mizik, podcast, entèvyou, emisyon ak pwodiksyon medya.",
    fr: "Vous travaillez pour PRO-MAX FM. Concentrez-vous sur la radio, les actualités, la musique, les podcasts, les interviews, les émissions et la production médiatique.",
    en: "You are working for PRO-MAX FM. Focus on radio, news, music, podcasts, interviews, programs, and media production."
  },

  maximax: {
    ht: "Ou ap travay pou Maximax Multi Services. Konsantre sou sèvis pwofesyonèl, kliyan, lèt, fòm, dokiman, tradiksyon ak operasyon biznis.",
    fr: "Vous travaillez pour Maximax Multi Services. Concentrez-vous sur les services professionnels, les clients, les lettres, les formulaires, les documents, la traduction et les opérations commerciales.",
    en: "You are working for Maximax Multi Services. Focus on professional services, clients, letters, forms, documents, translation, and business operations."
  },

  academy: {
    ht: "Ou ap travay pou PRO-MAX Academy. Konsantre sou edikasyon, fòmasyon, kou, leson, egzamen, sètifika ak sipò pou elèv.",
    fr: "Vous travaillez pour PRO-MAX Academy. Concentrez-vous sur l’éducation, la formation, les cours, les leçons, les examens, les certificats et l’accompagnement des étudiants.",
    en: "You are working for PRO-MAX Academy. Focus on education, training, courses, lessons, exams, certificates, and student support."
  }
};

let activeAITool = "assistant";
let aiRequestInProgress = false;

document.addEventListener("DOMContentLoaded", () => {
  initializeAICenter();
});

function initializeAICenter() {
  activeAITool =
    localStorage.getItem(
      PRO_MAX_AI_CENTER.storageKeys.activeTool
    ) || "assistant";

  renderAIToolCards();
  initializeAIProjectSelector();
  initializeAIForm();
  initializeAIActionButtons();
  initializeAIHistoryControls();
  initializeAILanguageUpdates();
  updateAIProjectDisplay();
  displayAIHistory();

  console.info(
    `BSS1815 PRO-MAX DMP AI Center v${PRO_MAX_AI_CENTER.version} initialized.`
  );
}

/**
 * Render all AI tool cards.
 */
function renderAIToolCards() {
  const container = document.querySelector(
    "#ai-tools, [data-ai-tools]"
  );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  PRO_MAX_AI_CENTER.tools.forEach((tool) => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "ai-tool-card";
    card.dataset.aiTool = tool.id;

    if (tool.id === activeAITool) {
      card.classList.add("active");
      card.setAttribute("aria-pressed", "true");
    } else {
      card.setAttribute("aria-pressed", "false");
    }

    card.innerHTML = `
      <span class="ai-tool-icon" aria-hidden="true">
        ${tool.icon}
      </span>

      <span class="ai-tool-information">
        <strong>
          ${escapeAIHTML(getAILocalizedValue(tool.name))}
        </strong>

        <small>
          ${escapeAIHTML(
            getAILocalizedValue(tool.description)
          )}
        </small>
      </span>
    `;

    card.addEventListener("click", () => {
      selectAITool(tool.id);
    });

    container.appendChild(card);
  });
}

/**
 * Select the active AI tool.
 */
function selectAITool(toolId) {
  const tool = getAITool(toolId);

  if (!tool) {
    showAIMessage(
      getAIText(
        "Zouti AI sa a pa disponib.",
        "Cet outil IA n’est pas disponible.",
        "This AI tool is unavailable."
      ),
      "error"
    );

    return;
  }

  activeAITool = tool.id;

  localStorage.setItem(
    PRO_MAX_AI_CENTER.storageKeys.activeTool,
    activeAITool
  );

  document.querySelectorAll("[data-ai-tool]").forEach((card) => {
    const isActive = card.dataset.aiTool === activeAITool;

    card.classList.toggle("active", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });

  updateActiveAIToolDisplay();
  updateAIPromptPlaceholder();
}

/**
 * Initialize the project selector.
 */
function initializeAIProjectSelector() {
  const selector = document.querySelector(
    "#ai-project-selector, [data-ai-project-selector]"
  );

  if (!selector) {
    return;
  }

  selector.innerHTML = "";

  Object.values(PRO_MAX_AI_CENTER.projects).forEach((project) => {
    const option = document.createElement("option");

    option.value = project.id;
    option.textContent = `${project.icon} ${project.name}`;

    selector.appendChild(option);
  });

  selector.value = getActiveAIProject();

  selector.addEventListener("change", () => {
    setActiveAIProject(selector.value);
  });
}

/**
 * Active project state.
 */
function getActiveAIProject() {
  const savedProject = localStorage.getItem(
    PRO_MAX_AI_CENTER.storageKeys.activeProject
  );

  if (
    savedProject &&
    PRO_MAX_AI_CENTER.projects[savedProject]
  ) {
    return savedProject;
  }

  return "bss1815";
}

function setActiveAIProject(projectId) {
  if (!PRO_MAX_AI_CENTER.projects[projectId]) {
    return;
  }

  localStorage.setItem(
    PRO_MAX_AI_CENTER.storageKeys.activeProject,
    projectId
  );

  updateAIProjectDisplay();
  updateAIPromptPlaceholder();

  document.dispatchEvent(
    new CustomEvent("proMaxAIProjectChanged", {
      detail: {
        project: projectId
      }
    })
  );
}

function updateAIProjectDisplay() {
  const projectId = getActiveAIProject();
  const project = PRO_MAX_AI_CENTER.projects[projectId];

  document
    .querySelectorAll("[data-ai-active-project]")
    .forEach((element) => {
      element.textContent = project
        ? `${project.icon} ${project.name}`
        : "";
    });

  const selector = document.querySelector(
    "#ai-project-selector, [data-ai-project-selector]"
  );

  if (selector) {
    selector.value = projectId;
  }

  updateActiveAIToolDisplay();
  updateAIPromptPlaceholder();
}

/**
 * Update active tool title.
 */
function updateActiveAIToolDisplay() {
  const tool = getAITool(activeAITool);

  document
    .querySelectorAll("[data-ai-active-tool]")
    .forEach((element) => {
      element.textContent = tool
        ? `${tool.icon} ${getAILocalizedValue(tool.name)}`
        : "";
    });
}

/**
 * Main AI form.
 */
function initializeAIForm() {
  const form = document.querySelector(
    "#ai-form, [data-ai-form]"
  );

  if (!form) {
    return;
  }

  const promptInput = form.querySelector(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  const submitButton = form.querySelector(
    "button[type='submit'], [data-ai-submit]"
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (aiRequestInProgress) {
      return;
    }

    const prompt = promptInput?.value.trim() || "";

    if (!prompt) {
      showAIMessage(
        getAIText(
          "Tanpri ekri sa ou bezwen AI a fè.",
          "Veuillez écrire ce que vous souhaitez que l’IA fasse.",
          "Please write what you want the AI to do."
        ),
        "error"
      );

      promptInput?.focus();
      return;
    }

    setAIButtonLoading(submitButton, true);
    setAIStatus("processing");

    try {
      const request = createAIRequest(prompt);
      const response = await sendAIRequest(request);

      displayAIResponse(response);
      saveAIHistoryItem(request, response);

      setAIStatus("success");

      showAIMessage(
        getAIText(
          "AI a fini prepare repons lan.",
          "L’IA a terminé la réponse.",
          "The AI response is ready."
        ),
        "success"
      );
    } catch (error) {
      console.error("AI request error:", error);

      setAIStatus("error");

      showAIMessage(
        getAIErrorMessage(error),
        "error"
      );
    } finally {
      setAIButtonLoading(submitButton, false);
    }
  });

  updateAIPromptPlaceholder();
}

/**
 * Build a complete request object.
 */
function createAIRequest(prompt) {
  const projectId = getActiveAIProject();
  const language = getAILanguage();

  return {
    id: createAIRequestId(),
    tool: activeAITool,
    project: projectId,
    language,
    context:
      AI_PROJECT_CONTEXTS[projectId]?.[language] ||
      AI_PROJECT_CONTEXTS[projectId]?.ht ||
      "",
    prompt,
    user:
      typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : null,
    createdAt: new Date().toISOString()
  };
}

/**
 * Send the request to the configured AI backend.
 *
 * To connect a real AI service later, define:
 *
 * window.PRO_MAX_AI_API = {
 *   endpoint: "YOUR_SECURE_BACKEND_ENDPOINT",
 *   apiKey: ""
 * };
 *
 * Never place a private OpenAI or other AI API key directly
 * inside this public browser JavaScript file.
 */
async function sendAIRequest(request) {
  aiRequestInProgress = true;

  try {
    const configuration = window.PRO_MAX_AI_API || {};
    const endpoint = configuration.endpoint;

    if (!endpoint) {
      return createAIPrototypeResponse(request);
    }

    const headers = {
      "Content-Type": "application/json"
    };

    if (configuration.apiKey) {
      headers.Authorization = `Bearer ${configuration.apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`ai/http-${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id || request.id,
      content:
        data.content ||
        data.message ||
        data.response ||
        "",
      provider: data.provider || "PRO-MAX AI",
      createdAt:
        data.createdAt || new Date().toISOString()
    };
  } finally {
    aiRequestInProgress = false;
  }
}

/**
 * Temporary prototype response before a secure AI backend is connected.
 */
function createAIPrototypeResponse(request) {
  const tool = getAITool(request.tool);
  const project =
    PRO_MAX_AI_CENTER.projects[request.project];

  const introduction = getAIText(
    `Demann ou an resevwa nan ${project.name}.`,
    `Votre demande a été reçue dans ${project.name}.`,
    `Your request was received in ${project.name}.`
  );

  const toolMessage = getAIText(
    `Zouti chwazi a se ${getAILocalizedValue(tool.name)}.`,
    `L’outil sélectionné est ${getAILocalizedValue(tool.name)}.`,
    `The selected tool is ${getAILocalizedValue(tool.name)}.`
  );

  const connectionMessage = getAIText(
    "Fondasyon AI Center la ap fonksyone. Pou jwenn repons AI reyèl, sistèm nan dwe konekte ak yon backend AI sekirize.",
    "La fondation du Centre IA fonctionne. Pour obtenir de vraies réponses IA, le système doit être connecté à un backend IA sécurisé.",
    "The AI Center foundation is working. To receive real AI responses, the system must be connected to a secure AI backend."
  );

  return {
    id: request.id,
    content: `${introduction}\n\n${toolMessage}\n\n${connectionMessage}`,
    provider: "PRO-MAX AI Prototype",
    createdAt: new Date().toISOString()
  };
}

/**
 * Display the AI response.
 */
function displayAIResponse(response) {
  const output = document.querySelector(
    "#ai-response, [data-ai-response]"
  );

  if (!output) {
    return;
  }

  output.hidden = false;

  if (
    output.tagName === "TEXTAREA" ||
    output.tagName === "INPUT"
  ) {
    output.value = response.content;
  } else {
    output.textContent = response.content;
  }

  document
    .querySelectorAll("[data-ai-provider]")
    .forEach((element) => {
      element.textContent = response.provider || "PRO-MAX AI";
    });

  document
    .querySelectorAll("[data-ai-response-date]")
    .forEach((element) => {
      element.textContent = formatAIDate(
        response.createdAt
      );
    });

  output.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

/**
 * Copy, clear, download, and retry controls.
 */
function initializeAIActionButtons() {
  document
    .querySelectorAll("[data-ai-copy]")
    .forEach((button) => {
      button.addEventListener("click", copyAIResponse);
    });

  document
    .querySelectorAll("[data-ai-clear]")
    .forEach((button) => {
      button.addEventListener("click", clearAIWorkspace);
    });

  document
    .querySelectorAll("[data-ai-download]")
    .forEach((button) => {
      button.addEventListener("click", downloadAIResponse);
    });

  document
    .querySelectorAll("[data-ai-retry]")
    .forEach((button) => {
      button.addEventListener("click", retryLastAIRequest);
    });
}

async function copyAIResponse() {
  const content = getAIResponseContent();

  if (!content) {
    showAIMessage(
      getAIText(
        "Pa gen okenn repons pou kopye.",
        "Il n’y a aucune réponse à copier.",
        "There is no response to copy."
      ),
      "error"
    );

    return;
  }

  try {
    await navigator.clipboard.writeText(content);

    showAIMessage(
      getAIText(
        "Repons lan kopye.",
        "La réponse a été copiée.",
        "The response was copied."
      ),
      "success"
    );
  } catch {
    showAIMessage(
      getAIText(
        "Repons lan pa t kapab kopye.",
        "La réponse n’a pas pu être copiée.",
        "The response could not be copied."
      ),
      "error"
    );
  }
}

function clearAIWorkspace() {
  const promptInput = document.querySelector(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  const output = document.querySelector(
    "#ai-response, [data-ai-response]"
  );

  if (promptInput) {
    promptInput.value = "";
  }

  if (output) {
    if (
      output.tagName === "TEXTAREA" ||
      output.tagName === "INPUT"
    ) {
      output.value = "";
    } else {
      output.textContent = "";
    }

    output.hidden = true;
  }

  setAIStatus("idle");
}

function downloadAIResponse() {
  const content = getAIResponseContent();

  if (!content) {
    showAIMessage(
      getAIText(
        "Pa gen okenn repons pou telechaje.",
        "Il n’y a aucune réponse à télécharger.",
        "There is no response to download."
      ),
      "error"
    );

    return;
  }

  const project = getActiveAIProject();
  const filename =
    `pro-max-ai-${project}-${Date.now()}.txt`;

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

async function retryLastAIRequest() {
  const history = getAIHistory();
  const lastItem = history[0];

  if (!lastItem?.request?.prompt) {
    showAIMessage(
      getAIText(
        "Pa gen okenn demann pou rekòmanse.",
        "Il n’y a aucune demande à relancer.",
        "There is no request to retry."
      ),
      "error"
    );

    return;
  }

  const promptInput = document.querySelector(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  if (promptInput) {
    promptInput.value = lastItem.request.prompt;
    promptInput.focus();
  }
}

/**
 * AI history.
 */
function saveAIHistoryItem(request, response) {
  const history = getAIHistory();

  history.unshift({
    id: request.id,
    request,
    response
  });

  const limitedHistory = history.slice(0, 50);

  localStorage.setItem(
    PRO_MAX_AI_CENTER.storageKeys.history,
    JSON.stringify(limitedHistory)
  );

  displayAIHistory();
}

function getAIHistory() {
  const savedHistory = localStorage.getItem(
    PRO_MAX_AI_CENTER.storageKeys.history
  );

  if (!savedHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(savedHistory);

    return Array.isArray(parsedHistory)
      ? parsedHistory
      : [];
  } catch {
    return [];
  }
}

function displayAIHistory() {
  const container = document.querySelector(
    "#ai-history, [data-ai-history]"
  );

  if (!container) {
    return;
  }

  const history = getAIHistory();

  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = `
      <p class="ai-history-empty">
        ${getAIText(
          "Pa gen okenn aktivite AI ankò.",
          "Il n’y a encore aucune activité IA.",
          "There is no AI activity yet."
        )}
      </p>
    `;

    return;
  }

  history.forEach((item) => {
    const historyItem = document.createElement("article");

    historyItem.className = "ai-history-item";

    const project =
      PRO_MAX_AI_CENTER.projects[
        item.request.project
      ];

    const tool = getAITool(item.request.tool);

    historyItem.innerHTML = `
      <button
        type="button"
        class="ai-history-open"
        data-ai-history-id="${escapeAIHTML(item.id)}"
      >
        <strong>
          ${escapeAIHTML(
            tool
              ? getAILocalizedValue(tool.name)
              : item.request.tool
          )}
        </strong>

        <span>
          ${escapeAIHTML(project?.name || "")}
        </span>

        <small>
          ${escapeAIHTML(
            truncateAIText(item.request.prompt, 90)
          )}
        </small>

        <time>
          ${escapeAIHTML(
            formatAIDate(item.request.createdAt)
          )}
        </time>
      </button>
    `;

    historyItem
      .querySelector("[data-ai-history-id]")
      .addEventListener("click", () => {
        openAIHistoryItem(item.id);
      });

    container.appendChild(historyItem);
  });
}

function openAIHistoryItem(historyId) {
  const item = getAIHistory().find(
    (historyItem) => historyItem.id === historyId
  );

  if (!item) {
    return;
  }

  activeAITool = item.request.tool;

  localStorage.setItem(
    PRO_MAX_AI_CENTER.storageKeys.activeTool,
    activeAITool
  );

  setActiveAIProject(item.request.project);

  const promptInput = document.querySelector(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  if (promptInput) {
    promptInput.value = item.request.prompt;
  }

  displayAIResponse(item.response);
  renderAIToolCards();
}

function initializeAIHistoryControls() {
  document
    .querySelectorAll("[data-ai-clear-history]")
    .forEach((button) => {
      button.addEventListener("click", clearAIHistory);
    });
}

function clearAIHistory() {
  const confirmed =
    typeof window.confirmPlatformAction === "function"
      ? window.confirmPlatformAction(
          getAIText(
            "Èske ou vle efase tout istwa AI a?",
            "Voulez-vous supprimer tout l’historique IA ?",
            "Do you want to delete all AI history?"
          )
        )
      : window.confirm(
          getAIText(
            "Èske ou vle efase tout istwa AI a?",
            "Voulez-vous supprimer tout l’historique IA ?",
            "Do you want to delete all AI history?"
          )
        );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(
    PRO_MAX_AI_CENTER.storageKeys.history
  );

  displayAIHistory();

  showAIMessage(
    getAIText(
      "Istwa AI a efase.",
      "L’historique IA a été supprimé.",
      "AI history was deleted."
    ),
    "success"
  );
}

/**
 * Language changes.
 */
function initializeAILanguageUpdates() {
  document.addEventListener(
    "proMaxLanguageChanged",
    () => {
      renderAIToolCards();
      updateAIProjectDisplay();
      displayAIHistory();
      updateAIPromptPlaceholder();
    }
  );
}

function updateAIPromptPlaceholder() {
  const promptInput = document.querySelector(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  if (!promptInput) {
    return;
  }

  const tool = getAITool(activeAITool);

  promptInput.placeholder = getAIText(
    `Ekri sa ou bezwen ${getAILocalizedValue(tool?.name || "")} fè...`,
    `Écrivez ce que vous souhaitez que ${getAILocalizedValue(tool?.name || "")} fasse...`,
    `Write what you want ${getAILocalizedValue(tool?.name || "")} to do...`
  );
}

/**
 * AI status.
 */
function setAIStatus(status) {
  document
    .querySelectorAll("[data-ai-status]")
    .forEach((element) => {
      element.dataset.status = status;

      const statusTexts = {
        idle: getAIText(
          "Pare",
          "Prêt",
          "Ready"
        ),

        processing: getAIText(
          "AI a ap travay...",
          "L’IA travaille...",
          "AI is working..."
        ),

        success: getAIText(
          "Fini",
          "Terminé",
          "Completed"
        ),

        error: getAIText(
          "Erè",
          "Erreur",
          "Error"
        )
      };

      element.textContent =
        statusTexts[status] || status;
    });
}

/**
 * Loading button.
 */
function setAIButtonLoading(button, loading) {
  aiRequestInProgress = loading;

  if (!button) {
    return;
  }

  if (loading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.classList.add("is-loading");

    button.textContent = getAIText(
      "AI a ap travay...",
      "L’IA travaille...",
      "AI is working..."
    );

    return;
  }

  button.disabled = false;
  button.classList.remove("is-loading");

  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

/**
 * Helpers.
 */
function getAITool(toolId) {
  return PRO_MAX_AI_CENTER.tools.find(
    (tool) => tool.id === toolId
  );
}

function getAILanguage() {
  if (
    typeof window.getCurrentLanguage === "function"
  ) {
    return window.getCurrentLanguage();
  }

  return localStorage.getItem("proMaxLanguage") || "ht";
}

function getAIText(
  creoleText,
  frenchText,
  englishText
) {
  const language = getAILanguage();

  if (language === "fr") {
    return frenchText;
  }

  if (language === "en") {
    return englishText;
  }

  return creoleText;
}

function getAILocalizedValue(value) {
  if (typeof value === "string") {
    return value;
  }

  const language = getAILanguage();

  return (
    value?.[language] ||
    value?.ht ||
    value?.fr ||
    value?.en ||
    ""
  );
}

function getAIResponseContent() {
  const output = document.querySelector(
    "#ai-response, [data-ai-response]"
  );

  if (!output) {
    return "";
  }

  if (
    output.tagName === "TEXTAREA" ||
    output.tagName === "INPUT"
  ) {
    return output.value.trim();
  }

  return output.textContent.trim();
}

function createAIRequestId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `ai-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function formatAIDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localeMap = {
    ht: "fr-HT",
    fr: "fr-FR",
    en: "en-US"
  };

  return new Intl.DateTimeFormat(
    localeMap[getAILanguage()] || "fr-HT",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(date);
}

function truncateAIText(text, maximumLength) {
  const normalizedText = String(text || "");

  if (normalizedText.length <= maximumLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maximumLength)}...`;
}

function escapeAIHTML(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

function showAIMessage(message, type = "info") {
  if (
    typeof window.showApplicationMessage === "function"
  ) {
    window.showApplicationMessage(message, type);
    return;
  }

  window.alert(message);
}

function getAIErrorMessage(error) {
  const code =
    error?.message ||
    error?.code ||
    "ai/unknown-error";

  if (String(code).includes("http-401")) {
    return getAIText(
      "Koneksyon AI a pa otorize.",
      "La connexion IA n’est pas autorisée.",
      "The AI connection is unauthorized."
    );
  }

  if (String(code).includes("http-429")) {
    return getAIText(
      "Gen twòp demann AI. Tanpri eseye ankò pita.",
      "Il y a trop de demandes IA. Veuillez réessayer plus tard.",
      "There are too many AI requests. Please try again later."
    );
  }

  if (String(code).includes("Failed to fetch")) {
    return getAIText(
      "AI Center la pa kapab konekte ak sèvè a.",
      "Le Centre IA ne peut pas se connecter au serveur.",
      "The AI Center could not connect to the server."
    );
  }

  return getAIText(
    "Gen yon erè ki rive pandan AI a t ap travay.",
    "Une erreur s’est produite pendant le traitement IA.",
    "An error occurred while the AI was processing the request."
  );
}

/**
 * Public functions.
 */
window.PRO_MAX_AI_CENTER = PRO_MAX_AI_CENTER;
window.selectAITool = selectAITool;
window.setActiveAIProject = setActiveAIProject;
window.getActiveAIProject = getActiveAIProject;
window.sendAIRequest = sendAIRequest;
window.copyAIResponse = copyAIResponse;
window.clearAIWorkspace = clearAIWorkspace;
window.downloadAIResponse = downloadAIResponse;
window.clearAIHistory = clearAIHistory;
