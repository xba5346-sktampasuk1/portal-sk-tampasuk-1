/**
 * ============================================================================
 * e-GGs (e-Guru Ganti Sekolah) V2.6 - Modul Komunikasi Pangkalan Data (API)
 * Menyokong penyegerakan penuh Google Sheets (Tetapan Sekolah, Waktu Slot,
 * Senarai Guru, Jadual Waktu & Rekod Penggantian) dengan sandaran luar talian.
 * Hak Cipta Inovasi: byCikguJayResources
 * ============================================================================
 */

const DatabaseAPI = {
  /**
   * Mendapatkan URL Google Apps Script yang aktif (daripada HARDCODED_GOOGLE_SHEET_URL, APP_CONFIG, atau localStorage)
   */
  getScriptUrl() {
    if (typeof HARDCODED_GOOGLE_SHEET_URL !== "undefined" && HARDCODED_GOOGLE_SHEET_URL) {
      return HARDCODED_GOOGLE_SHEET_URL;
    }
    const customKey = APP_CONFIG.storageKeys?.customGasUrl || "eggs_custom_gas_url";
    return localStorage.getItem(customKey) || APP_CONFIG.googleAppsScriptUrl || "";
  },

  /**
   * Mengambil data profil sekolah, waktu slot, senarai guru, kumpulan & jadual waktu dari Google Sheet
   * @param {boolean} forceRefresh - Abaikan cache dan muat semula terus dari Google Sheet
   */
  async getSchoolData(forceRefresh = false) {
    const cacheKey = APP_CONFIG.storageKeys?.schoolDataCache || "eggs-komersial-school-data-cache-v1";

    if (APP_CONFIG.googleAppsScriptUrl && navigator.onLine) {
      try {
        const url = `${APP_CONFIG.googleAppsScriptUrl}?action=getSchoolData&_t=${Date.now()}`;
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: { "Accept": "application/json" }
        });

        if (response.ok) {
          const result = await response.json();
          if (result && result.status === "success") {
            localStorage.setItem(cacheKey, JSON.stringify(result));
            return { success: true, source: "online", data: result };
          }
        }
      } catch (err) {
        console.warn("Gagal mengambil data sekolah dari Google Sheet, beralih ke cache:", err);
      }
    }

    // Sandaran Luar Talian (localStorage Cache)
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return { success: true, source: "cache", data: JSON.parse(cached) };
      }
    } catch (e) {
      console.error("Ralat membaca cache sekolah:", e);
    }

    return { success: false, source: "default", data: null };
  },

  /**
   * Mengambil semua rekod penggantian yang telah disimpan
   */
  async getAllRecords() {
    if (APP_CONFIG.googleAppsScriptUrl && navigator.onLine) {
      try {
        const noCacheUrl = `${APP_CONFIG.googleAppsScriptUrl}?action=getRecords&_t=${Date.now()}`;
        const response = await fetch(noCacheUrl, {
          method: "GET",
          cache: "no-store",
          headers: { "Accept": "application/json" }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.status === "success" && Array.isArray(result.data)) {
            localStorage.setItem(APP_CONFIG.storageKeys.records, JSON.stringify(result.data));
            return result.data;
          }
        }
      } catch (err) {
        console.warn("Gagal mengambil rekod daripada Google Apps Script, beralih ke storan tempatan:", err);
      }
    }

    try {
      const local = localStorage.getItem(APP_CONFIG.storageKeys.records);
      return local ? JSON.parse(local) : [];
    } catch (e) {
      console.error("Ralat membaca localStorage:", e);
      return [];
    }
  },

  /**
   * Menyegerak terus daripada Google Sheet (Profil Sekolah + Jadual + Rekod)
   */
  async syncFromCloud() {
    if (!APP_CONFIG.googleAppsScriptUrl) {
      return { success: false, reason: "no_url", message: "URL Google Apps Script belum ditetapkan. Sila tetapkan di tab Urus & Import Jadual atau dalam fail config.js." };
    }
    if (!navigator.onLine) {
      return { success: false, reason: "offline", message: "Peranti berada di luar talian." };
    }
    try {
      // 1. Segerak Data Induk Sekolah (Tetapan, Guru, Kumpulan, Slot, Jadual)
      const schoolRes = await this.getSchoolData(true);

      // 2. Segerak Rekod Penggantian
      const noCacheUrl = `${APP_CONFIG.googleAppsScriptUrl}?action=getRecords&_t=${Date.now()}`;
      const response = await fetch(noCacheUrl, {
        method: "GET",
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.status === "success" && Array.isArray(result.data)) {
          localStorage.setItem(APP_CONFIG.storageKeys.records, JSON.stringify(result.data));
          return {
            success: true,
            count: result.data.length,
            data: result.data,
            schoolData: schoolRes && schoolRes.success ? schoolRes.data : null
          };
        }
      }

      // Sekiranya endpoint hanya memulangkan getSchoolData
      if (schoolRes && schoolRes.success) {
        const localRecs = JSON.parse(localStorage.getItem(APP_CONFIG.storageKeys.records) || "[]");
        return {
          success: true,
          count: localRecs.length,
          data: localRecs,
          schoolData: schoolRes.data
        };
      }

      return { success: false, reason: "invalid_response", message: "Respons tidak sah daripada Google Sheet." };
    } catch (err) {
      return { success: false, reason: "network_error", message: err.message || "Ralat sambungan rangkaian." };
    }
  },

  /**
   * Menyimpan senarai rekod guru ganti baharu
   * @param {Array} newRecords
   */
  async saveRecords(newRecords) {
    if (!Array.isArray(newRecords) || !newRecords.length) {
      return { success: false, message: "Tiada rekod untuk disimpan." };
    }

    let existing = [];
    try {
      const local = localStorage.getItem(APP_CONFIG.storageKeys.records);
      existing = local ? JSON.parse(local) : [];
    } catch (e) {
      existing = [];
    }

    const timestamp = new Date().toISOString();
    const preparedRecords = newRecords.map(r => ({
      id: r.id || "rec_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      created_at: timestamp,
      ...r
    }));

    const updated = [...preparedRecords, ...existing];
    localStorage.setItem(APP_CONFIG.storageKeys.records, JSON.stringify(updated));

    let sheetSynced = false;
    let emailStatus = "";

    if (APP_CONFIG.googleAppsScriptUrl && navigator.onLine) {
      try {
        const response = await fetch(APP_CONFIG.googleAppsScriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify({
            action: "saveRecords",
            records: preparedRecords
          })
        });

        if (response.ok) {
          const res = await response.json();
          if (res.status === "success") {
            sheetSynced = true;
            emailStatus = res.emailSentCount ? ` (${res.emailSentCount} emel dihantar)` : "";
          }
        }
      } catch (err) {
        console.warn("Gagal menyegerakkan ke Google Sheet:", err);
      }
    }

    return {
      success: true,
      records: preparedRecords,
      sheetSynced,
      message: sheetSynced
        ? `Berjaya disimpan ke Google Sheet Pangkalan Data Sekolah${emailStatus}!`
        : "Berjaya disimpan dalam peranti (Luar Talian)."
    };
  },

  /**
   * Mengemas kini rekod guru ganti sedia ada
   */
  async updateRecord(updatedRecord) {
    if (!updatedRecord || !updatedRecord.id) {
      return { success: false, message: "ID rekod diperlukan untuk kemas kini." };
    }

    let existing = [];
    try {
      const local = localStorage.getItem(APP_CONFIG.storageKeys.records);
      existing = local ? JSON.parse(local) : [];
    } catch (e) {
      existing = [];
    }

    const idx = existing.findIndex(r => r.id === updatedRecord.id);
    if (idx !== -1) {
      existing[idx] = {
        ...existing[idx],
        ...updatedRecord,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(APP_CONFIG.storageKeys.records, JSON.stringify(existing));
    }

    let sheetSynced = false;
    if (APP_CONFIG.googleAppsScriptUrl && navigator.onLine) {
      try {
        const response = await fetch(APP_CONFIG.googleAppsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "updateRecord",
            record: updatedRecord
          })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.status === "success") sheetSynced = true;
        }
      } catch (err) {
        console.warn("Gagal menyegerakkan kemas kini ke Google Apps Script:", err);
      }
    }

    return {
      success: true,
      sheetSynced,
      message: sheetSynced
        ? "Rekod berjaya dikemas kini di Google Sheet & Peranti!"
        : "Rekod berjaya dikemas kini dalam peranti (Luar Talian)."
    };
  },

  /**
   * Memadam / Membatalkan satu tugasan guru ganti
   */
  async deleteRecord(recordId, recordDetails = null) {
    if (!recordId) return { success: false, message: "ID rekod tidak sah." };

    let existing = [];
    try {
      const local = localStorage.getItem(APP_CONFIG.storageKeys.records);
      existing = local ? JSON.parse(local) : [];
    } catch (e) {
      existing = [];
    }

    const targetRec = existing.find(r => r.id === recordId) || recordDetails;
    const filtered = existing.filter(r => r.id !== recordId);
    localStorage.setItem(APP_CONFIG.storageKeys.records, JSON.stringify(filtered));

    let sheetSynced = false;
    if (APP_CONFIG.googleAppsScriptUrl && navigator.onLine && targetRec) {
      try {
        const response = await fetch(APP_CONFIG.googleAppsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "deleteRecord",
            recordId: recordId,
            tarikh: targetRec.tarikh,
            masa: targetRec.masa,
            kelas: targetRec.kelas,
            guru_tidak_hadir: targetRec.guru_tidak_hadir,
            guru_ganti: targetRec.guru_ganti
          })
        });
        if (response.ok) {
          const res = await response.json();
          if (res.status === "success") sheetSynced = true;
        }
      } catch (err) {
        console.warn("Gagal memadam rekod dari Google Sheet:", err);
      }
    }

    return {
      success: true,
      sheetSynced,
      message: sheetSynced
        ? "Tugasan berjaya dibatalkan dari Google Sheet & Peranti!"
        : "Tugasan berjaya dibatalkan dalam peranti."
    };
  },

  /**
   * Menguji sambungan ke Google Apps Script Web App
   */
  async testConnection(testUrl) {
    if (!testUrl || !testUrl.startsWith("http")) {
      return { success: false, message: "Format URL tidak sah. Sila pastikan bermula dengan https://script.google.com/macros/s/..." };
    }
    try {
      const resp = await fetch(`${testUrl}?action=getSchoolData&_t=${Date.now()}`, {
        method: "GET",
        cache: "no-store"
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.status === "success") {
          return { success: true, data: data };
        }
      }
      return { success: false, message: "Respons diterima tetapi format data bukan 'success'." };
    } catch (e) {
      return { success: false, message: e.toString() };
    }
  }
};
