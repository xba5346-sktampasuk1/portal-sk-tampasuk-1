/**
 * ============================================================================
 * e-GGs (e-Guru Ganti Sekolah) V2.6 - Google Apps Script (Backend Dinamik)
 * Sistem Pangkalan Data 5-Tab Automatik + Penjana Kod Warna Guru Automatik
 * Hak Cipta Inovasi: byCikguJayResources
 * ============================================================================
 *
 * PANDUAN PEMASANGAN PANTAS:
 * 1. Buka Google Sheet sekolah anda -> klik Extensions > Apps Script.
 * 2. Padam kod asal dan tampal keseluruhan kod daripada fail Code.gs ini.
 * 3. Tekan Save (Ctrl+S), pilih fungsi "setupSheet" di bar atas, dan klik "Run".
 *    (5 tab pangkalan data sekolah akan dibina secara automatik!)
 * 4. Klik "Deploy" > "New deployment" > pilih jenis "Web app":
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Salin URL Web App yang dijana dan tampal ke dalam fail assets/js/config.js
 *    (pada pembolehubah HARDCODED_GOOGLE_SHEET_URL) atau melalui tetapan web.
 * ============================================================================
 */

const SHEET_TETAPAN = "Tetapan_Sekolah";
const SHEET_SLOT    = "Waktu_Slot";
const SHEET_GURU    = "Senarai_Guru";
const SHEET_JADUAL  = "Jadual_Waktu";
const SHEET_REKOD   = "Rekod_Guru_Ganti";

// 32 Kod Warna Unik Automatik untuk Guru (Digunakan secara automatik apabila nama guru baharu dimasukkan)
const MASTER_TEACHER_HEX_COLORS = [
  "#1d4ed8", "#0d9488", "#ea580c", "#7c3aed", "#059669", "#e11d48", "#d97706", "#0284c7",
  "#4f46e5", "#c026d3", "#16a34a", "#dc2626", "#65a30d", "#475569", "#0891b2", "#f43f5e",
  "#2563eb", "#4d7c0f", "#9333ea", "#c2410c", "#06b6d4", "#db2777", "#15803d", "#ca8a04",
  "#a21caf", "#0369a1", "#8b5cf6", "#0f766e", "#b91c1c", "#b45309", "#1e40af", "#047857"
];

