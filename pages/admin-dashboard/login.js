import { auth } from "./firebase.js";
import { getUserRole } from "./firebase-roles.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");

function showError(text) {
  errorMsg.textContent = text;
  errorMsg.classList.add("show");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.classList.remove("show");
  loginBtn.disabled = true;
  loginBtn.textContent = "Ap konekte...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const role = await getUserRole(cred.user.uid);

    if (role === "NONE") {
      await signOut(auth);
      showError("Kont sa a pa gen aksè admin. Kontakte Super Admin.");
      loginBtn.disabled = false;
      loginBtn.textContent = "Konekte";
      return;
    }

    window.location.href = "dashboard.html";

  } catch (err) {
    let msg = "Erè: verifye imèl ak modpas ou.";
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      msg = "Imèl oswa modpas la pa kòrèk.";
    } else if (err.code === "auth/too-many-requests") {
      msg = "Twòp esè. Tanpri tann yon ti moman.";
    }
    showError(msg);
    loginBtn.disabled = false;
    loginBtn.textContent = "Konekte";
  }
});

// Si moun nan deja konekte, voye l dirèkteman sou dashboard la
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const role = await getUserRole(user.uid);
    if (role !== "NONE") {
      window.location.href = "dashboard.html";
    }
  }
});
