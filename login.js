// ============================================
// LOGIN.JS - Admin Dashboard (BSS 1815)
// Firebase Authentication - Login, Forgot Password, Show/Hide Password
// ============================================

// --- Firebase Config (mete konfigirasyon pwojè ou a isit la) ---
const firebaseConfig = {
  apiKey: "METE_API_KEY_OU_ISIT",
  authDomain: "METE_AUTH_DOMAIN_OU_ISIT",
  projectId: "METE_PROJECT_ID_OU_ISIT",
  storageBucket: "METE_STORAGE_BUCKET_OU_ISIT",
  messagingSenderId: "METE_SENDER_ID_OU_ISIT",
  appId: "METE_APP_ID_OU_ISIT"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --- Elements ---
const loginForm = document.getElementById('loginForm');
const imelInput = document.getElementById('imel');
const modpasInput = document.getElementById('modpas');
const toggleModpas = document.getElementById('toggleModpas');
const forgotPassword = document.getElementById('forgotPassword');
const errorMsg = document.getElementById('errorMsg');

// ============================================
// 1) KONEKTE (LOGIN)
// ============================================
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = imelInput.value.trim();
  const password = modpasInput.value;

  if (!email || !password) {
    showError('Tanpri ranpli tout chan yo.');
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // Login reyisi - voye itilizatè a nan dashboard la
    window.location.href = 'super-admin-dashboard.html';
  } catch (error) {
    handleAuthError(error);
  }
});

function handleAuthError(error) {
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      showError('Imèl oswa modpas la pa kòrèk.');
      break;
    case 'auth/invalid-email':
      showError('Fòma imèl la pa valid.');
      break;
    case 'auth/too-many-requests':
      showError('Twòp tantativ. Tanpri eseye ankò pita.');
      break;
    default:
      showError('Erè: ' + error.message);
  }
}

function showError(message) {
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
  } else {
    alert(message);
  }
}

// ============================================
// 2) BLIYE MODPAS (FORGOT PASSWORD)
// ============================================
forgotPassword.addEventListener('click', async function (e) {
  e.preventDefault();

  const email = imelInput.value.trim();

  if (!email) {
    showError('Tanpri mete imèl ou anvan ou klike sou "Bliye modpas?".');
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    alert('Yon lyen pou reset modpas te voye nan: ' + email);
  } catch (error) {
    handleAuthError(error);
  }
});

// ============================================
// 3) WÈ / KACHE MODPAS (SHOW/HIDE PASSWORD)
// ============================================
toggleModpas.addEventListener('click', function () {
  const isHidden = modpasInput.type === 'password';
  modpasInput.type = isHidden ? 'text' : 'password';
  this.textContent = isHidden ? '🙈' : '👁️';
});

