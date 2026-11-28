
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR SECURE TRANSPORT
   FILE: prof-avatar-transport.js
   VERSION: 1.0.0
   TEMPORARY PILOT ACCESS ONLY
   ========================================================= */

"use strict";

(() => {

  const ENDPOINT =
    "/.netlify/functions/central-ai";

  let grant = null;

  let busy = false;

  /* CLEAR TEMPORARY ACCESS */

  function clear() {

    grant = null;

  }

  /* PROJECT AND SCHOOL CONTEXT */

  function context(data) {

    const project = String(data.project || "")
      .trim()
      .toLowerCase();

    const school = String(data.school || "")
      .trim()
      .toLowerCase();

    if (

      !/^[a-z0-9-]{1,80}$/.test(project) ||

      school.length > 120

    ) {

      throw new Error("Invalid avatar context.");

    }

    return {

      project,

      school

    };

  }

  /* TEMPORARY PILOT AUTHORIZATION */

  function readToken(ctx) {

    const token = (

      window.prompt(
        "PROF AVATAR — Temporary pilot access token"
      ) || ""

    ).trim();

    if (

      !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token) ||

      token.length > 4000

    ) {

      throw new Error(
        "Temporary access token required."
      );

    }

    // The server verifies the signature and permissions.

    return {

      token,

      ...ctx

    };

  }

  /* CENTRAL AI SECURE CONNECTION */

  async function request(data) {

    if (busy) {

      throw new Error(
        "Avatar request already in progress."
      );

    }

    if (

      !data ||

      !["avatar-session", "speak"]
        .includes(data.action)

    ) {

      throw new Error("Invalid avatar action.");

    }

    busy = true;

    const abort = new AbortController();

    let timer;

    try {

      let body;

      /* ACTIVATE EXISTING PROF AVATAR */

      if (data.action === "avatar-session") {

        clear();

        const ctx = context(data);

        grant = readToken(ctx);

        body = {

          action: data.action,

          ...ctx

        };

      } else {

        /* EXISTING MAXIMAX VOICE */

        if (!grant) {

          throw new Error(
            "Start an authorized avatar session first."
          );

        }

        if (

          typeof data.text !== "string" ||

          !data.text.trim() ||

          data.text.trim().length > 1500

        ) {

          throw new Error(
            "Provide 1–1500 characters."
          );

        }

        body = {

          action: "speak",

          text: data.text.trim(),

          project: grant.project,

          school: grant.school

        };

      }

      /* NETWORK PROTECTION */

      timer = setTimeout(

        () => abort.abort(),

        25000

      );

      const response = await fetch(ENDPOINT, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: "Bearer " + grant.token

        },

        body: JSON.stringify(body),

        cache: "no-store",

        credentials: "same-origin",

        redirect: "error",

        signal: abort.signal

      });

      const result = await response.json();

      if (

        !response.ok ||

        result?.success !== true

      ) {

        if (

          response.status === 401 ||

          data.action === "avatar-session"

        ) {

          clear();

        }

        throw new Error(

          result?.message ||

          "Avatar access unavailable."

        );

      }

      return result;

    } catch (error) {

      if (data.action === "avatar-session") {

        clear();

      }

      throw error;

    } finally {

      clearTimeout(timer);

      busy = false;

    }

  }

  /* CONNECT PROF AVATAR USER INTERFACE */

  function connect() {

    const ui =
      window.BSS1815_AVATAR_UI;

    if (

      !ui ||

      typeof ui.setTransport !== "function"

    ) {

      return false;

    }

    ui.setTransport(request);

    return true;

  }

  /* GLOBAL SECURE TRANSPORT */

  window.BSS1815_AVATAR_TRANSPORT =
    Object.freeze({

      connect,

      clear

    });

  /* INITIALIZATION */

  if (document.readyState === "loading") {

    document.addEventListener(

      "DOMContentLoaded",

      connect,

      { once: true }

    );

  } else {

    connect();

  }

  window.addEventListener(

    "pagehide",

    clear

  );

})();

/* =========================================================
   END — PROF AVATAR SECURE TRANSPORT
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