/**
 * ============================================================================
 * ENDPOINT GET (Membekalkan Data Sekolah & Rekod ke Laman Web)
 * ============================================================================
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getSchoolData";

    if (action === "getSchoolData") {
      const schoolData = getSchoolDataPayload();
      return ContentService.createTextOutput(JSON.stringify(schoolData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getRecords") {
      const recordsData = getRecordsPayload();
      return ContentService.createTextOutput(JSON.stringify(recordsData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Tindakan GET tidak sah: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ============================================================================
 * ENDPOINT POST (Menyimpan, Mengemas Kini & Memadam Rekod Penggantian)
 * ============================================================================
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Simpan Rekod Baharu
    if (data.action === "saveRecords" && Array.isArray(data.records)) {
      let sheetRekod = ss.getSheetByName(SHEET_REKOD);
      if (!sheetRekod) {
        setupSheet();
        sheetRekod = ss.getSheetByName(SHEET_REKOD);
      }

      const settings = getSchoolSettings();
      const emailMap = getTeacherEmailMap();
      let emailSentCount = 0;

      data.records.forEach(r => {
        sheetRekod.appendRow([
          r.tarikh || "",
          r.hari || "",
          r.minggu || "",
          r.kumpulan || "",
          r.guru_tidak_hadir || "",
          r.sebab || "",
          r.masa || "",
          r.mata_pelajaran || "",
          r.kelas || "",
          r.guru_ganti || "",
          r.catatan || "",
          new Date()
        ]);

        const teacherEmail = emailMap[r.guru_ganti];
        if (teacherEmail && teacherEmail.includes("@")) {
          try {
            sendReliefSlipEmail(teacherEmail, r, settings);
            emailSentCount++;
          } catch (errEmail) {
            Logger.log("Gagal menghantar emel kepada " + teacherEmail + ": " + errEmail);
          }
        }
      });

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        savedCount: data.records.length,
        emailSentCount: emailSentCount
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Padam / Batal Tugasan
    if (data.action === "deleteRecord") {
      let sheetRekod = ss.getSheetByName(SHEET_REKOD);
      if (sheetRekod) {
        const rows = sheetRekod.getDataRange().getValues();
        const hasKumpulan = rows[0] && rows[0].length >= 12 && String(rows[0][3]).toLowerCase().includes("kumpulan");
        const off = hasKumpulan ? 1 : 0;

        for (let i = rows.length - 1; i >= 1; i--) {
          const row = rows[i];
          const rTarikh = row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "yyyy-MM-dd") : "";
          if (rTarikh === data.tarikh &&
              String(row[5 + off]).trim() === String(data.masa || "").trim() &&
              String(row[7 + off]).trim() === String(data.kelas || "").trim() &&
              String(row[3 + off]).trim() === String(data.guru_tidak_hadir || "").trim()) {
            sheetRekod.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Rekod berjaya dipadam dari Google Sheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Kemas Kini Tugasan Sedia Ada
    if (data.action === "updateRecord" && data.record) {
      const r = data.record;
      let sheetRekod = ss.getSheetByName(SHEET_REKOD);
      if (sheetRekod) {
        const rows = sheetRekod.getDataRange().getValues();
        const hasKumpulan = rows[0] && rows[0].length >= 12 && String(rows[0][3]).toLowerCase().includes("kumpulan");
        const off = hasKumpulan ? 1 : 0;

        for (let i = rows.length - 1; i >= 1; i--) {
          const row = rows[i];
          const rTarikh = row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "yyyy-MM-dd") : "";
          if (rTarikh === r.tarikh &&
              String(row[5 + off]).trim() === String(r.masa || "").trim() &&
              String(row[7 + off]).trim() === String(r.kelas || "").trim() &&
              String(row[3 + off]).trim() === String(r.guru_tidak_hadir || "").trim()) {
            if (r.guru_ganti) sheetRekod.getRange(i + 1, 9 + off).setValue(r.guru_ganti);
            if (r.mata_pelajaran) sheetRekod.getRange(i + 1, 7 + off).setValue(r.mata_pelajaran);
            if (r.sebab) sheetRekod.getRange(i + 1, 5 + off).setValue(r.sebab);
            sheetRekod.getRange(i + 1, 11 + off).setValue(new Date());
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Rekod berjaya dikemas kini di Google Sheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Tindakan POST tidak sah"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ============================================================================
 * FUNGSI: MEMBACA PROFIL SEKOLAH (Tetapan_Sekolah)
 * ============================================================================
 */
function getSchoolSettings() {
  const settings = {
    schoolName: "",
    schoolCode: "",
    schoolAddress: "",
    schoolPPD: "",
    schoolMotto: "",
    schoolSubMotto: "",
    schoolLogo: "",
    adminPass: "",
    defaultUser: "",
    defaultPass: "",
    overloadDaily: 8,
    overloadWeekly: 8,
    overloadThresholdDaily: 8,
    overloadThresholdWeekly: 8,
    hasAfternoonSession: false
  };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_TETAPAN);
  if (!sheet) return settings;

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const key = String(rows[i][0] || "").trim().toLowerCase();
    const val = String(rows[i][1] || "").trim();
    if (!val) continue;

    if ((key.includes("nama sekolah") || key === "schoolname") && val !== "NAMA SEKOLAH ANDA") {
      settings.schoolName = val;
    } else if (key.includes("kod sekolah") || key === "schoolcode") {
      settings.schoolCode = val;
      if (!settings.defaultUser) settings.defaultUser = val;
    } else if (key === "defaultuser" || key.includes("id pengguna")) {
      settings.defaultUser = val;
    } else if ((key.includes("alamat") || key === "schooladdress") && val !== "ALAMAT SURAT-MENYURAT SEKOLAH ANDA") {
      settings.schoolAddress = val;
    } else if (key.includes("ppd") || key.includes("jpn") || key.includes("jabatan") || key === "schoolppd") {
      settings.schoolPPD = val;
    } else if (key.includes("sub-moto") || key.includes("sub motto") || key.includes("slogan") || key === "schoolsubmotto") {
      settings.schoolSubMotto = val;
    } else if (key.includes("moto") || key.includes("motto") || key === "schoolmotto") {
      settings.schoolMotto = val;
    } else if (key.includes("logo") || key === "schoollogo") {
      settings.schoolLogo = val;
    } else if (key.includes("kata laluan") || key.includes("password") || key === "defaultpass" || key === "adminpass") {
      settings.adminPass = val;
      settings.defaultPass = val;
    } else if (key.includes("beban harian") || key === "overloadthresholddaily") {
      const d = parseInt(val, 10) || 8;
      settings.overloadDaily = d;
      settings.overloadThresholdDaily = d;
    } else if (key.includes("beban mingguan") || key === "overloadthresholdweekly") {
      const w = parseInt(val, 10) || 8;
      settings.overloadWeekly = w;
      settings.overloadThresholdWeekly = w;
    } else if (key.includes("sesi")) {
      settings.hasAfternoonSession = val.toLowerCase().includes("petang") || val.toLowerCase().includes("dua");
    }
  }

  return settings;
}

