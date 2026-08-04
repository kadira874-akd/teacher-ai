'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RaporPDF from '@/components/RaporPDF';
import Button from '@/components/ui/Button';

export default function RaporPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [raporData, setRaporData] = useState(null);
  const [sekolahData, setSekolahData] = useState(null);
  
  const [catatanWali, setCatatanWali] = useState('');
  const [statusKenaikan, setStatusKenaikan] = useState('');
  const [nomorRapor, setNomorRapor] = useState('');
  const [tanggalPenetapan, setTanggalPenetapan] = useState('');
  const [kotaPenetapan, setKotaPenetapan] = useState('');

  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase.from('kelas').select('id').eq('guru_id', profile.id).limit(1);
        if (kelasData && kelasData.length > 0) {
          setKelasId(kelasData[0].id);
          const { data: siswaData } = await supabase.from('siswa').select('*').eq('kelas_id', kelasData[0].id).order('nama', { ascending: true });
          setSiswaList(siswaData || []);
          if (siswaData && siswaData.length > 0) setSelectedSiswaId(siswaData[0].id);

          if (profile?.sekolah_id) {
            const { data: sekolah } = await supabase.from('sekolah').select('*').eq('id', profile.sekolah_id).single();
            setSekolahData(sekolah);
          }
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  useEffect(() => {
    const fetchRapor = async () => {
      if (!selectedSiswaId || !kelasId) return;

      const { data: mapelList } = await supabase.from('mapel').select('*').eq('kelas_id', kelasId).order('urutan', { ascending: true });
      const { data: nilaiTPData } = await supabase.from('nilai_tp').select('*').eq('siswa_id', selectedSiswaId);
      const { data: absensiData } = await supabase.from('absensi').select('*').eq('siswa_id', selectedSiswaId);
      const { data: pancasilaData } = await supabase.from('profil_pancasila').select('*').eq('siswa_id', selectedSiswaId);
      const { data: ekskulData } = await supabase.from('nilai_ekskul').select('*, ekskul:ekskul_id(nama, jenis)').eq('siswa_id', selectedSiswaId);
      const { data: raporExisting } = await supabase.from('rapor').select('*').eq('siswa_id', selectedSiswaId).eq('semester', 'Ganjil').limit(1);

      // PROSES NILAI: 1 Nilai Akhir + 2 Deskripsi (Tertinggi & Terendah)
      const nilaiPerMapel = [];
      mapelList?.forEach(mapel => {
        const nilaiMapel = nilaiTPData?.filter(n => n.mapel_id === mapel.id) || [];
        if (nilaiMapel.length > 0) {
          // Group nilai per TP
          const perTP = {};
          nilaiMapel.forEach(nilai => {
            if (!perTP[nilai.tp_index]) perTP[nilai.tp_index] = { tp_text: nilai.tp_text, scores: [] };
            perTP[nilai.tp_index].scores.push(nilai.angka);
          });

          let totalNilai = 0;
          let countTP = 0;
          let highestTP = { tp_text: 'Materi umum', avg: -1 };
          let lowestTP = { tp_text: 'Materi umum', avg: 101 };

          Object.values(perTP).forEach(tpData => {
            const avg = tpData.scores.reduce((a, b) => a + b, 0) / tpData.scores.length;
            totalNilai += avg;
            countTP++;

            if (avg > highestTP.avg) highestTP = { tp_text: tpData.tp_text, avg };
            if (avg < lowestTP.avg) lowestTP = { tp_text: tpData.tp_text, avg };
          });

          const nilaiAkhir = countTP > 0 ? totalNilai / countTP : 0;

          // Generate 2 Deskripsi Resmi
          const deskripsiTertinggi = `Menunjukkan pemahaman yang sangat baik pada materi ${highestTP.tp_text.toLowerCase()}.`;
          const deskripsiTerendah = `Perlu bimbingan dan latihan lebih lanjut pada materi ${lowestTP.tp_text.toLowerCase()}.`;

          nilaiPerMapel.push({
            nama: mapel.nama,
            nilaiAkhir: parseFloat(nilaiAkhir.toFixed(1)),
            deskripsiTertinggi,
            deskripsiTerendah
          });
        }
      });

      // PROSES ABSENSI
      const rekapTotal = { H: 0, S: 0, I: 0, A: 0 };
      const rekapPerMapel = {};
      
      absensiData?.forEach(absen => {
        const mapelName = mapelList?.find(m => m.id === absen.mapel_id)?.nama || 'Lainnya';
        if (!rekapPerMapel[mapelName]) rekapPerMapel[mapelName] = { H: 0, S: 0, I: 0, A: 0 };
        
        rekapPerMapel[mapelName][absen.status]++;
        rekapTotal[absen.status]++;
      });

      setRaporData({ nilaiPerMapel, rekapTotal, rekapPerMapel, pancasilaData: pancasilaData || [], ekskulData: ekskulData || [] });

      if (raporExisting && raporExisting.length > 0) {
        const r = raporExisting[0];
        setCatatanWali(r.catatan_wali || '');
        setStatusKenaikan(r.status_kenaikan || '');
        setNomorRapor(r.nomor_rapor || '');
        setTanggalPenetapan(r.tanggal_penetapan || '');
        setKotaPenetapan(r.kota_penetapan || '');
      }
    };
    fetchRapor();
  }, [selectedSiswaId, kelasId]);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('rapor').delete().eq('siswa_id', selectedSiswaId).eq('semester', 'Ganjil');
    const { error } = await supabase.from('rapor').insert({
      siswa_id: selectedSiswaId, semester: 'Ganjil', status: 'Draft',
      catatan_wali: catatanWali, status_kenaikan: statusKenaikan,
      nomor_rapor: nomorRapor, tanggal_penetapan: tanggalPenetapan || null, kota_penetapan: kotaPenetapan,
    });
    if (error) alert('Gagal: ' + error.message);
    else alert('✅ Data rapor berhasil disimpan!');
    setSaving(false);
  };

  const getPredikat = (angka) => {
    if (angka >= 90) return { label: 'A', text: 'Sangat Baik', color: 'bg-[#F0FDF4] text-[#059669]' };
    if (angka >= 80) return { label: 'B', text: 'Baik', color: 'bg-[#EFF6FF] text-[#0369A1]' };
    if (angka >= 70) return { label: 'C', text: 'Cukup', color: 'bg-[#FFFBEB] text-[#D97706]' };
    return { label: 'D', text: 'Perlu Bimbingan', color: 'bg-[#FEF2F2] text-[#DC2626]' };
  };

  if (loading || !profile || !kelasId) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>;
  if (siswaList.length === 0) return <div className="text-center p-12"><p className="text-4xl mb-3">📄</p><p>Belum ada data siswa.</p></div>;

  const selectedSiswa = siswaList.find(s => s.id === selectedSiswaId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Preview Rapor</h1>
          <p className="text-[#64748B] mt-1">Format resmi: 1 Nilai Akhir + 2 Deskripsi (Tertinggi & Terendah).</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : '💾 Simpan Data'}</Button>
          {selectedSiswa && raporData && (
            <PDFDownloadLink
              document={<RaporPDF siswa={selectedSiswa} raporData={raporData} raporInfo={{ catatan_wali: catatanWali, status_kenaikan: statusKenaikan, nomor_rapor: nomorRapor, tanggal_penetapan: tanggalPenetapan, kota_penetapan: kotaPenetapan }} sekolah={sekolahData} getPredikat={getPredikat} />}
              fileName={`Rapor-${selectedSiswa.nama.replace(/\s+/g, '_')}.pdf`}
              className="px-6 py-2.5 bg-[#059669] text-white rounded-lg font-medium hover:bg-[#047857] transition-all inline-flex items-center gap-2"
            >
              {({ loading }) => loading ? 'Menyiapkan PDF...' : '📥 Download PDF'}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <select value={selectedSiswaId} onChange={(e) => setSelectedSiswaId(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg">
          {siswaList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
        </select>
      </div>

      {selectedSiswa && raporData && (
        <div className="bg-white rounded-xl border-2 border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white p-8 text-center">
            {sekolahData ? (
              <>
                <h3 className="text-xl font-bold mb-2">{sekolahData.nama}</h3>
                <p className="text-sm opacity-90">{sekolahData.alamat} • NPSN: {sekolahData.npsn || '-'}</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <h2 className="text-3xl font-bold">RAPOR PESERTA DIDIK</h2>
                  <p className="text-sm mt-2 opacity-90">Tahun Pelajaran 2025/2026 • Semester Ganjil</p>
                </div>
              </>
            ) : <h2 className="text-3xl font-bold">RAPOR PESERTA DIDIK</h2>}
          </div>

          <div className="p-8 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">A. Identitas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-[#64748B]">Nama:</span> <span className="font-semibold">{selectedSiswa.nama}</span></div>
              <div><span className="text-[#64748B]">NISN:</span> <span className="font-semibold">{selectedSiswa.nisn || '-'}</span></div>
              <div><span className="text-[#64748B]">TTL:</span> <span className="font-semibold">{selectedSiswa.tempat_lahir || '-'}, {selectedSiswa.tanggal_lahir || '-'}</span></div>
              <div><span className="text-[#64748B]">JK:</span> <span className="font-semibold">{selectedSiswa.jenis_kelamin || '-'}</span></div>
            </div>
          </div>

          <div className="p-8 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">B. Nilai Akademik</h3>
            {raporData.nilaiPerMapel.length === 0 ? (
              <p className="text-center text-[#64748B] py-8">Belum ada nilai.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-4 py-3 text-left w-8">No</th>
                      <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                      <th className="px-4 py-3 text-center w-20">Nilai</th>
                      <th className="px-4 py-3 text-center w-32">Predikat</th>
                      <th className="px-4 py-3 text-left">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {raporData.nilaiPerMapel.map((mapel, idx) => {
                      const pred = getPredikat(mapel.nilaiAkhir);
                      return (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="px-4 py-4">{idx + 1}</td>
                          <td className="px-4 py-4 font-medium">{mapel.nama}</td>
                          <td className="px-4 py-4 text-center font-bold">{mapel.nilaiAkhir}</td>
                          <td className="px-4 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${pred.color}`}>{pred.label}</span></td>
                          <td className="px-4 py-4 text-xs leading-relaxed text-[#334155]">
                            <p className="mb-1"><span className="font-semibold text-[#059669]">• Tertinggi:</span> {mapel.deskripsiTertinggi}</p>
                            <p><span className="font-semibold text-[#D97706]">• Terendah:</span> {mapel.deskripsiTerendah}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bagian Pancasila, Ekskul, Absensi, dan Catatan Wali tetap sama seperti sebelumnya, pastikan tidak dihapus */}
          <div className="p-8 border-b border-[#E2E8F0]">
             <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">C. Rekap Kehadiran</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-[#F0FDF4] p-4 rounded-lg text-center"><p className="text-3xl font-bold text-[#059669]">{raporData.rekapTotal?.H || 0}</p><p className="text-xs text-[#64748B] mt-1">Hadir</p></div>
               <div className="bg-[#FFFBEB] p-4 rounded-lg text-center"><p className="text-3xl font-bold text-[#D97706]">{raporData.rekapTotal?.S || 0}</p><p className="text-xs text-[#64748B] mt-1">Sakit</p></div>
               <div className="bg-[#EFF6FF] p-4 rounded-lg text-center"><p className="text-3xl font-bold text-[#0369A1]">{raporData.rekapTotal?.I || 0}</p><p className="text-xs text-[#64748B] mt-1">Izin</p></div>
               <div className="bg-[#FEF2F2] p-4 rounded-lg text-center"><p className="text-3xl font-bold text-[#DC2626]">{raporData.rekapTotal?.A || 0}</p><p className="text-xs text-[#64748B] mt-1">Alpha</p></div>
             </div>
          </div>

          <div className="p-8">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">D. Catatan Wali Kelas & Kenaikan</h3>
            <textarea value={catatanWali} onChange={(e) => setCatatanWali(e.target.value)} rows="3" className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg mb-4" placeholder="Catatan perkembangan..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={statusKenaikan} onChange={(e) => setStatusKenaikan(e.target.value)} className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg">
                <option value="">-- Status Kenaikan --</option>
                <option value="Naik Kelas">Naik Kelas</option>
                <option value="Tidak Naik">Tidak Naik</option>
                <option value="Lulus">Lulus</option>
              </select>
              <input type="text" value={nomorRapor} onChange={(e) => setNomorRapor(e.target.value)} placeholder="Nomor Rapor" className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}