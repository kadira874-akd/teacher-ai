'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRScanner from '@/components/QRScanner';

/**
 * Komponen AbsensiTab - Tab Absensi yang Lebih Profesional
 * Fitur:
 * - Dua metode: Manual dan QR Code
 * - QR Code dengan 2 opsi: Tampilkan QR untuk di-scan siswa, atau Scan kartu siswa
 * - UI/UX yang elegan dan modern
 * - Responsive untuk mobile dan desktop
 */
export default function AbsensiTab({ 
  selectedMapel, 
  selectedMapelName,
  tanggalKonteks, 
  siswaList, 
  attendance, 
  setAttendance, 
  onSaveAbsen, 
  savingAbsen,
  rekapAbsensi,
  loadingRekap,
  onExportRekap,
  onGenerateQR,
  onScanSuccess,
  scanningResult,
  // Props dari parent untuk state management (opsional)
  absensiSubTab: parentAbsensiSubTab,
  setAbsensiSubTab: parentSetAbsensiSubTab,
  showScanner: parentShowScanner,
  setShowScanner: parentSetShowScanner,
  showQRModal: parentShowQRModal,
  setShowQRModal: parentSetShowQRModal,
  qrData: parentQrData,
  setQrData: parentSetQrData,
  handleSimpanSesiQR: parentHandleSimpanSesiQR
}) {
  // Gunakan props dari parent jika ada, atau buat state lokal
  const [localAbsensiSubTab, localSetAbsensiSubTab] = useState('input');
  const [localShowScanner, localSetShowScanner] = useState(false);
  const [localShowQRModal, localSetShowQRModal] = useState(false);
  const [localQrData, localSetQrData] = useState(null);
  const [absensiMode, setAbsensiMode] = useState('manual'); // 'manual' atau 'qr'
  
  // Gunakan nilai dari parent jika tersedia, jika tidak gunakan state lokal
  const absensiSubTab = parentAbsensiSubTab !== undefined ? parentAbsensiSubTab : localAbsensiSubTab;
  const setAbsensiSubTab = parentSetAbsensiSubTab || localSetAbsensiSubTab;
  const showScanner = parentShowScanner !== undefined ? parentShowScanner : localShowScanner;
  const setShowScanner = parentSetShowScanner || localSetShowScanner;
  const showQRModal = parentShowQRModal !== undefined ? parentShowQRModal : localShowQRModal;
  const setShowQRModal = parentSetShowQRModal || localSetShowQRModal;
  const qrData = parentQrData !== undefined ? parentQrData : localQrData;
  const setQrData = parentSetQrData || localSetQrData;
  const handleSimpanSesiQR = parentHandleSimpanSesiQR || (() => {});

  // Hitung statistik kehadiran
  const attendanceStats = Object.values(attendance).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { H: 0, S: 0, I: 0, A: 0 });

  // Handler untuk generate QR Code
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

  // Handler simpan sesi QR
  const handleSimpanSesiQR = async () => {
    if (!qrData) return;
    await onGenerateQR?.(qrData);
    alert('✅ QR Code Absensi berhasil dibuat!\nMinta siswa untuk scan QR Code ini.');
  };

  // Handler scan success
  const handleScanSuccessWrapper = async (decodedText) => {
    await onScanSuccess?.(decodedText);
    setShowScanner(false);
  };

  // Isi semua hadir
  const handleFillAllPresent = () => {
    const allPresent = {};
    siswaList.forEach(s => { allPresent[s.id] = 'H'; });
    setAttendance(allPresent);
  };

  // Reset absensi
  const handleReset = () => {
    const allEmpty = {};
    siswaList.forEach(s => { allEmpty[s.id] = 'H'; });
    setAttendance(allEmpty);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        {[
          { id: 'input', label: '📝 Input Harian', icon: '✏️' },
          { id: 'rekap', label: '📊 Rekap & Export', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAbsensiSubTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              absensiSubTab === tab.id
                ? 'bg-white text-slate-800 shadow-md scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== INPUT HARIAN ===== */}
      {absensiSubTab === 'input' && (
        <div className="space-y-6">
          {/* Card Pemilihan Metode */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Card Manual */}
            <div 
              onClick={() => setAbsensiMode('manual')}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                absensiMode === 'manual'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  absensiMode === 'manual' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1 ${
                    absensiMode === 'manual' ? 'text-blue-700' : 'text-slate-800'
                  }`}>
                    ✍️ Absen Manual
                  </h3>
                  <p className="text-sm text-slate-500">
                    Input kehadiran siswa satu per satu dengan memilih status H, S, I, atau A
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      Input Per Siswa
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Cepat & Simpel
                    </span>
                  </div>
                </div>
                {absensiMode === 'manual' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card QR Code */}
            <div 
              onClick={() => setAbsensiMode('qr')}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                absensiMode === 'qr'
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  absensiMode === 'qr' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1 ${
                    absensiMode === 'qr' ? 'text-emerald-700' : 'text-slate-800'
                  }`}>
                    📱 Absen QR Code
                  </h3>
                  <p className="text-sm text-slate-500">
                    Gunakan QR Code untuk absensi otomatis dari kartu siswa atau tampilan layar
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      Modern
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      Otomatis
                    </span>
                  </div>
                </div>
                {absensiMode === 'qr' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== MODE MANUAL ===== */}
          {absensiMode === 'manual' && (
            <div className="space-y-4 animate-fade-in">
              {/* Header Actions */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedMapelName || 'Mata Pelajaran'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {siswaList.length} siswa • {new Date(tanggalKonteks).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFillAllPresent}
                      className="px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      ✅ Isi Semua Hadir
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      🔄 Reset
                    </button>
                    <button
                      onClick={onSaveAbsen}
                      disabled={savingAbsen}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingAbsen ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan...
                        </span>
                      ) : (
                        '💾 Simpan Absensi'
                      )}
                    </button>
                  </div>
                </div>

                {/* Statistik Quick View */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {[
                    { status: 'H', label: 'Hadir', color: 'green', count: attendanceStats.H || 0 },
                    { status: 'S', label: 'Sakit', color: 'amber', count: attendanceStats.S || 0 },
                    { status: 'I', label: 'Izin', color: 'blue', count: attendanceStats.I || 0 },
                    { status: 'A', label: 'Alpha', color: 'red', count: attendanceStats.A || 0 }
                  ].map(stat => (
                    <div key={stat.status} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                          <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</p>
                        </div>
                        <span className={`text-lg font-bold text-${stat.color}-500`}>{stat.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabel Absensi */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left w-16 font-semibold text-slate-700">No</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Nama Siswa</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">Status Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {siswaList.map((siswa, idx) => (
                        <tr key={siswa.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm font-bold text-blue-700">
                                {siswa.nama.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800">{siswa.nama}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-1.5">
                              {[
                                { code: 'H', label: 'Hadir', bg: 'bg-emerald-500', border: 'border-emerald-600' },
                                { code: 'S', label: 'Sakit', bg: 'bg-amber-500', border: 'border-amber-600' },
                                { code: 'I', label: 'Izin', bg: 'bg-blue-500', border: 'border-blue-600' },
                                { code: 'A', label: 'Alpha', bg: 'bg-red-500', border: 'border-red-600' }
                              ].map(status => (
                                <button
                                  key={status.code}
                                  onClick={() => setAttendance(prev => ({ ...prev, [siswa.id]: status.code }))}
                                  title={status.label}
                                  className={`w-10 h-10 rounded-lg text-sm font-bold border-2 transition-all duration-200 ${
                                    attendance[siswa.id] === status.code
                                      ? `${status.bg} text-white ${status.border} shadow-md scale-110`
                                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
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
              </div>
            </div>
          )}

          {/* ===== MODE QR CODE ===== */}
          {absensiMode === 'qr' && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-800 mb-2">
                      📱 Absensi QR Code
                    </h3>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      Pilih metode absensi QR Code yang sesuai dengan kebutuhan Anda. 
                      Guru dapat menampilkan QR Code untuk di-scan oleh siswa, atau scan QR Code dari kartu absen siswa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pilihan Metode QR */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Opsi 1: Tampilkan QR Code */}
                <div className="group relative bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                      📤 Tampilkan QR Code
                    </h4>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      Generate QR Code yang ditampilkan di layar proyektor atau monitor untuk di-scan oleh siswa menggunakan perangkat mereka masing-masing.
                    </p>
                    <button
                      onClick={handleGenerateQR}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      🎯 Buat QR Code Absensi
                    </button>
                  </div>
                </div>

                {/* Opsi 2: Scan Kartu Siswa */}
                <div className="group relative bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                      📷 Scan Kartu Siswa
                    </h4>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      Scan QR Code yang ada di kartu absen siswa untuk mencatat kehadiran mereka secara otomatis dan cepat.
                    </p>
                    <button
                      onClick={() => setShowScanner(true)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      🎯 Mulai Scan QR
                    </button>
                  </div>
                </div>
              </div>

              {/* Hasil Scanning Terakhir */}
              {scanningResult && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 animate-scale-in">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800">✅ Siswa Berhasil Absen</p>
                      <p className="text-xl font-bold text-green-900">{scanningResult.nama}</p>
                      <p className="text-xs text-green-600 mt-1">
                        🕐 {scanningResult.waktu}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== REKAP ABSENSI ===== */}
      {absensiSubTab === 'rekap' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">📊 Rekap Absensi</h3>
              <p className="text-sm text-slate-500">
                {selectedMapelName || 'Mata Pelajaran'} • {rekapAbsensi.length > 0 ? rekapAbsensi[0].total : 0} pertemuan
              </p>
            </div>
            <button
              onClick={onExportRekap}
              disabled={rekapAbsensi.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Excel
            </button>
          </div>

          {loadingRekap ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute top-0 left-0"></div>
              </div>
            </div>
          ) : rekapAbsensi.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-600 mb-2">Belum Ada Data</p>
              <p className="text-sm text-slate-400">Mulai input absensi untuk melihat rekap</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left sticky left-0 bg-gradient-to-r from-slate-50 to-slate-100 font-semibold text-slate-700 rounded-l-lg">Nama Siswa</th>
                    {rekapAbsensi[0] && Object.keys(rekapAbsensi[0].kehadiran).sort().slice(0, 10).map(tgl => (
                      <th key={tgl} className="px-3 py-3 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
                        {new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                      </th>
                    ))}
                    {Object.keys(rekapAbsensi[0].kehadiran).length > 10 && (
                      <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600">+{Object.keys(rekapAbsensi[0].kehadiran).length - 10}</th>
                    )}
                    <th className="px-3 py-3 text-center bg-emerald-50 font-semibold text-emerald-700">H</th>
                    <th className="px-3 py-3 text-center bg-amber-50 font-semibold text-amber-700">S</th>
                    <th className="px-3 py-3 text-center bg-blue-50 font-semibold text-blue-700">I</th>
                    <th className="px-3 py-3 text-center bg-red-50 font-semibold text-red-700">A</th>
                    <th className="px-3 py-3 text-center bg-gradient-to-r from-blue-50 to-purple-50 font-bold text-blue-700">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekapAbsensi.map((r, idx) => (
                    <tr key={r.siswa_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 sticky left-0 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm font-bold text-blue-700">
                            {r.nama.charAt(0).toUpperCase()}
                          </div>
                          <span>{idx + 1}. {r.nama}</span>
                        </div>
                      </td>
                      {Object.keys(r.kehadiran).sort().slice(0, 10).map(tgl => (
                        <td key={tgl} className="px-3 py-2 text-center">
                          <span className={`inline-block w-7 h-7 leading-7 rounded-lg text-xs font-bold ${
                            r.kehadiran[tgl] === 'H' ? 'bg-emerald-100 text-emerald-700'
                            : r.kehadiran[tgl] === 'S' ? 'bg-amber-100 text-amber-700'
                            : r.kehadiran[tgl] === 'I' ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {r.kehadiran[tgl]}
                          </span>
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-bold text-emerald-600 bg-emerald-50/50">{r.hadir}</td>
                      <td className="px-3 py-2 text-center font-bold text-amber-600 bg-amber-50/50">{r.sakit}</td>
                      <td className="px-3 py-2 text-center font-bold text-blue-600 bg-blue-50/50">{r.izin}</td>
                      <td className="px-3 py-2 text-center font-bold text-red-600 bg-red-50/50">{r.alpha}</td>
                      <td className="px-3 py-2 text-center font-bold bg-gradient-to-r from-blue-50 to-purple-50">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          r.persentase >= 90 ? 'bg-green-100 text-green-700'
                          : r.persentase >= 75 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {r.persentase}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== MODAL QR CODE ===== */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">QR Code Absensi</h3>
              <p className="text-sm text-slate-500 mb-6">
                Minta siswa untuk scan QR Code ini
              </p>
              
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 inline-block mb-6 shadow-lg">
                <QRCodeSVG
                  value={qrData}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSimpanSesiQR}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  💾 Simpan Sesi Absensi
                </button>
                
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/absen-siswa?data=${encodeURIComponent(qrData)}`;
                    navigator.clipboard.writeText(url);
                    alert('✅ Link absensi berhasil disalin!');
                  }}
                  className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-300"
                >
                  📋 Salin Link
                </button>
                
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full px-6 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL SCANNER ===== */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccessWrapper}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
