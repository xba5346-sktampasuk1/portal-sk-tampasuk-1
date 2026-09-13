/**
 * Portal Bersepadu Sekolah Kebangsaan Tampasuk 1, Kota Belud, Sabah
 * Enjin Aplikasi & Logik Interaktif (Portal App)
 * Domain Utama: sktampasuk1.edu.my
 */

document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi Ikon Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // State Pengurusan Portal
  const state = {
    currentTab: "utama",
    searchQuery: "",
    takwimFilter: "Semua",
    downloadsFilter: "Semua",
    newsFilter: "Semua",
    teacherGroupFilter: "Semua"
  };

  // 1. PENGENDALI TEMA (DARK / LIGHT MODE)
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem("skt1-portal-theme") || "light";
  if (savedTheme === "dark") {
    htmlEl.classList.add("dark");
  } else {
    htmlEl.classList.remove("dark");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = htmlEl.classList.toggle("dark");
      localStorage.setItem("skt1-portal-theme", isDark ? "dark" : "light");
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // 2. NAVIGASI TAB UTAMA
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const tabContents = document.querySelectorAll(".portal-tab-content");

  function switchTab(targetTabId) {
    state.currentTab = targetTabId;

    tabButtons.forEach(btn => {
      if (btn.getAttribute("data-tab-target") === targetTabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    tabContents.forEach(content => {
      if (content.id === `tab-${targetTabId}`) {
        content.classList.remove("hidden");
        content.classList.add("fade-in");
      } else {
        content.classList.add("hidden");
        content.classList.remove("fade-in");
      }
    });

    // Tutup carian jika bertukar tab biasa
    const searchResultsContainer = document.getElementById("search-results-section");
    if (searchResultsContainer) {
      searchResultsContainer.classList.add("hidden");
    }

    // Scroll ke atas dengan lancar jika di luar hero
    const mainAnchor = document.getElementById("main-content-anchor");
    if (mainAnchor && window.scrollY > 400) {
      mainAnchor.scrollIntoView({ behavior: "smooth" });
    }

    // Refresh icon
    if (window.lucide) window.lucide.createIcons();
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab-target");
      switchTab(target);
      // Tutup menu mudah alih jika terbuka
      closeMobileMenu();
    });
  });

  // Semak Hash URL pada permulaan (cth: #pentadbiran, #kurikulum)
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && document.getElementById(`tab-${initialHash}`)) {
    switchTab(initialHash);
  }

  // 3. MENU MUDAH ALIH (MOBILE DRAWER)
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobileDrawerClose = document.getElementById("mobile-drawer-close");

  function openMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.remove("hidden");
  }

  function closeMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.add("hidden");
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openMobileMenu);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener("click", closeMobileMenu);

  // 4. SISTEM CARIAN PINTAR MASA NYATA (LIVE SEARCH)
  const globalSearchInput = document.getElementById("global-search-input");
  const searchResultsSection = document.getElementById("search-results-section");
  const searchResultsList = document.getElementById("search-results-list");
  const searchResultsCount = document.getElementById("search-results-count");
  const searchClearBtn = document.getElementById("search-clear-btn");

  function executeSearch(query) {
    const q = query.trim().toLowerCase();
    state.searchQuery = q;

    if (!q) {
      if (searchResultsSection) searchResultsSection.classList.add("hidden");
      switchTab(state.currentTab);
      return;
    }

    // Sembunyikan semua tab semasa melihat hasil carian
    tabContents.forEach(c => c.classList.add("hidden"));
    if (searchResultsSection) searchResultsSection.classList.remove("hidden");

    const results = [];

    // Cari Sistem Utama Sekolah & KPM (e-Guru Ganti, e-OPR, DELIMa, dll.)
    SCHOOL_DATA.pentadbiran.quickSystems.forEach(sys => {
      if (
        sys.name.toLowerCase().includes(q) ||
        sys.desc.toLowerCase().includes(q) ||
        (q === "opr" && sys.name.toLowerCase().includes("opr")) ||
        (q === "laporan" && sys.desc.toLowerCase().includes("laporan"))
      ) {
        results.push({
          type: "Sistem Digital Sekolah",
          badge: "bg-blue-600 text-white",
          title: sys.name,
          subtitle: sys.badge,
          detail: sys.desc,
          actionText: "Buka Sistem",
          onAction: () => window.open(sys.url, "_blank")
        });
      }
    });

    // Cari Guru
    SCHOOL_DATA.teachers.forEach(t => {
      if (
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.mainSubject.toLowerCase().includes(q) ||
        t.uniform.toLowerCase().includes(q) ||
        t.club.toLowerCase().includes(q) ||
        t.sport.toLowerCase().includes(q)
      ) {
        results.push({
          type: "Guru & Staf",
          badge: "bg-blue-600 text-white",
          title: t.name,
          subtitle: `${t.role} • ${t.mainSubject}`,
          detail: `Kumpulan: ${t.group} | Unit: ${t.uniform}, ${t.club}, ${t.sport}`,
          actionText: "Lihat Profil Guru",
          onAction: () => openTeacherModal(t.id)
        });
      }
    });

    // Cari Panitia Kurikulum
    SCHOOL_DATA.kurikulum.panitia.forEach(p => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.head.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.activities.some(a => a.toLowerCase().includes(q))
      ) {
        results.push({
          type: "Kurikulum & Panitia",
          badge: "bg-emerald-600 text-white",
          title: p.name,
          subtitle: `Ketua Panitia: ${p.head} (${p.code})`,
          detail: p.activities.join(" • "),
          actionText: "Buka Tab Kurikulum",
          onAction: () => {
            switchTab("kurikulum");
            const el = document.getElementById(`panitia-${p.code}`);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    });

    // Cari Unit HEM
    SCHOOL_DATA.hem.units.forEach(u => {
      if (
        u.name.toLowerCase().includes(q) ||
        u.head.toLowerCase().includes(q) ||
        u.desc.toLowerCase().includes(q) ||
        u.highlights.some(h => h.toLowerCase().includes(q))
      ) {
        results.push({
          type: "Hal Ehwal Murid (HEM)",
          badge: "bg-purple-600 text-white",
          title: u.name,
          subtitle: `Penyelaras: ${u.head}`,
          detail: u.highlights.join(" • "),
          actionText: "Buka Tab HEM",
          onAction: () => {
            switchTab("hem");
            const el = document.getElementById(`hem-unit-${u.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    });

    // Cari Kokurikulum (Uniform, Kelab, Sukan)
    SCHOOL_DATA.kokurikulum.uniform.forEach(un => {
      if (un.name.toLowerCase().includes(q) || un.leader.toLowerCase().includes(q) || un.desc.toLowerCase().includes(q)) {
        results.push({
          type: "Kokurikulum - Badan Beruniform",
          badge: "bg-teal-600 text-white",
          title: un.name,
          subtitle: `Ketua Penasihat: ${un.leader}`,
          detail: un.desc,
          actionText: "Buka Tab Kokurikulum",
          onAction: () => switchTab("kokurikulum")
        });
      }
    });

    SCHOOL_DATA.kokurikulum.clubs.forEach(cl => {
      if (cl.name.toLowerCase().includes(q) || cl.leader.toLowerCase().includes(q) || cl.desc.toLowerCase().includes(q)) {
        results.push({
          type: "Kokurikulum - Kelab & Persatuan",
          badge: "bg-teal-600 text-white",
          title: cl.name,
          subtitle: `Ketua Penasihat: ${cl.leader}`,
          detail: cl.desc,
          actionText: "Buka Tab Kokurikulum",
          onAction: () => switchTab("kokurikulum")
        });
      }
    });

    SCHOOL_DATA.kokurikulum.sports.forEach(sp => {
      if (sp.name.toLowerCase().includes(q) || sp.coach.toLowerCase().includes(q) || sp.desc.toLowerCase().includes(q)) {
        results.push({
          type: "Kokurikulum - Sukan & Permainan",
          badge: "bg-teal-600 text-white",
          title: sp.name,
          subtitle: `Jurulatih: ${sp.coach}`,
          detail: sp.desc,
          actionText: "Buka Tab Kokurikulum",
          onAction: () => switchTab("kokurikulum")
        });
      }
    });

    // Cari Takwim
    SCHOOL_DATA.takwim.forEach(tk => {
      if (
        tk.title.toLowerCase().includes(q) ||
        tk.desc.toLowerCase().includes(q) ||
        tk.category.toLowerCase().includes(q) ||
        tk.date.toLowerCase().includes(q)
      ) {
        results.push({
          type: `Takwim (${tk.category})`,
          badge: "bg-amber-600 text-white",
          title: tk.title,
          subtitle: `Tarikh: ${tk.date}`,
          detail: tk.desc,
          actionText: "Buka Kalendar Takwim",
          onAction: () => switchTab("takwim")
        });
      }
    });

    // Cari Dokumen Muat Turun
    SCHOOL_DATA.downloads.forEach(dl => {
      if (dl.title.toLowerCase().includes(q) || dl.desc.toLowerCase().includes(q) || dl.category.toLowerCase().includes(q)) {
        results.push({
          type: `Muat Turun (${dl.format})`,
          badge: "bg-rose-600 text-white",
          title: dl.title,
          subtitle: `Kategori: ${dl.category} • Saiz: ${dl.size}`,
          detail: dl.desc,
          actionText: "Buka Pusat Muat Turun",
          onAction: () => switchTab("muatturun")
        });
      }
    });

    // Render Hasil Carian
    renderSearchResults(results, q);
  }

  function renderSearchResults(results, query) {
    if (!searchResultsList || !searchResultsCount) return;

    searchResultsCount.textContent = `${results.length} padanan ditemui untuk "${query}"`;

    if (results.length === 0) {
      searchResultsList.innerHTML = `
        <div class="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
            <i data-lucide="search-x" class="w-8 h-8"></i>
          </div>
          <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100">Tiada Maklumat Ditemui</h4>
          <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-1">
            Cuba cari menggunakan kata kunci lain seperti nama guru, 'Sains', 'Pengakap', 'RMT', atau 'Jadual'.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    searchResultsList.innerHTML = results.map((r, idx) => `
      <div class="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-blue-600">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="status-chip ${r.badge}">${r.type}</span>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">${r.title}</h4>
          <p class="text-xs font-semibold text-blue-600 dark:text-blue-400">${r.subtitle}</p>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">${r.detail}</p>
        </div>
        <div>
          <button class="search-action-btn btn-primary text-xs py-2 px-4 whitespace-nowrap" data-result-idx="${idx}">
            ${r.actionText} <i data-lucide="arrow-right" class="w-3.5 h-3.5 inline"></i>
          </button>
        </div>
      </div>
    `).join("");

    // Sambung event klik pada butang hasil carian
    document.querySelectorAll(".search-action-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-result-idx"), 10);
        if (results[idx] && results[idx].onAction) {
          results[idx].onAction();
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  if (globalSearchInput) {
    let debounceTimeout;
    globalSearchInput.addEventListener("input", e => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        executeSearch(e.target.value);
      }, 200);
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      if (globalSearchInput) globalSearchInput.value = "";
      executeSearch("");
    });
  }

  // 5. RENDERING MODAL DETAIL (POPUP GURU, UNIT, BERITA)
  const modalOverlay = document.getElementById("portal-modal-overlay");
  const modalContainer = document.getElementById("portal-modal-container");
  const modalCloseBtn = document.getElementById("portal-modal-close");

  function openModal(contentHtml) {
    if (!modalOverlay || !modalContainer) return;
    modalContainer.innerHTML = contentHtml;
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    if (window.lucide) window.lucide.createIcons();
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", e => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Buka Profil Guru
  window.openTeacherModal = function (teacherId) {
    const teacher = SCHOOL_DATA.teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const initial = teacher.name.replace(/^(En\.|Pn\.|Cik|Datin)\s*/, "").charAt(0);
    const content = `
      <div class="p-6 md:p-8">
        <div class="flex items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-4">
            <div class="guru-avatar-circle" style="background-color: ${teacher.palette.bg}; color: ${teacher.palette.text}; border: 2px solid ${teacher.palette.border};">
              ${initial}
            </div>
            <div>
              <span class="status-chip bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 mb-1">
                ${teacher.role}
              </span>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">${teacher.name}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">SK Tampasuk 1 Kota Belud, Sabah</p>
            </div>
          </div>
          <button onclick="document.getElementById('portal-modal-close').click()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mata Pelajaran Utama</span>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <i data-lucide="book" class="w-4 h-4 text-blue-600"></i> ${teacher.mainSubject}
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Kumpulan Bertugas Mingguan</span>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-amber-600"></i> ${teacher.group}
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Badan Beruniform</span>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <i data-lucide="shield" class="w-4 h-4 text-emerald-600"></i> ${teacher.uniform}
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Kelab & Sukan</span>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <i data-lucide="award" class="w-4 h-4 text-purple-600"></i> ${teacher.club} • ${teacher.sport}
            </p>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <i data-lucide="mail" class="w-5 h-5 text-blue-600"></i>
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Emel DELIMa Rasmi:</span>
              <span class="text-xs md:text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 select-all">${teacher.email}</span>
            </div>
          </div>
          <button onclick="navigator.clipboard.writeText('${teacher.email}'); alert('Emel ${teacher.name} telah disalin ke papan klip!');" class="btn-primary text-xs py-1.5 px-3">
            Salin
          </button>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3">
          <a href="${SCHOOL_DATA.info.systemGuruGantiUrl}" target="_blank" class="btn-outline text-xs">
            <i data-lucide="calendar-clock" class="w-4 h-4"></i> Semak e-Guru Ganti
          </a>
          <button onclick="document.getElementById('portal-modal-close').click()" class="btn-primary text-xs">
            Tutup
          </button>
        </div>
      </div>
    `;
    openModal(content);
  };

  // Buka Berita Lengkap
  window.openNewsModal = function (newsId) {
    const item = SCHOOL_DATA.news.find(n => n.id === newsId);
    if (!item) return;

    const content = `
      <div class="p-6 md:p-8">
        <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <span class="status-chip ${item.tagColor} mb-2">${item.category}</span>
            <h3 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">${item.title}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${item.date} • Oleh: ${item.author}
            </p>
          </div>
          <button onclick="document.getElementById('portal-modal-close').click()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <div class="py-6 text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
          <div class="p-4 bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600 rounded-r-xl font-medium text-blue-900 dark:text-blue-200">
            ${item.summary}
          </div>
          <p>${item.content}</p>
        </div>

        <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onclick="document.getElementById('portal-modal-close').click()" class="btn-primary text-xs">
            Tutup
          </button>
        </div>
      </div>
    `;
    openModal(content);
  };

  // 6. POPULASI DATA KE DALAM ELEMEN UI
  // 6.1 Senarai 26 Guru di Tab Pentadbiran
  function populateTeachersList(filterGroup = "Semua") {
    const container = document.getElementById("teachers-grid-container");
    if (!container) return;

    const list = filterGroup === "Semua" 
      ? SCHOOL_DATA.teachers 
      : SCHOOL_DATA.teachers.filter(t => t.group === filterGroup);

    container.innerHTML = list.map(t => {
      const initial = t.name.replace(/^(En\.|Pn\.|Cik|Datin)\s*/, "").charAt(0);
      return `
        <div class="guru-card p-5 cursor-pointer flex flex-col justify-between" onclick="openTeacherModal('${t.id}')">
          <div>
            <div class="flex items-center gap-3.5 mb-3">
              <div class="guru-avatar-circle flex-shrink-0" style="background-color: ${t.palette.bg}; color: ${t.palette.text}; border: 2px solid ${t.palette.border};">
                ${initial}
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate" title="${t.name}">${t.name}</h4>
                <p class="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">${t.role}</p>
                <span class="inline-block text-[10px] font-semibold px-2 py-0.5 mt-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  ${t.group}
                </span>
              </div>
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-1.5 truncate">
                <i data-lucide="book-open" class="w-3.5 h-3.5 text-blue-500"></i> ${t.mainSubject}
              </div>
              <div class="flex items-center gap-1.5 truncate">
                <i data-lucide="shield" class="w-3.5 h-3.5 text-emerald-500"></i> ${t.uniform}
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
            <span>Lihat Profil</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // Filter Kumpulan Guru
  const groupFilterBtns = document.querySelectorAll("[data-group-filter]");
  groupFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      groupFilterBtns.forEach(b => b.classList.remove("active", "bg-blue-600", "text-white"));
      btn.classList.add("active", "bg-blue-600", "text-white");
      const grp = btn.getAttribute("data-group-filter");
      populateTeachersList(grp);
    });
  });

  // 6.2 Senarai Panitia Kurikulum
  function populateKurikulumPanitia() {
    const container = document.getElementById("kurikulum-panitia-container");
    if (!container) return;

    container.innerHTML = SCHOOL_DATA.kurikulum.panitia.map(p => `
      <div id="panitia-${p.code}" class="glass-card p-6 border-t-4 ${p.color.split(' ')[0]}">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <span class="status-chip ${p.tagColor} mb-2">${p.code}</span>
            <h4 class="text-lg font-bold text-slate-900 dark:text-white">${p.name}</h4>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-blue-600">
            <i data-lucide="${p.icon}" class="w-5 h-5"></i>
          </div>
        </div>

        <p class="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
          Ketua Panitia: ${p.head}
        </p>
        <p class="text-xs text-slate-600 dark:text-slate-300 italic mb-4">
          "${p.vision}"
        </p>

        <div class="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-700">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Inisiatif & Program:</span>
          ${p.activities.map(a => `
            <div class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0"></i>
              <span>${a}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // 6.3 Senarai Unit HEM
  function populateHEMUnits() {
    const container = document.getElementById("hem-units-container");
    if (!container) return;

    container.innerHTML = SCHOOL_DATA.hem.units.map(u => `
      <div id="hem-unit-${u.id}" class="glass-card p-6 border-t-4 ${u.color.split(' ')[0]}">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <span class="status-chip ${u.tagColor} mb-2">${u.badge}</span>
            <h4 class="text-lg font-bold text-slate-900 dark:text-white">${u.name}</h4>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-purple-600">
            <i data-lucide="${u.icon}" class="w-5 h-5"></i>
          </div>
        </div>

        <p class="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">
          Penyelaras: ${u.head}
        </p>
        <p class="text-xs text-slate-600 dark:text-slate-300 mb-4">
          ${u.desc}
        </p>

        <div class="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-700">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Aktiviti & Fokus:</span>
          ${u.highlights.map(h => `
            <div class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <i data-lucide="star" class="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0"></i>
              <span>${h}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // 6.4 Senarai Kokurikulum (Uniform, Kelab, Sukan)
  function populateKokurikulum() {
    const uniformContainer = document.getElementById("koko-uniform-container");
    const clubsContainer = document.getElementById("koko-clubs-container");
    const sportsContainer = document.getElementById("koko-sports-container");
    const fameContainer = document.getElementById("koko-fame-container");

    if (uniformContainer) {
      uniformContainer.innerHTML = SCHOOL_DATA.kokurikulum.uniform.map(u => `
        <div class="glass-card p-5 border-l-4 border-l-emerald-600">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg ${u.color} text-white flex items-center justify-center">
              <i data-lucide="${u.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <h5 class="text-sm font-bold text-slate-900 dark:text-white">${u.name}</h5>
              <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ketua: ${u.leader}</p>
            </div>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-2">${u.desc}</p>
        </div>
      `).join("");
    }

    if (clubsContainer) {
      clubsContainer.innerHTML = SCHOOL_DATA.kokurikulum.clubs.map(c => `
        <div class="glass-card p-5 border-l-4 border-l-teal-600">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <i data-lucide="${c.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <h5 class="text-sm font-bold text-slate-900 dark:text-white">${c.name}</h5>
              <p class="text-xs text-teal-600 dark:text-teal-400 font-medium">Ketua: ${c.leader}</p>
            </div>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-2">${c.desc}</p>
        </div>
      `).join("");
    }

    if (sportsContainer) {
      sportsContainer.innerHTML = SCHOOL_DATA.kokurikulum.sports.map(s => `
        <div class="glass-card p-5 border-l-4 border-l-amber-600">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <i data-lucide="${s.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <h5 class="text-sm font-bold text-slate-900 dark:text-white">${s.name}</h5>
              <p class="text-xs text-amber-600 dark:text-amber-400 font-medium">Jurulatih: ${s.coach}</p>
            </div>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-2">${s.desc}</p>
        </div>
      `).join("");
    }

    if (fameContainer) {
      fameContainer.innerHTML = SCHOOL_DATA.kokurikulum.hallOfFame.map(h => `
        <div class="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-300/40 dark:border-amber-700/40 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0">
            <i data-lucide="trophy" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-600 dark:text-amber-400">${h.year}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-semibold">${h.level}</span>
            </div>
            <h5 class="text-sm font-bold text-slate-900 dark:text-white mt-1">${h.event}</h5>
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">${h.achievement}</p>
          </div>
        </div>
      `).join("");
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // 6.5 Takwim Persekolahan 2026
  function populateTakwim(filterCategory = "Semua") {
    const container = document.getElementById("takwim-list-container");
    if (!container) return;

    const list = filterCategory === "Semua"
      ? SCHOOL_DATA.takwim
      : SCHOOL_DATA.takwim.filter(t => t.category === filterCategory);

    container.innerHTML = list.map(t => {
      let badgeColor = "bg-blue-600";
      if (t.category === "Kurikulum") badgeColor = "bg-emerald-600";
      if (t.category === "HEM") badgeColor = "bg-purple-600";
      if (t.category === "Kokurikulum") badgeColor = "bg-teal-600";

      return `
        <div class="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 flex flex-col items-center justify-center flex-shrink-0 text-center">
              <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">${t.month.slice(0, 3)}</span>
              <span class="text-base font-extrabold text-slate-800 dark:text-slate-100">${t.date.split(" ")[0]}</span>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="status-chip ${badgeColor} text-white">${t.category}</span>
                <span class="text-xs text-slate-400">${t.date}</span>
              </div>
              <h5 class="text-base font-bold text-slate-900 dark:text-white">${t.title}</h5>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">${t.desc}</p>
            </div>
          </div>
          <div>
            <button onclick="alert('Peringatan Takwim: ${t.title} pada ${t.date}')" class="btn-outline text-xs py-1.5 px-3">
              <i data-lucide="bell" class="w-3.5 h-3.5"></i> Ingatkan
            </button>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // Filter Takwim
  const takwimFilterBtns = document.querySelectorAll("[data-takwim-filter]");
  takwimFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      takwimFilterBtns.forEach(b => b.classList.remove("active", "bg-blue-600", "text-white"));
      btn.classList.add("active", "bg-blue-600", "text-white");
      const cat = btn.getAttribute("data-takwim-filter");
      populateTakwim(cat);
    });
  });

  // 6.6 Berita & Sorotan Terkini
  function populateNews() {
    const container = document.getElementById("news-grid-container");
    if (!container) return;

    container.innerHTML = SCHOOL_DATA.news.map(n => `
      <div class="glass-card p-6 flex flex-col justify-between cursor-pointer hover:border-blue-500" onclick="openNewsModal('${n.id}')">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="status-chip ${n.tagColor}">${n.category}</span>
            <span class="text-xs text-slate-400">${n.date}</span>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white leading-snug mb-2">${n.title}</h4>
          <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">${n.summary}</p>
        </div>
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
          <span>Baca Sepenuhnya</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // 6.7 Pusat Muat Turun Dokumen
  function populateDownloads(filterCategory = "Semua") {
    const container = document.getElementById("downloads-grid-container");
    if (!container) return;

    const list = filterCategory === "Semua"
      ? SCHOOL_DATA.downloads
      : SCHOOL_DATA.downloads.filter(d => d.category === filterCategory);

    container.innerHTML = list.map(d => `
      <div class="glass-card p-5 flex items-start justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 flex flex-col items-center justify-center font-bold text-xs flex-shrink-0">
            <i data-lucide="file-text" class="w-5 h-5"></i>
            <span class="text-[9px] uppercase mt-0.5">${d.format}</span>
          </div>
          <div>
            <span class="status-chip bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-1">${d.category}</span>
            <h5 class="text-sm font-bold text-slate-900 dark:text-white">${d.title}</h5>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${d.desc}</p>
            <span class="text-[11px] text-slate-400 block mt-1">Saiz: ${d.size}</span>
          </div>
        </div>
        <div>
          <button onclick="downloadDocumentSimulation('${d.title}')" class="btn-primary text-xs py-2 px-3 whitespace-nowrap">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Muat Turun
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  window.downloadDocumentSimulation = function (docTitle) {
    alert(`[Muat Turun Dokumen Rasmi]\n\nAnda sedang memuat turun:\n"${docTitle}"\n\nFail disediakan untuk simpanan rasmi warga SK Tampasuk 1.`);
  };

  const dlFilterBtns = document.querySelectorAll("[data-dl-filter]");
  dlFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      dlFilterBtns.forEach(b => b.classList.remove("active", "bg-blue-600", "text-white"));
      btn.classList.add("active", "bg-blue-600", "text-white");
      const cat = btn.getAttribute("data-dl-filter");
      populateDownloads(cat);
    });
  });

  // 6.8 Kumpulan Guru Bertugas Mingguan Showcase
  function populateDutyGroups() {
    const container = document.getElementById("duty-groups-container");
    if (!container) return;

    const entries = Object.entries(SCHOOL_DATA.dutyGroups);
    container.innerHTML = entries.map(([groupName, gInfo], idx) => {
      const colors = [
        "border-t-blue-600",
        "border-t-rose-600",
        "border-t-purple-600",
        "border-t-teal-600"
      ];
      return `
        <div class="glass-card p-5 border-t-4 ${colors[idx % colors.length]} flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="status-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">${groupName}</span>
              <span class="text-xs text-blue-600 font-semibold">${gInfo.members.length} Guru</span>
            </div>
            <h5 class="text-sm font-bold text-slate-900 dark:text-white mb-1">Ketua: ${gInfo.leader}</h5>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">Fokus: ${gInfo.focus}</p>

            <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              ${gInfo.members.map(m => `
                <div class="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ${m}
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // 7. BORANG MAKLUM BALAS & HUBUNGI KAMI
  const contactForm = document.getElementById("portal-contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      const nama = document.getElementById("contact-name")?.value || "Pelanggan";
      alert(`Terima kasih, ${nama}!\n\nMaklum balas anda telah berjaya dihantar kepada Pejabat Pentadbiran SK Tampasuk 1 Kota Belud. Pihak pentadbir sekolah akan meneliti mesej anda dalam masa terdekat.`);
      contactForm.reset();
    });
  }

  // Pelaksanaan Pertama
  populateTeachersList();
  populateKurikulumPanitia();
  populateHEMUnits();
  populateKokurikulum();
  populateTakwim();
  populateNews();
  populateDownloads();
  populateDutyGroups();

  // PWA Service Worker Registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(err => {
        console.log("Service Worker registration notice:", err);
      });
    });
  }
});
