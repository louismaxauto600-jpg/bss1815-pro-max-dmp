
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR SECURE ACCESS
   FILE: netlify/lib/prof-avatar-access.js
   VERSION: 1.0.0
   SERVER ONLY
   ========================================================= */

"use strict";

const {
  createHmac,
  timingSafeEqual,
  randomUUID
} = require("node:crypto");

const AUDIENCE = "bss1815-prof-avatar";

const MAX_TTL = 300;

/* SECURE SERVER SECRET */

function secret() {

  const key =
    process.env.PROF_AVATAR_ACCESS_SECRET || "";

  if (Buffer.byteLength(key, "utf8") < 32) {

    throw new Error("ACCESS_NOT_CONFIGURED");

  }

  return key;

}

/* TOKEN SIGNATURE */

function signature(payload) {

  return createHmac("sha256", secret())
    .update(payload)
    .digest();

}

/* PROJECT AND SCHOOL VALIDATION */

function context(project, school = "") {

  if (

    typeof project !== "string" ||

    typeof school !== "string"

  ) {

    throw new Error("INVALID_CONTEXT");

  }

  project = project.trim().toLowerCase();

  school = school.trim().toLowerCase();

  if (

    !/^[a-z0-9-]{1,80}$/.test(project) ||

    school.length > 120

  ) {

    throw new Error("INVALID_CONTEXT");

  }

  return {

    project,

    school

  };

}

/* =========================================================
   ISSUE TEMPORARY ACCESS
   SERVER ONLY — CALL AFTER VERIFYING USER PERMISSION
   ========================================================= */

function issueAccess({

  subject,

  project,

  school = "",

  ttl = MAX_TTL

} = {}) {

  if (

    typeof subject !== "string" ||

    !subject.trim() ||

    subject.length > 160 ||

    !Number.isInteger(ttl) ||

    ttl < 1 ||

    ttl > MAX_TTL

  ) {

    throw new Error("INVALID_ACCESS_REQUEST");

  }

  const now =
    Math.floor(Date.now() / 1000);

  const claims = {

    aud: AUDIENCE,

    sub: subject.trim(),

    ...context(project, school),

    iat: now,

    exp: now + ttl,

    jti: randomUUID(),

    scope: [

      "avatar-session",

      "speak"

    ]

  };

  const payload = Buffer.from(

    JSON.stringify(claims)

  ).toString("base64url");

  return payload +

    "." +

    signature(payload).toString("base64url");

}

/* =========================================================
   VERIFY STUDENT / CUSTOMER AVATAR ACCESS
   ========================================================= */

function verifyAccess(event, data) {

  try {

    const header =

      event.headers?.authorization ||

      event.headers?.Authorization ||

      "";

    if (

      typeof header !== "string" ||

      !header.startsWith("Bearer ") ||

      header.length > 4096

    ) {

      return null;

    }

    const parts =
      header.slice(7).split(".");

    if (

      parts.length !== 2 ||

      parts.some(
        p => !/^[A-Za-z0-9_-]+$/.test(p)
      )

    ) {

      return null;

    }

    const [payload, encoded] = parts;

    const actual =
      Buffer.from(encoded, "base64url");

    const expected =
      signature(payload);

    if (

      actual.length !== expected.length ||

      actual.toString("base64url") !== encoded ||

      !timingSafeEqual(actual, expected)

    ) {

      return null;

    }

    const claims = JSON.parse(

      Buffer.from(payload, "base64url")
        .toString("utf8")

    );

    const now =
      Math.floor(Date.now() / 1000);

    if (

      claims?.aud !== AUDIENCE ||

      typeof claims.sub !== "string" ||

      !claims.sub ||

      typeof claims.jti !== "string" ||

      !Number.isInteger(claims.iat) ||

      !Number.isInteger(claims.exp) ||

      claims.iat > now ||

      claims.exp <= now ||

      claims.exp <= claims.iat ||

      claims.exp - claims.iat > MAX_TTL

    ) {

      return null;

    }

    if (

      !["avatar-session", "speak"]
        .includes(data?.action) ||

      !Array.isArray(claims.scope) ||

      !claims.scope.includes(data.action)

    ) {

      return null;

    }

    const requested = context(

      data.project,

      data.school ?? ""

    );

    if (

      claims.project !== requested.project ||

      claims.school !== requested.school

    ) {

      return null;

    }

    return Object.freeze({

      subject: claims.sub,

      project: claims.project,

      school: claims.school,

      expiresAt: claims.exp,

      id: claims.jti

    });

  } catch {

    return null;

  }

}

/* CENTRAL AI BACKEND EXPORT */

module.exports = {

  issueAccess,

  verifyAccess

};

/* =========================================================
   END — PROF AVATAR SECURE ACCESS
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
