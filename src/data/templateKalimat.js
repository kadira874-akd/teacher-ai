// Bank kalimat deskripsi per mata pelajaran per predikat
// Predikat Kurmer: A (Sangat Baik 90-100), B (Baik 80-89), C (Cukup 70-79), D (Perlu Bimbingan <70)

export const templateKalimat = {
  'Matematika': {
    A: [
      '{nama} menunjukkan pemahaman yang sangat baik dalam konsep matematika. Mampu menyelesaikan soal-soal kompleks dengan tepat dan sistematis.',
      'Ananda {nama} memiliki kemampuan analitis yang luar biasa dalam matematika. Konsisten meraih hasil unggul dalam setiap topik yang dipelajari.',
    ],
    B: [
      '{nama} menunjukkan pemahaman yang baik dalam matematika. Mampu menyelesaikan sebagian besar soal dengan benar dan mulai menguasai konsep-konsep kunci.',
      'Ananda {nama} memiliki perkembangan yang positif dalam matematika. Perlu sedikit peningkatan pada materi yang lebih kompleks.',
    ],
    C: [
      '{nama} menunjukkan pemahaman yang cukup dalam matematika. Perlu lebih banyak latihan terutama pada konsep dasar agar lebih mantap.',
      'Ananda {nama} sudah memahami konsep dasar matematika dengan cukup baik. Disarankan untuk lebih rajin berlatih soal.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam matematika. Disarankan untuk mengikuti remedial dan memperbanyak latihan soal dasar.',
      'Ananda {nama} masih membutuhkan pendampingan khusus dalam memahami konsep matematika. Mohon dukungan orang tua untuk belajar di rumah.',
    ],
  },
  'Bahasa Indonesia': {
    A: [
      '{nama} memiliki kemampuan berbahasa Indonesia yang sangat baik. Mampu menulis karangan yang runtut dan membaca dengan pemahaman mendalam.',
      'Ananda {nama} menunjukkan minat baca dan tulis yang luar biasa. Kosakata yang digunakan kaya dan variatif.',
    ],
    B: [
      '{nama} memiliki kemampuan berbahasa Indonesia yang baik. Mampu memahami teks dengan baik dan menulis dengan struktur yang runtut.',
      'Ananda {nama} menunjukkan perkembangan yang positif dalam keterampilan berbahasa. Perlu lebih banyak membaca untuk memperkaya kosakata.',
    ],
    C: [
      '{nama} memiliki kemampuan berbahasa Indonesia yang cukup. Perlu lebih banyak berlatih menulis dan membaca untuk meningkatkan pemahaman.',
      'Ananda {nama} sudah mampu memahami teks sederhana. Disarankan untuk lebih rajin membaca buku cerita.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam keterampilan berbahasa. Disarankan untuk memperbanyak membaca dan berlatih menulis setiap hari.',
      'Ananda {nama} masih membutuhkan pendampingan dalam memahami teks. Mohon dukungan orang tua untuk membiasakan membaca di rumah.',
    ],
  },
  'Bahasa Inggris': {
    A: [
      '{nama} menunjukkan penguasaan Bahasa Inggris yang sangat baik. Mampu berkomunikasi aktif dan memahami teks dengan baik.',
      'Ananda {nama} memiliki kemampuan listening, speaking, reading, dan writing yang unggul. Sangat percaya diri dalam menggunakan Bahasa Inggris.',
    ],
    B: [
      '{nama} menunjukkan penguasaan Bahasa Inggris yang baik. Mampu memahami teks dan berkomunikasi dengan cukup lancar.',
      'Ananda {nama} memiliki perkembangan yang baik dalam Bahasa Inggris. Perlu lebih banyak latihan speaking agar lebih percaya diri.',
    ],
    C: [
      '{nama} menunjukkan penguasaan Bahasa Inggris yang cukup. Perlu lebih banyak berlatih vocabulary dan grammar dasar.',
      'Ananda {nama} sudah memahami konsep dasar Bahasa Inggris. Disarankan untuk lebih sering mendengarkan lagu/film berbahasa Inggris.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam Bahasa Inggris. Disarankan untuk mengikuti les tambahan dan memperbanyak latihan dasar.',
      'Ananda {nama} masih membutuhkan pendampingan khusus. Mohon dukungan orang tua untuk membiasakan exposure Bahasa Inggris di rumah.',
    ],
  },
  'IPA': {
    A: [
      '{nama} menunjukkan pemahaman yang sangat baik dalam konsep IPA. Memiliki rasa ingin tahu yang tinggi dan mampu melakukan eksperimen dengan teliti.',
      'Ananda {nama} memiliki kemampuan analitis yang luar biasa dalam IPA. Mampu menghubungkan konsep dengan fenomena alam di sekitarnya.',
    ],
    B: [
      '{nama} menunjukkan pemahaman yang baik dalam IPA. Mampu menjelaskan konsep-konsep ilmiah dengan jelas dan sistematis.',
      'Ananda {nama} memiliki minat yang baik terhadap IPA. Perlu lebih banyak eksperimen untuk memperkuat pemahaman.',
    ],
    C: [
      '{nama} menunjukkan pemahaman yang cukup dalam IPA. Perlu lebih banyak membaca dan mengamati fenomena alam sekitar.',
      'Ananda {nama} sudah memahami konsep dasar IPA. Disarankan untuk lebih aktif dalam praktikum.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam IPA. Disarankan untuk lebih banyak membaca buku sains dan menonton video edukasi.',
      'Ananda {nama} masih membutuhkan pendampingan dalam memahami konsep IPA. Mohon dukungan orang tua untuk mengajak mengamati alam sekitar.',
    ],
  },
  'IPS': {
    A: [
      '{nama} menunjukkan pemahaman yang sangat baik tentang konsep sosial dan sejarah. Mampu menganalisis peristiwa dengan kritis.',
      'Ananda {nama} memiliki wawasan sosial yang luas dan kemampuan analisis yang tajam terhadap isu-isu masyarakat.',
    ],
    B: [
      '{nama} menunjukkan pemahaman yang baik tentang konsep sosial. Mampu menjelaskan peristiwa sejarah dan geografis dengan runtut.',
      'Ananda {nama} memiliki minat yang baik terhadap isu sosial. Perlu lebih banyak membaca untuk memperdalam pemahaman.',
    ],
    C: [
      '{nama} menunjukkan pemahaman yang cukup tentang konsep sosial. Perlu lebih banyak membaca dan berdiskusi tentang isu terkini.',
      'Ananda {nama} sudah memahami konsep dasar IPS. Disarankan untuk lebih aktif mengikuti berita dan diskusi.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif dalam IPS. Disarankan untuk lebih banyak membaca buku sejarah dan geografi.',
      'Ananda {nama} masih membutuhkan pendampingan dalam memahami konsep sosial. Mohon dukungan orang tua untuk berdiskusi tentang lingkungan sekitar.',
    ],
  },
  'default': {
    A: [
      '{nama} menunjukkan penguasaan materi yang sangat baik. Konsisten meraih hasil unggul dan menjadi teladan bagi teman-temannya.',
      'Ananda {nama} memiliki kemampuan yang luar biasa dalam mata pelajaran ini. Sangat aktif dan berprestasi.',
    ],
    B: [
      '{nama} menunjukkan penguasaan materi yang baik. Memiliki perkembangan yang positif dan konsisten.',
      'Ananda {nama} mampu mengikuti pembelajaran dengan baik. Perlu sedikit peningkatan agar lebih unggul.',
    ],
    C: [
      '{nama} menunjukkan penguasaan materi yang cukup. Perlu lebih banyak latihan dan bimbingan.',
      'Ananda {nama} sudah memahami konsep dasar. Disarankan untuk lebih rajin belajar di rumah.',
    ],
    D: [
      '{nama} perlu bimbingan lebih intensif. Disarankan untuk mengikuti remedial dan memperbanyak latihan.',
      'Ananda {nama} masih membutuhkan pendampingan khusus. Mohon dukungan orang tua untuk belajar bersama di rumah.',
    ],
  },
};

// Fungsi untuk menentukan predikat berdasarkan angka
export function getPredikat(angka) {
  if (angka >= 90) return 'A';
  if (angka >= 80) return 'B';
  if (angka >= 70) return 'C';
  return 'D';
}

// Fungsi untuk mendapatkan label predikat
export function getPredikatLabel(predikat) {
  const labels = {
    A: 'Sangat Baik',
    B: 'Baik',
    C: 'Cukup',
    D: 'Perlu Bimbingan',
  };
  return labels[predikat] || predikat;
}