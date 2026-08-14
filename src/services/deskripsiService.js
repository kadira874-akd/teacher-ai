import { templateKalimat, getPredikat, getPredikatLabel } from '@/constants/pendukung/templateKalimat';

/**
 * @typedef {import('@/types/jsdoc-typedefs').Nilai} Nilai
 */

/**
 * Generate deskripsi otomatis berdasarkan nama siswa, mapel, dan nilai
 * @param {string} namaSiswa - Nama lengkap siswa
 * @param {string} namaMapel - Nama mata pelajaran
 * @param {number | null | ''} angka - Nilai angka siswa
 * @returns {string} Deskripsi naratif untuk rapor
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
 * @param {string} namaSiswa - Nama lengkap siswa
 * @param {string} namaMapel - Nama mata pelajaran
 * @param {number | null | ''} angka - Nilai angka siswa
 * @returns {{ angka: number, predikat: string, label: string, deskripsi: string }} Objek nilai lengkap
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