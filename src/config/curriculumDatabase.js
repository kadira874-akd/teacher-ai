/**
 * CURRICULUM DATABASE - TEACHERAI (ORCHESTRATOR)
 * 
 * Database kurikulum komprehensif untuk Kurikulum Merdeka
 * Mencakup Fase A (Kelas 1-2), Fase B (Kelas 3-4), Fase C (Kelas 5-6), Fase D (Kelas 7-9)
 * 
 * Struktur:
 * - Fase → Mata Pelajaran → Elemen CP → Tujuan Pembelajaran (TP)
 * - Setiap TP memiliki alokasi JP dan tingkat kesulitan
 * - Mendukung multi-agama (Islam, Kristen, Katolik, Hindu, Buddha, Konghucu)
 * 
 * Sumber Data: Capaian Pembelajaran (CP) Resmi Kemendikdasmen
 */

// 1. Import semua fase
import { faseA } from './phases/faseA';
import { faseB } from './phases/faseB';
import { faseC } from './phases/faseC';
import { faseD } from './phases/faseD';

// 2. Import data pendukung dari folder constants (agar tidak duplikat)
import { PROFIL_PANCASILA } from '@/constants/pendukung/profilPancasila';
import { templateEkskul } from '@/constants/pendukung/templateEkskul';

// 3. Re-export agar bisa diimport langsung dari file ini oleh komponen lain
export { PROFIL_PANCASILA, TEMPLATE_EKSKUL };

