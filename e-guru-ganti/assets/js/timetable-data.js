/**
 * ============================================================================
 * e-GGs (e-Guru Ganti Sekolah) V2.6 - Struktur Pangkalan Data Jadual & Guru
 * Sistem Dinamik Berasaskan Google Sheet (Tiada Data Guru/Jadual Hardcoded)
 * Hak Cipta Inovasi: byCikguJayResources
 * ============================================================================
 */

// 1. Senarai Guru Master (Kosong pada permulaan — diisi secara automatik dari Google Sheet / Import)
let MASTER_TEACHERS = [];

// 2. Kumpulan Guru Bertugas (Kosong pada permulaan — diisi secara automatik dari Google Sheet / Import)
let TEACHER_GROUPS = {
  "Kumpulan 1": [],
  "Kumpulan 2": [],
  "Kumpulan 3": [],
  "Kumpulan 4": []
};

// 3. Konfigurasi Slot Waktu Sekolah (Dinamik mengikut tab 'Waktu_Slot' di Google Sheet)
let SCHOOL_SLOTS = [];
let REHAT_SLOT_INDICES = [6];

// Slot Sandaran Standard (Digunakan sebelum Google Sheet disambungkan; dikemaskini automatik selepas segerak)
let STANDARD_SLOTS = [
  "7.00-7.10",   // 0: Perhimpunan / Pengurusan Kelas
  "7.10-7.40",   // 1
  "7.40-8.10",   // 2
  "8.10-8.40",   // 3
  "8.40-9.10",   // 4
  "9.10-9.40",   // 5
  "9.40-10.10",  // 6: Waktu Rehat
  "10.10-10.40", // 7
  "10.40-11.10", // 8
  "11.10-11.40", // 9
  "11.40-12.10", // 10
  "12.10-12.40", // 11
  "12.40-1.10",  // 12
  "1.10-1.40"    // 13
];

// Hari & Bulan Bahasa Melayu
const MALAY_DAYS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
];

// 4. Pangkalan Data Jadual Waktu Guru (Kosong pada permulaan — diisi dari Google Sheet / Import)
// Format: TIMETABLE[namaGuru][hari] = [ [masa, subjek, kelas], ... ]
let TIMETABLE = {};

// 5. Pangkalan Data Jadual Kelas & Pemetaan Subjek-Guru (Dijana secara automatik daripada TIMETABLE / Google Sheet)
let CLASS_TIMETABLES = {};
let CLASS_SUBJECT_TEACHERS = {};
let ALL_MASTER_CLASSES = [];
let MASTER_CLASS_LABELS = {};

// 6. Senarai Nombor Telefon WhatsApp Guru (Kosong pada permulaan — diisi dari Google Sheet / Sistem)
let DEFAULT_TEACHER_PHONES = {};

// 7. Pegawai UBK / Kaunseling (Dinamik)
let UBK_TEACHER_OFFICERS = [];

