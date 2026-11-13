/**
 * e-GGs (e-Guru Ganti Sekolah) — Edisi Komersial (White-Label)
 * Logik Aplikasi Utama (Sedia Digunakan Oleh Semua Sekolah)
 * © byCikguJayResources
 */

// Keadaan Aplikasi (Application State)
let allRecords = [];
let calYear, calMonth;

// Format Tarikh Tempatan Malaysia (UTC+8) - Menyelesaikan ralat tarikh semalam pada waktu pagi
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${MALAY_MONTHS[m - 1]} ${y}`;
}

function getDayFromDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  return MALAY_DAYS[date.getDay()];
}

// Status Pengecualian Guru Ganti (Cadangan 2: Program Sekolah & Guru Tiada Kelas / Tiada Gantian)
const PROGRAM_SEKOLAH_VAL = "PROGRAM SEKOLAH (TIADA GANTIAN)";

function isSpecialProgramRelief(val) {
  if (!val) return false;
  const s = String(val).trim().toUpperCase();
  return s.includes("PROGRAM SEKOLAH") || s.includes("TIADA GANTIAN") || s.includes("TIADA KELAS");
}

// Elemen DOM Utama
const dayInput = document.getElementById("hari");
const dateInput = document.getElementById("tarikh");
const mingguSelect = document.getElementById("minggu");
const kumpulanSelect = document.getElementById("kumpulan");
const groupMembersDisplay = document.getElementById("group-members-display");
const teachersContainer = document.getElementById("absent-teachers-container");
const entryRows = document.getElementById("entry-rows");
const autoMessage = document.getElementById("auto-message");
const overloadBanner = document.getElementById("overload-banner");

// Pengurusan Mod Gelap (Dark Mode)
function setupDarkMode() {
  const toggleBtn = document.getElementById("dark-mode-toggle");
  const label = document.getElementById("dark-mode-label");
  const icon = document.getElementById("dark-mode-icon");
  const isSavedDark = localStorage.getItem(APP_CONFIG.storageKeys.darkMode) === "1";

  if (isSavedDark) {
    document.documentElement.classList.add("dark");
    if (label) label.textContent = "Mod Cerah";
    if (icon) icon.setAttribute("data-lucide", "sun");
  }

  toggleBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem(APP_CONFIG.storageKeys.darkMode, isDark ? "1" : "0");
    if (label) label.textContent = isDark ? "Mod Cerah" : "Mod Gelap";
    if (icon) icon.setAttribute("data-lucide", isDark ? "sun" : "moon");
    if (window.lucide) window.lucide.createIcons();

    // Kemas kini paparan statistik jika sedang berada di tab statistik
    const p5 = document.getElementById("page5");
    if (p5 && !p5.classList.contains("page-hidden")) {
      renderWeeklyReport();
    }
  });
}

// Pengurusan Mod Peranti (Komputer / Tablet / Telefon Bimbit)
const DEVICE_MODE_KEY = "eGuruGanti_device_mode";

function setDeviceMode(mode, save = true) {
  const validModes = ["desktop", "tablet", "mobile"];
  if (!validModes.includes(mode)) mode = "desktop";

  document.documentElement.setAttribute("data-device-mode", mode);
  if (save) {
    try {
      localStorage.setItem(DEVICE_MODE_KEY, mode);
    } catch (e) {
      console.warn("Gagal menyimpan pilihan mod peranti:", e);
    }
  }

  // Kemas kini status aktif pada butang ikon header
  const btnDesktop = document.getElementById("btn-device-desktop");
  const btnTablet = document.getElementById("btn-device-tablet");
  const btnMobile = document.getElementById("btn-device-mobile");

  if (btnDesktop) btnDesktop.classList.toggle("active", mode === "desktop");
  if (btnTablet) btnTablet.classList.toggle("active", mode === "tablet");
  if (btnMobile) btnMobile.classList.toggle("active", mode === "mobile");

  // Jika sedang berada di tab statistik, segar semula carta
  const p5 = document.getElementById("page5");
  if (p5 && !p5.classList.contains("page-hidden") && typeof renderWeeklyReport === "function") {
    renderWeeklyReport();
  }
}

function setupDeviceModeToggle() {
  const btnDesktop = document.getElementById("btn-device-desktop");
  const btnTablet = document.getElementById("btn-device-tablet");
  const btnMobile = document.getElementById("btn-device-mobile");

  if (btnDesktop) {
    btnDesktop.addEventListener("click", () => {
      setDeviceMode("desktop");
      showToast("Paparan: Mod Komputer (Desktop)", "info");
    });
  }

  if (btnTablet) {
    btnTablet.addEventListener("click", () => {
      setDeviceMode("tablet");
      showToast("Paparan: Mod Tablet", "info");
    });
  }

  if (btnMobile) {
    btnMobile.addEventListener("click", () => {
      setDeviceMode("mobile");
      showToast("Paparan: Mod Telefon Bimbit (Phone)", "info");
    });
  }

  // Tentukan mod permulaan: daripada storan atau saiz skrin semasa
  try {
    const savedMode = localStorage.getItem(DEVICE_MODE_KEY);
    if (savedMode && ["desktop", "tablet", "mobile"].includes(savedMode)) {
      setDeviceMode(savedMode, false);
      return;
    }
  } catch (e) {
    console.warn("Gagal membaca storan mod peranti:", e);
  }

  // Pengesanan pintar saiz tetingkap peranti
  const w = window.innerWidth;
  if (w <= 480) {
    setDeviceMode("mobile", false);
  } else if (w <= 820) {
    setDeviceMode("tablet", false);
  } else {
    setDeviceMode("desktop", false);
  }
}

// Pengurusan Aksesibiliti: Pelaras % Saiz Paparan
const A11Y_ZOOM_KEY = "eGuruGanti_display_zoom_pct";

function setDisplayZoomA11y(pct, save = true) {
  const validPcts = ["90", "100", "115"];
  if (!validPcts.includes(String(pct))) pct = "100";

  document.documentElement.classList.remove("a11y-zoom-90", "a11y-zoom-100", "a11y-zoom-115");
  document.documentElement.classList.add(`a11y-zoom-${pct}`);

  // Mengubah % saiz paparan
  const zoomValues = { "90": "0.9", "100": "1", "115": "1.15" };
  document.documentElement.style.zoom = zoomValues[pct] || "1";

  const btnSm = document.getElementById("btn-font-decrease");
  const btnMd = document.getElementById("btn-font-reset");
  const btnLg = document.getElementById("btn-font-increase");

  if (btnSm) btnSm.classList.toggle("active", pct === "90");
  if (btnMd) btnMd.classList.toggle("active", pct === "100");
  if (btnLg) btnLg.classList.toggle("active", pct === "115");

  if (save) {
    try {
      localStorage.setItem(A11Y_ZOOM_KEY, pct);
      const label = pct === "100" ? "100% (Asal)" : `${pct}%`;
      showToast(`Saiz Paparan: ${label}`, "info");
    } catch (e) {}
  }
}

function setupAccessibilityControls() {
  const btnSm = document.getElementById("btn-font-decrease");
  const btnMd = document.getElementById("btn-font-reset");
  const btnLg = document.getElementById("btn-font-increase");

  if (btnSm) btnSm.addEventListener("click", () => setDisplayZoomA11y("90"));
  if (btnMd) btnMd.addEventListener("click", () => setDisplayZoomA11y("100"));
  if (btnLg) btnLg.addEventListener("click", () => setDisplayZoomA11y("115"));

  // Pulihkan tetapan simpanan
  try {
    const saved = localStorage.getItem(A11Y_ZOOM_KEY) || localStorage.getItem("eGuruGanti_a11y_font_size");
    if (saved === "sm" || saved === "90") {
      setDisplayZoomA11y("90", false);
    } else if (saved === "lg" || saved === "115") {
      setDisplayZoomA11y("115", false);
    } else {
      setDisplayZoomA11y("100", false);
    }
  } catch (e) {}
}

// Navigasi Tab Halaman
function setupNavigation() {
  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      closeEnlargedScheduleModal();
      const pageId = btn.dataset.page;
      showPage(pageId);

      if (pageId === "page1") loadDailyScheduleForDate(dateInput.value);
      if (pageId === "page2") {
        const p2Tarikh = document.getElementById("page2-tarikh");
        const p2Hari = document.getElementById("page2-hari");
        if (p2Tarikh && dateInput.value && p2Tarikh.value !== dateInput.value) {
          p2Tarikh.value = dateInput.value;
          if (p2Hari) p2Hari.value = dayInput.value || getDayFromDate(dateInput.value);
        }
        renderPage2();
      }
      if (pageId === "page3") {
        const p3Tarikh = document.getElementById("page3-tarikh");
        const p3Hari = document.getElementById("page3-hari");
        if (p3Tarikh && dateInput.value && p3Tarikh.value !== dateInput.value) {
          p3Tarikh.value = dateInput.value;
          if (p3Hari) p3Hari.value = dayInput.value || getDayFromDate(dateInput.value);
        }
        renderPage3();
      }
      if (pageId === "page5") {
        renderPage5();
        // Segerakkan data terkini daripada Google Sheet di latar belakang
        triggerCloudSync(false);
      }
      if (pageId === "page6") renderPage6();
      if (pageId === "page7") renderCalendar();
      if (pageId === "page-import") renderImportPage();
    });
  });
}

function showPage(pageId) {
  ["page1", "page2", "page3", "page5", "page6", "page7", "page-import"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("page-hidden");
  });
  const target = document.getElementById(pageId);
  if (target) target.classList.remove("page-hidden");

  document.querySelectorAll(".nav-tab").forEach(btn => {
    if (btn.dataset.page === pageId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Paparan Notifikasi (Toast)
function showToast(message, type = "neutral") {
  const old = document.getElementById("custom-toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "custom-toast";
  const bgClass = type === "error"
    ? "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
    : type === "success"
    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
    : "bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800";

  const iconName = type === "error" ? "alert-circle" : type === "success" ? "check-circle-2" : "info";

  toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl ${bgClass}`;
  toast.innerHTML = `<i data-lucide="${iconName}" style="width:20px;height:20px"></i><span class="font-medium text-sm">${message}</span>`;
  document.body.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Logik Kumpulan Guru Bertugas
