// ============================================
// LOGIN.JS - VERSION AK DYAGNOSTIK
// ============================================

// Verifye si Firebase SDK chaje anvan nenpòt lòt bagay
if (typeof firebase === 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    const errorMsg = document.getElementById('errorMsg');
    if (errorMsg) {
      errorMsg.textContent = 'ERE: Firebase SDK pa chaje. Verifye script yo nan login.html.';
    } else {
      alert('ERE: Firebase SDK pa chaje.');
    }
  });
} else {

const firebaseConfig = {
  apiKey: "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY",
  authDomain: "briyant-soley-signo-1815.firebaseapp.com",
  projectId: "briyant-soley-signo-1815",
  storageBucket: "briyant-soley-signo-1815.firebasestorage.app",
  messagingSenderId: "873317957685",
  appId: "1:873317957685:web:1bb4bb30831a058399717c"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('errorMsg');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Tanpri ranpli tout chan yo.');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Ap konekte...';

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'super-admin-dashboard.html';
  } catch (error) {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Konekte';

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
});

function showError(message) {
  errorMsg.textContent = message;
}

} // fen else Firebase defini