// 8. Palet Warna Unik Automatik untuk Setiap Guru (32 Palet Khas + Penjana Automatik Tanpa Had)
const TEACHER_COLOR_PALETTES = [
  { primary: "#1d4ed8", border: "#bfdbfe", text: "#1e40af", bg: "#eff6ff" }, // 1. Biru Diraja
  { primary: "#0d9488", border: "#99f6e4", text: "#0f766e", bg: "#f0fdfa" }, // 2. Teal / Hijau Laut
  { primary: "#ea580c", border: "#fed7aa", text: "#9a3412", bg: "#fff7ed" }, // 3. Jingga
  { primary: "#7c3aed", border: "#ddd6fe", text: "#5b21b6", bg: "#f5f3ff" }, // 4. Ungu Violet
  { primary: "#059669", border: "#6ee7b7", text: "#064e3b", bg: "#ecfdf5" }, // 5. Zamrud / Emerald
  { primary: "#e11d48", border: "#fecdd3", text: "#9f1239", bg: "#fff1f2" }, // 6. Merah Jambu Rose
  { primary: "#d97706", border: "#fde68a", text: "#92400e", bg: "#fffbeb" }, // 7. Amber / Emas
  { primary: "#0284c7", border: "#bae6fd", text: "#0369a1", bg: "#f0f9ff" }, // 8. Biru Langit
  { primary: "#4f46e5", border: "#c7d2fe", text: "#3730a3", bg: "#eef2ff" }, // 9. Indigo / Nila
  { primary: "#c026d3", border: "#f5d0fe", text: "#86198f", bg: "#fdf4ff" }, // 10. Fuchsia / Magenta
  { primary: "#16a34a", border: "#bbf7d0", text: "#15803d", bg: "#f0fdf4" }, // 11. Hijau Daun
  { primary: "#dc2626", border: "#fecaca", text: "#991b1b", bg: "#fef2f2" }, // 12. Merah Delima
  { primary: "#65a30d", border: "#d9f99d", text: "#3f6212", bg: "#f7fee7" }, // 13. Hijau Limau (Lime)
  { primary: "#475569", border: "#cbd5e1", text: "#1e293b", bg: "#f8fafc" }, // 14. Kelabu Slate
  { primary: "#0891b2", border: "#a5f3fc", text: "#155e75", bg: "#ecfeff" }, // 15. Cyan / Pirus
  { primary: "#f43f5e", border: "#fecdd3", text: "#be123c", bg: "#fff1f2" }, // 16. Koral Panas
  { primary: "#2563eb", border: "#93c5fd", text: "#1d4ed8", bg: "#eff6ff" }, // 17. Biru Kobalt
  { primary: "#4d7c0f", border: "#bef264", text: "#365314", bg: "#f7fee7" }, // 18. Hijau Zaitun
  { primary: "#9333ea", border: "#e9d5ff", text: "#6b21a8", bg: "#faf5ff" }, // 19. Orkid Ungu
  { primary: "#c2410c", border: "#ffedd5", text: "#7c2d12", bg: "#fff7ed" }, // 20. Terakota / Bata
  { primary: "#06b6d4", border: "#cffafe", text: "#0e7490", bg: "#ecfeff" }, // 21. Biru Akuamarin
  { primary: "#db2777", border: "#fbcfe8", text: "#9d174d", bg: "#fdf2f8" }, // 22. Beri Merah Jambu
  { primary: "#15803d", border: "#86efac", text: "#166534", bg: "#f0fdf4" }, // 23. Hijau Hutan
  { primary: "#ca8a04", border: "#fef08a", text: "#854d0e", bg: "#fefce8" }, // 24. Kuning Marigold
  { primary: "#a21caf", border: "#f0abfc", text: "#701a75", bg: "#fae8ff" }, // 25. Ungu Wain (Plum)
  { primary: "#0369a1", border: "#7dd3fc", text: "#0c4a6e", bg: "#f0f9ff" }, // 26. Biru Pasifik
  { primary: "#8b5cf6", border: "#ddd6fe", text: "#6d28d9", bg: "#f5f3ff" }, // 27. Ungu Lavender Moden
  { primary: "#0f766e", border: "#99f6e4", text: "#115e59", bg: "#f0fdfa" }, // 28. Hijau Pirus Gelap
  { primary: "#b91c1c", border: "#fecaca", text: "#7f1d1d", bg: "#fef2f2" }, // 29. Merah Ruby
  { primary: "#b45309", border: "#fde68a", text: "#78350f", bg: "#fffbeb" }, // 30. Gangsa / Bronze
  { primary: "#1e40af", border: "#bfdbfe", text: "#1e3a8a", bg: "#eff6ff" }, // 31. Biru Nilam (Sapphire)
  { primary: "#047857", border: "#a7f3d0", text: "#065f46", bg: "#ecfdf5" }  // 32. Hijau Pudina (Mint)
];

// Simpanan kod warna guru yang disegerakkan daripada Google Sheet (Tab Senarai_Guru)
let TEACHER_CUSTOM_COLORS = {};

/**
 * Menukarkan kod warna HEX (cth: "#0d9488") kepada objek palet lengkap { primary, border, text, bg }
 */
function hexToTeacherPalette(hexOrObj) {
  if (!hexOrObj) return null;
  if (typeof hexOrObj === "object" && hexOrObj.primary) {
    return hexOrObj;
  }
  const cleanHex = String(hexOrObj).trim().toLowerCase();
  if (!cleanHex.startsWith("#")) return null;

  // 1. Semak jika sepadan dengan salah satu daripada 32 palet rasmi
  const matched = TEACHER_COLOR_PALETTES.find(p => p.primary.toLowerCase() === cleanHex);
  if (matched) return matched;

  // 2. Bina palet harmoni automatik daripada nilai HEX
  let hex = cleanHex.slice(1);
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  if (hex.length !== 6) return null;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return {
    primary: cleanHex,
    border: `rgba(${r}, ${g}, ${b}, 0.30)`,
    text: cleanHex,
    bg: `rgba(${r}, ${g}, ${b}, 0.07)`
  };
}