function updateGroupMembers() {
  const val = kumpulanSelect.value;
  groupMembersDisplay.innerHTML = "";
  if (val && Array.isArray(TEACHER_GROUPS[val]) && TEACHER_GROUPS[val].length > 0) {
    // Dapatkan senarai guru tidak hadir yang dipilih
    const absentTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
      .map(r => r.querySelector(".teacher-select") ? r.querySelector(".teacher-select").value.trim() : "")
      .filter(Boolean);

    TEACHER_GROUPS[val].forEach(guru => {
      const card = document.createElement("div");
      const isAbsent = absentTeachers.includes(guru);

      if (isAbsent) {
        card.className = "guru-duty-badge absent";
        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.5rem; min-width:0; flex:1;">
            <i data-lucide="x-circle" style="width:17px;height:17px" class="shrink-0"></i>
            <span class="truncate font-bold">${guru}</span>
          </div>
          <span class="duty-absent-tag">Tidak Hadir</span>
        `;
      } else {
        card.className = "guru-duty-badge";
        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.5rem; min-width:0; flex:1;">
            <i data-lucide="check-circle" style="width:17px;height:17px" class="shrink-0"></i>
            <span class="truncate">${guru}</span>
          </div>
        `;
      }
      groupMembersDisplay.appendChild(card);
    });
    if (window.lucide) window.lucide.createIcons();
  } else if (val) {
    groupMembersDisplay.innerHTML = `
      <div style="grid-column: 1 / -1; background:var(--bg-subtle); border:1px dashed var(--border-subtle); border-radius:10px; padding:0.75rem 1rem; font-size:0.8rem; color:var(--text-secondary); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
        <span>Tiada senarai guru ditetapkan bagi <strong>${val}</strong> buat masa ini. (Sekolah tanpa kumpulan bertugas boleh membiarkan ruang ini kosong).</span>
        <button type="button" class="action-btn btn-secondary" style="font-size:0.75rem; padding:0.35rem 0.75rem;" onclick="document.querySelector('[data-page=page-import]')?.click(); setTimeout(() => document.getElementById('duty-group-manager-card')?.scrollIntoView({behavior:'smooth'}), 150);">
          <i data-lucide="users" style="width:14px;height:14px;"></i> Urus Kumpulan Bertugas
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  } else {
    groupMembersDisplay.innerHTML = `
      <div style="grid-column: 1 / -1; background:var(--bg-subtle); border:1px dashed var(--border-subtle); border-radius:10px; padding:0.65rem 1rem; font-size:0.8rem; color:var(--text-muted);">
        Pilih kumpulan bertugas di atas (Kumpulan 1 – 4) untuk memaparkan senarai guru bertugas mingguan, atau biarkan kosong jika sekolah tidak menggunakan kumpulan bertugas.
      </div>
    `;
  }
}

mingguSelect.addEventListener("change", () => {
  const val = mingguSelect.value;
  if (val) {
    const num = parseInt(val.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num)) {
      kumpulanSelect.value = "Kumpulan " + (((num - 1) % 4) + 1);
      updateGroupMembers();
      kemasKiniSemuaCadanganGuruGanti();
    }
  }
});

kumpulanSelect.addEventListener("change", () => {
  updateGroupMembers();
  kemasKiniSemuaCadanganGuruGanti();
});

// Baris Guru Tidak Hadir
function updateTeacherRowColor(row) {
  row.className = "teacher-row";
  const ts = row.querySelector(".teacher-select");
  const teacherName = ts ? ts.value : "";
  if (teacherName) {
    const col = getTeacherColor(teacherName);
    ts.style.borderColor = col.primary;
    ts.style.borderWidth = "2px";
    ts.style.color = col.text;
    ts.style.fontWeight = "700";
    ts.style.backgroundColor = col.bg;
    ts.style.boxShadow = `0 0 0 3px ${col.border}`;
    row.style.borderLeft = `5px solid ${col.primary}`;
    row.style.borderColor = col.border;
  } else {
    if (ts) {
      ts.style.borderColor = "";
      ts.style.borderWidth = "";
      ts.style.color = "";
      ts.style.fontWeight = "";
      ts.style.backgroundColor = "";
      ts.style.boxShadow = "";
    }
    row.style.borderLeft = "";
    row.style.borderColor = "";
  }
}

function addTeacherRow(defaultName = "", defaultReason = "", isSaved = false, isEmergency = false, isProgramExempt = false) {
  const tpl = document.getElementById("teacher-row-template");
  const row = tpl.content.cloneNode(true).firstElementChild;
  const ts = row.querySelector(".teacher-select");
  const rs = row.querySelector(".reason-select");
  const progCheckbox = row.querySelector(".teacher-program-checkbox");

  row.dataset.isSaved = isSaved ? "true" : "false";
  row.dataset.isEmergency = isEmergency ? "true" : "false";

  // Isi senarai pilihan guru sekolah
  ts.innerHTML = '<option value="">PILIH NAMA GURU</option>' +
    MASTER_TEACHERS.map(g => `<option value="${g}">${g}</option>`).join("");

  ts.value = defaultName;
  rs.value = defaultReason;

  if (progCheckbox) {
    progCheckbox.checked = !!isProgramExempt;
    progCheckbox.addEventListener("change", () => {
      const teacherName = ts.value;
      if (!teacherName) {
        showToast("Sila pilih nama guru tidak hadir terlebih dahulu.", "info");
        progCheckbox.checked = false;
        return;
      }
      handleTeacherProgramExemptToggle(teacherName, progCheckbox.checked, rs.value);
    });
  }

  if (isEmergency) {
    row.style.border = "1.5px solid #3b82f6";
    row.style.background = "#eff6ff";
    const label = row.querySelector(".teacher-field-label");
    if (label) {
      label.innerHTML = `Nama Guru Tidak Hadir <span class="badge-tag-new" style="margin-left:4px;">Kecemasan</span>`;
    }
  } else if (isSaved) {
    const label = row.querySelector(".teacher-field-label");
    if (label) {
      label.innerHTML = `Nama Guru Tidak Hadir <span class="badge-tag-saved" style="margin-left:4px;">Tersimpan</span>`;
    }
  }

  ts.addEventListener("change", () => {
    updateTeacherRowColor(row);
    if (progCheckbox && progCheckbox.checked && ts.value) {
      handleTeacherProgramExemptToggle(ts.value, true, rs.value);
    } else {
      autoFillSchedule();
    }
    persistCurrentDraft(dateInput ? dateInput.value : "");
  });
  rs.addEventListener("change", () => {
    const teacherName = ts.value;
    if (teacherName) {
      [...entryRows.querySelectorAll(".schedule-row")].forEach(er => {
        if (er.dataset.guruTidakHadir === teacherName) {
          er.dataset.sebab = rs.value;
          if (er.dataset.saved === "true") {
            er.dataset.modified = "true";
            er.classList.add("row-is-modified");
          }
        }
      });
      persistCurrentDraft(dateInput ? dateInput.value : "");
    }
  });

  row.querySelector(".remove-teacher").addEventListener("click", async () => {
    const teacherName = ts.value;
    const hasSavedRows = [...entryRows.querySelectorAll(".schedule-row")]
      .some(r => r.dataset.guruTidakHadir === teacherName && r.dataset.saved === "true");

    if (hasSavedRows) {
      if (!confirm(`Perhatian: Terdapat tugasan guru ganti yang telah disimpan bagi ${teacherName}.\n\nAdakah anda pasti mahu memadam guru ini dan membatalkan semua tugasan gantian beliau untuk tarikh ini?`)) {
        return;
      }
      const rowsToDelete = [...entryRows.querySelectorAll(".schedule-row")]
        .filter(r => r.dataset.guruTidakHadir === teacherName && r.dataset.saved === "true");

      for (const r of rowsToDelete) {
        if (r.dataset.id) {
          await DatabaseAPI.deleteRecord(r.dataset.id, {
            tarikh: dateInput.value,
            masa: r.querySelector(".row-masa").value,
            kelas: r.querySelector(".row-kelas").value,
            guru_tidak_hadir: teacherName,
            guru_ganti: r.querySelector(".row-ganti").value
          });
        }
        r.remove();
      }
      allRecords = await DatabaseAPI.getAllRecords();
      showToast(`Semua tugasan bagi ${teacherName} telah dibatalkan.`, "info");
    } else {
      [...entryRows.querySelectorAll(".schedule-row")].forEach(r => {
        if (r.dataset.guruTidakHadir === teacherName && r.dataset.saved !== "true") {
          r.remove();
        }
      });
    }

    if (teachersContainer.children.length > 1) {
      row.remove();
    } else {
      ts.value = "";
      rs.value = "";
      row.dataset.isSaved = "false";
      row.dataset.isEmergency = "false";
      updateTeacherRowColor(row);
    }

    const curSaved = allRecords.filter(r => r && r.tarikh === dateInput.value);
    const activeAbsent = [...teachersContainer.querySelectorAll(".teacher-row")].filter(r => r.querySelector(".teacher-select") && r.querySelector(".teacher-select").value);

    if (!curSaved.length && !activeAbsent.length) {
      clearCurrentDraft(dateInput.value);
      clearCancelledSlots(dateInput.value);
      loadDailyScheduleForDate(dateInput.value);
    } else {
      persistCurrentDraft(dateInput.value);
      if (!entryRows.children.length) addRow();
      kemasKiniSemuaCadanganGuruGanti();
      showDailyStatusBanner({
        type: curSaved.length ? "saved" : "draft",
        count: curSaved.length,
        teacherCount: [...new Set(curSaved.map(r => r.guru_tidak_hadir))].length,
        date: dateInput.value,
        day: dayInput.value
      });
    }
  });

  teachersContainer.appendChild(row);
  updateTeacherRowColor(row);
  if (window.lucide) window.lucide.createIcons();
}

// Pengendali Togol Pengecualian Guru Ganti (Cadangan 2: Program Sekolah / Tiada PdP)
function handleTeacherProgramExemptToggle(teacherName, isChecked, reason) {
  if (!teacherName) return;
  const teacherRows = [...entryRows.querySelectorAll(".schedule-row")]
    .filter(r => r.dataset.guruTidakHadir === teacherName);

  if (isChecked) {
    if (teacherRows.length > 0) {
      teacherRows.forEach(r => {
        r.dataset.initialGanti = PROGRAM_SEKOLAH_VAL;
        const selectEl = r.querySelector(".row-ganti");
        const triggerLabel = r.querySelector(".custom-ganti-label");
        if (selectEl) {
          let opt = [...selectEl.options].find(o => o.value === PROGRAM_SEKOLAH_VAL);
          if (!opt) {
            opt = document.createElement("option");
            opt.value = PROGRAM_SEKOLAH_VAL;
            opt.textContent = `🏛️ ${PROGRAM_SEKOLAH_VAL}`;
            selectEl.appendChild(opt);
          }
          selectEl.value = PROGRAM_SEKOLAH_VAL;
        }
        if (triggerLabel) {
          triggerLabel.innerHTML = `<span>🏛️ ${PROGRAM_SEKOLAH_VAL}</span>`;
        }
        r.classList.add("row-is-program");
        if (r.dataset.saved === "true") {
          r.dataset.modified = "true";
          r.classList.add("row-is-modified");
        }
      });
      showToast(`Semua waktu PdP ${teacherName} ditandakan sebagai Program Sekolah (Tiada Gantian).`, "success");
    } else {
      // Jika guru tiada slot waktu PdP pada hari ini (cth. jadual kosong),
      // tambah satu rekod kehadiran khusus supaya data tersimpan dan tally di Page 6!
      addRow({
        masa: "Waktu Persekolahan",
        subjek: "Program Sekolah",
        kelas: "Semua Kelas",
        guru_tidak_hadir: teacherName,
        sebab: reason || "Program Rasmi Sekolah",
        ganti: PROGRAM_SEKOLAH_VAL,
        saved: false
      });
      showToast(`Rekod kehadiran Program Sekolah ditambah bagi ${teacherName}.`, "info");
    }
  } else {
    // Nyah-tanda: Pulihkan slot
    teacherRows.forEach(r => {
      delete r.dataset.initialGanti;
      const masaVal = r.querySelector(".row-masa").value;
      const subjekVal = r.querySelector(".row-subjek").value;
      if (masaVal === "Waktu Persekolahan" && subjekVal === "Program Sekolah" && r.dataset.saved !== "true") {
        r.remove();
        return;
      }
      const selectEl = r.querySelector(".row-ganti");
      const triggerLabel = r.querySelector(".custom-ganti-label");
      if (selectEl && isSpecialProgramRelief(selectEl.value)) {
        selectEl.value = "";
        if (triggerLabel) triggerLabel.textContent = "Pilih guru ganti";
        r.classList.remove("row-is-program");
        if (r.dataset.saved === "true") {
          r.dataset.modified = "true";
          r.classList.add("row-is-modified");
        }
      }
    });
    showToast(`Pengecualian guru ganti untuk ${teacherName} telah dibatalkan.`, "info");
  }

  kemasKiniSemuaCadanganGuruGanti();
}

// Kemas Kini Hari & Jadual Automatik (Memuatkan jadual tersimpan jika ada)
function updateDay() {
  const day = dateInput.value ? getDayFromDate(dateInput.value) : "";
  dayInput.value = day;

  // Selaraskan juga tarikh dan hari ke JADUAL KELAS (Page 2) dan JADUAL GURU (Page 3)
  const p2Tarikh = document.getElementById("page2-tarikh");
  const p2Hari = document.getElementById("page2-hari");
  if (p2Tarikh && dateInput.value) p2Tarikh.value = dateInput.value;
  if (p2Hari && day) p2Hari.value = day;

  const p3Tarikh = document.getElementById("page3-tarikh");
  const p3Hari = document.getElementById("page3-hari");
  if (p3Tarikh && dateInput.value) p3Tarikh.value = dateInput.value;
  if (p3Hari && day) p3Hari.value = day;

  loadDailyScheduleForDate(dateInput.value);

  // Jika sedang aktif di Page 2 atau Page 3, muat semula paparan secara terus
  const p2El = document.getElementById("page2");
  if (p2El && !p2El.classList.contains("page-hidden")) renderPage2();
  const p3El = document.getElementById("page3");
  if (p3El && !p3El.classList.contains("page-hidden")) renderPage3();
}

dateInput.addEventListener("change", updateDay);

// Menambah Baris Jadual Gantian (Menyokong ID dan Status Tersimpan / Kecemasan)
function addRow(data = {}) {
  const tpl = document.getElementById("entry-row-template");
  const row = tpl.content.cloneNode(true).firstElementChild;

  const masaInput = row.querySelector(".row-masa");
  const subjekInput = row.querySelector(".row-subjek");
  const kelasInput = row.querySelector(".row-kelas");
  const gantiSelect = row.querySelector(".row-ganti");
  const customTrigger = row.querySelector(".custom-ganti-trigger");
  const customLabel = row.querySelector(".custom-ganti-label");
  const customMenu = row.querySelector(".custom-ganti-menu");
  const teacherBadgeEl = row.querySelector(".row-teacher-badge");

  masaInput.value = data.masa || "";
  subjekInput.value = data.subjek || "";
  kelasInput.value = data.kelas || "";
  row.dataset.guruTidakHadir = data.guru_tidak_hadir || "";
  row.dataset.sebab = data.sebab || "";
  row.dataset.id = data.id || "";
  row.dataset.saved = data.saved ? "true" : "false";
  row.dataset.isEmergency = data.isEmergency ? "true" : "false";

  if (data.ganti) {
    if (isSpecialProgramRelief(data.ganti)) {
      let opt = [...gantiSelect.options].find(o => o.value === data.ganti);
      if (!opt) {
        opt = document.createElement("option");
        opt.value = data.ganti;
        opt.textContent = `🏛️ ${data.ganti}`;
        gantiSelect.appendChild(opt);
      }
    }
    gantiSelect.value = data.ganti;
    row.dataset.initialGanti = data.ganti;
    if (customLabel) {
      if (isSpecialProgramRelief(data.ganti)) {
        customLabel.innerHTML = `<span>🏛️ ${data.ganti}</span>`;
        row.classList.add("row-is-program");
      } else {
        customLabel.textContent = data.ganti;
      }
    }
  }

  // Visual cues
  if (data.saved) {
    row.classList.add("row-is-saved");
  } else if (data.isEmergency) {
    row.classList.add("row-is-new");
  }
  if (data.ganti && isSpecialProgramRelief(data.ganti)) {
    row.classList.add("row-is-program");
  }

  // Kemas kini badge maklumat guru asal & status
  if (teacherBadgeEl) {
    let badgeHtml = "";
    if (data.guru_tidak_hadir) {
      badgeHtml += `<span style="color:#0369a1; background:#e0f2fe; padding:1px 6px; border-radius:4px; font-size:10.5px;">Ganti: ${data.guru_tidak_hadir}</span>`;
    }
    if (data.ganti && isSpecialProgramRelief(data.ganti)) {
      badgeHtml += `<span class="badge-tag-program">🏛️ Program</span>`;
    }
    if (data.saved) {
      badgeHtml += `<span class="badge-tag-saved">● Tersimpan</span>`;
    } else if (data.isEmergency) {
      badgeHtml += `<span class="badge-tag-new">● Kecemasan</span>`;
    } else if (data.guru_tidak_hadir) {
      badgeHtml += `<span class="badge-tag-new">● Draf</span>`;
    }
    teacherBadgeEl.innerHTML = badgeHtml;
  }

  if (data.guru_tidak_hadir) {
    const col = getTeacherColor(data.guru_tidak_hadir);
    row.style.backgroundColor = col.bg;
    const firstTd = row.querySelector("td");
    if (firstTd) {
      firstTd.style.borderLeft = `4px solid ${col.primary}`;
    }
    [masaInput, subjekInput, kelasInput].forEach(inp => {
      if (inp) {
        inp.style.borderColor = col.border;
        inp.style.color = col.text;
        inp.style.backgroundColor = "#ffffff";
        inp.style.fontWeight = "600";
      }
    });
  } else {
    row.style.backgroundColor = "";
    const firstTd = row.querySelector("td");
    if (firstTd) firstTd.style.borderLeft = "";
    [masaInput, subjekInput, kelasInput].forEach(inp => {
      if (inp) {
        inp.style.borderColor = "";
        inp.style.color = "";
        inp.style.backgroundColor = "";
        inp.style.fontWeight = "";
      }
    });
  }

  // Interaksi Custom Dropdown Guru Ganti
  if (customTrigger && customMenu) {
    customTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isCurrentlyOpen = !customMenu.classList.contains("hidden");

      // Tutup semua menu custom dropdown lain dahulu
      document.querySelectorAll(".custom-ganti-menu").forEach(m => m.classList.add("hidden"));
      document.querySelectorAll(".custom-ganti-trigger").forEach(t => t.setAttribute("aria-expanded", "false"));
      hideTeacherHoverPopover();

      if (!isCurrentlyOpen) {
        customMenu.classList.remove("hidden");
        customTrigger.setAttribute("aria-expanded", "true");
      }
    });

    // Hover pada trigger button untuk melihat jadual guru yang sudah dipilih
    customTrigger.addEventListener("mouseenter", () => {
      const selectedGuru = gantiSelect.value.trim();
      const masaVal = masaInput.value.trim();
      const subjekVal = subjekInput.value.trim();
      const kelasVal = kelasInput.value.trim();
      const hv = dayInput.value || "Isnin";
      if (selectedGuru) {
        const absentTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
          .map(r => r.querySelector(".teacher-select").value)
          .filter(Boolean);
        const pInfo = getConcurrentPartnerInfo(kelasVal, hv, masaVal, subjekVal, absentTeachers);
        showTeacherHoverPopover(selectedGuru, customTrigger, masaVal, (pInfo && pInfo.nama === selectedGuru) ? pInfo : null);
      }
    });

    customTrigger.addEventListener("mouseleave", () => {
      hideTeacherHoverPopover();
    });
  }

  // Pengendali Padam / Batal Baris
  row.querySelector(".remove-row").addEventListener("click", async () => {
    hideTeacherHoverPopover();
    if (row.dataset.saved === "true") {
      const gantiVal = gantiSelect.value || "Belum dipilih";
      const guruAsal = row.dataset.guruTidakHadir || "Guru Asal";
      const masaVal = masaInput.value;
      const kelasVal = kelasInput.value;

      if (!confirm(`BATAL TUGASAN GURU GANTI\n\nAdakah anda pasti mahu membatalkan tugasan ini?\n• Guru Pengganti: ${gantiVal}\n• Menggantikan: ${guruAsal}\n• Waktu: ${masaVal} (Kelas ${kelasVal})\n\nRekod ini akan dipadam daripada pangkalan data harian.`)) {
        return;
      }

      const curDate = dateInput ? dateInput.value : "";
      const delRes = await DatabaseAPI.deleteRecord(row.dataset.id, {
        tarikh: curDate,
        masa: masaVal,
        kelas: kelasVal,
        guru_tidak_hadir: guruAsal,
        guru_ganti: gantiVal
      });

      // Kemas kini allRecords dalam memori serta-merta tanpa perlu tunggu muat turun semula
      allRecords = allRecords.filter(r => {
        if (row.dataset.id && row.dataset.id !== "undefined" && r.id === row.dataset.id) return false;
        const match = r.tarikh === curDate &&
          String(r.guru_tidak_hadir || r.guruTidakHadir).trim().toLowerCase() === String(guruAsal).trim().toLowerCase() &&
          String(r.masa).replace(/\s+/g, "") === String(masaVal).replace(/\s+/g, "") &&
          String(r.kelas).trim().toLowerCase() === String(kelasVal).trim().toLowerCase();
        return !match;
      });

      row.remove();
      recordCancelledSlot(curDate, guruAsal, masaVal, kelasVal);
      persistCurrentDraft(curDate);
      showToast(delRes.message || "Tugasan berjaya dibatalkan.", "info");

      const remaining = allRecords.filter(r => r && r.tarikh === curDate);
      showDailyStatusBanner({
        type: remaining.length ? "saved" : "empty",
        count: remaining.length,
        teacherCount: [...new Set(remaining.map(r => r.guru_tidak_hadir))].length,
        date: curDate,
        day: dayInput.value
      });
    } else {
      const curDate = dateInput ? dateInput.value : "";
      const guruAsal = row.dataset.guruTidakHadir || "";
      const masaVal = masaInput.value;
      const kelasVal = kelasInput.value;
      row.remove();
      if (guruAsal && masaVal) {
        recordCancelledSlot(curDate, guruAsal, masaVal, kelasVal);
      }
      persistCurrentDraft(curDate);
      showToast("Waktu kelas berjaya dibuang daripada draf.", "info");
    }

    // Jangan cipta baris kosong secara paksa jika ada guru tidak hadir aktif dipilih
    const curActive = [...teachersContainer.querySelectorAll(".teacher-row")]
      .map(r => r.querySelector(".teacher-select") ? r.querySelector(".teacher-select").value : "")
      .filter(Boolean);
    if (!entryRows.children.length && curActive.length === 0) {
      addRow();
    }
    kemasKiniSemuaCadanganGuruGanti();
  });

  // Pengendali Pengesanan Perubahan (Modification Tracking)
  const markRowAsModified = () => {
    if (row.dataset.saved === "true") {
      row.dataset.modified = "true";
      row.classList.add("row-is-modified");
      if (teacherBadgeEl) {
        const modBadge = teacherBadgeEl.querySelector(".badge-tag-modified");
        if (!modBadge) {
          teacherBadgeEl.insertAdjacentHTML("beforeend", `<span class="badge-tag-modified">✏️ Diubah</span>`);
        }
      }
      const saveBtn = document.getElementById("save-sheet-btn");
      if (saveBtn) {
        saveBtn.innerHTML = `<i data-lucide="save" style="width:17px;height:17px"></i> SIMPAN PERUBAHAN JADUAL`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
    persistCurrentDraft(dateInput ? dateInput.value : "");
    kemasKiniSemuaCadanganGuruGanti();
  };

  masaInput.addEventListener("input", markRowAsModified);
  subjekInput.addEventListener("input", markRowAsModified);
  kelasInput.addEventListener("input", markRowAsModified);
  gantiSelect.addEventListener("change", markRowAsModified);

  entryRows.appendChild(row);

  if (data.ganti) {
    row.dataset.initialGanti = data.ganti;
    const tempOpt = document.createElement("option");
    tempOpt.value = data.ganti;
    tempOpt.textContent = data.ganti;
    gantiSelect.appendChild(tempOpt);
    gantiSelect.value = data.ganti;
    if (customLabel) customLabel.textContent = data.ganti;
  }

  kemasKiniSemuaCadanganGuruGanti();
  if (window.lucide) window.lucide.createIcons();
}

// Global Click Outside Listener untuk menutup Custom Dropdown & Popover
document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-ganti-wrapper")) {
    document.querySelectorAll(".custom-ganti-menu").forEach(m => m.classList.add("hidden"));
    document.querySelectorAll(".custom-ganti-trigger").forEach(t => t.setAttribute("aria-expanded", "false"));
    hideTeacherHoverPopover();
  }
});

// Paparan Popover Pratonton Jadual Guru Terapung (Hover Preview)
function showTeacherHoverPopover(teacherName, targetElement, masaSlot, candidateInfo = null) {
  const popover = document.getElementById("teacher-hover-popover");
  if (!popover || !teacherName) return;

  const col = getTeacherColor(teacherName);
  const hv = dayInput.value || "Isnin";
  const totalPeriods = countPeriods(teacherName, hv);

  // Semak status ketersediaan pada masaSlot
  let isFree = true;
  let statusDetail = `Bebas pada waktu ${masaSlot || "ini"}`;

  if (candidateInfo) {
    isFree = candidateInfo.boleh;
    if (candidateInfo.status === "Pasangan Serentak (Cantum Kelas)") {
      statusDetail = `⭐ Pasangan Serentak (${candidateInfo.partnerSubjek || "Serentak"}) — Mengajar waktu ini (Cantum Kelas)`;
    } else {
      statusDetail = isFree ? `✓ Bebas pada waktu ${masaSlot}` : `✕ ${candidateInfo.status} pada waktu ${masaSlot}`;
    }
  } else if (masaSlot) {
    const teacherSchedule = TIMETABLE[teacherName];
    if (teacherSchedule && teacherSchedule[hv] && teacherSchedule[hv].some(([m]) => splitTimeSlot(m).includes(masaSlot))) {
      isFree = false;
      statusDetail = `✕ Ada Kelas Asal pada waktu ${masaSlot}`;
    } else {
      isFree = true;
      statusDetail = `✓ Bebas pada waktu ${masaSlot}`;
    }
  }

  // Dapatkan jadual asal guru bagi hari hv
  const teacherSlots = {};
  if (TIMETABLE[teacherName] && TIMETABLE[teacherName][hv]) {
    TIMETABLE[teacherName][hv].forEach(([m, s, k]) => {
      splitTimeSlot(m).forEach(slotTime => {
        const idx = STANDARD_SLOTS.indexOf(slotTime);
        if (idx >= 0) teacherSlots[idx] = { subjek: s, kelas: k };
      });
    });
  }

  // Semak kelas ganti semasa yang ditugaskan kepada guru ini
  const reliefSlots = {};
  [...entryRows.querySelectorAll(".schedule-row")].forEach(r => {
    const gVal = r.querySelector(".row-ganti") ? r.querySelector(".row-ganti").value.trim() : "";
    if (gVal === teacherName) {
      const mVal = r.querySelector(".row-masa") ? r.querySelector(".row-masa").value.trim() : "";
      const sVal = r.querySelector(".row-subjek") ? r.querySelector(".row-subjek").value.trim() : "";
      const kVal = r.querySelector(".row-kelas") ? r.querySelector(".row-kelas").value.trim() : "";
      const idx = STANDARD_SLOTS.indexOf(mVal);
      if (idx >= 0) reliefSlots[idx] = { subjek: sVal, kelas: kVal };
    }
  });

  let rowsHtml = "";
  for (let si = 1; si <= 13; si++) {
    if (si === 6) continue; // Waktu rehat sekolah (9.40-10.10)
    const slotTime = STANDARD_SLOTS[si];
    const isActiveSlot = (slotTime === masaSlot);
    const hasOwnClass = teacherSlots[si];
    const hasRelief = reliefSlots[si];

    let rowClass = "popover-tt-row";
    let subjek = "—";
    let kelas = "—";
    let statusText = `<span style="color:#059669; font-weight:700;">Tiada Kelas</span>`;

    if (isActiveSlot) rowClass += " active-slot";

    if (candidateInfo && candidateInfo.status === "Pasangan Serentak (Cantum Kelas)" && isActiveSlot) {
      rowClass += " free-slot";
      subjek = `<span style="font-weight:700; color:#059669;">${candidateInfo.partnerSubjek || (hasOwnClass ? hasOwnClass.subjek : "—")}</span>`;
      kelas = `<span style="color:#059669; font-weight:600;">${candidateInfo.kelas || (hasOwnClass ? hasOwnClass.kelas : "—")}</span>`;
      statusText = `<span style="color:#059669; font-weight:700;">Pasangan (Cantum)</span>`;
    } else if (hasRelief && !hasOwnClass) {
      rowClass += " busy-slot";
      subjek = `<span style="color:#b91c1c; font-weight:700;">${hasRelief.subjek}</span>`;
      kelas = `<span style="color:#b91c1c;">${hasRelief.kelas}</span>`;
      statusText = `<span style="color:#dc2626; font-weight:700;">Telah Ganti</span>`;
    } else if (hasRelief && hasOwnClass) {
      rowClass += " busy-slot";
      subjek = `<span style="color:#c2410c; font-weight:700;">${hasOwnClass.subjek}/${hasRelief.subjek}</span>`;
      kelas = `<span style="color:#c2410c;">${hasOwnClass.kelas}</span>`;
      statusText = `<span style="color:#ea580c; font-weight:700;">Clash Ganti!</span>`;
    } else if (hasOwnClass) {
      rowClass += " busy-slot";
      subjek = `<span style="font-weight:700; color:#1d4ed8;">${hasOwnClass.subjek}</span>`;
      kelas = `<span style="color:#1e3a8a;">${hasOwnClass.kelas}</span>`;
      statusText = `<span style="color:#475569;">Kelas Sendiri</span>`;
    } else {
      rowClass += " free-slot";
    }

    const activeIndicator = isActiveSlot ? ` <span style="font-size:9px; background:#2563eb; color:#ffffff; padding:1px 5px; border-radius:4px; margin-left:2px;">KINI</span>` : "";

    rowsHtml += `
      <tr class="${rowClass}">
        <td style="white-space:nowrap; font-family:monospace; font-size:10px; text-align:center;">${slotTime}${activeIndicator}</td>
        <td style="text-align:center;">${subjek}</td>
        <td style="text-align:center;">${kelas}</td>
        <td style="font-size:10px; text-align:center;">${statusText}</td>
      </tr>
    `;
  }

  const statusBarClass = isFree ? "popover-status-free" : "popover-status-busy";
  const statusIcon = isFree ? "check-circle" : "alert-circle";

  popover.innerHTML = `
    <div class="popover-header" style="background:${col.primary};">
      <div class="popover-title">${teacherName}</div>
      <div style="display:flex; align-items:center; gap:6px;">
        <span class="popover-badge-load">${totalPeriods} Waktu (${hv})</span>
      </div>
    </div>
    <div class="popover-status-bar ${statusBarClass}">
      <i data-lucide="${statusIcon}" style="width:14px;height:14px;flex-shrink:0;"></i>
      <span>${statusDetail}</span>
    </div>
    <div class="popover-body">
      <table class="popover-tt-table">
        <thead>
          <tr>
            <th style="width:28%; text-align:center;">Masa</th>
            <th style="width:24%; text-align:center;">Subjek</th>
            <th style="width:20%; text-align:center;">Kelas</th>
            <th style="text-align:center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Letak mini jadual di kawasan KOSONG yang TIDAK bertindih dengan menu dropdown
  // (kiri / kanan / bawah / atas). Jika ruang sempit, mini jadual dikecilkan (scale) supaya muat.
  popover.classList.remove("hidden");
  popover.style.width = "300px";
  popover.style.transform = "none";
  popover.style.top = "0px";
  popover.style.left = "0px";

  const baseW = popover.offsetWidth || 300;
  const baseH = popover.offsetHeight || 400;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = document.documentElement.clientHeight || window.innerHeight;
  const M = 8;   // jarak minimum dari tepi skrin
  const GAP = 12; // jarak selamat dari menu dropdown

  const menuEl = targetElement
    ? (targetElement.closest(".custom-ganti-menu") || targetElement.closest(".custom-ganti-wrapper") || targetElement)
    : null;

  let finalLeft, finalTop, finalScale = 1;

  if (menuEl) {
    const r = menuEl.getBoundingClientRect();
    // Kawasan bebas di sekeliling menu (tidak termasuk kawasan menu itu sendiri)
    const regions = [
      { name: "left",  x: M,            y: M,            w: r.left - GAP - M,        h: vh - 2 * M },
      { name: "right", x: r.right + GAP, y: M,            w: vw - M - (r.right + GAP), h: vh - 2 * M },
      { name: "below", x: M,            y: r.bottom + GAP, w: vw - 2 * M,            h: vh - M - (r.bottom + GAP) },
      { name: "above", x: M,            y: M,            w: vw - 2 * M,            h: r.top - GAP - M }
    ].map(reg => {
      const sc = Math.min(1, Math.max(0, reg.w) / baseW, Math.max(0, reg.h) / baseH);
      return Object.assign(reg, { scale: sc });
    });

    // Pilih kawasan pertama yang muat hampir penuh (>= 0.85), jika tiada pilih yang paling besar skalanya
    let chosen = regions.find(g => g.scale >= 0.85);
    if (!chosen) chosen = regions.slice().sort((a, b) => b.scale - a.scale)[0];

    finalScale = Math.max(0.2, chosen.scale);
    const pw = baseW * finalScale;
    const ph = baseH * finalScale;

    if (chosen.name === "left") {
      finalLeft = r.left - GAP - pw;
      finalTop = Math.min(Math.max(r.top, M), vh - ph - M);
    } else if (chosen.name === "right") {
      finalLeft = r.right + GAP;
      finalTop = Math.min(Math.max(r.top, M), vh - ph - M);
    } else if (chosen.name === "below") {
      finalLeft = Math.min(Math.max(r.left, M), vw - pw - M);
      finalTop = r.bottom + GAP;
    } else {
      finalLeft = Math.min(Math.max(r.left, M), vw - pw - M);
      finalTop = r.top - GAP - ph;
    }
    finalLeft = Math.max(M, finalLeft);
    finalTop = Math.max(M, finalTop);
  } else {
    finalScale = Math.min(1, (vh - 2 * M) / baseH);
    finalLeft = Math.max(M, (vw - baseW * finalScale) / 2);
    finalTop = Math.max(M, (vh - baseH * finalScale) / 2);
  }

  popover.style.transformOrigin = "top left";
  popover.style.left = Math.round(finalLeft) + "px";
  popover.style.top = Math.round(finalTop) + "px";
  popover.style.transform = "scale(" + finalScale.toFixed(3) + ")";
  popover.style.opacity = "1";
}

function hideTeacherHoverPopover() {
  const popover = document.getElementById("teacher-hover-popover");
  if (popover) {
    popover.classList.add("hidden");
    popover.style.opacity = "0";
  }
}

// ============================================================================
// PENGURUSAN DRAF JADUAL & SLOT BATAL TEMPATAN (PERSISTENT ACROSS REFRESH)
// ============================================================================

function recordCancelledSlot(dateStr, guru, masa, kelas) {
  if (!dateStr || !guru || !masa) return;
  try {
    const key = `eggs_cancelled_slots_${dateStr}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const token = `${String(guru).trim()}|${String(masa).replace(/\s+/g, "")}|${String(kelas || "").trim().toLowerCase()}`;
    if (!existing.includes(token)) {
      existing.push(token);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch(e) {
    console.warn("Gagal merekod slot batal:", e);
  }
}

function isSlotCancelled(dateStr, guru, masa, kelas) {
  if (!dateStr || !guru || !masa) return false;
  try {
    const key = `eggs_cancelled_slots_${dateStr}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const token = `${String(guru).trim()}|${String(masa).replace(/\s+/g, "")}|${String(kelas || "").trim().toLowerCase()}`;
    return existing.includes(token);
  } catch(e) {
    return false;
  }
}

function clearCancelledSlots(dateStr) {
  if (!dateStr) return;
  try {
    localStorage.removeItem(`eggs_cancelled_slots_${dateStr}`);
  } catch(e) {}
}

function persistCurrentDraft(dateStr) {
  if (!dateStr) dateStr = dateInput ? dateInput.value : "";
  if (!dateStr) return;

  const teachers = [...teachersContainer.querySelectorAll(".teacher-row")].map(r => ({
    name: r.querySelector(".teacher-select") ? r.querySelector(".teacher-select").value : "",
    reason: r.querySelector(".reason-select") ? r.querySelector(".reason-select").value : "",
    isEmergency: r.dataset.isEmergency === "true",
    isProgram: r.querySelector(".teacher-program-checkbox") ? r.querySelector(".teacher-program-checkbox").checked : false
  })).filter(t => t.name);

  const rows = [...entryRows.querySelectorAll(".schedule-row")].map(r => ({
    id: r.dataset.id || "",
    saved: r.dataset.saved === "true",
    modified: r.dataset.modified === "true",
    guru_tidak_hadir: r.dataset.guruTidakHadir || "",
    sebab: r.dataset.sebab || "",
    masa: r.querySelector(".row-masa") ? r.querySelector(".row-masa").value.trim() : "",
    subjek: r.querySelector(".row-subjek") ? r.querySelector(".row-subjek").value.trim() : "",
    kelas: r.querySelector(".row-kelas") ? r.querySelector(".row-kelas").value.trim() : "",
    ganti: r.querySelector(".row-ganti") ? r.querySelector(".row-ganti").value.trim() : ""
  })).filter(r => r.masa || r.ganti || r.guru_tidak_hadir);

  const draftKey = `eggs_draft_schedule_${dateStr}`;
  if (teachers.length === 0 && rows.length === 0) {
    localStorage.removeItem(draftKey);
    return;
  }

  const draftObj = {
    tarikh: dateStr,
    hari: dayInput ? dayInput.value : "",
    minggu: mingguSelect ? mingguSelect.value : "",
    kumpulan: kumpulanSelect ? kumpulanSelect.value : "",
    teachers,
    rows,
    updatedAt: Date.now()
  };
  try {
    localStorage.setItem(draftKey, JSON.stringify(draftObj));
  } catch (e) {
    console.warn("Gagal menyimpan draf:", e);
  }
}

function loadDraftForDate(dateStr) {
  if (!dateStr) return null;
  try {
    const raw = localStorage.getItem(`eggs_draft_schedule_${dateStr}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    return null;
  }
  return null;
}

function clearCurrentDraft(dateStr) {
  if (!dateStr) return;
  try {
    localStorage.removeItem(`eggs_draft_schedule_${dateStr}`);
  } catch(e) {}
}

// Pengisian Automatik Berdasarkan Guru Tidak Hadir & Hari (Append Mode: Kekalkan Rekod Sedia Ada)
function autoFillSchedule(options = {}) {
  updateGroupMembers();
  const day = dayInput.value;
  if (!day) return;

  const rows = [...teachersContainer.querySelectorAll(".teacher-row")];
  const activeTeachers = rows
    .map(r => ({
      name: r.querySelector(".teacher-select").value,
      reason: r.querySelector(".reason-select").value,
      isEmergency: r.dataset.isEmergency === "true",
      isProgram: r.querySelector(".teacher-program-checkbox") ? r.querySelector(".teacher-program-checkbox").checked : false
    }))
    .filter(t => t.name);

  const allPresentBox = document.getElementById("all-present-schedule-box");

  if (!activeTeachers.length) {
    const curSaved = allRecords.filter(r => r && r.tarikh === dateInput.value);
    if (!curSaved.length) {
      if (allPresentBox) allPresentBox.classList.remove("hidden");
      entryRows.innerHTML = "";
      showDailyStatusBanner({
        type: "all_present",
        date: dateInput.value,
        day: day
      });
    } else {
      if (!entryRows.children.length) addRow();
    }
    autoMessage.classList.add("hidden");
    return;
  }

  // Ada guru tidak hadir dipilih -> sembunyikan kotak Semua Guru Hadir
  if (allPresentBox) allPresentBox.classList.add("hidden");

  const curSaved = allRecords.filter(r => r && r.tarikh === dateInput.value);
  if (!curSaved.length) {
    showDailyStatusBanner({
      type: "draft",
      date: dateInput.value,
      day: day
    });
  }

  // Jika options.forceRegenerate diminta:
  // Kosongkan entryRows sepenuhnya supaya jadual dijana semula dari awal tanpa sebarang duplikasi
  if (options.forceRegenerate) {
    clearCancelledSlots(dateInput.value);
    clearCurrentDraft(dateInput.value);
    entryRows.innerHTML = "";
  }

  // Kenal pasti guru yang sudah mempunyai baris dalam entryRows
  const existingDomRows = [...entryRows.querySelectorAll(".schedule-row")];
  const existingTeachersWithRows = new Set(existingDomRows.map(r => r.dataset.guruTidakHadir).filter(Boolean));

  // Buang baris draft kosong tanpa sebarang maklumat jika ada
  existingDomRows.forEach(r => {
    const masa = r.querySelector(".row-masa").value.trim();
    const ganti = r.querySelector(".row-ganti").value.trim();
    if (!masa && !ganti && !r.dataset.guruTidakHadir) {
      r.remove();
    }
  });

  const absentTeacherNames = activeTeachers.map(t => t.name);
  let newlyAddedSlots = 0;

  activeTeachers.forEach(t => {
    // Jika guru ini sudah ada slot dalam jadual, KEKALKAN dan jangan overwrite!
    if (existingTeachersWithRows.has(t.name) && !options.forceRegenerate) {
      return;
    }

    const lessons = (TIMETABLE[t.name] && TIMETABLE[t.name][day]) || [];

    // Jika guru ini tiada slot PdP pada hari ini tetapi ditandakan Program Sekolah, sediakan 1 rekod kehadiran khas
    if (lessons.length === 0 && t.isProgram) {
      addRow({
        masa: "Waktu Persekolahan",
        subjek: "Program Sekolah",
        kelas: "Semua Kelas",
        guru_tidak_hadir: t.name,
        sebab: t.reason || "Program Rasmi Sekolah",
        ganti: "PROGRAM SEKOLAH (TIADA GANTIAN)",
        saved: false,
        isEmergency: t.isEmergency
      });
      newlyAddedSlots++;
      return;
    }

    // Jika guru ini tiada slot PdP langsung pada hari ini (0 Waktu Asal)
    if (lessons.length === 0) {
      addRow({
        masa: "Tiada Kelas",
        subjek: "Tiada PdP",
        kelas: "—",
        guru_tidak_hadir: t.name,
        sebab: t.reason || "Tidak Hadir",
        ganti: "TIADA GANTIAN",
        saved: false,
        isEmergency: t.isEmergency
      });
      newlyAddedSlots++;
      return;
    }

    let addedForTeacher = 0;
    lessons.forEach(([masa, subjek, kelas]) => {
      // Perkara A (Pilihan 1): Kelas Prasekolah tidak memerlukan guru ganti kerana sentiasa diawasi Guru Pra & PPM
      const isPraClass = kelas && (
        kelas.toUpperCase().includes("PRA") ||
        kelas.toUpperCase().includes("DAHLIA") ||
        kelas.toUpperCase().includes("ANGGERIK")
      );
      if (isPraClass) return;

      splitTimeSlot(masa).forEach(slotTime => {
        // Semak sama ada slot ini telah dibatalkan / dipadamkan oleh pengguna
        if (isSlotCancelled(dateInput.value, t.name, slotTime, kelas)) {
          return;
        }

        const partnerInfo = getConcurrentPartnerInfo(kelas, day, slotTime, subjek, absentTeacherNames);
        const assignedGanti = t.isProgram ? "PROGRAM SEKOLAH (TIADA GANTIAN)" : (partnerInfo ? partnerInfo.nama : "");
        addRow({
          masa: slotTime,
          subjek,
          kelas,
          guru_tidak_hadir: t.name,
          sebab: t.reason,
          ganti: assignedGanti,
          saved: false,
          isEmergency: t.isEmergency
        });
        newlyAddedSlots++;
        addedForTeacher++;
      });
    });

    // Jika guru ada jadual tetapi semua kelas prasekolah/tiada slot memerlukan guru ganti
    if (addedForTeacher === 0) {
      addRow({
        masa: "Tiada Kelas",
        subjek: "Tiada PdP",
        kelas: "—",
        guru_tidak_hadir: t.name,
        sebab: t.reason || "Tidak Hadir",
        ganti: "TIADA GANTIAN",
        saved: false,
        isEmergency: t.isEmergency
      });
      newlyAddedSlots++;
    }
  });

  if (newlyAddedSlots > 0) {
    autoMessage.textContent = `${newlyAddedSlots} rekod waktu kelas / ketidakhadiran guru berjaya diisi secara automatik. Sila tentukan guru ganti (jika perlu) dan klik Simpan.`;
    autoMessage.classList.remove("hidden");
  } else if (!entryRows.children.length && activeTeachers.length === 0) {
    addRow();
    autoMessage.textContent = `Sila pilih guru tidak hadir atau tambah waktu kelas.`;
    autoMessage.classList.remove("hidden");
  }
  persistCurrentDraft(dateInput ? dateInput.value : "");
  kemasKiniSemuaCadanganGuruGanti();
}

// Cadangan Guru Ganti Pintar dengan Pengesanan Pertindihan Semasa (Clash Prevention)
function dapatkanCadanganGuruGanti(kumpulanVal, hariVal, masaVal, currentRow) {
  const dutyTeachers = (kumpulanVal && Array.isArray(TEACHER_GROUPS[kumpulanVal]))
    ? TEACHER_GROUPS[kumpulanVal]
    : [];
  const absentTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
    .map(r => r.querySelector(".teacher-select").value)
    .filter(Boolean);

  // Semak guru yang telah pun ditugaskan ganti pada WAKTU YANG SAMA dalam jadual semasa
  const alreadyAssignedAtSameSlot = [...entryRows.querySelectorAll(".schedule-row")]
    .filter(r => r !== currentRow && r.querySelector(".row-masa").value.trim() === masaVal)
    .map(r => r.querySelector(".row-ganti").value.trim())
    .filter(Boolean);

  const checkTeacher = (name) => {
    if (absentTeachers.includes(name)) {
      return { nama: name, status: "Tidak Hadir", boleh: false };
    }
    // Semak jika guru ada kelas asal sendiri pada slot ini
    const teacherSchedule = TIMETABLE[name];
    if (teacherSchedule && teacherSchedule[hariVal]) {
      if (teacherSchedule[hariVal].some(([m]) => splitTimeSlot(m).includes(masaVal))) {
        return { nama: name, status: "Ada Kelas Asal", boleh: false };
      }
    }
    // Semak jika guru telah ditugaskan ganti kelas lain pada slot masa ini
    if (alreadyAssignedAtSameSlot.includes(name)) {
      return { nama: name, status: "Telah Ditugaskan Ganti", boleh: false };
    }
    return { nama: name, status: "Bebas", boleh: true };
  };

  const bertugas = dutyTeachers.map(checkTeacher);
  const nonDutyChecked = MASTER_TEACHERS
    .filter(name => !dutyTeachers.includes(name))
    .map(checkTeacher);
  const tidakBertugasBebas = nonDutyChecked.filter(c => c.boleh);
  const tidakBertugasSibuk = nonDutyChecked.filter(c => !c.boleh);

  return { bertugas, tidakBertugasBebas, tidakBertugasSibuk };
}

// Mengemas kini pilihan dropdown Guru Ganti di semua baris
function kemasKiniSemuaCadanganGuruGanti() {
  const kv = kumpulanSelect.value;
  const hv = dayInput.value;

  const absentTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
    .map(r => r.querySelector(".teacher-select").value)
    .filter(Boolean);

  [...entryRows.querySelectorAll(".schedule-row")].forEach(row => {
    const selectEl = row.querySelector(".row-ganti");
    const triggerLabel = row.querySelector(".custom-ganti-label");
    const menuEl = row.querySelector(".custom-ganti-menu");
    const masaVal = row.querySelector(".row-masa").value.trim();
    const subjekVal = row.querySelector(".row-subjek").value.trim();
    const kelasVal = row.querySelector(".row-kelas").value.trim();
    let currentVal = selectEl.value || row.dataset.initialGanti || "";
    delete row.dataset.initialGanti;

    // Semak Guru Pasangan Serentak (Cantum Kelas)
    const partnerInfo = getConcurrentPartnerInfo(kelasVal, hv, masaVal, subjekVal, absentTeachers);

    // Jika ada partnerInfo dan belum ada pilihan dibuat oleh pengguna, auto-select partner
    if (!currentVal && !row.dataset.clearedByUser && partnerInfo) {
      currentVal = partnerInfo.nama;
    }

    selectEl.innerHTML = '<option value="">Pilih guru ganti</option>';
    if (menuEl) menuEl.innerHTML = "";

    const formatLabel = (nama) => {
      const asal = TIMETABLE[nama] && TIMETABLE[nama][hv]
        ? TIMETABLE[nama][hv].reduce((acc, [m]) => acc + splitTimeSlot(m).length, 0)
        : 0;
      const reliefCount = [...entryRows.querySelectorAll('.row-ganti')]
        .filter(s => s.value === nama).length;
      return `${nama} (${asal} Waktu Asal) +${reliefCount} Ganti`;
    };

    // Item Kosongkan (Reset) dalam menu kustom
    if (menuEl) {
      const clearItem = document.createElement("div");
      clearItem.className = "custom-ganti-item";
      clearItem.innerHTML = `
        <div class="custom-ganti-item-name">
          <span class="custom-ganti-dot" style="background:#94a3b8;"></span>
          <span style="font-style:italic; color:#64748b;">— Kosongkan (Pilih guru ganti) —</span>
        </div>
      `;
      clearItem.addEventListener("click", () => {
        row.dataset.clearedByUser = "true";
        selectEl.value = "";
        row.classList.remove("row-is-program");
        if (triggerLabel) triggerLabel.textContent = "Pilih guru ganti";
        menuEl.classList.add("hidden");
        const trigger = row.querySelector(".custom-ganti-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        hideTeacherHoverPopover();
        kemasKiniSemuaCadanganGuruGanti();
        persistCurrentDraft(dateInput ? dateInput.value : "");
      });
      menuEl.appendChild(clearItem);
    }

    // Jika slot ini ditetapkan status Program Sekolah melalui togol guru (Cadangan 2), masukkan opsyen dalam select
    if (isSpecialProgramRelief(currentVal)) {
      const optProg = document.createElement("option");
      optProg.value = PROGRAM_SEKOLAH_VAL;
      optProg.textContent = `🏛️ ${PROGRAM_SEKOLAH_VAL}`;
      selectEl.appendChild(optProg);
    }

    const addCustomGroup = (title, candidates, isHeaderAlert = false) => {
      if (!menuEl || !candidates.length) return;
      const grpHeader = document.createElement("div");
      grpHeader.className = "custom-ganti-group-header";
      grpHeader.innerHTML = `<span>${title}</span>`;
      menuEl.appendChild(grpHeader);

      candidates.forEach(c => {
        const item = document.createElement("div");
        const isSelected = (currentVal === c.nama);
        item.className = "custom-ganti-item" + (isSelected ? " selected" : "");

        const asal = TIMETABLE[c.nama] && TIMETABLE[c.nama][hv]
          ? TIMETABLE[c.nama][hv].reduce((acc, [m]) => acc + splitTimeSlot(m).length, 0)
          : 0;
        const reliefCount = [...entryRows.querySelectorAll('.row-ganti')]
          .filter(s => s.value === c.nama).length;
        
        let metaText = "";
        let dotColor = c.boleh ? '#10b981' : '#ef4444';

        if (c.status === "Pasangan Serentak (Cantum Kelas)") {
          metaText = `⭐ Pasangan ${c.partnerSubjek} [Cantum Kelas]`;
          dotColor = '#10b981';
        } else if (c.nama === "Guru UBK") {
          metaText = `${reliefCount > 0 ? `+${reliefCount}G ` : ''}[${c.status}]`;
        } else {
          metaText = `${asal}W Asal${reliefCount > 0 ? ` +${reliefCount}G` : ''} ${!c.boleh ? `[${c.status}]` : ''}`;
        }

        item.innerHTML = `
          <div class="custom-ganti-item-name">
            <span class="custom-ganti-dot" style="background:${dotColor};"></span>
            <span>${c.nama}</span>
          </div>
          <div class="custom-ganti-item-meta">${metaText}</div>
        `;

        item.addEventListener("mouseenter", () => {
          showTeacherHoverPopover(c.nama, item, masaVal, c);
        });
        item.addEventListener("mouseleave", () => {
          hideTeacherHoverPopover();
        });

        item.addEventListener("click", () => {
          delete row.dataset.clearedByUser;
          selectEl.value = c.nama;
          if (triggerLabel) triggerLabel.textContent = c.nama;
          menuEl.classList.add("hidden");
          const trigger = row.querySelector(".custom-ganti-trigger");
          if (trigger) trigger.setAttribute("aria-expanded", "false");
          hideTeacherHoverPopover();
          kemasKiniSemuaCadanganGuruGanti();
          persistCurrentDraft(dateInput ? dateInput.value : "");
        });

        menuEl.appendChild(item);
      });
    };

    // 1. Guru Pasangan Serentak (Cantum Kelas) - Keutamaan Tertinggi
    if (partnerInfo) {
      const ogPartner = document.createElement("optgroup");
      ogPartner.label = "Guru Pasangan Serentak (Cantum Kelas)";
      const optPartner = document.createElement("option");
      optPartner.value = partnerInfo.nama;
      optPartner.textContent = `⭐ ${partnerInfo.nama} (Pasangan ${partnerInfo.partnerSubjek} - Cantum Kelas)`;
      ogPartner.appendChild(optPartner);
      selectEl.appendChild(ogPartner);

      addCustomGroup("⭐ Guru Pasangan Serentak (Cantum Kelas)", [partnerInfo]);
    }

    if (hv && masaVal) {
      const { bertugas, tidakBertugasBebas, tidakBertugasSibuk = [] } = dapatkanCadanganGuruGanti(kv, hv, masaVal, row);
      const countP = (n) => countPeriods(n, hv);
      const sortFn = (a, b) => countP(a.nama) - countP(b.nama);

      let kb = bertugas.filter(c => c.boleh).sort(sortFn);
      let ks = bertugas.filter(c => !c.boleh).sort(sortFn);
      let ntb = tidakBertugasBebas.sort(sortFn);
      let nts = tidakBertugasSibuk.sort(sortFn);

      // Asingkan partnerTeacher agar tidak berulang dalam senarai di bawah
      if (partnerInfo) {
        kb = kb.filter(c => c.nama !== partnerInfo.nama);
        ks = ks.filter(c => c.nama !== partnerInfo.nama);
        ntb = ntb.filter(c => c.nama !== partnerInfo.nama);
        nts = nts.filter(c => c.nama !== partnerInfo.nama);
      }

      const hasDutyGroupMembers = (kb.length + ks.length) > 0;

      if (hasDutyGroupMembers) {
        if (kb.length) {
          const og = document.createElement("optgroup");
          og.label = "Guru Bertugas (Bebas)";
          kb.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.nama;
            opt.textContent = formatLabel(c.nama);
            og.appendChild(opt);
          });
          selectEl.appendChild(og);
          addCustomGroup("Guru Bertugas (Bebas)", kb);
        }

        if (ks.length) {
          const og = document.createElement("optgroup");
          og.label = "Guru Bertugas (Ada Kelas / Tidak Hadir / Bertindih)";
          ks.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.nama;
            opt.textContent = `${formatLabel(c.nama)} [${c.status}]`;
            og.appendChild(opt);
          });
          selectEl.appendChild(og);
          addCustomGroup("Guru Bertugas (Ada Kelas / Bertindih)", ks, true);
        }

        if (ntb.length) {
          const og = document.createElement("optgroup");
          og.label = "Guru Tidak Bertugas (Bebas)";
          ntb.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.nama;
            opt.textContent = formatLabel(c.nama);
            og.appendChild(opt);
          });
          selectEl.appendChild(og);
          addCustomGroup("Guru Tidak Bertugas (Bebas)", ntb);
        }
      } else {
        // Jika sekolah tidak menggunakan Kumpulan Bertugas (atau dibiarkan kosong)
        if (ntb.length) {
          const og = document.createElement("optgroup");
          og.label = "Guru Bebas (Tiada Kelas)";
          ntb.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.nama;
            opt.textContent = formatLabel(c.nama);
            og.appendChild(opt);
          });
          selectEl.appendChild(og);
          addCustomGroup("Guru Bebas (Tiada Kelas)", ntb);
        }

        if (nts.length) {
          const og = document.createElement("optgroup");
          og.label = "Guru Ada Kelas / Bertindih";
          nts.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.nama;
            opt.textContent = `${formatLabel(c.nama)} [${c.status}]`;
            og.appendChild(opt);
          });
          selectEl.appendChild(og);
          addCustomGroup("Guru Ada Kelas / Bertindih", nts, true);
        }
      }

      // Pilihan Guru UBK
      const ubkAssigned = [...entryRows.querySelectorAll(".schedule-row")]
        .filter(r => r !== row && r.querySelector(".row-masa").value.trim() === masaVal)
        .map(r => r.querySelector(".row-ganti").value.trim())
        .includes("Guru UBK");
      const ubkStatus = ubkAssigned ? "Telah Ditugaskan Ganti" : "Bebas";
      const ubkReliefCount = [...entryRows.querySelectorAll('.row-ganti')]
        .filter(s => s.value === "Guru UBK").length;

      const ogUbk = document.createElement("optgroup");
      ogUbk.label = "Guru UBK";
      const optUbk = document.createElement("option");
      optUbk.value = "Guru UBK";
      optUbk.textContent = `Guru UBK${ubkReliefCount > 0 ? ` +${ubkReliefCount} Ganti` : ''}${ubkAssigned ? ' [Telah Ditugaskan Ganti]' : ''}`;
      ogUbk.appendChild(optUbk);
      selectEl.appendChild(ogUbk);

      addCustomGroup("Guru UBK", [{
        nama: "Guru UBK",
        status: ubkStatus,
        boleh: !ubkAssigned
      }]);
    } else {
      let allList = [
        ...MASTER_TEACHERS.map(guru => ({ nama: guru, boleh: true, status: "Bebas" })),
        { nama: "Guru UBK", boleh: true, status: "Bebas" }
      ];
      if (partnerInfo) {
        allList = allList.filter(c => c.nama !== partnerInfo.nama);
      }
      MASTER_TEACHERS.filter(g => !partnerInfo || g !== partnerInfo.nama).forEach(guru => {
        const opt = document.createElement("option");
        opt.value = guru;
        opt.textContent = guru;
        selectEl.appendChild(opt);
      });
      const optUbk = document.createElement("option");
      optUbk.value = "Guru UBK";
      optUbk.textContent = "Guru UBK";
      selectEl.appendChild(optUbk);

      addCustomGroup("Semua Guru", allList);
    }

    if ([...selectEl.options].some(o => o.value === currentVal)) {
      selectEl.value = currentVal;
    } else {
      selectEl.value = "";
    }
    if (triggerLabel) {
      if (isSpecialProgramRelief(selectEl.value)) {
        triggerLabel.innerHTML = `<span>🏛️ ${selectEl.value}</span>`;
        row.classList.add("row-is-program");
      } else {
        triggerLabel.textContent = selectEl.value || "Pilih guru ganti";
        row.classList.remove("row-is-program");
      }
    }
  });

  checkOverload();
}

function countPeriods(teacherName, hari) {
  if (!teacherName) return 0;
  let count = 0;
  if (TIMETABLE[teacherName] && TIMETABLE[teacherName][hari]) {
    for (const [m] of TIMETABLE[teacherName][hari]) count += splitTimeSlot(m).length;
  }
  const rows = [...entryRows.querySelectorAll(".schedule-row")];
  rows.forEach(r => {
    if (r.querySelector(".row-ganti").value.trim() === teacherName) count += 1;
  });
  return count;
}

// Amaran Beban Berlebihan (Hanya memberi amaran kepada guru yang dipilih ganti)
function checkOverload() {
  const hv = dayInput.value;
  if (!hv) {
    overloadBanner.classList.add("hidden");
    return;
  }

  const assignedRelief = {};
  [...entryRows.querySelectorAll(".schedule-row")].forEach(row => {
    const g = row.querySelector(".row-ganti").value.trim();
    if (g) assignedRelief[g] = (assignedRelief[g] || 0) + 1;
  });

  const overloaded = [];
  Object.entries(assignedRelief).forEach(([guru, reliefPeriods]) => {
    const basePeriods = TIMETABLE[guru] && TIMETABLE[guru][hv]
      ? TIMETABLE[guru][hv].reduce((acc, [m]) => acc + splitTimeSlot(m).length, 0)
      : 0;
    const total = basePeriods + reliefPeriods;
    if (total >= APP_CONFIG.overloadThresholdDaily) {
      overloaded.push({ guru, total, basePeriods, reliefPeriods });
    }
  });

  if (overloaded.length) {
    overloadBanner.innerHTML = `<i data-lucide="alert-triangle" class="inline mr-2 text-red-600" style="width:17px;height:17px"></i>` +
      `<strong>Amaran Beban Berlebihan:</strong> ` +
      overloaded.map(o => `${o.guru} (${o.total} waktu: ${o.basePeriods} asal + ${o.reliefPeriods} ganti)`).join(", ");
    overloadBanner.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  } else {
    overloadBanner.classList.add("hidden");
  }
}

// Aliran Tambah Guru Ganti (Kecemasan)
function addEmergencyTeacherFlow() {
  addTeacherRow("", "Kecemasan", false, true);
  teachersContainer.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("Baris guru kecemasan ditambah. Sila pilih nama guru tidak hadir.", "info");
}

document.getElementById("add-emergency-teacher")?.addEventListener("click", addEmergencyTeacherFlow);
document.getElementById("add-row")?.addEventListener("click", () => addRow({ saved: false }));
document.getElementById("add-teacher")?.addEventListener("click", () => addTeacherRow());

document.getElementById("reset-teachers")?.addEventListener("click", () => {
  const curSaved = allRecords.filter(r => r && r.tarikh === dateInput.value);
  if (curSaved.length > 0) {
    if (!confirm(`Perhatian: Terdapat ${curSaved.length} rekod tersimpan bagi tarikh ini.\n\nReset hanya akan mengosongkan borang semasa pada skrin tanpa memadam data dalam pangkalan data. Adakah anda pasti?`)) {
      return;
    }
  }
  teachersContainer.innerHTML = "";
  addTeacherRow();
  autoFillSchedule({ forceRegenerate: true });
  showToast("Senarai guru tidak hadir telah di-reset.", "neutral");
});

document.getElementById("reset-rows")?.addEventListener("click", () => {
  entryRows.innerHTML = "";
  autoFillSchedule({ forceRegenerate: true });
  showToast("Jadual automatik telah di-reset kepada asal.", "neutral");
});

// Paparan Banner Status Harian (Saved vs All Present vs Draft)
function showDailyStatusBanner(state) {
  const banner = document.getElementById("daily-schedule-status-banner");
  if (!banner) return;

  if (state.type === "saved") {
    banner.className = "daily-status-banner banner-saved";
    banner.innerHTML = `
      <div>
        <div class="daily-banner-title">
          <i data-lucide="check-circle-2" style="width:20px;height:20px;color:#10b981;"></i>
          <span>Jadual Guru Ganti [${formatDateDisplay(state.date) || state.date}] — Tersimpan &amp; Sah (${state.day})</span>
        </div>
        <p style="margin:4px 0 0; font-size:12.5px; opacity:0.95;">
          Terdapat <strong>${state.count} tugasan guru ganti</strong> direkodkan untuk <strong>${state.teacherCount} guru tidak hadir</strong>. Data asal selamat dalam sistem. Anda boleh menambah guru ganti kecemasan atau mengedit rekod pada bila-bila masa.
        </p>
      </div>
      <div class="daily-banner-actions">
        <button type="button" id="btn-banner-add-emergency" class="action-btn" style="background:#2563eb; color:#fff; font-size:0.78rem; padding:0.45rem 0.85rem; border-radius:8px; display:inline-flex; align-items:center; gap:5px; font-weight:700;">
          <i data-lucide="alert-circle" style="width:14px;height:14px;"></i> Tambah Guru Ganti (Kecemasan)
        </button>
      </div>
    `;
    banner.classList.remove("hidden");
    document.getElementById("btn-banner-add-emergency")?.addEventListener("click", addEmergencyTeacherFlow);
  } else if (state.type === "all_present") {
    banner.className = "daily-status-banner banner-all-present";
    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <div style="background:#d1fae5; color:#059669; padding:8px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center;">
          <i data-lucide="shield-check" style="width:24px;height:24px;color:#059669;"></i>
        </div>
        <div>
          <div class="daily-banner-title" style="color:#065f46;">
            <span>STATUS HARIAN [${formatDateDisplay(state.date) || state.date} — ${state.day}]:</span>
            <span class="badge-all-present">SEMUA GURU HADIR / TIADA PENGGANTIAN</span>
          </div>
          <p style="margin:4px 0 0; font-size:12.5px; color:#047857; line-height:1.5;">
            Alhamdulillah, tiada ketidakhadiran guru direkodkan bagi tarikh ini. Semua guru hadir bertugas dan sesi Pengajaran &amp; Pembelajaran (PdP) berjalan sepenuhnya mengikut jadual asal.
          </p>
        </div>
      </div>
      <div class="daily-banner-actions">
        <button type="button" id="btn-banner-record-absent" class="action-btn" style="background:#059669; color:#fff; font-size:0.8rem; padding:0.5rem 0.95rem; border-radius:8px; display:inline-flex; align-items:center; gap:6px; font-weight:700;">
          <i data-lucide="user-plus" style="width:15px;height:15px;"></i> Rekod Guru Tidak Hadir (Jika Ada)
        </button>
      </div>
    `;
    banner.classList.remove("hidden");
    document.getElementById("btn-banner-record-absent")?.addEventListener("click", () => {
      const firstTs = teachersContainer.querySelector(".teacher-select");
      if (firstTs) {
        firstTs.scrollIntoView({ behavior: "smooth", block: "center" });
        firstTs.focus();
        showToast("Sila pilih nama guru tidak hadir untuk menjana jadual guru ganti.", "info");
      }
    });
  } else {
    banner.className = "daily-status-banner banner-empty";
    banner.innerHTML = `
      <div>
        <div class="daily-banner-title">
          <i data-lucide="calendar" style="width:18px;height:18px;color:#3b82f6;"></i>
          <span>Jadual Guru Ganti [${formatDateDisplay(state.date) || state.date}] — Draf Pengisian (${state.day})</span>
        </div>
        <p style="margin:4px 0 0; font-size:12.5px; color:#64748b;">
          Tentukan guru pengganti bagi setiap slot kelas di bawah, kemudian klik SIMPAN JADUAL GURU GANTI.
        </p>
      </div>
    `;
    banner.classList.remove("hidden");
  }

  if (window.lucide) window.lucide.createIcons();
}

// Memuatkan Jadual Guru Ganti Lengkap Mengikut Tarikh (Persistent & Isolated by Date)
function loadDailyScheduleForDate(dateStr) {
  if (!dateStr) dateStr = dateInput.value || getLocalDateString();
  const day = getDayFromDate(dateStr);
  dayInput.value = day;

  const p2Tarikh = document.getElementById("page2-tarikh");
  const p2 = document.getElementById("page2-hari");
  if (p2Tarikh && !p2Tarikh.value) p2Tarikh.value = dateStr;
  if (p2 && day && !p2.value) p2.value = day;

  const p3Tarikh = document.getElementById("page3-tarikh");
  const p3 = document.getElementById("page3-hari");
  if (p3Tarikh && !p3Tarikh.value) p3Tarikh.value = dateStr;
  if (p3 && day && !p3.value) p3.value = day;

  const allPresentBox = document.getElementById("all-present-schedule-box");

  // Filter rekod bagi tarikh yang dipilih
  const savedRecords = allRecords.filter(r => r && r.tarikh === dateStr);
  const saveBtn = document.getElementById("save-sheet-btn");

  if (savedRecords.length > 0) {
    if (allPresentBox) allPresentBox.classList.add("hidden");

    if (savedRecords[0].minggu) mingguSelect.value = savedRecords[0].minggu;
    if (savedRecords[0].kumpulan) {
      kumpulanSelect.value = savedRecords[0].kumpulan;
      updateGroupMembers();
    }

    // Ekstrak guru tidak hadir unik & kenal pasti jika ditandakan status Program Sekolah
    const absentMap = {};
    const absentProgramMap = {};
    savedRecords.forEach(r => {
      const g = r.guru_tidak_hadir || r.guruTidakHadir;
      const ganti = r.guru_ganti || r.guruGanti;
      if (g) {
        if (!absentMap[g]) {
          absentMap[g] = r.sebab || "Urusan Rasmi";
          absentProgramMap[g] = true;
        }
        if (!isSpecialProgramRelief(ganti)) {
          absentProgramMap[g] = false;
        }
      }
    });

    teachersContainer.innerHTML = "";
    Object.keys(absentMap).forEach(name => {
      const isProgExempt = !!absentProgramMap[name];
      addTeacherRow(name, absentMap[name], true, false, isProgExempt);
    });

    // Muat semula entryRows dengan rekod tersimpan
    entryRows.innerHTML = "";
    savedRecords.forEach(r => {
      addRow({
        id: r.id,
        masa: r.masa,
        subjek: r.mata_pelajaran,
        kelas: r.kelas,
        ganti: r.guru_ganti,
        guru_tidak_hadir: r.guru_tidak_hadir,
        sebab: r.sebab,
        saved: true
      });
    });

    showDailyStatusBanner({
      type: "saved",
      count: savedRecords.length,
      teacherCount: Object.keys(absentMap).length,
      date: dateStr,
      day: day
    });

    if (saveBtn) {
      saveBtn.innerHTML = `<i data-lucide="save" style="width:17px;height:17px"></i> SIMPAN PERUBAHAN JADUAL`;
    }

    autoMessage.textContent = `${savedRecords.length} rekod jadual guru ganti sedia ada dimuatkan bagi tarikh ${formatDateDisplay(dateStr) || dateStr}.`;
    autoMessage.classList.remove("hidden");
  } else {
    // Tiada rekod tersimpan bagi tarikh ini:
    // Semak sama ada terdapat DRAF yang disimpan secara tempatan bagi tarikh ini
    const savedDraft = loadDraftForDate(dateStr);
    if (savedDraft && (savedDraft.teachers.length > 0 || savedDraft.rows.length > 0)) {
      if (allPresentBox) allPresentBox.classList.add("hidden");
      if (savedDraft.minggu) mingguSelect.value = savedDraft.minggu;
      if (savedDraft.kumpulan) {
        kumpulanSelect.value = savedDraft.kumpulan;
        updateGroupMembers();
      }

      teachersContainer.innerHTML = "";
      savedDraft.teachers.forEach(t => {
        addTeacherRow(t.name, t.reason, false, t.isEmergency, t.isProgram);
      });

      entryRows.innerHTML = "";
      savedDraft.rows.forEach(r => {
        addRow({
          id: r.id,
          masa: r.masa,
          subjek: r.subjek,
          kelas: r.kelas,
          ganti: r.ganti,
          guru_tidak_hadir: r.guru_tidak_hadir,
          sebab: r.sebab,
          saved: r.saved || false
        });
      });

      showDailyStatusBanner({
        type: "draft",
        date: dateStr,
        day: day
      });

      autoMessage.textContent = `${savedDraft.rows.length} waktu kelas draf dimuatkan semula bagi tarikh ${formatDateDisplay(dateStr) || dateStr}.`;
      autoMessage.classList.remove("hidden");
      return;
    }

    teachersContainer.innerHTML = "";
    addTeacherRow();
    entryRows.innerHTML = "";

    // Semak sama ada terdapat nama guru tidak hadir aktif dipilih
    const activeAbsent = [...teachersContainer.querySelectorAll(".teacher-row")]
      .filter(r => r.querySelector(".teacher-select") && r.querySelector(".teacher-select").value);

    if (activeAbsent.length === 0) {
      // Mod: SEMUA GURU HADIR / TIADA PENGGANTIAN
      if (allPresentBox) {
        allPresentBox.innerHTML = `
          <div class="all-present-inner">
            <div class="all-present-badge-header">
              <i data-lucide="award" style="width:16px;height:16px;color:#059669;"></i>
              <span>PENGESAHAN RASMI PENTADBIRAN SEKOLAH</span>
            </div>
            <h3 style="margin:10px 0 6px; font-size:1.35rem; font-weight:800; color:#065f46; letter-spacing:-0.01em;">
              SEMUA GURU HADIR / TIADA PENGGANTIAN
            </h3>
            <p style="margin:0 auto 16px; font-size:0.92rem; color:#047857; max-width:620px; line-height:1.6;">
              Bagi tarikh <strong>${formatDateDisplay(dateStr) || dateStr} (${day})</strong>, tiada penugasan guru ganti diperlukan kerana semua guru ${APP_CONFIG.schoolName} dilaporkan hadir bertugas. Semua kelas beroperasi sepenuhnya mengikut Jadual Waktu Induk.
            </p>
            <div class="all-present-stats">
              <div class="stat-pill"><i data-lucide="check-circle-2" style="width:16px;height:16px;color:#10b981;"></i> 100% Kehadiran Guru</div>
              <div class="stat-pill"><i data-lucide="book-open" style="width:16px;height:16px;color:#10b981;"></i> Jadual Induk Berjalan Biasa</div>
              <div class="stat-pill"><i data-lucide="sparkles" style="width:16px;height:16px;color:#10b981;"></i> Tiada Waktu Kelas Terabai</div>
            </div>
          </div>
        `;
        allPresentBox.classList.remove("hidden");
      }

      showDailyStatusBanner({
        type: "all_present",
        date: dateStr,
        day: day
      });
    } else {
      if (allPresentBox) allPresentBox.classList.add("hidden");
      addRow();
      showDailyStatusBanner({
        type: "draft",
        date: dateStr,
        day: day
      });
    }

    if (saveBtn) {
      saveBtn.innerHTML = `<i data-lucide="save" style="width:17px;height:17px"></i> SIMPAN JADUAL GURU GANTI`;
    }
    autoMessage.classList.add("hidden");
  }

  kemasKiniSemuaCadanganGuruGanti();
  if (window.lucide) window.lucide.createIcons();
}

// ==========================================================================
// MODAL PAPARAN JADUAL TERPERINCI & DIBESARKAN (ENLARGED TIMETABLE POPUP)
// ==========================================================================
function openEnlargedScheduleModal(data) {
  const modal = document.getElementById("modal-jadual-terperinci");
  if (!modal) return;

  const header = document.getElementById("schedule-modal-header");
  const titleEl = document.getElementById("schedule-modal-title");
  const subtitleEl = document.getElementById("schedule-modal-subtitle");
  const tagEl = document.getElementById("schedule-modal-tag");
  const iconBadge = document.getElementById("schedule-modal-badge-icon");
  const bodyEl = document.getElementById("schedule-modal-body");

  if (titleEl) titleEl.textContent = data.title || "Jadual Terperinci";
  if (subtitleEl) subtitleEl.textContent = data.subtitle || "";
  
  if (tagEl) {
    tagEl.textContent = data.tag || "";
    tagEl.style.display = data.tag ? "inline-block" : "none";
  }

  // Buang sebarang lencana ekstra lama jika ada
  if (header) {
    const oldExtra = header.querySelector(".modal-extra-badge");
    if (oldExtra) oldExtra.remove();
    if (data.extraBadgeHtml) {
      const span = document.createElement("span");
      span.className = "modal-extra-badge";
      span.innerHTML = data.extraBadgeHtml;
      if (tagEl) tagEl.insertAdjacentElement("afterend", span);
    }
    header.style.background = data.headerBg || "#1b253b";
  }

  if (iconBadge) {
    const iconName = data.icon === "user" ? "user-check" : "calendar";
    iconBadge.innerHTML = `<i data-lucide="${iconName}" style="width:22px;height:22px;color:#ffffff;"></i>`;
  }

  if (bodyEl) {
    bodyEl.innerHTML = `<div class="overflow-x-auto">${data.tableHtml || ""}</div>`;
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // Kunci skrol latar belakang

  if (window.lucide) window.lucide.createIcons();
}

function closeEnlargedScheduleModal() {
  const modal = document.getElementById("modal-jadual-terperinci");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // Pulihkan skrol latar belakang
}

function setupScheduleEnlargeModal() {
  const modal = document.getElementById("modal-jadual-terperinci");
  if (!modal) return;

  const closeBtn = document.getElementById("schedule-modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeEnlargedScheduleModal);
  }

  // Klik di luar paparan jadual (pada latar modal) untuk menutup jadual
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeEnlargedScheduleModal();
    }
  });

  const dialog = modal.querySelector(".schedule-modal-dialog");
  if (dialog) {
    dialog.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Tekan kekunci ESC untuk menutup jadual
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
      if (!modal.classList.contains("hidden")) {
        closeEnlargedScheduleModal();
      }
    }
  });
}

