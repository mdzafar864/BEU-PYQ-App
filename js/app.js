// app.js
/* global subjectDB, pdfDB, branchNames, semesterNames */

// =========================================================
// GOOGLE ANALYTICS 4 CUSTOM EVENT TRACKING
// =========================================================
function trackGA4Event(eventName, eventParameters = {}) {
  if (typeof window.gtag !== "function") {
    console.warn(`[GA4] gtag unavailable: ${eventName}`);
    return;
  }

  window.gtag("event", eventName, {
    ...eventParameters,
    app_name: "BEU PYQ App",
    page_title: document.title,
    page_location: window.location.href,
  });
}

function getBranchName(branchCode) {
  return branchNames[branchCode] || branchCode || "Unknown";
}

function getSemesterName(semesterCode) {
  return semesterNames[semesterCode] || semesterCode || "Unknown";
}

// PWA INSTALL PROMPT + INSTALLED CHECK
let deferredPrompt = null;
let installInProgress = false;
const installBtn = document.getElementById("install-btn");

function isPWAStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true ||
    document.referrer.startsWith("android-app://")
  );
}

function updateInstallButton() {
  if (!installBtn) {
    return;
  }

  if (isPWAStandalone()) {
    installBtn.textContent = "✅ App Mode Active";
    installBtn.style.background = "#16a34a";
    installBtn.disabled = false;
    return;
  }

  if (localStorage.getItem("beu_pwa_installed") === "yes") {
    installBtn.textContent = "✅ App Already Installed";
    installBtn.style.background = "#16a34a";
    installBtn.disabled = false;
    return;
  }

  installBtn.textContent = "📲 Install App";
  installBtn.style.background = "#16a34a";
  installBtn.disabled = false;
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installInProgress = false;
  localStorage.removeItem("beu_pwa_installed");
  updateInstallButton();

  trackGA4Event("pwa_install_available", {
    install_status: "prompt_available",
    platforms: Array.isArray(e.platforms) ? e.platforms.join(",") : "web",
  });
});

// ✅ Success popup ONLY after browser confirms app installation
let installSuccessPopupShown = false;
let installSuccessTimer = null;

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  installInProgress = false;

  localStorage.setItem("beu_pwa_installed", "yes");
  updateInstallButton();

  if (sessionStorage.getItem("ga4_pwa_installed_sent") !== "yes") {
    sessionStorage.setItem("ga4_pwa_installed_sent", "yes");
    trackGA4Event("pwa_installed", {
      install_status: "success",
      install_method: "browser_appinstalled_event",
    });
  }

  clearTimeout(installSuccessTimer);
  installSuccessTimer = setTimeout(() => {
    if (installSuccessPopupShown) {
      return;
    }
    installSuccessPopupShown = true;

    showMessage(
      "✅ App installed successfully. You can now open it from your home screen.",
      8000,
    );
  }, 8000);
});

async function installPWA() {
  updateInstallButton();

  if (isPWAStandalone()) {
    showMessage("✅ You are already using the installed app.", 6000);
    installBtn.textContent = "✅ App Mode Active";
    installBtn.style.background = "#16a34a";
    return;
  }

  if (installInProgress) {
    showMessage("⏳ Installing the app. Please wait...", 5000);
    return;
  }

  if (localStorage.getItem("beu_pwa_installed") === "yes" && !deferredPrompt) {
    showMessage(
      "✅ The app is already installed. Open it from your home screen.",
      6000,
    );
    return;
  }

  if (!deferredPrompt) {
    showMessage(
      "ℹ️ Installation is not available right now. Use the browser menu (⋮) and choose Install App or Add to Home Screen.",
      9000,
    );
    return;
  }

  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  installInProgress = true;

  promptEvent.prompt();
  const choice = await promptEvent.userChoice;

  if (choice.outcome === "accepted") {
    installBtn.textContent = "⏳ Installing...";
    installBtn.style.background = "#16a34a";
    showMessage("⏳ Installing the app. Please wait...", 15000);
  } else {
    installInProgress = false;
    showMessage("❌ App installation was cancelled.", 5000);
    updateInstallButton();
  }
}

