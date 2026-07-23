/**
 * BSS1815 PRO-MAX DMP
 * Central Authentication Controller
 * Version: 1.0.0
 *
 * This file manages:
 * - Login
 * - Registration
 * - Logout
 * - Password reset
 * - Authentication state
 * - User sessions
 * - Protected pages
 * - Roles and permissions
 */

"use strict";

const PRO_MAX_AUTH = {
  storageKeys: {
    user: "proMaxCurrentUser",
    role: "proMaxUserRole",
    project: "proMaxActiveProject",
    redirect: "proMaxAuthRedirect"
  },

  pages: {
    home: "index.html",
    login: "login.html",
    register: "register.html",
    forgotPassword: "forgot-password.html",
    dashboard: "dashboard.html",
    unauthorized: "unauthorized.html"
  },

  roles: {
    SUPER_ADMIN: "super-admin",
    ADMIN: "admin",
    MODERATOR: "moderator",
    INSTRUCTOR: "instructor",
    STUDENT: "student",
    MEMBER: "member",
    STAFF: "staff",
    GUEST: "guest"
  },

  rolePermissions: {
    "super-admin": ["*"],

    admin: [
      "dashboard.view",
      "users.view",
      "users.create",
      "users.edit",
      "projects.view",
      "projects.manage",
      "modules.view",
      "modules.manage",
      "documents.view",
      "documents.create",
      "documents.edit",
      "communication.view",
      "communication.create",
      "reports.view",
      "media.view",
      "media.upload"
    ],

    moderator: [
      "dashboard.view",
      "projects.view",
      "modules.view",
      "documents.view",
      "communication.view",
      "communication.create",
      "media.view",
      "reports.view"
    ],

    instructor: [
      "dashboard.view",
      "academy.view",
      "academy.courses.view",
      "academy.courses.create",
      "academy.courses.edit",
      "academy.lessons.create",
      "academy.lessons.edit",
      "academy.students.view",
      "academy.quizzes.manage",
      "academy.certificates.manage"
    ],

    student: [
      "dashboard.view",
      "academy.view",
      "academy.courses.view",
      "academy.lessons.view",
      "academy.quizzes.take",
      "academy.progress.view",
      "academy.certificates.view"
    ],

    member: [
      "dashboard.view",
      "projects.view",
      "documents.view",
      "events.view",
      "profile.view",
      "profile.edit"
    ],

    staff: [
      "dashboard.view",
      "projects.view",
      "modules.view",
      "documents.view",
      "documents.create",
      "communication.view",
      "media.view"
    ],

    guest: [
      "projects.view",
      "academy.courses.view",
      "public.view"
    ]
  }
};

let currentAuthenticatedUser = null;
let authenticationUnsubscribe = null;

document.addEventListener("DOMContentLoaded", () => {
  initializeAuthentication();
});

/**
 * Start authentication functions.
 */
async function initializeAuthentication() {
  initializeLoginForm();
  initializeRegistrationForm();
  initializeForgotPasswordForm();
  initializeLogoutButtons();
  initializePasswordVisibility();
  initializeAuthTabs();
  initializeProtectedElements();

  await initializeAuthenticationState();
}

/**
 * Return the Firebase services exported by firebase-config.js.
 */
function getFirebaseServices() {
  const services =
    window.PRO_MAX_FIREBASE ||
    window.firebaseServices ||
    window.firebaseAppServices;

  if (!services) {
    console.error(
      "Firebase services are unavailable. Verify firebase/firebase-config.js."
    );

    return null;
  }

  return services;
}

/**
 * Monitor Firebase authentication state.
 */
