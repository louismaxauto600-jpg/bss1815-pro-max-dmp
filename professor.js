// netlify/functions/professor.js
// BSS1815 PRO-MAX DMP — PROF AVATAR (PIBLIK)
// Reponn kesyon vizitè yo sou paj akèy la, ak yon limit pou pwoteje kredi Gemini an.
//
// Itilize menm varyab Netlify ak AI Center la:
//   GEMINI_API_KEY  (obligatwa)
//   GEMINI_MODEL    (opsyonèl)
//   PROF_DAILY_LIMIT (opsyonèl, pa defo 15 kesyon pa moun pa jou)

const DEFAULT_MODEL = "gemini-3.6-flash";
const DAILY_LIMIT = parseInt(process.env.PROF_DAILY_LIMIT || "15", 10);

/* Limit senp pa adrès IP (li rekòmanse lè Netlify rekòmanse fonksyon an) */
const usage = new Map();

function allowed(ip) {
  const day = new Date().toISOString().slice(0, 10);
  const key = day + "|" + ip;
  const count = usage.get(key) || 0;
  if (count >= DAILY_LIMIT) { return false; }
  usage.set(key, count + 1);
  if (usage.size > 5000) {
    for (const k of usage.keys()) { if (!k.startsWith(day)) { usage.delete(k); } }
  }
  return true;
}

const LANG = {
  ht: { name: "kreyòl ayisyen", code: "ht-HT" },
  fr: { name: "français", code: "fr-FR" },
  en: { name: "English", code: "en-US" },
  es: { name: "español", code: "es-ES" }
};

function systemPrompt(lang) {
  return `Ou se PROF AVATAR, pwofesè ak asistan akèy sit BSS1815 PRO-MAX DMP (bss1815pro-maxdmp.com).

LANG: Reponn TOUJOU an ${LANG[lang].name}, kèlkeswa lang kesyon an.

STIL: Repons ou ap LI AK VWA, kidonk: fraz kout ak klè, 2 a 5 fraz maksimòm, san lis, san zetwal, san emoji, san lyen long.

PLATFÒM NAN:
- BSS1815 PRO-MAX DMP (Briyant Solèy Signo 1815) se yon sèl platfòm ki reyini 5 pwojè: PRO-MAX FM (radyo dijital ak medya), Maximax Multi Services (imigrasyon, tradiksyon, dokiman, asistans administratif; ekip la PA avoka e li pa bay konsèy legal), PRO-MAX Académie (fòmasyon AI, teknoloji, Insurance School, Real Estate School, sètifikasyon), PRO-MAX Beat Lab (beat, piano, aranjman, pwodiksyon mizik), ak Devan Devan Nèt (vizyon teknoloji ak AI). BSS1815 Community (manm, dirijan, mizisyen, fanatik, eritaj) se kè platfòm nan.
- Eslogan: Devan Devan Nèt, bati pou jodi a, pare pou demen.
- Kontak: imèl bss1815promaxdmp@gmail.com; WhatsApp +509 4343-7488; USA (516) 216-8494, (317) 538-1150, (407) 640-5166; Ayiti +509 4343-7488 ak +509 4254-4447.

RÈG: Rete janti ak pwofesyonèl. Pa envante enfòmasyon (pri, dat, orè) ou pa konnen: di moun nan kontakte ekip la. Pa bay konsèy legal, medikal oswa finansye. Pa pale de zòn admin prive a ni modil yo. Si kesyon an pa gen rapò ak platfòm nan, reponn kout epi gide moun nan tounen sou sa platfòm nan ofri.`;
}

function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") { return json(405, { error: "Method not allowed" }); }
  if (!process.env.GEMINI_API_KEY) { return json(500, { error: "GEMINI_API_KEY missing" }); }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "Bad request" }); }

  const question = String(body.question || "").trim().slice(0, 600);
  const lang = LANG[body.lang] ? body.lang : "ht";
  if (!question) { return json(400, { error: "No question" }); }

  const ip = (event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (!allowed(ip)) {
    const msg = {
      ht: "Ou rive nan limit kesyon pou jodi a. Tounen demen, oswa ekri nou sou WhatsApp.",
      fr: "Vous avez atteint la limite de questions pour aujourd’hui. Revenez demain ou écrivez-nous sur WhatsApp.",
      en: "You have reached today’s question limit. Come back tomorrow or message us on WhatsApp.",
      es: "Has alcanzado el límite de preguntas de hoy. Vuelve mañana o escríbenos por WhatsApp."
    };
    return json(429, { answer: msg[lang], language: LANG[lang].code, limited: true });
  }

  try {
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(lang) }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 400 }
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { throw new Error((data.error && data.error.message) || ("HTTP " + res.status)); }

    const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    const answer = (parts || []).map((p) => p.text || "").join("").replace(/[*#_`]/g, "").trim();
    if (!answer) { throw new Error("Empty answer"); }

    return json(200, { answer, language: LANG[lang].code });
  } catch (error) {
    console.error("PROFESSOR ERROR:", error);
    return json(502, { error: "Professor unavailable" });
  }
};
