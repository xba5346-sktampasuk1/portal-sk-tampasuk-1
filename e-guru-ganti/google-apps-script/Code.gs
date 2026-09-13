/**
 * =========================================================================
 * e-Guru Ganti V2 - Google Apps Script (Backend)
 * SK Tampasuk 1 Kota Belud, Sabah
 * =========================================================================
 * 
 * FUNGSI UTAMA:
 * 1. Menerima rekod guru ganti dari laman web GitHub Pages / Domain Sekolah.
 * 2. Menyimpan rekod secara automatik ke Google Sheets "Rekod_Guru_Ganti".
 * 3. Menghantar Slip Guru Ganti (HTML Email) terus ke emel rasmi DELIMa guru ganti.
 * 4. Membekalkan data sejarah dan statistik kembali kepada laman web.
 */

const SHEET_REKOD = "Rekod_Guru_Ganti";
const SHEET_GURU = "Senarai_Guru";

/**
 * Endpoint POST: Menyimpan rekod dan menghantar emel
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "saveRecords" && Array.isArray(data.records)) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheetRekod = ss.getSheetByName(SHEET_REKOD);
      if (!sheetRekod) {
        setupSheet();
        sheetRekod = ss.getSheetByName(SHEET_REKOD);
      }
      
      // Ambil pemetaan emel guru dari tab Senarai_Guru
      const emailMap = getTeacherEmailMap();
      let emailSentCount = 0;
      
      data.records.forEach(r => {
        // 1. Simpan baris rekod ke Sheet
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
        
        // 2. Hantar emel slip gantian jika emel guru wujud
        const teacherEmail = emailMap[r.guru_ganti];
        if (teacherEmail && teacherEmail.includes("@")) {
          try {
            sendReliefSlipEmail(teacherEmail, r);
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
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Tindakan tidak sah"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint GET: Memulangkan semua rekod dalam format JSON
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_REKOD);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Baris pertama adalah Header
    const records = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      records.push({
        tarikh: row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "yyyy-MM-dd") : "",
        hari: row[1],
        minggu: row[2],
        kumpulan: row[3],
        guru_tidak_hadir: row[4],
        sebab: row[5],
        masa: row[6],
        mata_pelajaran: row[7],
        kelas: row[8],
        guru_ganti: row[9],
        catatan: row[10],
        timestamp: row[11]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: records.reverse() // Rekod terkini di atas
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Membina peta (Map) Nama Guru -> Emel DELIMa
 */
function getTeacherEmailMap() {
  const map = {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_GURU);
  if (!sheet) return map;
  
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const name = String(values[i][0] || "").trim();
    const email = String(values[i][1] || "").trim();
    if (name && email) {
      map[name] = email;
    }
  }
  return map;
}

/**
 * Menghantar Slip Guru Ganti (HTML Email Kemas & Rasmi)
 */
