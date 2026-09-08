import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const content = document.getElementById("verifyContent");

async function verify() {
  const params = new URLSearchParams(window.location.search);
  const badgeId = params.get("id");

  if (!badgeId) {
    content.innerHTML = `
      <div class="verify-icon">⚠️</div>
      <div class="verify-status invalid">PA GEN ID BADJ</div>
      <div class="verify-detail">Okenn kòd badj pa jwenn nan lyen sa a.</div>
    `;
    return;
  }

  try {
    const snap = await getDoc(doc(db, "badges", badgeId));

    if (!snap.exists()) {
      content.innerHTML = `
        <div class="verify-icon">❌</div>
        <div class="verify-status invalid">BADJ PA JWENN</div>
        <div class="verify-detail">ID: ${badgeId}</div>
        <div class="verify-detail">Badj sa a pa egziste nan sistèm nan.</div>
      `;
      return;
    }

    const d = snap.data();
    const isRevoked = d.status === "revoked";
    const date = d.issuedAt ? d.issuedAt.toDate().toLocaleDateString() : "...";

    if (isRevoked) {
      content.innerHTML = `
        <div class="verify-icon">🚫</div>
        <div class="verify-status invalid">BADJ REVOKE</div>
        <div class="verify-name">${d.name}</div>
        <div class="verify-detail">${d.category}</div>
        <div class="verify-detail">Badj sa a PA VALID ankò.</div>
      `;
    } else {
      content.innerHTML = `
        <div class="verify-icon">✅</div>
        <div class="verify-status valid">BADJ VALID</div>
        <div class="verify-name">${d.name}</div>
        <div class="verify-detail">${d.category}</div>
        <div class="verify-detail">Delivre: ${date}</div>
        <div class="verify-detail" style="margin-top:8px; font-family:monospace;">${badgeId}</div>
      `;
    }
  } catch (err) {
    content.innerHTML = `
      <div class="verify-icon">⚠️</div>
      <div class="verify-status invalid">ERÈ VERIFIKASYON</div>
      <div class="verify-detail">${err.message}</div>
    `;
  }
}

verify();
