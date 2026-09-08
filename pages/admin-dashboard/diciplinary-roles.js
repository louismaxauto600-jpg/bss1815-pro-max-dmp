// js/disciplinary-roles.js
// Verifye si yon UID se manm Komite Disiplinè a oswa Konsèy Konsiltatif la.
// Baze sou egzistans dokiman nan koleksyon yo (pa yon lis "roles" separe),
// paske FIREBASE_COLLECTIONS deja gen "disciplinary_committee" ak
// "advisory_council" kòm pwòp koleksyon rostè yo.

import { db } from "./firebase.js";
import { FIREBASE_COLLECTIONS } from "./collections.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function isCommitteeMember(uid) {
  const snap = await getDoc(doc(db, FIREBASE_COLLECTIONS.disciplinary_committee, uid));
  return snap.exists() && snap.data().active !== false;
}

export async function isAdvisor(uid) {
  const snap = await getDoc(doc(db, FIREBASE_COLLECTIONS.advisory_council, uid));
  return snap.exists() && snap.data().active !== false;
}
