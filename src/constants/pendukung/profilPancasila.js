/**
 * PROFIL PELAJAR PANCASILA - TEACHERAI
 * 
 * Sumber: Dokumen Profil Pelajar Pancasila - Kemendikbud Ristek
 * 
 * Profil Pelajar Pancasila merupakan kompetensi dan karakter yang harus 
 * dicapai peserta didik berdasarkan nilai-nilai luhur Pancasila.
 * 
 * Terdiri dari 6 dimensi:
 * 1. Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia
 * 2. Berkebinekaan Global
 * 3. Bergotong Royong
 * 4. Mandiri
 * 5. Bernalar Kritis
 * 6. Kreatif
 * 
 * Setiap dimensi memiliki elemen-elemen yang lebih spesifik.
 */

export const PROFIL_PANCASILA = [
  // =========================================================================
  // DIMENSI 1: BERIMAN, BERTAKWA KEPADA TUHAN YME, DAN BERAKHLAK MULIA
  // =========================================================================
  {
    id: 'beriman',
    nama: 'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
    namaPendek: 'Beriman & Berakhlak',
    icon: '🕌',
    color: '#1B4332',      // Warna utama (teks)
    accent: '#52B788',     // Warna aksen (border, highlight)
    light: '#F0FFF7',      // Warna background terang
    desc: 'Menjalankan ajaran agama, menghargai sesama, dan menjaga alam sebagai wujud akhlak mulia.',
    elemen: [
      'Akhlak Beragama',
      'Akhlak Pribadi',
      'Akhlak kepada Manusia',
      'Akhlak kepada Alam',
      'Akhlak Bernegara'
    ],
    deskripsiElemen: {
      'Akhlak Beragama': 'Memahami dan mengamalkan ajaran agama, serta membangun dialog antar umat beragama.',
      'Akhlak Pribadi': 'Jujur, integritas, tanggung jawab, disiplin, dan kerja keras.',
      'Akhlak kepada Manusia': 'Saling menghormati, mencintai, dan tolong-menolong antar sesama.',
      'Akhlak kepada Alam': 'Menjaga kelestarian lingkungan dan melestarikan alam.',
      'Akhlak Bernegara': 'Cinta tanah air, bela negara, dan berpartisipasi dalam pembangunan.'
    }
  },

  // =========================================================================
  // DIMENSI 2: BERKEBINEKAAN GLOBAL
  // =========================================================================
  {
    id: 'berkebinekaan',
    nama: 'Berkebinekaan Global',
    namaPendek: 'Berkebinekaan',
    icon: '🌏',
    color: '#1D3557',
    accent: '#457B9D',
    light: '#F0F7FF',
    desc: 'Menghargai budaya, berkomunikasi antar budaya, dan berkeadilan sosial dalam konteks global.',
    elemen: [
      'Mengenal dan Menghargai Budaya',
      'Komunikasi dan Interaksi Antar Budaya',
      'Refleksi dan Tanggung Jawab terhadap Pengalaman Kebinekaan',
      'Berkeadilan Sosial'
    ],
    deskripsiElemen: {
      'Mengenal dan Menghargai Budaya': 'Memahami keragaman budaya lokal, nasional, dan global.',
      'Komunikasi dan Interaksi Antar Budaya': 'Mampu berinteraksi dengan orang dari budaya berbeda.',
      'Refleksi dan Tanggung Jawab terhadap Pengalaman Kebinekaan': 'Merefleksikan pengalaman keberagaman dan mengambil tanggung jawab.',
      'Berkeadilan Sosial': 'Memperjuangkan keadilan dan kesetaraan bagi semua orang.'
    }
  },

  // =========================================================================
  // DIMENSI 3: BERGOTONG ROYONG
  // =========================================================================
  {
    id: 'gotongroyong',
    nama: 'Bergotong Royong',
    namaPendek: 'Gotong Royong',
    icon: '🤝',
    color: '#3D2B1F',
    accent: '#C9784B',
    light: '#FFF8F0',
    desc: 'Kemampuan untuk melakukan kegiatan secara bersama-sama dengan suka rela demi kelancaran kegiatan.',
    elemen: [
      'Kolaborasi',
      'Kepedulian',
      'Berbagi'
    ],
    deskripsiElemen: {
      'Kolaborasi': 'Kemampuan bekerja sama dengan orang lain untuk mencapai tujuan bersama.',
      'Kepedulian': 'Perhatian dan tindakan untuk membantu orang lain dan lingkungan sekitar.',
      'Berbagi': 'Kesediaan untuk memberikan apa yang dimiliki kepada orang lain yang membutuhkan.'
    }
  },

  // =========================================================================
  // DIMENSI 4: MANDIRI
  // =========================================================================
  {
    id: 'mandiri',
    nama: 'Mandiri',
    namaPendek: 'Mandiri',
    icon: '🎯',
    color: '#81B29A',
    accent: '#3D405B',
    light: '#F5F7FA',
    desc: 'Kemampuan untuk mengatur diri sendiri, bertanggung jawab atas proses dan hasil belajar.',
    elemen: [
      'Pemahaman Diri dan Situasi yang Dihadapi',
      'Regulasi Diri'
    ],
    deskripsiElemen: {
      'Pemahaman Diri dan Situasi yang Dihadapi': 'Memahami kekuatan, kelemahan, emosi, dan situasi yang dihadapi.',
      'Regulasi Diri': 'Mengatur pikiran, perasaan, dan perilaku untuk mencapai tujuan.'
    }
  },

  // =========================================================================
  // DIMENSI 5: BERNALAR KRITIS
  // =========================================================================
  {
    id: 'bernalar',
    nama: 'Bernalar Kritis',
    namaPendek: 'Bernalar Kritis',
    icon: '🧠',
    color: '#D62828',
    accent: '#E07A5F',
    light: '#FFF0EC',
    desc: 'Kemampuan untuk memproses informasi, menganalisis, dan mengambil keputusan secara kritis.',
    elemen: [
      'Memperoleh dan Memproses Informasi dan Gagasan',
      'Menganalisis dan Mengevaluasi Penalaran',
      'Merefleksi Pemikiran dan Proses Berpikir',
      'Mengambil Keputusan'
    ],
    deskripsiElemen: {
      'Memperoleh dan Memproses Informasi dan Gagasan': 'Mengidentifikasi, mengumpulkan, dan mengolah informasi dari berbagai sumber.',
      'Menganalisis dan Mengevaluasi Penalaran': 'Menganalisis argumen, mengevaluasi bukti, dan menilai validitas informasi.',
      'Merefleksi Pemikiran dan Proses Berpikir': 'Merefleksikan cara berpikir sendiri dan mengidentifikasi bias.',
      'Mengambil Keputusan': 'Mengambil keputusan yang tepat berdasarkan analisis dan evaluasi.'
    }
  },

  // =========================================================================
  // DIMENSI 6: KREATIF
  // =========================================================================
  {
    id: 'kreatif',
    nama: 'Kreatif',
    namaPendek: 'Kreatif',
    icon: '💡',
    color: '#F2CC8F',
    accent: '#7A5F00',
    light: '#FFFBF0',
    desc: 'Kemampuan untuk menghasilkan gagasan, karya, dan tindakan yang orisinal dan bermakna.',
    elemen: [
      'Menghasilkan Gagasan yang Original',
      'Menghasilkan Karya dan Tindakan yang Original',
      'Memiliki Keluwesan Berpikir dalam Mencari Alternatif Solusi Masalah'
    ],
    deskripsiElemen: {
      'Menghasilkan Gagasan yang Original': 'Menghasilkan ide-ide baru yang belum pernah ada sebelumnya.',
      'Menghasilkan Karya dan Tindakan yang Original': 'Menciptakan karya atau melakukan tindakan yang unik dan bermakna.',
      'Memiliki Keluwesan Berpikir dalam Mencari Alternatif Solusi Masalah': 'Mampu berpikir fleksibel dan menemukan berbagai solusi untuk masalah.'
    }
  }
];