async function initializeAuthenticationState() {
  const services = getFirebaseServices();

  if (
    !services ||
    !services.auth ||
    typeof services.onAuthStateChanged !== "function"
  ) {
    restoreStoredUser();
    enforcePageProtection();
    return;
  }

  if (typeof authenticationUnsubscribe === "function") {
    authenticationUnsubscribe();
  }

  authenticationUnsubscribe = services.onAuthStateChanged(
    services.auth,
    async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await buildUserProfile(firebaseUser);

        currentAuthenticatedUser = userProfile;
        saveCurrentUser(userProfile);
        updateAuthenticatedInterface(userProfile);
      } else {
        currentAuthenticatedUser = null;
        clearStoredUser();
        updateUnauthenticatedInterface();
      }

      enforcePageProtection();
      dispatchAuthenticationChange(currentAuthenticatedUser);
    },
    (error) => {
      console.error("Authentication state error:", error);

      showAuthMessage(
        getAuthenticationErrorMessage(error),
        "error"
      );
    }
  );
}

/**
 * Login form.
 *
 * Required HTML IDs or data attributes:
 * #login-form
 * #login-email
 * #login-password
 */
function initializeLoginForm() {
  const loginForm = document.querySelector(
    "#login-form, [data-login-form]"
  );

  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = loginForm.querySelector(
      "#login-email, [name='email']"
    );

    const passwordInput = loginForm.querySelector(
      "#login-password, [name='password']"
    );

    const submitButton = loginForm.querySelector(
      "button[type='submit'], [data-login-submit]"
    );

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";

    clearAuthFormErrors(loginForm);

    if (!validateEmail(email)) {
      setFieldError(
        emailInput,
        translateAuthText(
          "Tanpri antre yon adrès imel ki valab.",
          "Veuillez saisir une adresse e-mail valide.",
          "Please enter a valid email address."
        )
      );

      return;
    }

    if (!password) {
      setFieldError(
        passwordInput,
        translateAuthText(
          "Tanpri antre modpas ou.",
          "Veuillez saisir votre mot de passe.",
          "Please enter your password."
        )
      );

      return;
    }

    setButtonLoading(submitButton, true);

    try {
      await loginUser(email, password);

      showAuthMessage(
        translateAuthText(
          "Ou konekte avèk siksè.",
          "Connexion réussie.",
          "Login successful."
        ),
        "success"
      );

      window.setTimeout(() => {
        redirectAfterAuthentication();
      }, 600);
    } catch (error) {
      console.error("Login error:", error);

      showAuthMessage(
        getAuthenticationErrorMessage(error),
        "error"
      );
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}

/**
 * Login with Firebase.
 */
async function loginUser(email, password) {
  const services = getFirebaseServices();

  if (
    !services ||
    !services.auth ||
    typeof services.signInWithEmailAndPassword !== "function"
  ) {
    throw new Error("auth/service-unavailable");
  }

  const credential =
    await services.signInWithEmailAndPassword(
      services.auth,
      email,
      password
    );

  const userProfile = await buildUserProfile(credential.user);

  currentAuthenticatedUser = userProfile;
  saveCurrentUser(userProfile);

  return userProfile;
}

/**
 * Registration form.
 *
 * Required fields:
 * name
 * email
 * password
 * confirmPassword
 */
function initializeRegistrationForm() {
  const registrationForm = document.querySelector(
    "#register-form, [data-register-form]"
  );

  if (!registrationForm) {
    return;
  }

  registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = registrationForm.querySelector(
      "#register-name, [name='name'], [name='displayName']"
    );

    const emailInput = registrationForm.querySelector(
      "#register-email, [name='email']"
    );

    const passwordInput = registrationForm.querySelector(
      "#register-password, [name='password']"
    );

    const confirmPasswordInput = registrationForm.querySelector(
      "#register-confirm-password, [name='confirmPassword']"
    );

    const roleInput = registrationForm.querySelector(
      "#register-role, [name='role']"
    );

    const projectInput = registrationForm.querySelector(
      "#register-project, [name='project']"
    );

    const submitButton = registrationForm.querySelector(
      "button[type='submit'], [data-register-submit]"
    );

    const name = nameInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const confirmPassword =
      confirmPasswordInput?.value || "";

    const requestedRole = roleInput?.value || "member";
    const selectedProject =
      projectInput?.value || "bss1815";

    clearAuthFormErrors(registrationForm);

    let formIsValid = true;

    if (name.length < 2) {
      setFieldError(
        nameInput,
        translateAuthText(
          "Tanpri antre non konplè ou.",
          "Veuillez saisir votre nom complet.",
          "Please enter your full name."
        )
      );

      formIsValid = false;
    }

    if (!validateEmail(email)) {
      setFieldError(
        emailInput,
        translateAuthText(
          "Tanpri antre yon adrès imel ki valab.",
          "Veuillez saisir une adresse e-mail valide.",
          "Please enter a valid email address."
        )
      );

      formIsValid = false;
    }

    if (!validatePassword(password)) {
      setFieldError(
        passwordInput,
        translateAuthText(
          "Modpas la dwe genyen omwen 8 karaktè, yon lèt ak yon chif.",
          "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.",
          "Password must contain at least 8 characters, one letter, and one number."
        )
      );

      formIsValid = false;
    }

    if (password !== confirmPassword) {
      setFieldError(
        confirmPasswordInput,
        translateAuthText(
          "De modpas yo pa menm.",
          "Les mots de passe ne correspondent pas.",
          "Passwords do not match."
        )
      );

      formIsValid = false;
    }

    if (!formIsValid) {
      return;
    }

    setButtonLoading(submitButton, true);

    try {
      await registerUser({
        name,
        email,
        password,
        requestedRole,
        selectedProject
      });

      showAuthMessage(
        translateAuthText(
          "Kont ou kreye avèk siksè.",
          "Votre compte a été créé avec succès.",
          "Your account was created successfully."
        ),
        "success"
      );

      window.setTimeout(() => {
        redirectAfterAuthentication();
      }, 700);
    } catch (error) {
      console.error("Registration error:", error);

      showAuthMessage(
        getAuthenticationErrorMessage(error),
        "error"
      );
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}

/**
 * Register a Firebase user and create the Firestore profile.
 */
async function registerUser({
  name,
  email,
  password,
  requestedRole = "member",
  selectedProject = "bss1815"
}) {
  const services = getFirebaseServices();

  if (
    !services ||
    !services.auth ||
    typeof services.createUserWithEmailAndPassword !== "function"
  ) {
    throw new Error("auth/service-unavailable");
  }

  const credential =
    await services.createUserWithEmailAndPassword(
      services.auth,
      email,
      password
    );

  const firebaseUser = credential.user;

  if (
    typeof services.updateProfile === "function"
  ) {
    await services.updateProfile(firebaseUser, {
      displayName: name
    });
  }

  const safeRole = getPublicRegistrationRole(requestedRole);

  const userProfile = {
    uid: firebaseUser.uid,
    name,
    displayName: name,
    email,
    role: safeRole,
    requestedRole,
    project: selectedProject,
    projects: [selectedProject],
    language:
      typeof window.getCurrentLanguage === "function"
        ? window.getCurrentLanguage()
        : "ht",
    status: "active",
    emailVerified: firebaseUser.emailVerified,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveUserProfileToDatabase(userProfile);

  currentAuthenticatedUser = userProfile;
  saveCurrentUser(userProfile);

  return userProfile;
}

/**
 * Prevent users from making themselves Admin or Super Admin.
 * Administrative roles must be assigned by an authorized Super Admin.
 */
function getPublicRegistrationRole(requestedRole) {
  const allowedRoles = [
    PRO_MAX_AUTH.roles.MEMBER,
    PRO_MAX_AUTH.roles.STUDENT,
    PRO_MAX_AUTH.roles.GUEST
  ];

  if (allowedRoles.includes(requestedRole)) {
    return requestedRole;
  }

  return PRO_MAX_AUTH.roles.MEMBER;
}

/**
 * Save a user's profile in Cloud Firestore.
 */
async function saveUserProfileToDatabase(userProfile) {
  const services = getFirebaseServices();

  if (
    !services ||
    !services.db ||
    typeof services.doc !== "function" ||
    typeof services.setDoc !== "function"
  ) {
    console.warn(
      "Firestore is unavailable. Profile saved locally only."
    );

    return;
  }

  const profileReference = services.doc(
    services.db,
    "users",
    userProfile.uid
  );

  await services.setDoc(
    profileReference,
    userProfile,
    { merge: true }
  );
}

/**
 * Read a user's Firestore profile.
 */
async function getUserProfileFromDatabase(uid) {
  const services = getFirebaseServices();

  if (
    !services ||
    !services.db ||
    typeof services.doc !== "function" ||
    typeof services.getDoc !== "function"
  ) {
    return null;
  }

  try {
    const profileReference = services.doc(
      services.db,
      "users",
      uid
    );

    const profileSnapshot =
      await services.getDoc(profileReference);

    if (profileSnapshot.exists()) {
      return profileSnapshot.data();
    }

    return null;
  } catch (error) {
    console.error("Unable to retrieve user profile:", error);
    return null;
  }
}

/**
 * Build the complete user profile.
 */
async function buildUserProfile(firebaseUser) {
  const databaseProfile =
    await getUserProfileFromDatabase(firebaseUser.uid);

  return {
    uid: firebaseUser.uid,
    name:
      databaseProfile?.name ||
      databaseProfile?.displayName ||
      firebaseUser.displayName ||
      "",
    displayName:
      databaseProfile?.displayName ||
      databaseProfile?.name ||
      firebaseUser.displayName ||
      "",
    email: firebaseUser.email || databaseProfile?.email || "",
    role:
      databaseProfile?.role ||
      PRO_MAX_AUTH.roles.MEMBER,
    project:
      databaseProfile?.project ||
      localStorage.getItem(
        PRO_MAX_AUTH.storageKeys.project
      ) ||
      "bss1815",
    projects:
      databaseProfile?.projects ||
      [databaseProfile?.project || "bss1815"],
    language:
      databaseProfile?.language ||
      localStorage.getItem("proMaxLanguage") ||
      "ht",
    status: databaseProfile?.status || "active",
    photoURL:
      databaseProfile?.photoURL ||
      firebaseUser.photoURL ||
      "",
    emailVerified: firebaseUser.emailVerified,
    createdAt:
      databaseProfile?.createdAt ||
      firebaseUser.metadata?.creationTime ||
      null,
    lastLoginAt:
      firebaseUser.metadata?.lastSignInTime ||
      new Date().toISOString()
  };
}

/**
 * Password reset form.
 */
function initializeForgotPasswordForm() {
  const resetForm = document.querySelector(
    "#forgot-password-form, [data-forgot-password-form]"
  );

  if (!resetForm) {
    return;
  }

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = resetForm.querySelector(
      "#reset-email, [name='email']"
    );

    const submitButton = resetForm.querySelector(
      "button[type='submit'], [data-reset-submit]"
    );

    const email = emailInput?.value.trim() || "";

    clearAuthFormErrors(resetForm);

    if (!validateEmail(email)) {
      setFieldError(
        emailInput,
        translateAuthText(
          "Tanpri antre yon adrès imel ki valab.",
          "Veuillez saisir une adresse e-mail valide.",
          "Please enter a valid email address."
        )
      );

      return;
    }

    setButtonLoading(submitButton, true);

    try {
      await sendPasswordReset(email);

      resetForm.reset();

      showAuthMessage(
        translateAuthText(
          "Nou voye yon lyen pou chanje modpas la nan imel ou.",
          "Un lien de réinitialisation a été envoyé à votre adresse e-mail.",
          "A password reset link was sent to your email."
        ),
        "success"
      );
    } catch (error) {
      console.error("Password reset error:", error);

      showAuthMessage(
        getAuthenticationErrorMessage(error),
        "error"
      );
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}

/**
 * Send Firebase password reset email.
 */
async function sendPasswordReset(email) {
  const services = getFirebaseServices();

  if (
    !services ||
    !services.auth ||
    typeof services.sendPasswordResetEmail !== "function"
  ) {
    throw new Error("auth/service-unavailable");
  }

  return services.sendPasswordResetEmail(
    services.auth,
    email
  );
}

/**
 * Logout buttons.
 *
 * Example:
 * <button data-logout>Logout</button>
 */
function initializeLogoutButtons() {
  document.querySelectorAll(
    "[data-logout], #logout-button, .logout-button"
  ).forEach((button) => {
    button.addEventListener("click", async () => {
      const confirmed =
        typeof window.confirmPlatformAction === "function"
          ? window.confirmPlatformAction(
              translateAuthText(
                "Èske ou vle dekonekte?",
                "Voulez-vous vous déconnecter ?",
                "Do you want to log out?"
              )
            )
          : window.confirm(
              translateAuthText(
                "Èske ou vle dekonekte?",
                "Voulez-vous vous déconnecter ?",
                "Do you want to log out?"
              )
            );

      if (!confirmed) {
        return;
      }

      await logoutUser();
    });
  });
}

/**
 * Logout current Firebase user.
 */
async function logoutUser() {
  const services = getFirebaseServices();

  try {
    if (
      services &&
      services.auth &&
      typeof services.signOut === "function"
    ) {
      await services.signOut(services.auth);
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    currentAuthenticatedUser = null;
    clearStoredUser();

    window.location.href =
      getCorrectRelativePath(PRO_MAX_AUTH.pages.login);
  }
}

/**
 * Show or hide password fields.
 *
 * Example:
 * <button data-password-toggle="#login-password">
 */
function initializePasswordVisibility() {
  document.querySelectorAll(
    "[data-password-toggle]"
  ).forEach((button) => {
    button.addEventListener("click", () => {
      const targetSelector =
        button.dataset.passwordToggle;

      const passwordInput =
        document.querySelector(targetSelector);

      if (!passwordInput) {
        return;
      }

      const passwordIsHidden =
        passwordInput.type === "password";

      passwordInput.type =
        passwordIsHidden ? "text" : "password";

      button.setAttribute(
        "aria-pressed",
        String(passwordIsHidden)
      );

      button.classList.toggle(
        "is-visible",
        passwordIsHidden
      );
    });
  });
}

/**
 * Optional Login/Register tab controls.
 */
function initializeAuthTabs() {
  document.querySelectorAll(
    "[data-auth-tab]"
  ).forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      const target = tabButton.dataset.authTab;

      document.querySelectorAll(
        "[data-auth-tab]"
      ).forEach((button) => {
        button.classList.toggle(
          "active",
          button === tabButton
        );
      });

      document.querySelectorAll(
        "[data-auth-panel]"
      ).forEach((panel) => {
        panel.hidden =
          panel.dataset.authPanel !== target;
      });
    });
  });
}

/**
 * Enforce authentication and role protection.
 *
 * HTML examples:
 * <body data-auth-required="true">
 * <body data-guest-only="true">
 * <body data-required-role="super-admin,admin">
 * <body data-required-permission="users.edit">
 */
function enforcePageProtection() {
  const body = document.body;

  if (!body) {
    return;
  }

  const requiresAuthentication =
    body.dataset.authRequired === "true";

  const guestOnly =
    body.dataset.guestOnly === "true";

  const requiredRoles = parseDataList(
    body.dataset.requiredRole
  );

  const requiredPermission =
    body.dataset.requiredPermission || "";

  const currentUser = getCurrentUser();

  if (requiresAuthentication && !currentUser) {
    saveAuthenticationRedirect(
      window.location.href
    );

    window.location.replace(
      getCorrectRelativePath(PRO_MAX_AUTH.pages.login)
    );

    return;
  }

  if (guestOnly && currentUser) {
    window.location.replace(
      getCorrectRelativePath(
        PRO_MAX_AUTH.pages.dashboard
      )
    );

    return;
  }

  if (
    currentUser &&
    requiredRoles.length > 0 &&
    !requiredRoles.includes(currentUser.role)
  ) {
    window.location.replace(
      getCorrectRelativePath(
        PRO_MAX_AUTH.pages.unauthorized
      )
    );

    return;
  }

  if (
    currentUser &&
    requiredPermission &&
    !userHasPermission(requiredPermission)
  ) {
    window.location.replace(
      getCorrectRelativePath(
        PRO_MAX_AUTH.pages.unauthorized
      )
    );
  }
}

/**
 * Hide or show individual elements based on access.
 *
 * Examples:
 * <button data-auth-show="authenticated">
 * <button data-auth-show="guest">
 * <section data-role-only="super-admin,admin">
 * <button data-permission-only="users.edit">
 */
function initializeProtectedElements() {
  updateProtectedElements();
}

function updateProtectedElements() {
  const currentUser = getCurrentUser();

  document.querySelectorAll(
    "[data-auth-show]"
  ).forEach((element) => {
    const mode = element.dataset.authShow;

    const shouldShow =
      mode === "authenticated"
        ? Boolean(currentUser)
        : mode === "guest"
          ? !currentUser
          : true;

    element.hidden = !shouldShow;
  });

  document.querySelectorAll(
    "[data-role-only]"
  ).forEach((element) => {
    const allowedRoles = parseDataList(
      element.dataset.roleOnly
    );

    const shouldShow =
      Boolean(currentUser) &&
      allowedRoles.includes(currentUser.role);

    element.hidden = !shouldShow;
  });

  document.querySelectorAll(
    "[data-permission-only]"
  ).forEach((element) => {
    const permission =
      element.dataset.permissionOnly;

    element.hidden =
      !currentUser ||
      !userHasPermission(permission);
  });
}

/**
 * Update interface when the user is logged in.
 */
function updateAuthenticatedInterface(user) {
  document.documentElement.classList.add(
    "user-authenticated"
  );

  document.documentElement.classList.remove(
    "user-unauthenticated"
  );

  document.querySelectorAll(
    "[data-user-name]"
  ).forEach((element) => {
    element.textContent =
      user.displayName ||
      user.name ||
      user.email;
  });

  document.querySelectorAll(
    "[data-user-email]"
  ).forEach((element) => {
    element.textContent = user.email || "";
  });

  document.querySelectorAll(
    "[data-user-role]"
  ).forEach((element) => {
    element.textContent =
      formatRoleName(user.role);
  });

  document.querySelectorAll(
    "[data-user-project]"
  ).forEach((element) => {
    element.textContent =
      formatProjectName(user.project);
  });

  document.querySelectorAll(
    "[data-user-avatar]"
  ).forEach((element) => {
    if (element.tagName === "IMG" && user.photoURL) {
      element.src = user.photoURL;
      element.alt =
        user.displayName || user.name || "User";
    } else {
      element.textContent = getUserInitials(user);
    }
  });

  updateProtectedElements();
}

/**
 * Update interface when the user is logged out.
 */
function updateUnauthenticatedInterface() {
  document.documentElement.classList.remove(
    "user-authenticated"
  );

  document.documentElement.classList.add(
    "user-unauthenticated"
  );

  updateProtectedElements();
}

/**
 * Permission checker.
 */
function userHasPermission(
  permission,
  user = getCurrentUser()
) {
  if (!user || !permission) {
    return false;
  }

  const permissions =
    PRO_MAX_AUTH.rolePermissions[user.role] || [];

  return (
    permissions.includes("*") ||
    permissions.includes(permission)
  );
}

/**
 * Check whether the current user has one of the roles.
 */
function userHasRole(...roles) {
  const user = getCurrentUser();

  if (!user) {
    return false;
  }

  return roles.flat().includes(user.role);
}

/**
 * Current user storage.
 */
function saveCurrentUser(user) {
  if (!user) {
    return;
  }

  localStorage.setItem(
    PRO_MAX_AUTH.storageKeys.user,
    JSON.stringify(user)
  );

  localStorage.setItem(
    PRO_MAX_AUTH.storageKeys.role,
    user.role || PRO_MAX_AUTH.roles.MEMBER
  );
}

function restoreStoredUser() {
  const storedUser = localStorage.getItem(
    PRO_MAX_AUTH.storageKeys.user
  );

  if (!storedUser) {
    currentAuthenticatedUser = null;
    updateUnauthenticatedInterface();
    return null;
  }

  try {
    currentAuthenticatedUser =
      JSON.parse(storedUser);

    updateAuthenticatedInterface(
      currentAuthenticatedUser
    );

    return currentAuthenticatedUser;
  } catch (error) {
    console.error(
      "Unable to restore stored user:",
      error
    );

    clearStoredUser();
    return null;
  }
}

function clearStoredUser() {
  localStorage.removeItem(
    PRO_MAX_AUTH.storageKeys.user
  );

  localStorage.removeItem(
    PRO_MAX_AUTH.storageKeys.role
  );
}

function getCurrentUser() {
  if (currentAuthenticatedUser) {
    return currentAuthenticatedUser;
  }

  const storedUser = localStorage.getItem(
    PRO_MAX_AUTH.storageKeys.user
  );

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return Boolean(getCurrentUser());
}

/**
 * Authentication redirects.
 */
function saveAuthenticationRedirect(url) {
  sessionStorage.setItem(
    PRO_MAX_AUTH.storageKeys.redirect,
    url
  );
}

function redirectAfterAuthentication() {
  const savedRedirect = sessionStorage.getItem(
    PRO_MAX_AUTH.storageKeys.redirect
  );

  if (savedRedirect) {
    sessionStorage.removeItem(
      PRO_MAX_AUTH.storageKeys.redirect
    );

    window.location.href = savedRedirect;
    return;
  }

  window.location.href =
    getCorrectRelativePath(
      PRO_MAX_AUTH.pages.dashboard
    );
}

/**
 * Return the correct relative path from nested folders.
 */
function getCorrectRelativePath(targetPath) {
  const currentPath = window.location.pathname;
  const parts = currentPath
    .split("/")
    .filter(Boolean);

  const currentFile =
    parts[parts.length - 1] || "";

  const folderDepth =
    currentFile.includes(".")
      ? Math.max(parts.length - 1, 0)
      : parts.length;

  if (folderDepth <= 1) {
    return targetPath;
  }

  return (
    "../".repeat(folderDepth - 1) +
    targetPath
  );
}

/**
 * Validation.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

/**
 * Form field errors.
 */
function setFieldError(field, message) {
  if (!field) {
    return;
  }

  field.classList.add("has-error");
  field.setAttribute("aria-invalid", "true");

  let errorElement =
    field.parentElement?.querySelector(
      ".auth-field-error"
    );

  if (!errorElement) {
    errorElement =
      document.createElement("small");

    errorElement.className =
      "auth-field-error";

    field.insertAdjacentElement(
      "afterend",
      errorElement
    );
  }

  errorElement.textContent = message;
}

function clearAuthFormErrors(form) {
  form.querySelectorAll(
    ".auth-field-error"
  ).forEach((element) => {
    element.remove();
  });

  form.querySelectorAll(
    ".has-error"
  ).forEach((field) => {
    field.classList.remove("has-error");
    field.removeAttribute("aria-invalid");
  });
}

/**
 * Button loading state.
 */
function setButtonLoading(button, isLoading) {
  if (!button) {
    return;
  }

  if (isLoading) {
    button.dataset.originalText =
      button.textContent;

    button.disabled = true;
    button.classList.add("is-loading");

    button.textContent =
      translateAuthText(
        "Tanpri tann...",
        "Veuillez patienter...",
        "Please wait..."
      );

    return;
  }

  button.disabled = false;
  button.classList.remove("is-loading");

  if (button.dataset.originalText) {
    button.textContent =
      button.dataset.originalText;

    delete button.dataset.originalText;
  }
}

/**
 * Authentication messages.
 */
function showAuthMessage(message, type = "info") {
  if (
    typeof window.showApplicationMessage === "function"
  ) {
    window.showApplicationMessage(message, type);
    return;
  }

  let messageBox = document.querySelector(
    "#auth-message, [data-auth-message]"
  );

  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.id = "auth-message";
    messageBox.className = "auth-message";
    messageBox.setAttribute("role", "alert");

    document.body.prepend(messageBox);
  }

  messageBox.textContent = message;
  messageBox.dataset.type = type;
  messageBox.hidden = false;
}

