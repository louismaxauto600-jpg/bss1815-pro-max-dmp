exports.handler = async function(event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  try {

    const body = JSON.parse(event.body || "{}");

    const message = String(body.message || "").trim();
    const language = String(body.language || "ht");
    const mode = String(body.mode || "general");

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Message required"
        })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "OPENAI_API_KEY is not configured"
        })
      };
    }

    let languageInstruction = "Reponn an Kreyòl Ayisyen.";

    if (language === "fr") {
      languageInstruction = "Réponds en français.";
    }

    if (language === "en") {
      languageInstruction = "Respond in English.";
    }

    const systemPrompt = `
Ou se AI CENTER ofisyèl pou BSS1815 PRO-MAX DMP.

Ou ede ak:
- BSS1815 Community
- PRO-MAX FM
- Maximax Multi Services
- PRO-MAX Académie
- administrasyon
- dokiman
- kominikasyon
- scripts
- announcements
- social media
- teknoloji
- AI
- DDN / DEVAN DEVAN NÈT

MODE AKTYÈL: ${mode}

${languageInstruction}

Bay repons ki klè, pwofesyonèl, itil, epi byen òganize.
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model: "gpt-5-mini",
          instructions: systemPrompt,
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error("OpenAI error:", data);

      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error:
            data?.error?.message ||
            "OpenAI API request failed"
        })
      };
    }

    let output = "";

    if (data.output_text) {
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
            content.text
          ) {
            output += content.text;
          }
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer:
          output ||
          "AI pa retounen okenn tèks."
      })
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error:
          error.message ||
          "Server error"
      })
    };
  }
};
