'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [kelasNama, setKelasNama] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Data untuk dashboard
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [belumAbsenHariIni, setBelumAbsenHariIni] = useState(0);
  const [totalMapel, setTotalMapel] = useState(0);

  // 1. Inisialisasi
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        
        // Ambil kelas
        const { data: kelasData } = await supabase
          .from('kelas')
          .select('id, nama_kelas')
          .eq('guru_id', profile.id)
          .limit(1);

        if (kelasData && kelasData.length > 0) {
          const currentKelasId = kelasData[0].id;
          setKelasId(currentKelasId);
          setKelasNama(kelasData[0].nama_kelas || 'Kelas');

          // Ambil total siswa
          const { count: siswaCount } = await supabase
            .from('siswa')
            .select('*', { count: 'exact', head: true })
            .eq('kelas_id', currentKelasId);
          setTotalSiswa(siswaCount || 0);

          // Ambil total mapel
          const { count: mapelCount } = await supabase
            .from('mapel')
            .select('*', { count: 'exact', head: true })
            .eq('kelas_id', currentKelasId);
          setTotalMapel(mapelCount || 0);

          // Ambil jadwal hari ini
          const hariIni = getHariIni();
          const { data: jadwalData } = await supabase
            .from('jadwal_mapel')
            .select('*, mapel:mapel_id(nama)')
            .eq('kelas_id', currentKelasId)
            .eq('hari', hariIni)
            .order('jam_mulai', { ascending: true });

          setJadwalHariIni(jadwalData || []);

          // Hitung berapa mapel yang belum diabsen hari ini
          const tanggalHariIni = new Date().toISOString().split('T')[0];
          let belumAbsen = 0;
          
          for (const jadwal of (jadwalData || [])) {
            const { count } = await supabase
              .from('absensi')
              .select('*', { count: 'exact', head: true })
              .eq('mapel_id', jadwal.mapel_id)
              .eq('tanggal', tanggalHariIni);
            
            if (count === 0) belumAbsen++;
          }
          setBelumAbsenHariIni(belumAbsen);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // Helper: Dapatkan nama hari dalam Bahasa Indonesia
  function getHariIni() {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  }

  // Helper: Format tanggal
  function formatTanggal() {
    const date = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] rounded-xl p-4 sm:p-6 lg:p-8 text-white">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
          👋 Selamat {new Date().getHours() < 12 ? 'Pagi' : new Date().getHours() < 18 ? 'Siang' : 'Malam'}, {profile.nama || 'Guru'}!
        </h1>
        <p className="text-xs sm:text-sm opacity-90">Wali Kelas {kelasNama} • {getHariIni()}, {formatTanggal()}</p>
      </div>

      {/* STATISTIK CEPAT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-[#64748B] mb-1">Total Siswa</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{totalSiswa}</p>
            </div>
            <div className="text-3xl sm:text-4xl">👨‍🎓</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-[#64748B] mb-1">Mata Pelajaran</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{totalMapel}</p>
            </div>
            <div className="text-3xl sm:text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-[#64748B] mb-1">Belum Absen Hari Ini</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#DC2626]">{belumAbsenHariIni}</p>
            </div>
            <div className="text-3xl sm:text-4xl">📅</div>
          </div>
        </div>
      </div>

      {/* JADWAL HARI INI */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">📅 Jadwal Hari Ini ({getHariIni()})</h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">Klik tombol untuk langsung absen atau input nilai</p>
        </div>

        {jadwalHariIni.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <p className="text-3xl sm:text-4xl mb-3">📭</p>
            <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-2">Tidak ada jadwal hari ini</h3>
            <p className="text-xs sm:text-sm text-[#64748B] mb-4">Atau Anda belum mengatur jadwal di Pengaturan Kelas</p>
            <Link href="/pengaturan">
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#2D5BE3] text-white rounded-lg text-sm font-medium hover:bg-[#1E40AF] transition-colors">
                ⚙️ Atur Jadwal Sekarang
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {jadwalHariIni.map((jadwal) => (
              <div key={jadwal.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center min-w-[70px] sm:min-w-[80px]">
                    <p className="text-xs sm:text-sm font-bold text-[#2D5BE3]">{jadwal.jam_mulai}</p>
                    <p className="text-xs text-[#64748B]">{jadwal.jam_selesai}</p>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-[#0F172A]">{jadwal.mapel?.nama || 'Mapel'}</p>
                    <p className="text-xs text-[#64748B]">{kelasNama}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link href={`/manajemen?mapel=${jadwal.mapel_id}&tab=absensi`} className="flex-1 sm:flex-none">
                    <button className="w-full px-3 sm:px-4 py-2 bg-[#059669] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#047857] transition-colors">
                      📝 Absen
                    </button>
                  </Link>
                  <Link href={`/manajemen?mapel=${jadwal.mapel_id}&tab=penilaian`} className="flex-1 sm:flex-none">
                    <button className="w-full px-3 sm:px-4 py-2 bg-[#2D5BE3] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#1E40AF] transition-colors">
                      📊 Nilai
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AKSES CEPAT */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-4">⚡ Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/pengaturan">
            <div className="p-4 border-2 border-[#E2E8F0] rounded-lg hover:border-[#2D5BE3] transition-colors cursor-pointer">
              <p className="text-xl sm:text-2xl mb-2">⚙️</p>
              <p className="text-sm sm:text-base font-semibold text-[#0F172A]">Pengaturan Kelas</p>
              <p className="text-xs text-[#64748B] mt-1">Setup sekolah, siswa, kurikulum & jadwal</p>
            </div>
          </Link>
          <Link href="/manajemen">
            <div className="p-4 border-2 border-[#E2E8F0] rounded-lg hover:border-[#2D5BE3] transition-colors cursor-pointer">
              <p className="text-xl sm:text-2xl mb-2">📚</p>
              <p className="text-sm sm:text-base font-semibold text-[#0F172A]">Manajemen Kelas</p>
              <p className="text-xs text-[#64748B] mt-1">Absensi & penilaian terpadu per mapel</p>
            </div>
          </Link>
          <Link href="/rapor">
            <div className="p-4 border-2 border-[#E2E8F0] rounded-lg hover:border-[#2D5BE3] transition-colors cursor-pointer">
              <p className="text-xl sm:text-2xl mb-2">📄</p>
              <p className="text-sm sm:text-base font-semibold text-[#0F172A]">Cetak Rapor</p>
              <p className="text-xs text-[#64748B] mt-1">Generate & download rapor PDF</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}