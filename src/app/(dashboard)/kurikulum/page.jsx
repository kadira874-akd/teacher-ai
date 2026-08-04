'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { curriculumDatabase, getFaseLabel, getMapelList, getFaseList, getCurriculumData } from '@/data/curriculumDatabase';
import Button from '@/components/ui/Button';

export default function KurikulumPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [kelasNama, setKelasNama] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedFase, setSelectedFase] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [cpData, setCpData] = useState(null);
  
  // Daftar mapel yang sudah diterapkan ke kelas
  const [appliedMapel, setAppliedMapel] = useState([]);

  // 1. Inisialisasi
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase
          .from('kelas')
          .select('id, nama_kelas, fase, kurikulum_mapel')
          .eq('guru_id', profile.id)
          .limit(1);

        if (kelasData && kelasData.length > 0) {
          const kelas = kelasData[0];
          setKelasId(kelas.id);
          setKelasNama(kelas.nama_kelas || '');
          
          // Auto-detect fase dari nama kelas
          const autoFase = kelas.fase || getFaseByKelasLocal(kelas.nama_kelas);
          if (autoFase) {
            setSelectedFase(autoFase);
          }
          
          // Load mapel yang sudah diterapkan
          if (kelas.kurikulum_mapel && Array.isArray(kelas.kurikulum_mapel)) {
            setAppliedMapel(kelas.kurikulum_mapel);
          }
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // Fungsi helper untuk deteksi fase dari nama kelas
  function getFaseByKelasLocal(namaKelas) {
    if (!namaKelas) return null;
    const kelasLower = namaKelas.toLowerCase();
    if (kelasLower.includes('1') || kelasLower.includes('2')) return 'faseA';
    if (kelasLower.includes('3') || kelasLower.includes('4')) return 'faseB';
    if (kelasLower.includes('5') || kelasLower.includes('6')) return 'faseC';
    if (kelasLower.includes('7') || kelasLower.includes('8') || kelasLower.includes('9')) return 'faseD';
    return null;
  }

  // 2. Saat fase berubah, update daftar mapel
  useEffect(() => {
    setSelectedMapel('');
    setCpData(null);
  }, [selectedFase]);

  // 3. Saat mapel dipilih, load data CP
  useEffect(() => {
    if (selectedFase && selectedMapel) {
      const data = getCurriculumData(selectedFase, selectedMapel);
      setCpData(data);
    } else {
      setCpData(null);
    }
  }, [selectedFase, selectedMapel]);

  // 4. Terapkan kurikulum ke kelas
  const handleApply = async () => {
    if (!selectedMapel || !kelasId) return;

    setSaving(true);

    // Tambahkan mapel ke daftar yang sudah diterapkan
    const newAppliedMapel = [...appliedMapel];
    if (!newAppliedMapel.includes(selectedMapel)) {
      newAppliedMapel.push(selectedMapel);
    }

    // Simpan ke database
    const { error } = await supabase
      .from('kelas')
      .update({
        fase: selectedFase,
        kurikulum_mapel: newAppliedMapel
      })
      .eq('id', kelasId);

    if (error) {
      alert('Gagal menerapkan kurikulum: ' + error.message);
    } else {
      setAppliedMapel(newAppliedMapel);
      
      // Sinkronkan ke tabel mapel
      const { data: existingMapel } = await supabase
        .from('mapel')
        .select('id, nama')
        .eq('kelas_id', kelasId);
      
      const existingNames = existingMapel?.map(m => m.nama) || [];
      
      if (!existingNames.includes(selectedMapel)) {
        await supabase
          .from('mapel')
          .insert({
            kelas_id: kelasId,
            nama: selectedMapel,
            urutan: existingNames.length + 1
          });
      }
      
      alert(`✅ ${selectedMapel} berhasil diterapkan ke ${kelasNama}!`);
    }
    setSaving(false);
  };

  // 5. Hapus mapel dari kelas
  const handleRemoveMapel = async (mapelName) => {
    if (!confirm(`Yakin ingin menghapus ${mapelName} dari kelas?`)) return;

    const newAppliedMapel = appliedMapel.filter(m => m !== mapelName);
    
    const { error } = await supabase
      .from('kelas')
      .update({ kurikulum_mapel: newAppliedMapel })
      .eq('id', kelasId);

    if (!error) {
      setAppliedMapel(newAppliedMapel);
      
      // Hapus dari tabel mapel juga
      await supabase
        .from('mapel')
        .delete()
        .eq('kelas_id', kelasId)
        .eq('nama', mapelName);
    }
  };

  if (loading || !profile || !kelasId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memuat data kurikulum...</p>
        </div>
      </div>
    );
  }

  const availableMapel = selectedFase ? getMapelList(selectedFase) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans']">Pilih Kurikulum</h1>
        <p className="text-[#64748B] mt-1">Pilih fase dan mata pelajaran untuk diterapkan ke kelas <strong>{kelasNama}</strong>.</p>
      </div>

      {/* SELECTOR */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Langkah 1: Pilih Fase & Mata Pelajaran</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Fase</label>
            <select
              value={selectedFase}
              onChange={(e) => setSelectedFase(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
            >
              <option value="">-- Pilih Fase --</option>
              <option value="faseA">Fase A (Kelas 1-2 SD/MI)</option>
              <option value="faseB">Fase B (Kelas 3-4 SD/MI)</option>
              <option value="faseC">Fase C (Kelas 5-6 SD/MI)</option>
              <option value="faseD">Fase D (Kelas 7-9 SMP/MTs)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Mata Pelajaran</label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              disabled={!selectedFase}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] disabled:bg-[#F1F5F9]"
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {availableMapel.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PREVIEW CP */}
      {cpData && (
        <div className="bg-white rounded-xl border-2 border-[#2D5BE3] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white p-6">
            <h3 className="text-lg font-bold">📋 {selectedMapel} — {getFaseLabel(selectedFase)}</h3>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-3">Capaian Pembelajaran (CP)</h4>
              <div className="bg-[#EFF6FF] border-l-4 border-[#2D5BE3] p-4 rounded-r-lg">
                <p className="text-[#334155] leading-relaxed text-sm">{cpData.cp}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-3">Tujuan Pembelajaran (TP)</h4>
              <div className="space-y-2">
                {cpData.tp.map((tp, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-[#F8FAFC] p-3 rounded-lg">
                    <span className="text-[#2D5BE3] font-bold text-sm min-w-[24px]">{idx + 1}.</span>
                    <p className="text-[#334155] text-sm">{tp}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <Button onClick={handleApply} disabled={saving}>
                {saving ? 'Menerapkan...' : `✅ Terapkan ${selectedMapel} ke ${kelasNama}`}
              </Button>
              {appliedMapel.includes(selectedMapel) && (
                <span className="ml-3 text-sm text-[#059669] font-medium">✓ Sudah diterapkan</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAPEL YANG SUDAH DITERAPKAN */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide">
            Mata Pelajaran yang Sudah Diterapkan ({appliedMapel.length})
          </h3>
        </div>

        {appliedMapel.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            Belum ada mata pelajaran yang diterapkan. Gunakan selector di atas untuk memulai.
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {appliedMapel.map((mapel, idx) => (
              <div key={mapel} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#64748B] w-8">{idx + 1}.</span>
                  <span className="font-medium text-[#0F172A]">{mapel}</span>
                  <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#059669] text-xs rounded font-medium">Aktif</span>
                </div>
                <button
                  onClick={() => handleRemoveMapel(mapel)}
                  className="px-3 py-1.5 text-sm text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                >
                  🗑️ Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="bg-[#F0FDF4] border-l-4 border-[#059669] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#059669] mb-1">💡 Cara Menggunakan:</p>
        <ol className="text-sm text-[#334155] space-y-1 list-decimal list-inside">
          <li>Pilih <strong>Fase</strong> sesuai kelas Anda (sistem otomatis mendeteksi dari nama kelas)</li>
          <li>Pilih <strong>Mata Pelajaran</strong> yang ingin diterapkan</li>
          <li>Review CP dan TP yang muncul</li>
          <li>Klik <strong>"Terapkan"</strong> untuk menyimpan ke kelas Anda</li>
          <li>Ulangi untuk mata pelajaran lainnya</li>
          <li>Mapel yang sudah diterapkan akan otomatis muncul di menu <strong>Input Nilai</strong></li>
        </ol>
      </div>
    </div>
  );
}