/**
 * Mendapatkan kod warna unik bagi setiap guru secara automatik.
 * Setiap kali nama guru baharu dimasukkan ke dalam Google Sheet / Sistem,
 * mereka akan terus diberikan kod warna unik secara automatik tanpa perlu ditetapkan manual.
 */
function getTeacherColor(name) {
  if (!name) {
    return {
      primary: "#94a3b8",
      border: "#e2e8f0",
      text: "#334155",
      bg: "#ffffff"
    };
  }

  const cleanName = String(name).trim();

  // 1. Warna khas untuk Guru UBK / Kaunseling
  if (cleanName.toLowerCase().includes("ubk")) {
    return {
      primary: "#9333ea",
      border: "#d8b4fe",
      text: "#6b21a8",
      bg: "#faf5ff"
    };
  }

  // 2. Jika terdapat kod warna daripada Google Sheet (TEACHER_CUSTOM_COLORS), gunakannya
  if (TEACHER_CUSTOM_COLORS[cleanName]) {
    const customPal = hexToTeacherPalette(TEACHER_CUSTOM_COLORS[cleanName]);
    if (customPal) return customPal;
  }

  // 3. Agihan warna unik automatik mengikut turutan dalam MASTER_TEACHERS (Tiada pertindihan warna!)
  if (Array.isArray(MASTER_TEACHERS)) {
    const listIdx = MASTER_TEACHERS.indexOf(cleanName);
    if (listIdx >= 0) {
      if (listIdx < TEACHER_COLOR_PALETTES.length) {
        return TEACHER_COLOR_PALETTES[listIdx];
      }
      // Jika sekolah mempunyai lebih daripada 32 orang guru, jana warna unik berasaskan sudut emas (Golden Angle)
      const hue = Math.round((listIdx * 137.508) % 360);
      return {
        primary: `hsl(${hue}, 75%, 42%)`,
        border: `hsl(${hue}, 70%, 82%)`,
        text: `hsl(${hue}, 80%, 26%)`,
        bg: `hsl(${hue}, 80%, 97%)`
      };
    }
  }

  // 4. Penjana warna unik automatik (Golden Angle HSL) untuk mana-mana nama guru baharu / serta-merta
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const paletteIdx = Math.abs(hash) % TEACHER_COLOR_PALETTES.length;
  return TEACHER_COLOR_PALETTES[paletteIdx];
}

function getGuruCardColor(name) {
  const col = getTeacherColor(name);
  return {
    header: "",
    primary: col.primary,
    border: col.border,
    text: col.text,
    bg: col.bg
  };
}

/**
 * Menukarkan format masa (cth: "7.30" atau "13.10") kepada minit dari tengah malam
 */
function parseTimeToMinutes(t) {
  if (!t) return 0;
  let [h, m] = t.toString().replace(":", ".").split(".").map(Number);
  if (isNaN(h)) return 0;
  if (h < 7) h += 12;
  return h * 60 + (m || 0);
}

/**
 * Memecahkan blok masa bertindan (cth: "7.10-8.10") kepada slot-slot individu standard
 */
function splitTimeSlot(s) {
  if (!s) return [];
  const normalized = s.toString().replace(/[–—\u2013\u2014]/g, "-").replace(/â€“|â€”/g, "-").trim();
  const cleanNorm = normalized.replace(/\s+/g, "");

  // Jika sudah sepadan tepat dengan salah satu STANDARD_SLOTS
  const exactMatch = STANDARD_SLOTS.find(std => std && std.replace(/\s+/g, "") === cleanNorm);
  if (exactMatch) return [exactMatch];

  const parts = normalized.split("-");
  if (parts.length !== 2) return [s];
  try {
    const st = parseTimeToMinutes(parts[0].trim());
    const en = parseTimeToMinutes(parts[1].trim());
    const matched = [];
    for (let i = 1; i < STANDARD_SLOTS.length; i++) {
      if (REHAT_SLOT_INDICES.includes(i)) continue;
      const std = STANDARD_SLOTS[i];
      if (!std || std.toLowerCase().includes("rehat")) continue;
      const sn = std.replace(/[–—\u2013\u2014]/g, "-").replace(/â€“|â€”/g, "-").split("-");
      if (sn.length === 2) {
        const sm = parseTimeToMinutes(sn[0].trim());
        const em = parseTimeToMinutes(sn[1].trim());
        if (sm >= st && em <= en) matched.push(std);
      }
    }
    return matched.length ? matched : [s];
  } catch (e) {
    return [s];
  }
}

