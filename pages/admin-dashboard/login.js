// FILE: login.js
// Konekte fòm Admin Dashboard (Email / Password / Connect) ak Firebase Authentication.

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
  apiKey: "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY",
  authDomain: "briyant-soley-signo-1815.firebaseapp.com",
  projectId: "briyant-soley-signo-1815",
  storageBucket: "briyant-soley-signo-1815.firebasestorage.app",
  messagingSenderId: "873317957685",
  appId: "1:873317957685:web:1bb4bb30831a058399717c",
  measurementId: "G-C7ZGMHGJ22"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");

async function isInRoleList(roleDocId, uid) {
  const snap = await getDoc(doc(db, "roles", roleDocId));
  if (!snap.exists()) return false;
  const users = snap.data().users || [];
  return users.includes(uid);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    const isSuper = await isInRoleList("super_admins", uid);
    const isAdmin = isSuper ? false : await isInRoleList("admins", uid);

    if (!isSuper && !isAdmin) {
      errorMsg.textContent = "Kont sa a pa gen aksè administratif.";
      await auth.signOut();
      return;
    }

    // Konekte reyisi — voye sou dashboard la
    window.location.href = "roster.html?type=musicians";

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Imèl oswa modpas pa kòrèk.";
  }
});
