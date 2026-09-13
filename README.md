# Portal Bersepadu Sekolah Kebangsaan Tampasuk 1 Kota Belud, Sabah

Selamat datang ke repositori rasmi **Portal Bersepadu Sekolah Kebangsaan Tampasuk 1, Kota Belud, Sabah**.  
Laman web portal ini bertindak sebagai **domain utama sekolah** (`sktampasuk1.edu.my`) yang menggabungkan seluruh ekosistem digital sekolah secara profesional, moden, kemas, dan kaya dengan warna-warna korporat pendidikan yang harmoni.

---

## 🌟 Ciri-Ciri Utama Portal

1. **Empat Teras Utama Pengurusan Sekolah (KPM):**
   - **Pentadbiran & Pengurusan:** Carta kepimpinan, profil sekolah, Visi & Misi KPM, Falsafah Pendidikan Kebangsaan, Piagam Pelanggan, 26 guru rasmi, dan barisan AKP.
   - **Pengurusan Kurikulum:** 10 Panitia Mata Pelajaran (BM, BI, Matematik, Sains, Pendidikan Islam, Sejarah, RBT, PJK, PSV, Muzik), PBD & UASA, Sudut STEM/Inovasi, dan Pusat Sumber Sekolah.
   - **Pengurusan Hal Ehwal Murid (HEM):** Unit Disiplin & Pengawas (SSDM), Unit Bimbingan & Kaunseling (UBK), Kebajikan & RMT, SPBT, Program 3K, dan Pengurusan Kantin Sihat.
   - **Pengurusan Kokurikulum:** 5 Pasukan Badan Beruniform, 5 Kelab & Persatuan, 6 Sukan & Permainan (1M1S), serta Dewan Juara & Arkib Kejayaan sekolah.

2. **Integrasi Ekosistem Digital Berpusat:**
   - Pautan pantas terus ke sistem dalaman sekolah: **e-Guru Ganti V2** (`guruganti.sktampasuk1.edu.my`).
   - Pautan gerbang rasmi KPM: DELIMa 2.0, APDM, e-Operasi, HRMIS, SPLKPM, dan MoEIS.

3. **Carian Pintar Masa Nyata (Live Instant Search):**
   - Menapis nama guru, opsyen mengajar, aktiviti panitia, unit HEM, uniform, kelab sukan, takwim, serta dokumen muat turun secara automatik.

4. **Interaktif & Responsif Sepenuhnya:**
   - Dilengkapi tetingkap modal pop-up untuk melihat profil terperinci mana-mana daripada 26 guru atau unit.
   - Kalendar takwim bulanan interaktif dengan penapis kategori.
   - Pusat muat turun dokumen rasmi sekolah.
   - Suis mod paparan Terang / Gelap (*Light / Dark Mode*).
   - Mesra peranti mudah alih (telefon pintar, tablet, komputer riba).

5. **Sedia PWA (Progressive Web App):**
   - Boleh dipasang terus ke skrin telefon pintar ibu bapa dan guru seumpama aplikasi mudah alih.

---

## 🚀 Panduan Pelancaran di GitHub Pages

### Langkah 1: Cipta Repositori GitHub
1. Buka akaun [GitHub](https://github.com) sekolah anda.
2. Cipta repositori baharu (contoh: `sktampasuk1-portal` atau `sktampasuk1.github.io`).
3. Muat naik semua fail dan folder dalam direktori ini:
   - `index.html`
   - `CNAME`
   - `manifest.json`
   - `service-worker.js`
   - Folder `assets/` (css, js, images, docs)

### Langkah 2: Aktifkan GitHub Pages
1. Di repositori GitHub anda, klik tab **Settings**.
2. Di menu sebelah kiri, klik **Pages**.
3. Di bawah **Build and deployment > Branch**:
   - Pilih branch `main` (atau `master`).
   - Folder: `/ (root)`.
   - Klik **Save**.
4. Laman web anda akan aktif secara percuma dalam masa 1-2 minit di `https://<username>.github.io/<repo>/`.

---

## 🌐 Menghubungkan Domain Utama Sekolah (`sktampasuk1.edu.my`)

Jika sekolah anda memiliki domain rasmi `sktampasuk1.edu.my` melalui pembekal domain (MYNIC, Cloudflare, atau Web Hosting):

1. **Tetapan DNS di Pengurus Domain (Cloudflare / MYNIC / cPanel):**
   - Tambah rekod **A** (menghala ke pelayan GitHub Pages):
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Tambah rekod **CNAME** untuk subdomain `www`:
     - **Type:** `CNAME`
     - **Name:** `www`
     - **Target:** `<username-github>.github.io`
   - *(Pilihan)* Untuk subdomain sistem guru ganti:
     - **Type:** `CNAME`
     - **Name:** `guruganti`
     - **Target:** Hos sistem e-Guru Ganti sekolah anda.

2. **Tetapan di GitHub Pages:**
   - Di tab **Settings > Pages** repositori portal:
   - Pada bahagian **Custom domain**, masukkan `sktampasuk1.edu.my`.
   - Klik **Save**.
   - Tandakan kotak **"Enforce HTTPS"** untuk sijil SSL keselamatan percuma (ikon mangga hijau).

---

## 📝 Cara Mengemas Kini Kandungan Sekolah

Semua maklumat, senarai guru, takwim, berita, dan dokumen muat turun disimpan secara tersusun dalam satu fail pangkalan data:  
`assets/js/portal-data.js`

- **Menambah / Menukar Guru:** Edit bahagian `teachers: [...]` dalam `portal-data.js`.
- **Menambah Berita Baru:** Masukkan entri baru dalam array `news: [...]`.
- **Mengemas Kini Takwim:** Tambah aktiviti dalam array `takwim: [...]`.
- **Menambah Borang Muat Turun:** Masukkan maklumat fail dalam array `downloads: [...]`.

---

## 📱 Pemasangan pada Telefon Pintar (PWA)

- **Android (Google Chrome):** Buka pautan portal, tekan butang 3 titik di atas kanan, dan tekan **"Install app"** atau **"Add to Home Screen"**.
- **iPhone (Apple Safari):** Buka portal di Safari, tekan butang **Share** (ikon kotak dengan anak panah ke atas), dan pilih **"Add to Home Screen"**.

Ikon lencana rasmi SK Tampasuk 1 akan muncul di skrin utama telefon bimbit pengguna!

---

**Disediakan untuk:**  
Warga Sekolah Kebangsaan Tampasuk 1 Kota Belud, Sabah  
*"Sekata Melakar Kecemerlangan • Ilmu Cahaya Hidup"*
