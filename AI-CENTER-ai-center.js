// netlify/functions/ai-center.js
// BSS1815 PRO-MAX DMP — AI Center (Gemini), PRIVE: sèlman Super Admin ak Admin.
//
// Kle yo PA NAN KÒD LA. Mete yo nan Netlify:
//   Site configuration → Environment variables
//     GEMINI_API_KEY   = kle Google AI Studio ou (obligatwa)
//     GEMINI_MODEL     = non modèl la (opsyonèl, pa defo: gemini-3.6-flash)
//     FIREBASE_API_KEY = apiKey Firebase ou (opsyonèl, gen lis pa defo anba a)

const PROJECT_ID = "briyant-soley-signo-1815";
const ROOT_SUPER_ADMIN = "briyantsoleysigno1815@gmail.com";
const DEFAULT_MODEL = "gemini-3.6-flash"; // menm modèl ki mache nan Beat Maker AI School la

const FIREBASE_KEYS = [
  process.env.FIREBASE_API_KEY,
  "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY",
  "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokelJCtDuY",
  "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokelCtDuY",
  "AIzaSyDenkzhQh5rHMoZYDXrM8zSSCCoX4gBcYY"
].filter(Boolean);

const SYSTEM_PROMPT = `Ou se AI CENTER BSS1815 PRO-MAX DMP, asistan prive pou Super Admin ak Admin platfòm nan.

LANG: Reponn toujou nan menm lang ak moun ki ekri a (kreyòl ayisyen, fransè, angle oswa panyòl). Si yo mande yon tradiksyon, bay tradiksyon an sèlman.

PLATFÒM NAN:
- BSS1815 PRO-MAX DMP (Briyant Solèy Signo 1815) se yon sèl platfòm dijital ki reyini 5 pwojè: PRO-MAX FM (radyo dijital ak medya), Maximax Multi Services (imigrasyon, tradiksyon, dokiman, asistans administratif — ekip la PA avoka e li pa bay konsèy legal), PRO-MAX Académie (fòmasyon AI, teknoloji, Insurance School, Real Estate School, sètifikasyon), PRO-MAX Beat Lab (beat, piano, aranjman, pwodiksyon mizik), ak Devan Devan Nèt™ (vizyon teknoloji ak AI). BSS1815 Community (manm, dirijan, mizisyen, fanatik, eritaj) se kè platfòm nan.
- Eslogan: DEVAN DEVAN NÈT™ — BATI POU JODI A • PARE POU DEMEN.
- Sit: bss1815pro-maxdmp.com • Imèl: bss1815promaxdmp@gmail.com
- Telefòn: USA (516) 216-8494, (317) 538-1150, (407) 640-5166 • Ayiti: Cange +509 4343-7488, Adan +509 4254-4447 • WhatsApp +509 4343-7488.
- Modil admin yo: CRM, Communication Center, Flyer Studio, Digital Registry, Events, Documents, Announcements, Donations, Attendance, Certificates, Elections, Volunteers, Finance/Treasury, Media Gallery, Notifications, Reports, Help Desk, Live Streaming.

SA OU FÈ: ede admin yo ekri anons, mesaj WhatsApp, lèt ofisyèl, tèks flyer, rapò, pwogram evènman; tradui; rezime; bay ide; eksplike kijan pou itilize platfòm nan.

RÈG: Rete pwofesyonèl, klè, e pa twò long. Pa envante chif, dat oswa non ou pa konnen: di sa ou pa konnen epi mande presizyon. Pa bay konsèy legal, medikal oswa finansye; pou kesyon legal imigrasyon, raple ke Maximax pa avoka.`;

function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify(body)
  };
}

function normalize(v) { return String(v || "").trim().toLowerCase(); }

/* 1. Verifye token Firebase la epi jwenn imèl moun nan */
async function verifyUser(idToken) {
  for (const key of FIREBASE_KEYS) {
    const res = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + encodeURIComponent(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.users && data.users[0]) {
      return { uid: data.users[0].localId, email: normalize(data.users[0].email) };
    }
    const msg = String((data.error && data.error.message) || "");
    if (!/API[_ ]KEY/i.test(msg)) { return null; }
  }
  return null;
}

/* 2. Verifye wòl la nan Firestore (roles/super_admins, roles/admins) */
async function readRole(idToken, docName) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles/${docName}`;
  const res = await fetch(url, { headers: { Authorization: "Bearer " + idToken } });
  if (!res.ok) { return []; }
  const data = await res.json().catch(() => ({}));
  const values = data.fields && data.fields.users && data.fields.users.arrayValue && data.fields.users.arrayValue.values;
  return (values || []).map((v) => normalize(v.stringValue));
}

async function isAdmin(idToken, user) {
  if (user.email === ROOT_SUPER_ADMIN) { return true; }
  for (const docName of ["super_admins", "admins"]) {
    const users = await readRole(idToken, docName);
    if (users.includes(user.email) || users.includes(normalize(user.uid))) { return true; }
  }
  return false;
}

/* 3. Poze Gemini kesyon an */
async function askGemini(history) {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: history,
      generationConfig: { temperature: 0.6, maxOutputTokens: 1500 }
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data.error && data.error.message) || ("HTTP " + res.status);
    throw new Error("Gemini: " + msg);
  }
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  const text = (parts || []).map((p) => p.text || "").join("").trim();
  return text || "Mwen pa jwenn repons pou kesyon sa a. Eseye poze l yon lòt jan.";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") { return json(405, { error: "Metòd pa otorize." }); }
  if (!process.env.GEMINI_API_KEY) {
    return json(500, { error: "GEMINI_API_KEY poko mete nan Environment variables Netlify yo." });
  }

  const auth = event.headers.authorization || event.headers.Authorization || "";
  const idToken = auth.replace(/^Bearer\s+/i, "").trim();
  if (!idToken) { return json(401, { error: "Ou dwe konekte." }); }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "Demann lan pa valab." }); }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const history = messages
    .filter((m) => m && (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, 4000) }] }));
  if (!history.length || history[history.length - 1].role !== "user") {
    return json(400, { error: "Pa gen kesyon." });
  }

  try {
    const user = await verifyUser(idToken);
    if (!user) { return json(401, { error: "Sesyon ou fini. Konekte ankò." }); }
    if (!(await isAdmin(idToken, user))) { return json(403, { error: "Aksè refize: sèlman Super Admin ak Admin." }); }

    const reply = await askGemini(history);
    return json(200, { reply });
  } catch (error) {
    console.error(error);
    return json(502, { error: String(error.message || error) });
  }
};
