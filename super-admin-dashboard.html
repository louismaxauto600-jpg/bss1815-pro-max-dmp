import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIGURATION
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY",

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


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* =====================================================
   SUPER ADMIN PRINCIPAL
===================================================== */

const ROOT_SUPER_ADMIN =
  "briyantsoleysigno1815@gmail.com";


/* =====================================================
   FIRESTORE DOCUMENTS
===================================================== */

const superAdminsRef =
  doc(db, "roles", "super_admins");

const adminsRef =
  doc(db, "roles", "admins");

const auditRef =
  doc(db, "system", "last_super_admin_action");


/* =====================================================
   HTML ELEMENTS
===================================================== */

const loading =
  document.getElementById("loading");

const accessDenied =
  document.getElementById("accessDenied");

const panel =
  document.getElementById("panel");

const logoutBtn =
  document.getElementById("logoutBtn");

const superAdminEmailInput =
  document.getElementById("superAdminEmail");

const adminEmailInput =
  document.getElementById("adminEmail");

const addSuperAdminBtn =
  document.getElementById("addSuperAdminBtn");

const addAdminBtn =
  document.getElementById("addAdminBtn");

const superAdminList =
  document.getElementById("superAdminList");

const adminList =
  document.getElementById("adminList");

const systemMessage =
  document.getElementById("systemMessage");


let currentUser = null;
let authorizedSuperAdmin = false;


/* =====================================================
   UTILITIES
===================================================== */

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}


function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function showMessage(text, type = "success") {
  if (!systemMessage) {
    alert(text);
    return;
  }

  systemMessage.textContent = text;
  systemMessage.className = type;

  window.setTimeout(() => {
    systemMessage.textContent = "";
    systemMessage.className = "";
  }, 6000);
}


function getFirebaseError(error) {
  const errors = {
    "auth/invalid-email":
      "Adrès imel la pa valab.",

    "auth/user-not-found":
      "Firebase pa jwenn kont sa a.",

    "auth/too-many-requests":
      "Twòp demann fèt. Tann yon ti moman.",

    "auth/network-request-failed":
      "Verifye koneksyon entènèt la.",

    "permission-denied":
      "Firestore Rules yo pa bay pèmisyon pou aksyon sa a.",

    "unavailable":
      "Firebase pa disponib kounye a. Eseye ankò."
  };

  return (
    errors[error?.code] ||
    error?.message ||
    "Operasyon an pa reyisi."
  );
}


function setButtonLoading(button, loadingText, state) {
  if (!button) return;

  if (state) {
    button.dataset.originalText =
      button.textContent;

    button.disabled = true;
    button.textContent = loadingText;
  } else {
    button.disabled = false;

    button.textContent =
      button.dataset.originalText ||
      button.textContent;
  }
}


/* =====================================================
   CREATE REQUIRED FIRESTORE DOCUMENTS
===================================================== */

