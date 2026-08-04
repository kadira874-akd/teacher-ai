'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';

function ManajemenContent() {
  const searchParams = useSearchParams();
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter utama
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [activeTab, setActiveTab] = useState('absensi');

  // State Absensi
  const [absenTanggal, setAbsenTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [siswaList, setSiswaList] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [savingAbsen, setSavingAbsen] = useState(false);

  // State Penilaian
  const [nilaiJenis, setNilaiJenis] = useState('formatif');
  const [nilaiTanggal, setNilaiTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tpList, setTpList] = useState([]);
  const [selectedTPs, setSelectedTPs] = useState([]);
  const [nilaiData, setNilaiData] = useState({});
  const [savingNilai, setSavingNilai] = useState(false);

  // State Kurikulum
  const [kurikulumData, setKurikulumData] = useState(null);
  const [savingKurikulum, setSavingKurikulum] = useState(false);

  // 1. Inisialisasi
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase.from('kelas').select('id').eq('guru_id', profile.id).limit(1);
        if (kelasData && kelasData.length > 0) {
          const cId = kelasData[0].id;
          setKelasId(cId);

          const { data: mapel } = await supabase.from('mapel').select('*').eq('kelas_id', cId).order('urutan');
          setMapelList(mapel || []);

          const { data: siswa } = await supabase.from('siswa').select('id, nama').eq('kelas_id', cId).order('nama');
          setSiswaList(siswa || []);

          // Cek query params dari dashboard
          const mapelParam = searchParams.get('mapel');
          const tabParam = searchParams.get('tab');
          if (mapelParam && mapel?.find(m => m.id === mapelParam)) {
            setSelectedMapel(mapelParam);
          } else if (mapel && mapel.length > 0) {
            setSelectedMapel(mapel[0].id);
          }
          if (tabParam) setActiveTab(tabParam);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession, searchParams]);

  // 2. Load data saat mapel berubah
  useEffect(() => {
    if (!selectedMapel) return;

    const loadMapelData = async () => {
      // Load kurikulum
      const { data: kurikulum } = await supabase.from('kurikulum_kelas').select('*').eq('mapel_id', selectedMapel).eq('kelas_id', kelasId).single();
      if (kurikulum) {
        setKurikulumData(kurikulum);
        setTpList(kurikulum.tp || []);
        setSelectedTPs((kurikulum.tp || []).map((_, idx) => idx));
      } else {
        setKurikulumData(null);
        setTpList([]);
        setSelectedTPs([]);
      }
    };
    loadMapelData();
  }, [selectedMapel, kelasId]);

  // 3. Load absensi saat tanggal/mapel berubah
  useEffect(() => {
    if (!selectedMapel || !absenTanggal) return;
    const loadAbsensi = async () => {
      const { data } = await supabase.from('absensi').select('siswa_id, status').eq('mapel_id', selectedMapel).eq('tanggal', absenTanggal);
      const formatted = {};
      siswaList.forEach(s => { formatted[s.id] = 'H'; });
      data?.forEach(item => { formatted[item.siswa_id] = item.status; });
      setAttendance(formatted);
    };
    loadAbsensi();
  }, [selectedMapel, absenTanggal, siswaList]);

  // 4. Load nilai saat filter berubah
  useEffect(() => {
    if (!selectedMapel || selectedTPs.length === 0) return;
    const loadNilai = async () => {
      const { data } = await supabase.from('nilai_tp').select('siswa_id, tp_index, angka').eq('mapel_id', selectedMapel).eq('jenis_penilaian', nilaiJenis).eq('tanggal', nilaiTanggal).in('tp_index', selectedTPs);
      const formatted = {};
      data?.forEach(item => { formatted[`${item.siswa_id}_${item.tp_index}`] = item.angka; });
      setNilaiData(formatted);
    };
    loadNilai();
  }, [selectedMapel, nilaiJenis, nilaiTanggal, selectedTPs]);

  // 5. Simpan Absensi
  const handleSaveAbsen = async () => {
    setSavingAbsen(true);
    const payload = Object.entries(attendance).map(([siswa_id, status]) => ({ siswa_id, mapel_id: selectedMapel, tanggal: absenTanggal, status }));
    const { error } = await supabase.from('absensi').upsert(payload, { onConflict: 'siswa_id,mapel_id,tanggal' });
    if (error) alert('Gagal: ' + error.message);
    else alert('✅ Absensi berhasil disimpan!');
    setSavingAbsen(false);
  };

  // 6. Simpan Nilai
  const handleSaveNilai = async () => {
    setSavingNilai(true);
    const payload = [];
    siswaList.forEach(siswa => {
      selectedTPs.forEach(tpIdx => {
        const key = `${siswa.id}_${tpIdx}`;
        const angka = nilaiData[key];
        if (angka !== '' && angka !== null && angka !== undefined) {
          payload.push({ siswa_id: siswa.id, mapel_id: selectedMapel, tp_index: tpIdx, tp_text: tpList[tpIdx]?.text || '', jenis_penilaian: nilaiJenis, tanggal: nilaiTanggal, angka: parseFloat(angka) });
        }
      });
    });
    if (payload.length === 0) { alert('Tidak ada nilai yang diisi!'); setSavingNilai(false); return; }
    const { error } = await supabase.from('nilai_tp').upsert(payload, { onConflict: 'siswa_id,mapel_id,tp_index,jenis_penilaian,tanggal' });
    if (error) alert('Gagal: ' + error.message);
    else alert(`✅ Berhasil menyimpan ${payload.length} data nilai!`);
    setSavingNilai(false);
  };

  // 7. Simpan Kurikulum
  const handleSaveKurikulum = async () => {
    setSavingKurikulum(true);
    const { error } = await supabase.from('kurikulum_kelas').upsert({ kelas_id: kelasId, mapel_id: selectedMapel, fase: kurikulumData?.fase || 'faseB', cp: kurikulumData?.cp || '', tp: tpList }, { onConflict: 'kelas_id,mapel_id' });
    if (error) alert('Gagal: ' + error.message);
    else alert('✅ Kurikulum berhasil disimpan!');
    setSavingKurikulum(false);
  };

  const selectedMapelName = mapelList.find(m => m.id === selectedMapel)?.nama || '';

  if (loading || !profile || !kelasId) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>;

  if (mapelList.length === 0) return (
    <div className="flex items-center justify-center h-[60vh] text-center">
      <div>
        <p className="text-4xl mb-3">📚</p>
        <h3 className="text-lg font-semibold text-[#0F172A]">Belum ada mata pelajaran</h3>
        <p className="text-[#64748B] mt-2">Silakan tambahkan mapel di menu <strong>Pengaturan Kelas</strong>.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER + DROPDOWN MAPEL */}
      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-4">📚 Manajemen Kelas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Pilih Mata Pelajaran</label>
            <select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-lg font-semibold">
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-[#E2E8F0]">
        {[
          { id: 'absensi', label: '📅 Absensi' },
          { id: 'penilaian', label: '📝 Penilaian' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id ? 'bg-[#2D5BE3] text-white' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB ABSENSI ==================== */}
      {activeTab === 'absensi' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">Tanggal</label>
              <input type="date" value={absenTanggal} onChange={(e) => setAbsenTanggal(e.target.value)} className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div className="text-sm text-[#64748B]">
              Absensi <strong className="text-[#0F172A]">{selectedMapelName}</strong> • {siswaList.length} siswa
            </div>
            <Button onClick={handleSaveAbsen} disabled={savingAbsen} className="md:ml-auto">
              {savingAbsen ? 'Menyimpan...' : '💾 Simpan Absensi'}
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3 text-left w-12">No</th>
                  <th className="px-4 py-3 text-left">Nama Siswa</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {siswaList.map((siswa, idx) => (
                  <tr key={siswa.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 text-[#64748B]">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-[#0F172A]">{siswa.nama}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {['H', 'S', 'I', 'A'].map(status => (
                          <button key={status} onClick={() => setAttendance(prev => ({ ...prev, [siswa.id]: status }))}
                            className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${
                              attendance[siswa.id] === status
                                ? status === 'H' ? 'bg-[#059669] text-white border-[#059669]'
                                  : status === 'S' ? 'bg-[#D97706] text-white border-[#D97706]'
                                  : status === 'I' ? 'bg-[#0369A1] text-white border-[#0369A1]'
                                  : 'bg-[#DC2626] text-white border-[#DC2626]'
                                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2D5BE3]'
                            }`}>
                            {status}
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
      )}

      {/* ==================== TAB PENILAIAN ==================== */}
      {activeTab === 'penilaian' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Jenis Penilaian</label>
                <select value={nilaiJenis} onChange={(e) => setNilaiJenis(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg">
                  <option value="formatif">Formatif (Harian)</option>
                  <option value="sumatif_lm">Sumatif Lingkup Materi</option>
                  <option value="sumatif_as">Sumatif Akhir Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Tanggal</label>
                <input type="date" value={nilaiTanggal} onChange={(e) => setNilaiTanggal(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg" />
              </div>
              <Button onClick={handleSaveNilai} disabled={savingNilai}>
                {savingNilai ? 'Menyimpan...' : '💾 Simpan Nilai'}
              </Button>
            </div>
          </div>

          {/* TP Selector */}
          {tpList.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-[#2D5BE3]">Pilih TP yang Dinilai</h3>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedTPs(tpList.map((_, i) => i))} className="text-xs text-[#2D5BE3] hover:underline">Semua</button>
                  <button onClick={() => setSelectedTPs([])} className="text-xs text-[#DC2626] hover:underline">Batal</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tpList.map((tp, idx) => (
                  <label key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer border transition-all ${selectedTPs.includes(idx) ? 'bg-[#EFF6FF] border-[#2D5BE3] text-[#2D5BE3] font-medium' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'}`}>
                    <input type="checkbox" checked={selectedTPs.includes(idx)} onChange={() => setSelectedTPs(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])} className="w-3 h-3" />
                    TP {idx + 1}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tabel Nilai */}
          {selectedTPs.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3 text-left sticky left-0 bg-[#F8FAFC] w-48">Nama Siswa</th>
                    {selectedTPs.map(idx => (
                      <th key={idx} className="px-4 py-3 text-center min-w-[100px]">TP {idx + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {siswaList.map(siswa => (
                    <tr key={siswa.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-medium text-[#0F172A] sticky left-0 bg-white">{siswa.nama}</td>
                      {selectedTPs.map(tpIdx => (
                        <td key={tpIdx} className="px-4 py-3 text-center">
                          <input type="number" min="0" max="100" step="0.01" value={nilaiData[`${siswa.id}_${tpIdx}`] ?? ''} onChange={(e) => { const v = parseFloat(e.target.value); setNilaiData(prev => ({ ...prev, [`${siswa.id}_${tpIdx}`]: e.target.value === '' ? '' : (v >= 0 && v <= 100 ? v : prev[`${siswa.id}_${tpIdx}`]) })); }} placeholder="-" className="w-20 px-2 py-1.5 text-center border border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#2D5BE3]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function ManajemenPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>}>
      <ManajemenContent />
    </Suspense>
  );
}