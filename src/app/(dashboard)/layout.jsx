'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuthStore';

// ── SVG ICONS ─────────────────────────────────────────────
// Menggantikan emoji dengan SVG konsisten & aksesibel
const Icons = {
  Dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  School: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  QR: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="5" height="5" rx="1"/>
      <rect x="16" y="3" width="5" height="5" rx="1"/>
      <rect x="3" y="16" width="5" height="5" rx="1"/>
      <path d="M21 16h-3a2 2 0 00-2 2v3M13 3v3a2 2 0 002 2h3M13 21v-3M21 13h-3M13 13h3v3"/>
    </svg>
  ),
  Card: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  Book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  Module: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Document: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  More: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="5" r="1"/>
      <circle cx="12" cy="12" r="1"/>
      <circle cx="12" cy="19" r="1"/>
    </svg>
  ),
};

// ── MENU ITEMS ─────────────────────────────────────────────
const menuItems = [
  { name: 'Dashboard',         href: '/dashboard',     icon: 'Dashboard',  label: 'Home' },
  { name: 'Input Data',        href: '/pengaturan',    icon: 'Settings',   label: 'Input' },
  { name: 'Manajemen Kelas',   href: '/manajemen',     icon: 'School',     label: 'Kelas' },
  { name: 'Absensi QR',        href: '/absensi',       icon: 'QR',         label: 'Absensi' },
  { name: 'Kartu Siswa',       href: '/kartu-siswa',   icon: 'Card',       label: 'Kartu' },
  { name: 'Kurikulum',         href: '/kurikulum',     icon: 'Book',       label: 'Kuriku' },
  { name: 'Modul & Bahan Ajar',href: '/bahan-ajar',    icon: 'Module',     label: 'Modul' },
  { name: 'Riwayat & Rekap',   href: '/riwayat-rekap', icon: 'Chart',      label: 'Rekap' },
  { name: 'Cetak Rapor',       href: '/rapor',         icon: 'Document',   label: 'Rapor' },
];

// BOTTOM NAV: 4 item utama + 1 tombol "Lainnya"
const bottomNavPrimary = menuItems.slice(0, 4);

