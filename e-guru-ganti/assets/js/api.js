/**
 * e-Guru Ganti V2 - Modul Komunikasi Data & Emel (API)
 * Menyokong penyegerakan ke Google Apps Script (Google Sheets & Emel)
 * dengan sandaran luar talian (localStorage fallback)
 */

const DatabaseAPI = {
  /**
   * Mengambil semua rekod penggantian yang telah disimpan
   */
  async getAllRecords() {
    // 1. Cuba ambil daripada Google Apps Script jika URL disediakan
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
            // Segerakkan ke localStorage sebagai sandaran
            localStorage.setItem(APP_CONFIG.storageKeys.records, JSON.stringify(result.data));
            return result.data;
          }
        }
      } catch (err) {
        console.warn("Gagal mengambil data daripada Google Apps Script, beralih ke storan tempatan:", err);
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
   * Menyegerak terus daripada Google Sheet dengan pulangan status eksplisit (Berjaya / Gagal)
   */
  async syncFromCloud() {
    if (!APP_CONFIG.googleAppsScriptUrl) {
      return { success: false, reason: "no_url", message: "URL Google Apps Script belum dikonfigurasikan." };
    }
    if (!navigator.onLine) {
      return { success: false, reason: "offline", message: "Peranti berada di luar talian." };
    }
    try {
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
          return { success: true, count: result.data.length, data: result.data };
        }
      }
      return { success: false, reason: "invalid_response", message: "Respons tidak sah daripada Google Sheet." };
    } catch (err) {
      return { success: false, reason: "network_error", message: err.message || "Ralat sambungan rangkaian." };
    }
  },

  /**
   * Menyimpan senarai rekod guru ganti baharu
   * @param {Array} newRecords - Senarai rekod yang baru dijana
   */
  async saveRecords(newRecords) {
    if (!Array.isArray(newRecords) || !newRecords.length) {
      return { success: false, message: "Tiada rekod untuk disimpan." };
    }

    // 1. Sentiasa simpan ke localStorage serta-merta
    let existing = [];
    try {
      const local = localStorage.getItem(APP_CONFIG.storageKeys.records);
      existing = local ? JSON.parse(local) : [];
    } catch (e) {
      existing = [];
    }

    // Tambah rekod baharu dengan ID dan cap masa unik
    const timestamp = new Date().toISOString();
    const preparedRecords = newRecords.map(r => ({
      id: r.id || 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      created_at: timestamp,
      ...r
    }));

    const updated = [...preparedRecords, ...existing];
    localStorage.setItem(APP_CONFIG.storageKeys.records, JSON.stringify(updated));

    // 2. Jika Google Apps Script dikonfigurasikan, hantar untuk simpanan Sheet & Notifikasi Emel
    let sheetSynced = false;
    let emailStatus = "";

    if (APP_CONFIG.googleAppsScriptUrl && navigator.onLine) {
      try {
        const response = await fetch(APP_CONFIG.googleAppsScriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8" // Elak sekatan CORS preflight pada Apps Script
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
        ? `Berjaya disimpan ke Google Sheet & Emel Sekolah${emailStatus}!`
        : "Berjaya disimpan dalam peranti (Luar Talian)."
    };
  }
};
