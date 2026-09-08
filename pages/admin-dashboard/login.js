// FILE: login.js
// Konekte fòm Super Admin / Admin ak Firebase Authentication,
// epi verifye wòl itilizatè a nan Firestore:
//   roles/super_admins  -> chan "users" (array de UID)
//   roles/admins        -> chan "users" (array de UID)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCto1oqxOZ6nNtGRd_xu3x6GGwkmDgmjY",
  authDomain: "pro-maxfm.firebaseapp.com",
  projectId: "pro-maxfm",
  storageBucket: "pro-maxfm.firebasestorage.app",
  messagingSenderId: "1142157859255",
  appId: "1:1142157859255:web:2192af6e816d28e03f0032",
  measurementId: "G-PY7MDQ2WY3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const errorMsg = document.getElementById("errorMsg");

// ---------- Chanjman ant Super Admin / Admin ----------
const btnSuper = document.getElementById("btnSuper");
const btnAdmin = document.getElementById("btnAdmin");
const panelSuper = document.getElementById("panelSuper");
const panelAdmin = document.getElementById("panelAdmin");

btnSuper.addEventListener("click", () => {
  btnSuper.classList.add("active");
  btnAdmin.classList.remove("active");
  panelSuper.classList.add("active");
  panelAdmin.classList.remove("active");
  errorMsg.textContent = "";
});

btnAdmin.addEventListener("click", () => {
  btnAdmin.classList.add("active");
  btnSuper.classList.remove("active");
  panelAdmin.classList.add("active");
  panelSuper.classList.remove("active");
  errorMsg.textContent = "";
});

// ---------- Verifye si UID nan lis "users" yon dokiman wòl ----------
async function isInRoleList(roleDocId, uid) {
  const snap = await getDoc(doc(db, "roles", roleDocId));
  if (!snap.exists()) return false;
  const users = snap.data().users || [];
  return users.includes(uid);
}

// ---------- Fonksyon jenerik pou konekte ----------
async function tryLogin(email, password, requiredRole) {
  errorMsg.textContent = "";
  try {
    // 1. Konekte ak Firebase Authentication
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 2. Verifye si UID a nan bon lis wòl la
    const roleDocId = requiredRole === "superadmin" ? "super_admins" : "admins";
    const authorized = await isInRoleList(roleDocId, uid);

    if (!authorized) {
      // Tcheke si li ta pi byen antre nan lòt bouton an
      const otherRoleDocId = requiredRole === "superadmin" ? "admins" : "super_admins";
      const inOtherList = await isInRoleList(otherRoleDocId, uid);

      if (inOtherList) {
        errorMsg.textContent =
          requiredRole === "superadmin"
            ? "Kont sa a se yon Admin — pa Super Admin. Klike bouton ADMIN an."
            : "Kont sa a se yon Super Admin — pa Admin. Klike bouton SUPER ADMIN an.";
      } else {
        errorMsg.textContent = "Kont sa a pa gen aksè administratif.";
      }
      await auth.signOut();
      return;
    }

    // 3. Siksè — redireksyone sou dashboard apwopriye a
    if (requiredRole === "superadmin") {
      window.location.href = "super-admin-dashboard.html";
    } else {
      window.location.href = "admin-dashboard-panel.html";
    }

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Imèl oswa modpas pa kòrèk.";
  }
}

// ---------- Fòm Super Admin ----------
document.getElementById("superAdminForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("superEmail").value.trim();
  const password = document.getElementById("superPassword").value;
  tryLogin(email, password, "superadmin");
});

// ---------- Fòm Admin ----------
document.getElementById("adminForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  tryLogin(email, password, "admin");
});
