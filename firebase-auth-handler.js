// FILE: firebase-auth-handler.js
// Konekte login.html ak Firebase Authentication.
// Fichye sa a defini window.PRO_MAX_ADMIN_LOGIN — fonksyon
// login.html deja pare pou rele l lè yon moun soumèt fòm login la.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY",
  authDomain: "briyant-soley-signo-1815.firebaseapp.com",
  projectId: "briyant-soley-signo-1815",
  storageBucket: "briyant-soley-signo-1815.firebasestorage.app",
  messagingSenderId: "873317957685",
  appId: "1:873317957685:web:845a119f5d63f8c799717c",
  measurementId: "G-Y3JGKNY43S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// login.html rele fonksyon sa a lè fòm nan soumèt.
// Si l reyisi, login.html otomatikman redireksyone sou admin-dashboard.html.
// Si l echwe, li voye yon erè ki afiche nan status-box la.
window.PRO_MAX_ADMIN_LOGIN = async function (email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  // Konekte reyisi — login.html ap jere redireksyon an.
};
