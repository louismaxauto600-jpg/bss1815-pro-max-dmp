/*
  BSS1815 PRO-MAX DMP
  ADMIN DASHBOARD LOGIN
  FINAL
*/

(async function () {
  "use strict";

  try {
    const {
      initializeApp,
      getApps,
      getApp
    } = await import(
      "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js"
    );

    const {
      getAuth,
      signInWithEmailAndPassword,
      setPersistence,
      browserLocalPersistence,
      signOut
    } = await import(
      "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js"
    );

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

    const MAX_LOUIS_EMAIL =
      "briyantsoleysigno1815@gmail.com";

    const MAX_LOUIS_UID =
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

    function findLoginElements() {
      return {
        form: findElement([
          "#loginForm",
          "#adminLoginForm",
          "#admin-login-form",
          ".login-form",
          "form"
        ]),

        email: findElement([
          "#email",
          "#adminEmail",
          "#loginEmail",
          'input[name="email"]',
          'input[type="email"]'
        ]),

        password: findElement([
          "#password",
          "#adminPassword",
          "#loginPassword",
          'input[name="password"]',
          'input[type="password"]'
        ]),

        button: findElement([
          "#loginButton",
          "#connectButton",
          "#submitButton",
          'button[type="submit"]',
          ".login-button"
        ]),

        message: findElement([
          "#message",
          "#loginMessage",
          "#errorMessage",
          "#loginError",
          ".login-message",
          ".error-message",
          '[role="alert"]'
        ])
      };
    }

    function showMessage(
      element,
      text,
      type = "error"
    ) {
      if (!element) {
        console.log(text);
        return;
      }

      element.textContent = text;
      element.style.display = "block";

      element.style.color =
        type === "success"
          ? "#45d483"
          : "#ff6b6b";
    }

    function clearMessage(element) {
      if (!element) {
        return;
      }

      element.textContent = "";
      element.style.display = "none";
    }

    function clearAccess() {
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
      const values = {
        bss1815Role: "SUPER_ADMIN",
        bss1815Email:
          user.email || MAX_LOUIS_EMAIL,
        bss1815Uid:
          user.uid || MAX_LOUIS_UID,
        bss1815Authenticated: "true",

        adminRole: "SUPER_ADMIN",
        adminEmail:
          user.email || MAX_LOUIS_EMAIL,
        adminUid:
          user.uid || MAX_LOUIS_UID,

        isAdmin: "true",
        isSuperAdmin: "true"
      };

      Object.entries(values).forEach(
        ([key, value]) => {
          sessionStorage.setItem(
            key,
            value
          );

          localStorage.setItem(
            key,
            value
          );
        }
      );
    }

    function firebaseErrorMessage(code) {
      const errors = {
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
          "Kont sa a dezaktive nan Firebase.",

        "auth/too-many-requests":
          "Twòp tantativ fèt. Tann yon ti moman.",

        "auth/network-request-failed":
          "Verifye koneksyon entènèt la.",

        "auth/missing-password":
          "Antre modpas la."
      };

      return (
        errors[code] ||
        "Login lan pa reyisi. Eseye ankò."
      );
    }

    function initializeLogin() {
      const {
        form,
        email,
        password,
        button,
        message
      } = findLoginElements();

      if (!form || !email || !password) {
        console.error(
          "BSS1815: Fòm login lan pa jwenn."
        );

        return;
      }

      form.addEventListener(
        "submit",
        async function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();

          clearMessage(message);
          clearAccess();

          const enteredEmail =
            email.value
              .trim()
              .toLowerCase();

          const enteredPassword =
            password.value;

          if (!enteredEmail ||
              !enteredPassword) {
            showMessage(
              message,
              "Antre imel ak modpas la."
            );

            return;
          }

          if (button) {
            button.disabled = true;
            button.textContent =
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
                enteredEmail,
                enteredPassword
              );

            const user =
              credential.user;

            const firebaseEmail =
              String(user.email || "")
                .trim()
                .toLowerCase();

            /*
              Firebase deja verifye modpas la.
              Imel ofisyèl la sifi pou rekonèt
              Max Louis kòm Super Admin.
            */

            if (
              firebaseEmail !==
              MAX_LOUIS_EMAIL
            ) {
              await signOut(auth);
              clearAccess();

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
            }, 500);

          } catch (error) {
            console.error(
              "BSS1815 LOGIN ERROR:",
              error
            );

            clearAccess();

            showMessage(
              message,
              firebaseErrorMessage(
                error.code
              )
            );

          } finally {
            if (button) {
              button.disabled = false;
              button.textContent =
                "Konekte";
            }
          }
        },
        true
      );
    }

    if (
      document.readyState === "loading"
    ) {
      document.addEventListener(
        "DOMContentLoaded",
        initializeLogin,
        { once: true }
      );
    } else {
      initializeLogin();
    }

  } catch (error) {
    console.error(
      "BSS1815 FIREBASE STARTUP ERROR:",
      error
    );
  }
})();
