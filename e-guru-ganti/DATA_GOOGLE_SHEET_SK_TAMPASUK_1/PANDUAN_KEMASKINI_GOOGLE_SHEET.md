# Panduan Kemas Kini Pangkalan Data Google Sheet (SK Tampasuk 1)

Semua data senarai guru (28 orang) dan jadual waktu induk (608 slot) SK Tampasuk 1 telah dikeluarkan daripada fail skrip sistem (`timetable-data.js` & `Code.gs`) supaya sebarang perubahan pada masa hadapan **100% dikawal terus melalui Google Sheet** tanpa perlu menyentuh kod!

---

## Langkah 1: Kemas Kini Skrip `Code.gs` di Google Apps Script
1. Buka Google Sheet pangkalan data **e-GGs SK Tampasuk 1** anda.
2. Klik menu **Extensions** > **Apps Script**.
3. Padam kod lama dalam `Code.gs`, kemudian salin dan tampal keseluruhan kod baharu daripada fail:
   - `google-apps-script/Code.gs`
4. Klik ikon **Save (💾)**.
5. Pada bar atas, pilih fungsi **`setupDatabaseSheets`** daripada senarai dropdown dan klik **Run (▶)**.
   - Ini akan menjana 5 tab secara automatik di dalam Google Sheet anda:
     1. `Tetapan_Sekolah`
     2. `Waktu_Slot`
     3. `Senarai_Guru`
     4. `Jadual_Waktu`
     5. `Rekod_Guru_Ganti` (rekod sedia ada anda kekal selamat)

---

## Langkah 2: Masukkan Data Sedia Ada SK Tampasuk 1 ke Dalam Google Sheet
Di dalam folder `DATA_GOOGLE_SHEET_SK_TAMPASUK_1` ini, telah disediakan **4 fail CSV** yang mengandungi keseluruhan data asal SK Tampasuk 1:

1. **`1_Tetapan_Sekolah.csv`** → Untuk tab **`Tetapan_Sekolah`**
2. **`2_Waktu_Slot.csv`** → Untuk tab **`Waktu_Slot`**
3. **`3_Senarai_Guru.csv`** → Untuk tab **`Senarai_Guru`** *(28 orang guru lengkap bersama Kumpulan Bertugas, No. WhatsApp, dan Kod Warna)*
4. **`4_Jadual_Waktu.csv`** → Untuk tab **`Jadual_Waktu`** *(608 slot waktu mengajar penuh Isnin hingga Jumaat)*

### Cara Paling Mudah Memasukkan Data (Import / Copy-Paste):
- Buka setiap fail CSV menggunakan **Excel** atau **Google Sheets**, kemudian **Copy & Paste** baris datanya ke dalam tab yang sepadan di Google Sheet utama anda; **ATAU**
- Di dalam Google Sheet utama anda, klik tab berkenaan (contohnya `Senarai_Guru`), klik menu **File** > **Import** > **Upload**, pilih fail CSV yang berkaitan, dan pilih **"Replace current sheet"**.

---

## Langkah 3: Deploy Semula Web App (New Version)
1. Kembali ke tetingkap **Apps Script**.
2. Klik **Deploy** > **Manage deployments**.
3. Klik ikon pensel (**Edit ✏️**) pada deployment Web App sedia ada anda.
4. Pada bahagian **Version**, pilih **"New version"**.
5. Klik **Deploy**. *(Dengan memilih "Manage deployments -> Edit -> New version", URL Web App anda tidak akan berubah dan kekal sama seperti yang telah di-hardcode dalam `config.js`)*.

---

## Cara Menambah Guru Baharu & Kod Warna Automatik
- **Tambah Guru Baharu:** Hanya taip nama guru baharu pada baris bawah di tab **`Senarai_Guru`**, pilih Kumpulan (`Kumpulan 1` hingga `Kumpulan 4`), dan masukkan No. WhatsApp.
- **Kod Warna Guru Automatik (`Lajur F`):**
  - Anda **TIDAK PERLU** menaip kod warna secara manual apabila menambah nama guru baharu.
  - Biarkan sahaja ruangan **Lajur F (`Kod Warna (Automatik)`)** kosong — sebaik sahaja sistem e-GGs menyegerak data atau anda menjalankan fungsi `autoAssignTeacherColors` di Apps Script, sistem akan **memberikan kod warna unik secara automatik** dan menulisnya terus ke dalam Lajur F Google Sheet serta memaparkannya pada kad jadual guru dan jadual kelas!
