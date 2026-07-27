// ================================================================
// TRACKING
// ================================================================
function trackGA4Event(eventName, params = {}) {
  if (typeof gtag === "function") gtag("event", eventName, { ...params, app_name: "BEU PYQ" });
}

// ================================================================
// PWA INSTALL PROMPT + INSTALLED CHECK
// ================================================================
let deferredPrompt = null;
let installInProgress = false;
const installBtn = document.getElementById("installBtn");

function isPWAStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.matchMedia("(display-mode: fullscreen)").matches ||
         window.navigator.standalone === true ||
         document.referrer.startsWith("android-app://");
}

function updateInstallButton() {
  if (!installBtn) return;
  if (isPWAStandalone()) {
    installBtn.innerHTML = "✅ App Mode Active";
    installBtn.style.background = "#16a34a";
    installBtn.disabled = false;
    return;
  }
  if (localStorage.getItem("beu_pwa_installed") === "yes") {
    installBtn.innerHTML = "✅ App Already Installed";
    installBtn.style.background = "#16a34a";
    installBtn.disabled = false;
    return;
  }
  installBtn.innerHTML = "📲 Install App";
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
    platforms: Array.isArray(e.platforms) ? e.platforms.join(",") : "web"
  });
});

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
      install_method: "browser_appinstalled_event"
    });
  }
  clearTimeout(installSuccessTimer);
  installSuccessTimer = setTimeout(() => {
    if (installSuccessPopupShown) return;
    installSuccessPopupShown = true;
    showMessage("✅ App install successfully completed. Ab app icon se open karein.", 8000);
  }, 8000);
});

async function installPWA() {
  updateInstallButton();
  if (isPWAStandalone()) {
    showMessage("✅ App mode active hai. Aap installed app ke andar ho.", 6000);
    installBtn.innerHTML = "✅ App Mode Active";
    installBtn.style.background = "#16a34a";
    return;
  }
  if (installInProgress) {
    showMessage("⏳ App install ho raha hai...", 5000);
    return;
  }
  if (localStorage.getItem("beu_pwa_installed") === "yes" && !deferredPrompt) {
    showMessage("✅ App already installed hai. App icon se open karein.", 6000);
    return;
  }
  if (!deferredPrompt) {
    showMessage("ℹ️ Install option abhi available nahi hai. Chrome menu (⋮) se Add to Home Screen / Install App karein.", 9000);
    return;
  }
  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  installInProgress = true;
  promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  if (choice.outcome === "accepted") {
    installBtn.innerHTML = "⏳ Installing...";
    installBtn.style.background = "#16a34a";
    showMessage("⏳ App install ho raha hai...", 15000);
  } else {
    installInProgress = false;
    showMessage("❌ App install cancel ho gaya.", 5000);
    updateInstallButton();
  }
}

window.addEventListener("DOMContentLoaded", updateInstallButton);
window.matchMedia("(display-mode: standalone)").addEventListener("change", updateInstallButton);

document.getElementById("installBtn").addEventListener("click", () => {
  trackGA4Event("pwa_install_button_click", {
    button_text: installBtn.textContent.trim(),
    prompt_available: deferredPrompt ? "yes" : "no"
  });
  installPWA();
});

// ================================================================
// DOM REFERENCES & HELPERS
// ================================================================
const branchEl = document.getElementById('branch');
const semEl = document.getElementById('sem');
const subjectSelect = document.getElementById('subjectSelect');
const msgEl = document.getElementById('msg');
const subjectListEl = document.getElementById('subjectList');
const subjectBadge = document.getElementById('subjectBadge');

let hideTimer;

function showMessage(text, duration = 6000) {
  clearTimeout(hideTimer);
  msgEl.style.opacity = 1;
  msgEl.innerHTML = text;
  hideTimer = setTimeout(() => {
    msgEl.style.opacity = 0;
    setTimeout(() => {
      msgEl.innerHTML = "🔍 Choose branch, semester & subject to view PYQ.";
      msgEl.style.opacity = 1;
    }, 300);
  }, duration);
}

