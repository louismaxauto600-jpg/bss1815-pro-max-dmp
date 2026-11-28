
/* =========================================================
   BSS1815 PRO-MAX DMP
   CENTRAL AI BACKEND
   FILE: netlify/functions/central-ai.js
   VERSION: 1.0.1
   ========================================================= */

"use strict";

const CONFIG = Object.freeze({
  platform: "BSS1815 PRO-MAX DMP",
  version: "1.0.1",
  domain: "https://bss1815promaxdmp.com",
  timeout: 45000,
  maxMessageLength: 12000,

  providers: Object.freeze({
    openai: "/.netlify/functions/openai-live",
    gemini: "/.netlify/functions/gemini-live",
    professor: "/.netlify/functions/professor"
  }),

  languages: ["ht", "fr", "en", "es"],

  modes: [
    "general",
    "assistant",
    "writer",
    "translator",
    "voice",
    "image",
    "analytics",
    "tutor"
  ]
});

/* =========================================================
   RESPONSE HEADERS
   ========================================================= */

function getHeaders(event) {
  const origin =
    event.headers?.origin ||
    event.headers?.Origin ||
    "";

  const allowedOrigins = new Set([
    CONFIG.domain,
    "https://www.bss1815promaxdmp.com",
    ...String(process.env.AI_ALLOWED_ORIGINS || "")
      .split(",")
      .map(value => value.trim())
      .filter(Boolean)
  ]);

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return {
    headers,
    allowed: !origin || allowedOrigins.has(origin)
  };
}

/* =========================================================
   JSON RESPONSE
   ========================================================= */

function json(statusCode, data, headers) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(data)
  };
}

/* =========================================================
   ERROR HANDLING
   ========================================================= */

function failure(status, code, message, headers) {
  return json(status, {
    success: false,
    platform: CONFIG.platform,
    error: code,
    message
  }, headers);
}

/* =========================================================
   NORMALIZATION
   ========================================================= */

function normalizeLanguage(value) {
  const language = String(value || "ht")
    .trim()
    .toLowerCase()
    .split("-")[0];

  const aliases = {
    kre: "ht",
    creole: "ht",
    fra: "fr",
    eng: "en",
    esp: "es"
  };

  const normalized = aliases[language] || language;

  return CONFIG.languages.includes(normalized)
    ? normalized
    : "ht";
}

function normalizeMode(value) {
  const mode = String(value || "assistant")
    .trim()
    .toLowerCase();

  return CONFIG.modes.includes(mode)
    ? mode
    : "assistant";
}

function normalizeProvider(value, mode) {
  if (!value) {
    return mode === "tutor"
      ? "professor"
      : "openai";
  }

  const provider = String(value)
    .trim()
    .toLowerCase();

  if (
    Object.prototype.hasOwnProperty.call(
      CONFIG.providers,
      provider
    )
  ) {
    return provider;
  }

  return null;
}

/* =========================================================
   REQUEST VALIDATION
   ========================================================= */

function parseRequest(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64")
        .toString("utf8")
    : event.body || "";

  if (Buffer.byteLength(raw, "utf8") > 65536) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  const data = JSON.parse(raw || "{}");

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("INVALID_REQUEST");
  }

  const message =
    data.message ??
    data.prompt ??
    data.question ??
    "";

  if (typeof message !== "string") {
    throw new Error("INVALID_MESSAGE");
  }

  const cleanMessage = message.trim();

  if (!cleanMessage) {
    throw new Error("EMPTY_MESSAGE");
  }

  if (cleanMessage.length > CONFIG.maxMessageLength) {
    throw new Error("MESSAGE_TOO_LONG");
  }

  const mode = normalizeMode(data.mode || data.tool);

  const provider = normalizeProvider(
    data.provider || data.engine,
    mode
  );

  if (!provider) {
    throw new Error("INVALID_PROVIDER");
  }

  const project = String(data.project || "bss1815")
    .trim()
    .toLowerCase();

  if (!/^[a-z0-9-]{1,80}$/.test(project)) {
    throw new Error("INVALID_PROJECT");
  }

  const school = String(data.school || "")
    .trim()
    .slice(0, 120);

  return {
    message: cleanMessage,
    language: normalizeLanguage(
      data.language || data.lang
    ),
    mode,
    provider,
    project,
    school
  };
}

