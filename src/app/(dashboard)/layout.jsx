'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await useAuthStore.getState().fetchSession();
      
      const currentState = useAuthStore.getState();
      if (!currentState.user) {
        router.push('/');
      } else {
        setProfile(currentState.profile);
      }
    };
    
    initAuth();
  }, [router]);

  const handleLogout = async () => {
    await useAuthStore.getState().signOut();
    router.push('/');
    router.refresh();
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Input Data', href: '/pengaturan', icon: '⚙️' },
    { name: 'Manajemen Kelas', href: '/manajemen', icon: '🏫' },
    { name: 'Kurikulum', href: '/kurikulum', icon: '📖' },
    { name: 'Modul & Bahan Ajar', href: '/bahan-ajar', icon: '📚' },
    { name: 'Riwayat & Rekap Nilai', href: '/riwayat-rekap', icon: '📊' },
    { name: 'Cetak Rapor', href: '/rapor', icon: '📄' },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memuat data guru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      {/* OVERLAY untuk mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`w-64 bg-white border-r border-[#E2E8F0] flex flex-col fixed h-full transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-[#E2E8F0]">
          <h1 className="text-2xl font-bold text-[#2D5BE3] font-['Plus_Jakarta_Sans']">TeacherAI</h1>
          <p className="text-xs text-[#64748B] mt-1">Panel Wali Kelas</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href 
                  ? 'bg-[#EFF6FF] text-[#2D5BE3]' 
                  : 'text-[#334155] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-[#0F172A] truncate">{profile?.nama || 'Guru'}</p>
            <p className="text-xs text-[#64748B] truncate">{profile?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-lg text-sm font-medium hover:bg-[#FEE2E2] transition-colors"
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* TOPBAR */}
        <header className="bg-white border-b border-[#E2E8F0] h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
              {menuItems.find(m => m.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline text-sm text-[#64748B]">Tahun Ajaran: 2025/2026</span>
            <div className="w-8 h-8 rounded-full bg-[#2D5BE3] text-white flex items-center justify-center font-bold text-sm">
              {profile?.nama?.charAt(0) || 'G'}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
