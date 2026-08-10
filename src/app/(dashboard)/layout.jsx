'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuthStore';

// ─────────────────────────────────────────────────────────────
// SVG ICON LIBRARY — konsisten, 20×20 viewBox, stroke-based
// ─────────────────────────────────────────────────────────────
const Icon = ({ d, paths, children, className = 'w-[18px] h-[18px]' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true">
    {children}
  </svg>
);

const Icons = {
  Dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </Icon>
  ),
  Settings: (
    <Icon>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </Icon>
  ),
  School: (
    <Icon>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </Icon>
  ),
  QR: (
    <Icon>
      <rect x="3" y="3" width="5" height="5" rx="1"/>
      <rect x="16" y="3" width="5" height="5" rx="1"/>
      <rect x="3" y="16" width="5" height="5" rx="1"/>
      <path d="M21 16h-3a2 2 0 00-2 2v3M13 3v3a2 2 0 002 2h3M13 21v-3M21 13h-3M13 13h3v3"/>
    </Icon>
  ),
  Card: (
    <Icon>
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </Icon>
  ),
  Book: (
    <Icon>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </Icon>
  ),
  Module: (
    <Icon>
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </Icon>
  ),
  Chart: (
    <Icon>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </Icon>
  ),
  Document: (
    <Icon>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </Icon>
  ),
  Logout: (
    <Icon>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </Icon>
  ),
  Menu: (
    <Icon className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </Icon>
  ),
  Close: (
    <Icon className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </Icon>
  ),
  More: (
    <Icon className="w-5 h-5">
      <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/>
    </Icon>
  ),
  Bell: (
    <Icon className="w-5 h-5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </Icon>
  ),
};

// ─────────────────────────────────────────────────────────────
// MENU CONFIG
// ─────────────────────────────────────────────────────────────
const menuItems = [
  { name: 'Dashboard',          href: '/dashboard',     icon: 'Dashboard', label: 'Home',    group: 'main' },
  { name: 'Input Data',         href: '/pengaturan',    icon: 'Settings',  label: 'Input',   group: 'main' },
  { name: 'Manajemen Kelas',    href: '/manajemen',     icon: 'School',    label: 'Kelas',   group: 'main' },
  { name: 'Absensi QR',         href: '/absensi',       icon: 'QR',        label: 'Absensi', group: 'main' },
  { name: 'Kartu Siswa',        href: '/kartu-siswa',   icon: 'Card',      label: 'Kartu',   group: 'academic' },
  { name: 'Kurikulum',          href: '/kurikulum',     icon: 'Book',      label: 'Kuriku',  group: 'academic' },
  { name: 'Modul & Bahan Ajar', href: '/bahan-ajar',    icon: 'Module',    label: 'Modul',   group: 'academic' },
  { name: 'Riwayat & Rekap',    href: '/riwayat-rekap', icon: 'Chart',     label: 'Rekap',   group: 'reports' },
  { name: 'Cetak Rapor',        href: '/rapor',         icon: 'Document',  label: 'Rapor',   group: 'reports' },
];

const bottomPrimary = menuItems.slice(0, 4); // Dashboard, Input, Kelas, Absensi
const groupLabels = { main: 'Utama', academic: 'Akademik', reports: 'Laporan' };

