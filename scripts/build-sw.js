#!/usr/bin/env node
/*
 * Stamps a fresh, unique build id into service-worker.js and version.json.
 * Run it before every deploy:   node scripts/build-sw.js
 *
 * Build id = base36 timestamp + 8 hex chars of a hash over the files the
 * service worker caches, so every run is unique and the id also changes
 * whenever the content does.
 *
 * Options:
 *   --bump   also increment the patch number in version.json ("1.0.2" -> "1.0.3").
 *            Use it for a real app release: ONLY a changed "version" shows the
 *            "new version" popup. A normal deploy (e.g. new PYQ links in data.js)
 *            keeps the version and shows the "New PYQ added" popup instead.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const swPath = path.join(root, "service-worker.js");
const versionPath = path.join(root, "version.json");

const hashed = [
  "index.html",
  "manifest.json",
  "css/style.css",
  "js/app.js",
  "js/analytics.js",
  "js/data.js",
];

const hash = crypto.createHash("sha1");
for (const file of hashed) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) {
    hash.update(file).update(fs.readFileSync(full));
  }
}
const buildId = `${Date.now().toString(36)}-${hash.digest("hex").slice(0, 8)}`;

// version.json: read it, optionally bump, keep "version", write the new "build"
let info = {};
try {
  info = JSON.parse(fs.readFileSync(versionPath, "utf8"));
} catch {
  info = { version: "1.0.0" };
}
if (process.argv.includes("--bump")) {
  const parts = String(info.version).split(".").map(Number);
  parts[parts.length - 1] = (parts[parts.length - 1] || 0) + 1;
  info.version = parts.join(".");
}
info.build = buildId;

// service-worker.js: replace the two tagged lines (build id + app version)
const buildMarker = /^const BUILD_ID = ".*"; \/\/ @build-id\r?$/m;
const versionMarker = /^const APP_VERSION = ".*"; \/\/ @app-version\r?$/m;
let sw = fs.readFileSync(swPath, "utf8");
if (!buildMarker.test(sw)) {
  console.error('Could not find the `const BUILD_ID = "..."; // @build-id` line.');
  process.exit(1);
}
if (!versionMarker.test(sw)) {
  console.error('Could not find the `const APP_VERSION = "..."; // @app-version` line.');
  process.exit(1);
}
sw = sw
  .replace(buildMarker, `const BUILD_ID = "${buildId}"; // @build-id`)
  .replace(versionMarker, `const APP_VERSION = "${info.version}"; // @app-version`);
fs.writeFileSync(swPath, sw);

fs.writeFileSync(versionPath, JSON.stringify(info, null, 2) + "\n");

console.log(`Build ${buildId} (version ${info.version})`);
console.log(`Cache name: beu-pyq-shell-${buildId}`);
