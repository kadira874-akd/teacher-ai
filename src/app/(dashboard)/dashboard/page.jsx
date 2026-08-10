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
function QuickActionCard({ href, icon, title, description, accentColor }) {
  return (
    <Link href={href}>
      <div className="card-interactive p-4 group h-full">
        <div
          className="icon-box icon-box-md mb-3 group-hover:scale-105 transition-transform duration-200"
          style={{ background: accentColor?.bg || 'var(--surface-hover)', color: accentColor?.text || 'var(--text-secondary)' }}
        >
          {icon}
        </div>
        <p className="text-[0.8125rem] font-semibold text-[var(--text-primary)] mb-0.5">{title}</p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed truncate-2">{description}</p>
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
    <div className="space-y-5 sm:space-y-6 stagger-children">
  
      {/* ── HERO BANNER ──────────────────────────────────────── */}
      {/*
        PERUBAHAN:
        - Background: gradient multi-stop lebih kaya
        - Dekorasi: shapes lebih halus & blur lebih besar
        - Layout: konten lebih berjarak & tipografi lebih ketat
        - Badge tahun ajaran diperhalus
      */}
      <div
        className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--brand-700) 0%, var(--brand-600) 50%, var(--violet-600) 100%)',
          boxShadow: 'var(--shadow-brand-lg)',
        }}
      >
        {/* Background ornament */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(1px)' }}/>
          <div className="absolute top-1/2 right-24 w-40 h-40 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)' }}/>
          <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full"
            style={{ background: 'rgba(139,92,246,0.15)', filter: 'blur(2px)' }}/>
          {/* Subtle grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hdot" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hdot)"/>
          </svg>
        </div>
  
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/60 mb-1 flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {getHariIni()}, {formatTanggal()}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              {getSalam()}, <span className="text-white">{profile.nama?.split(' ')[0] || 'Guru'}</span>
            </h1>
            {kelasNama && (
              <p className="text-sm text-white/70 mt-1.5 font-medium">
                Wali Kelas {kelasNama}
              </p>
            )}
          </div>
  
          {/* Tahun ajaran badge */}
          <div className="shrink-0">
            <div
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {profile?.tahun_ajaran || '2025/2026'}
            </div>
          </div>
        </div>
      </div>
  
      {/* ── STAT CARDS ────────────────────────────────────────── */}
      {/*
        PERUBAHAN:
        - Menggunakan class .stat-card dari design system
        - Icon container menggunakan class .icon-box
        - Angka besar dengan font tabular-nums
        - Subtext lebih muted & konsisten
      */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
  
        {/* Siswa */}
        <div className="stat-card">
          <div className="icon-box icon-box-md icon-box-info shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide mb-0.5">
              Total Siswa
            </p>
            <AnimatedNumber value={stats.totalSiswa} className="text-2xl font-bold text-[var(--text-primary)] tabular-nums"/>
          </div>
        </div>
  
        {/* Mapel */}
        <div className="stat-card">
          <div className="icon-box icon-box-md icon-box-purple shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide mb-0.5">
              Mata Pelajaran
            </p>
            <AnimatedNumber value={stats.totalMapel} className="text-2xl font-bold text-[var(--text-primary)] tabular-nums"/>
          </div>
        </div>
  
        {/* Belum absen */}
        <div className="stat-card">
          <div
            className="icon-box icon-box-md shrink-0"
            style={{
              background: stats.belumAbsen > 0 ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
              color: stats.belumAbsen > 0 ? 'var(--color-warning)' : 'var(--color-success)',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide mb-0.5">
              Absensi Hari Ini
            </p>
            <div className="flex items-baseline gap-1.5">
              <AnimatedNumber value={stats.belumAbsen} className="text-2xl font-bold text-[var(--text-primary)] tabular-nums"/>
              <span className="text-xs text-[var(--text-muted)]">belum</span>
            </div>
          </div>
        </div>
      </div>
  
      {/* ── JADWAL HARI INI ──────────────────────────────────── */}
      <div className="card-section">
        <div className="card-section-header">
          <div className="icon-box icon-box-sm icon-box-primary">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[0.875rem] font-bold text-[var(--text-primary)]">Jadwal Hari Ini</h2>
            <p className="text-xs text-[var(--text-muted)]">{getHariIni()}</p>
          </div>
        </div>
  
        {jadwalHariIni.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="empty-state-title">Tidak ada jadwal</p>
            <p className="empty-state-desc">Tidak ada mata pelajaran yang dijadwalkan hari ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-light)]">
            {jadwalHariIni.map((j, i) => (
              <div key={j.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
                <div className="flex items-center gap-4">
                  {/* Waktu badge */}
                  <div className="shrink-0 text-center min-w-[64px] bg-[var(--surface-page)] rounded-xl p-2">
                    <p className="text-xs font-bold text-[var(--color-primary)] leading-none">{j.jam_mulai?.slice(0,5)}</p>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{j.jam_selesai?.slice(0,5)}</p>
                  </div>
                  <div>
                    <p className="text-[0.875rem] font-semibold text-[var(--text-primary)]">{j.mapel?.nama}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {j.jam_mulai?.slice(0,5)} – {j.jam_selesai?.slice(0,5)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/manajemen?mapel=${j.mapel_id}&tab=absensi`}
                    className="btn btn-sm"
                    style={{
                      background: 'var(--surface-active)',
                      color: 'var(--color-primary)',
                      fontSize: '0.75rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      fontWeight: 600,
                      transition: 'all var(--dur-fast)',
                    }}
                  >
                    Absensi
                  </Link>
                  <Link
                    href={`/manajemen?mapel=${j.mapel_id}&tab=penilaian`}
                    className="btn btn-sm"
                    style={{
                      background: 'var(--surface-hover)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      fontWeight: 600,
                      transition: 'all var(--dur-fast)',
                    }}
                  >
                    Nilai
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  
      {/* ── QUICK ACTIONS ────────────────────────────────────── */}
      <div>
        <h2 className="text-[0.8125rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickActionCard
            href="/absensi"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
                <rect x="3" y="16" width="5" height="5" rx="1"/>
                <path d="M21 16h-3a2 2 0 00-2 2v3M13 3v3a2 2 0 002 2h3M13 21v-3M21 13h-3M13 13h3v3"/>
              </svg>
            }
            title="Scan Absensi"
            description="Scan QR kartu siswa"
            accentColor={{ bg: 'var(--brand-50)', text: 'var(--brand-600)' }}
          />
          <QuickActionCard
            href="/manajemen?tab=penilaian"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            }
            title="Input Nilai"
            description="Penilaian formatif & sumatif"
            accentColor={{ bg: '#F5F3FF', text: 'var(--violet-600)' }}
          />
          <QuickActionCard
            href="/rapor"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            }
            title="Cetak Rapor"
            description="Ekspor PDF per siswa"
            accentColor={{ bg: 'var(--color-success-bg)', text: 'var(--color-success)' }}
          />
          <QuickActionCard
            href="/kartu-siswa"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            }
            title="Kartu Siswa"
            description="Cetak kartu QR absen"
            accentColor={{ bg: 'var(--color-info-bg)', text: 'var(--color-info)' }}
          />
        </div>
      </div>
  
    </div>
  );
}
