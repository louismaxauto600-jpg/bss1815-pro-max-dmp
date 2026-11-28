
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR USER INTERFACE
   FILE: prof-avatar-ui.js
   VERSION: 1.1.0
   ========================================================= */

"use strict";

(() => {

  const $ = id => document.getElementById(id);

  const projects = Object.freeze({

    "BSS1815 COMMUNITY": "bss1815",

    "PRO-MAX FM 106.5 FM": "pro-max-fm",

    "MAXIMAX MULTI SERVICES": "maximax",

    "PRO-MAX ACADÉMIE": "academy",

    "PRO-MAX BEAT LAB": "beat-lab",

    "LÉOGÂNE INFO": "leogane-info",

    "DEVAN DEVAN NÈT": "ddn"

  });

  /* LANGUAGE SYSTEM */

  const messages = {

    ht: [

      "AKTIVE PROF AVATAR LIVE",

      "KANPE LIVE",

      "REPETE REPONS LAN",

      "LIVE poko aktive.",

      "Aksè LIVE poko disponib.",

      "Koneksyon an ap fèt...",

      "PROF AVATAR LIVE konekte.",

      "AI ap trete kesyon an...",

      "Repons tèks resevwa. Vwa pa disponib.",

      "Repons vokal fini.",

      "Sesyon LIVE fèmen.",

      "Kanpe LIVE anvan ou chanje pwojè, lekòl oswa lang.",

      "Ekri yon kesyon.",

      "Erè PROF AVATAR."

    ],

    fr: [

      "ACTIVER PROF AVATAR LIVE",

      "ARRÊTER LE DIRECT",

      "RÉPÉTER LA RÉPONSE",

      "LIVE inactif.",

      "Accès LIVE indisponible.",

      "Connexion en cours...",

      "PROF AVATAR LIVE connecté.",

      "Traitement de la question...",

      "Réponse texte reçue. Voix indisponible.",

      "Réponse vocale terminée.",

      "Session LIVE fermée.",

      "Arrêtez le direct avant de changer de contexte.",

      "Écrivez une question.",

      "Erreur PROF AVATAR."

    ],

    en: [

      "ACTIVATE PROF AVATAR LIVE",

      "STOP LIVE",

      "REPEAT ANSWER",

      "LIVE inactive.",

      "LIVE access unavailable.",

      "Connecting...",

      "PROF AVATAR LIVE connected.",

      "Processing question...",

      "Text answer received. Voice unavailable.",

      "Voice response finished.",

      "LIVE session closed.",

      "Stop LIVE before changing project, school or language.",

      "Enter a question.",

      "PROF AVATAR error."

    ]

  };

  /* SESSION STATE */

  let transport = null;

  let mounted = false;

  let active = false;

  let busy = false;

  let session = null;

  let lastPrompt = "";

  let original;

  let video;

  let audio;

  let notice;

  let startButton;

  let stopButton;

  let repeatButton;

  let oldHidden = false;

  let previous = new Map();

  const lang = () =>

    Object.hasOwn(

      messages,

      document.documentElement.lang

    )

      ? document.documentElement.lang

      : "ht";

  const t = i => messages[lang()][i];

  const integration = () =>

    window.BSS1815_AVATAR_INTEGRATION;

  /* PROJECT CONTEXT */

  function context() {

    const project =

      projects[$("activeProject")?.textContent.trim()];

    if (!project) {

      throw Error("Unknown AI project.");

    }

    return {

      project,

      school: project === "academy"

        ? ($("school")?.value || "")

        : "",

      language: lang()

    };

  }

  /* STATUS DISPLAY */

  function status(i, e) {

    notice.textContent =

      t(i) + (e ? " — " + e.message : "");

  }

  /* BUTTON CONTROL */

  function refresh() {

    startButton.textContent = t(0);

    stopButton.textContent = t(1);

    repeatButton.textContent = t(2);

    startButton.disabled =

      busy || active || !transport;

    stopButton.disabled =

      busy || !active;

    repeatButton.disabled =

      busy || !active || !lastPrompt;

    const lock = active || busy;

    for (const el of document.querySelectorAll(

      '#projectGrid button, #toolGrid button, [data-lang], #school, #provider, #aiAvatarPlay, #aiAvatarStop, #clearAI, #clearHistory, #aiHistory button, #sendAI, #retryAI, #aiPrompt'

    )) {

      const questionControl = [

        "sendAI",

        "retryAI",

        "aiPrompt"

      ].includes(el.id);

      if (lock && (!questionControl || busy)) {

        if (!previous.has(el)) {

          previous.set(el, el.disabled);

        }

        el.disabled = true;

      } else if (previous.has(el)) {

        el.disabled = previous.get(el);

        previous.delete(el);

      }

    }

  }

  /* RESTORE ORIGINAL AVATAR */

  function restore() {

    video.pause();

    audio.pause();

    video.srcObject = null;

    audio.srcObject = null;

    video.hidden = true;

    audio.hidden = true;

    original.hidden = oldHidden;

  }

  /* ACTIVATE LIVE PROF AVATAR */

  async function start() {

    if (busy || active) return;

    if (!transport || !integration()) {

      status(4);

      return;

    }

    if ($("sendAI")?.disabled) return;

    busy = true;

    refresh();

    status(5);

    oldHidden = original.hidden;

    try {

      session = context();

      original.pause();

      original.hidden = true;

      video.hidden = false;

      audio.hidden = false;

      await integration().start({

        ...session,

        video,

        audio,

        request: transport

      });

      active = true;

      lastPrompt = "";

      status(6);

    } catch (e) {

      restore();

      session = null;

      status(13, e);

    } finally {

      busy = false;

      refresh();

    }

  }

  /* STOP LIVE SESSION */

  async function stop() {

    if (busy || !active) return;

    busy = true;

    refresh();

    try {

      await integration().stop();

      active = false;

      session = null;

      lastPrompt = "";

      window.BSS1815_AVATAR_TRANSPORT?.clear();

      restore();

      status(10);

    } catch (e) {

      status(13, e);

    } finally {

      busy = false;

      refresh();

    }

  }

  /* STUDENT AND CUSTOMER QUESTIONS */

  async function ask(prompt) {

    if (busy || !active) return;

    if (!prompt.trim()) {

      status(12);

      return;

    }

    try {

      const now = context();

      if (

        Object.keys(now).some(

          k => now[k] !== session[k]

        )

      ) {

        status(11);

        return;

      }

    } catch (e) {

      status(13, e);

      return;

    }

    busy = true;

    refresh();

    status(7);

    lastPrompt = "";

    try {

      const result = await integration().ask({

        prompt: prompt.trim(),

        provider: $("provider")?.value,

        tool: session.project === "academy"

          ? "tutor"

          : "assistant"

      });

      if (

        typeof result?.answer !== "string" ||

        !result.answer.trim()

      ) {

        throw Error("Empty AI response.");

      }

      $("aiResponse").textContent = result.answer;

      if ($("activeProvider")) {

        $("activeProvider").textContent =

          result.provider || "—";

      }

      lastPrompt = prompt.trim();

      status(

        result.voiceStatus === "submitted"

          ? 9

          : 8

      );

    } catch (e) {

      status(13, e);

    } finally {

      busy = false;

      refresh();

    }

  }

  /* REPEAT RESPONSE */

  async function repeat() {

    if (busy || !active || !lastPrompt) return;

    busy = true;

    refresh();

    status(7);

    try {

      await integration().repeat();

      status(9);

    } catch (e) {

      status(8, e);

    } finally {

      busy = false;

      refresh();

    }

  }

  /* BUTTON CREATION */

  function button(id, handler) {

    const el = document.createElement("button");

    el.id = id;

    el.type = "button";

    el.addEventListener("click", handler);

    return el;

  }

  /* CENTRAL AI CENTER CONNECTION */

  function mount() {

    if (mounted) return;

    original = $("aiProfAvatar");

    const form = $("centralAIForm");

    const prompt = $("aiPrompt");

    if (

      !original ||

      !form ||

      !prompt ||

      !$("aiResponse")

    ) return;

    const panel = document.createElement("div");

    panel.id = "profAvatarLiveControls";

    const actions = document.createElement("div");

    actions.className = "actions";

    startButton = button(

      "profAvatarLiveStart",

      start

    );

    stopButton = button(

      "profAvatarLiveStop",

      stop

    );

    repeatButton = button(

      "profAvatarLiveRepeat",

      repeat

    );

    actions.append(

      startButton,

      stopButton,

      repeatButton

    );

    /* LIVE VIDEO */

    video = document.createElement("video");

    video.id = "profAvatarLiveVideo";

    video.hidden = true;

    video.muted = true;

    video.playsInline = true;

    video.autoplay = true;

    /* LIVE AUDIO */

    audio = document.createElement("audio");

    audio.id = "profAvatarLiveAudio";

    audio.hidden = true;

    audio.controls = true;

    audio.autoplay = true;

    /* LIVE STATUS */

    notice = document.createElement("p");

    notice.id = "profAvatarLiveStatus";

    notice.setAttribute("role", "status");

    notice.setAttribute("aria-live", "polite");

    panel.append(

      video,

      actions,

      audio,

      notice

    );

    original.insertAdjacentElement(

      "afterend",

      panel

    );

    /* EXISTING AI QUESTION FORM */

    form.addEventListener("submit", e => {

      if (!active && !busy) return;

      e.preventDefault();

      e.stopImmediatePropagation();

      if (active && !busy) {

        void ask(prompt.value);

      }

    }, true);

    /* RETRY QUESTION */

    $("retryAI")?.addEventListener("click", e => {

      if (!active && !busy) return;

      e.preventDefault();

      e.stopImmediatePropagation();

      if (active && !busy) {

        void ask(lastPrompt || prompt.value);

      }

    }, true);

    /* IMMEDIATE TEXT RESPONSE */

    window.addEventListener(

      "prof-avatar:answer",

      e => {

        if (

          active &&

          busy &&

          typeof e.detail?.answer === "string"

        ) {

          $("aiResponse").textContent =

            e.detail.answer;

        }

      }

    );

    /* LANGUAGE CONNECTION */

    document.querySelectorAll("[data-lang]")

      .forEach(el => {

        el.addEventListener("click", () => {

          refresh();

          status(active ? 11 : 3);

        });

      });

    mounted = true;

    refresh();

    status(3);

  }

  /* GLOBAL USER INTERFACE */

  window.BSS1815_AVATAR_UI = Object.freeze({

    setTransport(request) {

      if (

        active ||

        busy ||

        typeof request !== "function"

      ) {

        throw Error("Invalid authorized transport.");

      }

      transport = request;

      if (mounted) refresh();

    },

    mount,

    stop,

    getStatus: () => ({

      mounted,

      active,

      busy,

      authorizedTransport: Boolean(transport)

    })

  });

  /* INITIALIZATION */

  if (document.readyState === "loading") {

    document.addEventListener(

      "DOMContentLoaded",

      mount,

      { once: true }

    );

  } else {

    mount();

  }

})();

/* =========================================================
   END — BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
