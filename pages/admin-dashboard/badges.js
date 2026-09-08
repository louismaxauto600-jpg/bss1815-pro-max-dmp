import { auth, db } from "./firebase.js";
import { getUserRole } from "./firebase-roles.js";
import { FIREBASE_COLLECTIONS } from "./collections.js";
import { generateBadgeId, createBadgeRecord, sendBadgeSms } from "./badge-utils.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, getDoc, updateDoc, collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let currentRole = null;
let currentProfile = null;
let lastBadgeId = null;
let lastBadgeName = null;
let lastBadgeCategory = null;
let lastBadgePhone = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  currentUser = user;

  currentRole = await getUserRole(user.uid);
  if (currentRole === "NONE") {
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  const profileSnap = await getDoc(doc(db, FIREBASE_COLLECTIONS.administrative_team, user.uid));
  currentProfile = profileSnap.exists() ? profileSnap.data() : { name: user.email };

  init();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "login.html");
});

function isAdminOrSuper() {
  return currentRole === "SUPER_ADMIN" || currentRole === "ADMIN";
}
function isSuper() {
  return currentRole === "SUPER_ADMIN";
}

function init() {
  document.getElementById("whoName").textContent = currentProfile.name || currentUser.email;
  const badge = document.getElementById("roleBadge");
  badge.textContent = isSuper() ? "SUPER ADMIN" : (currentRole === "ADMIN" ? "ADMIN" : "MANM");
  badge.classList.add(isSuper() ? "super" : "admin");

  if (isAdminOrSuper()) {
    document.getElementById("genPanel").classList.remove("hidden");
  }

  loadBadges();
}

// ---------- Jenerasyon badj ----------
document.getElementById("genBtn").addEventListener("click", async () => {
  const category = document.getElementById("bCategory").value;
  const name = document.getElementById("bName").value.trim();
  const phone = document.getElementById("bPhone").value.trim();
  const statusEl = document.getElementById("genStatus");

  if (!name) { alert("Antre non moun nan."); return; }

  statusEl.textContent = "Ap jenere...";

  try {
    const badgeId = generateBadgeId(category);

    await createBadgeRecord({
      badgeId,
      name,
      category,
      issuedByUid: currentUser.uid,
      issuedByName: currentProfile.name || currentUser.email
    });

    const verifyUrl = `${window.location.origin}/pages/admin-dashboard/verify.html?id=${badgeId}`;
    const canvas = document.getElementById("qrCanvas");
    await QRCode.toCanvas(canvas, verifyUrl, { width: 260, margin: 2 });

    document.getElementById("badgeIdText").textContent = badgeId;
    document.getElementById("badgePreview").classList.remove("hidden");

    lastBadgeId = badgeId;
    lastBadgeName = name;
    lastBadgeCategory = category;
    lastBadgePhone = phone;

    const smsBtn = document.getElementById("smsBtn");
    if (phone) {
      smsBtn.classList.remove("hidden");
    } else {
      smsBtn.classList.add("hidden");
    }

    statusEl.textContent = "Badj kreye avèk siksè.";
    document.getElementById("bName").value = "";
    document.getElementById("bPhone").value = "";
    loadBadges();
  } catch (err) {
    statusEl.textContent = "Erè: " + err.message;
  }
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const canvas = document.getElementById("qrCanvas");
  const link = document.createElement("a");
  link.download = `${lastBadgeId}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

document.getElementById("smsBtn").addEventListener("click", async () => {
  const btn = document.getElementById("smsBtn");
  btn.disabled = true;
  btn.textContent = "Ap voye...";
  try {
    await sendBadgeSms(lastBadgePhone, lastBadgeName, lastBadgeId, lastBadgeCategory);
    btn.textContent = "Voye ✓";
  } catch (err) {
    btn.textContent = "Erè SMS";
  }
});

// ---------- Lis badj yo ----------
async function loadBadges() {
  const tbody = document.getElementById("badgesTableBody");
  tbody.innerHTML = "<tr><td colspan='6'>Ap chaje...</td></tr>";

  const snap = await getDocs(query(collection(db, "badges"), orderBy("issuedAt", "desc")));
  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='6' style='color:var(--text-dim);'>Pa gen badj ankò.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const date = d.issuedAt ? d.issuedAt.toDate().toLocaleDateString() : "...";
    const isRevoked = d.status === "revoked";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.name}</td>
      <td>${d.category}</td>
      <td class="link-url">${docSnap.id}</td>
      <td><span class="status-tag ${isRevoked ? "revoked" : "active"}">${isRevoked ? "Revoke" : "Aktif"}</span></td>
      <td>${date}</td>
      <td>${isSuper() ? `<button class="btn-danger" data-id="${docSnap.id}" data-revoked="${isRevoked}">${isRevoked ? "Reaktive" : "Revoke"}</button>` : ""}</td>
    `;
    if (isSuper()) {
      row.querySelector("button").addEventListener("click", async (e) => {
        const nowRevoked = e.target.dataset.revoked === "true";
        await updateDoc(doc(db, "badges", docSnap.id), { status: nowRevoked ? "active" : "revoked" });
        loadBadges();
      });
    }
    tbody.appendChild(row);
  });
}
