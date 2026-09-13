/**
 * e-Guru Ganti V2 - Data Jadual Waktu Rasmi Sesi 2026
 * SK Tampasuk 1 Kota Belud, Sabah
 * Rujukan Utama: PDF Jadual Waktu Rasmi 2026 (Berkuat kuasa 07 September 2026)
 * Disediakan oleh: Pn. Zuraidah Hj. Marjin & Pn. Milnah Namih
 */

// Senarai 26 Guru Rasmi Master
const MASTER_TEACHERS = [
  "En. Mudah Hj. Admaim",
  "Datin Razana Hj. Abd. Wahid",
  "Pn. Hamisah Janah",
  "Pn. Jennet Gindawa",
  "En. Amriee Abdullah",
  "Pn. Anidah Samad",
  "Pn. Anna Octavia Ninteh",
  "En. Duin Lasig",
  "Pn. Fatimah Daud",
  "En. George Simun",
  "Pn. Jamlinah Maliasan",
  "Pn. Kasmalah Ismail",
  "En. L Asmara Luandim",
  "Pn. Mastikahjunaidah Shahrom",
  "Pn. Milnah Namih",
  "En. Mohd. Hafiz Qayyum Ahmad",
  "Pn. Muhayan Diman",
  "En. Muhd. Huzaifah Arman",
  "En. Rejos Baking",
  "Pn. Rohanah Mohd. Soud",
  "Cik Rozeline Francis",
  "Cik Rozie Sumil",
  "Pn. Salhah Awang Tengah",
  "Pn. Yunizah Esun",
  "Pn. Zuraidah Hj. Marjin",
  "Pn. Zurinah Jubidi",
  "Cik Anizah Anis Dalinsip"
];

// 4 Kumpulan Guru Bertugas
const TEACHER_GROUPS = {
  "Kumpulan 1": [
    "En. Mudah Hj. Admaim",
    "Pn. Milnah Namih",
    "En. Mohd. Hafiz Qayyum Ahmad",
    "Pn. Anidah Samad",
    "Pn. Rohanah Mohd. Soud",
    "Pn. Mastikahjunaidah Shahrom",
    "Pn. Anna Octavia Ninteh"
  ],
  "Kumpulan 2": [
    "Datin Razana Hj. Abd. Wahid",
    "En. L Asmara Luandim",
    "Pn. Yunizah Esun",
    "Pn. Zuraidah Hj. Marjin",
    "Cik Rozeline Francis",
    "Cik Rozie Sumil",
    "En. Muhd. Huzaifah Arman"
  ],
  "Kumpulan 3": [
    "Pn. Hamisah Janah",
    "En. George Simun",
    "En. Rejos Baking",
    "Pn. Fatimah Daud",
    "Pn. Kasmalah Ismail",
    "En. Amriee Abdullah"
  ],
  "Kumpulan 4": [
    "Pn. Jennet Gindawa",
    "Pn. Salhah Awang Tengah",
    "Pn. Jamlinah Maliasan",
    "Pn. Muhayan Diman",
    "Pn. Zurinah Jubidi",
    "En. Duin Lasig"
  ]
};

// 14 Slot Standard Waktu Persekolahan SK Tampasuk 1
const STANDARD_SLOTS = [
  "7.00-7.10",   // 0: Perhimpunan / Semai
  "7.10-7.40",   // 1
  "7.40-8.10",   // 2
  "8.10-8.40",   // 3
  "8.40-9.10",   // 4
  "9.10-9.40",   // 5
  "9.40-10.10",  // 6: Rehat Sekolah (R/E/H/A/T)
  "10.10-10.40", // 7
  "10.40-11.10", // 8
  "11.10-11.40", // 9
  "11.40-12.10", // 10
  "12.10-12.40", // 11
  "12.40-1.10",  // 12
  "1.10-1.40"    // 13
];

// Hari & Bulan Bahasa Melayu
const MALAY_DAYS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
];

// Palet Warna Unik dan Spesial untuk Setiap 26 Guru Rasmi
const TEACHER_UNIQUE_PALETTE = {
  "Pn. Jennet Gindawa": {
    primary: "#0d9488", // Teal / Hijau Laut
    border: "#99f6e4",
    text: "#0f766e",
    bg: "#f0fdfa"
  },
  "Pn. Kasmalah Ismail": {
    primary: "#ea580c", // Orange Jingga
    border: "#fed7aa",
    text: "#9a3412",
    bg: "#fff7ed"
  },
  "En. Mudah Hj. Admaim": {
    primary: "#1d4ed8", // Biru Diraja
    border: "#bfdbfe",
    text: "#1e40af",
    bg: "#eff6ff"
  },
  "Datin Razana Hj. Abd. Wahid": {
    primary: "#e11d48", // Rose Merah Jambu
    border: "#fecdd3",
    text: "#9f1239",
    bg: "#fff1f2"
  },
  "Pn. Hamisah Janah": {
    primary: "#7c3aed", // Ungu Violet
    border: "#ddd6fe",
    text: "#5b21b6",
    bg: "#f5f3ff"
  },
  "En. Amriee Abdullah": {
    primary: "#d97706", // Amber / Emas
    border: "#fde68a",
    text: "#92400e",
    bg: "#fffbeb"
  },
  "Pn. Anidah Samad": {
    primary: "#4f46e5", // Indigo / Nila
    border: "#c7d2fe",
    text: "#3730a3",
    bg: "#eef2ff"
  },
  "Pn. Anna Octavia Ninteh": {
    primary: "#0284c7", // Biru Langit
    border: "#bae6fd",
    text: "#0369a1",
    bg: "#f0f9ff"
  },
  "En. Duin Lasig": {
    primary: "#16a34a", // Hijau Rumput
    border: "#bbf7d0",
    text: "#15803d",
    bg: "#f0fdf4"
  },
  "Pn. Fatimah Daud": {
    primary: "#dc2626", // Merah Crimson
    border: "#fecaca",
    text: "#991b1b",
    bg: "#fef2f2"
  },
  "En. George Simun": {
    primary: "#c026d3", // Fuchsia / Magenta
    border: "#f5d0fe",
    text: "#86198f",
    bg: "#fdf4ff"
  },
  "Pn. Jamlinah Maliasan": {
    primary: "#65a30d", // Hijau Limau (Lime)
    border: "#d9f99d",
    text: "#3f6212",
    bg: "#f7fee7"
  },
  "En. L Asmara Luandim": {
    primary: "#475569", // Kelabu Slate
    border: "#cbd5e1",
    text: "#1e293b",
    bg: "#f8fafc"
  },
  "Pn. Mastikahjunaidah Shahrom": {
    primary: "#0891b2", // Cyan / Pirus
    border: "#a5f3fc",
    text: "#155e75",
    bg: "#ecfeff"
  },
  "Pn. Milnah Namih": {
    primary: "#f43f5e", // Koral Panas
    border: "#fecdd3",
    text: "#be123c",
    bg: "#fff1f2"
  },
  "En. Mohd. Hafiz Qayyum Ahmad": {
    primary: "#2563eb", // Biru Kobalt
    border: "#93c5fd",
    text: "#1d4ed8",
    bg: "#eff6ff"
  },
  "Pn. Muhayan Diman": {
    primary: "#4d7c0f", // Hijau Zaitun
    border: "#bef264",
    text: "#365314",
    bg: "#f7fee7"
  },
  "En. Muhd. Huzaifah Arman": {
    primary: "#9333ea", // Orkid Ungu
    border: "#e9d5ff",
    text: "#6b21a8",
    bg: "#faf5ff"
  },
  "En. Rejos Baking": {
    primary: "#c2410c", // Terakota / Bata
    border: "#ffedd5",
    text: "#7c2d12",
    bg: "#fff7ed"
  },
  "Pn. Rohanah Mohd. Soud": {
    primary: "#06b6d4", // Biru Akuamarin
    border: "#cffafe",
    text: "#0e7490",
    bg: "#ecfeff"
  },
  "Cik Rozeline Francis": {
    primary: "#db2777", // Beri Merah Jambu
    border: "#fbcfe8",
    text: "#9d174d",
    bg: "#fdf2f8"
  },
  "Cik Rozie Sumil": {
    primary: "#15803d", // Hijau Hutan
    border: "#86efac",
    text: "#166534",
    bg: "#f0fdf4"
  },
  "Pn. Salhah Awang Tengah": {
    primary: "#ca8a04", // Kuning Marigold
    border: "#fef08a",
    text: "#854d0e",
    bg: "#fefce8"
  },
  "Pn. Yunizah Esun": {
    primary: "#a21caf", // Ungu Wain (Plum)
    border: "#f0abfc",
    text: "#701a75",
    bg: "#fae8ff"
  },
  "Pn. Zuraidah Hj. Marjin": {
    primary: "#059669", // Hijau Zamrud
    border: "#6ee7b7",
    text: "#064e3b",
    bg: "#ecfdf5"
  },
  "Pn. Zurinah Jubidi": {
    primary: "#0369a1", // Biru Pasifik
    border: "#7dd3fc",
    text: "#0c4a6e",
    bg: "#f0f9ff"
  },
  "Cik Anizah Anis Dalinsip": {
    primary: "#0891b2", // Cyan / Biru Laut
    border: "#a5f3fc",
    text: "#155e75",
    bg: "#ecfeff"
  },
  "Guru UBK": {
    primary: "#9333ea", // Ungu UBK
    border: "#d8b4fe",
    text: "#6b21a8",
    bg: "#faf5ff"
  }
};

