/**
 * TEMPLATE KALIMAT RAPOR - TEACHERAI
 * Kurikulum Merdeka - Versi Komprehensif
 * 
 * Fungsi: Menghasilkan narasi rapor yang personal, mendidik, dan bervariasi
 * berdasarkan pencapaian siswa per mata pelajaran dan elemen CP.
 * 
 * MENDUKUNG DUA SISTEM PENILAIAN:
 * 1. KKTP (Kriteria Ketercapaian Tujuan Pembelajaran): BT, MB, SB, ST
 * 2. Nilai Numerik Rapor: A (90-100), B (80-89), C (70-79), D (<70)
 * 
 * PLACEHOLDER YANG DIDUKUNG:
 * - {nama}       : Nama siswa
 * - {mapel}      : Nama mata pelajaran
 * - {elemen}     : Nama elemen CP (misal: 'Bilangan', 'Menulis')
 * - {topik}      : Topik spesifik (misal: 'Pecahan', 'Teks Deskripsi')
 * - {kode_tp}    : Kode TP (misal: 'TP 3')
 * - {tp}         : Deskripsi lengkap TP
 * - {kelas}      : Nama kelas
 * - {semester}   : Semester (Ganjil/Genap)
 * - {tahun}      : Tahun ajaran
 * - {kegiatan}   : Kegiatan spesifik (opsional)
 */

// ============================================================
// 1. TEMPLATE PER ELEMEN CP (Khas Kurikulum Merdeka)
// ============================================================

