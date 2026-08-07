'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getFaseByKelas, getFaseLabel } from '@/data/curriculumDatabase';
import Button from '@/components/ui/Button';
import * as XLSX from 'xlsx';

const InputField = ({ label, value, onChange, type = 'text', placeholder = '', required = false, options = [], rows }) => (
  <div>
    <label className="block text-sm font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
      {label} {required && <span className="text-[#DC2626]">*</span>}
    </label>
    {options.length > 0 ? (
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm text-[#0F172A] dark:text-[#F1F5F9]">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : rows ? (
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8]" />
    ) : (
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#94A3B8]" />
    )}
  </div>
);

export default function PengaturanPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [kelasNama, setKelasNama] = useState('');
  const [faseKelas, setFaseKelas] = useState('faseB');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sekolah');

  // ===== STATE: SEKOLAH =====
  const [sekolahData, setSekolahData] = useState({
    nama: '', npsn: '', alamat: '', jenjang: 'SD', akreditasi: 'A',
    kepala_sekolah_nama: '', kepala_sekolah_nip: '', telepon: '', email: '', 
    website: '', kode_pos: '', kecamatan: '', kabupaten: '', provinsi: '', visi: '', misi: ''
  });
  const [sekolahId, setSekolahId] = useState('');

  // ===== STATE: GURU =====
  const [guruData, setGuruData] = useState({
    nama: '', email: '', nip: '', tempat_lahir: '', tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki', pendidikan_terakhir: '', no_telepon: '', alamat: ''
  });

  // ===== STATE: TAHUN AJARAN =====
  const [tahunAjaran, setTahunAjaran] = useState({
    nama_tahun: '2025/2026', semester_aktif: 'Ganjil',
    tanggal_mulai: '', tanggal_selesai: '', tanggal_rapor: '', kota_penetapan: ''
  });
  const [tahunAjaranId, setTahunAjaranId] = useState('');

  // ===== STATE: SISWA =====
  const [siswaList, setSiswaList] = useState([]);
  const [showAddSiswa, setShowAddSiswa] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [newSiswa, setNewSiswa] = useState({
    nama: '', nisn: '', nis: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', 
    agama: 'Islam', golongan_darah: '', alamat: '', no_telepon: '', tinggi_badan: '', berat_badan: '',
    anak_ke: '', jumlah_saudara: '', nama_ayah: '', pendidikan_ayah: '', pekerjaan_ayah: '', penghasilan_ayah: '',
    nama_ibu: '', pendidikan_ibu: '', pekerjaan_ibu: '', penghasilan_ibu: '', alamat_ortu: '', no_telepon_ortu: '',
    nama_wali: '', pekerjaan_wali: '', alamat_wali: ''
  });

  // ===== STATE: MAPEL & JADWAL =====
  const [mapelList, setMapelList] = useState([]);
  const [newMapelName, setNewMapelName] = useState('');
  const [jadwalData, setJadwalData] = useState([]);
  const [showAddJadwal, setShowAddJadwal] = useState(false);
  const [newJadwal, setNewJadwal] = useState({ mapel_id: '', hari: 'Senin', jam_mulai: '07:00', jam_selesai: '08:00' });

  // ===== HELPER: DETEKSI FASE =====
  const detectFaseFromNama = (namaKelas) => {
    if (!namaKelas) return 'faseB';
    const match = namaKelas.match(/\d+/);
    const angkaKelas = match ? match[0] : '3'; 
    return getFaseByKelas(angkaKelas);
  };

  // ===== INISIALISASI =====
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData } = await supabase.from('kelas').select('id, nama_kelas, fase').eq('guru_id', profile.id).limit(1);
        if (kelasData && kelasData.length > 0) {
          const k = kelasData[0];
          setKelasId(k.id);
          setKelasNama(k.nama_kelas || '');
          setFaseKelas(k.fase || detectFaseFromNama(k.nama_kelas)); 

          setGuruData({
            nama: profile.nama || '', email: profile.email || '', nip: profile.nip || '', 
            tempat_lahir: profile.tempat_lahir || '', tanggal_lahir: profile.tanggal_lahir || '', 
            jenis_kelamin: profile.jenis_kelamin || 'Laki-laki', pendidikan_terakhir: profile.pendidikan_terakhir || '', 
            no_telepon: profile.no_telepon || '', alamat: profile.alamat || ''
          });

          if (profile.sekolah_id) {
            const { data: sekolah } = await supabase.from('sekolah').select('*').eq('id', profile.sekolah_id).single();
            if (sekolah) {
              setSekolahId(sekolah.id);
              setSekolahData({
                nama: sekolah.nama || '', npsn: sekolah.npsn || '', alamat: sekolah.alamat || '',
                jenjang: sekolah.jenjang || 'SD', akreditasi: sekolah.akreditasi || 'A',
                kepala_sekolah_nama: sekolah.kepala_sekolah_nama || '', kepala_sekolah_nip: sekolah.kepala_sekolah_nip || '',
                telepon: sekolah.telepon || '', email: sekolah.email || '', website: sekolah.website || '',
                kode_pos: sekolah.kode_pos || '', kecamatan: sekolah.kecamatan || '', kabupaten: sekolah.kabupaten || '', 
                provinsi: sekolah.provinsi || '', visi: sekolah.visi || '', misi: sekolah.misi || ''
              });
            }
          }

          const { data: ta } = await supabase.from('tahun_ajaran').select('*').eq('kelas_id', k.id).single();
          if (ta) {
            setTahunAjaranId(ta.id);
            setTahunAjaran({
              nama_tahun: ta.nama_tahun || '2025/2026', semester_aktif: ta.semester_aktif || 'Ganjil',
              tanggal_mulai: ta.tanggal_mulai || '', tanggal_selesai: ta.tanggal_selesai || '',
              tanggal_rapor: ta.tanggal_rapor || '', kota_penetapan: ta.kota_penetapan || ''
            });
          }

          const { data: siswa } = await supabase.from('siswa').select('*').eq('kelas_id', k.id).order('nama');
          setSiswaList(siswa || []);

          const { data: mapel } = await supabase.from('mapel').select('*').eq('kelas_id', k.id).order('urutan');
          setMapelList(mapel || []);

          const { data: jadwal } = await supabase.from('jadwal_mapel').select('*, mapel:mapel_id(nama)').eq('kelas_id', k.id).order('hari').order('jam_mulai');
          setJadwalData(jadwal || []);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // ===== HANDLERS =====
  const handleSaveSekolah = async () => {
    if (!sekolahData.nama || !sekolahData.alamat) { alert('Nama dan alamat sekolah wajib diisi!'); return; }
    try {
      if (!sekolahId) {
        const { data, error } = await supabase.from('sekolah').insert(sekolahData).select('id').single();
        if (error) throw error;
        setSekolahId(data.id);
        await supabase.from('guru').update({ sekolah_id: data.id }).eq('id', profile.id);
      } else {
        await supabase.from('sekolah').update(sekolahData).eq('id', sekolahId);
      }
      alert('✅ Data sekolah berhasil disimpan!');
      await fetchSession();
    } catch (e) { alert('Gagal: ' + e.message); }
  };

  const handleSaveGuru = async () => {
    const { error } = await supabase.from('guru').update(guruData).eq('id', profile.id);
    if (error) alert('Gagal: ' + error.message);
    else { alert('✅ Data guru berhasil disimpan!'); await fetchSession(); }
  };

  const handleSaveNamaKelas = async () => {
    if (!kelasNama.trim()) { alert('Nama kelas tidak boleh kosong!'); return; }
    const newFase = detectFaseFromNama(kelasNama);
    setFaseKelas(newFase);
    const { error } = await supabase.from('kelas').update({ nama_kelas: kelasNama.trim(), fase: newFase }).eq('id', kelasId);
    if (error) alert('Gagal menyimpan: ' + error.message);
    else {
      alert(`✅ Nama kelas diperbarui! Fase otomatis diset ke: ${getFaseLabel(newFase)}`);
      await fetchSession();
    }
  };

  const handleSaveTahunAjaran = async () => {
    const payload = { kelas_id: kelasId, ...tahunAjaran };
    if (tahunAjaranId) {
      const { error } = await supabase.from('tahun_ajaran').update(payload).eq('id', tahunAjaranId);
      if (error) alert('Gagal: ' + error.message);
      else alert('✅ Tahun ajaran disimpan!');
    } else {
      const { data, error } = await supabase.from('tahun_ajaran').insert(payload).select('id').single();
      if (error) alert('Gagal: ' + error.message);
      else { setTahunAjaranId(data.id); alert('✅ Tahun ajaran disimpan!'); }
    }
  };

  const resetSiswaForm = () => {
    setNewSiswa({
      nama: '', nisn: '', nis: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', 
      agama: 'Islam', golongan_darah: '', alamat: '', no_telepon: '', tinggi_badan: '', berat_badan: '',
      anak_ke: '', jumlah_saudara: '', nama_ayah: '', pendidikan_ayah: '', pekerjaan_ayah: '', penghasilan_ayah: '',
      nama_ibu: '', pendidikan_ibu: '', pekerjaan_ibu: '', penghasilan_ibu: '', alamat_ortu: '', no_telepon_ortu: '',
      nama_wali: '', pekerjaan_wali: '', alamat_wali: ''
    });
    setEditingSiswa(null);
    setShowAddSiswa(false);
  };

  const handleSaveSiswa = async () => {
    if (!newSiswa.nama) { alert('Nama siswa wajib diisi!'); return; }
    const cleanData = { ...newSiswa };
    Object.keys(cleanData).forEach(k => { if (cleanData[k] === '') cleanData[k] = null; });

    if (editingSiswa) {
      const { error } = await supabase.from('siswa').update(cleanData).eq('id', editingSiswa.id);
      if (error) { alert('Gagal: ' + error.message); return; }
      setSiswaList(siswaList.map(s => s.id === editingSiswa.id ? { ...s, ...cleanData } : s));
      alert('✅ Data siswa berhasil diupdate!');
    } else {
      const { data, error } = await supabase.from('siswa').insert({ ...cleanData, kelas_id: kelasId }).select();
      if (error) { alert('Gagal: ' + error.message); return; }
      setSiswaList([...siswaList, data[0]]);
      alert('✅ Siswa berhasil ditambahkan!');
    }
    resetSiswaForm();
  };

  const handleEditSiswa = (siswa) => {
    setEditingSiswa(siswa);
    setNewSiswa({
      nama: siswa.nama || '', nisn: siswa.nisn || '', nis: siswa.nis || '', tempat_lahir: siswa.tempat_lahir || '',
      tanggal_lahir: siswa.tanggal_lahir || '', jenis_kelamin: siswa.jenis_kelamin || 'Laki-laki', agama: siswa.agama || 'Islam',
      golongan_darah: siswa.golongan_darah || '', alamat: siswa.alamat || '', no_telepon: siswa.no_telepon || '',
      tinggi_badan: siswa.tinggi_badan || '', berat_badan: siswa.berat_badan || '', anak_ke: siswa.anak_ke || '',
      jumlah_saudara: siswa.jumlah_saudara || '', nama_ayah: siswa.nama_ayah || '', pendidikan_ayah: siswa.pendidikan_ayah || '',
      pekerjaan_ayah: siswa.pekerjaan_ayah || '', penghasilan_ayah: siswa.penghasilan_ayah || '', nama_ibu: siswa.nama_ibu || '',
      pendidikan_ibu: siswa.pendidikan_ibu || '', pekerjaan_ibu: siswa.pekerjaan_ibu || '', penghasilan_ibu: siswa.penghasilan_ibu || '',
      alamat_ortu: siswa.alamat_ortu || '', no_telepon_ortu: siswa.no_telepon_ortu || '', nama_wali: siswa.nama_wali || '',
      pekerjaan_wali: siswa.pekerjaan_wali || '', alamat_wali: siswa.alamat_wali || ''
    });
    setShowAddSiswa(true);
  };

  const handleDeleteSiswa = async (id) => {
    if (!confirm('Yakin hapus siswa ini?')) return;
    const { error } = await supabase.from('siswa').delete().eq('id', id);
    if (!error) setSiswaList(siswaList.filter(s => s.id !== id));
  };

  const handleImportSiswa = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (jsonData.length === 0 || !jsonData[0].nama) { alert('File Excel kosong atau tidak ada kolom "nama"!'); return; }
        const payload = jsonData.map(row => ({ ...row, kelas_id: kelasId }));
        const { data: insertedData, error } = await supabase.from('siswa').insert(payload).select();
        if (error) alert('Gagal import: ' + error.message);
        else { setSiswaList([...siswaList, ...insertedData]); alert(`✅ Berhasil import ${insertedData.length} siswa!`); }
      } catch (err) { alert('Error membaca file: ' + err.message); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const template = [{ nama: 'Contoh Nama', nisn: '1234567890', nis: '001', tempat_lahir: 'Jakarta', tanggal_lahir: '2015-01-01', jenis_kelamin: 'Laki-laki', agama: 'Islam', golongan_darah: 'A', alamat: 'Jl. Merdeka No. 1', no_telepon: '081234567890', tinggi_badan: 120, berat_badan: 25, anak_ke: 1, jumlah_saudara: 2, nama_ayah: 'Nama Ayah', pendidikan_ayah: 'S1', pekerjaan_ayah: 'PNS', penghasilan_ayah: 'Rp 5.000.000 - 10.000.000', nama_ibu: 'Nama Ibu', pendidikan_ibu: 'S1', pekerjaan_ibu: 'Guru', penghasilan_ibu: 'Rp 3.000.000 - 5.000.000', alamat_ortu: 'Jl. Merdeka No. 1', no_telepon_ortu: '081234567890', nama_wali: '', pekerjaan_wali: '', alamat_wali: '' }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.writeFile(wb, 'Template_Data_Siswa.xlsx');
  };

  const handleAddMapel = async () => {
    if (!newMapelName.trim()) { alert('Nama mata pelajaran wajib diisi!'); return; }
    const urutan = mapelList.length > 0 ? Math.max(...mapelList.map(m => m.urutan || 0)) + 1 : 1;
    const { data, error } = await supabase.from('mapel').insert({ kelas_id: kelasId, nama: newMapelName.trim(), urutan }).select();
    if (error) { alert('Gagal: ' + error.message); return; }
    setMapelList([...mapelList, data[0]]);
    setNewMapelName('');
    alert('✅ Mata pelajaran berhasil ditambahkan!');
  };

  const handleDeleteMapel = async (mapelId) => {
    if (!confirm('Yakin hapus mata pelajaran ini? Data jadwal terkait juga akan terhapus.')) return;
    const { error } = await supabase.from('mapel').delete().eq('id', mapelId);
    if (error) { alert('Gagal: ' + error.message); return; }
    setMapelList(mapelList.filter(m => m.id !== mapelId));
  };

  const handleSaveJadwal = async () => {
    if (!newJadwal.mapel_id) { alert('Pilih mata pelajaran!'); return; }
    const { error } = await supabase.from('jadwal_mapel').insert({ kelas_id: kelasId, ...newJadwal });
    if (error) { alert('Gagal: ' + error.message); return; }
    const { data } = await supabase.from('jadwal_mapel').select('*, mapel:mapel_id(nama)').eq('kelas_id', kelasId).order('hari').order('jam_mulai');
    setJadwalData(data || []);
    setShowAddJadwal(false);
    setNewJadwal({ mapel_id: '', hari: 'Senin', jam_mulai: '07:00', jam_selesai: '08:00' });
    alert('✅ Jadwal ditambahkan!');
  };

  const handleDeleteJadwal = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return;
    const { error } = await supabase.from('jadwal_mapel').delete().eq('id', id);
    if (!error) setJadwalData(jadwalData.filter(j => j.id !== id));
  };

  // ===== RENDER =====
  if (loading || !profile || !kelasId) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>;

  const tabs = [
    { id: 'sekolah', label: 'Sekolah', icon: '🏫', done: !!sekolahData.nama },
    { id: 'guru', label: 'Wali Kelas', icon: '👨‍🏫', done: !!guruData.nama },
    { id: 'tahunAjaran', label: 'Tahun Ajaran', icon: '📅', done: !!tahunAjaran.tanggal_mulai },
    { id: 'siswa', label: `Siswa (${siswaList.length})`, icon: '👨‍🎓', done: siswaList.length > 0 },
    { id: 'jadwal', label: `Jadwal (${jadwalData.length})`, icon: '🗓️', done: jadwalData.length > 0 },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">⚙️ Setup Kelas</h1>
            <p className="text-[#64748B] mt-1">Lengkapi data dasar untuk kelas <strong>{kelasNama}</strong> ({getFaseLabel(faseKelas)})</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 border-b border-[#E2E8F0] overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
            activeTab === tab.id ? 'border-[#2D5BE3] text-[#2D5BE3] bg-[#EFF6FF]' : 'border-transparent text-[#64748B] hover:text-[#334155] hover:bg-[#F8FAFC]'
          }`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.done && <span className="text-[#059669]">✓</span>}
          </button>
        ))}
      </div>

      {/* TAB: SEKOLAH */}
      {activeTab === 'sekolah' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">Informasi Utama Sekolah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><InputField label="Nama Sekolah" value={sekolahData.nama} onChange={(v) => setSekolahData({...sekolahData, nama: v})} placeholder="SDN 01 Jakarta" required /></div>
              <InputField label="NPSN" value={sekolahData.npsn} onChange={(v) => setSekolahData({...sekolahData, npsn: v})} placeholder="20123456" />
              <InputField label="Jenjang" value={sekolahData.jenjang} onChange={(v) => setSekolahData({...sekolahData, jenjang: v})} options={['SD', 'SMP', 'SMA', 'MI', 'MTs', 'MA']} />
              <InputField label="Akreditasi" value={sekolahData.akreditasi} onChange={(v) => setSekolahData({...sekolahData, akreditasi: v})} options={['A', 'B', 'C', 'Belum Terakreditasi']} />
              <InputField label="Telepon" value={sekolahData.telepon} onChange={(v) => setSekolahData({...sekolahData, telepon: v})} placeholder="(021) 1234567" />
              <InputField label="Email Sekolah" value={sekolahData.email} onChange={(v) => setSekolahData({...sekolahData, email: v})} placeholder="sdn01@sekolah.id" />
              <div className="md:col-span-2"><InputField label="Alamat Lengkap" value={sekolahData.alamat} onChange={(v) => setSekolahData({...sekolahData, alamat: v})} placeholder="Jl. Merdeka No. 1" required /></div>
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={handleSaveSekolah}>💾 Simpan Data Sekolah</Button></div>
        </div>
      )}

      {/* TAB: GURU / WALI KELAS */}
      {activeTab === 'guru' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">🏫 Identitas Kelas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">Nama Kelas <span className="text-[#DC2626]">*</span></label>
                <div className="flex gap-2">
                  <input type="text" value={kelasNama} onChange={(e) => setKelasNama(e.target.value)} placeholder="Contoh: Kelas 3A" className="flex-1 px-4 py-2.5 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]" />
                  <Button onClick={handleSaveNamaKelas}>💾 Simpan</Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1.5">Fase Kurikulum (Otomatis)</label>
                <div className="px-4 py-2.5 bg-[#F0FDF4] border border-[#059669] rounded-lg text-[#059669] font-bold flex items-center gap-2">
                  <span>🎓</span> {getFaseLabel(faseKelas)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">👨‍🏫 Data Diri Wali Kelas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nama Lengkap" value={guruData.nama} onChange={(v) => setGuruData({...guruData, nama: v})} required />
              <InputField label="Email" value={guruData.email} onChange={(v) => setGuruData({...guruData, email: v})} type="email" />
              <InputField label="NIP" value={guruData.nip} onChange={(v) => setGuruData({...guruData, nip: v})} placeholder="198501012010011001" />
              <InputField label="No. Telepon" value={guruData.no_telepon} onChange={(v) => setGuruData({...guruData, no_telepon: v})} placeholder="081234567890" />
              <div className="md:col-span-2"><InputField label="Alamat" value={guruData.alamat} onChange={(v) => setGuruData({...guruData, alamat: v})} rows={2} /></div>
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={handleSaveGuru}>💾 Simpan Data Guru</Button></div>
        </div>
      )}

      {/* TAB: TAHUN AJARAN */}
      {activeTab === 'tahunAjaran' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">Konfigurasi Tahun Ajaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Tahun Ajaran" value={tahunAjaran.nama_tahun} onChange={(v) => setTahunAjaran({...tahunAjaran, nama_tahun: v})} placeholder="2025/2026" required />
              <InputField label="Semester Aktif" value={tahunAjaran.semester_aktif} onChange={(v) => setTahunAjaran({...tahunAjaran, semester_aktif: v})} options={['Ganjil', 'Genap']} required />
              <InputField label="Tanggal Mulai Semester" value={tahunAjaran.tanggal_mulai} onChange={(v) => setTahunAjaran({...tahunAjaran, tanggal_mulai: v})} type="date" required />
              <InputField label="Tanggal Akhir Semester" value={tahunAjaran.tanggal_selesai} onChange={(v) => setTahunAjaran({...tahunAjaran, tanggal_selesai: v})} type="date" />
              <InputField label="Tanggal Pembagian Rapor" value={tahunAjaran.tanggal_rapor} onChange={(v) => setTahunAjaran({...tahunAjaran, tanggal_rapor: v})} type="date" />
              <InputField label="Kota Penetapan" value={tahunAjaran.kota_penetapan} onChange={(v) => setTahunAjaran({...tahunAjaran, kota_penetapan: v})} placeholder="Jakarta" required />
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={handleSaveTahunAjaran}>💾 Simpan Tahun Ajaran</Button></div>
        </div>
      )}

      {/* TAB: SISWA */}
      {activeTab === 'siswa' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#2D5BE3] uppercase">Daftar Siswa ({siswaList.length})</h3>
              <div className="flex gap-2">
                <label className="px-4 py-2.5 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors cursor-pointer">
                  📥 Import dari Excel
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportSiswa} className="hidden" />
                </label>
                <Button onClick={() => { if (showAddSiswa) { resetSiswaForm(); } else { setShowAddSiswa(true); } }}>
                  {showAddSiswa ? '✕ Tutup' : '+ Tambah Siswa'}
                </Button>
              </div>
            </div>

            {showAddSiswa && (
              <div className="bg-[#F8FAFC] p-6 rounded-lg mb-6 border border-[#E2E8F0]">
                <h4 className="text-sm font-bold text-[#0F172A] mb-4">{editingSiswa ? '✏️ Edit Data Siswa' : '➕ Data Siswa Baru'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <InputField label="Nama Lengkap" value={newSiswa.nama} onChange={(v) => setNewSiswa({...newSiswa, nama: v})} required />
                  <InputField label="NISN" value={newSiswa.nisn} onChange={(v) => setNewSiswa({...newSiswa, nisn: v})} placeholder="10 digit" />
                  <InputField label="NIS (Lokal)" value={newSiswa.nis} onChange={(v) => setNewSiswa({...newSiswa, nis: v})} />
                  <InputField label="Tempat Lahir" value={newSiswa.tempat_lahir} onChange={(v) => setNewSiswa({...newSiswa, tempat_lahir: v})} />
                  <InputField label="Tanggal Lahir" value={newSiswa.tanggal_lahir} onChange={(v) => setNewSiswa({...newSiswa, tanggal_lahir: v})} type="date" />
                  <InputField label="Jenis Kelamin" value={newSiswa.jenis_kelamin} onChange={(v) => setNewSiswa({...newSiswa, jenis_kelamin: v})} options={['Laki-laki', 'Perempuan']} />
                  <InputField label="Agama" value={newSiswa.agama} onChange={(v) => setNewSiswa({...newSiswa, agama: v})} options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']} />
                </div>
                <div className="flex gap-2 pt-4 border-t border-[#E2E8F0]">
                  <Button onClick={handleSaveSiswa}>💾 {editingSiswa ? 'Update Siswa' : 'Simpan Siswa'}</Button>
                  <Button variant="secondary" onClick={resetSiswaForm}>Batal</Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {siswaList.length === 0 ? (
                <div className="text-center py-8 text-[#64748B]">
                  <p className="text-4xl mb-3">👨‍🎓</p>
                  <p>Belum ada siswa. Klik "Import dari Excel" atau "+ Tambah Siswa".</p>
                </div>
              ) : (
                siswaList.map((siswa, idx) => (
                  <div key={siswa.id} className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#64748B] w-8">{idx + 1}.</span>
                      <div>
                        <p className="font-medium text-[#0F172A] text-sm">{siswa.nama}</p>
                        <p className="text-xs text-[#64748B]">{siswa.nisn ? `NISN: ${siswa.nisn}` : 'NISN belum diisi'} • {siswa.agama || 'Umum'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditSiswa(siswa)} className="text-[#2D5BE3] hover:bg-[#EFF6FF] px-3 py-1.5 rounded-lg text-sm transition-colors">✏️ Edit</button>
                      <button onClick={() => handleDeleteSiswa(siswa.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1.5 rounded-lg text-sm transition-colors">🗑️ Hapus</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: JADWAL */}
      {activeTab === 'jadwal' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase">Jadwal Pelajaran Mingguan</h3>
            <Button onClick={() => setShowAddJadwal(!showAddJadwal)}>{showAddJadwal ? '✕ Tutup' : '+ Tambah Jadwal'}</Button>
          </div>
          {showAddJadwal && (
            <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-lg mb-4 border border-[#E2E8F0] dark:border-[#475569]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <select value={newJadwal.mapel_id} onChange={(e) => setNewJadwal({...newJadwal, mapel_id: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] rounded-lg text-sm">
                  <option value="">Pilih Mapel</option>
                  {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
                <select value={newJadwal.hari} onChange={(e) => setNewJadwal({...newJadwal, hari: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] rounded-lg text-sm">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <input type="time" value={newJadwal.jam_mulai} onChange={(e) => setNewJadwal({...newJadwal, jam_mulai: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] rounded-lg text-sm" />
                <input type="time" value={newJadwal.jam_selesai} onChange={(e) => setNewJadwal({...newJadwal, jam_selesai: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] dark:border-[#475569] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] rounded-lg text-sm" />
              </div>
              <div className="flex gap-2"><Button onClick={handleSaveJadwal}>Simpan</Button><Button variant="secondary" onClick={() => setShowAddJadwal(false)}>Batal</Button></div>
            </div>
          )}
          <div className="space-y-4">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(hari => {
              const jadwalHari = jadwalData.filter(j => j.hari === hari);
              if (jadwalHari.length === 0) return null;
              return (
                <div key={hari}>
                  <h4 className="text-sm font-bold text-[#2D5BE3] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2D5BE3]"></span>
                    {hari}
                  </h4>
                  <div className="space-y-2 ml-4">
                    {jadwalHari.map(j => (
                      <div key={j.id} className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono text-[#64748B] min-w-[100px]">{j.jam_mulai} - {j.jam_selesai}</span>
                          <span className="font-semibold text-[#0F172A]">{j.mapel?.nama}</span>
                        </div>
                        <button onClick={() => handleDeleteJadwal(j.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-2 py-1 rounded text-sm">🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {jadwalData.length === 0 && (
              <div className="text-center py-8 text-[#64748B]">
                <p className="text-4xl mb-3">🗓️</p>
                <p>Belum ada jadwal. Klik "+ Tambah Jadwal" untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}