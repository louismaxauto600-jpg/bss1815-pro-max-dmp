// FILE: maximax-core.js
// =====================================================================
// MY MAXIMAX - fichye pataje: koneksyon Firebase, verifikasyon login,
// wòl admin, ak motè ki bati chak paj modil.
// Mete fichye sa a nan menm dosye ak dashboard la (rasin sit la).
// =====================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, writeBatch, onSnapshot, query, where, getCountFromServer,
  serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ---------------------------------------------------------------------
   FIREBASE
--------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY",
  authDomain: "briyant-soley-signo-1815.firebaseapp.com",
  projectId: "briyant-soley-signo-1815",
  storageBucket: "briyant-soley-signo-1815.firebasestorage.app",
  messagingSenderId: "873317957685",
  appId: "1:873317957685:web:1bb4bb30831a058399717c",
  measurementId: "G-QLDJNN876H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* ---------------------------------------------------------------------
   REGLAJ
   HOME_PAGE  = non fichye dashboard MY MAXIMAX la (chanje l si li diferan)
   LOGIN_PAGE = paj login admin la
--------------------------------------------------------------------- */
export const HOME_PAGE = "my-maximax.html";
export const LOGIN_PAGE = "admin-login.html";

// Wòl yo soti nan sistèm ki la deja: Firestore roles/super_admins ak
// roles/admins (chan "users" = lis UID). Pa gen lòt lis pou kenbe ajou.

/* Lis kolekson MY MAXIMAX yo (menm lis ak firestore.rules) */
export const COLLECTIONS = [
  {
    "id": "mx_members",
    "label": "Member Center",
    "page": "members.html",
    "access": "admin"
  },
  {
    "id": "mx_roster",
    "label": "Musician / Rara & Leadership",
    "page": "roster.html?type=musicians",
    "access": "admin"
  },
  {
    "id": "mx_attendance",
    "label": "Attendance",
    "page": "attendance.html",
    "access": "admin"
  },
  {
    "id": "mx_volunteers",
    "label": "Volunteer Center",
    "page": "volunteer.html",
    "access": "admin"
  },
  {
    "id": "mx_member_ids",
    "label": "Member ID",
    "page": "member-id.html",
    "access": "admin"
  },
  {
    "id": "mx_disciplinary",
    "label": "Sistèm Disiplinè",
    "page": "disciplinary.html",
    "access": "super"
  },
  {
    "id": "mx_kazye",
    "label": "Kazye Sansib",
    "page": "kazye.html",
    "access": "super"
  },
  {
    "id": "mx_audit_logs",
    "label": "Audit Center",
    "page": "audit-center.html",
    "access": "super",
    "restore": false
  },
  {
    "id": "mx_badges",
    "label": "Badge & Access",
    "page": "badge-access.html",
    "access": "admin"
  },
  {
    "id": "mx_elections",
    "label": "Election Center",
    "page": "election.html",
    "access": "super"
  },
  {
    "id": "mx_messages",
    "label": "Message Center",
    "page": "messages.html",
    "access": "admin"
  },
  {
    "id": "mx_communications",
    "label": "Communication Center",
    "page": "communication-center.html",
    "access": "admin"
  },
  {
    "id": "mx_whatsapp",
    "label": "WhatsApp Center",
    "page": "whatsapp-center.html",
    "access": "admin"
  },
  {
    "id": "mx_documents",
    "label": "Document Center",
    "page": "document-center.html",
    "access": "admin"
  },
  {
    "id": "mx_registry",
    "label": "Digital Registry",
    "page": "digital-registry.html",
    "access": "admin"
  },
  {
    "id": "mx_certificates",
    "label": "Certificate Center",
    "page": "certificate-center.html",
    "access": "admin"
  },
  {
    "id": "mx_flyers",
    "label": "Flyer Studio",
    "page": "flyer-studio.html",
    "access": "admin"
  },
  {
    "id": "mx_finance",
    "label": "Finance / Treasury",
    "page": "finance.html",
    "access": "super"
  },
  {
    "id": "mx_donations",
    "label": "Donation Center",
    "page": "donation.html",
    "access": "super"
  },
  {
    "id": "mx_events",
    "label": "Event Center",
    "page": "event-center.html",
    "access": "admin"
  },
  {
    "id": "mx_tasks",
    "label": "Task / Project",
    "page": "task-project.html",
    "access": "admin"
  },
  {
    "id": "mx_ai_notes",
    "label": "AI Center",
    "page": "ai-center.html",
    "access": "admin"
  },
  {
    "id": "mx_qr_codes",
    "label": "QR Code Center",
    "page": "qr-code.html",
    "access": "admin"
  },
  {
    "id": "mx_integrations",
    "label": "API / Integration",
    "page": "api-integration.html",
    "access": "super"
  },
  {
    "id": "mx_cms_pages",
    "label": "CMS / Website",
    "page": "cms-manager.html",
    "access": "admin"
  }
];