function getPDFLink(branch, sem, subject) {
  if (pdfDB[sem] && pdfDB[sem][branch] && pdfDB[sem][branch][subject]) {
    return pdfDB[sem][branch][subject];
  }
  return null;
}

// ================================================================
// SUBJECT UPDATE
// ================================================================
function updateSubjects() {
  const branch = branchEl.value;
  const sem = semEl.value;
  subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  if (!branch || !sem) {
    subjectListEl.innerHTML = `<span class="empty-subjects">Select branch & semester to see subjects</span>`;
    subjectBadge.textContent = '—';
    return;
  }
  const subjects = subjectDB[sem]?.[branch] || [];
  if (subjects.length === 0) {
    subjectListEl.innerHTML = `<span class="empty-subjects">📭 No subject list for this selection</span>`;
    subjectBadge.textContent = '0';
    return;
  }
  subjectBadge.textContent = subjects.length;
  subjectListEl.innerHTML = subjects.map(s => `<span class="subject-tag">📖 ${s}</span>`).join('');
  subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub;
    opt.textContent = sub;
    subjectSelect.appendChild(opt);
  });
}

branchEl.addEventListener('change', updateSubjects);
semEl.addEventListener('change', updateSubjects);
updateSubjects();

// ================================================================
// OPEN PDF
// ================================================================
document.getElementById('openBtn').onclick = () => {
  const b = branchEl.value;
  const s = semEl.value;
  const sub = subjectSelect.value;
  if (!b || !s) {
    showMessage("❌ Please select branch & semester.", 7000);
    return;
  }
  if (!sub) {
    showMessage("❌ Please select a subject from the dropdown.", 7000);
    return;
  }
  const pdfLink = getPDFLink(b, s, sub);
  if (!pdfLink) {
    showMessage(`❌ PYQ PDF not available for "${sub}" (${b} - ${s})`, 7000);
    return;
  }
  document.getElementById('pdfFrame').src = pdfLink;
  document.getElementById('pdfModal').style.display = 'flex';
  document.getElementById('pdfModal').classList.add('active');
  showMessage(`📄 Opening PYQ for ${sub} (${b} - ${s})`, 5000);
  trackGA4Event('pyq_open', { branch: b, semester: s, subject: sub });
};

// ================================================================
// CLOSE PDF
// ================================================================
function closePDF() {
  document.getElementById('pdfModal').classList.remove('active');
  document.getElementById('pdfModal').style.display = 'none';
  document.getElementById('pdfFrame').src = '';
}

// ================================================================
// CLOSE DEVELOPER MODAL
// ================================================================
function closeDev() {
  document.getElementById('devModal').classList.remove('active');
  document.getElementById('devModal').style.display = 'none';
}

// ================================================================
// DEVELOPER BUTTON
// ================================================================
document.getElementById('devBtn').onclick = () => {
  trackGA4Event('developer_info_click');
  document.getElementById('devModal').style.display = 'flex';
  document.getElementById('devModal').classList.add('active');
};
document.getElementById('devModal').addEventListener('click', function(e) {
  if (e.target === this) closeDev();
});

// ================================================================
// DOWNLOAD PDF
// ================================================================
document.getElementById('downloadPDFBtn').onclick = () => {
  const pdfLink = document.getElementById('pdfFrame').src;
  const b = branchEl.value, s = semEl.value, sub = subjectSelect.value;
  if (!pdfLink || !b || !s) {
    showMessage("❌ No PDF to download.", 4000);
    return;
  }
  trackGA4Event('pyq_download', { branch: b, semester: s, subject: sub || 'all' });
  const a = document.createElement('a');
  a.href = pdfLink;
  a.download = `${b}_${s}_${sub || 'PYQ'}.pdf`;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
  showMessage("✅ Download started!", 4000);
};

 
// Service Worker Registration (PWA) 
        const BASE = location.hostname.includes("github.io") ? "/BEU-PYQ-App" : "";
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register(`${BASE}/service-worker.js`)
                    .then(reg => console.log("✅ Service Worker Registered"))
                    .catch(err => console.log("❌ Service Worker Error:", err));
            });
        }
