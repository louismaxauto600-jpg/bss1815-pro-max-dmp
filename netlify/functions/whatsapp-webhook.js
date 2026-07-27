exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const params = new URLSearchParams(event.body || "");

  const from = params.get("From") || "";
  const message = params.get("Body") || "";

  console.log("BSS1815 WhatsApp message:", {
    from,
    message
  });

  const reply =
    "Bonjou! 👋 Byenvini nan BSS1815 PRO-MAX-DMP. " +
    "Nou resevwa mesaj ou avèk siksè.";

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${reply}</Message>
</Response>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8"
    },
    body: twiml
  };
};
