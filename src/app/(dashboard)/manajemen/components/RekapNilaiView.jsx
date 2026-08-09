'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import Button from '@/components/ui/Button';

/**
 * Komponen untuk menampilkan rekap nilai lengkap
 */
export default function RekapNilaiView({ selectedMapel, tpList, siswaList, onExport }) {
  const [rekapData, setRekapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRekap = async () => {
      setLoading(true);

      // Load semua nilai formatif
      const { data: formatif } = await supabase
        .from('nilai_formatif')
        .select('siswa_id, tp_id, angka')
        .eq('mapel_id', selectedMapel);

      // Load semua nilai sumatif (STS/SAS)
      const { data: sumatif } = await supabase
        .from('nilai_sumatif')
        .select('siswa_id, jenis, angka')
        .eq('mapel_id', selectedMapel);

      // Format data
      const rekap = siswaList.map(siswa => {
        const nilaiFormatif = formatif?.filter(f => f.siswa_id === siswa.id) || [];
        const nilaiSumatif = sumatif?.filter(s => s.siswa_id === siswa.id) || [];

        const tpNilai = {};
        tpList.forEach(tp => {
          const nilai = nilaiFormatif.find(f => f.tp_id === tp.id);
          tpNilai[tp.id] = nilai ? nilai.angka : null;
        });

        const sts = nilaiSumatif.find(s => s.jenis === 'STS')?.angka || null;
        const sas = nilaiSumatif.find(s => s.jenis === 'SAS')?.angka || null;

        // Hitung rata-rata
        const allNilai = [
          ...Object.values(tpNilai).filter(n => n !== null),
          sts,
          sas
        ].filter(n => n !== null);

        const rataRata = allNilai.length > 0
          ? (allNilai.reduce((a, b) => a + b, 0) / allNilai.length).toFixed(2)
          : null;

        return {
          siswa_id: siswa.id,
          nama: siswa.nama,
          tpNilai,
          sts,
          sas,
          rataRata
        };
      });

      setRekapData(rekap);
      setLoading(false);
    };

    loadRekap();
  }, [selectedMapel, tpList, siswaList]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5BE3]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">📊 Rekap Nilai Lengkap</h3>
          <p className="text-sm text-[#64748B]">{siswaList.length} siswa • {tpList.length} TP</p>
        </div>
        <Button onClick={onExport} className="bg-[#059669] hover:bg-[#047857]">
          📥 Export Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-4 py-3 text-left sticky left-0 bg-[#F8FAFC]">Nama Siswa</th>
              {tpList.map(tp => (
                <th key={tp.id} className="px-3 py-3 text-center text-xs">
                  {tp.kode_tp}
                </th>
              ))}
              <th className="px-3 py-3 text-center bg-[#FEF3C7]">STS</th>
              <th className="px-3 py-3 text-center bg-[#FEE2E2]">SAS</th>
              <th className="px-3 py-3 text-center bg-[#EFF6FF] font-bold">Rata²</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {rekapData.map((r, idx) => (
              <tr key={r.siswa_id} className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-2 font-medium text-[#0F172A] sticky left-0 bg-white">
                  {idx + 1}. {r.nama}
                </td>
                {tpList.map(tp => (
                  <td key={tp.id} className="px-3 py-2 text-center">
                    {r.tpNilai[tp.id] !== null ? (
                      <span className="font-semibold text-[#0F172A]">{r.tpNilai[tp.id]}</span>
                    ) : (
                      <span className="text-[#CBD5E1]">-</span>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  {r.sts !== null ? (
                    <span className="font-semibold text-[#D97706]">{r.sts}</span>
                  ) : (
                    <span className="text-[#CBD5E1]">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.sas !== null ? (
                    <span className="font-semibold text-[#DC2626]">{r.sas}</span>
                  ) : (
                    <span className="text-[#CBD5E1]">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.rataRata !== null ? (
                    <span className="font-bold text-[#2D5BE3]">{r.rataRata}</span>
                  ) : (
                    <span className="text-[#CBD5E1]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
