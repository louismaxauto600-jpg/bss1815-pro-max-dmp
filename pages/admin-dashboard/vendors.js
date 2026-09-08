import { auth, db } from "./firebase.js";
import { getUserRole } from "./firebase-roles.js";
import { isAdvisor } from "./disciplinary-roles.js";
import { generateBadgeId, createBadgeRecord, sendBadgeSms } from "./badge-utils.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, getDoc, addDoc, collection, getDocs, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let currentRole = null;
let currentProfile = null;
let onAdvisory = false;
let currentVendorId = null;
let allVendors = [];
const EVENT_YEAR = new Date().getFullYear();

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  currentUser = user;

  currentRole = await getUserRole(user.uid);
  onAdvisory = await isAdvisor(user.uid);

  if (currentRole === "NONE" && !onAdvisory) {
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  currentProfile = { name: user.email };
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
  document.getElementById("whoName").textContent = currentProfile.name;
  const badge = document.getElementById("roleBadge");
  badge.textContent = isSuper() ? "SUPER ADMIN" : (currentRole === "ADMIN" ? "ADMIN" : "KONSÈY");
  badge.classList.add(isSuper() ? "super" : "admin");
  document.getElementById("yearLabel").textContent = EVENT_YEAR;

  if (isAdminOrSuper()) {
    document.getElementById("addVendorPanel").classList.remove("hidden");
  }

  loadVendors();
  document.getElementById("backToVendorsBtn").addEventListener("click", showVendorList);
}

function isValidPhone(phone) {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length >= 8;
}

document.getElementById("addVendorBtn").addEventListener("click", async () => {
  const lastName = document.getElementById("vLastName").value.trim();
  const firstName = document.getElementById("vFirstName").value.trim();
  const phone = document.getElementById("vPhone").value.trim();
  const email = document.getElementById("vEmail").value.trim();
  const spot = document.getElementById("vSpot").value.trim();
  const feeRaw = document.getElementById("vFee").value.trim();
  const statusEl = document.getElementById("addVendorStatus");

  if (!lastName || !firstName) { alert("Antre non ak prenon machann nan."); return; }

  if (!phone || !isValidPhone(phone)) {
    alert("Nimewo telefòn OBLIGATWA e li dwe gen omwen 8 chif. Sistèm nan pa ka anrejistre san li.");
    return;
  }

  const feeAmount = parseFloat(feeRaw) || 0;
  const fullName = `${firstName} ${lastName}`;

  statusEl.textContent = "Ap anrejistre...";

  try {
    const vendorRef = await addDoc(collection(db, "vendors"), {
      firstName, lastName, phone, email: email || null,
      spot: spot || "",
      feeAmount,
      eventYear: EVENT_YEAR,
      addedBy: currentUser.uid,
      addedAt: serverTimestamp()
    });

    const badgeId = generateBadgeId("Machann");
    await createBadgeRecord({
      badgeId,
      name: fullName,
      category: "Machann",
      issuedByUid: currentUser.uid,
      issuedByName: currentProfile.name
    });

    const extraLine = spot ? `Plas: ${spot}. ` : "";
    const feeLine = feeAmount ? `Frè: ${feeAmount} goud. ` : "";
    try {
      await sendBadgeSms(phone, fullName, badgeId, "Machann", extraLine + feeLine);
      statusEl.textContent = `Anrejistre! Badj ${badgeId} voye pa SMS.`;
    } catch (smsErr) {
      statusEl.textContent = `Anrejistre (Badj: ${badgeId}), men SMS pa t voye: ${smsErr.message}`;
    }

    document.getElementById("vLastName").value = "";
    document.getElementById("vFirstName").value = "";
    document.getElementById("vPhone").value = "";
    document.getElementById("vEmail").value = "";
    document.getElementById("vSpot").value = "";
    document.getElementById("vFee").value = "";
    loadVendors();
  } catch (err) {
    statusEl.textContent = "Erè: " + err.message;
  }
});

