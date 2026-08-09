/**
 * RAPOR CALCULATION SERVICE
 * 
 * Optimized service for calculating and generating rapor data.
 * Centralizes all rapor-related business logic with performance optimizations.
 * 
 * Performance Improvements:
 * - Batch database queries to reduce round trips
 * - Memoization for expensive calculations
 * - Parallel fetching where possible
 * - Efficient data structures for lookups
 */

import { supabase } from '@/config/supabase';
import { generateDeskripsi, generateNilaiLengkap } from './deskripsiService';

// Cache for expensive lookups
const lookupCache = new Map();

/**
 * Clear lookup cache (useful when data changes)
 */
export function clearLookupCache() {
  lookupCache.clear();
}

/**
 * Get or create cached lookup map for fast O(1) access
 * @param {string} key - Cache key
 * @param {Array} data - Data array to convert to map
 * @param {string} idField - Field name to use as key
 * @returns {Map} Map for fast lookups
 */
function getCachedLookup(key, data, idField = 'id') {
  const cacheKey = `${key}:${idField}`;
  if (!lookupCache.has(cacheKey)) {
    const lookupMap = new Map();
    (data || []).forEach(item => {
      lookupMap.set(item[idField], item);
    });
    lookupCache.set(cacheKey, lookupMap);
  }
  return lookupCache.get(cacheKey);
}

/**
 * Fetch all rapor data for a student in optimized batch queries
 * @param {string} siswaId - Student ID
 * @param {string} kelasId - Class ID
 * @param {Object} siswa - Student object
 * @returns {Promise<Object>} Rapor data object
 */
