/* BEU PYQ App - service worker
 *
 * Layout of this file
 *   1. Config & cache names
 *   2. Shared helpers
 *   3. App shell caching        (versioned cache, replaced on every build)
 *   4. PYQ data module          (data.js: network-first, refresh, "PYQ_UPDATED")
 *   5. Version module           (version.json check, "VERSION_UPDATED")
 *   6. Lifecycle / fetch / sync / message wiring
 *
 * The data module and the version module share NO state, NO cache and NO
 * message type. Each decides on its own when it has news and posts its own
 * message; the page decides how to present them (see js/app.js).
 */

// Stamped on every build by `node scripts/build-sw.js` - do not edit by hand.
// The marker comment lets the script find and replace this line each time.
const BUILD_ID = "mwgaawpu-cc6ea44a"; // @build-id
// Human release number from version.json. Only a change in THIS decides
// whether the "new version" popup is shown (a data-only deploy changes
// BUILD_ID but not APP_VERSION).
const APP_VERSION = "1.0.3"; // @app-version

// ---------------------------------------------------------
// 1. CONFIG & CACHE NAMES
// ---------------------------------------------------------

// Auto-detect base path (GitHub Pages project site vs. local / custom domain)
const BASE = self.location.hostname.includes("github.io")
  ? "/BEU-PYQ-App"
  : "";

// Unique per build -> a new build never reads or reuses an old build's shell.
const SHELL_PREFIX = "beu-pyq-shell-";
const SHELL_CACHE = `${SHELL_PREFIX}${BUILD_ID}`;

// Survives builds on purpose: it holds the last PYQ data the user was served,
// which is the baseline for detecting "new PYQ added".
const DATA_CACHE = "beu-pyq-data";

// Tiny cache that remembers the last APP_VERSION this browser ran, so
// "activate" can tell a real version upgrade from a data-only rebuild.
// Separate from DATA_CACHE: the two checks share no cache.
const META_CACHE = "beu-pyq-meta";
const META_VERSION_KEY = `${BASE}/__app-version`;

// Cache name used by the previous (pre-redesign) PYQ service worker. It is
// no longer read, so it is deleted on activate to free the storage.
const LEGACY_CACHE_PREFIX = "beu-pwa-";

const DATA_URL = `${BASE}/js/data.js`;
const VERSION_URL = `${BASE}/version.json`;
const SYNC_TAG = "sync-pyq";

// App shell. data.js is deliberately NOT here: it lives in DATA_CACHE.
const SHELL_ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/css/style.css`,
  `${BASE}/js/app.js`,
  `${BASE}/js/analytics.js`,
  `${BASE}/assets/icon-192.png`,
  `${BASE}/assets/icon-512.png`,
  `${BASE}/assets/icon-maskable-192.png`,
  `${BASE}/assets/icon-maskable-512.png`,
  `${BASE}/assets/apple-touch-icon.png`,
  `${BASE}/assets/favicon.ico`,
  `${BASE}/assets/favicon.svg`,
  `${BASE}/assets/favicon-96x96.png`,
  `${BASE}/assets/logo.png`,
  `${BASE}/assets/Developer.png`,
];

// ---------------------------------------------------------
// 2. SHARED HELPERS
// ---------------------------------------------------------
async function notifyClients(type, extra = {}) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  clients.forEach((client) => client.postMessage({ type, ...extra }));
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

// ---------------------------------------------------------
// 3. APP SHELL (everything except data.js / version.json)
// ---------------------------------------------------------
async function precacheShell() {
  const cache = await caches.open(SHELL_CACHE);
  await cache.addAll(SHELL_ASSETS);
}

// Delete shell caches from other builds.
async function removeOldShells() {
  const keys = await caches.keys();
  const stale = keys.filter(
    (key) => key.startsWith(SHELL_PREFIX) && key !== SHELL_CACHE,
  );
  await Promise.all(stale.map((key) => caches.delete(key)));
  return stale.length;
}

// Delete caches left behind by the previous PYQ service worker.
async function removeLegacyCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(LEGACY_CACHE_PREFIX))
      .map((key) => caches.delete(key)),
  );
}

// Network first, cached copy only when the network fails.
async function shellNetworkFirst(request, event) {
  try {
    const res = await fetch(request);
    if (res.status === 200 || res.status === 0) {
      const copy = res.clone();
      const store = caches
        .open(SHELL_CACHE)
        .then((cache) => cache.put(request, copy))
        .catch(() => {});
      if (event) {
        event.waitUntil(store);
      }
    }
    return res;
  } catch {
    const cached = await caches.match(request, { cacheName: SHELL_CACHE });
    if (cached) {
      return cached;
    }

    const accept = request.headers.get("accept");
    if (accept && accept.includes("text/html")) {
      const fallback = await caches.match(`${BASE}/index.html`, {
        cacheName: SHELL_CACHE,
      });
      if (fallback) {
        return fallback;
      }
    }
    return Response.error();
  }
}

// ---------------------------------------------------------
// 4. PYQ DATA MODULE  ->  posts "PYQ_UPDATED"
// ---------------------------------------------------------
const PYQData = {
  // Cache key is the fixed data URL so "?v=123" style requests share one entry.
  key: DATA_URL,

  async cached() {
    const cache = await caches.open(DATA_CACHE);
    return cache.match(this.key);
  },

  // Network first. The HTTP cache is bypassed too ("no-store"), so there is
  // never a delay before new PYQ links show up. The cached copy is used
  // only when the network is down or the server errors.
  async networkFirst(request) {
    try {
      const res = await fetch(request.url, { cache: "no-store" });
      if (res.status === 200) {
        const cache = await caches.open(DATA_CACHE);
        await cache.put(this.key, res.clone());
        return res;
      }
      return (await this.cached()) || res;
    } catch {
      return (await this.cached()) || Response.error();
    }
  },

  // Fill an empty cache at install so the first offline visit works.
  // Never overwrites: an existing copy is the baseline for change detection.
  async seed() {
    try {
      if (await this.cached()) {
        return;
      }
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (res.status === 200) {
        const cache = await caches.open(DATA_CACHE);
        await cache.put(this.key, res);
      }
    } catch {
      // offline at install: the first online page load fills it instead
    }
  },

  // Background refresh (Background Sync or the manual fallback message).
  // Fetch -> compare with the stored copy -> store -> announce only if changed.
  async refresh() {
    const previous = await this.cached();

    // Throwing makes the browser retry the sync later. The timestamp query
    // also skips any CDN-cached copy right after a deploy.
    const res = await fetch(`${DATA_URL}?_=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.status !== 200) {
      throw new Error("PYQ data fetch failed: " + res.status);
    }

    let changed = false;
    if (previous) {
      const [oldText, newText] = await Promise.all([
        previous.clone().text(),
        res.clone().text(),
      ]);
      changed = oldText !== newText;
    }

    const cache = await caches.open(DATA_CACHE);
    await cache.put(this.key, res);

    if (changed) {
      await notifyClients("PYQ_UPDATED");
    }
  },
};

