/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SISTEM e-OPR SK TAMPASUK 1 KOTA BELUD
 * =========================================================================
 * - Pangkalan Data Berpusat: Google Sheets (Rekod_OPR)
 * - Storan Gambar Aktiviti Berpusat: Google Drive ("e-OPR SK Tampasuk 1 Gambar Aktiviti")
 * - Membenarkan perkongsian arkib antara semua peranti dan desktop guru
 * =========================================================================
 */

const SHEET_NAME = "Rekod_OPR";
const FOLDER_NAME = "e-OPR SK Tampasuk 1 Gambar Aktiviti";

/**
 * Pengendali Permintaan GET (Muat Turun Senarai Arkib atau Ujian Sambungan)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";

    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "API e-OPR SK Tampasuk 1 aktif dan sedia disambungkan!",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "delete") {
      const id = e.parameter.id;
      if (!id) {
        return createJsonResponse({ status: "error", message: "ID rekod tidak dinyatakan." });
      }
      const deleted = deleteRecordById(id);
      return createJsonResponse({ status: deleted ? "success" : "not_found", id: id });
    }

    // Default action: "getAll" (Ambil kesemua rekod untuk Sejarah OPR)
    const records = getAllRecords();
    return createJsonResponse({
      status: "success",
      count: records.length,
      records: records
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Pengendali Permintaan POST (Simpan atau Kemas Kini OPR beserta Gambar)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "Tiada data dihantar." });
    }

    const payload = JSON.parse(e.postData.contents);

    if (payload.action === "delete") {
      const deleted = deleteRecordById(payload.id);
      return createJsonResponse({ status: deleted ? "success" : "not_found", id: payload.id });
    }

    // Simpan rekod OPR
    const savedRecord = saveOPRRecord(payload);
    return createJsonResponse({
      status: "success",
      message: "Rekod OPR berjaya disimpan ke Google Sheet dan Google Drive DELIMa!",
      record: savedRecord
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Simpan atau Kemas Kini Rekod OPR ke dalam Google Sheet & Google Drive
 */
function saveOPRRecord(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = setupSheet();
  }

  const folder = getOrCreateDriveFolder();
  const recordId = data.id || ("opr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6));
  const timestamp = Utilities.formatDate(new Date(), "Asia/Kuala_Lumpur", "yyyy-MM-dd HH:mm:ss");

  // Proses gambar aktiviti (simpan base64 ke Google Drive)
  const processedImages = {};
  if (data.images && typeof data.images === "object") {
    for (let slot = 1; slot <= 6; slot++) {
      const imgData = data.images[slot] || data.images[slot.toString()];
      if (imgData) {
        if (typeof imgData === "string" && imgData.startsWith("data:")) {
          const filename = recordId + "_slot" + slot + ".jpg";
          processedImages[slot] = saveBase64ToDrive(folder, imgData, filename);
        } else {
          // Sudah berupa URL
          processedImages[slot] = imgData;
        }
      }
    }
  }

  const imagesJson = JSON.stringify(processedImages);

  const rowData = [
    recordId,
    timestamp,
    data.theme || "pentadbiran",
    data.category || data.anjuran || "Umum",
    data.anjuran || "",
    data.anjuranLain || "",
    data.program || "",
    data.tarikh || "",
    data.hari || "",
    data.masaMula || "",
    data.masaTamat || "",
    data.tempat || "",
    data.sasaran || "",
    data.objektif || "",
    data.aktiviti || "",
    data.kelemahan || "",
    data.cadangan || "",
    data.namaPenyedia || "",
    data.jawatanPenyedia || "",
    data.namaPenyemak || "",
    data.jawatanPenyemak || "",
    data.namaPengesah || "",
    data.jawatanPengesah || "",
    data.photoLayout || "6",
    data.panitiaSelect || "",
    imagesJson
  ];

  // Periksa sama ada rekod dengan ID ini telah wujud untuk dikemas kini
  const lastRow = sheet.getLastRow();
  let existingRow = -1;

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === recordId) {
        existingRow = i + 2;
        break;
      }
    }
  }

  if (existingRow > 0) {
    // Kemas kini baris sedia ada
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Masukkan baris baru di bawah
    sheet.appendRow(rowData);
  }

  return {
    ...data,
    id: recordId,
    images: processedImages,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Baca Kesemua Rekod daripada Google Sheet untuk Halaman Sejarah
 */
function getAllRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, 26).getValues();
  const records = [];

  for (let i = data.length - 1; i >= 0; i--) { // Susun dari terkini ke lama
    const row = data[i];
    const recordId = row[0];
    if (!recordId) continue;

    let images = {};
    try {
      if (row[25]) {
        images = JSON.parse(row[25]);
      }
    } catch (e) {
      images = {};
    }

    // Format Tarikh & Masa dengan tepat mengikut zon waktu Malaysia
    let tarikhStr = "";
    if (row[7]) {
      if (row[7] instanceof Date) {
        tarikhStr = Utilities.formatDate(row[7], "Asia/Kuala_Lumpur", "yyyy-MM-dd");
      } else {
        tarikhStr = String(row[7]).trim();
      }
    }

    let masaMulaStr = "";
    if (row[9]) {
      if (row[9] instanceof Date) {
        masaMulaStr = Utilities.formatDate(row[9], "Asia/Kuala_Lumpur", "HH:mm");
      } else {
        masaMulaStr = String(row[9]).trim();
      }
    }

    let masaTamatStr = "";
    if (row[10]) {
      if (row[10] instanceof Date) {
        masaTamatStr = Utilities.formatDate(row[10], "Asia/Kuala_Lumpur", "HH:mm");
      } else {
        masaTamatStr = String(row[10]).trim();
      }
    }

    let timestampStr = "";
    let updatedAtStr = new Date().toISOString();
    if (row[1]) {
      try {
        if (row[1] instanceof Date) {
          timestampStr = Utilities.formatDate(row[1], "Asia/Kuala_Lumpur", "yyyy-MM-dd HH:mm:ss");
          updatedAtStr = row[1].toISOString();
        } else {
          timestampStr = String(row[1]);
          const d = new Date(row[1]);
          if (!isNaN(d.getTime())) {
            updatedAtStr = d.toISOString();
          }
        }
      } catch (e) {
        timestampStr = String(row[1]);
      }
    }

    records.push({
      id: recordId,
      timestamp: timestampStr,
      theme: row[2] || "pentadbiran",
      category: row[3] || "Umum",
      anjuran: row[4] || "",
      anjuranLain: row[5] || "",
      program: row[6] || "",
      tarikh: tarikhStr,
      hari: row[8] || "",
      masaMula: masaMulaStr,
      masaTamat: masaTamatStr,
      tempat: row[11] || "",
      sasaran: row[12] || "",
      objektif: row[13] || "",
      aktiviti: row[14] || "",
      kelemahan: row[15] || "",
      cadangan: row[16] || "",
      namaPenyedia: row[17] || "",
      jawatanPenyedia: row[18] || "",
      namaPenyemak: row[19] || "",
      jawatanPenyemak: row[20] || "",
      namaPengesah: row[21] || "",
      jawatanPengesah: row[22] || "",
      photoLayout: row[23] || "6",
      panitiaSelect: row[24] || "",
      images: images,
      updatedAt: updatedAtStr
    });
  }

  return records;
}

