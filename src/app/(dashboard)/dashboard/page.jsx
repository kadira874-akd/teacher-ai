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
      {/* HEADER - Enhanced Mobile Design */}
      <div className="relative bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] rounded-2xl p-5 sm:p-6 lg:p-8 text-white overflow-hidden shadow-xl shadow-blue-500/20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 mobile-h1">
            👋 Selamat {new Date().getHours() < 12 ? 'Pagi' : new Date().getHours() < 18 ? 'Siang' : 'Malam'}, {profile.nama || 'Guru'}!
          </h1>
          <p className="text-xs sm:text-sm opacity-90 font-medium">Wali Kelas {kelasNama} • {getHariIni()}, {formatTanggal()}</p>
        </div>
      </div>

      {/* STATISTIK CEPAT - Mobile Optimized Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="mobile-stat-card">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-sm">
              <span className="text-2xl sm:text-3xl">👨‍🎓</span>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-0.5">Total Siswa</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalSiswa}</p>
            </div>
          </div>
        </div>

        <div className="mobile-stat-card">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center shadow-sm">
              <span className="text-2xl sm:text-3xl">📚</span>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-0.5">Mata Pelajaran</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalMapel}</p>
            </div>
          </div>
        </div>

        <div className="mobile-stat-card">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center shadow-sm">
              <span className="text-2xl sm:text-3xl">📅</span>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-0.5">Belum Absen Hari Ini</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{belumAbsenHariIni}</p>
            </div>
          </div>
        </div>
      </div>

      {/* JADWAL HARI INI - Enhanced Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span>
            <span>Jadwal Hari Ini ({getHariIni()})</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Klik tombol untuk langsung absen atau input nilai</p>
        </div>

        {jadwalHariIni.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Tidak ada jadwal hari ini</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-md mx-auto">Atau Anda belum mengatur jadwal di Pengaturan Kelas</p>
            <Link href="/pengaturan">
              <button className="px-5 py-2.5 bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 active:scale-95 touch-target">
                ⚙️ Atur Jadwal Sekarang
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jadwalHariIni.map((jadwal) => (
              <div key={jadwal.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition-colors duration-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center min-w-[70px] sm:min-w-[80px] bg-slate-50 rounded-xl px-3 py-2">
                    <p className="text-sm sm:text-base font-bold text-indigo-600">{jadwal.jam_mulai}</p>
                    <p className="text-xs text-slate-500">{jadwal.jam_selesai}</p>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-slate-900">{jadwal.mapel?.nama || 'Mapel'}</p>
                    <p className="text-xs text-slate-500">{kelasNama}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link href={`/manajemen?mapel=${jadwal.mapel_id}&tab=absensi`} className="flex-1 sm:flex-none">
                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 active:scale-95 touch-target">
                      📝 Absen
                    </button>
                  </Link>
                  <Link href={`/manajemen?mapel=${jadwal.mapel_id}&tab=penilaian`} className="flex-1 sm:flex-none">
                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 active:scale-95 touch-target">
                      📊 Nilai
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AKSES CEPAT - Enhanced Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>⚡</span>
          <span>Akses Cepat</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/pengaturan">
            <div className="group p-4 border-2 border-slate-100 rounded-xl sm:rounded-2xl hover:border-indigo-200 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer active:scale-97">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <p className="text-xl sm:text-2xl">⚙️</p>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-900">Pengaturan Kelas</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">Setup sekolah, siswa, kurikulum & jadwal</p>
            </div>
          </Link>
          <Link href="/manajemen">
            <div className="group p-4 border-2 border-slate-100 rounded-xl sm:rounded-2xl hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 cursor-pointer active:scale-97">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <p className="text-xl sm:text-2xl">📚</p>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-900">Manajemen Kelas</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">Absensi & penilaian terpadu per mapel</p>
            </div>
          </Link>
          <Link href="/rapor">
            <div className="group p-4 border-2 border-slate-100 rounded-xl sm:rounded-2xl hover:border-green-200 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer active:scale-97">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <p className="text-xl sm:text-2xl">📄</p>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-900">Cetak Rapor</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">Generate & download rapor PDF</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}