/**
 * e-Guru Ganti V2 - Logik Aplikasi Utama
 * SK Tampasuk 1 Kota Belud, Sabah
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

// Navigasi Tab Halaman
function setupNavigation() {
  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const pageId = btn.dataset.page;
      showPage(pageId);

      if (pageId === "page2") renderPage2();
      if (pageId === "page3") renderPage3();
      if (pageId === "page5") renderPage5();
      if (pageId === "page6") renderPage6();
      if (pageId === "page7") renderCalendar();
    });
  });
}

function showPage(pageId) {
  ["page1", "page2", "page3", "page5", "page6", "page7"].forEach(id => {
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
  if (val && TEACHER_GROUPS[val]) {
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

function addTeacherRow(defaultName = "", defaultReason = "") {
  const tpl = document.getElementById("teacher-row-template");
  const row = tpl.content.cloneNode(true).firstElementChild;
  const ts = row.querySelector(".teacher-select");
  const rs = row.querySelector(".reason-select");

  // Isi senarai pilihan guru rasmi 26 orang
  ts.innerHTML = '<option value="">PILIH NAMA GURU</option>' +
    MASTER_TEACHERS.map(g => `<option value="${g}">${g}</option>`).join("");

  ts.value = defaultName;
  rs.value = defaultReason;

  ts.addEventListener("change", () => {
    updateTeacherRowColor(row);
    autoFillSchedule();
  });
  rs.addEventListener("change", autoFillSchedule);

  row.querySelector(".remove-teacher").addEventListener("click", () => {
    if (teachersContainer.children.length > 1) {
      row.remove();
      autoFillSchedule();
    } else {
      showToast("Sekurang-kurangnya satu orang guru tidak hadir diperlukan.", "error");
    }
  });

  teachersContainer.appendChild(row);
  updateTeacherRowColor(row);
  if (window.lucide) window.lucide.createIcons();
}

// Kemas Kini Hari & Jadual Automatik
function updateDay() {
  const day = dateInput.value ? getDayFromDate(dateInput.value) : "";
  dayInput.value = day;
  const p2 = document.getElementById("page2-hari");
  if (p2 && day && !p2.value) p2.value = day;
  const p3 = document.getElementById("page3-hari");
  if (p3 && day && !p3.value) p3.value = day;
  autoFillSchedule();
}

dateInput.addEventListener("change", updateDay);

// Menambah Baris Jadual Gantian
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

  masaInput.value = data.masa || "";
  subjekInput.value = data.subjek || "";
  kelasInput.value = data.kelas || "";
  row.dataset.guruTidakHadir = data.guru_tidak_hadir || "";
  row.dataset.sebab = data.sebab || "";

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

  row.querySelector(".remove-row").addEventListener("click", () => {
    hideTeacherHoverPopover();
    row.remove();
    if (!entryRows.children.length) addRow();
    kemasKiniSemuaCadanganGuruGanti();
  });

  const onInputChange = () => kemasKiniSemuaCadanganGuruGanti();
  masaInput.addEventListener("input", onInputChange);
  subjekInput.addEventListener("input", onInputChange);
  kelasInput.addEventListener("input", onInputChange);
  gantiSelect.addEventListener("change", onInputChange);

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
        <td style="white-space:nowrap; font-family:monospace; font-size:10px;">${slotTime}${activeIndicator}</td>
        <td>${subjek}</td>
        <td>${kelas}</td>
        <td style="font-size:10px;">${statusText}</td>
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
            <th style="width:30%;">Masa</th>
            <th style="width:22%;">Subjek</th>
            <th style="width:18%;">Kelas</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Tunjukkan popover terlebih dahulu (halimunan sementara) untuk mengukur dimensi tepat
  popover.classList.remove("hidden");
  popover.style.opacity = "0";

  // Posisi Pintar Terapung
  const wrapper = targetElement.closest(".custom-ganti-wrapper") || targetElement;
  const wrapperRect = wrapper.getBoundingClientRect();
  const actualHeight = popover.offsetHeight || 270;
  const actualWidth = popover.offsetWidth || 295;

  // 1. Kedudukan Menegak (Top):
  // Anchor selaras dengan bahagian atas wrapper baris jadual ini
  let top = wrapperRect.top - 6;

  // Jika baris berada di bahagian paling bawah skrin (termasuk bila user hover baris bawah):
  // Naikkan popover ke atas supaya keseluruhan jadual popover muat sepenuhnya dalam viewport
  if (top + actualHeight > window.innerHeight - 20) {
    top = window.innerHeight - actualHeight - 20;
  }
  if (top < 15) top = 15;

  // 2. Kedudukan Mendatar (Left):
  // Popover mestilah TIDAK berada di dalam column (iaitu jangan menutupi column Masa, Subjek, Kelas di sebelah kiri)
  // Letak di sebelah kanan dropdown
  let left = wrapperRect.right + 12;

  // Jika ruang kanan melepasi tepi tingkap skrin:
  if (left + actualWidth > window.innerWidth - 15) {
    // Sandarkan ke tepi kanan skrin supaya tidak menindih ruangan column Masa & Kelas di sebelah kiri
    left = window.innerWidth - actualWidth - 15;
  }
  if (left < 10) left = 10;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  popover.style.opacity = "1";
}

function hideTeacherHoverPopover() {
  const popover = document.getElementById("teacher-hover-popover");
  if (popover) {
    popover.classList.add("hidden");
    popover.style.opacity = "0";
  }
}

// Pengisian Automatik Berdasarkan Guru Tidak Hadir & Hari
function autoFillSchedule() {
  updateGroupMembers();
  const day = dayInput.value;
  if (!day) return;

  const rows = [...teachersContainer.querySelectorAll(".teacher-row")];
  const activeTeachers = rows
    .map(r => ({
      name: r.querySelector(".teacher-select").value,
      reason: r.querySelector(".reason-select").value
    }))
    .filter(t => t.name);

  entryRows.innerHTML = "";

  if (!activeTeachers.length) {
    addRow();
    autoMessage.classList.add("hidden");
    return;
  }

  const absentTeacherNames = activeTeachers.map(t => t.name);

  let totalSlots = 0;
  activeTeachers.forEach(t => {
    const lessons = (TIMETABLE[t.name] && TIMETABLE[t.name][day]) || [];
    lessons.forEach(([masa, subjek, kelas]) => {
      splitTimeSlot(masa).forEach(slotTime => {
        const partnerInfo = getConcurrentPartnerInfo(kelas, day, slotTime, subjek, absentTeacherNames);
        addRow({
          masa: slotTime,
          subjek,
          kelas,
          guru_tidak_hadir: t.name,
          sebab: t.reason,
          ganti: partnerInfo ? partnerInfo.nama : ""
        });
        totalSlots++;
      });
    });
  });

  if (totalSlots > 0) {
    autoMessage.textContent = `${totalSlots} waktu pengajaran berjaya diisi secara automatik.`;
    autoMessage.classList.remove("hidden");
  } else {
    addRow();
    autoMessage.textContent = `Tiada rekod waktu kelas untuk guru terpilih pada hari ${day}.`;
    autoMessage.classList.remove("hidden");
  }
  kemasKiniSemuaCadanganGuruGanti();
}

// Cadangan Guru Ganti Pintar dengan Pengesanan Pertindihan Semasa (Clash Prevention)
function dapatkanCadanganGuruGanti(kumpulanVal, hariVal, masaVal, currentRow) {
  if (!kumpulanVal || !TEACHER_GROUPS[kumpulanVal]) {
    return { bertugas: [], tidakBertugasBebas: [] };
  }

  const dutyTeachers = TEACHER_GROUPS[kumpulanVal];
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
  const tidakBertugasBebas = MASTER_TEACHERS
    .filter(name => !dutyTeachers.includes(name))
    .map(checkTeacher)
    .filter(c => c.boleh);

  return { bertugas, tidakBertugasBebas };
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
        if (triggerLabel) triggerLabel.textContent = "Pilih guru ganti";
        menuEl.classList.add("hidden");
        const trigger = row.querySelector(".custom-ganti-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        hideTeacherHoverPopover();
        kemasKiniSemuaCadanganGuruGanti();
      });
      menuEl.appendChild(clearItem);
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

    if (kv && hv && masaVal) {
      const { bertugas, tidakBertugasBebas } = dapatkanCadanganGuruGanti(kv, hv, masaVal, row);
      const countP = (n) => countPeriods(n, hv);
      const sortFn = (a, b) => countP(a.nama) - countP(b.nama);

      let kb = bertugas.filter(c => c.boleh).sort(sortFn);
      let ks = bertugas.filter(c => !c.boleh).sort(sortFn);
      let ntb = tidakBertugasBebas.sort(sortFn);

      // Asingkan partnerTeacher agar tidak berulang dalam senarai di bawah
      if (partnerInfo) {
        kb = kb.filter(c => c.nama !== partnerInfo.nama);
        ks = ks.filter(c => c.nama !== partnerInfo.nama);
        ntb = ntb.filter(c => c.nama !== partnerInfo.nama);
      }

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
      triggerLabel.textContent = selectEl.value || "Pilih guru ganti";
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

// Reset dan Tambah Baris Manual
document.getElementById("add-row").addEventListener("click", () => addRow());
document.getElementById("add-teacher").addEventListener("click", () => addTeacherRow());
document.getElementById("reset-teachers").addEventListener("click", () => {
  teachersContainer.innerHTML = "";
  addTeacherRow();
  autoFillSchedule();
  showToast("Senarai guru tidak hadir telah di-reset.", "neutral");
});
document.getElementById("reset-rows").addEventListener("click", () => {
  autoFillSchedule();
  showToast("Jadual gantian telah dijana semula.", "neutral");
});

// PAGE 2: Jadual Kelas
const page2HariSelect = document.getElementById("page2-hari");
if (page2HariSelect) {
  page2HariSelect.addEventListener("change", renderPage2);
}

function renderPage2() {
  const container = document.getElementById("timetable-container");
  container.innerHTML = "";

  const page2Select = document.getElementById("page2-hari");
  const selectedDay = (page2Select && page2Select.value) ? page2Select.value : (dayInput ? dayInput.value : "");

  if (!selectedDay) {
    container.innerHTML = '<p class="text-slate-500 col-span-2 text-center py-10">Sila pilih hari atau tarikh terlebih dahulu.</p>';
    return;
  }

  if (page2Select) {
    page2Select.value = selectedDay;
  }

  const hari = selectedDay;

  const absTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
    .map(r => r.querySelector(".teacher-select").value)
    .filter(Boolean);

  const replacementsMap = {};
  [...entryRows.querySelectorAll(".schedule-row")].forEach(row => {
    const m = row.querySelector(".row-masa").value.trim();
    const k = row.querySelector(".row-kelas").value.trim();
    const g = row.querySelector(".row-ganti").value.trim();
    if (m && k) {
      const idx = STANDARD_SLOTS.indexOf(m);
      if (idx >= 0) replacementsMap[`${k}|${idx}`] = g;
    }
  });

  const classes = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"];
  classes.forEach(kelas => {
    const card = document.createElement("div");
    card.className = "section-card overflow-hidden";

    let html = `<div class="tt-card-header">` +
      `<span>Kelas ${kelas} - ${hari} (Sesi 2026)</span>` +
      `</div><div class="overflow-x-auto"><table class="tt-table"><thead><tr><th>Masa</th><th>Subjek</th><th>Guru</th><th>Status</th></tr></thead><tbody>`;

    for (let si = 1; si <= 13; si++) {
      if (si === 6) continue; // Rehat
      const slotTime = STANDARD_SLOTS[si];
      const slotInfo = getClassTimetableSlot(kelas, hari, si);
      if (!slotInfo) continue;

      const { guru, subjek, guruList } = slotInfo;
      const key = `${kelas}|${si}`;
      const repl = replacementsMap[key] || "";

      // Semak sama ada mana-mana guru dalam subjek ini tidak hadir
      const isAbsent = guruList.some(g => absTeachers.includes(g));

      let cls = "tt-cell-present";
      let status = "Hadir";

      if (isAbsent && repl) {
        cls = "tt-cell-replaced";
        status = `Diganti: ${repl}`;
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

    html += `</tbody></table></div>`;
    card.innerHTML = html;
    container.appendChild(card);
  });
}

// PAGE 3: Jadual Guru
const page3HariSelect = document.getElementById("page3-hari");
if (page3HariSelect) {
  page3HariSelect.addEventListener("change", renderPage3);
}

function renderPage3() {
  const container = document.getElementById("guru-timetable-container");
  if (!container) return;
  container.innerHTML = "";

  const page3Select = document.getElementById("page3-hari");
  const selectedDay = (page3Select && page3Select.value) ? page3Select.value : (dayInput ? dayInput.value : "");

  if (!selectedDay) {
    container.innerHTML = '<p class="text-slate-500 col-span-full text-center py-10">Sila pilih hari atau tarikh terlebih dahulu.</p>';
    return;
  }

  if (page3Select) {
    page3Select.value = selectedDay;
  }

  const absentTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
    .map(r => r.querySelector(".teacher-select").value)
    .filter(Boolean);

  const reliefAssignments = {};
  [...entryRows.querySelectorAll(".schedule-row")].forEach(row => {
    const m = row.querySelector(".row-masa") ? row.querySelector(".row-masa").value.trim() : "";
    const s = row.querySelector(".row-subjek") ? row.querySelector(".row-subjek").value.trim() : "";
    const k = row.querySelector(".row-kelas") ? row.querySelector(".row-kelas").value.trim() : "";
    const g = row.querySelector(".row-ganti") ? row.querySelector(".row-ganti").value.trim() : "";
    const orig = row.dataset.guruTidakHadir || "";
    if (g && m) {
      if (!reliefAssignments[g]) reliefAssignments[g] = [];
      reliefAssignments[g].push({ masa: m, subjek: s, kelas: k, guruAsal: orig });
    }
  });

  const dutyGroup = kumpulanSelect.value;
  const dutyList = dutyGroup && TEACHER_GROUPS[dutyGroup] ? TEACHER_GROUPS[dutyGroup] : [];

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
      card.className = "guru-card";
      card.style.border = `1.5px solid ${col.border}`;

      const isAbs = absentTeachers.includes(guru);
      const headerExtra = isAbs ? ' <span style="font-size:11px; background:#ef4444; color:#ffffff; padding:2px 8px; border-radius:9999px; font-weight:700; margin-left:6px;">Tidak Hadir</span>' : '';
      const totalPeriods = countPeriods(guru, selectedDay);

      let html = `<div class="guru-card-header" style="background:${col.primary}; color:#ffffff;">` +
        `<span style="font-weight:700; font-size:0.88rem;">${guru}${headerExtra}</span>` +
        `<span style="font-size:11px; background:rgba(255,255,255,0.22); color:#ffffff; padding:3px 9px; border-radius:9999px; font-weight:700;">${totalPeriods} Waktu</span>` +
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
      grid.appendChild(card);
    });

    sectionBox.appendChild(grid);
    container.appendChild(sectionBox);
  }

  renderGroupSection("Guru Bertugas", gb, "text-blue-700 dark:text-blue-400");
  renderGroupSection("Guru Bertugas (Tidak Hadir)", gbl, "text-amber-700 dark:text-amber-400");
  renderGroupSection("Guru Tidak Bertugas", gtb, "text-slate-600 dark:text-slate-400");
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
  updateMonthlyPdfButtonLabel();
}

function updateStatCards() {
  const filtered = getFilteredRecords();
  const bulanVal = document.getElementById("stat-bulan-filter") ? document.getElementById("stat-bulan-filter").value : "";
  const mingguVal = document.getElementById("stat-minggu-filter") ? document.getElementById("stat-minggu-filter").value : "";

  document.getElementById("stat-total-records").textContent = filtered.length;
  const uniqueAbsent = new Set(filtered.map(r => r.guru_tidak_hadir).filter(Boolean));
  document.getElementById("stat-total-absent").textContent = uniqueAbsent.size;
  document.getElementById("stat-total-replaced").textContent = filtered.filter(r => r.guru_ganti).length;

  const countMap = {};
  filtered.forEach(r => {
    if (r.guru_ganti) countMap[r.guru_ganti] = (countMap[r.guru_ganti] || 0) + 1;
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
    updateMonthlyPdfButtonLabel();
  });
}

const statMingguFilter = document.getElementById("stat-minggu-filter");
if (statMingguFilter) {
  statMingguFilter.addEventListener("change", () => {
    updateStatCards();
    renderWeeklyReport();
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
      if (r.guru_ganti) {
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
    if (r.guru_ganti) {
      if (!reliefMap[r.guru_ganti]) reliefMap[r.guru_ganti] = [];
      reliefMap[r.guru_ganti].push(r);
    }
  });

  const totalTeachers = MASTER_TEACHERS.length; // 27
  const absentCount = Object.keys(absentMap).length;
  const presentCount = totalTeachers - absentCount;
  const reliefPeriodCount = dayRecords.length;

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
        affectedSlotsHtml = `
          <div class="att-relief-box">
            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:10.5px; color:var(--text-secondary); margin-bottom:5px; text-transform:uppercase;">
              <span>Waktu Kelas Diganti (${t.absentInfo.records.length} Waktu)</span>
              <span>Guru Pengganti</span>
            </div>
            ${t.absentInfo.records.map(r => `
              <div class="att-relief-slot-item">
                <div>
                  <span class="att-slot-time">${r.masa}</span>
                  <span style="font-weight:700; margin-left:4px;">${r.mata_pelajaran}</span>
                  <span style="color:var(--text-secondary); font-size:10.5px;">(${r.kelas})</span>
                </div>
                <div style="font-weight:800; color:#1d4ed8; font-size:11px;" class="dark:text-blue-400">
                  ${r.guru_ganti ? `<i data-lucide="refresh-cw" style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> ${r.guru_ganti}` : '<span style="color:#ef4444;">Belum Ditugaskan</span>'}
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
    if (r.guru_ganti) {
      if (!reliefMap[r.guru_ganti]) reliefMap[r.guru_ganti] = [];
      reliefMap[r.guru_ganti].push(r);
    }
  });

  const totalTeachers = MASTER_TEACHERS.length;
  const absentCount = Object.keys(absentMap).length;
  const presentCount = totalTeachers - absentCount;
  const totalRelief = dayRecords.length;

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
          <img src="${APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo}" alt="Lencana SK Tampasuk 1" style="width:68px; height:68px; object-fit:contain;">
          <div>
            <div class="school">${APP_CONFIG.schoolName}</div>
            <div class="address">${APP_CONFIG.schoolAddress}</div>
            <div class="title">PENYATA HARIAN KEHADIRAN & GURU GANTI — ${dayName.toUpperCase()}, ${formattedDate.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-box"><div class="kpi-val">${totalTeachers}</div><div class="kpi-lbl">Jumlah Guru</div></div>
        <div class="kpi-box"><div class="kpi-val" style="color:#059669;">${presentCount}</div><div class="kpi-lbl">Guru Hadir (${Math.round((presentCount/totalTeachers)*100)}%)</div></div>
        <div class="kpi-box"><div class="kpi-val" style="color:#dc2626;">${absentCount}</div><div class="kpi-lbl">Guru Tidak Hadir (${Math.round((absentCount/totalTeachers)*100)}%)</div></div>
        <div class="kpi-box"><div class="kpi-val" style="color:#7c3aed;">${totalRelief}</div><div class="kpi-lbl">Waktu Diganti</div></div>
      </div>

      <div class="section-title">1. Senarai Guru Tidak Hadir & Perincian Gantian</div>
      ${absentCount === 0 
        ? `<p style="font-size:11.5px; color:#059669; font-weight:700; padding:10px 0;">Alhamdulillah, kesemua 27 orang guru SK Tampasuk 1 hadir bertugas pada hari ini.</p>`
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
                  <td>${d.records.map(r => `<span style="font-family:monospace; font-weight:bold;">${r.masa}</span> ${r.mata_pelajaran} (${r.kelas})`).join('<br>')}</td>
                  <td>${d.records.map(r => `<strong>${r.guru_ganti || '—'}</strong>`).join('<br>')}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>`
      }

      <div class="section-title">2. Senarai Penuh Kehadiran 27 Guru Sekolah</div>
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
            if (isAb) cat = `Tidak hadir: ${absentMap[nama].sebab} (${absentMap[nama].records.length} waktu diganti)`;
            else if (isRel) cat = `Bertugas ganti: +${reliefMap[nama].length} waktu (${reliefMap[nama].map(r => r.mata_pelajaran + ' ' + r.kelas).join(', ')})`;
            
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
          <p>SK Tampasuk 1 Kota Belud</p>
        </div>
        <div class="sign-box">
          <p style="margin-bottom:45px;">Disahkan Oleh:</p>
          <p><strong>GURU BESAR / PK PENTADBIRAN</strong></p>
          <p>SK Tampasuk 1 Kota Belud</p>
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

const ALL_MASTER_CLASSES = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"];
const MASTER_CLASS_LABELS = {
  "1A": "1 Arif",
  "1B": "1 Bestari",
  "2A": "2 Arif",
  "2B": "2 Bestari",
  "3A": "3 Arif",
  "3B": "3 Bestari",
  "4A": "4 Arif",
  "4B": "4 Bestari",
  "5A": "5 Arif",
  "5B": "5 Bestari",
  "6A": "6 Arif",
  "6B": "6 Bestari"
};

function normalizeClassKey(k) {
  if (!k) return "";
  const clean = k.toString().trim().toUpperCase();
  if (clean.includes("1") && clean.includes("A")) return "1A";
  if (clean.includes("1") && clean.includes("B")) return "1B";
  if (clean.includes("2") && clean.includes("A")) return "2A";
  if (clean.includes("2") && clean.includes("B")) return "2B";
  if (clean.includes("3") && clean.includes("A")) return "3A";
  if (clean.includes("3") && clean.includes("B")) return "3B";
  if (clean.includes("4") && clean.includes("A")) return "4A";
  if (clean.includes("4") && clean.includes("B")) return "4B";
  if (clean.includes("5") && clean.includes("A")) return "5A";
  if (clean.includes("5") && clean.includes("B")) return "5B";
  if (clean.includes("6") && clean.includes("A")) return "6A";
  if (clean.includes("6") && clean.includes("B")) return "6B";
  return clean;
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
      sub.textContent = `Status pengajaran 12 kelas mengikut waktu dari 7:10 pagi hingga 1:40 petang. Sebanyak ${recs.length} waktu guru ganti aktif (berwarna merah lembut).`;
    } else {
      sub.textContent = `Status pengajaran 12 kelas mengikut waktu dari 7:10 pagi hingga 1:40 petang. Semua kelas diajar oleh guru asal mengikut jadual rasmi (berwarna hijau).`;
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

  // Tapis kelas jika dropdown filter dipilih
  const filterSelect = document.getElementById("cal-class-filter");
  const selectedClass = filterSelect ? filterSelect.value : "";
  const classesToRender = selectedClass ? [selectedClass] : ALL_MASTER_CLASSES;

  let html = `
    <div class="master-tt-container">
      <table class="master-tt-table">
        <thead>
          <tr>
            <th class="th-class-col">KELAS</th>
  `;

  for (let si = 1; si <= 13; si++) {
    if (si === 6) {
      html += `<th style="background:#e2e8f0; color:#475569; min-width:80px;" class="dark:bg-slate-800 dark:text-slate-300">REHAT<br><span style="font-size:9.5px; font-weight:600;">9.40-10.10</span></th>`;
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

    for (let si = 1; si <= 13; si++) {
      if (si === 6) {
        // Rehat Sekolah
        html += `<td class="cell-rehat"><span style="font-size:10.5px; font-weight:800; letter-spacing:0.04em;">REHAT</span></td>`;
        continue;
      }

      const repl = replacementsMap[`${kelas}|${si}`];
      const slotInfo = getClassTimetableSlot(kelas, hari, si);

      if (repl) {
        // GURU GANTI MENGAJAR -> MERAH LEMBUT
        const subjekDisplay = repl.subjek || (slotInfo ? slotInfo.subjek : "—");
        const guruGantiDisplay = repl.guruGanti || "Guru Ganti";
        const guruAsalDisplay = repl.guruAsal || (slotInfo ? slotInfo.guru : "");

        html += `
          <td class="cell-guru-ganti">
            <div style="font-weight:800; font-size:12px; color:#991b1b;" class="dark:text-red-300">${subjekDisplay}</div>
            <div style="font-weight:800; font-size:11px; color:#7f1d1d; margin-top:2px;" class="dark:text-red-200">🔄 ${guruGantiDisplay}</div>
            <div style="font-size:9.5px; color:#b91c1c; opacity:0.9;" class="dark:text-red-400">Asal: ${guruAsalDisplay}</div>
          </td>
        `;
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
      return n ? `• ${n} (${re})` : null;
    })
    .filter(Boolean);

  let tableHtml = "";
  rows.forEach(r => {
    const masa = r.querySelector(".row-masa").value.trim() || "—";
    const subjek = r.querySelector(".row-subjek").value.trim() || "—";
    const kelas = r.querySelector(".row-kelas").value.trim() || "—";
    const guruGanti = r.querySelector(".row-ganti").value.trim() || "—";
    const guruAsal = r.dataset.guruTidakHadir || "—";

    tableHtml += `<tr style="border-bottom:1px solid #cbd5e1">` +
      `<td style="padding:8px 10px;font-family:monospace;font-weight:bold">${masa}</td>` +
      `<td style="padding:8px 10px">${subjek}</td>` +
      `<td style="padding:8px 10px">${kelas}</td>` +
      `<td style="padding:8px 10px;font-weight:bold;color:#1e3a8a">${guruGanti}</td>` +
      `<td style="padding:8px 10px;font-size:11px;color:#475569">${guruAsal}</td>` +
      `</tr>`;
  });

  const win = window.open("", "_blank");
  if (!win) {
    showToast("Sila benarkan pop-up pada pelayar web anda.", "error");
    return;
  }

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
            <img src="${APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo}" alt="Lencana Rasmi SK Tampasuk 1" class="header-logo">
            <div class="header-titles">
              <div class="school-name">${APP_CONFIG.schoolName}</div>
              <div class="school-sub">${APP_CONFIG.schoolAddress}</div>
              <div class="school-motto">"${APP_CONFIG.schoolSubMotto}" • "${APP_CONFIG.schoolMotto}"</div>
              <div class="report-title">JADUAL GURU GANTI</div>
            </div>
          </div>
        </header>
        <div class="meta-grid">
          <div class="meta-box"><strong>Minggu:</strong> ${mingguStr}</div>
          <div class="meta-box"><strong>Tarikh / Hari:</strong> ${tarikhStr} (${hariStr})</div>
          <div class="meta-box"><strong>Kumpulan Bertugas:</strong> ${kumpulanStr}</div>
          <div class="meta-box"><strong>Masa Dijana:</strong> ${new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
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
      </div>
    </body>
    </html>`);
  win.document.close();
});

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
          <img src="${APP_CONFIG.schoolLogoBase64 || APP_CONFIG.schoolLogo}" alt="Lencana SK Tampasuk 1" style="width:70px; height:70px; object-fit:contain; flex-shrink:0;">
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
          <p>SK Tampasuk 1 Kota Belud</p>
        </div>
        <div class="sign-box">
          <p style="margin-bottom:45px;">Disahkan Oleh:</p>
          <p><strong>GURU BESAR / PK PENTADBIRAN</strong></p>
          <p>SK Tampasuk 1 Kota Belud</p>
        </div>
      </div>
    </body>
    </html>`);
  win.document.close();
});

// Simpan Borang (Submit)
document.getElementById("schedule-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();

  if (!ev.currentTarget.checkValidity()) {
    showToast("Sila lengkapkan semua medan wajib.", "error");
    ev.currentTarget.reportValidity();
    return;
  }

  const rows = [...entryRows.querySelectorAll(".schedule-row")];
  if (!rows.length) {
    showToast("Sila tambah sekurang-kurangnya satu waktu kelas.", "error");
    return;
  }

  const activeTeachers = [...teachersContainer.querySelectorAll(".teacher-row")]
    .map(r => ({
      name: r.querySelector(".teacher-select").value,
      reason: r.querySelector(".reason-select").value
    }))
    .filter(t => t.name);

  if (!activeTeachers.length) {
    showToast("Sila pilih guru tidak hadir terlebih dahulu.", "error");
    return;
  }

  const submitBtn = document.getElementById("save-sheet-btn");
  const origBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> Menyimpan rekod...`;

  const commonData = {
    minggu: mingguSelect.value,
    tarikh: dateInput.value,
    hari: dayInput.value,
    kumpulan: kumpulanSelect.value
  };

  const recordsToSave = rows.map(r => {
    const rg = r.dataset.guruTidakHadir || activeTeachers[0].name;
    const rs = r.dataset.sebab || activeTeachers[0].reason;
    return {
      ...commonData,
      guru_tidak_hadir: rg,
      sebab: rs,
      masa: r.querySelector(".row-masa").value.trim(),
      mata_pelajaran: r.querySelector(".row-subjek").value.trim(),
      kelas: r.querySelector(".row-kelas").value.trim(),
      guru_ganti: r.querySelector(".row-ganti").value.trim(),
      catatan: `Ganti ${rg}`
    };
  });

  const saveResult = await DatabaseAPI.saveRecords(recordsToSave);

  submitBtn.disabled = false;
  submitBtn.innerHTML = origBtnContent;

  if (saveResult.success) {
    showToast(saveResult.message, "success");

    // Kemas kini senarai tempatan
    allRecords = await DatabaseAPI.getAllRecords();

    // Reset borang dengan betul (Hanya 1 baris kosong baharu)
    ev.currentTarget.reset();
    teachersContainer.innerHTML = "";
    addTeacherRow();
    entryRows.innerHTML = "";
    autoMessage.classList.add("hidden");

    dateInput.value = getLocalDateString();
    updateDay();
    // addRow() dipanggil automatik dalam autoFillSchedule()
  } else {
    showToast(saveResult.message || "Gagal menyimpan rekod.", "error");
  }
});

// Prapemuatan Sistem (Initialization)
document.addEventListener("DOMContentLoaded", async () => {
  setupDarkMode();
  setupNavigation();
  setupDeviceModeToggle();

  // Tetapkan tarikh tempatan tepat
  const today = new Date();
  const todayStr = getLocalDateString(today);
  dateInput.value = todayStr;

  const todayDisplay = document.getElementById("today-display");
  if (todayDisplay) {
    todayDisplay.textContent = `${MALAY_DAYS[today.getDay()]}, ${today.getDate()} ${MALAY_MONTHS[today.getMonth()]} ${today.getFullYear()}`;
  }

  // Mulakan guru tidak hadir dan hari
  addTeacherRow();
  updateDay();

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

  // Tetapkan bulan semasa sebagai pilihan lalai di dropdown Page 5 jika belum dipilih
  const statBulanEl = document.getElementById("stat-bulan-filter");
  if (statBulanEl && !statBulanEl.value) {
    statBulanEl.value = String(today.getMonth() + 1);
  }

  renderPage5();

  // Permulaan Modul WhatsApp Guru Ganti
  setupWhatsAppModalEvents();
});

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

  // 3. Fallback Guru UBK (Lalai: Cik Syahfirah Arjaman)
  if (teacherName.toLowerCase().includes("ubk")) {
    return "+60146708832";
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
  text += `*SK TAMPASUK 1 KOTA BELUD*\n\n`;
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
  text += `*Sekata Melakar Kecemerlangan*`;

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
    if (!ganti || ganti === "Pilih guru ganti") return;

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

  const countBadge = document.getElementById("wa-modal-count-badge");
  if (countBadge) {
    countBadge.textContent = `${teachers.length} Guru Pengganti`;
  }

  const bodyEl = document.getElementById("wa-modal-body");
  if (!bodyEl) return;
  bodyEl.innerHTML = "";

  if (teachers.length === 0) {
    bodyEl.innerHTML = `
      <div style="text-align:center; padding:3rem 1rem; color:var(--text-secondary);">
        <i data-lucide="alert-circle" style="width:48px;height:48px; margin:0 auto 12px; color:#f59e0b;"></i>
        <p style="font-weight:800; font-size:1.05rem; color:var(--text-primary); margin:0 0 6px;">Tiada Guru Pengganti Ditemui</p>
        <p style="font-size:0.85rem; max-width:400px; margin:0 auto;">Sila pastikan sekurang-kurangnya satu baris jadual di Halaman 1 telah dipilih nama guru pengganti sebelum membuka modul ini.</p>
      </div>
    `;
    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  teachers.forEach(teacherName => {
    const slots = grouped[teacherName];
    const isUBK = teacherName === "Guru UBK" || teacherName.toLowerCase().includes("ubk");
    let currentTeacherRecipient = isUBK ? "Cik Syahfirah Arjaman (Guru UBK)" : teacherName;
    let phone = getTeacherPhone(teacherName);

    if (isUBK && !phone) {
      phone = "+60146708832";
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
    if (isUBK) {
      ubkToggleHtml = `
        <div class="wa-ubk-toggle">
          <span style="font-size:11px; font-weight:700; color:var(--text-secondary);"><i data-lucide="users" style="width:13px;height:13px;display:inline;vertical-align:-2px;margin-right:2px;"></i> Pegawai UBK:</span>
          <button type="button" class="wa-ubk-btn active" data-officer="Cik Syahfirah Arjaman" data-phone="+60146708832">Cik Syahfirah (+60146708832)</button>
          <button type="button" class="wa-ubk-btn" data-officer="Pn. Cecilia Mouintin" data-phone="+60166794345">Pn. Cecilia (+60166794345)</button>
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
}