/**
 * Translate authentication-specific messages.
 */
function translateAuthText(
  creoleText,
  frenchText,
  englishText
) {
  const language =
    typeof window.getCurrentLanguage === "function"
      ? window.getCurrentLanguage()
      : localStorage.getItem("proMaxLanguage") ||
        "ht";

  if (language === "fr") {
    return frenchText;
  }

  if (language === "en") {
    return englishText;
  }

  return creoleText;
}

/**
 * Firebase error messages.
 */
function getAuthenticationErrorMessage(error) {
  const code =
    error?.code ||
    error?.message ||
    "auth/unknown-error";

  const messages = {
    "auth/invalid-email": [
      "Adrès imel la pa valab.",
      "L’adresse e-mail n’est pas valide.",
      "The email address is invalid."
    ],

    "auth/user-disabled": [
      "Kont sa a dezaktive.",
      "Ce compte a été désactivé.",
      "This account has been disabled."
    ],

    "auth/user-not-found": [
      "Nou pa jwenn okenn kont ak imel sa a.",
      "Aucun compte ne correspond à cette adresse e-mail.",
      "No account was found with this email."
    ],

    "auth/wrong-password": [
      "Modpas la pa kòrèk.",
      "Le mot de passe est incorrect.",
      "The password is incorrect."
    ],

    "auth/invalid-credential": [
      "Imel oswa modpas la pa kòrèk.",
      "L’adresse e-mail ou le mot de passe est incorrect.",
      "The email or password is incorrect."
    ],

    "auth/email-already-in-use": [
      "Gen yon kont ki deja itilize imel sa a.",
      "Un compte utilise déjà cette adresse e-mail.",
      "An account already uses this email."
    ],

    "auth/weak-password": [
      "Modpas la pa ase solid.",
      "Le mot de passe n’est pas assez sécurisé.",
      "The password is too weak."
    ],

    "auth/too-many-requests": [
      "Gen twòp tantativ. Tanpri eseye ankò pita.",
      "Trop de tentatives. Veuillez réessayer plus tard.",
      "Too many attempts. Please try again later."
    ],

    "auth/network-request-failed": [
      "Verifye koneksyon entènèt ou.",
      "Vérifiez votre connexion Internet.",
      "Check your internet connection."
    ],

    "auth/service-unavailable": [
      "Sistèm koneksyon an poko disponib. Verifye Firebase.",
      "Le système de connexion n’est pas disponible. Vérifiez Firebase.",
      "The authentication system is unavailable. Check Firebase."
    ],

    "auth/unknown-error": [
      "Gen yon erè ki rive. Tanpri eseye ankò.",
      "Une erreur s’est produite. Veuillez réessayer.",
      "An error occurred. Please try again."
    ]
  };

  const selectedMessage =
    messages[code] ||
    messages["auth/unknown-error"];

  return translateAuthText(
    selectedMessage[0],
    selectedMessage[1],
    selectedMessage[2]
  );
}

