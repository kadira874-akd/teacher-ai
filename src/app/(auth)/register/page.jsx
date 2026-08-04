'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { nama } }
    });

    if (error) {
      setError(error.message);
    } else {
      // Insert ke tabel guru
      await supabase.from('guru').insert({
        id: data.user.id,
        email: email,
        nama: nama
      });
      
      alert('Registrasi berhasil! Silakan cek email Anda untuk verifikasi, lalu login.');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-[#E2E8F0]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2D5BE3] font-['Plus_Jakarta_Sans']">TeacherAI</h1>
          <p className="text-[#64748B] mt-2">Daftar akun guru baru</p>
        </div>

        <form onSubmit={handleRegister}>
          <Input 
            label="Nama Lengkap" 
            value={nama} 
            onChange={(e) => setNama(e.target.value)} 
            placeholder="Budi Santoso, S.Pd."
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="guru@sekolah.sch.id"
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Minimal 6 karakter"
            required 
          />

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#DC2626] rounded-lg text-[#DC2626] text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#64748B] mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[#2D5BE3] font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}