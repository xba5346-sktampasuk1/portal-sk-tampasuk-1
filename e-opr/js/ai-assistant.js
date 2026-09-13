/**
 * Modul Pembantu Pintar "Jana AI" e-OPR
 * SK Tampasuk 1 Kota Belud
 * 
 * Ciri-ciri:
 * 1. Enjin Heuristik Pintar Sekolah (100% Offline, serta-merta, tanpa kos/kunci API)
 * 2. Analisis semantik kata kunci Nama Program + Unit/Panitia mengikut piawaian pelaporan KPM
 * 3. Sokongan pilihan Google Gemini API secara atas talian jika kunci API dikonfigurasikan
 */

const AIAssistant = {
  // Simpanan kunci API Gemini jika pengguna ingin menggunakan AI Generatif atas talian
  getGeminiApiKey() {
    return localStorage.getItem('eopr_gemini_api_key') || '';
  },

  setGeminiApiKey(key) {
    if (key) {
      localStorage.setItem('eopr_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('eopr_gemini_api_key');
    }
  },

  /**
   * Kategori tematik berasaskan analisis kata kunci program & unit
   */
  detectCategory(programName = '', unitName = '') {
    const text = (programName + ' ' + unitName).toLowerCase();

    if (/sukan|merentas|olahraga|sukantara|bola|badminton|futsal|takraw|senamrobik|aerobik|pjk|1m1s|kecergasan/.test(text)) {
      return 'sukan';
    }
    if (/kem bestari|solat|ramadan|ihya|maulidur|hijrah|quran|tasmik|moral|dakwah|islam|fardhu|tadarus/.test(text)) {
      return 'kerohanian';
    }
    if (/merdeka|kemerdekaan|malaysia|patriotik|jalur gemilang|kebangsaan|sejarah/.test(text)) {
      return 'patriotisme';
    }
    if (/kepimpinan|pengawas|prs|ketua darjah|disiplin|sahsiah|motivasi|kaunseling|ubk/.test(text)) {
      return 'kepimpinan';
    }
    if (/gotong|3k|kebersihan|keselamatan|kesihatan|denggi|kebakaran|fire drill|landskap|ceria/.test(text)) {
      return 'kebersihan_3k';
    }
    if (/ppda|dadah|vape|vaping|rokok|inhalan|jenayah/.test(text)) {
      return 'ppda';
    }
    if (/perkhemahan|kem unit|pengakap|tkrs|tunas kadet|pandu puteri|puteri islam|pbsm|bulan sabit|uniform/.test(text)) {
      return 'perkhemahan';
    }
    if (/anugerah|apresiasi|graduasi|hari kanak-kanak|hari guru|jamuan|kecemerlangan|tokoh/.test(text)) {
      return 'anugerah';
    }
    if (/mesyuarat|pibg|ldp|ladap|dialog prestasi|penetapan target|bicara prestasi|agung/.test(text)) {
      return 'mesyuarat';
    }
    if (/bengkel|teknik menjawab|stem|robotik|celik|pemulihan|nilam|bahasa|matematik|sains|rbt|psv|muzik|arab|bkd|uasa|kbat|kertas|latihan|akademik/.test(text)) {
      return 'akademik';
    }

    return 'umum';
  },

  /**
   * Pangkalan data templat pintar mengikut kategori sekolah KPM
   */
  templates: {
    sukan: {
      sasaran: "Semua murid Tahun 1 hingga Tahun 6, guru-guru dan staf sokongan SK Tampasuk 1.",
      objektif: (p) => [
        `1. Memupuk budaya gaya hidup sihat dan cergas dalam kalangan murid selaras dasar 1Murid 1Sukan (1M1S).`,
        `2. Mencungkil dan mengasah bakat murid dalam sukan serta memilih wakil sekolah ke peringkat MSSD Kota Belud.`,
        `3. Membina daya saing yang sihat, disiplin diri dan semangat kerjasama berpasukan yang utuh.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Pendaftaran peserta, taklimat keselamatan trek dan sesi pemanasan badan / senamrobik pagi.`,
        `2. Acara pelepasan peserta dijalankan mengikut kategori umur dan laluan yang telah ditetapkan.`,
        `3. Pertandingan berlangsung lancar dengan kawalan rapi pegawai trek dan pasukan pertolongan cemas.`,
        `4. Majlis penyampaian pingat, sijil penghargaan serta ucapan penutupan oleh pihak pentadbir.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Keadaan cuaca yang agak terik menjelang akhir acara memerlukan pemantauan hidrasi murid secara berterusan.`,
        `2. Beberapa laluan trek memerlukan penambahan bilangan guru kawalan keselamatan dan kon penanda arah.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Memulakan acara lebih awal pada waktu pagi bagi mengelakkan cuaca panas serta menyediakan stesen air minuman tambahan.`,
        `2. Mengadakan latihan raptai laluan bersama murid sekurang-kurangnya sehari sebelum kejohanan berlangsung.`
      ].join('\n')
    },

    akademik: {
      sasaran: "Semua murid Tahap 2 (Tahun 4, 5 dan 6) serta guru-guru mata pelajaran panitia.",
      objektif: (p) => [
        `1. Mendedahkan murid kepada teknik menjawab soalan pentaksiran terkini dan strategi menguasai soalan beraras tinggi (KBAT).`,
        `2. Meningkatkan tahap penguasaan murid dalam topik-topik kritikal dan kemahiran asas mata pelajaran.`,
        `3. Membina keyakinan diri murid serta menyuntik motivasi untuk mencapai keputusan cemerlang.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Pendaftaran murid dan pengedaran modul latihan berformatkan instrumen pentaksiran terkini.`,
        `2. Slot ceramah dan bimbingan teknik menjawab oleh guru penceramah / ketua panitia.`,
        `3. Bengkel latih tubi secara berkumpulan berserta sesi bimbingan fasilitator guru.`,
        `4. Sesi perbincangan jawapan model cemerlang, ulasan kesilapan lazim murid dan rumusan akhir.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Sebilangan kecil murid masih memerlukan bimbingan individu bagi memahami kehendak kata tugas soalan KBAT.`,
        `2. Tempoh masa aktiviti dirasakan agak padat untuk menghabiskan kesemua set latihan dalam modul.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Mengadakan kelas bimbingan berfokus secara bersiri mengikut kelompok tahap penguasaan murid.`,
        `2. Membekalkan bahan modul latihan pengukuhan dalam bentuk digital untuk diteruskan di rumah.`
      ].join('\n')
    },

    kerohanian: {
      sasaran: "Semua murid beragama Islam Tahun 1 hingga Tahun 6 dan guru-guru Pendidikan Islam.",
      objektif: (p) => [
        `1. Memantapkan kemahiran asas wuduk dan memperelokkan pergerakan serta bacaan dalam solat fardhu.`,
        `2. Menghayati nilai-nilai murni kerohanian, adab dan akhlak terpuji dalam kehidupan seharian.`,
        `3. Memupuk kecintaan terhadap ibadah serta membina sahsiah murid yang berakhlak mulia.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Taklimat amali wuduk dan pembahagian murid mengikut kumpulan fasilitator guru.`,
        `2. Latihan amali solat merangkumi pergerakan rukun fi'li dan semakan bacaan rukun qauli.`,
        `3. Slot ceramah motivasi penghayatan nilai akhlak dan kuiz celik fardhu ain.`,
        `4. Solat Zohor berjemaah, bacaan doa kesyukuran dan majlis penutupan program.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Terdapat murid Tahap 1 yang masih belum lancar bacaan tahiyyat akhir dan memerlukan bimbingan ekstra.`,
        `2. Ruang solat agak terhad untuk menampung kehadiran murid secara serentak dalam satu masa.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Melaksanakan kem secara dua sesi berasingan mengikut Tahap 1 dan Tahap 2 untuk ruang yang lebih selesa.`,
        `2. Mengadakan program 'Tasmik / Bacaan Pagi' selama 10 minit sebelum PdP bagi memantapkan hafazan murid.`
      ].join('\n')
    },

    patriotisme: {
      sasaran: "Seluruh warga SK Tampasuk 1 merangkumi murid Prasekolah hingga Tahun 6, para guru dan staf sokongan.",
      objektif: (p) => [
        `1. Menyemai dan menyuburkan semangat cinta akan tanah air serta menghargai erti kemerdekaan negara.`,
        `2. Memupuk perpaduan, persefahaman dan integrasi nasional dalam kalangan murid.`,
        `3. Mencungkil dan mengetengahkan bakat kreatif murid melalui pelbagai pertandingan bertemakan patriotik.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Perhimpunan rasmi, perarakan kibaran Jalur Gemilang dan nyanyian lagu-lagu patriotik bersemangat.`,
        `2. Ucapan perasmian pelancaran oleh Guru Besar berserta gimik pelancaran program.`,
        `3. Pelaksanaan pelbagai pertandingan bertema: mewarna poster, deklamasi sajak, kuiz sejarah dan busana merdeka.`,
        `4. Persembahan koir murid dan penyampaian hadiah kepada para pemenang pertandingan.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Ruang dewan perhimpunan agak padat semasa perarakan murid kerana bilangan peserta yang ramai.`,
        `2. Sistem audio mikrofon mengalami sedikit gangguan gema semasa sesi deklamasi sajak berlangsung.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Menyusun laluan perarakan secara berperingkat mengikut blok tahun bagi kelancaran pergerakan murid.`,
        `2. Membuat pemeriksaan teknikal peralatan audio dan 'soundcheck' sehari lebih awal sebelum acara bermula.`
      ].join('\n')
    },

    kepimpinan: {
      sasaran: "Barisan Pengawas Sekolah, Pengawas PSS, Pembimbing Rakan Sebaya (PRS) dan Ketua/Penolong Kelas.",
      objektif: (p) => [
        `1. Membentuk jati diri, integriti dan sahsiah terpuji dalam kalangan barisan pemimpin cilik sekolah.`,
        `2. Membekalkan kemahiran kepimpinan asas, pengurusan masa, komunikasi berkesan dan etika bertugas.`,
        `3. Menanam semangat tanggungjawab serta keberanian dalam menjalankan amanah sekolah.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Pendaftaran peserta dan sesi suai kenal (Ice Breaking) bagi membina dinamika kumpulan.`,
        `2. Bengkel pengurusan disiplin, simulasi situasi bertugas di lapangan dan protokol perhimpunan rasmi.`,
        `3. Latihan dalam kumpulan (LDK) bertemakan penyelesaian masalah dan pengurusan konflik rakan sebaya.`,
        `4. Lafaz ikrar pemimpin sekolah, penyampaian watikah pelantikan serta amanat Guru Besar.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Sebilangan peserta baharu masih berasa segan dan kurang keyakinan diri semasa aktiviti pembentangan.`,
        `2. Tempoh latihan amali situasi di lapangan memerlukan lebih banyak masa untuk bimbingan mendalam.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Mengadakan sesi pementoran (mentoring) berkala antara pengawas senior dan junior bagi membimbing keyakinan.`,
        `2. Mewujudkan buku log bertugas harian yang dipantau setiap minggu oleh guru penasihat badan kepimpinan.`
      ].join('\n')
    },

    kebersihan_3k: {
      sasaran: "Warga pendidik, staf sokongan, murid-murid Tahap 2 dan barisan ibu bapa PIBG SK Tampasuk 1.",
      objektif: (p) => [
        `1. Mewujudkan persekitaran sekolah yang bersih, ceria, selamat dan kondusif untuk proses pembelajaran murid.`,
        `2. Meningkatkan kesedaran warga sekolah tentang pencegahan tempat pembiakan nyamuk Aedes dan penyakit berjangkit.`,
        `3. Mengeratkan kerjasama dan semangat muhibah antara pihak sekolah, ibu bapa (PIBG) dan komuniti setempat.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Taklimat keselamatan, agihan kawasan pembersihan dan pembahagian alatan gotong-royong.`,
        `2. Aktiviti pembersihan longkang, keceriaan bilik darjah, landskap taman herba dan pengurusan sisa pepejal.`,
        `3. Pemeriksaan tempat takungan air dan pencegahan jentik-jentik di sekeliling kawasan sekolah.`,
        `4. Sesi jamuan ringan bersama ibu bapa dan penyerahan sijil penghargaan kepada wakil komuniti.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Kekurangan peralatan pembersihan berat (seperti mesin pemotong rumput dan penyembur air bertekanan tinggi).`,
        `2. Kehadiran ibu bapa agak sederhana berikutan komitmen tugas masing-masing pada hujung minggu.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Mengedarkan surat makluman tarikh gotong-royong sekurang-kurangnya dua minggu lebih awal kepada ibu bapa.`,
        `2. Memohon peruntukan PIBG atau sumbangan komuniti setempat untuk menambah peralatan pembersihan berkualiti.`
      ].join('\n')
    },

    ppda: {
      sasaran: "Semua murid Tahun 1 hingga Tahun 6, para guru dan kakitangan SK Tampasuk 1.",
      objektif: (p) => [
        `1. Memberi pendedahan dan kesedaran tentang bahaya penyalahgunaan dadah, rokok, inhalan dan gejala 'vaping'.`,
        `2. Membina benteng ketahanan diri murid agar berani berkata 'TIDAK' kepada sebarang pengaruh negatif.`,
        `3. Memperkasakan peranan Sudut PPDa sekolah sebagai pusat penyebaran maklumat pencegahan yang efektif.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Majlis pelancaran Minggu PPDa dan lafaz ikrar antidadah oleh seluruh warga sekolah.`,
        `2. Pameran bergerak maklumat bahaya dadah dan vape dengan kerjasama agensi AADK / PDRM.`,
        `3. Pertandingan melukis poster PPDa, penulisan karangan dan deklamasi sajak antidadah.`,
        `4. Ceramah kesedaran oleh Pegawai AADK Daerah berserta sesi soal jawab bermaklumat.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Masa giliran melawat pameran agak terhad bagi setiap kelas kerana terikat dengan jadual PdP harian.`,
        `2. Ruang pameran agak sesak ketika waktu rehat murid.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Menjadualkan giliran lawatan pameran mengikut waktu mata pelajaran Pendidikan Moral dan PJK.`,
        `2. Mengadakan kuiz PPDa secara digital (Quizizz) untuk menggalakkan penyertaan murid yang lebih menyeluruh.`
      ].join('\n')
    },

    perkhemahan: {
      sasaran: "Semua anggota Unit Beruniform Tahap 2 (Tahun 4, 5 dan 6) seramai 120 orang peserta.",
      objektif: (p) => [
        `1. Melahirkan murid yang berdisiplin, berdikari serta mempunyai daya tahan fizikal dan mental yang kental.`,
        `2. Mempraktikkan kemahiran asas ikatan, tali-temali, pertolongan cemas, dan ilmu perkhemahan.`,
        `3. Memupuk semangat kerjasama, toleransi dan kepimpinan dalam kerja berpasukan.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Pendaftaran peserta, taklimat keselamatan kem dan pertandingan mendirikan khemah mengikut unit.`,
        `2. Stesen kembara kemahiran: ikatan & simpulan, kawad kaki asas, dan rawatan kecemasan / CPR.`,
        `3. Aktiviti ikhtiar hidup (masakan rimba) dan malam kebudayaan persembahan bakat murid.`,
        `4. Khidmat komuniti membersihkan tapak perkhemahan dan majlis penyampaian anugerah khemah terbaik.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Bekalan air di tapak perkhemahan mengalami tekanan rendah pada waktu puncak pagi.`,
        `2. Sebahagian murid baharu masih belum mahir teknik ikatan khemah yang kukuh.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Menyediakan tangki takungan air kecemasan tambahan di tapak perkhemahan sebelum program bermula.`,
        `2. Memperbanyakkan sesi amali ikatan dan kawad kaki semasa perjumpaan mingguan kokurikulum.`
      ].join('\n')
    },

    anugerah: {
      sasaran: "Murid-murid penerima anugerah, para ibu bapa, barisan pentadbir, guru-guru dan staf sokongan.",
      objektif: (p) => [
        `1. Memberikan pengiktirafan dan penghargaan atas pencapaian cemerlang murid dalam bidang kurikulum, kokurikulum dan sahsiah.`,
        `2. Membakar semangat murid-murid lain untuk terus berusaha gigih mencapai kejayaan yang membanggakan.`,
        `3. Mengeratkan silaturahim dan kerjasama erat antara pihak sekolah dan para ibu bapa.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Pendaftaran tetamu jemputan, ibu bapa dan ketibaan perasmi kehormat.`,
        `2. Ucapan alu-aluan Guru Besar dan ucapan perasmian oleh Yang Dipertua PIBG / Pegawai PPD.`,
        `3. Persembahan selingan tarian kebudayaan dan koir murid SK Tampasuk 1.`,
        `4. Upacara penyampaian sijil penghargaan, trofi tokoh murid dan sesi bergambar kenang-kenangan.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Majlis mengambil masa sedikit lewat daripada jadual asal berikutan bilangan penerima anugerah yang ramai.`,
        `2. Ruang tempat duduk ibu bapa di dalam dewan hampir penuh pada waktu puncak majlis.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Membahagikan sesi penyampaian anugerah secara berperingkat bagi melancarkan pergerakan majlis.`,
        `2. Menyediakan siaran langsung (live projection) di khemah luar dewan untuk keselesaan tetamu tambahan.`
      ].join('\n')
    },

    mesyuarat: {
      sasaran: "Semua ibu bapa/penjaga murid, Ahli Jawatankuasa PIBG, barisan pentadbir dan para guru.",
      objektif: (p) => [
        `1. Membincangkan hala tuju akademik, kebajikan dan pembangunan prasarana sekolah secara telus dan bermuafakat.`,
        `2. Memperkukuh peranan dan komitmen ibu bapa sebagai rakan strategik kecemerlangan sekolah.`,
        `3. Membentangkan laporan kewangan dan pencapaian aktiviti sekolah bagi sesi persekolahan semasa.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Pendaftaran kehadiran ibu bapa / guru dan pengedaran buku program mesyuarat.`,
        `2. Pembentangan laporan aktiviti tahunan dan penyata kewangan yang telah diaudit.`,
        `3. Sesi perbincangan usul-usul cadangan kebajikan murid dan pembangunan sekolah.`,
        `4. Pemilihan barisan Jawatankuasa baharu dan jamuan mesra muhibah.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Kehadiran ibu bapa bagi murid tahap satu agak sederhana berbanding murid tahap dua.`,
        `2. Perbincangan bagi satu-satu usul agak berlarutan sehingga melebihi had masa yang diperuntukkan.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Mengumumkan cabutan bertuah dan pameran hasil kerja murid bagi meningkatkan motivasi kehadiran ibu bapa.`,
        `2. Menetapkan had masa maksimum 5 minit bagi setiap perbahasan usul untuk kawalan masa yang berkesan.`
      ].join('\n')
    },

    umum: {
      sasaran: "Semua murid, para guru dan kakitangan SK Tampasuk 1 Kota Belud.",
      objektif: (p) => [
        `1. Memberi pendedahan, kefahaman dan penghayatan menyeluruh kepada murid mengenai pengisian ${p || 'program'}.`,
        `2. Meningkatkan kemahiran, potensi dan daya saing murid melalui aktiviti yang terancang.`,
        `3. Memupuk nilai-nilai murni, kerjasama berpasukan dan sahsiah terpuji dalam kalangan murid.`
      ].join('\n'),
      aktiviti: (p) => [
        `1. Pendaftaran peserta dan taklimat ringkas mengenai pengisian aktiviti ${p || 'program'}.`,
        `2. Majlis perasmian pembukaan disempurnakan oleh pihak pentadbiran sekolah.`,
        `3. Pelaksanaan aktiviti utama, bengkel interaktif dan pembentangan hasil aktiviti murid.`,
        `4. Majlis penutupan, rumusan program serta penyampaian sijil dan hadiah penghargaan.`
      ].join('\n'),
      kelemahan: (p) => [
        `1. Kekangan masa aktiviti yang agak terhad berikutan jadual persekolahan yang padat.`,
        `2. Kemudahan ruang dan peralatan sokongan memerlukan sedikit penambahbaikan untuk program akan datang.`
      ].join('\n'),
      cadangan: (p) => [
        `1. Menyusun jadual aktiviti dengan peruntukan masa yang lebih fleksibel bagi setiap sesi.`,
        `2. Membuat persediaan logistik dan peralatan sokongan lebih awal bersama jawatankuasa kerja.`
      ].join('\n')
    }
  },

  /**
   * Jana kandungan untuk satu medan tertentu
   */
  async generateForField(fieldName, context = {}) {
    const program = (context.program || '').trim();
    const anjuran = (context.anjuran || '').trim();

    if (!program) {
      return {
        success: false,
        error: 'Sila masukkan Nama Program terlebih dahulu untuk membolehkan AI menjana cadangan yang tepat.'
      };
    }

    // Jika pengguna menyediakan Kunci API Gemini, cuba jana menggunakan Google Gemini
    const apiKey = this.getGeminiApiKey();
    if (apiKey) {
      try {
        const cloudResult = await this.callGeminiAPI(fieldName, context, apiKey);
        if (cloudResult && cloudResult.trim()) {
          return { success: true, text: cloudResult.trim(), source: 'gemini' };
        }
      } catch (err) {
        console.warn('Gemini API gagal, beralih ke Enjin Sekolah Bawaan:', err);
      }
    }

    // Enjin Luar Talian Bawaan (Offline Smart Engine)
    const category = this.detectCategory(program, anjuran);
    const tmpl = this.templates[category] || this.templates['umum'];

    let generatedText = '';
    if (typeof tmpl[fieldName] === 'function') {
      generatedText = tmpl[fieldName](program);
    } else if (typeof tmpl[fieldName] === 'string') {
      generatedText = tmpl[fieldName];
    } else {
      generatedText = this.templates['umum'][fieldName] ? this.templates['umum'][fieldName](program) : '';
    }

    return {
      success: true,
      text: generatedText,
      category: category,
      source: 'built-in'
    };
  },

  /**
   * Jana draf lengkap untuk semua 4-5 medan serentak
   */
  async generateFullDraft(context = {}) {
    const program = (context.program || '').trim();
    const anjuran = (context.anjuran || '').trim();

    if (!program) {
      return {
        success: false,
        error: 'Sila masukkan Nama Program terlebih dahulu untuk membolehkan AI menjana draf penuh.'
      };
    }

    const category = this.detectCategory(program, anjuran);
    const tmpl = this.templates[category] || this.templates['umum'];

    return {
      success: true,
      data: {
        sasaran: typeof tmpl.sasaran === 'function' ? tmpl.sasaran(program) : tmpl.sasaran,
        objektif: typeof tmpl.objektif === 'function' ? tmpl.objektif(program) : tmpl.objektif,
        aktiviti: typeof tmpl.aktiviti === 'function' ? tmpl.aktiviti(program) : tmpl.aktiviti,
        kelemahan: typeof tmpl.kelemahan === 'function' ? tmpl.kelemahan(program) : tmpl.kelemahan,
        cadangan: typeof tmpl.cadangan === 'function' ? tmpl.cadangan(program) : tmpl.cadangan
      },
      category: category,
      source: 'built-in'
    };
  },

  /**
   * Panggilan ke Google Gemini API (jika dikonfigurasikan)
   */
  async callGeminiAPI(fieldName, context, apiKey) {
    const promptMap = {
      objektif: `Hasilkan 3 objektif program sekolah rendah (KPM) bernombor untuk program "${context.program}" anjuran "${context.anjuran}". Tulis ringkas, padat dan profesional dalam Bahasa Melayu.`,
      aktiviti: `Hasilkan 4 ringkasan kronologi aktiviti program sekolah bernombor untuk program "${context.program}" anjuran "${context.anjuran}". Tulis ringkas dan kemas dalam Bahasa Melayu.`,
      kelemahan: `Hasilkan 2 kelemahan atau kekangan yang munasabah bernombor untuk program sekolah "${context.program}". Tulis profesional dalam Bahasa Melayu.`,
      cadangan: `Hasilkan 2 cadangan penambahbaikan yang membina bernombor bagi program sekolah "${context.program}". Tulis profesional dalam Bahasa Melayu.`,
      sasaran: `Nyatakan kumpulan sasaran peserta yang sesuai bagi program sekolah "${context.program}" dalam 1 ayat ringkas.`
    };

    const promptText = promptMap[fieldName] || `Hasilkan draf laporan bagi "${fieldName}" untuk program "${context.program}".`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
};

window.AIAssistant = AIAssistant;