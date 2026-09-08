import { auth, db } from "./firebase.js";
import { getUserRole, addAdmin, removeAdmin } from "./firebase-roles.js";
import { FIREBASE_COLLECTIONS } from "./collections.js";
import { PROJECTS } from "./project-list.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs,
  addDoc, query, where, orderBy, limit, Timestamp, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let currentRole = null;      // "SUPER_ADMIN" | "ADMIN"
let currentProfile = null;   // done ki soti nan administrative_team

const projectGrid = document.getElementById("projectGrid");
const projectOverview = document.getElementById("projectOverview");
const projectDetail = document.getElementById("projectDetail");
const detailTitle = document.getElementById("detailTitle");
const fmPanel = document.getElementById("fmPanel");
const adminManagement = document.getElementById("adminManagement");

// ---------- Auth guard ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;

  currentRole = await getUserRole(user.uid);
  if (currentRole === "NONE") {
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  const profileSnap = await getDoc(doc(db, FIREBASE_COLLECTIONS.administrative_team, user.uid));
  currentProfile = profileSnap.exists() ? profileSnap.data() : {
    name: user.email,
    projects: [],
    categories: []
  };

  initDashboard();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "login.html");
});

function isSuper() {
  return currentRole === "SUPER_ADMIN";
}

// ---------- Init ----------
function initDashboard() {
  document.getElementById("whoName").textContent = currentProfile.name || currentUser.email;

  const badge = document.getElementById("roleBadge");
  badge.textContent = isSuper() ? "SUPER ADMIN" : "ADMIN";
  badge.classList.add(isSuper() ? "super" : "admin");

  const myProjects = isSuper() ? Object.keys(PROJECTS) : (currentProfile.projects || []);

  document.getElementById("overviewSub").textContent = isSuper()
    ? "Ou gen aksè a tout pwojè yo."
    : "Ou gen aksè a pwojè ki asiyen w yo.";

  renderProjectGrid(myProjects);

  if (isSuper()) {
    adminManagement.classList.remove("hidden");
    populateProjectSelect();
    loadAdminsList();
  }

  document.getElementById("backBtn").addEventListener("click", showOverview);
}

function renderProjectGrid(projectIds) {
  projectGrid.innerHTML = "";
  projectIds.forEach((id) => {
    const name = PROJECTS[id] || id;
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `<h3>${name}</h3><p>Klike pou jere</p>`;
    card.addEventListener("click", () => openProject(id, name));
    projectGrid.appendChild(card);
  });

  if (projectIds.length === 0) {
    projectGrid.innerHTML = `<p style="color:var(--text-dim);">Pa gen okenn pwojè asiyen w kounye a.</p>`;
  }
}

function openProject(id, name) {
  projectOverview.classList.add("hidden");
  projectDetail.classList.remove("hidden");
  detailTitle.textContent = name;

  if (id === "promax-fm") {
    fmPanel.classList.remove("hidden");
    loadLinksList();
  } else {
    fmPanel.classList.add("hidden");
  }
}

function showOverview() {
  projectDetail.classList.add("hidden");
  projectOverview.classList.remove("hidden");
}

// ---------- Pro-Max FM: lyen tanporè ----------
document.getElementById("generateLinkBtn").addEventListener("click", async () => {
  const name = document.getElementById("animatorName").value.trim();
  const hours = parseInt(document.getElementById("linkDuration").value, 10);

  if (!name) {
    alert("Tanpri antre non animatè a.");
    return;
  }

  const linkId = Math.random().toString(36).slice(2, 10);
  const url = `${window.location.origin}/fm-live.html?token=${linkId}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

  await addDoc(collection(db, "links"), {
    animatorName: name,
    projectId: "promax-fm",
    url: url,
    token: linkId,
    createdAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(expiresAt),
    createdBy: currentUser.uid
  });

  document.getElementById("animatorName").value = "";
  loadLinksList();
});

async function loadLinksList() {
  const tbody = document.getElementById("linksTableBody");
  tbody.innerHTML = "<tr><td colspan='5'>Ap chaje...</td></tr>";

  const q = query(
    collection(db, "links"),
    where("projectId", "==", "promax-fm"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='5' style='color:var(--text-dim);'>Pa gen lyen kreye ankò.</td></tr>";
    return;
  }

  const now = new Date();
  tbody.innerHTML = "";
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const expires = d.expiresAt.toDate();
    const isActive = expires > now;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.animatorName}</td>
      <td class="link-url">${d.url}</td>
      <td>${expires.toLocaleString()}</td>
      <td><span class="status-tag ${isActive ? "active" : "expired"}">${isActive ? "Aktif" : "Ekspire"}</span></td>
      <td><button class="btn-danger" data-id="${docSnap.id}">Retire</button></td>
    `;
    row.querySelector("button").addEventListener("click", async () => {
      await deleteDoc(doc(db, "links", docSnap.id));
      loadLinksList();
    });
    tbody.appendChild(row);
  });
}

// ---------- Jesyon Admin (Super Admin sèlman) ----------
function populateProjectSelect() {
  const select = document.getElementById("newAdminProject");
  select.innerHTML = "";
  Object.entries(PROJECTS).forEach(([id, name]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

document.getElementById("addAdminBtn").addEventListener("click", async () => {
  const uid = document.getElementById("newAdminUid").value.trim();
  const name = document.getElementById("newAdminName").value.trim();
  const role = document.getElementById("newAdminRole").value;
  const project = document.getElementById("newAdminProject").value;
  const categoriesRaw = document.getElementById("newAdminCategories").value.trim();
  const categories = categoriesRaw
    ? categoriesRaw.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
    : [];

  if (!uid || !name) {
    alert("Tanpri antre UID ak non an.");
    return;
  }

  if (role === "admin") {
    await addAdmin(uid);
  }

  await setDoc(doc(db, FIREBASE_COLLECTIONS.administrative_team, uid), {
    name: name,
    projects: role === "super-admin" ? Object.keys(PROJECTS) : [project],
    categories: categories,
    active: true,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp()
  });

  document.getElementById("newAdminUid").value = "";
  document.getElementById("newAdminName").value = "";
  document.getElementById("newAdminCategories").value = "";
  loadAdminsList();
});

async function loadAdminsList() {
  const tbody = document.getElementById("adminsTableBody");
  tbody.innerHTML = "<tr><td colspan='5'>Ap chaje...</td></tr>";

  const snap = await getDocs(collection(db, FIREBASE_COLLECTIONS.administrative_team));
  tbody.innerHTML = "";

  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const projectNames = (d.projects || []).map(p => PROJECTS[p] || p).join(", ");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.name}</td>
      <td>${projectNames}</td>
      <td>${(d.categories || []).join(", ") || "—"}</td>
      <td><span class="status-tag ${d.active === false ? "expired" : "active"}">${d.active === false ? "Dezaktive" : "Aktif"}</span></td>
      <td><button class="btn-secondary" data-id="${docSnap.id}" data-active="${d.active !== false}">
        ${d.active === false ? "Aktive" : "Dezaktive"}
      </button></td>
    `;
    row.querySelector("button").addEventListener("click", async (e) => {
      const isActive = e.target.dataset.active === "true";
      await updateDoc(doc(db, FIREBASE_COLLECTIONS.administrative_team, docSnap.id), { active: !isActive });
      if (isActive) {
        await removeAdmin(docSnap.id);
      } else {
        await addAdmin(docSnap.id);
      }
      loadAdminsList();
    });
    tbody.appendChild(row);
  });
}
