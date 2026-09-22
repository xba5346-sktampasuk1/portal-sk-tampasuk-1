/**
 * Aplikasi Utama e-OPR SK Tampasuk 1 Kota Belud
 * Menguruskan pratonton langsung, penukaran tema, auto-fit teks, cetakan A4 dan interaksi borang
 */

const $ = (id) => document.getElementById(id);

const placeholders = {
  program: "Masukkan nama program",
  date: "Masukkan tarikh",
  day: "Masukkan hari",
  time: "Masukkan masa",
  place: "Masukkan tempat",
  organiser: "Masukkan anjuran / unit / panitia",
  target: "Masukkan kumpulan sasaran",
  objective: "Masukkan objektif program",
  activity: "Masukkan ringkasan aktiviti program",
  weakness: "Masukkan kelemahan / kekangan / isu yang dihadapi",
  suggestion: "Masukkan cadangan penambahbaikan untuk program akan datang",
  preparedName: "Nama Penyedia",
  preparedRole: "Jawatan Penyedia",
  reviewedName: "Nama Penyemak",
  reviewedRole: "Jawatan Penyemak",
  certifiedName: "Nama Pengesah",
  certifiedRole: "Jawatan Pengesah"
};

const dayNames = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];

const themeLabels = {
  pentadbiran: "PENTADBIRAN",
  kurikulum: "KURIKULUM",
  kokurikulum: "KOKURIKULUM",
  hem: "HAL EHWAL MURID",
  "panitia-bm": "PANITIA BAHASA MELAYU",
  "panitia-bi": "PANITIA BAHASA INGGERIS",
  "panitia-math": "PANITIA MATEMATIK",
  "panitia-sains": "PANITIA SAINS",
  "panitia-islam-moral": "PANITIA PAI & MORAL",
  "panitia-sejarah": "PANITIA SEJARAH",
  "panitia-seni-muzik": "PANITIA PSV & MUZIK",
  "panitia-rbt": "PANITIA RBT",
  "panitia-pjk": "PANITIA PJK",
  "panitia-arab-bkd": "PANITIA B. ARAB & BKD"
};

const themeColorMap = {
  pentadbiran: { primary: "#0f2b48", primaryLight: "#18426d", accent: "#d4af37", blockBg: "#f0f4f9", border: "#c8d7e6", label: "PENTADBIRAN" },
  kurikulum: { primary: "#1e5038", primaryLight: "#2c6e4e", accent: "#e5b329", blockBg: "#f1f7f3", border: "#bcd5c7", label: "KURIKULUM" },
  kokurikulum: { primary: "#8a371c", primaryLight: "#ab4826", accent: "#f29c38", blockBg: "#fcf3ee", border: "#e6cbbe", label: "KOKURIKULUM" },
  hem: { primary: "#751428", primaryLight: "#941e37", accent: "#e58b88", blockBg: "#fbf2f3", border: "#e7c6c9", label: "HAL EHWAL MURID" },
  "panitia-bm": { primary: "#165b33", primaryLight: "#267a49", accent: "#f4be40", blockBg: "#f0f7f2", border: "#b8d9c3", label: "PANITIA BAHASA MELAYU" },
  "panitia-bi": { primary: "#123c69", primaryLight: "#1f548f", accent: "#ac3b61", blockBg: "#f0f4fb", border: "#cbd6ea", label: "PANITIA BAHASA INGGERIS" },
  "panitia-math": { primary: "#0a3641", primaryLight: "#125161", accent: "#e67e22", blockBg: "#eef6f8", border: "#b7d6dd", label: "PANITIA MATEMATIK" },
  "panitia-sains": { primary: "#4a235a", primaryLight: "#6c3483", accent: "#58d68d", blockBg: "#f6f0fa", border: "#d7bee6", label: "PANITIA SAINS" },
  "panitia-islam-moral": { primary: "#196f3d", primaryLight: "#229954", accent: "#f39c12", blockBg: "#eef8f1", border: "#bde5cb", label: "PANITIA PAI & MORAL" },
  "panitia-sejarah": { primary: "#6e2c00", primaryLight: "#873600", accent: "#d4ac0d", blockBg: "#fbf5ef", border: "#e2cebf", label: "PANITIA SEJARAH" },
  "panitia-seni-muzik": { primary: "#6c1d45", primaryLight: "#90265c", accent: "#f48fb1", blockBg: "#fdf0f4", border: "#eecad7", label: "PANITIA PSV & MUZIK" },
  "panitia-rbt": { primary: "#424949", primaryLight: "#5d6d7e", accent: "#f1c40f", blockBg: "#f2f4f4", border: "#d0d7d7", label: "PANITIA RBT" },
  "panitia-pjk": { primary: "#9b111e", primaryLight: "#c0392b", accent: "#f5b041", blockBg: "#fdf2f2", border: "#f5c6cb", label: "PANITIA PENDIDIKAN JASMANI & KESIHATAN (PJK)" },
  "panitia-arab-bkd": { primary: "#114b5f", primaryLight: "#1a6f8c", accent: "#e4b363", blockBg: "#f0f7f9", border: "#c3dce3", label: "PANITIA B. ARAB & BKD" }
};

/**
 * Formatkan tarikh ke format standard Malaysia: DD/MM/YYYY
 */
