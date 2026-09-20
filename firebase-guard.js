/* ==========================================================
   BSS1815 PRO-MAX DMP
   FIREBASE AUTH + ROLE GUARD
   File: firebase-guard.js

   PURPOSE:
   - Protect MY MAXIMAX
   - Protect internal BSS1815 pages
   - Require Firebase login
   - Support Super Admin / Admin / Moderator
   - Redirect unauthorized users
========================================================== */

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


/* ==========================================================
   FIREBASE CONFIG
   BSS1815 CENTRAL FIREBASE PROJECT
========================================================== */

const firebaseConfig = {

  apiKey:
    "AIzaSyB24Sbq_ud2qSFtdHwRhiKelokeIjCtDuY",

  authDomain:
    "briyant-soley-signo-1815.firebaseapp.com",

  projectId:
    "briyant-soley-signo-1815",

  storageBucket:
    "briyant-soley-signo-1815.firebasestorage.app"

};


/* ==========================================================
   INITIALIZE FIREBASE
========================================================== */

const app =
  getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getFirestore(app);


/* ==========================================================
   PAGE CONFIGURATION

   Add this BEFORE firebase-guard.js on pages that need
   special permissions:

   window.BSS_PAGE_ACCESS = ["super-admin"];

   OR:

   window.BSS_PAGE_ACCESS = [
      "super-admin",
      "admin"
   ];

========================================================== */

const defaultAllowedRoles = [
  "super-admin",
  "admin",
  "moderator"
];

const pageAllowedRoles =
  Array.isArray(window.BSS_PAGE_ACCESS)
    ? window.BSS_PAGE_ACCESS
    : defaultAllowedRoles;


/* ==========================================================
   LOGIN PAGE
========================================================== */

const LOGIN_PAGE =
  "admin-login.html";

const MY_MAXIMAX_PAGE =
  "my-maximax-dashboard.html";


/* ==========================================================
   SECURITY SCREEN
========================================================== */

const securityScreen =
  document.createElement("div");

securityScreen.id =
  "bssSecurityScreen";

securityScreen.innerHTML = `

  <div class="bss-security-box">

    <div class="bss-security-logo">
      🔐
    </div>

    <h1>
      BSS1815 PRO-MAX DMP
    </h1>

    <h2>
      MY MAXIMAX
    </h2>

    <p id="bssSecurityMessage">
      Verifikasyon aksè an kou...
    </p>

    <div class="bss-loader"></div>

  </div>

`;

document.documentElement.appendChild(
  securityScreen
);


/* ==========================================================
   SECURITY SCREEN STYLE
========================================================== */

const securityStyle =
  document.createElement("style");

securityStyle.textContent = `

#bssSecurityScreen{

  position:fixed;

  inset:0;

  z-index:999999999;

  display:flex;

  align-items:center;

  justify-content:center;

  padding:25px;

  background:
  radial-gradient(
    circle at top right,
    rgba(255,121,0,.20),
    transparent 35%
  ),
  linear-gradient(
    145deg,
    #000000,
    #090401,
    #170900
  );

  color:#fff;

  font-family:
  Arial,
  Helvetica,
  sans-serif;

}


.bss-security-box{

  width:min(460px,100%);

  padding:38px 25px;

  text-align:center;

  border:

  1px solid
  rgba(255,173,77,.60);

  border-radius:24px;

  background:
  rgba(0,0,0,.86);

  box-shadow:

  0 25px 70px
  rgba(0,0,0,.70),

  0 0 35px
  rgba(255,121,0,.12);

}


.bss-security-logo{

  width:78px;

  height:78px;

  display:flex;

  align-items:center;

  justify-content:center;

  margin:

  0 auto
  20px;

  border:

  2px solid
  #ff7900;

  border-radius:50%;

  background:#080401;

  font-size:2rem;

  box-shadow:

  0 0 30px
  rgba(255,121,0,.20);

}


.bss-security-box h1{

  margin:0;

  color:#ffad4d;

  font-size:1.45rem;

}


.bss-security-box h2{

  margin:

  8px 0
  20px;

  color:#ff7900;

  font-size:1rem;

  letter-spacing:2px;

}


.bss-security-box p{

  color:#d6bda5;

  line-height:1.6;

}


.bss-loader{

  width:42px;

  height:42px;

  margin:

  24px auto
  0;

  border:

  4px solid
  rgba(255,121,0,.18);

  border-top-color:
  #ff7900;

  border-radius:50%;

  animation:

  bssSpin
  .8s linear
  infinite;

}


@keyframes bssSpin{

  to{
    transform:
    rotate(360deg);
  }

}

`;

document.head.appendChild(
  securityStyle
);


/* ==========================================================
   SECURITY MESSAGE
========================================================== */

function securityMessage(message){

  const el =
    document.getElementById(
      "bssSecurityMessage"
    );

  if(el){
    el.textContent =
      message;
  }

}


/* ==========================================================
   NORMALIZE ROLE
========================================================== */

function normalizeRole(role){

  if(!role){
    return "";
  }

  return String(role)

    .trim()

    .toLowerCase()

    .replace(/_/g,"-")

    .replace(/\s+/g,"-");

}


/* ==========================================================
   FIND USER PROFILE

   Expected Firestore collection:

   users/{firebaseUID}

   Example:

   {
      name: "Max Louis",
      email: "...",
      role: "super-admin",
      active: true
   }

========================================================== */

async function getUserProfile(user){

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );

  const snapshot =
    await getDoc(
      userRef
    );

  if(!snapshot.exists()){

    return null;

  }

  return {

    id:
      snapshot.id,

    ...snapshot.data()

  };

}