// PAGE 2: Jadual Kelas
const page2TarikhInput = document.getElementById("page2-tarikh");
const page2HariSelect = document.getElementById("page2-hari");

if (page2TarikhInput) {
  page2TarikhInput.addEventListener("change", () => {
    if (page2TarikhInput.value) {
      const d = getDayFromDate(page2TarikhInput.value);
      if (page2HariSelect) page2HariSelect.value = d;
      // Penyelarasan dua hala ke Halaman Kemasukan (Page 1) dan Jadual Guru (Page 3)
      if (dateInput && dateInput.value !== page2TarikhInput.value) {
        dateInput.value = page2TarikhInput.value;
        if (dayInput) dayInput.value = d;
        loadDailyScheduleForDate(page2TarikhInput.value);
      }
      const p3T = document.getElementById("page3-tarikh");
      const p3H = document.getElementById("page3-hari");
      if (p3T && p3T.value !== page2TarikhInput.value) p3T.value = page2TarikhInput.value;
      if (p3H && d) p3H.value = d;
    }
    renderPage2();
  });
}

if (page2HariSelect) {
  page2HariSelect.addEventListener("change", renderPage2);
}

function renderPage2() {
  const container = document.getElementById("timetable-container");
  if (!container) return;
  container.innerHTML = "";

  const p2Tarikh = document.getElementById("page2-tarikh");
  const selectedDate = (p2Tarikh && p2Tarikh.value) ? p2Tarikh.value : (dateInput ? dateInput.value : getLocalDateString());

  const page2Select = document.getElementById("page2-hari");
  let selectedDay = (page2Select && page2Select.value) ? page2Select.value : "";
  if (!selectedDay && selectedDate) {
    selectedDay = getDayFromDate(selectedDate);
    if (page2Select) page2Select.value = selectedDay;
  }

  if (!selectedDay) {
    container.innerHTML = '<p class="text-slate-500 col-span-2 text-center py-10">Sila pilih hari atau tarikh terlebih dahulu.</p>';
    return;
  }

  const hari = selectedDay;

  // Ekstrak data rekod gantian daripada storan/pangkalan data bagi tarikh berkenaan
  const dateRecords = allRecords.filter(r => r && r.tarikh === selectedDate);
  const absTeachersSet = new Set();
  const replacementsMap = {};

  dateRecords.forEach(r => {
    const absName = r.guru_tidak_hadir || r.guruTidakHadir;
    const gantiName = r.guru_ganti || r.guruGanti;
    if (absName) absTeachersSet.add(absName);
    if (r.masa && r.kelas && gantiName) {
      const idx = STANDARD_SLOTS.indexOf(r.masa);
      if (idx >= 0) replacementsMap[`${r.kelas}|${idx}`] = gantiName;
    }
  });

  // Jika tarikh yang dipilih sepadan dengan tarikh draf aktif di KEMASUKAN, gabungkan juga input semasa
  if (selectedDate === (dateInput ? dateInput.value : "")) {
    [...teachersContainer.querySelectorAll(".teacher-row")].forEach(r => {
      const g = r.querySelector(".teacher-select") ? r.querySelector(".teacher-select").value : "";
      if (g) absTeachersSet.add(g);
    });
    [...entryRows.querySelectorAll(".schedule-row")].forEach(row => {
      const m = row.querySelector(".row-masa") ? row.querySelector(".row-masa").value.trim() : "";
      const k = row.querySelector(".row-kelas") ? row.querySelector(".row-kelas").value.trim() : "";
      const g = row.querySelector(".row-ganti") ? row.querySelector(".row-ganti").value.trim() : "";
      if (m && k && g) {
        const idx = STANDARD_SLOTS.indexOf(m);
        if (idx >= 0) replacementsMap[`${k}|${idx}`] = g;
      }
    });
  }

  const absTeachers = Array.from(absTeachersSet);

  if (typeof rebuildClassTimetablesFromMaster === "function" && (!ALL_MASTER_CLASSES || ALL_MASTER_CLASSES.length === 0)) {
    rebuildClassTimetablesFromMaster();
  }
  const rawClasses = (Array.isArray(ALL_MASTER_CLASSES) && ALL_MASTER_CLASSES.length > 0) ? ALL_MASTER_CLASSES : [];
  const classes = rawClasses.filter(c => c && String(c).trim().toLowerCase() !== "kelas" && String(c).trim().toLowerCase() !== "nama guru");
  const formattedDate = selectedDate ? formatDateDisplay(selectedDate) : "";
  const headerDateInfo = formattedDate ? ` — ${hari}, ${formattedDate}` : ` - ${hari}`;

  if (classes.length === 0) {
    container.innerHTML = `
      <div class="col-span-full empty-state-cheerful" style="margin:1rem 0;">
        <div class="empty-state-icon-wrap">
          <i data-lucide="calendar-plus" style="width:28px;height:28px;"></i>
        </div>
        <h4 style="font-weight:800; font-size:1.1rem; color:var(--text-primary); margin-bottom:0.4rem;">
          Belum Ada Data Jadual Kelas Didaftarkan
        </h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); max-width:540px; margin:0 auto 1.25rem; line-height:1.6;">
          Sila sambungkan sistem ini dengan <strong>Google Sheet Sekolah</strong> atau muat naik fail CSV/JSON jadual waktu di halaman <strong>Urus &amp; Import Jadual</strong> untuk memaparkan jadual kelas secara automatik.
        </p>
        <button type="button" class="action-btn btn-primary" onclick="document.querySelector('[data-page=page-import]').click()" style="margin:0 auto; display:inline-flex;">
          <i data-lucide="database" style="width:16px;height:16px"></i> Pergi ke Urus &amp; Import Jadual
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  classes.forEach(kelas => {
    const card = document.createElement("div");
    card.className = "section-card overflow-hidden tt-clickable-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("title", `Klik untuk besarkan Jadual Kelas ${kelas}`);

    let html = `<div class="tt-card-header" style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">` +
      `<span>Kelas ${kelas}${headerDateInfo} (Sesi 2026)</span>` +
      `<button type="button" class="tt-expand-indicator" title="Besarkan Paparan Jadual" aria-label="Besarkan">` +
      `<i data-lucide="maximize-2" style="width:13px;height:13px;"></i><span>Besarkan</span>` +
      `</button>` +
      `</div><div class="overflow-x-auto"><table class="tt-table"><thead><tr><th>Masa</th><th>Subjek</th><th>Guru</th><th>Status</th></tr></thead><tbody>`;

    let hasAnySlot = false;
    for (let si = 1; si < STANDARD_SLOTS.length; si++) {
      if (Array.isArray(REHAT_SLOT_INDICES) && REHAT_SLOT_INDICES.includes(si)) continue; // Rehat
      const slotTime = STANDARD_SLOTS[si];
      const slotInfo = getClassTimetableSlot(kelas, hari, si);
      if (!slotInfo) continue;
      hasAnySlot = true;

      const { guru, subjek, guruList } = slotInfo;
      const key = `${kelas}|${si}`;
      const repl = replacementsMap[key] || "";

      // Semak sama ada mana-mana guru dalam subjek ini tidak hadir
      const isAbsent = guruList.some(g => absTeachers.includes(g));

      let cls = "tt-cell-present";
      let status = "Hadir";

      if (isAbsent && repl) {
        if (isSpecialProgramRelief(repl)) {
          cls = "tt-cell-program";
          status = "Program Sekolah (Tiada Ganti)";
        } else {
          cls = "tt-cell-replaced";
          status = `Diganti: ${repl}`;
        }
      } else if (isAbsent) {
        cls = "tt-cell-absent";
        status = "Tidak Hadir";
      }

      html += `<tr class="${cls}">` +
        `<td class="tt-col-masa">${slotTime}</td>` +
        `<td class="tt-col-subjek">${subjek}</td>` +
        `<td class="tt-col-guru">${guru}</td>` +
        `<td class="tt-col-status">${status}</td>` +
        `</tr>`;
    }

    if (!hasAnySlot) {
      html += `<tr><td colspan="4" class="text-center text-slate-400 dark:text-slate-500 py-4 text-xs italic">Tiada slot jadual waktu didaftarkan bagi kelas ini pada hari ${hari}.</td></tr>`;
    }

    html += `</tbody></table></div>`;
    card.innerHTML = html;

    // Klik mana-mana paparan jadual untuk timbul & dibesarkan di tengah skrin
    card.addEventListener("click", () => {
      const table = card.querySelector("table");
      if (!table) return;
      openEnlargedScheduleModal({
        type: "kelas",
        title: `JADUAL KELAS ${kelas}`,
        subtitle: `Kelas ${kelas}${headerDateInfo} — Sesi Persekolahan 2026`,
        tag: `Kelas ${kelas}`,
        headerBg: "#1b253b",
        icon: "calendar",
        tableHtml: table.outerHTML
      });
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });

    container.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

// PAGE 3: Jadual Guru
const page3TarikhInput = document.getElementById("page3-tarikh");
const page3HariSelect = document.getElementById("page3-hari");

if (page3TarikhInput) {
  page3TarikhInput.addEventListener("change", () => {
    if (page3TarikhInput.value) {
      const d = getDayFromDate(page3TarikhInput.value);
      if (page3HariSelect) page3HariSelect.value = d;
      // Penyelarasan dua hala ke Halaman Kemasukan (Page 1) dan Jadual Kelas (Page 2)
      if (dateInput && dateInput.value !== page3TarikhInput.value) {
        dateInput.value = page3TarikhInput.value;
        if (dayInput) dayInput.value = d;
        loadDailyScheduleForDate(page3TarikhInput.value);
      }
      const p2T = document.getElementById("page2-tarikh");
      const p2H = document.getElementById("page2-hari");
      if (p2T && p2T.value !== page3TarikhInput.value) p2T.value = page3TarikhInput.value;
      if (p2H && d) p2H.value = d;
    }
    renderPage3();
  });
}

if (page3HariSelect) {
  page3HariSelect.addEventListener("change", renderPage3);
}

function renderPage3() {
  const container = document.getElementById("guru-timetable-container");
  if (!container) return;
  container.innerHTML = "";

  const p3Tarikh = document.getElementById("page3-tarikh");
  const selectedDate = (p3Tarikh && p3Tarikh.value) ? p3Tarikh.value : (dateInput ? dateInput.value : getLocalDateString());

  const page3Select = document.getElementById("page3-hari");
  let selectedDay = (page3Select && page3Select.value) ? page3Select.value : "";
  if (!selectedDay && selectedDate) {
    selectedDay = getDayFromDate(selectedDate);
    if (page3Select) page3Select.value = selectedDay;
  }

  if (!selectedDay) {
    container.innerHTML = '<p class="text-slate-500 col-span-full text-center py-10">Sila pilih hari atau tarikh terlebih dahulu.</p>';
    return;
  }

  const formattedDate = selectedDate ? formatDateDisplay(selectedDate) : "";

  // Ekstrak data rekod gantian daripada storan/pangkalan data bagi tarikh berkenaan
  const dateRecords = allRecords.filter(r => r && r.tarikh === selectedDate);
  const absTeachersSet = new Set();
  const reliefAssignments = {};

  dateRecords.forEach(r => {
    const absName = r.guru_tidak_hadir || r.guruTidakHadir;
    const gantiName = r.guru_ganti || r.guruGanti;
    if (absName) absTeachersSet.add(absName);
    if (gantiName && r.masa && !isSpecialProgramRelief(gantiName)) {
      if (!reliefAssignments[gantiName]) reliefAssignments[gantiName] = [];
      const exists = reliefAssignments[gantiName].some(item => item.masa === r.masa && item.kelas === r.kelas);
      if (!exists) {
        reliefAssignments[gantiName].push({
          masa: r.masa,
          subjek: r.subjek || r.mata_pelajaran || "",
          kelas: r.kelas || "",
          guruAsal: absName || ""
        });
      }
    }
  });

  // Jika tarikh yang dipilih sepadan dengan tarikh draf di Page 1, gabungkan input semasa
  if (selectedDate === (dateInput ? dateInput.value : "")) {
    [...teachersContainer.querySelectorAll(".teacher-row")].forEach(r => {
      const g = r.querySelector(".teacher-select") ? r.querySelector(".teacher-select").value : "";
      if (g) absTeachersSet.add(g);
    });
    [...entryRows.querySelectorAll(".schedule-row")].forEach(row => {
      const m = row.querySelector(".row-masa") ? row.querySelector(".row-masa").value.trim() : "";
      const s = row.querySelector(".row-subjek") ? row.querySelector(".row-subjek").value.trim() : "";
      const k = row.querySelector(".row-kelas") ? row.querySelector(".row-kelas").value.trim() : "";
      const g = row.querySelector(".row-ganti") ? row.querySelector(".row-ganti").value.trim() : "";
      const orig = row.dataset.guruTidakHadir || "";
      if (g && m && !isSpecialProgramRelief(g)) {
        if (!reliefAssignments[g]) reliefAssignments[g] = [];
        const exists = reliefAssignments[g].some(item => item.masa === m && item.kelas === k);
        if (!exists) {
          reliefAssignments[g].push({ masa: m, subjek: s, kelas: k, guruAsal: orig });
        }
      }
    });
  }

  const absentTeachers = Array.from(absTeachersSet);

  // Kumpulan Bertugas: utamakan rekod tersimpan bagi tarikh berkenaan, fallback ke pilihan dropdown
  let dutyGroup = kumpulanSelect ? kumpulanSelect.value : "";
  if (dateRecords.length > 0 && dateRecords[0].kumpulan) {
    dutyGroup = dateRecords[0].kumpulan;
  }
  const dutyList = dutyGroup && TEACHER_GROUPS[dutyGroup] ? TEACHER_GROUPS[dutyGroup] : [];

  if (!MASTER_TEACHERS || MASTER_TEACHERS.length === 0) {
    container.innerHTML = `
      <div class="col-span-full empty-state-cheerful" style="margin:1rem 0;">
        <div class="empty-state-icon-wrap">
          <i data-lucide="users" style="width:28px;height:28px;"></i>
        </div>
        <h4 style="font-weight:800; font-size:1.1rem; color:var(--text-primary); margin-bottom:0.4rem;">
          Belum Ada Senarai Guru &amp; Jadual Guru Didaftarkan
        </h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); max-width:540px; margin:0 auto 1.25rem; line-height:1.6;">
          Sila isi tab <strong>Senarai_Guru</strong> dan <strong>Jadual_Waktu</strong> di dalam Google Sheet sekolah anda atau import fail CSV di halaman <strong>Urus &amp; Import Jadual</strong>.
        </p>
        <button type="button" class="action-btn btn-primary" onclick="document.querySelector('[data-page=page-import]').click()" style="margin:0 auto; display:inline-flex;">
          <i data-lucide="database" style="width:16px;height:16px"></i> Pergi ke Urus &amp; Import Jadual
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const gb = [], gbl = [], gtb = [];
  MASTER_TEACHERS.forEach(g => {
    if (dutyList.includes(g)) {
      absentTeachers.includes(g) ? gbl.push(g) : gb.push(g);
    } else {
      gtb.push(g);
    }
  });

  const sortFn = (a, b) => countPeriods(a, selectedDay) - countPeriods(b, selectedDay);
  gb.sort(sortFn);
  gbl.sort(sortFn);
  gtb.sort(sortFn);

  function renderGroupSection(label, teachers, headerColor) {
    if (!teachers.length) return;

    const sectionBox = document.createElement("div");
    sectionBox.className = "guru-section-box";

    const dotColor = headerColor.includes('blue') ? '#2563eb' : (headerColor.includes('amber') ? '#d97706' : '#64748b');
    const textColor = headerColor.includes('blue') ? '#1d4ed8' : (headerColor.includes('amber') ? '#b45309' : 'var(--text-primary)');

    const header = document.createElement("div");
    header.className = "guru-section-header";
    header.innerHTML = `
      <span style="width:10px; height:10px; border-radius:50%; background:${dotColor}; display:inline-block; flex-shrink:0;"></span>
      <h3 class="guru-section-title" style="color:${textColor}; margin:0;">${label}</h3>
      <span style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); margin-left:auto;">(${teachers.length} Orang Guru)</span>
    `;
    sectionBox.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "guru-cards-grid";

    teachers.forEach(guru => {
      const col = getTeacherColor(guru);
      const card = document.createElement("div");
      card.className = "guru-card tt-clickable-card";
      card.style.border = `1.5px solid ${col.border}`;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("title", `Klik untuk besarkan Jadual ${guru}`);

      const isAbs = absentTeachers.includes(guru);
      const headerExtra = isAbs ? ' <span style="font-size:11px; background:#ef4444; color:#ffffff; padding:2px 8px; border-radius:9999px; font-weight:700; margin-left:6px;">Tidak Hadir</span>' : '';
      const totalPeriods = countPeriods(guru, selectedDay);

      let html = `<div class="guru-card-header" style="background:${col.primary}; color:#ffffff; display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">` +
        `<span style="font-weight:700; font-size:0.88rem;">${guru}${headerExtra}</span>` +
        `<div style="display:flex; align-items:center; gap:0.45rem;">` +
        `<span style="font-size:11px; background:rgba(255,255,255,0.22); color:#ffffff; padding:3px 9px; border-radius:9999px; font-weight:700;">${totalPeriods} Waktu</span>` +
        `<button type="button" class="tt-expand-indicator" title="Besarkan Paparan Jadual" aria-label="Besarkan">` +
        `<i data-lucide="maximize-2" style="width:13px;height:13px;"></i>` +
        `</button>` +
        `</div>` +
        `</div><div style="overflow-x:auto;"><table class="tt-table"><thead><tr><th>Masa</th><th>Subjek</th><th>Kelas</th><th>Status</th></tr></thead><tbody>`;

      const teacherSlots = {};
      if (TIMETABLE[guru] && TIMETABLE[guru][selectedDay]) {
        TIMETABLE[guru][selectedDay].forEach(([m, s, k]) => {
          splitTimeSlot(m).forEach(slotTime => {
            const idx = STANDARD_SLOTS.indexOf(slotTime);
            if (idx >= 0) teacherSlots[idx] = { subjek: s, kelas: k };
          });
        });
      }

      const reliefSlots = {};
      (reliefAssignments[guru] || []).forEach(r => {
        const idx = STANDARD_SLOTS.indexOf(r.masa);
        if (idx >= 0) reliefSlots[idx] = r;
      });

      for (let si = 1; si <= 13; si++) {
        if (si === 6) continue; // Rehat
        const slotTime = STANDARD_SLOTS[si];
        const hasOwnClass = teacherSlots[si];
        const hasRelief = reliefSlots[si];

        if (hasRelief && !hasOwnClass) {
          html += `<tr style="background:#fecaca!important"><td class="font-mono text-[10px]">${slotTime}</td><td class="font-bold text-red-900">${hasRelief.subjek}</td><td class="text-red-900 font-semibold">${hasRelief.kelas}</td><td class="text-[10px] font-bold text-red-900">Ganti ${hasRelief.guruAsal}</td></tr>`;
        } else if (hasRelief && hasOwnClass) {
          html += `<tr style="background:#fed7aa!important"><td class="font-mono text-[10px]">${slotTime}</td><td class="font-bold text-amber-900">${hasOwnClass.subjek} / ${hasRelief.subjek}</td><td class="text-amber-900">${hasOwnClass.kelas} [BERTINDIH GANTI]</td><td class="text-[10px] font-bold text-red-800">AMARAN CLASH!</td></tr>`;
        } else if (hasOwnClass) {
          html += `<tr class="bg-blue-50/70 dark:bg-blue-950/40"><td class="font-mono text-[10px]">${slotTime}</td><td class="font-bold">${hasOwnClass.subjek}</td><td>${hasOwnClass.kelas}</td><td class="text-[10px] text-slate-600 dark:text-slate-400">Kelas Sendiri</td></tr>`;
        } else {
          html += `<tr class="guru-free"><td class="font-mono text-[10px]">${slotTime}</td><td colspan="2" class="text-center italic text-green-700 dark:text-green-400">Tiada Kelas</td><td>—</td></tr>`;
        }
      }

      html += `</tbody></table></div>`;
      card.innerHTML = html;

      // Klik mana-mana kad guru untuk timbul & dibesarkan di tengah skrin
      card.addEventListener("click", () => {
        const table = card.querySelector("table");
        if (!table) return;
        const extraBadgeHtml = isAbs ? '<span style="font-size:11px; background:#ef4444; color:#ffffff; padding:3px 9px; border-radius:9999px; font-weight:700;">Tidak Hadir</span>' : '';
        const dInfo = formattedDate ? `${selectedDay}, ${formattedDate}` : selectedDay;
        openEnlargedScheduleModal({
          type: "guru",
          title: guru,
          subtitle: `Jadual Persendirian Guru & Tugasan Pengganti (${dInfo})`,
          tag: `${totalPeriods} Waktu Mengajar`,
          extraBadgeHtml: extraBadgeHtml,
          headerBg: col.primary,
          icon: "user",
          tableHtml: table.outerHTML
        });
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });

      grid.appendChild(card);
    });

    sectionBox.appendChild(grid);
    container.appendChild(sectionBox);
  }

  renderGroupSection("Guru Bertugas", gb, "text-blue-700 dark:text-blue-400");
  renderGroupSection("Guru Bertugas (Tidak Hadir)", gbl, "text-amber-700 dark:text-amber-400");
  renderGroupSection("Guru Tidak Bertugas", gtb, "text-slate-600 dark:text-slate-400");

  if (window.lucide) window.lucide.createIcons();
}

// PAGE 5: Statistik & Laporan
function getFilteredRecords() {
  const bulanVal = document.getElementById("stat-bulan-filter") ? document.getElementById("stat-bulan-filter").value : "";
  const mingguVal = document.getElementById("stat-minggu-filter") ? document.getElementById("stat-minggu-filter").value : "";

  return allRecords.filter(r => {
    if (!r) return false;

    // Tapis Bulan jika dipilih
    if (bulanVal) {
      if (!r.tarikh) return false;
      const parts = r.tarikh.split('-');
      if (parts.length < 2) return false;
      const monthNum = parseInt(parts[1], 10);
      if (monthNum !== parseInt(bulanVal, 10)) return false;
    }

    // Tapis Minggu jika dipilih
    if (mingguVal) {
      if (r.minggu !== mingguVal) return false;
    }

    return true;
  });
}

function updateMonthlyPdfButtonLabel() {
  const bulanVal = document.getElementById("stat-bulan-filter") ? document.getElementById("stat-bulan-filter").value : "";
  const btnLabel = document.getElementById("monthly-pdf-btn-label");
  if (btnLabel) {
    if (bulanVal && MALAY_MONTHS[parseInt(bulanVal, 10) - 1]) {
      btnLabel.textContent = `Laporan Bulanan PDF (${MALAY_MONTHS[parseInt(bulanVal, 10) - 1]})`;
    } else {
      btnLabel.textContent = "Laporan Bulanan PDF";
    }
  }
}

function renderPage5() {
  const mingguFilter = document.getElementById("stat-minggu-filter");
  const recordedWeeks = new Set(allRecords.map(r => r.minggu).filter(Boolean));
  const currentMinggu = mingguFilter.value;

  mingguFilter.innerHTML = '<option value="">Semua Minggu</option>';
  if (recordedWeeks.size > 0) {
    [...recordedWeeks].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    }).forEach(w => {
      mingguFilter.innerHTML += `<option value="${w}">${w}</option>`;
    });
  } else {
    for (let i = 1; i <= 42; i++) {
      mingguFilter.innerHTML += `<option value="Minggu ${i}">Minggu ${i}</option>`;
    }
  }
  if (currentMinggu) mingguFilter.value = currentMinggu;

  updateStatCards();
  renderWeeklyReport();
  renderGoogleSheetRecordsTable();
  updateMonthlyPdfButtonLabel();
}

function updateStatCards() {
  const filtered = getFilteredRecords();
  const bulanVal = document.getElementById("stat-bulan-filter") ? document.getElementById("stat-bulan-filter").value : "";
  const mingguVal = document.getElementById("stat-minggu-filter") ? document.getElementById("stat-minggu-filter").value : "";

  document.getElementById("stat-total-records").textContent = filtered.length;
  const uniqueAbsent = new Set(filtered.map(r => r.guru_tidak_hadir).filter(Boolean));
  document.getElementById("stat-total-absent").textContent = uniqueAbsent.size;
  document.getElementById("stat-total-replaced").textContent = filtered.filter(r => r.guru_ganti && !isSpecialProgramRelief(r.guru_ganti)).length;

  const countMap = {};
  filtered.forEach(r => {
    if (r.guru_ganti && !isSpecialProgramRelief(r.guru_ganti)) countMap[r.guru_ganti] = (countMap[r.guru_ganti] || 0) + 1;
  });
  const top = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("stat-top-guru").textContent = top ? `${top[0]} (${top[1]})` : "—";

  // Label penapis aktif di badge
  const badgeLabel = document.getElementById("stat-filter-label");
  if (badgeLabel) {
    let text = "Semua Bulan";
    if (bulanVal && MALAY_MONTHS[parseInt(bulanVal, 10) - 1]) {
      text = `Bulan: ${MALAY_MONTHS[parseInt(bulanVal, 10) - 1]}`;
    }
    if (mingguVal) {
      text += ` • ${mingguVal}`;
    }
    badgeLabel.textContent = text;
  }
}

// Pendengar acara penapis Bulan & Minggu
const statBulanFilter = document.getElementById("stat-bulan-filter");
if (statBulanFilter) {
  statBulanFilter.addEventListener("change", () => {
    updateStatCards();
    renderWeeklyReport();
    renderGoogleSheetRecordsTable();
    updateMonthlyPdfButtonLabel();
  });
}

const statMingguFilter = document.getElementById("stat-minggu-filter");
if (statMingguFilter) {
  statMingguFilter.addEventListener("change", () => {
    updateStatCards();
    renderWeeklyReport();
    renderGoogleSheetRecordsTable();
  });
}

function renderWeeklyReport() {
  const filtered = getFilteredRecords();
  const container = document.getElementById("weekly-report-container");
  if (!container) return;

  if (!filtered.length) {
    const bulanVal = document.getElementById("stat-bulan-filter") ? document.getElementById("stat-bulan-filter").value : "";
    const bulanNama = bulanVal ? MALAY_MONTHS[parseInt(bulanVal, 10) - 1] : "";
    const infoBulan = bulanNama ? `bagi bulan <strong>${bulanNama}</strong>` : "buat masa ini";

    container.innerHTML = `
      <div class="empty-state-cheerful">
        <div class="empty-state-icon-wrap">
          <i data-lucide="sparkles" style="width:30px;height:30px"></i>
        </div>
        <h4 style="font-weight:800; font-size:1.15rem; color:var(--text-primary); margin-bottom:0.4rem;">
          Belum Ada Rekod Penggantian ${infoBulan}
        </h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); max-width:540px; margin:0 auto 1.5rem; line-height:1.6;">
          Sistem sedia untuk beroperasi. Rekod penggantian dan analisis beban tugas guru ganti akan terpapar di sini secara automatik sebaik sahaja borang di Halaman Kemasukan disimpan.
        </p>
        <button type="button" class="action-btn btn-primary" onclick="document.querySelector('[data-page=page1]').click()" style="margin:0 auto; display:inline-flex;">
          <i data-lucide="plus-circle" style="width:16px;height:16px"></i> Pergi ke Halaman Kemasukan (Page 1)
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Kumpulkan rekod mengikut Minggu
  const weekGroups = {};
  filtered.forEach(r => {
    const w = r.minggu || "Lain-lain";
    if (!weekGroups[w]) weekGroups[w] = [];
    weekGroups[w].push(r);
  });

  const sortedWeeks = Object.keys(weekGroups).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  let html = "";
  sortedWeeks.forEach(weekName => {
    const recs = weekGroups[weekName];
    const teacherLoad = {};
    const absentTeachersInWeek = new Set();

    recs.forEach(r => {
      if (r.guru_tidak_hadir) absentTeachersInWeek.add(r.guru_tidak_hadir);
      if (r.guru_ganti && !isSpecialProgramRelief(r.guru_ganti)) {
        if (!teacherLoad[r.guru_ganti]) {
          teacherLoad[r.guru_ganti] = {
            count: 0,
            classes: new Set(),
            subjects: new Set(),
            absentTeachersReplaced: new Set()
          };
        }
        teacherLoad[r.guru_ganti].count++;
        if (r.kelas) teacherLoad[r.guru_ganti].classes.add(r.kelas);
        if (r.mata_pelajaran) teacherLoad[r.guru_ganti].subjects.add(r.mata_pelajaran);
        if (r.guru_tidak_hadir) teacherLoad[r.guru_ganti].absentTeachersReplaced.add(r.guru_tidak_hadir);
      }
    });

    const sortedTeachers = Object.entries(teacherLoad).sort((a, b) => b[1].count - a[1].count);

    html += `
      <div class="weekly-week-card">
        <div class="weekly-week-header">
          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
            <span class="weekly-week-pill">
              <i data-lucide="calendar" style="width:14px;height:14px"></i>
              ${weekName}
            </span>
            <span style="font-size:0.82rem; font-weight:700; color:var(--text-secondary);">
              ${recs.length} Waktu Penggantian
            </span>
          </div>
          <div style="display:flex; gap:0.6rem; align-items:center; font-size:0.78rem; font-weight:600; color:var(--text-muted);">
            <span>${sortedTeachers.length} Guru Ganti Terlibat</span>
            <span>•</span>
            <span style="color:#e11d48;">${absentTeachersInWeek.size} Guru Tidak Hadir</span>
          </div>
        </div>

        <div class="weekly-teacher-grid">
    `;

    sortedTeachers.forEach(([guruName, data]) => {
      const palette = getTeacherColor(guruName);
      const initials = guruName.split(" ").filter(w => !["En.", "Pn.", "Cik", "Ustaz", "Ustazah", "Hj.", "Datin"].includes(w)).slice(0, 2).map(w => w[0]).join("") || guruName.slice(0, 2);

      const count = data.count;
      const maxWeekly = APP_CONFIG.overloadThresholdWeekly || 8;
      const percent = Math.min(100, Math.round((count / maxWeekly) * 100));

      let statusBadge = "";
      let barColor = "";

      if (count >= maxWeekly) {
        statusBadge = `<span class="status-badge-danger"><i data-lucide="alert-triangle" style="width:13px;height:13px"></i> Beban Tinggi (${count} Waktu)</span>`;
        barColor = "linear-gradient(90deg, #f43f5e, #e11d48)";
      } else if (count >= maxWeekly * 0.6) {
        statusBadge = `<span class="status-badge-warning"><i data-lucide="zap" style="width:13px;height:13px"></i> Sederhana (${count} Waktu)</span>`;
        barColor = "linear-gradient(90deg, #fbbf24, #f59e0b)";
      } else {
        statusBadge = `<span class="status-badge-safe"><i data-lucide="check" style="width:13px;height:13px"></i> Terkawal (${count} Waktu)</span>`;
        barColor = "linear-gradient(90deg, #34d399, #10b981)";
      }

      const classList = [...data.classes].join(", ");
      const subjectList = [...data.subjects].join(", ");
      const subInfo = [
        subjectList ? `Subjek: <strong>${subjectList}</strong>` : "",
        classList ? `Kelas: <strong>${classList}</strong>` : ""
      ].filter(Boolean).join(" • ");

      html += `
        <div class="weekly-teacher-item">
          <!-- Avatar & Nama Guru -->
          <div style="display:flex; align-items:center; gap:0.85rem; min-width:240px; flex:1;">
            <div class="weekly-teacher-avatar" style="background:${palette.bg}; color:${palette.text}; border:2px solid ${palette.border};">
              ${initials}
            </div>
            <div>
              <div style="font-weight:800; font-size:0.95rem; color:var(--text-primary); display:flex; align-items:center; gap:0.4rem;">
                ${guruName}
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                ${subInfo || "Penggantian kelas berjadual"}
              </div>
            </div>
          </div>

          <!-- Bar Visual Meter Beban Tugas -->
          <div class="load-meter-container">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-size:0.72rem; font-weight:700; color:var(--text-muted);">
              <span>Beban: ${count}/${maxWeekly} waktu</span>
              <span>${percent}%</span>
            </div>
            <div class="load-meter-track">
              <div class="load-meter-fill" style="width:${percent}%; background:${barColor};"></div>
            </div>
          </div>

          <!-- Jumlah & Lencana Status -->
          <div style="display:flex; align-items:center; gap:0.75rem; min-width:180px; justify-content:flex-end;">
            <div style="font-family:ui-monospace, monospace; font-size:1.15rem; font-weight:800; color:var(--text-primary); text-align:right;">
              ${count} <span style="font-size:0.72rem; font-weight:600; color:var(--text-secondary);">waktu</span>
            </div>
            ${statusBadge}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Memaparkan Jadual Terperinci Semua Rekod Penggantian daripada Google Sheet
 */
function renderGoogleSheetRecordsTable() {
  const tbody = document.getElementById("tbody-google-sheet-records");
  if (!tbody) return;

  const filtered = getFilteredRecords();
  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted); font-size:0.875rem;">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--bg-subtle); display:flex; align-items:center; justify-content:center; margin:0 auto 0.75rem;">
            <i data-lucide="inbox" style="width:24px;height:24px; opacity:0.6;"></i>
          </div>
          <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.25rem;">Tiada Rekod Penggantian Ditemui</div>
          <div>Sila pilih "Semua Bulan" pada penapis di atas untuk melihat kesemua rekod Google Sheet.</div>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = "";
  filtered.forEach((r, idx) => {
    const formattedDate = formatDateDisplay(r.tarikh);
    const dayName = r.hari || getDayFromDate(r.tarikh) || "—";
    const waktuMasa = r.masa ? `${r.masa}` : (r.slot ? `Slot ${r.slot}` : "—");
    const kelasSubjek = [r.kelas, r.mata_pelajaran].filter(Boolean).join(" • ") || "—";

    html += `
      <tr style="border-bottom:1px solid var(--border-subtle); transition:background 0.15s ease;">
        <td style="padding:0.75rem 1rem; font-weight:700; color:var(--text-muted); text-align:center;">${idx + 1}</td>
        <td style="padding:0.75rem 1rem; font-weight:700; color:var(--text-primary); white-space:nowrap;">
          <div>${formattedDate}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">${dayName}</div>
        </td>
        <td style="padding:0.75rem 1rem; font-weight:600; white-space:nowrap;">
          <span style="background:#eef2ff; color:#4338ca; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; border:1px solid #c7d2fe;">
            ${r.minggu || "—"}
          </span>
        </td>
        <td style="padding:0.75rem 1rem; font-weight:700; color:#e11d48; white-space:nowrap;">
          ${r.guru_tidak_hadir || "—"}
        </td>
        <td style="padding:0.75rem 1rem; font-size:0.78rem; color:var(--text-secondary); max-width:200px;">
          <span style="background:#fef2f2; color:#991b1b; padding:2px 6px; border-radius:4px; font-weight:600; font-size:0.72rem; border:1px solid #fecaca; display:inline-block;">
            ${r.sebab || "—"}
          </span>
        </td>
        <td style="padding:0.75rem 1rem; font-weight:600; color:var(--text-primary); white-space:nowrap;">
          ${waktuMasa}
        </td>
        <td style="padding:0.75rem 1rem; font-weight:700; color:var(--text-primary);">
          ${kelasSubjek}
        </td>
        <td style="padding:0.75rem 1rem; font-weight:800; color:#059669; white-space:nowrap;">
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <i data-lucide="check-circle" style="width:14px;height:14px; color:#10b981;"></i>
            <span>${r.guru_ganti || "—"}</span>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

// PAGE 6: Sejarah Rekod
// =========================================================
// PAGE 6: Kehadiran Guru & Pemantauan Pentadbir
// =========================================================
let selectedAttDate = null;
let selectedAttFilter = "all";
let attSearchQuery = "";

function getReasonBadgeInfo(reason) {
  if (!reason) return { cls: "reason-default", icon: "help-circle", label: "Tidak Dinyatakan" };
  const r = reason.trim();
  if (r.includes("MC") || r.includes("Sakit")) return { cls: "reason-mc", icon: "activity", label: r };
  if (r.includes("CRK")) return { cls: "reason-crk", icon: "coffee", label: r };
  if (r.includes("CR") && !r.includes("CRK") && !r.includes("CTR")) return { cls: "reason-cr", icon: "calendar", label: r };
  if (r.includes("CTR")) return { cls: "reason-ctr", icon: "file-text", label: r };
  if (r.includes("Mesyuarat") || r.includes("Bengkel")) return { cls: "reason-meeting", icon: "briefcase", label: r };
  if (r.includes("Tugas Luar")) return { cls: "reason-duty", icon: "car", label: r };
  if (r.includes("Kursus")) return { cls: "reason-course", icon: "award", label: r };
  if (r.includes("Bersalin")) return { cls: "reason-maternity", icon: "heart", label: r };
  if (r.includes("Umrah") || r.includes("Haji")) return { cls: "reason-pilgrimage", icon: "compass", label: r };
  if (r.includes("Program Rasmi")) return { cls: "reason-official", icon: "clipboard-list", label: r };
  return { cls: "reason-default", icon: "info", label: r };
}

function getTeacherGroup(name) {
  for (const [grp, members] of Object.entries(TEACHER_GROUPS)) {
    if (members.includes(name)) return grp;
  }
  return "Guru Sekolah";
}

function renderPage6() {
  if (!selectedAttDate) {
    selectedAttDate = dateInput && dateInput.value ? dateInput.value : getLocalDateString();
  }

  const attDateInput = document.getElementById("att-date");
  if (attDateInput) {
    attDateInput.value = selectedAttDate;
  }

  // Isi dropdown minggu pada arkib sejarah jika belum diisi
  const histMinggu = document.getElementById("hist-minggu");
  if (histMinggu) {
    const recordedWeeks = new Set(allRecords.map(r => r.minggu).filter(Boolean));
    histMinggu.innerHTML = '<option value="">Semua Minggu</option>' +
      [...recordedWeeks].sort((a, b) => (parseInt(a.replace(/\D/g, '')) || 0) - (parseInt(b.replace(/\D/g, '')) || 0))
        .map(w => `<option value="${w}">${w}</option>`).join("");
  }

  renderDailyAttendance(selectedAttDate);
  renderAttendanceArchive();
  setupAttendanceEventListenersOnce();
}

function renderDailyAttendance(dateStr) {
  if (!dateStr) return;
  selectedAttDate = dateStr;

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d, 12, 0, 0);
  const dayName = MALAY_DAYS[dateObj.getDay()] || "";
  const formattedDate = formatDateDisplay(dateStr);

  const labelEl = document.getElementById("att-date-display-label");
  if (labelEl) {
    labelEl.textContent = `${dayName}, ${formattedDate}`;
  }

  const attDateInput = document.getElementById("att-date");
  if (attDateInput && attDateInput.value !== dateStr) {
    attDateInput.value = dateStr;
  }

  // Ekstrak rekod bagi tarikh ini daripada allRecords
  const dayRecords = allRecords.filter(r => r && r.tarikh === dateStr);
  const absentMap = {}; // teacherName -> { sebab, records: [] }
  const reliefMap = {}; // teacherName -> []

  dayRecords.forEach(r => {
    if (r.guru_tidak_hadir) {
      if (!absentMap[r.guru_tidak_hadir]) {
        absentMap[r.guru_tidak_hadir] = { sebab: r.sebab || "Tidak Dinyatakan", records: [] };
      }
      absentMap[r.guru_tidak_hadir].records.push(r);
    }
    if (r.guru_ganti && !isSpecialProgramRelief(r.guru_ganti)) {
      if (!reliefMap[r.guru_ganti]) reliefMap[r.guru_ganti] = [];
      reliefMap[r.guru_ganti].push(r);
    }
  });

  const totalTeachers = MASTER_TEACHERS.length;
  const absentCount = Object.keys(absentMap).length;
  const presentCount = totalTeachers - absentCount;
  const reliefPeriodCount = dayRecords.filter(r => r.guru_ganti && !isSpecialProgramRelief(r.guru_ganti)).length;

  const presentPct = totalTeachers > 0 ? Math.round((presentCount / totalTeachers) * 100) : 100;
  const absentPct = totalTeachers > 0 ? Math.round((absentCount / totalTeachers) * 100) : 0;

  // Kemas kini KPI Statistik
  const kpiTotal = document.getElementById("kpi-total-teachers");
  const kpiPresent = document.getElementById("kpi-present-count");
  const kpiPresentPct = document.getElementById("kpi-present-pct");
  const kpiAbsent = document.getElementById("kpi-absent-count");
  const kpiAbsentPct = document.getElementById("kpi-absent-pct");
  const kpiRelief = document.getElementById("kpi-relief-periods");

  if (kpiTotal) kpiTotal.textContent = totalTeachers;
  if (kpiPresent) kpiPresent.textContent = presentCount;
  if (kpiPresentPct) kpiPresentPct.textContent = `(${presentPct}%)`;
  if (kpiAbsent) kpiAbsent.textContent = absentCount;
  if (kpiAbsentPct) kpiAbsentPct.textContent = `(${absentPct}%)`;
  if (kpiRelief) kpiRelief.textContent = `${reliefPeriodCount} Waktu`;

  // Kemas kini nombor pada tab penapis
  const cntAll = document.getElementById("filter-count-all");
  const cntAbsent = document.getElementById("filter-count-absent");
  const cntPresent = document.getElementById("filter-count-present");
  const cntRelief = document.getElementById("filter-count-relief");

  if (cntAll) cntAll.textContent = totalTeachers;
  if (cntAbsent) cntAbsent.textContent = absentCount;
  if (cntPresent) cntPresent.textContent = presentCount;
  if (cntRelief) cntRelief.textContent = Object.keys(reliefMap).length;

  // Susun senarai guru
  let teachersToDisplay = MASTER_TEACHERS.map(nama => {
    const isAbsent = !!absentMap[nama];
    const isRelief = !!reliefMap[nama];
    const absentInfo = absentMap[nama] || null;
    const reliefList = reliefMap[nama] || [];
    const kumpulan = getTeacherGroup(nama);
    const color = getTeacherColor(nama);
    return {
      nama,
      isAbsent,
      isRelief,
      absentInfo,
      reliefList,
      kumpulan,
      color
    };
  });

  // Tapis mengikut tab status
  if (selectedAttFilter === "absent") {
    teachersToDisplay = teachersToDisplay.filter(t => t.isAbsent);
  } else if (selectedAttFilter === "present") {
    teachersToDisplay = teachersToDisplay.filter(t => !t.isAbsent);
  } else if (selectedAttFilter === "relief") {
    teachersToDisplay = teachersToDisplay.filter(t => t.isRelief);
  }

  // Tapis mengikut kotak carian
  if (attSearchQuery) {
    const q = attSearchQuery.toLowerCase();
    teachersToDisplay = teachersToDisplay.filter(t =>
      t.nama.toLowerCase().includes(q) ||
      (t.absentInfo && t.absentInfo.sebab.toLowerCase().includes(q)) ||
      t.kumpulan.toLowerCase().includes(q)
    );
  }

  // Urutan paparan: Guru tidak hadir dahulu, kemudian guru ganti, kemudian nama A-Z
  teachersToDisplay.sort((a, b) => {
    if (a.isAbsent && !b.isAbsent) return -1;
    if (!a.isAbsent && b.isAbsent) return 1;
    if (a.isRelief && !b.isRelief) return -1;
    if (!a.isRelief && b.isRelief) return 1;
    return a.nama.localeCompare(b.nama);
  });

  const rosterContainer = document.getElementById("attendance-roster-container");
  const rosterEmpty = document.getElementById("attendance-roster-empty");

  if (!rosterContainer) return;

  if (!teachersToDisplay.length) {
    rosterContainer.innerHTML = "";
    if (rosterEmpty) {
      rosterEmpty.className = "empty-state-cheerful";
      rosterEmpty.innerHTML = `
        <div class="empty-state-icon-wrap" style="background:#eff6ff; color:#2563eb; border-color:#bfdbfe;">
          <i data-lucide="search" style="width:26px;height:26px;"></i>
        </div>
        <h4 style="font-weight:800; font-size:1.05rem; color:var(--text-primary); margin-bottom:4px;">Tiada Rekod Ditemui</h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); max-width:420px; margin:0 auto;">
          Tiada guru yang sepadan dengan penapis atau carian bagi tarikh ${formattedDate}.
        </p>
      `;
      rosterEmpty.classList.remove("hidden");
      if (window.lucide) window.lucide.createIcons();
    }
    return;
  }

  if (rosterEmpty) rosterEmpty.classList.add("hidden");

  let html = `<div class="att-roster-grid">`;

  teachersToDisplay.forEach(t => {
    const cardClass = t.isAbsent ? "att-card-absent" : "att-card-present";
    const statusBadge = t.isAbsent
      ? `<span class="att-status-badge att-status-absent"><i data-lucide="x-circle" style="width:13px;height:13px"></i> Tidak Hadir</span>`
      : `<span class="att-status-badge att-status-present"><i data-lucide="check-circle" style="width:13px;height:13px"></i> Hadir Bertugas</span>`;

    let reasonBadgeHtml = "";
    let affectedSlotsHtml = "";
    if (t.isAbsent && t.absentInfo) {
      const bInfo = getReasonBadgeInfo(t.absentInfo.sebab);
      reasonBadgeHtml = `
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <span class="att-reason-pill ${bInfo.cls}">
            <i data-lucide="${bInfo.icon}" style="width:13px;height:13px"></i>
            <span>${bInfo.label}</span>
          </span>
        </div>
      `;

      if (t.absentInfo.records.length > 0) {
        const isAllProg = t.absentInfo.records.every(r => isSpecialProgramRelief(r.guru_ganti));
        const headerTitle = isAllProg
          ? `Status PdP Guru: Program Sekolah (${t.absentInfo.records.length} Waktu)`
          : `Waktu Kelas Diganti (${t.absentInfo.records.length} Waktu)`;

        affectedSlotsHtml = `
          <div class="att-relief-box">
            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:10.5px; color:var(--text-secondary); margin-bottom:5px; text-transform:uppercase;">
              <span>${headerTitle}</span>
              <span>Status / Guru Pengganti</span>
            </div>
            ${t.absentInfo.records.map(r => `
              <div class="att-relief-slot-item">
                <div>
                  <span class="att-slot-time">${r.masa}</span>
                  <span style="font-weight:700; margin-left:4px;">${r.mata_pelajaran}</span>
                  <span style="color:var(--text-secondary); font-size:10.5px;">(${r.kelas})</span>
                </div>
                <div style="font-weight:800; font-size:11px;" class="dark:text-blue-400">
                  ${r.guru_ganti ? (
                    isSpecialProgramRelief(r.guru_ganti)
                      ? `<span class="badge-tag-program">🏛️ ${r.guru_ganti}</span>`
                      : `<span style="color:#1d4ed8;"><i data-lucide="refresh-cw" style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> ${r.guru_ganti}</span>`
                  ) : '<span style="color:#ef4444;">Belum Ditugaskan</span>'}
                </div>
              </div>
            `).join("")}
          </div>
        `;
      } else {
        affectedSlotsHtml = `
          <div style="font-size:11px; color:var(--text-secondary); font-style:italic; padding:4px 0;">
            Tiada waktu pengajaran kelas rasmi dijadualkan bagi guru ini pada hari ini.
          </div>
        `;
      }
    }

    let reliefStatusHtml = "";
    if (!t.isAbsent && t.isRelief) {
      reliefStatusHtml = `
        <div class="att-relief-duty-box">
          <div style="display:flex; align-items:center; gap:0.35rem; font-weight:800; color:#7c3aed; margin-bottom:4px;" class="dark:text-purple-300">
            <i data-lucide="repeat" style="width:13px;height:13px"></i>
            <span>Bertugas Ganti Hari Ini (${t.reliefList.length} Waktu):</span>
          </div>
          ${t.reliefList.map(r => `
            <div style="display:flex; justify-content:space-between; padding:2px 0; color:var(--text-primary);">
              <span><span class="att-slot-time" style="margin-right:4px;">${r.masa}</span> ${r.mata_pelajaran} (${r.kelas})</span>
              <span style="color:var(--text-secondary); font-size:10.5px;">Ganti: ${r.guru_tidak_hadir}</span>
            </div>
          `).join("")}
        </div>
      `;
    } else if (!t.isAbsent) {
      reliefStatusHtml = `
        <div style="display:flex; align-items:center; gap:0.4rem; font-size:11px; color:var(--text-secondary);">
          <i data-lucide="check" style="width:13px;height:13px; color:#10b981;"></i>
          <span>Menjalankan jadual pengajaran waktu rasmi sekolah.</span>
        </div>
      `;
    }

    html += `
      <div class="att-teacher-card ${cardClass}">
        <div class="att-teacher-header">
          <div style="display:flex; align-items:center; gap:0.75rem; min-width:0;">
            <div class="att-teacher-avatar" style="background:${t.color.bg}; color:${t.color.text}; border:1.5px solid ${t.color.border};">
              ${t.nama.charAt(0).toUpperCase()}
            </div>
            <div style="min-width:0;">
              <h4 style="font-weight:800; font-size:0.92rem; color:var(--text-primary); line-height:1.2;" class="truncate" title="${t.nama}">
                ${t.nama}
              </h4>
              <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px; font-weight:600;">
                ${t.kumpulan}
              </p>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        ${reasonBadgeHtml}
        ${affectedSlotsHtml}
        ${reliefStatusHtml}
      </div>
    `;
  });

  html += `</div>`;
  rosterContainer.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

function renderAttendanceArchive() {
  const container = document.getElementById("attendance-archive-container");
  const empty = document.getElementById("attendance-archive-empty");
  if (!container) return;

  const mingguVal = document.getElementById("hist-minggu") ? document.getElementById("hist-minggu").value : "";
  const sebabVal = document.getElementById("hist-sebab-filter") ? document.getElementById("hist-sebab-filter").value : "";

  // Kumpulkan rekod mengikut tarikh
  const dateGroups = {};
  allRecords.forEach(r => {
    if (!r || !r.tarikh) return;
    if (mingguVal && r.minggu !== mingguVal) return;
    if (sebabVal && r.sebab !== sebabVal) return;

    if (!dateGroups[r.tarikh]) {
      dateGroups[r.tarikh] = {
        tarikh: r.tarikh,
        hari: r.hari || getDayFromDate(r.tarikh),
        minggu: r.minggu || "—",
        records: []
      };
    }
    dateGroups[r.tarikh].records.push(r);
  });

  const sortedDates = Object.values(dateGroups).sort((a, b) => b.tarikh.localeCompare(a.tarikh));

  if (!sortedDates.length) {
    container.innerHTML = "";
    if (empty) {
      empty.className = "empty-state-cheerful";
      empty.innerHTML = `
        <div class="empty-state-icon-wrap" style="background:#eff6ff; color:#2563eb; border-color:#bfdbfe;">
          <i data-lucide="archive" style="width:26px;height:26px;"></i>
        </div>
        <h4 style="font-weight:800; font-size:1.05rem; color:var(--text-primary); margin-bottom:4px;">Tiada Arkib Ditemui</h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); max-width:420px; margin:0 auto;">
          Belum ada rekod ketidakhadiran guru yang disimpan bagi tapisan yang dipilih.
        </p>
      `;
      empty.classList.remove("hidden");
      if (window.lucide) window.lucide.createIcons();
    }
    return;
  }

  if (empty) empty.classList.add("hidden");

  let html = "";
  sortedDates.forEach(d => {
    const absentTeachersMap = {};
    d.records.forEach(r => {
      if (r.guru_tidak_hadir) {
        if (!absentTeachersMap[r.guru_tidak_hadir]) {
          absentTeachersMap[r.guru_tidak_hadir] = { sebab: r.sebab, count: 0, replacements: new Set() };
        }
        absentTeachersMap[r.guru_tidak_hadir].count++;
        if (r.guru_ganti) absentTeachersMap[r.guru_tidak_hadir].replacements.add(r.guru_ganti);
      }
    });

    const absentList = Object.entries(absentTeachersMap);

    html += `
      <div class="att-archive-day-card">
        <div class="att-archive-header">
          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
            <span style="background:#1e3a8a; color:#ffffff; font-weight:800; font-size:0.75rem; padding:0.25rem 0.65rem; border-radius:9999px;">
              ${d.hari}
            </span>
            <strong style="font-size:0.95rem; color:var(--text-primary); font-family:'Plus Jakarta Sans',sans-serif;">
              ${formatDateDisplay(d.tarikh)}
            </strong>
            <span style="font-size:0.78rem; color:var(--text-secondary); font-weight:600;">
              (${d.minggu})
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
            <span style="font-size:0.8rem; font-weight:700; color:#dc2626;">
              ${absentList.length} Guru Tidak Hadir (${d.records.length} Waktu Diganti)
            </span>
            <button type="button" class="action-btn btn-secondary btn-switch-roster-date" data-tarikh="${d.tarikh}" style="padding:0.25rem 0.6rem; font-size:11px; font-weight:700;">
              <i data-lucide="eye" style="width:13px;height:13px"></i> Lihat Roster Harian
            </button>
          </div>
        </div>

        <div style="padding:1rem 1.25rem;">
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:0.75rem;">
            ${absentList.map(([nama, info]) => {
              const bInfo = getReasonBadgeInfo(info.sebab);
              return `
                <div style="background:var(--bg-subtle); border:1px solid var(--border-subtle); border-radius:10px; padding:0.65rem 0.85rem; display:flex; flex-direction:column; gap:0.35rem;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
                    <strong style="font-size:0.85rem; color:var(--text-primary);">${nama}</strong>
                    <span class="att-reason-pill ${bInfo.cls}" style="padding:0.2rem 0.5rem; font-size:10px;">
                      <i data-lucide="${bInfo.icon}" style="width:11px;height:11px"></i> ${bInfo.label}
                    </span>
                  </div>
                  <div style="font-size:11px; color:var(--text-secondary);">
                    Jumlah waktu: <strong>${info.count} waktu</strong>
                    ${info.replacements.size ? `<br>Guru ganti: <span style="color:#2563eb; font-weight:700;">${[...info.replacements].join(', ')}</span>` : ''}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();

  // Sambung butang "Lihat Roster Harian"
  container.querySelectorAll(".btn-switch-roster-date").forEach(btn => {
    btn.addEventListener("click", () => {
      const tarikh = btn.dataset.tarikh;
      if (tarikh) {
        selectedAttDate = tarikh;
        renderDailyAttendance(tarikh);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

function printDailyAttendanceReport() {
  if (!selectedAttDate) selectedAttDate = getLocalDateString();
  const dayName = getDayFromDate(selectedAttDate);
  const formattedDate = formatDateDisplay(selectedAttDate);

  const dayRecords = allRecords.filter(r => r && r.tarikh === selectedAttDate);
  const absentMap = {};
  const reliefMap = {};

  dayRecords.forEach(r => {
    if (r.guru_tidak_hadir) {
      if (!absentMap[r.guru_tidak_hadir]) absentMap[r.guru_tidak_hadir] = { sebab: r.sebab, records: [] };
      absentMap[r.guru_tidak_hadir].records.push(r);
    }
    if (r.guru_ganti && !isSpecialProgramRelief(r.guru_ganti)) {
      if (!reliefMap[r.guru_ganti]) reliefMap[r.guru_ganti] = [];
      reliefMap[r.guru_ganti].push(r);
    }
  });

  const totalTeachers = MASTER_TEACHERS.length;
  const absentCount = Object.keys(absentMap).length;
  const presentCount = totalTeachers - absentCount;
  const totalRelief = dayRecords.filter(r => r.guru_ganti && !isSpecialProgramRelief(r.guru_ganti)).length;

  const win = window.open("", "_blank");
  if (!win) {
    showToast("Sila benarkan pop-up pada pelayar web anda untuk mencetak penyata.", "error");
    return;
  }

  win.document.write(`<!DOCTYPE html>
    <html lang="ms">
    <head>
      <meta charset="UTF-8">
      <title>Penyata Harian Kehadiran Guru — ${formattedDate}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #fff; padding: 30px 40px; color: #0f172a; line-height: 1.4; }
        .header { text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
        .school { font-size: 20px; font-weight: 800; color: #1e3a8a; }
        .address { font-size: 11px; color: #475569; font-weight: 600; margin-top: 2px; }
        .title { font-size: 14px; font-weight: 800; color: #1e3a8a; margin-top: 10px; text-transform: uppercase; background: #eff6ff; padding: 6px 16px; border-radius: 6px; display: inline-block; border: 1px solid #bfdbfe; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .kpi-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; background: #f8fafc; }
        .kpi-val { font-size: 18px; font-weight: 800; color: #1e3a8a; font-family: monospace; }
        .kpi-lbl { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 2px; }
        
        .section-title { font-size: 12.5px; font-weight: 800; color: #1e3a8a; margin: 18px 0 8px; border-left: 4px solid #2563eb; padding-left: 8px; text-transform: uppercase; }
        .table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
        .table th, .table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
        .table th { background: #f1f5f9; font-weight: 800; color: #1e3a8a; }
        .table tr:nth-child(even) td { background: #f8fafc; }
        
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 800; }
        .badge-absent { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
        .badge-present { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        
        .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 35px; page-break-inside: avoid; }
        .sign-box { border-top: 1px solid #94a3b8; padding-top: 8px; text-align: center; font-size: 11px; }
        
        .btn-print { background: #059669; color: #fff; border: none; padding: 10px 22px; font-weight: bold; font-size: 13px; border-radius: 8px; cursor: pointer; margin: 0 auto 20px; display: block; }
        @media print { .btn-print { display: none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF Penyata Kehadiran</button>
      <div class="header">
        <div style="display:flex; align-items:center; justify-content:center; gap:16px;">
          <img src="${APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo}" alt="Lencana Rasmi Sekolah" style="width:68px; height:68px; object-fit:contain;">
          <div>
            <div class="school">${APP_CONFIG.schoolName}</div>
            <div class="address">${APP_CONFIG.schoolAddress}</div>
            <div class="title">PENYATA HARIAN KEHADIRAN & GURU GANTI — ${dayName.toUpperCase()}, ${formattedDate.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-box"><div class="kpi-val">${totalTeachers}</div><div class="kpi-lbl">Jumlah Guru</div></div>
        <div class="kpi-box"><div class="kpi-val" style="color:#059669;">${presentCount}</div><div class="kpi-lbl">Guru Hadir (${totalTeachers > 0 ? Math.round((presentCount/totalTeachers)*100) : 100}%)</div></div>
        <div class="kpi-box"><div class="kpi-val" style="color:#dc2626;">${absentCount}</div><div class="kpi-lbl">Guru Tidak Hadir (${totalTeachers > 0 ? Math.round((absentCount/totalTeachers)*100) : 0}%)</div></div>
        <div class="kpi-box"><div class="kpi-val" style="color:#7c3aed;">${totalRelief}</div><div class="kpi-lbl">Waktu Diganti</div></div>
      </div>

      <div class="section-title">1. Senarai Guru Tidak Hadir & Perincian Gantian</div>
      ${absentCount === 0 
        ? `<p style="font-size:11.5px; color:#059669; font-weight:700; padding:10px 0;">Alhamdulillah, kesemua ${totalTeachers} orang guru ${APP_CONFIG.schoolName} hadir bertugas pada hari ini.</p>`
        : `<table class="table">
            <thead>
              <tr>
                <th style="width:30px; text-align:center;">#</th>
                <th>Nama Guru Tidak Hadir</th>
                <th>Sebab Ketidakhadiran</th>
                <th>Waktu Kelas Terlibat</th>
                <th>Guru Pengganti</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(absentMap).map(([nama, d], idx) => `
                <tr>
                  <td style="text-align:center;">${idx + 1}</td>
                  <td><strong>${nama}</strong></td>
                  <td><span class="badge badge-absent">${d.sebab}</span></td>
                  <td>${d.records.map(r => {
                    if (r.masa === "Tiada Kelas" || r.masa === "Waktu Persekolahan") {
                      return `<span style="color:#64748b; font-style:italic;">Tiada Jadual PdP (Bebas PdP Hari Ini)</span>`;
                    }
                    return `<span style="font-family:monospace; font-weight:bold;">${r.masa}</span> ${r.mata_pelajaran} (${r.kelas})`;
                  }).join('<br>')}</td>
                  <td>${d.records.map(r => {
                    if (isSpecialProgramRelief(r.guru_ganti)) {
                      return `<span style="color:#4338ca; font-weight:bold;">🏛️ ${r.guru_ganti}</span>`;
                    }
                    return `<strong>${r.guru_ganti || '—'}</strong>`;
                  }).join('<br>')}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>`
      }

      <div class="section-title">2. Senarai Penuh Kehadiran ${totalTeachers} Guru Sekolah</div>
      <table class="table">
        <thead>
          <tr>
            <th style="width:30px; text-align:center;">#</th>
            <th>Nama Guru</th>
            <th style="width:110px; text-align:center;">Status</th>
            <th>Catatan Tugasan Hari Ini</th>
          </tr>
        </thead>
        <tbody>
          ${MASTER_TEACHERS.map((nama, idx) => {
            const isAb = !!absentMap[nama];
            const isRel = !!reliefMap[nama];
            let cat = "Mengajar jadual waktu asal.";
            if (isAb) {
              const allProg = absentMap[nama].records.every(r => isSpecialProgramRelief(r.guru_ganti));
              cat = allProg
                ? `Tidak hadir: ${absentMap[nama].sebab} (Program Sekolah - Tiada Gantian PdP)`
                : `Tidak hadir: ${absentMap[nama].sebab} (${absentMap[nama].records.length} waktu diganti)`;
            } else if (isRel) {
              cat = `Bertugas ganti: +${reliefMap[nama].length} waktu (${reliefMap[nama].map(r => r.mata_pelajaran + ' ' + r.kelas).join(', ')})`;
            }
            
            return `<tr>
              <td style="text-align:center;">${idx + 1}</td>
              <td><strong>${nama}</strong></td>
              <td style="text-align:center;">${isAb ? '<span class="badge badge-absent">TIDAK HADIR</span>' : '<span class="badge badge-present">HADIR</span>'}</td>
              <td>${cat}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>

      <div class="sign-grid">
        <div class="sign-box">
          <p style="margin-bottom:45px;">Disediakan Oleh:</p>
          <p><strong>GURU BERTUGAS MINGGUAN</strong></p>
          <p>${APP_CONFIG.schoolName}</p>
        </div>
        <div class="sign-box">
          <p style="margin-bottom:45px;">Disahkan Oleh:</p>
          <p><strong>GURU BESAR / PK PENTADBIRAN</strong></p>
          <p>${APP_CONFIG.schoolName}</p>
        </div>
      </div>
    </body>
    </html>`);
  win.document.close();
}

let attListenersInitialized = false;
function setupAttendanceEventListenersOnce() {
  if (attListenersInitialized) return;
  attListenersInitialized = true;

  const attDateInput = document.getElementById("att-date");
  if (attDateInput) {
    attDateInput.addEventListener("change", () => {
      if (attDateInput.value) {
        renderDailyAttendance(attDateInput.value);
      }
    });
  }

  const prevBtn = document.getElementById("att-prev-day");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (!selectedAttDate) selectedAttDate = getLocalDateString();
      const [y, m, d] = selectedAttDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() - 1);
      renderDailyAttendance(getLocalDateString(dt));
    });
  }

  const nextBtn = document.getElementById("att-next-day");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!selectedAttDate) selectedAttDate = getLocalDateString();
      const [y, m, d] = selectedAttDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() + 1);
      renderDailyAttendance(getLocalDateString(dt));
    });
  }

  const todayBtn = document.getElementById("att-today-btn");
  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      renderDailyAttendance(getLocalDateString(new Date()));
    });
  }

  // Butang Tab Penapis Status Kehadiran
  document.querySelectorAll(".att-filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".att-filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      selectedAttFilter = tab.dataset.attFilter || "all";
      renderDailyAttendance(selectedAttDate);
    });
  });

  // Kotak Carian Guru
  const searchInput = document.getElementById("att-search-guru");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      attSearchQuery = searchInput.value.trim();
      renderDailyAttendance(selectedAttDate);
    });
  }

  // Penapis Arkib Sejarah
  const histMinggu = document.getElementById("hist-minggu");
  if (histMinggu) {
    histMinggu.addEventListener("change", renderAttendanceArchive);
  }
  const histSebab = document.getElementById("hist-sebab-filter");
  if (histSebab) {
    histSebab.addEventListener("change", renderAttendanceArchive);
  }

  // Butang Cetak Penyata Kehadiran Harian (PDF)
  const printBtn = document.getElementById("att-print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", printDailyAttendanceReport);
  }
}

