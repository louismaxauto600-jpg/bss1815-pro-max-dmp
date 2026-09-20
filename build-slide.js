// build-slides.js  —  runs automatically on every Netlify deploy (see netlify.toml).
// It looks at the photos/videos that REALLY exist in the site and writes slides.json,
// so the slideshow plays exactly those files, in your order, with nothing to guess and nothing skipped.
//
// Put your photos next to index.html (or inside one of the folders listed in MEDIA_FOLDERS).

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MEDIA_FOLDERS = ["", "images", "photos", "img", "assets", "media", "gallery", "community", "slideshow", "pics", "pictures", "uploads"];
const MEDIA_RE = /\.(jpe?g|png|webp|gif|mp4)$/i;
const EXCLUDE_RE = /^bati-pou-jodi-a|favicon|apple-touch|(^|[-_ ])(logo|icon)/i;   // not slideshow content
const INCLUDE_EXTRAS = true;   // true = also show files that are not in ORDER below (added at the end)

// The order you want. Names do NOT have to match the files exactly
// (roro-p-p.jpg also finds "Roro P P.JPG", roro_p_p.png ...).
const ORDER = [
  "tania2.jpg",
  "papouche.jpg",
  "heritage.jpg",
  "team-angrenay.jpg",
  "sfc-5-stars.jpg",
  "team-angrenaye.jpg",
  "team-san-presyon.jpg",
  "max-on-the-air.jpg",
  "montina.jpg",
  "kendy2.jpg",
  "perodin.jpg",
  "rorony.jpg",
  "maxl.jpg",
  "maxle.jpg",
  "doodly.jpg",
  "roro-8.jpg",
  "cols1.jpg",
  "bouboul.jpg",
  "sindy-b.jpg",
  "warrens-v.jpg",
  "ones-g.jpg",
  "dede.jpg",
  "jij-mayan-1.jpg",
  "paulema.jpg",
  "mass-vokal.jpg",
  "maximax-m-s.jpg",
  "max-the-man.jpg",
  "ti-fre.jpg",
  "the-change.jpg",
  "jij-mayan2.jpg",
  "montinat.jpg",
  "cange-d.jpg",
  "ti-la-france.jpg",
  "jij-mayan-3.jpg",
  "bss.jpg",
  "ti-marassa.jpg",
  "the-change-1.jpg",
  "the-plan.jpg",
  "max.jpg",
  "sonsonn.jpeg",
  "valery.jpg",
  "thin-khard.jpg",
  "maximax-2.jpg",
  "y-max.jpg",
  "roro-ny.jpg",
  "le-baron.jpg",
  "prez-tirat.jpg",
  "the-one.jpg",
  "andy.jpeg",
  "badin-s.jpg",
  "ti-rat.jpg",
  "roro-1lajan.jpg",
  "roro-p-p.jpg",
  "madina.jpg",
  "prez-papit.jpg",
  "may-1.jpg",
  "fanfan-d.jpg",
  "ti-renold.jpg",
  "asmide1.jpg",
  "jeff-c.jpg",
  "tania-f.jpg",
  "jude.jpg",
  "andre-a.jpg",
  "nadege.jpg",
  "macu-1.jpg",
  "prez-aly.jpg",
  "sonson-m.jpg",
  "brunel-t.jpg",
  "roro-lj.jpg",
  "ti-papouche.jpg",
  "michel-b.jpg",
  "michel.jpg",
  "tatane.jpg",
  "la-belle-yole.jpg",
  "tila-france.jpg",
  "ralph-p.jpg",
  "ti-marassa2.jpg",
  "landry.jpg",
  "vp-ernso.jpg",
  "fanfan2.jpg",
  "paulema2.jpg",
  "yguens.jpg",
  "tifre2.jpg",
  "tichery.jpg",
  "jij-mayan.jpg",
  "yguens2.jpg",
  "heuch-love.jpg",
  "cange-0.jpg",
  "prez-aly-2.jpg",
  "anpere-doudou.jpg",
  "rivelino.jpg",
  "tatane-vp.jpg",
  "montinat2.jpg",
  "prezidan-aly.jpg",
  "max-louis.jpg",
  "paulema21.jpg",
  "le-baron1.jpg",
  "devan-devan-net.jpg",
  "jq-max.jpg",
  "system-akayik.jpg",
  "montina-prof.jpg",
  "systeme-akayik.jpg",
  "derosier.jpg",
  "odeline-ademe.jpg",
  "nadia-lafortune.jpg",
  "nadou.jpg",
  "max-is-the-man.jpg",
  "nadou2.jpg",
  "pro-max-dmp.mp4",
  "pro-max.jpg",
  "pro-max-academie.mp4",
  "maxi-max.mp4",
  "bss1815-pro-max-dmp.jpg"
];

const key = (name) => path.basename(name).replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const isVideo = (name) => /\.mp4$/i.test(name);

// 1) collect the real files
const found = [];
for (const folder of MEDIA_FOLDERS) {
  const dir = path.join(ROOT, folder);
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { continue; }
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!MEDIA_RE.test(e.name) || EXCLUDE_RE.test(e.name)) continue;
    found.push(folder ? folder + "/" + e.name : e.name);
  }
}
found.sort();

const byKey = {};
for (const f of found) (byKey[key(f)] = byKey[key(f)] || []).push(f);

// 2) follow ORDER, matching by name
const used = new Set(), slides = [], missing = [];
ORDER.forEach((name, i) => {
  const list = byKey[key(name)] || [];
  let hit = list.find((p) => !used.has(p) && isVideo(p) === isVideo(name)) || list.find((p) => !used.has(p));
  if (hit) { used.add(hit); slides.push(hit); } else missing.push({ n: i + 1, name });
});

// 3) everything else that exists goes at the end
const extras = found.filter((f) => !used.has(f));
if (INCLUDE_EXTRAS) extras.forEach((f) => slides.push(f));

const out = { generated: new Date().toISOString(), count: slides.length, slides, missing, extras: INCLUDE_EXTRAS ? extras : [] };
fs.writeFileSync(path.join(ROOT, "slides.json"), JSON.stringify(out, null, 2));
console.log("slides.json written: " + slides.length + " slides, " + missing.length + " names in the list have no file, " + extras.length + " extra files.");
