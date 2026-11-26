/* =========================================================
   BSS1815 PRO-MAX DMP
   CENTRAL OPENAI API
   FILE: netlify/functions/ai.js
   VERSION: 2.0.0
   ========================================================= */

"use strict";

const PROJECTS = {
  bss1815: "Briyant Solèy Signo 1815",
  "pro-max-fm": "PRO-MAX FM 106.5 FM",
  maximax: "Maximax Multi Services",
  academy: "PRO-MAX ACADÉMIE",
  "leogane-info": "LÉOGÂNE INFO",
  ddn: "DDN / DEVAN DEVAN NÈT"
};

const MODES = {
  general: "General AI Assistant",
  assistant: "AI Assistant",
  writer: "AI Writer",
  translator: "AI Translator",
  voice: "AI Voice Studio — script preparation",
  image: "AI Image Studio — prompt preparation",
  analytics: "AI Analytics",
  tutor: "AI Tutor"
};

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(statusCode, data) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify(data)
  };
}

exports.handler = async function (event) {

  if (event.httpMethod !== "POST") {
    return json(405, {
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    let body;

    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, {
        success: false,
        error: "Invalid JSON request"
      });
    }

    if (!body || typeof body !== "object") {
      return json(400, {
        success: false,
        error: "Invalid request"
      });
    }

    /* ==========================================
       FRONTEND COMPATIBILITY
       ========================================== */

    const rawMessage =
      body.message ??
      body.prompt ??
      body.question ??
      body.text ??
      body.input ??
      "";

    if (
      typeof rawMessage !== "string" ||
      !rawMessage.trim()
    ) {
      return json(400, {
        success: false,
        error: "Message required"
      });
    }

    const message = rawMessage.trim();

    if (message.length > 12000) {
      return json(400, {
        success: false,
        error: "Message too long"
      });
    }

    const requestedMode = String(
      body.mode || body.tool || "general"
    ).toLowerCase();

    const mode = Object.hasOwn(MODES, requestedMode)
      ? requestedMode
      : "general";

    const requestedProject = String(
      body.project || "bss1815"
    ).toLowerCase();

    const project = Object.hasOwn(
      PROJECTS,
      requestedProject
    )
      ? requestedProject
      : "bss1815";

    /* ==========================================
       LANGUAGE CENTER
       ========================================== */

    const language = String(
      body.language || body.lang || "ht"
    ).toLowerCase();

    const LANGUAGES = {
      ht: "Reponn natirèlman an Kreyòl Ayisyen.",
      kre: "Reponn natirèlman an Kreyòl Ayisyen.",
      fr: "Réponds naturellement en français.",
      fra: "Réponds naturellement en français.",
      en: "Respond naturally in English.",
      eng: "Respond naturally in English.",
      es: "Responde naturalmente en español.",
      esp: "Responde naturalmente en español."
    };

    const languageInstruction =
      LANGUAGES[language] || LANGUAGES.ht;

    /* ==========================================
       SECURE API CONFIGURATION
       ========================================== */

    const apiKey =
      process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return json(500, {
        success: false,
        error: "OPENAI_API_KEY is not configured"
      });
    }

    const model =
      process.env.OPENAI_MODEL?.trim() ||
      "gpt-5-mini";

    /* ==========================================
       CENTRAL AI SYSTEM INSTRUCTIONS
       ========================================== */

    const systemPrompt = `

You are the official Central AI Assistant for
BSS1815 PRO-MAX DMP.

PLATFORM:
BSS1815 PRO-MAX DMP
Digital Management Platform

ECOSYSTEM:

- Briyant Solèy Signo 1815
- PRO-MAX FM 106.5 FM
- Maximax Multi Services
- PRO-MAX ACADÉMIE
- LÉOGÂNE INFO
- DDN / DEVAN DEVAN NÈT

ACTIVE PROJECT:
${PROJECTS[project]}

ACTIVE AI TOOL:
${MODES[mode]}

RESPONSIBILITIES:

- Professional AI assistance
- Administration
- Community management
- Document preparation
- Professional writing
- Translation
- Radio scripts
- Media production
- Educational assistance
- Student tutoring
- Customer service
- Technology assistance
- Data analysis when data is supplied
- Image prompt preparation
- Voice script preparation

PRO-MAX ACADÉMIE:

Support its schools and educational programs.
Adapt explanations to the student's subject
and learning level.

Do not claim to have generated audio, video,
images or external actions when you have only
prepared text or instructions.

MAXIMAX MULTI SERVICES:

Provide general information and administrative
assistance.

Do not represent yourself as an attorney.
Do not provide personalized legal advice.

SECURITY:

Never expose API keys, passwords,
private credentials or internal secrets.

Never request unnecessary sensitive
personal information.

Never invent facts or claim access to
systems or records you cannot access.

LANGUAGE:

${languageInstruction}

Provide clear, professional, accurate,
structured and useful responses.

BSS1815 PRO-MAX DMP
DEVAN DEVAN NÈT.

`.trim();

    /* ==========================================
       OPENAI RESPONSES API
       ========================================== */

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model,
          instructions: systemPrompt,
          input: message,
          max_output_tokens: 2048,
          store: false
        }),

        signal: AbortSignal.timeout(25000)
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(
        "BSS1815 OPENAI ERROR:",
        response.status
      );

      return json(response.status, {
        success: false,
        error: "OpenAI API request failed"
      });
    }

    /* ==========================================
       EXTRACT AI RESPONSE
       ========================================== */

    let output = "";

    if (typeof data.output_text === "string") {
      output = data.output_text;
    }

    if (!output && Array.isArray(data.output)) {

      for (const item of data.output) {

        if (!Array.isArray(item.content)) {
          continue;
        }

        for (const content of item.content) {

          if (
            content.type === "output_text" &&
            typeof content.text === "string"
          ) {
            output += content.text;
          }
        }
      }
    }

    output = output.trim();

    if (!output) {
      return json(502, {
        success: false,
        error: "AI returned no text"
      });
    }

    /* ==========================================
       UNIVERSAL FRONTEND RESPONSE
       ========================================== */

    return json(200, {

      success: true,

      id: data.id || null,

      answer: output,
      content: output,
      reply: output,
      response: output,
      message: output,
      text: output,

      project,

      projectName: PROJECTS[project],

      tool: mode,

      language,

      provider: "OpenAI",

      model,

      service: "BSS1815 PRO-MAX DMP CENTRAL AI",

      createdAt: new Date().toISOString()

    });

  } catch (error) {

    console.error(
      "BSS1815 CENTRAL AI ERROR:",
      error.name
    );

    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      return json(504, {
        success: false,
        error: "AI request timed out"
      });
    }

    return json(500, {
      success: false,
      error: "Central AI internal server error"
    });

  }
};