/**
 * ============================================================================
 * FUNGSI: MEMBINA PAYLOAD DATA LENGKAP SEKOLAH (5 TAB)
 * ============================================================================
 */
function getSchoolDataPayload() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = getSchoolSettings();

  // 1. Ambil Konfigurasi Waktu Slot (Tab Waktu_Slot)
  const slotsPagi = [];
  const slotsPetang = [];
  const allSlotLabels = [];
  const slotMap = {};
  const standardSlots = ["7.00-7.10"]; // Indeks 0: Perhimpunan / Pengurusan Kelas
  const rehatIndices = [];

  const sheetSlot = ss.getSheetByName(SHEET_SLOT);
  if (sheetSlot) {
    const rowsSlot = sheetSlot.getDataRange().getValues();
    for (let i = 1; i < rowsSlot.length; i++) {
      const slotNum = parseInt(rowsSlot[i][0], 10) || i;
      const mula = String(rowsSlot[i][1] || "").trim();
      const tamat = String(rowsSlot[i][2] || "").trim();
      let label = String(rowsSlot[i][3] || "").trim();
      if (!label && mula && tamat) label = `${mula}-${tamat}`;
      const sesi = String(rowsSlot[i][4] || "Pagi").trim().toLowerCase();
      const jenis = String(rowsSlot[i][5] || "Pengajaran").trim();

      const item = {
        slot: slotNum,
        mula: mula,
        tamat: tamat,
        label: label,
        sesi: sesi.includes("petang") ? "Petang" : "Pagi",
        jenis: jenis
      };

      if (item.sesi === "Petang") {
        slotsPetang.push(item);
        slotMap[`Petang_${slotNum}`] = label;
      } else {
        slotsPagi.push(item);
        slotMap[`Pagi_${slotNum}`] = label;
        standardSlots[slotNum] = label;
        if (jenis.toLowerCase().includes("rehat")) {
          rehatIndices.push(slotNum);
        }
      }
      if (label && !allSlotLabels.includes(label)) {
        allSlotLabels.push(label);
      }
    }
  }
  if (rehatIndices.length === 0) rehatIndices.push(6);

  // 2. Ambil Senarai Guru, Kumpulan Bertugas, No Telefon, Emel & Kod Warna Automatik (Tab Senarai_Guru)
  const teachers = [];
  const teacherPhones = {};
  const teacherEmails = {};
  const teacherColors = {};
  const teacherGroups = {
    "Kumpulan 1": [],
    "Kumpulan 2": [],
    "Kumpulan 3": [],
    "Kumpulan 4": []
  };
  const teacherSessions = {};

  const sheetGuru = ss.getSheetByName(SHEET_GURU);
  if (sheetGuru) {
    const rowsGuru = sheetGuru.getDataRange().getValues();
    const header = rowsGuru[0] ? rowsGuru[0].map(h => String(h || "").toLowerCase()) : [];
    const hasGroupCol = header.some(h => h.includes("kumpulan"));

    // Pastikan tajuk Baris 1 mempunyai ruangan Kumpulan Bertugas (Pilihan) & Kod Warna Automatik
    if (!hasGroupCol || (rowsGuru[0] && rowsGuru[0].length < 6)) {
      try {
        sheetGuru.getRange(1, 1, 1, 6).setValues([[
          "Nama Guru",
          "Kumpulan Bertugas (Pilihan: Kumpulan 1 - 4 / Kosongkan Jika Tiada)",
          "No Telefon WhatsApp (cth: 60123456789)",
          "Emel Rasmi (Pilihan)",
          "Sesi",
          "Kod Warna (Automatik)"
        ]]);
        sheetGuru.getRange("A1:F1").setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
      } catch (e) {}
    }

    for (let i = 1; i < rowsGuru.length; i++) {
      const name = String(rowsGuru[i][0] || "").trim();
      if (!name || name.toLowerCase() === "nama guru" || name.toLowerCase() === "nama_guru") continue;

      let group = "";
      let phone = "";
      let email = "";
      let sesi = "Pagi";
      let colorHex = "";

      // Pengesanan Pintar Lajur B hingga F (Menyokong kedua-dua susunan penuh 6-lajur dan susunan lama)
      for (let c = 1; c < Math.min(rowsGuru[i].length, 7); c++) {
        const val = String(rowsGuru[i][c] || "").trim();
        if (!val) continue;

        if (/^(kumpulan\s*[1-9]|[1-9])$/i.test(val)) {
          if (!group) group = val;
        } else if (val.startsWith("#") && (val.length === 7 || val.length === 4)) {
          if (!colorHex) colorHex = val;
        } else if (val.includes("@")) {
          if (!email) email = val;
        } else if (/^(pagi|petang)$/i.test(val)) {
          sesi = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        } else if (/^\+?6?01[\d\-\s]{6,12}$/.test(val) || /^6\.01e\+\d+$/i.test(val)) {
          if (!phone && !/^6\.01e\+\d+$/i.test(val)) phone = val;
        } else if (c === 1 && hasGroupCol && !group) {
          group = val;
        } else if (c === 2 && !phone) {
          phone = val;
        }
      }

      if (!teachers.includes(name)) teachers.push(name);
      const tIdx = teachers.indexOf(name);

      // AUTO-ASSIGN KOD WARNA GURU: Jika belum ada kod warna dalam Google Sheet, berikan secara automatik!
      if (!colorHex || !colorHex.startsWith("#")) {
        colorHex = MASTER_TEACHER_HEX_COLORS[tIdx % MASTER_TEACHER_HEX_COLORS.length];
        try {
          sheetGuru.getRange(i + 1, 6).setValue(colorHex);
        } catch (e) {}
      }
      teacherColors[name] = colorHex;

      if (phone) teacherPhones[name] = phone;
      if (email) teacherEmails[name] = email;
      teacherSessions[name] = sesi;

      if (group) {
        let normGroup = group;
        if (/^[1-9]$/.test(group)) normGroup = "Kumpulan " + group;
        else if (/^kumpulan\s*([1-9])$/i.test(group)) {
          normGroup = "Kumpulan " + group.match(/([1-9])/)[1];
        }
        if (!teacherGroups[normGroup]) teacherGroups[normGroup] = [];
        if (!teacherGroups[normGroup].includes(name)) {
          teacherGroups[normGroup].push(name);
        }
      }
    }
  }

  // 3. Ambil Jadual Waktu Penuh & Auto-Detect Kelas serta Kumpulan Bertugas (Tab Jadual_Waktu)
  const timetableByTeacher = {};
  const detectedClassesSet = {};

  const sheetJadual = ss.getSheetByName(SHEET_JADUAL);
  if (sheetJadual) {
    const rowsJadual = sheetJadual.getDataRange().getValues();
    for (let i = 1; i < rowsJadual.length; i++) {
      const guru = String(rowsJadual[i][0] || "").trim();
      let hari = String(rowsJadual[i][1] || "").trim();
      const rawSlot = String(rowsJadual[i][2] || "").trim();
      const subjek = String(rowsJadual[i][3] || "").trim();
      const kelas = String(rowsJadual[i][4] || "").trim();
      const col6 = String(rowsJadual[i][5] || "").trim();
      const col7 = String(rowsJadual[i][6] || "").trim();

      if (!guru || guru.toLowerCase() === "nama guru" || !hari || !rawSlot || !subjek || !kelas) continue;
      if (kelas.toLowerCase() === "kelas" || subjek.toLowerCase() === "mata pelajaran" || rawSlot.toLowerCase().includes("slot")) continue;

      if (hari.toLowerCase().includes("isn")) hari = "Isnin";
      else if (hari.toLowerCase().includes("sel")) hari = "Selasa";
      else if (hari.toLowerCase().includes("rab")) hari = "Rabu";
      else if (hari.toLowerCase().includes("kha")) hari = "Khamis";
      else if (hari.toLowerCase().includes("jum")) hari = "Jumaat";

      if (!teachers.includes(guru)) {
        teachers.push(guru);
        const newIdx = teachers.indexOf(guru);
        teacherColors[guru] = MASTER_TEACHER_HEX_COLORS[newIdx % MASTER_TEACHER_HEX_COLORS.length];
      }

      // Sokong pengisian Kumpulan Bertugas terus di tab Jadual_Waktu (Lajur F atau G) jika diisi
      const rawGrp = (/^(kumpulan\s*[1-9]|[1-9])$/i.test(col6)) ? col6 : ((/^(kumpulan\s*[1-9]|[1-9])$/i.test(col7)) ? col7 : "");
      if (rawGrp) {
        let normGroup = rawGrp;
        if (/^[1-9]$/.test(rawGrp)) normGroup = "Kumpulan " + rawGrp;
        else if (/^kumpulan\s*([1-9])$/i.test(rawGrp)) normGroup = "Kumpulan " + rawGrp.match(/([1-9])/)[1];
        if (!teacherGroups[normGroup]) teacherGroups[normGroup] = [];
        if (!teacherGroups[normGroup].includes(guru)) {
          teacherGroups[normGroup].push(guru);
        }
      }

      if (kelas && kelas.toLowerCase() !== "kelas") {
        detectedClassesSet[kelas] = true;
      }

      // Tentukan masa slot & nombor slot
      let slotNum = parseInt(rawSlot, 10);
      let slotTime = "";
      if (!isNaN(slotNum) && slotNum >= 1 && !rawSlot.includes("-") && !rawSlot.includes(".")) {
        slotTime = standardSlots[slotNum] || slotMap[`Pagi_${slotNum}`] || `Slot ${slotNum}`;
      } else {
        slotTime = rawSlot;
        const foundIdx = standardSlots.findIndex(s => s && s.replace(/\s+/g, "") === rawSlot.replace(/\s+/g, ""));
        slotNum = foundIdx >= 1 ? foundIdx : 0;
      }

      if (!timetableByTeacher[guru]) timetableByTeacher[guru] = {};
      if (!timetableByTeacher[guru][hari]) timetableByTeacher[guru][hari] = [];
      timetableByTeacher[guru][hari].push([slotTime, subjek, kelas, slotNum || undefined]);
    }
  }

  const detectedClasses = Object.keys(detectedClassesSet)
    .filter(c => c && c.toLowerCase() !== "kelas" && c.toLowerCase() !== "nama guru")
    .sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });

  return {
    status: "success",
    profile: settings,
    settings: settings,
    slots: standardSlots.length > 1 ? standardSlots : null,
    rehatIndices: rehatIndices,
    slotsDetail: {
      pagi: slotsPagi,
      petang: slotsPetang,
      allLabels: allSlotLabels,
      slotMap: slotMap
    },
    classes: detectedClasses,
    teachers: teachers,
    phones: teacherPhones,
    teacherPhones: teacherPhones,
    teacherEmails: teacherEmails,
    groups: teacherGroups,
    teacherGroups: teacherGroups,
    colors: teacherColors,
    teacherColors: teacherColors,
    teacherSessions: teacherSessions,
    timetable: timetableByTeacher,
    timetableByTeacher: timetableByTeacher
  };
}

