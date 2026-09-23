// bss-guard.js
// BSS1815 PRO-MAX DMP — Gad Firebase pou modil yo
// Sèlman SUPER ADMIN ak ADMIN ka wè yon paj ki chaje fichye sa a.
//
// KIJAN POU ITILIZE L: mete 2 liy sa yo anlè nan <head> chak paj modil
// (touswit apre <meta charset="UTF-8">):
//
//   <style id="bss-guard-hide">body{visibility:hidden}</style>
//   <script type="module" src="./bss-guard.js"></script>

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ===== KONFIG FIREBASE =====
   Menm konfig ak paj Super Admin nan (pwojè briyant-soley-signo-1815).
   Menm kle ak admin-login.html. */
const BASE_CONFIG = {
  authDomain: "briyant-soley-signo-1815.firebaseapp.com",
  projectId: "briyant-soley-signo-1815",
  storageBucket: "briyant-soley-signo-1815.firebasestorage.app",
  messagingSenderId: "873317957685",
  appId: "1:873317957685:web:1bb4bb30831a058399717c"
};

const API_KEY = "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY";

/* Super Admin prensipal la toujou gen aksè */
const ROOT_SUPER_ADMIN = "briyantsoleysigno1815@gmail.com";

const LOGIN_PAGE = "./admin-login.html";
const HOME_PAGE = "./index.html";

/* Dokiman Firestore ki gen UID Super Admin ak Admin yo */
const ROLE_DOCS = [
  ["roles", "super_admins"],
  ["roles", "admins"]
];

/* ===== TÈKS NAN 3 LANG ===== */
const TEXT = {
  ht: {
    checking: "Ap verifye aksè ou...",
    loginTitle: "🔐 ZÒN PRIVE",
    loginText: "Paj sa a rezève pou Super Admin ak Admin. Konekte ak kont ou pou w kontinye.",
    deniedTitle: "⛔ AKSÈ REFIZE",
    deniedText: "Kont ou a pa gen dwa Admin oswa Super Admin pou modil sa a.",
    errorTitle: "⚠ PWOBLÈM KONEKSYON",
    errorText: "Nou pa ka verifye aksè ou kounye a. Tcheke entènèt ou epi eseye ankò.",
    login: "🔐 KONEKTE",
    home: "🏠 AKÈY",
    logout: "↩ DEKONEKTE",
    retry: "↻ ESEYE ANKÒ"
  },
  fr: {
    checking: "Vérification de votre accès...",
    loginTitle: "🔐 ZONE PRIVÉE",
    loginText: "Cette page est réservée aux Super Admins et Admins. Connectez-vous pour continuer.",
    deniedTitle: "⛔ ACCÈS REFUSÉ",
    deniedText: "Votre compte n’a pas les droits Admin ou Super Admin pour ce module.",
    errorTitle: "⚠ PROBLÈME DE CONNEXION",
    errorText: "Impossible de vérifier votre accès pour le moment. Vérifiez votre connexion et réessayez.",
    login: "🔐 SE CONNECTER",
    home: "🏠 ACCUEIL",
    logout: "↩ SE DÉCONNECTER",
    retry: "↻ RÉESSAYER"
  },
  en: {
    checking: "Checking your access...",
    loginTitle: "🔐 PRIVATE AREA",
    loginText: "This page is reserved for Super Admins and Admins. Sign in to continue.",
    deniedTitle: "⛔ ACCESS DENIED",
    deniedText: "Your account does not have Admin or Super Admin rights for this module.",
    errorTitle: "⚠ CONNECTION PROBLEM",
    errorText: "We can’t verify your access right now. Check your connection and try again.",
    login: "🔐 SIGN IN",
    home: "🏠 HOME",
    logout: "↩ SIGN OUT",
    retry: "↻ TRY AGAIN"
  }
};

let lang = "ht";
try { lang = localStorage.getItem("bss1815-language") || "ht"; } catch (e) {}
if (!TEXT[lang]) { lang = "ht"; }
const T = TEXT[lang];

/* ===== EKRAN GAD LA ===== */
function makeScreen() {
  let box = document.getElementById("bss-guard-screen");
  if (box) { return box; }
  box = document.createElement("div");
  box.id = "bss-guard-screen";
  box.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;" +
    "justify-content:center;padding:24px;visibility:visible;" +
    "background:radial-gradient(circle at top,rgba(255,121,0,.18),transparent 55%),#000;" +
    "font-family:Arial,Helvetica,sans-serif;color:#ffc589;text-align:center;";
  document.documentElement.appendChild(box);
  return box;
}

