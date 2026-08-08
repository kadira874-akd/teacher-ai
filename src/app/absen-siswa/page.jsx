'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/config/supabase';
import Button from '@/components/ui/Button';
import QRScanner from '@/components/QRScanner';

function AbsenSiswaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [qrData, setQrData] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const [status, setStatus] = useState('H');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'ABSENSI') {
          setQrData(parsed);
          loadSiswaList(parsed.mapel_id);
        } else {
          alert('QR Code tidak valid!');
        }
      } catch (e) {
        alert('Format QR Code tidak dikenali!');
      }
    }
    setLoading(false);
  }, [searchParams]);

  const handleScanSuccess = (decodedText) => {
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.type === 'ABSENSI') {
        setQrData(parsed);
        loadSiswaList(parsed.mapel_id);
        setShowScanner(false);
      } else {
        alert('QR Code tidak valid untuk absensi!');
      }
    } catch (e) {
      alert('Format QR Code tidak dikenali!');
    }
  };

  const loadSiswaList = async (mapelId) => {
    // Ambil kelas dari mapel
    const { data: mapel } = await supabase
      .from('mapel')
      .select('kelas_id')
      .eq('id', mapelId)
      .single();
    
    if (mapel) {
      const { data: siswa } = await supabase
        .from('siswa')
        .select('id, nama')
        .eq('kelas_id', mapel.kelas_id)
        .order('nama');
      
      setSiswaList(siswa || []);
    }
  };

  const handleSubmitAbsensi = async () => {
    if (!selectedSiswa || !qrData) {
      alert('Pilih nama siswa Anda!');
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase.from('absensi').upsert({
      siswa_id: selectedSiswa,
      mapel_id: qrData.mapel_id,
      tanggal: qrData.tanggal,
      status: status,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'siswa_id,mapel_id,tanggal'
    });

    if (error) {
      alert('Gagal menyimpan absensi: ' + error.message);
    } else {
      alert('✅ Absensi berhasil disimpan!');
      setSelectedSiswa('');
      setStatus('H');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5BE3]"></div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8 text-center max-w-md w-full">
          <p className="text-4xl mb-4">📱</p>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">
            Absensi QR Code
          </h2>
          <p className="text-[#64748B] mb-6">
            Silakan scan QR Code yang ditampilkan oleh guru untuk melakukan absensi.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setShowScanner(true)}
              className="w-full"
            >
              📷 Scan QR Code dengan Kamera
            </Button>
            
            <button
              onClick={() => setManualMode(true)}
              className="w-full px-4 py-3 text-[#2D5BE3] font-semibold hover:bg-[#F8FAFC] rounded-lg transition-colors"
            >
              🔗 Atau masukkan link absensi
            </button>
          </div>
          
          {manualMode && (
            <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
              <label className="block text-sm font-medium text-[#64748B] mb-2">
                Paste Link Absensi:
              </label>
              <input
                type="text"
                placeholder="https://.../absen-siswa?data=..."
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
                onChange={(e) => {
                  const url = new URL(e.target.value);
                  const dataParam = url.searchParams.get('data');
                  if (dataParam) {
                    try {
                      const parsed = JSON.parse(decodeURIComponent(dataParam));
                      if (parsed.type === 'ABSENSI') {
                        setQrData(parsed);
                        loadSiswaList(parsed.mapel_id);
                        setManualMode(false);
                      }
                    } catch (err) {
                      alert('Link tidak valid!');
                    }
                  }
                }}
              />
              <button
                onClick={() => setManualMode(false)}
                className="text-sm text-[#64748B] hover:text-[#2D5BE3]"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <h1 className="text-xl font-bold text-[#0F172A] mb-2 text-center">
            📝 Form Absensi Siswa
          </h1>
          <p className="text-sm text-[#64748B] text-center mb-6">
            {new Date(qrData.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#64748B] mb-2">
                Nama Siswa
              </label>
              <select
                value={selectedSiswa}
                onChange={(e) => setSelectedSiswa(e.target.value)}
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
              >
                <option value="">-- Pilih Nama Anda --</option>
                {siswaList.map(siswa => (
                  <option key={siswa.id} value={siswa.id}>
                    {siswa.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#64748B] mb-2">
                Status Kehadiran
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { code: 'H', label: 'Hadir', color: 'bg-[#059669]' },
                  { code: 'S', label: 'Sakit', color: 'bg-[#D97706]' },
                  { code: 'I', label: 'Izin', color: 'bg-[#0369A1]' },
                  { code: 'A', label: 'Alpha', color: 'bg-[#DC2626]' }
                ].map(item => (
                  <button
                    key={item.code}
                    onClick={() => setStatus(item.code)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                      status === item.code
                        ? `${item.color} text-white`
                        : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                    }`}
                  >
                    {item.code}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleSubmitAbsensi} 
              disabled={submitting || !selectedSiswa}
              className="w-full mt-4"
            >
              {submitting ? '⏳ Menyimpan...' : '✅ Kirim Absensi'}
            </Button>
            
            <button
              onClick={() => {
                setQrData(null);
                setSelectedSiswa('');
                setStatus('H');
              }}
              className="w-full mt-2 px-4 py-2 text-[#64748B] hover:text-[#2D5BE3] text-sm font-medium"
            >
              🔄 Scan QR Code Lain
            </button>
          </div>
        </div>
      </div>
      
      {showScanner && (
        <QRScanner 
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

export default function AbsenSiswaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5BE3]"></div>
      </div>
    }>
      <AbsenSiswaContent />
    </Suspense>
  );
}