function formatDate(value) {
  if (!value) return placeholders.date;
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Formatkan masa kepada format waktu 12-jam Malaysia (pagi / tengah hari / petang / malam)
 */
function formatTime(timeStr) {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr || "00";

  let period = "pagi";
  if (h === 12) period = "tengah hari";
  else if (h > 12 && h < 19) period = "petang";
  else if (h >= 19) period = "malam";

  const displayH = h % 12 || 12;
  return `${displayH}:${m} ${period}`;
}

/**
 * Penskalaan automatik pratonton A4 mengikut saiz bekas (container)
 */
function fitPreviewToPage() {
  const stage = document.querySelector(".preview-stage");
  const paper = document.querySelector(".opr-paper");
  if (!stage || !paper) return;

  const padding = window.innerWidth <= 640 ? 16 : 32;
  const availableWidth = Math.max(260, stage.clientWidth - padding);
  const scale = Math.min(1, availableWidth / 794);

  paper.style.transform = `scale(${scale})`;
  stage.style.height = `${Math.ceil(1123 * scale + padding)}px`;
}

/**
 * Laraskan saiz fon secara automatik jika teks melebihi ketinggian kotak
 */
function autoFitText() {
  const fit = (el, minSize = 9, step = 0.5) => {
    if (!el) return;
    el.style.fontSize = "";
    let size = parseFloat(window.getComputedStyle(el).fontSize) || 14;
    while (size > minSize && (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)) {
      size -= step;
      el.style.fontSize = `${size}px`;
    }
  };

  document.querySelectorAll(".preview-copy").forEach((el) => {
    fit(el, 8.5, 0.5);
  });

  document.querySelectorAll(".detail-value, .signature-value, .signature-role").forEach((el) => {
    if (!el) return;
    el.style.fontSize = "";
    let size = parseFloat(window.getComputedStyle(el).fontSize) || 11;
    while (size > 7.5 && el.scrollWidth > el.clientWidth) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  });
}

/**
 * Kemaskini semua teks pratonton langsung daripada input borang
 */
function updatePreview() {
  const isOther = $("anjuran") && $("anjuran").value === "Lain-lain";
  const organiser = isOther ? ($("anjuran-lain")?.value || "") : ($("anjuran")?.value || "");

  const start = formatTime($("masa-mula")?.value);
  const end = formatTime($("masa-tamat")?.value);
  const time = start && end ? `${start} – ${end}` : (start || end);

  const setText = (id, val, fallback) => {
    const el = $(id);
    if (el) el.textContent = (val || "").trim() || fallback;
  };

  setText("pv-program", $("program")?.value, placeholders.program);
  setText("pv-date", formatDate($("tarikh")?.value), placeholders.date);
  setText("pv-day", $("hari")?.value, placeholders.day);
  setText("pv-time", time, placeholders.time);
  setText("pv-place", $("tempat")?.value, placeholders.place);
  setText("pv-organiser", organiser, placeholders.organiser);
  setText("pv-target", $("sasaran")?.value, placeholders.target);
  setText("pv-objective", $("objektif")?.value, placeholders.objective);
  setText("pv-activity", $("aktiviti")?.value, placeholders.activity);
  setText("pv-weakness", $("kelemahan")?.value, placeholders.weakness);
  setText("pv-suggestion", $("cadangan")?.value, placeholders.suggestion);
  setText("pv-prepared-name", $("nama-penyedia")?.value, placeholders.preparedName);
  setText("pv-prepared-role", $("jawatan-penyedia")?.value, placeholders.preparedRole);
  setText("pv-reviewed-name", $("nama-penyemak")?.value, placeholders.reviewedName);
  setText("pv-reviewed-role", $("jawatan-penyemak")?.value, placeholders.reviewedRole);
  setText("pv-certified-name", $("nama-pengesah")?.value, placeholders.certifiedName);
  setText("pv-certified-role", $("jawatan-pengesah")?.value, placeholders.certifiedRole);

  requestAnimationFrame(autoFitText);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  if (window.StorageTool) {
    window.StorageTool.saveDraft();
  }
}

/**
 * Kira hari automatik berdasarkan tarikh yang dipilih
 */
function updateDay() {
  const value = $("tarikh")?.value;
  if ($("hari")) {
    $("hari").value = value ? dayNames[new Date(`${value}T12:00:00`).getDay()] : "";
  }
  updatePreview();
}

/**
 * Tukar tema warna borang & OPR
 */
function applyTheme(theme) {
  // Bersihkan kelas tema terdahulu
  const themeClasses = Array.from(document.body.classList).filter(c => c.startsWith('theme-'));
  themeClasses.forEach(c => document.body.classList.remove(c));

  const targetTheme = theme || 'pentadbiran';
  document.body.classList.add(`theme-${targetTheme}`);
  document.body.dataset.activeTheme = targetTheme;

  const label = themeLabels[targetTheme] || targetTheme.toUpperCase();
  const activeBadge = $("active-theme");
  if (activeBadge) activeBadge.textContent = label;

  const tagBadge = $("pv-theme-tag");
  if (tagBadge) {
    tagBadge.textContent = label;
    if (label.length > 20) {
      tagBadge.style.fontSize = "10px";
      tagBadge.style.letterSpacing = "0.5px";
    } else if (label.length > 14) {
      tagBadge.style.fontSize = "11.5px";
      tagBadge.style.letterSpacing = "0.8px";
    } else {
      tagBadge.style.fontSize = "13px";
      tagBadge.style.letterSpacing = "1.2px";
    }
  }

  // Kemaskini butang aktif
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.theme === targetTheme);
  });

  // Jika tema panitia dipilih melalui dropdown
  const panitiaSelect = $("theme-panitia");
  if (panitiaSelect) {
    if (targetTheme.startsWith("panitia-")) {
      panitiaSelect.value = targetTheme;
    }
  }

  fitPreviewToPage();
  if (window.StorageTool) {
    window.StorageTool.saveDraft();
  }
}

/**
 * Tunjukkan notifikasi maklum balas
 */
function showNotice(message, isError) {
  const notice = $("notice");
  if (!notice) return;
  notice.textContent = message;
  notice.className = `notice show mb-4 rounded-xl p-3 text-sm font-semibold flex items-center gap-2 ${
    isError
      ? "border border-red-200 bg-red-50 text-red-700"
      : "border border-emerald-200 bg-emerald-50 text-emerald-800"
  }`;
}

function clearNotice() {
  const notice = $("notice");
  if (notice) {
    notice.textContent = "";
    notice.className = "notice mb-4 rounded-xl p-3 text-sm font-semibold hidden";
  }
}

/**
 * Muat naik logo sekolah kustom (opsyenal)
 */
function setupCustomLogo() {
  const logoInput = $("custom-logo-input");
  if (!logoInput) return;

  logoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const imgUrl = loadEvent.target.result;
      const schoolLogo = $("school-logo-img");
      const headerLogo = $("header-school-logo");
      if (schoolLogo) schoolLogo.src = imgUrl;
      if (headerLogo) headerLogo.src = imgUrl;
    };
    reader.readAsDataURL(file);
  });
}

/* ==========================================================================
   PENGURUSAN HALAMAN & NAVIGASI TAB (PENJANA vs SEJARAH)
   ========================================================================== */

let currentView = "generator";

function switchView(viewName) {
  currentView = viewName;

  const btnGen = $("tab-btn-generator");
  const btnHist = $("tab-btn-history");
  const viewGen = $("view-generator");
  const viewHist = $("view-history");

  if (viewName === "generator") {
    if (btnGen) {
      btnGen.classList.add("is-active");
      btnGen.classList.remove("text-slate-500");
    }
    if (btnHist) {
      btnHist.classList.remove("is-active");
      btnHist.classList.add("text-slate-500");
    }
    if (viewGen) viewGen.classList.remove("hidden");
    if (viewHist) viewHist.classList.add("hidden");

    fitPreviewToPage();
    if (window.lucide) window.lucide.createIcons();
  } else if (viewName === "history") {
    if (btnHist) {
      btnHist.classList.add("is-active");
      btnHist.classList.remove("text-slate-500");
    }
    if (btnGen) {
      btnGen.classList.remove("is-active");
      btnGen.classList.add("text-slate-500");
    }
    if (viewHist) viewHist.classList.remove("hidden");
    if (viewGen) viewGen.classList.add("hidden");

    renderHistoryView();
    updateCloudStatusUI();
    if (window.StorageTool && window.StorageTool.isCloudEnabled()) {
      syncCloudHistory(false);
    }
    if (window.lucide) window.lucide.createIcons();
  }
}

/**
 * Kemas kini bilangan rekod pada lencana tab Sejarah
 */
function updateHistoryCountBadge() {
  const badge = $("history-count-badge");
  if (!badge || !window.StorageTool) return;
  const history = window.StorageTool.getHistory();
  badge.textContent = history.length;
}

/**
 * Kemas kini penunjuk status jika sedang menyunting draf arkib sedia ada
 */
function updateEditingBanner() {
  const banner = $("editing-banner");
  const nameEl = $("editing-program-name");
  if (!banner || !window.StorageTool) return;

  const editingId = window.StorageTool.getCurrentEditingId();
  if (editingId) {
    const record = window.StorageTool.getRecordById(editingId);
    if (record) {
      banner.classList.remove("hidden");
      if (nameEl) nameEl.textContent = record.program || "(Tanpa Tajuk)";
      return;
    }
  }
  banner.classList.add("hidden");
}

