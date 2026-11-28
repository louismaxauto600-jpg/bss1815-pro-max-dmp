
/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR — LOCAL PILOT ACCESS
   FILE: scripts/issue-prof-avatar-access.js
   VERSION: 1.0.0
   SERVER / LOCAL TERMINAL ONLY
   ========================================================= */

"use strict";

const { issueAccess } =
  require("../netlify/lib/prof-avatar-access.js");

const PROJECTS = new Set([

  "bss1815",

  "pro-max-fm",

  "maximax",

  "academy",

  "beat-lab",

  "leogane-info",

  "ddn"

]);

/* GENERATE TEMPORARY PROF AVATAR ACCESS */

function main() {

  const [

    project,

    school = "",

    ...extra

  ] = process.argv.slice(2);

  /* PROJECT VALIDATION */

  if (

    !PROJECTS.has(project) ||

    extra.length ||

    school.length > 120 ||

    (school && project !== "academy")

  ) {

    throw new Error("INVALID_CONTEXT");

  }

  /* PILOT MODE PROTECTION */

  if (

    process.env.PROF_AVATAR_PILOT_ENABLED !== "true" ||

    process.env.PROF_AVATAR_PAID_ENABLED === "true"

  ) {

    throw new Error(

      "PILOT_NOT_ENABLED_OR_PAID_MODE"

    );

  }

  /* SERVER SECRET VALIDATION */

  if (

    Buffer.byteLength(

      process.env.PROF_AVATAR_ACCESS_SECRET || "",

      "utf8"

    ) < 32

  ) {

    throw new Error("ACCESS_NOT_CONFIGURED");

  }

  /* ISSUE TEMPORARY ACCESS TOKEN */

  const token = issueAccess({

    subject: "authorized-pilot-operator",

    project,

    school,

    ttl: 300

  });

  process.stdout.write(token + "\n");

}

/* SECURE EXECUTION */

try {

  main();

} catch (error) {

  process.stderr.write(

    "PROF AVATAR: " + error.message + "\n"

  );

  process.exitCode = 1;

}

/* =========================================================
   END — PROF AVATAR LOCAL PILOT ACCESS
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