/* =========================================================
   CENTRAL AI CONTEXT
   ========================================================= */

function buildMessage(request) {
  const languages = {
    ht: "Haitian Creole",
    fr: "French",
    en: "English",
    es: "Spanish"
  };

  return [
    `Platform: ${CONFIG.platform}`,
    `Project identifier: ${request.project}`,
    `Language: ${languages[request.language]}`,
    `Mode: ${request.mode}`,
    request.school
      ? `School: ${request.school}`
      : "",
    "",
    "Respond in the requested language.",
    "Do not invent information or completed actions.",
    "Protect confidential information.",
    "",
    "USER REQUEST:",
    request.message
  ].filter(Boolean).join("\n");
}

/* =========================================================
   EXTRACT AI RESPONSE
   ========================================================= */

function extractAnswer(data) {
  if (!data || typeof data !== "object") {
    return "";
  }

  const candidates = [
    data.answer,
    data.reply,
    data.response,
    data.content,
    data.text,
    data.message
  ];

  const answer = candidates.find(
    value =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  return answer ? answer.trim() : "";
}

/* =========================================================
   CENTRAL PROVIDER CONNECTION
   ========================================================= */

async function connectProvider(request) {
  const endpoint = CONFIG.providers[request.provider];

  const url = new URL(
    endpoint,
    CONFIG.domain
  ).toString();

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    CONFIG.timeout
  );

  try {
    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },

      body: JSON.stringify({
        message: buildMessage(request),
        language: request.language,
        lang: request.language,
        mode: request.mode,
        project: request.project,
        school: request.school
      }),

      signal: controller.signal,
      redirect: "error"
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("INVALID_BACKEND_RESPONSE");
    }

    if (!response.ok || data.success === false) {
      const error = new Error("BACKEND_ERROR");
      error.status = response.status;
      throw error;
    }

    const answer = extractAnswer(data);

    if (!answer) {
      throw new Error("EMPTY_BACKEND_RESPONSE");
    }

    return {
      answer,
      provider: request.provider,
      model: typeof data.model === "string"
        ? data.model
        : null
    };

  } finally {
    clearTimeout(timer);
  }
}

/* =========================================================
   NETLIFY CENTRAL API HANDLER
   ========================================================= */

exports.handler = async function(event) {
  const { headers, allowed } = getHeaders(event);

  if (!allowed) {
    return failure(
      403,
      "ORIGIN_NOT_ALLOWED",
      "Origin not authorized.",
      headers
    );
  }

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return failure(
      405,
      "METHOD_NOT_ALLOWED",
      "Use POST.",
      {
        ...headers,
        "Allow": "POST, OPTIONS"
      }
    );
  }

  let request;

  try {
    request = parseRequest(event);
  } catch (error) {
    return failure(
      error.message === "REQUEST_TOO_LARGE"
        ? 413
        : 400,
      "INVALID_REQUEST",
      "Invalid or incomplete AI request.",
      headers
    );
  }

  const startedAt = Date.now();

  try {
    const result = await connectProvider(request);

    return json(200, {
      success: true,

      platform: CONFIG.platform,
      version: CONFIG.version,

      provider: result.provider,
      model: result.model,

      project: request.project,
      language: request.language,
      mode: request.mode,

      answer: result.answer,
      reply: result.answer,
      response: result.answer,
      content: result.answer,
      text: result.answer,

      processingTime: Date.now() - startedAt,

      createdAt: new Date().toISOString()

    }, headers);

  } catch (error) {
    if (error.name === "AbortError") {
      return failure(
        504,
        "AI_TIMEOUT",
        "The central AI request timed out.",
        headers
      );
    }

    if (error.status === 429) {
      return failure(
        429,
        "AI_RATE_LIMIT",
        "Too many AI requests.",
        headers
      );
    }

    console.error("CENTRAL AI ERROR", {
      provider: request.provider,
      code: error.message,
      status: error.status || null
    });

    return failure(
      502,
      "AI_BACKEND_UNAVAILABLE",
      "The AI backend is temporarily unavailable.",
      headers
    );
  }
};

/* =========================================================
   END — BSS1815 PRO-MAX DMP CENTRAL AI BACKEND
   VERSION: 1.0.1
   ========================================================= */
