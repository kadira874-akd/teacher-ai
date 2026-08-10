'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/config/supabase';

// Icon helper — SVG-based, no emoji
const EyeIcon = ({ open }) => open ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const SpinIcon = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError('Email atau password tidak valid. Periksa kembali data Anda.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Cek inbox dan spam Anda.');
      } else {
        setError('Terjadi kesalahan sistem. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT — Brand Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #312E81 0%, #4338CA 45%, #6D28D9 100%)' }}>

        {/* Geometric decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)' }}/>
          <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full"
            style={{ background: 'rgba(139,92,246,0.15)' }}/>
          <div className="absolute -bottom-20 left-20 w-72 h-72 rounded-full"
            style={{ background: 'rgba(255,255,255,0.03)' }}/>
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">TeacherAI</p>
              <p className="text-white/50 text-xs mt-0.5">Panel Wali Kelas</p>
            </div>
          </div>

          {/* Center copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/15 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              <span className="text-white/70 text-xs font-medium">Sistem Rapor Digital Indonesia</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Kelola kelas<br/>
              <span style={{ color: '#A5B4FC' }}>lebih cerdas.</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-sm">
              Absensi QR, penilaian otomatis, dan cetak rapor dalam satu platform terintegrasi.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-8">
              {['Absensi QR Code', 'Rapor Otomatis', 'Kurikulum Merdeka', 'Manajemen Siswa'].map(f => (
                <span key={f} className="text-xs font-medium text-white/70 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer quote */}
          <p className="text-white/35 text-sm">
            "Teknologi terbaik untuk guru Indonesia."
          </p>
        </div>
      </div>

      {/* ── RIGHT — Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[var(--surface-page)]">
        <div className="w-full max-w-[400px] animate-fade-in-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #4338CA, #6D28D9)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)]">TeacherAI</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
              Selamat datang
            </h2>
            <p className="text-[var(--text-muted)] text-sm">
              Masuk untuk mengelola kelas dan siswa Anda.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl mb-6 animate-fade-in"
              style={{ background: 'var(--color-danger-bg)', border: '1px solid #FECACA' }}>
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-danger)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
                required
                autoComplete="email"
                className="form-input"
                style={{ minHeight: '48px' }}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password"
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="form-input pr-12"
                  style={{ minHeight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  <EyeIcon open={showPassword}/>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-xl"
              style={{ minHeight: '52px', marginTop: '0.25rem' }}
            >
              {loading ? (
                <><SpinIcon/> Memverifikasi…</>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Divider + signup */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border-light)]"/>
            <span className="text-xs text-[var(--text-muted)]">atau</span>
            <div className="flex-1 h-px bg-[var(--border-light)]"/>
          </div>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Belum punya akun?{' '}
            <Link href="/signup" className="font-semibold text-[var(--color-primary)] hover:underline">
              Daftar gratis
            </Link>
          </p>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span className="text-xs text-[var(--text-muted)]">Koneksi terenkripsi SSL · Data aman Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
