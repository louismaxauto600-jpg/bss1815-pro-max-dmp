/**
 * BSS1815 PRO-MAX DMP
 * CENTRAL AI CENTER CONTROLLER
 * Version: 1.1.0
 * DEVAN DEVAN NÈT
 */

"use strict";

const PRO_MAX_AI_CENTER = {
  version: "1.1.0",
  endpoint: "/.netlify/functions/ai",

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
      name: "PRO-MAX FM 106.5 FM",
      icon: "📻"
    },
    maximax: {
      id: "maximax",
      name: "MAXIMAX MULTI SERVICES",
      icon: "🏢"
    },
    academy: {
      id: "academy",
      name: "PRO-MAX ACADÉMIE",
      icon: "🎓"
    },
    "beat-lab": {
      id: "beat-lab",
      name: "PRO-MAX BEAT LAB",
      icon: "🎵"
    },
    "leogane-info": {
      id: "leogane-info",
      name: "LÉOGÂNE INFO",
      icon: "📰"
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
        ht: "Poze kesyon epi jwenn asistans.",
        fr: "Posez des questions et obtenez une assistance.",
        en: "Ask questions and receive assistance."
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
        ht: "Kreye lèt, anons, script ak dokiman.",
        fr: "Créez des lettres, annonces et documents.",
        en: "Create letters, announcements and documents."
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
        ht: "Tradui kontni an Kreyòl, Fransè ak Anglè.",
        fr: "Traduisez vos contenus.",
        en: "Translate your content."
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
        ht: "Prepare script ak narasyon.",
        fr: "Préparez des scripts et narrations.",
        en: "Prepare scripts and narration."
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
        ht: "Prepare prompt pou vizyèl pwofesyonèl.",
        fr: "Préparez des prompts visuels.",
        en: "Prepare professional visual prompts."
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
        ht: "Analize done ak rapò.",
        fr: "Analysez les données et rapports.",
        en: "Analyze data and reports."
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
        ht: "Ede elèv yo aprann.",
        fr: "Accompagnez les étudiants.",
        en: "Help students learn."
      }
    }
  ]
};

/* =====================================================
   PROJECT CONTEXTS
   ===================================================== */

const AI_PROJECT_CONTEXTS = {
  bss1815: {
    ht: "Ou ap travay pou Briyant Solèy Signo 1815. Konsantre sou kominote, istwa, manm, evènman ak dokiman ofisyèl.",
    fr: "Vous travaillez pour Briyant Solèy Signo 1815. Communauté, histoire, membres, événements et documents officiels.",
    en: "You work for Briyant Solèy Signo 1815. Focus on community, history, members, events and official documents."
  },

  "pro-max-fm": {
    ht: "Ou ap travay pou PRO-MAX FM 106.5 FM. Radyo, mizik, nouvèl, podcast, emisyon ak pwodiksyon medya.",
    fr: "Vous travaillez pour PRO-MAX FM 106.5 FM. Radio, musique, actualités, podcasts et production médiatique.",
    en: "You work for PRO-MAX FM 106.5 FM. Radio, music, news, podcasts and media production."
  },

  maximax: {
    ht: "Ou ap travay pou MAXIMAX MULTI SERVICES. Imigrasyon, notarya, taks, asirans, byen imobilye, tradiksyon ak sèvis kliyan. Bay enfòmasyon jeneral san prezante tèt ou kòm avoka.",
    fr: "Vous travaillez pour MAXIMAX MULTI SERVICES. Immigration, notariat, fiscalité, assurances, immobilier, traduction et service client. Ne vous présentez pas comme avocat.",
    en: "You work for MAXIMAX MULTI SERVICES. Immigration, notary, taxes, insurance, real estate, translation and customer service. Provide general information without claiming to be an attorney."
  },

  academy: {
    ht: "Ou ap travay pou PRO-MAX ACADÉMIE ak tout lekòl li yo, tankou Real Estate School, Insurance School ak École de Journalisme. Ede ak kou, leson, egzèsis ak egzamen.",
    fr: "Vous travaillez pour PRO-MAX ACADÉMIE et toutes ses écoles. Immobilier, assurances, journalisme, cours, exercices et examens.",
    en: "You work for PRO-MAX ACADÉMIE and all its schools. Real estate, insurance, journalism, courses, lessons and exams."
  },

  "beat-lab": {
    ht: "Ou ap travay pou PRO-MAX BEAT LAB. Konpozisyon, ritm, pawòl mizik, aranjman ak preparasyon pwodiksyon odyo.",
    fr: "Vous travaillez pour PRO-MAX BEAT LAB. Composition, rythmes, paroles, arrangements et production audio.",
    en: "You work for PRO-MAX BEAT LAB. Composition, rhythm, lyrics, arrangements and audio production planning."
  },

  "leogane-info": {
    ht: "Ou ap travay pou LÉOGÂNE INFO. Jounalis, repòtaj, entèvyou, verifikasyon enfòmasyon ak nouvèl kominotè. Pa envante nouvèl oswa sous.",
    fr: "Vous travaillez pour LÉOGÂNE INFO. Journalisme, reportages, interviews et vérification des informations. N’inventez pas de sources.",
    en: "You work for LÉOGÂNE INFO. Journalism, reporting, interviews, fact checking and community news. Do not invent news or sources."
  }
};

