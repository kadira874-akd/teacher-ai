// Bank kalimat deskripsi untuk Ekstrakurikuler
// Predikat: SB (Sangat Baik), B (Baik), C (Cukup), PB (Perlu Bimbingan)

export const templateEkskul = {
  'Pramuka': {
    SB: [
      '{nama} menunjukkan keterampilan kepramukaan yang sangat baik. Aktif sebagai pemimpin regu dan menjadi teladan bagi teman-temannya.',
      'Ananda {nama} memiliki kemampuan kepemimpinan dan kerja sama tim yang luar biasa dalam kegiatan pramuka.',
    ],
    B: [
      '{nama} menunjukkan keterampilan kepramukaan yang baik. Aktif mengikuti kegiatan dan mampu bekerja sama dengan baik.',
      'Ananda {nama} memiliki perkembangan positif dalam kegiatan pramuka. Mampu mengikuti kegiatan dengan antusias.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan pramuka. Perlu lebih aktif dalam kegiatan kelompok.',
      'Ananda {nama} mulai memahami dasar-dasar kepramukaan. Disarankan untuk lebih aktif berpartisipasi.',
    ],
    PB: [
      '{nama} perlu lebih aktif mengikuti kegiatan pramuka. Disarankan untuk lebih semangat dalam berlatih.',
      'Ananda {nama} masih memerlukan bimbingan dalam kegiatan kepramukaan. Mohon dukungan untuk lebih rajin berlatih.',
    ],
  },
  'PMR': {
    SB: [
      '{nama} menunjukkan kemampuan pertolongan pertama yang sangat baik. Aktif dan sigap dalam kegiatan PMR.',
      'Ananda {nama} memiliki pengetahuan kesehatan yang luas dan keterampilan medis dasar yang unggul.',
    ],
    B: [
      '{nama} menunjukkan kemampuan pertolongan pertama yang baik. Mampu mengikuti kegiatan PMR dengan aktif.',
      'Ananda {nama} memiliki minat yang baik terhadap kegiatan kesehatan dan pertolongan pertama.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan PMR. Perlu lebih banyak latihan keterampilan dasar.',
      'Ananda {nama} mulai memahami dasar-dasar pertolongan pertama. Disarankan untuk lebih aktif berlatih.',
    ],
    PB: [
      '{nama} perlu lebih aktif mengikuti kegiatan PMR. Disarankan untuk lebih semangat dalam mempelajari keterampilan dasar.',
      'Ananda {nama} masih memerlukan bimbingan dalam kegiatan PMR. Mohon dukungan untuk lebih rajin berlatih.',
    ],
  },
  'OSIS': {
    SB: [
      '{nama} menunjukkan kepemimpinan dan organisasi yang sangat baik. Aktif dalam merencanakan dan melaksanakan program kerja OSIS.',
      'Ananda {nama} memiliki kemampuan kepemimpinan yang luar biasa dan mampu mengkoordinir kegiatan dengan efektif.',
    ],
    B: [
      '{nama} menunjukkan kemampuan organisasi yang baik. Aktif berpartisipasi dalam kegiatan OSIS.',
      'Ananda {nama} memiliki minat yang baik terhadap kegiatan organisasi dan kepemimpinan.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan organisasi. Perlu lebih aktif dalam partisipasi.',
      'Ananda {nama} mulai memahami pentingnya organisasi. Disarankan untuk lebih aktif dalam kegiatan OSIS.',
    ],
    PB: [
      '{nama} perlu lebih aktif dalam kegiatan organisasi. Disarankan untuk lebih berani mengambil peran.',
      'Ananda {nama} masih memerlukan dorongan untuk berpartisipasi dalam kegiatan OSIS.',
    ],
  },
  'Seni': {
    SB: [
      '{nama} menunjukkan bakat seni yang sangat luar biasa. Mampu menghasilkan karya yang kreatif dan orisinal.',
      'Ananda {nama} memiliki kemampuan artistik yang unggul dan konsisten menghasilkan karya berkualitas.',
    ],
    B: [
      '{nama} menunjukkan kemampuan seni yang baik. Mampu menghasilkan karya yang menarik dan kreatif.',
      'Ananda {nama} memiliki minat yang kuat terhadap seni dan menunjukkan perkembangan yang positif.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam bidang seni. Perlu lebih banyak latihan untuk mengasah bakat.',
      'Ananda {nama} mulai menunjukkan minat terhadap seni. Disarankan untuk lebih banyak berlatih.',
    ],
    PB: [
      '{nama} perlu lebih banyak berlatih dalam bidang seni. Disarankan untuk mengikuti kursus atau workshop.',
      'Ananda {nama} masih dalam tahap awal mengembangkan kemampuan seni. Mohon dukungan untuk lebih rajin berlatih.',
    ],
  },
  'Olahraga': {
    SB: [
      '{nama} menunjukkan kemampuan olahraga yang sangat baik. Aktif dalam latihan dan kompetisi dengan prestasi yang unggul.',
      'Ananda {nama} memiliki fisik yang prima dan keterampilan olahraga yang luar biasa.',
    ],
    B: [
      '{nama} menunjukkan kemampuan olahraga yang baik. Aktif mengikuti latihan dan menunjukkan perkembangan positif.',
      'Ananda {nama} memiliki minat yang kuat terhadap olahraga dan konsisten dalam latihan.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan olahraga. Perlu lebih rutin berlatih.',
      'Ananda {nama} mulai menunjukkan minat terhadap olahraga. Disarankan untuk lebih aktif dalam latihan.',
    ],
    PB: [
      '{nama} perlu lebih aktif dalam kegiatan olahraga. Disarankan untuk lebih rajin berlatih dan menjaga kebugaran.',
      'Ananda {nama} masih memerlukan dorongan untuk berpartisipasi dalam kegiatan olahraga.',
    ],
  },
  'default': {
    SB: [
      '{nama} menunjukkan kemampuan yang sangat baik dalam kegiatan ekstrakurikuler ini. Aktif dan berprestasi.',
      'Ananda {nama} memiliki dedikasi yang luar biasa dan konsisten meraih hasil unggul.',
    ],
    B: [
      '{nama} menunjukkan kemampuan yang baik dalam kegiatan ekstrakurikuler ini. Aktif mengikuti kegiatan.',
      'Ananda {nama} memiliki minat yang positif dan menunjukkan perkembangan yang baik.',
    ],
    C: [
      '{nama} menunjukkan perkembangan yang cukup dalam kegiatan ekstrakurikuler ini. Perlu lebih aktif berpartisipasi.',
      'Ananda {nama} mulai menunjukkan minat. Disarankan untuk lebih aktif dalam kegiatan.',
    ],
    PB: [
      '{nama} perlu lebih aktif dalam kegiatan ekstrakurikuler ini. Disarankan untuk lebih semangat berlatih.',
      'Ananda {nama} masih memerlukan bimbingan dan dorongan untuk lebih aktif berpartisipasi.',
    ],
  },
};

// Fungsi untuk generate deskripsi ekskul
export function generateDeskripsiEkskul(namaSiswa, namaEkskul, predikat) {
  if (!predikat || predikat === '') {
    return 'Belum dinilai.';
  }

  const ekskulTemplates = templateEkskul[namaEkskul] || templateEkskul['default'];
  const kalimatList = ekskulTemplates[predikat];
  
  if (!kalimatList || kalimatList.length === 0) {
    return 'Belum ada deskripsi untuk predikat ini.';
  }

  const randomIndex = Math.floor(Math.random() * kalimatList.length);
  const template = kalimatList[randomIndex];

  return template.replace('{nama}', namaSiswa);
}

// Fungsi untuk mendapatkan label predikat ekskul
export function getPredikatEkskulLabel(predikat) {
  const labels = {
    SB: 'Sangat Baik',
    B: 'Baik',
    C: 'Cukup',
    PB: 'Perlu Bimbingan',
  };
  return labels[predikat] || predikat;
}