function getTeacherColor(name) {
  if (!name) {
    return {
      primary: "#94a3b8",
      border: "#e2e8f0",
      text: "#334155",
      bg: "#ffffff"
    };
  }

  // 1. Padanan palet unik khas 26 guru rasmi
  if (TEACHER_UNIQUE_PALETTE[name]) {
    return TEACHER_UNIQUE_PALETTE[name];
  }

  // 2. Penjana warna unik automatik berasaskan 'golden angle' untuk sebarang nama guru tambahan
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash * 137.508) % 360;
  return {
    primary: `hsl(${Math.round(hue)}, 75%, 42%)`,
    border: `hsl(${Math.round(hue)}, 70%, 82%)`,
    text: `hsl(${Math.round(hue)}, 80%, 26%)`,
    bg: `hsl(${Math.round(hue)}, 80%, 98%)`
  };
}

const GURU_CARD_COLORS = [
  { header: "bg-blue-600 text-white", border: "#bfdbfe" },
  { header: "bg-emerald-600 text-white", border: "#a7f3d0" },
  { header: "bg-purple-600 text-white", border: "#ddd6fe" },
  { header: "bg-amber-600 text-white", border: "#fde68a" },
  { header: "bg-teal-600 text-white", border: "#99f6e4" },
  { header: "bg-rose-600 text-white", border: "#fecdd3" }
];

function getGuruCardColor(name) {
  const col = getTeacherColor(name);
  return {
    header: "",
    primary: col.primary,
    border: col.border,
    text: col.text,
    bg: col.bg
  };
}

function parseTimeToMinutes(t) {
  if (!t) return 0;
  let [h, m] = t.split('.').map(Number);
  if (isNaN(h)) return 0;
  if (h < 7) h += 12; // Waktu petang (1.10 -> 13.10)
  return h * 60 + (m || 0);
}

function splitTimeSlot(s) {
  if (!s) return [];
  const normalized = s.replace(/[–—\u2013\u2014]/g, '-').replace(/â€“|â€”/g, '-').trim();
  const parts = normalized.split('-');
  if (parts.length !== 2) return [s];
  try {
    const st = parseTimeToMinutes(parts[0].trim());
    const en = parseTimeToMinutes(parts[1].trim());
    const matched = [];
    for (const std of STANDARD_SLOTS) {
      if (std === "9.40-10.10") continue; // Kecualikan waktu rehat
      const sn = std.replace(/[–—\u2013\u2014]/g, '-').replace(/â€“|â€”/g, '-').split('-');
      const sm = parseTimeToMinutes(sn[0]);
      const em = parseTimeToMinutes(sn[1]);
      if (sm >= st && em <= en) matched.push(std);
    }
    return matched.length ? matched : [s];
  } catch (e) {
    return [s];
  }
}