/* =====================================================
   APPLICATION STATE
   ===================================================== */

let activeAITool = "assistant";
let aiRequestInProgress = false;
let aiCenterInitialized = false;

function aiQuery(selector) {
  return document.querySelector(selector);
}

function aiQueryAll(selector) {
  return document.querySelectorAll(selector);
}

function aiStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function aiStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function aiStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn("AI storage unavailable.");
  }
}

/* =====================================================
   INITIALIZATION
   ===================================================== */

function initializeAICenter() {
  if (aiCenterInitialized) return;

  aiCenterInitialized = true;

  const savedTool = aiStorageGet(
    PRO_MAX_AI_CENTER.storageKeys.activeTool
  );

  activeAITool = getAITool(savedTool)
    ? savedTool
    : "assistant";

  renderAIToolCards();
  initializeAIProjectSelector();
  initializeAIForm();
  initializeAIActionButtons();
  initializeAIHistoryControls();
  initializeAILanguageUpdates();
  updateAIProjectDisplay();
  displayAIHistory();
  setAIStatus("idle");

  console.info(
    "BSS1815 PRO-MAX DMP AI CENTER",
    PRO_MAX_AI_CENTER.version
  );
}

/* =====================================================
   LANGUAGE MANAGEMENT
   ===================================================== */

function normalizeAILanguage(language) {
  const value = String(language || "ht")
    .trim()
    .toLowerCase();

  const aliases = {
    ht: "ht",
    kre: "ht",
    kreyol: "ht",
    "ht-ht": "ht",
    fr: "fr",
    fra: "fr",
    fran: "fr",
    "fr-fr": "fr",
    en: "en",
    eng: "en",
    "en-us": "en",
    "en-gb": "en"
  };

  return Object.prototype.hasOwnProperty.call(
    aliases,
    value
  ) ? aliases[value] : "ht";
}

function getAILanguage() {
  if (
    typeof window.getCurrentLanguage === "function"
  ) {
    return normalizeAILanguage(
      window.getCurrentLanguage()
    );
  }

  return normalizeAILanguage(
    aiStorageGet("proMaxLanguage") ||
    document.documentElement.lang ||
    "ht"
  );
}

function getAIText(ht, fr, en) {
  const language = getAILanguage();

  if (language === "fr") return fr;
  if (language === "en") return en;

  return ht;
}

function getAILocalizedValue(value) {
  if (typeof value === "string") return value;

  return (
    value?.[getAILanguage()] ||
    value?.ht ||
    value?.fr ||
    value?.en ||
    ""
  );
}

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

/* =====================================================
   AI TOOL MANAGEMENT
   ===================================================== */

