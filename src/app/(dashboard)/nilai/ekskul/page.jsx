'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import { generateDeskripsiEkskul, getPredikatEkskulLabel } from '@/data/templateEkskul';

const PREDIKAT_OPTIONS = ['SB', 'B', 'C', 'PB'];

export default function EkskulPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [ekskulList, setEkskulList] = useState([]);
  const [nilaiEkskul, setNilaiEkskul] = useState({});

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

          let { data: ekskulData } = await supabase.from('ekskul').select('*').eq('kelas_id', currentKelasId).order('nama');
          if (!ekskulData || ekskulData.length === 0) {
            const defaultEkskul = [
              { kelas_id: currentKelasId, nama: 'Pramuka', jenis: 'wajib' },
              { kelas_id: currentKelasId, nama: 'PMR', jenis: 'pilihan' },
              { kelas_id: currentKelasId, nama: 'Seni', jenis: 'pilihan' },
            ];
            const { data: newEkskul } = await supabase.from('ekskul').insert(defaultEkskul).select();
            ekskulData = newEkskul || [];
          }
          setEkskulList(ekskulData);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  useEffect(() => {
    const fetchNilaiEkskul = async () => {
      if (!selectedSiswaId) return;
      const { data: nilaiData } = await supabase.from('nilai_ekskul').select('*').eq('siswa_id', selectedSiswaId);

      const formatted = {};
      ekskulList.forEach(ekskul => {
        const record = nilaiData?.find(n => n.ekskul_id === ekskul.id);
        formatted[ekskul.id] = record ? { predikat: record.predikat, deskripsi: record.deskripsi } : { predikat: '', deskripsi: '' };
      });
      setNilaiEkskul(formatted);
    };
    if (ekskulList.length > 0) fetchNilaiEkskul();
  }, [selectedSiswaId, ekskulList]);

  const handlePredikatChange = (ekskulId, predikat) => {
    const ekskul = ekskulList.find(e => e.id === ekskulId);
    const selectedSiswa = siswaList.find(s => s.id === selectedSiswaId);
    const deskripsi = generateDeskripsiEkskul(selectedSiswa?.nama || '', ekskul?.nama || '', predikat);
    setNilaiEkskul(prev => ({ ...prev, [ekskulId]: { predikat, deskripsi } }));
  };

  const handleDeskripsiChange = (ekskulId, deskripsi) => {
    setNilaiEkskul(prev => ({ ...prev, [ekskulId]: { ...prev[ekskulId], deskripsi } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = Object.entries(nilaiEkskul)
      .filter(([_, data]) => data.predikat && data.predikat !== '')
      .map(([ekskul_id, data]) => ({ siswa_id: selectedSiswaId, ekskul_id, predikat: data.predikat, deskripsi: data.deskripsi }));

    if (payload.length === 0) {
      alert('Tidak ada data yang diubah untuk disimpan.');
      setSaving(false);
      return;
    }

    await supabase.from('nilai_ekskul').delete().eq('siswa_id', selectedSiswaId);
    const { error } = await supabase.from('nilai_ekskul').insert(payload);

    if (error) alert('Gagal menyimpan: ' + error.message);
    else alert(`✅ Berhasil menyimpan ${payload.length} penilaian ekstrakurikuler!`);
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
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans']">Ekstrakurikuler</h1>
          <p className="text-[#64748B] mt-1">Penilaian kegiatan ekstrakurikuler siswa.</p>
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

      <div className="bg-[#FFFBEB] border-l-4 border-[#D97706] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#D97706] mb-1">Keterangan Predikat:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div><span className="font-bold text-[#059669]">SB</span> = Sangat Baik</div>
          <div><span className="font-bold text-[#0369A1]">B</span> = Baik</div>
          <div><span className="font-bold text-[#D97706]">C</span> = Cukup</div>
          <div><span className="font-bold text-[#DC2626]">PB</span> = Perlu Bimbingan</div>
        </div>
      </div>

      <div className="space-y-4">
        {ekskulList.map((ekskul) => (
          <div key={ekskul.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide">{ekskul.nama}</h3>
              {ekskul.jenis === 'wajib' && <span className="px-2 py-1 bg-[#DC2626] text-white text-xs rounded font-bold">WAJIB</span>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#334155] mb-2">Predikat:</label>
              <div className="flex gap-2 flex-wrap">
                {PREDIKAT_OPTIONS.map(pred => (
                  <button key={pred} onClick={() => handlePredikatChange(ekskul.id, pred)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border-2 ${nilaiEkskul[ekskul.id]?.predikat === pred ? (pred === 'SB' ? 'bg-[#059669] text-white border-[#059669]' : pred === 'B' ? 'bg-[#0369A1] text-white border-[#0369A1]' : pred === 'C' ? 'bg-[#D97706] text-white border-[#D97706]' : 'bg-[#DC2626] text-white border-[#DC2626]') : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2D5BE3]'}`}>
                    {pred} ({getPredikatEkskulLabel(pred)})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">Deskripsi Otomatis <span className="text-[#64748B] font-normal">(dapat diedit)</span>:</label>
              <textarea value={nilaiEkskul[ekskul.id]?.deskripsi || ''} onChange={(e) => handleDeskripsiChange(ekskul.id, e.target.value)} rows="3" placeholder="Pilih predikat terlebih dahulu..." className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}