export async function fetchRaporData(siswaId, kelasId, siswa) {
  const agamaSiswa = siswa?.agama || 'Umum';
  const namaDepan = siswa?.nama?.split(' ')[0] || 'Siswa';

  // Parallel fetch all top-level data (reduces total wait time)
  const [mapelResult, nilaiLMResult, nilaiSASResult, absensiResult, pancasilaResult, ekskulResult, raporExistingResult] = await Promise.all([
    supabase.from('mapel').select('*').eq('kelas_id', kelasId).order('urutan'),
    supabase.from('nilai_lingkup_materi').select('*').eq('siswa_id', siswaId),
    supabase.from('nilai_sas').select('*').eq('siswa_id', siswaId),
    supabase.from('absensi').select('*').eq('siswa_id', siswaId),
    supabase.from('profil_pancasila').select('*').eq('siswa_id', siswaId),
    supabase.from('nilai_ekskul').select('*, ekskul:ekskul_id(nama, jenis)').eq('siswa_id', siswaId),
    supabase.from('rapor').select('*').eq('siswa_id', siswaId).eq('semester', 'Ganjil').limit(1)
  ]);

  // Error handling
  if (mapelResult.error) {
    console.error('Error fetching mapel:', mapelResult.error);
    throw mapelResult.error;
  }

  const mapelList = mapelResult.data || [];
  const nilaiLMData = nilaiLMResult.data || [];
  const nilaiSASData = nilaiSASResult.data || [];
  const absensiData = absensiResult.data || [];
  const pancasilaData = pancasilaResult.data || [];
  const ekskulData = ekskulResult.data || [];
  const raporExisting = raporExistingResult.data || [];

  // Create lookup maps for O(1) access instead of O(n) find operations
  const nilaiLMByLingkupMateriId = getCachedLookup(`nilaiLM:${siswaId}`, nilaiLMData, 'lingkup_materi_id');
  const nilaiSASByMapelId = getCachedLookup(`nilaiSAS:${siswaId}`, nilaiSASData, 'mapel_id');

  // Batch fetch all lingkup_materi and tujuan_pembelajaran
  const mapelIds = mapelList.map(m => m.id);
  
  // Fetch all LM for all mapel at once
  const lmResult = await supabase
    .from('lingkup_materi')
    .select('*')
    .in('mapel_id', mapelIds)
    .order('urutan');

  if (lmResult.error) {
    console.error('Error fetching lingkup_materi:', lmResult.error);
  }

  const allLM = lmResult.data || [];
  
  // Group LM by mapel_id for efficient access
  const lmByMapelId = new Map();
  allLM.forEach(lm => {
    if (!lmByMapelId.has(lm.mapel_id)) {
      lmByMapelId.set(lm.mapel_id, []);
    }
    lmByMapelId.get(lm.mapel_id).push(lm);
  });

  // Fetch all TP for all LM at once
  const lmIds = allLM.map(lm => lm.id);
  let tpList = [];
  
  if (lmIds.length > 0) {
    const tpResult = await supabase
      .from('tujuan_pembelajaran')
      .select('*')
      .in('lingkup_materi_id', lmIds)
      .order('urutan');

    if (tpResult.error) {
      console.error('Error fetching tujuan_pembelajaran:', tpResult.error);
    } else {
      tpList = tpResult.data || [];
    }
  }

  // Group TP by lingkup_materi_id
  const tpByLingkupMateriId = new Map();
  tpList.forEach(tp => {
    if (!tpByLingkupMateriId.has(tp.lingkup_materi_id)) {
      tpByLingkupMateriId.set(tp.lingkup_materi_id, []);
    }
    tpByLingkupMateriId.get(tp.lingkup_materi_id).push(tp);
  });

  // Process each mapel
  const nilaiPerMapel = mapelList.map(mapel => {
    const lmList = lmByMapelId.get(mapel.id) || [];
    
    // Filter LM sesuai agama siswa
    const relevantLMs = lmList.filter(lm => lm.kategori === agamaSiswa || lm.kategori === 'Umum');
    
    if (relevantLMs.length === 0) {
      return null;
    }

    let sumLM = 0;
    let countLM = 0;
    let highestLM = null;
    let lowestLM = null;

    // Calculate average and find highest/lowest LM
    relevantLMs.forEach(lm => {
      const nilai = nilaiLMByLingkupMateriId.get(lm.id)?.angka || 0;
      if (nilai > 0) {
        sumLM += nilai;
        countLM++;
        
        if (!highestLM || nilai > highestLM.nilai) {
          highestLM = { ...lm, nilai };
        }
        if (!lowestLM || nilai < lowestLM.nilai) {
          lowestLM = { ...lm, nilai };
        }
      }
    });

    const avgLM = countLM > 0 ? (sumLM / countLM) : 0;
    const nilaiSAS = nilaiSASByMapelId.get(mapel.id)?.angka || 0;

    // Final calculation: (Average LM + SAS) / 2
    let nilaiAkhir = 0;
    if (countLM > 0 && nilaiSAS > 0) {
      nilaiAkhir = Math.round((avgLM + nilaiSAS) / 2);
    } else if (countLM > 0) {
      nilaiAkhir = Math.round(avgLM);
    }

    // Generate descriptions using highest/lowest LM
    let deskripsiTertinggi = '';
    let deskripsiTerendah = '';

    if (highestLM) {
      const tpRep = tpByLingkupMateriId.get(highestLM.id)?.[0];
      const teksTP = tpRep ? tpRep.teks.toLowerCase() : highestLM.nama.toLowerCase();
      const templates = [
        `Ananda ${namaDepan} menunjukkan penguasaan dalam ${teksTP}.`,
        `Ananda ${namaDepan} menunjukkan pemahaman yang sangat baik dalam ${teksTP}.`,
        `Ananda ${namaDepan} sudah mahir dalam ${teksTP}.`
      ];
      // Use deterministic selection based on mapel name for consistency
      const templateIndex = mapel.nama.length % templates.length;
      deskripsiTertinggi = templates[templateIndex];
    }

    if (lowestLM) {
      const tpRep = tpByLingkupMateriId.get(lowestLM.id)?.[0];
      const teksTP = tpRep ? tpRep.teks.toLowerCase() : lowestLM.nama.toLowerCase();
      const templates = [
        `Ananda ${namaDepan} membutuhkan bimbingan dalam ${teksTP}.`,
        `Ananda ${namaDepan} perlu penguatan lebih lanjut dalam ${teksTP}.`,
        `Ananda ${namaDepan} sudah berkembang, namun perlu latihan lebih dalam ${teksTP}.`
      ];
      const templateIndex = (mapel.nama.length + 1) % templates.length;
      deskripsiTerendah = templates[templateIndex];
    }

    return {
      nama: mapel.nama,
      nilaiAkhir,
      deskripsi: `${deskripsiTertinggi} ${deskripsiTerendah}`,
      deskripsiTertinggi,
      deskripsiTerendah
    };
  }).filter(Boolean); // Remove null entries

  // Recap attendance
  const rekapTotal = { H: 0, S: 0, I: 0, A: 0 };
  absensiData.forEach(absen => {
    rekapTotal[absen.status] = (rekapTotal[absen.status] || 0) + 1;
  });

  // Generate Pancasila narrative
  let narasiKokurikuler = '';
  if (pancasilaData && pancasilaData.length > 0) {
    const tertinggi = pancasilaData.find(p => p.predikat === 'SB') || pancasilaData[0];
    const terendah = pancasilaData.find(p => p.predikat === 'BB' || p.predikat === 'MB') || pancasilaData[pancasilaData.length - 1];
    narasiKokurikuler = `Ananda ${namaDepan} sudah mahir dalam penerapan subdimensi ${tertinggi?.subdimensi?.toLowerCase() || 'Profil Pelajar Pancasila'}, hal tersebut terlihat pada kegiatan ${tertinggi?.kegiatan?.toLowerCase() || 'pembelajaran sehari-hari'} dan sudah mulai berkembang dalam penerapan subdimensi ${terendah?.subdimensi?.toLowerCase() || 'dimensi lainnya'}, hal tersebut terlihat pada kegiatan ${terendah?.kegiatan?.toLowerCase() || 'aktivitas kelas'}.`;
  }

  return {
    nilaiPerMapel,
    rekapTotal,
    pancasilaData,
    ekskulData,
    narasiKokurikuler,
    raporExisting
  };
}

