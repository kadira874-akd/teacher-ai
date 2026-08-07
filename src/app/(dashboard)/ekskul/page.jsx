'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';

export default function EkskulPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  
  // Daftar ekskul kelas
  const [ekskulList, setEkskulList] = useState([]);
  const [showAddEkskul, setShowAddEkskul] = useState(false);
  const [newEkskul, setNewEkskul] = useState({ nama: '', jenis: 'pilihan' });

  // Nilai ekskul per siswa
  const [nilaiEkskul, setNilaiEkskul] = useState({}); // { ekskul_id: { predikat, deskripsi } }

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

          const { data: ekskulData } = await supabase.from('ekskul').select('*').eq('kelas_id', kelasData[0].id).order('nama');
          setEkskulList(ekskulData || []);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // 2. Load nilai ekskul saat siswa dipilih
  useEffect(() => {
    const loadNilai = async () => {
      if (!selectedSiswaId) return;
      const { data } = await supabase.from('nilai_ekskul').select('*').eq('siswa_id', selectedSiswaId);
      
      const formatted = {};
      data?.forEach(item => {
        formatted[item.ekskul_id] = {
          predikat: item.predikat,
          deskripsi: item.deskripsi || ''
        };
      });
      setNilaiEkskul(formatted);
    };
    loadNilai();
  }, [selectedSiswaId]);

  // 3. Tambah ekskul baru
  const handleAddEkskul = async () => {
    if (!newEkskul.nama.trim()) {
      alert('Nama ekskul wajib diisi!');
      return;
    }
    const { data, error } = await supabase.from('ekskul').insert({
      kelas_id: kelasId,
      nama: newEkskul.nama.trim(),
      jenis: newEkskul.jenis
    }).select();
    
    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      setEkskulList([...ekskulList, data[0]]);
      setNewEkskul({ nama: '', jenis: 'pilihan' });
      setShowAddEkskul(false);
      alert('✅ Ekskul berhasil ditambahkan!');
    }
  };

  // 4. Hapus ekskul
  const handleDeleteEkskul = async (id) => {
    if (!confirm('Yakin hapus ekskul ini?')) return;
    const { error } = await supabase.from('ekskul').delete().eq('id', id);
    if (!error) {
      setEkskulList(ekskulList.filter(e => e.id !== id));
    }
  };

  // 5. Handle perubahan nilai
  const handleChange = (ekskulId, field, value) => {
    setNilaiEkskul(prev => ({
      ...prev,
      [ekskulId]: {
        ...prev[ekskulId],
        [field]: value
      }
    }));
  };

  // 6. Simpan nilai
  const handleSave = async () => {
    setSaving(true);
    
    const payload = Object.entries(nilaiEkskul).map(([ekskulId, data]) => ({
      siswa_id: selectedSiswaId,
      ekskul_id: ekskulId,
      predikat: data.predikat,
      deskripsi: data.deskripsi || null
    })).filter(item => item.predikat);

    await supabase.from('nilai_ekskul').delete().eq('siswa_id', selectedSiswaId);

    if (payload.length > 0) {
      const { error } = await supabase.from('nilai_ekskul').insert(payload);
      if (error) {
        alert('Gagal: ' + error.message);
      } else {
        alert('✅ Nilai ekskul berhasil disimpan!');
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
          <h1 className="text-2xl font-bold text-[#0F172A]">⚽ Ekstrakurikuler</h1>
          <p className="text-[#64748B] mt-1">Input penilaian ekstrakurikuler per siswa</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : '💾 Simpan Data'}</Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <label className="block text-sm font-medium text-[#334155] mb-1.5">Pilih Siswa</label>
        <select value={selectedSiswaId} onChange={(e) => setSelectedSiswaId(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg">
          {siswaList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
        </select>
      </div>

      {/* Daftar Ekskul */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-[#2D5BE3] uppercase">Daftar Ekstrakurikuler Kelas</h3>
          <Button onClick={() => setShowAddEkskul(!showAddEkskul)}>{showAddEkskul ? '✕ Tutup' : '+ Tambah Ekskul'}</Button>
        </div>

        {showAddEkskul && (
          <div className="bg-[#F8FAFC] p-4 rounded-lg mb-4 border border-[#E2E8F0]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input type="text" value={newEkskul.nama} onChange={(e) => setNewEkskul({...newEkskul, nama: e.target.value})} placeholder="Nama Ekskul (Pramuka, PMR, dll)" className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm" />
              <select value={newEkskul.jenis} onChange={(e) => setNewEkskul({...newEkskul, jenis: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm">
                <option value="wajib">Wajib</option>
                <option value="pilihan">Pilihan</option>
              </select>
              <Button onClick={handleAddEkskul}>Simpan</Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {ekskulList.map(ekskul => (
            <div key={ekskul.id} className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg">
              <div>
                <span className="font-medium text-sm">{ekskul.nama}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded ${ekskul.jenis === 'wajib' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#EFF6FF] text-[#0369A1]'}`}>
                  {ekskul.jenis.toUpperCase()}
                </span>
              </div>
              <button onClick={() => handleDeleteEkskul(ekskul.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-2 py-1 rounded text-sm">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* Input Nilai */}
      {ekskulList.length > 0 && (
        <div className="space-y-4">
          <div className="bg-[#FFFBEB] border-l-4 border-[#D97706] p-4 rounded-r-lg">
            <p className="text-sm font-semibold text-[#D97706] mb-1">💡 Panduan Predikat:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div><strong>A</strong> = Sangat Baik</div>
              <div><strong>B</strong> = Baik</div>
              <div><strong>C</strong> = Cukup</div>
              <div><strong>D</strong> = Kurang</div>
            </div>
          </div>

          {ekskulList.map(ekskul => {
            const data = nilaiEkskul[ekskul.id] || {};
            return (
              <div key={ekskul.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">{ekskul.nama}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#334155] mb-1">Predikat</label>
                    <select 
                      value={data.predikat || ''} 
                      onChange={(e) => handleChange(ekskul.id, 'predikat', e.target.value)}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                    >
                      <option value="">-- Pilih --</option>
                      <option value="A">A - Sangat Baik</option>
                      <option value="B">B - Baik</option>
                      <option value="C">C - Cukup</option>
                      <option value="D">D - Kurang</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-[#334155] mb-1">Deskripsi Pencapaian</label>
                    <textarea 
                      value={data.deskripsi || ''} 
                      onChange={(e) => handleChange(ekskul.id, 'deskripsi', e.target.value)}
                      placeholder="Contoh: Sangat baik dan aktif dalam mengikuti seluruh kegiatan kepramukaan. Menunjukkan sikap disiplin, tanggung jawab, dan kemandirian yang tinggi."
                      rows="3"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}