async function ensureRoleDocuments() {
  const superSnapshot =
    await getDoc(superAdminsRef);

  if (!superSnapshot.exists()) {
    await setDoc(
      superAdminsRef,
      {
        users: [ROOT_SUPER_ADMIN],
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  const adminSnapshot =
    await getDoc(adminsRef);

  if (!adminSnapshot.exists()) {
    await setDoc(
      adminsRef,
      {
        users: [],
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }
}


/* =====================================================
   VERIFY SUPER ADMIN ACCESS
===================================================== */

async function verifySuperAdmin(user) {
  const connectedEmail =
    normalizeEmail(user.email);

  /*
    Kont prensipal la toujou rekonèt kòm
    Super Admin nan aplikasyon an.
  */
  if (connectedEmail === ROOT_SUPER_ADMIN) {
    return true;
  }

  const snapshot =
    await getDoc(superAdminsRef);

  if (!snapshot.exists()) {
    return false;
  }

  const data = snapshot.data();

  const users = Array.isArray(data.users)
    ? data.users.map(normalizeEmail)
    : [];

  /*
    Kòd la aksepte email oswa UID si ansyen
    dokiman Firestore la te deja itilize UID.
  */
  return (
    users.includes(connectedEmail) ||
    users.includes(user.uid)
  );
}


/* =====================================================
   SHOW OR BLOCK DASHBOARD
===================================================== */

function showDashboard() {
  loading.style.display = "none";
  accessDenied.style.display = "none";
  panel.style.display = "block";
}


function denyAccess() {
  loading.style.display = "none";
  panel.style.display = "none";
  accessDenied.style.display = "block";
}


/* =====================================================
   AUDIT LOG
===================================================== */

async function saveAudit(action, targetEmail = "") {
  if (!currentUser) return;

  try {
    await setDoc(
      auditRef,
      {
        action,
        targetEmail:
          normalizeEmail(targetEmail),

        performedBy:
          normalizeEmail(currentUser.email),

        performedByUid:
          currentUser.uid,

        createdAt:
          serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.warn(
      "Audit log pa anrejistre:",
      error
    );
  }
}


/* =====================================================
   RENDER MEMBER LISTS
===================================================== */

function createMemberRow(email, role) {
  const normalizedEmail =
    normalizeEmail(email);

  const item =
    document.createElement("li");

  item.className = "member-row";

  const isProtectedOwner =
    normalizedEmail === ROOT_SUPER_ADMIN;

  item.innerHTML = `
    <div class="member-info">
      <span class="member-email">
        ${escapeHTML(normalizedEmail)}
      </span>

      <span class="member-meta">
        ${
          role === "super-admin"
            ? "SUPER ADMIN"
            : "ADMIN"
        }
        ${
          isProtectedOwner
            ? " · PWOTEJE"
            : ""
        }
      </span>
    </div>

    <div class="member-actions">
      <button
        type="button"
        class="edit-btn"
        data-email="${escapeHTML(normalizedEmail)}"
        data-role="${escapeHTML(role)}"
        ${isProtectedOwner ? "disabled" : ""}
      >
        Modifye
      </button>

      <button
        type="button"
        class="reset-password-btn"
        data-email="${escapeHTML(normalizedEmail)}"
      >
        Reset Password
      </button>

      <button
        type="button"
        class="remove-btn"
        data-email="${escapeHTML(normalizedEmail)}"
        data-role="${escapeHTML(role)}"
        ${isProtectedOwner ? "disabled" : ""}
      >
        Retire
      </button>
    </div>
  `;

  return item;
}


function renderList(listElement, users, role) {
  listElement.innerHTML = "";

  const cleanUsers = [
    ...new Set(
      users
        .map(normalizeEmail)
        .filter(Boolean)
    )
  ].sort();

  if (cleanUsers.length === 0) {
    const emptyItem =
      document.createElement("li");

    emptyItem.className = "empty-msg";

    emptyItem.textContent =
      role === "super-admin"
        ? "Poko gen Super Admin nan lis la."
        : "Poko gen Admin nan lis la.";

    listElement.appendChild(emptyItem);
    return;
  }

  cleanUsers.forEach((email) => {
    listElement.appendChild(
      createMemberRow(email, role)
    );
  });
}


/* =====================================================
   LIVE FIRESTORE LISTENERS
===================================================== */

function startRoleListeners() {
  onSnapshot(
    superAdminsRef,
    (snapshot) => {
      const data = snapshot.exists()
        ? snapshot.data()
        : {};

      let users = Array.isArray(data.users)
        ? data.users
        : [];

      if (!users.includes(ROOT_SUPER_ADMIN)) {
        users = [
          ROOT_SUPER_ADMIN,
          ...users
        ];
      }

      renderList(
        superAdminList,
        users,
        "super-admin"
      );
    },
    (error) => {
      showMessage(
        getFirebaseError(error),
        "error"
      );
    }
  );

  onSnapshot(
    adminsRef,
    (snapshot) => {
      const data = snapshot.exists()
        ? snapshot.data()
        : {};

      const users = Array.isArray(data.users)
        ? data.users
        : [];

      renderList(
        adminList,
        users,
        "admin"
      );
    },
    (error) => {
      showMessage(
        getFirebaseError(error),
        "error"
      );
    }
  );
}


/* =====================================================
   ADD SUPER ADMIN
===================================================== */

async function addSuperAdmin() {
  if (!authorizedSuperAdmin) return;

  const email =
    normalizeEmail(
      superAdminEmailInput.value
    );

  if (!validEmail(email)) {
    showMessage(
      "Antre yon imel Super Admin ki valab.",
      "error"
    );

    superAdminEmailInput.focus();
    return;
  }

  setButtonLoading(
    addSuperAdminBtn,
    "AP AJOUTE...",
    true
  );

  try {
    await setDoc(
      superAdminsRef,
      {
        users: arrayUnion(email),
        updatedAt: serverTimestamp(),
        updatedBy:
          normalizeEmail(currentUser.email)
      },
      { merge: true }
    );

    /*
      Retire menm imel la nan lis Admin nòmal la
      pou li pa genyen 2 wòl an menm tan.
    */
    await setDoc(
      adminsRef,
      {
        users: arrayRemove(email),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    await saveAudit(
      "ADD_SUPER_ADMIN",
      email
    );

    superAdminEmailInput.value = "";

    showMessage(
      `${email} ajoute kòm Super Admin.`,
      "success"
    );
  } catch (error) {
    showMessage(
      getFirebaseError(error),
      "error"
    );
  } finally {
    setButtonLoading(
      addSuperAdminBtn,
      "",
      false
    );
  }
}


/* =====================================================
   ADD ADMIN
===================================================== */

async function addAdmin() {
  if (!authorizedSuperAdmin) return;

  const email =
    normalizeEmail(adminEmailInput.value);

  if (!validEmail(email)) {
    showMessage(
      "Antre yon imel Admin ki valab.",
      "error"
    );

    adminEmailInput.focus();
    return;
  }

  if (email === ROOT_SUPER_ADMIN) {
    showMessage(
      "Kont prensipal Super Admin lan pa kapab vin Admin nòmal.",
      "error"
    );

    return;
  }

  setButtonLoading(
    addAdminBtn,
    "AP AJOUTE...",
    true
  );

  try {
    await setDoc(
      adminsRef,
      {
        users: arrayUnion(email),
        updatedAt: serverTimestamp(),
        updatedBy:
          normalizeEmail(currentUser.email)
      },
      { merge: true }
    );

    await saveAudit(
      "ADD_ADMIN",
      email
    );

    adminEmailInput.value = "";

    showMessage(
      `${email} ajoute kòm Admin.`,
      "success"
    );
  } catch (error) {
    showMessage(
      getFirebaseError(error),
      "error"
    );
  } finally {
    setButtonLoading(
      addAdminBtn,
      "",
      false
    );
  }
}


/* =====================================================
   REMOVE MEMBER
===================================================== */

async function removeMember(email, role) {
  if (!authorizedSuperAdmin) return;

  const targetEmail =
    normalizeEmail(email);

  if (targetEmail === ROOT_SUPER_ADMIN) {
    showMessage(
      "Kont prensipal Super Admin lan pwoteje. Li pa kapab retire.",
      "error"
    );

    return;
  }

  const confirmed = window.confirm(
    `Èske ou konfime ou vle retire ${targetEmail}?`
  );

  if (!confirmed) return;

  try {
    const targetRef =
      role === "super-admin"
        ? superAdminsRef
        : adminsRef;

    await updateDoc(
      targetRef,
      {
        users: arrayRemove(targetEmail),
        updatedAt: serverTimestamp(),
        updatedBy:
          normalizeEmail(currentUser.email)
      }
    );

    await saveAudit(
      role === "super-admin"
        ? "REMOVE_SUPER_ADMIN"
        : "REMOVE_ADMIN",
      targetEmail
    );

    showMessage(
      `${targetEmail} retire avèk siksè.`,
      "success"
    );
  } catch (error) {
    showMessage(
      getFirebaseError(error),
      "error"
    );
  }
}


/* =====================================================
   MODIFY MEMBER EMAIL
===================================================== */

async function modifyMember(oldEmail, role) {
  if (!authorizedSuperAdmin) return;

  const normalizedOldEmail =
    normalizeEmail(oldEmail);

  if (normalizedOldEmail === ROOT_SUPER_ADMIN) {
    showMessage(
      "Kont prensipal la pwoteje.",
      "error"
    );

    return;
  }

  const answer = window.prompt(
    "Antre nouvo imel la:",
    normalizedOldEmail
  );

  if (answer === null) return;

  const newEmail =
    normalizeEmail(answer);

  if (!validEmail(newEmail)) {
    showMessage(
      "Nouvo imel la pa valab.",
      "error"
    );

    return;
  }

  if (newEmail === normalizedOldEmail) {
    showMessage(
      "Ou pa fè okenn chanjman.",
      "error"
    );

    return;
  }

  try {
    const targetRef =
      role === "super-admin"
        ? superAdminsRef
        : adminsRef;

    await updateDoc(
      targetRef,
      {
        users:
          arrayRemove(normalizedOldEmail),

        updatedAt:
          serverTimestamp()
      }
    );

    await updateDoc(
      targetRef,
      {
        users:
          arrayUnion(newEmail),

        updatedAt:
          serverTimestamp(),

        updatedBy:
          normalizeEmail(currentUser.email)
      }
    );

    await saveAudit(
      role === "super-admin"
        ? "MODIFY_SUPER_ADMIN"
        : "MODIFY_ADMIN",
      `${normalizedOldEmail} → ${newEmail}`
    );

    showMessage(
      `Kont lan modifye: ${newEmail}`,
      "success"
    );
  } catch (error) {
    showMessage(
      getFirebaseError(error),
      "error"
    );
  }
}


/* =====================================================
   PASSWORD RESET
===================================================== */

async function resetMemberPassword(email) {
  if (!authorizedSuperAdmin) return;

  const targetEmail =
    normalizeEmail(email);

  try {
    await sendPasswordResetEmail(
      auth,
      targetEmail
    );

    await saveAudit(
      "SEND_PASSWORD_RESET",
      targetEmail
    );

    showMessage(
      `Firebase voye lyen reset modpas la bay ${targetEmail}.`,
      "success"
    );
  } catch (error) {
    showMessage(
      getFirebaseError(error),
      "error"
    );
  }
}


/* =====================================================
   LIST BUTTON EVENTS
===================================================== */

document.addEventListener(
  "click",
  async (event) => {
    const removeButton =
      event.target.closest(".remove-btn");

    const editButton =
      event.target.closest(".edit-btn");

    const resetPasswordButton =
      event.target.closest(
        ".reset-password-btn"
      );

    if (removeButton) {
      await removeMember(
        removeButton.dataset.email,
        removeButton.dataset.role
      );

      return;
    }

    if (editButton) {
      await modifyMember(
        editButton.dataset.email,
        editButton.dataset.role
      );

      return;
    }

    if (resetPasswordButton) {
      await resetMemberPassword(
        resetPasswordButton.dataset.email
      );
    }
  }
);


/* =====================================================
   MAIN BUTTON EVENTS
===================================================== */

addSuperAdminBtn?.addEventListener(
  "click",
  addSuperAdmin
);

addAdminBtn?.addEventListener(
  "click",
  addAdmin
);

superAdminEmailInput?.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSuperAdmin();
    }
  }
);

adminEmailInput?.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addAdmin();
    }
  }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutBtn?.addEventListener(
  "click",
  async () => {
    try {
      await signOut(auth);

      sessionStorage.removeItem(
        "bss1815Role"
      );

      sessionStorage.removeItem(
        "bss1815Email"
      );

      window.location.replace(
        "./super-admin-login.html"
      );
    } catch (error) {
      showMessage(
        getFirebaseError(error),
        "error"
      );
    }
  }
);


/* =====================================================
   AUTHENTICATION CHECK
===================================================== */

onAuthStateChanged(
  auth,
  async (user) => {
    if (!user) {
      window.location.replace(
        "./super-admin-login.html"
      );

      return;
    }

    currentUser = user;

    try {
      /*
        Kont prensipal la kapab kreye premye
        dokiman roles yo si Firestore Rules yo
        ba li otorizasyon.
      */
      if (
        normalizeEmail(user.email) ===
        ROOT_SUPER_ADMIN
      ) {
        await ensureRoleDocuments();
      }

      authorizedSuperAdmin =
        await verifySuperAdmin(user);

      if (!authorizedSuperAdmin) {
        denyAccess();
        return;
      }

      sessionStorage.setItem(
        "bss1815Role",
        "SUPER_ADMIN"
      );

      sessionStorage.setItem(
        "bss1815Email",
        normalizeEmail(user.email)
      );

      showDashboard();
      startRoleListeners();
    } catch (error) {
      loading.style.display = "none";

      showMessage(
        getFirebaseError(error),
        "error"
      );

      if (
        normalizeEmail(user.email) ===
        ROOT_SUPER_ADMIN
      ) {
        /*
          Kont prensipal la toujou kapab wè
          Dashboard la menm si dokiman Firestore
          yo poko kreye.
        */
        authorizedSuperAdmin = true;
        showDashboard();
      } else {
        denyAccess();
      }
    }
  }
);
