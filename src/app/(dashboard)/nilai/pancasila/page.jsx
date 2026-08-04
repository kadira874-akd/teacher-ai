'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import { generateDeskripsiPancasila, getPredikatPancasilaLabel } from '@/data/templatePancasila';

const DIMENSI_PANCASILA = [
  'Beriman & Bertakwa kepada Tuhan YME',
  'Berkebinekaan Global',
  'Bergotong Royong',
  'Mandiri',
  'Bernalar Kritis',
  'Kreatif',
];

const PREDIKAT_OPTIONS = ['MB', 'BB', 'BSH', 'SB'];

export default function PancasilaPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [nilaiPancasila, setNilaiPancasila] = useState({});

  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase.from('kelas').select('id').eq('guru_id', profile.id).limit(1);

        if (kelasData && kelasData.length > 0) {
          const currentKelasId = kelasData[0].id;
          setKelasId(currentKelasId);

          const { data: siswaData } = await supabase.from('siswa').select('id, nama').eq('kelas_id', currentKelasId).order('nama', { ascending: true });
          setSiswaList(siswaData || []);
          if (siswaData && siswaData.length > 0) setSelectedSiswaId(siswaData[0].id);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  useEffect(() => {
    const fetchPancasila = async () => {
      if (!selectedSiswaId) return;
      const { data: nilaiData } = await supabase.from('profil_pancasila').select('*').eq('siswa_id', selectedSiswaId);

      const formatted = {};
      DIMENSI_PANCASILA.forEach(dimensi => {
        const record = nilaiData?.find(n => n.dimensi === dimensi);
        formatted[dimensi] = record ? { predikat: record.predikat, deskripsi: record.deskripsi } : { predikat: '', deskripsi: '' };
      });
      setNilaiPancasila(formatted);
    };
    fetchPancasila();
  }, [selectedSiswaId]);

  const handlePredikatChange = (dimensi, predikat) => {
    const selectedSiswa = siswaList.find(s => s.id === selectedSiswaId);
    const deskripsi = generateDeskripsiPancasila(selectedSiswa?.nama || '', dimensi, predikat);
    setNilaiPancasila(prev => ({ ...prev, [dimensi]: { predikat, deskripsi } }));
  };

  const handleDeskripsiChange = (dimensi, deskripsi) => {
    setNilaiPancasila(prev => ({ ...prev, [dimensi]: { ...prev[dimensi], deskripsi } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = Object.entries(nilaiPancasila)
      .filter(([_, data]) => data.predikat && data.predikat !== '')
      .map(([dimensi, data]) => ({ siswa_id: selectedSiswaId, dimensi, predikat: data.predikat, deskripsi: data.deskripsi }));

    if (payload.length === 0) {
      alert('Tidak ada data yang diubah untuk disimpan.');
      setSaving(false);
      return;
    }

    await supabase.from('profil_pancasila').delete().eq('siswa_id', selectedSiswaId);
    const { error } = await supabase.from('profil_pancasila').insert(payload);

    if (error) alert('Gagal menyimpan: ' + error.message);
    else alert(`✅ Berhasil menyimpan ${payload.length} dimensi Profil Pelajar Pancasila!`);
    setSaving(false);
  };

  if (loading || !profile || !kelasId || siswaList.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans']">Profil Pelajar Pancasila</h1>
          <p className="text-[#64748B] mt-1">Penilaian 6 dimensi Profil Pelajar Pancasila (Kurikulum Merdeka).</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="md:w-auto w-full">
          {saving ? 'Menyimpan...' : '💾 Simpan Penilaian'}
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <label className="block text-sm font-medium text-[#334155] mb-1.5">Pilih Siswa</label>
        <select value={selectedSiswaId} onChange={(e) => setSelectedSiswaId(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]">
          {siswaList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
        </select>
      </div>

      <div className="bg-[#EFF6FF] border-l-4 border-[#0369A1] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#0369A1] mb-1">Keterangan Skala Predikat:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div><span className="font-bold text-[#DC2626]">MB</span> = Mulai Berkembang</div>
          <div><span className="font-bold text-[#D97706]">BB</span> = Berkembang</div>
          <div><span className="font-bold text-[#0369A1]">BSH</span> = Berkembang Sesuai Harapan</div>
          <div><span className="font-bold text-[#059669]">SB</span> = Sangat Berkembang</div>
        </div>
      </div>

      <div className="space-y-4">
        {DIMENSI_PANCASILA.map((dimensi, idx) => (
          <div key={dimensi} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">{idx + 1}. {dimensi}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#334155] mb-2">Predikat:</label>
              <div className="flex gap-2 flex-wrap">
                {PREDIKAT_OPTIONS.map(pred => (
                  <button key={pred} onClick={() => handlePredikatChange(dimensi, pred)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border-2 ${nilaiPancasila[dimensi]?.predikat === pred ? (pred === 'SB' ? 'bg-[#059669] text-white border-[#059669]' : pred === 'BSH' ? 'bg-[#0369A1] text-white border-[#0369A1]' : pred === 'BB' ? 'bg-[#D97706] text-white border-[#D97706]' : 'bg-[#DC2626] text-white border-[#DC2626]') : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2D5BE3]'}`}>
                    {pred} ({getPredikatPancasilaLabel(pred)})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">Deskripsi Otomatis <span className="text-[#64748B] font-normal">(dapat diedit)</span>:</label>
              <textarea value={nilaiPancasila[dimensi]?.deskripsi || ''} onChange={(e) => handleDeskripsiChange(dimensi, e.target.value)} rows="3" placeholder="Pilih predikat terlebih dahulu..." className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}