/* ==========================================================
   CHECK ROLE
========================================================== */

function roleAllowed(role){

  const normalized =
    normalizeRole(role);

  return pageAllowedRoles
    .map(normalizeRole)
    .includes(normalized);

}


/* ==========================================================
   DENY ACCESS
========================================================== */

async function denyAccess(message){

  securityMessage(
    message
  );

  try{

    await signOut(auth);

  }catch(error){

    console.warn(
      "Logout error:",
      error
    );

  }

  setTimeout(()=>{

    window.location.replace(
      LOGIN_PAGE
    );

  },1600);

}


/* ==========================================================
   UPDATE PAGE USER INFORMATION
========================================================== */

function updateUserInterface(
  user,
  profile
){

  const name =

    profile?.name ||

    profile?.displayName ||

    user.displayName ||

    user.email ||

    "BSS1815 Admin";


  const role =

    normalizeRole(
      profile?.role
    );


  const userNameTargets = [

    document.getElementById(
      "userName"
    ),

    document.getElementById(
      "whoName"
    )

  ];


  userNameTargets.forEach(
    element=>{

      if(element){

        element.textContent =
          name;

      }

    }
  );


  const roleBadge =
    document.getElementById(
      "roleBadge"
    );


  if(roleBadge){

    roleBadge.textContent =

      role
        .replace(/-/g," ")
        .toUpperCase();

  }

}


/* ==========================================================
   SHOW SUPER ADMIN ELEMENTS
========================================================== */

function applyRoleVisibility(role){

  const normalized =
    normalizeRole(role);


  document
    .querySelectorAll(
      "[data-super-admin]"
    )
    .forEach(element=>{

      element.style.display =

        normalized ===
        "super-admin"

          ? ""

          : "none";

    });


  document
    .querySelectorAll(
      "[data-admin-only]"
    )
    .forEach(element=>{

      element.style.display =

        [
          "super-admin",
          "admin"
        ].includes(normalized)

          ? ""

          : "none";

    });

}


/* ==========================================================
   REMOVE SECURITY SCREEN
========================================================== */

function unlockPage(){

  const screen =
    document.getElementById(
      "bssSecurityScreen"
    );

  if(screen){

    screen.style.opacity =
      "0";

    screen.style.transition =
      "opacity .25s ease";


    setTimeout(()=>{

      screen.remove();

    },260);

  }

}


/* ==========================================================
   AUTH GUARD
========================================================== */

onAuthStateChanged(

  auth,

  async user=>{

    /* -----------------------------------------
       NOT LOGGED IN
    ----------------------------------------- */

    if(!user){

      securityMessage(
        "Ou dwe konekte pou antre nan MY MAXIMAX."
      );

      setTimeout(()=>{

        window.location.replace(
          LOGIN_PAGE
        );

      },800);

      return;

    }


    try{

      securityMessage(
        "Kont verifye. N ap verifye otorizasyon..."
      );


      /* -----------------------------------------
         EMAIL VERIFIED
      ----------------------------------------- */

      if(
        user.email &&
        !user.emailVerified
      ){

        await denyAccess(
          "Imèl kont sa a poko verifye."
        );

        return;

      }


      /* -----------------------------------------
         GET FIRESTORE PROFILE
      ----------------------------------------- */

      const profile =
        await getUserProfile(
          user
        );


      if(!profile){

        await denyAccess(
          "Kont sa a pa gen pwofil administratif BSS1815."
        );

        return;

      }


      /* -----------------------------------------
         ACCOUNT ACTIVE?
      ----------------------------------------- */

      if(
        profile.active === false ||
        profile.disabled === true
      ){

        await denyAccess(
          "Kont administratif sa a dezaktive."
        );

        return;

      }


      /* -----------------------------------------
         ROLE CHECK
      ----------------------------------------- */

      const role =
        normalizeRole(
          profile.role
        );


      if(!roleAllowed(role)){

        await denyAccess(
          "Kont sa a pa gen otorizasyon pou paj sa a."
        );

        return;

      }


      /* -----------------------------------------
         AUTHORIZED
      ----------------------------------------- */

      updateUserInterface(
        user,
        profile
      );


      applyRoleVisibility(
        role
      );


      /* -----------------------------------------
         GLOBAL USER OBJECT
      ----------------------------------------- */

      window.BSS_CURRENT_USER = {

        uid:
          user.uid,

        email:
          user.email,

        name:
          profile.name ||
          user.displayName ||
          "",

        role:
          role,

        profile:
          profile

      };


      document.dispatchEvent(

        new CustomEvent(

          "bss-auth-ready",

          {
            detail:
              window.BSS_CURRENT_USER
          }

        )

      );


      unlockPage();


    }catch(error){

      console.error(
        "BSS1815 SECURITY ERROR:",
        error
      );


      await denyAccess(
        "Nou pa kapab verifye otorizasyon kont sa a."
      );

    }

  }

);


/* ==========================================================
   LOGOUT BUTTONS

   Works automatically with:

   id="logoutBtn"

   OR

   data-bss-logout

========================================================== */

document.addEventListener(

  "click",

  async event=>{

    const logoutTarget =
      event.target.closest(
        "#logoutBtn,[data-bss-logout]"
      );


    if(!logoutTarget){
      return;
    }


    event.preventDefault();


    try{

      await signOut(
        auth
      );


      window.location.replace(
        LOGIN_PAGE
      );


    }catch(error){

      console.error(
        "Logout failed:",
        error
      );

      alert(
        "Dekoneksyon an pa reyisi."
      );

    }

  }

);


/* ==========================================================
   EXPORTS
========================================================== */

export {

  app,

  auth,

  db,

  MY_MAXIMAX_PAGE

};
