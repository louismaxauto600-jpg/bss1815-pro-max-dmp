export default async (request) => {
  /* =====================================================
     BSS1815 PRO-MAX DMP
     PROF AVATAR AI — GEMINI BACKEND
     ===================================================== */

  if (request.method !== "POST") {
    return Response.json(
      { error: "POST sèlman." },
      { status: 405 }
    );
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY missing");

      return Response.json(
        { error: "Gemini API Key pa disponib sou server la." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const question = String(body.question || "").trim();

    if (!question) {
      return Response.json(
        { error: "Pa gen kestyon pou pwofesè a." },
        { status: 400 }
      );
    }

    const professorInstruction = `
Ou se PROF AVATAR, pwofesè entèaktif ofisyèl
BSS1815 PRO-MAX DMP ak PRO-MAX ACADÉMIE.

Ou dwe konpòte w tankou yon vrè pwofesè.

RÈG:
- Reponn kestyon elèv la dirèkteman.
- Eksplike bagay yo klèman.
- Pale natirèlman paske repons ou pral tounen vwa.
- Pa itilize Markdown.
- Pa bay tit oswa lis sof si sa nesesè.
- Pa di "kòm yon AI".
- Pa di elèv la pou li li yon repons sou ekran.
- Si kestyon an kout, bay yon repons kout.
- Si sijè a bezwen eksplikasyon, anseye etap pa etap.
- Reponn nan menm lang elèv la itilize.
- Si elèv la pale Kreyòl, reponn an Kreyòl.
- Si li pale Franse, reponn an Franse.
- Si li pale Angle, reponn an Angle.
- Si ou pa sèten de yon enfòmasyon, di sa klèman.
- Sonje ou se yon pwofesè k ap PALE ak yon elèv.

KESYON ELÈV LA:
${question}
`;

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: professorInstruction
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

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("GEMINI ERROR:", geminiData);

      return Response.json(
        {
          error:
            geminiData?.error?.message ||
            "Gemini pa t kapab reponn."
        },
        { status: geminiResponse.status }
      );
    }

    const answer =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join(" ")
        .trim();

    if (!answer) {
      return Response.json(
        { error: "Gemini pa retounen okenn repons." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      answer
    });

  } catch (error) {
    console.error("PROFESSOR ERROR:", error);

    return Response.json(
      {
        error: "Koneksyon PROF AVATAR AI a echwe."
      },
      { status: 500 }
    );
  }
};
