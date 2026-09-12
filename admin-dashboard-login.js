/*
  BSS1815 PRO-MAX DMP
  ADMIN DASHBOARD LOGIN
  FICHYE: admin-dashboard-login.js
*/

(async function () {
  "use strict";

  const firebaseAppModule = await import(
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js"
  );

  const firebaseAuthModule = await import(
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js"
  );

  const {
    initializeApp,
    getApps,
    getApp
  } = firebaseAppModule;

  const {
    getAuth,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    signOut
  } = firebaseAuthModule;

  const firebaseConfig = {
    apiKey:
      "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY",

    authDomain:
      "briyant-soley-signo-1815.firebaseapp.com",

    projectId:
      "briyant-soley-signo-1815",

    storageBucket:
      "briyant-soley-signo-1815.firebasestorage.app",

    messagingSenderId:
      "873317957685",

    appId:
      "1:873317957685:web:1bb4bb30831a058399717c",

    measurementId:
      "G-QLDJNN876H"
  };

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp(firebaseConfig);

  const auth = getAuth(app);

  /*
    SUPER ADMIN OFISYÈL:
    MAX LOUIS
  */

  const SUPER_ADMIN_EMAIL =
    "briyantsoleysigno1815@gmail.com";

  const SUPER_ADMIN_UID =
    "I7n4gtwXAtMVe3YOjEMm1h7DJ3B3";

  const DASHBOARD_URL =
    "./admin-dashboard.html";

  function findElement(selectors) {
    for (const selector of selectors) {
      const element =
        document.querySelector(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function getLoginElements() {
    const form = findElement([
      "#loginForm",
      "#adminLoginForm",
      "#admin-login-form",
      ".login-form",
      "form"
    ]);

    const emailInput = findElement([
      "#email",
      "#adminEmail",
      "#loginEmail",
      'input[name="email"]',
      'input[type="email"]'
    ]);

    const passwordInput = findElement([
      "#password",
      "#adminPassword",
      "#loginPassword",
      'input[name="password"]',
      'input[type="password"]'
    ]);

    const loginButton = findElement([
      "#loginButton",
      "#connectButton",
      "#submitButton",
      'button[type="submit"]',
      ".login-button"
    ]);

    const message = findElement([
      "#message",
      "#loginMessage",
      "#errorMessage",
      "#loginError",
      ".login-message",
      ".error-message",
      '[role="alert"]'
    ]);

    return {
      form,
      emailInput,
      passwordInput,
      loginButton,
      message
    };
  }

  function showMessage(
    messageElement,
    text,
    type = "error"
  ) {
    if (!messageElement) {
      if (type === "error") {
        console.error(text);
      }

      return;
    }

    messageElement.textContent = text;
    messageElement.style.display = "block";

    if (type === "success") {
      messageElement.style.color = "#45d483";
    } else {
      messageElement.style.color = "#ff6b6b";
    }
  }

  function clearMessage(messageElement) {
    if (!messageElement) {
      return;
    }

    messageElement.textContent = "";
    messageElement.style.display = "none";
  }

  function clearOldAccess() {
    const keys = [
      "bss1815Role",
      "bss1815Email",
      "bss1815Uid",
      "bss1815Authenticated",
      "adminRole",
      "adminEmail",
      "adminUid",
      "isAdmin",
      "isSuperAdmin"
    ];

    keys.forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  }

  function saveSuperAdminAccess(user) {
    const accessData = {
      bss1815Role: "SUPER_ADMIN",
      bss1815Email: user.email,
      bss1815Uid: user.uid,
      bss1815Authenticated: "true",
      adminRole: "SUPER_ADMIN",
      adminEmail: user.email,
      adminUid: user.uid,
      isAdmin: "true",
      isSuperAdmin: "true"
    };

    Object.entries(accessData).forEach(
      ([key, value]) => {
        sessionStorage.setItem(key, value);
        localStorage.setItem(key, value);
      }
    );
  }

  function getFirebaseErrorMessage(code) {
    const messages = {
      "auth/invalid-credential":
        "Imel oswa modpas la pa kòrèk.",

      "auth/invalid-login-credentials":
        "Imel oswa modpas la pa kòrèk.",

      "auth/wrong-password":
        "Modpas la pa kòrèk.",

      "auth/user-not-found":
        "Firebase pa jwenn kont sa a.",

      "auth/invalid-email":
        "Adrès imel la pa valab.",

      "auth/user-disabled":
        "Kont Super Admin sa a dezaktive.",

      "auth/too-many-requests":
        "Twòp tantativ fèt. Tann yon ti moman epi eseye ankò.",

      "auth/network-request-failed":
        "Verifye koneksyon entènèt la.",

      "auth/missing-password":
        "Antre modpas la."
    };

    return (
      messages[code] ||
      "Login lan pa reyisi. Eseye ankò."
    );
  }

  function initializeLogin() {
    const {
      form,
      emailInput,
      passwordInput,
      loginButton,
      message
    } = getLoginElements();

    if (!form || !emailInput || !passwordInput) {
      console.error(
        "BSS1815: Fòm login, imel oswa modpas la pa jwenn nan HTML la."
      );

      return;
    }

    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();

        clearMessage(message);
        clearOldAccess();

        const email =
          emailInput.value
            .trim()
            .toLowerCase();

        const password =
          passwordInput.value;

        if (!email || !password) {
          showMessage(
            message,
            "Antre imel ak modpas la."
          );

          return;
        }

        if (loginButton) {
          loginButton.disabled = true;
          loginButton.textContent =
            "AP VERIFYE...";
        }

        try {
          await setPersistence(
            auth,
            browserLocalPersistence
          );

          const credential =
            await signInWithEmailAndPassword(
              auth,
              email,
              password
            );

          const user = credential.user;

          const connectedEmail =
            user.email
              ?.trim()
              .toLowerCase() || "";

          const connectedUid =
            user.uid || "";

          const correctEmail =
            connectedEmail ===
              SUPER_ADMIN_EMAIL;

          const correctUid =
            connectedUid ===
              SUPER_ADMIN_UID;

          /*
            Firebase dwe verifye:
            1. Imel Max Louis
            2. UID Max Louis

            Firestore pa bezwen bloke Max Louis ankò.
          */

          if (!correctEmail || !correctUid) {
            await signOut(auth);
            clearOldAccess();

            showMessage(
              message,
              "Kont sa a pa gen aksè administratif."
            );

            return;
          }

          saveSuperAdminAccess(user);

          showMessage(
            message,
            "Super Admin Max Louis verifye. Dashboard la ap ouvri...",
            "success"
          );

          window.setTimeout(() => {
            window.location.replace(
              DASHBOARD_URL
            );
          }, 600);

        } catch (error) {
          console.error(
            "BSS1815 ADMIN LOGIN ERROR:",
            error
          );

          clearOldAccess();

          showMessage(
            message,
            getFirebaseErrorMessage(
              error.code
            )
          );

        } finally {
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent =
              "Konekte";
          }
        }
      }
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLogin
    );
  } else {
    initializeLogin();
  }
})();
