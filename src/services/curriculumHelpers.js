/**
 * HELPER FUNCTIONS - CURRICULUM DATABASE
 */

export const getFaseByKelas = (kelasNomor) => {
  const kelas = parseInt(kelasNomor);
  if (kelas === 1 || kelas === 2) return 'faseA';
  if (kelas === 3 || kelas === 4) return 'faseB';
  if (kelas === 5 || kelas === 6) return 'faseC';
  if (kelas >= 7 && kelas <= 9) return 'faseD';
  return 'faseB';
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

export const getKurikulumByFase = (fase, database) => database[fase] || {};
export const getMapelByFase = (fase, database) => Object.keys(getKurikulumByFase(fase, database));

export const getElemenCP = (fase, mapelNama, database) => {
  const kurikulum = getKurikulumByFase(fase, database);
  return kurikulum[mapelNama] || [];
};

export const getTotalTP = (fase, mapelNama, database) => {
  const elemenCP = getElemenCP(fase, mapelNama, database);
  return elemenCP.reduce((total, elemen) => total + (elemen.contohTP?.length || 0), 0);
};

// Helper untuk generate kode TP otomatis
export const generateKodeTP = (globalIndex) => `TP ${globalIndex}`;

// Helper untuk menghitung alokasi waktu total
export const getTotalAlokasiWaktu = (fase, mapelNama, database) => {
  const elemenCP = getElemenCP(fase, mapelNama, database);
  return elemenCP.reduce((total, elemen) => {
    return total + (elemen.contohTP?.reduce((sum, tp) => sum + (tp.alokasi_jp || 2), 0) || 0);
  }, 0);
};