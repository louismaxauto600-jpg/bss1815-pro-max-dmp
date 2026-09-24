/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR AI
   NETLIFY FUNCTION
   FILE: netlify/functions/professor.mjs

   FLOW:
   index.html
   ↓
   prof-avatar-ai.js
   ↓
   /.netlify/functions/professor
   ↓
   GEMINI_API_KEY
   ↓
   GEMINI 3.5 FLASH
   ========================================================= */

export default async (request) => {

  /* ======================================================
     CORS / METHOD
     ====================================================== */

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };


  if (request.method === "OPTIONS") {

    return new Response(
      null,
      {
        status: 204,
        headers: headers
      }
    );

  }


  if (request.method !== "POST") {

    return new Response(
      JSON.stringify({
        success: false,
        error: "POST request required."
      }),
      {
        status: 405,
        headers: headers
      }
    );

  }


  try {

    /* ====================================================
       READ GEMINI API KEY FROM NETLIFY ENVIRONMENT
       ==================================================== */

    const GEMINI_API_KEY =
      process.env.GEMINI_API_KEY;


    if (!GEMINI_API_KEY) {

      console.error(
        "GEMINI_API_KEY IS MISSING FROM NETLIFY ENVIRONMENT."
      );


      return new Response(
        JSON.stringify({
          success: false,
          error: "GEMINI_API_KEY pa disponib nan Netlify."
        }),
        {
          status: 500,
          headers: headers
        }
      );

    }


    console.log(
      "GEMINI_API_KEY FOUND:",
      Boolean(GEMINI_API_KEY)
    );


    /* ====================================================
       READ QUESTION
       ==================================================== */

    let body;

    try {

      body =
        await request.json();

    } catch (error) {

      return new Response(
        JSON.stringify({
          success: false,
          error: "Request JSON la pa valid."
        }),
        {
          status: 400,
          headers: headers
        }
      );

    }


    const question =
      String(
        body?.question || ""
      ).trim();


    if (!question) {

      return new Response(
        JSON.stringify({
          success: false,
          error: "Pa gen kestyon pou pwofesè a."
        }),
        {
          status: 400,
          headers: headers
        }
      );

    }


    /* ====================================================
       PROFESSOR SYSTEM PROMPT
       ==================================================== */

    const professorPrompt = `
You are the official interactive AI Professor for BSS1815 PRO-MAX DMP and PRO-MAX ACADÉMIE.

You are speaking directly to a student.

Act like a real professional teacher.

RULES:

1. Answer the student's question directly.
2. Explain clearly and naturally.
3. Be patient, educational and professional.
4. Your response will be spoken out loud by the Professor Avatar.
5. Write naturally for speech.
6. Do not use Markdown.
7. Do not use unnecessary headings.
8. Do not say "As an AI".
9. Do not mention Gemini.
10. Answer in the same language the student uses.
11. If the student speaks Haitian Creole, answer in Haitian Creole.
12. If the student speaks French, answer in French.
13. If the student speaks English, answer in English.
14. If the student speaks Spanish, answer in Spanish.
15. Keep answers concise when possible, but explain properly when instruction is needed.
16. If you do not know something, say so instead of inventing information.

STUDENT QUESTION:

${question}
`;


    /* ====================================================
       GEMINI REQUEST
       ==================================================== */

    const GEMINI_MODEL =
      "gemini-3.5-flash";


    const GEMINI_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      GEMINI_MODEL +
      ":generateContent?key=" +
      encodeURIComponent(GEMINI_API_KEY);


    console.log(
      "Calling Gemini model:",
      GEMINI_MODEL
    );


    const geminiResponse =
      await fetch(
        GEMINI_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            contents: [
              {
                role: "user",

                parts: [
                  {
                    text: professorPrompt
                  }
                ]
              }
            ],

            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 700
            }

          })
        }
      );


    /* ====================================================
       READ RAW GEMINI RESPONSE
       ==================================================== */

    const rawText =
      await geminiResponse.text();


    console.log(
      "GEMINI HTTP STATUS:",
      geminiResponse.status
    );


    let geminiData;


    try {

      geminiData =
        JSON.parse(rawText);

    } catch (error) {

      console.error(
        "GEMINI RAW RESPONSE:",
        rawText
      );


      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Gemini pa retounen JSON. HTTP " +
            geminiResponse.status
        }),
        {
          status: 502,
          headers: headers
        }
      );

    }


    /* ====================================================
       GEMINI ERROR
       ==================================================== */

    if (!geminiResponse.ok) {

      console.error(
        "GEMINI API ERROR:",
        JSON.stringify(
          geminiData
        )
      );


      const apiMessage =
        geminiData?.error?.message ||
        "Gemini API request failed.";


      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Gemini HTTP " +
            geminiResponse.status +
            ": " +
            apiMessage
        }),
        {
          status: geminiResponse.status,
          headers: headers
        }
      );

    }


    /* ====================================================
       EXTRACT ANSWER
       ==================================================== */

    const answer =
      geminiData
        ?.candidates?.[0]
        ?.content?.parts
        ?.map(function(part) {

          return part.text || "";

        })
        .join(" ")
        .trim();


    if (!answer) {

      console.error(
        "NO GEMINI ANSWER:",
        JSON.stringify(
          geminiData
        )
      );


      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Gemini konekte, men li pa retounen okenn repons."
        }),
        {
          status: 502,
          headers: headers
        }
      );

    }


    /* ====================================================
       SUCCESS
       ==================================================== */

    console.log(
      "PROFESSOR ANSWER RECEIVED."
    );


    return new Response(
      JSON.stringify({
        success: true,
        model: GEMINI_MODEL,
        answer: answer
      }),
      {
        status: 200,
        headers: headers
      }
    );


  } catch (error) {

    console.error(
      "BSS1815 PROFESSOR FUNCTION ERROR:",
      error
    );


    return new Response(
      JSON.stringify({
        success: false,
        error:
          "PROF AVATAR backend error: " +
          String(
            error?.message ||
            error
          )
      }),
      {
        status: 500,
        headers: headers
      }
    );

  }

};
