/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR SESSION
   FILE: netlify/lib/prof-avatar-session.js
   VERSION: 1.0.0
   SERVER ONLY
   ========================================================= */

"use strict";

const API =
  "https://api.liveavatar.com/v1/sessions/token";

/* ERROR MANAGEMENT */

function fail(code, status) {

  return Object.assign(
    new Error(code),
    { status }
  );

}

/* EXISTING PROF AVATAR SESSION */

async function createSession({

  project = "bss1815",

  school = ""

} = {}) {

  if (
    process.env.PROF_AVATAR_LIVE_ENABLED !== "true"
  ) {

    throw fail("AVATAR_DISABLED", 503);

  }

  const key =
    process.env.LIVEAVATAR_API_KEY;

  const sandbox =
    process.env.PROF_AVATAR_PAID_ENABLED !== "true";

  let avatars;

  try {

    avatars = JSON.parse(
      process.env.PROF_AVATAR_IDS || "{}"
    );

    if (
      !avatars ||
      typeof avatars !== "object" ||
      Array.isArray(avatars)
    ) {

      throw new Error();

    }

  } catch {

    throw fail(
      "INVALID_AVATAR_CONFIGURATION",
      503
    );

  }

  /* SELECT EXISTING AVATAR */

  const lookup =
    String(project).trim().toLowerCase();

  const schoolKey =
    lookup + ":" +
    String(school).trim().toLowerCase();

  const own = k =>
    Object.hasOwn(avatars, k)
      ? avatars[k]
      : undefined;

  const avatarId =
    own(schoolKey) ||
    own(lookup) ||
    process.env.LIVEAVATAR_AVATAR_ID;

  if (
    !key ||
    typeof avatarId !== "string" ||
    !avatarId.trim()
  ) {

    throw fail(
      "AVATAR_NOT_CONFIGURED",
      503
    );

  }

  /* SESSION CONNECTION */

  const controller =
    new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    15000
  );

  try {

    const response = await fetch(API, {

      method: "POST",

      headers: {

        "X-API-KEY": key,

        "Content-Type": "application/json"

      },

      body: JSON.stringify({

        mode: "LITE",

        avatar_id: avatarId.trim(),

        is_sandbox: sandbox,

        max_session_duration:
          sandbox ? 60 : 120

      }),

      signal: controller.signal,

      redirect: "error"

    });

    if (!response.ok) {

      throw fail(

        "AVATAR_PROVIDER_ERROR",

        response.status === 429
          ? 429
          : 502

      );

    }

    const result =
      await response.json();

    const {

      session_id,

      session_token

    } = result?.data || {};

    if (

      typeof session_id !== "string" ||

      !session_id ||

      typeof session_token !== "string" ||

      !session_token

    ) {

      throw fail(
        "INVALID_AVATAR_SESSION",
        502
      );

    }

    return {

      session_id,

      session_token,

      mode: "LITE",

      sandbox

    };

  } catch (error) {

    if (error.name === "AbortError") {

      throw fail(
        "AVATAR_TIMEOUT",
        504
      );

    }

    if (error.status) {

      throw error;

    }

    throw fail(
      "AVATAR_UNAVAILABLE",
      502
    );

  } finally {

    clearTimeout(timer);

  }

}

/* CENTRAL AI BACKEND EXPORT */

module.exports = {

  createSession

};

/* =========================================================
   END — PROF AVATAR SESSION
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