// Jadual Individu Guru Rasmi Sesi 2026 (Format: slotIndex|subjek|kelas)
// Dijana terus daripada PDF Rasmi SK Tampasuk 1 (Zero Clash Guaranteed)
const JADUAL_INDIVIDU_GURU = {
  "En. Mudah Hj. Admaim": {
    Isnin: "9|PI|5B",
    Selasa: "3|PI|5B",
    Rabu: "7|PI|5B;8|PI|5B",
    Khamis: "8|PI|5B;9|PI|5B",
    Jumaat: ""
  },
  "Datin Razana Hj. Abd. Wahid": {
    Isnin: "8|PM|5A;9|PM|5A",
    Selasa: "1|PM|5A;2|PM|5A;4|PM|3A;5|PM|3A",
    Rabu: "7|PM|3A;8|PM|3A",
    Khamis: "7|PM|3A;8|PM|3A",
    Jumaat: "4|PM|5A;5|PM|5A"
  },
  "Pn. Hamisah Janah": {
    Isnin: "11|PM|6A",
    Selasa: "10|PM|1A;11|PM|1A",
    Rabu: "3|PM|6A;9|PM|1A;10|PM|1A",
    Khamis: "9|PM|6A;10|PM|6A",
    Jumaat: "1|PM|1A;2|PM|1A;4|PM|6A;5|PM|6A"
  },
  "Pn. Jennet Gindawa": {
    Isnin: "4|BKD|3A;5|BKD|3A",
    Selasa: "7|SN|5B;9|SN|1B",
    Rabu: "8|BKD|2A;9|BKD|2A",
    Khamis: "1|SN|5B;2|SN|5B;8|MZ|5A;10|SN|5B",
    Jumaat: "3|SN|1B;4|SN|1B"
  },
  "En. Amriee Abdullah": {
    Isnin: "2|SEJ|6B;3|SEJ|6B;5|SEJ|6A;7|MZ|2A;9|PK|1B;10|PM|2A;11|PM|2A",
    Selasa: "3|SEJ|5A;5|SEJ|6A;7|PM|2A;8|PM|2A;9|PK|4A",
    Rabu: "1|PSV|6A;2|PSV|6A;3|PJ|4A;5|PJ|1B",
    Khamis: "1|PJ|1B;3|MZ|2B;7|SEJ|5A;9|PM|2A;10|PM|2A",
    Jumaat: "1|PSV|6B;2|PSV|6B;3|PJ|4A;7|SEJ|5B;8|SEJ|5B"
  },
  "Pn. Anidah Samad": {
    Isnin: "2|BM|4A;3|BM|4A;8|BM|4B;9|BM|4B",
    Selasa: "1|BM|4A;2|BM|4A;4|BM|4B;5|BM|4B",
    Rabu: "1|BM|4B;2|BM|4B;4|BM|4A;5|BM|4A;7|SEJ|4B;8|SEJ|4B",
    Khamis: "2|PSV|4B;3|PSV|4B;5|BM|4A;7|BM|4A;8|BM|4A;10|BM|4B",
    Jumaat: "1|PSV|4A;2|PSV|4A;4|PSV|2A;5|PSV|2A;7|BM|4B;8|BM|4B"
  },
  "Pn. Anna Octavia Ninteh": {
    Isnin: "2|M3|2B;3|M3|2B;5|MZ|1B;7|M3|1A;8|M3|1A;10|M3|4A;11|M3|4A",
    Selasa: "3|M3|4A;7|M3|6A;8|M3|6A;10|M3|2B;11|M3|2B",
    Rabu: "3|MZ|1A;7|M3|1A;8|M3|1A;9|M3|6A",
    Khamis: "1|M3|4A;2|M3|4A;4|PSV|2B;5|PSV|2B;9|M3|2B;10|M3|2B",
    Jumaat: "1|M3|6A;2|M3|6A;4|M3|1A;5|M3|1A"
  },
  "En. Duin Lasig": {
    Isnin: "4|M3|3B;5|M3|3B;10|M3|3A;11|M3|3A",
    Selasa: "3|M3|2A;4|M3|2A;8|M3|3A;9|M3|3A",
    Rabu: "2|M3|3A;3|M3|3A;7|M3|3B;8|M3|3B",
    Khamis: "4|M3|2A;5|M3|2A;9|M3|3B;10|M3|3B",
    Jumaat: "7|M3|2A;8|M3|2A"
  },
  "Pn. Fatimah Daud": {
    Isnin: "4|PI|2B;5|PI|2B;8|PI|6B;9|PI|6B;11|PI|6A;12|TASMEK|6A;13|TASMEK|6A",
    Selasa: "4|PI|4A;5|PI|4A;7|PI|2B;8|PI|2B;10|PI|6B;11|PI|6B;12|TASMEK|3A;13|TASMEK|3A",
    Rabu: "3|PI|6A;7|PI|4A;8|PI|4A;10|PI|6B;11|TASMEK|3B;12|TASMEK|3B",
    Khamis: "3|PI|4A;4|PI|4A;5|PI|6B;9|PI|6A;10|PI|6A;11|TASMEK|1A;12|TASMEK|1A",
    Jumaat: "1|PI|2B;2|PI|2B;4|PI|6A;5|PI|6A"
  },
  "En. George Simun": {
    Isnin: "2|BM|1B;3|BM|1B;4|BM|1B;9|BM|2B;10|BM|2B",
    Selasa: "1|BM|1B;4|BM|2B;5|BM|2B;9|BM|2B;10|BM|1B;11|BM|1B",
    Rabu: "1|BM|2B;2|BM|2B;7|BM|1B;8|BM|1B",
    Khamis: "1|BM|2B;2|BM|2B;7|MZ|5B;9|BM|1B;10|BM|1B",
    Jumaat: "1|BM|1B;2|BM|1B;4|BM|2B;5|BM|2B;7|BM|2B"
  },
  "Pn. Jamlinah Maliasan": {
    Isnin: "2|BM|5B;4|BM|6B;5|BM|6B;10|BM|5B;11|BM|5B",
    Selasa: "1|BM|5B;2|BM|5B",
    Rabu: "1|BM|5B;2|BM|5B;4|BM|6B;5|BM|6B",
    Khamis: "1|BM|6B;2|BM|6B",
    Jumaat: "1|BM|5B;2|BM|5B;5|BM|6B;7|BM|6B;8|BM|6B"
  },
  "Pn. Kasmalah Ismail": {
    Isnin: "2|BM|1A;3|BM|1A;8|BM|2A;9|BM|2A;11|BM|1A",
    Selasa: "1|BM|2A;2|BM|2A;5|BM|1A;7|BM|1A;8|BM|1A;9|BM|2A",
    Rabu: "1|BM|1A;2|BM|1A;4|BM|2A;5|BM|2A;7|BM|2A;9|SEJ|4A;10|SEJ|4A",
    Khamis: "4|BM|1A;5|BM|1A;7|BM|2A;8|BM|2A",
    Jumaat: "1|BM|2A;2|BM|2A;7|BM|1A;8|BM|1A"
  },
  "En. L Asmara Luandim": {
    Isnin: "4|BM|5A;5|BM|5A;7|BM|5A;9|BM|6A;10|BM|6A",
    Selasa: "3|BM|6A;4|BM|6A;5|PK|3B;9|BM|5A;10|BM|5A;11|BM|6A",
    Rabu: "1|PJ|3A;3|PJ|3B;9|BM|5A;10|BM|5A",
    Khamis: "1|PSV|3B;2|PSV|3B;4|BM|5A;5|BM|5A;7|BM|6A;8|BM|6A;9|PK|3A",
    Jumaat: "3|PJ|3A;5|PJ|3B;7|BM|6A;8|BM|6A"
  },
  "Pn. Mastikahjunaidah Shahrom": {
    Isnin: "10|PI|2A;11|PI|2A;12|TASMEK|2A;13|TASMEK|2A",
    Selasa: "2|PI|1B;3|PI|1B;7|PI|2A;8|PI|2A;10|PI|1A;11|PI|1A",
    Rabu: "3|PI|1B;4|PI|1B;9|PI|1A;10|PI|1A;11|TASMEK|2B;12|TASMEK|2B",
    Khamis: "2|PI|1B;3|PI|1B;9|PI|2A;10|PI|2A;11|TASMEK|1B;12|TASMEK|1B",
    Jumaat: "1|PI|1A;2|PI|1A"
  },
  "Pn. Milnah Namih": {
    Isnin: "3|BI|6A;4|BI|6A;7|BI|4A;8|BI|4A",
    Selasa: "1|BI|6A;2|BI|6A;4|BI|5A;5|BI|5A;7|BI|4A;8|BI|4A",
    Rabu: "1|BI|4A;2|BI|4A;4|BI|6A;5|BI|6A;7|BI|5A;8|BI|5A",
    Khamis: "3|BI|6A;4|BI|6A;9|BI|5A;10|BI|5A",
    Jumaat: "2|BI|5A;3|BI|5A;4|BI|4A;5|BI|4A;7|RBT|4A;8|RBT|4A"
  },
  "En. Mohd. Hafiz Qayyum Ahmad": {
    Isnin: "3|PK|5B;4|SN|4A;5|SN|4A;9|SN|1A;10|SN|1A",
    Selasa: "1|SN|4B;2|SN|4B;4|SN|1A;7|RBT|6B;9|RBT|6A;10|RBT|6A",
    Rabu: "1|SN|5A;2|SN|5A;3|PJ|5B;9|RBT|5B;10|RBT|5B",
    Khamis: "2|RBT|5A;3|RBT|5A;5|PJ|5B;7|RBT|6B;9|SN|4A;10|SN|4A",
    Jumaat: "1|SN|4B;2|SN|4B;7|SN|5A;8|SN|5A"
  },
  "Pn. Muhayan Diman": {
    Isnin: "2|BM|3A;3|BM|3A;7|BM|3B;8|BM|3B;9|BM|3A",
    Selasa: "2|BM|3A;3|BM|3A;7|BM|3A;9|BM|3B;10|BM|3B",
    Rabu: "1|BM|3B;2|BM|3B;4|BM|3A;5|BM|3A;9|BM|3B;10|BM|3B",
    Khamis: "2|BM|3A;3|BM|3A;7|BM|3B;8|BM|3B",
    Jumaat: "1|PSV|3A;2|PSV|3A;4|BM|3A;5|BM|3A;7|BM|3B;8|BM|3B"
  },
  "En. Muhd. Huzaifah Arman": {
    Isnin: "2|PI|3B;3|PI|3B;7|PI|4B;8|PI|5A;9|PI|5A;12|TASMEK|4B;13|TASMEK|4B",
    Selasa: "1|PI|5A;2|PI|5A;4|PI|3A;5|PI|3A;8|PI|4B;9|PI|4B",
    Rabu: "4|PI|4B;5|PI|4B;7|PI|3A;8|PI|3A;11|TASMEK|5B;12|TASMEK|5B",
    Khamis: "1|PI|4B;3|PI|3B;4|PI|3B;7|PI|3A;8|PI|3A;11|TASMEK|5A;12|TASMEK|5A",
    Jumaat: "1|PI|3B;2|PI|3B;4|PI|5A;5|PI|5A"
  },
  "En. Rejos Baking": {
    Isnin: "2|PSV|5A;3|PSV|5A;4|RBT|4B;5|RBT|4B;7|PK|6B;9|MZ|3B",
    Selasa: "1|PJ|1A;3|PJ|4B;5|PJ|6B;7|MZ|4B;9|PK|1A;11|PK|5A",
    Rabu: "1|PJ|6B;3|PJ|4B;5|PJ|5A;7|PK|6A;8|MZ|6A;9|MZ|6B",
    Khamis: "3|PJ|1A;5|PJ|6A;7|PK|4B;9|PSV|1A;10|PSV|1A",
    Jumaat: "1|PJ|5A;3|PJ|6A"
  },
  "Pn. Rohanah Mohd. Soud": {
    Isnin: "2|BI|2A;3|BI|2A;7|BI|2B;8|BI|2B;10|BI|3B;11|BI|3B",
    Selasa: "1|BI|2B;2|BI|2B;7|BI|3B;8|BI|3B;10|BI|2A;11|BI|2A",
    Rabu: "1|BI|2A;2|BI|2A;4|BI|3B;5|BI|3B;7|BI|2B;8|BI|2B;10|BI|2A",
    Khamis: "1|BI|2A;2|BI|2A;5|BI|3B;7|BI|2B;8|BI|2B",
    Jumaat: "3|BI|3B;4|BI|3B;8|BI|2B"
  },
  "Cik Rozeline Francis": {
    Isnin: "2|BKD|6A;10|BKD|5A;11|BKD|5A",
    Selasa: "3|PJ|2B;5|PJ|2A;10|BKD|4A;11|BKD|4A",
    Rabu: "3|PJ|2A;5|PJ|2B;10|BKD|6A",
    Khamis: "1|BKD|1A;2|BKD|1A;3|PK|2A",
    Jumaat: "3|PK|2B"
  },
  "Cik Rozie Sumil": {
    Isnin: "2|M3|4B;3|M3|4B;10|M3|1B;11|M3|1B",
    Selasa: "1|M3|6B;2|M3|6B;4|M3|1B;5|M3|1B;7|M3|5A;8|M3|5A",
    Rabu: "3|M3|5A;4|M3|5A;8|M3|6B;9|M3|1B;10|M3|1B",
    Khamis: "1|M3|5A;3|M3|6B;4|M3|6B;8|M3|4B;9|M3|4B",
    Jumaat: "5|M3|4B"
  },
  "Pn. Salhah Awang Tengah": {
    Isnin: "2|BA|6A;4|BA|3A;5|BA|3A;10|BA|5A;11|BA|5A",
    Selasa: "1|BA|3B;2|BA|3B;4|BA|5B;5|BA|5B;10|BA|4A;11|BA|4A",
    Rabu: "3|BA|2B;4|BA|2B;7|BA|6B;8|BA|2A;9|BA|2A;10|BA|6A;11|TASMEK|4A;12|TASMEK|4A",
    Khamis: "1|BA|1A;2|BA|1A;4|BA|1B;5|BA|1B;10|BA|6B;11|TASMEK|6B;12|TASMEK|6B",
    Jumaat: "3|BA|4B;4|BA|4B"
  },
  "Pn. Yunizah Esun": {
    Isnin: "4|SN|2A;5|SN|2A;7|SN|6A;8|SN|6A;9|MZ|4A;11|SN|2B",
    Selasa: "1|SN|3A;3|SN|3B;4|SN|3B;8|SN|6B;9|SN|6B;11|SN|3B",
    Rabu: "2|SN|6B;3|SN|6B;9|SN|2B;10|SN|2B",
    Khamis: "1|SN|6A;2|SN|6A;4|SN|3A;5|SN|3A;7|PSV|1B;8|PSV|1B;10|MZ|3A",
    Jumaat: "3|SN|2A;4|PSV|5B;5|PSV|5B"
  },
  "Pn. Zuraidah Hj. Marjin": {
    Isnin: "4|BI|5B;5|BI|5B;7|BI|3A;8|BI|3A;10|BI|6B;11|BI|6B",
    Selasa: "3|BI|6B;4|BI|6B;8|BI|5B;9|BI|5B;10|BI|3A;11|BI|3A",
    Rabu: "4|BI|5B;5|BI|5B;9|BI|3A;10|BI|3A",
    Khamis: "1|BI|3A;3|BI|5B;4|BI|5B;8|BI|6B;9|BI|6B",
    Jumaat: "3|BI|6B;4|BI|6B;7|BI|3A;8|BI|3A"
  },
  "Pn. Zurinah Jubidi": {
    Isnin: "4|BI|1A;5|BI|1A;7|BI|1B;8|BI|1B;10|BI|4B;11|BI|4B",
    Selasa: "2|BI|1A;3|BI|1A;7|BI|1B;8|BI|1B;10|BI|4B;11|BI|4B",
    Rabu: "1|BI|1B;2|BI|1B;4|BI|1A;5|BI|1A;9|BI|4B;10|BI|4B",
    Khamis: "4|BI|4B;5|BI|4B;7|BI|1A;8|BI|1A",
    Jumaat: "3|BI|1A;5|BI|1B;7|BI|1B;8|BI|1B"
  },
  "Cik Anizah Anis Dalinsip": {
    Isnin: "7|M3|5B;8|M3|5B",
    Selasa: "4|PM|4A;5|PM|4A;10|M3|5B;11|M3|5B",
    Rabu: "7|PM|4A;8|PM|4A",
    Khamis: "3|PM|4A;4|PM|4A",
    Jumaat: "3|M3|5B"
  }
};

