'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useToast } from '@/hooks/useToast';
import { SkeletonDashboard } from '@/components/ui/SkeletonLoader';
import Link from 'next/link';

// ── Helpers ────────────────────────────────────────────────
function getHariIni() {
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  return days[new Date().getDay()];
}

function getSalam() {
  const jam = new Date().getHours();
  if (jam < 11) return 'Selamat Pagi';
  if (jam < 15) return 'Selamat Siang';
  if (jam < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function formatTanggal() {
  const date = new Date();
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ── Animated stat number ───────────────────────────────────
function AnimatedNumber({ value, className = '' }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplayed(0); return; }
    let start = 0;
    const duration = 600;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplayed(start);
      if (start >= value) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span className={className}>{displayed}</span>;
}

// ── Quick action card ──────────────────────────────────────
function QuickActionCard({ href, icon, title, description, colorFrom, colorTo, borderHover, bgHover }) {
  return (
    <Link href={href}>
      <div className={`group p-4 border-2 border-slate-100 rounded-2xl hover:${borderHover} hover:${bgHover} transition-all duration-200 cursor-pointer active:scale-[0.98] h-full`}>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorFrom} ${colorTo} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
          {icon}
        </div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}

// ── Main component ─────────────────────────────────────────
export default function DashboardPage() {
  const { profile, fetchSession } = useAuthStore();
  const { toast } = useToast();

  const [kelasId, setKelasId] = useState('');
  const [kelasNama, setKelasNama] = useState('');
  const [loading, setLoading] = useState(true);
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [stats, setStats] = useState({ totalSiswa: 0, totalMapel: 0, belumAbsen: 0 });

  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (!profile?.id) return;

      setLoading(true);
      try {
        // ── Ambil kelas ──────────────────────────────────
        const { data: kelasData, error: kelasError } = await supabase
          .from('kelas').select('id, nama_kelas').eq('guru_id', profile.id).limit(1);

        if (kelasError) throw kelasError;
        if (!kelasData?.length) { setLoading(false); return; }

        const kId = kelasData[0].id;
        setKelasId(kId);
        setKelasNama(kelasData[0].nama_kelas || 'Kelas');

        const hariIni   = getHariIni();
        const tanggalHariIni = new Date().toISOString().split('T')[0];

        // ── PARALLEL FETCH (FIX ISU #12 — was sequential) ──
        const [
          { count: siswaCount },
          { count: mapelCount },
          { data: jadwalData },
        ] = await Promise.all([
          supabase.from('siswa').select('*', { count: 'exact', head: true }).eq('kelas_id', kId),
          supabase.from('mapel').select('*', { count: 'exact', head: true }).eq('kelas_id', kId),
          supabase.from('jadwal_mapel')
            .select('*, mapel:mapel_id(nama)')
            .eq('kelas_id', kId)
            .eq('hari', hariIni)
            .order('jam_mulai', { ascending: true }),
        ]);

        setJadwalHariIni(jadwalData || []);

        // ── Hitung belum absen (parallel per jadwal) ──────
        let belumAbsen = 0;
        if (jadwalData?.length) {
          const absenCounts = await Promise.all(
            jadwalData.map(j =>
              supabase.from('absensi').select('*', { count: 'exact', head: true })
                .eq('mapel_id', j.mapel_id).eq('tanggal', tanggalHariIni)
            )
          );
          belumAbsen = absenCounts.filter(r => (r.count || 0) === 0).length;
        }

        setStats({ totalSiswa: siswaCount || 0, totalMapel: mapelCount || 0, belumAbsen });
      } catch (err) {
        toast.error('Gagal memuat data dashboard. Coba refresh halaman.');
        console.error('[Dashboard] init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [profile, fetchSession, toast]);

  // ── Loading state ──────────────────────────────────────
  if (loading || !profile) return <SkeletonDashboard />;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── HERO BANNER ─────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl p-5 sm:p-7 text-white overflow-hidden shadow-lg shadow-indigo-500/20">
        {/* Dekorasi */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true"/>
        <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-purple-300/15 rounded-full blur-xl pointer-events-none" aria-hidden="true"/>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white/70 mb-0.5">{getHariIni()}, {formatTanggal()}</p>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">
              {getSalam()}, {profile.nama?.split(' ')[0] || 'Guru'}! 👋
            </h1>
            {kelasNama && (
              <p className="text-sm text-white/80 mt-1 font-medium">Wali Kelas {kelasNama}</p>
            )}
          </div>
          <div className="shrink-0 hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
            <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-sm font-semibold text-white">{profile.tahun_ajaran || '2025/2026'}</span>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Siswa */}
        <div className="mobile-stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
              <svg className="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Siswa</p>
              <AnimatedNumber
                value={stats.totalSiswa}
                className="text-2xl font-bold text-slate-900 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Mata Pelajaran */}
        <div className="mobile-stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
              <svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Mata Pelajaran</p>
              <AnimatedNumber
                value={stats.totalMapel}
                className="text-2xl font-bold text-slate-900 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Belum Absen */}
        <div className="mobile-stat-card">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              stats.belumAbsen > 0 ? 'bg-gradient-to-br from-red-50 to-orange-100' : 'bg-gradient-to-br from-emerald-50 to-green-100'
            }`} aria-hidden="true">
              <svg className={`w-6 h-6 ${stats.belumAbsen > 0 ? 'text-red-500' : 'text-emerald-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                {stats.belumAbsen > 0 ? (
                  <>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </>
                ) : (
                  <polyline points="20 6 9 17 4 12"/>
                )}
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Belum Absen Hari Ini</p>
              <AnimatedNumber
                value={stats.belumAbsen}
                className={`text-2xl font-bold tabular-nums ${stats.belumAbsen > 0 ? 'text-red-600' : 'text-emerald-600'}`}
              />
            </div>
          </div>
          {stats.belumAbsen === 0 && stats.totalMapel > 0 && (
            <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <span aria-hidden="true">✓</span> Semua mapel sudah diabsen
            </p>
          )}
        </div>
      </div>

      {/* ── JADWAL HARI INI ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Jadwal {getHariIni()}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Klik untuk langsung absen atau input nilai</p>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full tabular-nums">
            {jadwalHariIni.length} mapel
          </span>
        </div>

        {jadwalHariIni.length === 0 ? (
          /* ── Empty state ── */
          <div className="py-12 px-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4" aria-hidden="true">
              <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Tidak ada jadwal hari ini</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
              {kelasId ? 'Belum ada jadwal yang diatur untuk hari ini.' : 'Anda belum memiliki kelas. Mulai dengan pengaturan kelas.'}
            </p>
            <Link href="/pengaturan">
              <button className="btn-primary px-5 py-2 text-sm">
                Atur Jadwal
              </button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50" role="list">
            {jadwalHariIni.map((jadwal) => (
              <li key={jadwal.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[68px] bg-indigo-50 rounded-xl px-3 py-2 shrink-0">
                    <p className="text-sm font-bold text-indigo-700">{jadwal.jam_mulai}</p>
                    <p className="text-[10px] text-indigo-400">{jadwal.jam_selesai}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{jadwal.mapel?.nama || 'Mapel'}</p>
                    <p className="text-xs text-slate-400">{kelasNama}</p>
                  </div>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <Link href={`/manajemen?mapel=${jadwal.mapel_id}&tab=absensi`} className="flex-1 sm:flex-none">
                    <button className="w-full px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-md active:scale-95">
                      Absen
                    </button>
                  </Link>
                  <Link href={`/manajemen?mapel=${jadwal.mapel_id}&tab=penilaian`} className="flex-1 sm:flex-none">
                    <button className="w-full px-4 py-2 btn-primary text-xs">
                      Nilai
                    </button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── AKSES CEPAT ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Akses Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickActionCard
            href="/pengaturan"
            icon={<svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}
            title="Pengaturan Kelas"
            description="Setup sekolah, siswa, kurikulum & jadwal"
            colorFrom="from-indigo-50" colorTo="to-purple-100"
            borderHover="border-indigo-200" bgHover="bg-gradient-to-br from-indigo-50/50 to-purple-50/50"
          />
          <QuickActionCard
            href="/manajemen"
            icon={<svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            title="Manajemen Kelas"
            description="Absensi & penilaian terpadu per mata pelajaran"
            colorFrom="from-blue-50" colorTo="to-cyan-100"
            borderHover="border-blue-200" bgHover="bg-gradient-to-br from-blue-50/50 to-cyan-50/50"
          />
          <QuickActionCard
            href="/rapor"
            icon={<svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
            title="Cetak Rapor"
            description="Generate & download rapor PDF per siswa atau seluruh kelas"
            colorFrom="from-emerald-50" colorTo="to-green-100"
            borderHover="border-emerald-200" bgHover="bg-gradient-to-br from-emerald-50/50 to-green-50/50"
          />
        </div>
      </div>

    </div>
  );
}