// ── KOMPONEN UTAMA ─────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, fetchSession } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  // ── Auth init
  useEffect(() => {
    const initAuth = async () => {
      await fetchSession();
      const { user } = useAuthStore.getState();
      if (!user) router.push('/');
    };
    initAuth();
  }, [router, fetchSession]);

  // ── Tutup sidebar saat route berubah
  useEffect(() => {
    setSidebarOpen(false);
    setMoreMenuOpen(false);
  }, [pathname]);

  // ── Tutup more menu saat klik luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await useAuthStore.getState().signOut();
    router.push('/');
    router.refresh();
  };

  const currentMenu = menuItems.find(m => m.href === pathname);
  const initials = profile?.nama?.slice(0, 2).toUpperCase() || 'GR';

  // ── Loading state dengan skeleton
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="flex flex-col items-center gap-4">
          {/* Logo skeleton */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{animationDelay:'0ms'}}/>
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{animationDelay:'150ms'}}/>
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{animationDelay:'300ms'}}/>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">Memuat panel guru…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex">

      {/* ── OVERLAY ───────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ───────────────────────────────────────── */}
      {/*
        PERUBAHAN DARI VERSI LAMA:
        - Lebar: w-72 → w-64 (lebih proporsional)
        - Icons: emoji → SVG konsisten
        - Active state: lebih jelas dengan left border accent
        - User card: lebih compact & informatif
        - aria-hidden saat mobile tertutup
      */}
      <aside
        className={`
          w-64 bg-white border-r border-[var(--color-border)]
          flex flex-col fixed h-full z-50
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-hidden={!sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024}
        aria-label="Navigasi utama"
      >
        {/* ── Logo ── */}
        <div className="h-16 flex items-center px-5 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">TeacherAI</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Panel Wali Kelas</p>
            </div>
          </div>
        </div>

        {/* ── Navigasi ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Menu utama">
          <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 relative mb-0.5
                  ${isActive
                    ? 'bg-indigo-50 text-[var(--color-primary)]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--color-primary)] rounded-r-full" aria-hidden="true"/>
                )}
                {/* Icon */}
                <span className={`shrink-0 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-slate-400 group-hover:text-slate-600'}`} aria-hidden="true">
                  {Icons[item.icon]}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── User Card + Logout ── */}
        <div className="p-3 border-t border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-slate-50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center text-xs font-bold shrink-0" aria-hidden="true">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{profile?.nama || 'Guru'}</p>
              <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150"
            aria-label="Keluar dari aplikasi"
          >
            <span className="text-red-500" aria-hidden="true">{Icons.Logout}</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* ── KONTEN UTAMA ──────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">

        {/* ── TOPBAR ─────────────────────────────────────── */}
        {/*
          PERUBAHAN:
          - Tinggi: h-16 konsisten
          - Breadcrumb aktif
          - Tahun ajaran dari profile/state (bukan hard-coded)
          - Tombol logout mobile lebih jelas
        */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[var(--color-border)] flex items-center px-4 sm:px-6 gap-3 shrink-0" role="banner">
          {/* Hamburger mobile */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? Icons.Close : Icons.Menu}
          </button>

          {/* Breadcrumb / judul halaman */}
          <div className="flex-1 min-w-0">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li className="hidden sm:block text-xs text-slate-400">TeacherAI</li>
                <li className="hidden sm:block text-xs text-slate-300" aria-hidden="true">›</li>
                <li>
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {currentMenu?.name || 'Dashboard'}
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Right: tahun ajaran + avatar */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {profile?.tahun_ajaran || '2025/2026'}
            </span>
            {/* Avatar desktop */}
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white items-center justify-center text-xs font-bold shadow ring-2 ring-white" aria-hidden="true">
              {initials}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ───────────────────────────────── */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION ──────────────────────── */}
      {/*
        PERUBAHAN BESAR:
        - Dari slice(0,5) → 4 item utama + tombol "Lainnya"
        - "Lainnya" membuka popup menu dengan sisa 5 item
        - SVG icons menggantikan emoji
        - Safe area bottom sudah ditangani
      */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)] flex items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Navigasi bawah"
      >
        {bottomNavPrimary.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex-1 flex flex-col items-center justify-center pt-2 pb-2 gap-0.5 min-h-[56px]
                text-[10px] font-medium transition-colors
                ${isActive ? 'text-[var(--color-primary)]' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <span className={`transition-transform ${isActive ? 'scale-110' : ''}`} aria-hidden="true">
                {Icons[item.icon]}
              </span>
              <span>{item.label}</span>
              {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-[var(--color-primary)] rounded-t-full" aria-hidden="true"/>}
            </Link>
          );
        })}

        {/* Tombol "Lainnya" */}
        <div className="flex-1 relative" ref={moreMenuRef}>
          <button
            onClick={() => setMoreMenuOpen(v => !v)}
            className={`
              w-full flex flex-col items-center justify-center pt-2 pb-2 gap-0.5 min-h-[56px]
              text-[10px] font-medium transition-colors
              ${moreMenuOpen ? 'text-[var(--color-primary)]' : 'text-slate-400 hover:text-slate-600'}
            `}
            aria-haspopup="menu"
            aria-expanded={moreMenuOpen}
            aria-label="Menu lainnya"
          >
            <span aria-hidden="true">{Icons.More}</span>
            <span>Lainnya</span>
          </button>

          {/* Popup "Lainnya" */}
          {moreMenuOpen && (
            <div
              className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-xl border border-[var(--color-border)] shadow-xl overflow-hidden"
              role="menu"
              aria-label="Menu tambahan"
            >
              {menuItems.slice(4).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className={`
                      flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-indigo-50 text-[var(--color-primary)]'
                        : 'text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-[var(--color-primary)]' : 'text-slate-400'} aria-hidden="true">
                      {Icons[item.icon]}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

    </div>
  );
}