// Pemetaan Guru Mata Pelajaran Mengikut Kelas Berdasarkan PDF Rasmi 2026
const CLASS_SUBJECT_TEACHERS = {
  "1A": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Zurinah Jubidi", "BKD": "Cik Rozeline Francis", "BM": "Pn. Kasmalah Ismail", "M3": "Pn. Anna Octavia Ninteh", "MZ": "Pn. Anna Octavia Ninteh", "PI": "Pn. Mastikahjunaidah Shahrom", "PJ": "En. Rejos Baking", "PK": "En. Rejos Baking", "PM": "Pn. Hamisah Janah", "PSV": "En. Rejos Baking", "SN": "En. Mohd. Hafiz Qayyum Ahmad", "TASMEK": "Pn. Fatimah Daud" },
  "1B": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Zurinah Jubidi", "BM": "En. George Simun", "M3": "Cik Rozie Sumil", "MZ": "Pn. Anna Octavia Ninteh", "PI": "Pn. Mastikahjunaidah Shahrom", "PJ": "En. Amriee Abdullah", "PK": "En. Amriee Abdullah", "PSV": "Pn. Yunizah Esun", "SN": "Pn. Jennet Gindawa", "TASMEK": "Pn. Mastikahjunaidah Shahrom" },
  "2A": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Rohanah Mohd. Soud", "BKD": "Pn. Jennet Gindawa", "BM": "Pn. Kasmalah Ismail", "M3": "En. Duin Lasig", "MZ": "En. Amriee Abdullah", "PI": "Pn. Mastikahjunaidah Shahrom", "PJ": "Cik Rozeline Francis", "PK": "Cik Rozeline Francis", "PM": "En. Amriee Abdullah", "PSV": "Pn. Anidah Samad", "SN": "Pn. Yunizah Esun", "TASMEK": "Pn. Mastikahjunaidah Shahrom" },
  "2B": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Rohanah Mohd. Soud", "BM": "En. George Simun", "M3": "Pn. Anna Octavia Ninteh", "MZ": "En. Amriee Abdullah", "PI": "Pn. Fatimah Daud", "PJ": "Cik Rozeline Francis", "PK": "Cik Rozeline Francis", "PSV": "Pn. Anna Octavia Ninteh", "SN": "Pn. Yunizah Esun", "TASMEK": "Pn. Mastikahjunaidah Shahrom" },
  "3A": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Zuraidah Hj. Marjin", "BKD": "Pn. Jennet Gindawa", "BM": "Pn. Muhayan Diman", "M3": "En. Duin Lasig", "MZ": "Pn. Yunizah Esun", "PI": "En. Muhd. Huzaifah Arman", "PJ": "En. L Asmara Luandim", "PK": "En. L Asmara Luandim", "PM": "Datin Razana Hj. Abd. Wahid", "PSV": "Pn. Muhayan Diman", "SN": "Pn. Yunizah Esun", "TASMEK": "Pn. Fatimah Daud" },
  "3B": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Rohanah Mohd. Soud", "BM": "Pn. Muhayan Diman", "M3": "En. Duin Lasig", "MZ": "En. Rejos Baking", "PI": "En. Muhd. Huzaifah Arman", "PJ": "En. L Asmara Luandim", "PK": "En. L Asmara Luandim", "PSV": "En. L Asmara Luandim", "SN": "Pn. Yunizah Esun", "TASMEK": "Pn. Fatimah Daud" },
  "4A": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Milnah Namih", "BKD": "Cik Rozeline Francis", "BM": "Pn. Anidah Samad", "M3": "Pn. Anna Octavia Ninteh", "MZ": "Pn. Yunizah Esun", "PI": "Pn. Fatimah Daud", "PJ": "En. Amriee Abdullah", "PK": "En. Amriee Abdullah", "PM": "Cik Anizah Anis Dalinsip", "PSV": "Pn. Anidah Samad", "RBT": "Pn. Milnah Namih", "SEJ": "Pn. Kasmalah Ismail", "SN": "En. Mohd. Hafiz Qayyum Ahmad", "TASMEK": "Pn. Salhah Awang Tengah" },
  "4B": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Zurinah Jubidi", "BM": "Pn. Anidah Samad", "M3": "Cik Rozie Sumil", "MZ": "En. Rejos Baking", "PI": "En. Muhd. Huzaifah Arman", "PJ": "En. Rejos Baking", "PK": "En. Rejos Baking", "PSV": "Pn. Anidah Samad", "RBT": "En. Rejos Baking", "SEJ": "Pn. Anidah Samad", "SN": "En. Mohd. Hafiz Qayyum Ahmad", "TASMEK": "En. Muhd. Huzaifah Arman" },
  "5A": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Milnah Namih", "BKD": "Cik Rozeline Francis", "BM": "En. L Asmara Luandim", "M3": "Cik Rozie Sumil", "MZ": "Pn. Jennet Gindawa", "PI": "En. Muhd. Huzaifah Arman", "PJ": "En. Rejos Baking", "PK": "En. Rejos Baking", "PM": "Datin Razana Hj. Abd. Wahid", "PSV": "En. Rejos Baking", "RBT": "En. Mohd. Hafiz Qayyum Ahmad", "SEJ": "En. Amriee Abdullah", "SN": "En. Mohd. Hafiz Qayyum Ahmad", "TASMEK": "En. Muhd. Huzaifah Arman" },
  "5B": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Zuraidah Hj. Marjin", "BM": "Pn. Jamlinah Maliasan", "M3": "Cik Anizah Anis Dalinsip", "MZ": "En. George Simun", "PI": "En. Mudah Hj. Admaim", "PJ": "En. Mohd. Hafiz Qayyum Ahmad", "PK": "En. Mohd. Hafiz Qayyum Ahmad", "PSV": "Pn. Yunizah Esun", "RBT": "En. Mohd. Hafiz Qayyum Ahmad", "SEJ": "En. Amriee Abdullah", "SN": "Pn. Jennet Gindawa", "TASMEK": "En. Muhd. Huzaifah Arman" },
  "6A": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Milnah Namih", "BKD": "Cik Rozeline Francis", "BM": "En. L Asmara Luandim", "M3": "Pn. Anna Octavia Ninteh", "MZ": "En. Rejos Baking", "PI": "Pn. Fatimah Daud", "PJ": "En. Rejos Baking", "PK": "En. Rejos Baking", "PM": "Pn. Hamisah Janah", "PSV": "En. Amriee Abdullah", "RBT": "En. Mohd. Hafiz Qayyum Ahmad", "SEJ": "En. Amriee Abdullah", "SN": "Pn. Yunizah Esun", "TASMEK": "Pn. Fatimah Daud" },
  "6B": { "BA": "Pn. Salhah Awang Tengah", "BI": "Pn. Zuraidah Hj. Marjin", "BM": "Pn. Jamlinah Maliasan", "M3": "Cik Rozie Sumil", "MZ": "En. Rejos Baking", "PI": "Pn. Fatimah Daud", "PJ": "En. Rejos Baking", "PK": "En. Rejos Baking", "PSV": "En. Amriee Abdullah", "RBT": "En. Mohd. Hafiz Qayyum Ahmad", "SEJ": "En. Amriee Abdullah", "SN": "Pn. Yunizah Esun", "TASMEK": "Pn. Salhah Awang Tengah" }
};

