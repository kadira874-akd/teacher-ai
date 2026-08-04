'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function MapelPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapelList, setMapelList] = useState([]);
  const [newMapelName, setNewMapelName] = useState('');

  // 1. Inisialisasi
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase
          .from('kelas')
          .select('id')
          .eq('guru_id', profile.id)
          .limit(1);

        if (kelasData && kelasData.length > 0) {
          setKelasId(kelasData[0].id);
          await fetchMapel(kelasData[0].id);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // 2. Ambil daftar mapel
  const fetchMapel = async (currentKelasId) => {
    const { data } = await supabase
      .from('mapel')
      .select('*')
      .eq('kelas_id', currentKelasId)
      .order('urutan', { ascending: true });
    
    setMapelList(data || []);
  };

  // 3. Tambah mapel baru
  const handleAddMapel = async () => {
    if (!newMapelName.trim()) {
      alert('Nama mata pelajaran tidak boleh kosong!');
      return;
    }

    setSaving(true);
    const urutanBaru = mapelList.length > 0 ? Math.max(...mapelList.map(m => m.urutan)) + 1 : 1;

    const { error } = await supabase
      .from('mapel')
      .insert({
        kelas_id: kelasId,
        nama: newMapelName.trim(),
        urutan: urutanBaru
      });

    if (error) {
      alert('Gagal menambah mapel: ' + error.message);
    } else {
      setNewMapelName('');
      await fetchMapel(kelasId);
    }
    setSaving(false);
  };

  // 4. Hapus mapel
  const handleDeleteMapel = async (mapelId) => {
    if (!confirm('Yakin ingin menghapus mapel ini? Data nilai terkait juga akan terhapus.')) {
      return;
    }

    const { error } = await supabase
      .from('mapel')
      .delete()
      .eq('id', mapelId);

    if (error) {
      alert('Gagal menghapus mapel: ' + error.message);
    } else {
      await fetchMapel(kelasId);
    }
  };

  // 5. Quick add mapel umum SD
  const handleQuickAdd = async (namaMapel) => {
    const urutanBaru = mapelList.length > 0 ? Math.max(...mapelList.map(m => m.urutan)) + 1 : 1;
    
    const { error } = await supabase
      .from('mapel')
      .insert({
        kelas_id: kelasId,
        nama: namaMapel,
        urutan: urutanBaru
      });

    if (!error) {
      await fetchMapel(kelasId);
    }
  };

  if (loading || !profile || !kelasId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memuat data mata pelajaran...</p>
        </div>
      </div>
    );
  }

  // Mapel umum SD/SMP untuk quick add
  const mapelUmum = [
    'IPAS', 'Bahasa Indonesia', 'Bahasa Inggris', 'Matematika', 
    'PJOK', 'Seni Budaya', 'Pendidikan Agama', 'Pendidikan Pancasila',
    'Informatika', 'Bahasa Daerah'
  ];

  const existingMapelNames = mapelList.map(m => m.nama);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans']">Manajemen Mata Pelajaran</h1>
        <p className="text-[#64748B] mt-1">Kelola daftar mata pelajaran yang akan dinilai di kelas Anda.</p>
      </div>

      {/* FORM TAMBAH MAPEL BARU */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Tambah Mata Pelajaran Baru</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newMapelName}
            onChange={(e) => setNewMapelName(e.target.value)}
            placeholder="Contoh: IPAS, Bahasa Indonesia, dll"
            className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
          />
          <Button onClick={handleAddMapel} disabled={saving}>
            {saving ? 'Menambah...' : '+ Tambah'}
          </Button>
        </div>
      </div>

      {/* QUICK ADD MAPEL UMUM */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Tambah Cepat (Klik untuk Menambah)</h3>
        <div className="flex flex-wrap gap-2">
          {mapelUmum.map((nama) => {
            const sudahAda = existingMapelNames.includes(nama);
            return (
              <button
                key={nama}
                onClick={() => !sudahAda && handleQuickAdd(nama)}
                disabled={sudahAda}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sudahAda
                    ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                    : 'bg-[#EFF6FF] text-[#2D5BE3] hover:bg-[#DBEAFE]'
                }`}
              >
                {sudahAda ? '✓ ' : '+ '}{nama}
              </button>
            );
          })}
        </div>
      </div>

      {/* DAFTAR MAPEL YANG SUDAH ADA */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide">
            Daftar Mata Pelajaran ({mapelList.length})
          </h3>
        </div>

        {mapelList.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📚</p>
            <h3 className="text-lg font-semibold text-[#0F172A]">Belum ada mata pelajaran</h3>
            <p className="text-[#64748B] mt-2">Gunakan form di atas atau tombol "Tambah Cepat" untuk menambah mata pelajaran.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {mapelList.map((mapel, index) => (
              <div key={mapel.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#64748B] w-8">{index + 1}.</span>
                  <span className="font-medium text-[#0F172A]">{mapel.nama}</span>
                </div>
                <button
                  onClick={() => handleDeleteMapel(mapel.id)}
                  className="px-3 py-1.5 text-sm text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                >
                  🗑️ Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INFO BOX */}
      <div className="bg-[#EFF6FF] border-l-4 border-[#0369A1] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#0369A1] mb-1">💡 Informasi:</p>
        <p className="text-sm text-[#334155]">Mata pelajaran yang Anda tambahkan di sini akan muncul di dropdown "Input Nilai". Anda bisa menambah, menghapus, atau mengurutkan mapel sesuai kebutuhan kelas Anda.</p>
      </div>
    </div>
  );
}