// PAGE 7: Kalendar & Jadual Keseluruhan Sekolah Harian
let selectedCalDate = null;

function normalizeClassKey(k) {
  if (!k) return "";
  const raw = k.toString().trim();
  if (Array.isArray(ALL_MASTER_CLASSES) && ALL_MASTER_CLASSES.length > 0) {
    const exact = ALL_MASTER_CLASSES.find(c => c.toLowerCase() === raw.toLowerCase());
    if (exact) return exact;
  }
  return raw;
}

function populateCalendarClassFilter() {
  const filterSelect = document.getElementById("cal-class-filter");
  if (!filterSelect) return;
  const currentVal = filterSelect.value;
  if (typeof rebuildClassTimetablesFromMaster === "function" && (!ALL_MASTER_CLASSES || ALL_MASTER_CLASSES.length === 0)) {
    rebuildClassTimetablesFromMaster();
  }
  const rawClasses = Array.isArray(ALL_MASTER_CLASSES) ? ALL_MASTER_CLASSES : [];
  const classes = rawClasses.filter(c => c && String(c).trim().toLowerCase() !== "kelas" && String(c).trim().toLowerCase() !== "nama guru");
  filterSelect.innerHTML = '<option value="">Semua Kelas (' + classes.length + ' Kelas)</option>' +
    classes.map(c => `<option value="${c}">${MASTER_CLASS_LABELS[c] || c}</option>`).join("");
  if (currentVal && classes.includes(currentVal)) {
    filterSelect.value = currentVal;
  }
}

