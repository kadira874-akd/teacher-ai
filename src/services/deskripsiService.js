import { templateKalimat, getPredikat, getPredikatLabel } from '@/constants/pendukung/templateKalimat';

/**
 * @typedef {import('@/types/jsdoc-typedefs').Nilai} Nilai
 */

// Cache for template lookups to avoid repeated object property access
const templateCache = new Map();

/**
 * Generate deskripsi otomatis berdasarkan nama siswa, mapel, dan nilai
 * Optimized with:
 * - Early return for invalid input
 * - Cached template lookup
 * - Deterministic template selection (consistent output for same input)
 * @param {string} namaSiswa - Nama lengkap siswa
 * @param {string} namaMapel - Nama mata pelajaran
 * @param {number | null | ''} angka - Nilai angka siswa
 * @returns {string} Deskripsi naratif untuk rapor
 */
export function generateDeskripsi(namaSiswa, namaMapel, angka) {
  // Early return optimization
  if (!angka || angka === null || angka === '') {
    return 'Belum dinilai.';
  }

  const predikat = getPredikat(angka);

  // Use cache key for faster repeated lookups
  const cacheKey = `${namaMapel}:${predikat}`;

  if (!templateCache.has(cacheKey)) {
    // Cari template untuk mapel ini, jika tidak ada pakai default
    const mapelTemplates = templateKalimat[namaMapel] || templateKalimat['default'];
    const kalimatList = mapelTemplates?.[predikat] || [];
    templateCache.set(cacheKey, kalimatList);
  }

  const kalimatList = templateCache.get(cacheKey);

  if (!kalimatList || kalimatList.length === 0) {
    return 'Belum dinilai.';
  }

  // Deterministic selection based on student name hash for consistency
  // Same student + subject always gets same template
  const nameHash = namaSiswa.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const templateIndex = nameHash % kalimatList.length;
  const template = kalimatList[templateIndex];

  // Ganti placeholder {nama} dengan nama siswa
  return template.replace('{nama}', namaSiswa);
}

/**
 * Clear template cache (useful when templates change)
 */
export function clearTemplateCache() {
  templateCache.clear();
}

/**
 * Generate objek lengkap: predikat, label, deskripsi
 * Optimized with single function call and object spread
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

/**
 * Batch generate deskripsi for multiple students
 * More efficient than calling generateDeskripsi individually
 * @param {Array<{namaSiswa: string, namaMapel: string, angka: number}>} dataList - Array of data objects
 * @returns {string[]} Array of deskripsi strings
 */
export function generateDeskripsiBatch(dataList) {
  return dataList.map(({ namaSiswa, namaMapel, angka }) =>
    generateDeskripsi(namaSiswa, namaMapel, angka)
  );
}

/**
 * Batch generate nilai lengkap for multiple students
 * @param {Array<{namaSiswa: string, namaMapel: string, angka: number}>} dataList - Array of data objects
 * @returns {Array<{angka: number, predikat: string, label: string, deskripsi: string}>} Array of nilai lengkap objects
 */
export function generateNilaiLengkapBatch(dataList) {
  return dataList.map(({ namaSiswa, namaMapel, angka }) =>
    generateNilaiLengkap(namaSiswa, namaMapel, angka)
  );
}
