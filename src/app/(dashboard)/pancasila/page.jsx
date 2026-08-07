'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Button from '@/components/ui/Button';

export default function PancasilaPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  
  // 6 Dimensi Profil Pelajar Pancasila
  const dimensiList = [
    {
      nama: 'Beriman, bertakwa kepada Tuhan YME, dan berakhlak mulia',
      subdimensi: [
        'Hubungan dengan Tuhan yang Maha Esa',
        'Akhlak pribadi',
        'Akhlak kepada manusia',
        'Akhlak kepada alam',
        'Akhlak bernegara'
      ]
    },
    {
      nama: 'Berkebinekaan global',
      subdimensi: [
        'Mengenal dan menghargai budaya',
        'Kemampuan komunikasi interkultural',
        'Merefleksi dan bertanggung jawab terhadap pengalaman kebinekaan',
        'Berpikir terbuka dan toleran'
      ]
    },
    {
      nama: 'Bergotong royong',
      subdimensi: [
        'Kolaborasi',
        'Kepedulian',
        'Berbagi'
      ]
    },
    {
      nama: 'Mandiri',
      subdimensi: [
        'Pemahaman diri dan situasi yang dihadapi',
        'Regulasi diri'
      ]
    },
    {
      nama: 'Bernalar kritis',
      subdimensi: [
        'Memperoleh dan memproses informasi',
        'Menganalisis dan mengevaluasi penalaran',
        'Merefleksi pemikiran dan proses berpikir',
        'Mengambil keputusan'
      ]
    },
    {
      nama: 'Kreatif',
      subdimensi: [
        'Menghasilkan karya yang orisinal',
        'Menghasilkan solusi atas permasalahan',
        'Menghasilkan tindakan yang orisinal'
      ]
    }
  ];

  // State untuk data Pancasila per siswa
  const [pancasilaData, setPancasilaData] = useState({}); // { 'dimensi_subdimensi': { predikat, kegiatan, catatan } }

  // 1. Inisialisasi
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase.from('kelas').select('id').eq('guru_id', profile.id).limit(1);
        if (kelasData && kelasData.length > 0) {
          setKelasId(kelasData[0].id);
          const { data: siswaData } = await supabase.from('siswa').select('id, nama').eq('kelas_id', kelasData[0].id).order('nama');
          setSiswaList(siswaData || []);
          if (siswaData && siswaData.length > 0) setSelectedSiswaId(siswaData[0].id);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // 2. Load data Pancasila saat siswa dipilih
  useEffect(() => {
    const loadPancasila = async () => {
      if (!selectedSiswaId) return;
      const { data } = await supabase.from('profil_pancasila').select('*').eq('siswa_id', selectedSiswaId);
      
      const formatted = {};
      data?.forEach(item => {
        const key = `${item.dimensi}|||${item.subdimensi}`;
        formatted[key] = {
          predikat: item.predikat,
          kegiatan: item.kegiatan || '',
          catatan: item.catatan || ''
        };
      });
      setPancasilaData(formatted);
    };
    loadPancasila();
  }, [selectedSiswaId]);

  // 3. Handle perubahan data
  const handleChange = (dimensi, subdimensi, field, value) => {
    const key = `${dimensi}|||${subdimensi}`;
    setPancasilaData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // 4. Simpan data
  const handleSave = async () => {
    setSaving(true);
    
    const payload = Object.entries(pancasilaData).map(([key, data]) => {
      const [dimensi, subdimensi] = key.split('|||');
      return {
        siswa_id: selectedSiswaId,
        dimensi,
        subdimensi,
        predikat: data.predikat,
        kegiatan: data.kegiatan || null,
        catatan: data.catatan || null
      };
    }).filter(item => item.predikat); // Hanya simpan yang sudah diisi predikat

    // Hapus data lama
    await supabase.from('profil_pancasila').delete().eq('siswa_id', selectedSiswaId);

    // Insert data baru
    if (payload.length > 0) {
      const { error } = await supabase.from('profil_pancasila').insert(payload);
      if (error) {
        alert('Gagal: ' + error.message);
      } else {
        alert('✅ Profil Pancasila berhasil disimpan!');
      }
    } else {
      alert('✅ Data berhasil disimpan!');
    }
    setSaving(false);
  };

  if (loading || !profile || !kelasId) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">🌟 Profil Pelajar Pancasila</h1>
          <p className="text-[#64748B] mt-1">Input penilaian 6 dimensi Profil Pelajar Pancasila</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : '💾 Simpan Data'}</Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <label className="block text-sm font-medium text-[#334155] mb-1.5">Pilih Siswa</label>
        <select value={selectedSiswaId} onChange={(e) => setSelectedSiswaId(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg">
          {siswaList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
        </select>
      </div>

      <div className="bg-[#EFF6FF] border-l-4 border-[#0369A1] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#0369A1] mb-1">💡 Panduan Predikat:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div><strong>BB</strong> = Belum Berkembang</div>
          <div><strong>MB</strong> = Mulai Berkembang</div>
          <div><strong>BSH</strong> = Berkembang Sesuai Harapan</div>
          <div><strong>SB</strong> = Sangat Berkembang</div>
        </div>
      </div>

      {dimensiList.map((dimensi, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white">
            <h3 className="font-bold">{idx + 1}. {dimensi.nama}</h3>
          </div>
          <div className="p-4 space-y-4">
            {dimensi.subdimensi.map((sub, subIdx) => {
              const key = `${dimensi.nama}|||${sub}`;
              const data = pancasilaData[key] || {};
              
              return (
                <div key={subIdx} className="border border-[#E2E8F0] rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-[#0F172A] mb-3">{sub}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#334155] mb-1">Predikat</label>
                      <select 
                        value={data.predikat || ''} 
                        onChange={(e) => handleChange(dimensi.nama, sub, 'predikat', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                      >
                        <option value="">-- Pilih --</option>
                        <option value="BB">BB - Belum Berkembang</option>
                        <option value="MB">MB - Mulai Berkembang</option>
                        <option value="BSH">BSH - Berkembang Sesuai Harapan</option>
                        <option value="SB">SB - Sangat Berkembang</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-[#334155] mb-1">Kegiatan yang Menunjukkan Pencapaian</label>
                      <input 
                        type="text" 
                        value={data.kegiatan || ''} 
                        onChange={(e) => handleChange(dimensi.nama, sub, 'kegiatan', e.target.value)}
                        placeholder="Contoh: Menghafal doa harian, Menggunting kolase"
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}