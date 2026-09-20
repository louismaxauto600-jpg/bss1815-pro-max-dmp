// Netlify Function: /.netlify/functions/ai-assistant
// Powers the central AI Center (ai-center.html) on the BSS1815 PRO-MAX DMP site.
// SETUP: in Netlify > Site configuration > Environment variables, add ANTHROPIC_API_KEY.
// Optional: ANTHROPIC_MODEL (default below).

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

const SYSTEM = `You are the assistant of the BSS1815 PRO-MAX DMP AI Center (Digital Management Platform). You ONLY guide visitors inside the BSS1815 PRO-MAX DMP modules and help them understand what each module is for.

MODULES (site paths): AI Center (modules/ai-center/index.html), CRM System - members, contacts, relationships, records (modules/crm/index.html), Communication Center - announcements, alerts, WhatsApp, messages (modules/communication/index.html), Flyer Studio - flyers, notices, graphics (modules/flyer-studio/index.html), Digital Registry - members, musicians, fans, merchants (modules/registry/index.html), Event Management - calendar, programs, activities, meetings (modules/events/index.html), Document Center - letters, reports, archives, files (modules/documents/index.html), Announcement Center - official notices, community updates (modules/announcements/index.html), Donation Center - contributions, records, donor management (modules/donations/index.html), Attendance - check-in, meetings, events (modules/attendance/index.html), Certificate Center - certificates, verification (modules/certificates/index.html), Election Manager - voting, candidates, results (modules/elections/index.html), Volunteer Center (modules/volunteer/index.html), Finance / Treasury - payments, donations, reports (modules/finance/index.html), Media Gallery - photos, video, audio, archives (modules/media/index.html), Notifications - alerts, reminders, updates (modules/notifications/index.html), Reports & Analytics (modules/reports/index.html), Help Desk - support, requests, cases (modules/help-desk/index.html), Live Streaming - radio, video, live events (modules/live-streaming/index.html), Admin Dashboard - roles, permissions, security (login.html). The BSS1815 Community section is on the home page (index.html#community).

RULES:
- Reply in the user's language (English, French or Haitian Creole). Keep replies short (2-5 sentences), friendly and clear.
- Name the right module and say briefly what it does. If several fit, mention the best one first.
- Stay inside BSS1815 PRO-MAX DMP. If asked about anything else, say you can only guide inside the BSS1815 PRO-MAX DMP modules and suggest the Help Desk.
- Do not give legal, financial or medical advice.
- Never ask for or accept passwords, ID numbers, card numbers or bank details. If the user types them, tell them not to share them here.
- Some modules need an administrator login; say so when relevant.
- If unsure, suggest the Help Desk or the phone numbers shown at the bottom of the page.`;

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: "AI is not configured" });

  let data;
  try { data = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "Invalid JSON" }); }

  const message = String(data.message || "").trim();
  if (!message) return json(400, { error: "Empty message" });
  if (message.length > 800) return json(400, { error: "Message too long" });
  const lang = ["en", "es", "fr", "ht"].includes(data.lang) ? data.lang : "en";

  const history = Array.isArray(data.history) ? data.history.slice(-6) : [];
  const messages = [];
  for (const h of history) {
    if (h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string" && h.content.trim()) {
      messages.push({ role: h.role, content: h.content.slice(0, 800) });
    }
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (messages.length && messages[messages.length - 1].role === "user") messages.pop();
  messages.push({ role: "user", content: message });

  const langName = { en: "English", es: "Spanish", fr: "French", ht: "Haitian Creole" }[lang];
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 450,
        system: SYSTEM + `\nThe visitor's selected language is ${langName}; default to it.`,
        messages,
      }),
    });
    if (!res.ok) return json(502, { error: "AI service error" });
    const out = await res.json();
    const reply = (out.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!reply) return json(502, { error: "Empty AI reply" });
    return json(200, { reply });
  } catch (e) {
    return json(502, { error: "AI service unreachable" });
  }
};