/**
 * Fetch rapor data for multiple students (for bulk export)
 * @param {Array} siswaList - List of students
 * @param {string} kelasId - Class ID
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of rapor data for each student
 */
export async function fetchBulkRaporData(siswaList, kelasId, onProgress) {
  const results = [];
  const total = siswaList.length;

  // Pre-fetch class-level data (shared across all students)
  const { data: mapelList, error: mapelError } = await supabase
    .from('mapel')
    .select('*')
    .eq('kelas_id', kelasId)
    .order('urutan');

  if (mapelError) {
    throw mapelError;
  }

  const mapelIds = (mapelList || []).map(m => m.id);
  
  // Fetch all LM and TP once for the entire class
  const [lmResult, allTpResult] = await Promise.all([
    supabase.from('lingkup_materi').select('*').in('mapel_id', mapelIds).order('urutan'),
    supabase.from('tujuan_pembelajaran').select('*').in('lingkup_materi_id', mapelIds).order('urutan')
  ]);

  const allLM = lmResult.data || [];
  const allTP = allTpResult.data || [];

  // Group by mapel_id and lingkup_materi_id
  const lmByMapelId = new Map();
  allLM.forEach(lm => {
    if (!lmByMapelId.has(lm.mapel_id)) {
      lmByMapelId.set(lm.mapel_id, []);
    }
    lmByMapelId.get(lm.mapel_id).push(lm);
  });

  const tpByLingkupMateriId = new Map();
  allTP.forEach(tp => {
    if (!tpByLingkupMateriId.has(tp.lingkup_materi_id)) {
      tpByLingkupMateriId.set(tp.lingkup_materi_id, []);
    }
    tpByLingkupMateriId.get(tp.lingkup_materi_id).push(tp);
  });

  // Process each student
  for (let i = 0; i < siswaList.length; i++) {
    const siswa = siswaList[i];
    
    if (onProgress) {
      onProgress({ current: i + 1, total });
    }

    const raporData = await processSingleStudentRapor(
      siswa,
      mapelList,
      lmByMapelId,
      tpByLingkupMateriId
    );

    results.push(raporData);

    // Clear cache for next student
    clearLookupCache();
  }

  return results;
}

/**
 * Process rapor for a single student (used in bulk operations)
 * @param {Object} siswa - Student object
 * @param {Array} mapelList - List of subjects
 * @param {Map} lmByMapelId - LM grouped by mapel_id
 * @param {Map} tpByLingkupMateriId - TP grouped by lingkup_materi_id
 * @returns {Promise<Object>} Rapor data for student
 */
