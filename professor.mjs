/* =========================================================
   FILE NAME: professor.mjs
   LOCATION:  netlify/functions/professor.mjs
   =========================================================

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
      ↓ (si modèl la okipe / 503)
   GEMINI 2.5 FLASH → GEMINI 3.5 FLASH-LITE
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

OFFICIAL HISTORY OF BRIYANT SOLÈY SIGNO 1815
(Use ONLY these facts when asked about the history.
Never invent dates, names, events or details that are not here.
If asked something not covered here, say the information
is not yet available in the official history.)

- Briyant Solèy Signo 1815 was founded in 1815 in Leyogàn (Léogâne), Haiti.
- Founder and pioneer: Jeneral Leclerc Felix (Felix is the surname),
  a high-ranking officer at the Palè Nasyonal, who wore a khaki
  uniform with three stars on his shoulder.
- The konbit: a group of people who worked the land for
  Jeneral Leclerc Felix at Anwo Dabòne. The band began at Anwo Dabòne.
- Jeneral Leclerc Felix had two houses: one in the city and one at
  Anwo Dabòne. When it got too late, he slept in the city; the next
  day he always returned to his base at Anwo Dabòne.
- Origin of the name: every time the General came from Pòtoprens
  to Leyogàn, the workers went to meet him on the road. One day,
  while they were returning with him, the sun struck the star on his
  shoulder and one of them said: "Solèy la briyan sou etwal papa!"
  That gave the name "Briyant Solèy". Later, they went to play at
  Dabòne, night fell, and they went to sleep at Signo. Signo joined
  the name: "Briyant Solèy Signo".
- The Felix family are the roots of the rara: Cange Felix,
  Tania Felix, Tidè Felix, Tidò Felix, Andy Felix, Andre Asouman,
  Ones Felix, Manbo Fifi.
- Heroes of Briyant's history: Konkont; Michel Felix;
  Joseph Marthone alias Ti Rat, "youn nan nèg ki fè anpil bagay ki
  gravé nan istwa Briyant"; Evens Elie, who gathered everyone in the
  diaspora, where Max Louis alias Le Baron emerged ("la seule
  différence", a platform on his own, who keeps doing things for
  Briyant); Ti Lafrance; Fanfan; Decoline Paulema;
  Djematan Guitolio alias Ti-Chery; Cange Felix, the coordinator who
  structured the band; and Papouche Le Stratège, the strategist,
  who is no longer with us (speak of him with respect, "an memwa").
- Current team: Djematan Guitolio alias Ti-Chery, Jean Medor alias
  Yguens, Brunel, Rodrigue Colin alias Roro Lajan, Jeff Colin,
  Ralph Florial, Kòmandan Landry, Vice Prezidan Tatane.
  In Haiti: Roosevelt, Ti Reynold, Guypson, Jij Mayan, Montina,
  Warrens Valery.
- Values (official document): discipline and respect; hard work and
  professionalism; unique visual identity and sound
  (ORANGE + BLACK FADE, the official colors and signature).
- Mission: build a group that respects its musicians, brings positive
  energy, and represents the community with dignity.
- Vision: become one of the most organized, most respected groups with
  the greatest legacy in the musical movement.
- Today, the BSS1815 PRO-MAX DMP movement has digitized this
  tradition with artificial intelligence.
- Always write every name exactly as written above.
- Always write the platform name as "BSS1815 PRO-MAX DMP"
  (BSS1815 first).

${languageInstruction}

Keep answers clear, friendly, professional and useful.
`.trim();


    /* =====================================================
       GEMINI MODELS

       Current BSS1815 target:
       Gemini 3.5 Flash

       Si Google reponn 503 (high demand), 429,
       500 oswa 404, fonksyon an eseye pwochen
       modèl nan lis la otomatikman.
    ===================================================== */

    const MODELS = [
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-3.5-flash-lite"
    ];

    const RETRYABLE_STATUS = [404, 429, 500, 503];

    let MODEL = MODELS[0];


    /* =====================================================
       GEMINI REQUEST BODY
    ===================================================== */

    const geminiRequestBody = JSON.stringify({

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

    });


    /* =====================================================
       GEMINI REQUEST (WITH MODEL FALLBACK)

       IMPORTANT:
       Authorization is sent using:
       x-goog-api-key

       The key is NOT placed in frontend code.
       The key is NOT returned to browser.
    ===================================================== */

    let geminiResponse = null;
    let geminiData = {};

    for (const candidateModel of MODELS) {

      MODEL = candidateModel;

      const GEMINI_URL =
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

      geminiResponse = await fetch(
        GEMINI_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
          },

          body: geminiRequestBody
        }
      );


      /* =====================================================
         READ GOOGLE RESPONSE
      ===================================================== */

      const rawGoogleResponse =
        await geminiResponse.text();

      geminiData = {};

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
            status: geminiResponse.status,
            model: MODEL
          }),
          {
            status: 502,
            headers
          }
        );
      }


      /* ---------------------------------------------
         Siksè → sòti nan bouk la
         Erè ki pa ka retry (401, 403, 400...) → sòti
      --------------------------------------------- */

      if (geminiResponse.ok) {
        break;
      }

      if (!RETRYABLE_STATUS.includes(geminiResponse.status)) {
        break;
      }

      console.warn(
        "BSS1815 PROFESSOR: model unavailable, trying next model.",
        {
          model: MODEL,
          status: geminiResponse.status
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
          message: googleMessage,
          model: MODEL
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
         ALL MODELS BUSY (503)
      ------------------------------------------------- */

      if (geminiResponse.status === 503) {

        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Tout modèl Gemini yo okipe kounye a. Eseye ankò nan kèk minit.",
            details: googleMessage,
            model: MODEL
          }),
          {
            status: 503,
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