function renderCalendar() {
  const now = new Date();
  if (calYear === undefined) {
    calYear = now.getFullYear();
    calMonth = now.getMonth();
  }

  document.getElementById("cal-month-label").textContent = `${MALAY_MONTHS[calMonth]} ${calYear}`;
  const grid = document.getElementById("cal-grid");
  grid.innerHTML = "";

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr = getLocalDateString(now);

  const dateCounts = {};
  allRecords.forEach(r => {
    if (r.tarikh) dateCounts[r.tarikh] = (dateCounts[r.tarikh] || 0) + 1;
  });

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "cal-day opacity-0 pointer-events-none";
    grid.appendChild(emptyCell);
  }

  // Jika tarikh yang dipilih belum ditetapkan atau berada di luar bulan semasa, pilih tarikh hari ini (jika bulan semasa) atau tarikh 1
  if (!selectedCalDate) {
    selectedCalDate = todayStr;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.dataset.date = dateStr;

    if (dateStr === todayStr) cell.classList.add("today");
    if (dateStr === selectedCalDate) {
      cell.classList.add("selected");
    }

    if (dateCounts[dateStr]) {
      cell.classList.add("has-record");
      cell.title = `${dateCounts[dateStr]} rekod guru ganti`;
      cell.innerHTML = `
        <span class="cal-day-num">${d}</span>
        <span class="cal-ganti-dot"></span>
      `;
    } else {
      cell.innerHTML = `<span class="cal-day-num">${d}</span>`;
    }

    cell.addEventListener("click", () => {
      selectedCalDate = dateStr;
      document.querySelectorAll("#cal-grid .cal-day").forEach(c => c.classList.remove("selected"));
      cell.classList.add("selected");
      showCalDetail(dateStr, d);
    });

    grid.appendChild(cell);
  }

  // Paparkan terus jadual master bagi tarikh yang dipilih
  if (selectedCalDate) {
    const parts = selectedCalDate.split('-').map(Number);
    const dayNum = parts[2] || 1;
    showCalDetail(selectedCalDate, dayNum);
  }
}

function showCalDetail(dateStr, dayNum) {
  const detail = document.getElementById("cal-detail");
  const dayBadge = document.getElementById("cal-day-text");
  const title = document.getElementById("cal-detail-title");
  const sub = document.getElementById("cal-detail-sub");

  if (!detail) return;
  detail.classList.remove("hidden");

  const hari = getDayFromDate(dateStr);
  if (dayBadge) dayBadge.textContent = `${hari}`;

  const recs = allRecords.filter(r => r.tarikh === dateStr);
  const formattedDate = formatDateDisplay(dateStr);

  if (title) {
    title.textContent = `JADUAL KESELURUHAN SEKOLAH — ${formattedDate.toUpperCase()} (${hari.toUpperCase()})`;
  }

  if (sub) {
    if (hari === "Sabtu" || hari === "Ahad") {
      sub.textContent = `Hari Hujung Minggu (${hari}) — Tiada sesi persekolahan berjadual.`;
    } else if (recs.length > 0) {
      sub.textContent = `Status pengajaran ${ALL_MASTER_CLASSES.length || 0} kelas mengikut jadual waktu sekolah. Sebanyak ${recs.length} waktu guru ganti aktif (berwarna merah lembut).`;
    } else {
      sub.textContent = `Status pengajaran ${ALL_MASTER_CLASSES.length || 0} kelas mengikut jadual waktu sekolah. Semua kelas diajar oleh guru asal mengikut jadual rasmi (berwarna hijau).`;
    }
  }

  renderMasterTimetable(dateStr);
}