// ============================================================
// DATABASE KURIKULUM UTAMA
// ============================================================
export const KURIKULUM_DATABASE = {
  faseA,
  faseB,
  faseC,
  faseD
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export const getFaseByKelas = (kelasNomor) => {
  const kelas = parseInt(kelasNomor);
  if (kelas === 1 || kelas === 2) return 'faseA';
  if (kelas === 3 || kelas === 4) return 'faseB';
  if (kelas === 5 || kelas === 6) return 'faseC';
  if (kelas >= 7 && kelas <= 9) return 'faseD';
  return 'faseB'; // default
};

export const getFaseLabel = (fase) => {
  const labels = {
    faseA: 'Fase A (Kelas 1-2 SD)',
    faseB: 'Fase B (Kelas 3-4 SD)',
    faseC: 'Fase C (Kelas 5-6 SD)',
    faseD: 'Fase D (Kelas 7-9 SMP)'
  };
  return labels[fase] || 'Fase Tidak Diketahui';
};

export const getKurikulumByFase = (fase) => {
  return KURIKULUM_DATABASE[fase] || {};
};

export const getMapelByFase = (fase) => {
  const kurikulum = getKurikulumByFase(fase);
  return Object.keys(kurikulum);
};

/**
 * Mendapatkan daftar mata pelajaran lengkap dengan info tambahan untuk dropdown
 * @param {string} fase - Fase kurikulum (faseA, faseB, faseC, faseD)
 * @returns {Array} Array objek mapel dengan nama dan properti tambahan
 */
export const getMapelListForDropdown = (fase) => {
  const kurikulum = getKurikulumByFase(fase);
  return Object.entries(kurikulum).map(([nama, elemenCP]) => ({
    nama,
    is_mapel_agama: nama.toLowerCase().includes('agama'),
    total_elemen: elemenCP.length,
    total_tp: elemenCP.reduce((sum, elem) => sum + (elem.contohTP?.length || 0), 0)
  }));
};

/**
 * Normalisasi nama mata pelajaran untuk pencocokan yang lebih fleksibel
 * @param {string} nama - Nama mata pelajaran yang akan dinormalisasi
 * @returns {string} Nama yang sudah dinormalisasi
 */
export const normalizeMapelName = (nama) => {
  return nama.toLowerCase()
    .replace(/pendidikan\s+agama\s+/g, 'pa ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Mencari kecocokan nama mata pelajaran dengan template kurikulum
 * @param {string} inputNama - Nama mapel yang diinput user
 * @param {string} fase - Fase kurikulum
 * @returns {Object|null} Objek { found: boolean, matchedName: string|null, suggestions: Array }
 */
export const findMatchingMapel = (inputNama, fase) => {
  const mapelList = getMapelByFase(fase);
  const normalizedInput = normalizeMapelName(inputNama);
  
  // Cari kecocokan eksak
  const exactMatch = mapelList.find(nama => 
    normalizeMapelName(nama) === normalizedInput
  );
  
  if (exactMatch) {
    return { found: true, matchedName: exactMatch, suggestions: [] };
  }
  
  // Cari kecocokan parsial
  const partialMatch = mapelList.find(nama => {
    const normalizedDb = normalizeMapelName(nama);
    return normalizedDb.includes(normalizedInput) || normalizedInput.includes(normalizedDb);
  });
  
  if (partialMatch) {
    return { found: true, matchedName: partialMatch, suggestions: [] };
  }
  
  // Tidak ditemukan, berikan saran
  const suggestions = mapelList.filter(nama => {
    const normalizedDb = normalizeMapelName(nama);
    const words = normalizedInput.split(' ');
    return words.some(word => word.length > 2 && normalizedDb.includes(word));
  }).slice(0, 5);
  
  return { found: false, matchedName: null, suggestions };
};

export const getElemenCP = (fase, mapelNama) => {
  const kurikulum = getKurikulumByFase(fase);
  return kurikulum[mapelNama] || [];
};

export const getTotalTP = (fase, mapelNama) => {
  const elemenCP = getElemenCP(fase, mapelNama);
  return elemenCP.reduce((total, elemen) => total + (elemen.contohTP?.length || 0), 0);
};

export const getTotalJP = (fase, mapelNama) => {
  const elemenCP = getElemenCP(fase, mapelNama);
  return elemenCP.reduce((total, elemen) => total + (elemen.alokasi_jp_total || 0), 0);
};

export const getAllTP = (fase, mapelNama) => {
  const elemenCP = getElemenCP(fase, mapelNama);
  const allTP = [];
  let globalIndex = 1;
  
  elemenCP.forEach(elemen => {
    elemen.contohTP?.forEach(tp => {
      allTP.push({
        ...tp,
        elemen_nama: elemen.nama_elemen,
        elemen_id: elemen.nama_elemen.toLowerCase().replace(/\s+/g, '_'),
        kode_tp: `TP ${globalIndex}`,
        urutan_global: globalIndex
      });
      globalIndex++;
    });
  });
  
  return allTP;
};

export const getElemenCPByAgama = (fase, mapelNama, kategori) => {
  const elemenCP = getElemenCP(fase, mapelNama);
  return elemenCP.filter(e => e.kategori === kategori || !e.kategori);
};

export const getKurikulumStats = (fase) => {
  const kurikulum = getKurikulumByFase(fase);
  const mapelList = Object.keys(kurikulum);
  
  let totalElemen = 0;
  let totalTP = 0;
  let totalJP = 0;
  
  mapelList.forEach(mapel => {
    const elemenCP = kurikulum[mapel];
    totalElemen += elemenCP.length;
    totalTP += getTotalTP(fase, mapel);
    totalJP += getTotalJP(fase, mapel);
  });
  
  return {
    jumlahMapel: mapelList.length,
    totalElemen,
    totalTP,
    totalJP,
    daftarMapel: mapelList
  };
};

export const searchTP = (fase, keyword) => {
  const kurikulum = getKurikulumByFase(fase);
  const results = [];
  const lowerKeyword = keyword.toLowerCase();
  
  Object.entries(kurikulum).forEach(([mapelNama, elemenCP]) => {
    elemenCP.forEach(elemen => {
      elemen.contohTP?.forEach((tp, idx) => {
        if (tp.teks.toLowerCase().includes(lowerKeyword)) {
          results.push({
            ...tp,
            mapel: mapelNama,
            elemen: elemen.nama_elemen,
            index_in_elemen: idx + 1
          });
        }
      });
    });
  });
  
  return results;
};

// ============================================================
// DATA PENDUKUNG LOKAL (Konstanta kecil yang tidak perlu dipisah file)
// ============================================================

export const KATEGORI_AGAMA = [
  { id: 'umum', nama: 'Umum', icon: '📚' },
  { id: 'islam', nama: 'Islam', icon: '🕌' },
  { id: 'kristen', nama: 'Kristen', icon: '✝️' },
  { id: 'katolik', nama: 'Katolik', icon: '⛪' },
  { id: 'hindu', nama: 'Hindu', icon: '🕉️' },
  { id: 'buddha', nama: 'Buddha', icon: '☸️' },
  { id: 'konghucu', nama: 'Konghucu', icon: '☯️' }
];

export const TINGKAT_KESULITAN = [
  { id: 'dasar', nama: 'Dasar', color: '#52B788', desc: 'Konsep dasar, pengenalan' },
  { id: 'menengah', nama: 'Menengah', color: '#F2CC8F', desc: 'Penerapan, analisis sederhana' },
  { id: 'lanjut', nama: 'Lanjut', color: '#E07A5F', desc: 'Analisis kompleks, evaluasi, kreasi' }
];

// ============================================================
// EKSPOR DEFAULT
// ============================================================
export default KURIKULUM_DATABASE;