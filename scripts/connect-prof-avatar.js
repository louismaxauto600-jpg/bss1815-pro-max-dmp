/* =========================================================
   BSS1815 PRO-MAX DMP
   PROF AVATAR — CENTRAL AI CENTER CONNECTION
   FILE: scripts/connect-prof-avatar.js
   VERSION: 1.0.0
   ========================================================= */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const target = path.join(root, "ai-center.html");

const files = [

  "prof-avatar-controller.js",

  "prof-avatar-live-adapter.js",

  "prof-avatar-integration.js",

  "prof-avatar-ui.js",

  "prof-avatar-transport.js"

];

const marker =
  "<!-- BSS1815 PROF AVATAR LIVE CONNECTION -->";

/* CENTRAL AI CENTER CONNECTION */

function main() {

  const original = fs.readFileSync(
    target,
    "utf8"
  );

  /* VERIFY EXISTING AI CENTER */

  const ids = [

    "aiProfAvatar",

    "centralAIForm",

    "aiPrompt",

    "aiResponse",

    "activeProject",

    "school"

  ];

  for (const id of ids) {

    if (!original.includes(`id="${id}"`)) {

      throw new Error(
        "Missing AI Center element: " + id
      );

    }

  }

  /* VERIFY ALL AVATAR MODULES */

  for (const file of files) {

    if (!fs.statSync(path.join(root, file)).isFile()) {

      throw new Error(
        "Missing script: " + file
      );

    }

  }

  /* PRESERVE ORIGINAL HTML FORMAT */

  const nl = original.includes("\r\n")
    ? "\r\n"
    : "\n";

  const block = [

    marker,

    ...files.map(
      file => `<script src="./${file}" defer></script>`
    ),

    "<!-- END BSS1815 PROF AVATAR LIVE CONNECTION -->"

  ].join(nl);

  /* PREVENT DUPLICATE INSTALLATION */

  if (original.includes(block)) {

    console.log(
      "ALREADY CONNECTED — no changes."
    );

    return;

  }

  if (

    original.includes(marker) ||

    files.some(file => original.includes(file))

  ) {

    throw new Error(
      "Existing partial integration — no changes made."
    );

  }

  /* VERIFY HTML STRUCTURE */

  if (

    (original.match(/<\/body>/gi) || []).length !== 1

  ) {

    throw new Error(
      "Invalid body structure — no changes made."
    );

  }

  /* CONNECT ALL PROF AVATAR MODULES */

  const updated = original.replace(

    /<\/body>/i,

    match => block + nl + nl + match

  );

  /* SECURE LOCAL UPDATE */

  const temporary =
    target + ".prof-avatar.tmp";

  fs.writeFileSync(

    temporary,

    updated,

    { flag: "wx" }

  );

  try {

    if (

      fs.readFileSync(target, "utf8") !== original

    ) {

      throw new Error(
        "Source changed during update."
      );

    }

    fs.renameSync(

      temporary,

      target

    );

  } finally {

    if (fs.existsSync(temporary)) {

      fs.unlinkSync(temporary);

    }

  }

  console.log(
    "CONNECTED — ai-center.html updated locally."
  );

}

/* EXECUTE CONNECTION */

try {

  main();

} catch (error) {

  console.error(
    "PROF AVATAR: " + error.message
  );

  process.exitCode = 1;

}

/* =========================================================
   END — PROF AVATAR CENTRAL CONNECTION
   BSS1815 PRO-MAX DMP
   DEVAN DEVAN NÈT
   ========================================================= */
