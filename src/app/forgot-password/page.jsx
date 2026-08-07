'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/config/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // PENTING: redirectTo harus mengarah ke /reset-password (bukan /auth/callback)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    setSuccess(true);
  } catch (err) {
    if (err.message.includes('User not found')) {
      setError('Email tidak ditemukan. Silakan periksa kembali.');
    } else {
      setError('Gagal mengirim email. Silakan coba lagi.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D5BE3] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#EF4444] rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans'] mb-2">
            Lupa Password?
          </h1>
          <p className="text-[#64748B] text-sm">
            Jangan khawatir, kami akan mengirim link reset password ke email Anda.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="space-y-6">
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-4 py-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold mb-1">Email Berhasil Dikirim!</p>
                  <p className="text-sm">
                    Silakan cek inbox email Anda di <strong>{email}</strong>. 
                    Klik link di email untuk membuat password baru.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] px-4 py-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Cek folder Spam/Junk jika email tidak muncul</li>
                <li>Link berlaku selama 1 jam</li>
                <li>Jika tidak menerima email, coba kirim ulang</li>
              </ul>
            </div>

            <Link href="/">
              <button className="w-full bg-[#2D5BE3] text-white font-semibold py-3 rounded-lg hover:bg-[#1E40AF] transition-colors">
                ← Kembali ke Login
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
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">
                  Email Akun Anda
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guru@sekolah.sch.id"
                  required
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all"
                />
                <p className="text-xs text-[#64748B] mt-2">
                  Masukkan email yang terdaftar di TeacherAI
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengirim Email...
                  </>
                ) : (
                  '📧 Kirim Link Reset Password'
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-[#2D5BE3] hover:text-[#1E40AF] font-medium hover:underline">
                ← Kembali ke halaman login
              </Link>
            </div>
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