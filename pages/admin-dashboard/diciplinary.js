import { auth, db } from "./firebase.js";
import { getUserRole } from "./firebase-roles.js";
import { isCommitteeMember, isAdvisor } from "./disciplinary-roles.js";
import { FIREBASE_COLLECTIONS } from "./collections.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, addDoc, collection, getDocs, query,
  orderBy, limit, serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let currentRole = null;      // SUPER_ADMIN | ADMIN | NONE
let onCommittee = false;
let onAdvisory = false;
let currentProfile = null;
let currentCaseId = null;

const VOTE_THRESHOLD = 3; // minimòm vòt anvan Super Admin ka finalize

// ---------- Auth guard ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  currentUser = user;

  currentRole = await getUserRole(user.uid);
  onCommittee = await isCommitteeMember(user.uid);
  onAdvisory = await isAdvisor(user.uid);

  if (currentRole === "NONE" && !onCommittee && !onAdvisory) {
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

function isSuper() { return currentRole === "SUPER_ADMIN"; }
function isAdminOrSuper() { return currentRole === "SUPER_ADMIN" || currentRole === "ADMIN"; }

function logAudit(action, details) {
  return addDoc(collection(db, FIREBASE_COLLECTIONS.audit_logs), {
    action,
    details,
    performedBy: currentUser.uid,
    performedByName: currentProfile.name || currentUser.email,
    timestamp: serverTimestamp()
  });
}

// ---------- Init / navigation ----------
function init() {
  document.getElementById("whoName").textContent = currentProfile.name || currentUser.email;
  const badge = document.getElementById("roleBadge");
  let label = isSuper() ? "SUPER ADMIN" : (currentRole === "ADMIN" ? "ADMIN" : "");
  if (onCommittee) label += (label ? " · " : "") + "KOMITE";
  if (onAdvisory) label += (label ? " · " : "") + "KONSÈY";
  badge.textContent = label || "MANM";
  badge.classList.add(isSuper() ? "super" : "admin");

  if (isSuper() || onAdvisory) {
    document.getElementById("auditNavBtn").classList.remove("hidden");
  }

  document.querySelectorAll("#sectionNav button").forEach(btn => {
    btn.addEventListener("click", () => showSection(btn.dataset.target));
  });

  showSection("membersSection");

  if (!isAdminOrSuper()) {
    document.getElementById("addMemberPanel").classList.add("hidden");
  }

  document.getElementById("closeCaseBtn").addEventListener("click", () => {
    document.getElementById("caseDetailPanel").classList.add("hidden");
    currentCaseId = null;
  });
}

function showSection(id) {
  ["membersSection", "casesSection", "suspensionsSection", "appealsSection", "auditSection"].forEach(s => {
    document.getElementById(s).classList.toggle("hidden", s !== id);
  });
  if (id === "membersSection") loadMembers();
  if (id === "casesSection") loadCases();
  if (id === "suspensionsSection") loadSuspensions();
  if (id === "appealsSection") { loadAppeals(); populateAppealCaseSelect(); }
  if (id === "auditSection") loadAuditLog();
}

// ============================================================
// MANM YO
// ============================================================
document.getElementById("addMemberBtn").addEventListener("click", async () => {
  const name = document.getElementById("newMemberName").value.trim();
  if (!name) { alert("Antre non manm nan."); return; }

  const ref = await addDoc(collection(db, FIREBASE_COLLECTIONS.member_records), {
    name,
    warningCount: 0,
    status: "active",
    createdBy: currentUser.uid,
    createdAt: serverTimestamp()
  });
  await logAudit("member_added", `Ajoute manm: ${name}`);

  document.getElementById("newMemberName").value = "";
  loadMembers();
});

async function loadMembers() {
  const tbody = document.getElementById("membersTableBody");
  tbody.innerHTML = "<tr><td colspan='4'>Ap chaje...</td></tr>";

  const snap = await getDocs(query(collection(db, FIREBASE_COLLECTIONS.member_records), orderBy("name")));
  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='4' style='color:var(--text-dim);'>Pa gen manm ankò.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.name}</td>
      <td>${d.warningCount || 0} / 3</td>
      <td><span class="status-tag ${d.status === "active" ? "active" : "expired"}">${statusLabel(d.status)}</span></td>
      <td>${isAdminOrSuper() && d.status === "active" ? `<button class="btn-danger" data-id="${docSnap.id}" data-name="${d.name}">Bay Avètisman</button>` : ""}</td>
    `;
    if (isAdminOrSuper() && d.status === "active") {
      row.querySelector("button").addEventListener("click", () => issueWarning(docSnap.id, d.name, d.warningCount || 0));
    }
    tbody.appendChild(row);
  });
}

function statusLabel(status) {
  if (status === "suspended") return "Sispann";
  if (status === "dismissed") return "Revoke";
  return "Aktif";
}

async function issueWarning(memberId, memberName, currentCount) {
  const reason = prompt(`Rezon avètisman #${currentCount + 1} pou ${memberName}:`);
  if (reason === null) return;

  const newCount = currentCount + 1;

  await addDoc(collection(db, FIREBASE_COLLECTIONS.warnings), {
    memberId, memberName,
    warningNumber: newCount,
    reason: reason || "(pa presize)",
    issuedBy: currentUser.uid,
    issuedByName: currentProfile.name || currentUser.email,
    issuedAt: serverTimestamp()
  });

  await updateDoc(doc(db, FIREBASE_COLLECTIONS.member_records, memberId), {
    warningCount: increment(1)
  });

  await logAudit("warning_issued", `Avètisman #${newCount} pou ${memberName}: ${reason}`);

  if (newCount >= 3) {
    await addDoc(collection(db, FIREBASE_COLLECTIONS.disciplinary_cases), {
      memberId, memberName,
      reason: "3 avètisman rive",
      status: "pending_review",
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      finalDecision: null
    });
    await logAudit("case_created", `Ka disiplinè otomatik kreye pou ${memberName} (3 avètisman)`);
    alert(`${memberName} rive nan 3 avètisman — yon ka disiplinè kreye otomatikman.`);
  }

  loadMembers();
}

