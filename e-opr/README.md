# Sistem e-OPR Pintar • SK Tampasuk 1 Kota Belud

Sistem Penjana **One Page Report (OPR)** Automatik Rasmi untuk warga pendidik Sekolah Kebangsaan Tampasuk 1, W.D.T. 158, 89150 Kota Belud, Sabah.  
Sistem ini dibina mengikut standard ekosistem digital yang sama seperti **e-Guru Ganti V2** sekolah bagi memudahkan capaian guru, sokongan PWA (aplikasi telefon/komputer), serta integrasi penuh ke Portal Bersepadu Sekolah.

---

## 🌟 Ciri-ciri Utama & Kemudahan Akses Guru (Versi 2.0)

1. **Sedia PWA (Progressive Web App):**
   - Boleh dipasang terus ke skrin utama telefon pintar atau desktop seumpama aplikasi mudah alih sebenar melalui butang **"Pasang App (PWA)"**.
   - Menyokong penggunaan luar talian (*offline caching*) melalui `service-worker.js`.
2. **Pelancar Pantas Desktop (1-Klik):**
   - Disediakan fail pelancar `Buka e-OPR SK Tampasuk 1.bat` dan fail tunggal `e-OPR V2 - Code.html` terus di Desktop komputer sekolah untuk akses pantas tanpa menaip URL.
3. **Penyepaduan Penuh ke Portal Rasmi Sekolah (`sktampasuk1.edu.my`):**
   - Pautan langsung di bahagian menu atas (*header*) dan menu mudah alih portal sekolah bersebelahan sistem **e-Guru Ganti**.
4. **Sokongan Subdomain Sekolah (`opr.sktampasuk1.edu.my`):**
   - Dilengkapi fail `CNAME` sedia ada untuk dipautkan ke GitHub Pages atau DNS domain sekolah.
5. **Penyelarasan Google Sheets Pentadbiran (Google Apps Script):**
   - Folder `google-apps-script/Code.gs` disertakan untuk menyimpan rekod laporan secara automatik ke Google Sheet sekolah.
6. **Pemampatan Imej Pintar di Sisi Klien:**
   - Gambar kamera telefon (5MB–15MB) dimampatkan serta-merta kepada ~100KB bagi mengelakkan pelayar lembab.
   - Pilihan susun atur fleksibel: **6 Gambar (3x2)**, **4 Gambar (2x2)**, atau **2 Gambar (2x1)**.
   - Sokongan **Muat Naik Pukal** serentak dan **Seret & Lepas (*Drag & Drop*)**.
7. **Penyimpanan Draf Automatik (*Auto-Save*):**
   - Teks dan gambar disimpan automatik ke storan pelayar (*LocalStorage*). Guru tidak akan kehilangan maklumat jika tab tertutup.
8. **Cetakan & PDF A4 Tepat (1 Halaman Sahaja):**
   - Susun atur A4 Portrait 210mm × 297mm tepat tanpa limpahan muka surat.

---

## 📁 Struktur Fail Projek

```
zealous-faraday/
├── index.html                  # Antara muka utama e-OPR (PWA Ready)
├── manifest.json               # Konfigurasi PWA (ikon & tema skrin telefon)
├── service-worker.js           # Pemuatan pantas & sokongan offline
├── CNAME                       # Subdomain rasmi (opr.sktampasuk1.edu.my)
├── Buka e-OPR.bat              # Skrip pelancar Windows 1-klik
├── css/
│   └── styles.css              # Penggayaan sistem, tema panitia & cetakan A4
├── js/
│   ├── app.js                  # Logik utama, tema, tarikh & format masa
│   ├── image-tool.js           # Pemampat imej, susun atur & muat naik pukal
│   └── storage.js              # Auto-save draf & arkib sejarah OPR
├── assets/
│   ├── jata-negara.svg         # Jata Negara Malaysia (Vektor HD)
│   └── logo-sekolah.svg        # Lencana Rasmi SK Tampasuk 1 (Vektor HD)
├── google-apps-script/
│   └── Code.gs                 # Skrip integrasi ke Google Sheets sekolah
└── README.md                   # Panduan sistem dan integrasi portal
```

---

## 📱 Cara Memasang pada Telefon Pintar Guru (PWA)

- **Pengguna Android (Google Chrome):**
  1. Buka pautan e-OPR pada telefon.
  2. Tekan butang **"Pasang App (PWA)"** di atas skrin atau tekan menu 3 titik > pilih **"Add to Home Screen"** (Tambah ke Skrin Utama).
  3. Ikon Lencana SK Tampasuk 1 akan muncul pada skrin telefon anda seperti aplikasi Play Store.

- **Pengguna iPhone (Apple Safari):**
  1. Buka pautan e-OPR di Safari.
  2. Tekan butang **Kongsi (*Share Icon*)** di bahagian bawah skrin.
  3. Pilih **"Add to Home Screen"** (Tambah ke Skrin Utama) > klik **Add**.

---

## 🌐 Menghubungkan Domain Sekolah (`opr.sktampasuk1.edu.my`)

Sama seperti tetapan **e-Guru Ganti**:
1. **Di Pembekal Domain Sekolah (Cloudflare / MYNIC):**
   - Tambah rekod **CNAME**:
     - **Name:** `opr`
     - **Target:** `<username-github>.github.io`
2. **Di GitHub Pages:**
   - Di tab **Settings > Pages**, bahagian **Custom domain**, masukkan `opr.sktampasuk1.edu.my`.
   - Tandakan **"Enforce HTTPS"**.
