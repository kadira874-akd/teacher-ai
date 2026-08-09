'use client';
import { supabase } from '@/config/supabase';
import * as XLSX from 'xlsx';

/**
 * Export rekap absensi ke Excel
 */
export const exportRekapAbsensi = (rekapAbsensi, mapelName) => {
  if (rekapAbsensi.length === 0) {
    alert('Tidak ada data untuk di-export!');
    return;
  }

  const tanggalList = [...new Set(rekapAbsensi.flatMap(r => Object.keys(r.kehadiran)))].sort();

  const data = rekapAbsensi.map(r => {
    const row = { 'Nama Siswa': r.nama };
    tanggalList.forEach(tgl => {
      row[tgl] = r.kehadiran[tgl] || '-';
    });
    row['Hadir'] = r.hadir;
    row['Sakit'] = r.sakit;
    row['Izin'] = r.izin;
    row['Alpha'] = r.alpha;
    row['% Kehadiran'] = r.persentase + '%';
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi');
  XLSX.writeFile(wb, `Rekap_Absensi_${mapelName || 'Mapel'}.xlsx`);
};

/**
 * Export rekap nilai ke Excel
 */
export const exportRekapNilai = async (selectedMapel, tpList, siswaList, mapelName) => {
  // Load semua nilai untuk mapel ini
  const { data: formatif } = await supabase
    .from('nilai_formatif')
    .select('*, siswa:siswa_id(nama)')
    .eq('mapel_id', selectedMapel);

  const { data: sumatif } = await supabase
    .from('nilai_sumatif')
    .select('*, siswa:siswa_id(nama)')
    .eq('mapel_id', selectedMapel);

  if (!formatif?.length && !sumatif?.length) {
    alert('Tidak ada data nilai untuk di-export!');
    return;
  }

  // Group nilai per siswa
  const rekap = {};
  siswaList.forEach(s => {
    rekap[s.id] = { nama: s.nama, tp: {}, sts: null, sas: null };
  });

  formatif?.forEach(n => {
    if (rekap[n.siswa_id]) {
      rekap[n.siswa_id].tp[n.tp_id] = n.angka;
    }
  });

  sumatif?.forEach(n => {
    if (rekap[n.siswa_id]) {
      if (n.jenis === 'STS') rekap[n.siswa_id].sts = n.angka;
      else if (n.jenis === 'SAS') rekap[n.siswa_id].sas = n.angka;
    }
  });

  // Format untuk export
  const data = Object.values(rekap).map(r => {
    const row = { 'Nama Siswa': r.nama };

    tpList.forEach(tp => {
      row[tp.kode_tp] = r.tp[tp.id] || '-';
    });

    row['STS'] = r.sts || '-';
    row['SAS'] = r.sas || '-';

    // Hitung rata-rata
    const allNilai = [
      ...Object.values(r.tp),
      r.sts,
      r.sas
    ].filter(n => n !== null && n !== undefined);

    const rataRata = allNilai.length > 0
      ? (allNilai.reduce((a, b) => a + b, 0) / allNilai.length).toFixed(2)
      : '-';

    row['Rata-rata'] = rataRata;

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');
  XLSX.writeFile(wb, `Rekap_Nilai_${mapelName || 'Mapel'}.xlsx`);
};

/**
 * Generate QR Code data untuk absensi
 */
export const generateQRData = (mapelId, tanggal) => {
  return {
    type: 'ABSENSI',
    mapel_id: mapelId,
    tanggal: tanggal,
    timestamp: new Date().toISOString()
  };
};

/**
 * Handle scan QR Code siswa
 */
export const handleScanQRSuccess = async (decodedText, selectedMapel, tanggalKonteks, profile, setAttendance, loadAbsensiHistory) => {
  try {
    const scannedData = JSON.parse(decodedText);

    if (scannedData.type !== 'SISWA') {
      alert('⚠️ QR Code bukan dari kartu absen siswa!');
      return { success: false };
    }

    const { data: siswaData } = await supabase
      .from('siswa')
      .select('id, nama, nis, nisn')
      .eq('id', scannedData.siswa_id)
      .single();

    if (!siswaData) {
      alert('⚠️ Data siswa tidak ditemukan!');
      return { success: false };
    }

    // Cek apakah sudah absen hari ini
    const { data: existingAbsen } = await supabase
      .from('absensi')
      .select('id, status')
      .eq('siswa_id', scannedData.siswa_id)
      .eq('mapel_id', selectedMapel)
      .eq('tanggal', tanggalKonteks)
      .single();

    if (existingAbsen) {
      const statusLabel = existingAbsen.status === 'H' ? 'Hadir' :
                         existingAbsen.status === 'S' ? 'Sakit' :
                         existingAbsen.status === 'I' ? 'Izin' : 'Alpha';
      alert(`ℹ️ ${siswaData.nama} sudah absen dengan status: ${statusLabel}`);
      return { success: false, alreadyExists: true };
    }

    // Simpan absensi
    const { error } = await supabase.from('absensi').insert({
      siswa_id: scannedData.siswa_id,
      mapel_id: selectedMapel,
      tanggal: tanggalKonteks,
      status: 'H'
    });

    if (error) {
      alert('⚠️ Gagal menyimpan absensi: ' + error.message);
      return { success: false };
    }

    // Success
    const scanRecord = {
      nama: siswaData.nama,
      nis: siswaData.nis,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'Hadir'
    };

    // Update attendance state
    setAttendance(prev => ({ ...prev, [scannedData.siswa_id]: 'H' }));
    
    // Reload history
    if (loadAbsensiHistory) {
      await loadAbsensiHistory();
    }

    return { success: true, scanRecord, siswaData };
  } catch (e) {
    alert('⚠️ Format QR Code tidak valid!');
    console.error(e);
    return { success: false, error: e };
  }
};

/**
 * Calculate summary absensi
 */
export const calculateAbsensiSummary = (absensiHistory) => {
  return {
    hadir: absensiHistory.filter(a => a.status === 'H').length,
    sakit: absensiHistory.filter(a => a.status === 'S').length,
    izin: absensiHistory.filter(a => a.status === 'I').length,
    alpha: absensiHistory.filter(a => a.status === 'A').length
  };
};