/* ---------------------------------------------------------------------
   ZOUTI
--------------------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

function safeUrl(v) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : "";
  } catch (e) {
    return "";
  }
}

function toast(message, kind = "ok") {
  const t = document.createElement("div");
  t.className = "mx-toast " + kind;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4200);
}

function fmtDate(ts) {
  const d = ts && typeof ts.toDate === "function" ? ts.toDate() : null;
  return d ? d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "";
}

function explain(err) {
  if (err && err.code === "permission-denied") {
    return "Firestore refize aksè a. Verifye ke firestore.rules (ak règ MY MAXIMAX yo) piblye, epi ke ou konekte ak yon kont admin.";
  }
  return (err && err.message) || String(err);
}

/* ---------------------------------------------------------------------
   LOGIN + WÒL
--------------------------------------------------------------------- */
async function getRole(user) {
  const inList = async (docId) => {
    try {
      const snap = await getDoc(doc(db, "roles", docId));
      const users = snap.exists() ? snap.data().users : null;
      return Array.isArray(users) && users.includes(user.uid);
    } catch (e) {
      console.warn("MY MAXIMAX: pa ka li roles/" + docId, e);
      return false;
    }
  };
  if (await inList("super_admins")) return "super";
  if (await inList("admins")) return "admin";
  return null;
}

function requireLogin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        location.replace(LOGIN_PAGE);
        return;
      }
      resolve({ user, role: await getRole(user) });
    });
  });
}