/**
 * Helpers.
 */
function parseDataList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatRoleName(role = "") {
  const roleNames = {
    "super-admin": "Super Admin",
    admin: "Admin",
    moderator: "Moderatè",
    instructor: "Fòmatè",
    student: "Elèv",
    member: "Manm",
    staff: "Staff",
    guest: "Guest"
  };

  return roleNames[role] || role;
}

function formatProjectName(project = "") {
  const projectNames = {
    bss1815: "Briyant Solèy Signo 1815",
    "pro-max-fm": "PRO-MAX FM",
    maximax: "Maximax Multi Services",
    academy: "PRO-MAX Academy"
  };

  return projectNames[project] || project;
}

function getUserInitials(user) {
  const name =
    user?.displayName ||
    user?.name ||
    user?.email ||
    "U";

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/**
 * Dispatch authentication changes to other modules.
 */
function dispatchAuthenticationChange(user) {
  const event = new CustomEvent(
    "proMaxAuthenticationChanged",
    {
      detail: {
        authenticated: Boolean(user),
        user
      }
    }
  );

  document.dispatchEvent(event);
}

/**
 * Public functions.
 */
window.PRO_MAX_AUTH = PRO_MAX_AUTH;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.sendPasswordReset = sendPasswordReset;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.userHasRole = userHasRole;
window.userHasPermission = userHasPermission;
window.enforcePageProtection = enforcePageProtection;
