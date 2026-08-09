'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';

/**
 * Hook untuk mengelola absensi
 */
export function useAbsensi(selectedMapel, tanggalKonteks, siswaList) {
  const [attendance, setAttendance] = useState({});
  const [absensiHistory, setAbsensiHistory] = useState([]);
  const [rekapAbsensi, setRekapAbsensi] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [scanningResult, setScanningResult] = useState(null);

  // Load absensi harian
  useEffect(() => {
    const loadAbsensi = async () => {
      if (!selectedMapel || !tanggalKonteks || !siswaList?.length) return;
      
      const { data } = await supabase
        .from('absensi')
        .select('siswa_id, status')
        .eq('mapel_id', selectedMapel)
        .eq('tanggal', tanggalKonteks);

      const formatted = {};
      siswaList.forEach(s => { formatted[s.id] = 'H'; });
      data?.forEach(item => { formatted[item.siswa_id] = item.status; });
      setAttendance(formatted);
    };
    loadAbsensi();
  }, [selectedMapel, tanggalKonteks, siswaList]);

  // Load absensi history
  const loadAbsensiHistory = async () => {
    if (!selectedMapel || !tanggalKonteks) return;

    const { data: absensi } = await supabase
      .from('absensi')
      .select(`
        id,
        siswa_id,
        status,
        created_at,
        siswa (
          id,
          nama
        )
      `)
      .eq('mapel_id', selectedMapel)
      .eq('tanggal', tanggalKonteks)
      .order('created_at', { ascending: false });

    setAbsensiHistory(absensi || []);
  };

  useEffect(() => {
    loadAbsensiHistory();
  }, [selectedMapel, tanggalKonteks]);

  // Load rekap absensi
  useEffect(() => {
    const loadRekapAbsensi = async () => {
      if (!selectedMapel || !siswaList?.length) return;

      setLoadingRekap(true);
      const { data } = await supabase
        .from('absensi')
        .select('siswa_id, tanggal, status')
        .eq('mapel_id', selectedMapel)
        .order('tanggal', { ascending: true });

      if (data?.length > 0) {
        const rekap = {};
        const tanggalSet = new Set();

        data.forEach(item => {
          if (!rekap[item.siswa_id]) {
            rekap[item.siswa_id] = {};
          }
          rekap[item.siswa_id][item.tanggal] = item.status;
          tanggalSet.add(item.tanggal);
        });

        const tanggalList = Array.from(tanggalSet).sort();

        const rekapFormatted = siswaList.map(siswa => {
          const kehadiran = rekap[siswa.id] || {};
          let hadir = 0, sakit = 0, izin = 0, alpha = 0;

          tanggalList.forEach(tgl => {
            const status = kehadiran[tgl] || 'A';
            if (status === 'H') hadir++;
            else if (status === 'S') sakit++;
            else if (status === 'I') izin++;
            else alpha++;
          });

          const total = tanggalList.length;
          const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0;

          return {
            siswa_id: siswa.id,
            nama: siswa.nama,
            kehadiran,
            hadir,
            sakit,
            izin,
            alpha,
            total,
            persentase
          };
        });

        setRekapAbsensi(rekapFormatted);
      } else {
        setRekapAbsensi([]);
      }
      setLoadingRekap(false);
    };
    loadRekapAbsensi();
  }, [selectedMapel, siswaList]);

  return {
    attendance,
    setAttendance,
    absensiHistory,
    setAbsensiHistory,
    rekapAbsensi,
    loadingRekap,
    recentScans,
    setRecentScans,
    scanningResult,
    setScanningResult,
    loadAbsensiHistory
  };
}

/**
 * Hook untuk mengelola penilaian
 */
export function usePenilaian(selectedMapel, siswaList, tpList) {
  const [formatifAktivitas, setFormatifAktivitas] = useState('');
  const [formatifNilai, setFormatifNilai] = useState({});
  const [savingFormatif, setSavingFormatif] = useState(false);
  const [stsNilai, setStsNilai] = useState({});
  const [savingSTS, setSavingSTS] = useState(false);
  const [sasNilai, setSasNilai] = useState({});
  const [savingSAS, setSavingSAS] = useState(false);
  const [jenisPenilaian, setJenisPenilaian] = useState('');

  const handleSaveFormatif = async (selectedTP) => {
    if (!selectedTP) {
      alert('Pilih TP yang akan dinilai!');
      return;
    }

    setSavingFormatif(true);
    const payload = [];

    siswaList.forEach(siswa => {
      const angka = formatifNilai[siswa.id];
      if (angka !== '' && angka !== null && angka !== undefined) {
        payload.push({
          siswa_id: siswa.id,
          mapel_id: selectedMapel,
          tp_id: selectedTP,
          tanggal: new Date().toISOString().split('T')[0],
          angka: parseFloat(angka),
          nama_aktivitas: formatifAktivitas || null
        });
      }
    });

    if (payload.length === 0) {
      alert('Tidak ada nilai yang diisi!');
      setSavingFormatif(false);
      return;
    }

    const { error } = await supabase.from('nilai_formatif').insert(payload);
    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      alert(`✅ ${payload.length} nilai formatif berhasil disimpan!`);
      setFormatifNilai({});
      setFormatifAktivitas('');
    }
    setSavingFormatif(false);
  };

  const handleSaveSTS = async () => {
    setSavingSTS(true);
    const payload = [];

    siswaList.forEach(siswa => {
      const angka = stsNilai[siswa.id];
      if (angka !== '' && angka !== null && angka !== undefined) {
        payload.push({
          siswa_id: siswa.id,
          mapel_id: selectedMapel,
          tanggal: new Date().toISOString().split('T')[0],
          angka: parseFloat(angka),
          jenis: 'STS'
        });
      }
    });

    if (payload.length === 0) {
      alert('Tidak ada nilai yang diisi!');
      setSavingSTS(false);
      return;
    }

    const { error } = await supabase.from('nilai_sumatif').insert(payload);
    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      alert(`✅ ${payload.length} nilai STS berhasil disimpan!`);
      setStsNilai({});
    }
    setSavingSTS(false);
  };

  const handleSaveSAS = async () => {
    setSavingSAS(true);
    const payload = [];

    siswaList.forEach(siswa => {
      const angka = sasNilai[siswa.id];
      if (angka !== '' && angka !== null && angka !== undefined) {
        payload.push({
          siswa_id: siswa.id,
          mapel_id: selectedMapel,
          tanggal: new Date().toISOString().split('T')[0],
          angka: parseFloat(angka),
          jenis: 'SAS'
        });
      }
    });

    if (payload.length === 0) {
      alert('Tidak ada nilai yang diisi!');
      setSavingSAS(false);
      return;
    }

    const { error } = await supabase.from('nilai_sumatif').insert(payload);
    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      alert(`✅ ${payload.length} nilai SAS berhasil disimpan!`);
      setSasNilai({});
    }
    setSavingSAS(false);
  };

  return {
    formatifAktivitas,
    setFormatifAktivitas,
    formatifNilai,
    setFormatifNilai,
    savingFormatif,
    stsNilai,
    setStsNilai,
    savingSTS,
    sasNilai,
    setSasNilai,
    savingSAS,
    jenisPenilaian,
    setJenisPenilaian,
    handleSaveFormatif,
    handleSaveSTS,
    handleSaveSAS
  };
}
