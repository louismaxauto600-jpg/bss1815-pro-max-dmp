// =====================================================
// BSS1815 PRO-MAX-DMP → FIREBASE CONNECTION
// =====================================================

import {
  app,
  auth,
  db,
  storage,
  functions,
  messaging
} from "./firebase-config.js";

// =====================================================
// CONNECTION CHECK
// =====================================================

try {

  if (!app) {
    throw new Error("Firebase App pa disponib.");
  }

  console.log(
    "✅ BSS1815 PRO-MAX-DMP CONNECTED TO FIREBASE"
  );

  console.log(
    "Firebase Project:",
    app.options.projectId
  );

  // Make existing Firebase services available
  // across BSS1815 PRO-MAX-DMP modules.

  window.BSS1815_FIREBASE = {
    app,
    auth,
    db,
    storage,
    functions,
    messaging
  };

  window.dispatchEvent(
    new CustomEvent(
      "bss1815-firebase-ready",
      {
        detail: {
          connected: true,
          projectId: app.options.projectId
        }
      }
    )
  );

} catch (error) {

  console.error(
    "❌ BSS1815 PRO-MAX-DMP FIREBASE CONNECTION ERROR:",
    error
  );

}