/**
 * Muat semula rekod daripada arkib sejarah ke Page Utama untuk disunting
 */
function loadOPRToEditor(recordId) {
  if (!window.StorageTool) return;
  const record = window.StorageTool.getRecordById(recordId);
  if (!record) {
    alert("Rekod OPR tidak dijumpai.");
    return;
  }

  // 1. Muatkan data borang, tema dan gambar
  window.StorageTool.loadData(record);
  window.StorageTool.setCurrentEditingId(record.id);

  // 2. Tukar paparan ke Page Utama (Penjana OPR)
  switchView("generator");
  updateEditingBanner();

  // 3. Paparkan notis makluman
  showNotice(`OPR "${record.program || 'Program'}" telah berjaya dimuatkan ke Page Utama untuk disunting.`, false);

  // 4. Skrol ke borang
  const formEl = $("opr-form");
  if (formEl) {
    formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Persediaan Sebelum Cetakan (Sokongan Penuh Desktop & Mobile iOS/Android)
 */
function prepareForPrint() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                || window.innerWidth <= 800 
                || document.body.classList.contains('view-phone') 
                || document.body.classList.contains('view-tablet');

  if (isMobile) {
    document.body.classList.add('is-mobile-print');
  } else {
    document.body.classList.remove('is-mobile-print');
  }

  window.scrollTo(0, 0);
  if (document.body) document.body.scrollTop = 0;
  if (document.documentElement) document.documentElement.scrollTop = 0;
}

function finishPrint() {
  document.body.classList.remove('is-mobile-print');
  fitPreviewToPage();
}

/**
 * Cetak rekod tertentu terus daripada arkib sejarah
 */
function printRecordFromHistory(recordId) {
  if (!window.StorageTool) return;
  const record = window.StorageTool.getRecordById(recordId);
  if (!record) return;

  window.StorageTool.loadData(record);
  window.StorageTool.setCurrentEditingId(record.id);
  switchView("generator");
  prepareForPrint();
  setTimeout(() => {
    window.print();
  }, 350);
}

/**
 * Padankan rekod OPR dengan penapis Unit / Panitia secara pintar
 */
function matchRecordCategory(item, filterKey) {
  if (!filterKey || filterKey === "all") return true;

  const key = filterKey.toLowerCase().trim();
  const theme = (item.theme || "").toLowerCase().trim();
  const cat = (item.category || "").toLowerCase().trim();
  const anj = (item.anjuran || "").toLowerCase().trim();
  const anjLain = (item.anjuranLain || "").toLowerCase().trim();
  const panitiaSel = (item.panitiaSelect || "").toLowerCase().trim();

  // Teks gabungan bagi anjuran / bahagian / unit / tajuk / kategori
  const combinedText = `${theme} ${cat} ${anj} ${anjLain} ${panitiaSel}`;

  // 1. HAL EHWAL MURID (HEM)
  if (key === "hem" || key.includes("hem") || key.includes("hal ehwal murid")) {
    if (theme === "hem") return true;
    if (theme.startsWith("panitia-") || theme === "kokurikulum") return false;
    const hemKeywords = [
      "hem", "hal ehwal murid", "disiplin", "pengawas", "spbt", 
      "kebajikan", "3k", "keselamatan murid", "kesihatan murid", "kebersihan", 
      "kantin", "asrama", "bencana", "minda sihat"
    ];
    return hemKeywords.some(kw => combinedText.includes(kw));
  }

  // 2. PENTADBIRAN
  if (key === "pentadbiran" || key.includes("pentadbiran")) {
    if (theme === "pentadbiran") return true;
    if (theme === "hem" || theme === "kokurikulum" || theme.startsWith("panitia-")) return false;
    const adminKeywords = [
      "pentadbiran", "pengurusan", "bimbingan", "kaunseling", 
      "ubk", "pibg", "staf", "mesyuarat guru", "ldp", "splkpm"
    ];
    return adminKeywords.some(kw => combinedText.includes(kw));
  }

  // 3. KOKURIKULUM
  if (key === "kokurikulum" || key.includes("koku")) {
    if (theme === "kokurikulum") return true;
    if (theme === "pentadbiran" || theme === "hem" || theme.startsWith("panitia-")) return false;
    const kokumKeywords = [
      "kokurikulum", "kokum", "sukan", "permainan", "1m1s", 
      "merentas desa", "olahraga", "kelab", "persatuan", 
      "uniform", "beruniform", "pengakap", "tkrs", "pbsm", 
      "pandu puteri", "puteri islam"
    ];
    return kokumKeywords.some(kw => combinedText.includes(kw));
  }

  // 4. PANITIA-PANITIA (SEMUA PANITIA MATA PELAJARAN)
  if (key === "panitia") {
    if (theme.startsWith("panitia-")) return true;
    return cat.includes("panitia") || anj.includes("panitia") || anjLain.includes("panitia");
  }

  // 5. PANITIA PENDIDIKAN JASMANI & KESIHATAN (PJK)
  if (key.includes("pjk") || key.includes("jasmani")) {
    return theme === "panitia-pjk" || combinedText.includes("pjk") || combinedText.includes("jasmani");
  }

  // 6. PANITIA MATA PELAJARAN KHUSUS
  if (key.includes("bahasa melayu") || key.includes("bm")) {
    return theme === "panitia-bm" || combinedText.includes("bahasa melayu");
  }
  if (key.includes("bahasa inggeris") || key.includes("bi") || key.includes("english")) {
    return theme === "panitia-bi" || combinedText.includes("bahasa inggeris") || combinedText.includes("english");
  }
  if (key.includes("matematik") || key.includes("math")) {
    return theme === "panitia-math" || combinedText.includes("matematik");
  }
  if (key.includes("sains") || key.includes("science")) {
    return theme === "panitia-sains" || combinedText.includes("sains");
  }
  if (key.includes("islam") || key.includes("moral")) {
    return theme === "panitia-islam-moral" || combinedText.includes("islam") || combinedText.includes("moral");
  }
  if (key.includes("sejarah")) {
    return theme === "panitia-sejarah" || combinedText.includes("sejarah");
  }
  if (key.includes("seni") || key.includes("muzik") || key.includes("psv")) {
    return theme === "panitia-seni-muzik" || combinedText.includes("seni") || combinedText.includes("muzik") || combinedText.includes("psv");
  }
  if (key.includes("rbt") || key.includes("reka bentuk")) {
    return theme === "panitia-rbt" || combinedText.includes("rbt") || combinedText.includes("reka bentuk");
  }
  if (key.includes("arab") || key.includes("bkd")) {
    return theme === "panitia-arab-bkd" || combinedText.includes("arab") || combinedText.includes("bkd");
  }

  // 7. KURIKULUM (UMUM & MATA PELAJARAN)
  if (key === "kurikulum" || key.includes("kurikulum")) {
    if (theme === "kurikulum" || theme.startsWith("panitia-")) return true;
    if (theme === "kokurikulum" || theme === "hem" || theme === "pentadbiran") return false;
    const kuriKeywords = [
      "unit kurikulum", "panitia", "akademik", "peperiksaan", "pbd", 
      "uasa", "stem", "pss", "pusat sumber", "pemulihan"
    ];
    return kuriKeywords.some(kw => combinedText.includes(kw));
  }

  // 8. LAIN-LAIN / UNIT KHAS
  if (key === "other" || key.includes("lain")) {
    const isMainUnit = (
      theme === "pentadbiran" || theme === "kurikulum" || 
      theme === "kokurikulum" || theme === "hem" || theme.startsWith("panitia-")
    );
    const hasSpecialKeywords = [
      "pentadbiran", "kurikulum", "kokurikulum", "hem", "panitia"
    ].some(kw => combinedText.includes(kw));

    return !isMainUnit || !hasSpecialKeywords || anj === "lain-lain" || anjLain.length > 0;
  }

  // Fallback padanan terus
  return combinedText.includes(key) || key.includes(cat) || key.includes(theme);
}

/**
 * Padam rekod OPR daripada arkib sejarah
 */
function deleteRecordFromHistory(recordId, recordTitle) {
  if (!window.StorageTool) return;
  const title = recordTitle || "OPR ini";
  if (confirm(`Adakah anda pasti mahu memadamkan "${title}" daripada Arkib Sejarah?\n\nTindakan ini kekal dan tidak boleh diundur.`)) {
    window.StorageTool.deleteFromHistory(recordId);
    renderHistoryView();
    updateHistoryCountBadge();
    updateEditingBanner();
    showNotice(`Rekod "${title}" telah dipadam daripada Arkib Sejarah.`, false);
  }
}

/**
 * Render senarai kad Master Template dalam Halaman Sejarah OPR
 */
function renderHistoryView() {
  const grid = $("history-grid");
  const emptyState = $("history-empty-state");
  const resultsCount = $("history-results-count");
  if (!grid || !window.StorageTool) return;

  const rawHistory = window.StorageTool.getHistory();
  updateHistoryCountBadge();

  const searchQuery = ($("history-search-input")?.value || "").toLowerCase().trim();
  const filterUnit = $("history-filter-unit")?.value || "all";

  // Tapis rekod secara pintar
  const filtered = rawHistory.filter((item) => {
    // 1. Penapis Unit / Panitia
    if (!matchRecordCategory(item, filterUnit)) {
      return false;
    }

    // 2. Carian Teks Bebas
    if (searchQuery) {
      const matchTitle = (item.program || "").toLowerCase().includes(searchQuery);
      const matchTarikh = (item.tarikh || "").toLowerCase().includes(searchQuery);
      const matchTempat = (item.tempat || "").toLowerCase().includes(searchQuery);
      const matchPenyedia = (item.namaPenyedia || "").toLowerCase().includes(searchQuery);
      const matchCategory = (item.category || "").toLowerCase().includes(searchQuery);
      const matchAnjuran = (item.anjuran || "").toLowerCase().includes(searchQuery);
      if (!matchTitle && !matchTarikh && !matchTempat && !matchPenyedia && !matchCategory && !matchAnjuran) return false;
    }

    return true;
  });

  if (resultsCount) {
    resultsCount.textContent = `Menunjukkan ${filtered.length} daripada ${rawHistory.length} rekod OPR`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  // Bina HTML kad Master Template
  grid.innerHTML = filtered.map((item) => {
    const t = themeColorMap[item.theme] || themeColorMap["pentadbiran"];
    const displayCategory = item.category || t.label;
    const programTitle = item.program || "PROGRAM TANPA TAJUK";
    const dateFormatted = formatDate(item.tarikh);
    const timeFormatted = item.masaMula ? `${formatTime(item.masaMula)}${item.masaTamat ? ' – ' + formatTime(item.masaTamat) : ''}` : "Masa Tidak Dinyatakan";
    
    // Kira gambar aktiviti
    const imgEntries = item.images ? Object.entries(item.images).filter(([, src]) => !!src) : [];
    const photoCount = imgEntries.length;

    // Slot gambar (miniature)
    let photosHtml = "";
    if (photoCount > 0) {
      const displayPhotos = imgEntries.slice(0, 4);
      photosHtml = `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-2">
          ${displayPhotos.map(([, src], idx) => `
            <div class="mini-photo-slot relative group">
              <img src="${src}" alt="Foto ${idx + 1}" class="w-full h-full object-cover">
            </div>
          `).join("")}
        </div>
      `;
    } else {
      photosHtml = `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center my-2 text-slate-400 text-[11px] italic">
          Tiada gambar aktiviti dimuat naik
        </div>
      `;
    }

    const isCurrentEditing = window.StorageTool.getCurrentEditingId() === item.id;

    return `
      <div class="history-opr-card ${isCurrentEditing ? 'ring-2 ring-amber-400' : ''}" 
           style="--primary: ${t.primary}; --primary-light: ${t.primaryLight}; --accent: ${t.accent}; --block-bg: ${t.blockBg}; --block-border: ${t.border};"
           data-id="${item.id}">
        
        <!-- Bar Status Atas Kad -->
        <div class="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="inline-block w-3 h-3 rounded-full flex-none" style="background-color: ${t.primary};"></span>
            <span class="text-xs font-extrabold uppercase tracking-wide truncate" style="color: ${t.primary};">
              ${displayCategory}
            </span>
          </div>
          <div class="flex items-center gap-1.5 flex-none">
            ${isCurrentEditing ? `
              <span class="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                DRAF AKTIF
              </span>
            ` : ""}
            <span class="text-[11px] text-slate-500 font-medium">
              ${new Date(item.updatedAt || item.savedAt || 0).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <!-- REKA BENTUK HASIL MASTER TEMPLATE (MINIATUR) -->
        <div class="p-3 sm:p-4 cursor-pointer hover:bg-slate-50/70 transition" onclick="loadOPRToEditor('${item.id}')" title="Klik untuk memuatkan OPR ini ke Page Utama bagi disunting">
          
          <div class="mini-master-paper p-3 bg-white">
            
            <!-- Mini Header Master Template -->
            <div class="mini-master-header rounded-md flex items-center gap-2 mb-2 p-1.5 border-t border-b border-amber-400/60" style="background: linear-gradient(135deg, ${t.primary}, ${t.primaryLight});">
              <div class="flex items-center gap-1.5 flex-none">
                <div class="w-6 h-6 rounded-full bg-white p-0.5 border border-amber-400 shadow-sm flex items-center justify-center overflow-hidden">
                  <img src="assets/jata-negara.png" alt="Jata Negara" class="w-full h-full object-contain">
                </div>
                <div class="w-6 h-6 rounded-full bg-white p-0.5 border border-amber-400 shadow-sm flex items-center justify-center overflow-hidden">
                  <img src="assets/logo-sekolah.png" alt="Logo Sekolah" class="w-full h-full object-contain">
                </div>
              </div>
              <div class="flex-1 min-w-0 text-center">
                <div class="text-[10px] font-black tracking-wider text-amber-300 uppercase leading-none" style="font-family: 'Cinzel', serif;">ONE PAGE REPORT</div>
                <div class="text-[7.5px] font-bold text-amber-100/90 truncate tracking-wide mt-0.5">SK TAMPASUK 1 KOTA BELUD</div>
              </div>
              <div class="px-1.5 py-0.5 rounded text-[8px] font-black text-amber-950 uppercase flex-none border border-amber-700/60 shadow-sm" style="background: linear-gradient(135deg, #fcedc5, #dfb753, #aa771c); font-family: 'Cinzel', serif;">
                ${t.label}
              </div>
            </div>

            <!-- Blok 1: Tajuk Program -->
            <div class="mini-block mb-2">
              <div class="mini-block-head">
                <span>1</span>
                <span>NAMA PROGRAM</span>
              </div>
              <div class="p-2 font-extrabold text-xs sm:text-sm text-slate-900 uppercase leading-snug tracking-tight">
                ${programTitle}
              </div>
            </div>

            <!-- Blok 2 & 3: Butiran Program -->
            <div class="grid grid-cols-2 gap-1.5 text-[10px] text-slate-700 font-medium mb-2">
              <div class="p-1.5 rounded bg-slate-50 border border-slate-200">
                <strong class="text-slate-900">Tarikh:</strong> ${dateFormatted}
              </div>
              <div class="p-1.5 rounded bg-slate-50 border border-slate-200">
                <strong class="text-slate-900">Masa:</strong> ${timeFormatted}
              </div>
              <div class="p-1.5 rounded bg-slate-50 border border-slate-200 truncate">
                <strong class="text-slate-900">Tempat:</strong> ${item.tempat || "-"}
              </div>
              <div class="p-1.5 rounded bg-slate-50 border border-slate-200 truncate">
                <strong class="text-slate-900">Sasaran:</strong> ${item.sasaran || "-"}
              </div>
            </div>

            <!-- Gambar Aktiviti Yang Telah Dimuat Naik -->
            <div class="text-[9px] font-extrabold text-slate-600 flex items-center justify-between mb-1">
              <span>GAMBAR AKTIVITI (${photoCount} FOTO)</span>
              <span class="text-[8.5px] text-blue-700 font-bold">Susun atur: ${item.photoLayout || '6'} Gambar</span>
            </div>
            ${photosHtml}

            <!-- Moto Sekolah Ringkas -->
            <div class="text-center text-[10.5px] text-blue-950 italic tracking-wide pt-1.5 opacity-80" style="font-family: 'Great Vibes', cursive, serif;">
              “Sekata Melakar Kecemerlangan”
            </div>

            <!-- Tandatangan Ringkas -->
            <div class="pt-1.5 mt-1 border-t border-slate-200 flex justify-between text-[9px] text-slate-600 font-medium">
              <div>
                <span class="text-slate-400">Penyedia:</span>
                <strong class="block text-slate-900 truncate max-w-[120px]">${item.namaPenyedia || "Guru Penyedia"}</strong>
              </div>
              <div class="text-right">
                <span class="text-slate-400">Pengesah:</span>
                <strong class="block text-slate-900 truncate max-w-[120px]">${item.namaPengesah || "Guru Besar"}</strong>
              </div>
            </div>

          </div>

          <div class="mt-2 text-center text-[11px] text-blue-800 font-bold flex items-center justify-center gap-1">
            <i data-lucide="mouse-pointer-click" class="w-3.5 h-3.5 text-amber-500"></i>
            <span>Klik kad untuk memuat semula ke Page Utama</span>
          </div>

        </div>

        <!-- Palang Tindakan Kad Bawah -->
        <div class="p-3 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between gap-2 mt-auto">
          <!-- Butang Sunting di Page Utama -->
          <button type="button" 
                  onclick="loadOPRToEditor('${item.id}')"
                  class="inline-flex items-center gap-1.5 bg-blue-950 hover:bg-blue-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>Sunting</span>
          </button>

          <!-- Butang Cetak Pantas -->
          <button type="button" 
                  onclick="printRecordFromHistory('${item.id}')"
                  class="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
            <span>Cetak PDF</span>
          </button>

          <!-- Butang Padam (Delete) -->
          <button type="button" 
                  onclick="deleteRecordFromHistory('${item.id}', '${(item.program || '').replace(/'/g, "\\'")}')"
                  title="Padam rekod ini daripada arkib"
                  class="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-xl text-xs transition">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>Padam</span>
          </button>
        </div>

      </div>
    `;
  }).join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Kosongkan keseluruhan borang input dan kembalikan Master Template ke keadaan asal
 */
function resetOPRForm(skipConfirm = false) {
  if (!skipConfirm) {
    const ok = confirm("Adakah anda pasti mahu mengosongkan keseluruhan borang dan Master Template?");
    if (!ok) return false;
  }

  // 1. Kosongkan borang HTML secara rasmi
  const form = document.getElementById("opr-form");
  if (form) {
    try {
      if (typeof form.reset === "function") {
        form.reset();
      } else {
        HTMLFormElement.prototype.reset.call(form);
      }
    } catch (e) {
      console.warn("form.reset:", e);
    }
  }

  // 2. Kosongkan setiap elemen input, textarea dan select secara eksplisit
  const fieldIds = [
    "anjuran", "anjuran-lain", "program", "tarikh", "hari", 
    "masa-mula", "masa-tamat", "tempat", "sasaran", 
    "objektif", "aktiviti", "kelemahan", "cadangan", 
    "nama-penyedia", "jawatan-penyedia", "nama-penyemak", "jawatan-penyemak", 
    "nama-pengesah", "jawatan-pengesah"
  ];

  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === "SELECT") {
        el.selectedIndex = 0;
      } else {
        el.value = "";
      }
    }
  });

  const otherWrap = document.getElementById("other-wrap");
  if (otherWrap) otherWrap.classList.add("hidden");

  // 3. Kosongkan semua gambar (ImageTool, Form Box & Slot Pratonton Master Template)
  if (window.ImageTool) {
    window.ImageTool.imageData = {};
    for (let i = 1; i <= 6; i++) {
      const fileInput = document.getElementById(`gambar-${i}`);
      if (fileInput) fileInput.value = "";

      const uploadBox = document.getElementById(`upload-box-${i}`);
      const formImg = document.getElementById(`form-img-${i}`);
      if (uploadBox) uploadBox.classList.remove("has-image");
      if (formImg) formImg.removeAttribute("src");

      const pvSlot = document.getElementById(`slot-${i}`);
      const pvImg = document.getElementById(`pv-img-${i}`);
      if (pvSlot) pvSlot.classList.remove("has-image");
      if (pvImg) pvImg.removeAttribute("src");
    }

    const layoutSelect = document.getElementById("photo-layout-select");
    if (layoutSelect) layoutSelect.value = "6";
    window.ImageTool.setLayout(6);

    const batchInput = document.getElementById("batch-upload-input");
    if (batchInput) batchInput.value = "";
  }

  // 4. Padam draf dari simpanan tempatan & hentikan auto-save
  if (window.StorageTool) {
    clearTimeout(window.StorageTool.debounceTimer);
    window.StorageTool.clearDraft();
    window.StorageTool.setCurrentEditingId(null);
  }

  // 5. Kembalikan tema kepada Pentadbiran secara lalai
  applyTheme("pentadbiran");

  // 6. Kembalikan teks Master Template kepada teks placeholder asal
  const setText = (id, fallback) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fallback;
  };

  setText("pv-program", placeholders.program);
  setText("pv-date", placeholders.date);
  setText("pv-day", placeholders.day);
  setText("pv-time", placeholders.time);
  setText("pv-place", placeholders.place);
  setText("pv-organiser", placeholders.organiser);
  setText("pv-target", placeholders.target);
  setText("pv-objective", placeholders.objective);
  setText("pv-activity", placeholders.activity);
  setText("pv-weakness", placeholders.weakness);
  setText("pv-suggestion", placeholders.suggestion);
  setText("pv-prepared-name", placeholders.preparedName);
  setText("pv-prepared-role", placeholders.preparedRole);
  setText("pv-reviewed-name", placeholders.reviewedName);
  setText("pv-reviewed-role", placeholders.reviewedRole);
  setText("pv-certified-name", placeholders.certifiedName);
  setText("pv-certified-role", placeholders.certifiedRole);

  // 7. Kemaskini status UI & Pratonton
  const statusElem = document.getElementById("save-status");
  if (statusElem) {
    statusElem.textContent = "Borang dikosongkan";
  }

  updateEditingBanner();
  clearNotice();
  fitPreviewToPage();

  if (window.lucide) {
    window.lucide.createIcons();
  }

  showNotice("✅ Borang dan Master Template telah berjaya dikosongkan.", false);
  return true;
}

