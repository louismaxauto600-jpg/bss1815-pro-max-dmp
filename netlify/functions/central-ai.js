/* =========================================================
   BSS1815 PRO-MAX DMP
   CENTRAL AI BACKEND
   VERSION: 1.3.0
   SECURE PROF AVATAR ACCESS
   ========================================================= */

"use strict";

const { timingSafeEqual } = require("node:crypto");

const { createSession } =
  require("../lib/prof-avatar-session.js");

const { verifyAccess } =
  require("../lib/prof-avatar-access.js");

const PLATFORM = "BSS1815 PRO-MAX DMP";

const VERSION = "1.3.0";

const DOMAIN = "https://bss1815promaxdmp.com";

const PROVIDERS = Object.freeze({
  openai: "openai-live",
  gemini: "gemini-live",
  professor: "professor"
});

const LANG = {
  ht: "Haitian Creole",
  fr: "French",
  en: "English",
  es: "Spanish"
};

const MODES = [
  "general",
  "assistant",
  "writer",
  "translator",
  "voice",
  "image",
  "analytics",
  "tutor"
];

/* JSON RESPONSE */

function json(statusCode, data, headers) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(data)
  };
}

function fail(status, code, message, h) {
  return json(status, {
    success: false,
    platform: PLATFORM,
    error: code,
    message
  }, h);
}

/* PROJECT AND SCHOOL CONTEXT */

function projectContext(data) {

  const project = String(data.project || "bss1815")
    .trim()
    .toLowerCase();

  if (!/^[a-z0-9-]{1,80}$/.test(project)) {
    throw Error("INVALID_PROJECT");
  }

  return {
    project,
    school: String(data.school || "")
      .trim()
      .slice(0, 120)
  };

}

/* SECURE SERVER AUTHORIZATION */

function serverAuthorized(event) {

  const secret =
    process.env.PROF_AVATAR_SERVER_TOKEN || "";

  const auth =
    event.headers?.authorization ||
    event.headers?.Authorization ||
    "";

  if (
    !secret ||
    typeof auth !== "string" ||
    !auth.startsWith("Bearer ")
  ) return false;

  const a = Buffer.from(secret);
  const b = Buffer.from(auth.slice(7));

  return a.length === b.length &&
    timingSafeEqual(a, b);

}

/* TEMPORARY PROF AVATAR ACCESS */

function authorize(event, data) {

  if (serverAuthorized(event)) return true;

  if (
    process.env.PROF_AVATAR_PILOT_ENABLED !== "true" ||
    process.env.PROF_AVATAR_PAID_ENABLED === "true"
  ) return false;

  return Boolean(verifyAccess(event, data));

}

/* NETWORK TIMEOUT */

async function timed(url, options, ms, read) {

  const c = new AbortController();

  const timer = setTimeout(
    () => c.abort(),
    ms
  );

  try {

    const r = await fetch(url, {
      ...options,
      signal: c.signal,
      redirect: "error"
    });

    return await read(r);

  } finally {

    clearTimeout(timer);

  }

}

/* MAXIMAX VOICE — ELEVENLABS */

async function speak(data, h) {

  if (
    process.env.PROF_AVATAR_VOICE_ENABLED !== "true"
  ) {

    return fail(
      503,
      "VOICE_DISABLED",
      "Voice is not enabled.",
      h
    );

  }

  const {
    ELEVENLABS_API_KEY: key,
    ELEVENLABS_VOICE_ID: voice,
    ELEVENLABS_MODEL_ID: model
  } = process.env;

  if (!key || !voice || !model) {

    return fail(
      503,
      "VOICE_NOT_CONFIGURED",
      "Existing voice configuration required.",
      h
    );

  }

  if (
    typeof data.text !== "string" ||
    !data.text.trim() ||
    data.text.trim().length > 1500
  ) {

    return fail(
      400,
      "INVALID_SPEECH_TEXT",
      "Provide 1 to 1500 characters.",
      h
    );

  }

  return timed(

    "https://api.elevenlabs.io/v1/text-to-speech/" +
    encodeURIComponent(voice) +
    "?output_format=pcm_24000",

    {
      method: "POST",

      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        text: data.text.trim(),
        model_id: model
      })
    },

    20000,

    async r => {

      if (!r.ok) {

        return fail(
          r.status === 429 ? 429 : 502,
          "VOICE_PROVIDER_ERROR",
          "Voice provider failed.",
          h
        );

      }

      const audio = Buffer.from(
        await r.arrayBuffer()
      );

      if (
        !audio.length ||
        audio.length % 2 ||
        audio.length > 2000000
      ) {

        return fail(
          502,
          "INVALID_VOICE_AUDIO",
          "Invalid or oversized audio.",
          h
        );

      }

      return json(200, {

        success: true,
        platform: PLATFORM,
        version: VERSION,
        action: "speak",

        audio: {
          encoding: "base64",
          format: "pcm_s16le",
          sampleRate: 24000,
          channels: 1,
          data: audio.toString("base64")
        }

      }, h);

    }

  );

}

/* CENTRAL AI QUESTION */

