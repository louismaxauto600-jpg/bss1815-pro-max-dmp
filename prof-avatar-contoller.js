
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR CONTROLLER
   FILE: prof-avatar-controller.js
   VERSION: 1.0.0
   ========================================================= */

"use strict";

(() => {

  const ENDPOINT = "/.netlify/functions/central-ai";

  const state = {
    adapter: null,
    phase: "idle",
    busy: false,
    last: null
  };

  /* EVENT MANAGEMENT */

  function emit(name, detail) {

    window.dispatchEvent(
      new CustomEvent("prof-avatar:" + name, {
        detail
      })
    );

  }

  function setPhase(phase) {

    state.phase = phase;

    emit("status", { phase });

  }

  /* EXISTING AVATAR CONNECTION */

  function configure(adapter) {

    if (state.phase !== "idle" || state.busy) {

      throw new Error(
        "Stop the current session first."
      );

    }

    if (
      !adapter ||
      ["start", "speak", "stop"].some(
        key => typeof adapter[key] !== "function"
      )
    ) {

      throw new Error(
        "A compatible live avatar adapter is required."
      );

    }

    state.adapter = adapter;

  }

  /* START LIVE AVATAR */

  async function start() {

    if (!state.adapter) {

      throw new Error(
        "Live avatar adapter not configured."
      );

    }

    if (state.phase !== "idle" || state.busy) {

      throw new Error(
        "Session already active or busy."
      );

    }

    setPhase("connecting");

    try {

      await state.adapter.start();

      setPhase("ready");

    } catch (error) {

      try {

        await state.adapter.stop();

      } catch {

        /* Best-effort cleanup */

      }

      setPhase("idle");

      throw error;

    }

  }

  /* STOP LIVE AVATAR */

  async function stop() {

    if (state.busy || state.phase === "connecting") {

      throw new Error(
        "A request is in progress."
      );

    }

    if (state.phase === "idle") return;

    setPhase("stopping");

    try {

      await state.adapter.stop();

      setPhase("idle");

    } catch (error) {

      setPhase("error");

      throw error;

    }

  }

  /* CENTRAL AI BACKEND CONNECTION */

  async function requestAI(options) {

    const gateway = window.PRO_MAX_AI_GATEWAY;

    if (gateway && typeof gateway.ask === "function") {

      return gateway.ask(options);

    }

    const controller = new AbortController();

    const timer = setTimeout(
      () => controller.abort(),
      50000
    );

    try {

      const response = await fetch(ENDPOINT, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        cache: "no-store",

        signal: controller.signal,

        body: JSON.stringify({

          action: "ask",

          message: options.prompt,

          project: options.project,

          school: options.school,

          language: options.language,

          provider: options.provider,

          mode: options.tool

        })

      });

      const data = await response.json();

      if (!response.ok || data?.success !== true) {

        throw new Error(
          data?.message || "AI connection failed."
        );

      }

      return data;

    } finally {

      clearTimeout(timer);

    }

  }

  /* STUDENT AND CUSTOMER QUESTIONS */

  async function ask(input) {

    if (
      state.busy ||
      ["connecting", "stopping"].includes(state.phase)
    ) {

      throw new Error(
        "A request is in progress."
      );

    }

    const options =
      typeof input === "string"
        ? { prompt: input }
        : input || {};

    const prompt = String(
      options.prompt ??
      options.message ??
      ""
    ).trim();

    if (!prompt || prompt.length > 8000) {

      throw new Error(
        "Provide 1–8000 characters."
      );

    }

    const project =
      options.project || "bss1815";

    const school =
      options.school || "";

    const language =
      options.language || "ht";

    const tool =
      options.tool ||
      (
        project === "academy"
          ? "tutor"
          : "assistant"
      );

    const provider =
      options.provider ||
      (
        tool === "tutor"
          ? "professor"
          : "openai"
      );

    state.busy = true;

    try {

      const result = await requestAI({

        prompt,
        project,
        school,
        language,
        tool,
        provider

      });

      if (
        result?.success !== true ||
        typeof result.answer !== "string" ||
        !result.answer.trim()
      ) {

        throw new Error(
          "AI returned no answer."
        );

      }

      const answer = result.answer.trim();

      const text =
        typeof result.speech?.text === "string" &&
        result.speech.text.trim()
          ? result.speech.text.trim()
          : answer;

      state.last = {

        text,
        project,
        school,
        language

      };

      emit("answer", {

        answer,
        project,
        school,
        language

      });

      let voiceStatus = "not_requested";

      if (options.speak === true) {

        try {

          await speakLast();

          voiceStatus = "submitted";

        } catch (error) {

          voiceStatus = "unavailable";

          emit("error", {
            message: error.message
          });

        }

      }

      return {

        ...result,

        answer,

        voiceStatus

      };

    } finally {

      state.busy = false;

    }

  }

  /* PROF AVATAR SPEECH RESPONSE */

  async function speakLast() {

    if (
      state.phase !== "ready" ||
      !state.adapter
    ) {

      throw new Error(
        "Start the live avatar session first."
      );

    }

    if (!state.last) {

      throw new Error(
        "No AI response available."
      );

    }

    if (state.last.text.length > 1500) {

      throw new Error(
        "Response exceeds the configured voice limit."
      );

    }

    setPhase("submitting");

    try {

      await state.adapter.speak({

        ...state.last

      });

      emit("voice-submitted", {

        project: state.last.project

      });

    } finally {

      setPhase("ready");

    }

  }

  /* REPEAT LAST AI RESPONSE */

  async function repeat() {

    if (state.busy) {

      throw new Error(
        "A request is in progress."
      );

    }

    state.busy = true;

    try {

      await speakLast();

    } finally {

      state.busy = false;

    }

  }

  /* GLOBAL PROF AVATAR INTERFACE */

  window.BSS1815_PROF_AVATAR = Object.freeze({

    configure,

    start,

    stop,

    ask,

    repeat,

    getStatus: () => ({

      phase: state.phase,

      busy: state.busy,

      configured: Boolean(state.adapter)

    })

  });

})();

/* =========================================================
   END — PROF AVATAR CONTROLLER
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