window.addEventListener("DOMContentLoaded", updateInstallButton);
{
  const standaloneQuery = window.matchMedia("(display-mode: standalone)");
  // Safari < 14 only supports the deprecated addListener()
  if (standaloneQuery.addEventListener) {
    standaloneQuery.addEventListener("change", updateInstallButton);
  } else if (standaloneQuery.addListener) {
    standaloneQuery.addListener(updateInstallButton);
  }
}

let hideTimer;
let resetTimer;

// FLOW: Branch -> Semester -> Subject
const branch = document.getElementById("branch");
const sem = document.getElementById("sem");
const subject = document.getElementById("subject");
const msg = document.getElementById("msg");

const DEFAULT_MSG = "Choose a branch, semester and subject to view the PYQ.";

function resetMsg() {
  clearTimeout(hideTimer);
  clearTimeout(resetTimer);
  msg.style.opacity = 1;
  msg.textContent = DEFAULT_MSG;
}

// SUBJECT options depend on BOTH the selected branch and semester
// (subjectDB[semester][branch] = [subject names]).
function populateSubjectOptions(branchValue, semValue) {
  subject.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  subject.appendChild(placeholder);

  if (!branchValue || !semValue) {
    subject.disabled = true;
    placeholder.textContent = "Select Semester First";
    return;
  }

  const subjects =
    (subjectDB[semValue] && subjectDB[semValue][branchValue]) || [];

  if (subjects.length === 0) {
    subject.disabled = true;
    placeholder.textContent = "No Subjects Available";
    return;
  }

  subject.disabled = false;
  placeholder.textContent = "Select Subject";

  subjects.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    subject.appendChild(opt);
  });
}

// Tell the user when a branch + semester has no subject list yet.
function refreshSubjects() {
  populateSubjectOptions(branch.value, sem.value);

  if (branch.value && sem.value && subject.disabled) {
    showMessage("📭 No subjects have been added for this selection yet.", 6000);
  } else {
    resetMsg();
  }
}

// SEMESTER depends on branch: disabled until a branch is selected.
function updateSemesterState() {
  if (branch.value) {
    sem.disabled = false;
  } else {
    // Branch cleared: reset semester and lock everything downstream
    sem.value = "";
    sem.disabled = true;
  }
}

branch.onchange = () => {
  updateSemesterState();
  refreshSubjects();
};

sem.onchange = refreshSubjects;

subject.onchange = resetMsg;

// Initial state (also covers browser-restored form values):
// semester follows branch, subject follows branch + semester.
sem.disabled = !branch.value;
populateSubjectOptions(branch.value, sem.value);

// GOOGLE DRIVE HELPERS
// Preview URL (iframe):   https://drive.google.com/file/d/<ID>/preview
// Download URL (button):  https://drive.google.com/uc?export=download&id=<ID>
function getDriveFileId(url) {
  const m =
    String(url || "").match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    String(url || "").match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : "";
}

function getDrivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
}

// Looks up the PDF for a branch / semester / subject.
// Returns "" when no usable Drive link was added yet (empty string or a
// placeholder). Any Drive link (/view, /preview, ?id=) is normalised to the
// embeddable /preview form, because Drive refuses to render /view in an iframe.
function getPYQLink(b, s, sub) {
  const raw =
    pdfDB[s] && pdfDB[s][b] && pdfDB[s][b][sub] ? pdfDB[s][b][sub] : "";
  const fileId = getDriveFileId(raw);
  return fileId ? getDrivePreviewUrl(fileId) : "";
}

function getDriveDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}

// OPEN PDF
const openBtn = document.getElementById("open-btn");
const pdfFrame = document.getElementById("pdf-frame");
const pdfModal = document.getElementById("pdf-modal");
// The paper currently shown in the preview modal (null when closed).
let currentPYQ = null;