async function processSingleStudentRapor(siswa, mapelList, lmByMapelId, tpByLingkupMateriId) {
  const agamaSiswa = siswa.agama || 'Umum';
  const namaDepan = siswa.nama.split(' ')[0];

  // Fetch student-specific data in parallel
  const [nilaiLMResult, nilaiSASResult, absensiResult, pancasilaResult, ekskulResult, raporExistingResult] = await Promise.all([
    supabase.from('nilai_lingkup_materi').select('*').eq('siswa_id', siswa.id),
    supabase.from('nilai_sas').select('*').eq('siswa_id', siswa.id),
    supabase.from('absensi').select('*').eq('siswa_id', siswa.id),
    supabase.from('profil_pancasila').select('*').eq('siswa_id', siswa.id),
    supabase.from('nilai_ekskul').select('*, ekskul:ekskul_id(nama, jenis)').eq('siswa_id', siswa.id),
    supabase.from('rapor').select('*').eq('siswa_id', siswa.id).eq('semester', 'Ganjil').limit(1)
  ]);

  const nilaiLMData = nilaiLMResult.data || [];
  const nilaiSASData = nilaiSASResult.data || [];
  const absensiData = absensiResult.data || [];
  const pancasilaData = pancasilaResult.data || [];
  const ekskulData = ekskulResult.data || [];
  const raporExisting = raporExistingResult.data || [];

  // Create lookup maps
  const nilaiLMByLingkupMateriId = new Map();
  nilaiLMData.forEach(n => nilaiLMByLingkupMateriId.set(n.lingkup_materi_id, n));

  const nilaiSASByMapelId = new Map();
  nilaiSASData.forEach(n => nilaiSASByMapelId.set(n.mapel_id, n));

  // Process each mapel
  const nilaiPerMapel = mapelList.map(mapel => {
    const lmList = lmByMapelId.get(mapel.id) || [];
    const relevantLMs = lmList.filter(lm => lm.kategori === agamaSiswa || lm.kategori === 'Umum');
    
    if (relevantLMs.length === 0) return null;

    let sumLM = 0, countLM = 0, highestLM = null, lowestLM = null;

    relevantLMs.forEach(lm => {
      const nilai = nilaiLMByLingkupMateriId.get(lm.id)?.angka || 0;
      if (nilai > 0) {
        sumLM += nilai;
        countLM++;
        if (!highestLM || nilai > highestLM.nilai) highestLM = { ...lm, nilai };
        if (!lowestLM || nilai < lowestLM.nilai) lowestLM = { ...lm, nilai };
      }
    });

    const avgLM = countLM > 0 ? (sumLM / countLM) : 0;
    const nilaiSAS = nilaiSASByMapelId.get(mapel.id)?.angka || 0;
    
    let nilaiAkhir = 0;
    if (countLM > 0 && nilaiSAS > 0) {
      nilaiAkhir = Math.round((avgLM + nilaiSAS) / 2);
    } else if (countLM > 0) {
      nilaiAkhir = Math.round(avgLM);
    }

    let deskripsiTertinggi = '', deskripsiTerendah = '';
    
    if (highestLM) {
      const tpRep = tpByLingkupMateriId.get(highestLM.id)?.[0];
      const teksTP = tpRep ? tpRep.teks.toLowerCase() : highestLM.nama.toLowerCase();
      deskripsiTertinggi = `Ananda ${namaDepan} menunjukkan penguasaan dalam ${teksTP}.`;
    }
    
    if (lowestLM) {
      const tpRep = tpByLingkupMateriId.get(lowestLM.id)?.[0];
      const teksTP = tpRep ? tpRep.teks.toLowerCase() : lowestLM.nama.toLowerCase();
      deskripsiTerendah = `Ananda ${namaDepan} membutuhkan bimbingan dalam ${teksTP}.`;
    }

    return {
      nama: mapel.nama,
      nilaiAkhir,
      deskripsi: `${deskripsiTertinggi} ${deskripsiTerendah}`,
      deskripsiTertinggi,
      deskripsiTerendah
    };
  }).filter(Boolean);

  // Recap attendance
  const rekapTotal = { H: 0, S: 0, I: 0, A: 0 };
  absensiData.forEach(absen => {
    rekapTotal[absen.status] = (rekapTotal[absen.status] || 0) + 1;
  });

  // Generate Pancasila narrative
  let narasiKokurikuler = '';
  if (pancasilaData && pancasilaData.length > 0) {
    const tertinggi = pancasilaData.find(p => p.predikat === 'SB') || pancasilaData[0];
    const terendah = pancasilaData.find(p => p.predikat === 'BB' || p.predikat === 'MB') || pancasilaData[pancasilaData.length - 1];
    narasiKokurikuler = `Ananda ${namaDepan} sudah mahir dalam penerapan subdimensi ${tertinggi?.subdimensi?.toLowerCase() || 'Profil Pelajar Pancasila'}, hal tersebut terlihat pada kegiatan ${tertinggi?.kegiatan?.toLowerCase() || 'pembelajaran sehari-hari'} dan sudah mulai berkembang dalam penerapan subdimensi ${terendah?.subdimensi?.toLowerCase() || 'dimensi lainnya'}, hal tersebut terlihat pada kegiatan ${terendah?.kegiatan?.toLowerCase() || 'aktivitas kelas'}.`;
  }

  return {
    siswa,
    nilaiPerMapel,
    rekapTotal,
    pancasilaData,
    ekskulData,
    narasiKokurikuler,
    raporExisting
  };
}

/**
 * Save rapor to database
 * @param {string} siswaId - Student ID
 * @param {Object} data - Rapor data
 * @returns {Promise<Object>} Result of save operation
 */
export async function saveRapor(siswaId, data) {
  // Delete existing rapor first
  const deleteResult = await supabase
    .from('rapor')
    .delete()
    .eq('siswa_id', siswaId)
    .eq('semester', 'Ganjil');

  if (deleteResult.error) {
    return { error: deleteResult.error };
  }

  // Insert new rapor
  const insertResult = await supabase
    .from('rapor')
    .insert({
      siswa_id: siswaId,
      semester: 'Ganjil',
      status: 'Draft',
      catatan_wali: data.catatan_wali || '',
      status_kenaikan: data.status_kenaikan || '',
      nomor_rapor: data.nomor_rapor || '',
      tanggal_penetapan: data.tanggal_penetapan || null,
      kota_penetapan: data.kota_penetapan || '',
      tanggapan_ortu: data.tanggapan_ortu || ''
    });

  return insertResult;
}
