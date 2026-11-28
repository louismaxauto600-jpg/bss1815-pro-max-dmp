
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR USER INTERFACE
   FILE: prof-avatar-ui.js
   VERSION: 1.0.0
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
      "Koneksyon LIVE poko aktive.",
      "Aksè LIVE poko otorize.",
      "Koneksyon an ap fèt...",
      "PROF AVATAR LIVE konekte.",
      "AI ap trete kesyon an...",
      "Repons tèks resevwa. Vwa a pa disponib.",
      "Repons AI resevwa.",
      "Sesyon LIVE fèmen.",
      "Kanpe sesyon an anvan ou chanje pwojè, lekòl oswa lang.",
      "Ekri yon kesyon.",
      "Pa gen repons pou repete.",
      "Erè PROF AVATAR."

    ],

    fr: [

      "ACTIVER PROF AVATAR LIVE",
      "ARRÊTER LE DIRECT",
      "RÉPÉTER LA RÉPONSE",
      "Connexion LIVE inactive.",
      "Accès LIVE non autorisé.",
      "Connexion en cours...",
      "PROF AVATAR LIVE connecté.",
      "Traitement de la question...",
      "Réponse texte reçue. Voix indisponible.",
      "Réponse IA reçue.",
      "Session LIVE fermée.",
      "Arrêtez la session avant de changer de projet, d’école ou de langue.",
      "Écrivez une question.",
      "Aucune réponse à répéter.",
      "Erreur PROF AVATAR."

    ],

    en: [

      "ACTIVATE PROF AVATAR LIVE",
      "STOP LIVE",
      "REPEAT ANSWER",
      "LIVE connection inactive.",
      "LIVE access not authorized.",
      "Connecting...",
      "PROF AVATAR LIVE connected.",
      "Processing question...",
      "Text answer received. Voice unavailable.",
      "AI answer received.",
      "LIVE session closed.",
      "Stop the session before changing project, school or language.",
      "Enter a question.",
      "No answer to repeat.",
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

  let video;

  let audio;

  let notice;

  let startButton;

  let stopButton;

  let repeatButton;

  let previous = null;

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

  /* PROJECT AND SCHOOL CONTEXT */

  function context() {

    const project =
      projects[$("activeProject")?.textContent.trim()];

    if (!project) {

      throw new Error("Unknown AI project.");

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

  function status(i, error) {

    notice.textContent =

      t(i) +

      (error ? " — " + error.message : "");

  }

  /* BUTTON CONTROL */

  function refresh() {

    startButton.textContent = t(0);

    stopButton.textContent = t(1);

    repeatButton.textContent = t(2);

    startButton.disabled = busy || active;

    stopButton.disabled = busy || !active;

    repeatButton.disabled =
      busy || !active || !lastPrompt;

    for (const id of [

      "aiAvatarPlay",

      "aiAvatarStop",

      "provider"

    ]) {

      const el = $(id);

      if (el) {

        el.disabled = active || busy;

      }

    }

  }

  /* RESTORE EXISTING VIDEO */

  function restore() {

    if (!previous) return;

    video.pause();

    video.srcObject = null;

    if (previous.src === null) {

      video.removeAttribute("src");

    } else {

      video.setAttribute("src", previous.src);

    }

    video.muted = previous.muted;

    video.autoplay = previous.autoplay;

    video.load();

    audio.pause();

    audio.srcObject = null;

    audio.hidden = true;

    previous = null;

  }

  /* ACTIVATE PROF AVATAR LIVE */

  async function start() {

    if (busy || active) return;

    if (!transport || !integration()) {

      status(4);

      return;

    }

    busy = true;

    refresh();

    status(5);

    try {

      session = context();

      previous = {

        src: video.getAttribute("src"),

        muted: video.muted,

        autoplay: video.autoplay

      };

      video.pause();

      video.removeAttribute("src");

      video.load();

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

    } catch (error) {

      restore();

      session = null;

      status(14, error);

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

      restore();

      status(10);

    } catch (error) {

      status(14, error);

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

    let now;

    try {

      now = context();

    } catch (error) {

      status(14, error);

      return;

    }

    if (

      Object.keys(now).some(
        key => now[key] !== session[key]
      )

    ) {

      status(11);

      return;

    }

    busy = true;

    refresh();

    status(7);

    try {

      const result =
        await integration().ask(prompt.trim());

      if (

        typeof result?.answer !== "string" ||

        !result.answer.trim()

      ) {

        throw new Error("Empty AI response.");

      }

      $("aiResponse").textContent =
        result.answer;

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

    } catch (error) {

      status(14, error);

    } finally {

      busy = false;

      refresh();

    }

  }

  /* REPEAT AVATAR RESPONSE */

  async function repeat() {

    if (busy || !active || !lastPrompt) return;

    busy = true;

    refresh();

    status(7);

    try {

      await integration().repeat();

      status(9);

    } catch (error) {

      status(8, error);

    } finally {

      busy = false;

      refresh();

    }

  }

  /* CREATE BUTTON */

  function button(id, handler) {

    const el = document.createElement("button");

    el.id = id;

    el.type = "button";

    el.addEventListener("click", handler);

    return el;

  }

  /* CONNECT EXISTING AI CENTER */

  function mount() {

    if (mounted) return;

    video = $("aiProfAvatar");

    const form = $("centralAIForm");

    const prompt = $("aiPrompt");

    if (

      !video ||

      !form ||

      !prompt ||

      !$("aiResponse")

    ) {

      return;

    }

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

    /* LIVE AUDIO */

    audio = document.createElement("audio");

    audio.id = "profAvatarLiveAudio";

    audio.controls = true;

    audio.autoplay = true;

    audio.hidden = true;

    /* LIVE STATUS */

    notice = document.createElement("p");

    notice.id = "profAvatarLiveStatus";

    notice.setAttribute("role", "status");

    notice.setAttribute("aria-live", "polite");

    panel.append(actions, audio, notice);

    video.insertAdjacentElement("afterend", panel);

    /* EXISTING QUESTION FORM */

    form.addEventListener("submit", event => {

      if (!active && !busy) return;

      event.preventDefault();

      event.stopImmediatePropagation();

      if (active && !busy) {

        void ask(prompt.value);

      }

    }, true);

    /* RETRY QUESTION */

    $("retryAI")?.addEventListener("click", event => {

      if (!active && !busy) return;

      event.preventDefault();

      event.stopImmediatePropagation();

      if (active && !busy) {

        void ask(lastPrompt || prompt.value);

      }

    }, true);

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

  /* GLOBAL INTERFACE */

  window.BSS1815_AVATAR_UI = Object.freeze({

    setTransport(request) {

      if (

        active ||

        busy ||

        typeof request !== "function"

      ) {

        throw new Error("Invalid authorized transport.");

      }

      transport = request;

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
   END — PROF AVATAR UI
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
