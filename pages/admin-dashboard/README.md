# Admin Dashboard — BSS 1815 / PRO-MAX DMP

## Modèl wòl yo
- `roles/super_admins` — dokiman ki gen `users: [uid1, uid2, ...]`
- `roles/admins` — menm bagay, pou Admin òdinè
- `administrative_team/{uid}` — pwofil chak moun (non, pwojè, kazye li gen aksè, estati aktif)

## Etap Firebase Console

### 1. Aktive Authentication, Firestore, Storage
Build → Authentication (Email/Password) → Enable
Build → Firestore Database → Create database
Build → Storage → Get started

### 2. Pibliye règ sekirite yo (OBLIGATWA)
- Firestore Database → Rules → kole tout `firestore.rules` → Publish
- Storage → Rules → kole tout `storage.rules` → Publish

### 3. Kreye premye Super Admin ou a
1. Authentication → Users → Add user, kopye UID
2. Firestore Database → Start collection → `roles`
3. Document ID = `super_admins`. Chan: `users` (array) → mete UID ou
4. Kreye yon dezyèm dokiman: Document ID = `admins`, chan `users` (array) → vid
5. Kreye yon dokiman nan `administrative_team`, Document ID = UID ou:
   `name`, `projects` (array), `categories` (array, vid), `active` (boolean) → true

### 4. Teste
Louvri `pages/admin-dashboard/login.html` sou domèn ou, konekte, ale sou "Kazye Sansib"

## Ajoute yon Admin òdinè apati dashboard la
1. Kreye kont Auth li, kopye UID li
2. Nan dashboard la, "Jesyon Admin yo": kole UID, non, chwazi pwojè/kazye
3. Klike "Ajoute"

## Ajoute manm Komite Disiplinè oswa Konsèy Konsiltatif
Firestore → koleksyon `disciplinary_committee` (oswa `advisory_council`) → Document ID = UID → `name`, `active: true`

## Fichye yo
- login.html / login.js
- dashboard.html / dashboard.js
- kazye.html / kazye.js
- disciplinary.html / disciplinary.js / disciplinary-roles.js
- roster.html / roster.js (?type=musicians / ?type=leaders)
- messages.html / messages.js
- firebase.js / firebase-roles.js / collections.js / project-list.js
- style.css
- firestore.rules / storage.rules