/**
 * ============================================================================
 * FUNGSI: MEMBACA REKOD SEJARAH (Rekod_Guru_Ganti)
 * ============================================================================
 */
function getRecordsPayload() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_REKOD);

  if (!sheet) {
    return { status: "success", data: [] };
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: "success", data: [] };
  }

  const hasKumpulanCol = rows[0] && rows[0].length >= 12 && String(rows[0][3]).toLowerCase().includes("kumpulan");
  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const offset = hasKumpulanCol ? 1 : 0;
    records.push({
      tarikh: row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "yyyy-MM-dd") : "",
      hari: row[1],
      minggu: row[2],
      kumpulan: hasKumpulanCol ? row[3] : "",
      guru_tidak_hadir: row[3 + offset],
      sebab: row[4 + offset],
      masa: row[5 + offset],
      mata_pelajaran: row[6 + offset],
      kelas: row[7 + offset],
      guru_ganti: row[8 + offset],
      catatan: row[9 + offset],
      timestamp: row[10 + offset]
    });
  }

  return {
    status: "success",
    data: records.reverse()
  };
}

/**
 * ============================================================================
 * FUNGSI: PEMETAAN EMEL GURU (UNTUK NOTIFIKASI SLIP AUTOMATIK PILIHAN)
 * ============================================================================
 */