function button(label, onClick, primary) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.style.cssText =
    "margin:6px;min-height:48px;padding:12px 22px;border:2px solid #ff7900;border-radius:999px;" +
    "font-weight:900;font-size:.8rem;cursor:pointer;" +
    (primary ? "background:#ff7900;color:#000;" : "background:#000;color:#ff7900;");
  b.addEventListener("click", onClick);
  return b;
}

function show(title, text, buttons) {
  const box = makeScreen();
  box.innerHTML = "";
  const card = document.createElement("div");
  card.style.cssText =
    "max-width:460px;width:100%;padding:34px 24px;border:2px solid #ff7900;border-radius:24px;" +
    "background:#050200;box-shadow:0 0 22px rgba(255,121,0,.6);";
  const h = document.createElement("h2");
  h.textContent = title;
  h.style.cssText = "color:#ff7900;font-size:1.5rem;margin:0 0 12px;";
  const p = document.createElement("p");
  p.textContent = text;
  p.style.cssText = "line-height:1.6;margin:0 0 18px;";
  card.appendChild(h);
  card.appendChild(p);
  (buttons || []).forEach(function (b) { card.appendChild(b); });
  box.appendChild(card);
}

function goLogin() {
  const next = encodeURIComponent(location.pathname + location.search + location.hash);
  location.href = LOGIN_PAGE + "?next=" + next;
}

function goHome() {
  location.href = HOME_PAGE;
}

function reveal() {
  const hide = document.getElementById("bss-guard-hide");
  if (hide) { hide.remove(); }
  document.body && (document.body.style.visibility = "visible");
  const box = document.getElementById("bss-guard-screen");
  if (box) { box.remove(); }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

/* Dokiman wòl yo gen yon lis "users" ak imèl oswa UID */
function docHasUser(data, user) {
  if (!data) { return false; }
  if (data[user.uid] === true) { return true; }
  const email = normalize(user.email);
  return Object.keys(data).some(function (key) {
    const value = data[key];
    if (!Array.isArray(value)) { return false; }
    return value.some(function (item) {
      const v = normalize(item);
      return v === normalize(user.uid) || (email && v === email);
    });
  });
}

async function isAdmin(db, user) {
  if (normalize(user.email) === ROOT_SUPER_ADMIN) { return true; }
  for (const path of ROLE_DOCS) {
    const snap = await getDoc(doc(db, path[0], path[1]));
    if (snap.exists() && docHasUser(snap.data(), user)) {
      return true;
    }
  }
  return false;
}

/* ===== KÒMANSE ===== */
show(T.checking, "", []);

const timer = setTimeout(function () {
  show(T.errorTitle, T.errorText, [
    button(T.retry, function () { location.reload(); }, true),
    button(T.home, goHome, false)
  ]);
}, 15000);

/* Yon sèl aplikasyon Firebase, sou non pa defo a ([DEFAULT]),
   menm jan ak admin-login.html, pou n jwenn menm sesyon an */
async function findSignedIn() {
  const app = getApps().length
    ? getApps()[0]
    : initializeApp(Object.assign({}, BASE_CONFIG, { apiKey: API_KEY }));
  const auth = getAuth(app);
  await auth.authStateReady();
  return auth.currentUser ? { app: app, auth: auth, user: auth.currentUser } : null;
}

(async function () {
  let found = null;
  try {
    found = await findSignedIn();
  } catch (e) {
    console.error("bss-guard:", e);
  }

  if (!found) {
    clearTimeout(timer);
    show(T.loginTitle, T.loginText, [
      button(T.login, goLogin, true),
      button(T.home, goHome, false)
    ]);
    return;
  }

  const auth = found.auth;
  const user = found.user;
  const db = getFirestore(found.app);

  try {
    const allowed = await isAdmin(db, user);
    clearTimeout(timer);

    if (allowed) {
      window.BSS_ADMIN_USER = user;
      reveal();
      document.dispatchEvent(new CustomEvent("bss-admin-ready", { detail: user }));
    } else {
      show(T.deniedTitle, T.deniedText + " (" + (user.email || user.uid) + ")", [
        button(T.logout, function () { signOut(auth).then(goLogin); }, true),
        button(T.home, goHome, false)
      ]);
    }
  } catch (error) {
    clearTimeout(timer);
    console.error("bss-guard:", error);
    show(T.errorTitle, T.errorText, [
      button(T.retry, function () { location.reload(); }, true),
      button(T.home, goHome, false)
    ]);
  }
})();