async function loadVendors() {
  const grid = document.getElementById("vendorGrid");
  grid.innerHTML = "<p style='color:var(--text-dim);'>Ap chaje...</p>";

  const snap = await getDocs(query(
    collection(db, "vendors"),
    where("eventYear", "==", EVENT_YEAR),
    orderBy("addedAt", "desc")
  ));

  allVendors = [];
  snap.forEach((docSnap) => allVendors.push({ id: docSnap.id, ...docSnap.data() }));

  await Promise.all(allVendors.map(async (v) => {
    const paySnap = await getDocs(collection(db, "vendors", v.id, "payments"));
    let paid = 0;
    paySnap.forEach((p) => paid += (p.data().amount || 0));
    v.amountPaid = paid;
  }));

  renderSummary();
  renderVendorGrid();
}

function renderSummary() {
  const totalExpected = allVendors.reduce((sum, v) => sum + (v.feeAmount || 0), 0);
  const totalCollected = allVendors.reduce((sum, v) => sum + (v.amountPaid || 0), 0);
  document.getElementById("sumExpected").textContent = totalExpected.toLocaleString() + " G";
  document.getElementById("sumCollected").textContent = totalCollected.toLocaleString() + " G";
  document.getElementById("sumRemaining").textContent = (totalExpected - totalCollected).toLocaleString() + " G";
}

function renderVendorGrid() {
  const grid = document.getElementById("vendorGrid");
  if (allVendors.length === 0) {
    grid.innerHTML = "<p style='color:var(--text-dim);'>Pa gen machann anrejistre pou " + EVENT_YEAR + ".</p>";
    return;
  }

  grid.innerHTML = "";
  allVendors.forEach((v) => {
    const balance = (v.feeAmount || 0) - (v.amountPaid || 0);
    let balanceClass = "balance-none";
    if (balance <= 0) balanceClass = "balance-full";
    else if (v.amountPaid > 0) balanceClass = "balance-partial";

    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <h3>${v.firstName} ${v.lastName}</h3>
      <p>${v.spot || "—"}</p>
      <p class="${balanceClass}">Dwe: ${(v.feeAmount || 0).toLocaleString()} G · Peye: ${(v.amountPaid || 0).toLocaleString()} G</p>
      <p class="${balanceClass}" style="font-weight:700;">Rès: ${balance.toLocaleString()} G</p>
    `;
    card.addEventListener("click", () => openVendor(v));
    grid.appendChild(card);
  });
}

function showVendorList() {
  document.getElementById("vendorDetailPanel").classList.add("hidden");
  currentVendorId = null;
}

async function openVendor(v) {
  currentVendorId = v.id;
  document.getElementById("vendorDetailPanel").classList.remove("hidden");
  document.getElementById("vendorDetailTitle").textContent = `${v.firstName} ${v.lastName}`;
  document.getElementById("vendorDetailInfo").textContent =
    `${v.spot || "—"} · Tel: ${v.phone}${v.email ? " · " + v.email : ""} · Frè: ${(v.feeAmount || 0).toLocaleString()} G`;

  if (isAdminOrSuper()) {
    document.getElementById("addPaymentPanel").classList.remove("hidden");
  }

  await loadPayments();
}

document.getElementById("addPaymentBtn").addEventListener("click", async () => {
  if (!currentVendorId) return;
  const amount = parseFloat(document.getElementById("pAmount").value.trim()) || 0;
  const method = document.getElementById("pMethod").value;

  if (amount <= 0) { alert("Antre yon kantite valab."); return; }

  await addDoc(collection(db, "vendors", currentVendorId, "payments"), {
    amount, method,
    recordedBy: currentUser.uid,
    recordedByName: currentProfile.name,
    date: serverTimestamp()
  });

  document.getElementById("pAmount").value = "";
  await loadPayments();
  await loadVendors();
});

async function loadPayments() {
  const tbody = document.getElementById("paymentsTableBody");
  tbody.innerHTML = "<tr><td colspan='4'>Ap chaje...</td></tr>";

  const snap = await getDocs(query(collection(db, "vendors", currentVendorId, "payments"), orderBy("date", "desc")));
  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='4' style='color:var(--text-dim);'>Pa gen peman ankò.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const date = d.date ? d.date.toDate().toLocaleDateString() : "...";
    const row = document.createElement("tr");
    row.innerHTML = `<td>${date}</td><td>${(d.amount || 0).toLocaleString()} G</td><td>${d.method}</td><td>${d.recordedByName}</td>`;
    tbody.appendChild(row);
  });
}