// ============================================================
// KA DISIPLINÈ
// ============================================================
async function loadCases() {
  const tbody = document.getElementById("casesTableBody");
  tbody.innerHTML = "<tr><td colspan='5'>Ap chaje...</td></tr>";

  if (!isAdminOrSuper() && !onCommittee && !onAdvisory) {
    tbody.innerHTML = "<tr><td colspan='5' style='color:var(--text-dim);'>Ou pa gen aksè a seksyon sa a.</td></tr>";
    return;
  }

  const snap = await getDocs(query(collection(db, FIREBASE_COLLECTIONS.disciplinary_cases), orderBy("createdAt", "desc")));
  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='5' style='color:var(--text-dim);'>Pa gen ka disiplinè.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const date = d.createdAt ? d.createdAt.toDate().toLocaleDateString() : "...";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.memberName}</td>
      <td>${d.reason}</td>
      <td><span class="status-tag ${d.status === "decided" ? "active" : "expired"}">${caseStatusLabel(d.status)}</span></td>
      <td>${date}</td>
      <td><button class="btn-secondary" data-id="${docSnap.id}">Louvri</button></td>
    `;
    row.querySelector("button").addEventListener("click", () => openCase(docSnap.id, d));
    tbody.appendChild(row);
  });
}

function caseStatusLabel(status) {
  if (status === "decided") return "Deside";
  if (status === "voting") return "Ap Vote";
  return "Ap Tann Revizyon";
}

async function openCase(caseId, caseData) {
  currentCaseId = caseId;
  document.getElementById("caseDetailPanel").classList.remove("hidden");
  document.getElementById("caseDetailTitle").textContent = caseData.memberName;
  document.getElementById("caseDetailInfo").textContent =
    `Rezon: ${caseData.reason} · Estati: ${caseStatusLabel(caseData.status)}` +
    (caseData.finalDecision ? ` · Desizyon final: ${voteLabel(caseData.finalDecision)}` : "");

  const voteFormWrap = document.getElementById("voteFormWrap");
  if (onCommittee && caseData.status !== "decided") {
    voteFormWrap.classList.remove("hidden");
  } else {
    voteFormWrap.classList.add("hidden");
  }

  await loadVotes(caseId, caseData);
}

document.getElementById("submitVoteBtn").addEventListener("click", async () => {
  if (!currentCaseId) return;
  const choice = document.getElementById("voteChoice").value;
  const comment = document.getElementById("voteComment").value.trim();

  await setDoc(doc(db, FIREBASE_COLLECTIONS.disciplinary_cases, currentCaseId, "votes", currentUser.uid), {
    vote: choice,
    comment: comment,
    votedByName: currentProfile.name || currentUser.email,
    votedAt: serverTimestamp()
  });

  await updateDoc(doc(db, FIREBASE_COLLECTIONS.disciplinary_cases, currentCaseId), { status: "voting" });
  await logAudit("vote_cast", `Vòt "${choice}" pou ka ${currentCaseId}`);

  document.getElementById("voteComment").value = "";
  const caseSnap = await getDoc(doc(db, FIREBASE_COLLECTIONS.disciplinary_cases, currentCaseId));
  loadVotes(currentCaseId, caseSnap.data());
  loadCases();
});

function voteLabel(v) {
  if (v === "sispann") return "Sispann";
  if (v === "revoke") return "Revoke";
  return "Egzante (klè)";
}

async function loadVotes(caseId, caseData) {
  const tbody = document.getElementById("votesTableBody");
  tbody.innerHTML = "<tr><td colspan='3'>Ap chaje...</td></tr>";

  const snap = await getDocs(collection(db, FIREBASE_COLLECTIONS.disciplinary_cases, caseId, "votes"));
  const tally = { sispann: 0, revoke: 0, "klè": 0 };

  tbody.innerHTML = "";
  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='3' style='color:var(--text-dim);'>Pa gen vòt ankò.</td></tr>";
  } else {
    snap.forEach((v) => {
      const d = v.data();
      tally[d.vote] = (tally[d.vote] || 0) + 1;
      const row = document.createElement("tr");
      row.innerHTML = `<td>${d.votedByName}</td><td>${voteLabel(d.vote)}</td><td>${d.comment || "—"}</td>`;
      tbody.appendChild(row);
    });
  }

  const finalizePanel = document.getElementById("finalizePanel");
  const totalVotes = snap.size;

  if (isSuper() && caseData.status !== "decided") {
    finalizePanel.classList.remove("hidden");
    const leading = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("tallySummary").textContent =
      `${totalVotes} vòt total (minimòm ${VOTE_THRESHOLD} mande). ` +
      (totalVotes > 0 ? `Desizyon ki pi popilè kounye a: ${voteLabel(leading[0])} (${leading[1]} vòt).` : "");
    document.getElementById("finalizeBtn").disabled = totalVotes < VOTE_THRESHOLD;
    document.getElementById("finalizeBtn").onclick = () => finalizeCase(caseId, caseData, leading[0]);
  } else {
    finalizePanel.classList.add("hidden");
  }
}

async function finalizeCase(caseId, caseData, decision) {
  if (!confirm(`Konfime desizyon final: "${voteLabel(decision)}" pou ${caseData.memberName}?`)) return;

  await updateDoc(doc(db, FIREBASE_COLLECTIONS.disciplinary_cases, caseId), {
    status: "decided",
    finalDecision: decision,
    decidedBy: currentUser.uid,
    decidedAt: serverTimestamp()
  });

  if (decision === "sispann") {
    await addDoc(collection(db, FIREBASE_COLLECTIONS.suspensions), {
      memberId: caseData.memberId,
      memberName: caseData.memberName,
      caseId: caseId,
      reason: caseData.reason,
      startDate: serverTimestamp(),
      endDate: null,
      status: "active",
      issuedBy: currentUser.uid,
      issuedAt: serverTimestamp()
    });
    await updateDoc(doc(db, FIREBASE_COLLECTIONS.member_records, caseData.memberId), { status: "suspended" });
  } else if (decision === "revoke") {
    await updateDoc(doc(db, FIREBASE_COLLECTIONS.member_records, caseData.memberId), { status: "dismissed" });
  } else {
    await updateDoc(doc(db, FIREBASE_COLLECTIONS.member_records, caseData.memberId), { warningCount: 0, status: "active" });
  }

  await logAudit("case_decided", `Ka ${caseId} deside: ${decision} pou ${caseData.memberName}`);

  document.getElementById("caseDetailPanel").classList.add("hidden");
  loadCases();
}

// ============================================================
// SISPANSYON
// =====================================================