// ============================================================
// HELPER FUNCTIONS UNTUK PROFIL PANCASILA
// ============================================================

/**
 * Mendapatkan dimensi berdasarkan ID
 * @param {string} id - ID dimensi (beriman, berkebinekaan, dll)
 * @returns {Object} Data dimensi
 */
export const getDimensiById = (id) => {
  return PROFIL_PANCASILA.find(d => d.id === id) || null;
};

/**
 * Mendapatkan total elemen dari semua dimensi
 * @returns {number} Total elemen
 */
export const getTotalElemen = () => {
  return PROFIL_PANCASILA.reduce((total, dimensi) => total + dimensi.elemen.length, 0);
};

/**
 * Mendapatkan semua elemen dalam format flat
 * @returns {Array} Array semua elemen dengan info dimensi
 */
export const getAllElemen = () => {
  const allElemen = [];
  PROFIL_PANCASILA.forEach(dimensi => {
    dimensi.elemen.forEach(elemen => {
      allElemen.push({
        dimensi_id: dimensi.id,
        dimensi_nama: dimensi.nama,
        dimensi_icon: dimensi.icon,
        elemen: elemen,
        deskripsi: dimensi.deskripsiElemen[elemen]
      });
    });
  });
  return allElemen;
};

/**
 * Mendapatkan dimensi berdasarkan nama elemen
 * @param {string} elemenNama - Nama elemen
 * @returns {Object} Data dimensi yang berisi elemen tersebut
 */
export const getDimensiByElemen = (elemenNama) => {
  return PROFIL_PANCASILA.find(d => d.elemen.includes(elemenNama)) || null;
};

// ============================================================
// EKSPOR DEFAULT
// ============================================================

export default PROFIL_PANCASILA;