/**
 * Membina semula CLASS_TIMETABLES, CLASS_SUBJECT_TEACHERS, dan ALL_MASTER_CLASSES
 * secara automatik daripada TIMETABLE (Jadual Guru) dan/atau senarai kelas Google Sheet.
 */
function rebuildClassTimetablesFromMaster(explicitClasses = []) {
  const newClassTT = {};
  const newClassSubjTeachers = {};
  const classSet = new Set(Array.isArray(explicitClasses) ? explicitClasses.filter(Boolean) : []);

  if (TIMETABLE && typeof TIMETABLE === "object") {
    Object.entries(TIMETABLE).forEach(([guru, daysObj]) => {
      if (!daysObj || typeof daysObj !== "object") return;
      Object.entries(daysObj).forEach(([hari, lessons]) => {
        if (!Array.isArray(lessons)) return;
        lessons.forEach(item => {
          let masa = "", subjek = "", kelas = "", explicitSlot = null;
          if (Array.isArray(item)) {
            masa = (item[0] || "").toString().trim();
            subjek = (item[1] || "").toString().trim();
            kelas = (item[2] || "").toString().trim();
            if (item[3] !== undefined) explicitSlot = Number(item[3]);
          } else if (item && typeof item === "object") {
            masa = (item.masa || "").toString().trim();
            subjek = (item.subjek || "").toString().trim();
            kelas = (item.kelas || "").toString().trim();
            if (item.slot !== undefined) explicitSlot = Number(item.slot);
          }
          if (!kelas || !subjek) return;

          classSet.add(kelas);
          if (!newClassTT[kelas]) newClassTT[kelas] = {};
          if (!newClassTT[kelas][hari]) newClassTT[kelas][hari] = [];
          if (!newClassSubjTeachers[kelas]) newClassSubjTeachers[kelas] = {};
          newClassSubjTeachers[kelas][subjek] = guru;

          // Tentukan indeks slot
          let slotIndices = [];
          if (explicitSlot && explicitSlot >= 1) {
            slotIndices = [explicitSlot];
          } else if (masa) {
            const individualSlots = splitTimeSlot(masa);
            individualSlots.forEach(ms => {
              let idx = STANDARD_SLOTS.indexOf(ms);
              if (idx < 0) {
                idx = STANDARD_SLOTS.findIndex(st => st && st.replace(/\s+/g, "") === ms.replace(/\s+/g, ""));
              }
              if (idx >= 1) slotIndices.push(idx);
            });
          }

          slotIndices.forEach(sIdx => {
            const token = `${sIdx}|${subjek}|${guru}`;
            if (!newClassTT[kelas][hari].includes(token)) {
              newClassTT[kelas][hari].push(token);
            }
          });
        });
      });
    });
  }

  CLASS_TIMETABLES = newClassTT;
  CLASS_SUBJECT_TEACHERS = newClassSubjTeachers;

  const sortedClasses = Array.from(classSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

  ALL_MASTER_CLASSES = sortedClasses;
  sortedClasses.forEach(c => {
    if (!MASTER_CLASS_LABELS[c]) {
      MASTER_CLASS_LABELS[c] = c;
    }
  });

  return sortedClasses;
}

/**
 * Mendapatkan maklumat slot jadual kelas (Guru & Subjek) bagi Kelas, Hari & Indeks Slot
 */
function getClassTimetableSlot(kelas, hari, slotIndex) {
  if (!kelas || !hari) return null;

  const targetClass = kelas.toString().trim();
  const slotNum = Number(slotIndex);
  const slotTime = STANDARD_SLOTS[slotNum] || "";
  const cleanSlotTime = slotTime.replace(/\s+/g, "");

  const teachers = [];
  const subjects = [];

  // 1. Semak daripada CLASS_TIMETABLES jika wujud
  const classData = CLASS_TIMETABLES[targetClass] && CLASS_TIMETABLES[targetClass][hari];
  if (Array.isArray(classData) && classData.length > 0) {
    classData.forEach(item => {
      const parts = item.split("|");
      const s = Number(parts[0]);
      const subjek = parts[1] || "";
      const guruFromToken = parts[2] || "";
      if (s === slotNum && subjek) {
        const guru = guruFromToken || (CLASS_SUBJECT_TEACHERS[targetClass] && CLASS_SUBJECT_TEACHERS[targetClass][subjek]) || "";
        if (guru && !teachers.includes(guru)) teachers.push(guru);
        if (subjek && !subjects.includes(subjek)) subjects.push(subjek);
      }
    });
  }

  // 2. Semak secara langsung daripada TIMETABLE (Auto-Inversion) jika belum ditemui
  if (teachers.length === 0 && TIMETABLE && typeof TIMETABLE === "object") {
    Object.entries(TIMETABLE).forEach(([guru, daysObj]) => {
      if (!daysObj || !Array.isArray(daysObj[hari])) return;
      daysObj[hari].forEach(entry => {
        let m = "", s = "", k = "", sNum = null;
        if (Array.isArray(entry)) {
          m = (entry[0] || "").toString().trim();
          s = (entry[1] || "").toString().trim();
          k = (entry[2] || "").toString().trim();
          if (entry[3] !== undefined) sNum = Number(entry[3]);
        } else if (entry && typeof entry === "object") {
          m = (entry.masa || "").toString().trim();
          s = (entry.subjek || "").toString().trim();
          k = (entry.kelas || "").toString().trim();
          if (entry.slot !== undefined) sNum = Number(entry.slot);
        }

        if (k.toLowerCase() === targetClass.toLowerCase() && s) {
          let isMatch = false;
          if (sNum !== null && sNum === slotNum) {
            isMatch = true;
          } else if (m && cleanSlotTime) {
            const expanded = splitTimeSlot(m);
            isMatch = expanded.some(ex => ex.replace(/\s+/g, "") === cleanSlotTime);
          }
          if (isMatch) {
            if (!teachers.includes(guru)) teachers.push(guru);
            if (!subjects.includes(s)) subjects.push(s);
          }
        }
      });
    });
  }

  if (!teachers.length) return null;

  return {
    guru: teachers.join(" / "),
    subjek: subjects.join(" / "),
    guruList: teachers
  };
}

function getTeacherForSlot(kelas, hari, slotIndex) {
  const slotInfo = getClassTimetableSlot(kelas, hari, slotIndex);
  return slotInfo ? slotInfo.guru : null;
}

// Pemetaan Pasangan Mata Pelajaran Serentak (Pendidikan Islam / Moral & Bahasa Arab / Bahasa Tambahan)
const CONCURRENT_SUBJECT_PAIRS = {
  "PI": "PM",
  "PM": "PI",
  "BA": "BKD",
  "BKD": "BA",
  "BC": "BT",
  "BT": "BC"
};

function getConcurrentPartnerInfo(kelas, hari, masaVal, subjek, absentTeachers = []) {
  if (!kelas || !hari || !masaVal || !subjek) return null;

  const sClean = subjek.trim().toUpperCase();
  const targetSubjek = CONCURRENT_SUBJECT_PAIRS[sClean];
  if (!targetSubjek) return null;

  let slotIndex = STANDARD_SLOTS.indexOf(masaVal.trim());
  if (slotIndex < 0) {
    slotIndex = STANDARD_SLOTS.findIndex(s => s && s.replace(/\s+/g, "") === masaVal.trim().replace(/\s+/g, ""));
  }
  if (slotIndex < 0) return null;

  const slotInfo = getClassTimetableSlot(kelas, hari, slotIndex);
  if (!slotInfo || !slotInfo.subjek.split("/").map(x => x.trim().toUpperCase()).includes(targetSubjek)) {
    return null;
  }

  const partnerTeacher = (CLASS_SUBJECT_TEACHERS[kelas] && CLASS_SUBJECT_TEACHERS[kelas][targetSubjek]) ||
    slotInfo.guruList.find(g => !absentTeachers.includes(g));
  if (!partnerTeacher) return null;

  if (absentTeachers && absentTeachers.includes(partnerTeacher)) {
    return null;
  }

  return {
    nama: partnerTeacher,
    subjekAsal: sClean,
    partnerSubjek: targetSubjek,
    kelas: kelas,
    hari: hari,
    masa: masaVal,
    slotIndex: slotIndex,
    status: "Pasangan Serentak (Cantum Kelas)",
    boleh: true
  };
}
