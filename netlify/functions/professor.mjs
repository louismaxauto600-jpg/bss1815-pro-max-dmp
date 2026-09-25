/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR AI
   NETLIFY FUNCTION

   FILE:
   netlify/functions/professor.mjs

   FLOW:
   index.html
      ↓
   prof-avatar-ai.js
      ↓
   /.netlify/functions/professor
      ↓
   GEMINI_API_KEY (Netlify Environment Variable)
      ↓
   x-goog-api-key
      ↓
   GEMINI 3.5 FLASH
========================================================= */

export default async (request) => {

  /* =====================================================
     CORS
  ===================================================== */

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store"
  };


  /* =====================================================
     OPTIONS
  ===================================================== */

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }


  /* =====================================================
     ONLY POST
  ===================================================== */

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "POST request required."
      }),
      {
        status: 405,
        headers
      }
    );
  }


  try {

    /* =====================================================
       GEMINI API KEY
       READ ONLY FROM NETLIFY
    ===================================================== */

    const GEMINI_API_KEY =
      process.env.GEMINI_API_KEY?.trim();


    if (!GEMINI_API_KEY) {

      console.error(
        "BSS1815 PROFESSOR: GEMINI_API_KEY missing."
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "GEMINI_API_KEY pa disponib nan Netlify Runtime."
        }),
        {
          status: 500,
          headers
        }
      );
    }


    /* =====================================================
       READ REQUEST BODY
    ===================================================== */

    let body;

    try {
      body = await request.json();
    } catch (error) {

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON request."
        }),
        {
          status: 400,
          headers
        }
      );
    }


    /* =====================================================
       ACCEPT DIFFERENT FRONTEND FIELD NAMES
    ===================================================== */

    const userMessage =
      body?.message ??
      body?.prompt ??
      body?.question ??
      body?.text ??
      body?.input ??
      body?.userMessage ??
      "";


    if (
      typeof userMessage !== "string" ||
      !userMessage.trim()
    ) {

      return new Response(
        JSON.stringify({
          success: false,
          error: "Pa gen mesaj pou voye bay Professor AI."
        }),
        {
          status: 400,
          headers
        }
      );
    }


    /* =====================================================
       LANGUAGE
    ===================================================== */

    const requestedLanguage =
      String(
        body?.language ??
        body?.lang ??
        "ht"
      ).toLowerCase();


    let languageInstruction =
      "Respond naturally in Haitian Creole.";

    if (
      requestedLanguage === "en" ||
      requestedLanguage === "eng" ||
      requestedLanguage === "english"
    ) {
      languageInstruction =
        "Respond naturally in English.";
    }

    if (
      requestedLanguage === "fr" ||
      requestedLanguage === "fra" ||
      requestedLanguage === "french"
    ) {
      languageInstruction =
        "Réponds naturellement en français.";
    }

    if (
      requestedLanguage === "ht" ||
      requestedLanguage === "ht-creole" ||
      requestedLanguage === "kre" ||
      requestedLanguage === "kreyol"
    ) {
      languageInstruction =
        "Reponn natirèlman an Kreyòl Ayisyen.";
    }


    /* =====================================================
       PROFESSOR SYSTEM INSTRUCTION
    ===================================================== */

    const systemInstruction = `
You are the official AI Professor and Customer Service
Assistant for BSS1815 PRO-MAX DMP
(Briyant Solèy Signo 1815).

Your responsibilities:

- Welcome visitors professionally.
- Answer questions clearly and accurately.
- Help users understand the BSS1815 platform.
- Explain available platform features.
- Help users navigate the digital platform.
- Provide customer service assistance.
- Give concise step-by-step guidance when appropriate.
- Never invent information you do not know.
- If information is unavailable, say so clearly.
- Never expose API keys, passwords, private credentials,
  internal secrets, or protected administrative information.

${languageInstruction}

Keep answers clear, friendly, professional and useful.
`.trim();


    /* =====================================================
       GEMINI MODEL

       Current BSS1815 target:
       Gemini 3.5 Flash
    ===================================================== */

    const MODEL = "gemini-3.5-flash";

    const GEMINI_URL =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;


    /* =====================================================
       GEMINI REQUEST

       IMPORTANT:
       Authorization is sent using:
       x-goog-api-key

       The key is NOT placed in frontend code.
       The key is NOT returned to browser.
    ===================================================== */

    const geminiResponse = await fetch(
      GEMINI_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },

        body: JSON.stringify({

          system_instruction: {
            parts: [
              {
                text: systemInstruction
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: userMessage.trim()
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.6,
            topP: 0.9,
            maxOutputTokens: 1024
          }

        })
      }
    );


    /* =====================================================
       READ GOOGLE RESPONSE
    ===================================================== */

    const rawGoogleResponse =
      await geminiResponse.text();


    let geminiData = {};

    try {

      geminiData =
        rawGoogleResponse
          ? JSON.parse(rawGoogleResponse)
          : {};

    } catch (error) {

      console.error(
        "BSS1815 PROFESSOR: Google returned non-JSON.",
        rawGoogleResponse
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Gemini returned an invalid response.",
          status: geminiResponse.status
        }),
        {
          status: 502,
          headers
        }
      );
    }


    /* =====================================================
       GEMINI ERROR
    ===================================================== */

    if (!geminiResponse.ok) {

      const googleMessage =
        geminiData?.error?.message ||
        geminiData?.message ||
        "Gemini request failed.";


      console.error(
        "BSS1815 PROFESSOR GEMINI ERROR:",
        {
          status: geminiResponse.status,
          statusText: geminiResponse.statusText,
          message: googleMessage
        }
      );


      /* -------------------------------------------------
         AUTHORIZATION ERROR
      ------------------------------------------------- */

      if (
        geminiResponse.status === 401 ||
        geminiResponse.status === 403
      ) {

        return new Response(
          JSON.stringify({
            success: false,
            error:
              `HTTP ${geminiResponse.status} — GEMINI AUTHORIZATION REFIZE.`,
            details: googleMessage,
            model: MODEL
          }),
          {
            status: geminiResponse.status,
            headers
          }
        );
      }


      /* -------------------------------------------------
         MODEL NOT FOUND
      ------------------------------------------------- */

      if (geminiResponse.status === 404) {

        return new Response(
          JSON.stringify({
            success: false,
            error:
              `Gemini model ${MODEL} pa disponib pou request sa a.`,
            details: googleMessage,
            model: MODEL
          }),
          {
            status: 502,
            headers
          }
        );
      }


      /* -------------------------------------------------
         RATE LIMIT
      ------------------------------------------------- */

      if (geminiResponse.status === 429) {

        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Gemini rate limit oswa quota rive.",
            details: googleMessage,
            model: MODEL
          }),
          {
            status: 429,
            headers
          }
        );
      }


      /* -------------------------------------------------
         OTHER GEMINI ERROR
      ------------------------------------------------- */

      return new Response(
        JSON.stringify({
          success: false,
          error:
            `Gemini API HTTP ${geminiResponse.status}.`,
          details: googleMessage,
          model: MODEL
        }),
        {
          status: 502,
          headers
        }
      );
    }


    /* =====================================================
       EXTRACT GEMINI ANSWER
    ===================================================== */

    const parts =
      geminiData?.candidates?.[0]?.content?.parts ?? [];


    const answer =
      parts
        .map((part) => part?.text || "")
        .join("")
        .trim();


    /* =====================================================
       NO TEXT RESPONSE
    ===================================================== */

    if (!answer) {

      console.error(
        "BSS1815 PROFESSOR: Gemini returned no text.",
        JSON.stringify(geminiData)
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Gemini reponn, men li pa retounen okenn tèks.",
          model: MODEL
        }),
        {
          status: 502,
          headers
        }
      );
    }


    /* =====================================================
       SUCCESS

       Multiple field names are returned intentionally
       for compatibility with existing frontend code.
    ===================================================== */

    return new Response(
      JSON.stringify({

        success: true,

        answer: answer,

        response: answer,

        reply: answer,

        text: answer,

        message: answer,

        model: MODEL,

        provider: "Google Gemini",

        service: "BSS1815 Professor AI"

      }),
      {
        status: 200,
        headers
      }
    );


  } catch (error) {

    /* =====================================================
       INTERNAL FUNCTION ERROR
    ===================================================== */

    console.error(
      "BSS1815 PROFESSOR INTERNAL ERROR:",
      error
    );


    return new Response(
      JSON.stringify({

        success: false,

        error:
          "Professor AI internal server error.",

        details:
          error instanceof Error
            ? error.message
            : String(error)

      }),
      {
        status: 500,
        headers
      }
    );
  }
};