/**
 * Inisialisasi Aplikasi Semasa Halaman Dimuatkan
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Inisialisasi ikon Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Inisialisasi Modul Imej
  if (window.ImageTool) {
    window.ImageTool.init();
  }

  // 3. Pasang pendengar peristiwa pada semua input borang
  document.querySelectorAll("input:not([type=file]), textarea, select").forEach((input) => {
    input.addEventListener("input", updatePreview);
    input.addEventListener("change", updatePreview);
  });

  if ($("tarikh")) {
    $("tarikh").addEventListener("change", updateDay);
  }

  if ($("anjuran")) {
    $("anjuran").addEventListener("change", () => {
      const otherWrap = $("other-wrap");
      if (otherWrap) {
        otherWrap.classList.toggle("hidden", $("anjuran").value !== "Lain-lain");
      }
      updatePreview();
    });
  }

  // 4. Pengendali Pemilihan Tema
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(btn.dataset.theme);
    });
  });

  const panitiaSelect = $("theme-panitia");
  if (panitiaSelect) {
    panitiaSelect.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });
  }

  // 5. Pengendali Mod Paparan (Desktop, Tablet, Phone)
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.body.classList.remove("view-desktop", "view-tablet", "view-phone");
      document.body.classList.add(`view-${btn.dataset.view}`);
      document.querySelectorAll("[data-view]").forEach((item) => {
        item.classList.toggle("is-active", item === btn);
      });
      requestAnimationFrame(fitPreviewToPage);
    });
  });

  // 6. Pengendali Navigasi Tab (Penjana OPR vs Sejarah OPR)
  const tabGen = $("tab-btn-generator");
  if (tabGen) {
    tabGen.addEventListener("click", () => switchView("generator"));
  }

  const tabHist = $("tab-btn-history");
  if (tabHist) {
    tabHist.addEventListener("click", () => switchView("history"));
  }

  const btnNewFromHist = $("btn-new-opr-from-history");
  if (btnNewFromHist) {
    btnNewFromHist.addEventListener("click", () => {
      if (window.StorageTool) window.StorageTool.setCurrentEditingId(null);
      updateEditingBanner();
      switchView("generator");
    });
  }

  const btnEmptyCreate = $("btn-empty-create");
  if (btnEmptyCreate) {
    btnEmptyCreate.addEventListener("click", () => switchView("generator"));
  }

  const btnCancelEditing = $("btn-cancel-editing");
  if (btnCancelEditing) {
    btnCancelEditing.addEventListener("click", () => {
      if (window.StorageTool) window.StorageTool.setCurrentEditingId(null);
      updateEditingBanner();
      showNotice("Mod suntingan ditutup. Anda kini mencipta OPR baharu.", false);
    });
  }

  // 7. Pengendali Carian & Penapisan Sejarah OPR
  const searchInput = $("history-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderHistoryView();
    });
  }

  const filterUnit = $("history-filter-unit");
  if (filterUnit) {
    filterUnit.addEventListener("change", () => {
      document.querySelectorAll(".history-pill").forEach((p) => {
        p.classList.toggle("is-active", p.dataset.pill === filterUnit.value);
      });
      renderHistoryView();
    });
  }

  // Penapis Pantas (Pills)
  document.querySelectorAll(".history-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".history-pill").forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      if (filterUnit) {
        filterUnit.value = pill.dataset.pill;
      }
      renderHistoryView();
    });
  });

  // Kosongkan Keseluruhan Arkib
  const btnClearAll = $("btn-clear-all-history");
  if (btnClearAll && window.StorageTool) {
    btnClearAll.addEventListener("click", () => {
      if (confirm("AMARAN: Adakah anda pasti mahu mengosongkan KESEMUA rekod Sejarah OPR?\n\nSemua janaan terdahulu akan dipadamkan dari pelayar ini.")) {
        window.StorageTool.clearAllHistory();
        renderHistoryView();
        updateHistoryCountBadge();
        updateEditingBanner();
        showNotice("Keseluruhan arkib sejarah OPR telah dikosongkan.", false);
      }
    });
  }

  // 8. Pengendali Butang Jana OPR (Validasi & Auto-Save ke Arkib Sejarah)
  const form = $("opr-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const requiredFields = [
        ["anjuran", "Anjuran / Bahagian"],
        ["program", "Nama Program"],
        ["tarikh", "Tarikh"],
        ["masa-mula", "Masa Mula"],
        ["tempat", "Tempat"],
        ["sasaran", "Kumpulan Sasaran"],
        ["objektif", "Objektif Program"],
        ["aktiviti", "Aktiviti Program"],
        ["nama-penyedia", "Nama Penyedia"],
        ["jawatan-penyedia", "Jawatan Penyedia"],
        ["nama-pengesah", "Nama Pengesah"],
        ["jawatan-pengesah", "Jawatan Pengesah"]
      ];

      const missing = requiredFields
        .filter(([id]) => !$(id)?.value.trim())
        .map(([, label]) => label);

      if ($("anjuran")?.value === "Lain-lain" && !$("anjuran-lain")?.value.trim()) {
        missing.push("Masukkan Anjuran Khas");
      }

      const uploadedCount = window.ImageTool ? Object.keys(window.ImageTool.imageData).length : 0;
      if (uploadedCount < 1) {
        showNotice("Sila muat naik sekurang-kurangnya 1 keping gambar aktiviti.", true);
        return;
      }

      if (missing.length > 0) {
        showNotice(`Sila lengkapkan maklumat berikut: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? " dan lain-lain." : "."}`, true);
        return;
      }

      updatePreview();

      // AUTO-SAVE KE ARKIB SEJARAH SETIAP KALI 'JANA OPR' DITEKAN
      let saveRes = null;
      if (window.StorageTool) {
        saveRes = window.StorageTool.saveToHistory();
        updateHistoryCountBadge();
        updateEditingBanner();
      }

      const catName = saveRes && saveRes.record ? saveRes.record.category : "Unit";
      showNotice(`✅ OPR berjaya dijana dan disimpan ke Sejarah OPR (Unit/Panitia: ${catName})! Laporan sedia untuk dicetak atau disimpan sebagai PDF.`, false);
      
      const previewArea = $("preview-area");
      if (previewArea && window.innerWidth <= 1120) {
        previewArea.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // 9. Pengendali Butang Reset (Kosongkan)
  const resetBtn = $("btn-reset-opr") || $("reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetOPRForm();
    });
  }

  // 10. Cetakan Terus / Simpan PDF (Standard Browser Print A4)
  const printBtn = $("print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      updatePreview();
      prepareForPrint();
      setTimeout(() => {
        window.print();
      }, 60);
    });
  }

  // 11. Logo Kustom
  setupCustomLogo();

  // 12. Muat semula draf tersimpan dari LocalStorage jika ada
  const hasDraft = window.StorageTool ? window.StorageTool.loadDraft() : false;
  if (!hasDraft) {
    applyTheme("pentadbiran");
    updatePreview();
  }

  updateHistoryCountBadge();
  updateEditingBanner();

  // 13. Pembantu Pintar Jana AI
  setupAIAssistant();

  // 14. Integrasi Awan DELIMa (Google Sheets & Drive)
  setupCloudSync();

  // 15. Penskalaan paparan & Pengendali Cetakan A4 Sempurna
  window.addEventListener("resize", fitPreviewToPage);
  fitPreviewToPage();

  window.addEventListener("beforeprint", () => {
    prepareForPrint();
  });

  window.addEventListener("afterprint", () => {
    finishPrint();
  });
});

/**
 * Persediaan Pembantu Pintar "Jana AI" bagi Pengisian Borang
 */
