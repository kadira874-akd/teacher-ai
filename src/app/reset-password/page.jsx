'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

    useEffect(() => {
    // Cek apakah ada token dari URL (dari link email)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || urlParams.get('access_token') || urlParams.get('code');
    
    if (!token) {
        // Jika tidak ada token, cek apakah ada hash fragment (Supabase kadang pakai ini)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashToken = hashParams.get('access_token');
        
        if (hashToken) {
        // Redirect ke URL dengan token di query parameter
        window.location.href = `/reset-password?token=${hashToken}`;
        } else {
        setTokenValid(false);
        setError('Link reset password tidak valid atau sudah kedaluwarsa.');
        }
    }
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi password
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      if (err.message.includes('same password')) {
        setError('Password baru tidak boleh sama dengan password lama.');
      } else if (err.message.includes('token')) {
        setError('Link reset password sudah kedaluwarsa. Silakan minta link baru.');
        setTokenValid(false);
      } else {
        setError('Gagal mengubah password. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D5BE3] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FEF2F2] rounded-2xl mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Link Tidak Valid</h1>
          <p className="text-[#64748B] mb-6">{error || 'Link reset password tidak valid atau sudah kedaluwarsa.'}</p>
          <Link href="/forgot-password">
            <button className="w-full bg-[#2D5BE3] text-white font-semibold py-3 rounded-lg hover:bg-[#1E40AF] transition-colors">
              Minta Link Baru
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D5BE3] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans'] mb-2">
            Buat Password Baru
          </h1>
          <p className="text-[#64748B] text-sm">
            Masukkan password baru yang kuat dan mudah diingat.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="space-y-6">
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-4 py-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-semibold mb-1">Password Berhasil Diubah!</p>
                  <p className="text-sm">
                    Anda akan diarahkan ke halaman login dalam beberapa detik...
                  </p>
                </div>
              </div>
            </div>

            <Link href="/">
              <button className="w-full bg-[#2D5BE3] text-white font-semibold py-3 rounded-lg hover:bg-[#1E40AF] transition-colors">
                Login Sekarang
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] px-4 py-3 rounded-lg text-sm mb-6 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password Baru */}
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full px-4 py-3 pr-12 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#2D5BE3] transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password di atas"
                  required
                  className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all"
                />
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${password.length >= 6 ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}></div>
                    <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}></div>
                    <div className={`h-1 flex-1 rounded ${password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}></div>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {password.length < 6 && '⚠️ Minimal 6 karakter'}
                    {password.length >= 6 && password.length < 8 && '🟡 Cukup kuat'}
                    {password.length >= 8 && password.length < 10 && '🟢 Kuat'}
                    {password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && '🟢 Sangat kuat'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  '🔐 Simpan Password Baru'
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center text-xs text-[#94A3B8]">
          © 2025 TeacherAI
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#2D5BE3] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}