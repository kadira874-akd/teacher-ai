'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Button from '@/components/ui/Button';
import QRScanner from '@/components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Halaman Absensi Terpadu - Guru dapat memilih antara:
 * 1. Mode Scan QR Code (scan kartu absen siswa)
 * 2. Mode Input Manual (centang status per siswa)
 */
export default function AbsensiPage() {
  const { profile } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  // Mode selection: 'qr' untuk scan kartu siswa, 'manual' untuk input manual
  const [scanMode, setScanMode] = useState(null);
  
  // QR Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scannedSiswa, setScannedSiswa] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  
  // Data absensi
  const [absensiHistory, setAbsensiHistory] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [attendance, setAttendance] = useState({});

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      if (!profile?.id) return;
      
      // Ambil kelas yang diajar guru
      const { data: kelasData } = await supabase
        .from('kelas')
        .select('id')
        .eq('guru_id', profile.id)
        .limit(1);
      
      if (kelasData?.length > 0) {
        const kId = kelasData[0].id;
        setKelasId(kId);
        
        // Ambil mapel untuk kelas ini
        const { data: mapel } = await supabase
          .from('mapel')
          .select('*')
          .eq('kelas_id', kId)
          .order('urutan');
        
        setMapelList(mapel || []);
        
        if (mapel?.length > 0) {
          setSelectedMapel(mapel[0].id);
        }
      }
      setLoading(false);
    };
    
    initData();
  }, [profile]);

  // Load absensi history ketika mapel atau tanggal berubah
  useEffect(() => {
    if (selectedMapel && tanggal) {
      loadAbsensiHistory();
      loadSiswaList();
    }
  }, [selectedMapel, tanggal]);

  const loadAbsensiHistory = async () => {
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
      .eq('tanggal', tanggal)
      .order('created_at', { ascending: false });
    
    setAbsensiHistory(absensi || []);
  };

  const loadSiswaList = async () => {
    if (!selectedMapel) return;
    
    // Get kelas from mapel
    const { data: mapel } = await supabase
      .from('mapel')
      .select('kelas_id')
      .eq('id', selectedMapel)
      .single();
    
    if (mapel) {
      const { data: siswa } = await supabase
        .from('siswa')
        .select('id, nama, nis, nisn')
        .eq('kelas_id', mapel.kelas_id)
        .order('nama');
      
      setSiswaList(siswa || []);
      
      // Load existing absensi
      const { data: absensi } = await supabase
        .from('absensi')
        .select('siswa_id, status')
        .eq('mapel_id', selectedMapel)
        .eq('tanggal', tanggal);
      
      const attendanceMap = {};
      absensi?.forEach(a => {
        attendanceMap[a.siswa_id] = a.status;
      });
      setAttendance(attendanceMap);
    }
  };

  // Handle QR Code scan dari kartu siswa
  const handleScanSuccess = async (decodedText) => {
    try {
      const scannedData = JSON.parse(decodedText);
      
      // Validasi tipe QR Code - harus dari kartu siswa
      if (scannedData.type !== 'SISWA') {
        alert('⚠️ QR Code tidak valid! Gunakan QR Code dari kartu absen siswa.');
        setShowScanner(false);
        return;
      }
      
      setProcessing(true);
      
      // Ambil data siswa dari database
      const { data: siswaData, error: siswaError } = await supabase
        .from('siswa')
        .select('id, nama, nis, nisn')
        .eq('id', scannedData.siswa_id)
        .single();
      
      if (siswaError || !siswaData) {
        alert('⚠️ Data siswa tidak ditemukan! Pastikan kartu absen valid.');
        setShowScanner(false);
        setProcessing(false);
        return;
      }
      
      // Cek apakah sudah absen hari ini
      const { data: existingAbsen } = await supabase
        .from('absensi')
        .select('id, status')
        .eq('siswa_id', scannedData.siswa_id)
        .eq('mapel_id', selectedMapel)
        .eq('tanggal', tanggal)
        .single();
      
      if (existingAbsen) {
        const statusLabel = existingAbsen.status;
        alert(`ℹ️ ${siswaData.nama} sudah absen dengan status: ${statusLabel}`);
        setShowScanner(false);
        setProcessing(false);
        return;
      }
      
      // Simpan absensi dengan status Hadir
      const { error: insertError } = await supabase.from('absensi').insert({
        siswa_id: scannedData.siswa_id,
        mapel_id: selectedMapel,
        tanggal: tanggal,
        status: 'Hadir',
        sumber: 'qr'
      });
      
      if (insertError) {
        alert('⚠️ Gagal menyimpan absensi: ' + insertError.message);
        setProcessing(false);
        return;
      }
      
      // Success - update state
      const scanRecord = {
        nama: siswaData.nama,
        nis: siswaData.nis,
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'Hadir'
      };
      
      setScannedSiswa(scanRecord);
      setRecentScans(prev => [scanRecord, ...prev.slice(0, 9)]);
      loadAbsensiHistory();
      
      // Auto close scanner setelah sukses
      setTimeout(() => {
        setShowScanner(false);
        setScannedSiswa(null);
      }, 2000);
      
      setProcessing(false);
      
    } catch (e) {
      console.error('Scan error:', e);
      alert('⚠️ Format QR Code tidak valid!');
      setShowScanner(false);
      setProcessing(false);
    }
  };

  // Handle manual absen per siswa
  const handleManualAbsen = async (siswaId, status) => {
    setProcessing(true);
    
    const { error } = await supabase.from('absensi').upsert({
      siswa_id: siswaId,
      mapel_id: selectedMapel,
      tanggal: tanggal,
      status: status,
      sumber: 'manual'
    }, {
      onConflict: 'siswa_id,mapel_id,tanggal'
    });
    
    if (error) {
      alert('Gagal menyimpan absensi: ' + error.message);
    } else {
      loadAbsensiHistory();
      setAttendance(prev => ({ ...prev, [siswaId]: status }));
    }
    
    setProcessing(false);
  };

  // Save all manual attendance
  const handleSaveAllAttendance = async () => {
    const payload = Object.entries(attendance).map(([siswaId, status]) => ({
      siswa_id: siswaId,
      mapel_id: selectedMapel,
      tanggal: tanggal,
      status,
      sumber: 'manual'
    }));
    
    if (payload.length === 0) {
      alert('Tidak ada absensi yang diisi');
      return;
    }
    
    const { error } = await supabase.from('absensi').upsert(payload, {
      onConflict: 'siswa_id,mapel_id,tanggal'
    });
    
    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      alert('✅ Absensi berhasil disimpan!');
      loadAbsensiHistory();
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (absensiHistory.length === 0) {
      alert('Belum ada data absensi untuk diekspor');
      return;
    }
    
    const data = absensiHistory.map(item => ({
      'Nama Siswa': item.siswa?.nama || '-',
      'Status': item.status,
      'Waktu Absen': new Date(item.created_at).toLocaleString('id-ID')
    }));
    
    const ws = require('xlsx').utils.json_to_sheet(data);
    const wb = require('xlsx').utils.book_new();
    require('xlsx').utils.book_append_sheet(wb, ws, 'Absensi');
    require('file-saver').saveAs(require('xlsx').write(wb, { type: 'array' }), `Absensi_${tanggal}.xlsx`);
  };

  // Calculate summary
  const summary = {
    hadir: absensiHistory.filter(a => a.status === 'Hadir').length,
    sakit: absensiHistory.filter(a => a.status === 'Sakit').length,
    izin: absensiHistory.filter(a => a.status === 'Izin').length,
    alpha: absensiHistory.filter(a => a.status === 'Alpha').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5BE3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">📋 Absensi Siswa</h1>
          <p className="text-sm text-[#64748B]">
            Pilih mode absensi: Scan QR Code kartu siswa atau input manual
          </p>
        </div>

        {/* Pengaturan Section */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">⚙️ Pengaturan Absensi</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#64748B] mb-2">
                Mata Pelajaran
              </label>
              <select
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
              >
                {mapelList.map(mapel => (
                  <option key={mapel.id} value={mapel.id}>
                    {mapel.nama}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#64748B] mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#64748B] mb-2">
                Mode Absensi
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setScanMode('qr')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    scanMode === 'qr'
                      ? 'bg-[#2D5BE3] text-white shadow-md'
                      : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#2D5BE3]'
                  }`}
                >
                  📷 Scan QR
                </button>
                <button
                  onClick={() => setScanMode('manual')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    scanMode === 'manual'
                      ? 'bg-[#2D5BE3] text-white shadow-md'
                      : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#2D5BE3]'
                  }`}
                >
                  ✍️ Manual
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content berdasarkan mode yang dipilih */}
        {!scanMode && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
            <p className="text-6xl mb-4">👆</p>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">Pilih Mode Absensi</h3>
            <p className="text-[#64748B] mb-6">
              Pilih salah satu mode di atas untuk memulai absensi
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setScanMode('qr')}
                className="px-8 py-4 bg-gradient-to-r from-[#2D5BE3] to-[#1E40AF] text-white rounded-xl hover:shadow-lg transition-all font-medium text-base"
              >
                <span className="text-2xl block mb-1">📷</span>
                Scan QR Code Kartu Siswa
              </button>
              <button
                onClick={() => setScanMode('manual')}
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
        {scanMode === 'qr' && (
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
                  disabled={processing}
                  className="w-full mb-4 py-3 text-base"
                >
                  {processing ? '⏳ Memproses...' : '📷 Mulai Scan QR Code'}
                </Button>
                
                {scannedSiswa && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#DCFCE7] to-[#BBF7D0] rounded-xl border-2 border-[#059669] animate-pulse">
                    <p className="text-sm font-semibold text-[#059669] mb-1">✅ Berhasil Discan!</p>
                    <p className="text-lg font-bold text-[#059669]">{scannedSiswa.nama}</p>
                    <p className="text-xs text-[#059669] mt-1">
                      {scannedSiswa.waktu} • Status: {scannedSiswa.status}
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
                  onClick={exportToExcel}
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
                        <p className="font-medium text-[#0F172A]">{item.siswa?.nama}</p>
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
        {scanMode === 'manual' && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
              <h2 className="text-lg font-semibold text-[#0F172A]">✍️ Input Absensi Manual</h2>
              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveAllAttendance}
                  className="bg-[#059669] hover:bg-[#047857]"
                  disabled={processing}
                >
                  💾 Simpan Semua
                </Button>
                <button
                  onClick={exportToExcel}
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
                                onClick={() => handleManualAbsen(siswa.id, status.code)}
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
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner 
          onScanSuccess={handleScanSuccess}
          onClose={() => {
            setShowScanner(false);
            setScannedSiswa(null);
          }}
        />
      )}
    </div>
  );
}
