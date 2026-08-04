'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase akan otomatis handle token dari URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          // Redirect ke halaman reset password dengan token
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get('token') || urlParams.get('access_token');
          
          if (token) {
            router.push(`/reset-password?token=${token}`);
          } else {
            router.push('/reset-password');
          }
        } else {
          throw new Error('Sesi tidak valid');
        }
      } catch (err) {
        setError('Gagal memproses link. Silakan minta link reset password baru.');
        setTimeout(() => {
          router.push('/forgot-password');
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D5BE3] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FEF2F2] rounded-2xl mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] mb-2">Terjadi Kesalahan</h1>
          <p className="text-[#64748B] mb-4">{error}</p>
          <p className="text-sm text-[#64748B]">Mengarahkan ke halaman reset password...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D5BE3] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5BE3] mb-4"></div>
        <h1 className="text-xl font-bold text-[#0F172A] mb-2">Memproses Link...</h1>
        <p className="text-[#64748B]">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}