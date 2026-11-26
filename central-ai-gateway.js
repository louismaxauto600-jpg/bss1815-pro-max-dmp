/* =========================================================
   BSS1815 PRO-MAX DMP
   CENTRAL AI CONTROLLER — UNIFIED EDITION
   OPENAI + GEMINI + PROF AVATAR
   VERSION 2.0.0
   DEVAN DEVAN NÈT
   ========================================================= */

(function () {

  "use strict";

  const CONFIG = {

    version: "2.0.0",

    endpoint: "/.netlify/functions/ai",

    endpoints: {
      openai: "/.netlify/functions/ai",
      gemini: "/.netlify/functions/professor",
      professor: "/.netlify/functions/professor"
    },

    avatar: "/video-prof-avatar.mp4",

    timeout: 45000,

    storageKeys: {
      activeProject: "proMaxActiveProject",
      activeTool: "proMaxActiveAITool",
      history: "proMaxAIHistory",
      settings: "proMaxAISettings"
    },

    projects: {

      bss1815: {
        id: "bss1815",
        name: "BRIYANT SOLÈY SIGNO 1815",
        icon: "🏛️",
        context: "Community, history, organization, members, logistics, events and official documents."
      },

      "pro-max-fm": {
        id: "pro-max-fm",
        name: "PRO-MAX FM 106.5 FM",
        icon: "📻",
        context: "Radio broadcasting, music, news, interviews, podcasts, programming and media production."
      },

      maximax: {
        id: "maximax",
        name: "MAXIMAX MULTI SERVICES",
        icon: "🏢",
        context: "Immigration, notary, taxes, insurance, real estate, business, apostille, translation and customer service. Provide general information, not individualized legal advice. Never claim to be an attorney."
      },

      academy: {
        id: "academy",
        name: "PRO-MAX ACADÉMIE",
        icon: "🎓",
        context: "All Academy schools, including Real Estate School, Insurance School, Journalism School and Beat Maker AI School. Courses, lessons, exercises, examinations and student support."
      },

      "beat-lab": {
        id: "beat-lab",
        name: "PRO-MAX BEAT LAB",
        icon: "🎵",
        context: "Music composition, lyrics, rhythm, arrangements, production planning and creative assistance."
      },

      "leogane-info": {
        id: "leogane-info",
        name: "LÉOGÂNE INFO",
        icon: "📰",
        context: "Journalism, interviews, reporting, community news, editorial assistance and fact checking. Never fabricate news or sources."
      },

      ddn: {
        id: "ddn",
        name: "DEVAN DEVAN NÈT",
        icon: "🌍",
        context: "Digital innovation, communication, information, technology and artificial intelligence."
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
          ht: "Asistans entèlijan pou tout pwojè yo.",
          fr: "Assistance intelligente pour tous les projets.",
          en: "Intelligent assistance for all projects."
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
          ht: "Kreye lèt, script ak dokiman.",
          fr: "Créez des lettres, scripts et documents.",
          en: "Create letters, scripts and documents."
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
          ht: "Tradui kontni nan plizyè lang.",
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
          ht: "PROF AVATAR",
          fr: "PROF AVATAR",
          en: "PROF AVATAR"
        },
        description: {
          ht: "Pwofesè AI pou tout lekòl Académie yo.",
          fr: "Professeur IA pour toutes les écoles.",
          en: "AI professor for all Academy schools."
        }
      }

    ]

  };

  /* =====================================================
     APPLICATION STATE
     ===================================================== */

  const state = {

    initialized: false,

    busy: false,

    provider: "openai",

    activeProject: "bss1815",

    activeTool: "assistant",

    lastRequest: null,

    lastResponse: null,

    avatarPlaying: false

  };

  /* =====================================================
     DOM HELPERS
     ===================================================== */

  function query(selector) {
    return document.querySelector(selector);
  }

  function queryAll(selector) {
    return document.querySelectorAll(selector);
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(
      object,
      key
    );
  }

  /* =====================================================
     STORAGE
     ===================================================== */

  function storageGet(key) {

    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }

  }

  function storageSet(key, value) {

    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }

  }

  function storageRemove(key) {

    try {
      localStorage.removeItem(key);
    } catch {
      console.warn("Local storage unavailable.");
    }

  }

  /* =====================================================
     LANGUAGE MANAGEMENT
     ===================================================== */

  function normalizeLanguage(language) {

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

    return hasOwn(aliases, value)
      ? aliases[value]
      : "ht";

  }

  function getLanguage() {

    if (
      typeof window.getCurrentLanguage === "function"
    ) {

      return normalizeLanguage(
        window.getCurrentLanguage()
      );

    }

    return normalizeLanguage(

      storageGet("proMaxLanguage") ||

      document.documentElement.lang ||

      "ht"

    );

  }

  function translate(ht, fr, en) {

    const language = getLanguage();

    if (language === "fr") return fr;

    if (language === "en") return en;

    return ht;

  }

  function localized(value) {

    if (typeof value === "string") {
      return value;
    }

    return (

      value?.[getLanguage()] ||

      value?.ht ||

      value?.fr ||

      value?.en ||

      ""

    );

  }

  /* =====================================================
     PROJECT MANAGEMENT
     ===================================================== */

  function getActiveAIProject() {

    return state.activeProject;

  }

  function setActiveAIProject(projectId) {

    if (!hasOwn(CONFIG.projects, projectId)) {
      return false;
    }

    state.activeProject = projectId;

    storageSet(
      CONFIG.storageKeys.activeProject,
      projectId
    );

    updateProjectDisplay();

    document.dispatchEvent(

      new CustomEvent(
        "proMaxAIProjectChanged",
        {
          detail: {
            project: projectId
          }
        }
      )

    );

    return true;

  }

  function initializeProjectSelector() {

    const selector = query(

      "#ai-project-selector, " +
      "[data-ai-project-selector]"

    );

    if (!selector) return;

    selector.innerHTML = "";

    Object.values(CONFIG.projects)
      .forEach(project => {

        const option =
          document.createElement("option");

        option.value = project.id;

        option.textContent =
          `${project.icon} ${project.name}`;

        selector.appendChild(option);

      });

    selector.value = state.activeProject;

    selector.addEventListener(
      "change",
      () => setActiveAIProject(selector.value)
    );

  }

  function updateProjectDisplay() {

    const project =
      CONFIG.projects[state.activeProject];

    queryAll("[data-ai-active-project]")
      .forEach(element => {

        element.textContent =
          `${project.icon} ${project.name}`;

      });

    const selector = query(

      "#ai-project-selector, " +
      "[data-ai-project-selector]"

    );

    if (selector) {

      selector.value = state.activeProject;

    }

    updateToolDisplay();

  }

  /* =====================================================
     AI TOOL MANAGEMENT
     ===================================================== */

  function getAITool(toolId) {

    return CONFIG.tools.find(
      tool => tool.id === toolId
    );

  }

  function selectAITool(toolId) {

    const tool = getAITool(toolId);

    if (!tool) return false;

    state.activeTool = toolId;

    storageSet(
      CONFIG.storageKeys.activeTool,
      toolId
    );

    queryAll("[data-ai-tool]")
      .forEach(card => {

        const active =
          card.dataset.aiTool === toolId;

        card.classList.toggle(
          "active",
          active
        );

        card.setAttribute(
          "aria-pressed",
          String(active)
        );

      });

    updateToolDisplay();

    return true;

  }

  function renderAIToolCards() {

    const container = query(

      "#ai-tools, [data-ai-tools]"

    );

    if (!container) return;

    container.innerHTML = "";

    CONFIG.tools.forEach(tool => {

      const button =
        document.createElement("button");

      button.type = "button";

      button.className = "ai-tool-card";

      button.dataset.aiTool = tool.id;

      const active =
        state.activeTool === tool.id;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );

      button.innerHTML = `

        <span class="ai-tool-icon">
          ${tool.icon}
        </span>

        <span class="ai-tool-information">

          <strong>
            ${escapeHTML(localized(tool.name))}
          </strong>

          <small>
            ${escapeHTML(localized(tool.description))}
          </small>

        </span>

      `;

      button.addEventListener(
        "click",
        () => selectAITool(tool.id)
      );

      container.appendChild(button);

    });

  }

  function updateToolDisplay() {

    const tool = getAITool(state.activeTool);

    if (!tool) return;

    queryAll("[data-ai-active-tool]")
      .forEach(element => {

        element.textContent =
          `${tool.icon} ${localized(tool.name)}`;

      });

    const input = query(

      "#ai-prompt, " +
      "[data-ai-prompt], " +
      "[name='prompt']"

    );

    if (input) {

      input.placeholder = translate(

        `Ekri sa ou bezwen ${localized(tool.name)} fè...`,

        `Écrivez votre demande pour ${localized(tool.name)}...`,

        `Write your request for ${localized(tool.name)}...`

      );

    }

  }

  /* =====================================================
     PROVIDER MANAGEMENT
     ===================================================== */

  function setProvider(provider) {

    const value = String(provider || "")
      .trim()
      .toLowerCase();

    if (!hasOwn(CONFIG.endpoints, value)) {
      return false;
    }

    state.provider = value;

    queryAll("[data-ai-provider-select]")
      .forEach(element => {

        if (element.tagName === "SELECT") {

          element.value = value;

        } else {

          const active =

            element.dataset.aiProviderSelect === value;

          element.classList.toggle(
            "active",
            active
          );

          element.setAttribute(
            "aria-pressed",
            String(active)
          );

        }

      });

    return true;

  }

  function getProvider() {

    return state.provider;

  }

  function initializeProviderControls() {

    queryAll("[data-ai-provider-select]")
      .forEach(element => {

        if (element.tagName === "SELECT") {

          element.addEventListener(
            "change",
            () => setProvider(element.value)
          );

        } else {

          element.addEventListener(
            "click",
            () => setProvider(
              element.dataset.aiProviderSelect
            )
          );

        }

      });

    setProvider(state.provider);

  }

  /* =====================================================
     CREATE CENTRAL AI REQUEST
     ===================================================== */

  function createAIRequest(prompt, options = {}) {

    const project =

      hasOwn(CONFIG.projects, options.project)

        ? options.project

        : state.activeProject;

    const tool =

      getAITool(options.tool)

        ? options.tool

        : state.activeTool;

    const provider =

      options.provider ||

      (
        tool === "tutor"
          ? "professor"
          : state.provider
      );

    return {

      id: createRequestId(),

      prompt: String(prompt || "").trim(),

      project,

      tool,

      provider,

      school: String(
        options.school || ""
      ).trim(),

      language: normalizeLanguage(
        options.language || getLanguage()
      ),

      context: CONFIG.projects[project].context,

      user: null,

      createdAt: new Date().toISOString()

    };

  }

  /* =====================================================
     CENTRAL API CONNECTION
     OPENAI + GEMINI + PROFESSOR
     ===================================================== */

  async function sendAIRequest(request = {}) {

    if (state.busy) {

      throw new Error("ai/busy");

    }

    const prompt = String(

      request.prompt ||

      request.message ||

      ""

    ).trim();

    if (!prompt) {

      throw new Error("ai/message-required");

    }

    if (prompt.length > 12000) {

      throw new Error("ai/message-too-long");

    }

    const normalized = createAIRequest(

      prompt,

      request

    );

    if (request.id) {

      normalized.id = request.id;

    }

    const provider = normalized.provider;

    if (!hasOwn(CONFIG.endpoints, provider)) {

      throw new Error("ai/invalid-provider");

    }

    const project =
      CONFIG.projects[normalized.project];

    const message = [

      "BSS1815 PRO-MAX DMP CENTRAL AI CENTER",

      `Project: ${project.name}`,

      `Project context: ${project.context}`,

      `School: ${normalized.school || "Not specified"}`,

      `AI tool: ${normalized.tool}`,

      provider === "professor"

        ? "Act as a professional educational AI professor. Explain clearly and adapt to the student's level."

        : "Act as a professional AI assistant for the active project.",

      "Do not fabricate facts, sources, credentials or access to external systems.",

      "Voice and image tools provide text scripts and prompts only unless a dedicated generation service is available.",

      "Do not request passwords, API keys or unnecessary sensitive personal information.",

      "User request:",

      normalized.prompt

    ].join("\n\n");

    const controller = new AbortController();

    const timeout = setTimeout(

      () => controller.abort(),

      CONFIG.timeout

    );

    state.busy = true;

    state.lastRequest = normalized;

    updateStatus("processing");

    try {

      const response = await fetch(

        CONFIG.endpoints[provider],

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json"

          },

          body: JSON.stringify({

            message,

            mode:

              provider === "professor"

                ? "professor"

                : normalized.tool,

            language: normalized.language

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

      const answer = [

        data.answer,

        data.reply,

        data.content,

        data.response,

        data.text,

        data.message

      ].find(

        value =>

          typeof value === "string" &&

          value.trim()

      );

      if (!answer) {

        throw new Error("ai/empty-response");

      }

      const result = {

        id: normalized.id,

        answer: answer.trim(),

        content: answer.trim(),

        provider:

          provider === "openai"

            ? "OpenAI"

            : "Google Gemini",

        service: provider,

        project: normalized.project,

        school: normalized.school,

        tool: normalized.tool,

        language: normalized.language,

        createdAt: new Date().toISOString()

      };

      state.lastResponse = result;

      updateStatus("success");

      document.dispatchEvent(

        new CustomEvent(

          "proMaxAIResponse",

          {
            detail: result
          }

        )

      );

      return result;

    } catch (error) {

      updateStatus("error");

      throw error;

    } finally {

      clearTimeout(timeout);

      state.busy = false;

    }

  }

  /* =====================================================
     OPENAI SERVICE
     ===================================================== */

  function askOpenAI(prompt, options = {}) {

    return sendAIRequest(

      createAIRequest(

        prompt,

        {
          ...options,
          provider: "openai"
        }

      )

    );

  }

  /* =====================================================
     GEMINI SERVICE
     ===================================================== */

  function askGemini(prompt, options = {}) {

    return sendAIRequest(

      createAIRequest(

        prompt,

        {
          ...options,
          provider: "gemini"
        }

      )

    );

  }

  /* =====================================================
     PROFESSOR AI SERVICE
     ===================================================== */

  async function askProfessor(prompt, options = {}) {

    const result = await sendAIRequest(

      createAIRequest(

        prompt,

        {

          ...options,

          provider: "professor",

          tool: "tutor"

        }

      )

    );

    displayProfessorResponse(result.answer);

    return result;

  }

  /* =====================================================
     CENTRAL AI FORM
     ===================================================== */

  function initializeAIForm() {

    const form = query(

      "#ai-form, [data-ai-form]"

    );

    if (!form) return;

    const input = form.querySelector(

      "#ai-prompt, " +

      "[name='prompt'], " +

      "[data-ai-prompt], " +

      "textarea"

    );

    const button = form.querySelector(

      "button[type='submit'], " +

      "[data-ai-submit]"

    );

    form.addEventListener(

      "submit",

      async event => {

        event.preventDefault();

        if (state.busy) return;

        const prompt =
          input?.value.trim() || "";

        if (!prompt) {

          showMessage(

            translate(

              "Tanpri ekri yon mesaj.",

              "Veuillez écrire un message.",

              "Please enter a message."

            ),

            "error"

          );

          input?.focus();

          return;

        }

        setButtonLoading(button, true);

        try {

          const request = createAIRequest(

            prompt,

            {

              project: form.dataset.project,

              school: form.dataset.school

            }

          );

          const response =

            await sendAIRequest(request);

          displayAIResponse(response);

          if (response.service === "professor") {

            displayProfessorResponse(
              response.answer
            );

          }

          saveAIHistoryItem(

            request,

            response

          );

        } catch (error) {

          showMessage(

            getErrorMessage(error),

            "error"

          );

        } finally {

          setButtonLoading(button, false);

        }

      }

    );

  }

  /* =====================================================
     PROFESSOR FORM
     ===================================================== */

  function initializeProfessorForms() {

    queryAll(

      "#prof-form, " +

      "#professor-form, " +

      "[data-prof-form]"

    ).forEach(form => {

      if (

        form.matches("#ai-form, [data-ai-form]")

      ) {

        return;

      }

      form.addEventListener(

        "submit",

        async event => {

          event.preventDefault();

          if (state.busy) return;

          const input = form.querySelector(

            "[data-prof-prompt], " +

            "[name='question'], " +

            "[name='message'], " +

            "textarea"

          );

          const button = form.querySelector(

            "button[type='submit']"

          );

          const prompt =
            input?.value.trim() || "";

          if (!prompt) return;

          setButtonLoading(button, true);

          try {

            const result = await askProfessor(

              prompt,

              {

                project:

                  form.dataset.project ||

                  state.activeProject,

                school:

                  form.dataset.school || ""

              }

            );

            displayAIResponse(result);

            if (state.lastRequest) {

              saveAIHistoryItem(

                state.lastRequest,

                result

              );

            }

          } catch (error) {

            displayProfessorResponse(

              getErrorMessage(error)

            );

          } finally {

            setButtonLoading(button, false);

          }

        }

      );

    });

  }

  /* =====================================================
     PROF AVATAR VIDEO
     ===================================================== */

  function getAvatar() {

    return query(

      "video#prof-avatar, " +

      "video#prof-avatar-video, " +

      "video[data-prof-avatar], " +

      "#prof-avatar video"

    );

  }

  function initializeAvatar() {

    const avatar = getAvatar();

    if (!avatar) return;

    if (

      !avatar.getAttribute("src") &&

      !avatar.querySelector("source")

    ) {

      avatar.src = CONFIG.avatar;

    }

    avatar.playsInline = true;

    avatar.preload = "metadata";

    avatar.addEventListener("play", () => {

      state.avatarPlaying = true;

    });

    avatar.addEventListener("pause", () => {

      state.avatarPlaying = false;

    });

    avatar.addEventListener("ended", () => {

      state.avatarPlaying = false;

    });

    avatar.addEventListener("error", () => {

      state.avatarPlaying = false;

      console.warn(

        "PROF AVATAR video unavailable."

      );

    });

  }

  async function playAvatar() {

    const avatar = getAvatar();

    if (!avatar) return false;

    try {

      await avatar.play();

      state.avatarPlaying = true;

      return true;

    } catch {

      state.avatarPlaying = false;

      return false;

    }

  }

  function stopAvatar() {

    const avatar = getAvatar();

    if (avatar) {

      avatar.pause();

    }

    state.avatarPlaying = false;

  }

  /* =====================================================
     DISPLAY PROFESSOR RESPONSE
     ===================================================== */

  function displayProfessorResponse(answer) {

    queryAll(

      "#prof-response, " +

      "#professor-response, " +

      "[data-prof-response]"

    ).forEach(element => {

      if (

        element.tagName === "TEXTAREA" ||

        element.tagName === "INPUT"

      ) {

        element.value = answer;

      } else {

        element.textContent = answer;

      }

      element.hidden = false;

    });

  }

  /* =====================================================
     DISPLAY CENTRAL AI RESPONSE
     ===================================================== */

  function displayAIResponse(response) {

    state.lastResponse = response;

    const output = query(

      "#ai-response, [data-ai-response]"

    );

    if (output) {

      output.hidden = false;

      if (

        output.tagName === "TEXTAREA" ||

        output.tagName === "INPUT"

      ) {

        output.value = response.content;

      } else {

        output.textContent = response.content;

      }

      output.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

      });

    }

    queryAll("[data-ai-provider]")
      .forEach(element => {

        element.textContent =

          response.provider || "PRO-MAX AI";

      });

    queryAll("[data-ai-response-date]")
      .forEach(element => {

        element.textContent =

          formatDate(response.createdAt);

      });

  }

  /* =====================================================
     AI RESPONSE ACTIONS
     ===================================================== */

  function getResponseContent() {

    const output = query(

      "#ai-response, [data-ai-response]"

    );

    if (output) {

      if (

        output.tagName === "TEXTAREA" ||

        output.tagName === "INPUT"

      ) {

        return output.value.trim();

      }

      return output.textContent.trim();

    }

    return state.lastResponse?.content || "";

  }

  async function copyAIResponse() {

    const content = getResponseContent();

    if (!content) return;

    try {

      await navigator.clipboard.writeText(

        content

      );

      showMessage(

        translate(

          "Repons lan kopye.",

          "Réponse copiée.",

          "Response copied."

        ),

        "success"

      );

    } catch {

      showMessage(

        translate(

          "Kopi a pa reyisi.",

          "La copie a échoué.",

          "Copy failed."

        ),

        "error"

      );

    }

  }

  function clearAIWorkspace() {

    if (state.busy) return;

    queryAll(

      "#ai-prompt, " +

      "[data-ai-prompt], " +

      "[data-prof-prompt]"

    ).forEach(input => {

      if ("value" in input) {

        input.value = "";

      }

    });

    queryAll(

      "#ai-response, " +

      "[data-ai-response], " +

      "#prof-response, " +

      "#professor-response, " +

      "[data-prof-response]"

    ).forEach(output => {

      if (

        output.tagName === "TEXTAREA" ||

        output.tagName === "INPUT"

      ) {

        output.value = "";

      } else {

        output.textContent = "";

      }

      output.hidden = true;

    });

    queryAll(

      "[data-ai-provider], " +

      "[data-ai-response-date]"

    ).forEach(element => {

      element.textContent = "";

    });

    state.lastResponse = null;

    stopAvatar();

    updateStatus("idle");

  }

  function downloadAIResponse() {

    const content = getResponseContent();

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

      `BSS1815-AI-${state.activeProject}-${Date.now()}.txt`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(

      () => URL.revokeObjectURL(url),

      1000

    );

  }

  async function retryLastAIRequest() {

    if (state.busy) return;

    const request = state.lastRequest;

    if (!request?.prompt) return;

    try {

      const response =

        await sendAIRequest(request);

      displayAIResponse(response);

      if (response.service === "professor") {

        displayProfessorResponse(

          response.answer

        );

      }

      saveAIHistoryItem(

        state.lastRequest,

        response

      );

    } catch (error) {

      showMessage(

        getErrorMessage(error),

        "error"

      );

    }

  }

  /* =====================================================
     AI HISTORY
     ===================================================== */

  let sessionHistory = [];

  function getAIHistory() {

    return sessionHistory.slice();

  }

  function saveAIHistoryItem(request, response) {

    if (!request || !response) return;

    sessionHistory.unshift({

      id: response.id,

      request: {

        id: request.id,

        prompt: request.prompt,

        project: request.project,

        tool: request.tool,

        provider: request.provider,

        school: request.school,

        language: request.language,

        createdAt: request.createdAt

      },

      response

    });

    sessionHistory =

      sessionHistory.slice(0, 50);

    displayAIHistory();

  }

  function displayAIHistory() {

    const container = query(

      "#ai-history, [data-ai-history]"

    );

    if (!container) return;

    container.innerHTML = "";

    const history = getAIHistory();

    if (!history.length) {

      const empty = document.createElement("p");

      empty.className = "ai-history-empty";

      empty.textContent = translate(

        "Pa gen aktivite AI ankò.",

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

        CONFIG.projects[item.request.project];

      const tool =

        getAITool(item.request.tool);

      const prompt =

        String(item.request.prompt || "");

      article.innerHTML = `

        <button
          type="button"
          class="ai-history-open"
        >

          <strong>

            ${escapeHTML(
              localized(tool?.name || "")
            )}

          </strong>

          <span>

            ${escapeHTML(project?.name || "")}

          </span>

          <small>

            ${escapeHTML(
              prompt.slice(0, 90)
            )}

          </small>

          <time>

            ${escapeHTML(
              formatDate(item.request.createdAt)
            )}

          </time>

        </button>

      `;

      article.querySelector("button")

        .addEventListener(

          "click",

          () => openAIHistoryItem(item.id)

        );

      container.appendChild(article);

    });

  }

  function openAIHistoryItem(historyId) {

    const item = sessionHistory.find(

      entry => entry.id === historyId

    );

    if (!item) return;

    setActiveAIProject(

      item.request.project

    );

    selectAITool(

      item.request.tool

    );

    if (item.request.provider) {

      setProvider(item.request.provider);

    }

    const input = query(

      "#ai-prompt, [data-ai-prompt]"

    );

    if (input) {

      input.value = item.request.prompt;

    }

    state.lastRequest = item.request;

    displayAIResponse(item.response);

    if (item.response.service === "professor") {

      displayProfessorResponse(

        item.response.answer

      );

    }

  }

  async function clearAIHistory() {

    const message = translate(

      "Èske ou vle efase tout istwa AI a?",

      "Supprimer tout l’historique IA ?",

      "Delete all AI history?"

    );

    const confirmed =

      typeof window.confirmPlatformAction === "function"

        ? await window.confirmPlatformAction(message)

        : window.confirm(message);

    if (!confirmed) return;

    sessionHistory = [];

    storageRemove(

      CONFIG.storageKeys.history

    );

    state.lastRequest = null;

    displayAIHistory();

    showMessage(

      translate(

        "Istwa AI a efase.",

        "Historique supprimé.",

        "AI history deleted."

      ),

      "success"

    );

  }

  /* =====================================================
     BUTTON CONNECTIONS
     ===================================================== */

  function initializeActionButtons() {

    const actions = [

      ["[data-ai-copy]", copyAIResponse],

      ["[data-ai-clear]", clearAIWorkspace],

      ["[data-ai-download]", downloadAIResponse],

      ["[data-ai-retry]", retryLastAIRequest],

      ["[data-ai-clear-history]", clearAIHistory],

      ["[data-prof-avatar-play]", playAvatar],

      ["[data-prof-avatar-stop]", stopAvatar]

    ];

    actions.forEach(([selector, handler]) => {

      queryAll(selector).forEach(button => {

        button.addEventListener(

          "click",

          event => {

            event.preventDefault();

            handler();

          }

        );

      });

    });

  }

  /* =====================================================
     AI STATUS
     ===================================================== */

  function updateStatus(status) {

    const messages = {

      idle: translate(

        "Pare",

        "Prêt",

        "Ready"

      ),

      processing: translate(

        "AI a ap travay...",

        "L’IA travaille...",

        "AI is working..."

      ),

      success: translate(

        "Repons lan pare",

        "Réponse disponible",

        "Response ready"

      ),

      error: translate(

        "Erè koneksyon AI",

        "Erreur de connexion IA",

        "AI connection error"

      )

    };

    queryAll(

      "[data-ai-status], " +

      "[data-gateway-status]"

    ).forEach(element => {

      element.dataset.status = status;

      element.textContent =

        messages[status] || status;

    });

  }

  function setButtonLoading(button, loading) {

    if (!button) return;

    if (loading) {

      button.dataset.originalText =

        button.textContent;

      button.disabled = true;

      button.classList.add("is-loading");

      button.textContent = translate(

        "AI a ap travay...",

        "L’IA travaille...",

        "AI is working..."

      );

      return;

    }

    button.disabled = false;

    button.classList.remove("is-loading");

    if (

      button.dataset.originalText !== undefined

    ) {

      button.textContent =

        button.dataset.originalText;

      delete button.dataset.originalText;

    }

  }

  /* =====================================================
     ERROR MANAGEMENT
     ===================================================== */

  function getErrorMessage(error) {

    const code = String(

      error?.message || ""

    );

    if (

      code.includes("http-401") ||

      code.includes("http-403")

    ) {

      return translate(

        "Koneksyon AI a pa otorize.",

        "Connexion IA non autorisée.",

        "AI connection unauthorized."

      );

    }

    if (code.includes("http-404")) {

      return translate(

        "Endpoint oswa modèl AI a pa disponib.",

        "Endpoint ou modèle IA introuvable.",

        "AI endpoint or model not found."

      );

    }

    if (code.includes("http-429")) {

      return translate(

        "Limit demann API a rive.",

        "Limite de requêtes API atteinte.",

        "API request limit reached."

      );

    }

    if (

      error?.name === "AbortError" ||

      code.includes("http-504")

    ) {

      return translate(

        "Sèvè AI a pran twòp tan.",

        "Le serveur IA met trop de temps.",

        "AI server request timed out."

      );

    }

    if (code.includes("message-required")) {

      return translate(

        "Ekri yon mesaj.",

        "Écrivez un message.",

        "Enter a message."

      );

    }

    if (code.includes("message-too-long")) {

      return translate(

        "Mesaj la twò long.",

        "Le message est trop long.",

        "The message is too long."

      );

    }

    if (code.includes("empty-response")) {

      return translate(

        "AI a pa retounen okenn repons.",

        "Aucune réponse IA.",

        "No AI response received."

      );

    }

    if (code.includes("busy")) {

      return translate(

        "AI a deja ap travay.",

        "L’IA travaille déjà.",

        "AI is already processing a request."

      );

    }

    if (

      code.includes("Failed to fetch") ||

      code.includes("NetworkError")

    ) {

      return translate(

        "AI Center la pa konekte ak sèvè a.",

        "Connexion au serveur impossible.",

        "Unable to connect to the AI server."

      );

    }

    return translate(

      "Gen yon erè nan sèvis AI a.",

      "Une erreur du service IA est survenue.",

      "An AI service error occurred."

    );

  }

  /* =====================================================
     GENERAL HELPERS
     ===================================================== */

  function createRequestId() {

    if (window.crypto?.randomUUID) {

      return window.crypto.randomUUID();

    }

    return `ai-${Date.now()}-${Math.random()

      .toString(16)

      .slice(2)}`;

  }

  function formatDate(value) {

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

      locales[getLanguage()] || "fr-HT",

      {

        year: "numeric",

        month: "short",

        day: "numeric",

        hour: "numeric",

        minute: "2-digit"

      }

    ).format(date);

  }

  function escapeHTML(value) {

    return String(value ?? "")

      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#39;");

  }

  function showMessage(message, type = "info") {

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
     LANGUAGE UPDATE CONNECTION
     ===================================================== */

  function initializeLanguageUpdates() {

    document.addEventListener(

      "proMaxLanguageChanged",

      () => {

        renderAIToolCards();

        updateProjectDisplay();

        displayAIHistory();

        updateStatus(

          state.busy

            ? "processing"

            : "idle"

        );

      }

    );

  }

  /* =====================================================
     CENTRAL INITIALIZATION
     ===================================================== */

  function initializeAICenter() {

    if (state.initialized) return;

    state.initialized = true;

    const savedProject = storageGet(

      CONFIG.storageKeys.activeProject

    );

    const savedTool = storageGet(

      CONFIG.storageKeys.activeTool

    );

    const pageProject =

      document.body?.dataset.aiProject;

    if (hasOwn(CONFIG.projects, pageProject)) {

      state.activeProject = pageProject;

    } else if (

      hasOwn(CONFIG.projects, savedProject)

    ) {

      state.activeProject = savedProject;

    }

    if (getAITool(savedTool)) {

      state.activeTool = savedTool;

    }

    renderAIToolCards();

    initializeProjectSelector();

    initializeProviderControls();

    initializeAIForm();

    initializeProfessorForms();

    initializeAvatar();

    initializeActionButtons();

    initializeLanguageUpdates();

    updateProjectDisplay();

    displayAIHistory();

    updateStatus("idle");

    document.dispatchEvent(

      new CustomEvent(

        "proMaxAICenterReady",

        {

          detail: {

            version: CONFIG.version,

            providers: [

              "openai",

              "gemini",

              "professor"

            ]

          }

        }

      )

    );

    console.info(

      "BSS1815 PRO-MAX DMP",

      "CENTRAL AI CENTER READY",

      CONFIG.version

    );

  }

  /* =====================================================
     PUBLIC CENTRAL AI INTERFACE
     ===================================================== */

  window.PRO_MAX_AI_CENTER = CONFIG;

  window.PRO_MAX_AI_GATEWAY = Object.freeze({

    version: CONFIG.version,

    ask: sendAIRequest,

    openai: askOpenAI,

    gemini: askGemini,

    professor: askProfessor,

    setProvider,

    getProvider,

    getProjects: () => ({

      ...CONFIG.projects

    }),

    playAvatar,

    stopAvatar,

    isBusy: () => state.busy

  });

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

  window.askOpenAI =

    askOpenAI;

  window.askGemini =

    askGemini;

  window.askProfessor =

    askProfessor;

  window.copyAIResponse =

    copyAIResponse;

  window.clearAIWorkspace =

    clearAIWorkspace;

  window.downloadAIResponse =

    downloadAIResponse;

  window.clearAIHistory =

    clearAIHistory;

  window.playProfAvatar =

    playAvatar;

  window.stopProfAvatar =

    stopAvatar;

  /* =====================================================
     START CENTRAL AI CENTER
     ===================================================== */

  if (document.readyState === "loading") {

    document.addEventListener(

      "DOMContentLoaded",

      initializeAICenter,

      {
        once: true
      }

    );

  } else {

    initializeAICenter();

  }

})();

/* =========================================================
   END OF CENTRAL AI CONTROLLER
   BSS1815 PRO-MAX DMP
   VERSION 2.0.0
   BATI POU JODI A, PARE POU DEMEN
   DEVAN DEVAN NÈT
   ========================================================= */
