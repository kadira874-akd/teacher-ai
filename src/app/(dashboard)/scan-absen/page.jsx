'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Button from '@/components/ui/Button';
import QRScanner from '@/components/QRScanner';

export default function ScanAbsenPage() {
  const { profile } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState(null); // 'qr' or 'manual'
  const [scannedSiswa, setScannedSiswa] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [absensiHistory, setAbsensiHistory] = useState([]);

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

  // Load absensi history untuk tanggal yang dipilih
  useEffect(() => {
    if (selectedMapel && tanggal) {
      loadAbsensiHistory();
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
        const statusLabel = existingAbsen.status === 'H' ? 'Hadir' :
                           existingAbsen.status === 'S' ? 'Sakit' :
                           existingAbsen.status === 'I' ? 'Izin' : 'Alpha';
        alert(`ℹ️ ${siswaData.nama} sudah absen hari ini dengan status: ${statusLabel}`);
        setShowScanner(false);
        setProcessing(false);
        return;
      }
      
      // Simpan absensi dengan status Hadir
      const { error: insertError } = await supabase.from('absensi').insert({
        siswa_id: scannedData.siswa_id,
        mapel_id: selectedMapel,
        tanggal: tanggal,
        status: 'H'
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
      setRecentScans(prev => [scanRecord, ...prev.slice(0, 9)]); // Keep last 10
      setAbsensiHistory(prev => [{
        id: Date.now(),
        siswa_id: scannedData.siswa_id,
        status: 'H',
        created_at: new Date().toISOString(),
        siswa: { id: scannedData.siswa_id, nama: siswaData.nama }
      }, ...prev]);
      
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

  const handleManualAbsen = async (siswaId, status) => {
    setProcessing(true);
    
    const { error } = await supabase.from('absensi').upsert({
      siswa_id: siswaId,
      mapel_id: selectedMapel,
      tanggal: tanggal,
      status: status
    }, {
      onConflict: 'siswa_id,mapel_id,tanggal'
    });
    
    if (error) {
      alert('Gagal menyimpan absensi: ' + error.message);
    } else {
      // Refresh history
      loadAbsensiHistory();
    }
    
    setProcessing(false);
  };

  const exportToExcel = () => {
    if (absensiHistory.length === 0) {
      alert('Belum ada data absensi untuk diekspor');
      return;
    }
    
    const data = absensiHistory.map(item => ({
      'Nama Siswa': item.siswa?.nama || '-',
      'Status': item.status === 'H' ? 'Hadir' : item.status === 'S' ? 'Sakit' : item.status === 'I' ? 'Izin' : 'Alpha',
      'Waktu Absen': new Date(item.created_at).toLocaleString('id-ID')
    }));
    
    const ws = require('xlsx').utils.json_to_sheet(data);
    const wb = require('xlsx').utils.book_new();
    require('xlsx').utils.book_append_sheet(wb, ws, 'Absensi');
    require('file-saver').saveAs(require('xlsx').write(wb, { type: 'array' }), `Absensi_${tanggal}.xlsx`);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">📱 Scan Absensi QR Code</h1>
          <p className="text-sm text-[#64748B]">
            Scan QR Code dari kartu absen siswa atau input absensi secara manual
          </p>
        </div>

        {/* Pengaturan */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">⚙️ Pengaturan Absensi</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
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
                      ? 'bg-[#2D5BE3] text-white'
                      : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#2D5BE3]'
                  }`}
                >
                  📷 QR Code
                </button>
                <button
                  onClick={() => setScanMode('manual')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    scanMode === 'manual'
                      ? 'bg-[#2D5BE3] text-white'
                      : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#2D5BE3]'
                  }`}
                >
                  ✍️ Manual
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {scanMode === 'qr' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scanner Panel */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#0F172A]">📷 Scan QR Code Siswa</h2>
                <span className="text-xs text-[#64748B] bg-[#F8FAFC] px-2 py-1 rounded">
                  {new Date().toLocaleDateString('id-ID')}
                </span>
              </div>
              
              <div className="text-center py-8">
                <div className="mb-4">
                  <p className="text-6xl mb-4">🎴</p>
                  <p className="text-sm text-[#64748B] mb-6">
                    Minta siswa menunjukkan kartu absen yang berisi QR Code,<br/>
                    lalu arahkan kamera ke QR Code tersebut.
                  </p>
                </div>
                
                <Button 
                  onClick={() => setShowScanner(true)}
                  disabled={processing}
                  className="w-full mb-4"
                >
                  {processing ? '⏳ Memproses...' : '📷 Mulai Scan QR Code'}
                </Button>
                
                {scannedSiswa && (
                  <div className="mt-4 p-4 bg-[#DCFCE7] rounded-xl border border-[#059669] animate-pulse">
                    <p className="text-sm font-semibold text-[#059669]">✅ Berhasil!</p>
                    <p className="text-lg font-bold text-[#059669]">{scannedSiswa.nama}</p>
                    <p className="text-xs text-[#059669]">
                      {scannedSiswa.waktu} • Status: {scannedSiswa.status}
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Scans */}
              {recentScans.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-3">📋 Scan Terakhir</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recentScans.map((scan, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 bg-[#F8FAFC] rounded">
                        <span className="font-medium text-[#0F172A]">{scan.nama}</span>
                        <span className="text-xs text-[#64748B]">{scan.waktu}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* History Panel */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#0F172A]">📊 Absensi Hari Ini</h2>
                <button
                  onClick={exportToExcel}
                  className="text-xs px-3 py-1.5 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors"
                >
                  📥 Export
                </button>
              </div>
              
              {absensiHistory.length === 0 ? (
                <div className="text-center py-12 text-[#64748B]">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-sm">Belum ada siswa yang absen</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {absensiHistory.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
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
              
              <div className="mt-4 pt-4 border-t border-[#E2E8F0] grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-[#DCFCE7] rounded-lg">
                  <p className="text-xs text-[#059669]">Hadir</p>
                  <p className="text-lg font-bold text-[#059669]">
                    {absensiHistory.filter(a => a.status === 'H').length}
                  </p>
                </div>
                <div className="p-2 bg-[#FEF3C7] rounded-lg">
                  <p className="text-xs text-[#D97706]">Sakit</p>
                  <p className="text-lg font-bold text-[#D97706]">
                    {absensiHistory.filter(a => a.status === 'S').length}
                  </p>
                </div>
                <div className="p-2 bg-[#DBEAFE] rounded-lg">
                  <p className="text-xs text-[#0369A1]">Izin</p>
                  <p className="text-lg font-bold text-[#0369A1]">
                    {absensiHistory.filter(a => a.status === 'I').length}
                  </p>
                </div>
                <div className="p-2 bg-[#FEE2E2] rounded-lg">
                  <p className="text-xs text-[#DC2626]">Alpha</p>
                  <p className="text-lg font-bold text-[#DC2626]">
                    {absensiHistory.filter(a => a.status === 'A').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {scanMode === 'manual' && (
          <ManualAbsensiPanel
            selectedMapel={selectedMapel}
            tanggal={tanggal}
            onSave={handleManualAbsen}
            processing={processing}
          />
        )}

        {!scanMode && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
            <p className="text-6xl mb-4">👆</p>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">Pilih Mode Absensi</h3>
            <p className="text-[#64748B] mb-6">
              Pilih salah satu mode absensi di atas untuk memulai
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setScanMode('qr')}
                className="px-6 py-3 bg-[#2D5BE3] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-medium"
              >
                📷 Mode QR Code
              </button>
              <button
                onClick={() => setScanMode('manual')}
                className="px-6 py-3 bg-[#F8FAFC] text-[#2D5BE3] border border-[#E2E8F0] rounded-lg hover:border-[#2D5BE3] transition-colors font-medium"
              >
                ✍️ Mode Manual
              </button>
            </div>
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

// Manual Absensi Component
function ManualAbsensiPanel({ selectedMapel, tanggal, onSave, processing }) {
  const [siswaList, setSiswaList] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSiswa = async () => {
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
          .select('id, nama, nis')
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
      
      setLoading(false);
    };
    
    loadSiswa();
  }, [selectedMapel, tanggal]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5BE3] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#0F172A]">✍️ Input Absensi Manual</h2>
        <Button 
          onClick={async () => {
            const payload = Object.entries(attendance).map(([siswaId, status]) => ({
              siswa_id: siswaId,
              mapel_id: selectedMapel,
              tanggal: tanggal,
              status
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
            }
          }}
          className="bg-[#059669] hover:bg-[#047857]"
        >
          💾 Simpan Semua
        </Button>
      </div>

      {siswaList.length === 0 ? (
        <div className="text-center py-12 text-[#64748B]">
          <p className="text-4xl mb-3">📭</p>
          <p>Tidak ada siswa di kelas ini</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#64748B]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[#64748B]">Nama Siswa</th>
                <th className="px-4 py-3 text-left font-medium text-[#64748B]">NIS</th>
                <th className="px-4 py-3 text-center font-medium text-[#64748B]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {siswaList.map((siswa, idx) => (
                <tr key={siswa.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 text-[#64748B]">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{siswa.nama}</td>
                  <td className="px-4 py-3 text-[#64748B]">{siswa.nis || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {['H', 'S', 'I', 'A'].map(status => (
                        <button
                          key={status}
                          onClick={() => onSave(siswa.id, status)}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                            attendance[siswa.id] === status
                              ? status === 'H' ? 'bg-[#059669] text-white'
                              : status === 'S' ? 'bg-[#D97706] text-white'
                              : status === 'I' ? 'bg-[#0369A1] text-white'
                              : 'bg-[#DC2626] text-white'
                              : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#2D5BE3]'
                          }`}
                        >
                          {status}
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
  );
}
