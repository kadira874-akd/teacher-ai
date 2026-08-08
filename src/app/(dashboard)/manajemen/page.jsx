'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Button from '@/components/ui/Button';
import QRScanner from '@/components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';

function ManajemenContent() {
  const searchParams = useSearchParams();
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);

  // ===== GLOBAL CONTEXT =====
  const [tanggalKonteks, setTanggalKonteks] = useState(new Date().toISOString().split('T')[0]);
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [activeTab, setActiveTab] = useState('absensi');
  const [absensiSubTab, setAbsensiSubTab] = useState('input'); // 'input' atau 'rekap'
  const [absensiMode, setAbsensiMode] = useState(null); // null = belum pilih mode, 'manual' atau 'qr'

  // ===== STATE ABSENSI =====
  const [siswaList, setSiswaList] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [savingAbsen, setSavingAbsen] = useState(false);
  const [rekapAbsensi, setRekapAbsensi] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [absensiHistory, setAbsensiHistory] = useState([]);
  const [recentScans, setRecentScans] = useState([]);

  // ===== STATE PENILAIAN =====
  const [tpList, setTpList] = useState([]);
  const [selectedTP, setSelectedTP] = useState('');
  const [formatifAktivitas, setFormatifAktivitas] = useState('');
  const [formatifNilai, setFormatifNilai] = useState({});
  const [savingFormatif, setSavingFormatif] = useState(false);
  
  // State untuk STS/SAS
  const [stsNilai, setStsNilai] = useState({});
  const [savingSTS, setSavingSTS] = useState(false);
  const [sasNilai, setSasNilai] = useState({});
  const [savingSAS, setSavingSAS] = useState(false);
  
  // Filter penilaian
  const [jenisPenilaian, setJenisPenilaian] = useState(''); // '' = belum pilih, 'tp_X', 'sts', 'sas', 'all'

  // ===== STATE MATERI =====
  const [modulAjarList, setModulAjarList] = useState([]);
  const [selectedModul, setSelectedModul] = useState('');
  const [bahanAjarList, setBahanAjarList] = useState([]);
  const [loadingMateri, setLoadingMateri] = useState(false);

  // ===== 1. INISIALISASI =====
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase.from('kelas').select('id').eq('guru_id', profile.id).limit(1);
        if (kelasData?.length > 0) {
          const cId = kelasData[0].id;
          setKelasId(cId);

          const { data: mapel } = await supabase.from('mapel').select('*').eq('kelas_id', cId).order('urutan');
          setMapelList(mapel || []);

          const { data: siswa } = await supabase.from('siswa').select('id, nama').eq('kelas_id', cId).order('nama');
          setSiswaList(siswa || []);

          const mapelParam = searchParams.get('mapel');
          const tabParam = searchParams.get('tab');
          if (mapelParam && mapel?.find(m => m.id === mapelParam)) {
            setSelectedMapel(mapelParam);
          } else if (mapel?.length > 0) {
            setSelectedMapel(mapel[0].id);
          }
          if (tabParam) setActiveTab(tabParam);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession, searchParams]);

  // ===== 2. LOAD TP SAAT MAPEL DIPILIH =====
  useEffect(() => {
    const loadTP = async () => {
      if (!selectedMapel) {
        setTpList([]);
        return;
      }

      // Ambil semua elemen CP untuk mapel ini
      const { data: elemenData } = await supabase
        .from('elemen_cp')
        .select('id')
        .eq('mapel_id', selectedMapel);

      if (elemenData?.length > 0) {
        const elemenIds = elemenData.map(e => e.id);
        const { data: tpData } = await supabase
          .from('tujuan_pembelajaran')
          .select('*')
          .in('elemen_cp_id', elemenIds)
          .order('urutan_global');
        setTpList(tpData || []);
      } else {
        setTpList([]);
      }
    };
    loadTP();
  }, [selectedMapel]);

  // ===== 3. LOAD ABSENSI HARIAN =====
  useEffect(() => {
    const loadAbsensi = async () => {
      if (!selectedMapel || !tanggalKonteks) return;
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

  // ===== 3b. LOAD ABSENSI HISTORY UNTUK MODE QR =====
  useEffect(() => {
    const loadAbsensiHistory = async () => {
      if (!selectedMapel || !tanggalKonteks || absensiMode !== 'qr') return;
      
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
    
    loadAbsensiHistory();
  }, [selectedMapel, tanggalKonteks, absensiMode]);

  // ===== 4. LOAD REKAP ABSENSI =====
  useEffect(() => {
    const loadRekapAbsensi = async () => {
      if (!selectedMapel || absensiSubTab !== 'rekap') return;
      
      setLoadingRekap(true);
      // Ambil semua absensi untuk mapel ini
      const { data } = await supabase
        .from('absensi')
        .select('siswa_id, tanggal, status')
        .eq('mapel_id', selectedMapel)
        .order('tanggal', { ascending: true });

      if (data?.length > 0) {
        // Group by siswa
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
        
        // Format untuk tampilan
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
  }, [selectedMapel, absensiSubTab, siswaList]);

  // ===== 5. LOAD MODUL AJAR SAAT MAPEL DIPILIH =====
  useEffect(() => {
    const loadModul = async () => {
      if (!selectedMapel) {
        setModulAjarList([]);
        return;
      }

      const { data } = await supabase
        .from('modul_ajar')
        .select(`
          *,
          tujuan_pembelajaran (kode_tp, teks),
          bahan_ajar (*)
        `)
        .eq('tujuan_pembelajaran.elemen_cp_id', selectedMapel)
        .order('created_at', { ascending: false });

      // Filter modul yang sesuai dengan mapel ini
      const { data: elemenData } = await supabase
        .from('elemen_cp')
        .select('id')
        .eq('mapel_id', selectedMapel);

      if (elemenData?.length > 0 && data) {
        const elemenIds = elemenData.map(e => e.id);
        const modulFiltered = data.filter(m => {
          const tp = m.tujuan_pembelajaran;
          return tp && elemenIds.includes(tp.elemen_cp_id);
        });
        setModulAjarList(modulFiltered);
      } else {
        setModulAjarList([]);
      }
    };
    loadModul();
  }, [selectedMapel]);

  // ===== 6. LOAD BAHAN AJAR SAAT MODUL DIPILIH =====
  useEffect(() => {
    const loadBahanAjar = async () => {
      if (!selectedModul) {
        setBahanAjarList([]);
        return;
      }

      const { data } = await supabase
        .from('bahan_ajar')
        .select('*')
        .eq('modul_ajar_id', selectedModul)
        .order('created_at', { ascending: false });

      setBahanAjarList(data || []);
    };
    loadBahanAjar();
  }, [selectedModul]);

  // ===== HANDLERS =====

  const handleSaveAbsen = async () => {
    setSavingAbsen(true);
    const payload = Object.entries(attendance).map(([siswa_id, status]) => ({
      siswa_id,
      mapel_id: selectedMapel,
      tanggal: tanggalKonteks,
      status
    }));
    
    const { error } = await supabase.from('absensi').upsert(payload, {
      onConflict: 'siswa_id,mapel_id,tanggal'
    });
    
    if (error) alert('Gagal: ' + error.message);
    else alert('✅ Absensi berhasil disimpan!');
    setSavingAbsen(false);
  };

  // Handler untuk generate QR Code absensi dan scan QR siswa
  const [qrData, setQrData] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningResult, setScanningResult] = useState(null);

  const handleGenerateQR = () => {
    if (!selectedMapel || !tanggalKonteks) {
      alert('Pilih mata pelajaran dan tanggal!');
      return;
    }
    
    const data = {
      type: 'ABSENSI',
      mapel_id: selectedMapel,
      tanggal: tanggalKonteks,
      timestamp: new Date().toISOString()
    };
    setQrData(JSON.stringify(data));
    setShowQRModal(true);
  };

  const handleSimpanSesiQR = async () => {
    if (!qrData) return;
    
    const parsedData = JSON.parse(qrData);
    const { error } = await supabase.from('sesi_absensi').insert({
      mapel_id: parsedData.mapel_id,
      tanggal: parsedData.tanggal,
      qr_data: qrData,
      created_by: profile.id,
      created_at: new Date().toISOString(),
      is_active: true
    });
    
    if (error) {
      console.error('Error saving session:', error);
    }
    
    alert('✅ QR Code Absensi berhasil dibuat!\nMinta siswa untuk scan QR Code ini.');
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      const scannedData = JSON.parse(decodedText);
      
      if (scannedData.type !== 'SISWA') {
        alert('⚠️ QR Code bukan dari kartu absen siswa!');
        setShowScanner(false);
        return;
      }
      
      const { data: siswaData } = await supabase
        .from('siswa')
        .select('id, nama, nis, nisn')
        .eq('id', scannedData.siswa_id)
        .single();
      
      if (!siswaData) {
        alert('⚠️ Data siswa tidak ditemukan!');
        setShowScanner(false);
        return;
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
        setShowScanner(false);
        return;
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
        return;
      }
      
      // Success - update state
      const scanRecord = {
        nama: siswaData.nama,
        nis: siswaData.nis,
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'Hadir'
      };
      
      setScanningResult(scanRecord);
      setRecentScans(prev => [scanRecord, ...prev.slice(0, 9)]);
      
      // Refresh attendance dan history
      setAttendance(prev => ({ ...prev, [scannedData.siswa_id]: 'H' }));
      loadAbsensiHistory();
      
      // Auto close scanner setelah sukses
      setTimeout(() => {
        setShowScanner(false);
        setScanningResult(null);
      }, 2000);
      
    } catch (e) {
      alert('⚠️ Format QR Code tidak valid!');
      console.error(e);
      setShowScanner(false);
    }
  };

  // Helper untuk reload absensi history
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

  const handleSaveFormatif = async () => {
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
          tanggal: tanggalKonteks,
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
          tanggal: tanggalKonteks,
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
          tanggal: tanggalKonteks,
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

  const exportRekapAbsensi = () => {
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
    XLSX.writeFile(wb, `Rekap_Absensi_${mapelList.find(m => m.id === selectedMapel)?.nama || 'Mapel'}.xlsx`);
  };

  const exportRekapNilai = async () => {
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
    XLSX.writeFile(wb, `Rekap_Nilai_${mapelList.find(m => m.id === selectedMapel)?.nama || 'Mapel'}.xlsx`);
  };

  const selectedMapelName = mapelList.find(m => m.id === selectedMapel)?.nama || '';

  // Calculate summary untuk absensi
  const summary = {
    hadir: absensiHistory.filter(a => a.status === 'H').length,
    sakit: absensiHistory.filter(a => a.status === 'S').length,
    izin: absensiHistory.filter(a => a.status === 'I').length,
    alpha: absensiHistory.filter(a => a.status === 'A').length
  };

  if (loading || !profile || !kelasId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div>
      </div>
    );
  }

  if (mapelList.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <p className="text-4xl mb-3">📚</p>
          <h3 className="text-lg font-semibold text-[#0F172A]">Belum ada mata pelajaran</h3>
          <p className="text-[#64748B] mt-2">Silakan tambahkan mapel di menu <strong>Pengaturan Kelas</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== GLOBAL CONTEXT HEADER ===== */}
      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-4">📚 Manajemen Kelas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">📅 Tanggal</label>
            <input
              type="date"
              value={tanggalKonteks}
              onChange={(e) => setTanggalKonteks(e.target.value)}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-base font-medium text-[#0F172A] bg-white mobile-input-high-contrast min-h-[48px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">📖 Mata Pelajaran</label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-base font-semibold text-[#0F172A] bg-white mobile-input-high-contrast min-h-[48px]"
            >
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex gap-2 border-b border-[#E2E8F0]">
        {[
          { id: 'absensi', label: '📅 Absensi' },
          { id: 'penilaian', label: '📝 Penilaian' },
          { id: 'materi', label: '📖 Materi' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-[#2D5BE3] text-white'
                : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== MODAL QR CODE ===== */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#0F172A]">📱 QR Code Absensi</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-[#64748B] hover:text-[#DC2626]"
              >
                ✕
              </button>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl border-2 border-[#2D5BE3]">
                <QRCodeSVG
                  value={qrData}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            
            <p className="text-sm text-[#64748B] text-center mb-4">
              Minta siswa untuk scan QR Code ini
            </p>
            
            <Button onClick={handleSimpanSesiQR} className="w-full mb-3">
              💾 Simpan Sesi Absensi
            </Button>
            
            <button
              onClick={() => {
                const url = `${window.location.origin}/absen-siswa?data=${encodeURIComponent(qrData)}`;
                navigator.clipboard.writeText(url);
                alert('✅ Link absensi berhasil disalin!');
              }}
              className="w-full px-4 py-2 bg-[#F8FAFC] text-[#2D5BE3] rounded-lg hover:bg-[#F1F5F9] transition-colors text-sm font-medium"
            >
              📋 Salin Link
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL SCANNER QR ===== */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ===== TAB ABSENSI ===== */}
      {activeTab === 'absensi' && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-sm flex gap-2">
            <button
              onClick={() => setAbsensiSubTab('input')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                absensiSubTab === 'input'
                  ? 'bg-[#2D5BE3] text-white'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              📝 Input Harian
            </button>
            <button
              onClick={() => setAbsensiSubTab('rekap')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                absensiSubTab === 'rekap'
                  ? 'bg-[#2D5BE3] text-white'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              📊 Rekap Absensi
            </button>
          </div>

          {/* Input Harian - Diganti dengan tampilan menu absensi lengkap */}
          {absensiSubTab === 'input' && (
            <div className="space-y-4">
              {/* Mode selection: 'qr' untuk scan kartu siswa, 'manual' untuk input manual */}
              {!absensiMode && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
                  <p className="text-6xl mb-4">👆</p>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">Pilih Mode Absensi</h3>
                  <p className="text-[#64748B] mb-6">
                    Pilih salah satu mode di bawah untuk memulai absensi
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => setAbsensiMode('qr')}
                      className="px-8 py-4 bg-gradient-to-r from-[#2D5BE3] to-[#1E40AF] text-white rounded-xl hover:shadow-lg transition-all font-medium text-base"
                    >
                      <span className="text-2xl block mb-1">📷</span>
                      Scan QR Code Kartu Siswa
                    </button>
                    <button
                      onClick={() => setAbsensiMode('manual')}
                      className="px-8 py-4 bg-gradient-to-r from-[#059669] to-[#047857] text-white rounded-xl hover:shadow-lg transition-all font-medium text-base"
                    >
                      <span className="text-2xl block mb-1">✍️</span>
                      Input Manual
                    </button>
                  </div>
                  
                  <div className="mt-8 grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                    <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                      <h4 className="font-semibold text-[#0F172A] mb-2">🎯 Mode Scan QR</h4>
                      <ul className="text-sm text-[#64748B] space-y-1">
                        <li>• Siswa menunjukkan kartu absen berisi QR Code</li>
                        <li>• Guru scan menggunakan kamera</li>
                        <li>• Otomatis tercatat sebagai Hadir</li>
                        <li>• Cepat dan anti kecurangan</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                      <h4 className="font-semibold text-[#0F172A] mb-2">📝 Mode Manual</h4>
                      <ul className="text-sm text-[#64748B] space-y-1">
                        <li>• Tampil daftar semua siswa</li>
                        <li>• Guru klik status H/S/I/A per siswa</li>
                        <li>• Bisa simpan semua sekaligus</li>
                        <li>• Cocok untuk siswa tanpa kartu</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode QR Scanner */}
              {absensiMode === 'qr' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Scanner Panel */}
                  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-[#0F172A]">📷 Scan QR Code Siswa</h2>
                      <span className="text-xs text-[#64748B] bg-[#F8FAFC] px-2 py-1 rounded">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    
                    <div className="text-center py-8">
                      <div className="mb-6">
                        <div className="inline-block p-6 bg-gradient-to-br from-[#2D5BE3] to-[#1E40AF] rounded-full mb-4">
                          <p className="text-5xl">🎴</p>
                        </div>
                        <p className="text-sm text-[#64748B] mb-2">
                          <strong>Cara Penggunaan:</strong>
                        </p>
                        <p className="text-sm text-[#64748B]">
                          Minta siswa menunjukkan kartu absen,<br/>
                          lalu arahkan kamera ke QR Code.
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => setShowScanner(true)}
                        disabled={savingAbsen}
                        className="w-full mb-4 py-3 text-base"
                      >
                        {savingAbsen ? '⏳ Memproses...' : '📷 Mulai Scan QR Code'}
                      </Button>
                      
                      {scanningResult && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-[#DCFCE7] to-[#BBF7D0] rounded-xl border-2 border-[#059669] animate-pulse">
                          <p className="text-sm font-semibold text-[#059669] mb-1">✅ Berhasil Discan!</p>
                          <p className="text-lg font-bold text-[#059669]">{scanningResult.nama}</p>
                          <p className="text-xs text-[#059669] mt-1">
                            {scanningResult.waktu} • Status: Hadir
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Recent Scans */}
                    {recentScans.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                        <h3 className="text-sm font-semibold text-[#0F172A] mb-3">📋 Scan Terakhir (Max 10)</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {recentScans.map((scan, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                              <span className="font-medium text-[#0F172A]">{scan.nama}</span>
                              <span className="text-xs text-[#64748B]">{scan.waktu}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* History & Summary Panel */}
                  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-[#0F172A]">📊 Ringkasan Absensi</h2>
                      <button
                        onClick={exportRekapAbsensi}
                        className="text-xs px-3 py-1.5 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors font-medium"
                      >
                        📥 Export Excel
                      </button>
                    </div>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0] rounded-xl border border-[#059669] text-center">
                        <p className="text-xs text-[#059669] font-medium">Hadir</p>
                        <p className="text-2xl font-bold text-[#059669]">{summary.hadir}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl border border-[#D97706] text-center">
                        <p className="text-xs text-[#D97706] font-medium">Sakit</p>
                        <p className="text-2xl font-bold text-[#D97706]">{summary.sakit}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] rounded-xl border border-[#0369A1] text-center">
                        <p className="text-xs text-[#0369A1] font-medium">Izin</p>
                        <p className="text-2xl font-bold text-[#0369A1]">{summary.izin}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] rounded-xl border border-[#DC2626] text-center">
                        <p className="text-xs text-[#DC2626] font-medium">Alpha</p>
                        <p className="text-2xl font-bold text-[#DC2626]">{summary.alpha}</p>
                      </div>
                    </div>
                    
                    {/* Absensi List */}
                    {absensiHistory.length === 0 ? (
                      <div className="text-center py-12 text-[#64748B]">
                        <p className="text-5xl mb-3">📭</p>
                        <p className="text-sm">Belum ada siswa yang absen</p>
                        <p className="text-xs mt-1">Mulai scan QR Code kartu siswa</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {absensiHistory.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:shadow-sm transition-shadow">
                            <div>
                              <p className="font-medium text-[#0F172A]">{item.siswa?.nama || '-'}</p>
                              <p className="text-xs text-[#64748B]">
                                {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.status === 'H' ? 'bg-[#DCFCE7] text-[#059669]' :
                              item.status === 'S' ? 'bg-[#FEF3C7] text-[#D97706]' :
                              item.status === 'I' ? 'bg-[#DBEAFE] text-[#0369A1]' :
                              'bg-[#FEE2E2] text-[#DC2626]'
                            }`}>
                              {item.status === 'H' ? 'Hadir' :
                               item.status === 'S' ? 'Sakit' :
                               item.status === 'I' ? 'Izin' : 'Alpha'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Manual Input */}
              {absensiMode === 'manual' && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-lg font-semibold text-[#0F172A]">✍️ Input Absensi Manual</h2>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSaveAbsen}
                        className="bg-[#059669] hover:bg-[#047857]"
                        disabled={savingAbsen}
                      >
                        💾 Simpan Semua
                      </Button>
                      <button
                        onClick={exportRekapAbsensi}
                        className="px-4 py-2 bg-[#2D5BE3] text-white rounded-lg hover:bg-[#1E40AF] transition-colors text-sm font-medium"
                      >
                        📥 Export Excel
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="p-3 bg-[#DCFCE7] rounded-lg text-center">
                      <p className="text-xs text-[#059669]">Hadir</p>
                      <p className="text-xl font-bold text-[#059669]">{summary.hadir}</p>
                    </div>
                    <div className="p-3 bg-[#FEF3C7] rounded-lg text-center">
                      <p className="text-xs text-[#D97706]">Sakit</p>
                      <p className="text-xl font-bold text-[#D97706]">{summary.sakit}</p>
                    </div>
                    <div className="p-3 bg-[#DBEAFE] rounded-lg text-center">
                      <p className="text-xs text-[#0369A1]">Izin</p>
                      <p className="text-xl font-bold text-[#0369A1]">{summary.izin}</p>
                    </div>
                    <div className="p-3 bg-[#FEE2E2] rounded-lg text-center">
                      <p className="text-xs text-[#DC2626]">Alpha</p>
                      <p className="text-xl font-bold text-[#DC2626]">{summary.alpha}</p>
                    </div>
                  </div>

                  {siswaList.length === 0 ? (
                    <div className="text-center py-12 text-[#64748B]">
                      <p className="text-4xl mb-3">📭</p>
                      <p>Tidak ada siswa di kelas ini</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-[#64748B]">No</th>
                            <th className="px-4 py-3 text-left font-medium text-[#64748B]">Nama Siswa</th>
                            <th className="px-4 py-3 text-left font-medium text-[#64748B]">NIS/NISN</th>
                            <th className="px-4 py-3 text-center font-medium text-[#64748B]">Status Kehadiran</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {siswaList.map((siswa, idx) => (
                            <tr key={siswa.id} className="hover:bg-[#F8FAFC] transition-colors">
                              <td className="px-4 py-3 text-[#64748B] font-medium">{idx + 1}</td>
                              <td className="px-4 py-3 font-semibold text-[#0F172A]">{siswa.nama}</td>
                              <td className="px-4 py-3 text-[#64748B]">
                                <div className="text-xs">
                                  <div>NIS: {siswa.nis || '-'}</div>
                                  <div>NISN: {siswa.nisn || '-'}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  {[
                                    { code: 'H', label: 'Hadir', color: 'bg-[#059669]', hover: 'hover:bg-[#047857]' },
                                    { code: 'S', label: 'Sakit', color: 'bg-[#D97706]', hover: 'hover:bg-[#B45309]' },
                                    { code: 'I', label: 'Izin', color: 'bg-[#0369A1]', hover: 'hover:bg-[#075985]' },
                                    { code: 'A', label: 'Alpha', color: 'bg-[#DC2626]', hover: 'hover:bg-[#B91C1C]' }
                                  ].map(status => (
                                    <button
                                      key={status.code}
                                      onClick={() => setAttendance(prev => ({ ...prev, [siswa.id]: status.code }))}
                                      title={status.label}
                                      className={`w-12 h-12 rounded-xl text-base font-bold transition-all transform hover:scale-105 ${
                                        attendance[siswa.id] === status.code
                                          ? `${status.color} text-white shadow-md`
                                          : 'bg-[#F8FAFC] text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#2D5BE3]'
                                      }`}
                                    >
                                      {status.code}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Back button when mode is selected */}
              {absensiMode && (
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                  <button
                    onClick={() => setAbsensiMode(null)}
                    className="text-sm text-[#64748B] hover:text-[#2D5BE3] transition-colors"
                  >
                    ← Kembali ke pilihan mode
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rekap Absensi */}
          {absensiSubTab === 'rekap' && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">📊 Rekap Absensi</h3>
                  <p className="text-sm text-[#64748B]">{selectedMapelName} • {rekapAbsensi.length > 0 ? rekapAbsensi[0].total : 0} pertemuan</p>
                </div>
                <Button onClick={exportRekapAbsensi} className="bg-[#059669] hover:bg-[#047857]">
                  📥 Export Excel
                </Button>
              </div>

              {loadingRekap ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5BE3]"></div>
                </div>
              ) : rekapAbsensi.length === 0 ? (
                <div className="text-center py-12 text-[#64748B]">
                  <p className="text-4xl mb-3">📭</p>
                  <p>Belum ada data absensi untuk mata pelajaran ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <tr>
                        <th className="px-4 py-3 text-left sticky left-0 bg-[#F8FAFC]">Nama Siswa</th>
                        {rekapAbsensi[0] && Object.keys(rekapAbsensi[0].kehadiran).sort().map(tgl => (
                          <th key={tgl} className="px-3 py-3 text-center text-xs whitespace-nowrap">
                            {new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                          </th>
                        ))}
                        <th className="px-3 py-3 text-center bg-[#DCFCE7]">H</th>
                        <th className="px-3 py-3 text-center bg-[#FEF3C7]">S</th>
                        <th className="px-3 py-3 text-center bg-[#DBEAFE]">I</th>
                        <th className="px-3 py-3 text-center bg-[#FEE2E2]">A</th>
                        <th className="px-3 py-3 text-center bg-[#EFF6FF] font-bold">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {rekapAbsensi.map((r, idx) => (
                        <tr key={r.siswa_id} className="hover:bg-[#F8FAFC]">
                          <td className="px-4 py-2 font-medium text-[#0F172A] sticky left-0 bg-white">
                            {idx + 1}. {r.nama}
                          </td>
                          {Object.keys(r.kehadiran).sort().map(tgl => (
                            <td key={tgl} className="px-3 py-2 text-center">
                              <span className={`inline-block w-6 h-6 leading-6 rounded text-xs font-bold ${
                                r.kehadiran[tgl] === 'H' ? 'bg-[#DCFCE7] text-[#166534]'
                                : r.kehadiran[tgl] === 'S' ? 'bg-[#FEF3C7] text-[#92400E]'
                                : r.kehadiran[tgl] === 'I' ? 'bg-[#DBEAFE] text-[#1E40AF]'
                                : 'bg-[#FEE2E2] text-[#991B1B]'
                              }`}>
                                {r.kehadiran[tgl]}
                              </span>
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center font-bold text-[#059669]">{r.hadir}</td>
                          <td className="px-3 py-2 text-center font-bold text-[#D97706]">{r.sakit}</td>
                          <td className="px-3 py-2 text-center font-bold text-[#0369A1]">{r.izin}</td>
                          <td className="px-3 py-2 text-center font-bold text-[#DC2626]">{r.alpha}</td>
                          <td className="px-3 py-2 text-center font-bold text-[#2D5BE3]">{r.persentase}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB PENILAIAN ===== */}
      {activeTab === 'penilaian' && (
        <div className="space-y-4">
          {/* Filter Buttons */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-bold text-[#334155] mb-3">Pilih Jenis Penilaian:</h3>
            <div className="flex flex-wrap gap-2">
              {tpList.map(tp => (
                <button
                  key={tp.id}
                  onClick={() => setJenisPenilaian(`tp_${tp.id}`)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    jenisPenilaian === `tp_${tp.id}`
                      ? 'bg-[#2D5BE3] text-white'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2D5BE3]'
                  }`}
                >
                  {tp.kode_tp}
                </button>
              ))}
              <button
                onClick={() => setJenisPenilaian('sts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  jenisPenilaian === 'sts'
                    ? 'bg-[#D97706] text-white'
                    : 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]'
                }`}
              >
                STS
              </button>
              <button
                onClick={() => setJenisPenilaian('sas')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  jenisPenilaian === 'sas'
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]'
                }`}
              >
                SAS
              </button>
              <button
                onClick={() => setJenisPenilaian('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  jenisPenilaian === 'all'
                    ? 'bg-[#059669] text-white'
                    : 'bg-[#F0FDF4] text-[#065F46] hover:bg-[#DCFCE7]'
                }`}
              >
                📊 ALL (Rekap)
              </button>
            </div>
          </div>

          {/* Mode: Input per TP */}
          {jenisPenilaian.startsWith('tp_') && (
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Nama Aktivitas (Opsional)</label>
                <input
                  type="text"
                  value={formatifAktivitas}
                  onChange={(e) => setFormatifAktivitas(e.target.value)}
                  placeholder="Contoh: Kuis 1, PR, Presentasi"
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-base font-medium text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] mobile-input-high-contrast min-h-[48px]"
                />
              </div>

              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">No</th>
                    <th className="px-4 py-3 text-left">Nama Siswa</th>
                    <th className="px-4 py-3 text-center w-40">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {siswaList.map((siswa, idx) => (
                    <tr key={siswa.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 text-[#64748B]">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-[#0F172A]">{siswa.nama}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formatifNilai[siswa.id] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (/^\d*\.?\d*$/.test(val) && parseFloat(val) <= 100)) {
                              setFormatifNilai(prev => ({ ...prev, [siswa.id]: val }));
                            }
                          }}
                          placeholder="0"
                          className="w-24 px-3 py-1.5 text-center border border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#2D5BE3] text-base font-semibold text-[#0F172A] bg-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end mt-4">
                <Button
                  onClick={() => {
                    setSelectedTP(jenisPenilaian.replace('tp_', ''));
                    handleSaveFormatif();
                  }}
                  disabled={savingFormatif}
                >
                  {savingFormatif ? 'Menyimpan...' : '💾 Simpan Nilai'}
                </Button>
              </div>
            </div>
          )}

          {/* Mode: Input STS */}
          {jenisPenilaian === 'sts' && (
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
              <div className="p-3 bg-[#FEF3C7] rounded-lg mb-4 text-sm text-[#92400E] font-medium">
                📝 Input Nilai Sumatif Tengah Semester (STS)
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">No</th>
                    <th className="px-4 py-3 text-left">Nama Siswa</th>
                    <th className="px-4 py-3 text-center w-40">Nilai STS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {siswaList.map((siswa, idx) => (
                    <tr key={siswa.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 text-[#64748B]">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-[#0F172A]">{siswa.nama}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={stsNilai[siswa.id] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (/^\d*\.?\d*$/.test(val) && parseFloat(val) <= 100)) {
                              setStsNilai(prev => ({ ...prev, [siswa.id]: val }));
                            }
                          }}
                          placeholder="0"
                          className="w-24 px-3 py-1.5 text-center border border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#D97706] text-base font-semibold text-[#0F172A] bg-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end mt-4">
                <Button onClick={handleSaveSTS} disabled={savingSTS} className="bg-[#D97706] hover:bg-[#92400E]">
                  {savingSTS ? 'Menyimpan...' : '💾 Simpan Nilai STS'}
                </Button>
              </div>
            </div>
          )}

          {/* Mode: Input SAS */}
          {jenisPenilaian === 'sas' && (
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
              <div className="p-3 bg-[#FEE2E2] rounded-lg mb-4 text-sm text-[#991B1B] font-medium">
                📝 Input Nilai Sumatif Akhir Semester (SAS)
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">No</th>
                    <th className="px-4 py-3 text-left">Nama Siswa</th>
                    <th className="px-4 py-3 text-center w-40">Nilai SAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {siswaList.map((siswa, idx) => (
                    <tr key={siswa.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 text-[#64748B]">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-[#0F172A]">{siswa.nama}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={sasNilai[siswa.id] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (/^\d*\.?\d*$/.test(val) && parseFloat(val) <= 100)) {
                              setSasNilai(prev => ({ ...prev, [siswa.id]: val }));
                            }
                          }}
                          placeholder="0"
                          className="w-24 px-3 py-1.5 text-center border border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#DC2626] text-base font-semibold text-[#0F172A] bg-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end mt-4">
                <Button onClick={handleSaveSAS} disabled={savingSAS} className="bg-[#DC2626] hover:bg-[#991B1B]">
                  {savingSAS ? 'Menyimpan...' : '💾 Simpan Nilai SAS'}
                </Button>
              </div>
            </div>
          )}

          {/* Mode: ALL (Rekap) */}
          {jenisPenilaian === 'all' && (
            <RekapNilaiView
              selectedMapel={selectedMapel}
              tpList={tpList}
              siswaList={siswaList}
              onExport={exportRekapNilai}
            />
          )}
        </div>
      )}

      {/* ===== TAB MATERI ===== */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">📖 Modul & Bahan Ajar</h3>
                <p className="text-sm text-[#64748B] mt-1">Pilih modul ajar untuk melihat bahan ajar pendukung</p>
              </div>
            </div>

            {/* Dropdown Modul Ajar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#334155] mb-1.5">Pilih Modul Ajar</label>
              <select
                value={selectedModul}
                onChange={(e) => setSelectedModul(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-base font-medium text-[#0F172A] bg-white mobile-input-high-contrast min-h-[48px]"
              >
                <option value="">-- Pilih Modul Ajar --</option>
                {modulAjarList.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.judul} {m.tujuan_pembelajaran ? `(${m.tujuan_pembelajaran.kode_tp})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Detail Modul & Bahan Ajar */}
            {selectedModul && modulAjarList.find(m => m.id === selectedModul) && (
              <div className="space-y-4">
                {/* Info Modul */}
                <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                  {(() => {
                    const modul = modulAjarList.find(m => m.id === selectedModul);
                    return (
                      <>
                        <h4 className="font-bold text-[#0F172A] text-lg mb-2">{modul.judul}</h4>
                        {modul.tujuan_pembelajaran && (
                          <p className="text-sm text-[#64748B] mb-2">
                            🎯 <span className="font-semibold">{modul.tujuan_pembelajaran.kode_tp}:</span> {modul.tujuan_pembelajaran.teks}
                          </p>
                        )}
                        {modul.deskripsi && <p className="text-sm text-[#334155] mb-2">{modul.deskripsi}</p>}
                        {modul.alokasi_waktu && (
                          <p className="text-xs text-[#64748B]">⏱️ {modul.alokasi_waktu}</p>
                        )}
                        {modul.file_url && (
                          <a
                            href={modul.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FEF2F2] text-[#DC2626] rounded-lg text-xs font-medium hover:bg-[#FEE2E2] transition-colors mt-2"
                          >
                            📄 Download Modul Ajar (PDF)
                          </a>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Bahan Ajar Pendukung */}
                <div>
                  <h5 className="text-sm font-bold text-[#334155] uppercase tracking-wide mb-3">
                    📎 Bahan Ajar Pendukung ({bahanAjarList.length})
                  </h5>
                  {loadingMateri ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5BE3]"></div>
                    </div>
                  ) : bahanAjarList.length === 0 ? (
                    <div className="text-center py-8 text-[#64748B] bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">
                      <p className="text-3xl mb-2">📚</p>
                      <p>Belum ada bahan ajar untuk modul ini.</p>
                      <p className="text-xs mt-1">Tambahkan di menu <strong>Bahan Ajar</strong></p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {bahanAjarList.map(bahan => (
                        <a
                          key={bahan.id}
                          href={bahan.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:bg-[#EFF6FF] hover:border-[#2D5BE3] transition-all group"
                        >
                          <span className="text-3xl">
                            {bahan.jenis === 'ppt' ? '📊' :
                             bahan.jenis === 'video' ? '🎥' :
                             bahan.jenis === 'lkpd' ? '📝' :
                             bahan.jenis === 'pdf' ? '📄' :
                             bahan.jenis === 'link' ? '🔗' : '📎'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0F172A] truncate group-hover:text-[#2D5BE3]">
                              {bahan.nama_file}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {bahan.jenis.toUpperCase()} {bahan.deskripsi ? `• ${bahan.deskripsi}` : ''}
                            </p>
                          </div>
                          <span className="text-[#2D5BE3] opacity-0 group-hover:opacity-100 transition-opacity">↗️</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedModul && (
              <div className="text-center py-12 text-[#64748B]">
                <p className="text-4xl mb-3">📖</p>
                <p>Pilih modul ajar dari dropdown di atas untuk melihat detail dan bahan ajar pendukung.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== KOMPONEN REKAP NILAI =====
function RekapNilaiView({ selectedMapel, tpList, siswaList, onExport }) {
  const [rekapData, setRekapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRekap = async () => {
      setLoading(true);

      // Load semua nilai formatif
      const { data: formatif } = await supabase
        .from('nilai_formatif')
        .select('siswa_id, tp_id, angka')
        .eq('mapel_id', selectedMapel);

      // Load semua nilai sumatif (STS/SAS)
      const { data: sumatif } = await supabase
        .from('nilai_sumatif')
        .select('siswa_id, jenis, angka')
        .eq('mapel_id', selectedMapel);

      // Format data
      const rekap = siswaList.map(siswa => {
        const nilaiFormatif = formatif?.filter(f => f.siswa_id === siswa.id) || [];
        const nilaiSumatif = sumatif?.filter(s => s.siswa_id === siswa.id) || [];

        const tpNilai = {};
        tpList.forEach(tp => {
          const nilai = nilaiFormatif.find(f => f.tp_id === tp.id);
          tpNilai[tp.id] = nilai ? nilai.angka : null;
        });

        const sts = nilaiSumatif.find(s => s.jenis === 'STS')?.angka || null;
        const sas = nilaiSumatif.find(s => s.jenis === 'SAS')?.angka || null;

        // Hitung rata-rata
        const allNilai = [
          ...Object.values(tpNilai).filter(n => n !== null),
          sts,
          sas
        ].filter(n => n !== null);

        const rataRata = allNilai.length > 0
          ? (allNilai.reduce((a, b) => a + b, 0) / allNilai.length).toFixed(2)
          : null;

        return {
          siswa_id: siswa.id,
          nama: siswa.nama,
          tpNilai,
          sts,
          sas,
          rataRata
        };
      });

      setRekapData(rekap);
      setLoading(false);
    };

    loadRekap();
  }, [selectedMapel, tpList, siswaList]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5BE3]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">📊 Rekap Nilai Lengkap</h3>
          <p className="text-sm text-[#64748B]">{siswaList.length} siswa • {tpList.length} TP</p>
        </div>
        <Button onClick={onExport} className="bg-[#059669] hover:bg-[#047857]">
          📥 Export Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-4 py-3 text-left sticky left-0 bg-[#F8FAFC]">Nama Siswa</th>
              {tpList.map(tp => (
                <th key={tp.id} className="px-3 py-3 text-center text-xs">
                  {tp.kode_tp}
                </th>
              ))}
              <th className="px-3 py-3 text-center bg-[#FEF3C7]">STS</th>
              <th className="px-3 py-3 text-center bg-[#FEE2E2]">SAS</th>
              <th className="px-3 py-3 text-center bg-[#EFF6FF] font-bold">Rata²</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {rekapData.map((r, idx) => (
              <tr key={r.siswa_id} className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-2 font-medium text-[#0F172A] sticky left-0 bg-white">
                  {idx + 1}. {r.nama}
                </td>
                {tpList.map(tp => (
                  <td key={tp.id} className="px-3 py-2 text-center">
                    {r.tpNilai[tp.id] !== null ? (
                      <span className="font-semibold text-[#0F172A]">{r.tpNilai[tp.id]}</span>
                    ) : (
                      <span className="text-[#CBD5E1]">-</span>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  {r.sts !== null ? (
                    <span className="font-semibold text-[#D97706]">{r.sts}</span>
                  ) : (
                    <span className="text-[#CBD5E1]">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.sas !== null ? (
                    <span className="font-semibold text-[#DC2626]">{r.sas}</span>
                  ) : (
                    <span className="text-[#CBD5E1]">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.rataRata !== null ? (
                    <span className="font-bold text-[#2D5BE3]">{r.rataRata}</span>
                  ) : (
                    <span className="text-[#CBD5E1]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ManajemenPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>}>
      <ManajemenContent />
    </Suspense>
  );
}