// Grid Jadual Waktu Penuh Kelas Mengikut Hari & Slot (Berasaskan PDF Rasmi 2026)
const CLASS_TIMETABLES = {
  "1A": {
    "Isnin": [ "2|BM", "3|BM", "4|BI", "5|BI", "7|M3", "8|M3", "9|SN", "10|SN", "11|BM" ],
    "Selasa": [ "1|PJ", "2|BI", "3|BI", "4|SN", "5|BM", "7|BM", "8|BM", "9|PK", "10|PI", "10|PM", "11|PI", "11|PM" ],
    "Rabu": [ "1|BM", "2|BM", "3|MZ", "4|BI", "5|BI", "7|M3", "8|M3", "9|PI", "9|PM", "10|PI", "10|PM" ],
    "Khamis": [ "1|BA", "1|BKD", "2|BA", "2|BKD", "3|PJ", "4|BM", "5|BM", "7|BI", "8|BI", "9|PSV", "10|PSV", "11|TASMEK", "12|TASMEK" ],
    "Jumaat": [ "1|PI", "1|PM", "2|PI", "2|PM", "3|BI", "4|M3", "5|M3", "7|BM", "8|BM" ]
  },
  "1B": {
    "Isnin": [ "2|BM", "3|BM", "4|BM", "5|MZ", "7|BI", "8|BI", "9|PK", "10|M3", "11|M3" ],
    "Selasa": [ "1|BM", "2|PI", "3|PI", "4|M3", "5|M3", "7|BI", "8|BI", "9|SN", "10|BM", "11|BM" ],
    "Rabu": [ "1|BI", "2|BI", "3|PI", "4|PI", "5|PJ", "7|BM", "8|BM", "9|M3", "10|M3" ],
    "Khamis": [ "1|PJ", "2|PI", "3|PI", "4|BA", "5|BA", "7|PSV", "8|PSV", "9|BM", "10|BM", "11|TASMEK", "12|TASMEK" ],
    "Jumaat": [ "1|BM", "2|BM", "3|SN", "4|SN", "5|BI", "7|BI", "8|BI" ]
  },
  "2A": {
    "Isnin": [ "2|BI", "3|BI", "4|SN", "5|SN", "7|MZ", "8|BM", "9|BM", "10|PI", "10|PM", "11|PI", "11|PM", "12|TASMEK", "13|TASMEK" ],
    "Selasa": [ "1|BM", "2|BM", "3|M3", "4|M3", "5|PJ", "7|PI", "7|PM", "8|PI", "8|PM", "9|BM", "10|BI", "11|BI" ],
    "Rabu": [ "1|BI", "2|BI", "3|PJ", "4|BM", "5|BM", "7|BM", "8|BA", "8|BKD", "9|BA", "9|BKD", "10|BI" ],
    "Khamis": [ "1|BI", "2|BI", "3|PK", "4|M3", "5|M3", "7|BM", "8|BM", "9|PI", "9|PM", "10|PI", "10|PM" ],
    "Jumaat": [ "1|BM", "2|BM", "3|SN", "4|PSV", "5|PSV", "7|M3", "8|M3" ]
  },
  "2B": {
    "Isnin": [ "2|M3", "3|M3", "4|PI", "5|PI", "7|BI", "8|BI", "9|BM", "10|BM", "11|SN" ],
    "Selasa": [ "1|BI", "2|BI", "3|PJ", "4|BM", "5|BM", "7|PI", "8|PI", "9|BM", "10|M3", "11|M3" ],
    "Rabu": [ "1|BM", "2|BM", "3|BA", "4|BA", "5|PJ", "7|BI", "8|BI", "9|SN", "10|SN", "11|TASMEK", "12|TASMEK" ],
    "Khamis": [ "1|BM", "2|BM", "3|MZ", "4|PSV", "5|PSV", "7|BI", "8|BI", "9|M3", "10|M3" ],
    "Jumaat": [ "1|PI", "2|PI", "3|PK", "4|BM", "5|BM", "7|BM", "8|BI" ]
  },
  "3A": {
    "Isnin": [ "2|BM", "3|BM", "4|BA", "4|BKD", "5|BA", "5|BKD", "7|BI", "8|BI", "9|BM", "10|M3", "11|M3" ],
    "Selasa": [ "1|SN", "2|BM", "3|BM", "4|PI", "4|PM", "5|PI", "5|PM", "7|BM", "8|M3", "9|M3", "10|BI", "11|BI", "12|TASMEK", "13|TASMEK" ],
    "Rabu": [ "1|PJ", "2|M3", "3|M3", "4|BM", "5|BM", "7|PI", "7|PM", "8|PI", "8|PM", "9|BI", "10|BI" ],
    "Khamis": [ "1|BI", "2|BM", "3|BM", "4|SN", "5|SN", "7|PI", "7|PM", "8|PI", "8|PM", "9|PK", "10|MZ" ],
    "Jumaat": [ "1|PSV", "2|PSV", "3|PJ", "4|BM", "5|BM", "7|BI", "8|BI" ]
  },
  "3B": {
    "Isnin": [ "2|PI", "3|PI", "4|M3", "5|M3", "7|BM", "8|BM", "9|MZ", "10|BI", "11|BI" ],
    "Selasa": [ "1|BA", "2|BA", "3|SN", "4|SN", "5|PK", "7|BI", "8|BI", "9|BM", "10|BM", "11|SN" ],
    "Rabu": [ "1|BM", "2|BM", "3|PJ", "4|BI", "5|BI", "7|M3", "8|M3", "9|BM", "10|BM", "11|TASMEK", "12|TASMEK" ],
    "Khamis": [ "1|PSV", "2|PSV", "3|PI", "4|PI", "5|BI", "7|BM", "8|BM", "9|M3", "10|M3" ],
    "Jumaat": [ "1|PI", "2|PI", "3|BI", "4|BI", "5|PJ", "7|BM", "8|BM" ]
  },
  "4A": {
    "Isnin": [ "2|BM", "3|BM", "4|SN", "5|SN", "7|BI", "8|BI", "9|MZ", "10|M3", "11|M3" ],
    "Selasa": [ "1|BM", "2|BM", "3|M3", "4|PI", "4|PM", "5|PI", "5|PM", "7|BI", "8|BI", "9|PK", "10|BA", "10|BKD", "11|BA", "11|BKD" ],
    "Rabu": [ "1|BI", "2|BI", "3|PJ", "4|BM", "5|BM", "7|PI", "7|PM", "8|PI", "8|PM", "9|SEJ", "10|SEJ", "11|TASMEK", "12|TASMEK" ],
    "Khamis": [ "1|M3", "2|M3", "3|PI", "3|PM", "4|PI", "4|PM", "5|BM", "7|BM", "8|BM", "9|SN", "10|SN" ],
    "Jumaat": [ "1|PSV", "2|PSV", "3|PJ", "4|BI", "5|BI", "7|RBT", "8|RBT" ]
  },
  "4B": {
    "Isnin": [ "2|M3", "3|M3", "4|RBT", "5|RBT", "7|PI", "8|BM", "9|BM", "10|BI", "11|BI", "12|TASMEK", "13|TASMEK" ],
    "Selasa": [ "1|SN", "2|SN", "3|PJ", "4|BM", "5|BM", "7|MZ", "8|PI", "9|PI", "10|BI", "11|BI" ],
    "Rabu": [ "1|BM", "2|BM", "3|PJ", "4|PI", "5|PI", "7|SEJ", "8|SEJ", "9|BI", "10|BI" ],
    "Khamis": [ "1|PI", "2|PSV", "3|PSV", "4|BI", "5|BI", "7|PK", "8|M3", "9|M3", "10|BM" ],
    "Jumaat": [ "1|SN", "2|SN", "3|BA", "4|BA", "5|M3", "7|BM", "8|BM" ]
  },
  "5A": {
    "Isnin": [ "2|PSV", "3|PSV", "4|BM", "5|BM", "7|BM", "8|PI", "8|PM", "9|PI", "9|PM", "10|BA", "10|BKD", "11|BA", "11|BKD" ],
    "Selasa": [ "1|PI", "1|PM", "2|PI", "2|PM", "3|SEJ", "4|BI", "5|BI", "7|M3", "8|M3", "9|BM", "10|BM", "11|PK" ],
    "Rabu": [ "1|SN", "2|SN", "3|M3", "4|M3", "5|PJ", "7|BI", "8|BI", "9|BM", "10|BM" ],
    "Khamis": [ "1|M3", "2|RBT", "3|RBT", "4|BM", "5|BM", "7|SEJ", "8|MZ", "9|BI", "10|BI", "11|TASMEK", "12|TASMEK" ],
    "Jumaat": [ "1|PJ", "2|BI", "3|BI", "4|PI", "4|PM", "5|PI", "5|PM", "7|SN", "8|SN" ]
  },
  "5B": {
    "Isnin": [ "2|BM", "3|PK", "4|BI", "5|BI", "7|M3", "8|M3", "9|PI", "10|BM", "11|BM" ],
    "Selasa": [ "1|BM", "2|BM", "3|PI", "4|BA", "5|BA", "7|SN", "8|BI", "9|BI", "10|M3", "11|M3" ],
    "Rabu": [ "1|BM", "2|BM", "3|PJ", "4|BI", "5|BI", "7|PI", "8|PI", "9|RBT", "10|RBT", "11|TASMEK", "12|TASMEK" ],
    "Khamis": [ "1|SN", "2|SN", "3|BI", "4|BI", "5|PJ", "7|MZ", "8|PI", "9|PI", "10|SN" ],
    "Jumaat": [ "1|BM", "2|BM", "3|M3", "4|PSV", "5|PSV", "7|SEJ", "8|SEJ" ]
  },
  "6A": {
    "Isnin": [ "2|BA", "2|BKD", "3|BI", "4|BI", "5|SEJ", "7|SN", "8|SN", "9|BM", "10|BM", "11|PI", "11|PM", "12|TASMEK", "13|TASMEK" ],
    "Selasa": [ "1|BI", "2|BI", "3|BM", "4|BM", "5|SEJ", "7|M3", "8|M3", "9|RBT", "10|RBT", "11|BM" ],
    "Rabu": [ "1|PSV", "2|PSV", "3|PI", "3|PM", "4|BI", "5|BI", "7|PK", "8|MZ", "9|M3", "10|BA", "10|BKD" ],
    "Khamis": [ "1|SN", "2|SN", "3|BI", "4|BI", "5|PJ", "7|BM", "8|BM", "9|PI", "9|PM", "10|PI", "10|PM" ],
    "Jumaat": [ "1|M3", "2|M3", "3|PJ", "4|PI", "4|PM", "5|PI", "5|PM", "7|BM", "8|BM" ]
  },
  "6B": {
    "Isnin": [ "2|SEJ", "3|SEJ", "4|BM", "5|BM", "7|PK", "8|PI", "9|PI", "10|BI", "11|BI" ],
    "Selasa": [ "1|M3", "2|M3", "3|BI", "4|BI", "5|PJ", "7|RBT", "8|SN", "9|SN", "10|PI", "11|PI" ],
    "Rabu": [ "1|PJ", "2|SN", "3|SN", "4|BM", "5|BM", "7|BA", "8|M3", "9|MZ", "10|PI" ],
    "Khamis": [ "1|BM", "2|BM", "3|M3", "4|M3", "5|PI", "7|RBT", "8|BI", "9|BI", "10|BA", "11|TASMEK", "12|TASMEK" ],
    "Jumaat": [ "1|PSV", "2|PSV", "3|BI", "4|BI", "5|BM", "7|BM", "8|BM" ]
  }
};

