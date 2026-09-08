// badge-utils.js — Fonksyon pataje pou jenere badj ak voye SMS
// Itilize pa vendors.js ak badges.js

import { db } from "./firebase.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const CATEGORY_CODES = {
  "Machann": "MC",
  "Manm": "MB",
  "Mizisyen": "MZ",
  "Dirijan": "DJ",
  "Admin": "AD"
};

export function generateBadgeId(category) {
  const code = CATEGORY_CODES[category] || "GN";
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `BSS-${code}-${rand}`;
}

export async function createBadgeRecord({ badgeId, name, category, issuedByUid, issuedByName }) {
  await setDoc(doc(db, "badges", badgeId), {
    name,
    category,
    status: "active",
    issuedByUid,
    issuedByName,
    issuedAt: serverTimestamp()
  });
}

export async function sendBadgeSms(phone, name, badgeId, category, extraLine = "") {
  const verifyUrl = `${window.location.origin}/pages/admin-dashboard/verify.html?id=${badgeId}`;
  const message =
    `BSS1815: ${name} anrejistre kòm ${category}. ` +
    `Badj ou: ${badgeId}. ${extraLine}` +
    `Verifye: ${verifyUrl}`;

  const res = await fetch("/.netlify/functions/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message })
  });

  return res.json();
}
