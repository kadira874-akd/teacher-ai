'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getCurriculumData } from '@/data/curriculumDatabase';
import Button from '@/components/ui/Button';

export default function NilaiPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filter
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('formatif');
  const [selectedTanggal, setSelectedTanggal] = useState(new Date().toISOString().split('T')[0]);
  
  // TP Selector
  const [tpList, setTpList] = useState([]);
  const [selectedTPs, setSelectedTPs] = useState([]);
  
  // Data
  const [siswaList, setSiswaList] = useState([]);
  const [nilaiData, setNilaiData] = useState({}); // { 'siswa_id_tpIndex': angka }

  // 1. Inisialisasi
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      
      if (profile?.id) {
        setLoading(true);
        
        // Ambil kelas
        const { data: kelasData } = await supabase
          .from('kelas')
          .select('id, fase, kurikulum_mapel')
          .eq('guru_id', profile.id)
          .limit(1);

        if (kelasData && kelasData.length > 0) {
          const kelas = kelasData[0];
          setKelasId(kelas.id);

          // Ambil mapel yang sudah diterapkan
          const { data: mapelData } = await supabase
            .from('mapel')
            .select('id, nama')
            .eq('kelas_id', kelas.id)
            .order('urutan', { ascending: true });

          setMapelList(mapelData || []);
          if (mapelData && mapelData.length > 0) {
            setSelectedMapel(mapelData[0].id);
          }

          // Ambil siswa
          const { data: siswaData } = await supabase
            .from('siswa')
            .select('id, nama')
            .eq('kelas_id', kelas.id)
            .order('nama', { ascending: true });
          
          setSiswaList(siswaData || []);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // 2. Saat mapel dipilih, load TP dari database kurikulum
  useEffect(() => {
    const loadTP = async () => {
      if (!selectedMapel || !kelasId) return;

      // Ambil nama mapel
      const mapel = mapelList.find(m => m.id === selectedMapel);
      if (!mapel) return;

      // Ambil fase dari kelas
      const { data: kelasData } = await supabase
        .from('kelas')
        .select('fase')
        .eq('id', kelasId)
        .single();

      if (!kelasData?.fase) {
        setTpList([]);
        return;
      }

      // Ambil data kurikulum
      const curriculumData = getCurriculumData(kelasData.fase, mapel.nama);
      if (curriculumData && curriculumData.tp) {
        setTpList(curriculumData.tp);
        // Default: pilih semua TP
        setSelectedTPs(curriculumData.tp.map((_, idx) => idx));
      } else {
        setTpList([]);
      }
    };

    loadTP();
  }, [selectedMapel, kelasId, mapelList]);

  // 3. Ambil nilai yang sudah ada untuk TP yang dipilih
  useEffect(() => {
    const loadNilai = async () => {
      if (!selectedMapel || selectedTPs.length === 0) return;

      const { data } = await supabase
        .from('nilai_tp')
        .select('siswa_id, tp_index, angka')
        .eq('mapel_id', selectedMapel)
        .eq('jenis_penilaian', selectedJenis)
        .eq('tanggal', selectedTanggal)
        .in('tp_index', selectedTPs);

      // Format ke object
      const formatted = {};
      data?.forEach(item => {
        const key = `${item.siswa_id}_${item.tp_index}`;
        formatted[key] = item.angka;
      });
      setNilaiData(formatted);
    };

    loadNilai();
  }, [selectedMapel, selectedJenis, selectedTanggal, selectedTPs]);

  // 4. Handle perubahan input nilai
  const handleNilaiChange = (siswaId, tpIndex, value) => {
    const num = parseFloat(value);
    const key = `${siswaId}_${tpIndex}`;
    
    if (value === '' || (num >= 0 && num <= 100)) {
      setNilaiData(prev => ({ 
        ...prev, 
        [key]: value === '' ? '' : num 
      }));
    }
  };

  // 5. Simpan nilai
  const handleSave = async () => {
    if (selectedTPs.length === 0) {
      alert('Pilih minimal 1 TP yang akan dinilai!');
      return;
    }

    setSaving(true);

    // Siapkan payload
    const payload = [];
    
    siswaList.forEach(siswa => {
      selectedTPs.forEach(tpIndex => {
        const key = `${siswa.id}_${tpIndex}`;
        const angka = nilaiData[key];
        
        if (angka !== '' && angka !== null && angka !== undefined) {
          payload.push({
            siswa_id: siswa.id,
            mapel_id: selectedMapel,
            tp_index: tpIndex,
            tp_text: tpList[tpIndex],
            jenis_penilaian: selectedJenis,
            tanggal: selectedTanggal,
            angka: parseFloat(angka)
          });
        }
      });
    });

    if (payload.length === 0) {
      alert('Tidak ada nilai yang diisi!');
      setSaving(false);
      return;
    }

    // Upsert nilai
    const { error } = await supabase
      .from('nilai_tp')
      .upsert(payload, { 
        onConflict: 'siswa_id,mapel_id,tp_index,jenis_penilaian,tanggal' 
      });

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      alert(`✅ Berhasil menyimpan ${payload.length} data nilai!`);
    }
    setSaving(false);
  };

  // 6. Toggle TP
  const toggleTP = (idx) => {
    setSelectedTPs(prev => 
      prev.includes(idx) 
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  // 7. Pilih semua / batal semua TP
  const selectAllTP = () => setSelectedTPs(tpList.map((_, idx) => idx));
  const deselectAllTP = () => setSelectedTPs([]);

  if (loading || !profile || !kelasId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (mapelList.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-4xl mb-3">📚</p>
          <h3 className="text-lg font-semibold text-[#0F172A]">Belum ada mata pelajaran</h3>
          <p className="text-[#64748B] mt-2">Silakan pilih kurikulum terlebih dahulu di menu <strong>Pilih Kurikulum</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans']">Input Nilai</h1>
          <p className="text-[#64748B] mt-1">Input nilai per Tujuan Pembelajaran (TP) dengan fleksibel.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="md:w-auto w-full">
          {saving ? 'Menyimpan...' : '💾 Simpan Nilai'}
        </Button>
      </div>

      {/* FILTER */}
      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Mata Pelajaran</label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
            >
              {mapelList.map(m => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Jenis Penilaian</label>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
            >
              <option value="formatif">Formatif (Harian)</option>
              <option value="sumatif_lm">Sumatif Lingkup Materi</option>
              <option value="sumatif_as">Sumatif Akhir Semester</option>
              <option value="kokurikuler">Kokurikuler (P5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Tanggal</label>
            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
            />
          </div>
        </div>
      </div>

      {/* TP SELECTOR */}
      {tpList.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide">
              Pilih Tujuan Pembelajaran (TP) yang Akan Dinilai
            </h3>
            <div className="flex gap-2">
              <button
                onClick={selectAllTP}
                className="px-3 py-1.5 text-xs bg-[#EFF6FF] text-[#2D5BE3] rounded hover:bg-[#DBEAFE]"
              >
                Pilih Semua
              </button>
              <button
                onClick={deselectAllTP}
                className="px-3 py-1.5 text-xs bg-[#FEF2F2] text-[#DC2626] rounded hover:bg-[#FEE2E2]"
              >
                Batal Semua
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {tpList.map((tp, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedTPs.includes(idx)
                    ? 'bg-[#EFF6FF] border-2 border-[#2D5BE3]'
                    : 'bg-[#F8FAFC] border-2 border-transparent hover:border-[#E2E8F0]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTPs.includes(idx)}
                  onChange={() => toggleTP(idx)}
                  className="mt-1 w-4 h-4 text-[#2D5BE3] rounded focus:ring-[#2D5BE3]"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-[#0F172A]">TP {idx + 1}:</span>
                  <p className="text-sm text-[#334155] mt-1">{tp}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TABEL INPUT NILAI */}
      {selectedTPs.length > 0 && siswaList.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[#334155] sticky left-0 bg-[#F8FAFC] z-10 w-48">
                    Nama Siswa
                  </th>
                  {selectedTPs.map(tpIdx => (
                    <th key={tpIdx} className="px-4 py-3 text-center font-semibold text-[#334155] min-w-[100px]">
                      TP {tpIdx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {siswaList.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-medium text-[#0F172A] sticky left-0 bg-white z-10">
                      {siswa.nama}
                    </td>
                    {selectedTPs.map(tpIdx => {
                      const key = `${siswa.id}_${tpIdx}`;
                      return (
                        <td key={tpIdx} className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={nilaiData[key] ?? ''}
                            onChange={(e) => handleNilaiChange(siswa.id, tpIdx, e.target.value)}
                            placeholder="-"
                            className="w-20 px-2 py-1.5 text-center border border-[#E2E8F0] rounded focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INFO */}
      <div className="bg-[#EFF6FF] border-l-4 border-[#0369A1] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#0369A1] mb-1">💡 Tips:</p>
        <ul className="text-sm text-[#334155] space-y-1 list-disc list-inside">
          <li>Pilih TP yang <strong>sudah diajarkan</strong> saja (tidak perlu semua)</li>
          <li>Tanggal bisa dipilih <strong>bebas</strong> (hari ini, tanggal lalu, atau tanggal depan)</li>
          <li>Sistem akan <strong>otomatis menghitung rata-rata</strong> per TP dan per mapel untuk rapor</li>
          <li>Anda bisa <strong>input bertahap</strong> (hari ini TP 1-3, besok TP 4-6, dst)</li>
        </ul>
      </div>
    </div>
  );
}