openBtn.onclick = () => {
  const b = branch.value;
  const s = sem.value;
  const sub = subject.value;

  if (!b || !s || !sub) {
    showMessage("❌ Please select a branch, semester and subject.", 10000);
    return;
  }

  const pdflink = getPYQLink(b, s, sub);
  if (!pdflink) {
    showMessage(`❌ PYQ for "${sub}" is not available yet.`, 9000);
    return;
  }

  trackGA4Event("pyq_open", {
    branch: b,
    semester: s,
    subject: sub,
    button_text: "Open PYQ PDF",
    click_location: "main_page",
  });

  currentPYQ = { branch: b, sem: s, subject: sub, url: pdflink };
  pdfFrame.src = pdflink;
  pdfModal.style.display = "flex";
  pdfModal.classList.add("active");

  showMessage("📄 Preview opened. Click Download to save the file.", 8000);
};

// SHOW MESSAGE
function showMessage(text, duration) {
  // Cancel BOTH pending timers. The old fade-out timer used to survive and
  // wipe a newer message (e.g. "Not available") right after it was shown.
  clearTimeout(hideTimer);
  clearTimeout(resetTimer);
  msg.style.opacity = 1;
  msg.textContent = text;

  hideTimer = setTimeout(() => {
    msg.style.opacity = 0;
    resetTimer = setTimeout(resetMsg, 400);
  }, duration);
}

// CLOSE MODALS
function closePDF() {
  const pdfModalEl = document.getElementById("pdf-modal");
  const pdfFrameEl = document.getElementById("pdf-frame");
  pdfModalEl.classList.remove("active");
  pdfModalEl.style.display = "none";
  // An empty src can resolve to this page itself; use a blank document.
  pdfFrameEl.src = "about:blank";
  currentPYQ = null;
}

// DEVELOPER OPTIONS / MODAL
function openDev() {
  const modal = document.getElementById("dev-modal");
  modal.style.display = "flex";
  modal.classList.add("active");
}

function closeDev() {
  const modal = document.getElementById("dev-modal");
  modal.classList.remove("active");
  modal.style.display = "none";
}

document.getElementById("close-pdf-btn").addEventListener("click", closePDF);
document.getElementById("dev-close-btn").addEventListener("click", closeDev);

document.getElementById("dev-btn").addEventListener("click", () => {
  trackGA4Event("developer_info_click", {
    button_text: "Developer Info",
    click_location: "main_page",
  });
  openDev();
});

document.getElementById("install-btn").addEventListener("click", () => {
  trackGA4Event("pwa_install_button_click", {
    button_text: installBtn.textContent.trim(),
    prompt_available: deferredPrompt ? "yes" : "no",
  });
  installPWA();
});

// Close developer modal when clicking outside card
document.getElementById("dev-modal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeDev();
  }
});

// Close PDF modal when clicking outside card
document.getElementById("pdf-modal").addEventListener("click", function (e) {
  if (e.target === this) {
    closePDF();
  }
});

// Close whichever modal is open when pressing Escape
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") {
    return;
  }
  if (document.getElementById("pdf-modal").classList.contains("active")) {
    closePDF();
  }
  if (document.getElementById("dev-modal").classList.contains("active")) {
    closeDev();
  }
});

// DOWNLOAD PDF + GA4 TRACKING
const downloadPDFBtn = document.getElementById("download-pdf-btn");