// Bina Jadual Waktu Penuh Guru (TIMETABLE)
const TIMETABLE = {};
MASTER_TEACHERS.forEach(guru => { TIMETABLE[guru] = {}; });

Object.entries(JADUAL_INDIVIDU_GURU).forEach(([guru, days]) => {
  if (!TIMETABLE[guru]) TIMETABLE[guru] = {};
  Object.entries(days).forEach(([hari, raw]) => {
    if (!raw) return;
    TIMETABLE[guru][hari] = raw.split(";").map(item => {
      const [slot, subjek, kelas] = item.split("|");
      return [STANDARD_SLOTS[Number(slot)] || slot, subjek, kelas];
    }).filter(([, subjek, kelas]) => subjek && kelas && subjek !== "PH" && subjek !== "SEMAI");
  });
});

// Penjana Maklumat Slot Jadual Kelas Berdasarkan PDF Rasmi
function getClassTimetableSlot(kelas, hari, slotIndex) {
  if (slotIndex === 6) return null; // Waktu rehat sekolah (9.40-10.10)

  const classData = CLASS_TIMETABLES[kelas] && CLASS_TIMETABLES[kelas][hari];
  if (!classData) return null;

  const matches = classData.filter(item => {
    const [s] = item.split("|");
    return Number(s) === slotIndex;
  });

  if (!matches.length) return null;

  const teachers = [];
  const subjects = [];
  matches.forEach(m => {
    const [, subjek] = m.split("|");
    const guru = CLASS_SUBJECT_TEACHERS[kelas] && CLASS_SUBJECT_TEACHERS[kelas][subjek];
    if (guru) {
      teachers.push(guru);
      subjects.push(subjek);
    }
  });

  if (!teachers.length) return null;

  return {
    guru: teachers.join(" / "),
    subjek: subjects.join(" / "),
    guruList: teachers
  };
}

