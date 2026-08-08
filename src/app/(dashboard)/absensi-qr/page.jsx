'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Button from '@/components/ui/Button';

export default function AbsensiQRPage() {
  const { profile } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      if (!profile?.id) return;
      
      const { data: kelasData } = await supabase
        .from('kelas')
        .select('id')
        .eq('guru_id', profile.id)
        .limit(1);
      
      if (kelasData?.length > 0) {
        const kId = kelasData[0].id;
        setKelasId(kId);
        
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

  useEffect(() => {
    if (selectedMapel && tanggal) {
      // Generate QR Code data
      const data = {
        type: 'ABSENSI',
        mapel_id: selectedMapel,
        tanggal: tanggal,
        timestamp: new Date().toISOString()
      };
      setQrData(JSON.stringify(data));
    }
  }, [selectedMapel, tanggal]);

  const handleSimpanAbsensiQR = async () => {
    if (!selectedMapel || !tanggal) {
      alert('Pilih mata pelajaran dan tanggal!');
      return;
    }
    
    // Simpan sesi absensi ke database
    const { error } = await supabase.from('sesi_absensi').insert({
      mapel_id: selectedMapel,
      tanggal: tanggal,
      qr_data: qrData,
      created_by: profile.id,
      created_at: new Date().toISOString(),
      is_active: true
    });
    
    if (error) {
      console.error('Error saving session:', error);
      // Tetap tampilkan QR code meskipun gagal save session
    }
    
    alert('✅ QR Code Absensi berhasil dibuat!\nMinta siswa untuk scan QR Code ini atau gunakan link di bawah.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5BE3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">📱 Absensi QR Code</h1>
        
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Pengaturan Absensi</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
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
          </div>
          
          <Button onClick={handleSimpanAbsensiQR} className="w-full md:w-auto">
            💾 Simpan & Generate QR
          </Button>
        </div>

        {qrData && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4 text-center">
              QR Code Absensi
            </h2>
            <p className="text-sm text-[#64748B] text-center mb-6">
              Siswa dapat scan QR Code ini untuk melakukan absensi
            </p>
            
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
            
            <div className="bg-[#F8FAFC] rounded-lg p-4 text-center">
              <p className="text-sm text-[#64748B] mb-2">URL/Link Absensi:</p>
              <code className="text-xs text-[#2D5BE3] break-all">
                {typeof window !== 'undefined' 
                  ? `${window.location.origin}/absen-siswa?data=${encodeURIComponent(qrData)}`
                  : 'Loading...'
                }
              </code>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/absen-siswa?data=${encodeURIComponent(qrData)}`;
                  navigator.clipboard.writeText(url);
                  alert('✅ Link absensi berhasil disalin!');
                }}
                className="flex-1 px-4 py-2 bg-[#2D5BE3] text-white rounded-lg hover:bg-[#1E40AF] transition-colors text-sm font-medium"
              >
                📋 Salin Link
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/absen-siswa?data=${encodeURIComponent(qrData)}`;
                  if (navigator.share) {
                    navigator.share({
                      title: 'Absensi QR Code',
                      text: 'Scan QR Code untuk absensi',
                      url: url
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('✅ Link disalin! Bagikan ke siswa.');
                  }
                }}
                className="flex-1 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors text-sm font-medium"
              >
                🔗 Bagikan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