function sendReliefSlipEmail(recipientEmail, r) {
  const subject = `[e-Guru Ganti] Slip Penggantian Kelas: ${r.tarikh} (Kelas ${r.kelas} - ${r.mata_pelajaran})`;
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #0f172a, #1e3a8a); color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #eab308;">
        <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.05em;">SK TAMPASUK 1 KOTA BELUD</h2>
        <p style="margin: 6px 0 0; font-size: 13px; color: #93c5fd; font-weight: bold; text-transform: uppercase;">Slip Jadual Guru Ganti</p>
      </div>
      
      <div style="padding: 24px; background-color: #ffffff; color: #1e293b; font-size: 13.5px; line-height: 1.6;">
        <p style="margin-top: 0;">Salam sejahtera <strong>Cikgu ${r.guru_ganti}</strong>,</p>
        <p>Anda telah ditugaskan untuk menggantikan kelas berikut pada ketetapan rasmi sekolah:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold; color: #475569; width: 40%;">Tarikh & Hari:</td>
            <td style="padding: 9px 12px; font-weight: bold; color: #1e3a8a;">${r.tarikh} (${r.hari})</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Minggu Persekolahan:</td>
            <td style="padding: 9px 12px;">${r.minggu} (${r.kumpulan})</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Waktu / Masa:</td>
            <td style="padding: 9px 12px; font-family: monospace; font-weight: bold; color: #2563eb;">${r.masa}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Kelas & Subjek:</td>
            <td style="padding: 9px 12px; font-weight: bold;">Kelas ${r.kelas} — ${r.mata_pelajaran}</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Guru Asal:</td>
            <td style="padding: 9px 12px; color: #dc2626; font-weight: 600;">${r.guru_tidak_hadir} (${r.sebab})</td>
          </tr>
        </table>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #1e40af; margin-top: 15px;">
          📌 <strong>Peringatan Penting:</strong> Sila laksanakan tugasan modul / MMI di kelas berkenaan dan tandatangani buku rekod guru ganti di pejabat.
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
          Terima kasih atas kerjasama dan komitmen anda dalam menjamin kelangsungan pembelajaran murid.<br>
          <em>— Jawatankuasa Jadual Waktu & Guru Ganti SK Tampasuk 1</em>
        </p>
      </div>
      
      <div style="background-color: #f1f5f9; padding: 12px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        E-Guru Ganti V2 • SK Tampasuk 1 Kota Belud, Sabah • Sistem Automasi Rasmi
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
 * Fungsi Penyiapan Permulaan (Run Once):
 * Cipta Sheet dan masukkan senarai nama 26 guru rasmi
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tab Rekod_Guru_Ganti
  let sheetRekod = ss.getSheetByName(SHEET_REKOD);
  if (!sheetRekod) {
    sheetRekod = ss.insertSheet(SHEET_REKOD);
    sheetRekod.appendRow([
      "Tarikh", "Hari", "Minggu", "Kumpulan",
      "Guru Tidak Hadir", "Sebab", "Masa", "Mata Pelajaran",
      "Kelas", "Guru Ganti", "Catatan", "Cap Masa"
    ]);
    sheetRekod.getRange("A1:L1").setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    sheetRekod.setFrozenRows(1);
  }
  
  // 2. Tab Senarai_Guru
  let sheetGuru = ss.getSheetByName(SHEET_GURU);
  if (!sheetGuru) {
    sheetGuru = ss.insertSheet(SHEET_GURU);
    sheetGuru.appendRow(["Nama Guru", "Emel Rasmi (DELIMa / Gmail)"]);
    sheetGuru.getRange("A1:B1").setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
    sheetGuru.setFrozenRows(1);
    
    // Senarai 26 orang guru rasmi untuk diisi emel oleh pentadbir
    const teachers = [
      "En. Mudah Hj. Admaim",
      "Datin Razana Hj. Abd. Wahid",
      "Pn. Hamisah Janah",
      "Pn. Jennet Gindawa",
      "En. Amriee Abdullah",
      "Pn. Anidah Samad",
      "Pn. Anna Octavia Ninteh",
      "En. Duin Lasig",
      "Pn. Fatimah Daud",
      "En. George Simun",
      "Pn. Jamlinah Maliasan",
      "Pn. Kasmalah Ismail",
      "En. L Asmara Luandim",
      "Pn. Mastikahjunaidah Shahrom",
      "Pn. Milnah Namih",
      "En. Mohd. Hafiz Qayyum Ahmad",
      "Pn. Muhayan Diman",
      "En. Muhd. Huzaifah Arman",
      "En. Rejos Baking",
      "Pn. Rohanah Mohd. Soud",
      "Cik Rozeline Francis",
      "Cik Rozie Sumil",
      "Pn. Salhah Awang Tengah",
      "Pn. Yunizah Esun",
      "Pn. Zuraidah Hj. Marjin",
      "Pn. Zurinah Jubidi",
      "Cik Anizah Anis Dalinsip",
      "Cik Syahfirah Arjaman",
      "Pn. Cecilia Mouintin",
      "Guru UBK"
    ];
    
    teachers.forEach(t => {
      sheetGuru.appendRow([t, ""]);
    });
  }
}
