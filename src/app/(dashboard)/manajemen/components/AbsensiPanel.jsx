'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import QRScanner from '@/components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/config/supabase';

/**
 * Komponen untuk mengelola absensi dengan QR Code
 */
export default function AbsensiQRPanel({ 
  selectedMapel, 
  tanggalKonteks, 
  profile,
  attendance,
  setAttendance,
  absensiHistory,
  loadAbsensiHistory,
  rekapAbsensi,
  onExport 
}) {
  const [absensiMode, setAbsensiMode] = useState(null); // 'manual' atau 'qr'
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [scanningResult, setScanningResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [savingAbsen, setSavingAbsen] = useState(false);

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

  // Calculate summary
  const summary = {
    hadir: absensiHistory.filter(a => a.status === 'H').length,
    sakit: absensiHistory.filter(a => a.status === 'S').length,
    izin: absensiHistory.filter(a => a.status === 'I').length,
    alpha: absensiHistory.filter(a => a.status === 'A').length
  };

  return (
    <div className="space-y-4">
      {/* Mode selection */}
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
                onClick={() => onExport(rekapAbsensi)}
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
                onClick={() => onExport(rekapAbsensi)}
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

          <p className="text-center text-[#64748B] py-4">
            [Tabel input manual siswa akan ditampilkan di sini - kode tabel yang sama seperti aslinya]
          </p>
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

      {/* Modal QR Code */}
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

      {/* Modal Scanner */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