function setupAIAssistant() {
  const getContext = () => {
    const prog = ($("program")?.value || "").trim();
    let anj = ($("anjuran")?.value || "").trim();
    if (anj === "Lain-lain") {
      anj = ($("anjuran-lain")?.value || "").trim() || "Unit Khas";
    }
    const sas = ($("sasaran")?.value || "").trim();
    const tmp = ($("tempat")?.value || "").trim();
    return { program: prog, anjuran: anj, sasaran: sas, tempat: tmp };
  };

  const fieldLabels = {
    objektif: "Objektif Program",
    aktiviti: "Ringkasan Aktiviti",
    kelemahan: "Kelemahan & Isu",
    cadangan: "Cadangan Penambahbaikan",
    sasaran: "Kumpulan Sasaran"
  };

  // 1. Butang Jana AI untuk setiap medan individu
  document.querySelectorAll(".btn-ai-assist").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const field = btn.dataset.aiField;
      const targetInput = $(field);
      if (!targetInput) return;

      const ctx = getContext();
      if (!ctx.program) {
        showNotice("⚠️ Sila masukkan Nama Program / Aktiviti terlebih dahulu agar AI dapat menjana cadangan yang tepat.", true);
        const progInput = $("program");
        if (progInput) {
          progInput.focus();
          progInput.scrollIntoView({ behavior: "smooth", block: "center" });
          progInput.classList.add("ai-pulse-field");
          setTimeout(() => progInput.classList.remove("ai-pulse-field"), 1500);
        }
        return;
      }

      if (!window.AIAssistant) {
        showNotice("Modul AI Assistant sedang dimuatkan...", false);
        return;
      }

      // Animasi status menjana
      const origHtml = btn.innerHTML;
      btn.classList.add("is-generating");
      btn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-amber-600"></i><span>Menjana...</span>';
      if (window.lucide) window.lucide.createIcons();

      try {
        const res = await window.AIAssistant.generateForField(field, ctx);
        if (res.success && res.text) {
          targetInput.value = res.text;
          targetInput.classList.add("ai-pulse-field");
          setTimeout(() => targetInput.classList.remove("ai-pulse-field"), 1200);
          updatePreview();
          const label = fieldLabels[field] || field;
          showNotice(`✨ Cadangan ${label} berjaya dijana oleh AI berpandukan "${ctx.program}"!`, false);
        } else {
          showNotice(res.error || "Gagal menjana kandungan AI.", true);
        }
      } catch (err) {
        console.warn("Ralat jana AI:", err);
        showNotice("Ralat semasa menjana kandungan AI.", true);
      } finally {
        btn.classList.remove("is-generating");
        btn.innerHTML = origHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  });

  // 2. Butang Jana Draf Penuh (Semua Ruangan Serentak)
  const btnGenAll = $("btn-ai-generate-all");
  if (btnGenAll) {
    btnGenAll.addEventListener("click", async (e) => {
      e.preventDefault();
      const ctx = getContext();
      if (!ctx.program) {
        showNotice("⚠️ Sila masukkan Nama Program / Aktiviti terlebih dahulu agar AI dapat menjana draf penuh.", true);
        const progInput = $("program");
        if (progInput) {
          progInput.focus();
          progInput.scrollIntoView({ behavior: "smooth", block: "center" });
          progInput.classList.add("ai-pulse-field");
          setTimeout(() => progInput.classList.remove("ai-pulse-field"), 1500);
        }
        return;
      }

      if (!window.AIAssistant) {
        showNotice("Modul AI Assistant sedang dimuatkan...", false);
        return;
      }

      const origHtml = btnGenAll.innerHTML;
      btnGenAll.classList.add("is-generating");
      btnGenAll.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-amber-300"></i><span>Menjana Draf Penuh...</span>';
      if (window.lucide) window.lucide.createIcons();

      try {
        const res = await window.AIAssistant.generateFullDraft(ctx);
        if (res.success && res.data) {
          if ($("sasaran") && res.data.sasaran) {
            $("sasaran").value = res.data.sasaran;
            $("sasaran").classList.add("ai-pulse-field");
          }
          if ($("objektif")) {
            $("objektif").value = res.data.objektif;
            $("objektif").classList.add("ai-pulse-field");
          }
          if ($("aktiviti")) {
            $("aktiviti").value = res.data.aktiviti;
            $("aktiviti").classList.add("ai-pulse-field");
          }
          if ($("kelemahan")) {
            $("kelemahan").value = res.data.kelemahan;
            $("kelemahan").classList.add("ai-pulse-field");
          }
          if ($("cadangan")) {
            $("cadangan").value = res.data.cadangan;
            $("cadangan").classList.add("ai-pulse-field");
          }

          setTimeout(() => {
            document.querySelectorAll(".ai-pulse-field").forEach((el) => el.classList.remove("ai-pulse-field"));
          }, 1400);

          updatePreview();
          showNotice(`✨ Draf lengkap (Objektif, Aktiviti, Kelemahan & Cadangan) telah berjaya dijana oleh AI berpandukan "${ctx.program}"!`, false);
        } else {
          showNotice(res.error || "Gagal menjana draf penuh AI.", true);
        }
      } catch (err) {
        console.warn("Ralat jana draf penuh AI:", err);
        showNotice("Ralat semasa menjana draf penuh AI.", true);
      } finally {
        btnGenAll.classList.remove("is-generating");
        btnGenAll.innerHTML = origHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
}

/**
 * ==========================================================================
 * INTEGRASI AWAN DELIMA (GOOGLE SHEETS & GOOGLE DRIVE)
 * ==========================================================================
 */

function updateCloudStatusUI() {
  const badge = $("cloud-status-badge");
  const iconWrap = $("cloud-status-icon");
  const desc = $("cloud-status-desc");
  const btnDisconnect = $("btn-disconnect-cloud");
  const inputUrl = $("input-cloud-url");
  if (!window.StorageTool) return;

  const isEnabled = window.StorageTool.isCloudEnabled();
  const currentUrl = window.StorageTool.getCloudUrl();

  if (inputUrl && !inputUrl.value) inputUrl.value = currentUrl;

  if (badge) {
    if (isEnabled) {
      badge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-sm";
      badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Awan DELIMa Terhubung</span>';
    } else {
      badge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5 shadow-sm";
      badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-400"></span><span>Mod Tempatan Sahaja</span>';
    }
  }

  if (iconWrap) {
    if (isEnabled) {
      iconWrap.className = "w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-none border border-emerald-300 shadow-sm";
    } else {
      iconWrap.className = "w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center flex-none border border-blue-200 shadow-inner";
    }
  }

  if (desc) {
    if (isEnabled) {
      desc.textContent = "Disegerakkan secara automatik bersama Google Sheets & Google Drive akaun DELIMa sekolah.";
    } else {
      desc.textContent = "Hubungkan ke Google Sheets akaun DELIMa sekolah untuk perkongsian arkib antara semua desktop guru.";
    }
  }

  if (btnDisconnect) {
    btnDisconnect.classList.toggle("hidden", !isEnabled);
  }
}

async function syncCloudHistory(showNoticeMsg = true) {
  if (!window.StorageTool) return;

  if (!window.StorageTool.isCloudEnabled()) {
    if (showNoticeMsg) {
      const openModal = confirm("Awan DELIMa belum dikonfigurasi pada peranti ini.\n\nAdakah anda mahu membuka tetapan untuk memasukkan URL Google Apps Script sekarang?");
      if (openModal) {
        openCloudModal();
      }
    }
    return;
  }

  const syncBtn = $("btn-sync-cloud");
  const syncIcon = $("sync-icon");
  const syncText = $("sync-btn-text");
  const lastSyncTime = $("cloud-last-sync-time");

  if (syncBtn) syncBtn.disabled = true;
  if (syncIcon) syncIcon.classList.add("animate-spin");
  if (syncText) syncText.textContent = "Menyegerak...";

  try {
    const res = await window.StorageTool.fetchFromCloud();
    if (res.success) {
      renderHistoryView();
      updateHistoryCountBadge();
      const nowStr = new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
      if (lastSyncTime) {
        lastSyncTime.textContent = `Disemak jam ${nowStr} (${res.count} rekod)`;
      }
      if (showNoticeMsg) {
        showNotice(`✅ Arkib berjaya disegerakkan! ${res.count} rekod OPR sedia diakses.`, false);
      }
    } else {
      if (showNoticeMsg) {
        showNotice(`⚠️ Gagal menyegerak: ${res.error || res.reason || "Sila semak URL Web App anda."}`, true);
      }
    }
  } catch (err) {
    console.warn("syncCloudHistory error:", err);
    if (showNoticeMsg) {
      showNotice("⚠️ Ralat semasa menyambung ke Awan DELIMa.", true);
    }
  } finally {
    if (syncBtn) syncBtn.disabled = false;
    if (syncIcon) syncIcon.classList.remove("animate-spin");
    if (syncText) syncText.textContent = "Segerak Awan";
    if (window.lucide) window.lucide.createIcons();
  }
}

function openCloudModal() {
  const modal = $("modal-cloud-setup");
  const input = $("input-cloud-url");
  const statusEl = $("cloud-test-status");
  if (modal) modal.classList.remove("hidden");
  if (input && window.StorageTool) {
    input.value = window.StorageTool.getCloudUrl();
    input.focus();
  }
  if (statusEl) {
    statusEl.className = "hidden p-3.5 rounded-xl text-xs font-semibold";
    statusEl.textContent = "";
  }
  updateCloudStatusUI();
  if (window.lucide) window.lucide.createIcons();
}

function closeCloudModal() {
  const modal = $("modal-cloud-setup");
  if (modal) modal.classList.add("hidden");
}

function setupCloudSync() {
  updateCloudStatusUI();

  const btnSync = $("btn-sync-cloud");
  if (btnSync) {
    btnSync.addEventListener("click", () => syncCloudHistory(true));
  }

  const btnOpenModal = $("btn-open-cloud-modal");
  if (btnOpenModal) {
    btnOpenModal.addEventListener("click", openCloudModal);
  }

  const btnCloseModal = $("btn-close-cloud-modal");
  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", closeCloudModal);
  }

  const backdrop = $("cloud-modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeCloudModal);
  }

  const btnTest = $("btn-test-cloud-connection");
  const statusEl = $("cloud-test-status");
  const testText = $("test-btn-text");
  if (btnTest) {
    btnTest.addEventListener("click", async () => {
      const input = $("input-cloud-url");
      const url = (input?.value || "").trim();
      if (!url) {
        alert("Sila masukkan URL Web App Google Apps Script terlebih dahulu.");
        return;
      }
      if (testText) testText.textContent = "Menguji...";
      btnTest.disabled = true;

      const res = await window.StorageTool.testCloudConnection(url);
      btnTest.disabled = false;
      if (testText) testText.textContent = "Uji Sambungan";

      if (statusEl) {
        statusEl.classList.remove("hidden");
        if (res.success) {
          statusEl.className = "p-3.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300";
          statusEl.textContent = "✅ " + res.message;
        } else {
          statusEl.className = "p-3.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300";
          statusEl.textContent = "❌ " + res.message;
        }
      }
    });
  }

  const btnSave = $("btn-save-cloud-setup");
  if (btnSave) {
    btnSave.addEventListener("click", async () => {
      const input = $("input-cloud-url");
      const url = (input?.value || "").trim();
      if (!url) {
        alert("Sila masukkan URL Web App Google Apps Script.");
        return;
      }
      window.StorageTool.setCloudUrl(url);
      updateCloudStatusUI();
      closeCloudModal();
      showNotice("✅ Tetapan Awan DELIMa disimpan. Memulakan penyegerakan...", false);
      await syncCloudHistory(true);
    });
  }

  const btnDisconnect = $("btn-disconnect-cloud");
  if (btnDisconnect) {
    btnDisconnect.addEventListener("click", () => {
      if (confirm("Adakah anda pasti mahu memutuskan sambungan Awan DELIMa pada peranti ini?\n\nRekod tempatan yang sedia ada tidak akan dipadam.")) {
        window.StorageTool.setCloudUrl("");
        updateCloudStatusUI();
        closeCloudModal();
        showNotice("Sambungan Awan DELIMa telah diputuskan. Sistem kini dalam mod tempatan.", false);
      }
    });
  }
}

// Pendedahan fungsi ke global window
window.applyTheme = applyTheme;
window.updatePreview = updatePreview;
window.switchView = switchView;
window.loadOPRToEditor = loadOPRToEditor;
window.printRecordFromHistory = printRecordFromHistory;
window.deleteRecordFromHistory = deleteRecordFromHistory;
window.renderHistoryView = renderHistoryView;
window.updateHistoryCountBadge = updateHistoryCountBadge;
window.resetOPRForm = resetOPRForm;
window.syncCloudHistory = syncCloudHistory;
window.openCloudModal = openCloudModal;
window.closeCloudModal = closeCloudModal;
window.updateCloudStatusUI = updateCloudStatusUI;