function renderMasterTimetable(dateStr) {
  const content = document.getElementById("cal-detail-content");
  if (!content) return;

  const hari = getDayFromDate(dateStr);

  // Jika Hujung Minggu (Sabtu / Ahad)
  if (hari === "Sabtu" || hari === "Ahad") {
    content.innerHTML = `
      <div class="empty-state-cheerful" style="margin:1rem 0;">
        <div class="empty-state-icon-wrap" style="background:#fef3c7; color:#d97706; border-color:#fde68a;">
          <i data-lucide="coffee" style="width:28px;height:28px;"></i>
        </div>
        <h3 style="font-weight:800; font-size:1.1rem; color:var(--text-primary); margin-bottom:4px;">Hari Hujung Minggu (${hari})</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); max-width:480px; margin:0 auto;">
          Tiada sesi persekolahan berjadual pada hari ${hari}. Sila klik mana-mana tarikh hari Isnin hingga Jumaat pada kalendar di atas untuk melihat Jadual Keseluruhan Sekolah.
        </p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Peta Penggantian daripada Google Sheet / allRecords
  const dayRecords = allRecords.filter(r => r.tarikh === dateStr);
  const replacementsMap = {};

  dayRecords.forEach(r => {
    const normClass = normalizeClassKey(r.kelas);
    if (!normClass) return;
    const slots = splitTimeSlot(r.masa);
    slots.forEach(slotStr => {
      const sIdx = STANDARD_SLOTS.indexOf(slotStr);
      if (sIdx >= 0) {
        replacementsMap[`${normClass}|${sIdx}`] = {
          guruGanti: r.guru_ganti,
          guruAsal: r.guru_tidak_hadir,
          subjek: r.mata_pelajaran
        };
      }
    });
  });

  populateCalendarClassFilter();
  // Tapis kelas jika dropdown filter dipilih
  const filterSelect = document.getElementById("cal-class-filter");
  const selectedClass = filterSelect ? filterSelect.value : "";
  const rawClassesToRender = selectedClass ? [selectedClass] : (Array.isArray(ALL_MASTER_CLASSES) ? ALL_MASTER_CLASSES : []);
  const classesToRender = rawClassesToRender.filter(c => c && String(c).trim().toLowerCase() !== "kelas" && String(c).trim().toLowerCase() !== "nama guru");

  if (classesToRender.length === 0) {
    content.innerHTML = `
      <div class="empty-state-cheerful" style="margin:1rem 0;">
        <div class="empty-state-icon-wrap">
          <i data-lucide="calendar" style="width:28px;height:28px;"></i>
        </div>
        <h3 style="font-weight:800; font-size:1.05rem; color:var(--text-primary); margin-bottom:4px;">Tiada Jadual Kelas Didaftarkan</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); max-width:480px; margin:0 auto;">
          Sila muat naik jadual waktu atau segerakkan dengan Google Sheet Sekolah di halaman Urus &amp; Import Jadual.
        </p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = `
    <div class="master-tt-container">
      <table class="master-tt-table">
        <thead>
          <tr>
            <th class="th-class-col">KELAS</th>
  `;

  for (let si = 1; si < STANDARD_SLOTS.length; si++) {
    if (Array.isArray(REHAT_SLOT_INDICES) && REHAT_SLOT_INDICES.includes(si)) {
      html += `<th style="background:#e2e8f0; color:#475569; min-width:80px;" class="dark:bg-slate-800 dark:text-slate-300">REHAT<br><span style="font-size:9.5px; font-weight:600;">${STANDARD_SLOTS[si]}</span></th>`;
    } else {
      html += `<th>W${si}<br><span style="font-size:9.5px; font-weight:600; opacity:0.85;">${STANDARD_SLOTS[si]}</span></th>`;
    }
  }

  html += `
          </tr>
        </thead>
        <tbody>
  `;

  classesToRender.forEach(kelas => {
    const classLabel = MASTER_CLASS_LABELS[kelas] || kelas;
    html += `
      <tr>
        <td class="col-class-header">
          <div><strong>${classLabel}</strong></div>
          <div style="font-size:10px; color:var(--text-secondary); font-weight:600;">${kelas}</div>
        </td>
    `;

    for (let si = 1; si < STANDARD_SLOTS.length; si++) {
      if (Array.isArray(REHAT_SLOT_INDICES) && REHAT_SLOT_INDICES.includes(si)) {
        // Rehat Sekolah
        html += `<td class="cell-rehat"><span style="font-size:10.5px; font-weight:800; letter-spacing:0.04em;">REHAT</span></td>`;
        continue;
      }

      const repl = replacementsMap[`${kelas}|${si}`];
      const slotInfo = getClassTimetableSlot(kelas, hari, si);

      if (repl) {
        // GURU GANTI MENGAJAR -> MERAH LEMBUT ATAU UNGU (PROGRAM SEKOLAH)
        const subjekDisplay = repl.subjek || (slotInfo ? slotInfo.subjek : "—");
        const guruGantiDisplay = repl.guruGanti || "Guru Ganti";
        const guruAsalDisplay = repl.guruAsal || (slotInfo ? slotInfo.guru : "");
        const isProg = isSpecialProgramRelief(guruGantiDisplay);

        if (isProg) {
          html += `
            <td class="cell-guru-ganti" style="background:#ede9fe!important; border-color:#c7d2fe!important;">
              <div style="font-weight:800; font-size:12px; color:#3730a3;" class="dark:text-indigo-300">${subjekDisplay}</div>
              <div style="font-weight:800; font-size:10.5px; color:#4338ca; margin-top:2px;" class="dark:text-indigo-200">🏛️ ${guruGantiDisplay}</div>
              <div style="font-size:9.5px; color:#6366f1;" class="dark:text-indigo-400">Asal: ${guruAsalDisplay}</div>
            </td>
          `;
        } else {
          html += `
            <td class="cell-guru-ganti">
              <div style="font-weight:800; font-size:12px; color:#991b1b;" class="dark:text-red-300">${subjekDisplay}</div>
              <div style="font-weight:800; font-size:11px; color:#7f1d1d; margin-top:2px;" class="dark:text-red-200">🔄 ${guruGantiDisplay}</div>
              <div style="font-size:9.5px; color:#b91c1c; opacity:0.9;" class="dark:text-red-400">Asal: ${guruAsalDisplay}</div>
            </td>
          `;
        }
      } else if (slotInfo) {
        // GURU ASAL MENGAJAR -> HIJAU
        html += `
          <td class="cell-guru-asal">
            <div style="font-weight:800; font-size:12px; color:#065f46;" class="dark:text-emerald-300">${slotInfo.subjek}</div>
            <div style="font-weight:600; font-size:10.5px; color:#047857; margin-top:2px;" class="dark:text-emerald-200">${slotInfo.guru}</div>
          </td>
        `;
      } else {
        // TIADA KELAS / KOSONG
        html += `<td class="cell-empty"><span style="color:var(--text-muted); font-size:11px;">—</span></td>`;
      }
    }

    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  content.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

// Pasang pendengar peristiwa pada penapis kelas kalendar
const calClassFilterEl = document.getElementById("cal-class-filter");
if (calClassFilterEl) {
  calClassFilterEl.addEventListener("change", () => {
    if (selectedCalDate) {
      renderMasterTimetable(selectedCalDate);
    }
  });
}

document.getElementById("cal-prev").addEventListener("click", () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});

document.getElementById("cal-next").addEventListener("click", () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

const calTodayBtn = document.getElementById("cal-today-btn");
if (calTodayBtn) {
  calTodayBtn.addEventListener("click", () => {
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    selectedCalDate = getLocalDateString(now);
    renderCalendar();
  });
}


// Cetakan: Laporan Penuh A4
document.getElementById("print-pdf-btn").addEventListener("click", () => {
  const rows = [...entryRows.querySelectorAll(".schedule-row")];
  const tarikhStr = dateInput.value ? formatDateDisplay(dateInput.value) : "—";
  const hariStr = dayInput.value || "—";
  const mingguStr = mingguSelect.value || "—";
  const kumpulanStr = kumpulanSelect.value || "—";

  const trs = [...teachersContainer.querySelectorAll(".teacher-row")];
  const activeAbsent = trs
    .map(r => {
      const n = r.querySelector(".teacher-select").value;
      const re = r.querySelector(".reason-select").value;
      const isProg = r.querySelector(".teacher-program-checkbox") && r.querySelector(".teacher-program-checkbox").checked;
      return n ? `• ${n} (${re})${isProg ? ' — [Program Sekolah / Tiada Ganti PdP]' : ''}` : null;
    })
    .filter(Boolean);

  const hasValidRows = rows.length > 0 && rows.some(r => r.querySelector(".row-ganti") && r.querySelector(".row-ganti").value && r.querySelector(".row-ganti").value !== "Pilih guru ganti");
  const isAllPresent = activeAbsent.length === 0 && !hasValidRows;

  let tableHtml = "";
  if (!isAllPresent) {
    rows.forEach(r => {
      const masa = r.querySelector(".row-masa").value.trim() || "—";
      const subjek = r.querySelector(".row-subjek").value.trim() || "—";
      const kelas = r.querySelector(".row-kelas").value.trim() || "—";
      const guruGanti = r.querySelector(".row-ganti").value.trim() || "—";
      const guruAsal = r.dataset.guruTidakHadir || "—";
      const gantiDisplay = isSpecialProgramRelief(guruGanti)
        ? `<span style="color:#4f46e5; font-weight:bold;">🏛️ ${guruGanti}</span>`
        : `<span style="font-weight:bold; color:#1e3a8a;">${guruGanti}</span>`;

      tableHtml += `<tr style="border-bottom:1px solid #cbd5e1">` +
        `<td style="padding:8px 10px;font-family:monospace;font-weight:bold">${masa}</td>` +
        `<td style="padding:8px 10px">${subjek}</td>` +
        `<td style="padding:8px 10px">${kelas}</td>` +
        `<td style="padding:8px 10px">${gantiDisplay}</td>` +
        `<td style="padding:8px 10px;font-size:11px;color:#475569">${guruAsal}</td>` +
        `</tr>`;
    });
  }

  const win = window.open("", "_blank");
  if (!win) {
    showToast("Sila benarkan pop-up pada pelayar web anda.", "error");
    return;
  }

  const mainBodyContent = isAllPresent ? `
        <div class="section-title">STATUS KEHADIRAN GURU &amp; PENGGANTIAN</div>
        <div style="background:#ecfdf5; border:1.5px solid #10b981; padding:22px 26px; border-radius:10px; margin:15px 0 25px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <span style="background:#059669; color:#fff; font-size:11px; font-weight:800; padding:3px 10px; border-radius:4px; letter-spacing:0.04em;">STATUS RASMI</span>
            <span style="font-size:16px; font-weight:800; color:#065f46;">SEMUA GURU HADIR / TIADA PENGGANTIAN</span>
          </div>
          <p style="margin:0; font-size:12.5px; color:#047857; line-height:1.6;">
            <strong>PENGESAHAN RASMI PENTADBIRAN:</strong> Tiada sebarang rekod ketidakhadiran guru dicatatkan bagi tarikh <strong>${tarikhStr} (${hariStr})</strong>. Semua guru ${APP_CONFIG.schoolName} dilaporkan hadir bertugas. Semua sesi Pengajaran dan Pembelajaran (PdP) berjalan sepenuhnya mengikut Jadual Waktu Induk asal tanpa sebarang penggantian.
          </p>
          <div style="margin-top:14px; font-size:11.5px; color:#065f46; font-weight:700; display:flex; gap:18px; flex-wrap:wrap;">
            <span>✓ 100% Kehadiran Guru Dilaporkan</span>
            <span>✓ Tiada Jadual Guru Ganti Diperlukan</span>
            <span>✓ Semua Kelas Beroperasi Penuh Mengikut Jadual Asal</span>
          </div>
        </div>

        <div style="margin-top:60px; display:flex; justify-content:space-between; font-size:11px; color:#475569;">
          <div>
            <p>Disediakan oleh:</p>
            <div style="margin-top:55px; border-top:1px solid #94a3b8; width:200px; padding-top:4px;">
              <strong>Guru Bertugas Mingguan</strong>
            </div>
          </div>
          <div>
            <p>Disahkan oleh:</p>
            <div style="margin-top:55px; border-top:1px solid #94a3b8; width:200px; padding-top:4px;">
              <strong>Guru Besar / PK Pentadbiran</strong><br>${APP_CONFIG.schoolName}
            </div>
          </div>
        </div>
  ` : `
        <div class="section-title">SENARAI GURU TIDAK HADIR</div>
        <div class="absent-box">${activeAbsent.length ? activeAbsent.join("<br>") : "Tiada guru tidak hadir."}</div>
        <div class="section-title">JADUAL WAKTU GURU GANTI</div>
        <table class="report-table">
          <thead><tr><th>Masa</th><th>Mata Pelajaran</th><th>Kelas</th><th>Guru Ganti</th><th>Guru Asal</th></tr></thead>
          <tbody>${tableHtml}</tbody>
        </table>
        <footer class="report-footer">
          <span>Dokumen Rasmi ${APP_CONFIG.schoolName}</span>
          <span>${APP_CONFIG.appName} • ${tarikhStr}</span>
        </footer>
  `;

  win.document.write(`<!DOCTYPE html>
    <html lang="ms">
    <head>
      <meta charset="UTF-8">
      <title>Jadual Guru Ganti - ${tarikhStr}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #eef2f7; color: #172033; padding: 20px; }
        .report-page { background: #fff; max-width: 820px; margin: 0 auto; padding: 36px 44px; border-top: 8px solid #1e3a8a; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .report-header { border-bottom: 3px double #1e3a8a; padding-bottom: 16px; margin-bottom: 20px; }
        .header-container { display: flex; align-items: center; justify-content: center; gap: 20px; }
        .header-logo { width: 88px; height: 88px; object-fit: contain; flex-shrink: 0; border-radius: 50%; }
        .header-titles { text-align: center; }
        .school-name { font-size: 21px; font-weight: 800; color: #1e3a8a; letter-spacing: 0.02em; }
        .school-sub { font-size: 11px; color: #475569; font-weight: 600; margin-top: 2px; }
        .school-motto { font-size: 10px; color: #64748b; font-style: italic; margin-top: 2px; }
        .report-title { font-size: 14px; font-weight: 800; color: #1e3a8a; margin-top: 8px; background: #e0e7ff; display: inline-block; padding: 4px 16px; border-radius: 4px; letter-spacing: 0.04em; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 12px; }
        .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; padding: 10px 14px; border-radius: 6px; }
        .section-title { font-size: 13px; font-weight: 800; color: #1e3a8a; margin: 18px 0 8px; border-left: 4px solid #2563eb; padding-left: 8px; }
        .absent-box { background: #fef2f2; border: 1px solid #fca5a5; padding: 10px 14px; border-radius: 6px; font-size: 12px; color: #991b1b; }
        .report-table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 8px; }
        .report-table th { background: #e8eef8; color: #1e3a8a; font-weight: 800; text-align: left; padding: 8px 10px; border-bottom: 2px solid #b9c8dd; }
        .btn-print { background: #059669; color: #fff; border: none; padding: 10px 24px; font-weight: bold; border-radius: 8px; cursor: pointer; margin: 0 auto 15px; display: block; }
        .report-footer { display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; margin-top: 25px; padding-top: 10px; color: #64748b; font-size: 10px; }
        @media print { .btn-print { display: none; } body { padding: 0; } .report-page { box-shadow: none; padding: 20px; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">Simpan PDF / Cetak Laporan</button>
      <div class="report-page">
        <header class="report-header">
          <div class="header-container">
            <img src="${APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo}" alt="Lencana Rasmi Sekolah" class="header-logo">
            <div class="header-titles">
              <div class="school-name">${APP_CONFIG.schoolName}</div>
              <div class="school-sub">${APP_CONFIG.schoolAddress}</div>
              <div class="school-motto">"${APP_CONFIG.schoolSubMotto}" • "${APP_CONFIG.schoolMotto}"</div>
              <div class="report-title">${isAllPresent ? "PENGESAHAN KEHADIRAN GURU" : "JADUAL GURU GANTI"}</div>
            </div>
          </div>
        </header>
        <div class="meta-grid">
          <div class="meta-box"><strong>Minggu:</strong> ${mingguStr}</div>
          <div class="meta-box"><strong>Tarikh / Hari:</strong> ${tarikhStr} (${hariStr})</div>
          <div class="meta-box"><strong>Kumpulan Bertugas:</strong> ${kumpulanStr}</div>
          <div class="meta-box"><strong>Masa Dijana:</strong> ${new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        ${mainBodyContent}
      </div>
    </body>
    </html>`);
  win.document.close();
});

// ========================================================
// PENGURUSAN SEGERAK AWAN HEADER (GOOGLE SHEETS)
// ========================================================
async function triggerCloudSync(isManual = false) {
  const cloudBtn = document.getElementById("btn-cloud-sync");
  const cloudIcon = document.getElementById("cloud-sync-icon");
  if (!cloudBtn) return;

  // 1. Tetapkan status SEDANG MENYEGERAK (Loading State)
  cloudBtn.classList.remove("status-success", "status-error");
  cloudBtn.classList.add("status-loading");
  cloudBtn.setAttribute("title", "Sedang menyegerak data dengan Google Sheets...");
  if (cloudIcon) {
    cloudIcon.setAttribute("data-lucide", "refresh-cw");
    cloudIcon.classList.add("animate-spin");
    if (window.lucide) window.lucide.createIcons();
  }

  let isSuccess = false;
  let recordCount = 0;
  let statusMsg = "";

  try {
    const schoolRes = await DatabaseAPI.getSchoolData();
    if (schoolRes && schoolRes.success && schoolRes.data) {
      applySchoolData(schoolRes.data);
    }
    const res = await DatabaseAPI.syncFromCloud();
    if (res && res.success) {
      allRecords = res.data || [];
      recordCount = res.count || allRecords.length;
      isSuccess = true;

      // Pintar: Jika penapis bulan semasa tiada rekod, lalai kepada "" (Semua Bulan) supaya data Google Sheet sentiasa terpapar
      const statBulanEl = document.getElementById("stat-bulan-filter");
      if (statBulanEl && statBulanEl.value) {
        const selMonth = parseInt(statBulanEl.value, 10);
        const hasSelMonthRecords = allRecords.some(r => {
          if (!r || !r.tarikh) return false;
          const parts = r.tarikh.split('-');
          return parts.length >= 2 && parseInt(parts[1], 10) === selMonth;
        });
        if (!hasSelMonthRecords) {
          statBulanEl.value = ""; // Tukar ke 'Semua Bulan' secara automatik
        }
      }

      // Segar semula paparan tab statistik
      renderPage5();
    } else {
      isSuccess = false;
      statusMsg = res ? res.message : "Gagal menghubungi Google Sheet";
    }
  } catch (err) {
    console.warn("Ralat sambungan awan:", err);
    isSuccess = false;
    statusMsg = err.message || "Ralat rangkaian";
  } finally {
    // 2. Kemas kini status visual (HIJAU jika Berjaya, MERAH jika Gagal)
    cloudBtn.classList.remove("status-loading");
    if (cloudIcon) {
      cloudIcon.classList.remove("animate-spin");
    }

    if (isSuccess) {
      cloudBtn.classList.remove("status-error");
      cloudBtn.classList.add("status-success");
      cloudBtn.setAttribute("title", `Segerak Awan Berfungsi (Google Sheets Aktif - ${recordCount} rekod disegerak). Klik untuk segerak semula.`);
      if (cloudIcon) cloudIcon.setAttribute("data-lucide", "cloud");
      if (isManual) {
        showToast(`Segerak Awan Berjaya! (${recordCount} rekod dikemas kini)`, "success");
      }
    } else {
      cloudBtn.classList.remove("status-success");
      cloudBtn.classList.add("status-error");
      cloudBtn.setAttribute("title", `Segerak Awan Tidak Berfungsi: ${statusMsg}. Klik untuk cuba lagi.`);
      if (cloudIcon) cloudIcon.setAttribute("data-lucide", "cloud-off");
      if (isManual) {
        showToast(`Segerak Awan Gagal: ${statusMsg}`, "error");
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  return isSuccess;
}

function setupCloudSync() {
  const cloudBtn = document.getElementById("btn-cloud-sync");
  if (cloudBtn) {
    cloudBtn.addEventListener("click", () => triggerCloudSync(true));
  }
}

// Cetakan: Laporan Bulanan PDF (Dinamik mengikut bulan yang dipilih)
document.getElementById("monthly-pdf-btn").addEventListener("click", () => {
  const bulanVal = document.getElementById("stat-bulan-filter") ? document.getElementById("stat-bulan-filter").value : "";
  const now = new Date();
  const targetMonth = bulanVal ? parseInt(bulanVal, 10) - 1 : now.getMonth();
  const targetYear = now.getFullYear();

  const monthRecords = allRecords.filter(r => {
    if (!r || !r.tarikh) return false;
    const parts = r.tarikh.split('-').map(Number);
    if (parts.length < 2) return false;
    const [y, m] = parts;
    return (m - 1) === targetMonth;
  });

  const gantiCounts = {};
  const absentSet = new Set();
  monthRecords.forEach(r => {
    if (r.guru_tidak_hadir) absentSet.add(r.guru_tidak_hadir);
    if (r.guru_ganti) {
      if (!gantiCounts[r.guru_ganti]) {
        gantiCounts[r.guru_ganti] = { count: 0, classes: new Set(), subjects: new Set() };
      }
      gantiCounts[r.guru_ganti].count++;
      if (r.kelas) gantiCounts[r.guru_ganti].classes.add(r.kelas);
      if (r.mata_pelajaran) gantiCounts[r.guru_ganti].subjects.add(r.mata_pelajaran);
    }
  });
  const sortedGanti = Object.entries(gantiCounts).sort((a, b) => b[1].count - a[1].count);

  const win = window.open("", "_blank");
  if (!win) {
    showToast("Sila benarkan pop-up pada pelayar web anda untuk mencetak laporan.", "error");
    return;
  }

  const bulanNama = MALAY_MONTHS[targetMonth].toUpperCase();

  win.document.write(`<!DOCTYPE html>
    <html lang="ms">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Bulanan Guru Ganti — ${bulanNama} ${targetYear}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #fff; padding: 25px 35px; color: #1e293b; line-height: 1.4; }
        .header { text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
        .school { font-size: 20px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.01em; }
        .address { font-size: 11px; color: #475569; font-weight: 600; margin-top: 2px; }
        .motto { font-size: 10px; color: #64748b; font-style: italic; margin-top: 3px; }
        .title { font-size: 14px; font-weight: 800; color: #1e3a8a; margin-top: 10px; text-transform: uppercase; background: #eff6ff; padding: 6px 14px; border-radius: 6px; display: inline-block; border: 1px solid #bfdbfe; }
        
        .summary-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .summary-item { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; background: #f8fafc; text-align: center; }
        .summary-num { font-size: 20px; font-weight: 800; color: #1e3a8a; font-family: monospace; }
        .summary-lbl { font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 2px; }
        
        .section-title { font-size: 12.5px; font-weight: 800; color: #1e3a8a; margin: 18px 0 8px; border-left: 4px solid #2563eb; padding-left: 8px; }
        .table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 18px; }
        .table th, .table td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
        .table th { background: #f1f5f9; font-weight: 800; color: #1e3a8a; }
        .table tr:nth-child(even) td { background: #f8fafc; }
        
        .badge-safe { background: #ecfdf5; color: #065f46; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid #a7f3d0; }
        .badge-warning { background: #fffbeb; color: #92400e; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid #fde68a; }
        .badge-danger { background: #fef2f2; color: #991b1b; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid #fca5a5; }

        .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 35px; page-break-inside: avoid; }
        .sign-box { border-top: 1px solid #94a3b8; padding-top: 8px; text-align: center; font-size: 11px; }
        
        .btn-print { background: #7c3aed; color: #fff; border: none; padding: 10px 22px; font-weight: bold; font-size: 13px; border-radius: 8px; cursor: pointer; margin: 0 auto 20px; display: block; box-shadow: 0 3px 8px rgba(124,58,237,0.3); }
        @media print { .btn-print { display: none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan Laporan PDF (${bulanNama})</button>
      <div class="header">
        <div style="display:flex; align-items:center; justify-content:center; gap:16px;">
          <img src="${APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo}" alt="Lencana Rasmi Sekolah" style="width:70px; height:70px; object-fit:contain; flex-shrink:0;">
          <div style="text-align:center;">
            <div class="school">${APP_CONFIG.schoolName}</div>
            <div class="address">${APP_CONFIG.schoolAddress}</div>
            <div class="motto">"${APP_CONFIG.schoolSubMotto}" • "${APP_CONFIG.schoolMotto}"</div>
            <div class="title">LAPORAN BULANAN GURU GANTI — ${bulanNama} ${targetYear}</div>
          </div>
        </div>
      </div>

      <!-- Ringkasan Eksekutif -->
      <div class="summary-box">
        <div class="summary-item">
          <div class="summary-num">${monthRecords.length}</div>
          <div class="summary-lbl">Jumlah Waktu Diganti</div>
        </div>
        <div class="summary-item">
          <div class="summary-num">${sortedGanti.length}</div>
          <div class="summary-lbl">Guru Ganti Terlibat</div>
        </div>
        <div class="summary-item">
          <div class="summary-num">${absentSet.size}</div>
          <div class="summary-lbl">Guru Tidak Hadir</div>
        </div>
      </div>

      <!-- Jadual 1: Ringkasan Beban Tugas Guru Ganti -->
      <div class="section-title">1. Rumusan Beban Tugas Guru Ganti</div>
      ${!sortedGanti.length
        ? `<p style="font-size:12px; color:#64748b; font-style:italic; padding:12px 0;">Tiada rekod penggantian yang dicatatkan bagi bulan ${bulanNama} ${targetYear}.</p>`
        : `<table class="table">
            <thead>
              <tr>
                <th style="width:36px; text-align:center;">#</th>
                <th>Nama Guru Ganti</th>
                <th>Mata Pelajaran Diganti</th>
                <th>Kelas Terlibat</th>
                <th style="width:100px; text-align:center;">Jumlah Waktu</th>
                <th style="width:110px; text-align:center;">Status Beban</th>
              </tr>
            </thead>
            <tbody>
              ${sortedGanti.map(([guru, d], idx) => {
                const count = d.count;
                let statusHtml = '<span class="badge-safe">Normal</span>';
                if (count >= (APP_CONFIG.overloadThresholdWeekly || 8)) {
                  statusHtml = '<span class="badge-danger">Beban Tinggi</span>';
                } else if (count >= (APP_CONFIG.overloadThresholdWeekly || 8) * 0.6) {
                  statusHtml = '<span class="badge-warning">Sederhana</span>';
                }
                return `<tr>
                  <td style="text-align:center;">${idx + 1}</td>
                  <td><strong>${guru}</strong></td>
                  <td>${[...d.subjects].join(', ') || '—'}</td>
                  <td>${[...d.classes].join(', ') || '—'}</td>
                  <td style="text-align:center; font-weight:bold; font-family:monospace;">${count}</td>
                  <td style="text-align:center;">${statusHtml}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>`
      }

      <!-- Jadual 2: Log Terperinci Gantian -->
      ${monthRecords.length > 0 ? `
        <div class="section-title">2. Log Terperinci Penggantian Kelas</div>
        <table class="table">
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">#</th>
              <th>Tarikh & Hari</th>
              <th>Minggu</th>
              <th>Guru Tidak Hadir</th>
              <th>Masa / Kelas / Subjek</th>
              <th>Guru Ganti</th>
            </tr>
          </thead>
          <tbody>
            ${monthRecords.map((r, i) => `
              <tr>
                <td style="text-align:center;">${i + 1}</td>
                <td>${r.tarikh || '—'} (${r.hari || ''})</td>
                <td>${r.minggu || '—'}</td>
                <td>${r.guru_tidak_hadir || '—'}${r.sebab ? `<br><span style="font-size:10px; color:#64748b;">(${r.sebab})</span>` : ''}</td>
                <td>${r.masa || '—'}<br><strong>${r.mata_pelajaran || ''} (${r.kelas || ''})</strong></td>
                <td><strong>${r.guru_ganti || '—'}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : ''}

      <!-- Ruangan Pengesahan Dokumen -->
      <div class="sign-grid">
        <div class="sign-box">
          <p style="margin-bottom:45px;">Disediakan Oleh:</p>
          <p><strong>GURU BERTUGAS MINGGUAN</strong></p>
          <p>${APP_CONFIG.schoolName}</p>
        </div>
        <div class="sign-box">
          <p style="margin-bottom:45px;">Disahkan Oleh:</p>
          <p><strong>GURU BESAR / PK PENTADBIRAN</strong></p>
          <p>${APP_CONFIG.schoolName}</p>
        </div>
      </div>
    </body>
    </html>`);
  win.document.close();
});

// Simpan Borang (Submit): Menyokong Mod Tambah (Append) & Kemas Kini Rekod Sedia Ada
document.getElementById("schedule-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();

  if (!ev.currentTarget.checkValidity()) {
    showToast("Sila lengkapkan semua medan wajib.", "error");
    ev.currentTarget.reportValidity();
    return;
  }

  const allDomRows = [...entryRows.querySelectorAll(".schedule-row")];
  const activeTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
    .map(r => ({
      name: r.querySelector(".teacher-select").value,
      reason: r.querySelector(".reason-select").value
    }))
    .filter(t => t.name);

  // Jika tiada baris jadual DAN tiada guru tidak hadir dipilih, baru sekat
  if (!allDomRows.length && !activeTeachers.length) {
    showToast("Sila pilih sekurang-kurangnya seorang guru tidak hadir atau tambah waktu kelas.", "error");
    return;
  }

  // Semak jika semua baris telah mempunyai pilihan guru pengganti
  const unassigned = allDomRows.filter(r => {
    const gVal = r.querySelector(".row-ganti") ? r.querySelector(".row-ganti").value.trim() : "";
    return !gVal || gVal === "Pilih guru ganti";
  });
  if (unassigned.length) {
    showToast("Sila pilih guru pengganti untuk semua waktu kelas sebelum menyimpan.", "error");
    return;
  }

  // Semak pertindihan masa bagi guru pengganti yang sama (Validation Rules 2 & 3)
  const slotAssignments = {};
  let clashWarning = null;
  for (const r of allDomRows) {
    const masa = r.querySelector(".row-masa").value.trim();
    const ganti = r.querySelector(".row-ganti").value.trim();
    if (ganti && ganti !== "Guru UBK" && !isSpecialProgramRelief(ganti)) {
      const key = `${masa}__${ganti}`;
      if (slotAssignments[key]) {
        clashWarning = { masa, ganti };
        break;
      }
      slotAssignments[key] = true;
    }
  }

  if (clashWarning) {
    if (!confirm(`AMARAN PERTINDIHAN WAKTU:\n\nGuru ${clashWarning.ganti} telah ditugaskan menggantikan lebih daripada 1 kelas pada slot masa yang sama (${clashWarning.masa}).\n\nAdakah anda pasti mahu meneruskan simpanan?`)) {
      return;
    }
  }

  const submitBtn = document.getElementById("save-sheet-btn");
  const origBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> Menyimpan rekod ke sistem...`;

  const commonData = {
    minggu: mingguSelect.value,
    tarikh: dateInput.value,
    hari: dayInput.value,
    kumpulan: kumpulanSelect.value
  };

  // Asingkan rekod baharu (untuk di-APPEND) dan rekod tersimpan yang diubah (untuk di-UPDATE)
  const newRecordsToSave = [];
  const modifiedRecordsToUpdate = [];
  const teachersCoveredInDom = new Set();

  allDomRows.forEach(r => {
    const isSaved = r.dataset.saved === "true";
    const isModified = r.dataset.modified === "true";
    const rg = r.dataset.guruTidakHadir || (activeTeachers[0] ? activeTeachers[0].name : "");
    const rs = r.dataset.sebab || (activeTeachers[0] ? activeTeachers[0].reason : "");
    if (rg) teachersCoveredInDom.add(rg);

    const gantiVal = r.querySelector(".row-ganti").value.trim();
    const masaVal = r.querySelector(".row-masa").value.trim();
    const subjekVal = r.querySelector(".row-subjek").value.trim();
    const kelasVal = r.querySelector(".row-kelas").value.trim();

    const recData = {
      ...commonData,
      guru_tidak_hadir: rg,
      sebab: rs,
      masa: masaVal,
      mata_pelajaran: subjekVal,
      kelas: kelasVal,
      guru_ganti: gantiVal,
      catatan: isSpecialProgramRelief(gantiVal) ? `Program Sekolah / Tiada Gantian (${rg})` : `Ganti ${rg}`
    };

    if (!isSaved) {
      newRecordsToSave.push(recData);
    } else if (isModified) {
      recData.id = r.dataset.id;
      modifiedRecordsToUpdate.push(recData);
    }
  });

  // Pastikan guru tidak hadir yang tiada baris PdP (cth: tiada jadual PdP hari ini, atau baris telah dipadam oleh pengguna)
  // tetap disimpan ke dalam Google Sheet & Pangkalan Data supaya pentadbir dapat mengetahui ketidakhadiran guru berkenaan!
  activeTeachers.forEach(t => {
    if (!teachersCoveredInDom.has(t.name)) {
      const alreadySaved = allRecords.some(r => r && r.tarikh === dateInput.value && r.guru_tidak_hadir === t.name);
      if (!alreadySaved) {
        newRecordsToSave.push({
          ...commonData,
          guru_tidak_hadir: t.name,
          sebab: t.reason || "Tidak Hadir",
          masa: "Tiada Kelas",
          mata_pelajaran: "Tiada PdP",
          kelas: "—",
          guru_ganti: "TIADA GANTIAN",
          catatan: `Guru Tidak Hadir (${t.reason || "Tidak Hadir"}) — Tiada Jadual Kelas Terlibat`
        });
      }
    }
  });

  let hasUpdates = false;

  // 1. Simpan rekod baharu (Append: tidak menggantikan rekod pagi)
  if (newRecordsToSave.length > 0) {
    const saveResult = await DatabaseAPI.saveRecords(newRecordsToSave);
    if (!saveResult.success) {
      showToast(saveResult.message || "Gagal menyimpan rekod baharu.", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
      return;
    }
    hasUpdates = true;
  }

  // 2. Kemas kini rekod sedia ada yang telah diedit
  if (modifiedRecordsToUpdate.length > 0) {
    for (const modRec of modifiedRecordsToUpdate) {
      await DatabaseAPI.updateRecord(modRec);
    }
    hasUpdates = true;
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = origBtnContent;

  if (hasUpdates) {
    clearCurrentDraft(dateInput ? dateInput.value : "");
    clearCancelledSlots(dateInput ? dateInput.value : "");
    showToast(
      newRecordsToSave.length && modifiedRecordsToUpdate.length
        ? `${newRecordsToSave.length} tugasan baharu ditambah (Append) & ${modifiedRecordsToUpdate.length} rekod sedia ada dikemas kini!`
        : newRecordsToSave.length
        ? `${newRecordsToSave.length} tugasan guru ganti berjaya disimpan & dikekalkan!`
        : "Perubahan rekod berjaya dikemas kini!",
      "success"
    );
  } else {
    showToast("Semua rekod harian bagi tarikh ini telah pun tersimpan rapi.", "info");
  }

  // Segerakkan allRecords dan muat semula paparan harian tanpa mengosongkan borang
  allRecords = await DatabaseAPI.getAllRecords();
  loadDailyScheduleForDate(dateInput.value);

  // Segerakkan paparan tab lain jika sedang aktif
  renderPage5();
});

// Prapemuatan Sistem (Initialization)
document.addEventListener("DOMContentLoaded", async () => {
  // Inisialisasi Kawalan Akses & Skrin Log Masuk
  setupAuth();

  setupDarkMode();
  setupNavigation();
  setupDeviceModeToggle();
  setupAccessibilityControls();
  setupScheduleEnlargeModal();

  // Tetapkan tarikh tempatan tepat
  const today = new Date();
  const todayStr = getLocalDateString(today);
  dateInput.value = todayStr;

  const todayDay = getDayFromDate(todayStr);
  dayInput.value = todayDay;

  // Inisialisasi slot tarikh & hari di JADUAL KELAS (Page 2) & JADUAL GURU (Page 3) secara automatik mengikut tarikh semasa
  const p2Tarikh = document.getElementById("page2-tarikh");
  const p2Hari = document.getElementById("page2-hari");
  if (p2Tarikh) p2Tarikh.value = todayStr;
  if (p2Hari) p2Hari.value = todayDay;

  const p3Tarikh = document.getElementById("page3-tarikh");
  const p3Hari = document.getElementById("page3-hari");
  if (p3Tarikh) p3Tarikh.value = todayStr;
  if (p3Hari) p3Hari.value = todayDay;

  const todayDisplay = document.getElementById("today-display");
  if (todayDisplay) {
    todayDisplay.textContent = `${MALAY_DAYS[today.getDay()]}, ${today.getDate()} ${MALAY_MONTHS[today.getMonth()]} ${today.getFullYear()}`;
  }

  // Prapemuatan ikon Lucide
  if (window.lucide) window.lucide.createIcons();

  // Pembersihan rekod ujian / dummy terdahulu (Sistem baharu mula dari rekod 0)
  const RESET_KEY = "eguru_records_fresh_start_v2";
  if (!localStorage.getItem(RESET_KEY)) {
    localStorage.removeItem(APP_CONFIG.storageKeys.records);
    localStorage.setItem(RESET_KEY, "true");
  }

  // Muat turun data sedia ada daripada API / Storan Tempatan
  allRecords = await DatabaseAPI.getAllRecords();

  // Inisialisasi Jadual Harian bagi Tarikh Semasa (Kekalkan Data Pagi!)
  loadDailyScheduleForDate(todayStr);

  // Tetapkan pilihan lalai di dropdown Page 5:
  const statBulanEl = document.getElementById("stat-bulan-filter");
  if (statBulanEl) {
    const curMonth = today.getMonth() + 1;
    const hasCurMonth = allRecords.some(r => {
      if (!r || !r.tarikh) return false;
      const parts = r.tarikh.split('-');
      return parts.length >= 2 && parseInt(parts[1], 10) === curMonth;
    });
    statBulanEl.value = hasCurMonth ? String(curMonth) : "";
  }

  // Inisialisasi Semakan Jadual Khas daripada Storan Tempatan
  initActiveTimetable();

  // Inisialisasi Butang Segerak Awan Header & Automatik Segerak Terus Dari Google Sheet
  setupCloudSync();
  await triggerCloudSync(false);

  // Muat semula paparan harian sekiranya terdapat data baharu daripada Google Sheet
  if (dateInput.value) {
    loadDailyScheduleForDate(dateInput.value);
  }

  renderPage5();

  // Permulaan Modul WhatsApp Guru Ganti
  setupWhatsAppModalEvents();

  renderPage5();

  // Permulaan Modul WhatsApp Guru Ganti
  setupWhatsAppModalEvents();

  // Permulaan Cetakan Slip Mini A4
  setupMiniSlipsPrint();

  // Permulaan Modul Import Jadual Waktu, Google Sheets & Profil Sekolah
  setupImportPageEvents();
  setupGoogleSheetsUI();
  setupSchoolProfileForm();

  // Inisialisasi Pengalaman Skrol Pantas & Butang Kembali Ke Atas (Scroll Experience)
  setupScrollExperience();
});

// Fungsi Navigasi Skrol Kembali Ke Atas (Taste and Craft)
function setupScrollExperience() {
  const backToTopBtn = document.getElementById("btn-back-to-top");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 280) {
      backToTopBtn.classList.remove("hidden");
    } else {
      backToTopBtn.classList.add("hidden");
    }
  }, { passive: true });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ========================================================
   MODUL HANTAR WHATSAPP INDIVIDU GURU GANTI
   ======================================================== */

const WA_PHONES_STORAGE_KEY = "eGuruGanti_teacher_phones";

function normalizeTeacherNameKey(name) {
  if (!name) return "";
  return name.toLowerCase()
    .replace(/^(en\.|pn\.|cik|datin|dato'|ustaz|ustazah)\s+/i, "")
    .replace(/\b(hj\.|haji)\s+/gi, "")
    .replace(/\b(abd\.|abdul)\s+/gi, "abdul ")
    .replace(/\b(mohd\.|muhd\.|muhammad)\s+/gi, "mohd ")
    .replace(/[^a-z0-9]/gi, "");
}

function getTeacherPhone(teacherName) {
  if (!teacherName) return "";
  try {
    const saved = localStorage.getItem(WA_PHONES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Abaikan nombor dummy lama permulaan 6011123456...
      if (parsed && parsed[teacherName] && !parsed[teacherName].includes("11123456")) {
        return parsed[teacherName];
      }
    }
  } catch (e) {
    console.warn("Gagal membaca nombor telefon guru:", e);
  }

  // 1. Padanan tepat daripada DEFAULT_TEACHER_PHONES
  if (typeof DEFAULT_TEACHER_PHONES !== "undefined") {
    if (DEFAULT_TEACHER_PHONES[teacherName]) {
      return DEFAULT_TEACHER_PHONES[teacherName];
    }
    // 2. Padanan fleksibel berdasarkan kunci normalisasi nama
    const norm = normalizeTeacherNameKey(teacherName);
    for (const [k, v] of Object.entries(DEFAULT_TEACHER_PHONES)) {
      if (normalizeTeacherNameKey(k) === norm) {
        return v;
      }
    }
  }

  // 3. Semakan Pegawai UBK (Jika didaftarkan)
  if (teacherName.toLowerCase().includes("ubk") && Array.isArray(UBK_TEACHER_OFFICERS) && UBK_TEACHER_OFFICERS.length > 0) {
    return UBK_TEACHER_OFFICERS[0].phone || "";
  }

  return "";
}

function setTeacherPhone(teacherName, phone) {
  if (!teacherName) return;
  try {
    let saved = {};
    const existing = localStorage.getItem(WA_PHONES_STORAGE_KEY);
    if (existing) {
      saved = JSON.parse(existing) || {};
    }
    saved[teacherName] = phone.trim();
    localStorage.setItem(WA_PHONES_STORAGE_KEY, JSON.stringify(saved));
  } catch (e) {
    console.warn("Gagal menyimpan nombor telefon guru:", e);
  }
}

function cleanPhoneNumber(phone) {
  if (!phone) return "";
  let p = phone.toString().replace(/\D/g, "");
  if (p.startsWith("600")) {
    p = "60" + p.slice(3);
  } else if (p.startsWith("0")) {
    p = "6" + p;
  } else if (p.startsWith("1") && p.length <= 10) {
    p = "60" + p;
  } else if (!p.startsWith("60") && p.length > 0) {
    p = "60" + p;
  }
  return p;
}

function generateTeacherWhatsAppText(teacherName, slots, dateStr, dayStr) {
  const dDisplay = formatDateDisplay(dateStr) || dateStr;
  let text = `*MAKLUMAN JADUAL GURU GANTI (MMI)*\n`;
  text += `*${APP_CONFIG.schoolName.toUpperCase()}*\n\n`;
  text += `📅 *Tarikh:* ${dDisplay} (${dayStr})\n`;
  text += `👤 *Guru Pengganti:* *${teacherName}*\n\n`;
  text += `Assalamualaikum / Salam Sejahtera Cikgu,\n`;
  text += `Anda telah ditugaskan untuk menggantikan kelas seperti ketetapan berikut:\n\n`;

  slots.forEach((s, idx) => {
    const cantumTag = s.isCantum ? " *(Cantum Kelas)*" : "";
    text += `📌 *Tugasan ${idx + 1}:*\n`;
    text += `• Masa: ${s.masa}\n`;
    text += `• Kelas: *${s.kelas}*\n`;
    text += `• Mata Pelajaran: *${s.subjek}*${cantumTag}\n`;
    if (s.guruAsal) text += `• Guru Asal: ${s.guruAsal}\n`;
    text += `\n`;
  });

  text += `📊 *Jumlah Waktu Ganti:* ${slots.length} Waktu\n\n`;
  text += `_Kerjasama dan komitmen cikgu amat dihargai._\n`;
  text += `_Terima kasih._\n\n`;
  text += `*${APP_CONFIG.schoolMotto || "Berilmu Berbakti"}*`;

  return text;
}

function collectReliefAssignments() {
  const grouped = {};
  const hv = dayInput.value || "Isnin";
  const absentTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
    .map(r => r.querySelector(".teacher-select") ? r.querySelector(".teacher-select").value.trim() : "")
    .filter(Boolean);

  [...entryRows.querySelectorAll(".schedule-row")].forEach(row => {
    const ganti = row.querySelector(".row-ganti") ? row.querySelector(".row-ganti").value.trim() : "";
    if (!ganti || ganti === "Pilih guru ganti" || isSpecialProgramRelief(ganti)) return;

    const masa = row.querySelector(".row-masa") ? row.querySelector(".row-masa").value.trim() : "";
    const subjek = row.querySelector(".row-subjek") ? row.querySelector(".row-subjek").value.trim() : "";
    const kelas = row.querySelector(".row-kelas") ? row.querySelector(".row-kelas").value.trim() : "";
    const guruAsal = row.dataset.guruTidakHadir || "";
    const sebab = row.dataset.sebab || "";

    const pInfo = typeof getConcurrentPartnerInfo === "function"
      ? getConcurrentPartnerInfo(kelas, hv, masa, subjek, absentTeachers)
      : null;
    const isCantum = pInfo && pInfo.nama === ganti;

    if (!grouped[ganti]) grouped[ganti] = [];
    grouped[ganti].push({ masa, subjek, kelas, guruAsal, sebab, isCantum });
  });

  return grouped;
}

function openWhatsAppModal() {
  const modal = document.getElementById("modal-whatsapp-individu");
  if (!modal) return;

  const dateStr = dateInput.value || "";
  const dayStr = dayInput.value || "Isnin";
  const dateDisplay = document.getElementById("wa-modal-date-display");
  if (dateDisplay) {
    dateDisplay.textContent = `Tarikh: ${formatDateDisplay(dateStr)} (${dayStr})`;
  }

  const grouped = collectReliefAssignments();
  const teachers = Object.keys(grouped);

  const activeAbsentTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
    .map(r => ({
      name: r.querySelector(".teacher-select") ? r.querySelector(".teacher-select").value.trim() : "",
      reason: r.querySelector(".reason-select") ? r.querySelector(".reason-select").value.trim() : ""
    }))
    .filter(t => t.name);

  const countBadge = document.getElementById("wa-modal-count-badge");
  if (countBadge) {
    countBadge.textContent = `${teachers.length} Guru Pengganti`;
  }

  const bodyEl = document.getElementById("wa-modal-body");
  if (!bodyEl) return;
  bodyEl.innerHTML = "";

  if (teachers.length === 0) {
    if (activeAbsentTeachers.length > 0) {
      // Ada guru tidak hadir tetapi semuanya Program Sekolah (tiada guru pengganti diperlukan)
      const absentLines = activeAbsentTeachers.map(t => `• *${t.name}* (${t.reason})`).join("\n");
      const waProgramText = `*MAKLUMAN KEHADIRAN & STATUS PdP GURU*\n` +
        `*${APP_CONFIG.schoolName.toUpperCase()}*\n\n` +
        `📅 *Tarikh:* ${formatDateDisplay(dateStr) || dateStr} (${dayStr})\n` +
        `🗓️ *Minggu:* ${mingguSelect.value || "—"} | 👥 *Kumpulan:* ${kumpulanSelect.value || "—"}\n\n` +
        `📋 *GURU TIDAK HADIR / DIKECUALIKAN (${activeAbsentTeachers.length} Orang):*\n` +
        `${absentLines}\n\n` +
        `🏛️ *STATUS PENGGANTIAN: PROGRAM SEKOLAH (TIADA GANTIAN)*\n` +
        `Semua waktu pengajaran dan pembelajaran (PdP) yang terlibat ditangguhkan atau diselaraskan di bawah Program Rasmi Sekolah. Tiada jadual guru ganti yang dikeluarkan.\n\n` +
        `_Portal e-GGs ${APP_CONFIG.schoolName}_`;

      bodyEl.innerHTML = `
        <div style="padding:1.5rem 1rem; text-align:center;">
          <div style="width:58px; height:58px; background:#ede9fe; border:2px solid #c7d2fe; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
            <i data-lucide="calendar-check" style="width:32px;height:32px; color:#4f46e5;"></i>
          </div>
          <div style="display:inline-block; padding:3px 12px; background:#e0e7ff; color:#3730a3; font-size:11px; font-weight:800; border-radius:9999px; margin-bottom:8px;">
            PROGRAM SEKOLAH (TIADA GANTIAN)
          </div>
          <h3 style="font-size:1.2rem; font-weight:800; color:#312e81; margin:0 0 6px;">
            STATUS PdP: DIKECUALIKAN GURU GANTI
          </h3>
          <p style="font-size:0.88rem; color:#4338ca; max-width:500px; margin:0 auto 16px; line-height:1.5;">
            Terdapat <strong>${activeAbsentTeachers.length} orang guru tidak hadir</strong> tetapi waktu PdP terlibat diselaraskan di bawah Program Rasmi Sekolah tanpa penggantian guru lain.
          </p>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; max-width:520px; margin:0 auto 16px; text-align:left; font-family:monospace; font-size:12px; white-space:pre-wrap; color:#334155; line-height:1.5;">${waProgramText}</div>

          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            <button type="button" id="btn-copy-wa-program" class="action-btn btn-secondary" style="font-weight:700;">
              <i data-lucide="copy" style="width:16px;height:16px;"></i> Salin Makluman
            </button>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(waProgramText)}" target="_blank" class="action-btn btn-whatsapp-action" style="font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
              <i data-lucide="send" style="width:16px;height:16px;"></i> Hantar ke WhatsApp Group
            </a>
          </div>
        </div>
      `;

      document.getElementById("btn-copy-wa-program")?.addEventListener("click", () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(waProgramText).then(() => {
            showToast("Makluman Program Sekolah berjaya disalin untuk WhatsApp!", "success");
          }).catch(() => fallbackCopyText(waProgramText));
        } else {
          fallbackCopyText(waProgramText);
        }
      });

      if (window.lucide) window.lucide.createIcons();
      modal.classList.remove("hidden");
      return;
    }

    const waAllPresentText = `*MAKLUMAN KEHADIRAN GURU ${APP_CONFIG.schoolName.toUpperCase()}*\n` +
      `Tarikh: ${formatDateDisplay(dateStr) || dateStr} (${dayStr})\n` +
      `Minggu: ${mingguSelect.value || "—"} | Kumpulan: ${kumpulanSelect.value || "—"}\n\n` +
      `*STATUS: SEMUA GURU HADIR / TIADA PENGGANTIAN*\n` +
      `Alhamdulillah, semua guru ${APP_CONFIG.schoolName} dilaporkan hadir bertugas pada hari ini. Semua sesi Pengajaran & Pembelajaran (PdP) berjalan sepenuhnya mengikut Jadual Waktu Induk asal tanpa sebarang penggantian.\n\n` +
      `Terima kasih atas komitmen dan dedikasi semua warga pendidik.\n` +
      `_Portal e-GGs ${APP_CONFIG.schoolName}_`;

    bodyEl.innerHTML = `
      <div style="padding:1.5rem 1rem; text-align:center;">
        <div style="width:58px; height:58px; background:#ecfdf5; border:2px solid #a7f3d0; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
          <i data-lucide="shield-check" style="width:32px;height:32px; color:#059669;"></i>
        </div>
        <div style="display:inline-block; padding:3px 12px; background:#d1fae5; color:#065f46; font-size:11px; font-weight:800; border-radius:9999px; margin-bottom:8px;">
          STATUS RASMI HARIAN
        </div>
        <h3 style="font-size:1.2rem; font-weight:800; color:#065f46; margin:0 0 6px;">
          SEMUA GURU HADIR / TIADA PENGGANTIAN
        </h3>
        <p style="font-size:0.88rem; color:#047857; max-width:480px; margin:0 auto 16px; line-height:1.5;">
          Bagi tarikh <strong>${formatDateDisplay(dateStr) || dateStr} (${dayStr})</strong>, tiada guru ganti diperlukan kerana semua guru hadir bertugas. Anda boleh menyalin atau menghantar makluman kehadiran penuh ini terus ke WhatsApp Group sekolah.
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; max-width:520px; margin:0 auto 16px; text-align:left; font-family:monospace; font-size:12px; white-space:pre-wrap; color:#334155; line-height:1.5;">${waAllPresentText}</div>

        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button type="button" id="btn-copy-wa-all-present" class="action-btn btn-secondary" style="font-weight:700;">
            <i data-lucide="copy" style="width:16px;height:16px;"></i> Salin Makluman
          </button>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(waAllPresentText)}" target="_blank" class="action-btn btn-whatsapp-action" style="font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="send" style="width:16px;height:16px;"></i> Hantar ke WhatsApp Group
          </a>
        </div>
      </div>
    `;

    document.getElementById("btn-copy-wa-all-present")?.addEventListener("click", () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(waAllPresentText).then(() => {
          showToast("Makluman Semua Guru Hadir berjaya disalin untuk WhatsApp Group!", "success");
        }).catch(() => fallbackCopyText(waAllPresentText));
      } else {
        fallbackCopyText(waAllPresentText);
      }
    });

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  teachers.forEach(teacherName => {
    const slots = grouped[teacherName];
    const isUBK = teacherName === "Guru UBK" || teacherName.toLowerCase().includes("ubk");
    const hasUbkOfficers = Array.isArray(UBK_TEACHER_OFFICERS) && UBK_TEACHER_OFFICERS.length > 0;
    let currentTeacherRecipient = (isUBK && hasUbkOfficers) ? `${UBK_TEACHER_OFFICERS[0].nama} (Guru UBK)` : teacherName;
    let phone = getTeacherPhone(teacherName);

    if (isUBK && !phone && hasUbkOfficers) {
      phone = UBK_TEACHER_OFFICERS[0].phone || "";
    }

    const col = typeof getTeacherColor === "function" ? getTeacherColor(teacherName) : { primary: "#16a34a" };
    const initial = isUBK ? "UBK" : (teacherName.replace(/^(En\.|Pn\.|Cik|Datin|Dato'|Ustaz|Ustazah)\s+/i, "").charAt(0) || "G");

    const card = document.createElement("div");
    card.className = "wa-teacher-card";

    let slotsHtml = slots.map(s => {
      const cantumBadge = s.isCantum
        ? `<span style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:700; padding:1px 6px; border-radius:4px; margin-left:4px;">Cantum Kelas</span>`
        : "";
      return `
        <div class="wa-slot-item">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span class="wa-slot-pill">${s.masa}</span>
            <span style="font-weight:700; color:var(--text-primary);">${s.kelas}</span>
            <span style="color:var(--text-secondary);">&bull;</span>
            <span style="font-weight:700; color:#1d4ed8;">${s.subjek}</span>
            ${cantumBadge}
          </div>
          <div style="font-size:11px; color:var(--text-secondary); white-space:nowrap;">
            Ganti: <span style="font-weight:600; color:var(--text-primary);">${s.guruAsal || "—"}</span>
          </div>
        </div>
      `;
    }).join("");

    const previewId = "wa-preview-" + teacherName.replace(/[^a-zA-Z0-9]/g, '_');

    let ubkToggleHtml = "";
    if (isUBK && hasUbkOfficers) {
      ubkToggleHtml = `
        <div class="wa-ubk-toggle">
          <span style="font-size:11px; font-weight:700; color:var(--text-secondary);"><i data-lucide="users" style="width:13px;height:13px;display:inline;vertical-align:-2px;margin-right:2px;"></i> Pegawai UBK:</span>
          ${UBK_TEACHER_OFFICERS.map((off, idx) => `<button type="button" class="wa-ubk-btn ${idx === 0 ? 'active' : ''}" data-officer="${off.nama}" data-phone="${off.phone || ''}">${off.nama} (${off.phone || '—'})</button>`).join("")}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="wa-teacher-header">
        <div class="wa-teacher-info">
          <div class="wa-teacher-avatar" style="background:${col.primary};">${initial}</div>
          <div>
            <div class="wa-teacher-name" id="wa-name-${previewId}">${isUBK ? 'Guru UBK' : teacherName}</div>
            <div style="font-size:11px; color:var(--text-secondary);">Ditugaskan untuk ${slots.length} waktu kelas</div>
          </div>
        </div>
        <span class="wa-periods-badge">${slots.length} Waktu Ganti</span>
      </div>

      ${ubkToggleHtml}

      <div class="wa-phone-row">
        <label><i data-lucide="phone" style="width:14px;height:14px;display:inline;vertical-align:-2px;margin-right:2px;"></i> No. WhatsApp:</label>
        <input type="tel" class="wa-phone-input" value="${phone}" placeholder="cth: +60123456789 atau 012-3456789" data-teacher="${teacherName}">
      </div>

      <div class="wa-slots-container">
        ${slotsHtml}
      </div>

      <div class="wa-card-actions">
        <button type="button" class="btn-wa-send" data-teacher="${teacherName}">
          <i data-lucide="message-circle" style="width:16px;height:16px;"></i> Hantar WhatsApp
        </button>
        <button type="button" class="btn-wa-copy" data-teacher="${teacherName}">
          <i data-lucide="copy" style="width:15px;height:15px;"></i> Salin Mesej
        </button>
        <button type="button" class="btn-wa-preview" data-target="${previewId}">
          <i data-lucide="eye" style="width:14px;height:14px;"></i> <span>Lihat Teks</span>
        </button>
      </div>

      <div class="wa-preview-text-box hidden" id="${previewId}"></div>
    `;

    // UBK Toggle Listener
    if (isUBK) {
      const ubkBtns = card.querySelectorAll(".wa-ubk-btn");
      ubkBtns.forEach(b => {
        b.addEventListener("click", () => {
          ubkBtns.forEach(btn => btn.classList.remove("active"));
          b.classList.add("active");
          const officer = b.dataset.officer;
          const officerPhone = b.dataset.phone;
          currentTeacherRecipient = `${officer} (Guru UBK)`;
          const pInput = card.querySelector(".wa-phone-input");
          if (pInput) {
            pInput.value = officerPhone;
            setTeacherPhone("Guru UBK", officerPhone);
          }
          const pBox = card.querySelector(`#${previewId}`);
          if (pBox && !pBox.classList.contains("hidden")) {
            pBox.textContent = generateTeacherWhatsAppText(currentTeacherRecipient, slots, dateInput.value, dayInput.value);
          }
          showToast(`Dipilih: ${officer}`, "success");
        });
      });
    }

    // Listener Simpan Nombor Telefon secara Real-time
    const phoneInput = card.querySelector(".wa-phone-input");
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        setTeacherPhone(teacherName, e.target.value);
      });
    }

    // Listener Butang Hantar WhatsApp
    const sendBtn = card.querySelector(".btn-wa-send");
    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        const currentPhone = phoneInput ? phoneInput.value.trim() : getTeacherPhone(teacherName);
        const clean = cleanPhoneNumber(currentPhone);
        if (!clean || clean.length < 8) {
          showToast(`Sila masukkan nombor WhatsApp yang sah untuk ${currentTeacherRecipient}.`, "error");
          if (phoneInput) phoneInput.focus();
          return;
        }
        setTeacherPhone(teacherName, currentPhone);
        const text = generateTeacherWhatsAppText(currentTeacherRecipient, slots, dateInput.value, dayInput.value);
        const waUrl = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`;
        window.open(waUrl, "_blank");
        showToast(`Membuka WhatsApp untuk ${currentTeacherRecipient}...`, "success");
      });
    }

    // Listener Butang Salin Mesej
    const copyBtn = card.querySelector(".btn-wa-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const text = generateTeacherWhatsAppText(currentTeacherRecipient, slots, dateInput.value, dayInput.value);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            showToast(`Mesej WhatsApp untuk ${currentTeacherRecipient} berjaya disalin!`, "success");
          }).catch(() => {
            fallbackCopyText(text);
          });
        } else {
          fallbackCopyText(text);
        }
      });
    }

    // Listener Butang Lihat Pratonton Mesej
    const previewBtn = card.querySelector(".btn-wa-preview");
    const previewBox = card.querySelector(`#${previewId}`);
    if (previewBtn && previewBox) {
      previewBtn.addEventListener("click", () => {
        const isHidden = previewBox.classList.contains("hidden");
        if (isHidden) {
          const text = generateTeacherWhatsAppText(currentTeacherRecipient, slots, dateInput.value, dayInput.value);
          previewBox.textContent = text;
          previewBox.classList.remove("hidden");
          const span = previewBtn.querySelector("span");
          if (span) span.textContent = "Tutup Teks";
        } else {
          previewBox.classList.add("hidden");
          const span = previewBtn.querySelector("span");
          if (span) span.textContent = "Lihat Teks";
        }
      });
    }

    bodyEl.appendChild(card);
  });

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeWhatsAppModal() {
  const modal = document.getElementById("modal-whatsapp-individu");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast("Mesej WhatsApp berjaya disalin!", "success");
  } catch (err) {
    showToast("Gagal menyalin teks ke papan klip.", "error");
  }
  ta.remove();
}

function setupWhatsAppModalEvents() {
  const openBtn = document.getElementById("btn-open-wa-modal");
  if (openBtn) {
    openBtn.addEventListener("click", openWhatsAppModal);
  }

  const closeBtn = document.getElementById("wa-modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeWhatsAppModal);
  }

  const doneBtn = document.getElementById("wa-modal-btn-done");
  if (doneBtn) {
    doneBtn.addEventListener("click", closeWhatsAppModal);
  }

  const modal = document.getElementById("modal-whatsapp-individu");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeWhatsAppModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeWhatsAppModal();
    }
  });

  // Butang Siaran WhatsApp Group Sekolah
  const btnCopyGroup = document.getElementById("btn-wa-copy-group");
  if (btnCopyGroup) {
    btnCopyGroup.addEventListener("click", () => {
      const summaryText = generateDailyFullWhatsAppSummary();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summaryText).then(() => {
          showToast("Ringkasan jadual untuk Group WhatsApp sekolah berjaya disalin!", "success");
        }).catch(() => {
          fallbackCopyText(summaryText);
        });
      } else {
        fallbackCopyText(summaryText);
      }
    });
  }

  const btnOpenGroup = document.getElementById("btn-wa-open-group");
  if (btnOpenGroup) {
    btnOpenGroup.addEventListener("click", () => {
      const summaryText = generateDailyFullWhatsAppSummary();
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
      window.open(url, "_blank");
      showToast("Membuka WhatsApp untuk menghantar siaran...", "success");
    });
  }

  const btnPreviewGroup = document.getElementById("btn-wa-preview-group");
  const boxGroup = document.getElementById("wa-group-preview-box");
  const labelGroup = document.getElementById("label-preview-group");
  if (btnPreviewGroup && boxGroup) {
    btnPreviewGroup.addEventListener("click", () => {
      const isHidden = boxGroup.classList.contains("hidden");
      if (isHidden) {
        boxGroup.textContent = generateDailyFullWhatsAppSummary();
        boxGroup.classList.remove("hidden");
        if (labelGroup) labelGroup.textContent = "Tutup Teks";
      } else {
        boxGroup.classList.add("hidden");
        if (labelGroup) labelGroup.textContent = "Lihat Teks";
      }
    });
  }
}

// Penjana Teks Ringkasan Penuh Jadual Harian untuk WhatsApp Group Sekolah
function generateDailyFullWhatsAppSummary() {
  const dateStr = dateInput.value || "";
  const dayStr = dayInput.value || "Isnin";
  const dDisplay = formatDateDisplay(dateStr) || dateStr;
  const mingguStr = mingguSelect.value || "—";
  const kumpulanStr = kumpulanSelect.value || "—";

  const trs = [...teachersContainer.querySelectorAll(".teacher-row")];
  const absentList = trs.map(r => {
    const n = r.querySelector(".teacher-select") ? r.querySelector(".teacher-select").value.trim() : "";
    const re = r.querySelector(".reason-select") ? r.querySelector(".reason-select").value.trim() : "";
    return n ? `• *${n}* (${re || "Tiada Catatan"})` : null;
  }).filter(Boolean);

  const grouped = collectReliefAssignments();
  const reliefTeachers = Object.keys(grouped);

  let text = `*JADUAL GURU GANTI (MMI)*\n`;
  text += `*${APP_CONFIG.schoolName}*\n\n`;
  text += `📅 *Tarikh:* ${dDisplay} (${dayStr})\n`;
  text += `🗓️ *Minggu:* ${mingguStr}\n`;
  text += `👥 *Kumpulan Bertugas:* ${kumpulanStr}\n\n`;

  text += `📋 *GURU TIDAK HADIR (${absentList.length} Orang):*\n`;
  if (absentList.length === 0) {
    text += `_Tiada guru tidak hadir._\n`;
  } else {
    text += absentList.join("\n") + `\n`;
  }
  text += `\n`;

  text += `📌 *PENUGASAN GURU GANTI (${reliefTeachers.length} Guru):*\n`;
  if (reliefTeachers.length === 0) {
    if (absentList.length > 0) {
      text += `_Tiada penugasan guru ganti (Semua kelas terlibat diselaraskan di bawah Program Rasmi Sekolah / Dikecualikan Gantian)._\n`;
    } else {
      text += `_Tiada penugasan guru ganti ditetapkan (Semua guru hadir)._\n`;
    }
  } else {
    reliefTeachers.forEach((tName, i) => {
      const slots = grouped[tName];
      const slotLines = slots.map(s => `  ↳ ${s.masa} | *${s.kelas}* (${s.subjek}) [Ganti: ${s.guruAsal || "—"}]${s.isCantum ? ' _(Cantum)_' : ''}`).join("\n");
      text += `${i + 1}. *${tName}* (${slots.length} Waktu):\n${slotLines}\n`;
    });
  }

  text += `\n_Kerjasama semua guru amat dihargai demi memastikan MMI sentiasa terpelihara._\n`;
  text += `*${APP_CONFIG.schoolMotto}*`;
  return text;
}

/* ========================================================
   MODUL CETAKAN SLIP MINI FIZIKAL (3-4 SLIP SEHELAI A4)
   ======================================================== */
function setupMiniSlipsPrint() {
  const btn = document.getElementById("print-mini-slips-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const grouped = collectReliefAssignments();
    const teachers = Object.keys(grouped);
    if (teachers.length === 0) {
      showToast("Sila lengkapkan sekurang-kurangnya satu penugasan guru ganti sebelum mencetak slip mini.", "error");
      return;
    }

    const tarikhStr = dateInput.value ? formatDateDisplay(dateInput.value) : "—";
    const hariStr = dayInput.value || "—";
    const mingguStr = mingguSelect.value || "—";
    const kumpulanStr = kumpulanSelect.value || "—";

    let cardsHtml = "";
    teachers.forEach((tName, idx) => {
      const slots = grouped[tName];
      const absentNames = [...new Set(slots.map(s => s.guruAsal).filter(Boolean))].join(", ") || "—";
      const reasons = [...new Set(slots.map(s => s.sebab).filter(Boolean))].join(", ") || "—";

      let rowsHtml = slots.map(s => `
        <tr style="border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 5px 8px; font-weight: bold; font-family: monospace; font-size: 11px;">${s.masa}</td>
          <td style="padding: 5px 8px; font-weight: 700; font-size: 11px;">${s.kelas}</td>
          <td style="padding: 5px 8px; font-size: 11px; font-weight: 600; color: #1d4ed8;">${s.subjek}</td>
          <td style="padding: 5px 8px; font-size: 10px; color: #475569;">${s.guruAsal ? `Ganti: ${s.guruAsal}` : '—'} ${s.isCantum ? '<strong style="color:#16a34a;">(Cantum)</strong>' : ''}</td>
        </tr>
      `).join("");

      cardsHtml += `
        <div class="mini-slip-card" style="border: 1.5px solid #1e293b; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; background: #fff; page-break-inside: avoid; break-inside: avoid; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
          <!-- Header Slip -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo}" alt="Logo" style="width: 42px; height: 42px; object-fit: contain; border-radius: 50%;">
              <div>
                <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase;">${APP_CONFIG.schoolName}</div>
                <div style="font-size: 10px; font-weight: 700; color: #0284c7; letter-spacing: 0.05em;">SLIP GURU GANTI (MMI)</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 10px; color: #475569;">
              <div><strong>${tarikhStr}</strong> (${hariStr})</div>
              <div>${mingguStr} • ${kumpulanStr}</div>
            </div>
          </div>

          <!-- Penerima & Maklumat Penggantian -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; font-size: 11px;">
            <div><strong>Guru Pengganti:</strong> <span style="color: #1e3a8a; font-weight: 800;">${tName}</span></div>
            <div><strong>Menggantikan:</strong> <span style="color: #b91c1c; font-weight: 700;">${absentNames}</span> <span style="font-size:10px; color:#64748b;">(${reasons})</span></div>
          </div>

          <!-- Jadual Waktu Ganti -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px;">
            <thead>
              <tr style="background: #e2e8f0; text-align: left; color: #1e293b;">
                <th style="padding: 4px 8px; font-size: 10px;">WAKTU / MASA</th>
                <th style="padding: 4px 8px; font-size: 10px;">KELAS</th>
                <th style="padding: 4px 8px; font-size: 10px;">MATA PELAJARAN</th>
                <th style="padding: 4px 8px; font-size: 10px;">CATATAN</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- Tandatangan Dual -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding-top: 6px; border-top: 1px dotted #cbd5e1; font-size: 10px; color: #475569;">
            <div style="border-top: 1px solid #94a3b8; margin-top: 26px; padding-top: 3px; text-align: center;">
              Tandatangan Pentadbir / Penyelaras Jadual
            </div>
            <div style="border-top: 1px solid #94a3b8; margin-top: 26px; padding-top: 3px; text-align: center;">
              Akuan Terima Guru Pengganti
            </div>
          </div>
        </div>
        ${idx < teachers.length - 1 ? '<div class="mini-slip-cut-line" style="border-top: 1.5px dashed #94a3b8; margin: 16px 0; position: relative; text-align: right;"><span style="position: relative; top: -10px; background: #fff; padding: 0 8px; font-size: 10px; color: #64748b;">✂ Potong Di Sini</span></div>' : ''}
      `;
    });

    const win = window.open("", "_blank");
    if (!win) {
      showToast("Sila benarkan pop-up pada pelayar web anda untuk mencetak slip mini.", "error");
      return;
    }

    win.document.write(`<!DOCTYPE html>
    <html lang="ms">
    <head>
      <meta charset="UTF-8">
      <title>Slip Guru Ganti Mini (A4) - ${tarikhStr}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #f1f5f9; color: #0f172a; padding: 20px; }
        .page-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 8px; }
        .btn-print { background: #0284c7; color: #fff; border: none; padding: 10px 24px; font-weight: bold; border-radius: 8px; cursor: pointer; margin: 0 auto 16px; display: block; font-size: 14px; }
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          body { background: #fff; padding: 0; }
          .page-container { box-shadow: none; padding: 0; max-width: 100%; }
          .btn-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">🖨️ Cetak Slip Mini A4 (3-4 Slip Sehelai)</button>
      <div class="page-container">
        ${cardsHtml}
      </div>
    </body>
    </html>`);
    win.document.close();
  });
}

/* ========================================================
   MODUL URUS & IMPORT JADUAL WAKTU, TETAPAN SEKOLAH & GOOGLE SHEETS
   ======================================================== */
let parsedImportData = null;

function updateSchoolBrandingDOM() {
  const logoSrc = APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo || "assets/images/logo-sekolah.svg";
  const nameStr = APP_CONFIG.schoolName || "NAMA SEKOLAH ANDA";
  const addrStr = APP_CONFIG.schoolAddress || "ALAMAT SURAT-MENYURAT SEKOLAH ANDA";
  const ppdStr = APP_CONFIG.schoolPPD || "Pejabat Pendidikan Daerah / Jabatan Pendidikan Negeri";

  const headerLogo = document.getElementById("header-school-logo");
  const headerName = document.getElementById("header-school-name");
  const headerAddr = document.getElementById("header-school-address");
  if (headerLogo) headerLogo.src = logoSrc;
  if (headerName) headerName.textContent = nameStr.toUpperCase();
  if (headerAddr) headerAddr.textContent = addrStr.toUpperCase();

  const loginLogo = document.getElementById("login-school-logo");
  const loginName = document.getElementById("login-school-name");
  if (loginLogo) loginLogo.src = logoSrc;
  if (loginName) loginName.textContent = nameStr.toUpperCase();

  const footerLogo = document.getElementById("footer-school-logo");
  const footerName = document.getElementById("footer-school-name");
  const footerPpd = document.getElementById("footer-school-ppd");
  const footerCopy = document.getElementById("footer-school-copyright-name");
  if (footerLogo) footerLogo.src = logoSrc;
  if (footerName) footerName.textContent = nameStr.toUpperCase();
  if (footerPpd) footerPpd.textContent = ppdStr;
  if (footerCopy) footerCopy.textContent = nameStr;

  document.title = `e-GGs (e-Guru Ganti Sekolah) — ${nameStr}`;
}

function refreshAllTeacherDropdowns() {
  const teacherSelects = document.querySelectorAll(".teacher-select");
  teacherSelects.forEach(s => {
    const val = s.value;
    s.innerHTML = `<option value="">PILIH NAMA GURU</option>` +
      MASTER_TEACHERS.map(t => `<option value="${t}">${t}</option>`).join("");
    if (val && MASTER_TEACHERS.includes(val)) s.value = val;
  });
  updateGroupMembers();
}

function applySchoolData(schoolData, saveToStorage = true) {
  if (!schoolData || typeof schoolData !== "object") return;

  // 1. Profil Sekolah (Menyokong kedua-dua kunci 'profile' dan 'settings')
  const p = schoolData.profile || schoolData.settings;
  if (p && typeof p === "object") {
    if (p.schoolName && p.schoolName !== "NAMA SEKOLAH ANDA") APP_CONFIG.schoolName = p.schoolName;
    if (p.schoolCode && p.schoolCode !== "KOD SEKOLAH") APP_CONFIG.schoolCode = p.schoolCode;
    if (p.schoolAddress && p.schoolAddress !== "ALAMAT SURAT-MENYURAT SEKOLAH ANDA") APP_CONFIG.schoolAddress = p.schoolAddress;
    if (p.schoolMotto) APP_CONFIG.schoolMotto = p.schoolMotto;
    if (p.schoolSubMotto) APP_CONFIG.schoolSubMotto = p.schoolSubMotto;
    if (p.schoolPPD) APP_CONFIG.schoolPPD = p.schoolPPD;
    if (p.schoolLogo && String(p.schoolLogo).trim() !== "") {
      if (p.schoolLogo.startsWith("data:image")) {
        APP_CONFIG.schoolLogoBase64 = p.schoolLogo;
      } else if (p.schoolLogo !== "assets/images/logo-sekolah.svg" || !APP_CONFIG.schoolLogoBase64) {
        APP_CONFIG.schoolLogo = p.schoolLogo;
        APP_CONFIG.schoolLogoBase64 = "";
      }
    }
    if (p.defaultUser && APP_CONFIG.auth) APP_CONFIG.auth.defaultUser = p.defaultUser;
    if (p.defaultPass && APP_CONFIG.auth) APP_CONFIG.auth.defaultPass = p.defaultPass;
    if (p.overloadThresholdDaily) APP_CONFIG.overloadThresholdDaily = Number(p.overloadThresholdDaily) || 8;
    if (p.overloadThresholdWeekly) APP_CONFIG.overloadThresholdWeekly = Number(p.overloadThresholdWeekly) || 8;
  }

  // 2. Waktu Slot
  if (Array.isArray(schoolData.slots) && schoolData.slots.length > 1) {
    STANDARD_SLOTS = schoolData.slots;
  } else if (schoolData.slots && typeof schoolData.slots === "object" && !Array.isArray(schoolData.slots)) {
    const slotArr = [""];
    const rIndices = [];
    Object.keys(schoolData.slots).sort((a, b) => Number(a) - Number(b)).forEach(k => {
      const idx = Number(k);
      const item = schoolData.slots[k];
      if (idx > 0 && item && item.masa) {
        slotArr[idx] = item.masa;
        if (item.isRehat) rIndices.push(idx);
      }
    });
    if (slotArr.length > 1) STANDARD_SLOTS = slotArr;
    if (rIndices.length > 0) REHAT_SLOT_INDICES = rIndices;
  }
  if (Array.isArray(schoolData.rehatIndices) && schoolData.rehatIndices.length > 0) {
    REHAT_SLOT_INDICES = schoolData.rehatIndices;
  }

  // 3. Senarai Guru, Kumpulan Bertugas, No WhatsApp & Kod Warna Automatik Guru
  if (Array.isArray(schoolData.teachers) && schoolData.teachers.length > 0) {
    MASTER_TEACHERS = schoolData.teachers.filter(t => t && String(t).trim().toLowerCase() !== "nama guru" && String(t).trim().toLowerCase() !== "nama_guru");
  }
  const groupsObj = schoolData.groups || schoolData.teacherGroups;
  if (groupsObj && typeof groupsObj === "object") {
    const cleanedGroups = {};
    Object.entries(groupsObj).forEach(([gName, list]) => {
      if (Array.isArray(list)) {
        cleanedGroups[gName] = list.filter(t => t && String(t).trim().toLowerCase() !== "nama guru");
      }
    });
    TEACHER_GROUPS = cleanedGroups;
  }

  // Pemulihan Pintar: Jika tajuk Google Sheet lama menyebabkan Kumpulan Bertugas termasuk ke dalam 'phones' dan No Telefon termasuk ke dalam 'teacherSessions'
  const phonesObj = schoolData.phones || schoolData.teacherPhones;
  const sessionsObj = schoolData.teacherSessions || {};
  if (phonesObj && typeof phonesObj === "object") {
    Object.entries(phonesObj).forEach(([guru, val]) => {
      if (!guru || guru.toLowerCase() === "nama guru") return;
      const strVal = String(val || "").trim();
      if (/^(kumpulan\s*[1-9]|[1-9])$/i.test(strVal)) {
        const grpNum = strVal.match(/([1-9])/)[1];
        const normGrp = `Kumpulan ${grpNum}`;
        if (!TEACHER_GROUPS[normGrp]) TEACHER_GROUPS[normGrp] = [];
        if (!TEACHER_GROUPS[normGrp].includes(guru)) {
          TEACHER_GROUPS[normGrp].push(guru);
        }
        // Semak jika nombor telefon berada dalam teacherSessions[guru]
        const sesVal = String(sessionsObj[guru] || "").trim();
        if (/^\+?6?01[\d\-\s]{6,12}$/.test(sesVal)) {
          DEFAULT_TEACHER_PHONES[guru] = sesVal;
        }
      } else if (strVal && !/^6\.01e\+\d+$/i.test(strVal)) {
        DEFAULT_TEACHER_PHONES[guru] = strVal;
      }
    });
  }

  const colorsObj = schoolData.colors || schoolData.teacherColors;
  if (colorsObj && typeof colorsObj === "object" && typeof TEACHER_CUSTOM_COLORS === "object") {
    Object.entries(colorsObj).forEach(([guru, hex]) => {
      if (guru && guru.toLowerCase() !== "nama guru" && hex && typeof hexToTeacherPalette === "function") {
        const pal = hexToTeacherPalette(hex);
        if (pal) TEACHER_CUSTOM_COLORS[guru] = pal;
      }
    });
  }

  // 4. Jadual Waktu Guru & Kelas (Menyokong format [guru][hari] dan [hari][guru])
  const rawTT = schoolData.timetableByTeacher || schoolData.timetable;
  if (rawTT && typeof rawTT === "object") {
    Object.keys(TIMETABLE).forEach(k => delete TIMETABLE[k]);
    const dayKeys = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat"];
    const topKeys = Object.keys(rawTT);
    const isKeyedByDay = topKeys.length > 0 && topKeys.every(k => dayKeys.includes(k));
    if (isKeyedByDay) {
      topKeys.forEach(hari => {
        const dayMap = rawTT[hari] || {};
        Object.entries(dayMap).forEach(([guru, slots]) => {
          if (!guru || guru.toLowerCase() === "nama guru") return;
          if (!TIMETABLE[guru]) TIMETABLE[guru] = {};
          TIMETABLE[guru][hari] = slots;
        });
      });
    } else {
      Object.assign(TIMETABLE, rawTT);
    }
    // Buang sebarang entri header yang tersesat
    Object.keys(TIMETABLE).forEach(k => {
      if (k.toLowerCase() === "nama guru") delete TIMETABLE[k];
    });
  }

  // Tapis senarai kelas daripada perkataan "Kelas" atau "Nama Guru"
  const cleanClasses = (Array.isArray(schoolData.classes) ? schoolData.classes : [])
    .filter(c => c && String(c).trim().toLowerCase() !== "kelas" && String(c).trim().toLowerCase() !== "nama guru");

  if (typeof rebuildClassTimetablesFromMaster === "function") {
    rebuildClassTimetablesFromMaster(cleanClasses);
  }

  if (saveToStorage) {
    try {
      const savedColorsHex = {};
      if (typeof TEACHER_CUSTOM_COLORS === "object") {
        Object.entries(TEACHER_CUSTOM_COLORS).forEach(([g, pal]) => {
          if (pal && pal.hex) savedColorsHex[g] = pal.hex;
        });
      }
      localStorage.setItem(APP_CONFIG.storageKeys.schoolDataCache, JSON.stringify({
        profile: {
          schoolName: APP_CONFIG.schoolName,
          schoolCode: APP_CONFIG.schoolCode,
          schoolAddress: APP_CONFIG.schoolAddress,
          schoolMotto: APP_CONFIG.schoolMotto,
          schoolSubMotto: APP_CONFIG.schoolSubMotto,
          schoolPPD: APP_CONFIG.schoolPPD,
          schoolLogo: APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo,
          defaultUser: APP_CONFIG.auth ? APP_CONFIG.auth.defaultUser : "admin",
          defaultPass: APP_CONFIG.auth ? APP_CONFIG.auth.defaultPass : "admin123"
        },
        slots: STANDARD_SLOTS,
        rehatIndices: REHAT_SLOT_INDICES,
        teachers: MASTER_TEACHERS,
        groups: TEACHER_GROUPS,
        phones: DEFAULT_TEACHER_PHONES,
        colors: savedColorsHex,
        classes: (typeof ALL_MASTER_CLASSES !== "undefined" && Array.isArray(ALL_MASTER_CLASSES)) ? ALL_MASTER_CLASSES : cleanClasses,
        timetable: TIMETABLE
      }));
    } catch (e) {
      console.warn("Gagal menyimpan schoolData ke localStorage:", e);
    }
  }

  updateSchoolBrandingDOM();
  refreshAllTeacherDropdowns();
  updateGroupMembers();
  if (typeof kemasKiniSemuaCadanganGuruGanti === "function") {
    kemasKiniSemuaCadanganGuruGanti();
  }
  populateCalendarClassFilter();
  renderImportPage();

  // Segar semula paparan halaman yang sedang aktif
  const p2 = document.getElementById("page2");
  if (p2 && !p2.classList.contains("page-hidden") && typeof renderPage2 === "function") renderPage2();
  const p3 = document.getElementById("page3");
  if (p3 && !p3.classList.contains("page-hidden") && typeof renderPage3 === "function") renderPage3();
  const p6 = document.getElementById("page6");
  if (p6 && !p6.classList.contains("page-hidden") && typeof renderPage6 === "function") renderPage6();
  const p7 = document.getElementById("page7");
  if (p7 && !p7.classList.contains("page-hidden") && typeof renderCalendar === "function") renderCalendar();
}

function renderImportPage() {
  const sourceEl = document.getElementById("import-status-source");
  const teachersCountEl = document.getElementById("import-status-teachers-count");
  const slotsCountEl = document.getElementById("import-status-slots-count");
  const gsStatusBadge = document.getElementById("gas-status-badge");
  const displayGasUrl = document.getElementById("display-current-gas-url");

  const activeGasUrl = DatabaseAPI.getScriptUrl ? DatabaseAPI.getScriptUrl() : (APP_CONFIG.googleAppsScriptUrl || "");
  const hasGasUrl = !!activeGasUrl;
  const hasCustom = !!localStorage.getItem(APP_CONFIG.storageKeys.customTimetable);

  if (displayGasUrl) {
    if (hasGasUrl) {
      displayGasUrl.textContent = activeGasUrl;
      displayGasUrl.style.color = "#059669";
    } else {
      displayGasUrl.textContent = "Belum ditetapkan (Sila klik Tetapan URL Google Sheet atau hardcode dalam config.js)";
      displayGasUrl.style.color = "#0284c7";
    }
  }

  if (sourceEl) {
    if (hasGasUrl && MASTER_TEACHERS.length > 0) {
      sourceEl.textContent = "Google Sheet Sekolah (Aktif)";
      sourceEl.style.color = "#16a34a";
    } else if (hasCustom) {
      sourceEl.textContent = "Jadual Khas (Dimuat Naik CSV/JSON)";
      sourceEl.style.color = "#0284c7";
    } else if (MASTER_TEACHERS.length > 0) {
      sourceEl.textContent = "Data Tersimpan Sekolah";
      sourceEl.style.color = "#0284c7";
    } else {
      sourceEl.textContent = "Sistem Kosong (Sedia Diisi)";
      sourceEl.style.color = "#d97706";
    }
  }

  if (gsStatusBadge) {
    if (hasGasUrl) {
      gsStatusBadge.textContent = "Disambungkan ke Google Sheet";
      gsStatusBadge.style.background = "#dcfce7";
      gsStatusBadge.style.color = "#15803d";
      gsStatusBadge.style.borderColor = "#86efac";
    } else {
      gsStatusBadge.textContent = "Belum Disambung";
      gsStatusBadge.style.background = "#fef3c7";
      gsStatusBadge.style.color = "#b45309";
      gsStatusBadge.style.borderColor = "#fde68a";
    }
  }

  if (teachersCountEl) {
    teachersCountEl.textContent = `${MASTER_TEACHERS.length} Orang Guru`;
  }

  if (slotsCountEl) {
    let totalSlots = 0;
    Object.values(TIMETABLE).forEach(dayObj => {
      Object.values(dayObj).forEach(arr => {
        if (Array.isArray(arr)) totalSlots += arr.length;
      });
    });
    slotsCountEl.textContent = `${totalSlots} Slot Pengajaran`;
  }

  populateSchoolProfileFormInputs();
  renderDutyGroupManagerTable();

  if (window.lucide) window.lucide.createIcons();
}

function renderDutyGroupManagerTable() {
  const tbody = document.getElementById("duty-group-manager-tbody");
  if (!tbody) return;

  const cleanTeachers = MASTER_TEACHERS.filter(t => t && String(t).trim().toLowerCase() !== "nama guru");
  if (cleanTeachers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
          Belum ada senarai guru didaftarkan. Sila tambah nama guru menggunakan borang di atas, muat naik fail CSV, atau segerak dari Google Sheet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";
  cleanTeachers.forEach((guru, idx) => {
    let currentGrp = "";
    for (const [gName, members] of Object.entries(TEACHER_GROUPS)) {
      if (Array.isArray(members) && members.includes(guru)) {
        currentGrp = gName;
        break;
      }
    }
    const phone = getTeacherPhone(guru) || "";
    const col = getTeacherColor(guru);

    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border-subtle)";
    tr.innerHTML = `
      <td style="text-align:center; padding:8px 10px; font-weight:700; color:var(--text-muted);">${idx + 1}</td>
      <td style="padding:8px 10px;">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="width:10px; height:10px; border-radius:50%; background:${col.primary}; display:inline-block; flex-shrink:0;"></span>
          <strong style="color:var(--text-primary);">${guru}</strong>
        </div>
      </td>
      <td style="padding:6px 10px;">
        <select class="field-control duty-group-row-select" data-guru="${guru}" style="padding:0.35rem 0.6rem; font-size:0.8rem; font-weight:600;">
          <option value="" ${!currentGrp ? "selected" : ""}>Tiada Kumpulan (Kosong)</option>
          <option value="Kumpulan 1" ${currentGrp === "Kumpulan 1" ? "selected" : ""}>Kumpulan 1</option>
          <option value="Kumpulan 2" ${currentGrp === "Kumpulan 2" ? "selected" : ""}>Kumpulan 2</option>
          <option value="Kumpulan 3" ${currentGrp === "Kumpulan 3" ? "selected" : ""}>Kumpulan 3</option>
          <option value="Kumpulan 4" ${currentGrp === "Kumpulan 4" ? "selected" : ""}>Kumpulan 4</option>
        </select>
      </td>
      <td style="padding:8px 10px; font-family:monospace; color:var(--text-secondary);">${phone || "—"}</td>
    `;

    const sel = tr.querySelector(".duty-group-row-select");
    if (sel) {
      sel.addEventListener("change", () => {
        const newGrp = sel.value;
        Object.keys(TEACHER_GROUPS).forEach(gKey => {
          if (Array.isArray(TEACHER_GROUPS[gKey])) {
            TEACHER_GROUPS[gKey] = TEACHER_GROUPS[gKey].filter(t => t !== guru);
          }
        });
        if (newGrp) {
          if (!TEACHER_GROUPS[newGrp]) TEACHER_GROUPS[newGrp] = [];
          if (!TEACHER_GROUPS[newGrp].includes(guru)) {
            TEACHER_GROUPS[newGrp].push(guru);
          }
        }
        const groupsKey = APP_CONFIG.storageKeys.customTeacherGroups || "eguru-custom-teacher-groups-v2";
        localStorage.setItem(groupsKey, JSON.stringify(TEACHER_GROUPS));
        updateGroupMembers();
        if (typeof kemasKiniSemuaCadanganGuruGanti === "function") {
          kemasKiniSemuaCadanganGuruGanti();
        }
        showToast(`Kumpulan bertugas bagi ${guru} dikemas kini kepada ${newGrp || "Tiada Kumpulan"}.`, "success");
      });
    }

    tbody.appendChild(tr);
  });
}

function downloadCSVTimetableTemplate() {
  let csv = "Nama Guru,Hari,Slot (1-13),Mata Pelajaran,Kelas,Kumpulan Bertugas (Pilihan)\n";
  csv += "Cikgu Ahmad bin Razali,Isnin,1,BM,1 Bijak,Kumpulan 1\n";
  csv += "Cikgu Ahmad bin Razali,Isnin,2,BM,1 Bijak,Kumpulan 1\n";
  csv += "Cikgu Siti Aminah binti Musa,Isnin,3,BI,2 Bestari,Kumpulan 2\n";
  csv += "Cikgu Faridah binti Hassan,Selasa,4,MT,3 Cemerlang,Kumpulan 3\n";
  csv += "Cikgu Hafiz bin Ibrahim,Rabu,5,SN,4 Dinamik,Kumpulan 4\n";

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "templat_jadual_guru_eggs.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Templat jadual guru (CSV) berjaya dimuat turun.", "success");
}

function downloadCSVTeachersTemplate() {
  let csv = "Nama Guru,Kumpulan Bertugas (Pilihan: Kumpulan 1 - 4),No Telefon WhatsApp,Emel Rasmi (Pilihan),Sesi,Kod Warna (Automatik)\n";
  if (MASTER_TEACHERS.length > 0) {
    MASTER_TEACHERS.forEach((t) => {
      let grp = "";
      for (const [gName, members] of Object.entries(TEACHER_GROUPS)) {
        if (Array.isArray(members) && members.includes(t)) { grp = gName; break; }
      }
      const phone = (getTeacherPhone(t) || "").replace(/^\+/, "");
      const pal = typeof getTeacherColor === "function" ? getTeacherColor(t) : null;
      const hex = (pal && (pal.hex || pal.primary || pal.dot)) ? (pal.hex || pal.primary || pal.dot) : "";
      csv += `"${t}",${grp},${phone},,Pagi,${hex}\n`;
    });
  } else {
    csv += `"Cikgu Ahmad bin Razali",Kumpulan 1,60123456789,,Pagi,#2563EB\n`;
    csv += `"Cikgu Siti Aminah binti Musa",Kumpulan 2,60134567890,,Pagi,#059669\n`;
    csv += `"Cikgu Faridah binti Hassan",Kumpulan 3,60145678901,,Pagi,#D97706\n`;
    csv += `"Cikgu Hafiz bin Ibrahim",Kumpulan 4,60198765432,,Pagi,#7C3AED\n`;
  }

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "templat_senarai_guru_eggs.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Templat senarai guru & kumpulan bertugas (CSV) berjaya dimuat turun.", "success");
}

function normalizeDutyGroupLabel(rawVal) {
  if (!rawVal) return "";
  const v = String(rawVal).trim();
  if (/^[1-9]$/.test(v)) return `Kumpulan ${v}`;
  const m = v.match(/^kumpulan\s*([1-9])$/i);
  if (m) return `Kumpulan ${m[1]}`;
  if (/^kumpulan\s+\S+/i.test(v)) return v;
  return "";
}

function parseTimetableCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  const headerLower = lines[0].toLowerCase();
  const isTeacherListCsv = (headerLower.includes("whatsapp") || headerLower.includes("telefon") || headerLower.includes("kod warna")) && !headerLower.includes("mata pelajaran");
  const startIdx = (headerLower.includes("guru") || headerLower.includes("hari") || headerLower.includes("bil")) ? 1 : 0;

  const results = [];

  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
    if (parts.length < 2) continue;

    if (isTeacherListCsv) {
      // Menyokong format [Bil, Nama Guru, Kumpulan, No Tel...] ATAU [Nama Guru, Kumpulan, No Tel...]
      const hasBilCol = /^\d+$/.test(parts[0]) && parts.length >= 3;
      const offset = hasBilCol ? 1 : 0;
      const guru = parts[0 + offset] || "";
      if (!guru || guru.toLowerCase() === "nama guru") continue;
      const kumpulan = normalizeDutyGroupLabel(parts[1 + offset] || "");
      const phone = parts[2 + offset] || "";
      const hex = parts.find(p => p.startsWith("#") && (p.length === 7 || p.length === 4)) || "";
      results.push({
        isTeacherOnly: true,
        guru,
        kumpulan,
        phone,
        hex,
        hari: "— (Senarai Guru)",
        slot: "—",
        subjek: phone ? `Tel: ${phone}` : "—",
        kelas: hex || "Automatik"
      });
    } else if (parts.length >= 5) {
      const guru = parts[0];
      if (!guru || guru.toLowerCase() === "nama guru") continue;
      const rawGrp = parts[5] || parts[6] || "";
      const kumpulan = normalizeDutyGroupLabel(rawGrp);
      results.push({
        guru: guru,
        hari: parts[1],
        slot: Number(parts[2]),
        subjek: parts[3],
        kelas: parts[4],
        kumpulan: kumpulan
      });
    }
  }
  return results;
}

