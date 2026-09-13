# e-Guru Ganti V2 — SK Tampasuk 1 Kota Belud

Sistem Pengurusan & Penjadualan Guru Ganti (MMI) Bersepadu untuk SK Tampasuk 1 Kota Belud, Sabah.  
Sedia untuk dihoskan di **GitHub Pages** bersama integrasi domain sekolah, pangkalan data **Google Sheets**, dan notifikasi slip gantian melalui **Emel DELIMa Google Apps Script**.

---

## 🚀 Panduan Pantas Pelancaran (GitHub Pages)

### Langkah 1: Muat Naik Fail ke GitHub
1. Buka akaun [GitHub](https://github.com) anda dan cipta satu repository baharu (cth: `e-guru-ganti`).
2. Muat naik semua fail dan folder di dalam projek ini ke dalam repository tersebut:
   - `index.html`
   - `CNAME`
   - `manifest.json`
   - Folder `assets/`
   - Folder `google-apps-script/`

### Langkah 2: Aktifkan GitHub Pages
1. Di repository GitHub anda, klik tab **Settings** (tetapan).
2. Di menu sebelah kiri, klik **Pages**.
3. Di bawah **Build and deployment > Branch**:
   - Pilih branch `main` (atau `master`).
   - Folder: `/ (root)`.
   - Klik **Save**.
4. Laman web anda akan aktif secara percuma dalam masa 1-2 minit di `https://<username>.github.io/<repo>/`!

---

## 🌐 Menghubungkan Domain Sekolah (cth: `guruganti.sktampasuk1.edu.my`)

1. **Tetapan DNS di Penyedia Domain Sekolah (Cloudflare / MYNIC / cPanel):**
   - Tambah rekod **CNAME**:
     - **Type:** `CNAME`
     - **Name / Host:** `guruganti`
     - **Target / Value:** `<username-github>.github.io`
     - **TTL:** `Auto` (atau `1 Hour`)
2. **Tetapan di GitHub Pages:**
   - Di tab **Settings > Pages**, bahagian **Custom domain**:
   - Masukkan `guruganti.sktampasuk1.edu.my` (pastikan fail `CNAME` di root repository mengandungi nama domain ini).
   - Klik **Save**.
   - Tandakan kotak **"Enforce HTTPS"** untuk mengaktifkan sijil SSL percuma (lambang mangga hijau selamat).

---

## 📧 Menghubungkan Google Sheet & Emel Rasmi Guru

Sistem ini boleh menyimpan rekod penggantian terus ke Google Sheet pentadbiran dan menghantar emel slip gantian automatik kepada guru ganti:

1. Buka [Google Sheets](https://sheets.new) menggunakan akaun Google rasmi sekolah anda (`@moe-dl.edu.my`).
2. Namakan spreadsheet sebagai `Rekod Guru Ganti SK Tampasuk 1`.
3. Klik menu **Extensions > Apps Script**.
4. Padamkan kod lalai dan salin keseluruhan kod dari fail `google-apps-script/Code.gs` ke dalamnya.
5. Klik butang **Save** (ikon disket).
6. Di bar alat atas Apps Script, pilih fungsi `setupSheet` dan klik **Run**.
   - Berikan kebenaran (*authorization*) apabila diminta.
   - Fungsi ini akan membina 2 tab automatik: `Rekod_Guru_Ganti` dan `Senarai_Guru` (26 orang guru rasmi).
7. Di tab `Senarai_Guru` pada Google Sheet, masukkan alamat emel DELIMa guru masing-masing pada Kolum B.
8. Klik butang **Deploy > New deployment** di bahagian atas kanan Apps Script:
   - Pilih jenis: **Web app**.
   - **Execute as:** `Me` (akaun anda).
   - **Who has access:** `Anyone` (Sesiapa sahaja).
   - Klik **Deploy**.
9. Salin URL Web App yang dijana (bermula dengan `https://script.google.com/macros/s/.../exec`).
10. Buka fail `assets/js/config.js` dalam projek ini, dan tampal URL tersebut pada bahagian:
    ```javascript
    googleAppsScriptUrl: "https://script.google.com/macros/s/KOD_ANDA/exec",
    ```
11. Muat naik semula fail `assets/js/config.js` ke GitHub. Selesai!

---

## 📱 Pemasangan pada Telefon Pintar Guru (PWA)

Sistem ini menyokong PWA (*Progressive Web App*):
- **Android (Chrome):** Buka pautan laman web, tekan menu 3 titik di atas kanan, dan pilih **"Add to Home Screen"** (Tambah ke Skrin Utama).
- **iPhone (Safari):** Buka pautan laman web, tekan butang kongsi (*Share button*), dan pilih **"Add to Home Screen"**.

Ikon sekolah akan muncul pada skrin utama telefon bimbit guru seumpama aplikasi mudah alih sebenar!
