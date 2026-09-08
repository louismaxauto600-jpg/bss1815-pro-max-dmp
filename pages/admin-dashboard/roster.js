// js/roster.js — paj jenerik pou Musicians ak Leaders
// Itilize ?type=musicians oswa ?type=leaders nan URL la

import { auth, db, storage } from "./firebase.js";
import { getUserRole } from "./firebase-roles.js";
import { isCommitteeMember, isAdvisor } from "./disciplinary-roles.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const TYPES = {
  musicians: { label: "Mizisyen", collection: "musicians", storagePrefix: "musicians" },
  leaders: { label: "Dirijan", collection: "leaders", storagePrefix: "leaders" }
};

// Lis ofisyèl enstriman yo — orijinal ou yo + rechèch Rara Léogâne
const INSTRUMENT_GROUPS = {
  "Enstriman BSS": ["Gwaj", "Echap", "Asyèt", "Bass", "Charlemagne"],
  "Tradisyonèl Rara": [
    "Banbou (Vaksin)", "Banbou Bas", "Banbou Charlemagne", "Kònè / Klewon",
    "Tanbou Manman", "Tanbou Bas", "Kata", "Kès", "Tchatcha / Maraka",
    "Graj / Gita", "Kloch / Ogan", "Senbal"
  ],
  "Fanfa Modèn": [
    "Twonpèt", "Twonbòn", "Saksofòn Alto", "Saksofòn Tenò",
    "Gwo Kès Fanfa", "Ti Kès (Snare)", "Sousafòn / Tuba"
  ]
};

const params = new URLSearchParams(window.location.search);
const typeKey = TYPES[params.get("type")] ? params.get("type") : "musicians";
const config = TYPES[typeKey];

document.getElementById("pageTitle").textContent = `BSS 1815 · ${config.label.toUpperCase()}`;
document.getElementById("sectionTitle").textContent = config.label;
document.title = `${config.label} — PRO-MAX DMP`;

let currentUser = null;
let currentRole = null;
let onCommittee = false;
let onAdvisory = false;
let currentProfileName = null;
let allRosterItems = [];   // tout done ki chaje yo, pou filtre san re-fetch
let activeFilter = "Tout"; // enstriman/wòl aktyèlman seleksyone

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

  currentProfileName = user.email;
  init();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "login.html");
});

function isAdminOrSuper() {
  return currentRole === "SUPER_ADMIN" || currentRole === "ADMIN";
}

function init() {
  document.getElementById("whoName").textContent = currentProfileName;
  const badge = document.getElementById("roleBadge");
  badge.textContent = currentRole === "SUPER_ADMIN" ? "SUPER ADMIN" : (currentRole === "ADMIN" ? "ADMIN" : "MANM");
  badge.classList.add(currentRole === "SUPER_ADMIN" ? "super" : "admin");

  if (isAdminOrSuper()) {
    document.getElementById("addPanel").classList.remove("hidden");
  }

  setupRoleField();
  loadRoster();
}

function setupRoleField() {
  if (typeKey !== "musicians") return; // Dirijan yo rete ak chan tèks lib

  const wrap = document.getElementById("roleFieldWrap");
  const optgroups = Object.entries(INSTRUMENT_GROUPS).map(([groupName, items]) => `
    <optgroup label="${groupName}">
      ${items.map(i => `<option value="${i}">${i}</option>`).join("")}
    </optgroup>
  `).join("");

  wrap.innerHTML = `
    <label>Enstriman</label>
    <select id="newRoleTitle">
      ${optgroups}
      <option value="__other__">Lòt (tape manyèlman)</option>
    </select>
    <input type="text" id="newRoleTitleOther" placeholder="Non enstriman an" class="hidden" style="margin-top:8px;">
  `;

  document.getElementById("newRoleTitle").addEventListener("change", (e) => {
    document.getElementById("newRoleTitleOther").classList.toggle("hidden", e.target.value !== "__other__");
  });
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // retire aksan
    .replace(/[()\/]/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

function iconPathFor(instrumentName) {
  return `icon-${slugify(instrumentName)}.png`;
}

function getRoleTitleValue() {
  const select = document.getElementById("newRoleTitle");
  if (typeKey === "musicians" && select.value === "__other__") {
    return document.getElementById("newRoleTitleOther").value.trim();
  }
  return select.value.trim();
}

document.getElementById("addBtn").addEventListener("click", async () => {
  const name = document.getElementById("newName").value.trim();
  const roleTitle = getRoleTitleValue();
  const phone = document.getElementById("newPhone").value.trim();
  const photoFile = document.getElementById("newPhoto").files[0];
  const statusEl = document.getElementById("addStatus");

  if (!name) { alert("Antre non moun nan."); return; }

  statusEl.textContent = "Ap ajoute...";

  try {
    let photoUrl = null;
    if (photoFile) {
      const safeName = Date.now() + "-" + photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageRef = ref(storage, `${config.storagePrefix}/${safeName}`);
      await uploadBytes(storageRef, photoFile);
      photoUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, config.collection), {
      name,
      roleTitle: roleTitle || "",
      phone: phone || "",
      photoUrl,
      addedBy: currentUser.uid,
      addedAt: serverTimestamp()
    });

    document.getElementById("newName").value = "";
    if (typeKey === "musicians") {
      document.getElementById("newRoleTitle").selectedIndex = 0;
      document.getElementById("newRoleTitleOther").value = "";
      document.getElementById("newRoleTitleOther").classList.add("hidden");
    } else {
      document.getElementById("newRoleTitle").value = "";
    }
    document.getElementById("newPhone").value = "";
    document.getElementById("newPhoto").value = "";
    statusEl.textContent = "Ajoute avèk siksè.";
    loadRoster();
  } catch (err) {
    statusEl.textContent =
