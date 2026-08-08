'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Button from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

export default function KartuSiswaPage() {
  const { profile } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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
        
        // Ambil semua siswa di kelas ini
        const { data: siswa } = await supabase
          .from('siswa')
          .select('id, nama, nis, nisn, kelas_id')
          .eq('kelas_id', kId)
          .order('nama');
        
        setSiswaList(siswa || []);
      }
      setLoading(false);
    };
    
    initData();
  }, [profile]);

  const generateQRData = (siswa) => {
    // Format QR Code untuk kartu absen siswa
    return JSON.stringify({
      type: 'SISWA',
      siswa_id: siswa.id,
      nama: siswa.nama,
      nis: siswa.nis,
      timestamp: new Date().toISOString()
    });
  };

  const printKartu = (siswa) => {
    const qrData = generateQRData(siswa);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kartu Absen - ${siswa.nama}</title>
        <style>
          @media print {
            @page { size: 3.375in 2.125in; margin: 0; }
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f0f0f0;
          }
          .card {
            width: 3.375in;
            height: 2.125in;
            background: white;
            border: 2px solid #2D5BE3;
            border-radius: 8px;
            padding: 12px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2D5BE3;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .header h2 {
            margin: 0;
            font-size: 12px;
            color: #2D5BE3;
          }
          .header p {
            margin: 2px 0 0;
            font-size: 10px;
            color: #64748B;
          }
          .content {
            display: flex;
            flex: 1;
            gap: 10px;
          }
          .info {
            flex: 1;
            font-size: 9px;
          }
          .info p {
            margin: 3px 0;
          }
          .info strong {
            color: #0F172A;
          }
          .qr {
            width: 80px;
            height: 80px;
            border: 1px solid #E2E8F0;
            border-radius: 4px;
            padding: 4px;
          }
          .footer {
            text-align: center;
            font-size: 8px;
            color: #64748B;
            margin-top: 6px;
            border-top: 1px solid #E2E8F0;
            padding-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>KARTU ABSEN SISWA</h2>
            <p>Tahun Ajaran 2024/2025</p>
          </div>
          <div class="content">
            <div class="info">
              <p><strong>Nama:</strong><br/>${siswa.nama}</p>
              <p><strong>NIS:</strong> ${siswa.nis || '-'}</p>
              <p><strong>NISN:</strong> ${siswa.nisn || '-'}</p>
            </div>
            <div class="qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}" alt="QR Code" />
            </div>
          </div>
          <div class="footer">
            Scan QR Code untuk absensi
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const downloadAllKartu = () => {
    alert('🔨 Fitur download semua kartu akan segera hadir!\nUntuk saat ini, Anda dapat mencetak kartu satu per satu.');
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2">🎴 Kartu Absen Siswa</h1>
              <p className="text-sm text-[#64748B]">
                Generate dan cetak kartu absen dengan QR Code untuk setiap siswa
              </p>
            </div>
            <Button 
              onClick={downloadAllKartu}
              disabled={siswaList.length === 0}
              className="bg-[#059669] hover:bg-[#047857]"
            >
              📥 Download Semua Kartu
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-[#0F172A] mb-2">Tentang Kartu Absen QR Code</h3>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>• Setiap siswa mendapatkan kartu dengan QR Code unik berisi data siswa</li>
                <li>• Guru dapat scan QR Code dari kartu menggunakan fitur Scan Absensi</li>
                <li>• QR Code berisi format: {"{ type: 'SISWA', siswa_id, nama, nis }"}</li>
                <li>• Kartu dapat dicetak dan digunakan berulang kali</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Siswa List */}
        {siswaList.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">Belum Ada Siswa</h3>
            <p className="text-[#64748B]">
              Tambahkan siswa terlebih dahulu ke kelas Anda
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {siswaList.map((siswa) => (
              <div 
                key={siswa.id} 
                className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                {/* Preview Card */}
                <div className="border-2 border-[#2D5BE3] rounded-lg p-4 mb-4 bg-gradient-to-br from-white to-[#F8FAFC]">
                  <div className="text-center border-b-2 border-[#2D5BE3] pb-2 mb-3">
                    <h4 className="text-xs font-bold text-[#2D5BE3] mb-1">KARTU ABSEN SISWA</h4>
                    <p className="text-[10px] text-[#64748B]">Tahun Ajaran 2024/2025</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#0F172A] mb-2">{siswa.nama}</p>
                      <p className="text-[10px] text-[#64748B]">NIS: {siswa.nis || '-'}</p>
                      <p className="text-[10px] text-[#64748B]">NISN: {siswa.nisn || '-'}</p>
                    </div>
                    
                    <div className="w-16 h-16 bg-white p-1 border border-[#E2E8F0] rounded">
                      <QRCodeSVG
                        value={generateQRData(siswa)}
                        size={56}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center mt-3 pt-2 border-t border-[#E2E8F0]">
                    <p className="text-[8px] text-[#64748B]">Scan QR Code untuk absensi</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setSelectedSiswa(siswa);
                      setShowPreview(true);
                    }}
                    className="w-full text-sm py-2"
                  >
                    👁️ Preview
                  </Button>
                  
                  <button
                    onClick={() => printKartu(siswa)}
                    className="w-full px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors text-sm font-medium"
                  >
                    🖨️ Cetak Kartu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedSiswa && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#0F172A]">Preview Kartu Absen</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-[#64748B] hover:text-[#DC2626] text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Full Size Preview */}
              <div className="border-2 border-[#2D5BE3] rounded-lg p-6 mb-6 bg-gradient-to-br from-white to-[#F8FAFC]">
                <div className="text-center border-b-2 border-[#2D5BE3] pb-3 mb-4">
                  <h2 className="text-sm font-bold text-[#2D5BE3] mb-1">KARTU ABSEN SISWA</h2>
                  <p className="text-xs text-[#64748B]">Tahun Ajaran 2024/2025</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0F172A] mb-3">{selectedSiswa.nama}</p>
                    <div className="space-y-1 text-xs text-[#64748B]">
                      <p>NIS: {selectedSiswa.nis || '-'}</p>
                      <p>NISN: {selectedSiswa.nisn || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="w-24 h-24 bg-white p-2 border-2 border-[#2D5BE3] rounded-lg">
                    <QRCodeSVG
                      value={generateQRData(selectedSiswa)}
                      size={88}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                
                <div className="text-center mt-4 pt-3 border-t border-[#E2E8F0]">
                  <p className="text-xs text-[#64748B]">Scan QR Code untuk absensi</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => printKartu(selectedSiswa)}
                  className="w-full px-4 py-3 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors font-medium"
                >
                  🖨️ Cetak Kartu Ini
                </button>
                
                <button
                  onClick={() => {
                    const qrData = generateQRData(selectedSiswa);
                    navigator.clipboard.writeText(qrData);
                    alert('✅ Data QR Code berhasil disalin!');
                  }}
                  className="w-full px-4 py-3 bg-[#F8FAFC] text-[#2D5BE3] border border-[#E2E8F0] rounded-lg hover:border-[#2D5BE3] transition-colors font-medium"
                >
                  📋 Salin Data QR Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
