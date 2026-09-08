// FICHYE: /js/firebase-roles.js
// Adapte pou navigatè (CDN import) — menm lojik ak vèsyon orijinal ou a

import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Mete SUPER_ADMIN ak ADMIN yo nan Firestore
 * Rele sa yon sèl fwa pou inisyalizasyon
 */
export async function initRoles() {
  await setDoc(doc(db, "roles", "super_admins"), {
    users: [
      "UID_MAX",
      "UID_CANGE"
    ]
  });

  await setDoc(doc(db, "roles", "admins"), {
    users: []
  });
}

/**
 * Retounen wòl yon itilizatè selon UID li
 */
export async function getUserRole(uid) {
  const superSnap = await getDoc(doc(db, "roles", "super_admins"));
  const adminSnap = await getDoc(doc(db, "roles", "admins"));

  const superAdmins = superSnap.exists() ? superSnap.data().users : [];
  const admins = adminSnap.exists() ? adminSnap.data().users : [];

  if (superAdmins.includes(uid)) return "SUPER_ADMIN";
  if (admins.includes(uid)) return "ADMIN";
  return "NONE";
}

/**
 * Ajoute yon UID nan lis "admins" (sèlman Super Admin dwe rele sa)
 */
export async function addAdmin(uid) {
  await setDoc(doc(db, "roles", "admins"), {
    users: arrayUnion(uid)
  }, { merge: true });
}

/**
 * Retire yon UID nan lis "admins"
 */
export async function removeAdmin(uid) {
  await setDoc(doc(db, "roles", "admins"), {
    users: arrayRemove(uid)
  }, { merge: true });
}
