/**
 * Portal Bersepadu Sekolah Kebangsaan Tampasuk 1, Kota Belud, Sabah
 * Data Utama & Pangkalan Maklumat Sekolah (Sesi Persekolahan 2026)
 * Domain Utama: sktampasuk1.edu.my
 */

const SCHOOL_DATA = {
  info: {
    fullName: "Sekolah Kebangsaan Tampasuk 1",
    shortName: "SK Tampasuk 1",
    subDistrict: "Perantigu, Kota Belud",
    schoolCode: "XBA5346",
    category: "Sekolah Kebangsaan (Luar Bandar)",
    establishedYear: 1964,
    address: "W.D.T 158, 89150, Kota Belud, Sabah",
    phone: "088-976214",
    email: "xba5346@moe.edu.my",
    altEmail: "sktampasuk1.kotabelud@gmail.com",
    domain: "sktampasuk1.edu.my",
    systemGuruGantiUrl: "e-guru-ganti/index.html",
    systemOprUrl: "e-opr/index.html",
    motto: "SEKATA MELAKAR KECEMERLANGAN",
    subMotto: "ILMU CAHAYA HIDUP",
    slogan: "SK Tampasuk 1 Unggul, Dinamik & Berdaya Saing",
    ppd: "Pejabat Pendidikan Daerah Kota Belud",
    jpn: "Jabatan Pendidikan Negeri Sabah",
    kpm: "Kementerian Pendidikan Malaysia",
    
    // Statistik Utama Sekolah
    stats: {
      teachers: 26,
      staff: 5,
      students: 348,
      classes: 12, // 1A-6B
      prasekolah: 2,
      attendanceRate: "96.4%"
    },

    // Visi & Misi KPM
    vision: "Pendidikan Berkualiti, Insan Terdidik, Negara Sejahtera.",
    mission: "Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara.",
    
    // Falsafah Pendidikan Kebangsaan
    fpk: "Pendidikan di Malaysia adalah suatu usaha berterusan ke arah lebih memperkembangkan potensi individu secara menyeluruh dan bersepadu untuk melahirkan insan yang seimbang dan harmonis dari segi intelek, rohani, emosi dan jasmani, berdasarkan kepercayaan dan kepatuhan kepada Tuhan.",

    // Piagam Pelanggan
    clientCharter: [
      "Memastikan pengajaran dan pembelajaran (PdP) berkualiti dilaksanakan mengikut jadual yang ditetapkan pada setiap hari persekolahan.",
      "Menyediakan persekitaran sekolah yang selamat, kondusif, ceria, dan memupuk sahsiah terpuji murid selaras dengan konsep Anak Yang Baik lagi Cerdik (ABC).",
      "Memberikan layanan perkhidmatan kaunter pentadbiran yang cekap, mesra, dan berintegriti kepada setiap pelanggan dalam tempoh 15 minit.",
      "Menyalurkan bantuan kebajikan murid (RMT, SPBT, BAP, KWAPM) secara adil, telus, dan tepat pada masanya.",
      "Mengukuhkan jaringan kerjasama erat bersama Persatuan Ibu Bapa dan Guru (PIBG) serta komuniti setempat demi kecemerlangan modal insan."
    ]
  },

  // 4 PENTADBIR UTAMA
  leadership: [
    {
      id: "gb",
      name: "En. Mudah Hj. Admaim",
      title: "Guru Besar",
      role: "Pemimpin Instruksional & Pengurusan Tertinggi Sekolah",
      badge: "Pengurusan Tertinggi",
      color: "from-blue-600 to-indigo-800",
      accent: "#1d4ed8",
      email: "mudah.admaim@moe-dl.edu.my",
      quote: "Kejayaan sesebuah institusi bermula dengan permuafakatan yang utuh. Di SK Tampasuk 1, kami percaya setiap anak didik mempunyai potensi unik yang mampu digilap menjadi permata negara.",
      responsibilities: [
        "Mengetuai kepimpinan pentadbiran, kurikulum, HEM, dan kokurikulum sekolah.",
        "Merancang Pelan Strategik Organisasi (PSO) dan hala tuju kecemerlangan sekolah.",
        "Memastikan pengurusan kewangan dan tadbir urus aset berintegriti tinggi.",
        "Menjalin hubungan strategik dengan PPD, JPN, PIBG, dan komuniti setempat."
      ]
    },
    {
      id: "pk1",
      name: "Datin Razana Hj. Abd. Wahid",
      title: "Penolong Kanan Pentadbiran",
      role: "Pengurusan Kurikulum & Akademik Sekolah",
      badge: "Teras Pentadbiran & Kurikulum",
      color: "from-rose-600 to-pink-800",
      accent: "#e11d48",
      email: "razana.wahid@moe-dl.edu.my",
      quote: "Kurikulum yang dinamik melahirkan murid yang bukan sahaja cemerlang dalam peperiksaan, tetapi juga kaya dengan kemahiran berfikir aras tinggi dan akhlak terpuji.",
      responsibilities: [
        "Menyelaras pengurusan semua Panitia Mata Pelajaran dan jadual waktu rasmi.",
        "Memantau pelaksanaan Pentaksiran Bilik Darjah (PBD) dan Ujian Akhir Sesi Akademik (UASA).",
        "Menyelia Latihan Dalam Perkhidmatan (LDP / SPLKPM) dan perancangan PdP guru.",
        "Menguruskan hal ehwal perjawatan, penilaian prestasi guru, dan peperiksaan."
      ]
    },
    {
      id: "pkhem",
      name: "Pn. Hamisah Janah",
      title: "Penolong Kanan Hal Ehwal Murid",
      role: "Pembangunan Sahsiah, Kebajikan & Disiplin Murid",
      badge: "Teras Hal Ehwal Murid",
      color: "from-purple-600 to-violet-800",
      accent: "#7c3aed",
      email: "hamisah.janah@moe-dl.edu.my",
      quote: "Murid yang bahagia dan berdisiplin tinggi adalah asas kepada kecemerlangan ilmu. Kebajikan dan keselamatan murid sentiasa menjadi keutamaan kami.",
      responsibilities: [
        "Mengetuai Lembaga Disiplin, Pengawas Sekolah, dan Sistem Sahsiah Diri Murid (SSDM).",
        "Menguruskan kebajikan murid: RMT, Program Susu Sekolah, BAP, KWAPM, dan SPBT.",
        "Menyelaras Program 3K (Kebersihan, Kesihatan, Keselamatan) dan pengurusan kantin.",
        "Memantau kehadiran murid (APDM) dan bimbingan psikososial murid."
      ]
    },
    {
      id: "pkkoko",
      name: "Pn. Jennet Gindawa",
      title: "Penolong Kanan Kokurikulum",
      role: "Pembangunan Bakat, Sukan & Kepimpinan Murid",
      badge: "Teras Kokurikulum",
      color: "from-teal-600 to-emerald-800",
      accent: "#0d9488",
      email: "jennet.gindawa@moe-dl.edu.my",
      quote: "Kokurikulum membina jati diri, ketahanan fizikal, dan semangat kerja berpasukan. Dari padang SK Tampasuk 1, kita melakar kejayaan ke persada negara.",
      responsibilities: [
        "Menyelaras aktiviti Pasukan Badan Beruniform, Kelab & Persatuan, dan Sukan 1M1S.",
        "Memantau pentaksiran PAJSK dan penyertaan murid dalam kejohanan sukan/ko-akademik.",
        "Merancang perkhemahan tahunan sekolah, Hari Sukan Negara, dan Temasya Sukan Sekolah.",
        "Menguruskan rekod pencapaian kokurikulum sekolah di peringkat Zon, PPD, dan Negeri."
      ]
    }
  ],

  // 26 GURU RASMI MASTER
  teachers: [
    {
      id: "T01",
      name: "En. Mudah Hj. Admaim",
      role: "Guru Besar",
      mainSubject: "Pendidikan Islam",
      group: "Kumpulan 1",
      uniform: "Pengakap Kanak-Kanak",
      club: "Persatuan Agama Islam",
      sport: "Kelab Sepak Takraw",
      email: "mudah.admaim@moe-dl.edu.my",
      palette: { primary: "#1d4ed8", border: "#bfdbfe", text: "#1e40af", bg: "#eff6ff" }
    },
    {
      id: "T02",
      name: "Datin Razana Hj. Abd. Wahid",
      role: "Penolong Kanan Pentadbiran",
      mainSubject: "Pendidikan Moral",
      group: "Kumpulan 2",
      uniform: "Pandu Puteri Tunas",
      club: "Persatuan Bahasa Melayu",
      sport: "Kelab Badminton",
      email: "razana.wahid@moe-dl.edu.my",
      palette: { primary: "#e11d48", border: "#fecdd3", text: "#9f1239", bg: "#fff1f2" }
    },
    {
      id: "T03",
      name: "Pn. Hamisah Janah",
      role: "Penolong Kanan HEM",
      mainSubject: "Pendidikan Moral",
      group: "Kumpulan 3",
      uniform: "Bulan Sabit Merah Malaysia (BSMM)",
      club: "Kelab Bimbingan & Kerjaya",
      sport: "Kelab Bola Jaring",
      email: "hamisah.janah@moe-dl.edu.my",
      palette: { primary: "#7c3aed", border: "#ddd6fe", text: "#5b21b6", bg: "#f5f3ff" }
    },
    {
      id: "T04",
      name: "Pn. Jennet Gindawa",
      role: "Penolong Kanan Kokurikulum",
      mainSubject: "Sains / BKD / Muzik",
      group: "Kumpulan 4",
      uniform: "Tunas Kadet Remaja Sekolah (TKRS)",
      club: "Kelab STEM & Robotik",
      sport: "Kelab Olahraga",
      email: "jennet.gindawa@moe-dl.edu.my",
      palette: { primary: "#0d9488", border: "#99f6e4", text: "#0f766e", bg: "#f0fdfa" }
    },
    {
      id: "T05",
      name: "En. Amriee Abdullah",
      role: "Guru Panitia Sejarah & PJK",
      mainSubject: "Sejarah / PJK / PSV / Muzik",
      group: "Kumpulan 3",
      uniform: "Pengakap Kanak-Kanak",
      club: "Kelab Seni & Budaya",
      sport: "Kelab Bola Sepak",
      email: "amriee.abdullah@moe-dl.edu.my",
      palette: { primary: "#d97706", border: "#fde68a", text: "#92400e", bg: "#fffbeb" }
    },
    {
      id: "T06",
      name: "Pn. Anidah Samad",
      role: "Ketua Panitia Bahasa Melayu",
      mainSubject: "Bahasa Melayu / PSV",
      group: "Kumpulan 1",
      uniform: "Pergerakan Puteri Islam",
      club: "Persatuan Bahasa Melayu",
      sport: "Kelab Bola Jaring",
      email: "anidah.samad@moe-dl.edu.my",
      palette: { primary: "#4f46e5", border: "#c7d2fe", text: "#3730a3", bg: "#eef2ff" }
    },
    {
      id: "T07",
      name: "Pn. Anna Octavia Ninteh",
      role: "Ketua Panitia Matematik",
      mainSubject: "Matematik / Muzik / PSV",
      group: "Kumpulan 1",
      uniform: "Pandu Puteri Tunas",
      club: "Kelab STEM & Matematik",
      sport: "Kelab Catur",
      email: "anna.ninteh@moe-dl.edu.my",
      palette: { primary: "#0284c7", border: "#bae6fd", text: "#0369a1", bg: "#f0f9ff" }
    },
    {
      id: "T08",
      name: "En. Duin Lasig",
      role: "Guru Akademik Matematik",
      mainSubject: "Matematik",
      group: "Kumpulan 4",
      uniform: "Pengakap Kanak-Kanak",
      club: "Kelab Kitar Semula",
      sport: "Kelab Sepak Takraw",
      email: "duin.lasig@moe-dl.edu.my",
      palette: { primary: "#16a34a", border: "#bbf7d0", text: "#15803d", bg: "#f0fdf4" }
    },
    {
      id: "T09",
      name: "Pn. Fatimah Daud",
      role: "Ketua Panitia Pendidikan Islam",
      mainSubject: "Pendidikan Islam / Tasmik",
      group: "Kumpulan 3",
      uniform: "Pergerakan Puteri Islam",
      club: "Persatuan Agama Islam",
      sport: "Kelab Permainan Dalaman",
      email: "fatimah.daud@moe-dl.edu.my",
      palette: { primary: "#dc2626", border: "#fecaca", text: "#991b1b", bg: "#fef2f2" }
    },
    {
      id: "T10",
      name: "En. George Simun",
      role: "Ketua Panitia Pendidikan Muzik",
      mainSubject: "Bahasa Melayu / Muzik",
      group: "Kumpulan 3",
      uniform: "TKRS",
      club: "Kelab Muzik & Koir Sekolah",
      sport: "Kelab Badminton",
      email: "george.simun@moe-dl.edu.my",
      palette: { primary: "#c026d3", border: "#f5d0fe", text: "#86198f", bg: "#fdf4ff" }
    },
    {
      id: "T11",
      name: "Pn. Jamlinah Maliasan",
      role: "Guru Akademik Bahasa Melayu",
      mainSubject: "Bahasa Melayu / Pendidikan Moral",
      group: "Kumpulan 4",
      uniform: "BSMM",
      club: "Persatuan Bahasa Melayu",
      sport: "Kelab Bola Jaring",
      email: "jamlinah.maliasan@moe-dl.edu.my",
      palette: { primary: "#65a30d", border: "#d9f99d", text: "#3f6212", bg: "#f7fee7" }
    },
    {
      id: "T12",
      name: "Pn. Kasmalah Ismail",
      role: "Guru Penyelaras SPBT & Agama",
      mainSubject: "Pendidikan Islam / Bahasa Arab",
      group: "Kumpulan 3",
      uniform: "Pergerakan Puteri Islam",
      club: "Kelab J-QAF & Bahasa Arab",
      sport: "Kelab Bola Jaring",
      email: "kasmalah.ismail@moe-dl.edu.my",
      palette: { primary: "#ea580c", border: "#fed7aa", text: "#9a3412", bg: "#fff7ed" }
    },
    {
      id: "T13",
      name: "En. L Asmara Luandim",
      role: "Guru Penyelaras Disiplin & Kokurikulum",
      mainSubject: "Pendidikan Jasmani / Sejarah",
      group: "Kumpulan 2",
      uniform: "Pengakap Kanak-Kanak",
      club: "Kelab Rukun Negara",
      sport: "Kelab Bola Sepak",
      email: "asmara.luandim@moe-dl.edu.my",
      palette: { primary: "#475569", border: "#cbd5e1", text: "#1e293b", bg: "#f8fafc" }
    },
    {
      id: "T14",
      name: "Pn. Mastikahjunaidah Shahrom",
      role: "Ketua Panitia PSV",
      mainSubject: "Pendidikan Seni Visual / BM",
      group: "Kumpulan 1",
      uniform: "Pandu Puteri Tunas",
      club: "Kelab Kesenian & Kraf",
      sport: "Kelab Badminton",
      email: "mastikahjunaidah.shahrom@moe-dl.edu.my",
      palette: { primary: "#0891b2", border: "#a5f3fc", text: "#155e75", bg: "#ecfeff" }
    },
    {
      id: "T15",
      name: "Pn. Milnah Namih",
      role: "Penyelaras Jadual Waktu & Guru Data",
      mainSubject: "Sains / Matematik",
      group: "Kumpulan 1",
      uniform: "BSMM",
      club: "Kelab Komputer & ICT",
      sport: "Kelab Catur",
      email: "milnah.namih@moe-dl.edu.my",
      palette: { primary: "#f43f5e", border: "#fecdd3", text: "#be123c", bg: "#fff1f2" }
    },
    {
      id: "T16",
      name: "En. Mohd. Hafiz Qayyum Ahmad",
      role: "Ketua Panitia RBT & Jurulatih Sukan",
      mainSubject: "Reka Bentuk & Teknologi / PJK",
      group: "Kumpulan 1",
      uniform: "TKRS",
      club: "Kelab STEM & Rekacipta",
      sport: "Kelab Olahraga & Balapan",
      email: "hafiz.qayyum@moe-dl.edu.my",
      palette: { primary: "#2563eb", border: "#93c5fd", text: "#1d4ed8", bg: "#eff6ff" }
    },
    {
      id: "T17",
      name: "Pn. Muhayan Diman",
      role: "Guru Penyelaras RMT & Kebajikan",
      mainSubject: "Bahasa Melayu / Muzik",
      group: "Kumpulan 4",
      uniform: "Pandu Puteri Tunas",
      club: "Kelab Kesihatan & Doktor Muda",
      sport: "Kelab Bola Jaring",
      email: "muhayan.diman@moe-dl.edu.my",
      palette: { primary: "#8b5cf6", border: "#ddd6fe", text: "#6d28d9", bg: "#f5f3ff" }
    },
    {
      id: "T18",
      name: "En. Muhd. Huzaifah Arman",
      role: "Ketua Panitia Sains & ICT",
      mainSubject: "Sains / Teknologi Maklumat",
      group: "Kumpulan 2",
      uniform: "TKRS",
      club: "Kelab Robotik & Inovasi",
      sport: "Kelab Sepak Takraw",
      email: "huzaifah.arman@moe-dl.edu.my",
      palette: { primary: "#059669", border: "#a7f3d0", text: "#047857", bg: "#ecfdf5" }
    },
    {
      id: "T19",
      name: "En. Rejos Baking",
      role: "Ketua Panitia PJK & Sukan",
      mainSubject: "Pendidikan Jasmani & Kesihatan",
      group: "Kumpulan 3",
      uniform: "Pengakap Kanak-Kanak",
      club: "Kelab Rekreasi & Perkhemahan",
      sport: "Kelab Olahraga & Padang",
      email: "rejos.baking@moe-dl.edu.my",
      palette: { primary: "#b45309", border: "#fde68a", text: "#78350f", bg: "#fffbeb" }
    },
    {
      id: "T20",
      name: "Pn. Rohanah Mohd. Soud",
      role: "Guru Bimbingan & Kaunseling (UBK)",
      mainSubject: "Bimbingan & Kaunseling / Moral",
      group: "Kumpulan 1",
      uniform: "BSMM",
      club: "Kelab Pembimbing Rakan Sebaya",
      sport: "Kelab Catur",
      email: "rohanah.soud@moe-dl.edu.my",
      palette: { primary: "#9333ea", border: "#d8b4fe", text: "#6b21a8", bg: "#faf5ff" }
    },
    {
      id: "T21",
      name: "Cik Rozeline Francis",
      role: "Ketua Panitia Bahasa Inggeris",
      mainSubject: "English Language",
      group: "Kumpulan 2",
      uniform: "Pandu Puteri Tunas",
      club: "English Language Society",
      sport: "Kelab Badminton",
      email: "rozeline.francis@moe-dl.edu.my",
      palette: { primary: "#db2777", border: "#fbcfe8", text: "#9d174d", bg: "#fdf2f8" }
    },
    {
      id: "T22",
      name: "Cik Rozie Sumil",
      role: "Guru Akademik Bahasa Inggeris",
      mainSubject: "English Language / Muzik",
      group: "Kumpulan 2",
      uniform: "BSMM",
      club: "English Drama & Choral Speaking",
      sport: "Kelab Bola Jaring",
      email: "rozie.sumil@moe-dl.edu.my",
      palette: { primary: "#e11d48", border: "#fecdd3", text: "#9f1239", bg: "#fff1f2" }
    },
    {
      id: "T23",
      name: "Pn. Salhah Awang Tengah",
      role: "Guru Penyelaras Prasekolah",
      mainSubject: "Pendidikan Prasekolah",
      group: "Kumpulan 4",
      uniform: "Pergerakan Puteri Islam",
      club: "Kelab Tunas Kreatif",
      sport: "Kelab Senamrobik Cilik",
      email: "salhah.tengah@moe-dl.edu.my",
      palette: { primary: "#ca8a04", border: "#fef08a", text: "#854d0e", bg: "#fefce8" }
    },
    {
      id: "T24",
      name: "Pn. Yunizah Esun",
      role: "Penyelaras Pusat Sumber Sekolah (PSS)",
      mainSubject: "Bahasa Melayu / Sains",
      group: "Kumpulan 2",
      uniform: "Pandu Puteri Tunas",
      club: "Kelab Media & PSS Cahaya Ilmu",
      sport: "Kelab Ping Pong",
      email: "yunizah.esun@moe-dl.edu.my",
      palette: { primary: "#047857", border: "#a7f3d0", text: "#065f46", bg: "#ecfdf5" }
    },
    {
      id: "T25",
      name: "Pn. Zuraidah Hj. Marjin",
      role: "Penyelaras Jadual Waktu & Penilaian PBD",
      mainSubject: "Matematik / Bahasa Melayu",
      group: "Kumpulan 2",
      uniform: "BSMM",
      club: "Kelab Matematik Riang",
      sport: "Kelab Bola Jaring",
      email: "zuraidah.marjin@moe-dl.edu.my",
      palette: { primary: "#10b981", border: "#6ee7b7", text: "#064e3b", bg: "#ecfdf5" }
    },
    {
      id: "T26",
      name: "Pn. Zurinah Jubidi",
      role: "Guru Penyelaras Kebersihan & 3K",
      mainSubject: "Bahasa Melayu / PSV",
      group: "Kumpulan 4",
      uniform: "Pergerakan Puteri Islam",
      club: "Kelab Keceriaan & Lanskap",
      sport: "Kelab Badminton",
      email: "zurinah.jubidi@moe-dl.edu.my",
      palette: { primary: "#0369a1", border: "#7dd3fc", text: "#0c4a6e", bg: "#f0f9ff" }
    }
  ],

  // 4 KUMPULAN GURU BERTUGAS MINGGUAN
  dutyGroups: {
    "Kumpulan 1": {
      leader: "En. Mudah Hj. Admaim",
      members: [
        "En. Mudah Hj. Admaim",
        "Pn. Milnah Namih",
        "En. Mohd. Hafiz Qayyum Ahmad",
        "Pn. Anidah Samad",
        "Pn. Rohanah Mohd. Soud",
        "Pn. Mastikahjunaidah Shahrom",
        "Pn. Anna Octavia Ninteh"
      ],
      focus: "Pintu Masuk & Amalan Guru Penyayang, Kebersihan Kawasan Angkat Blok A"
    },
    "Kumpulan 2": {
      leader: "Datin Razana Hj. Abd. Wahid",
      members: [
        "Datin Razana Hj. Abd. Wahid",
        "En. L Asmara Luandim",
        "Pn. Yunizah Esun",
        "Pn. Zuraidah Hj. Marjin",
        "Cik Rozeline Francis",
        "Cik Rozie Sumil",
        "En. Muhd. Huzaifah Arman"
      ],
      focus: "Disiplin Perhimpunan Pagi, Pemantauan Kebersihan Kantin & Tapak Wuduk"
    },
    "Kumpulan 3": {
      leader: "Pn. Hamisah Janah",
      members: [
        "Pn. Hamisah Janah",
        "En. George Simun",
        "En. Rejos Baking",
        "Pn. Fatimah Daud",
        "Pn. Kasmalah Ismail",
        "En. Amriee Abdullah"
      ],
      focus: "Kawalan Waktu Rehat Sekolah, Pengawasan Kebajikan & Dewan Makan RMT"
    },
    "Kumpulan 4": {
      leader: "Pn. Jennet Gindawa",
      members: [
        "Pn. Jennet Gindawa",
        "Pn. Salhah Awang Tengah",
        "Pn. Jamlinah Maliasan",
        "Pn. Muhayan Diman",
        "Pn. Zurinah Jubidi",
        "En. Duin Lasig"
      ],
      focus: "Penyuraian Murid Waktu Pulang, Pemantauan Keselamatan Bas & Kenderaan Ibu Bapa"
    }
  },

  // 1. BAHAGIAN PENTADBIRAN
  pentadbiran: {
    description: "Pengurusan pentadbiran yang berwibawa, telus, dan cekap menjadi tonggak kestabilan pengoperasian harian SK Tampasuk 1 Kota Belud.",
    subCommittees: [
      {
        name: "Jawatankuasa Pengurusan Kewangan & Akaun Sekolah (JPKA)",
        pengerusi: "Guru Besar",
        setiausaha: "Ketua Pembantu Tadbir (KPT)",
        objective: "Memastikan pengurusan peruntukan PCG dan wang kerajaan diuruskan mengikut tatacara kewangan SPK berintegriti."
      },
      {
        name: "Jawatankuasa Pengurusan Aset Kerajaan (JKPAK)",
        pengerusi: "Guru Besar",
        pegawaiAset: "En. Mohd. Hafiz Qayyum Ahmad",
        objective: "Merekod, menyelenggara dan memeriksa stok inventori serta keselamatan infrastruktur sekolah."
      },
      {
        name: "Jawatankuasa SKPM Kualiti@Sekolah",
        pengerusi: "Guru Besar",
        penyelaras: "Datin Razana Hj. Abd. Wahid",
        objective: "Menilai taraf pencapaian standard kualiti pengurusan instruksional, kepimpinan, dan iklim pembelajaran sekolah."
      },
      {
        name: "Jawatankuasa Latihan Dalam Perkhidmatan (SPLKPM / LDP)",
        pengerusi: "PK Pentadbiran",
        penyelaras: "Pn. Zuraidah Hj. Marjin",
        objective: "Meningkatkan profesionalisme keguruan melalui kursus pedagogi kontemporari dan bengkel pemantapan kendiri."
      }
    ],
    quickSystems: [
      {
        name: "e-Guru Ganti SK Tampasuk 1",
        desc: "Sistem Pengurusan Jadual Guru Ganti (MMI) Bersepadu Sekolah",
        url: "e-guru-ganti/index.html",
        localRef: "../e-guru-ganti/index.html",
        badge: "Sistem Sekolah",
        color: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: "calendar-clock"
      },
      {
        name: "e-OPR Pintar SK Tampasuk 1",
        desc: "Sistem Penjana One Page Report (OPR) Automatik & Cetakan A4",
        url: "e-opr/index.html",
        localRef: "../e-opr/index.html",
        badge: "Sistem Sekolah",
        color: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold",
        icon: "clipboard-list"
      },
      {
        name: "DELIMa KPM (Digital Learning)",
        desc: "Gerbang Pembelajaran Digital Rasmi KPM (Google Classroom, Canva)",
        url: "https://d2.delima.edu.my",
        badge: "KPM Rasmi",
        color: "bg-emerald-600 hover:bg-emerald-700 text-white",
        icon: "laptop"
      },
      {
        name: "APDM (Pangkalan Data Murid)",
        desc: "Pengurusan maklumat kehadiran, profil dan pendaftaran murid",
        url: "https://apdm.moe.gov.my",
        badge: "KPM Rasmi",
        color: "bg-purple-600 hover:bg-purple-700 text-white",
        icon: "users"
      },
      {
        name: "e-Operasi KPM",
        desc: "Modul pengurusan data guru dan maklumat perjawatan",
        url: "https://eoperasi.moe.gov.my",
        badge: "KPM Rasmi",
        color: "bg-amber-600 hover:bg-amber-700 text-white",
        icon: "briefcase"
      },
      {
        name: "HRMIS 2.0 JPA",
        desc: "Sistem Pengurusan Maklumat Sumber Manusia Sektor Awam",
        url: "https://hrmis2.eghrmis.gov.my",
        badge: "JPA Kerajaan",
        color: "bg-cyan-600 hover:bg-cyan-700 text-white",
        icon: "file-text"
      },
      {
        name: "SPLKPM",
        desc: "Sistem Pengurusan Latihan Kementerian Pendidikan Malaysia",
        url: "https://splkpm.moe.gov.my",
        badge: "KPM Rasmi",
        color: "bg-rose-600 hover:bg-rose-700 text-white",
        icon: "award"
      }
    ],
    stafSokongan: [
      { name: "Pn. Norhasimah Binti Salleh", role: "Ketua Pembantu Tadbir (N22)" },
      { name: "En. Jasni Bin Marali", role: "Pembantu Operasi (N11)" },
      { name: "Pn. Maryati Binti Ondoi", role: "Pembantu Pengurusan Murid Prasekolah (N19)" },
      { name: "En. Azlan Bin Sabli", role: "Juruteknik Komputer (FT19)" }
    ]
  },

  // 2. BAHAGIAN KURIKULUM
  kurikulum: {
    description: "Kecemerlangan akademik dipupuk melalui pendekatan bilik darjah berpusatkan murid, integrasi STEM, dan penguasaan literasi-numerasi holistik.",
    panitia: [
      {
        code: "BM",
        name: "Panitia Bahasa Melayu",
        head: "Pn. Anidah Samad",
        icon: "book-open",
        color: "border-indigo-500 bg-indigo-50 text-indigo-900",
        tagColor: "bg-indigo-600 text-white",
        vision: "Memartabatkan Bahasa Melayu sebagai bahasa ilmu, bahasa perpaduan dan komunikasi berkesan.",
        activities: [
          "Bulan Bahasa Kebangsaan & Deklamasi Sajak",
          "Program Literasi Pemulihan 'Celik Huruf'",
          "Klinik Tatabahasa & Penulisan Karangan Tahun 4, 5 & 6"
        ]
      },
      {
        code: "BI",
        name: "Panitia Bahasa Inggeris",
        head: "Cik Rozeline Francis",
        icon: "globe",
        color: "border-pink-500 bg-pink-50 text-pink-900",
        tagColor: "bg-pink-600 text-white",
        vision: "Enhancing English proficiency, communicative confidence and global readiness among pupils.",
        activities: [
          "Highly Immersive Programme (HIP) - English Speaking Day",
          "Choral Speaking & Storytelling Showcase",
          "Weekly Word Bank & Reading Buddies"
        ]
      },
      {
        code: "M3",
        name: "Panitia Matematik",
        head: "Pn. Anna Octavia Ninteh",
        icon: "calculator",
        color: "border-sky-500 bg-sky-50 text-sky-900",
        tagColor: "bg-sky-600 text-white",
        vision: "Membina pemikiran logik, kecekapan numerasi dan kemahiran penyelesaian masalah harian.",
        activities: [
          "Kempen Hafal Sifir Pantas 'Bijak Sifir 12'",
          "Klinik Pemulihan Numerasi Murid Tahap 1",
          "Minggu Matematik & Pertandingan Sudoku Cilik"
        ]
      },
      {
        code: "SN",
        name: "Panitia Sains",
        head: "En. Muhd. Huzaifah Arman",
        icon: "microscope",
        color: "border-emerald-500 bg-emerald-50 text-emerald-900",
        tagColor: "bg-emerald-600 text-white",
        vision: "Mencetuskan rasa ingin tahu, kemahiran inkuiri dan kecintaan terhadap penerokaan alam saintifik.",
        activities: [
          "Karnival Sains & Eksperimen Magik",
          "Program Amali Saintis Muda di Makmal Sains",
          "Projek Taman Herba & Pemuliharaan Ekosistem"
        ]
      },
      {
        code: "PI",
        name: "Panitia Pendidikan Islam & Bahasa Arab",
        head: "Pn. Fatimah Daud",
        icon: "moon",
        color: "border-amber-500 bg-amber-50 text-amber-900",
        tagColor: "bg-amber-600 text-white",
        vision: "Membentuk peribadi mukmin soleh berilmu, beramal dan berakhlak mulia mengikut neraca syariat.",
        activities: [
          "Program Khatam Al-Quran & Kem Cemerlang Jawi (KCJ)",
          "Kem Bestari Solat (KBS) Fasa 1 & Fasa 2",
          "Sambutan Maulidur Rasul & Israk Mikraj Peringkat Sekolah"
        ]
      },
      {
        code: "SEJ",
        name: "Panitia Sejarah",
        head: "En. Amriee Abdullah",
        icon: "compass",
        color: "border-orange-500 bg-orange-50 text-orange-900",
        tagColor: "bg-orange-600 text-white",
        vision: "Memupuk semangat patriotisme, jati diri anak watan dan penghayatan warisan sejarah negara.",
        activities: [
          "Sambutan Bulan Kemerdekaan & Hari Malaysia",
          "Galeri Tokoh Tampasuk & Warisan Kota Belud",
          "Pertandingan Kuiz Sejarah & Buku Skrap Patriotik"
        ]
      },
      {
        code: "RBT",
        name: "Panitia Reka Bentuk & Teknologi (RBT)",
        head: "En. Mohd. Hafiz Qayyum Ahmad",
        icon: "cpu",
        color: "border-blue-500 bg-blue-50 text-blue-900",
        tagColor: "bg-blue-600 text-white",
        vision: "Membina daya cipta, kemahiran asas teknikal dan keusahawanan celik teknologi masa depan.",
        activities: [
          "Bengkel Asas Pengaturcaraan Micro:bit",
          "Pameran Rekacipta Bahan Kitar Semula",
          "Hari Usahawan Cilik SK Tampasuk 1"
        ]
      },
      {
        code: "PJK",
        name: "Panitia Pendidikan Jasmani & Kesihatan",
        head: "En. Rejos Baking",
        icon: "activity",
        color: "border-red-500 bg-red-50 text-red-900",
        tagColor: "bg-red-600 text-white",
        vision: "Melahirkan murid yang cergas fizikal, sihat mental dan mengamalkan gaya hidup aktif sepanjang hayat.",
        activities: [
          "Ujian Standard Kecergasan Fizikal Kebangsaan (SEGAK)",
          "Kempen Amalan Pemakanan Sihat & Senamrobik Mingguan",
          "Klinik Asas Olahraga & Kemahiran Motor Kasar"
        ]
      },
      {
        code: "PSV",
        name: "Panitia Pendidikan Seni Visual",
        head: "Pn. Mastikahjunaidah Shahrom",
        icon: "palette",
        color: "border-teal-500 bg-teal-50 text-teal-900",
        tagColor: "bg-teal-600 text-white",
        vision: "Mengembangkan bakat estetika, ekspresi seni kreatif dan apresiasi warisan seni visual.",
        activities: [
          "Pameran Seni Visual & Arca Bahan Terbuang",
          "Pertandingan Melukis Poster & Mewarna Kanak-kanak",
          "Bengkel Seni Kraf Tradisional Manik Sabah"
        ]
      },
      {
        code: "MZ",
        name: "Panitia Pendidikan Muzik",
        head: "En. George Simun",
        icon: "music",
        color: "border-purple-500 bg-purple-50 text-purple-900",
        tagColor: "bg-purple-600 text-white",
        vision: "Menyuburkan apresiasi muzik, irama patriotik dan kemahiran memainkan alat muzik perkusi.",
        activities: [
          "Latihan Koir Lagu Rasmi Sekolah & Lagu Kebangsaan",
          "Persembahan Ensembel Rekoder & Perkusi Tahap 2",
          "Bakat Muzik Cilik SK Tampasuk 1"
        ]
      }
    ],
    initiatives: [
      {
        title: "Pentaksiran Bilik Darjah (PBD) & UASA",
        desc: "Penilaian menyeluruh berasaskan perkembangan individu murid, memantau penguasaan Tahap Penguasaan 1 hingga 6 (TP1 - TP6) secara berterusan dan bermakna."
      },
      {
        title: "Pusat Sumber Sekolah 'Cahaya Ilmu'",
        desc: "Hab literasi digital dan perpustakaan moden dengan koleksi lebih 6,000 bahan bacaan, program galakan membaca NILAM, dan stesen komputer DELIMa."
      },
      {
        title: "Inovasi STEM & Sains Komputer",
        desc: "Membudayakan pemikiran komputasional melalui kit robotik, aplikasi Canva for Education, dan projek inkuiri sains luar bilik darjah."
      }
    ]
  },

  // 3. BAHAGIAN HAL EHWAL MURID (HEM)
  hem: {
    description: "Membina ekosistem sekolah yang selamat, penyayang, dan sejahtera demi melahirkan sahsiah murid yang berakhlak mulia dan berintegriti.",
    units: [
      {
        id: "disiplin",
        name: "Unit Disiplin & Lembaga Pengawas",
        head: "En. L Asmara Luandim",
        badge: "Karakter & Sahsiah",
        icon: "shield-check",
        color: "border-blue-500 bg-blue-50 text-blue-900",
        tagColor: "bg-blue-600 text-white",
        desc: "Menguatkuasakan peraturan sekolah secara berhemah, mengurus Sistem Sahsiah Diri Murid (SSDM), dan melatih kepimpinan pengawas sekolah.",
        highlights: [
          "Amalan Guru Penyayang di pintu pagar utama setiap pagi",
          "Perekodan amalan baik murid dalam portal SSDM KPM",
          "Kursus Kepimpinan Pengawas, Ketua Kelas & Penolong"
        ]
      },
      {
        id: "ubk",
        name: "Unit Bimbingan & Kaunseling (UBK)",
        head: "Pn. Rohanah Mohd. Soud",
        badge: "Kesejahteraan Emosi",
        icon: "heart-handshake",
        color: "border-purple-500 bg-purple-50 text-purple-900",
        tagColor: "bg-purple-600 text-white",
        desc: "Memberikan sokongan psikososial, membimbing murid bermasalah peribadi/akademik, dan menganjurkan program minda sihat.",
        highlights: [
          "Program Saringan Minda Sihat & Ujian Psikometrik",
          "Bimbingan Kerjaya Awal Kanak-kanak",
          "Modul Pembimbing Rakan Sebaya (PRS) Cilik"
        ]
      },
      {
        id: "kebajikan",
        name: "Unit Kebajikan & Bantuan Murid",
        head: "Pn. Muhayan Diman",
        badge: "Bantuan & Kasih Sayang",
        icon: "gift",
        color: "border-amber-500 bg-amber-50 text-amber-900",
        tagColor: "bg-amber-600 text-white",
        desc: "Menguruskan pelbagai skim bantuan kerajaan dan sumbangan komuniti bagi memastikan tiada murid yang tercicir dari segi pemakanan atau pakaian.",
        highlights: [
          "Rancangan Makanan Tambahan (RMT) berkhasiat setiap pagi",
          "Program Susu Sekolah (PSS) KPM",
          "Agihan Bantuan Awal Persekolahan (BAP RM150) & KWAPM"
        ]
      },
      {
        id: "spbt",
        name: "Skim Pinjaman Buku Teks (SPBT)",
        head: "Pn. Kasmalah Ismail",
        badge: "Sumber Pembelajaran",
        icon: "book",
        color: "border-teal-500 bg-teal-50 text-teal-900",
        tagColor: "bg-teal-600 text-white",
        desc: "Menguruskan penerimaan, pemprosesan, dan agihan 100% buku teks kepada semua murid warganegara secara sistematik.",
        highlights: [
          "Bilik Operasi SPBT Sekolah (BOSS) yang teratur",
          "Kempen Sayangi Buku Teks & Balut Buku",
          "Semakan berkala fizikal buku teks murid"
        ]
      },
      {
        id: "3k",
        name: "Program 3K (Kebersihan, Kesihatan & Keselamatan)",
        head: "Pn. Zurinah Jubidi",
        badge: "Iklim Selamat",
        icon: "check-circle-2",
        color: "border-emerald-500 bg-emerald-50 text-emerald-900",
        tagColor: "bg-emerald-600 text-white",
        desc: "Memastikan persekitaran sekolah bebas daripada wabak denggi, selamat daripada bencana, dan kondusif untuk proses pembelajaran.",
        highlights: [
          "Latihan Pengungsian Bangunan & Kebakaran berkala bersama Bomba",
          "Pemeriksaan Kesihatan & Imunisasi Gigi oleh Klinik Kesihatan",
          "Gotong-Royong Perdana Sekolah Bersama PIBG"
        ]
      },
      {
        id: "kantin",
        name: "Jawatankuasa Pengurusan Kantin Sekolah",
        head: "Pn. Hamisah Janah (PK HEM)",
        badge: "Nutrisi Halal",
        icon: "coffee",
        color: "border-rose-500 bg-rose-50 text-rose-900",
        tagColor: "bg-rose-600 text-white",
        desc: "Memantau kebersihan penyediaan makanan, taraf sanitasi pengendali makanan, dan pematuhan Garis Panduan Kantin Sihat KPM.",
        highlights: [
          "Penarafan Gred Kebersihan Kantin Gred A",
          "Pemeriksaan suhu, tarikh luput, dan kualiti air harian",
          "Penerapan adab makan sopan dan doa sebelum/selepas makan"
        ]
      }
    ]
  },

  // 4. BAHAGIAN KOKURIKULUM
  kokurikulum: {
    description: "Membentuk disiplin fizikal, bakat sukan, dan kepimpinan berkarakter menerusi penyertaan aktif dalam Badan Beruniform, Kelab & Sukan.",
    uniform: [
      {
        name: "Persekutuan Pengakap Kanak-Kanak",
        leader: "En. L Asmara Luandim",
        badge: "Badan Beruniform",
        color: "bg-amber-600",
        icon: "compass",
        desc: "Memupuk ilmu ikhtiar hidup, kemahiran tali temali, disiplin kawad kaki, dan khidmat masyarakat."
      },
      {
        name: "Bulan Sabit Merah Malaysia (BSMM)",
        leader: "Pn. Milnah Namih",
        badge: "Badan Beruniform",
        color: "bg-rose-600",
        icon: "cross",
        desc: "Mempelajari asas pertolongan cemas, bantuan CPR kecemasan, penjagaan luka, dan semangat kemanusiaan."
      },
      {
        name: "Tunas Kadet Remaja Sekolah (TKRS)",
        leader: "En. Mohd. Hafiz Qayyum Ahmad",
        badge: "Badan Beruniform",
        color: "bg-emerald-600",
        icon: "shield",
        desc: "Menekankan kecergasan fizikal, disiplin ketenteraan ringan, ketahanan mental, dan jati diri patriotik."
      },
      {
        name: "Pergerakan Puteri Islam Malaysia (PPIM)",
        leader: "Pn. Fatimah Daud",
        badge: "Badan Beruniform",
        color: "bg-pink-600",
        icon: "heart",
        desc: "Menerapkan nilai-nilai keperibadian muslimah solehah, kemahiran kulinari halal, dan jahitan asas."
      },
      {
        name: "Pandu Puteri Tunas (PPT)",
        leader: "Pn. Anna Octavia Ninteh",
        badge: "Badan Beruniform",
        color: "bg-blue-600",
        icon: "sun",
        desc: "Melatih kepimpinan kanak-kanak perempuan, kerja berpasukan, pertolongan kepada masyarakat dan etika kesopanan."
      }
    ],
    clubs: [
      {
        name: "Kelab STEM & Robotik",
        leader: "En. Muhd. Huzaifah Arman",
        icon: "cpu",
        desc: "Eksplorasi sains gunaan, pengaturcaraan blok Scratch, reka bentuk model 3D, dan inovasi kit kenderaan solar."
      },
      {
        name: "Persatuan Bahasa Melayu & Kebudayaan",
        leader: "Pn. Anidah Samad",
        icon: "book-open",
        desc: "Melatih seni pidato, berbalas pantun, tarian tradisional suku kaum Sabah, dan apresiasi sastera kanun."
      },
      {
        name: "English Language Society",
        leader: "Cik Rozeline Francis",
        icon: "globe",
        desc: "Fun interactive English quizzes, public speaking, spelling bee contests, and modern theatrical drama."
      },
      {
        name: "Kelab Komputer & Celik AI",
        leader: "Pn. Milnah Namih",
        icon: "laptop",
        desc: "Penguasaan asas perisian pejabat, kemahiran keselamatan siber, penyuntingan grafik poster, dan celik etika AI."
      },
      {
        name: "Kelab Doktor Muda & Kitar Semula",
        leader: "Pn. Muhayan Diman",
        icon: "stethoscope",
        desc: "Duta kesihatan sebaya, pencegahan kuman tangan, kebersihan mulut, dan projek pengasingan sisa kitar semula."
      }
    ],
    sports: [
      {
        name: "Kelab Bola Sepak",
        coach: "En. L Asmara Luandim & En. Amriee Abdullah",
        icon: "circle",
        desc: "Latihan asas hantaran, kawalan bola, pertahanan padang dan strategi taktikal perlawanan MSSD."
      },
      {
        name: "Kelab Bola Jaring",
        coach: "Pn. Hamisah Janah & Pn. Anidah Samad",
        icon: "target",
        desc: "Teknik gerak kaki, lontaran aras dada, jaringan pantas, dan kecergasan stamina gelanggang."
      },
      {
        name: "Kelab Sepak Takraw",
        coach: "En. Duin Lasig & En. Muhd. Huzaifah Arman",
        icon: "zap",
        desc: "Kemahiran asas sepakan sila, rejaman gunting, kawalan kepala, dan servis tekong di gelanggang."
      },
      {
        name: "Kelab Badminton",
        coach: "En. George Simun & Cik Rozeline Francis",
        icon: "wind",
        desc: "Teknik servis lob, smash tajam, pukulan kilas (backhand) dan ketangkasan kelajuan gelanggang."
      },
      {
        name: "Kelab Olahraga & Balapan",
        coach: "En. Mohd. Hafiz Qayyum Ahmad & En. Rejos Baking",
        icon: "activity",
        desc: "Latihan lari pecut 100m, 200m, lari berganti-ganti 4x100m, lompat jauh, lompat tinggi dan lontar peluru."
      },
      {
        name: "Kelab Catur & Permainan Tradisional",
        coach: "Pn. Anna Octavia Ninteh & Pn. Rohanah Mohd. Soud",
        icon: "box",
        desc: "Asah strategi taktikal catur, bukaan bidak, perlawanan congkak warisan, dan batu seremban."
      }
    ],
    hallOfFame: [
      {
        year: "2026",
        event: "Kejohanan Olahraga MSSD Kota Belud",
        achievement: "Johan Acara 4x100m Lelaki & Naib Johan Keseluruhan Zon",
        level: "Daerah (PPD Kota Belud)"
      },
      {
        year: "2026",
        event: "Karnival Inovasi STEM Peringkat Negeri Sabah",
        achievement: "Anugerah Pingat Emas Kategori Rekacipta Sekolah Rendah",
        level: "Negeri Sabah"
      },
      {
        year: "2026",
        event: "Pertandingan Choral Speaking Bahasa Inggeris Daerah",
        achievement: "Tempat Ketiga & Skrip Bahasa Paling Kreatif",
        level: "Daerah (PPD Kota Belud)"
      },
      {
        year: "2025",
        event: "Perkhemahan Perdana Badan Beruniform PPD Kota Belud",
        achievement: "Anugerah Platun Kawad Kaki Terbaik (Pengakap SK Tampasuk 1)",
        level: "Daerah (PPD Kota Belud)"
      }
    ]
  },

  // TAKWIM PERSEKOLAHAN 2026
  takwim: [
    {
      id: "TK01",
      date: "05 Januari 2026",
      month: "Januari",
      category: "Pentadbiran",
      title: "Mesyuarat Guru & Staf Bil. 1/2026",
      desc: "Taklimat hala tuju pembukaan sesi persekolahan 2026, pengagihan tugas dan jadual waktu."
    },
    {
      id: "TK02",
      date: "12 Januari 2026",
      month: "Januari",
      category: "Kurikulum",
      title: "Hari Pertama Pembukaan Sesi Persekolahan 2026",
      desc: "Program Transisi Tahun 1 dan pemulaan pengajaran dan pembelajaran rasmi mengikut jadual."
    },
    {
      id: "TK03",
      date: "24 Januari 2026",
      month: "Januari",
      category: "HEM",
      title: "Majlis Pelantikan Pemimpin Cilik (Pengawas, PRS, PSS)",
      desc: "Penyampaian watikah pelantikan rasmi dan bacaan ikrar kepimpinan murid di hadapan pentadbir."
    },
    {
      id: "TK04",
      date: "14 Februari 2026",
      month: "Februari",
      category: "Kokurikulum",
      title: "Pelancaran Aktiviti Mingguan Badan Beruniform & Kelab",
      desc: "Perjumpaan pertama kokurikulum sesi 2026 dan pendaftaran keahlian unit bagi murid Tahap 2."
    },
    {
      id: "TK05",
      date: "07 Mac 2026",
      month: "Mac",
      category: "HEM",
      title: "Gotong-Royong Perdana 3K Bersama PIBG",
      desc: "Pembersihan kawasan angkat sekolah, mengecat koridor bilik darjah dan pencegahan tempat pembiakan jentik-jentik."
    },
    {
      id: "TK06",
      date: "25 Mac 2026",
      month: "Mac",
      category: "Kurikulum",
      title: "Mesyuarat Panitia Mata Pelajaran Bil. 1/2026",
      desc: "Penyelarasan RPT, DSKP KSSR Semakan, dan perancangan program peningkatan PBD setiap subjek."
    },
    {
      id: "TK07",
      date: "15 April 2026",
      month: "April",
      category: "Kurikulum",
      title: "Pelancaran Program Semarak NILAM & Dekad Membaca",
      desc: "Kempen galakan membaca buku harian, perasmian sudut bacaan kelas dan pinjaman aktif PSS."
    },
    {
      id: "TK08",
      date: "02 Mei 2026",
      month: "Mei",
      category: "Pentadbiran",
      title: "Mesyuarat Agung Tahunan PIBG Kali Ke-38",
      desc: "Membincangkan laporan kewangan, sarana ibu bapa, dan usul pembangunan prasarana sekolah."
    },
    {
      id: "TK09",
      date: "16 Mei 2026",
      month: "Mei",
      category: "Pentadbiran",
      title: "Sambutan Hari Guru Peringkat Sekolah",
      desc: "Tema: 'Guru Jauhari Digital, Aspirasi Negara Madani' - Sukaneka guru-murid dan persembahan bakat."
    },
    {
      id: "TK10",
      date: "10 Jun 2026",
      month: "Jun",
      category: "Kurikulum",
      title: "Sesi Dialog Prestasi PBD Pertengahan Tahun",
      desc: "Semakan Tahap Penguasaan (TP) murid dan intervensi khusus bagi murid yang belum mencapai TP3."
    },
    {
      id: "TK11",
      date: "18 Julai 2026",
      month: "Julai",
      category: "Kokurikulum",
      title: "Temasya Kejohanan Sukan Tahunan SK Tampasuk 1",
      desc: "Pertandingan antara rumah sukan (Biru, Merah, Kuning, Hijau) dalam acara padang dan balapan."
    },
    {
      id: "TK12",
      date: "15 Ogos 2026",
      month: "Ogos",
      category: "Kokurikulum",
      title: "Pelancaran Bulan Kemerdekaan & Kibar Jalur Gemilang",
      desc: "Sambutan kemerdekaan, pertandingan nyanyian lagu patriotik dan pameran sejarah tempatan Kota Belud."
    },
    {
      id: "TK13",
      date: "07 September 2026",
      month: "September",
      category: "Pentadbiran",
      title: "Pengemaskinian Jadual Waktu Rasmi & Guru Ganti Sesi Akhir",
      desc: "Penyelarasan terkini jadual waktu rasmi sekolah berkuat kuasa 07 September 2026 oleh Pn. Zuraidah & Pn. Milnah."
    },
    {
      id: "TK14",
      date: "10 Oktober 2026",
      month: "Oktober",
      category: "Kokurikulum",
      title: "Hari Sukan Negara & Karnival Permainan Tradisional",
      desc: "Senamrobik perdana seluruh warga sekolah, sukaneka komuniti, dan pameran kesihatan."
    },
    {
      id: "TK15",
      date: "18 November 2026",
      month: "November",
      category: "Kurikulum",
      title: "Ujian Akhir Sesi Akademik (UASA) Tahun 4, 5 & 6",
      desc: "Penilaian akhir tahun mengikut instrumen standard Lembaga Peperiksaan KPM."
    },
    {
      id: "TK16",
      date: "12 Disember 2026",
      month: "Disember",
      category: "Pentadbiran",
      title: "Hari Anugerah Cemerlang & Graduasi Tahun 6 / Prasekolah",
      desc: "Pemberian anugerah akademik, kokurikulum, sahsiah terpuji dan sijil graduasi persekolahan rendah."
    }
  ],

  // BERITA & PENGUMUMAN RASMI
  news: [
    {
      id: "N01",
      title: "Pelancaran Portal Bersepadu Rasmi SK Tampasuk 1 Sebagai Domain Utama",
      category: "Pentadbiran",
      date: "13 September 2026",
      author: "Unit ICT & Data SK Tampasuk 1",
      tagColor: "bg-blue-600 text-white",
      summary: "SK Tampasuk 1 melakar sejarah dengan pelancaran portal bersepadu rasmi di domain utama sktampasuk1.edu.my yang menggabungkan seluruh teras sekolah.",
      content: "Portal bersepadu ini menyediakan akses pantas kepada warga pendidik, ibu bapa, dan murid terhadap maklumat Pentadbiran, Kurikulum, Hal Ehwal Murid, dan Kokurikulum. Sistem ini turut menyepadukan sistem dalaman sekolah seperti e-Guru Ganti dan pautan terus ke perkhidmatan KPM seperti DELIMa, APDM, dan HRMIS. Diharapkan langkah pendigitalan ini memperkukuh ketercapaian maklumat secara profesional dan telus."
    },
    {
      id: "N02",
      title: "Jadual Waktu Persekolahan Terkini 2026 Berkuat Kuasa Penuh",
      category: "Kurikulum",
      date: "07 September 2026",
      author: "Penyelaras Jadual Waktu",
      tagColor: "bg-emerald-600 text-white",
      summary: "Jadual waktu rasmi terkini yang diselaraskan oleh Jawatankuasa Jadual Waktu kini berkuat kuasa sepenuhnya bagi semua kelas dan 26 orang guru.",
      content: "Jadual waktu penggal terkini telah diselaraskan dengan sempurna tanpa sebarang pertindihan slot waktu (zero clash). Para guru dan ibu bapa boleh menyemak senarai jadual guru bertugas mingguan dan slot persekolahan menerusi portal rasmi atau sistem e-Guru Ganti sekolah."
    },
    {
      id: "N03",
      title: "Kejayaan Membanggakan di Karnival Inovasi STEM Negeri Sabah 2026",
      category: "Kokurikulum",
      date: "28 Ogos 2026",
      author: "Unit Kokurikulum & Panitia Sains",
      tagColor: "bg-teal-600 text-white",
      summary: "Pasukan inovasi cilik SK Tampasuk 1 meraih Anugerah Pingat Emas menerusi ciptaan 'Sistem Penjimatan Air Hujan Automatik'.",
      content: "Tahniah diucapkan kepada barisan murid dan guru pembimbing (En. Muhd. Huzaifah Arman & Pn. Jennet Gindawa) atas kejayaan mengharumkan nama sekolah dan daerah Kota Belud di persada negeri Sabah. Usaha inovatif ini membuktikan murid luar bandar berdaya saing tinggi dalam bidang sains dan teknologi."
    },
    {
      id: "N04",
      title: "Agihan Bantuan Awal Persekolahan (BAP) & Pengurusan RMT 2026",
      category: "HEM",
      date: "15 Ogos 2026",
      author: "Unit Kebajikan & HEM",
      tagColor: "bg-purple-600 text-white",
      summary: "Agihan Bantuan Awal Persekolahan berjalan lancar dengan sokongan padu ibu bapa, disertai pemantauan menu berkhasiat RMT di kantin sekolah.",
      content: "Pihak sekolah merakamkan setinggi-tinggi penghargaan kepada semua ibu bapa dan penjaga yang hadir mengikut jadual yang ditetapkan. Pemantauan harian terhadap menu hidangan RMT juga sentiasa diperketatkan bagi memastikan murid menerima khasiat makanan seimbang untuk perkembangan minda."
    }
  ],

  // PUSAT MUAT TURUN DOKUMEN RASMI
  downloads: [
    {
      id: "D01",
      title: "Borang Permohonan Cuti Rehat Khas (CRK) Guru",
      category: "Pentadbiran",
      format: "PDF",
      size: "240 KB",
      desc: "Borang permohonan rasmi cuti rehat khas staf dan guru mengikut Pekeliling Perkhidmatan JPA."
    },
    {
      id: "D02",
      title: "Borang Kebenaran Ibu Bapa / Penjaga Mengikuti Aktiviti Luar",
      category: "Kokurikulum",
      format: "PDF",
      size: "185 KB",
      desc: "Surat perakuan dan kebenaran waris untuk pertandingan sukan, lawatan sekolah dan perkhemahan."
    },
    {
      id: "D03",
      title: "Takwim Persekolahan & Aktiviti Tahunan SK Tampasuk 1 Sesi 2026",
      category: "Pentadbiran",
      format: "PDF",
      size: "1.2 MB",
      desc: "Buku panduan lengkap takwim persekolahan, cuti penggal KPM dan jadual perhimpunan mingguan."
    },
    {
      id: "D04",
      title: "Format Templat Penulisan Rancangan Pengajaran Harian (RPH) KSSR",
      category: "Kurikulum",
      format: "DOCX",
      size: "320 KB",
      desc: "Templat standard e-RPH berasaskan DSKP KSSR Semakan dan pendekatan PAK-21."
    },
    {
      id: "D05",
      title: "Borang Pendaftaran Murid Baharu Tahun 1 & Prasekolah 2027",
      category: "HEM",
      format: "PDF",
      size: "450 KB",
      desc: "Senarai semak dokumen sokongan pendaftaran murid baharu dan borang maklumat keluarga."
    },
    {
      id: "D06",
      title: "Borang Akuan Pendapatan Penjaga Bagi Skim Bantuan Sekolah (BAP/RMT)",
      category: "HEM",
      format: "PDF",
      size: "190 KB",
      desc: "Borang pengesahan pendapatan bagi ibu bapa/penjaga yang bekerja sendiri atau tiada slip gaji."
    }
  ],

  // PIBG & KOMUNITI
  pibg: {
    ypt: "En. Raimin Bin Ginsos (Yang Dipertua PIBG)",
    nypt: "Pn. Normah Binti Jalil (Naib YDP PIBG)",
    setiausaha: "En. Amriee Abdullah",
    bendahari: "Pn. Anna Octavia Ninteh",
    initiatives: [
      "Kumpulan Sokongan Ibu Bapa (KSIB) - Sukarelawan kawalan lalu lintas waktu pagi.",
      "Program Dana Wakaf Infrastruktur Surau & Dewan Terbuka Sekolah.",
      "Kelas Tambahan Hujung Minggu & Motivasi Bersama Komuniti Kampung Tampasuk."
    ]
  }
};