function setupImportPageEvents() {
  const btnDlSchedule = document.getElementById("btn-download-csv-timetable");
  if (btnDlSchedule) btnDlSchedule.addEventListener("click", downloadCSVTimetableTemplate);

  const btnDlTeachers = document.getElementById("btn-download-csv-teachers");
  if (btnDlTeachers) btnDlTeachers.addEventListener("click", downloadCSVTeachersTemplate);

  const fileInput = document.getElementById("import-file-input");
  const textPaste = document.getElementById("import-text-paste");
  const btnParse = document.getElementById("btn-parse-preview");
  const btnSave = document.getElementById("btn-confirm-save-import");
  const previewSection = document.getElementById("import-preview-section");
  const previewTbody = document.getElementById("import-preview-tbody");
  const previewSummary = document.getElementById("import-preview-summary");

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (textPaste) textPaste.value = event.target.result;
        showToast(`Fail ${file.name} sedia untuk disemak.`, "info");
      };
      reader.readAsText(file);
    });
  }

  if (btnParse) {
    btnParse.addEventListener("click", () => {
      const content = textPaste ? textPaste.value.trim() : "";
      if (!content) {
        showToast("Sila pilih fail atau tampal teks CSV/JSON terlebih dahulu.", "error");
        return;
      }

      try {
        if (content.startsWith("{") || content.startsWith("[")) {
          const json = JSON.parse(content);
          parsedImportData = json;
          showToast("Data JSON sah berjaya dibaca!", "success");
        } else {
          const parsed = parseTimetableCSV(content);
          if (!parsed || parsed.length === 0) {
            showToast("Format CSV tidak sah atau tiada data ditemui.", "error");
            return;
          }
          parsedImportData = parsed;
          showToast(`${parsed.length} rekod data berjaya dibaca!`, "success");
        }

        if (previewSection && previewTbody) {
          previewTbody.innerHTML = "";
          const rowsToShow = Array.isArray(parsedImportData) ? parsedImportData.slice(0, 15) : [];
          rowsToShow.forEach(r => {
            const tr = document.createElement("tr");
            const grpBadge = r.kumpulan
              ? `<span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:999px; font-weight:700; font-size:11px;">${r.kumpulan}</span>`
              : `<span style="color:#94a3b8; font-style:italic; font-size:11px;">Tiada / Kosong</span>`;
            tr.innerHTML = `
              <td style="padding:6px 10px; font-weight:700;">${r.guru || "—"}</td>
              <td style="padding:6px 10px;">${r.hari || "—"}</td>
              <td style="padding:6px 10px; font-family:monospace;">${r.slot || "—"}</td>
              <td style="padding:6px 10px; color:#1d4ed8; font-weight:600;">${r.subjek || "—"}</td>
              <td style="padding:6px 10px;">${r.kelas || "—"}</td>
              <td style="padding:6px 10px;">${grpBadge}</td>
            `;
            previewTbody.appendChild(tr);
          });
          if (previewSummary) {
            previewSummary.textContent = `Menunjukkan ${rowsToShow.length} daripada ${parsedImportData.length || Object.keys(parsedImportData).length} rekod yang dimuat naik.`;
          }
          previewSection.classList.remove("hidden");
        }

        if (btnSave) btnSave.disabled = false;

      } catch (err) {
        showToast("Ralat menghurai data: " + err.message, "error");
      }
    });
  }

  if (btnSave) {
    btnSave.addEventListener("click", () => {
      if (!parsedImportData) {
        showToast("Tiada data import untuk disimpan.", "error");
        return;
      }

      try {
        // Jika objek backup penuh JSON
        if (!Array.isArray(parsedImportData) && parsedImportData.timetable) {
          applySchoolData(parsedImportData, true);
          showToast("Data backup JSON berjaya dipulihkan sepenuhnya!", "success");
          return;
        }

        const newTimetable = {};
        const newTeachersSet = new Set(MASTER_TEACHERS);

        if (Array.isArray(parsedImportData)) {
          parsedImportData.forEach(item => {
            if (!item.guru || item.guru.toLowerCase() === "nama guru") return;
            newTeachersSet.add(item.guru);

            // Jika Kumpulan Bertugas dinyatakan dalam CSV (sama ada fail Senarai Guru atau fail Jadual Waktu)
            if (item.kumpulan) {
              Object.keys(TEACHER_GROUPS).forEach(gKey => {
                if (Array.isArray(TEACHER_GROUPS[gKey])) {
                  TEACHER_GROUPS[gKey] = TEACHER_GROUPS[gKey].filter(t => t !== item.guru);
                }
              });
              if (!TEACHER_GROUPS[item.kumpulan]) TEACHER_GROUPS[item.kumpulan] = [];
              if (!TEACHER_GROUPS[item.kumpulan].includes(item.guru)) {
                TEACHER_GROUPS[item.kumpulan].push(item.guru);
              }
            }

            if (item.phone && !/^6\.01e\+\d+$/i.test(item.phone)) {
              DEFAULT_TEACHER_PHONES[item.guru] = item.phone;
            }
            if (item.hex && typeof hexToTeacherPalette === "function") {
              const pal = hexToTeacherPalette(item.hex);
              if (pal) TEACHER_CUSTOM_COLORS[item.guru] = pal;
            }

            if (!item.isTeacherOnly && item.hari && item.slot) {
              if (!newTimetable[item.guru]) newTimetable[item.guru] = {};
              if (!newTimetable[item.guru][item.hari]) newTimetable[item.guru][item.hari] = [];
              const slotTime = STANDARD_SLOTS[item.slot] || `Slot ${item.slot}`;
              newTimetable[item.guru][item.hari].push([slotTime, item.subjek, item.kelas]);
            }
          });
        }

        const newTeachersList = [...newTeachersSet];
        if (newTeachersList.length > 0) {
          MASTER_TEACHERS = newTeachersList;
        }
        if (Object.keys(newTimetable).length > 0) {
          Object.assign(TIMETABLE, newTimetable);
        }

        if (typeof rebuildClassTimetablesFromMaster === "function") {
          rebuildClassTimetablesFromMaster();
        }

        localStorage.setItem(APP_CONFIG.storageKeys.customTimetable, JSON.stringify(TIMETABLE));
        if (newTeachersList.length > 0) {
          localStorage.setItem(APP_CONFIG.storageKeys.customTeachers, JSON.stringify(MASTER_TEACHERS));
        }
        const groupsKey = APP_CONFIG.storageKeys.customTeacherGroups || "eguru-custom-teacher-groups-v2";
        localStorage.setItem(groupsKey, JSON.stringify(TEACHER_GROUPS));

        refreshAllTeacherDropdowns();
        updateGroupMembers();
        if (typeof kemasKiniSemuaCadanganGuruGanti === "function") {
          kemasKiniSemuaCadanganGuruGanti();
        }
        populateCalendarClassFilter();
        renderImportPage();
        showToast("Data guru, kumpulan bertugas & jadual waktu berjaya disimpan dan diaktifkan!", "success");

      } catch (e) {
        showToast("Gagal menyimpan jadual: " + e.message, "error");
      }
    });
  }

  // Butang Muat Turun Backup JSON
  const btnExport = document.getElementById("btn-export-backup-json");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const backupObj = {
        profile: {
          schoolName: APP_CONFIG.schoolName,
          schoolCode: APP_CONFIG.schoolCode,
          schoolAddress: APP_CONFIG.schoolAddress,
          schoolMotto: APP_CONFIG.schoolMotto,
          schoolSubMotto: APP_CONFIG.schoolSubMotto,
          schoolPPD: APP_CONFIG.schoolPPD,
          schoolLogo: APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo
        },
        exportDate: new Date().toISOString(),
        slots: STANDARD_SLOTS,
        rehatIndices: REHAT_SLOT_INDICES,
        teachers: MASTER_TEACHERS,
        groups: TEACHER_GROUPS,
        phones: DEFAULT_TEACHER_PHONES,
        timetable: TIMETABLE
      };
      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_jadual_${(APP_CONFIG.schoolName || "sekolah").replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Fail backup JSON berjaya dimuat turun.", "success");
    });
  }

  // Butang Kosongkan Data Jadual Tempatan
  const btnReset = document.getElementById("btn-reset-default-schedule");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Adakah anda pasti mahu mengosongkan data jadual yang disimpan secara tempatan pada pelayar ini?")) {
        localStorage.removeItem(APP_CONFIG.storageKeys.customTimetable);
        localStorage.removeItem(APP_CONFIG.storageKeys.customTeachers);
        localStorage.removeItem(APP_CONFIG.storageKeys.schoolDataCache);
        location.reload();
      }
    });
  }

  // Butang Kosongkan Rekod Penggantian
  const btnClearRecords = document.getElementById("btn-reset-all-records-import");
  if (btnClearRecords) {
    btnClearRecords.addEventListener("click", () => {
      if (confirm("Adakah anda pasti mahu mengosongkan semua rekod penggantian tempatan pada pelayar ini?")) {
        localStorage.removeItem(APP_CONFIG.storageKeys.records);
        allRecords = [];
        renderPage5();
        showToast("Semua rekod penggantian tempatan telah dikosongkan.", "info");
      }
    });
  }

  // Borang Tambah / Kemas Kini Guru & Kumpulan Bertugas (Pilihan)
  const quickTeacherForm = document.getElementById("quick-add-teacher-group-form");
  if (quickTeacherForm) {
    quickTeacherForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("quick-teacher-name");
      const grpSelect = document.getElementById("quick-teacher-group");
      const phoneInput = document.getElementById("quick-teacher-phone");

      const guru = nameInput ? nameInput.value.trim() : "";
      const grp = grpSelect ? grpSelect.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";

      if (!guru || guru.toLowerCase() === "nama guru") {
        showToast("Sila masukkan nama guru yang sah.", "error");
        return;
      }

      if (!MASTER_TEACHERS.includes(guru)) {
        MASTER_TEACHERS.push(guru);
      }

      Object.keys(TEACHER_GROUPS).forEach(gKey => {
        if (Array.isArray(TEACHER_GROUPS[gKey])) {
          TEACHER_GROUPS[gKey] = TEACHER_GROUPS[gKey].filter(t => t !== guru);
        }
      });

      if (grp) {
        if (!TEACHER_GROUPS[grp]) TEACHER_GROUPS[grp] = [];
        if (!TEACHER_GROUPS[grp].includes(guru)) {
          TEACHER_GROUPS[grp].push(guru);
        }
      }

      if (phone) {
        DEFAULT_TEACHER_PHONES[guru] = phone;
        setTeacherPhone(guru, phone);
      }

      localStorage.setItem(APP_CONFIG.storageKeys.customTeachers, JSON.stringify(MASTER_TEACHERS));
      const groupsKey = APP_CONFIG.storageKeys.customTeacherGroups || "eguru-custom-teacher-groups-v2";
      localStorage.setItem(groupsKey, JSON.stringify(TEACHER_GROUPS));

      if (nameInput) nameInput.value = "";
      if (phoneInput) phoneInput.value = "";

      refreshAllTeacherDropdowns();
      updateGroupMembers();
      if (typeof kemasKiniSemuaCadanganGuruGanti === "function") {
        kemasKiniSemuaCadanganGuruGanti();
      }
      renderImportPage();
      showToast(`Maklumat guru (${guru}) & Kumpulan Bertugas (${grp || "Tiada Kumpulan"}) berjaya disimpan!`, "success");
    });
  }
}