function getTeacherEmailMap() {
  const map = {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_GURU);
  if (!sheet) return map;

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const name = String(values[i][0] || "").trim();
    const col2 = String(values[i][2] || "").trim();
    const col3 = String(values[i][3] || "").trim();
    const email = col3.includes("@") ? col3 : (col2.includes("@") ? col2 : "");
    if (name && email) {
      map[name] = email;
    }
  }
  return map;
}

/**
 * ============================================================================
 * FUNGSI: MENGHANTAR SLIP GURU GANTI MELALUI EMEL RASMI
 * ============================================================================
 */
function sendReliefSlipEmail(recipientEmail, r, settings) {
  const schoolName = (settings && settings.schoolName) ? settings.schoolName : "SEKOLAH ANDA";
  const subject = `[e-GGs] Slip Guru Ganti: ${r.tarikh} (Kelas ${r.kelas} - ${r.mata_pelajaran})`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a, #1e3a8a); color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #eab308;">
        <h2 style="margin: 0; font-size: 20px;">${schoolName}</h2>
        <p style="margin: 6px 0 0; font-size: 13px; color: #93c5fd; font-weight: bold; text-transform: uppercase;">Slip Rasmi e-GGs (e-Guru Ganti Sekolah)</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff; color: #1e293b; font-size: 13.5px; line-height: 1.6;">
        <p style="margin-top: 0;">Salam sejahtera <strong>${r.guru_ganti}</strong>,</p>
        <p>Anda telah ditugaskan untuk menggantikan kelas berikut:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold; width: 40%;">Tarikh & Hari:</td>
            <td style="padding: 9px 12px; font-weight: bold; color: #1e3a8a;">${r.tarikh} (${r.hari})</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold;">Minggu / Kumpulan:</td>
            <td style="padding: 9px 12px;">${r.minggu || "—"} ${r.kumpulan ? "(" + r.kumpulan + ")" : ""}</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold;">Waktu / Masa:</td>
            <td style="padding: 9px 12px; font-family: monospace; font-weight: bold; color: #2563eb;">${r.masa}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold;">Kelas & Subjek:</td>
            <td style="padding: 9px 12px; font-weight: bold;">Kelas ${r.kelas} — ${r.mata_pelajaran}</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold;">Guru Asal:</td>
            <td style="padding: 9px 12px; color: #dc2626; font-weight: 600;">${r.guru_tidak_hadir} (${r.sebab})</td>
          </tr>
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
          Terima kasih atas kerjasama dan komitmen anda dalam menjamin kelangsungan pembelajaran murid (MMI).<br>
          <em>— Pentadbiran ${schoolName}</em>
        </p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * ============================================================================
 * FUNGSI: PENYEDIAAN 5 TAB GOOGLE SHEET SECARA AUTOMATIK (RUN ONCE)
 * ============================================================================
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // -------------------------------------------------------------------------
  // TAB 1: Tetapan_Sekolah
  // -------------------------------------------------------------------------
  let sheetTetapan = ss.getSheetByName(SHEET_TETAPAN);
  if (!sheetTetapan) {
    sheetTetapan = ss.insertSheet(SHEET_TETAPAN, 0);
    sheetTetapan.appendRow(["Parameter", "Nilai (Sila Isi Di Sini)", "Keterangan & Panduan"]);
    sheetTetapan.getRange("A1:C1").setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    sheetTetapan.setFrozenRows(1);
    sheetTetapan.setColumnWidth(1, 220);
    sheetTetapan.setColumnWidth(2, 340);
    sheetTetapan.setColumnWidth(3, 420);

    const tetapanData = [
      ["Nama Sekolah", "NAMA SEKOLAH ANDA", "Masukkan nama rasmi sekolah anda (cth: SK SERI MELATI)"],
      ["Kod Sekolah", "admin", "Masukkan kod sekolah KPM (digunakan sebagai ID Pengguna log masuk)"],
      ["Alamat Sekolah", "ALAMAT SURAT-MENYURAT SEKOLAH ANDA", "Masukkan alamat penuh sekolah (poskod, daerah, negeri)"],
      ["PPD / JPN", "Pejabat Pendidikan Daerah • Jabatan Pendidikan Negeri", "Maklumat PPD & JPN untuk paparan rasmi di bahagian bawah (Footer)"],
      ["Moto Sekolah", "BERILMU BERBAKTI", "Moto rasmi sekolah anda"],
      ["Sub-Moto Sekolah", "DISIPLIN ASAS KECEMERLANGAN", "Slogan atau sub-moto sekolah anda"],
      ["URL Logo Sekolah", "", "Pautan terus imej logo sekolah (biarkan kosong jika guna fail logo-sekolah.svg)"],
      ["Kata Laluan Admin", "admin123", "Kata laluan pentadbir untuk log masuk ke sistem e-GGs"],
      ["Sesi Persekolahan", "Pagi Sahaja", "Pilihan: 'Pagi Sahaja' atau 'Dua Sesi (Pagi & Petang)'"],
      ["Had Beban Harian", "8", "Had amaran maksimum waktu ganti seorang guru dalam sehari"],
      ["Had Beban Mingguan", "8", "Had amaran beban guru ganti dalam seminggu"]
    ];
    tetapanData.forEach(row => sheetTetapan.appendRow(row));
  }

  // -------------------------------------------------------------------------
  // TAB 2: Waktu_Slot
  // -------------------------------------------------------------------------
  let sheetSlot = ss.getSheetByName(SHEET_SLOT);
  if (!sheetSlot) {
    sheetSlot = ss.insertSheet(SHEET_SLOT, 1);
    sheetSlot.appendRow(["Slot", "Masa Mula", "Masa Tamat", "Label Masa", "Sesi", "Jenis (Pengajaran / Rehat)"]);
    sheetSlot.getRange("A1:F1").setFontWeight("bold").setBackground("#4338ca").setFontColor("#ffffff");
    sheetSlot.setFrozenRows(1);
    sheetSlot.setColumnWidth(1, 70);
    sheetSlot.setColumnWidth(2, 110);
    sheetSlot.setColumnWidth(3, 110);
    sheetSlot.setColumnWidth(4, 150);
    sheetSlot.setColumnWidth(5, 90);
    sheetSlot.setColumnWidth(6, 190);

    const defaultSlots = [
      [1, "7.10", "7.40", "7.10-7.40", "Pagi", "Pengajaran"],
      [2, "7.40", "8.10", "7.40-8.10", "Pagi", "Pengajaran"],
      [3, "8.10", "8.40", "8.10-8.40", "Pagi", "Pengajaran"],
      [4, "8.40", "9.10", "8.40-9.10", "Pagi", "Pengajaran"],
      [5, "9.10", "9.40", "9.10-9.40", "Pagi", "Pengajaran"],
      [6, "9.40", "10.10", "9.40-10.10", "Pagi", "Rehat"],
      [7, "10.10", "10.40", "10.10-10.40", "Pagi", "Pengajaran"],
      [8, "10.40", "11.10", "10.40-11.10", "Pagi", "Pengajaran"],
      [9, "11.10", "11.40", "11.10-11.40", "Pagi", "Pengajaran"],
      [10, "11.40", "12.10", "11.40-12.10", "Pagi", "Pengajaran"],
      [11, "12.10", "12.40", "12.10-12.40", "Pagi", "Pengajaran"],
      [12, "12.40", "1.10", "12.40-1.10", "Pagi", "Pengajaran"],
      [13, "1.10", "1.40", "1.10-1.40", "Pagi", "Pengajaran"]
    ];
    defaultSlots.forEach(row => sheetSlot.appendRow(row));
  }

  // -------------------------------------------------------------------------
  // TAB 3: Senarai_Guru (Kumpulan Bertugas disediakan & boleh dibiarkan kosong jika sekolah tiada kumpulan; Kod Warna dijana automatik!)
  // -------------------------------------------------------------------------
  let sheetGuru = ss.getSheetByName(SHEET_GURU);
  if (!sheetGuru) {
    sheetGuru = ss.insertSheet(SHEET_GURU, 2);
  }
  sheetGuru.getRange(1, 1, 1, 6).setValues([[
    "Nama Guru",
    "Kumpulan Bertugas (Pilihan: Kumpulan 1 - 4 / Kosongkan Jika Tiada)",
    "No Telefon WhatsApp (cth: 60123456789)",
    "Emel Rasmi (Pilihan)",
    "Sesi",
    "Kod Warna (Automatik)"
  ]]);
  sheetGuru.getRange("A1:F1").setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
  sheetGuru.setFrozenRows(1);
  sheetGuru.setColumnWidth(1, 260);
  sheetGuru.setColumnWidth(2, 300);
  sheetGuru.setColumnWidth(3, 240);
  sheetGuru.setColumnWidth(4, 220);
  sheetGuru.setColumnWidth(5, 100);
  sheetGuru.setColumnWidth(6, 170);

  // -------------------------------------------------------------------------
  // TAB 4: Jadual_Waktu (Turut menyokong lajur Kumpulan Bertugas Pilihan)
  // -------------------------------------------------------------------------
  let sheetJadual = ss.getSheetByName(SHEET_JADUAL);
  if (!sheetJadual) {
    sheetJadual = ss.insertSheet(SHEET_JADUAL, 3);
  }
  sheetJadual.getRange(1, 1, 1, 7).setValues([[
    "Nama Guru",
    "Hari (Isnin-Jumaat)",
    "Slot (Nombor Slot 1-13)",
    "Mata Pelajaran",
    "Kelas",
    "Kumpulan Bertugas (Pilihan)",
    "Sesi"
  ]]);
  sheetJadual.getRange("A1:G1").setFontWeight("bold").setBackground("#0369a1").setFontColor("#ffffff");
  sheetJadual.setFrozenRows(1);
  sheetJadual.setColumnWidth(1, 260);
  sheetJadual.setColumnWidth(2, 140);
  sheetJadual.setColumnWidth(3, 150);
  sheetJadual.setColumnWidth(4, 140);
  sheetJadual.setColumnWidth(5, 130);
  sheetJadual.setColumnWidth(6, 210);
  sheetJadual.setColumnWidth(7, 100);

  // -------------------------------------------------------------------------
  // TAB 5: Rekod_Guru_Ganti (Disimpan secara automatik oleh sistem)
  // -------------------------------------------------------------------------
  let sheetRekod = ss.getSheetByName(SHEET_REKOD);
  if (!sheetRekod) {
    sheetRekod = ss.insertSheet(SHEET_REKOD, 4);
    sheetRekod.appendRow([
      "Tarikh", "Hari", "Minggu", "Kumpulan",
      "Guru Tidak Hadir", "Sebab", "Masa", "Mata Pelajaran",
      "Kelas", "Guru Ganti", "Catatan", "Cap Masa"
    ]);
    sheetRekod.getRange("A1:L1").setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    sheetRekod.setFrozenRows(1);
  }
}

/**
 * Alias untuk setupSheet() supaya kedua-dua nama fungsi boleh dijalankan di Apps Script
 */
function setupDatabaseSheets() {
  setupSheet();
}
