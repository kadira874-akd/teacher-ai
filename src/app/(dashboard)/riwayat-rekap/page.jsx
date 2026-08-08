'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Button from '@/components/ui/Button';
import * as XLSX from 'xlsx';

export default function RiwayatRekapPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Data
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [siswaList, setSiswaList] = useState([]);
  const [lmList, setLmList] = useState([]);
  
  // ✅ PERBAIKAN 1: Tambahkan state nilaiData yang terlewat
  const [nilaiData, setNilaiData] = useState({});

  // State untuk mode "Semua Mapel"
  const [showSemuaMapel, setShowSemuaMapel] = useState(false);
  const [rekapSemuaMapel, setRekapSemuaMapel] = useState({});

  // 1. Inisialisasi
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase.from('kelas').select('id').eq('guru_id', profile.id).limit(1);
        if (kelasData && kelasData.length > 0) {
          setKelasId(kelasData[0].id);
          const { data: mapel } = await supabase.from('mapel').select('*').eq('kelas_id', kelasData[0].id).order('urutan');
          setMapelList(mapel || []);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // 2. Load Data saat Mapel dipilih (Mode Detail)
  useEffect(() => {
    if (!selectedMapel || !kelasId || showSemuaMapel) return;
    loadData(selectedMapel);
  }, [selectedMapel, kelasId, showSemuaMapel]);

  const loadData = async (mapelId) => {
    setLoading(true);
    const { data: siswa } = await supabase.from('siswa').select('id, nama, nisn, agama').eq('kelas_id', kelasId).order('nama');
    setSiswaList(siswa || []);

    const { data: lm } = await supabase.from('lingkup_materi').select('*').eq('mapel_id', mapelId).order('urutan');
    setLmList(lm || []);

    const { data: nilaiLM } = await supabase.from('nilai_lingkup_materi').select('*').eq('mapel_id', mapelId);
    const { data: nilaiSAS } = await supabase.from('nilai_sas').select('*').eq('mapel_id', mapelId);

    const formatted = {};
    (siswa || []).forEach(s => { formatted[s.id] = { sas: null }; });
    (nilaiLM || []).forEach(n => {
      if (!formatted[n.siswa_id]) formatted[n.siswa_id] = { sas: null };
      formatted[n.siswa_id][n.lingkup_materi_id] = n.angka;
    });
    (nilaiSAS || []).forEach(n => {
      if (!formatted[n.siswa_id]) formatted[n.siswa_id] = { sas: null };
      formatted[n.siswa_id].sas = n.angka;
    });

    setNilaiData(formatted);
    setLoading(false);
  };

  // 3. Load Rekap Semua Mapel saat toggle diaktifkan
  useEffect(() => {
    if (showSemuaMapel && kelasId && mapelList.length > 0) {
      loadRekapSemuaMapel();
    }
  }, [showSemuaMapel, kelasId, mapelList]);

  const loadRekapSemuaMapel = async () => {
    setLoading(true);
    const { data: siswa } = await supabase.from('siswa').select('id, nama, nisn, agama').eq('kelas_id', kelasId).order('nama');
    setSiswaList(siswa || []);

    const { data: allNilaiLM } = await supabase.from('nilai_lingkup_materi').select('*');
    const { data: allNilaiSAS } = await supabase.from('nilai_sas').select('*');
    const { data: allLM } = await supabase.from('lingkup_materi').select('*');

    const rekap = {};
    (siswa || []).forEach(s => { rekap[s.id] = {}; });

    mapelList.forEach(mapel => {
      const lmMapel = (allLM || []).filter(lm => lm.mapel_id === mapel.id);

      (siswa || []).forEach(siswaItem => {
        const relevantLMs = lmMapel.filter(lm => lm.kategori === siswaItem.agama || lm.kategori === 'Umum');
        const siswaNilaiLM = (allNilaiLM || []).filter(n => n.siswa_id === siswaItem.id && n.mapel_id === mapel.id);
        const siswaNilaiSAS = (allNilaiSAS || []).find(n => n.siswa_id === siswaItem.id && n.mapel_id === mapel.id);

        let sumLM = 0;
        let countLM = 0;

        relevantLMs.forEach(lm => {
          const val = siswaNilaiLM.find(n => n.lingkup_materi_id === lm.id)?.angka;
          if (val !== null && val !== undefined && !isNaN(val)) {
            sumLM += val;
            countLM++;
          }
        });

        const avgLM = countLM > 0 ? (sumLM / countLM) : 0;
        const sas = siswaNilaiSAS?.angka !== null && !isNaN(siswaNilaiSAS?.angka) ? siswaNilaiSAS?.angka : 0;

        let nilaiAkhir = 0;
        if (countLM > 0 && sas > 0) {
          nilaiAkhir = Math.round((avgLM + sas) / 2);
        } else if (countLM > 0) {
          nilaiAkhir = Math.round(avgLM);
        }

        if (!rekap[siswaItem.id]) rekap[siswaItem.id] = {};
        rekap[siswaItem.id][mapel.id] = nilaiAkhir > 0 ? nilaiAkhir : '-';
      });
    });

    setRekapSemuaMapel(rekap);
    setLoading(false);
  };

  // 4. Handle Perubahan Nilai (Mode Detail)
  const handleNilaiChange = (siswaId, fieldId, value) => {
    if (value !== '' && (isNaN(value) || parseFloat(value) > 100 || parseFloat(value) < 0)) return;

    setNilaiData(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [fieldId]: value === '' ? null : parseFloat(value)
      }
    }));
  };

  // 5. Hitung Nilai Rapor Real-time (Mode Detail)
  const hitungRapor = (siswa) => {
    const dataSiswa = nilaiData[siswa.id] || {};
    const relevantLMs = lmList.filter(lm => lm.kategori === siswa.agama || lm.kategori === 'Umum');
    
    let sumLM = 0;
    let countLM = 0;

    relevantLMs.forEach(lm => {
      const val = dataSiswa[lm.id];
      if (val !== null && val !== undefined && !isNaN(val)) {
        sumLM += val;
        countLM++;
      }
    });

    const avgLM = countLM > 0 ? (sumLM / countLM) : 0;
    const sas = dataSiswa.sas !== null && !isNaN(dataSiswa.sas) ? dataSiswa.sas : 0;

    if (countLM === 0 || sas === 0) return '-';
    return Math.round((avgLM + sas) / 2);
  };

  // 6. Simpan Semua Nilai (Mode Detail)
  const handleSaveAll = async () => {
    setSaving(true);
    const payloadLM = [];
    const payloadSAS = [];

    Object.entries(nilaiData).forEach(([siswaId, data]) => {
      if (data.sas !== null && !isNaN(data.sas)) {
        payloadSAS.push({ siswa_id: siswaId, mapel_id: selectedMapel, angka: data.sas });
      }
      lmList.forEach(lm => {
        if (data[lm.id] !== null && !isNaN(data[lm.id])) {
          payloadLM.push({ siswa_id: siswaId, mapel_id: selectedMapel, lingkup_materi_id: lm.id, angka: data[lm.id] });
        }
      });
    });

    try {
      if (payloadLM.length > 0) {
        const { error: errLM } = await supabase.from('nilai_lingkup_materi').upsert(payloadLM, { onConflict: 'siswa_id,lingkup_materi_id' });
        if (errLM) throw errLM;
      }
      if (payloadSAS.length > 0) {
        const { error: errSAS } = await supabase.from('nilai_sas').upsert(payloadSAS, { onConflict: 'siswa_id,mapel_id' });
        if (errSAS) throw errSAS;
      }
      alert('✅ Semua nilai berhasil disimpan!');
      // Refresh data setelah simpan
      if (showSemuaMapel) loadRekapSemuaMapel();
      else loadData(selectedMapel);
    } catch (error) {
      alert('Gagal menyimpan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 7. Export ke Excel
  const handleExportExcel = () => {
    if (siswaList.length === 0) return;
    
    let exportData = [];

    if (showSemuaMapel) {
      exportData = siswaList.map((siswa, idx) => {
        const row = { 'No': idx + 1, 'Nama': siswa.nama, 'NISN': siswa.nisn || '-', 'Agama': siswa.agama || 'Umum' };
        mapelList.forEach(m => { row[m.nama] = rekapSemuaMapel[siswa.id]?.[m.id] ?? '-'; });
        return row;
      });
    } else {
      exportData = siswaList.map((siswa, idx) => {
        const row = { 'No': idx + 1, 'Nama': siswa.nama, 'NISN': siswa.nisn || '-', 'Agama': siswa.agama || 'Umum' };
        lmList.forEach(lm => {
          if (lm.kategori === siswa.agama || lm.kategori === 'Umum') {
            row[`LM: ${lm.nama}`] = nilaiData[siswa.id]?.[lm.id] ?? '-';
          }
        });
        row['SAS'] = nilaiData[siswa.id]?.sas ?? '-';
        row['NILAI RAPOR'] = hitungRapor(siswa);
        return row;
      });
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');
    
    const fileName = showSemuaMapel 
      ? 'Rekap_Nilai_Semua_Mapel.xlsx' 
      : `Rekap_Nilai_${mapelList.find(m => m.id === selectedMapel)?.nama || 'Mapel'}.xlsx`;
      
    XLSX.writeFile(wb, fileName);
  };

  if (loading && !siswaList.length) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">📊 Riwayat & Rekap Nilai</h1>
          <p className="text-[#64748B] mt-1">Input massal cepat. Nilai rapor dihitung otomatis.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportExcel}>📤 Export Excel</Button>
          <Button onClick={handleSaveAll} disabled={saving || (!selectedMapel && !showSemuaMapel)}>
            {saving ? 'Menyimpan...' : '💾 Simpan Semua Nilai'}
          </Button>
        </div>
      </div>

      {/* FILTER & TOGGLE */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Pilih Mata Pelajaran</label>
            <select 
              value={selectedMapel} 
              onChange={(e) => { setSelectedMapel(e.target.value); setShowSemuaMapel(false); }}
              disabled={showSemuaMapel}
              className={`w-full md:w-1/2 px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-base font-medium text-[#0F172A] bg-white ${showSemuaMapel ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
          
          {/* Toggle Semua Mapel */}
          <div className="flex items-center gap-3 pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showSemuaMapel} 
                onChange={(e) => {
                  setShowSemuaMapel(e.target.checked);
                  if (e.target.checked) setSelectedMapel('');
                }} 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2D5BE3]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D5BE3]"></div>
              <span className="ml-3 text-sm font-bold text-[#0F172A]">📊 Tampilkan Rekap Semua Mapel</span>
            </label>
          </div>
        </div>
      </div>

      {/* TABEL: MODE SEMUA MAPEL */}
      {showSemuaMapel && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F0FDF4] border-b border-[#E2E8F0] flex justify-between items-center">
            <h3 className="font-bold text-[#166534]">📋 Rekap Nilai Akhir Semua Mata Pelajaran</h3>
            <span className="text-xs text-[#166534] bg-white px-2 py-1 rounded border border-[#166534]/20">Nilai dihitung otomatis: (Rata-rata LM + SAS) / 2</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3 text-left w-12 sticky left-0 bg-[#F8FAFC] z-10">No</th>
                  <th className="px-4 py-3 text-left w-48 sticky left-12 bg-[#F8FAFC] z-10 border-r border-[#E2E8F0]">Nama Siswa</th>
                  {mapelList.map(m => (
                    <th key={m.id} className="px-4 py-3 text-center min-w-[100px] font-bold text-[#2D5BE3] border-r border-[#E2E8F0] last:border-r-0">
                      {m.nama}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {siswaList.map((siswa, idx) => (
                  <tr key={siswa.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3 text-[#64748B] sticky left-0 bg-white">{idx + 1}</td>
                    <td className="px-4 py-3 sticky left-12 bg-white border-r border-[#E2E8F0]">
                      <div className="font-medium text-[#0F172A]">{siswa.nama}</div>
                      <div className="text-xs text-[#64748B]">{siswa.agama || 'Umum'}</div>
                    </td>
                    {mapelList.map(m => {
                      const nilai = rekapSemuaMapel[siswa.id]?.[m.id] ?? '-';
                      return (
                        <td key={m.id} className="px-4 py-3 text-center border-r border-[#E2E8F0] last:border-r-0">
                          {nilai !== '-' ? (
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                              nilai >= 80 ? 'bg-[#DCFCE7] text-[#166534]' :
                              nilai >= 70 ? 'bg-[#FFFBEB] text-[#92400E]' :
                              'bg-[#FEF2F2] text-[#991B1B]'
                            }`}>
                              {nilai}
                            </span>
                          ) : (
                            <span className="text-[#CBD5E1] text-xs">-</span>
                          )}
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

      {/* ✅ PERBAIKAN 2: TABEL MODE SATU MAPEL DETAIL (Lengkap) */}
      {!showSemuaMapel && selectedMapel && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3 text-left w-12 sticky left-0 bg-[#F8FAFC] z-10">No</th>
                  <th className="px-4 py-3 text-left w-48 sticky left-12 bg-[#F8FAFC] z-10 border-r border-[#E2E8F0]">Nama Siswa (Agama)</th>
                  {lmList.map(lm => (
                    <th key={lm.id} className="px-2 py-3 text-center min-w-[80px]">
                      <div className="text-xs font-bold text-[#334155]">{lm.nama}</div>
                      <div className={`text-[10px] mt-1 px-1.5 py-0.5 rounded inline-block ${
                        lm.kategori === 'Islam' ? 'bg-[#DCFCE7] text-[#166534]' :
                        lm.kategori === 'Kristen' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                        'bg-[#F3F4F6] text-[#374151]'
                      }`}>
                        {lm.kategori}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center w-24 bg-[#FFF7ED] text-[#9A3412] font-bold border-l border-[#E2E8F0]">SAS</th>
                  <th className="px-4 py-3 text-center w-24 bg-[#F0FDF4] text-[#166534] font-bold border-l border-[#E2E8F0]">📊 Rapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {siswaList.map((siswa, idx) => {
                  const dataSiswa = nilaiData[siswa.id] || {};
                  const rapor = hitungRapor(siswa);
                  
                  return (
                    <tr key={siswa.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 text-[#64748B] sticky left-0 bg-white">{idx + 1}</td>
                      <td className="px-4 py-3 sticky left-12 bg-white border-r border-[#E2E8F0]">
                        <div className="font-medium text-[#0F172A]">{siswa.nama}</div>
                        <div className="text-xs text-[#64748B]">{siswa.agama || 'Umum'}</div>
                      </td>
                      
                      {lmList.map(lm => {
                        const isRelevant = lm.kategori === siswa.agama || lm.kategori === 'Umum';
                        const val = dataSiswa[lm.id] ?? '';
                        
                        return (
                          <td key={lm.id} className="px-2 py-3 text-center">
                            {isRelevant ? (
                              <input 
                                type="text"
                                inputMode="decimal"
                                value={val}
                                onChange={(e) => handleNilaiChange(siswa.id, lm.id, e.target.value)}
                                className="w-16 px-2 py-1.5 text-center border border-[#E2E8F0] rounded focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] transition-all text-base font-semibold text-[#0F172A] bg-white"
                                placeholder="0"
                              />
                            ) : (
                              <span className="text-[#CBD5E1] text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                      
                      <td className="px-4 py-3 text-center bg-[#FFF7ED]/30 border-l border-[#E2E8F0]">
                        <input 
                          type="text"
                          inputMode="decimal"
                          value={dataSiswa.sas ?? ''}
                          onChange={(e) => handleNilaiChange(siswa.id, 'sas', e.target.value)}
                          className="w-16 px-2 py-1.5 text-center border border-[#E2E8F0] rounded focus:outline-none focus:ring-2 focus:ring-[#9A3412] transition-all text-base font-semibold text-[#0F172A] bg-white"
                          placeholder="0"
                        />
                      </td>
                      
                      <td className="px-4 py-3 text-center bg-[#F0FDF4]/50 border-l border-[#E2E8F0]">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                          rapor === '-' ? 'bg-[#F1F5F9] text-[#64748B]' :
                          rapor >= 80 ? 'bg-[#DCFCE7] text-[#166534]' :
                          rapor >= 70 ? 'bg-[#FFFBEB] text-[#92400E]' :
                          'bg-[#FEF2F2] text-[#991B1B]'
                        }`}>
                          {rapor}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {siswaList.length === 0 && (
            <div className="text-center py-12 text-[#64748B]">
              <p className="text-4xl mb-3">👨‍🎓</p>
              <p>Belum ada data siswa di kelas ini.</p>
            </div>
          )}
        </div>
      )}
      
      {/* INFO BOX */}
      <div className="bg-[#EFF6FF] border-l-4 border-[#0369A1] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#0369A1] mb-1">💡 Cara Penggunaan Cepat:</p>
        <ul className="text-sm text-[#334155] space-y-1 list-disc list-inside">
          <li><strong>Mode Detail:</strong> Pilih Mata Pelajaran. Isi nilai per Lingkup Materi (LM) dan SAS. Kolom <strong>📊 Rapor</strong> terhitung otomatis.</li>
          <li><strong>Mode Rekap:</strong> Aktifkan toggle "Tampilkan Rekap Semua Mapel" untuk melihat nilai akhir semua mapel sekaligus dalam satu tabel.</li>
          <li>Klik <strong>Simpan Semua Nilai</strong> untuk menyimpan perubahan ke database.</li>
        </ul>
      </div>
    </div>
  );
}