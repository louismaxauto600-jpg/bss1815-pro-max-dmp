import { auth, db } from "./firebase.js";
import { getUserRole } from "./firebase-roles.js";
import { isCommitteeMember, isAdvisor } from "./disciplinary-roles.js";
import { FIREBASE_COLLECTIONS } from "./collections.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, getDoc, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let currentRole = null;
let currentProfile = null;
let currentConvId = null;
let currentPartnerUid = null;
let currentPartnerName = null;

const convListSection = document.getElementById("convListSection");
const threadSection = document.getElementById("threadSection");

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  currentUser = user;

  currentRole = await getUserRole(user.uid);
  const onCommittee = await isCommitteeMember(user.uid);
  const onAdvisory = await isAdvisor(user.uid);

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

function init() {
  document.getElementById("whoName").textContent = currentProfile.name || currentUser.email;
  const badge = document.getElementById("roleBadge");
  badge.textContent = currentRole === "SUPER_ADMIN" ? "SUPER ADMIN" : (currentRole === "ADMIN" ? "ADMIN" : "MANM");
  badge.classList.add(currentRole === "SUPER_ADMIN" ? "super" : "admin");

  populateRecipientSelect();
  loadConversations();

  document.getElementById("backToListBtn").addEventListener("click", showList);
  document.getElementById("startConvBtn").addEventListener("click", startNewConversation);
  document.getElementById("sendMsgBtn").addEventListener("click", sendMessage);
  document.getElementById("msgInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

function conversationId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

async function populateRecipientSelect() {
  const select = document.getElementById("newConvSelect");
  select.innerHTML = "";
  const snap = await getDocs(collection(db, FIREBASE_COLLECTIONS.administrative_team));
  snap.forEach((docSnap) => {
    if (docSnap.id === currentUser.uid) return;
    const opt = document.createElement("option");
    opt.value = docSnap.id;
    opt.textContent = docSnap.data().name || docSnap.id;
    select.appendChild(opt);
  });
}

function startNewConversation() {
  const select = document.getElementById("newConvSelect");
  const uid = select.value;
  const name = select.options[select.selectedIndex]?.textContent;
  if (!uid) { alert("Pa gen okenn moun disponib pou ekri."); return; }
  openThread(uid, name);
}

async function loadConversations() {
  const listEl = document.getElementById("convList");
  listEl.innerHTML = "<p style='color:var(--text-dim);'>Ap chaje...</p>";

  const q = query(
    collection(db, "messages"),
    where("participants", "array-contains", currentUser.uid),
    orderBy("timestamp", "desc")
  );
  const snap = await getDocs(q);

  const seen = new Map();
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    if (!seen.has(d.conversationId)) {
      const otherUid = d.participants.find(p => p !== currentUser.uid);
      seen.set(d.conversationId, { otherUid, lastText: d.text, lastSenderUid: d.senderUid });
    }
  });

  listEl.innerHTML = "";
  if (seen.size === 0) {
    listEl.innerHTML = "<p style='color:var(--text-dim);'>Pa gen konvèsasyon ankò.</p>";
    return;
  }

  for (const [convId, info] of seen.entries()) {
    const profileSnap = await getDoc(doc(db, FIREBASE_COLLECTIONS.administrative_team, info.otherUid));
    const name = profileSnap.exists() ? profileSnap.data().name : info.otherUid;
    const item = document.createElement("div");
    item.className = "conv-item";
    const prefix = info.lastSenderUid === currentUser.uid ? "Ou: " : "";
    item.innerHTML = `<strong>${name}</strong><div style="color:var(--text-dim); font-size:0.85rem;">${prefix}${info.lastText}</div>`;
    item.addEventListener("click", () => openThread(info.otherUid, name));
    listEl.appendChild(item);
  }
}

function showList() {
  threadSection.classList.add("hidden");
  convListSection.classList.remove("hidden");
  currentConvId = null;
  loadConversations();
}

async function openThread(partnerUid, partnerName) {
  currentPartnerUid = partnerUid;
  currentPartnerName = partnerName;
  currentConvId = conversationId(currentUser.uid, partnerUid);

  convListSection.classList.add("hidden");
  threadSection.classList.remove("hidden");
  document.getElementById("threadTitle").textContent = partnerName;

  await loadThread();
}

async function loadThread() {
  const threadEl = document.getElementById("msgThread");
  threadEl.innerHTML = "<p style='color:var(--text-dim);'>Ap chaje...</p>";

  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", currentConvId),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);

  threadEl.innerHTML = "";
  if (snap.empty) {
    threadEl.innerHTML = "<p style='color:var(--text-dim);'>Pa gen mesaj ankò. Voye premye a!</p>";
    return;
  }

  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const isMine = d.senderUid === currentUser.uid;
    const time = d.timestamp ? d.timestamp.toDate().toLocaleString() : "...";
    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${isMine ? "msg-mine" : "msg-theirs"}`;
    bubble.innerHTML = `${d.text}<div class="msg-meta">${time}</div>`;
    threadEl.appendChild(bubble);
  });

  threadEl.scrollTop = threadEl.scrollHeight;
}

async function se
