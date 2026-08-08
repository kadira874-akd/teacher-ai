'use client';
import { useState } from 'react';
import { supabase } from '@/config/supabase';
import Button from '@/components/ui/Button';

export default function TambahSiswaModal({ isOpen, onClose, onSuccess, kelasId }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '', nisn: '', nis: '', tempat_lahir: '', tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki', agama: 'Islam', alamat: '', no_telepon: '',
    nama_ayah: '', nama_ibu: '', pekerjaan_ayah: '', pekerjaan_ibu: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!kelasId) {
      alert('Error: ID Kelas tidak ditemukan. Silakan refresh halaman.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('siswa').insert({
      kelas_id: kelasId,
      ...formData
    });

    if (error) {
      console.error('Error simpan siswa:', error);
      alert('Gagal menambahkan siswa: ' + error.message);
    } else {
      alert('Siswa berhasil ditambahkan!');
      // Reset form
      setFormData({
        nama: '', nisn: '', nis: '', tempat_lahir: '', tanggal_lahir: '',
        jenis_kelamin: 'Laki-laki', agama: 'Islam', alamat: '', no_telepon: '',
        nama_ayah: '', nama_ibu: '', pekerjaan_ayah: '', pekerjaan_ibu: ''
      });
      onSuccess(); // Refresh tabel di halaman utama
      onClose();   // Tutup modal
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Tambah Data Siswa Baru</h2>
            <p className="text-sm text-[#059669] mt-1 font-medium">✅ Kelas siap digunakan</p>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#DC2626] text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><h3 className="text-sm font-bold text-[#2D5BE3] mb-2 uppercase tracking-wide">Identitas Siswa</h3></div>
          
          <InputField label="Nama Lengkap" name="nama" value={formData.nama} onChange={handleChange} required />
          <InputField label="NISN" name="nisn" value={formData.nisn} onChange={handleChange} required />
          <InputField label="NIS (Lokal)" name="nis" value={formData.nis} onChange={handleChange} />
          <InputField label="Tempat Lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} required />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Tanggal Lahir <span className="text-[#DC2626]">*</span></label>
            <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} required className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] mobile-input-high-contrast min-h-[48px]" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Jenis Kelamin <span className="text-[#DC2626]">*</span></label>
            <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] mobile-input-high-contrast min-h-[48px]">
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
          </div>

          <InputField label="Agama" name="agama" value={formData.agama} onChange={handleChange} />
          <InputField label="No. Telepon / HP" name="no_telepon" value={formData.no_telepon} onChange={handleChange} />
          
          <div className="md:col-span-2 mb-4">
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Alamat Lengkap</label>
            <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="2" className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] mobile-input-high-contrast min-h-[48px]"></textarea>
          </div>

          <div className="md:col-span-2 mt-4"><h3 className="text-sm font-bold text-[#2D5BE3] mb-2 uppercase tracking-wide">Data Orang Tua</h3></div>
          
          <InputField label="Nama Ayah Kandung" name="nama_ayah" value={formData.nama_ayah} onChange={handleChange} required />
          <InputField label="Pekerjaan Ayah" name="pekerjaan_ayah" value={formData.pekerjaan_ayah} onChange={handleChange} />
          <InputField label="Nama Ibu Kandung" name="nama_ibu" value={formData.nama_ibu} onChange={handleChange} required />
          <InputField label="Pekerjaan Ibu" name="pekerjaan_ibu" value={formData.pekerjaan_ibu} onChange={handleChange} />

          <div className="md:col-span-2 mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} type="button">Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Data Siswa'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, required = false, type = 'text' }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#334155] mb-1.5">
        {label} {required && <span className="text-[#DC2626]">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A] mobile-input-high-contrast min-h-[48px]"
      />
    </div>
  );
}