function getAITool(toolId) {
  return PRO_MAX_AI_CENTER.tools.find(
    tool => tool.id === toolId
  );
}

function renderAIToolCards() {
  const container = aiQuery(
    "#ai-tools, [data-ai-tools]"
  );

  if (!container) return;

  container.innerHTML = "";

  PRO_MAX_AI_CENTER.tools.forEach(tool => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "ai-tool-card";
    card.dataset.aiTool = tool.id;

    const active = tool.id === activeAITool;

    card.classList.toggle("active", active);
    card.setAttribute(
      "aria-pressed",
      String(active)
    );

    card.innerHTML = `
      <span class="ai-tool-icon" aria-hidden="true">
        ${tool.icon}
      </span>

      <span class="ai-tool-information">
        <strong>
          ${escapeAIHTML(
            getAILocalizedValue(tool.name)
          )}
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

function selectAITool(toolId) {
  const tool = getAITool(toolId);

  if (!tool) return false;

  activeAITool = tool.id;

  aiStorageSet(
    PRO_MAX_AI_CENTER.storageKeys.activeTool,
    activeAITool
  );

  aiQueryAll("[data-ai-tool]").forEach(card => {
    const active =
      card.dataset.aiTool === activeAITool;

    card.classList.toggle("active", active);

    card.setAttribute(
      "aria-pressed",
      String(active)
    );
  });

  updateActiveAIToolDisplay();
  updateAIPromptPlaceholder();

  return true;
}

function updateActiveAIToolDisplay() {
  const tool = getAITool(activeAITool);

  aiQueryAll("[data-ai-active-tool]")
    .forEach(element => {
      element.textContent = tool
        ? `${tool.icon} ${getAILocalizedValue(tool.name)}`
        : "";
    });
}

/* =====================================================
   PROJECT MANAGEMENT
   ===================================================== */

function isValidAIProject(projectId) {
  return Object.prototype.hasOwnProperty.call(
    PRO_MAX_AI_CENTER.projects,
    projectId
  );
}

function getActiveAIProject() {
  const saved = aiStorageGet(
    PRO_MAX_AI_CENTER.storageKeys.activeProject
  );

  return isValidAIProject(saved)
    ? saved
    : "bss1815";
}

function setActiveAIProject(projectId) {
  if (!isValidAIProject(projectId)) {
    return false;
  }

  aiStorageSet(
    PRO_MAX_AI_CENTER.storageKeys.activeProject,
    projectId
  );

  updateAIProjectDisplay();

  document.dispatchEvent(
    new CustomEvent("proMaxAIProjectChanged", {
      detail: {
        project: projectId
      }
    })
  );

  return true;
}

function initializeAIProjectSelector() {
  const selector = aiQuery(
    "#ai-project-selector, [data-ai-project-selector]"
  );

  if (!selector) return;

  selector.innerHTML = "";

  Object.values(PRO_MAX_AI_CENTER.projects)
    .forEach(project => {
      const option =
        document.createElement("option");

      option.value = project.id;
      option.textContent =
        `${project.icon} ${project.name}`;

      selector.appendChild(option);
    });

  selector.value = getActiveAIProject();

  selector.addEventListener("change", () => {
    setActiveAIProject(selector.value);
  });
}

function updateAIProjectDisplay() {
  const projectId = getActiveAIProject();

  const project =
    PRO_MAX_AI_CENTER.projects[projectId];

  aiQueryAll("[data-ai-active-project]")
    .forEach(element => {
      element.textContent =
        `${project.icon} ${project.name}`;
    });

  const selector = aiQuery(
    "#ai-project-selector, [data-ai-project-selector]"
  );

  if (selector) {
    selector.value = projectId;
  }

  updateActiveAIToolDisplay();
  updateAIPromptPlaceholder();
}

/* =====================================================
   CENTRAL AI FORM
   ===================================================== */

function initializeAIForm() {
  const form = aiQuery(
    "#ai-form, [data-ai-form]"
  );

  if (!form) return;

  const promptInput = form.querySelector(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  const submitButton = form.querySelector(
    "button[type='submit'], [data-ai-submit]"
  );

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (aiRequestInProgress) return;

    const prompt =
      promptInput?.value.trim() || "";

    if (!prompt) {
      showAIMessage(
        getAIText(
          "Tanpri ekri sa ou bezwen AI a fè.",
          "Veuillez écrire votre demande.",
          "Please enter your request."
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

      const response =
        await sendAIRequest(request);

      displayAIResponse(response);
      saveAIHistoryItem(request, response);
      setAIStatus("success");

    } catch (error) {
      console.error(
        "Central AI request:",
        error.message
      );

      setAIStatus("error");

      showAIMessage(
        getAIErrorMessage(error),
        "error"
      );

    } finally {
      setAIButtonLoading(
        submitButton,
        false
      );
    }
  });

  updateAIPromptPlaceholder();
}

function updateAIPromptPlaceholder() {
  const input = aiQuery(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  if (!input) return;

  const tool = getAITool(activeAITool);

  const name = getAILocalizedValue(
    tool?.name || ""
  );

  input.placeholder = getAIText(
    `Ekri sa ou bezwen ${name} fè...`,
    `Écrivez votre demande pour ${name}...`,
    `Write your request for ${name}...`
  );
}

/* =====================================================
   CREATE AI REQUEST
   ===================================================== */

function createAIRequest(prompt) {
  const project = getActiveAIProject();
  const language = getAILanguage();

  return {
    id: createAIRequestId(),
    tool: activeAITool,
    project,
    language,
    context:
      AI_PROJECT_CONTEXTS[project]?.[language] ||
      AI_PROJECT_CONTEXTS[project]?.ht ||
      "",
    prompt: String(prompt || "").trim(),
    user: null,
    createdAt: new Date().toISOString()
  };
}

/* =====================================================
   CENTRAL OPENAI API CONNECTION
   NETLIFY FUNCTIONS
   ===================================================== */

async function sendAIRequest(request) {
  aiRequestInProgress = true;

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    45000
  );

  try {
    const prompt = String(
      request?.prompt || ""
    ).trim();

    if (!prompt) {
      throw new Error("ai/message-required");
    }

    if (prompt.length > 12000) {
      throw new Error("ai/message-too-long");
    }

    const projectId =
      isValidAIProject(request.project)
        ? request.project
        : "bss1815";

    const project =
      PRO_MAX_AI_CENTER.projects[projectId];

    const language =
      normalizeAILanguage(request.language);

    const tool = getAITool(request.tool)
      ? request.tool
      : "assistant";

    const context =
      AI_PROJECT_CONTEXTS[projectId]?.[language] ||
      AI_PROJECT_CONTEXTS[projectId]?.ht ||
      "";

    const message = [
      "BSS1815 PRO-MAX DMP CENTRAL AI CENTER",
      `Project: ${project.name}`,
      `Context: ${context}`,
      `AI tool: ${tool}`,
      "Do not invent facts or claim access to unavailable systems.",
      "Voice and image tools prepare text scripts and prompts only.",
      "User request:",
      prompt
    ].join("\n\n");

    const response = await fetch(
      PRO_MAX_AI_CENTER.endpoint,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message,
          mode: tool,
          language
        }),

        signal: controller.signal
      }
    );

    if (!response.ok) {
      throw new Error(
        `ai/http-${response.status}`
      );
    }

    const data = await response.json();

    if (data.success === false || data.error) {
      throw new Error("ai/backend-error");
    }

    const content =
      data.answer ||
      data.reply ||
      data.content ||
      data.response ||
      data.message ||
      data.text ||
      "";

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      throw new Error("ai/empty-response");
    }

    return {
      id: data.id ||
        request.id ||
        createAIRequestId(),

      content: content.trim(),

      provider: "OpenAI",

      project: projectId,

      tool,

      language,

      createdAt:
        data.createdAt ||
        new Date().toISOString()
    };

  } finally {
    clearTimeout(timeout);
    aiRequestInProgress = false;
  }
}

/* =====================================================
   DISPLAY RESPONSE
   ===================================================== */

function displayAIResponse(response) {
  const output = aiQuery(
    "#ai-response, [data-ai-response]"
  );

  if (!output) return;

  output.hidden = false;

  if (
    output.tagName === "TEXTAREA" ||
    output.tagName === "INPUT"
  ) {
    output.value = response.content;
  } else {
    output.textContent = response.content;
  }

  aiQueryAll("[data-ai-provider]")
    .forEach(element => {
      element.textContent =
        response.provider || "PRO-MAX AI";
    });

  aiQueryAll("[data-ai-response-date]")
    .forEach(element => {
      element.textContent =
        formatAIDate(response.createdAt);
    });

  output.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

function getAIResponseContent() {
  const output = aiQuery(
    "#ai-response, [data-ai-response]"
  );

  if (!output) return "";

  if (
    output.tagName === "TEXTAREA" ||
    output.tagName === "INPUT"
  ) {
    return output.value.trim();
  }

  return output.textContent.trim();
}

/* =====================================================
   ACTION BUTTONS
   ===================================================== */

function initializeAIActionButtons() {
  aiQueryAll("[data-ai-copy]")
    .forEach(button => {
      button.addEventListener(
        "click",
        copyAIResponse
      );
    });

  aiQueryAll("[data-ai-clear]")
    .forEach(button => {
      button.addEventListener(
        "click",
        clearAIWorkspace
      );
    });

  aiQueryAll("[data-ai-download]")
    .forEach(button => {
      button.addEventListener(
        "click",
        downloadAIResponse
      );
    });

  aiQueryAll("[data-ai-retry]")
    .forEach(button => {
      button.addEventListener(
        "click",
        retryLastAIRequest
      );
    });
}

async function copyAIResponse() {
  const content = getAIResponseContent();

  if (!content) return;

  try {
    await navigator.clipboard.writeText(content);

    showAIMessage(
      getAIText(
        "Repons lan kopye.",
        "Réponse copiée.",
        "Response copied."
      ),
      "success"
    );

  } catch {
    showAIMessage(
      getAIText(
        "Kopi a pa reyisi.",
        "La copie a échoué.",
        "Copy failed."
      ),
      "error"
    );
  }
}

function clearAIWorkspace() {
  if (aiRequestInProgress) return;

  const input = aiQuery(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  const output = aiQuery(
    "#ai-response, [data-ai-response]"
  );

  if (input) {
    input.value = "";
    input.focus();
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

  aiQueryAll(
    "[data-ai-provider], [data-ai-response-date]"
  ).forEach(element => {
    element.textContent = "";
  });

  setAIStatus("idle");
}

function downloadAIResponse() {
  const content = getAIResponseContent();

  if (!content) return;

  const blob = new Blob(
    [content],
    {
      type: "text/plain;charset=utf-8"
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;

  link.download =
    `BSS1815-AI-${getActiveAIProject()}-${Date.now()}.txt`;

  document.body.appendChild(link);

  link.click();
  link.remove();

  setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

function retryLastAIRequest() {
  if (aiRequestInProgress) return;

  const lastItem = getAIHistory()[0];

  if (!lastItem?.request?.prompt) {
    showAIMessage(
      getAIText(
        "Pa gen demann pou rekòmanse.",
        "Aucune demande à relancer.",
        "No request to retry."
      ),
      "error"
    );

    return;
  }

  setActiveAIProject(
    lastItem.request.project
  );

  selectAITool(
    lastItem.request.tool
  );

  const input = aiQuery(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  if (input) {
    input.value = lastItem.request.prompt;
    input.focus();
  }
}

/* =====================================================
   AI HISTORY
   ===================================================== */

function getAIHistory() {
  const saved = aiStorageGet(
    PRO_MAX_AI_CENTER.storageKeys.history
  );

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed.filter(
          item =>
            item &&
            item.request &&
            item.response
        )
      : [];

  } catch {
    return [];
  }
}

function saveAIHistoryItem(request, response) {
  const history = getAIHistory();

  history.unshift({
    id: request.id,

    request: {
      id: request.id,
      project: request.project,
      tool: request.tool,
      language: request.language,
      prompt: request.prompt,
      createdAt: request.createdAt
    },

    response
  });

  aiStorageSet(
    PRO_MAX_AI_CENTER.storageKeys.history,
    JSON.stringify(history.slice(0, 50))
  );

  displayAIHistory();
}

function displayAIHistory() {
  const container = aiQuery(
    "#ai-history, [data-ai-history]"
  );

  if (!container) return;

  const history = getAIHistory();

  container.innerHTML = "";

  if (!history.length) {
    const empty = document.createElement("p");

    empty.className = "ai-history-empty";

    empty.textContent = getAIText(
      "Pa gen okenn aktivite AI ankò.",
      "Aucune activité IA.",
      "No AI activity yet."
    );

    container.appendChild(empty);

    return;
  }

  history.forEach(item => {
    const article =
      document.createElement("article");

    article.className = "ai-history-item";

    const project =
      PRO_MAX_AI_CENTER.projects[
        item.request.project
      ];

    const tool =
      getAITool(item.request.tool);

    article.innerHTML = `
      <button
        type="button"
        class="ai-history-open"
        data-ai-history-id="${escapeAIHTML(item.id)}"
      >
        <strong>
          ${escapeAIHTML(
            getAILocalizedValue(
              tool?.name || item.request.tool
            )
          )}
        </strong>

        <span>
          ${escapeAIHTML(project?.name || "")}
        </span>

        <small>
          ${escapeAIHTML(
            truncateAIText(
              item.request.prompt,
              90
            )
          )}
        </small>

        <time>
          ${escapeAIHTML(
            formatAIDate(
              item.request.createdAt
            )
          )}
        </time>
      </button>
    `;

    article.querySelector("button")
      .addEventListener("click", () => {
        openAIHistoryItem(item.id);
      });

    container.appendChild(article);
  });
}

function openAIHistoryItem(historyId) {
  const item = getAIHistory().find(
    entry => entry.id === historyId
  );

  if (!item) return;

  setActiveAIProject(
    item.request.project
  );

  selectAITool(
    item.request.tool
  );

  const input = aiQuery(
    "#ai-prompt, [name='prompt'], [data-ai-prompt]"
  );

  if (input) {
    input.value = item.request.prompt;
  }

  displayAIResponse(item.response);
}

function initializeAIHistoryControls() {
  aiQueryAll("[data-ai-clear-history]")
    .forEach(button => {
      button.addEventListener(
        "click",
        clearAIHistory
      );
    });
}

async function clearAIHistory() {
  const message = getAIText(
    "Èske ou vle efase tout istwa AI a?",
    "Supprimer tout l’historique IA ?",
    "Delete all AI history?"
  );

  const confirmed =
    typeof window.confirmPlatformAction === "function"

      ? await window.confirmPlatformAction(message)

      : window.confirm(message);

  if (!confirmed) return;

  aiStorageRemove(
    PRO_MAX_AI_CENTER.storageKeys.history
  );

  displayAIHistory();

  showAIMessage(
    getAIText(
      "Istwa AI a efase.",
      "Historique supprimé.",
      "AI history deleted."
    ),
    "success"
  );
}

/* =====================================================
   AI STATUS
   ===================================================== */

function setAIStatus(status) {
  const messages = {
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

  aiQueryAll("[data-ai-status]")
    .forEach(element => {
      element.dataset.status = status;

      element.textContent =
        messages[status] || status;
    });
}

function setAIButtonLoading(button, loading) {
  aiRequestInProgress = loading;

  if (!button) return;

  if (loading) {
    button.dataset.originalText =
      button.textContent;

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

  if (button.dataset.originalText !== undefined) {
    button.textContent =
      button.dataset.originalText;

    delete button.dataset.originalText;
  }
}

/* =====================================================
   HELPERS
   ===================================================== */

function createAIRequestId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `ai-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function formatAIDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const locales = {
    ht: "fr-HT",
    fr: "fr-FR",
    en: "en-US"
  };

  return new Intl.DateTimeFormat(
    locales[getAILanguage()] || "fr-HT",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(date);
}

function truncateAIText(value, maxLength) {
  const text = String(value || "");

  return text.length > maxLength

    ? `${text.slice(0, maxLength)}...`

    : text;
}

function escapeAIHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showAIMessage(message, type = "info") {
  if (
    typeof window.showApplicationMessage === "function"
  ) {
    window.showApplicationMessage(
      message,
      type
    );

    return;
  }

  window.alert(message);
}

/* =====================================================
   ERROR MANAGEMENT
   ===================================================== */

function getAIErrorMessage(error) {
  const code = String(
    error?.message ||
    error?.code ||
    ""
  );

  if (
    code.includes("http-401") ||
    code.includes("http-403")
  ) {
    return getAIText(
      "Koneksyon AI a pa otorize.",
      "Connexion IA non autorisée.",
      "AI connection unauthorized."
    );
  }

  if (code.includes("http-404")) {
    return getAIText(
      "Endpoint AI a pa disponib.",
      "Endpoint IA introuvable.",
      "AI endpoint not found."
    );
  }

  if (code.includes("http-429")) {
    return getAIText(
      "Limit demann API a rive.",
      "Limite de requêtes API atteinte.",
      "API request limit reached."
    );
  }

  if (
    error?.name === "AbortError" ||
    code.includes("http-504")
  ) {
    return getAIText(
      "Sèvè AI a pran twòp tan.",
      "Le serveur IA met trop de temps.",
      "AI server request timed out."
    );
  }

  if (code.includes("message-required")) {
    return getAIText(
      "Ekri yon mesaj.",
      "Écrivez un message.",
      "Enter a message."
    );
  }

  if (code.includes("message-too-long")) {
    return getAIText(
      "Mesaj la twò long.",
      "Le message est trop long.",
      "The message is too long."
    );
  }

  if (code.includes("empty-response")) {
    return getAIText(
      "AI a pa retounen okenn repons.",
      "Aucune réponse IA.",
      "No AI response received."
    );
  }

  if (
    code.includes("Failed to fetch") ||
    code.includes("NetworkError")
  ) {
    return getAIText(
      "AI Center la pa konekte ak sèvè a.",
      "Connexion au serveur impossible.",
      "Unable to connect to AI server."
    );
  }

  return getAIText(
    "Gen yon erè nan sèvis AI a.",
    "Une erreur du service IA est survenue.",
    "An AI service error occurred."
  );
}

/* =====================================================
   PUBLIC CENTRAL AI INTERFACE
   ===================================================== */

window.PRO_MAX_AI_CENTER =
  PRO_MAX_AI_CENTER;

window.initializeAICenter =
  initializeAICenter;

window.selectAITool =
  selectAITool;

window.setActiveAIProject =
  setActiveAIProject;

window.getActiveAIProject =
  getActiveAIProject;

window.createAIRequest =
  createAIRequest;

window.sendAIRequest =
  sendAIRequest;

window.copyAIResponse =
  copyAIResponse;

window.clearAIWorkspace =
  clearAIWorkspace;

window.downloadAIResponse =
  downloadAIResponse;

window.clearAIHistory =
  clearAIHistory;

/* =====================================================
   START CENTRAL AI CENTER
   ===================================================== */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeAICenter,
    { once: true }
  );
} else {
  initializeAICenter();
}

/* =====================================================
   END OF FILE
   BSS1815 PRO-MAX DMP
   BATI POU JODI A, PARE POU DEMEN
   DEVAN DEVAN NÈT
   ===================================================== */
