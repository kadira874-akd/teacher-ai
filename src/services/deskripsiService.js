import { templateKalimat, getPredikat, getPredikatLabel } from '@/constants/pendukung/templateKalimat';

/**
 * Generate deskripsi otomatis berdasarkan nama siswa, mapel, dan nilai
 */
export function generateDeskripsi(namaSiswa, namaMapel, angka) {
  if (!angka || angka === null || angka === '') {
    return 'Belum dinilai.';
  }

  const predikat = getPredikat(angka);
  
  // Cari template untuk mapel ini, jika tidak ada pakai default
  const mapelTemplates = templateKalimat[namaMapel] || templateKalimat['default'];
  const kalimatList = mapelTemplates[predikat];
  
  // Pilih kalimat secara acak agar bervariasi
  const randomIndex = Math.floor(Math.random() * kalimatList.length);
  const template = kalimatList[randomIndex];
  
  // Ganti placeholder {nama} dengan nama siswa
  return template.replace('{nama}', namaSiswa);
}

/**
 * Generate objek lengkap: predikat, label, deskripsi
 */
export function generateNilaiLengkap(namaSiswa, namaMapel, angka) {
  const predikat = getPredikat(angka);
  const label = getPredikatLabel(predikat);
  const deskripsi = generateDeskripsi(namaSiswa, namaMapel, angka);
  
  return {
    angka,
    predikat,
    label,
    deskripsi,
  };
}