/* ========================================================
   MODUL TETAPAN PROFIL SEKOLAH & LOGO RASMI (WHITE-LABEL)
   ======================================================== */
function populateSchoolProfileFormInputs() {
  const fName = document.getElementById("prof-school-name");
  const fCode = document.getElementById("prof-school-code");
  const fPass = document.getElementById("prof-admin-pass");
  const fAddr = document.getElementById("prof-school-address");
  const fPpd = document.getElementById("prof-school-ppd");
  const fMotto = document.getElementById("prof-school-motto");
  const fSubMotto = document.getElementById("prof-school-submotto");
  const fLogoUrl = document.getElementById("prof-logo-url");

  if (fName) fName.value = APP_CONFIG.schoolName || "";
  if (fCode) fCode.value = (APP_CONFIG.auth && APP_CONFIG.auth.defaultUser) ? APP_CONFIG.auth.defaultUser : (APP_CONFIG.schoolCode || "admin");
  if (fPass) fPass.value = (APP_CONFIG.auth && APP_CONFIG.auth.defaultPass) ? APP_CONFIG.auth.defaultPass : "admin123";
  if (fAddr) fAddr.value = APP_CONFIG.schoolAddress || "";
  if (fPpd) fPpd.value = APP_CONFIG.schoolPPD || "";
  if (fMotto) fMotto.value = APP_CONFIG.schoolMotto || "";
  if (fSubMotto) fSubMotto.value = APP_CONFIG.schoolSubMotto || "";
  if (fLogoUrl) fLogoUrl.value = (!APP_CONFIG.schoolLogoBase64 && APP_CONFIG.schoolLogo !== "assets/images/logo-sekolah.svg") ? APP_CONFIG.schoolLogo : "";
}

function setupSchoolProfileForm() {
  const form = document.getElementById("school-profile-form");
  const logoFileInput = document.getElementById("prof-logo-upload");
  const logoUrlInput = document.getElementById("prof-logo-url");

  if (logoFileInput) {
    logoFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 1.5 * 1024 * 1024) {
        showToast("Saiz fail logo terlalu besar (maksimum 1.5MB).", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        APP_CONFIG.schoolLogoBase64 = base64;
        updateSchoolBrandingDOM();
        showToast("Logo sekolah sedia disimpan. Klik 'Simpan Profil Sekolah'.", "info");
      };
      reader.readAsDataURL(file);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal = document.getElementById("prof-school-name")?.value.trim() || "NAMA SEKOLAH ANDA";
      const codeVal = document.getElementById("prof-school-code")?.value.trim() || "admin";
      const passVal = document.getElementById("prof-admin-pass")?.value.trim() || "admin123";
      const addrVal = document.getElementById("prof-school-address")?.value.trim() || "ALAMAT SURAT-MENYURAT SEKOLAH ANDA";
      const ppdVal = document.getElementById("prof-school-ppd")?.value.trim() || "Pejabat Pendidikan Daerah • Jabatan Pendidikan Negeri";
      const mottoVal = document.getElementById("prof-school-motto")?.value.trim() || "BERILMU BERBAKTI";
      const subMottoVal = document.getElementById("prof-school-submotto")?.value.trim() || "DISIPLIN ASAS KECEMERLANGAN";
      const urlVal = logoUrlInput ? logoUrlInput.value.trim() : "";

      APP_CONFIG.schoolName = nameVal;
      APP_CONFIG.schoolCode = codeVal;
      APP_CONFIG.schoolAddress = addrVal;
      APP_CONFIG.schoolPPD = ppdVal;
      APP_CONFIG.schoolMotto = mottoVal;
      APP_CONFIG.schoolSubMotto = subMottoVal;

      if (urlVal) {
        APP_CONFIG.schoolLogo = urlVal;
        APP_CONFIG.schoolLogoBase64 = "";
      }

      if (APP_CONFIG.auth) {
        APP_CONFIG.auth.defaultUser = codeVal;
        APP_CONFIG.auth.defaultPass = passVal;
      }

      const customProfile = {
        schoolName: APP_CONFIG.schoolName,
        schoolCode: APP_CONFIG.schoolCode,
        schoolAddress: APP_CONFIG.schoolAddress,
        schoolPPD: APP_CONFIG.schoolPPD,
        schoolMotto: APP_CONFIG.schoolMotto,
        schoolSubMotto: APP_CONFIG.schoolSubMotto,
        schoolLogo: APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo,
        defaultUser: codeVal,
        defaultPass: passVal
      };

      localStorage.setItem(APP_CONFIG.storageKeys.customSchoolProfile, JSON.stringify(customProfile));
      updateSchoolBrandingDOM();
      showToast("Profil & Identiti Sekolah berjaya dikemas kini!", "success");
    });
  }
}

/* ========================================================
   MODUL SAMBUNGAN GOOGLE SHEETS (TETAPAN URL & SEGERAK)
   ======================================================== */
function setupGoogleSheetsUI() {
  const modal = document.getElementById("modal-gas-config");
  const openBtn = document.getElementById("btn-config-gas-modal");
  const closeBtn = document.getElementById("modal-gas-close");
  const saveBtn = document.getElementById("btn-save-gas-modal");
  const testBtn = document.getElementById("btn-test-gas-modal");
  const urlInput = document.getElementById("input-gas-url-modal");
  const testResultEl = document.getElementById("modal-gas-test-result");
  const syncNowBtn = document.getElementById("btn-sync-gas");
  const lastSyncEl = document.getElementById("gas-last-sync-time");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      if (urlInput) {
        urlInput.value = DatabaseAPI.getScriptUrl ? DatabaseAPI.getScriptUrl() : (APP_CONFIG.googleAppsScriptUrl || "");
      }
      if (testResultEl) testResultEl.classList.add("hidden");
      modal.classList.remove("hidden");
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  if (testBtn && urlInput) {
    testBtn.addEventListener("click", async () => {
      const url = urlInput.value.trim();
      if (!url) {
        showToast("Sila masukkan URL Web App Google Apps Script terlebih dahulu.", "error");
        return;
      }
      const origHtml = testBtn.innerHTML;
      testBtn.disabled = true;
      testBtn.innerHTML = "Menguji...";
      const res = await DatabaseAPI.testConnection(url);
      testBtn.disabled = false;
      testBtn.innerHTML = origHtml;
      if (testResultEl) {
        testResultEl.classList.remove("hidden");
        testResultEl.style.background = res.success ? "#dcfce7" : "#fee2e2";
        testResultEl.style.color = res.success ? "#166534" : "#991b1b";
        testResultEl.textContent = res.message || (res.success ? "Sambungan berjaya!" : "Sambungan gagal.");
      }
      if (res.success) {
        showToast(res.message || "Sambungan berjaya!", "success");
      } else {
        showToast(res.message || "Sambungan gagal.", "error");
      }
    });
  }

  if (saveBtn && urlInput) {
    saveBtn.addEventListener("click", async () => {
      const url = urlInput.value.trim();
      localStorage.setItem(APP_CONFIG.storageKeys.customGasUrl, url);
      APP_CONFIG.googleAppsScriptUrl = url;
      if (modal) modal.classList.add("hidden");
      renderImportPage();
      if (url) {
        showToast("URL Google Sheet disimpan! Menyegerak data sekolah...", "info");
        const ok = await triggerCloudSync(true);
        if (ok && lastSyncEl) {
          lastSyncEl.textContent = "Terakhir disegerak: " + new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
        }
      } else {
        showToast("URL Google Sheet telah dikosongkan.", "info");
      }
    });
  }

  if (syncNowBtn) {
    syncNowBtn.addEventListener("click", async () => {
      const url = DatabaseAPI.getScriptUrl ? DatabaseAPI.getScriptUrl() : (APP_CONFIG.googleAppsScriptUrl || "");
      if (!url) {
        showToast("Sila tetapkan URL Web App Google Sheet terlebih dahulu.", "error");
        if (openBtn) openBtn.click();
        return;
      }
      const origHtml = syncNowBtn.innerHTML;
      syncNowBtn.disabled = true;
      syncNowBtn.innerHTML = `<i data-lucide="refresh-cw" class="animate-spin" style="width:15px;height:15px;"></i> Menyegerak...`;
      if (window.lucide) window.lucide.createIcons();
      const ok = await triggerCloudSync(true);
      if (ok && lastSyncEl) {
        lastSyncEl.textContent = "Terakhir disegerak: " + new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
      }
      syncNowBtn.disabled = false;
      syncNowBtn.innerHTML = origHtml;
      if (window.lucide) window.lucide.createIcons();
    });
  }
}

// Inisialisasi Semakan Jadual Khas & Profil Sekolah daripada Storan Tempatan
function initActiveTimetable() {
  try {
    // 1. Semak schoolData penuh daripada Google Sheet yang disimpan
    const savedSchoolData = localStorage.getItem(APP_CONFIG.storageKeys.schoolDataCache);
    if (savedSchoolData) {
      const parsedSD = JSON.parse(savedSchoolData);
      applySchoolData(parsedSD, false);
    }

    // 2. Semak profil sekolah custom daripada borang
    const savedCustomProfile = localStorage.getItem(APP_CONFIG.storageKeys.customSchoolProfile);
    if (savedCustomProfile) {
      const p = JSON.parse(savedCustomProfile);
      applySchoolData({ profile: p }, false);
    }

    // 3. Semak jadual, guru & kumpulan bertugas custom CSV
    const savedTeachers = localStorage.getItem(APP_CONFIG.storageKeys.customTeachers);
    if (savedTeachers) {
      const parsedTeachers = JSON.parse(savedTeachers);
      if (Array.isArray(parsedTeachers) && parsedTeachers.length > 0) {
        MASTER_TEACHERS = parsedTeachers.filter(t => t && String(t).trim().toLowerCase() !== "nama guru");
      }
    }

    const groupsKey = APP_CONFIG.storageKeys.customTeacherGroups || "eguru-custom-teacher-groups-v2";
    const savedGroups = localStorage.getItem(groupsKey);
    if (savedGroups) {
      const parsedGroups = JSON.parse(savedGroups);
      if (parsedGroups && typeof parsedGroups === "object") {
        TEACHER_GROUPS = parsedGroups;
      }
    }

    const savedTimetable = localStorage.getItem(APP_CONFIG.storageKeys.customTimetable);
    if (savedTimetable) {
      const parsedTT = JSON.parse(savedTimetable);
      Object.assign(TIMETABLE, parsedTT);
    }

    if (typeof rebuildClassTimetablesFromMaster === "function") {
      rebuildClassTimetablesFromMaster();
    }

    updateSchoolBrandingDOM();
    refreshAllTeacherDropdowns();
    populateCalendarClassFilter();
  } catch (err) {
    console.warn("Gagal memuatkan data tempatan:", err);
  }
}

/* ========================================================
   MODUL PENGESAHAN & LOG MASUK (LOGIN & ACCESS CONTROL)
   ======================================================== */
function setupAuth() {
  const overlay = document.getElementById("login-overlay");
  const form = document.getElementById("login-form");
  const userInput = document.getElementById("login-username");
  const passInput = document.getElementById("login-password");
  const rememberCheck = document.getElementById("login-remember-me");
  const errorAlert = document.getElementById("login-error-alert");
  const errorText = document.getElementById("login-error-text");
  const togglePwBtn = document.getElementById("btn-toggle-password");
  const togglePwIcon = document.getElementById("icon-toggle-password");
  const logoutBtn = document.getElementById("btn-logout");

  if (!overlay || !form) return;

  const authCfg = APP_CONFIG.auth || {
    enabled: true,
    defaultUser: "admin",
    defaultPass: "admin123",
    sessionKey: "eggs_komersial_auth_session_v1",
    rememberKey: "eggs_komersial_auth_remember_v1"
  };

  if (!authCfg.enabled) {
    overlay.classList.add("hidden");
    return;
  }

  function isUserAuthenticated() {
    return !!sessionStorage.getItem(authCfg.sessionKey) || !!localStorage.getItem(authCfg.rememberKey);
  }

  // Semakan Status Sesi Semasa Muat Laman
  if (isUserAuthenticated()) {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
  } else {
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    setTimeout(() => { if (userInput) userInput.focus(); }, 150);
  }

  // Butang Tunjuk/Sembunyi Kata Laluan
  if (togglePwBtn && passInput) {
    togglePwBtn.addEventListener("click", () => {
      const isPw = passInput.type === "password";
      passInput.type = isPw ? "text" : "password";
      if (togglePwIcon) {
        togglePwIcon.setAttribute("data-lucide", isPw ? "eye-off" : "eye");
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Pengendali Hantar Borang Log Masuk
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = userInput ? userInput.value.trim().toLowerCase() : "";
    const p = passInput ? passInput.value.trim() : "";

    const expectedUser = (APP_CONFIG.auth?.defaultUser || "admin").toLowerCase();
    const expectedPass = APP_CONFIG.auth?.defaultPass || "admin123";

    if (u === expectedUser && p === expectedPass) {
      if (errorAlert) errorAlert.classList.add("hidden");
      const token = "auth_" + Date.now();
      sessionStorage.setItem(authCfg.sessionKey, token);

      if (rememberCheck && rememberCheck.checked) {
        localStorage.setItem(authCfg.rememberKey, token);
      } else {
        localStorage.removeItem(authCfg.rememberKey);
      }

      overlay.classList.add("hidden");
      overlay.setAttribute("aria-hidden", "true");

      if (passInput) passInput.value = "";
      showToast("Log masuk berjaya! Selamat datang ke Sistem e-GGs (e-Guru Ganti Sekolah).", "success");
    } else {
      if (errorAlert) {
        if (errorText) errorText.textContent = "ID Pengguna atau Kata Laluan tidak tepat. Sila semak semula.";
        errorAlert.classList.remove("hidden");
      }
      const card = overlay.querySelector(".login-card");
      if (card) {
        card.style.animation = "none";
        void card.offsetWidth;
        card.style.animation = "loginShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both";
      }
      if (passInput) {
        passInput.value = "";
        passInput.focus();
      }
    }
  });

  // Pengendali Butang Log Keluar
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Adakah anda pasti mahu log keluar daripada sistem?")) {
        sessionStorage.removeItem(authCfg.sessionKey);
        localStorage.removeItem(authCfg.rememberKey);
        overlay.classList.remove("hidden");
        overlay.setAttribute("aria-hidden", "false");
        if (errorAlert) errorAlert.classList.add("hidden");
        if (passInput) passInput.value = "";
        if (userInput) {
          userInput.value = "";
          userInput.focus();
        }
        showToast("Anda telah berjaya log keluar.", "info");
      }
    });
  }
}