export const templateElemenCP = {
  // -------------------------------------------------------------------------
  // BAHASA INDONESIA
  // -------------------------------------------------------------------------
  'Bahasa Indonesia': {
    'Menyimak': {
      ST: [
        '{nama} memiliki kemampuan menyimak yang sangat baik. Mampu memahami informasi lisan secara mendalam dan memberikan tanggapan yang tepat.',
        'Ananda {nama} menunjukkan keterampilan menyimak yang unggul. Konsisten menangkap gagasan utama dan detail penting dari berbagai jenis teks lisan.',
        '{nama} mampu menganalisis isi teks lisan dengan kritis dan memberikan respons yang bermakna.',
      ],
      SB: [
        '{nama} menunjukkan kemampuan menyimak yang baik. Mampu memahami sebagian besar informasi lisan dengan cukup baik.',
        'Ananda {nama} memiliki perkembangan positif dalam keterampilan menyimak. Perlu peningkatan pada pemahaman detail tersirat.',
        '{nama} aktif mendengarkan dan mampu merespons informasi lisan dengan tepat pada konteks sederhana.',
      ],
      MB: [
        '{nama} mulai menunjukkan kemampuan menyimak yang memadai. Perlu lebih fokus saat mendengarkan penjelasan panjang.',
        'Ananda {nama} mampu menangkap informasi dasar dari teks lisan. Disarankan untuk berlatih menyimak materi yang lebih kompleks.',
        '{nama} perlu meningkatkan konsentrasi saat menyimak agar mampu menangkap gagasan utama secara utuh.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam keterampilan menyimak. Disarankan untuk lebih fokus saat mendengarkan penjelasan guru.',
        'Ananda {nama} perlu banyak latihan menyimak cerita atau penjelasan untuk meningkatkan pemahamannya.',
        'Mohon dukungan orang tua untuk membiasakan {nama} mendengarkan cerita atau audio edukatif di rumah.',
      ],
    },
    'Membaca dan Memirsa': {
      ST: [
        '{nama} memiliki minat baca yang sangat tinggi dan kemampuan memahami teks yang mendalam.',
        'Ananda {nama} mampu menganalisis teks fiksi dan nonfiksi dengan kritis serta menemukan makna tersirat.',
        '{nama} menunjukkan kemampuan literasi yang luar biasa. Konsisten membaca dan mampu membandingkan berbagai sumber bacaan.',
      ],
      SB: [
        '{nama} menunjukkan kemampuan membaca yang baik. Mampu memahami teks dengan struktur yang bervariasi.',
        'Ananda {nama} memiliki perkembangan positif dalam membaca. Perlu meningkatkan kecepatan dan pemahaman mendalam.',
        '{nama} aktif membaca berbagai jenis teks dan mampu menemukan informasi penting dengan baik.',
      ],
      MB: [
        '{nama} mulai menunjukkan minat baca yang baik. Perlu lebih banyak berlatih membaca teks yang lebih panjang.',
        'Ananda {nama} mampu memahami teks sederhana. Disarankan untuk memperbanyak bacaan di rumah.',
        '{nama} perlu meningkatkan kosakata melalui kegiatan membaca yang konsisten.',
      ],
      BT: [
        '{nama} masih memerlukan banyak latihan membaca. Disarankan untuk membiasakan membaca minimal 15 menit setiap hari.',
        'Ananda {nama} perlu pendampingan dalam memahami teks. Mohon dukungan orang tua untuk menemani membaca di rumah.',
        'Perlu motivasi lebih untuk membangun minat baca {nama}. Disarankan membaca buku bergambar atau komik edukatif terlebih dahulu.',
      ],
    },
    'Berbicara dan Mempresentasikan': {
      ST: [
        '{nama} sangat percaya diri dalam berbicara dan mempresentasikan gagasan di depan kelas.',
        'Ananda {nama} memiliki kemampuan komunikasi lisan yang luar biasa. Mampu menyampaikan ide dengan runtut dan menarik.',
        '{nama} aktif berpartisipasi dalam diskusi dan mampu mempertahankan argumen dengan logis.',
      ],
      SB: [
        '{nama} menunjukkan kemampuan berbicara yang baik. Mampu menyampaikan gagasan dengan cukup lancar.',
        'Ananda {nama} memiliki perkembangan positif dalam presentasi. Perlu meningkatkan kepercayaan diri di depan audiens besar.',
        '{nama} mampu berbicara dengan struktur yang baik, meskipun masih perlu latihan dalam variasi intonasi.',
      ],
      MB: [
        '{nama} mulai berani berbicara di depan kelas. Perlu lebih banyak latihan untuk meningkatkan kepercayaan diri.',
        'Ananda {nama} mampu menyampaikan pendapat sederhana. Disarankan untuk aktif bertanya dan berdiskusi di kelas.',
        '{nama} perlu didorong untuk lebih sering berbicara di forum kelas guna mengasah kemampuan komunikasi.',
      ],
      BT: [
        '{nama} masih pemalu dalam berbicara di depan umum. Perlu dukungan untuk membangun kepercayaan diri secara bertahap.',
        'Ananda {nama} perlu banyak latihan berbicara dalam situasi informal terlebih dahulu sebelum tampil di depan kelas.',
        'Mohon dukungan orang tua untuk mengajak {nama} bercerita tentang kegiatannya sehari-hari di rumah.',
      ],
    },
    'Menulis': {
      ST: [
        '{nama} memiliki kemampuan menulis yang sangat baik. Mampu menuangkan gagasan secara runtut, kreatif, dan kaya kosakata.',
        'Ananda {nama} menghasilkan karya tulis yang orisinal dan bermutu tinggi dengan struktur yang koheren.',
        '{nama} menunjukkan bakat menulis yang menonjol. Karya tulisnya menunjukkan kedalaman berpikir dan kekayaan diksi.',
      ],
      SB: [
        '{nama} menunjukkan kemampuan menulis yang baik. Mampu menulis berbagai jenis teks dengan struktur yang benar.',
        'Ananda {nama} memiliki perkembangan positif dalam menulis. Perlu memperkaya kosakata untuk tulisan yang lebih variatif.',
        '{nama} mampu menulis paragraf yang padu dengan ejaan dan tanda baca yang baik.',
      ],
      MB: [
        '{nama} mulai menunjukkan kemampuan menulis yang memadai. Perlu lebih banyak berlatih menulis berbagai jenis teks.',
        'Ananda {nama} mampu menulis kalimat sederhana dengan benar. Disarankan untuk memperbanyak latihan menulis paragraf.',
        '{nama} perlu meningkatkan penggunaan huruf kapital dan tanda baca dalam tulisannya.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam menulis. Disarankan untuk banyak menyalin teks dan berlatih menulis kalimat.',
        'Ananda {nama} perlu banyak latihan menulis untuk meningkatkan keterampilannya. Mohon dukungan orang tua.',
        'Perlu pendampingan khusus untuk membantu {nama} memahami struktur kalimat dan paragraf.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // MATEMATIKA
  // -------------------------------------------------------------------------
  'Matematika': {
    'Bilangan': {
      ST: [
        '{nama} menguasai konsep bilangan dengan sangat baik. Mampu menyelesaikan operasi hitung kompleks secara tepat dan sistematis.',
        'Ananda {nama} memiliki kemampuan numerasi yang luar biasa. Konsisten menerapkan konsep bilangan dalam masalah kontekstual.',
        '{nama} menunjukkan pemahaman mendalam tentang sifat-sifat bilangan dan mampu menggunakannya dalam pemecahan masalah.',
      ],
      SB: [
        '{nama} menunjukkan pemahaman yang baik tentang konsep bilangan. Mampu menyelesaikan operasi hitung dengan benar.',
        'Ananda {nama} memiliki perkembangan positif dalam memahami bilangan. Perlu latihan pada materi yang lebih kompleks.',
        '{nama} mampu menerapkan operasi hitung dalam soal cerita sederhana dengan cukup baik.',
      ],
      MB: [
        '{nama} mulai memahami konsep dasar bilangan. Perlu lebih banyak latihan pada operasi hitung campuran.',
        'Ananda {nama} mampu menyelesaikan operasi hitung dasar. Disarankan untuk berlatih soal cerita secara rutin.',
        '{nama} perlu memperkuat pemahaman nilai tempat dan konsep pecahan sebelum melanjutkan ke materi berikutnya.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan intensif dalam konsep bilangan. Disarankan untuk memperbanyak latihan dasar.',
        'Ananda {nama} perlu pendampingan khusus untuk memahami operasi hitung dasar. Mohon dukungan orang tua.',
        'Perlu mengulang konsep dasar bilangan dengan benda konkret sebelum beralih ke simbol angka.',
      ],
    },
    'Aljabar': {
      ST: [
        '{nama} memahami konsep aljabar dengan sangat baik. Mampu memodelkan masalah nyata ke dalam bentuk persamaan.',
        'Ananda {nama} memiliki kemampuan berpikir abstrak yang luar biasa dalam menyelesaikan masalah aljabar.',
        '{nama} mampu menerapkan konsep pola, barisan, dan persamaan dengan tepat dalam berbagai konteks.',
      ],
      SB: [
        '{nama} menunjukkan pemahaman yang baik tentang konsep aljabar. Mampu menyelesaikan persamaan sederhana.',
        'Ananda {nama} memiliki perkembangan positif dalam aljabar. Perlu meningkatkan kemampuan dalam pemodelan masalah.',
        '{nama} mampu mengidentifikasi pola dan menyelesaikannya dengan bantuan minimal.',
      ],
      MB: [
        '{nama} mulai memahami konsep dasar aljabar. Perlu lebih banyak latihan dalam mengenali pola.',
        'Ananda {nama} mampu menyelesaikan persamaan sederhana. Disarankan untuk berlatih soal kontekstual.',
        '{nama} perlu memperkuat pemahaman konsep variabel sebelum melanjutkan ke materi yang lebih kompleks.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam konsep aljabar. Disarankan untuk memulai dari pola sederhana.',
        'Ananda {nama} perlu pendampingan khusus untuk memahami konsep variabel dan persamaan.',
        'Perlu latihan bertahap dari pola gambar ke pola bilangan untuk membangun pemahaman aljabar.',
      ],
    },
    'Pengukuran': {
      ST: [
        '{nama} menguasai konsep pengukuran dengan sangat baik. Mampu melakukan konversi satuan dan menyelesaikan masalah kontekstual.',
        'Ananda {nama} menunjukkan pemahaman mendalam tentang pengukuran panjang, berat, waktu, dan volume.',
        '{nama} mampu menerapkan konsep pengukuran dalam kehidupan sehari-hari dengan tepat.',
      ],
      SB: [
        '{nama} menunjukkan pemahaman yang baik tentang pengukuran. Mampu menggunakan alat ukur dengan benar.',
        'Ananda {nama} memiliki perkembangan positif dalam pengukuran. Perlu latihan pada konversi satuan yang kompleks.',
        '{nama} mampu mengukur berbagai besaran dengan akurat menggunakan satuan baku.',
      ],
      MB: [
        '{nama} mulai memahami konsep pengukuran dasar. Perlu lebih banyak latihan pada konversi satuan.',
        'Ananda {nama} mampu mengukur dengan satuan baku sederhana. Disarankan untuk berlatih konversi.',
        '{nama} perlu memperkuat pemahaman hubungan antar satuan sebelum melanjutkan ke materi lanjutan.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam pengukuran. Disarankan untuk berlatih dengan alat ukur nyata di rumah.',
        'Ananda {nama} perlu pendampingan untuk memahami konsep satuan baku. Mohon dukungan orang tua.',
        'Perlu banyak praktik mengukur benda nyata untuk membangun pemahaman konsep pengukuran.',
      ],
    },
    'Geometri': {
      ST: [
        '{nama} memahami konsep geometri dengan sangat baik. Mampu menganalisis sifat-sifat bangun datar dan ruang.',
        'Ananda {nama} memiliki kemampuan visualisasi spasial yang luar biasa dalam memecahkan masalah geometri.',
        '{nama} mampu menerapkan konsep kesebangunan, kekongruenan, dan teorema Pythagoras dengan tepat.',
      ],
      SB: [
        '{nama} menunjukkan pemahaman yang baik tentang geometri. Mampu mengidentifikasi bangun datar dan ruang.',
        'Ananda {nama} memiliki perkembangan positif dalam geometri. Perlu latihan pada perhitungan luas dan volume.',
        '{nama} mampu mengenali sifat-sifat bangun geometri dengan cukup baik.',
      ],
      MB: [
        '{nama} mulai memahami konsep dasar geometri. Perlu lebih banyak latihan pada sifat-sifat bangun.',
        'Ananda {nama} mampu mengidentifikasi bangun dasar. Disarankan untuk berlatih menggambar bangun geometri.',
        '{nama} perlu memperkuat pemahaman ciri-ciri bangun sebelum melanjutkan ke perhitungan.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam geometri. Disarankan untuk berlatih dengan benda konkret.',
        'Ananda {nama} perlu pendampingan untuk memahami konsep bangun datar dan ruang.',
        'Perlu banyak mengamati benda di sekitar untuk membangun pemahaman konsep geometri.',
      ],
    },
    'Analisis Data dan Peluang': {
      ST: [
        '{nama} menguasai analisis data dan peluang dengan sangat baik. Mampu mengolah dan menafsirkan data dengan kritis.',
        'Ananda {nama} memiliki kemampuan statistik yang luar biasa dalam menyajikan dan menganalisis data.',
        '{nama} mampu menerapkan konsep peluang dalam berbagai konteks dengan tepat.',
      ],
      SB: [
        '{nama} menunjukkan pemahaman yang baik tentang analisis data. Mampu menyajikan data dalam berbagai bentuk diagram.',
        'Ananda {nama} memiliki perkembangan positif dalam statistik. Perlu latihan pada interpretasi data.',
        '{nama} mampu menghitung ukuran pemusatan data dengan cukup baik.',
      ],
      MB: [
        '{nama} mulai memahami konsep dasar analisis data. Perlu lebih banyak latihan pada pembuatan diagram.',
        'Ananda {nama} mampu membaca diagram sederhana. Disarankan untuk berlatih membuat diagram sendiri.',
        '{nama} perlu memperkuat pemahaman cara membaca data sebelum melanjutkan ke analisis.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam analisis data. Disarankan untuk berlatih dengan data sederhana.',
        'Ananda {nama} perlu pendampingan untuk memahami konsep diagram dan tabel.',
        'Perlu banyak latihan membaca data dari lingkungan sekitar untuk membangun pemahaman.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // IPA
  // -------------------------------------------------------------------------
  'IPA': {
    'Pemahaman IPA': {
      ST: [
        '{nama} memiliki pemahaman konsep IPA yang sangat baik. Mampu menjelaskan fenomena alam dengan bahasa ilmiah yang tepat.',
        'Ananda {nama} menunjukkan rasa ingin tahu yang tinggi dan mampu menghubungkan konsep IPA dengan kehidupan sehari-hari.',
        '{nama} mampu menganalisis masalah ilmiah dengan pendekatan yang sistematis dan kritis.',
      ],
      SB: [
        '{nama} menunjukkan pemahaman yang baik tentang konsep IPA. Mampu menjelaskan fenomena alam dengan benar.',
        'Ananda {nama} memiliki perkembangan positif dalam memahami konsep ilmiah. Perlu peningkatan pada aplikasi konsep.',
        '{nama} aktif bertanya dan mampu menghubungkan konsep dengan pengamatan di sekitarnya.',
      ],
      MB: [
        '{nama} mulai memahami konsep dasar IPA. Perlu lebih banyak pengamatan langsung terhadap fenomena alam.',
        'Ananda {nama} mampu memahami konsep sederhana. Disarankan untuk memperbanyak eksperimen di rumah.',
        '{nama} perlu memperkuat pemahaman konsep dasar sebelum melanjutkan ke materi yang lebih kompleks.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam memahami konsep IPA. Disarankan untuk banyak mengamati alam sekitar.',
        'Ananda {nama} perlu pendampingan khusus untuk memahami konsep ilmiah. Mohon dukungan orang tua.',
        'Perlu banyak menonton video sains edukatif untuk membangun pemahaman konsep IPA.',
      ],
    },
    'Keterampilan Proses IPA': {
      ST: [
        '{nama} memiliki keterampilan proses IPA yang sangat baik. Mampu merancang dan melakukan penyelidikan ilmiah secara mandiri.',
        'Ananda {nama} terampil dalam mengolah data dan menarik kesimpulan berdasarkan bukti empiris.',
        '{nama} menunjukkan kemampuan berpikir ilmiah yang matang dalam setiap kegiatan praktikum.',
      ],
      SB: [
        '{nama} menunjukkan keterampilan proses IPA yang baik. Mampu mengikuti prosedur eksperimen dengan benar.',
        'Ananda {nama} memiliki perkembangan positif dalam praktikum. Perlu meningkatkan ketelitian dalam pengamatan.',
        '{nama} mampu mengolah data hasil pengamatan dengan cukup baik.',
      ],
      MB: [
        '{nama} mulai terampil dalam proses ilmiah. Perlu lebih banyak latihan dalam merancang eksperimen.',
        'Ananda {nama} mampu melakukan pengamatan dengan bimbingan. Disarankan untuk berlatih mandiri.',
        '{nama} perlu memperkuat keterampilan mengamati dan mencatat sebelum melanjutkan ke analisis.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam keterampilan proses IPA. Disarankan untuk banyak praktikum sederhana.',
        'Ananda {nama} perlu pendampingan untuk memahami prosedur ilmiah dasar.',
        'Perlu banyak kegiatan sains sederhana di rumah untuk membangun keterampilan proses.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // IPS
  // -------------------------------------------------------------------------
  'IPS': {
    'Pemahaman IPS': {
      ST: [
        '{nama} memiliki pemahaman IPS yang sangat baik. Mampu menganalisis isu sosial dengan perspektif yang luas dan kritis.',
        'Ananda {nama} menunjukkan wawasan sosial yang mendalam dan kepedulian tinggi terhadap isu-isu masyarakat.',
        '{nama} mampu menghubungkan peristiwa sejarah dengan konteks kekinian secara cerdas.',
      ],
      SB: [
        '{nama} menunjukkan pemahaman yang baik tentang konsep IPS. Mampu menjelaskan peristiwa sosial dan sejarah dengan runtut.',
        'Ananda {nama} memiliki perkembangan positif dalam memahami isu sosial. Perlu meningkatkan analisis kritis.',
        '{nama} aktif mengikuti perkembangan isu sosial dan mampu memberikan pendapat yang relevan.',
      ],
      MB: [
        '{nama} mulai memahami konsep dasar IPS. Perlu lebih banyak membaca dan berdiskusi tentang isu terkini.',
        'Ananda {nama} mampu memahami peristiwa sosial sederhana. Disarankan untuk aktif mengikuti berita.',
        '{nama} perlu memperkuat pemahaman konsep dasar sebelum melanjutkan ke analisis kompleks.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam memahami konsep IPS. Disarankan untuk banyak membaca buku sejarah dan geografi.',
        'Ananda {nama} perlu pendampingan untuk memahami isu sosial. Mohon dukungan orang tua untuk berdiskusi.',
        'Perlu banyak mengunjungi museum atau situs sejarah untuk membangun pemahaman IPS.',
      ],
    },
    'Keterampilan Proses IPS': {
      ST: [
        '{nama} memiliki keterampilan proses IPS yang sangat baik. Mampu melakukan penelitian sosial sederhana secara mandiri.',
        'Ananda {nama} terampil dalam mengumpulkan dan menganalisis data sosial dengan metode yang tepat.',
        '{nama} mampu menyajikan hasil penelitian sosial dengan cara yang menarik dan informatif.',
      ],
      SB: [
        '{nama} menunjukkan keterampilan proses IPS yang baik. Mampu melakukan wawancara dan observasi dengan benar.',
        'Ananda {nama} memiliki perkembangan positif dalam penelitian sosial. Perlu meningkatkan kemampuan analisis.',
        '{nama} mampu mengumpulkan data sosial dengan bimbingan minimal.',
      ],
      MB: [
        '{nama} mulai terampil dalam proses penelitian sosial. Perlu lebih banyak latihan wawancara dan observasi.',
        'Ananda {nama} mampu mengumpulkan data dengan bimbingan. Disarankan untuk berlatih mandiri.',
        '{nama} perlu memperkuat keterampilan mengumpulkan data sebelum melanjutkan ke analisis.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam keterampilan proses IPS. Disarankan untuk banyak berinteraksi sosial.',
        'Ananda {nama} perlu pendampingan untuk memahami metode penelitian sosial dasar.',
        'Perlu banyak kegiatan sosial di lingkungan sekitar untuk membangun keterampilan proses.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // PENDIDIKAN PANCASILA
  // -------------------------------------------------------------------------
  'Pendidikan Pancasila': {
    'default': {
      ST: [
        '{nama} menunjukkan karakter Pancasila yang sangat baik. Mampu mengimplementasikan nilai-nilai Pancasila dalam kehidupan sehari-hari.',
        'Ananda {nama} memiliki pemahaman mendalam tentang Pancasila dan menjadi teladan bagi teman-temannya.',
        '{nama} aktif mengimplementasikan nilai-nilai luhur Pancasila dalam berbagai kegiatan sekolah.',
      ],
      SB: [
        '{nama} menunjukkan karakter Pancasila yang baik. Menerapkan nilai-nilai Pancasila dengan konsisten.',
        'Ananda {nama} memiliki perkembangan positif dalam mengamalkan nilai Pancasila.',
        '{nama} mampu menjelaskan makna Pancasila dan menerapkannya dalam kehidupan.',
      ],
      MB: [
        '{nama} mulai menunjukkan pemahaman tentang nilai Pancasila. Perlu lebih konsisten dalam penerapannya.',
        'Ananda {nama} mampu menyebutkan nilai-nilai Pancasila. Disarankan untuk lebih banyak mengamalkannya.',
        '{nama} perlu bimbingan untuk mengimplementasikan nilai Pancasila dalam kehidupan sehari-hari.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam memahami dan mengamalkan nilai Pancasila.',
        'Ananda {nama} perlu pendampingan untuk membangun karakter Pancasila.',
        'Mohon dukungan orang tua untuk membiasakan nilai-nilai Pancasila di rumah.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // PENDIDIKAN AGAMA (UMUM - berlaku untuk semua agama)
  // -------------------------------------------------------------------------
  'Pendidikan Agama': {
    'default': {
      ST: [
        '{nama} menunjukkan akhlak mulia dan ketaatan beribadah yang sangat baik.',
        'Ananda {nama} memiliki pemahaman agama yang mendalam dan mengamalkannya dengan konsisten.',
        '{nama} menjadi teladan dalam perilaku beragama di lingkungan sekolah.',
      ],
      SB: [
        '{nama} menunjukkan perilaku beragama yang baik dan perkembangan spiritual yang positif.',
        'Ananda {nama} aktif dalam kegiatan keagamaan dan menunjukkan akhlak yang terpuji.',
        '{nama} mampu mengamalkan ajaran agama dalam kehidupan sehari-hari.',
      ],
      MB: [
        '{nama} mulai menunjukkan perilaku beragama yang baik. Perlu lebih konsisten dalam beribadah.',
        'Ananda {nama} memahami ajaran agama dasar. Disarankan untuk lebih rajin beribadah.',
        '{nama} perlu bimbingan untuk meningkatkan pengamalan ajaran agama.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam pengamalan ajaran agama.',
        'Ananda {nama} perlu pendampingan untuk membangun kebiasaan beribadah.',
        'Mohon dukungan orang tua untuk membiasakan ibadah di rumah.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // PJOK (PENDIDIKAN JASMANI, OLAHRAGA, DAN KESEHATAN)
  // -------------------------------------------------------------------------
  'PJOK': {
    'Keterampilan Gerak': {
      ST: [
        '{nama} menunjukkan keterampilan gerak yang sangat baik. Mampu mempraktikkan berbagai pola gerak dengan teknik yang benar.',
        'Ananda {nama} memiliki kebugaran jasmani prima dan koordinasi gerak yang luar biasa.',
        '{nama} mampu mempraktikkan berbagai olahraga dengan teknik yang matang dan sportif.',
      ],
      SB: [
        '{nama} menunjukkan keterampilan gerak yang baik. Mampu mengikuti berbagai aktivitas jasmani dengan aktif.',
        'Ananda {nama} memiliki perkembangan positif dalam kebugaran jasmani. Perlu meningkatkan stamina.',
        '{nama} aktif dalam kegiatan olahraga dan menunjukkan sportivitas yang baik.',
      ],
      MB: [
        '{nama} mulai menunjukkan keterampilan gerak yang memadai. Perlu lebih rutin berlatih.',
        'Ananda {nama} mampu mengikuti aktivitas jasmani dasar. Disarankan untuk lebih aktif bergerak.',
        '{nama} perlu meningkatkan koordinasi gerak melalui latihan rutin.',
      ],
      BT: [
        '{nama} masih memerlukan banyak latihan dalam keterampilan gerak.',
        'Ananda {nama} perlu pendampingan untuk membangun kebugaran jasmani.',
        'Mohon dukungan orang tua untuk membiasakan aktivitas fisik di rumah.',
      ],
    },
    'Pengetahuan Gerak': {
      ST: [
        '{nama} memahami prinsip-prinsip gerak dengan sangat baik. Mampu menganalisis gerakan dengan kritis.',
        'Ananda {nama} memiliki pemahaman mendalam tentang kesehatan dan kebugaran.',
        '{nama} mampu merancang program latihan sederhana untuk meningkatkan kebugaran.',
      ],
      SB: [
        '{nama} menunjukkan pemahaman yang baik tentang prinsip gerak. Mampu menjelaskan pentingnya aktivitas jasmani.',
        'Ananda {nama} memiliki perkembangan positif dalam memahami konsep kesehatan.',
        '{nama} mampu menerapkan prinsip pemanasan dan pendinginan dengan benar.',
      ],
      MB: [
        '{nama} mulai memahami konsep dasar gerak. Perlu lebih banyak belajar tentang kesehatan.',
        'Ananda {nama} mampu menyebutkan prinsip dasar gerak. Disarankan untuk aktif bertanya.',
        '{nama} perlu memperkuat pemahaman konsep kesehatan dan kebugaran.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam memahami prinsip gerak.',
        'Ananda {nama} perlu pendampingan untuk memahami konsep kesehatan.',
        'Perlu banyak membaca tentang kesehatan untuk membangun pemahaman.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // SENI BUDAYA
  // -------------------------------------------------------------------------
  'Seni Budaya': {
    'default': {
      ST: [
        '{nama} menunjukkan bakat seni yang sangat luar biasa. Mampu menghasilkan karya yang kreatif, orisinal, dan penuh makna.',
        'Ananda {nama} memiliki kemampuan artistik yang unggul dan konsisten menghasilkan karya berkualitas tinggi.',
        '{nama} menunjukkan apresiasi seni yang mendalam dan mampu berkarya dengan ekspresi yang unik.',
      ],
      SB: [
        '{nama} menunjukkan kemampuan seni yang baik. Mampu menghasilkan karya yang menarik dan kreatif.',
        'Ananda {nama} memiliki minat yang kuat terhadap seni dan menunjukkan perkembangan yang positif.',
        '{nama} aktif dalam kegiatan seni dan mampu mengekspresikan diri melalui karya.',
      ],
      MB: [
        '{nama} mulai menunjukkan minat terhadap seni. Perlu lebih banyak latihan untuk mengasah bakat.',
        'Ananda {nama} mampu menghasilkan karya sederhana. Disarankan untuk lebih banyak berlatih.',
        '{nama} perlu mengeksplorasi berbagai teknik seni untuk menemukan gaya pribadinya.',
      ],
      BT: [
        '{nama} perlu lebih banyak berlatih dalam bidang seni. Disarankan untuk mengikuti workshop.',
        'Ananda {nama} masih dalam tahap awal mengembangkan kemampuan seni. Mohon dukungan orang tua.',
        'Perlu banyak mengamati karya seni untuk membangun apresiasi dan inspirasi.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // BAHASA INGGRIS
  // -------------------------------------------------------------------------
  'Bahasa Inggris': {
    'default': {
      ST: [
        '{nama} menunjukkan penguasaan Bahasa Inggris yang sangat baik. Mampu berkomunikasi aktif dan memahami teks kompleks.',
        'Ananda {nama} memiliki kemampuan empat keterampilan bahasa (listening, speaking, reading, writing) yang unggul.',
        '{nama} sangat percaya diri menggunakan Bahasa Inggris dalam berbagai konteks komunikasi.',
      ],
      SB: [
        '{nama} menunjukkan penguasaan Bahasa Inggris yang baik. Mampu memahami teks dan berkomunikasi dengan cukup lancar.',
        'Ananda {nama} memiliki perkembangan yang baik dalam Bahasa Inggris. Perlu lebih banyak latihan speaking.',
        '{nama} mampu memahami teks Bahasa Inggris dan merespons dengan kosakata yang tepat.',
      ],
      MB: [
        '{nama} menunjukkan penguasaan Bahasa Inggris yang cukup. Perlu lebih banyak berlatih vocabulary dan grammar.',
        'Ananda {nama} memahami konsep dasar Bahasa Inggris. Disarankan untuk lebih sering exposure bahasa Inggris.',
        '{nama} perlu meningkatkan kosakata melalui membaca dan menonton konten berbahasa Inggris.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan intensif dalam Bahasa Inggris. Disarankan untuk mengikuti les tambahan.',
        'Ananda {nama} perlu banyak latihan dasar. Mohon dukungan orang tua untuk exposure bahasa Inggris di rumah.',
        'Perlu banyak mendengarkan lagu dan menonton film berbahasa Inggris untuk membangun familiarity.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // INFORMATIKA
  // -------------------------------------------------------------------------
  'Informatika': {
    'default': {
      ST: [
        '{nama} menunjukkan kemampuan berpikir komputasional yang sangat baik. Mampu memecahkan masalah dengan pendekatan algoritmik.',
        'Ananda {nama} memiliki keterampilan teknologi yang unggul dan mampu menggunakan teknologi secara bertanggung jawab.',
        '{nama} mampu menerapkan konsep informatika dalam proyek lintas bidang dengan kreatif.',
      ],
      SB: [
        '{nama} menunjukkan kemampuan informatika yang baik. Mampu menggunakan berbagai aplikasi dengan efektif.',
        'Ananda {nama} memiliki perkembangan positif dalam berpikir komputasional. Perlu meningkatkan logika algoritma.',
        '{nama} mampu menggunakan teknologi untuk menyelesaikan tugas dengan baik.',
      ],
      MB: [
        '{nama} mulai memahami konsep dasar informatika. Perlu lebih banyak berlatih dengan aplikasi.',
        'Ananda {nama} mampu menggunakan aplikasi dasar. Disarankan untuk bereksplorasi lebih lanjut.',
        '{nama} perlu memperkuat pemahaman berpikir komputasional melalui latihan bertahap.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan dalam informatika. Disarankan untuk banyak bereksplorasi dengan teknologi.',
        'Ananda {nama} perlu pendampingan untuk memahami konsep dasar teknologi.',
        'Mohon dukungan orang tua untuk memfasilitasi penggunaan teknologi yang edukatif di rumah.',
      ],
    },
  },

  // -------------------------------------------------------------------------
  // DEFAULT (FALLBACK)
  // -------------------------------------------------------------------------
  'default': {
    'default': {
      ST: [
        '{nama} menunjukkan penguasaan materi yang sangat baik pada {elemen}. Konsisten meraih hasil unggul.',
        'Ananda {nama} memiliki kemampuan yang luar biasa dalam {mapel}. Menjadi teladan bagi teman-temannya.',
        '{nama} mampu menguasai kompetensi {elemen} dengan sangat baik dan mandiri.',
      ],
      SB: [
        '{nama} menunjukkan penguasaan yang baik pada {elemen}. Memiliki perkembangan yang positif.',
        'Ananda {nama} mampu mengikuti pembelajaran {mapel} dengan baik dan aktif.',
        '{nama} mencapai kompetensi {elemen} dengan cukup baik dan konsisten.',
      ],
      MB: [
        '{nama} mulai menunjukkan penguasaan pada {elemen}. Perlu lebih banyak latihan dan bimbingan.',
        'Ananda {nama} memahami konsep dasar {mapel}. Disarankan untuk lebih rajin belajar di rumah.',
        '{nama} masih dalam proses menguasai kompetensi {elemen} dan perlu pendampingan.',
      ],
      BT: [
        '{nama} masih memerlukan bimbingan intensif pada {elemen}. Disarankan untuk remedial dan latihan tambahan.',
        'Ananda {nama} perlu pendampingan khusus dalam {mapel}. Mohon dukungan orang tua untuk belajar bersama.',
        '{nama} belum mencapai kompetensi {elemen}. Perlu intervensi khusus dari guru dan orang tua.',
      ],
    },
  },
};

// ============================================================
// 2. TEMPLATE UMUM PER MATA PELAJARAN (Berdasarkan Nilai Huruf)
// ============================================================

export const templateMapelUmum = {
  'Matematika': {
    A: [
      '{nama} menunjukkan pemahaman yang sangat baik dalam {mapel}. Mampu menyelesaikan soal-soal kompleks dengan tepat dan sistematis.',
      'Ananda {nama} memiliki kemampuan analitis yang luar biasa dalam {mapel}. Konsisten meraih hasil unggul dalam setiap topik.',
      '{nama} menguasai {mapel} dengan sangat baik dan mampu menerapkannya dalam berbagai konteks.',
    ],
    B: [
      '{nama} menunjukkan pemahaman yang baik dalam {mapel}. Mampu menyelesaikan sebagian besar soal dengan benar.',
      'Ananda {nama} memiliki perkembangan yang positif dalam {mapel}. Perlu sedikit peningkatan pada materi kompleks.',
      '{nama} menguasai konsep dasar {mapel} dengan baik dan siap untuk materi lanjutan.',
    ],
    C: [
      '{nama} menunjukkan pemahaman yang cukup dalam {mapel}. Perlu lebih banyak latihan terutama pada konsep dasar.',
      'Ananda {nama} sudah memahami konsep dasar {mapel}. Disarankan untuk lebih rajin berlatih soal.',
      '{nama} mencapai target minimal {mapel} dengan cukup baik, namun perlu peningkatan.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam {mapel}. Disarankan untuk mengikuti remedial dan memperbanyak latihan.',
      'Ananda {nama} masih membutuhkan pendampingan khusus dalam {mapel}. Mohon dukungan orang tua untuk belajar di rumah.',
      '{nama} belum mencapai target minimal {mapel}. Perlu intervensi khusus dari guru dan orang tua.',
    ],
  },

  'Bahasa Indonesia': {
    A: [
      '{nama} memiliki kemampuan berbahasa Indonesia yang sangat baik. Mampu menulis karangan yang runtut dan membaca dengan pemahaman mendalam.',
      'Ananda {nama} menunjukkan minat baca dan tulis yang luar biasa. Kosakata yang digunakan kaya dan variatif.',
      '{nama} menguasai empat keterampilan berbahasa dengan sangat baik.',
    ],
    B: [
      '{nama} memiliki kemampuan berbahasa Indonesia yang baik. Mampu memahami teks dan menulis dengan struktur yang runtut.',
      'Ananda {nama} menunjukkan perkembangan positif dalam keterampilan berbahasa. Perlu memperkaya kosakata.',
      '{nama} mencapai kompetensi berbahasa dengan baik dan konsisten.',
    ],
    C: [
      '{nama} memiliki kemampuan berbahasa Indonesia yang cukup. Perlu lebih banyak berlatih menulis dan membaca.',
      'Ananda {nama} sudah mampu memahami teks sederhana. Disarankan untuk lebih rajin membaca buku cerita.',
      '{nama} mencapai target minimal berbahasa dengan cukup, namun perlu peningkatan.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam keterampilan berbahasa. Disarankan untuk memperbanyak membaca dan menulis setiap hari.',
      'Ananda {nama} masih membutuhkan pendampingan dalam memahami teks. Mohon dukungan orang tua untuk membiasakan membaca di rumah.',
      '{nama} belum mencapai target minimal berbahasa. Perlu intervensi khusus dari guru dan orang tua.',
    ],
  },

  'IPA': {
    A: [
      '{nama} menunjukkan pemahaman yang sangat baik dalam {mapel}. Memiliki rasa ingin tahu yang tinggi dan mampu melakukan eksperimen dengan teliti.',
      'Ananda {nama} memiliki kemampuan analitis yang luar biasa dalam {mapel}. Mampu menghubungkan konsep dengan fenomena alam.',
      '{nama} menguasai {mapel} dengan sangat baik dan menunjukkan keterampilan proses ilmiah yang matang.',
    ],
    B: [
      '{nama} menunjukkan pemahaman yang baik dalam {mapel}. Mampu menjelaskan konsep ilmiah dengan jelas dan sistematis.',
      'Ananda {nama} memiliki minat yang baik terhadap {mapel}. Perlu lebih banyak eksperimen untuk memperkuat pemahaman.',
      '{nama} mencapai kompetensi {mapel} dengan baik dan aktif dalam praktikum.',
    ],
    C: [
      '{nama} menunjukkan pemahaman yang cukup dalam {mapel}. Perlu lebih banyak membaca dan mengamati fenomena alam.',
      'Ananda {nama} sudah memahami konsep dasar {mapel}. Disarankan untuk lebih aktif dalam praktikum.',
      '{nama} mencapai target minimal {mapel} dengan cukup, namun perlu peningkatan.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam {mapel}. Disarankan untuk lebih banyak membaca buku sains dan menonton video edukasi.',
      'Ananda {nama} masih membutuhkan pendampingan dalam memahami konsep {mapel}. Mohon dukungan orang tua untuk mengajak mengamati alam.',
      '{nama} belum mencapai target minimal {mapel}. Perlu intervensi khusus dari guru dan orang tua.',
    ],
  },

  'IPS': {
    A: [
      '{nama} menunjukkan pemahaman yang sangat baik tentang konsep sosial dan sejarah. Mampu menganalisis peristiwa dengan kritis.',
      'Ananda {nama} memiliki wawasan sosial yang luas dan kemampuan analisis yang tajam terhadap isu-isu masyarakat.',
      '{nama} menguasai {mapel} dengan sangat baik dan menunjukkan kepedulian terhadap isu sosial.',
    ],
    B: [
      '{nama} menunjukkan pemahaman yang baik tentang konsep sosial. Mampu menjelaskan peristiwa sejarah dan geografis dengan runtut.',
      'Ananda {nama} memiliki minat yang baik terhadap isu sosial. Perlu lebih banyak membaca untuk memperdalam pemahaman.',
      '{nama} mencapai kompetensi {mapel} dengan baik dan aktif dalam diskusi.',
    ],
    C: [
      '{nama} menunjukkan pemahaman yang cukup tentang konsep sosial. Perlu lebih banyak membaca dan berdiskusi tentang isu terkini.',
      'Ananda {nama} sudah memahami konsep dasar {mapel}. Disarankan untuk lebih aktif mengikuti berita dan diskusi.',
      '{nama} mencapai target minimal {mapel} dengan cukup, namun perlu peningkatan.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam {mapel}. Disarankan untuk lebih banyak membaca buku sejarah dan geografi.',
      'Ananda {nama} masih membutuhkan pendampingan dalam memahami konsep sosial. Mohon dukungan orang tua untuk berdiskusi tentang lingkungan.',
      '{nama} belum mencapai target minimal {mapel}. Perlu intervensi khusus dari guru dan orang tua.',
    ],
  },

  'default': {
    A: [
      '{nama} menunjukkan penguasaan materi yang sangat baik dalam {mapel}. Konsisten meraih hasil unggul dan menjadi teladan.',
      'Ananda {nama} memiliki kemampuan yang luar biasa dalam {mapel}. Sangat aktif dan berprestasi.',
      '{nama} menguasai {mapel} dengan sangat baik dan mampu menerapkannya dalam berbagai konteks.',
    ],
    B: [
      '{nama} menunjukkan penguasaan materi yang baik dalam {mapel}. Memiliki perkembangan yang positif dan konsisten.',
      'Ananda {nama} mampu mengikuti pembelajaran {mapel} dengan baik. Perlu sedikit peningkatan agar lebih unggul.',
      '{nama} mencapai kompetensi {mapel} dengan baik dan aktif dalam pembelajaran.',
    ],
    C: [
      '{nama} menunjukkan penguasaan materi yang cukup dalam {mapel}. Perlu lebih banyak latihan dan bimbingan.',
      'Ananda {nama} sudah memahami konsep dasar {mapel}. Disarankan untuk lebih rajin belajar di rumah.',
      '{nama} mencapai target minimal {mapel} dengan cukup, namun perlu peningkatan.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam {mapel}. Disarankan untuk mengikuti remedial dan memperbanyak latihan.',
      'Ananda {nama} masih membutuhkan pendampingan khusus. Mohon dukungan orang tua untuk belajar bersama di rumah.',
      '{nama} belum mencapai target minimal {mapel}. Perlu intervensi khusus dari guru dan orang tua.',
    ],
  },
};

// ============================================================
// 3. TEMPLATE PROFIL PELAJAR PANCASILA
// ============================================================

export const templatePancasila = {
  beriman: {
    tinggi: [
      '{nama} menunjukkan akhlak mulia dan ketaatan beribadah yang sangat baik. Menjadi teladan dalam perilaku beragama.',
      'Ananda {nama} mampu menjadi teladan dalam perilaku beragama di lingkungan sekolah dan masyarakat.',
      '{nama} menunjukkan toleransi dan penghargaan terhadap perbedaan agama yang sangat baik.',
    ],
    sedang: [
      '{nama} menunjukkan perilaku beragama yang baik dan perlu terus dikembangkan.',
      'Ananda {nama} mulai menunjukkan pemahaman dan pengamalan nilai-nilai agama dengan baik.',
      '{nama} mampu mengamalkan ajaran agama dalam kehidupan sehari-hari.',
    ],
    rendah: [
      '{nama} perlu bimbingan lebih lanjut dalam pengamalan nilai-nilai agama.',
      'Ananda {nama} perlu peningkatan dalam pemahaman dan pengamalan ajaran agama.',
      '{nama} masih memerlukan pendampingan untuk membangun kebiasaan beribadah yang konsisten.',
    ],
  },

  berkebinekaan: {
    tinggi: [
      '{nama} menunjukkan penghargaan yang tinggi terhadap keragaman budaya dan menjadi agen toleransi di sekolah.',
      'Ananda {nama} mampu berinteraksi dengan baik dalam lingkungan yang beragam dan mempromosikan keadilan.',
      '{nama} aktif mempromosikan toleransi dan kebinekaan di lingkungan sekolah.',
    ],
    sedang: [
      '{nama} mulai menunjukkan penghargaan terhadap keragaman dengan baik.',
      'Ananda {nama} mampu berinteraksi dengan teman dari berbagai latar belakang secara harmonis.',
      '{nama} menunjukkan sikap toleransi yang baik dalam pergaulan sehari-hari.',
    ],
    rendah: [
      '{nama} perlu bimbingan dalam memahami dan menghargai keragaman.',
      'Ananda {nama} perlu peningkatan dalam sikap toleransi dan kebinekaan.',
      '{nama} masih memerlukan pendampingan untuk membangun sikap inklusif.',
    ],
  },

  gotongroyong: {
    tinggi: [
      '{nama} menunjukkan semangat gotong royong yang sangat tinggi dan menjadi motor kolaborasi di kelas.',
      'Ananda {nama} aktif berkolaborasi dan membantu teman dalam kegiatan kelompok dengan sukarela.',
      '{nama} menunjukkan kepedulian dan kesediaan berbagi yang luar biasa kepada sesama.',
    ],
    sedang: [
      '{nama} mampu bekerja sama dengan baik dalam kegiatan kelompok.',
      'Ananda {nama} menunjukkan kepedulian terhadap teman dan lingkungan sekolah.',
      '{nama} aktif berpartisipasi dalam kegiatan gotong royong di sekolah.',
    ],
    rendah: [
      '{nama} perlu ditingkatkan dalam kegiatan kolaborasi dan kepedulian sosial.',
      'Ananda {nama} perlu lebih aktif dalam kegiatan gotong royong.',
      '{nama} masih memerlukan dorongan untuk berpartisipasi dalam kegiatan bersama.',
    ],
  },

  mandiri: {
    tinggi: [
      '{nama} menunjukkan kemandirian yang sangat baik dalam belajar dan mengatur diri.',
      'Ananda {nama} mampu mengatur diri dan bertanggung jawab penuh atas tugas-tugasnya.',
      '{nama} menunjukkan inisiatif tinggi dan regulasi diri yang matang dalam pembelajaran.',
    ],
    sedang: [
      '{nama} mulai menunjukkan kemandirian dalam belajar dengan baik.',
      'Ananda {nama} mampu menyelesaikan tugas dengan bimbingan minimal.',
      '{nama} menunjukkan perkembangan positif dalam kemandirian belajar.',
    ],
    rendah: [
      '{nama} perlu bimbingan dalam mengembangkan kemandirian.',
      'Ananda {nama} perlu peningkatan dalam tanggung jawab dan regulasi diri.',
      '{nama} masih memerlukan banyak pendampingan untuk membangun kemandirian.',
    ],
  },

  bernalar: {
    tinggi: [
      '{nama} menunjukkan kemampuan berpikir kritis yang sangat baik dan mampu menganalisis masalah secara mendalam.',
      'Ananda {nama} mampu menganalisis informasi dan mengambil keputusan dengan tepat berdasarkan bukti.',
      '{nama} aktif bertanya dan memberikan argumen yang logis dalam setiap diskusi.',
    ],
    sedang: [
      '{nama} mulai menunjukkan kemampuan berpikir kritis dengan baik.',
      'Ananda {nama} mampu menganalisis informasi dengan bimbingan minimal.',
      '{nama} menunjukkan perkembangan positif dalam kemampuan berpikir kritis.',
    ],
    rendah: [
      '{nama} perlu ditingkatkan dalam kemampuan berpikir kritis.',
      'Ananda {nama} perlu latihan dalam menganalisis dan mengevaluasi informasi.',
      '{nama} masih memerlukan pendampingan untuk membangun kemampuan berpikir kritis.',
    ],
  },

  kreatif: {
    tinggi: [
      '{nama} menunjukkan kreativitas yang luar biasa dalam menghasilkan karya dan gagasan.',
      'Ananda {nama} mampu menghasilkan ide-ide orisinal dan solusi kreatif untuk berbagai masalah.',
      '{nama} aktif berkreasi dan berinovasi dalam berbagai kegiatan dengan hasil yang mengesankan.',
    ],
    sedang: [
      '{nama} mulai menunjukkan kreativitas yang baik dalam berkarya.',
      'Ananda {nama} mampu menghasilkan karya yang menarik dan orisinal.',
      '{nama} menunjukkan perkembangan positif dalam kreativitas.',
    ],
    rendah: [
      '{nama} perlu ditingkatkan dalam kreativitas dan inovasi.',
      'Ananda {nama} perlu stimulasi untuk mengembangkan gagasan orisinal.',
      '{nama} masih memerlukan banyak dorongan untuk mengembangkan kreativitas.',
    ],
  },
};

// ============================================================
// 4. TEMPLATE NARASI UMUM RAPOR
// ============================================================

export const templateUmum = {
  pembuka_rapor: [
    'Puji syukur kehadirat Tuhan Yang Maha Esa. Berikut adalah laporan capaian pembelajaran {nama} pada {semester} Tahun Ajaran {tahun}.',
    'Alhamdulillah, berikut adalah laporan perkembangan {nama} selama {semester} Tahun Ajaran {tahun}.',
    'Berikut adalah laporan capaian pembelajaran {nama} di kelas {kelas} pada {semester} Tahun Ajaran {tahun}.',
  ],

  penutup_rapor: [
    'Demikian laporan capaian pembelajaran ini. Semoga {nama} terus berkembang dan meraih cita-cita.',
    'Kami berharap {nama} terus semangat belajar dan meraih prestasi yang lebih baik di semester berikutnya.',
    'Terima kasih atas kerja sama orang tua dalam mendukung perkembangan {nama} selama semester ini.',
  ],

  rekomendasi_umum: [
    'Orang tua diharapkan terus mendampingi dan memotivasi {nama} dalam belajar di rumah.',
    'Disarankan untuk menciptakan lingkungan belajar yang kondusif di rumah untuk mendukung perkembangan {nama}.',
    'Komunikasi antara guru dan orang tua perlu dijaga untuk mendukung perkembangan optimal {nama}.',
  ],

  catatan_kekuatan: [
    '{nama} adalah siswa yang rajin, aktif, dan memiliki semangat belajar yang tinggi.',
    'Ananda {nama} menunjukkan sikap yang santun, bertanggung jawab, dan menjadi teman yang baik.',
    '{nama} memiliki rasa ingin tahu yang tinggi dan selalu antusias dalam setiap kegiatan pembelajaran.',
    'Ananda {nama} mampu bekerja sama dengan baik dan menunjukkan jiwa kepemimpinan di kelas.',
  ],

  catatan_pengembangan: [
    'Perlu meningkatkan konsentrasi dan fokus dalam mengikuti pembelajaran.',
    'Disarankan untuk lebih aktif bertanya dan berpartisipasi dalam diskusi kelas.',
    'Perlu meningkatkan kemandirian dalam belajar dan menyelesaikan tugas.',
    'Disarankan untuk memperbanyak membaca buku untuk memperluas wawasan.',
  ],
};

// ============================================================
// 5. HELPER FUNCTIONS
// ============================================================

/**
 * Memilih elemen acak dari array
 * @param {Array} arr - Array pilihan
 * @returns {any} Elemen yang dipilih secara acak
 */
const pickRandom = (arr) => {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Mengganti semua placeholder dengan nilai sebenarnya (global replace)
 * @param {string} text - Template kalimat
 * @param {Object} data - Data untuk placeholder
 * @returns {string} Kalimat dengan placeholder yang sudah diganti
 */
const replacePlaceholders = (text, data) => {
  if (!text) return '';
  let result = text;
  Object.entries(data).forEach(([key, value]) => {
    const safeValue = value || '';
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), safeValue);
  });
  return result;
};

/**
 * Generate narasi untuk satu elemen CP
 * @param {Object} params
 * @param {string} params.nama - Nama siswa
 * @param {string} params.mapel - Nama mata pelajaran
 * @param {string} params.elemen - Nama elemen CP
 * @param {string} params.levelKKTP - 'BT', 'MB', 'SB', atau 'ST'
 * @param {string} [params.topik] - Topik spesifik (opsional)
 * @returns {string} Narasi deskripsi
 */
export const generateNarasiElemen = ({ nama, mapel, elemen, levelKKTP, topik = '' }) => {
  const placeholders = { nama, mapel, elemen, topik };
  
  // Cari template, fallback ke default
  const mapelTemplate = templateElemenCP[mapel] || templateElemenCP['default'];
  const elemenTemplate = mapelTemplate[elemen] || mapelTemplate['default'];
  const kalimatList = elemenTemplate?.[levelKKTP];
  
  if (!kalimatList || kalimatList.length === 0) {
    return `${nama} menunjukkan perkembangan dalam ${elemen}.`;
  }
  
  const template = pickRandom(kalimatList);
  return replacePlaceholders(template, placeholders);
};

/**
 * Generate narasi umum untuk satu mata pelajaran (berdasarkan nilai huruf)
 * @param {Object} params
 * @param {string} params.nama - Nama siswa
 * @param {string} params.mapel - Nama mata pelajaran
 * @param {string} params.predikat - 'A', 'B', 'C', atau 'D'
 * @returns {string} Narasi deskripsi
 */
export const generateNarasiMapel = ({ nama, mapel, predikat }) => {
  const placeholders = { nama, mapel };
  
  const mapelTemplate = templateMapelUmum[mapel] || templateMapelUmum['default'];
  const kalimatList = mapelTemplate?.[predikat];
  
  if (!kalimatList || kalimatList.length === 0) {
    return `${nama} menunjukkan penguasaan yang ${predikat === 'A' ? 'sangat baik' : predikat === 'B' ? 'baik' : predikat === 'C' ? 'cukup' : 'perlu bimbingan'} dalam ${mapel}.`;
  }
  
  const template = pickRandom(kalimatList);
  return replacePlaceholders(template, placeholders);
};

/**
 * Generate narasi Profil Pelajar Pancasila
 * @param {Object} params
 * @param {string} params.nama - Nama siswa
 * @param {string} params.dimensi - ID dimensi (beriman, mandiri, dll)
 * @param {string} params.level - 'tinggi', 'sedang', atau 'rendah'
 * @returns {string} Narasi deskripsi
 */
export const generateNarasiPancasila = ({ nama, dimensi, level }) => {
  const placeholders = { nama };
  
  const dimensiTemplate = templatePancasila[dimensi];
  if (!dimensiTemplate) return '';
  
  const kalimatList = dimensiTemplate[level] || dimensiTemplate.sedang;
  const template = pickRandom(kalimatList);
  
  return replacePlaceholders(template, placeholders);
};

/**
 * Generate narasi rapor lengkap untuk satu siswa
 * @param {Object} data
 * @returns {string} Narasi rapor lengkap
 */
export const generateNarasiRaporLengkap = (data) => {
  const {
    nama,
    kelas,
    semester,
    tahun,
    mapel_data = [],
    pancasila_data = [],
    catatan_wali = '',
  } = data;
  
  const placeholders = { nama, kelas, semester, tahun };
  
  // 1. Pembuka
  let narasi = replacePlaceholders(pickRandom(templateUmum.pembuka_rapor), placeholders);
  
  // 2. Catatan kekuatan
  narasi += '\n\n' + pickRandom(templateUmum.catatan_kekuatan).replace(/{nama}/g, nama);
  
  // 3. Narasi per mata pelajaran
  narasi += '\n\n';
  mapel_data.forEach(mapel => {
    narasi += `\n${mapel.mapel}:\n`;
    narasi += generateNarasiMapel({
      nama,
      mapel: mapel.mapel,
      predikat: mapel.predikat,
    });
    
    // Narasi per elemen jika ada
    if (mapel.elemen_data && mapel.elemen_data.length > 0) {
      mapel.elemen_data.forEach(elemen => {
        narasi += '\n- ' + generateNarasiElemen({
          nama,
          mapel: mapel.mapel,
          elemen: elemen.nama,
          levelKKTP: elemen.levelKKTP,
          topik: elemen.topik || '',
        });
      });
    }
  });
  
  // 4. Narasi Profil Pancasila
  if (pancasila_data.length > 0) {
    narasi += '\n\nProfil Pelajar Pancasila:\n';
    pancasila_data.forEach(pp => {
      narasi += '- ' + generateNarasiPancasila({
        nama,
        dimensi: pp.dimensi,
        level: pp.level,
      }) + '\n';
    });
  }
  
  // 5. Catatan wali (jika ada)
  if (catatan_wali) {
    narasi += `\nCatatan Wali Kelas:\n${catatan_wali}`;
  } else {
    narasi += '\n\n' + pickRandom(templateUmum.catatan_pengembangan).replace(/{nama}/g, nama);
  }
  
  // 6. Penutup
  narasi += '\n\n' + replacePlaceholders(pickRandom(templateUmum.penutup_rapor), placeholders);
  narasi += ' ' + replacePlaceholders(pickRandom(templateUmum.rekomendasi_umum), placeholders);
  
  return narasi;
};

/**
 * Konversi nilai numerik ke predikat huruf
 * @param {number} angka - Nilai numerik (0-100)
 * @returns {string} Predikat huruf (A, B, C, D)
 */
export const getPredikatDariNilai = (angka) => {
  if (angka >= 90) return 'A';
  if (angka >= 80) return 'B';
  if (angka >= 70) return 'C';
  return 'D';
};

/**
 * Konversi predikat huruf ke label
 * @param {string} predikat - 'A', 'B', 'C', atau 'D'
 * @returns {string} Label predikat
 */
export const getPredikatLabel = (predikat) => {
  const labels = {
    A: 'Sangat Baik',
    B: 'Baik',
    C: 'Cukup',
    D: 'Perlu Bimbingan',
  };
  return labels[predikat] || predikat;
};

/**
 * Konversi level KKTP ke label
 * @param {string} level - 'BT', 'MB', 'SB', atau 'ST'
 * @returns {string} Label level
 */
export const getKKTPLabel = (level) => {
  const labels = {
    BT: 'Belum Tercapai',
    MB: 'Mulai Berkembang',
    SB: 'Sedang Berkembang',
    ST: 'Sudah Tercapai',
  };
  return labels[level] || level;
};

/**
 * Preview template (untuk testing dan UI)
 * @param {string} type - Jenis template ('elemen', 'mapel', 'pancasila', 'umum')
 * @param {Object} [filter] - Filter spesifik
 * @returns {Object} Template yang diminta
 */
export const previewTemplate = (type, filter = {}) => {
  switch (type) {
    case 'elemen':
      return templateElemenCP[filter.mapel] || templateElemenCP['default'];
    case 'mapel':
      return templateMapelUmum[filter.mapel] || templateMapelUmum['default'];
    case 'pancasila':
      return templatePancasila[filter.dimensi] || templatePancasila;
    case 'umum':
      return templateUmum;
    default:
      return null;
  }
};

// ============================================================
// EKSPOR DEFAULT
// ============================================================

export default {
  templateElemenCP,
  templateMapelUmum,
  templatePancasila,
  templateUmum,
  generateNarasiElemen,
  generateNarasiMapel,
  generateNarasiPancasila,
  generateNarasiRaporLengkap,
  getPredikatDariNilai,
  getPredikatLabel,
  getKKTPLabel,
  previewTemplate,
};