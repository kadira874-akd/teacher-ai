/**
 * TEMPLATE DESKRIPSI EKSTRAKURIKULER - TEACHERAI
 * 
 * Fungsi: Menghasilkan narasi rapor ekstrakurikuler yang personal, 
 * mendidik, dan bervariasi berdasarkan predikat (SB, B, C, PB).
 * 
 * Placeholder yang didukung:
 * - {nama}       : Nama siswa
 * - {namaEkskul} : Nama kegiatan ekstrakurikuler
 */

export const TEMPLATE_EKSKUL = {
  // =========================================================================
  // PRAMUKA
  // =========================================================================
  'Pramuka': {
    SB: [
      '{nama} menunjukkan keterampilan kepramukaan yang sangat baik. Aktif sebagai pemimpin regu dan menjadi teladan yang luar biasa bagi teman-temannya dalam kegiatan {namaEkskul}.',
      'Ananda {nama} memiliki jiwa kepemimpinan dan semangat kepramukaan yang tinggi. Konsisten menunjukkan kemandirian dan kerja sama tim yang unggul.',
    ],
    B: [
      '{nama} menunjukkan keterampilan kepramukaan yang baik. Aktif mengikuti kegiatan dan mampu bekerja sama dengan baik dalam regunya.',
      'Ananda {nama} memiliki perkembangan yang positif dalam kegiatan {namaEkskul}. Mampu mengikuti rangkaian kegiatan dengan antusias dan tertib.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan {namaEkskul}. Perlu lebih aktif dan berani mengambil peran dalam kegiatan kelompok.',
      'Ananda {nama} mulai memahami dasar-dasar kepramukaan. Disarankan untuk lebih meningkatkan partisipasi dan semangat dalam setiap latihan.',
    ],
    PB: [
      '{nama} perlu lebih aktif mengikuti kegiatan {namaEkskul}. Disarankan untuk lebih semangat dalam berlatih dan membangun kerja sama dengan teman.',
      'Ananda {nama} masih memerlukan bimbingan dan motivasi lebih dalam kegiatan kepramukaan. Mohon dukungan orang tua untuk mendorong kemandiriannya.',
    ],
  },

  // =========================================================================
  // PMR (PALANG MERAH REMAJA)
  // =========================================================================
  'PMR': {
    SB: [
      '{nama} menunjukkan kemampuan pertolongan pertama dan kepedulian sosial yang sangat baik. Selalu sigap dan menjadi andalan dalam kegiatan {namaEkskul}.',
      'Ananda {nama} memiliki pengetahuan kesehatan yang luas dan keterampilan medis dasar yang unggul, serta selalu siap membantu sesama.',
    ],
    B: [
      '{nama} menunjukkan kemampuan pertolongan pertama yang baik. Mampu mengikuti kegiatan {namaEkskul} dengan aktif dan bertanggung jawab.',
      'Ananda {nama} memiliki minat yang baik terhadap kegiatan kesehatan. Menunjukkan sikap empati dan sigap saat simulasi pertolongan.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan {namaEkskul}. Perlu lebih banyak latihan untuk menguasai keterampilan dasar dengan lebih percaya diri.',
      'Ananda {nama} mulai memahami dasar-dasar pertolongan pertama. Disarankan untuk lebih aktif bertanya dan berlatih dalam setiap pertemuan.',
    ],
    PB: [
      '{nama} perlu lebih aktif mengikuti kegiatan {namaEkskul}. Disarankan untuk lebih semangat dalam mempelajari keterampilan dasar kesehatan.',
      'Ananda {nama} masih memerlukan bimbingan dalam kegiatan PMR. Mohon dukungan orang tua untuk mendorong keberanian dan kepeduliannya.',
    ],
  },

  // =========================================================================
  // OSIS
  // =========================================================================
  'OSIS': {
    SB: [
      '{nama} menunjukkan kepemimpinan dan kemampuan organisasi yang sangat baik. Sangat aktif dalam merencanakan dan melaksanakan program kerja {namaEkskul} dengan efektif.',
      'Ananda {nama} memiliki kemampuan manajerial yang luar biasa. Mampu mengkoordinir teman sebaya dan menjadi motor penggerak kegiatan sekolah.',
    ],
    B: [
      '{nama} menunjukkan kemampuan organisasi yang baik. Aktif berpartisipasi dan memberikan ide-ide positif dalam kegiatan {namaEkskul}.',
      'Ananda {nama} memiliki minat yang kuat terhadap kegiatan kepemimpinan. Mampu menjalankan tugas yang diberikan dengan tanggung jawab.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan organisasi. Perlu lebih proaktif dalam menyampaikan gagasan dan berpartisipasi.',
      'Ananda {nama} mulai memahami pentingnya berorganisasi. Disarankan untuk lebih berani mengambil peran dalam kegiatan {namaEkskul}.',
    ],
    PB: [
      '{nama} perlu lebih aktif dalam kegiatan {namaEkskul}. Disarankan untuk lebih berani mengemukakan pendapat dan terlibat dalam kepanitiaan.',
      'Ananda {nama} masih memerlukan dorongan untuk berpartisipasi dalam kegiatan organisasi. Mohon dukungan untuk membangun rasa percaya dirinya.',
    ],
  },

  // =========================================================================
  // PASKIBRA
  // =========================================================================
  'Paskibra': {
    SB: [
      '{nama} menunjukkan kedisiplinan, fisik, dan mental yang sangat prima. Menjadi anggota inti yang diandalkan dalam upacara dan kegiatan {namaEkskul}.',
      'Ananda {nama} memiliki postur dan mental kepemimpinan yang luar biasa. Konsisten menunjukkan kekompakan dan ketertiban yang menjadi teladan.',
    ],
    B: [
      '{nama} menunjukkan kedisiplinan dan kemampuan baris-berbaris yang baik. Aktif mengikuti latihan {namaEkskul} dengan sungguh-sungguh.',
      'Ananda {nama} memiliki perkembangan fisik dan mental yang positif. Mampu mengikuti instruksi dengan baik dan bekerja sama dalam formasi.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan {namaEkskul}. Perlu meningkatkan kedisiplinan dan ketahanan fisik melalui latihan rutin.',
      'Ananda {nama} mulai memahami dasar-dasar baris-berbaris. Disarankan untuk lebih fokus dan serius selama latihan berlangsung.',
    ],
    PB: [
      '{nama} perlu lebih aktif dan disiplin dalam mengikuti kegiatan {namaEkskul}. Disarankan untuk lebih menjaga kondisi fisik dan semangat berlatih.',
      'Ananda {nama} masih memerlukan bimbingan dalam hal kedisiplinan. Mohon dukungan orang tua untuk memotivasi ketahanan mental dan fisiknya.',
    ],
  },

  // =========================================================================
  // SENI (MUSIK, TARI, RUPA, TEATER)
  // =========================================================================
  'Seni': {
    SB: [
      '{nama} menunjukkan bakat dan apresiasi seni yang sangat luar biasa. Mampu menghasilkan karya yang kreatif, orisinal, dan penuh makna dalam kegiatan {namaEkskul}.',
      'Ananda {nama} memiliki kemampuan artistik yang unggul. Konsisten menunjukkan ekspresi diri yang positif dan berkualitas tinggi.',
    ],
    B: [
      '{nama} menunjukkan kemampuan seni yang baik. Mampu menghasilkan karya yang menarik dan mengikuti kegiatan {namaEkskul} dengan kreatif.',
      'Ananda {nama} memiliki minat yang kuat terhadap seni dan menunjukkan perkembangan teknik yang positif dari waktu ke waktu.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam bidang seni. Perlu lebih banyak latihan dan eksplorasi untuk mengasah bakat yang dimiliki.',
      'Ananda {nama} mulai menunjukkan minat terhadap kegiatan {namaEkskul}. Disarankan untuk lebih banyak berlatih di rumah guna meningkatkan kepercayaan diri.',
    ],
    PB: [
      '{nama} perlu lebih banyak berlatih dalam bidang seni. Disarankan untuk mengikuti workshop atau lebih aktif mengamati karya seni di sekitarnya.',
      'Ananda {nama} masih dalam tahap awal mengembangkan kemampuan seni. Mohon dukungan orang tua untuk menyediakan sarana berlatih di rumah.',
    ],
  },

  // =========================================================================
  // OLAHRAGA (FUTSAL, BASKET, VOLI, BADMINTON, DLL)
  // =========================================================================
  'Olahraga': {
    SB: [
      '{nama} menunjukkan kemampuan olahraga yang sangat baik. Aktif dalam latihan dan kompetisi dengan prestasi yang unggul serta sportivitas yang tinggi.',
      'Ananda {nama} memiliki kebugaran fisik prima dan keterampilan teknik {namaEkskul} yang luar biasa. Menjadi pemain kunci yang diandalkan tim.',
    ],
    B: [
      '{nama} menunjukkan kemampuan olahraga yang baik. Aktif mengikuti latihan {namaEkskul} dan menunjukkan perkembangan teknik yang positif.',
      'Ananda {nama} memiliki minat yang kuat terhadap olahraga. Konsisten dalam latihan dan mampu bekerja sama dengan baik dalam tim.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan {namaEkskul}. Perlu lebih rutin berlatih untuk meningkatkan stamina dan penguasaan teknik.',
      'Ananda {nama} mulai menunjukkan minat terhadap olahraga. Disarankan untuk lebih aktif dalam latihan fisik dan permainan tim.',
    ],
    PB: [
      '{nama} perlu lebih aktif dalam kegiatan {namaEkskul}. Disarankan untuk lebih rajin berlatih dan menjaga pola hidup sehat untuk kebugaran.',
      'Ananda {nama} masih memerlukan dorongan untuk berpartisipasi dalam kegiatan olahraga. Mohon dukungan untuk membangun kebiasaan bergerak aktif.',
    ],
  },

  // =========================================================================
  // KEROKHANIAN (ROHIS, ROHKRIS, DLL)
  // =========================================================================
  'Kerohanian': {
    SB: [
      '{nama} menunjukkan akhlak mulia dan ketaatan beribadah yang sangat baik. Aktif menggerakkan kegiatan {namaEkskul} dan menjadi teladan bagi teman sebaya.',
      'Ananda {nama} memiliki pemahaman agama yang baik dan konsisten mengamalkannya. Sangat aktif dalam kegiatan sosial keagamaan di sekolah.',
    ],
    B: [
      '{nama} menunjukkan perilaku beragama yang baik dan perkembangan spiritual yang positif. Aktif mengikuti kegiatan {namaEkskul} dengan tertib.',
      'Ananda {nama} memiliki minat yang baik terhadap pendalaman agama. Mampu bekerja sama dalam menyiapkan kegiatan keagamaan di sekolah.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan {namaEkskul}. Perlu lebih meningkatkan partisipasi dalam ibadah dan kajian bersama.',
      'Ananda {nama} mulai memahami pentingnya kegiatan rohani. Disarankan untuk lebih aktif mengikuti jadwal kegiatan yang telah ditentukan.',
    ],
    PB: [
      '{nama} perlu lebih aktif mengikuti kegiatan {namaEkskul}. Disarankan untuk lebih meningkatkan motivasi dalam memperdalam nilai-nilai keagamaan.',
      'Ananda {nama} masih memerlukan bimbingan dan motivasi dalam kegiatan kerohanian. Mohon dukungan orang tua untuk membiasakan ibadah di rumah.',
    ],
  },

  // =========================================================================
  // SAINS & TEKNOLOGI (KIR, ROBOTIK, CODING)
  // =========================================================================
  'Sains & Teknologi': {
    SB: [
      '{nama} menunjukkan kemampuan analitis dan inovasi yang sangat baik. Aktif menghasilkan karya atau penelitian yang kreatif dalam kegiatan {namaEkskul}.',
      'Ananda {nama} memiliki rasa ingin tahu yang tinggi dan keterampilan teknis yang unggul. Mampu memecahkan masalah dengan pendekatan yang sistematis.',
    ],
    B: [
      '{nama} menunjukkan kemampuan sains dan teknologi yang baik. Mampu mengikuti instruksi teknis dan berpartisipasi aktif dalam proyek {namaEkskul}.',
      'Ananda {nama} memiliki minat yang kuat terhadap dunia teknologi. Menunjukkan perkembangan logika dan kreativitas yang positif.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan {namaEkskul}. Perlu lebih banyak membaca dan bereksperimen untuk memperdalam pemahaman.',
      'Ananda {nama} mulai memahami dasar-dasar sains/teknologi. Disarankan untuk lebih aktif bertanya dan mencoba membuat proyek sederhana.',
    ],
    PB: [
      '{nama} perlu lebih aktif dalam kegiatan {namaEkskul}. Disarankan untuk lebih banyak mengeksplorasi teknologi dan sains melalui video atau buku.',
      'Ananda {nama} masih memerlukan pendampingan dalam memahami konsep teknis. Mohon dukungan orang tua untuk memfasilitasi rasa ingin tahunya.',
    ],
  },

  // =========================================================================
  // BAHASA (ENGLISH CLUB, JURNALISTIK, DEBAT)
  // =========================================================================
  'Bahasa': {
    SB: [
      '{nama} menunjukkan kemampuan komunikasi dan literasi yang sangat baik. Aktif dan percaya diri dalam menyampaikan gagasan melalui kegiatan {namaEkskul}.',
      'Ananda {nama} memiliki perbendaharaan kata yang kaya dan kemampuan public speaking yang unggul. Menjadi kontributor utama dalam kegiatan ini.',
    ],
    B: [
      '{nama} menunjukkan kemampuan berbahasa yang baik. Mampu berpartisipasi dalam diskusi atau penulisan dengan struktur yang runtut.',
      'Ananda {nama} memiliki minat yang positif terhadap pengembangan bahasa. Menunjukkan peningkatan kepercayaan diri saat tampil atau menulis.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan {namaEkskul}. Perlu lebih banyak membaca dan berlatih untuk meningkatkan kelancaran.',
      'Ananda {nama} mulai menunjukkan minat dalam kegiatan bahasa. Disarankan untuk lebih berani mengemukakan pendapat di depan forum.',
    ],
    PB: [
      '{nama} perlu lebih aktif dalam kegiatan {namaEkskul}. Disarankan untuk lebih banyak berlatih berbicara atau menulis secara rutin.',
      'Ananda {nama} masih memerlukan dorongan untuk berpartisipasi. Mohon dukungan orang tua untuk membiasakan komunikasi yang baik di rumah.',
    ],
  },

  // =========================================================================
  // DEFAULT (FALLBACK UNTUK EKSKUL YANG TIDAK TERDAFTAR)
  // =========================================================================
  'default': {
    SB: [
      '{nama} menunjukkan dedikasi dan kemampuan yang sangat baik dalam kegiatan {namaEkskul}. Aktif, berprestasi, dan menjadi teladan positif.',
      'Ananda {nama} memiliki minat yang luar biasa dan konsisten meraih hasil yang unggul dalam kegiatan {namaEkskul}.',
    ],
    B: [
      '{nama} menunjukkan kemampuan yang baik dalam kegiatan {namaEkskul}. Aktif mengikuti kegiatan dan menunjukkan perkembangan yang positif.',
      'Ananda {nama} memiliki sikap yang baik dan mampu bekerja sama dengan teman-teman dalam kegiatan {namaEkskul}.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan {namaEkskul}. Perlu lebih meningkatkan keaktifan dan partisipasi.',
      'Ananda {nama} mulai menunjukkan minat. Disarankan untuk lebih fokus dan aktif dalam setiap sesi kegiatan {namaEkskul}.',
    ],
    PB: [
      '{nama} perlu lebih aktif dan semangat dalam mengikuti kegiatan {namaEkskul}. Disarankan untuk lebih rajin berlatih.',
      'Ananda {nama} masih memerlukan bimbingan dan dorongan motivasi. Mohon dukungan orang tua untuk lebih mendorong partisipasinya.',
    ],
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate deskripsi narasi rapor untuk ekstrakurikuler
 * @param {string} namaSiswa - Nama lengkap siswa
 * @param {string} namaEkskul - Nama kegiatan ekstrakurikuler
 * @param {string} predikat - 'SB', 'B', 'C', atau 'PB'
 * @returns {string} Kalimat deskripsi yang sudah di-replace
 */
export function generateDeskripsiEkskul(namaSiswa, namaEkskul, predikat) {
  if (!predikat || predikat === '') {
    return 'Belum dinilai.';
  }

  // Normalisasi nama ekskul (hapus spasi depan/belakang)
  const normalizedEkskul = namaEkskul ? namaEkskul.trim() : '';
  
  // Cari template, fallback ke 'default' jika tidak ditemukan
  const ekskulTemplates = templateEkskul[normalizedEkskul] || templateEkskul['default'];
  const kalimatList = ekskulTemplates[predikat];
  
  if (!kalimatList || kalimatList.length === 0) {
    return 'Belum ada deskripsi untuk predikat ini.';
  }

  // Pilih kalimat secara acak untuk variasi
  const randomIndex = Math.floor(Math.random() * kalimatList.length);
  let template = kalimatList[randomIndex];

  // Ganti SEMUA instance placeholder (menggunakan regex global /g)
  template = template.replace(/{nama}/g, namaSiswa);
  template = template.replace(/{namaEkskul}/g, normalizedEkskul || 'ekstrakurikuler');

  return template;
}

/**
 * Mendapatkan label teks yang ramah dibaca dari kode predikat
 * @param {string} predikat - 'SB', 'B', 'C', atau 'PB'
 * @returns {string} Label predikat (misal: 'Sangat Baik')
 */
export function getPredikatEkskulLabel(predikat) {
  const labels = {
    SB: 'Sangat Baik',
    B: 'Baik',
    C: 'Cukup',
    PB: 'Perlu Bimbingan',
  };
  return labels[predikat] || predikat;
}

/**
 * Mendapatkan daftar semua predikat yang tersedia
 * @returns {Array} Array objek predikat
 */
export function getDaftarPredikatEkskul() {
  return [
    { value: 'SB', label: 'Sangat Baik (SB)' },
    { value: 'B', label: 'Baik (B)' },
    { value: 'C', label: 'Cukup (C)' },
    { value: 'PB', label: 'Perlu Bimbingan (PB)' },
  ];
}

// ============================================================
// EKSPOR DEFAULT
// ============================================================
export default TEMPLATE_EKSKUL;