// Click a hidden <a download> so the file is saved straight to the device.
function triggerFileDownload(href, fileName, openInNewTab) {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  a.hidden = true;
  if (openInNewTab) {
    a.target = "_blank";
    a.rel = "noopener";
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Fetch the PDF, wrap it in a Blob and save it through a temporary object URL.
async function downloadAsBlob(downloadUrl, fileName) {
  const response = await fetch(downloadUrl, {
    credentials: "omit",
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const blob = await response.blob();
  // Drive answers with an HTML page (not a PDF) when it blocks the download.
  if (blob.type.includes("text/html") || blob.size === 0) {
    throw new Error("Unexpected response");
  }

  const objectUrl = URL.createObjectURL(
    new Blob([blob], { type: "application/pdf" }),
  );
  triggerFileDownload(objectUrl, fileName, false);
  // Release the temporary URL once the browser has started the save.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

// Safe file name part: letters/digits only, other runs become "_"
function toFileSafe(text) {
  return String(text)
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

downloadPDFBtn.onclick = async () => {
  if (!currentPYQ) {
    showMessage("❌ No PYQ is available to download.", 5000);
    return;
  }
  const pdfLink = currentPYQ.url;
  const branchCode = currentPYQ.branch;
  const semesterCode = currentPYQ.sem;
  const subjectName = currentPYQ.subject;

  if (!pdfLink || !branchCode || !semesterCode || !subjectName) {
    showMessage("❌ No PYQ is available to download.", 5000);
    return;
  }

  const fileId = getDriveFileId(pdfLink);
  if (!fileId) {
    showMessage("❌ Could not find the file to download.", 5000);
    return;
  }
  const downloadUrl = getDriveDownloadUrl(fileId);
  const fileName = `${branchCode}_${semesterCode}_${toFileSafe(subjectName)}_PYQ.pdf`;

  trackGA4Event("pyq_download", {
    branch: branchCode,
    semester: semesterCode,
    subject: subjectName,
    file_name: fileName,
    file_url: downloadUrl,
    download_source: "pyq_preview_modal",
  });

  downloadPDFBtn.disabled = true;
  showMessage("⏳ Preparing download...", 30000);

  try {
    await downloadAsBlob(downloadUrl, fileName);
    showMessage("✅ Download started.", 5000);
  } catch (err) {
    // The blob route can fail (CORS, network, Drive warning page). Fall back
    // to the direct Drive download link so the user still gets the file.
    console.warn("[Download] Blob download failed, using direct link.", err);
    triggerFileDownload(downloadUrl, fileName, true);
    showMessage("✅ Download started.", 5000);
  } finally {
    downloadPDFBtn.disabled = false;
  }
};

// SHARE PDF (native share sheet on mobile, copy-link fallback elsewhere)
const sharePDFBtn = document.getElementById("share-pdf-btn");
sharePDFBtn.onclick = async () => {
  if (!currentPYQ) {
    showMessage("❌ No PYQ is available to share.", 5000);
    return;
  }
  const pdfLink = currentPYQ.url;

  const title = `${getBranchName(currentPYQ.branch)} - ${getSemesterName(currentPYQ.sem)} - ${currentPYQ.subject} BEU PYQ`;

  trackGA4Event("pyq_share", {
    branch: currentPYQ.branch,
    semester: currentPYQ.sem,
    subject: currentPYQ.subject,
    file_url: pdfLink,
  });

  try {
    if (navigator.share) {
      await navigator.share({ title, text: title, url: pdfLink });
      return;
    }
    await navigator.clipboard.writeText(pdfLink);
    showMessage("🔗 Link copied to clipboard.", 5000);
  } catch (err) {
    if (err && err.name === "AbortError") {
      return;
    } // user closed the share sheet
    showMessage("❌ Could not share. Please try Download instead.", 5000);
  }
};

// PWA SERVICE WORKER
if ("serviceWorker" in navigator) {
  // Was the page already controlled by a SW when it loaded?
  // (Prevents a reload / dialog on the very first visit.)
  const hadController = !!navigator.serviceWorker.controller;
  let swRegistration = null;

  // Two independent update channels:
  //   version  <- set ONLY by a version signal (version.json "version" changed)
  //   data     <- decided on the PAGE by comparing a fingerprint of js/data.js
  //               with the one this phone/browser last showed (localStorage)
  // processUpdates() is the single place that decides which popup is shown.
  const updateState = {
    versionAvailable: false, // a newer app version exists
    versionPrompted: false, //  its popup has already been shown this page load
    popupOpen: false, //        a popup is on screen right now
  };

  const SYNC_TAG = "sync-pyq";

  // ---------- Styled update popup (replaces the plain browser confirm box) ----------
  // Popups are queued so two never overlap. Resolves true on "Update", false on "Later".
  let popupQueue = Promise.resolve();

  const ICON_REFRESH =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5"/></svg>';
  const ICON_FILE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>';

  function showUpdatePopup({ icon, title, message, sub, confirmText, hideLater }) {
    const run = () =>
      new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "upd-overlay";

        const card = document.createElement("div");
        card.className = "upd-card";
        card.setAttribute("role", "alertdialog");
        card.setAttribute("aria-modal", "true");
        card.setAttribute("aria-labelledby", "updMsg");

        // The icon is a trusted constant SVG string; parse it as XML instead
        // of assigning markup through innerHTML.
        const iconWrap = document.createElement("div");
        iconWrap.className = "upd-icon";
        iconWrap.setAttribute("aria-hidden", "true");
        const svgDoc = new DOMParser().parseFromString(icon, "image/svg+xml");
        iconWrap.appendChild(document.importNode(svgDoc.documentElement, true));

        const titleEl = document.createElement("div");
        titleEl.className = "upd-title";
        const msgEl = document.createElement("p");
        msgEl.className = "upd-msg";
        msgEl.id = "updMsg";
        const subEl = document.createElement("p");
        subEl.className = "upd-sub";

        const actions = document.createElement("div");
        actions.className = "upd-actions";
        const laterBtn = document.createElement("button");
        laterBtn.type = "button";
        laterBtn.className = "upd-btn-secondary";
        laterBtn.textContent = "Later";
        const okBtn = document.createElement("button");
        okBtn.type = "button";
        okBtn.className = "upd-btn-primary";
        if (hideLater) {
          actions.append(okBtn);
        } else {
          actions.append(laterBtn, okBtn);
        }

        card.append(iconWrap, titleEl, msgEl, subEl, actions);
        overlay.appendChild(card);

        // textContent keeps the text safe (no HTML injection)
        titleEl.textContent = title;
        msgEl.textContent = message;
        subEl.textContent = sub;
        okBtn.textContent = confirmText;

        const finish = (result) => {
          document.removeEventListener("keydown", onKey, true);
          overlay.remove();
          resolve(result);
        };
        const onKey = (e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            finish(false);
          }
        };

        okBtn.addEventListener("click", () => finish(true));
        laterBtn.addEventListener("click", () => finish(false));
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            finish(false);
          }
        });
        document.addEventListener("keydown", onKey, true);

        document.body.appendChild(overlay);
        okBtn.focus();
      });

    popupQueue = popupQueue.then(run, run);
    return popupQueue;
  }

  // ----- Dispatcher: version check FIRST, data check second -----
  // Called whenever a flag changes or a popup closes. Only one popup at a time.
  function processUpdates() {
    if (updateState.popupOpen) {
      return;
    }

    if (updateState.versionAvailable && !updateState.versionPrompted) {
      // Priority 1: a new app version. Its reload also loads fresh data.js.
      promptNewVersion();
    } else if (pendingData && pendingData.hash !== promptedDataHash) {
      // Priority 2: only new PYQ data, the app version is unchanged.
      promptPYQUpdate(pendingData);
    }
    // else: nothing to announce
  }

  // ----- Channel 1: app version ("New Version Available") -----
  function promptNewVersion() {
    updateState.versionPrompted = true;
    updateState.popupOpen = true;

    showUpdatePopup({
      icon: ICON_REFRESH,
      title: "Update Available",
      message: "New version available! Update now.",
      sub: "A newer version of the app is ready with the latest improvements.",
      confirmText: "Update Now",
    }).then((ok) => {
      updateState.popupOpen = false;

      if (ok) {
        // The new worker already skipped waiting and claimed this page, so a
        // plain reload loads the new build. (Nudge a waiting worker just in case.)
        const waiting = swRegistration && swRegistration.waiting;
        if (waiting) {
          waiting.postMessage({ type: "SKIP_WAITING" });
        }
        window.location.reload();
      } else {
        // "Later": don't nag about the version again until the next page load,
        // but a pending data update may still be announced.
        processUpdates();
      }
    });
  }

  // ----- Channel 2: PYQ data ("New PYQ Added") -----
  // Why this lives on the page and not in the service worker:
  // on a phone the app is normally cold-started. The service worker serves
  // data.js network-first, so a cold start already loads the NEW data and a
  // worker-side "old vs new" comparison finds no difference -> no popup.
  // So the page remembers, in localStorage, the fingerprint of the data it
  // last showed. Any difference at start-up (or while the app is open)
  // means new PYQs were added since the user last saw the app.
  const SEEN_DATA_KEY = "beu_seen_data_hash";
  const DATA_PAGE_URL = new URL("js/data.js", document.baseURI).href;
  let loadedDataHash = null; //   fingerprint of the data this page is running
  let pendingData = null; //      { kind: "info" | "refresh", hash }
  let promptedDataHash = null; // last hash a popup was already shown for

  function hashText(text) {
    // FNV-1a 32 bit + length: tiny, fast, no secure-context requirement
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36) + "-" + text.length.toString(36);
  }

  function readSeenHash() {
    try {
      return localStorage.getItem(SEEN_DATA_KEY);
    } catch {
      return null;
    }
  }

  function writeSeenHash(hash) {
    try {
      localStorage.setItem(SEEN_DATA_KEY, hash);
    } catch {
      // storage blocked (private mode): the popup then just won't repeat
    }
  }

  async function fetchDataHash() {
    const res = await fetch(`${DATA_PAGE_URL}?_=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("data fetch failed: " + res.status);
    }
    return hashText(await res.text());
  }

  // Runs once per page load.
  async function initDataWatcher() {
    try {
      const hash = await fetchDataHash();
      loadedDataHash = hash;

      const seen = readSeenHash();
      writeSeenHash(hash);

      if (seen && seen !== hash) {
        // New PYQs were added since the last visit. They are already loaded.
        pendingData = { kind: "info", hash };
        processUpdates();
      }
    } catch {
      // offline / server error: try again on the next check
    }
  }

  // Runs while the app is open (resume, timer, back online, SW signal).
  async function checkDataNow() {
    if (!loadedDataHash) {
      await initDataWatcher();
      return;
    }
    try {
      const hash = await fetchDataHash();
      if (hash !== loadedDataHash) {
        pendingData = { kind: "refresh", hash };
        processUpdates();
      }
    } catch {
      // offline: nothing to announce
    }
  }

  function promptPYQUpdate(notice) {
    promptedDataHash = notice.hash;
    pendingData = null;
    updateState.popupOpen = true;

    const isInfo = notice.kind === "info";

    showUpdatePopup({
      icon: ICON_FILE,
      title: "PYQ Updated",
      message: "New PYQ added!",
      sub: isInfo
        ? "Fresh question papers were added and are already available in the app."
        : "Fresh question papers are available. Refresh to see them.",
      confirmText: isInfo ? "Got it" : "Refresh Now",
      hideLater: isInfo,
    }).then((ok) => {
      updateState.popupOpen = false;

      if (!isInfo && ok) {
        writeSeenHash(notice.hash);
        window.location.reload(); // loads the new data.js
      } else {
        processUpdates();
      }
    });
  }

  // ----- Signals from the service worker: each only flips ITS OWN flag -----
  function onVersionSignal() {
    // Ignore on first install (nothing to "update" from). Only hadController
    // is trusted: navigator.serviceWorker.controller becomes truthy on the
    // first visit too (clients.claim()).
    if (!hadController) {
      return;
    }
    updateState.versionAvailable = true;
    processUpdates();
  }

  function onDataSignal() {
    // The worker noticed a change: let the page confirm against what it shows.
    checkDataNow();
  }

  // Ask for a Background Sync (fires when connection is back, even if offline now).
  // Browsers without Background Sync fall back to the "online" event.
  function requestPYQSync() {
    if (!swRegistration) {
      return;
    }

    if ("sync" in swRegistration) {
      swRegistration.sync.register(SYNC_TAG).catch(() => postManualSync());
    } else {
      postManualSync();
    }
  }

  // "Is there new PYQ data?" check, done by the page itself so it works in
  // every browser (Background Sync only fires once and is not on iOS).
  // Used when the app is resumed, on a timer, and when back online.
  const DATA_CHECK_MIN_GAP_MS = 60 * 1000;
  const DATA_CHECK_INTERVAL_MS = 5 * 60 * 1000;
  let lastDataCheck = 0;

  function requestDataCheck(force) {
    const now = Date.now();
    if (!force && now - lastDataCheck < DATA_CHECK_MIN_GAP_MS) {
      return;
    }
    lastDataCheck = now;
    checkDataNow();
  }

  function postManualSync() {
    const sw =
      navigator.serviceWorker.controller ||
      (swRegistration && swRegistration.active);
    if (sw) {
      sw.postMessage({ type: "SYNC_PYQ" });
    }
  }

  // Messages coming from the service worker
  navigator.serviceWorker.addEventListener("message", (event) => {
    const type = event.data && event.data.type;

    if (type === "NEW_VERSION" || type === "VERSION_UPDATED") {
      onVersionSignal();
    } else if (type === "PYQ_UPDATED") {
      onDataSignal();
    }
  });

  window.addEventListener("load", () => {
    initDataWatcher();

    navigator.serviceWorker
      .register(new URL("service-worker.js", document.baseURI).href)
      .then((registration) => {
        console.log("✅ SW Registered");
        swRegistration = registration;

        // A waiting worker is only a new BUILD, not necessarily a new
        // VERSION. Let the version check (version.json) decide.
        if (registration.waiting && hadController) {
          lastVersionCheck = 0;
        }

        // Queue a sync now; it runs as soon as the network is available.
        navigator.serviceWorker.ready.then(() => {
          requestPYQSync();
          requestVersionCheck();
        });
      })
      .catch((err) => console.log("❌ SW Error:", err));
  });

  // Ask the service worker to compare version.json with the installed release.
  // Separate from the PYQ data sync above, so reloading for an app update
  // never interferes with data synchronization.
  const VERSION_CHECK_MIN_GAP_MS = 5 * 60 * 1000;
  let lastVersionCheck = 0;

  function requestVersionCheck() {
    const sw =
      navigator.serviceWorker.controller ||
      (swRegistration && swRegistration.active);
    const now = Date.now();
    if (!sw || now - lastVersionCheck < VERSION_CHECK_MIN_GAP_MS) {
      return;
    }
    lastVersionCheck = now;
    sw.postMessage({ type: "CHECK_VERSION" });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      requestVersionCheck();
      requestDataCheck(false);
    }
  });

  // Phones restore pages from the back/forward cache without a reload.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      requestVersionCheck();
      requestDataCheck(true);
    }
  });

  // While the app stays open, keep looking for new PYQ data.
  setInterval(() => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      requestDataCheck(false);
    }
  }, DATA_CHECK_INTERVAL_MS);

  // Connection restored -> refresh the cache and re-check the app version
  window.addEventListener("online", () => {
    requestPYQSync();
    requestDataCheck(true);
    lastVersionCheck = 0;
    requestVersionCheck();
  });

  // NOTE: there is deliberately no "controllerchange" popup. That event fires
  // for every new worker (also a data-only deploy), so it cannot tell a new
  // version from new data. Only the service worker's VERSION_UPDATED message,
  // which compares version.json "version", may raise the version popup.
}
