'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/config/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    schoolName: '',
    nrg: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid.');
      return false;
    }

    // Password length
    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return false;
    }

    // Password strength
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password harus mengandung huruf besar, huruf kecil, dan angka.');
      return false;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.');
      return false;
    }

    // Required fields
    if (!formData.fullName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return false;
    }

    if (!formData.schoolName.trim()) {
      setError('Nama sekolah wajib diisi.');
      return false;
    }

    if (!formData.nrg.trim()) {
      setError('NRG (Nomor Registrasi Guru) wajib diisi.');
      return false;
    }

    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            school_name: formData.schoolName,
            nrg: formData.nrg,
            role: 'teacher'
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signUpError) throw signUpError;

      setSuccess('✅ Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err) {
      console.error('Sign up error:', err);
      if (err.message.includes('User already registered')) {
        setError('Email sudah terdaftar. Silakan login atau gunakan email lain.');
      } else if (err.message.includes('Invalid email')) {
        setError('Format email tidak valid.');
      } else if (err.message.includes('Weak password')) {
        setError('Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D5BE3] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Glass Card */}
      <div className="relative w-full max-w-lg animate-fade-in-up">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/30">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2D5BE3] to-[#7C3AED] rounded-2xl mb-4 shadow-xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">📚</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text font-['Plus_Jakarta_Sans'] mb-2">
              Daftar TeacherAI
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Bergabung dengan sistem rapor digital untuk guru Indonesia
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2 animate-fade-in-up">
              <span className="text-lg">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2 animate-fade-in-up">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="guru@contoh.com"
                required
                disabled={loading || success}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all bg-white/50 hover:bg-white disabled:opacity-50"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Dr. Budi Santoso, S.Pd., M.Pd."
                required
                disabled={loading || success}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all bg-white/50 hover:bg-white disabled:opacity-50"
              />
            </div>

            {/* NRG */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                NRG (Nomor Registrasi Guru) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nrg"
                value={formData.nrg}
                onChange={handleInputChange}
                placeholder="Contoh: 123456789"
                required
                disabled={loading || success}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all bg-white/50 hover:bg-white disabled:opacity-50"
              />
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Sekolah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                placeholder="SMA Negeri 1 Jakarta"
                required
                disabled={loading || success}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all bg-white/50 hover:bg-white disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimal 8 karakter"
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-3.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all bg-white/50 hover:bg-white disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2D5BE3] transition-colors p-1"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  disabled={loading || success}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Minimal 8 karakter, kombinasi huruf besar, kecil, dan angka</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Ulangi password"
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-3.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] focus:border-transparent transition-all bg-white/50 hover:bg-white disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2D5BE3] transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  disabled={loading || success}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white font-semibold py-4 rounded-xl hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 btn-ripple mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses Pendaftaran...
                </>
              ) : success ? (
                '✅ Pendaftaran Berhasil!'
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{' '}
              <Link 
                href="/" 
                className="text-[#2D5BE3] hover:text-[#1E40AF] font-semibold hover:underline transition-colors"
              >
                Login di sini
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
            © 2025 TeacherAI. Dibuat untuk mempermudah guru Indonesia.
          </div>
        </div>
        
        {/* Bottom decoration */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-xs">🔒 Data Anda aman & terenkripsi</p>
        </div>
      </div>
    </div>
  );
}
