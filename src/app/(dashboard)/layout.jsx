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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2D5BE3] to-[#7C3AED] rounded-2xl mb-4 shadow-lg animate-pulse">
            <span className="text-3xl">📚</span>
          </div>
          <p className="text-slate-500 font-medium">Memuat data guru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E0E7FF] flex">
      {/* OVERLAY untuk mobile dengan blur */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - Enhanced Mobile Design */}
      <aside className={`w-72 bg-white/80 backdrop-blur-xl border-r border-white/20 flex flex-col fixed h-full transition-all duration-500 ease-out z-50 shadow-2xl lg:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="relative p-6 border-b border-slate-200/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D5BE3]/5 to-[#7C3AED]/5"></div>
          <div className="relative flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#2D5BE3] to-[#7C3AED] rounded-xl shadow-lg shadow-blue-500/30">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text font-['Plus_Jakarta_Sans']">TeacherAI</h1>
              <p className="text-xs text-slate-500 font-medium">Panel Wali Kelas</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                pathname === item.href 
                  ? 'bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
                  : 'text-slate-600 hover:bg-white hover:shadow-md hover:scale-[1.02]'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
              {pathname === item.href && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-200/50 bg-gradient-to-t from-slate-50/50 to-transparent">
          <div className="mb-3 p-3 bg-white/60 rounded-xl border border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5BE3] to-[#7C3AED] text-white flex items-center justify-center font-bold shadow-md">
                {profile?.nama?.charAt(0) || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{profile?.nama || 'Guru'}</p>
                <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl text-sm font-semibold hover:from-red-100 hover:to-red-200 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <span className="text-lg">🚪</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 min-h-screen pb-20 lg:pb-0">
        {/* TOPBAR - Enhanced Mobile Design */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Menu Button - Enhanced */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden relative p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 touch-target"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              
              {/* Page Title */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <span className="text-base">{menuItems.find(m => m.href === pathname)?.icon}</span>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 mobile-h2">
                    {menuItems.find(m => m.href === pathname)?.name || 'Dashboard'}
                  </h2>
                  <p className="text-xs text-slate-500 hidden sm:block">Kelola data kelas dengan mudah</p>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  📅 2025/2026
                </span>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#2D5BE3] to-[#7C3AED] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 ring-2 ring-white">
                {profile?.nama?.charAt(0) || 'G'}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT - Optimized for Mobile */}
        <div className="p-3 sm:p-6 lg:p-8 animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION - App-like Experience */}
      <nav className="mobile-bottom-nav safe-area-bottom">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