async function ask(data, h) {

  const message =
    data.message ??
    data.prompt ??
    data.question ??
    "";

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.trim().length > 12000
  ) {

    return fail(
      400,
      "INVALID_REQUEST",
      "Invalid AI request.",
      h
    );

  }

  const rawMode = String(
    data.mode || data.tool || "assistant"
  ).trim().toLowerCase();

  const mode = MODES.includes(rawMode)
    ? rawMode
    : "assistant";

  const provider = String(
    data.provider ||
    data.engine ||
    (mode === "tutor" ? "professor" : "openai")
  ).trim().toLowerCase();

  if (!Object.hasOwn(PROVIDERS, provider)) {

    return fail(
      400,
      "INVALID_REQUEST",
      "Invalid provider.",
      h
    );

  }

  const rawLang = String(
    data.language || data.lang || "ht"
  ).trim().toLowerCase().split("-")[0];

  const aliases = {
    kre: "ht",
    creole: "ht",
    fra: "fr",
    eng: "en",
    esp: "es"
  };

  const candidate =
    aliases[rawLang] || rawLang;

  const language = Object.hasOwn(LANG, candidate)
    ? candidate
    : "ht";

  const { project, school } =
    projectContext(data);

  const prompt = [

    `Platform: ${PLATFORM}`,
    `Project identifier: ${project}`,
    `Language: ${LANG[language]}`,
    `Mode: ${mode}`,

    school ? `School: ${school}` : "",

    "Respond in the requested language.",
    "Do not invent information or completed actions.",
    "Protect confidential information.",
    "USER REQUEST:",

    message.trim()

  ].filter(Boolean).join("\n");

  const start = Date.now();

  return timed(

    new URL(
      "/.netlify/functions/" + PROVIDERS[provider],
      DOMAIN
    ).toString(),

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },

      body: JSON.stringify({
        message: prompt,
        language,
        lang: language,
        mode,
        project,
        school
      })
    },

    45000,

    async r => {

      const d = await r.json();

      if (!r.ok || d?.success === false) {

        return fail(
          r.status === 429 ? 429 : 502,
          "AI_BACKEND_UNAVAILABLE",
          "AI backend unavailable.",
          h
        );

      }

      const answer = [

        d?.answer,
        d?.reply,
        d?.response,
        d?.content,
        d?.text,
        d?.message

      ].find(
        v => typeof v === "string" && v.trim()
      )?.trim();

      if (!answer) {

        return fail(
          502,
          "EMPTY_BACKEND_RESPONSE",
          "AI returned no answer.",
          h
        );

      }

      return json(200, {

        success: true,
        platform: PLATFORM,
        version: VERSION,
        provider,

        model: typeof d.model === "string"
          ? d.model
          : null,

        project,
        language,
        mode,

        answer,
        reply: answer,
        response: answer,
        content: answer,
        text: answer,

        speech: {
          text: answer,
          language
        },

        processingTime: Date.now() - start,

        createdAt: new Date().toISOString()

      }, h);

    }

  );

}

/* =========================================================
   CENTRAL API — SINGLE HANDLER
   ========================================================= */

exports.handler = async function(event) {

  const origin =
    event.headers?.origin ||
    event.headers?.Origin ||
    "";

  const allowed = new Set([

    DOMAIN,

    "https://www.bss1815promaxdmp.com",

    ...String(process.env.AI_ALLOWED_ORIGINS || "")
      .split(",")
      .map(v => v.trim())
      .filter(Boolean)

  ]);

  const h = {

    "Content-Type":
      "application/json; charset=utf-8",

    "Cache-Control":
      "no-store",

    "X-Content-Type-Options":
      "nosniff",

    "Access-Control-Allow-Methods":
      "POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",

    Vary: "Origin"

  };

  if (origin && allowed.has(origin)) {

    h["Access-Control-Allow-Origin"] = origin;

  }

  if (origin && !allowed.has(origin)) {

    return fail(
      403,
      "ORIGIN_NOT_ALLOWED",
      "Origin not authorized.",
      h
    );

  }

  if (event.httpMethod === "OPTIONS") {

    return {
      statusCode: 204,
      headers: h,
      body: ""
    };

  }

  if (event.httpMethod !== "POST") {

    return fail(
      405,
      "METHOD_NOT_ALLOWED",
      "Use POST.",
      {
        ...h,
        Allow: "POST, OPTIONS"
      }
    );

  }

  let data;

  try {

    const raw = event.isBase64Encoded

      ? Buffer.from(event.body || "", "base64")
          .toString("utf8")

      : event.body || "";

    if (Buffer.byteLength(raw) > 65536) {

      return fail(
        413,
        "INVALID_REQUEST",
        "Request too large.",
        h
      );

    }

    data = JSON.parse(raw || "{}");

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) throw Error();

  } catch {

    return fail(
      400,
      "INVALID_REQUEST",
      "Invalid request.",
      h
    );

  }

  try {

    /* SECURE LIVE AVATAR ACTIONS */

    if (
      data.action === "avatar-session" ||
      data.action === "speak"
    ) {

      if (!authorize(event, data)) {

        return fail(
          401,
          "AVATAR_UNAUTHORIZED",
          "Authorized access required.",
          h
        );

      }

      /* EXISTING ELEVENLABS VOICE */

      if (data.action === "speak") {

        return await speak(data, h);

      }

      /* EXISTING LIVE AVATAR */

      const context = projectContext(data);

      const session = await createSession(context);

      return json(200, {

        success: true,
        platform: PLATFORM,
        version: VERSION,
        action: "avatar-session",

        ...context,

        session

      }, h);

    }

    /* CENTRAL AI ROUTING */

    if (
      data.action != null &&
      data.action !== "ask"
    ) {

      return fail(
        400,
        "INVALID_REQUEST",
        "Invalid action.",
        h
      );

    }

    return await ask(data, h);

  } catch (e) {

    if (e.message === "INVALID_PROJECT") {

      return fail(
        400,
        "INVALID_PROJECT",
        "Invalid project.",
        h
      );

    }

    const status = e.name === "AbortError"

      ? 504

      : [429, 502, 503, 504].includes(e.status)

        ? e.status

        : 502;

    return fail(

      status,

      status === 504
        ? "AI_TIMEOUT"
        : "SERVICE_UNAVAILABLE",

      "Request could not be completed.",

      h

    );

  }

};

/* =========================================================
   END — CENTRAL AI BACKEND V1.3.0
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