// ─────────────────────────────────────────────────────────────
// SIDEBAR NAV ITEM
// ─────────────────────────────────────────────────────────────
function SidebarItem({ item, isActive }) {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.8125rem] font-medium',
        'transition-all duration-150 mb-0.5',
        isActive
          ? 'bg-[var(--surface-active)] text-[var(--color-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
      ].join(' ')}
    >
      {/* Active pill */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-primary)] rounded-r-full"/>
      )}
      {/* Icon */}
      <span className={[
        'shrink-0 transition-colors',
        isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]',
      ].join(' ')}>
        {Icons[item.icon]}
      </span>
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { profile, fetchSession } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen]       = useState(false);
  const moreRef = useRef(null);

  // Auth init
  useEffect(() => {
    const init = async () => {
      await fetchSession();
      if (!useAuthStore.getState().user) router.push('/');
    };
    init();
  }, [router, fetchSession]);

  // Close on route change
  useEffect(() => {
    setSidebarOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Close more-menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await useAuthStore.getState().signOut();
    router.push('/');
    router.refresh();
  };

  const currentMenu = menuItems.find(m => m.href === pathname);
  const initials    = profile?.nama?.slice(0, 2).toUpperCase() || 'GR';

  // ── Loading skeleton ──
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)]">
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--violet-600))' }}>
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 120, 240].map(d => (
              <div key={d} className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce"
                style={{ animationDelay: `${d}ms` }}/>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] font-medium">Memuat panel guru…</p>
        </div>
      </div>
    );
  }

  // Group menu items
  const grouped = {};
  menuItems.forEach(item => {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  });

  return (
    <div className="min-h-screen bg-[var(--surface-page)] flex">

      {/* ── Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'var(--surface-overlay)', backdropFilter: 'blur(3px)' }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════════════════
          SIDEBAR
          Lebar: 240px. Background: putih bersih + border kanan.
          Tidak ada gradient sidebar — nuansa calm & profesional.
      ══════════════════════════════════════════════════════ */}
      <aside
        className={[
          'w-60 bg-[var(--surface-card)] border-r border-[var(--border-light)]',
          'flex flex-col fixed h-full z-50',
          'transition-transform duration-300',
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        aria-label="Navigasi utama"
      >
        {/* Logo */}
        <div className="h-[60px] flex items-center px-4 border-b border-[var(--border-light)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--violet-600))' }}>
              <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-[0.8125rem] font-bold text-[var(--text-primary)] leading-none">TeacherAI</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-none">Panel Wali Kelas</p>
            </div>
          </div>
        </div>

        {/* Nav — grouped */}
        <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Menu utama">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-4">
              <p className="px-3 mb-1 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em]">
                {groupLabels[group]}
              </p>
              {items.map(item => (
                <SidebarItem key={item.href} item={item} isActive={pathname === item.href}/>
              ))}
            </div>
          ))}
        </nav>

        {/* User card + logout */}
        <div className="p-3 border-t border-[var(--border-light)] shrink-0">
          <div className="flex items-center gap-2.5 p-2.5 mb-2 rounded-xl bg-[var(--surface-hover)]">
            <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--violet-600))' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.8125rem] font-semibold text-[var(--text-primary)] truncate leading-tight">
                {profile?.nama || 'Guru'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate leading-tight mt-0.5">
                {profile?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-[0.8125rem] font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors duration-150"
            aria-label="Keluar dari aplikasi"
          >
            <span className="text-red-400">{Icons.Logout}</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════ */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">

        {/* ── TOPBAR ── */}
        <header
          className="sticky top-0 z-30 h-[60px] bg-[var(--surface-card)]/80 border-b border-[var(--border-light)] flex items-center px-4 sm:px-6 gap-3 shrink-0"
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          role="banner"
        >
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden p-2 -ml-1 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
            aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? Icons.Close : Icons.Menu}
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li className="hidden sm:block text-xs text-[var(--text-muted)]">TeacherAI</li>
                <li className="hidden sm:block text-[var(--text-muted)]" style={{ fontSize: '10px' }}>›</li>
                <li>
                  <span className="text-[0.875rem] font-semibold text-[var(--text-primary)] truncate">
                    {currentMenu?.name || 'Dashboard'}
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Right area */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Tahun ajaran chip */}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--surface-hover)] px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {profile?.tahun_ajaran || '2025/2026'}
            </span>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-xl text-white text-[11px] font-bold flex items-center justify-center shadow-sm ring-2 ring-white"
              style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--violet-600))' }}
              aria-hidden="true"
            >
              {initials}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════
          MOBILE BOTTOM NAV
          4 item + tombol "Lainnya" dengan popup sheet
      ══════════════════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-card)]/90 border-t border-[var(--border-light)] flex items-stretch"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        aria-label="Navigasi bawah"
      >
        {bottomPrimary.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 min-h-[56px] relative',
                'text-[9px] font-semibold tracking-wide transition-colors duration-150',
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]',
              ].join(' ')}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-[var(--color-primary)] rounded-b-full"/>
              )}
              <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                {Icons[item.icon]}
              </span>
              <span className="uppercase">{item.label}</span>
            </Link>
          );
        })}

        {/* Tombol Lainnya */}
        <div className="flex-1 relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen(v => !v)}
            className={[
              'w-full flex flex-col items-center justify-center py-2.5 gap-1 min-h-[56px]',
              'text-[9px] font-semibold uppercase tracking-wide transition-colors duration-150',
              moreOpen ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]',
            ].join(' ')}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            aria-label="Menu lainnya"
          >
            {Icons.More}
            <span>Lainnya</span>
          </button>

          {/* Popup sheet */}
          {moreOpen && (
            <div
              className="absolute bottom-full right-0 mb-2 w-60 rounded-2xl border border-[var(--border-light)] overflow-hidden animate-scale-in"
              style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-xl)' }}
              role="menu"
              aria-label="Menu tambahan"
            >
              <div className="p-1.5">
                {menuItems.slice(4).map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={[
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.8125rem] font-medium transition-colors duration-100',
                        isActive
                          ? 'bg-[var(--surface-active)] text-[var(--color-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]',
                      ].join(' ')}
                    >
                      <span className={isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}>
                        {Icons[item.icon]}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              {/* Logout shortcut di mobile */}
              <div className="border-t border-[var(--border-light)] p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.8125rem] font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="text-red-400">{Icons.Logout}</span>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

    </div>
  );
}
