'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function RiwayatPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filter
  const [filterMapel, setFilterMapel] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterSiswa, setFilterSiswa] = useState('');
  
  // Data
  const [mapelList, setMapelList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [riwayatFormatif, setRiwayatFormatif] = useState([]);
  const [riwayatSumatif, setRiwayatSumatif] = useState([]);

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
          
          const { data: siswa } = await supabase.from('siswa').select('id, nama').eq('kelas_id', kelasData[0].id).order('nama');
          setSiswaList(siswa || []);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // 2. Load riwayat saat filter berubah
  useEffect(() => {
    const loadRiwayat = async () => {
      if (!kelasId) return;

      // Load formatif
      let queryFormatif = supabase.from('nilai_formatif').select('*, siswa:siswa_id(nama), mapel:mapel_id(nama)').eq('mapel_id', filterMapel || mapelList[0]?.id);
      if (filterSiswa) queryFormatif = queryFormatif.eq('siswa_id', filterSiswa);
      const { data: formatif } = await queryFormatif.order('tanggal', { ascending: false });
      setRiwayatFormatif(formatif || []);

      // Load sumatif
      let querySumatif = supabase.from('nilai_sumatif').select('*, siswa:siswa_id(nama), mapel:mapel_id(nama)').eq('mapel_id', filterMapel || mapelList[0]?.id);
      if (filterSiswa) querySumatif = querySumatif.eq('siswa_id', filterSiswa);
      const { data: sumatif } = await querySumatif.order('tanggal', { ascending: false });
      setRiwayatSumatif(sumatif || []);
    };
    loadRiwayat();
  }, [kelasId, filterMapel, filterSiswa, mapelList]);

  // 3. Hapus nilai formatif
  const handleDeleteFormatif = async (id) => {
    if (!confirm('Yakin hapus nilai formatif ini?')) return;
    const { error } = await supabase.from('nilai_formatif').delete().eq('id', id);
    if (!error) {
      setRiwayatFormatif(riwayatFormatif.filter(r => r.id !== id));
      alert('✅ Nilai berhasil dihapus!');
    }
  };

  // 4. Hapus nilai sumatif
  const handleDeleteSumatif = async (id) => {
    if (!confirm('Yakin hapus nilai sumatif ini?')) return;
    const { error } = await supabase.from('nilai_sumatif').delete().eq('id', id);
    if (!error) {
      setRiwayatSumatif(riwayatSumatif.filter(r => r.id !== id));
      alert('✅ Nilai berhasil dihapus!');
    }
  };

  if (loading || !profile || !kelasId) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">📜 Riwayat Penilaian</h1>
        <p className="text-[#64748B] mt-1">Lihat dan kelola semua nilai yang sudah diinput</p>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Mata Pelajaran</label>
            <select value={filterMapel} onChange={(e) => setFilterMapel(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg">
              <option value="">Semua Mapel</option>
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Siswa</label>
            <select value={filterSiswa} onChange={(e) => setFilterSiswa(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg">
              <option value="">Semua Siswa</option>
              {siswaList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* RIWAYAT FORMATIF */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white">
          <h3 className="font-bold text-lg">📝 Penilaian Formatif ({riwayatFormatif.length} data)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Siswa</th>
                <th className="px-4 py-3 text-left">TP</th>
                <th className="px-4 py-3 text-left">Aktivitas</th>
                <th className="px-4 py-3 text-center">Nilai</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {riwayatFormatif.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-[#64748B]">Belum ada data formatif</td></tr>
              ) : (
                riwayatFormatif.map(item => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">{item.tanggal}</td>
                    <td className="px-4 py-3 font-medium">{item.siswa?.nama}</td>
                    <td className="px-4 py-3 text-xs">{item.tp_text?.substring(0, 50)}...</td>
                    <td className="px-4 py-3 text-xs">{item.nama_aktivitas || '-'}</td>
                    <td className="px-4 py-3 text-center font-bold">{item.angka}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDeleteFormatif(item.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1 rounded text-xs">🗑️ Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIWAYAT SUMATIF */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-[#D97706] to-[#DC2626] text-white">
          <h3 className="font-bold text-lg">📊 Penilaian Sumatif ({riwayatSumatif.length} data)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Siswa</th>
                <th className="px-4 py-3 text-left">Nama Ulangan</th>
                <th className="px-4 py-3 text-center">Nilai</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {riwayatSumatif.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-[#64748B]">Belum ada data sumatif</td></tr>
              ) : (
                riwayatSumatif.map(item => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">{item.tanggal}</td>
                    <td className="px-4 py-3 font-medium">{item.siswa?.nama}</td>
                    <td className="px-4 py-3">{item.nama_ulangan}</td>
                    <td className="px-4 py-3 text-center font-bold">{item.angka}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDeleteSumatif(item.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1 rounded text-xs">🗑️ Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}