// Dapatkan Guru Mata Pelajaran Bagi Slot Kelas Tertentu
function getTeacherForSlot(kelas, hari, slotIndex) {
  const slotInfo = getClassTimetableSlot(kelas, hari, slotIndex);
  return slotInfo ? slotInfo.guru : null;
}

// Pemetaan Pasangan Mata Pelajaran Serentak (Pendidikan Islam / Moral & Bahasa Arab / Kadazandusun)
const CONCURRENT_SUBJECT_PAIRS = {
  "PI": "PM",
  "PM": "PI",
  "BA": "BKD",
  "BKD": "BA"
};

// Dapatkan Maklumat Guru Pasangan Serentak (Cantum Kelas)
function getConcurrentPartnerInfo(kelas, hari, masaVal, subjek, absentTeachers = []) {
  if (!kelas || !hari || !masaVal || !subjek) return null;

  const sClean = subjek.trim().toUpperCase();
  const targetSubjek = CONCURRENT_SUBJECT_PAIRS[sClean];
  if (!targetSubjek) return null;

  // Cari indeks slot standard (0-13)
  let slotIndex = STANDARD_SLOTS.indexOf(masaVal.trim());
  if (slotIndex < 0) {
    slotIndex = STANDARD_SLOTS.findIndex(s => s.replace(/\s/g, '') === masaVal.trim().replace(/\s/g, ''));
  }
  if (slotIndex < 0) return null;

  // Semak jadual kelas untuk mengesahkan pasangan serentak wujud pada slot masa ini
  const classData = CLASS_TIMETABLES[kelas] && CLASS_TIMETABLES[kelas][hari];
  if (!classData) return null;

  const hasTargetSlot = classData.some(item => {
    const [s, subj] = item.split("|");
    return Number(s) === slotIndex && subj === targetSubjek;
  });
  if (!hasTargetSlot) return null;

  // Dapatkan nama guru bagi targetSubjek dalam kelas ini
  const partnerTeacher = CLASS_SUBJECT_TEACHERS[kelas] && CLASS_SUBJECT_TEACHERS[kelas][targetSubjek];
  if (!partnerTeacher) return null;

  // Jika guru pasangan serentak ini juga tidak hadir pada hari berkenaan, jangan cadangkan
  if (absentTeachers && absentTeachers.includes(partnerTeacher)) {
    return null;
  }

  return {
    nama: partnerTeacher,
    subjekAsal: sClean,
    partnerSubjek: targetSubjek,
    kelas: kelas,
    hari: hari,
    masa: masaVal,
    slotIndex: slotIndex,
    status: "Pasangan Serentak (Cantum Kelas)",
    boleh: true
  };
}

