/* =========================================================
   BSS1815 PRO-MAX DMP
   CENTRAL AI CONTROLLER
   FILE: central-ai-controller.js
   VERSION: 3.0.1

   ONE CENTRAL API
   OPENAI LIVE
   GEMINI LIVE
   AI PROFESSOR
   PROF AVATAR

   BATI POU JODI A, PARE POU DEMEN.
   DEVAN DEVAN NÈT.
========================================================= */

"use strict";

(() => {

  const CONFIG = Object.freeze({
    version: "3.0.1",
    domain: "https://bss1815promaxdmp.com",

    endpoints: Object.freeze({
      openai: "/.netlify/functions/central-ai",
      gemini: "/.netlify/functions/central-ai",
      professor: "/.netlify/functions/central-ai"
    }),

    avatar: "/promax-dmp.mp4",
    timeout: 45000,
    maxPrompt: 8000,
    maxHistory: 50,
    defaultLanguage: "ht",
    defaultProvider: "openai",
    defaultProject: "bss1815"
  });

  /* CENTRAL ECOSYSTEM */

  const PROJECTS = Object.freeze({

    bss1815: {
      name: "BSS1815 COMMUNITY",
      context: `
        Community development.
        Haitian cultural heritage.
        Organizational communication.
        BSS1815 history and activities.
      `
    },

    "pro-max-fm": {
      name: "PRO-MAX FM 106.5 FM",
      context: `
        Radio broadcasting.
        Haitian music.
        Radio programming.
        Podcasts and interviews.
        News and entertainment.
        Radio presentation scripts.
      `
    },

    maximax: {
      name: "MAXIMAX MULTI SERVICES",
      context: `
        Immigration document assistance.
        Notary services.
        Tax preparation information.
        Insurance information.
        Business services.
        Apostille.
        Translation.
        Real estate information.

        Do not claim to be a licensed attorney.
        Do not request confidential identification numbers.
      `
    },

    academy: {
      name: "PRO-MAX ACADÉMIE",
      context: `
        Professional education.
        Student assistance.
        Educational courses.
        Lessons and exercises.
        Examination preparation.
        AI Professor assistance.
      `
    },

    "beat-lab": {
      name: "PRO-MAX BEAT LAB",
      context: `
        Music production.
        Beat creation guidance.
        Haitian musical culture.
        Songwriting.
        Lyrics.
        Musical instruments.
        Music education.
      `
    },

    "leogane-info": {
      name: "LÉOGÂNE INFO",
      context: `
        Journalism.
        Community information.
        Interviews.
        Reporting.
        Fact checking.
        Haiti and diaspora communication.

        Never invent news or verified sources.
      `
    },

    ddn: {
      name: "DEVAN DEVAN NÈT",
      context: `
        Digital communication.
        Artificial intelligence.
        Innovation.
        Technology.
        Information management.
      `
    }

  });

  /* PROJECT ALIASES */

  const PROJECT_ALIASES = Object.freeze({
    community: "bss1815",
    bss: "bss1815",
    fm: "pro-max-fm",
    radio: "pro-max-fm",
    promaxfm: "pro-max-fm",
    maximax: "maximax",
    multiservices: "maximax",
    academie: "academy",
    "academie-parent": "academy",
    academy: "academy",
    beatmaker: "beat-lab",
    beatlab: "beat-lab",
    journalisme: "leogane-info",
    leogane: "leogane-info",
    ddn: "ddn"
  });

  /* SCHOOLS */

  const SCHOOLS = Object.freeze({
    general: "PRO-MAX ACADÉMIE",
    "real-estate": "REAL ESTATE SCHOOL",
    insurance: "INSURANCE SCHOOL",
    journalism: "ÉCOLE DE JOURNALISME",
    "beat-maker": "BEAT MAKER AI SCHOOL"
  });

  /* CENTRAL AI TOOLS */

  const TOOLS = Object.freeze({

    assistant: {
      icon: "🤖",
      ht: "ASISTAN AI",
      fr: "ASSISTANT IA",
      en: "AI ASSISTANT",
      instruction:
        "Provide accurate project-specific assistance."
    },

    writer: {
      icon: "✍️",
      ht: "EKRIVEN AI",
      fr: "RÉDACTEUR IA",
      en: "AI WRITER",
      instruction:
        "Prepare professional written content."
    },

    translator: {
      icon: "🌐",
      ht: "TRADIKSYON AI",
      fr: "TRADUCTION IA",
      en: "AI TRANSLATOR",
      instruction:
        "Translate accurately into the requested language."
    },

    voice: {
      icon: "🎙️",
      ht: "SCRIPT VWA",
      fr: "SCRIPT VOCAL",
      en: "VOICE SCRIPT",
      instruction:
        "Prepare narration scripts without claiming to generate audio."
    },

    image: {
      icon: "🎨",
      ht: "PROMPT IMAJ",
      fr: "PROMPT IMAGE",
      en: "IMAGE PROMPT",
      instruction:
        "Prepare professional image generation prompts."
    },

    analytics: {
      icon: "📊",
      ht: "ANALIZ AI",
      fr: "ANALYSE IA",
      en: "AI ANALYTICS",
      instruction:
        "Analyze supplied information without inventing data."
    },

    tutor: {
      icon: "🎓",
      ht: "PROFESÈ AI",
      fr: "PROFESSEUR IA",
      en: "AI PROFESSOR",
      instruction:
        "Teach professionally with examples and exercises."
    }

  });

  /* LANGUAGE SYSTEM */

  const LANGUAGES = Object.freeze({

    ht: {
      ready: "CENTRAL AI PARE",
      processing: "AI AP TRETE DEMANN NAN...",
      success: "REPONS AI RESEVWA",
      error: "KONEKSYON AI ECHWE",
      empty: "Tanpri antre yon kesyon.",
      tooLong: "Mesaj la twò long.",
      timeout: "Tan koneksyon an ekspire.",
      noAnswer: "API a pa retounen repons.",
      copied: "REPONS LAN KOPYE",
      copyError: "Kopi otomatik pa disponib.",
      placeholder: "Ekri kesyon ou isit la...",
      noHistory: "Pa gen istwa AI.",
      avatarError: "PROF AVATAR pa disponib.",
      busy: "AI deja ap trete yon demann.",
      invalidProject: "Pwojè sa a pa disponib.",
      invalidProvider: "Motè AI sa a pa disponib."
    },

    fr: {
      ready: "CENTRAL AI PRÊT",
      processing: "TRAITEMENT EN COURS...",
      success: "RÉPONSE IA REÇUE",
      error: "ÉCHEC DE CONNEXION IA",
      empty: "Veuillez saisir une question.",
      tooLong: "Le message est trop long.",
      timeout: "Le délai de connexion a expiré.",
      noAnswer: "L’API n’a retourné aucune réponse.",
      copied: "RÉPONSE COPIÉE",
      copyError: "Copie automatique indisponible.",
      placeholder: "Écrivez votre question ici...",
      noHistory: "Aucun historique IA.",
      avatarError: "PROF AVATAR indisponible.",
      busy: "Une demande est déjà en cours.",
      invalidProject: "Projet indisponible.",
      invalidProvider: "Moteur IA indisponible."
    },

    en: {
      ready: "CENTRAL AI READY",
      processing: "AI IS PROCESSING...",
      success: "AI RESPONSE RECEIVED",
      error: "AI CONNECTION FAILED",
      empty: "Please enter a question.",
      tooLong: "The message is too long.",
      timeout: "The connection timed out.",
      noAnswer: "The API returned no answer.",
      copied: "RESPONSE COPIED",
      copyError: "Automatic copying is unavailable.",
      placeholder: "Enter your question here...",
      noHistory: "No AI history.",
      avatarError: "PROF AVATAR is unavailable.",
      busy: "An AI request is already processing.",
      invalidProject: "Project unavailable.",
      invalidProvider: "AI engine unavailable."
    }

  });

  /* CENTRAL STATE */

  const state = {
    project: CONFIG.defaultProject,
    provider: CONFIG.defaultProvider,
    language: CONFIG.defaultLanguage,
    school: "",
    tool: "assistant",
    busy: false,
    initialized: false,
    history: [],
    lastRequest: null,
    lastResponse: null,
    status: "ready",
    statusDetail: ""
  };

  /* DOM UTILITIES */

  const $ = selector =>
    document.querySelector(selector);

  const $$ = selector =>
    Array.from(document.querySelectorAll(selector));

  const has = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);

  const boundElements = new WeakMap();

  function bind(element, event, callback) {

    if (!element) return;

    let events = boundElements.get(element);

    if (!events) {
      events = new Set();
      boundElements.set(element, events);
    }

    if (events.has(event)) return;

    events.add(event);

    element.addEventListener(event, callback);

  }

  /* LANGUAGE MANAGEMENT */

  function normalizeLanguage(language) {

    const value = String(language || "ht")
      .trim()
      .toLowerCase();

    const aliases = {
      kre: "ht",
      kreyol: "ht",
      fra: "fr",
      eng: "en"
    };

    const normalized = aliases[value] || value;

    return has(LANGUAGES, normalized)
      ? normalized
      : "ht";

  }

  function translate(key) {
    return LANGUAGES[state.language][key] || key;
  }

  function setLanguage(language) {

    state.language = normalizeLanguage(language);

    updateLanguageInterface();
    renderTools();
    renderHistory();
    setStatus(state.status, state.statusDetail);

    return state.language;

  }

  function updateLanguageInterface() {

    $$("[data-ai-lang]").forEach(button => {

      const active =
        normalizeLanguage(button.dataset.aiLang) ===
        state.language;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );

    });

    $$("[data-ai-i18n]").forEach(element => {

      element.textContent =
        translate(element.dataset.aiI18n);

    });

    const input = getPromptInput();

    if (input) {
      input.placeholder = translate("placeholder");
    }

  }

  /* PROJECT MANAGEMENT */

  function normalizeProject(project) {

    const value = String(project || "")
      .trim()
      .toLowerCase();

    if (has(PROJECTS, value)) {
      return value;
    }

    if (has(PROJECT_ALIASES, value)) {
      return PROJECT_ALIASES[value];
    }

    return null;

  }

  function setProject(project) {

    const normalized = normalizeProject(project);

    if (!normalized) {
      throw new Error(translate("invalidProject"));
    }

    state.project = normalized;

    if (normalized !== "academy") {
      state.school = "";
    }

    updateProjectInterface();

    return normalized;

  }

  function getProject() {
    return state.project;
  }

  function updateProjectInterface() {

    $$("[data-ai-active-project]").forEach(element => {

      element.textContent =
        PROJECTS[state.project].name;

    });

    $$("[data-ai-project]").forEach(button => {

      const active =
        normalizeProject(button.dataset.aiProject) ===
        state.project;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );

    });

    $$("[data-ai-school-field]").forEach(element => {

      element.hidden =
        state.project !== "academy";

    });

    const selector = $("[data-ai-project-selector]");

    if (selector?.tagName === "SELECT") {
      selector.value = state.project;
    }

  }

  /* SCHOOL MANAGEMENT */

  function setSchool(school) {

    const value = String(school || "")
      .trim()
      .slice(0, 150);

    state.school = has(SCHOOLS, value)
      ? SCHOOLS[value]
      : value;

    return state.school;

  }

  /* AI PROVIDER MANAGEMENT */

  function setProvider(provider) {

    const value = String(provider || "")
      .trim()
      .toLowerCase();

    if (!has(CONFIG.endpoints, value)) {
      throw new Error(translate("invalidProvider"));
    }

    state.provider = value;

    $$("[data-ai-provider-select]").forEach(element => {

      if (element.tagName === "SELECT") {
        element.value = value;
      }

    });

    $$("[data-ai-engine]").forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.aiEngine === value
      );

    });

    return value;

  }

  function getProvider() {
    return state.provider;
  }

  /* AI TOOL MANAGEMENT */

  function selectTool(tool) {

    if (!has(TOOLS, tool)) {
      return state.tool;
    }

    state.tool = tool;

    if (tool === "tutor") {
      setProvider("professor");
    }

    renderTools();

    return tool;

  }

  function renderTools() {

    const container = $(
      "#ai-tools, [data-ai-tools]"
    );

    if (container) {

      container.replaceChildren();

      Object.entries(TOOLS).forEach(([id, tool]) => {

        const button =
          document.createElement("button");

        button.type = "button";
        button.className = "ai-tool-card";
        button.dataset.aiTool = id;

        button.textContent =
          `${tool.icon} ${tool[state.language]}`;

        button.classList.toggle(
          "active",
          state.tool === id
        );

        button.setAttribute(
          "aria-pressed",
          String(state.tool === id)
        );

        button.addEventListener("click", () => {
          selectTool(id);
        });

        container.appendChild(button);

      });

    }

    $$("[data-ai-active-tool]").forEach(element => {

      element.textContent =
        TOOLS[state.tool][state.language];

    });

    $$("[data-ai-tool]").forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.aiTool === state.tool
      );

    });

  }

  /* REQUEST GENERATION */

  function createRequest(input) {

    const options = typeof input === "string"
      ? { prompt: input }
      : input || {};

    const prompt = String(
      options.prompt ??
      options.message ??
      options.question ??
      ""
    ).trim();

    if (!prompt) {
      throw new Error(translate("empty"));
    }

    if (prompt.length > CONFIG.maxPrompt) {
      throw new Error(translate("tooLong"));
    }

    const project = normalizeProject(
      options.project || state.project
    );

    if (!project) {
      throw new Error(translate("invalidProject"));
    }

    const tool = has(
      TOOLS,
      options.tool || options.mode || state.tool
    )
      ? options.tool || options.mode || state.tool
      : "assistant";

    const provider =
      options.provider ||
      (
        tool === "tutor"
          ? "professor"
          : state.provider
      );

    if (!has(CONFIG.endpoints, provider)) {
      throw new Error(translate("invalidProvider"));
    }

    return {

      id: typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"

        ? crypto.randomUUID()

        : `ai-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,

      prompt,
      project,
      tool,
      provider,

      language: normalizeLanguage(
        options.language || state.language
      ),

      school: project === "academy"
        ? String(
            options.school || state.school || ""
          ).slice(0, 150)
        : "",

      createdAt: new Date().toISOString()

    };

  }

  /* CENTRAL PROJECT CONTEXT */

  function buildMessage(request) {

    const project = PROJECTS[request.project];
    const tool = TOOLS[request.tool];

    return [

      "BSS1815 PRO-MAX DMP",

      `PROJECT: ${project.name}`,

      `PROJECT CONTEXT: ${project.context.trim()}`,

      `SCHOOL: ${request.school || "Not applicable"}`,

      `AI MODE: ${request.tool}`,

      `TASK: ${tool.instruction}`,

      `RESPONSE LANGUAGE: ${request.language}`,

      "Do not invent information or completed external actions.",

      "USER REQUEST:",

      request.prompt

    ].join("\n\n");

  }

  /* CENTRAL ENDPOINT RESOLUTION */

  function resolveEndpoint(provider) {

    const endpoint = CONFIG.endpoints[provider];

    if (!endpoint) {
      throw new Error(translate("invalidProvider"));
    }

    const centralOrigin = new URL(CONFIG.domain).origin;
    const currentOrigin = window.location.origin;

    if (currentOrigin === centralOrigin) {
      return endpoint;
    }

    return new URL(
      endpoint,
      centralOrigin
    ).href;

  }

  /* =====================================================
     ONE CENTRAL API CONNECTION
     OPENAI + GEMINI + PROFESSOR
  ===================================================== */

  async function sendAIRequest(input) {

    const request = createRequest(input);

    const controller = new AbortController();

    const timer = setTimeout(
      () => controller.abort(),
      CONFIG.timeout
    );

    try {

      const response = await fetch(

        resolveEndpoint(request.provider),

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          credentials: "omit",

          cache: "no-store",

          signal: controller.signal,

          body: JSON.stringify({

            id: request.id,

            message: buildMessage(request),

            provider: request.provider,

            project: request.project,

            language: request.language,

            mode: request.tool,

            school: request.school

          })

        }

      );

      let data;

      try {

        data = await response.json();

      } catch {

        throw new Error(
          `Invalid backend response — HTTP ${response.status}`
        );

      }

      if (!data || typeof data !== "object") {
        throw new Error(translate("noAnswer"));
      }

      if (!response.ok || data.success === false) {

        const errorMessage =
          typeof data.error === "string"
            ? data.error
            : data.error?.message;

        throw new Error(
          errorMessage ||
          `Backend HTTP ${response.status}`
        );

      }

      const answer = [

        data.answer,
        data.reply,
        data.response,
        data.content,
        data.text,
        data.message

      ].find(value =>

        typeof value === "string" &&

        value.trim() &&

        value.trim() !== "AI pa retounen okenn tèks."

      );

      if (!answer) {
        throw new Error(translate("noAnswer"));
      }

      return {

        id: data.id || request.id,

        success: true,

        answer,

        content: answer,

        reply: answer,

        provider: data.provider ||
          (
            request.provider === "openai"
              ? "OpenAI"
              : "Google Gemini"
          ),

        model: data.model || "",

        project: request.project,

        language: request.language,

        tool: request.tool,

        createdAt:
          data.createdAt ||
          new Date().toISOString()

      };

    } catch (error) {

      if (error.name === "AbortError") {
        throw new Error(translate("timeout"));
      }

      throw error;

    } finally {

      clearTimeout(timer);

    }

  }

  /* INDIVIDUAL AI ENGINES */

  function normalizeInput(input) {

    return typeof input === "string"
      ? { prompt: input }
      : input || {};

  }

  function askOpenAI(input) {

    return sendAIRequest({
      ...normalizeInput(input),
      provider: "openai"
    });

  }

  function askGemini(input) {

    return sendAIRequest({
      ...normalizeInput(input),
      provider: "gemini"
    });

  }

  function askProfessor(input) {

    return sendAIRequest({
      ...normalizeInput(input),
      provider: "professor",
      tool: "tutor"
    });

  }

  /* AI WORKSPACE */

  function getPromptInput() {

    return $(

      "#ai-prompt, " +
      "[data-ai-prompt], " +
      "#ai-form textarea, " +
      "[data-ai-form] textarea"

    );

  }

  function getResponseOutput() {

    return $(
      "#ai-response, " +
      "[data-ai-response]"
    );

  }

  function displayResponse(response) {

    state.lastResponse = response;

    const output = getResponseOutput();

    if (output) {

      output.hidden = false;

      if (
        output.tagName === "TEXTAREA" ||
        output.tagName === "INPUT"
      ) {

        output.value = response.answer;

      } else {

        output.textContent = response.answer;

      }

    }

    $$("[data-ai-provider]").forEach(element => {

      element.textContent =
        response.provider +
        (
          response.model
            ? ` / ${response.model}`
            : ""
        );

    });

    $$("[data-ai-response-date]").forEach(element => {

      element.textContent = new Date(
        response.createdAt
      ).toLocaleString();

    });

  }

  /* STATUS MANAGEMENT */

  function setStatus(key, detail = "") {

    state.status = key;
    state.statusDetail = detail;

    $$("[data-ai-status], #ai-status")
      .forEach(element => {

        element.textContent =
          translate(key) +
          (detail ? ` — ${detail}` : "");

        element.dataset.status = key;

        element.setAttribute(
          "aria-live",
          "polite"
        );

      });

  }

  function setBusy(value) {

    state.busy = Boolean(value);

    $$(

      "[data-ai-submit], " +
      "[data-ai-retry], " +
      "[data-ai-clear], " +
      "[data-ai-clear-history], " +
      "#ai-form button[type='submit']"

    ).forEach(button => {

      button.disabled = state.busy;

    });

  }

  /* EXECUTE WORKSPACE REQUEST */

  async function executeRequest(input) {

    if (state.busy) {
      throw new Error(translate("busy"));
    }

    let request;

    try {

      request = createRequest(input);

    } catch (error) {

      setStatus("error", error.message);
      throw error;

    }

    state.lastRequest = { ...request };

    setBusy(true);
    setStatus("processing");

    try {

      const response = await sendAIRequest(request);

      displayResponse(response);

      saveHistory(request, response);

      setStatus("success");

      return response;

    } catch (error) {

      setStatus("error", error.message);

      throw error;

    } finally {

      setBusy(false);

    }

  }

  /* SESSION HISTORY */

  function saveHistory(request, response) {

    state.history.unshift({

      request: { ...request },

      response: { ...response }

    });

    state.history = state.history.slice(
      0,
      CONFIG.maxHistory
    );

    renderHistory();

  }

  function renderHistory() {

    const container = $(
      "#ai-history, [data-ai-history]"
    );

    if (!container) return;

    container.replaceChildren();

    if (!state.history.length) {

      container.textContent =
        translate("noHistory");

      return;

    }

    state.history.forEach(item => {

      const card =
        document.createElement("article");

      card.className = "ai-history-item";

      const title =
        document.createElement("strong");

      title.textContent =
        PROJECTS[item.request.project].name;

      const prompt =
        document.createElement("p");

      prompt.textContent =
        item.request.prompt.slice(0, 200);

      const date =
        document.createElement("small");

      date.textContent = new Date(
        item.response.createdAt
      ).toLocaleString();

      const button =
        document.createElement("button");

      button.type = "button";

      button.textContent = "↗";

      button.addEventListener("click", () => {

        if (state.busy) return;

        setProject(item.request.project);
        setLanguage(item.request.language);
        selectTool(item.request.tool);
        setProvider(item.request.provider);
        setSchool(item.request.school);

        const input = getPromptInput();

        if (input) {
          input.value = item.request.prompt;
        }

        state.lastRequest = {
          ...item.request
        };

        displayResponse(item.response);

        setStatus("success");

      });

      card.append(
        title,
        prompt,
        date,
        button
      );

      container.appendChild(card);

    });

  }

  function clearHistory() {

    if (state.busy) return;

    state.history = [];

    renderHistory();

  }

  /* COPY RESPONSE */

  async function copyResponse() {

    const answer = state.lastResponse?.answer;

    if (!answer) return false;

    try {

      await navigator.clipboard.writeText(answer);

      setStatus("copied");

      return true;

    } catch {

      setStatus("error", translate("copyError"));

      return false;

    }

  }

  /* CLEAR WORKSPACE */

  function clearWorkspace() {

    if (state.busy) return;

    const input = getPromptInput();
    const output = getResponseOutput();

    if (input) {
      input.value = "";
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

    }

    state.lastRequest = null;
    state.lastResponse = null;

    $$("[data-ai-provider]").forEach(element => {
      element.textContent = "—";
    });

    setStatus("ready");

  }

  /* RETRY REQUEST */

  function retryRequest() {

    if (!state.lastRequest) {
      return Promise.resolve(null);
    }

    return executeRequest({
      ...state.lastRequest
    });

  }

  /* EXPORT AI RESPONSE */

  function downloadResponse() {

    const response = state.lastResponse;

    if (!response?.answer) return;

    const content = [

      "BSS1815 PRO-MAX DMP",

      PROJECTS[response.project].name,

      `Provider: ${response.provider}`,

      `Date: ${response.createdAt}`,

      "",

      response.answer

    ].join("\n");

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
      `bss1815-ai-${Date.now()}.txt`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(
      () => URL.revokeObjectURL(url),
      1000
    );

  }

  /* PROF AVATAR */

  function getAvatar() {

    return $(

      "video[data-prof-avatar], " +
      "video#prof-avatar, " +
      "video#prof-avatar-video, " +
      "video#aiProfAvatar, " +
      "#prof-avatar video"

    );

  }

  async function playAvatar() {

    const video = getAvatar();

    if (!video) {

      setStatus("avatarError");

      return false;

    }

    if (
      !video.getAttribute("src") &&
      !video.querySelector("source")
    ) {

      video.src = new URL(
        CONFIG.avatar,
        CONFIG.domain
      ).href;

    }

    try {

      await video.play();

      return true;

    } catch {

      setStatus("avatarError");

      return false;

    }

  }

  function stopAvatar() {

    const video = getAvatar();

    if (!video) return;

    video.pause();

    if (video.readyState > 0) {
      video.currentTime = 0;
    }

  }

  /* CONNECT PROFESSOR FORM */

  function connectProfessor() {

    const form = $(

      "#prof-form, " +
      "#professor-form, " +
      "[data-prof-form]"

    );

    bind(form, "submit", async event => {

      event.preventDefault();

      if (state.busy) return;

      const input = form.querySelector(

        "[data-prof-prompt], " +
        "[name='question'], " +
        "[name='message'], " +
        "textarea"

      );

      const output = $(

        "#prof-response, " +
        "#professor-response, " +
        "[data-prof-response]"

      );

      if (!input) return;

      setBusy(true);

      setStatus("processing");

      try {

        const response = await askProfessor({

          prompt: input.value,

          project: state.project,

          language: state.language,

          school: state.school

        });

        if (output) {

          if (
            output.tagName === "TEXTAREA" ||
            output.tagName === "INPUT"
          ) {

            output.value = response.answer;

          } else {

            output.textContent = response.answer;

          }

        }

        setStatus("success");

      } catch (error) {

        if (output) {
          output.textContent = error.message;
        }

        setStatus("error", error.message);

      } finally {

        setBusy(false);

      }

    });

    $$("[data-prof-play]").forEach(button => {
      bind(button, "click", playAvatar);
    });

    $$("[data-prof-stop]").forEach(button => {
      bind(button, "click", stopAvatar);
    });

  }

  /* CONNECT CENTRAL AI FORM */

  function connectAIForm() {

    const form = $(
      "#ai-form, [data-ai-form]"
    );

    bind(form, "submit", async event => {

      event.preventDefault();

      const input = getPromptInput();

      if (!input || state.busy) return;

      try {

        await executeRequest({
          prompt: input.value
        });

      } catch {

        // Error already displayed by executeRequest.

      }

    });

  }

  /* CONNECT PROJECT BUTTONS */

  function connectProjects() {

    $$("[data-ai-project]").forEach(button => {

      bind(button, "click", () => {

        try {

          setProject(button.dataset.aiProject);

        } catch (error) {

          setStatus("error", error.message);

        }

      });

    });

    $$("[data-ai-project-selector]").forEach(element => {

      if (element.tagName !== "SELECT") return;

      bind(element, "change", () => {

        try {

          setProject(element.value);

        } catch (error) {

          setStatus("error", error.message);

        }

      });

    });

    $$("[data-ai-school]").forEach(element => {

      bind(element, "change", () => {

        setSchool(element.value);

      });

    });

  }

  /* CONNECT PROVIDERS */

  function connectProviders() {

    $$("[data-ai-provider-select]").forEach(element => {

      bind(element, "change", () => {

        try {

          setProvider(element.value);

        } catch (error) {

          setStatus("error", error.message);

        }

      });

    });

    $$("[data-ai-engine]").forEach(button => {

      bind(button, "click", () => {

        try {

          setProvider(button.dataset.aiEngine);

        } catch (error) {

          setStatus("error", error.message);

        }

      });

    });

  }

  /* CONNECT ALL WORKSPACE BUTTONS */

  function connectButtons() {

    $$("[data-ai-lang]").forEach(button => {

      bind(button, "click", () => {
        setLanguage(button.dataset.aiLang);
      });

    });

    $$("[data-ai-copy]").forEach(button => {
      bind(button, "click", copyResponse);
    });

    $$("[data-ai-clear]").forEach(button => {
      bind(button, "click", clearWorkspace);
    });

    $$("[data-ai-download]").forEach(button => {
      bind(button, "click", downloadResponse);
    });

    $$("[data-ai-clear-history]").forEach(button => {
      bind(button, "click", clearHistory);
    });

    $$("[data-ai-retry]").forEach(button => {

      bind(button, "click", async () => {

        try {

          await retryRequest();

        } catch {

          // Error already displayed.

        }

      });

    });

    $$("[data-ai-tool]").forEach(button => {

      bind(button, "click", () => {

        selectTool(button.dataset.aiTool);

      });

    });

  }

  /* CENTRAL AI CENTER NAVIGATION */

  function getCentralURL(project, language) {

    const normalized = normalizeProject(
      project || state.project
    );

    if (!normalized) {
      throw new Error(translate("invalidProject"));
    }

    const url = new URL(
      "/ai-center.html",
      CONFIG.domain
    );

    url.searchParams.set(
      "project",
      normalized
    );

    url.searchParams.set(
      "lang",
      normalizeLanguage(
        language || state.language
      )
    );

    return url.href;

  }

  function openCentralAI(project, language) {

    window.location.assign(
      getCentralURL(project, language)
    );

  }

  function connectCentralLinks() {

    $$("[data-open-central-ai]").forEach(element => {

      const project =
        element.dataset.openCentralAi ||
        state.project;

      try {

        const url = getCentralURL(project);

        if (element.tagName === "A") {

          element.href = url;

        } else {

          bind(element, "click", () => {

            openCentralAI(project);

          });

        }

      } catch (error) {

        console.error(error.message);

      }

    });

  }

  /* INITIALIZATION */

  function initialize() {

    if (state.initialized) return;

    state.initialized = true;

    const params = new URLSearchParams(
      window.location.search
    );

    const project = normalizeProject(

      params.get("project") ||

      document.body?.dataset.aiProject ||

      CONFIG.defaultProject

    );

    if (project) {
      state.project = project;
    }

    state.language = normalizeLanguage(

      params.get("lang") ||

      document.documentElement.lang ||

      CONFIG.defaultLanguage

    );

    const provider = params.get("provider");

    if (
      provider &&
      has(CONFIG.endpoints, provider)
    ) {

      state.provider = provider;

    }

    const school = params.get("school");

    if (school && state.project === "academy") {

      setSchool(school);

    }

    updateProjectInterface();

    updateLanguageInterface();

    setProvider(state.provider);

    renderTools();

    renderHistory();

    connectProjects();

    connectProviders();

    connectButtons();

    connectAIForm();

    connectProfessor();

    connectCentralLinks();

    setStatus("ready");

    window.addEventListener(

      "proMaxLanguageChanged",

      event => {

        const language =

          event.detail?.language ||

          event.detail?.lang ||

          event.detail;

        if (typeof language === "string") {

          setLanguage(language);

        }

      }

    );

    window.dispatchEvent(

      new CustomEvent(

        "bss1815-central-ai-ready",

        {
          detail: {
            version: CONFIG.version,
            project: state.project,
            provider: state.provider,
            language: state.language
          }
        }

      )

    );

    console.info(

      "BSS1815 CENTRAL AI CONTROLLER INITIALIZED",

      CONFIG.version

    );

  }

  /* GLOBAL CENTRAL AI GATEWAY */

  const GATEWAY = Object.freeze({

    version: CONFIG.version,

    ask: sendAIRequest,

    execute: executeRequest,

    openai: askOpenAI,

    gemini: askGemini,

    professor: askProfessor,

    setProject,

    getProject,

    setProvider,

    getProvider,

    setLanguage,

    setSchool,

    selectTool,

    playAvatar,

    stopAvatar,

    copyResponse,

    clearWorkspace,

    clearHistory,

    downloadResponse,

    retry: retryRequest,

    getCentralURL,

    openCentralAI,

    getProjects: () => Object.keys(PROJECTS),

    getSchools: () => ({ ...SCHOOLS }),

    getHistory: () => state.history.map(item => ({

      request: { ...item.request },

      response: { ...item.response }

    })),

    isBusy: () => state.busy,

    getStatus: () => ({

      initialized: state.initialized,

      project: state.project,

      provider: state.provider,

      language: state.language,

      school: state.school,

      tool: state.tool,

      busy: state.busy

    })

  });

  /* GLOBAL COMPATIBILITY */

  window.PRO_MAX_AI_GATEWAY = GATEWAY;

  window.PRO_MAX_AI_CENTER = GATEWAY;

  if (!window.BSS1815_CENTRAL_AI) {

    window.BSS1815_CENTRAL_AI = GATEWAY;

  }

  window.initializeAICenter = initialize;

  window.selectAITool = selectTool;

  window.setActiveAIProject = setProject;

  window.getActiveAIProject = getProject;

  window.createAIRequest = createRequest;

  window.sendAIRequest = sendAIRequest;

  window.copyAIResponse = copyResponse;

  window.clearAIWorkspace = clearWorkspace;

  window.downloadAIResponse = downloadResponse;

  window.clearAIHistory = clearHistory;

  window.playProfAvatar = playAvatar;

  window.stopProfAvatar = stopAvatar;

  /* START CENTRAL CONTROLLER */

  if (document.readyState === "loading") {

    document.addEventListener(

      "DOMContentLoaded",

      initialize,

      { once: true }

    );

  } else {

    initialize();

  }

})();

/* =========================================================
   END OF CENTRAL AI CONTROLLER

   BSS1815 PRO-MAX DMP
   ONE PLATFORM — ONE CENTRAL AI SYSTEM

   VERSION 3.0.1

   DEVAN DEVAN NÈT.
========================================================= */