// ---------------------------------------------------------
// 5. VERSION MODULE  ->  posts "VERSION_UPDATED"
// ---------------------------------------------------------
const AppVersion = {
  // Compare the version this worker was built with against the "version" in
  // version.json on the server. The per-deploy "build" id is ignored on
  // purpose: it changes on every deploy, including data-only ones.
  async check() {
    const res = await fetch(VERSION_URL, { cache: "no-store" });
    if (!res.ok) {
      return;
    }

    let remote = null;
    try {
      remote = await res.json();
    } catch {
      return;
    }

    const latestVersion = remote && remote.version;

    if (!latestVersion || latestVersion === APP_VERSION) {
      // Same version: NOT a version event. Any data change is reported by
      // the PYQ data module instead.
      return;
    }

    // A newer version is live: fetch the new worker now instead of waiting
    // for the browser's own update check. It will skipWaiting() and take over.
    await self.registration.update().catch(() => {});
    await notifyClients("VERSION_UPDATED", { version: latestVersion });
  },

  // Called from "activate". Announces only when the VERSION differs from the
  // one this browser ran before. A first install, or a rebuild with the same
  // version (e.g. only data.js changed), stays silent.
  async announceIfUpgrade() {
    const meta = await caches.open(META_CACHE);
    const stored = await meta.match(META_VERSION_KEY);
    const previousVersion = stored ? (await stored.text()).trim() : "";

    await meta.put(META_VERSION_KEY, new Response(APP_VERSION));

    if (previousVersion && previousVersion !== APP_VERSION) {
      await notifyClients("VERSION_UPDATED", { version: APP_VERSION });
    } else {
      // no previous version, or unchanged: nothing to announce
    }
  },
};

// ---------------------------------------------------------
// 6. LIFECYCLE / FETCH / SYNC / MESSAGE WIRING
// ---------------------------------------------------------

// INSTALL - cache the shell, then take over without waiting.
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await precacheShell();
      await PYQData.seed();
      await self.skipWaiting();
    })(),
  );
});

// ACTIVATE - drop old builds' shells, claim open pages immediately.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await removeOldShells();
      await removeLegacyCaches();
      await self.clients.claim();
      await AppVersion.announceIfUpgrade();
    })(),
  );
});

// FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!req.url.startsWith("http") || req.method !== "GET") {
    return;
  }

  const url = new URL(req.url);

  // Cross-origin (Google Analytics, Drive previews...) goes straight to network
  if (!isSameOrigin(url)) {
    return;
  }

  // version.json is never served from any cache.
  if (url.pathname === VERSION_URL) {
    return;
  }

  // data.js: network first, own persistent cache.
  if (url.pathname === DATA_URL) {
    event.respondWith(PYQData.networkFirst(req));
    return;
  }

  // Everything else: network first, per-build shell cache.
  event.respondWith(shellNetworkFirst(req, event));
});

// BACKGROUND SYNC - PYQ data refresh when connectivity returns
self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(PYQData.refresh());
  }
});

// MESSAGES from the page - each message routes to exactly one module
self.addEventListener("message", (event) => {
  const data = event.data;
  const type = data && data.type ? data.type : data;

  switch (type) {
    case "skipWaiting":
    case "SKIP_WAITING":
      self.skipWaiting();
      break;
    case "CHECK_VERSION":
      event.waitUntil(AppVersion.check().catch(() => {}));
      break;
    case "SYNC_PYQ":
      // Fallback for browsers without Background Sync (Safari / Firefox)
      event.waitUntil(PYQData.refresh().catch(() => {}));
      break;
  }
});
