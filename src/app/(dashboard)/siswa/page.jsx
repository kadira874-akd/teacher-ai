'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import TambahSiswaModal from '@/features/siswa/TambahSiswaModal';

export default function SiswaPage() {
  const { profile, fetchSession } = useAuthStore();
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kelasId, setKelasId] = useState('');

  // 1. PAKSA cek login jika profil masih null (Tanpa syarat authLoading)
  useEffect(() => {
    const ensureAuth = async () => {
      if (!profile) {
        console.log('🔄 Profil masih null, memaksa pengambilan sesi login...');
        await fetchSession();
      }
    };
    ensureAuth();
  }, [profile, fetchSession]);

  // 2. Setelah profil ADA, baru ambil data Kelas dan Siswa
  useEffect(() => {
    const fetchData = async () => {
      if (profile?.id) {
        console.log('✅ Profil siap:', profile.nama);
        setLoading(true);

        // A. Ambil ID Kelas
        const { data: kelasData, error: kelasError } = await supabase
          .from('kelas')
          .select('id')
          .eq('guru_id', profile.id)
          .limit(1);

        if (kelasError) console.error('❌ Error kelas:', kelasError);

        if (kelasData && kelasData.length > 0) {
          const currentKelasId = kelasData[0].id;
          setKelasId(currentKelasId);
          console.log('✅ Kelas ditemukan, ID:', currentKelasId);

          // B. Ambil Data Siswa berdasarkan ID Kelas tersebut
          const { data: siswaData, error: siswaError } = await supabase
            .from('siswa')
            .select('*')
            .eq('kelas_id', currentKelasId)
            .order('nama', { ascending: true });

          if (siswaError) console.error('❌ Error siswa:', siswaError);
          
          setSiswaList(siswaData || []);
        } else {
          console.warn('⚠️ Guru belum memiliki data kelas.');
        }
        
        setLoading(false);
      }
    };

    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  // 3. Tampilan Loading jika profil belum ada
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memverifikasi login Anda...</p>
        </div>
      </div>
    );
  }

  // 4. Tampilan jika kelas benar-benar tidak ada
  if (!kelasId && !loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-4xl mb-3">🏫</p>
          <h3 className="text-lg font-semibold text-[#0F172A]">Kelas Belum Ditemukan</h3>
          <p className="text-[#64748B]">Silakan hubungi administrator untuk pengaturan kelas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans']">Data Siswa</h1>
          <p className="text-[#64748B] mt-1">Kelola data identitas siswa untuk kebutuhan rapor.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          + Tambah Siswa
        </Button>
      </div>

      {/* TABEL DATA SISWA */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Memuat data siswa...</div>
        ) : siswaList.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">👨‍🎓</p>
            <h3 className="text-lg font-semibold text-[#0F172A]">Belum ada data siswa</h3>
            <p className="text-[#64748B] mb-4">Mulai dengan menambahkan data siswa pertama Anda.</p>
            <Button onClick={() => setIsModalOpen(true)}>Tambah Siswa Pertama</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#334155]">No</th>
                  <th className="px-6 py-4 font-semibold text-[#334155]">Nama Lengkap</th>
                  <th className="px-6 py-4 font-semibold text-[#334155]">NISN</th>
                  <th className="px-6 py-4 font-semibold text-[#334155]">L/P</th>
                  <th className="px-6 py-4 font-semibold text-[#334155]">Nama Orang Tua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {siswaList.map((siswa, index) => (
                  <tr key={siswa.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 text-[#64748B]">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-[#0F172A]">{siswa.nama}</td>
                    <td className="px-6 py-4 text-[#64748B]">{siswa.nisn || '-'}</td>
                    <td className="px-6 py-4 text-[#64748B]">{siswa.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                    <td className="px-6 py-4 text-[#64748B]">{siswa.nama_ayah} & {siswa.nama_ibu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH SISWA */}
      <TambahSiswaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={async () => {
          setLoading(true);
          const { data } = await supabase
            .from('siswa')
            .select('*')
            .eq('kelas_id', kelasId)
            .order('nama', { ascending: true });
          setSiswaList(data || []);
          setLoading(false);
        }}
        kelasId={kelasId} 
      />
    </div>
  );
}