/**
 * Modul Simpanan Draf & Arkib Sejarah e-OPR
 * SK Tampasuk 1 Kota Belud
 * - Auto-save draf semasa ke LocalStorage
 * - Arkib Sejarah OPR (Koleksi automatik setiap kali 'JANA OPR' ditekan)
 * - Pengkategorian mengikut Unit & Panitia
 */

const StorageTool = {
  STORAGE_KEY: 'eopr_sk_tampasuk_1_draft',
  HISTORY_KEY: 'eopr_sk_tampasuk_1_history',
  CURRENT_ID_KEY: 'eopr_current_editing_id',
  CLOUD_URL_KEY: 'eopr_sk_tampasuk_1_cloud_url',
  debounceTimer: null,

  /**
   * Kumpulkan semua data borang
   */
  getFormData() {
    const data = {
      theme: document.body.dataset.activeTheme || 'pentadbiran',
      panitiaSelect: document.getElementById('theme-panitia')?.value || 'panitia-bm',
      photoLayout: document.getElementById('photo-layout-select')?.value || '6',
      anjuran: document.getElementById('anjuran')?.value || '',
      anjuranLain: document.getElementById('anjuran-lain')?.value || '',
      program: document.getElementById('program')?.value || '',
      tarikh: document.getElementById('tarikh')?.value || '',
      hari: document.getElementById('hari')?.value || '',
      masaMula: document.getElementById('masa-mula')?.value || '',
      masaTamat: document.getElementById('masa-tamat')?.value || '',
      tempat: document.getElementById('tempat')?.value || '',
      sasaran: document.getElementById('sasaran')?.value || '',
      objektif: document.getElementById('objektif')?.value || '',
      aktiviti: document.getElementById('aktiviti')?.value || '',
      kelemahan: document.getElementById('kelemahan')?.value || '',
      cadangan: document.getElementById('cadangan')?.value || '',
      namaPenyedia: document.getElementById('nama-penyedia')?.value || '',
      jawatanPenyedia: document.getElementById('jawatan-penyedia')?.value || '',
      namaPenyemak: document.getElementById('nama-penyemak')?.value || '',
      jawatanPenyemak: document.getElementById('jawatan-penyemak')?.value || '',
      namaPengesah: document.getElementById('nama-pengesah')?.value || '',
      jawatanPengesah: document.getElementById('jawatan-pengesah')?.value || '',
      images: window.ImageTool ? { ...window.ImageTool.imageData } : {},
      savedAt: new Date().toISOString()
    };
    return data;
  },

  /**
   * Tentukan Kategori Unit / Panitia berdasarkan input
   */
  determineCategory(data) {
    const anjuran = (data.anjuran || '').trim();
    if (anjuran && anjuran !== 'Lain-lain') {
      return anjuran;
    }
    if (anjuran === 'Lain-lain' && data.anjuranLain && data.anjuranLain.trim()) {
      return data.anjuranLain.trim();
    }

    const theme = data.theme || 'pentadbiran';
    const map = {
      'pentadbiran': 'Pentadbiran',
      'kurikulum': 'Kurikulum',
      'kokurikulum': 'Kokurikulum',
      'hem': 'Hal Ehwal Murid (HEM)',
      'panitia-bm': 'Panitia Bahasa Melayu',
      'panitia-bi': 'Panitia Bahasa Inggeris',
      'panitia-math': 'Panitia Matematik',
      'panitia-sains': 'Panitia Sains',
      'panitia-islam-moral': 'Panitia Pendidikan Islam & Moral',
      'panitia-sejarah': 'Panitia Sejarah',
      'panitia-seni-muzik': 'Panitia PSV & Muzik',
      'panitia-rbt': 'Panitia RBT',
      'panitia-pjk': 'Panitia Pendidikan Jasmani & Kesihatan (PJK)',
      'panitia-arab-bkd': 'Panitia B. Arab & BKD'
    };
    return map[theme] || 'Umum';
  },

  /**
   * Simpan draf kerja semasa ke LocalStorage
   */
  saveDraft() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      try {
        const data = this.getFormData();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        const statusElem = document.getElementById('save-status');
        if (statusElem) {
          statusElem.textContent = 'Draf disimpan (' + new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) + ')';
          statusElem.classList.remove('opacity-0');
        }
      } catch (err) {
        console.warn('Gagal menyimpan draf ke LocalStorage:', err);
      }
    }, 400);
  },

  /**
   * Muat semula data ke dalam borang & pratonton
   */
  loadData(data) {
    if (!data) return;

    if (data.theme && window.applyTheme) {
      window.applyTheme(data.theme);
    }

    if (data.panitiaSelect && document.getElementById('theme-panitia')) {
      document.getElementById('theme-panitia').value = data.panitiaSelect;
    }

    if (data.photoLayout && window.ImageTool) {
      const layoutSelect = document.getElementById('photo-layout-select');
      if (layoutSelect) layoutSelect.value = data.photoLayout;
      window.ImageTool.setLayout(data.photoLayout);
    }

    const fieldMap = {
      'anjuran': data.anjuran,
      'anjuran-lain': data.anjuranLain,
      'program': data.program,
      'tarikh': data.tarikh,
      'hari': data.hari,
      'masa-mula': data.masaMula,
      'masa-tamat': data.masaTamat,
      'tempat': data.tempat,
      'sasaran': data.sasaran,
      'objektif': data.objektif,
      'aktiviti': data.aktiviti,
      'kelemahan': data.kelemahan,
      'cadangan': data.cadangan,
      'nama-penyedia': data.namaPenyedia,
      'jawatan-penyedia': data.jawatanPenyedia,
      'nama-penyemak': data.namaPenyemak,
      'jawatan-penyemak': data.jawatanPenyemak,
      'nama-pengesah': data.namaPengesah,
      'jawatan-pengesah': data.jawatanPengesah
    };

    Object.entries(fieldMap).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    });

    const otherWrap = document.getElementById('other-wrap');
    if (otherWrap) {
      otherWrap.classList.toggle('hidden', data.anjuran !== 'Lain-lain');
    }

    if (window.ImageTool) {
      for (let i = 1; i <= 6; i++) {
        window.ImageTool.clearSlot(i);
      }
      if (data.images) {
        Object.entries(data.images).forEach(([index, dataUrl]) => {
          if (dataUrl) {
            window.ImageTool.setSlotImage(index, dataUrl);
          }
        });
      }
    }

    if (window.updatePreview) {
      window.updatePreview();
    }
  },

  /**
   * Muat semula draf dari LocalStorage
   */
  loadDraft() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.loadData(data);
        return true;
      }
    } catch (e) {
      console.warn('Ralat membaca draf:', e);
    }
    return false;
  },

  /**
   * Kosongkan draf daripada LocalStorage
   */
  clearDraft() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.CURRENT_ID_KEY);
    } catch (e) {
      console.warn(e);
    }
  },

  /* ==========================================================================
     PENGURUSAN ARKIB SEJARAH OPR (HISTORY)
     ========================================================================== */

  /**
   * Dapatkan ID rekod OPR yang sedang disunting (jika ada)
   */
  getCurrentEditingId() {
    return localStorage.getItem(this.CURRENT_ID_KEY) || null;
  },

  setCurrentEditingId(id) {
    if (id) {
      localStorage.setItem(this.CURRENT_ID_KEY, id);
    } else {
      localStorage.removeItem(this.CURRENT_ID_KEY);
    }
  },

  /**
   * Dapatkan semua senarai rekod sejarah dari LocalStorage
   */
  getHistory() {
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list.sort((a, b) => new Date(b.updatedAt || b.savedAt || 0) - new Date(a.updatedAt || a.savedAt || 0));
      }
    } catch (e) {
      console.warn('Ralat membaca arkib sejarah:', e);
    }
    return [];
  },

  /**
   * Dapatkan rekod spesifik mengikut ID
   */
  getRecordById(id) {
    if (!id) return null;
    const history = this.getHistory();
    return history.find(item => item.id === id) || null;
  },

  /**
   * Simpan automatik ke dalam Arkib Sejarah OPR apabila butang "JANA OPR" ditekan
   */
  saveToHistory(data = null, forceNew = false) {
    if (!data) data = this.getFormData();
    const history = this.getHistory();
    
    let currentId = this.getCurrentEditingId();
    if (forceNew || !currentId) {
      currentId = 'opr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    }

    const now = new Date().toISOString();
    const category = this.determineCategory(data);

    const record = {
      ...data,
      id: currentId,
      category: category,
      updatedAt: now,
      createdAt: data.createdAt || now
    };

    const existingIndex = history.findIndex(item => item.id === currentId);
    if (existingIndex >= 0) {
      record.createdAt = history[existingIndex].createdAt || record.createdAt;
      history[existingIndex] = record;
    } else {
      history.unshift(record);
    }

    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      localStorage.setItem(this.CURRENT_ID_KEY, currentId);

      // Segerakkan ke Google Sheets DELIMa di latar belakang jika URL dikonfigurasi
      if (this.isCloudEnabled()) {
        this.sendToCloud(record).then(cloudRes => {
          if (cloudRes && cloudRes.record && cloudRes.record.images) {
            const historyNow = this.getHistory();
            const idx = historyNow.findIndex(i => i.id === record.id);
            if (idx >= 0) {
              historyNow[idx].images = cloudRes.record.images;
              localStorage.setItem(this.HISTORY_KEY, JSON.stringify(historyNow));
            }
          }
        }).catch(e => console.warn('Latar belakang awan:', e));
      }

      return { success: true, record, count: history.length };
    } catch (err) {
      console.warn('Ralat kuota LocalStorage arkib sejarah:', err);
      return { success: false, error: err.message, record };
    }
  },

  /**
   * Padam satu rekod OPR daripada arkib sejarah
   */
  deleteFromHistory(id) {
    if (!id) return false;
    let history = this.getHistory();
    history = history.filter(item => item.id !== id);
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      if (this.getCurrentEditingId() === id) {
        this.setCurrentEditingId(null);
      }

      // Padam juga dari Google Sheets DELIMa jika terhubung
      if (this.isCloudEnabled()) {
        this.deleteFromCloud(id).catch(e => console.warn('Padam dari awan:', e));
      }

      return true;
    } catch (e) {
      console.warn('Gagal memadam rekod:', e);
      return false;
    }
  },

  /**
   * Pengurusan Konfigurasi URL Google Apps Script Awan DELIMa
   */
  getCloudUrl() {
    return (localStorage.getItem(this.CLOUD_URL_KEY) || '').trim();
  },

  setCloudUrl(url) {
    const cleanUrl = (url || '').trim();
    if (!cleanUrl) {
      localStorage.removeItem(this.CLOUD_URL_KEY);
    } else {
      localStorage.setItem(this.CLOUD_URL_KEY, cleanUrl);
    }
    return cleanUrl;
  },

  isCloudEnabled() {
    const url = this.getCloudUrl();
    return !!(url && (url.startsWith('https://script.google.com/') || url.includes('macros/s/')));
  },

  /**
   * Hantar Rekod ke Google Apps Script (Cloud Sync)
   */
  async sendToCloud(record) {
    const url = this.getCloudUrl();
    if (!url) return null;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(record)
      });
      return await res.json();
    } catch (e) {
      console.warn('Ralat sendToCloud (disimpan lokal):', e);
      return null;
    }
  },

  /**
   * Tarik Kesemua Rekod daripada Google Sheets Awan DELIMa
   */
  async fetchFromCloud() {
    const url = this.getCloudUrl();
    if (!url) return { success: false, reason: 'no_url' };
    try {
      const targetUrl = `${url}${url.includes('?') ? '&' : '?'}action=getAll&_t=${Date.now()}`;
      const res = await fetch(targetUrl);
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.records)) {
        const local = this.getHistory();
        const localMap = new Map();
        local.forEach(item => {
          if (item && item.id) localMap.set(item.id, item);
        });

        json.records.forEach(cloudItem => {
          if (cloudItem && cloudItem.id) {
            localMap.set(cloudItem.id, cloudItem);
          }
        });

        const merged = Array.from(localMap.values()).sort((a, b) => {
          const tA = new Date(a.updatedAt || a.savedAt || a.timestamp || 0).getTime();
          const tB = new Date(b.updatedAt || b.savedAt || b.timestamp || 0).getTime();
          return tB - tA;
        });

        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(merged));
        return { success: true, count: merged.length, cloudCount: json.records.length, records: merged };
      }
      return { success: false, reason: json ? json.message : 'invalid_response' };
    } catch (e) {
      console.warn('Ralat fetchFromCloud:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Padam Rekod daripada Google Sheets Awan DELIMa
   */
  async deleteFromCloud(id) {
    const url = this.getCloudUrl();
    if (!url || !id) return false;
    try {
      const targetUrl = `${url}${url.includes('?') ? '&' : '?'}action=delete&id=${encodeURIComponent(id)}&_t=${Date.now()}`;
      await fetch(targetUrl);
      return true;
    } catch (e) {
      console.warn('Ralat deleteFromCloud:', e);
      return false;
    }
  },

  /**
   * Uji Sambungan ke Google Apps Script Web App
   */
  async testCloudConnection(customUrl = null) {
    const url = (customUrl || this.getCloudUrl() || '').trim();
    if (!url) return { success: false, message: 'Sila masukkan URL Web App Google Apps Script.' };
    try {
      const targetUrl = `${url}${url.includes('?') ? '&' : '?'}action=ping&_t=${Date.now()}`;
      const res = await fetch(targetUrl);
      const json = await res.json();
      if (json && json.status === 'success') {
        return { success: true, message: json.message || 'Sambungan ke Google Sheets DELIMa berjaya!' };
      }
      return { success: false, message: json ? json.message : 'Respons tidak sah daripada pelayan.' };
    } catch (e) {
      return { success: false, message: 'Gagal menghubungi Google Apps Script: ' + e.message };
    }
  },

  /**
   * Kosongkan keseluruhan arkib sejarah
   */
  clearAllHistory() {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
      this.setCurrentEditingId(null);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Dapatkan statistik ringkas arkib
   */
  getHistoryStats() {
    const history = this.getHistory();
    const categories = {};
    history.forEach(item => {
      const cat = item.category || 'Umum';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return {
      total: history.length,
      categories
    };
  }
};

window.StorageTool = StorageTool;

