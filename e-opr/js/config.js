/**
 * =========================================================================
 * SISTEM e-OPR • FAIL KONFIGURASI PUSAT (STARTER KIT SEKOLAH)
 * =========================================================================
 * Sekolah pembeli hanya perlu menyunting maklumat di dalam fail ini sahaja.
 * Sebarang perubahan di sini akan dikemas kini secara automatik ke seluruh
 * sistem (Kepala Surat, Kertas OPR, Lencana, Tera Air, dan Pangkalan Data).
 *
 * NOTA: Guru juga boleh mengubah maklumat ini secara langsung melalui butang
 * "⚙️ Tetapan Sekolah" di menu atas sistem tanpa perlu menyunting kod!
 * =========================================================================
 */

const EOPR_CONFIG = {
  // -----------------------------------------------------------------------
  // 1. IDENTITI & NAMA SEKOLAH
  // -----------------------------------------------------------------------
  // Nama penuh sekolah seperti pada kepala surat rasmi
  schoolName: "NAMA SEKOLAH ANDA",

  // Nama ringkas atau kod sekolah
  schoolShortName: "SEKOLAH",

  // Keterangan / Moto / Subtitle sistem di menu atas
  schoolSubtitle: "Sistem Penjana One Page Report (OPR) Rasmi Sekolah",

  // Alamat rasmi sekolah (muncul di kepala surat kertas laporan OPR)
  schoolAddress: "NAMA & ALAMAT RASMI SEKOLAH ANDA",

  // -----------------------------------------------------------------------
  // 2. LOGO RASMI SEKOLAH
  // -----------------------------------------------------------------------
  // Masukkan logo sekolah anda ke folder assets/logo-sekolah.png atau
  // muat naik terus melalui butang "⚙️ Tetapan Sekolah" di skrin.
  schoolLogo: "assets/logo-sekolah.png",

  // -----------------------------------------------------------------------
  // 3. PANGKALAN DATA BERPUSAT (GOOGLE APPS SCRIPT WEB APP URL)
  // -----------------------------------------------------------------------
  // Masukkan URL Web App Google Apps Script akaun Google DELIMa sekolah anda.
  // Kosongkan jika belum dikonfigurasi (sistem akan berjalan dalam mod tempatan).
  // Contoh: "https://script.google.com/macros/s/AKfycb.../exec"
  backendUrl: "",

  // -----------------------------------------------------------------------
  // 4. NILAI LALAI BORANG (DEFAULT FORM VALUES)
  // -----------------------------------------------------------------------
  defaultTempatPlaceholder: "Cth: Dewan Terbuka / Bilik Mesyuarat",
  defaultJawatanPenyedia: "Guru Bertugas Mingguan",
  defaultJawatanPenyemak: "Penolong Kanan Pentadbiran",
  defaultJawatanPengesah: "Guru Besar / Pengetua",

  // -----------------------------------------------------------------------
  // 5. TEKS HAK CIPTA (FOOTER)
  // -----------------------------------------------------------------------
  footerCopyright: "© Hak Cipta Terpelihara Sekolah."
};

// Pasang ke objek tetingkap global (Window)
window.EOPR_CONFIG = EOPR_CONFIG;
