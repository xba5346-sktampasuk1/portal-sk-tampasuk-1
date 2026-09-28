# 🌟 Sistem e-OPR Pintar • Starter Kit Sekolah

Sistem Penjana **One Page Report (OPR)** Automatik Rasmi berasaskan standard pelaporan Kementerian Pendidikan Malaysia (KPM).  
Sistem ini dibina khusus untuk membolehkan mana-mana sekolah menjana laporan satu muka surat yang tepat, kemas, dan profesional dengan sokongan **Google Sheets DELIMa**, sokongan **PWA (aplikasi telefon pintar)**, serta reka bentuk cetakan A4 sempurna.

---

## 🚀 Ciri-ciri Utama Starter Kit

1. **Bebas Jenama (Whitelabel Ready):**
   - Tiada data sekolah terikat secara kekal.
   - Pihak sekolah boleh mengubah Nama Sekolah, Alamat Surat OPR, Logo Rasmi, dan Subtitle secara terus melalui butang **"⚙️ Tetapan Sekolah"** di menu atas atau melalui fail `js/config.js`.
2. **Penyelarasan Awan Google Sheets DELIMa:**
   - Backend disediakan berasaskan Google Apps Script (`google-apps-script/Code.gs`).
   - Semua rekod laporan dan gambar aktiviti disimpan terus ke dalam Google Drive akaun DELIMa sekolah pembeli secara automatik.
3. **Pemampatan Imej Pintar di Sisi Klien:**
   - Gambar kamera telefon (5MB–15MB) dimampatkan serta-merta kepada ~100KB bagi mengelakkan pelayar lembab dan menjimatkan kuota Google Drive.
   - Pilihan susun atur fleksibel: **6 Gambar (3x2)**, **4 Gambar (2x2)**, atau **2 Gambar (2x1)**.
4. **Penyimpanan Draf Automatik (*Auto-Save*):**
   - Teks dan gambar disimpan automatik ke storan pelayar (*LocalStorage*). Guru tidak akan kehilangan maklumat jika tab tertutup.
5. **Cetakan & PDF A4 Tepat (1 Halaman Sahaja):**
   - Susun atur A4 Portrait 210mm × 297mm tepat tanpa limpahan muka surat.
6. **Sedia PWA (Progressive Web App):**
   - Boleh dipasang terus ke skrin utama telefon pintar atau desktop seumpama aplikasi mudah alih sebenar melalui butang **"Pasang App (PWA)"**.
   - Menyokong penggunaan luar talian (*offline caching*) melalui `service-worker.js`.

---

## 📁 Struktur Fail Projek

```text
e-opr-starter-kit/
├── index.html                  # Antara muka utama e-OPR (PWA Ready)
├── manifest.json               # Konfigurasi PWA (ikon & tema skrin telefon)
├── service-worker.js           # Pemuatan pantas & sokongan offline
├── Buka e-OPR.bat              # Skrip pelancar Windows 1-klik di Desktop
├── PANDUAN_STARTER_KIT.md      # Panduan lengkap persediaan untuk pembeli
├── README.md                   # Dokumentasi gambaran keseluruhan sistem
├── css/
│   └── styles.css              # Penggayaan sistem, tema panitia & cetakan A4
├── js/
│   ├── config.js               # ⭐ Pusat kawalan identiti sekolah & backend
│   ├── app.js                  # Logik utama, tema, penjenamaan dinamik & dialog tetapan
│   ├── image-tool.js           # Pemampat imej, susun atur & muat naik pukal
│   ├── storage.js              # Auto-save draf & enjin penyegerakan Google Sheets
│   └── ai-assistant.js         # Pembantu pintar penjana draf laporan OPR
├── assets/
│   ├── jata-negara.png / svg   # Jata Negara Malaysia (Vektor HD)
│   └── logo-sekolah.png / svg  # Lencana Rasmi Sekolah (Boleh diganti)
└── google-apps-script/
    └── Code.gs                 # Skrip integrasi ke Google Sheets akaun DELIMa sekolah
```

---

## ⚡ Cara Menyesuaikan Sistem untuk Sekolah Anda

### Cara 1: Terus dari Paparan Web (Paling Mudah)
1. Buka sistem dengan menekan dua kali fail **`Buka e-OPR.bat`** atau buka fail `index.html`.
2. Klik butang **"⚙️ Tetapan Sekolah"** di bar menu atas.
3. Masukkan Nama Sekolah, Alamat Kepala Surat OPR, muat naik logo lencana sekolah, dan masukkan URL Web App Google Apps Script anda.
4. Klik **"Simpan Tetapan Sekolah"**. Sistem akan terus mengemas kini paparan serta-merta!

### Cara 2: Menjadikannya Kekal untuk Seluruh Sekolah (`js/config.js`)
1. Buka fail **`js/config.js`** dengan Notepad.
2. Masukkan maklumat sekolah dan pautan backend anda pada ruangan yang disediakan.
3. Simpan fail tersebut. Semua guru yang membuka pautan web ini akan terus menggunakan tetapan tersebut tanpa perlu mengkonfigurasi lagi.

---

## 📱 Cara Memasang pada Telefon Pintar Guru (PWA)

- **Pengguna Android (Google Chrome):**
  1. Buka pautan e-OPR pada telefon.
  2. Tekan butang **"Pasang App (PWA)"** di atas skrin atau tekan menu 3 titik > pilih **"Add to Home Screen"** (Tambah ke Skrin Utama).
  3. Ikon e-OPR sekolah akan muncul pada skrin telefon anda seperti aplikasi Play Store.

- **Pengguna iPhone (Apple Safari):**
  1. Buka pautan e-OPR di Safari.
  2. Tekan butang **Kongsi (*Share Icon*)** di bahagian bawah skrin.
  3. Pilih **"Add to Home Screen"** (Tambah ke Skrin Utama) > klik **Add**.

---
*Dibangunkan mengikut piawaian pelaporan rasmi Kementerian Pendidikan Malaysia (KPM).*