// Senarai Nombor Telefon Rasmi Guru SK Tampasuk 1 (Boleh Dikemaskini Dalam Sistem & Disimpan ke LocalStorage)
const DEFAULT_TEACHER_PHONES = {
  // 1. En. Muhd. Huzaifah Arman : +601140389493
  "En. Muhd. Huzaifah Arman": "+601140389493",

  // 2. Pn. Anna Octavia Ninteh : +60198424965
  "Pn. Anna Octavia Ninteh": "+60198424965",

  // 3. En. Duin Lasig : +60197131006
  "En. Duin Lasig": "+60197131006",

  // 4. En. Amriee Abdullah : +60105079927
  "En. Amriee Abdullah": "+60105079927",

  // 5. En. Anidah Samad : +60168482358
  "Pn. Anidah Samad": "+60168482358",
  "En. Anidah Samad": "+60168482358",

  // 6. En. George Simun : +601127549127
  "En. George Simun": "+601127549127",

  // 7. En. Mohd. Hafiz Qayyum : +60145902301
  "En. Mohd. Hafiz Qayyum Ahmad": "+60145902301",
  "En. Mohd. Hafiz Qayyum": "+60145902301",

  // 8. Cik Rozeline Francis : +601131680157
  "Cik Rozeline Francis": "+601131680157",

  // 9. Pn. Hamisah Janah : +60168308423
  "Pn. Hamisah Janah": "+60168308423",

  // 10. Pn. Jennet Gindawa : +60128161068
  "Pn. Jennet Gindawa": "+60128161068",

  // 11. Pn. Kasmalah Ismail : +60198714410
  "Pn. Kasmalah Ismail": "+60198714410",

  // 12. En. L Asmara Luandim : +60198517764
  "En. L Asmara Luandim": "+60198517764",

  // 13. En. Mudah Hj. Admaim : +60195355368
  "En. Mudah Hj. Admaim": "+60195355368",

  // 14. Pn. Muhayan Diman : +60165096673
  "Pn. Muhayan Diman": "+60165096673",

  // 15. En. Rejos Baking : +60165829206
  "En. Rejos Baking": "+60165829206",

  // 16. Pn. Rozie Sumil : +01126855241 (+601126855241)
  "Cik Rozie Sumil": "+601126855241",
  "Pn. Rozie Sumil": "+601126855241",

  // 17. Cik Syahfirah Arjaman : +60146708832 (Guru UBK)
  "Cik Syahfirah Arjaman": "+60146708832",
  "Cik Nurul Syahfirah Arjaman": "+60146708832",

  // 18. Datin Razanah Abdul Wahid : +60169861195
  "Datin Razana Hj. Abd. Wahid": "+60169861195",
  "Datin Razanah Abdul Wahid": "+60169861195",

  // 19. Pn. Yunizah Esun : +60168253967
  "Pn. Yunizah Esun": "+60168253967",

  // 20. En. Rohanah Mohd. Soud : +60195831818
  "Pn. Rohanah Mohd. Soud": "+60195831818",
  "En. Rohanah Mohd. Soud": "+60195831818",

  // 21. Pn. Mastikajunaidah Shahrom : +60198121280
  "Pn. Mastikahjunaidah Shahrom": "+60198121280",
  "Pn. Mastikajunaidah Shahrom": "+60198121280",

  // 22. Pn. Jamlinah Maliasan : +601117979938
  "Pn. Jamlinah Maliasan": "+601117979938",

  // 23. Pn. Milnah Namih : +60138714890
  "Pn. Milnah Namih": "+60138714890",

  // 24. Pn. Zurinah Jubidi : +60138962255
  "Pn. Zurinah Jubidi": "+60138962255",

  // 25. Pn. Fatimah Daud : +60105817052
  "Pn. Fatimah Daud": "+60105817052",

  // 26. Pn. Salhah Awang Tengah : +60135008384
  "Pn. Salhah Awang Tengah": "+60135008384",

  // 27. Pn. Cecilia Mouintin : +60166794345 (Guru UBK)
  "Pn. Cecilia Mouintin": "+60166794345",
  "Pn. Cecelia Mouintin": "+60166794345",

  // Guru UBK Default (Cik Syahfirah Arjaman)
  "Guru UBK": "+60146708832",

  // Guru Simpanan Tambahan
  "Pn. Zuraidah Hj. Marjin": "+60198714410",
  "Cik Anizah Anis Dalinsip": "+601131680157"
};

// Pilihan Pegawai UBK Rasmi SK Tampasuk 1
const UBK_TEACHER_OFFICERS = [
  { name: "Cik Syahfirah Arjaman", label: "Cik Syahfirah Arjaman", phone: "+60146708832" },
  { name: "Pn. Cecilia Mouintin", label: "Pn. Cecilia Mouintin", phone: "+60166794345" }
];


