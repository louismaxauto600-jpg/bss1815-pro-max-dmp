export default async (req) => {

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {

    const GEMINI_API_KEY =
      process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return Response.json(
        {
          error:
            "GEMINI_API_KEY pa disponib nan Netlify Function."
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const question =
      body.question?.trim();

    if (!question) {
      return Response.json(
        { error: "Pa gen kestyon." },
        { status: 400 }
      );
    }

    const prompt = `
You are the official AI Professor for
BSS1815 PRO-MAX DMP and PRO-MAX Académie.

Act like a real professional teacher.

RULES:
- Answer the student's question directly.
- Explain clearly and naturally.
- Be patient and educational.
- Keep spoken answers concise unless more detail is needed.
- Do not mention that you are Gemini.
- Do not use markdown.
- Do not create headings.
- Your answer will be spoken aloud by an avatar.
- Speak naturally, like a professor talking directly to a student.
- Answer in the same language used by the student whenever possible.

Student question:
${question}
`;

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "x-goog-api-key":
            GEMINI_API_KEY
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data =
      await geminiResponse.json();

    if (!geminiResponse.ok) {

      console.error(
        "GEMINI ERROR:",
        data
      );

      return Response.json(
        {
          error:
            data?.error?.message ||
            "Gemini pa reponn."
        },
        {
          status:
            geminiResponse.status
        }
      );
    }

    const answer =
      data?.candidates?.[0]
        ?.content?.parts
        ?.map(part => part.text || "")
        .join(" ")
        .trim();

    if (!answer) {
      return Response.json(
        {
          error:
            "Gemini pa retounen yon repons."
        },
        { status: 500 }
      );
    }

    return Response.json({
      answer
    });

  } catch (error) {

    console.error(
      "PROFESSOR FUNCTION ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Professor AI connection failed."
      },
      { status: 500 }
    );
  }
};
