'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SetupSekolahPage() {
  const { profile, fetchSession } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sekolahId, setSekolahId] = useState('');
  
  const [formData, setFormData] = useState({
    nama: '',
    npsn: '',
    alamat: '',
    jenjang: 'SD',
    akreditasi: 'A',
    kepala_sekolah_nama: '',
    kepala_sekolah_nip: '',
  });

  // 1. Inisialisasi & Load data sekolah jika ada
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      
      if (profile?.id) {
        setLoading(true);
        
        // Cek apakah guru sudah punya sekolah
        if (profile.sekolah_id) {
          setSekolahId(profile.sekolah_id);
          
          // Ambil data sekolah
          const { data } = await supabase
            .from('sekolah')
            .select('*')
            .eq('id', profile.sekolah_id)
            .single();
          
          if (data) {
            setFormData({
              nama: data.nama || '',
              npsn: data.npsn || '',
              alamat: data.alamat || '',
              jenjang: data.jenjang || 'SD',
              akreditasi: data.akreditasi || 'A',
              kepala_sekolah_nama: data.kepala_sekolah_nama || '',
              kepala_sekolah_nip: data.kepala_sekolah_nip || '',
            });
          }
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // 2. Handle perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Simpan data sekolah
  const handleSave = async () => {
    if (!formData.nama || !formData.alamat) {
      alert('Nama sekolah dan alamat wajib diisi!');
      return;
    }

    setSaving(true);

    try {
      let currentSekolahId = sekolahId;

      // Jika belum ada sekolah, buat baru
      if (!currentSekolahId) {
        const { data: newSekolah, error } = await supabase
          .from('sekolah')
          .insert(formData)
          .select('id')
          .single();

        if (error) throw error;
        currentSekolahId = newSekolah.id;
        setSekolahId(currentSekolahId);

        // Update profil guru dengan sekolah_id
        await supabase
          .from('guru')
          .update({ sekolah_id: currentSekolahId })
          .eq('id', profile.id);
      } else {
        // Update sekolah yang sudah ada
        const { error } = await supabase
          .from('sekolah')
          .update(formData)
          .eq('id', currentSekolahId);

        if (error) throw error;
      }

      alert('✅ Data sekolah berhasil disimpan!');
      
      // Refresh profile di store untuk mendapatkan sekolah_id yang baru
      console.log('🔄 Refreshing profile setelah setup sekolah...');
      await fetchSession();
      console.log('✅ Profile refreshed');
    } catch (error) {
      alert('Gagal menyimpan: ' + error.message);
    }

    setSaving(false);
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memuat data sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans']">Setup Sekolah</h1>
          <p className="text-[#64748B] mt-1">Isi data sekolah Anda untuk ditampilkan di rapor.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="md:w-auto w-full">
          {saving ? 'Menyimpan...' : '💾 Simpan Data Sekolah'}
        </Button>
      </div>

      {/* INFO BOX */}
      {!sekolahId && (
        <div className="bg-[#FEF3C7] border-l-4 border-[#D97706] p-4 rounded-r-lg">
          <p className="text-sm font-semibold text-[#D97706]">⚠️ Perhatian:</p>
          <p className="text-sm text-[#92400E]">Anda belum mengatur data sekolah. Data sekolah akan muncul di header rapor. Silakan isi form di bawah ini.</p>
        </div>
      )}

      {/* FORM SETUP SEKOLAH */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">Informasi Sekolah</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Sekolah */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#334155] mb-1.5">
              Nama Sekolah <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: SDN 01 Jakarta"
              required
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A] placeholder-[#64748B]"
            />
          </div>

          {/* NPSN */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">NPSN</label>
            <input
              type="text"
              name="npsn"
              value={formData.npsn}
              onChange={handleChange}
              placeholder="Contoh: 20123456"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A] placeholder-[#64748B]"
            />
          </div>

          {/* Jenjang */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Jenjang</label>
            <select
              name="jenjang"
              value={formData.jenjang}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
            >
              <option value="SD">SD (Sekolah Dasar)</option>
              <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
              <option value="SMA">SMA (Sekolah Menengah Atas)</option>
              <option value="MI">MI (Madrasah Ibtidaiyah)</option>
              <option value="MTs">MTs (Madrasah Tsanawiyah)</option>
              <option value="MA">MA (Madrasah Aliyah)</option>
            </select>
          </div>

          {/* Akreditasi */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Akreditasi</label>
            <select
              name="akreditasi"
              value={formData.akreditasi}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
            >
              <option value="A">A (Unggul)</option>
              <option value="B">B (Baik)</option>
              <option value="C">C (Cukup)</option>
              <option value="Belum">Belum Terakreditasi</option>
            </select>
          </div>

          {/* Alamat */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#334155] mb-1.5">
              Alamat Lengkap <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows="3"
              placeholder="Contoh: Jl. Merdeka No. 1, Kelurahan X, Kecamatan Y, Kota Z"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A] placeholder-[#64748B]"
            />
          </div>
        </div>
      </div>

      {/* DATA KEPALA SEKOLAH */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">Kepala Sekolah</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Kepala Sekolah */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Nama Kepala Sekolah</label>
            <input
              type="text"
              name="kepala_sekolah_nama"
              value={formData.kepala_sekolah_nama}
              onChange={handleChange}
              placeholder="Contoh: Dr. Budi Santoso, M.Pd."
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A] placeholder-[#64748B]"
            />
          </div>

          {/* NIP Kepala Sekolah */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">NIP Kepala Sekolah</label>
            <input
              type="text"
              name="kepala_sekolah_nip"
              value={formData.kepala_sekolah_nip}
              onChange={handleChange}
              placeholder="Contoh: 196501011990031001"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A] placeholder-[#64748B]"
            />
          </div>
        </div>
      </div>

      {/* INFO TAMBAHAN */}
      <div className="bg-[#EFF6FF] border-l-4 border-[#0369A1] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#0369A1] mb-1">💡 Informasi:</p>
        <p className="text-sm text-[#334155]">Data sekolah ini akan muncul di header rapor PDF yang Anda cetak. Pastikan data sudah benar sebelum mencetak rapor.</p>
      </div>
    </div>
  );
}