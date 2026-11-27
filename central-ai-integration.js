/* =========================================================
   BSS1815 PRO-MAX DMP
   CENTRAL AI INTEGRATION SYSTEM
   FILE: central-ai-integration.js
   VERSION: 1.0.0

   ONE PLATFORM — ONE CENTRAL AI SYSTEM
   DEVAN DEVAN NÈT.
========================================================= */

"use strict";

(() => {

  const CONFIG = Object.freeze({

    domain: "https://bss1815promaxdmp.com",

    controller:
      "/central-ai-controller.js",

    center:
      "/ai-center.html",

    avatar:
      "/promax-dmp.mp4",

    endpoints: Object.freeze({

      openai: "/.netlify/functions/openai-live",

      gemini: "/.netlify/functions/gemini-live",

      professor: "/.netlify/functions/professor"

    }),

    timeout: 15000

  });

  /* =====================================================
     PROJECT REGISTRY
  ===================================================== */

  const PROJECTS = Object.freeze({

    bss1815: "BSS1815 COMMUNITY",

    "pro-max-fm": "PRO-MAX FM 106.5 FM",

    maximax: "MAXIMAX MULTI SERVICES",

    academy: "PRO-MAX ACADÉMIE",

    "beat-lab": "PRO-MAX BEAT LAB",

    "leogane-info": "LÉOGÂNE INFO",

    ddn: "DEVAN DEVAN NÈT"

  });

  const SCHOOLS = Object.freeze({

    general: "PRO-MAX ACADÉMIE",

    "real-estate": "REAL ESTATE SCHOOL",

    insurance: "INSURANCE SCHOOL",

    journalism: "ÉCOLE DE JOURNALISME",

    "beat-maker": "BEAT MAKER AI SCHOOL"

  });

  const ALIASES = Object.freeze({

    community: "bss1815",

    bss: "bss1815",

    fm: "pro-max-fm",

    radio: "pro-max-fm",

    promaxfm: "pro-max-fm",

    multiservices: "maximax",

    academie: "academy",

    "academie-parent": "academy",

    beatlab: "beat-lab",

    beatmaker: "academy",

    journalisme: "academy",

    journalism: "academy",

    leogane: "leogane-info"

  });

  /* =====================================================
     INTEGRATION STATE
  ===================================================== */

  const state = {

    initialized: false,

    controllerReady: false,

    project: "bss1815",

    school: "",

    language: "ht",

    provider: "openai",

    controllerPromise: null

  };

  const has = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);

  const bound = new WeakSet();

  /* =====================================================
     LANGUAGE MANAGEMENT
  ===================================================== */

  function normalizeLanguage(value) {

    const language = String(value || "ht")
      .trim()
      .toLowerCase()
      .split("-")[0];

    const aliases = {

      kre: "ht",

      kreyol: "ht",

      fra: "fr",

      eng: "en"

    };

    const result = aliases[language] || language;

    return ["ht", "fr", "en"].includes(result)

      ? result

      : "ht";

  }

  function getLanguage() {

    return state.language;

  }

  function setLanguage(language) {

    state.language = normalizeLanguage(language);

    const gateway = getGateway();

    if (gateway) {

      gateway.setLanguage(state.language);

    }

    refreshLinks();

    return state.language;

  }

  /* =====================================================
     PROJECT MANAGEMENT
  ===================================================== */

  function normalizeProject(value) {

    const project = String(value || "")
      .trim()
      .toLowerCase();

    if (has(PROJECTS, project)) {

      return project;

    }

    if (has(ALIASES, project)) {

      return ALIASES[project];

    }

    return null;

  }

  function detectProject() {

    const params = new URLSearchParams(
      window.location.search
    );

    const explicitProject =

      params.get("project") ||

      document.body?.dataset.aiProject ||

      document.querySelector(
        'meta[name="bss1815-project"]'
      )?.content;

    const normalized =
      normalizeProject(explicitProject);

    if (normalized) {

      return normalized;

    }

    const address = (

      window.location.hostname +

      window.location.pathname

    ).toLowerCase();

    if (/maximax|multi-services/.test(address)) {

      return "maximax";

    }

    if (/real-estate|insurance-school|journalism|journalisme|beat-maker|academie|academy/.test(address)) {

      return "academy";

    }

    if (/beat-lab|beatlab/.test(address)) {

      return "beat-lab";

    }

    if (/leogane-info|leogane-infos/.test(address)) {

      return "leogane-info";

    }

    if (/pro-max-fm|promaxfm/.test(address)) {

      return "pro-max-fm";

    }

    if (/devan-devan-net|ddn/.test(address)) {

      return "ddn";

    }

    return "bss1815";

  }

  function setProject(project) {

    const normalized = normalizeProject(project);

    if (!normalized) {

      throw new Error("Unknown BSS1815 project.");

    }

    state.project = normalized;

    if (normalized !== "academy") {

      state.school = "";

    }

    const gateway = getGateway();

    if (gateway) {

      gateway.setProject(normalized);

      gateway.setSchool(state.school);

    }

    refreshLinks();

    return normalized;

  }

  /* =====================================================
     ACADEMY SCHOOL MANAGEMENT
  ===================================================== */

  function detectSchool() {

    if (state.project !== "academy") {

      return "";

    }

    const params = new URLSearchParams(
      window.location.search
    );

    const explicitSchool =

      params.get("school") ||

      document.body?.dataset.aiSchool;

    if (explicitSchool) {

      return String(explicitSchool).slice(0, 150);

    }

    const address = (

      window.location.hostname +

      window.location.pathname

    ).toLowerCase();

    if (/real-estate/.test(address)) {

      return "real-estate";

    }

    if (/insurance/.test(address)) {

      return "insurance";

    }

    if (/journalism|journalisme/.test(address)) {

      return "journalism";

    }

    if (/beat-maker|beatmaker/.test(address)) {

      return "beat-maker";

    }

    return "general";

  }

  function setSchool(school) {

    state.school = state.project === "academy"

      ? String(school || "").slice(0, 150)

      : "";

    const gateway = getGateway();

    if (gateway) {

      gateway.setSchool(

        SCHOOLS[state.school] || state.school

      );

    }

    refreshLinks();

    return state.school;

  }

  /* =====================================================
     CENTRAL AI GATEWAY
  ===================================================== */

  function getGateway() {

    const gateway = window.PRO_MAX_AI_GATEWAY;

    if (

      gateway &&

      typeof gateway.ask === "function" &&

      typeof gateway.setProject === "function" &&

      typeof gateway.setLanguage === "function" &&

      typeof gateway.setSchool === "function" &&

      typeof gateway.setProvider === "function"

    ) {

      return gateway;

    }

    return null;

  }

  function configureGateway(gateway) {

    gateway.setProject(state.project);

    gateway.setLanguage(state.language);

    gateway.setSchool(

      SCHOOLS[state.school] || state.school

    );

    gateway.setProvider(state.provider);

    state.controllerReady = true;

    return gateway;

  }

  /* =====================================================
     LOAD CENTRAL CONTROLLER
  ===================================================== */

  function loadController() {

    const existingGateway = getGateway();

    if (existingGateway) {

      return Promise.resolve(

        configureGateway(existingGateway)

      );

    }

    if (state.controllerPromise) {

      return state.controllerPromise;

    }

    state.controllerPromise = new Promise(

      (resolve, reject) => {

        let settled = false;

        let timer;

        let interval;

        const source = new URL(

          CONFIG.controller,

          CONFIG.domain

        ).href;

        let script = Array.from(

          document.scripts

        ).find(element => element.src === source);

        const created = !script;

        function cleanup() {

          clearTimeout(timer);

          clearInterval(interval);

          window.removeEventListener(

            "bss1815-central-ai-ready",

            check

          );

          script?.removeEventListener("error", fail);

        }

        function fail() {

          if (settled) return;

          settled = true;

          cleanup();

          if (created) script?.remove();

          state.controllerReady = false;

          state.controllerPromise = null;

          reject(

            new Error(

              "Central AI Controller unavailable."

            )

          );

        }

        function check() {

          if (settled) return;

          const gateway = getGateway();

          if (!gateway) return;

          try {

            const configured =
              configureGateway(gateway);

            settled = true;

            cleanup();

            resolve(configured);

          } catch {

            fail();

          }

        }

        if (!script) {

          script = document.createElement("script");

          script.src = source;

          script.async = true;

          script.dataset.bss1815Controller = "true";

        }

        script.addEventListener("error", fail);

        window.addEventListener(

          "bss1815-central-ai-ready",

          check

        );

        timer = setTimeout(fail, CONFIG.timeout);

        interval = setInterval(check, 100);

        if (created) {

          document.head.appendChild(script);

        }

        check();

      }

    );

    return state.controllerPromise;

  }

  /* =====================================================
     CENTRAL AI REQUEST
  ===================================================== */

  async function ask(input) {

    const options = typeof input === "string"

      ? { prompt: input }

      : input || {};

    const prompt = String(

      options.prompt ||

      options.message ||

      options.question ||

      ""

    ).trim();

    if (!prompt) {

      throw new Error("AI message is required.");

    }

    const project = normalizeProject(

      options.project || state.project

    );

    if (!project) {

      throw new Error("Invalid project.");

    }

    const provider =

      options.provider || state.provider;

    if (!has(CONFIG.endpoints, provider)) {

      throw new Error("Invalid AI provider.");

    }

    const gateway = await loadController();

    return gateway.ask({

      prompt,

      project,

      language: normalizeLanguage(

        options.language || state.language

      ),

      provider,

      tool: options.tool || "assistant",

      school: project === "academy"

        ? SCHOOLS[options.school || state.school] ||

          options.school ||

          state.school

        : ""

    });

  }

  /* =====================================================
     OPENAI LIVE
  ===================================================== */

  function openai(input) {

    const options = typeof input === "string"

      ? { prompt: input }

      : input || {};

    return ask({

      ...options,

      provider: "openai"

    });

  }

  /* =====================================================
     GEMINI LIVE
  ===================================================== */

  function gemini(input) {

    const options = typeof input === "string"

      ? { prompt: input }

      : input || {};

    return ask({

      ...options,

      provider: "gemini"

    });

  }

  /* =====================================================
     AI PROFESSOR
  ===================================================== */

  function professor(input) {

    const options = typeof input === "string"

      ? { prompt: input }

      : input || {};

    return ask({

      ...options,

      provider: "professor",

      tool: "tutor"

    });

  }

  /* =====================================================
     PROVIDER MANAGEMENT
  ===================================================== */

  function setProvider(provider) {

    if (!has(CONFIG.endpoints, provider)) {

      throw new Error("Invalid AI provider.");

    }

    state.provider = provider;

    const gateway = getGateway();

    if (gateway) {

      gateway.setProvider(provider);

    }

    refreshLinks();

    return provider;

  }

  /* =====================================================
     CENTRAL AI NAVIGATION
  ===================================================== */

  function getCentralURL(options = {}) {

    const project = normalizeProject(

      options.project || state.project

    );

    if (!project) {

      throw new Error("Invalid project.");

    }

    const url = new URL(

      CONFIG.center,

      CONFIG.domain

    );

    url.searchParams.set("project", project);

    url.searchParams.set(

      "lang",

      normalizeLanguage(

        options.language || state.language

      )

    );

    const provider =

      options.provider || state.provider;

    if (has(CONFIG.endpoints, provider)) {

      url.searchParams.set("provider", provider);

    }

    if (project === "academy") {

      const school =

        options.school || state.school;

      if (school) {

        url.searchParams.set("school", school);

      }

    }

    return url.href;

  }

  function openCentralAI(options = {}) {

    window.location.assign(

      getCentralURL(options)

    );

  }

  /* =====================================================
     CONNECT PROJECT BUTTONS
  ===================================================== */

  function buttonOptions(element) {

    return {

      project:

        element.dataset.openCentralAi ||

        element.dataset.centralAiProject ||

        state.project,

      school:

        element.dataset.centralAiSchool ||

        state.school,

      provider:

        element.dataset.centralAiProvider ||

        state.provider,

      language: state.language

    };

  }

  function refreshLinks() {

    document.querySelectorAll(

      "[data-open-central-ai], " +

      "[data-central-ai-link]"

    ).forEach(element => {

      try {

        const url = getCentralURL(

          buttonOptions(element)

        );

        if (element.tagName === "A") {

          element.href = url;

          return;

        }

        if (bound.has(element)) return;

        bound.add(element);

        element.addEventListener("click", event => {

          event.preventDefault();

          openCentralAI(buttonOptions(element));

        });

      } catch (error) {

        console.error(

          "BSS1815 AI LINK:",

          error.message

        );

      }

    });

  }

  /* =====================================================
     PROF AVATAR INTEGRATION
  ===================================================== */

  function getAvatarURL() {

    return new URL(

      CONFIG.avatar,

      CONFIG.domain

    ).href;

  }

  function connectAvatar() {

    document.querySelectorAll(

      "video[data-central-prof-avatar]"

    ).forEach(video => {

      if (

        !video.getAttribute("src") &&

        !video.querySelector("source")

      ) {

        video.src = getAvatarURL();

      }

      video.controls = true;

      video.playsInline = true;

      video.preload = "metadata";

    });

  }

  /* =====================================================
     CONNECT PROJECT AI FORMS
  ===================================================== */

  function connectForms() {

    document.querySelectorAll(

      "form[data-central-ai-form]"

    ).forEach(form => {

      if (bound.has(form)) return;

      bound.add(form);

      let busy = false;

      form.addEventListener("submit", async event => {

        event.preventDefault();

        if (busy) return;

        const input = form.querySelector(

          "[data-central-ai-prompt], " +

          "[name='prompt'], " +

          "[name='message'], textarea"

        );

        const outputSelector =

          form.dataset.centralAiOutput;

        let output = form.querySelector(

          "[data-central-ai-response]"

        );

        if (outputSelector) {

          try {

            output = document.querySelector(

              outputSelector

            ) || output;

          } catch {

            // Preserve the local response element.

          }

        }

        if (!input || !output) return;

        const prompt = input.value.trim();

        if (!prompt) return;

        const buttons = Array.from(

          form.querySelectorAll(

            "button[type='submit'], " +

            "input[type='submit']"

          )

        );

        const previousStates = buttons.map(

          button => button.disabled

        );

        function display(value) {

          if (

            output.tagName === "TEXTAREA" ||

            output.tagName === "INPUT"

          ) {

            output.value = value;

          } else {

            output.textContent = value;

          }

        }

        busy = true;

        form.setAttribute("aria-busy", "true");

        buttons.forEach(button => {

          button.disabled = true;

        });

        const processing = {

          ht: "AI ap trete demann nan...",

          fr: "Traitement en cours...",

          en: "Processing your request..."

        };

        display(processing[state.language]);

        try {

          const result = await ask({

            prompt,

            project:

              form.dataset.centralAiProject ||

              state.project,

            school:

              form.dataset.centralAiSchool ||

              state.school,

            provider:

              form.dataset.centralAiProvider ||

              state.provider,

            tool:

              form.dataset.centralAiTool ||

              "assistant"

          });

          display(result.answer);

        } catch (error) {

          display(error.message);

        } finally {

          busy = false;

          form.setAttribute("aria-busy", "false");

          buttons.forEach((button, index) => {

            button.disabled = previousStates[index];

          });

        }

      });

    });

  }

  /* =====================================================
     INTEGRATION STATUS
  ===================================================== */

  function getStatus() {

    return {

      initialized: state.initialized,

      controllerReady: state.controllerReady,

      project: state.project,

      projectName: PROJECTS[state.project],

      school: state.school,

      language: state.language,

      provider: state.provider,

      centralURL: getCentralURL()

    };

  }

  /* =====================================================
     INITIALIZE CENTRAL INTEGRATION
  ===================================================== */

  function initialize() {

    if (state.initialized) return;

    state.initialized = true;

    const params = new URLSearchParams(

      window.location.search

    );

    state.project = detectProject();

    state.school = detectSchool();

    state.language = normalizeLanguage(

      params.get("lang") ||

      document.documentElement.lang ||

      "ht"

    );

    const provider = params.get("provider");

    if (provider && has(CONFIG.endpoints, provider)) {

      state.provider = provider;

    }

    refreshLinks();

    connectForms();

    connectAvatar();

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

        "bss1815-integration-ready",

        {

          detail: getStatus()

        }

      )

    );

    console.info(

      "BSS1815 CENTRAL AI INTEGRATION READY",

      getStatus()

    );

  }

  /* =====================================================
     GLOBAL INTEGRATION API
  ===================================================== */

  window.BSS1815_INTEGRATION = Object.freeze({

    version: "1.0.0",

    initialize,

    loadController,

    ask,

    openai,

    gemini,

    professor,

    setProject,

    setSchool,

    setLanguage,

    getLanguage,

    setProvider,

    getCentralURL,

    openCentralAI,

    getAvatarURL,

    getStatus,

    refresh: () => {

      refreshLinks();

      connectForms();

      connectAvatar();

    },

    getProjects: () => ({ ...PROJECTS }),

    getSchools: () => ({ ...SCHOOLS })

  });

  /* =====================================================
     AUTOMATIC START
  ===================================================== */

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
   END OF CENTRAL AI INTEGRATION

   BSS1815 PRO-MAX DMP

   BATI POU JODI A, PARE POU DEMEN.

   DEVAN DEVAN NÈT.
========================================================= */