/**
 * Padam Rekod Mengikut ID
 */
function deleteRecordById(recordId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return false;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === recordId) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

/**
 * Cipta atau Ambil Folder Google Drive Khas Gambar OPR
 */
function getOrCreateDriveFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  const folder = DriveApp.createFolder(FOLDER_NAME);
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    console.warn("Gagal set kebenaran folder:", e);
  }
  return folder;
}

/**
 * Simpan Data Gambar Base64 ke Fail Google Drive & Kembalikan URL Pantas
 */
function saveBase64ToDrive(folder, base64Data, filename) {
  try {
    const parts = base64Data.split(",");
    const meta = parts[0];
    const raw = parts[1];
    const mimeMatch = meta.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const bytes = Utilities.base64Decode(raw);
    const blob = Utilities.newBlob(bytes, mimeType, filename);
    const file = folder.createFile(blob);

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}

    // Pautan paparan terus (Google CDN thumbnail) yang pantas untuk <img>
    return "https://lh3.googleusercontent.com/d/" + file.getId();
  } catch (err) {
    console.warn("Ralat simpan gambar ke Drive:", err);
    return "";
  }
}

/**
 * Persediaan Awal Lembaran Kerja Google Sheet (Headers & Format)
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    "ID Rekod",
    "Tarikh/Masa Simpan",
    "Tema Warna",
    "Kategori Unit/Panitia",
    "Anjuran",
    "Anjuran Khas",
    "Nama Program",
    "Tarikh Program",
    "Hari",
    "Masa Mula",
    "Masa Tamat",
    "Tempat",
    "Kumpulan Sasaran",
    "Objektif Program",
    "Aktiviti Program",
    "Kelemahan/Isu",
    "Cadangan Penambahbaikan",
    "Nama Penyedia",
    "Jawatan Penyedia",
    "Nama Penyemak",
    "Jawatan Penyemak",
    "Nama Pengesah",
    "Jawatan Pengesah",
    "Susun Atur Foto",
    "Pilihan Panitia",
    "Pautan Gambar (JSON)"
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#06244a")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  return sheet;
}

/**
 * Helper Output Format JSON Bersepadu
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