async function logAudit(user, action, cfg, detail) {
  try {
    await addDoc(collection(db, "mx_audit_logs"), {
      action,
      module: cfg.title,
      detail: detail || "",
      by: user.email || user.uid,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("MY MAXIMAX: audit pa sove", e);
  }
}

/* ---------------------------------------------------------------------
   KAD PAJ LA (topbar, hero, footer)
--------------------------------------------------------------------- */
function buildShell(cfg, user) {
  document.title = cfg.title + " | MY MAXIMAX";
  $("#app").innerHTML = `
  <header class="topbar">
    <div class="brand">
      <img src="logo.jpg" alt="BSS1815" class="logo" onerror="this.style.display='none'">
      <div class="brand-text">
        <strong>BSS1815 PRO-MAX DMP</strong>
        <span>MY MAXIMAX CONTROL CENTER</span>
      </div>
    </div>
    <div class="top-actions">
      <span class="user">${esc(user.email || "")}</span>
      <a class="top-btn" href="${HOME_PAGE}">← MY MAXIMAX</a>
      <button class="top-btn" id="mxLogout" type="button">↪ Dekonekte</button>
    </div>
  </header>
  <main>
    <section class="hero compact">
      <div class="eyebrow">MY MAXIMAX</div>
      <h1>${esc(cfg.icon || "")} ${esc(cfg.title)}</h1>
      <p>${esc(cfg.desc || "")}</p>
    </section>
    <div id="mxBody"><p class="boot">Ap chaje…</p></div>
    <footer>
      <strong>BSS1815 PRO-MAX DMP</strong><br><br>
      MY MAXIMAX CONTROL CENTER
    </footer>
  </main>`;

  $("#mxLogout").addEventListener("click", async () => {
    if (!confirm("Ou vle dekonekte nan MY MAXIMAX?")) return;
    try { await signOut(auth); } finally { location.href = LOGIN_PAGE; }
  });
}

/* ---------------------------------------------------------------------
   POINT ANTRE
--------------------------------------------------------------------- */
export async function startModule(cfg) {
  const { user, role } = await requireLogin();
  buildShell(cfg, user);
  const body = $("#mxBody");

  const need = cfg.access || "admin";
  if (!role) {
    body.innerHTML = `<div class="notice err"><strong>Aksè refize.</strong> Kont ${esc(user.email || "")} pa nan lis admin yo (roles/admins oswa roles/super_admins). Mande yon Super Admin ajoute w.</div>`;
    return;
  }
  if (need === "super" && role !== "super") {
    body.innerHTML = `<div class="notice err"><strong>Aksè refize.</strong> Modil sa a rezève pou Super Admin.</div>`;
    return;
  }

  try {
    if (cfg.kind === "reports") return reportsView(cfg);
    if (cfg.kind === "backup") return backupView(cfg, user);
    return crudView(cfg, user);
  } catch (err) {
    body.innerHTML = `<div class="notice err">${esc(explain(err))}</div>`;
  }
}

/* ---------------------------------------------------------------------
   MODIL KONVANSYONÈL: fòm + lis an tan reyèl
--------------------------------------------------------------------- */
function fieldHtml(f) {
  const id = "f_" + f.key;
  const req = f.required ? "required" : "";
  const label = `<label for="${id}">${esc(f.label)}${f.required ? " *" : ""}</label>`;
  let input;
  if (f.type === "textarea") {
    input = `<textarea id="${id}" name="${f.key}" rows="3" ${req}></textarea>`;
  } else if (f.type === "select") {
    input = `<select id="${id}" name="${f.key}" ${req}>${f.options
      .map((o) => `<option value="${esc(o)}">${esc(o)}</option>`)
      .join("")}</select>`;
  } else {
    const step = f.type === "number" ? 'step="any"' : "";
    input = `<input id="${id}" name="${f.key}" type="${f.type || "text"}" ${step} ${req}>`;
  }
  return `<div class="field${f.wide || f.type === "textarea" ? " wide" : ""}">${label}${input}</div>`;
}

function valueHtml(f, v) {
  if (f && f.type === "url") {
    const u = safeUrl(v);
    return u
      ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(v)}</a>`
      : esc(v);
  }
  if (f && f.type === "number" && typeof v === "number") return v.toLocaleString("fr-FR");
  return esc(v);
}

function crudView(cfg, user) {
  const body = $("#mxBody");
  const readOnly = !!cfg.readOnly;
  const base = collection(db, cfg.collection);

  let typeVal = "";
  if (cfg.typeParam) {
    const keys = Object.keys(cfg.typeLabels);
    const asked = new URLSearchParams(location.search).get(cfg.typeParam);
    typeVal = keys.includes(asked) ? asked : keys[0];
  }

  const titleKey = cfg.titleField || cfg.fields[0].key;
  const shownKeys = cfg.columns || cfg.fields.map((f) => f.key).filter((k) => k !== titleKey);
  const fieldMap = Object.fromEntries(cfg.fields.map((f) => [f.key, f]));

  body.innerHTML = `
    ${cfg.note ? `<div class="notice">${esc(cfg.note)}</div>` : ""}
    ${cfg.typeLabels ? `<nav class="tabs">${Object.entries(cfg.typeLabels)
      .map(([k, l]) => `<a class="tab${k === typeVal ? " on" : ""}" href="?${cfg.typeParam}=${k}">${esc(l)}</a>`)
      .join("")}</nav>` : ""}
    ${readOnly ? "" : `
    <details class="panel" id="mxPanel">
      <summary id="mxSummary">＋ Ajoute yon nouvo anrejistreman</summary>
      <form id="mxForm" class="grid-form">
        ${cfg.fields.map(fieldHtml).join("")}
        <div class="form-actions">
          <button class="btn" type="submit" id="mxSave">Anrejistre</button>
          <button class="btn ghost" type="button" id="mxCancel" hidden>Anile</button>
        </div>
      </form>
    </details>`}
    <div class="toolbar">
      <input type="search" id="mxSearch" placeholder="Chèche nan lis la…">
      <span class="count" id="mxCount"></span>
    </div>
    <div id="mxSums"></div>
    <div id="mxList" class="rec-list"><p class="boot">Ap chaje done yo…</p></div>`;

  const form = $("#mxForm");
  const list = $("#mxList");
  const search = $("#mxSearch");
  let items = [];
  let editingId = null;

  function sums() {
    if (!cfg.sum) return "";
    const s = cfg.sum;
    const totals = {};
    for (const r of items) {
      const d = r.data;
      if (s.only && d[s.only.field] !== s.only.value) continue;
      const cur = d[s.group] || "-";
      let n = Number(d[s.field]) || 0;
      if (s.negative && d[s.negative.field] === s.negative.value) n = -n;
      totals[cur] = (totals[cur] || 0) + n;
    }
    const entries = Object.entries(totals);
    if (!entries.length) return "";
    return `<div class="chips"><span class="chip-label">${esc(s.label)}</span>${entries
      .map(([c, n]) => `<span class="chip">${esc(c)} ${n.toLocaleString("fr-FR")}</span>`)
      .join("")}</div>`;
  }

  function render() {
    const term = search.value.toLowerCase().trim();
    const rows = items.filter(
      (r) => !term || cfg.fields.map((f) => r.data[f.key] ?? "").join(" ").toLowerCase().includes(term)
    );
    $("#mxCount").textContent = rows.length + " / " + items.length;
    $("#mxSums").innerHTML = sums();

    if (!rows.length) {
      list.innerHTML = `<div class="empty">${
        items.length
          ? "Okenn rezilta pou rechèch sa a."
          : readOnly
            ? "Poko gen anrejistreman."
            : "Poko gen anrejistreman. Ajoute premye a ak fòm nan anlè."
      }</div>`;
      return;
    }

    list.innerHTML = rows.map((r) => {
      const d = r.data;
      const badge = cfg.badge && d[cfg.badge] ? `<span class="badge">${esc(d[cfg.badge])}</span>` : "";
      const lines = shownKeys
        .filter((k) => d[k] !== undefined && d[k] !== null && d[k] !== "")
        .map((k) => `<div><dt>${esc(fieldMap[k] ? fieldMap[k].label : k)}</dt><dd>${valueHtml(fieldMap[k], d[k])}</dd></div>`)
        .join("");
      const who = d.createdBy ? esc(d.createdBy) + " · " : "";
      const actions = readOnly ? "" : `
        <span class="rec-actions">
          <button class="mini" type="button" data-act="edit" data-id="${esc(r.id)}">Modifye</button>
          <button class="mini danger" type="button" data-act="del" data-id="${esc(r.id)}">Efase</button>
        </span>`;
      return `
      <article class="rec">
        <div class="rec-head"><h3>${esc(d[titleKey] || "(san non)")}</h3>${badge}</div>
        <dl>${lines}</dl>
        <div class="rec-foot"><span>${who}${esc(fmtDate(d.createdAt))}</span>${actions}</div>
      </article>`;
    }).join("");
  }

  function resetForm() {
    if (!form) return;
    form.reset();
    editingId = null;
    $("#mxSave").textContent = "Anrejistre";
    $("#mxCancel").hidden = true;
    $("#mxSummary").textContent = "＋ Ajoute yon nouvo anrejistreman";
  }

  /* Lekti an tan reyèl. Pa gen orderBy nan rekèt la, kidonk pa bezwen okenn endèks Firestore. */
  const q = cfg.typeParam ? query(base, where("type", "==", typeVal)) : base;
  onSnapshot(
    q,
    (snap) => {
      items = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
      const stamp = (x) => (x.data.createdAt && x.data.createdAt.toMillis ? x.data.createdAt.toMillis() : Date.now());
      items.sort((a, b) => stamp(b) - stamp(a));
      render();
    },
    (err) => {
      list.innerHTML = `<div class="notice err">${esc(explain(err))}</div>`;
    }
  );

  search.addEventListener("input", render);
  if (readOnly) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {};
    for (const f of cfg.fields) {
      let v = form.elements[f.key].value.trim();
      if (f.type === "number") v = v === "" ? null : Number(v);
      data[f.key] = v;
    }
    if (cfg.typeParam) data.type = typeVal;

    const saveBtn = $("#mxSave");
    saveBtn.disabled = true;
    try {
      if (editingId) {
        await updateDoc(doc(db, cfg.collection, editingId), {
          ...data, updatedAt: serverTimestamp(), updatedBy: user.email || user.uid
        });
        logAudit(user, "Mete ajou", cfg, data[titleKey]);
        toast("Mete ajou.");
      } else {
        await addDoc(base, { ...data, createdAt: serverTimestamp(), createdBy: user.email || user.uid });
        logAudit(user, "Anrejistre", cfg, data[titleKey]);
        toast("Anrejistre.");
      }
      resetForm();
    } catch (err) {
      toast(explain(err), "err");
    } finally {
      saveBtn.disabled = false;
    }
  });

  $("#mxCancel").addEventListener("click", resetForm);

  list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const item = items.find((r) => r.id === btn.dataset.id);
    if (!item) return;

    if (btn.dataset.act === "edit") {
      for (const f of cfg.fields) form.elements[f.key].value = item.data[f.key] ?? "";
      editingId = item.id;
      $("#mxSave").textContent = "Mete ajou";
      $("#mxCancel").hidden = false;
      $("#mxSummary").textContent = "✎ Ap modifye: " + (item.data[titleKey] || "");
      $("#mxPanel").open = true;
      $("#mxPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (btn.dataset.act === "del") {
      if (!confirm("Efase \"" + (item.data[titleKey] || "anrejistreman sa a") + "\"? Aksyon sa a pa ka defèt.")) return;
      try {
        await deleteDoc(doc(db, cfg.collection, item.id));
        logAudit(user, "Efase", cfg, item.data[titleKey]);
        toast("Efase.");
        if (editingId === item.id) resetForm();
      } catch (err) {
        toast(explain(err), "err");
      }
    }
  });
}

/* ---------------------------------------------------------------------
   REPORTS & ANALYTICS: kantite dokiman nan chak modil
--------------------------------------------------------------------- */
async function reportsView() {
  const body = $("#mxBody");
  body.innerHTML = `
    <div class="notice">Kantite anrejistreman nan chak modil. Modil ki rezève pou Super Admin ka montre "-" si kont ou se yon admin nòmal.</div>
    <div class="stats" id="mxStats">${COLLECTIONS.map((c) => `
      <a class="stat" href="${esc(c.page)}">
        <span class="stat-num" data-col="${esc(c.id)}">…</span>
        <span class="stat-label">${esc(c.label)}</span>
      </a>`).join("")}
    </div>`;

  await Promise.all(COLLECTIONS.map(async (c) => {
    const el = body.querySelector(`[data-col="${c.id}"]`);
    try {
      const snap = await getCountFromServer(collection(db, c.id));
      el.textContent = snap.data().count.toLocaleString("fr-FR");
    } catch (err) {
      el.textContent = "-";
      el.title = explain(err);
    }
  }));
}

/* ---------------------------------------------------------------------
   BACKUP & RESTORE (Super Admin sèlman)
--------------------------------------------------------------------- */
function ser(v) {
  if (v instanceof Timestamp) return { __ts: v.toMillis() };
  if (Array.isArray(v)) return v.map(ser);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, ser(x)]));
  return v;
}

function deser(v) {
  if (Array.isArray(v)) return v.map(deser);
  if (v && typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length === 1 && keys[0] === "__ts" && typeof v.__ts === "number") return Timestamp.fromMillis(v.__ts);
    return Object.fromEntries(keys.map((k) => [k, deser(v[k])]));
  }
  return v;
}

function backupView(cfg, user) {
  const body = $("#mxBody");
  body.innerHTML = `
    <div class="notice">Sovgad la kopye tout kolekson MY MAXIMAX yo nan yon fichye JSON. Restorasyon an mete ajou dokiman ki gen menm idantifyan yo epi ajoute lòt yo; li pa efase anyen. Jounal odit la pa restore.</div>
    <div class="panel-static">
      <h3>Sovgad</h3>
      <p>Telechaje yon kopi tout done MY MAXIMAX yo.</p>
      <button class="btn" type="button" id="mxExport">Telechaje sovgad la</button>
      <p class="hint" id="mxExportMsg"></p>
    </div>
    <div class="panel-static">
      <h3>Restorasyon</h3>
      <p>Chwazi yon fichye sovgad (.json) ki soti isit la.</p>
      <input type="file" id="mxFile" accept="application/json,.json">
      <p class="hint" id="mxRestoreMsg"></p>
    </div>`;

  $("#mxExport").addEventListener("click", async () => {
    const btn = $("#mxExport");
    const msg = $("#mxExportMsg");
    btn.disabled = true;
    msg.textContent = "Ap kopye…";
    const out = { app: "MY MAXIMAX", version: 1, exportedAt: new Date().toISOString(), collections: {} };
    const failed = [];
    for (const c of COLLECTIONS) {
      try {
        const snap = await getDocs(collection(db, c.id));
        out.collections[c.id] = snap.docs.map((d) => ({ id: d.id, data: ser(d.data()) }));
      } catch (err) {
        failed.push(c.id);
      }
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "maximax-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    const total = Object.values(out.collections).reduce((n, arr) => n + arr.length, 0);
    msg.textContent = total + " dokiman kopye." + (failed.length ? " Pa ka li: " + failed.join(", ") + "." : "");
    logAudit(user, "Sovgad", cfg, total + " dokiman");
    btn.disabled = false;
  });

  $("#mxFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const msg = $("#mxRestoreMsg");
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || parsed.app !== "MY MAXIMAX" || typeof parsed.collections !== "object") {
        throw new Error("Fichye sa a pa yon sovgad MY MAXIMAX.");
      }
      const allowed = new Set(COLLECTIONS.filter((c) => c.restore !== false).map((c) => c.id));
      const plan = [];
      for (const [colId, docs] of Object.entries(parsed.collections)) {
        if (!allowed.has(colId) || !Array.isArray(docs)) continue;
        for (const d of docs) {
          if (d && typeof d.id === "string" && d.id && !d.id.includes("/") && d.data && typeof d.data === "object") {
            plan.push({ colId, id: d.id, data: deser(d.data) });
          }
        }
      }
      if (!plan.length) throw new Error("Pa gen dokiman valid pou restore nan fichye sa a.");
      if (!confirm("Restore " + plan.length + " dokiman? Sa ap mete ajou dokiman ki gen menm idantifyan yo.")) {
        e.target.value = "";
        return;
      }
      msg.textContent = "Ap restore…";
      // Ti pakè 10: Firestore limite kantite verifikasyon règ pa pakè.
      for (let i = 0; i < plan.length; i += 10) {
        const batch = writeBatch(db);
        plan.slice(i, i + 10).forEach((p) => batch.set(doc(db, p.colId, p.id), p.data, { merge: true }));
        await batch.commit();
      }
      msg.textContent = plan.length + " dokiman restore.";
      logAudit(user, "Restorasyon", cfg, plan.length + " dokiman");
      toast("Restore fini.");
    } catch (err) {
      msg.textContent = explain(err);
      toast(explain(err), "err");
    }
    e.target.value = "";
  });
}
