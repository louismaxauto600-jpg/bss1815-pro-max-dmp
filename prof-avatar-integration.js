
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR INTEGRATION
   FILE: prof-avatar-integration.js
   VERSION: 1.1.0
   ========================================================= */

"use strict";

(() => {

  const SDK =
    "https://cdn.jsdelivr.net/npm/livekit-client@2.25.0/dist/livekit-client.umd.min.js";

  let loading = null;

  let active = null;

  let busy = false;

  /* LIVEKIT SDK CONNECTION */

  function loadSDK() {

    if (

      window.LivekitClient?.Room &&

      window.LivekitClient?.RoomEvent

    ) {

      return Promise.resolve(window.LivekitClient);

    }

    if (loading) return loading;

    loading = new Promise((resolve, reject) => {

      const script = document.createElement("script");

      const timer = setTimeout(fail, 15000);

      function fail() {

        clearTimeout(timer);

        script.remove();

        reject(Error("LiveKit SDK unavailable."));

      }

      script.src = SDK;

      script.async = true;

      script.onerror = fail;

      script.onload = () => {

        clearTimeout(timer);

        const sdk = window.LivekitClient;

        if (sdk?.Room && sdk?.RoomEvent) {

          resolve(sdk);

        } else {

          fail();

        }

      };

      document.head.appendChild(script);

    }).catch(e => {

      loading = null;

      throw e;

    });

    return loading;

  }

  /* ACTIVATE PROF AVATAR */

  async function start({

    request,

    video,

    audio,

    project = "bss1815",

    school = "",

    language = "ht"

  } = {}) {

    if (active || busy) {

      throw Error("Avatar session already active or busy.");

    }

    if (

      typeof request !== "function" ||

      !video ||

      !audio

    ) {

      throw Error("Authorized transport and live media required.");

    }

    const controller = window.BSS1815_PROF_AVATAR;

    const factory = window.BSS1815_LIVE_AVATAR_ADAPTER;

    if (!controller || !factory) {

      throw Error("Avatar modules missing.");

    }

    busy = true;

    try {

      const {

        Room,

        RoomEvent

      } = await loadSDK();

      video.autoplay = true;

      video.playsInline = true;

      video.muted = true;

      audio.autoplay = true;

      audio.controls = true;

      controller.configure(

        factory.create({

          request,

          Room,

          RoomEvent,

          video,

          audio,

          project,

          school

        })

      );

      await controller.start();

      active = {

        controller,

        project,

        school,

        language

      };

      return controller.getStatus();

    } finally {

      busy = false;

    }

  }

  /* CENTRAL AI QUESTIONS */

  async function ask(input) {

    if (!active || busy) {

      throw Error("Start the live avatar first.");

    }

    const options = typeof input === "string"

      ? { prompt: input }

      : input || {};

    const prompt = options.prompt;

    if (

      typeof prompt !== "string" ||

      !prompt.trim()

    ) {

      throw Error("Enter a question.");

    }

    busy = true;

    try {

      return await active.controller.ask({

        prompt: prompt.trim(),

        project: active.project,

        school: active.school,

        language: active.language,

        ...(options.provider

          ? { provider: options.provider }

          : {}),

        ...(options.tool

          ? { tool: options.tool }

          : {}),

        speak: true

      });

    } finally {

      busy = false;

    }

  }

  /* REPEAT RESPONSE */

  async function repeat() {

    if (!active || busy) {

      throw Error("Avatar unavailable or busy.");

    }

    busy = true;

    try {

      await active.controller.repeat();

    } finally {

      busy = false;

    }

  }

  /* STOP LIVE SESSION */

  async function stop() {

    if (busy) {

      throw Error("A request is in progress.");

    }

    if (!active) return;

    busy = true;

    try {

      await active.controller.stop();

      active = null;

    } finally {

      busy = false;

    }

  }

  /* GLOBAL INTEGRATION */

  window.BSS1815_AVATAR_INTEGRATION =

    Object.freeze({

      start,

      ask,

      repeat,

      stop,

      getStatus: () => ({

        active: Boolean(active),

        busy,

        ...(active ? {

          controller: active.controller.getStatus()

        } : {})

      })

    });

})();

/* =========================================================
   END — BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
