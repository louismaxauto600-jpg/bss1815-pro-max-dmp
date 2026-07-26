// =====================================================
// BSS1815 PRO-MAX-DMP
// EXISTING FIREBASE CONNECTION
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js";

// =====================================================
// EXISTING FIREBASE PROJECT
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyDCto1oqxOZ6nNtGRd_xu3x6GGwkmDgmjY",
  authDomain: "pro-maxfm.firebaseapp.com",
  projectId: "pro-maxfm",
  storageBucket: "pro-maxfm.firebasestorage.app",
  messagingSenderId: "1142157859255",
  appId: "1:1142157859255:web:2192af6e816d28e03f0032",
  measurementId: "G-PY7MDQ2WY3"
};

// =====================================================
// INITIALIZE EXISTING FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

// =====================================================
// FIREBASE SERVICES
// =====================================================

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const messaging = getMessaging(app);

// =====================================================
// EXPORT FIREBASE SERVICES
// =====================================================

export {
  app,
  analytics,
  auth,
  db,
  storage,
  functions,
  messaging
};

console.log(
  "BSS1815 PRO-MAX-DMP connected to Firebase:",
  firebaseConfig.projectId
);
