import { auth, db, storage } from "./firebase.js";
import { getUserRole } from "./firebase-roles.js";
import { FIREBASE_COLLECTIONS } from "./collections.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

let currentUser = null;
let currentRole = null;
let currentProfile = null;
let currentFolderId = null;

const folderGrid = document.getElementById("folderGrid");
const folderOverview = document.getElementById("folderOverview");
const folderDetail = document.getElementById("folderDetail");
const detailTitle = document.getElementById("detailTitle");
const newFolderPanel = document.getElementById("newFolderPanel");

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
    categories: []
  };

  init();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "login.html");
});

function isSuper() {
  return currentRole === "SUPER_ADMIN";
}

// ---------- Init ----------
function init() {
  document.getElementById("whoName").textContent = currentProfile.name || currentUser.email;

  const badge = document.getElementById("roleBadge");
  badge.textContent = isSuper() ? "SUPER ADMIN" : "ADMIN";
  badge.classList.add(isSuper() ? "super" : "admin");

  document.getElementById("overviewSub").textContent = isSuper()
    ? "Ou gen aksè a tout kazye yo."
    : "Ou gen aksè a kazye ki asiyen w yo.";

  if (isSuper()) {
    newFolderPanel.classList.remove("hidden");
  }

  loadFolders();
  document.getElementById("backBtn").addEventListener("click", showOverview);
}

// ---------- Kazye (folders) ----------
async function loadFolders() {
  folderGrid.innerHTML = "<p style='color:var(--text-dim);'>Ap chaje...</p>";

  const snap = await getDocs(query(collection(db, "folders"), orderBy("name")));
  const myCategories = currentProfile.categories || [];

  const visible = [];
  snap.forEach((docSnap) => {
    if (isSuper() || myCategories.includes(docSnap.id)) {
      visible.push({ id: docSnap.id, ...docSnap.data() });
    }
  });

  folderGrid.innerHTML = "";
  if (visible.length === 0) {
    folderGrid.innerHTML = "<p style='color:var(--text-dim);'>Pa gen kazye asiyen w kounye a.</p>";
    return;
  }

  visible.forEach((f) => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `<h3>${f.name}</h3><p>Klike pou louvri</p>`;
    card.addEventListener("click", () => openFolder(f.id, f.name));
    folderGrid.appendChild(card);
  });
}

document.getElementById("createFolderBtn").addEventListener("click", async () => {
  const name = document.getElementById("newFolderName").value.trim();
  if (!name) {
    alert("Tanpri antre non kazye a.");
    return;
  }
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  await setDoc(doc(db, "folders", id), {
    name: name,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp()
  });

  document.getElementById("newFolderName").value = "";
  loadFolders();
});

function openFolder(id, name) {
  currentFolderId = id;
  folderOverview.classList.add("hidden");
  folderDetail.classList.remove("hidden");
  detailTitle.textContent = name;
  loadFiles();
}

function showOverview() {
  folderDetail.classList.add("hidden");
  folderOverview.classList.remove("hidden");
  currentFolderId = null;
}

// ---------- Fichye anndan yon kazye ----------
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  const description = document.getElementById("fileDescription").value.trim();
  const statusEl = document.getElementById("uploadStatus");

  if (!fileInput.files.length) {
    alert("Chwazi yon fichye anvan.");
    return;
  }

  const file = fileInput.files[0];
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileId = Date.now() + "-" + safeName;
  const storagePath = `kazye/${currentFolderId}/${fileId}`;

  statusEl.textContent = "Ap telechaje...";

  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, "folders", currentFolderId, "files"), {
      fileName: file.name,
      description: description,
      storagePath: storagePath,
      downloadUrl: downloadUrl,
      uploadedBy: currentProfile.name || currentUser.email,
      uploadedByUid: currentUser.uid,
      uploadedAt: serverTimestamp()
    });

    fileInput.value = "";
    document.getElementById("fileDescription").value = "";
    statusEl.textContent = "Fichye a telechaje avèk siksè.";
    loadFiles();
  } catch (err) {
    statusEl.textContent = "Erè: " + err.message;
  }
});

async function loadFiles() {
  const tbody = document.getElementById("filesTableBody");
  tbody.innerHTML = "<tr><td colspan='5'>Ap chaje...</td></tr>";

  const q = query(collection(db, "folders", currentFolderId, "files"), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);

  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='5' style='color:var(--text-dim);'>Pa gen fichye ankò nan kazye sa a.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const date = d.uploadedAt ? d.uploadedAt.toDate().toLocaleString() : "...";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="${d.downloadUrl}" target="_blank" class="link-url">${d.fileName}</a></td>
      <td>${d.description || "—"}</td>
      <td>${d.uploadedBy}</td>
      <td>${date}</td>
      <td>${isSuper() ? `<button class="btn-danger" data-id="${docSnap.id}" data-path="${d.storagePath}">Efase</button>` : ""}</td>
    `;
    if (isSuper()) {
      row.querySelector("button").addEventListener("click", async () => {
        if (!confirm(`Efase "${d.fileName}"? Aksyon sa a pa ka defèt.`)) return;
        await deleteObject(ref(storage, d.storagePath));
        await deleteDoc(doc(db, "folders", currentFolderId, "files", docSnap.id));
        loadFiles();
      });
    }
    tbody.appendChild(row);
  });
}
