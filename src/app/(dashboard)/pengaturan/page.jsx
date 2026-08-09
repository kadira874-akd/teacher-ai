'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getFaseByKelas, getFaseLabel } from '@/config/curriculumDatabase';
import Button from '@/components/ui/Button';
import * as XLSX from 'xlsx';
import { QRCodeSVG } from 'qrcode.react';

// Daftar tingkat kelas — hanya yang datanya sudah tersedia di KURIKULUM_DATABASE
const TINGKAT_KELAS_OPTIONS = [
  { value: '1', label: 'Kelas 1', jenjang: 'SD', tersedia: true },
  { value: '2', label: 'Kelas 2', jenjang: 'SD', tersedia: true },
  { value: '3', label: 'Kelas 3', jenjang: 'SD', tersedia: true },
  { value: '4', label: 'Kelas 4', jenjang: 'SD', tersedia: true },
  { value: '5', label: 'Kelas 5', jenjang: 'SD', tersedia: true },
  { value: '6', label: 'Kelas 6', jenjang: 'SD', tersedia: true },
  { value: '7', label: 'Kelas 7', jenjang: 'SMP', tersedia: true },
  { value: '8', label: 'Kelas 8', jenjang: 'SMP', tersedia: true },
  { value: '9', label: 'Kelas 9', jenjang: 'SMP', tersedia: true },
  { value: '10', label: 'Kelas 10', jenjang: 'SMA', tersedia: false },
  { value: '11', label: 'Kelas 11', jenjang: 'SMA', tersedia: false },
  { value: '12', label: 'Kelas 12', jenjang: 'SMA', tersedia: false },
];

// Pecah "Kelas 4A" menjadi { tingkat: '4', rombel: 'A' } untuk mengisi ulang dropdown saat edit
const parseNamaKelas = (nama) => {
  if (!nama) return { tingkat: '', rombel: '' };
  const match = String(nama).match(/(\d+)\s*(.*)$/);
  if (!match) return { tingkat: '', rombel: '' };
  return { tingkat: match[1], rombel: match[2].trim() };
};

// Input Field Component - Mobile Optimized with High Contrast
const InputField = ({ label, value, onChange, type = 'text', placeholder = '', required = false, options = [], rows }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {options.length > 0 ? (
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-base font-semibold text-slate-900 bg-white shadow-sm mobile-input-high-contrast"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : rows ? (
      <textarea 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        rows={rows} 
        placeholder={placeholder} 
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-base font-semibold text-slate-900 bg-white shadow-sm mobile-input-high-contrast" 
      />
    ) : (
      <input 
        type={type} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-base font-semibold text-slate-900 bg-white shadow-sm mobile-input-high-contrast" 
      />
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

  // ===== STATE: NAMA KELAS OPTIONS =====
  const [kelasOptions, setKelasOptions] = useState([]);

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

  // ===== HANDLER: BUAT KELAS BARU =====
  const [showAddKelas, setShowAddKelas] = useState(false);
  const [newKelasTingkat, setNewKelasTingkat] = useState('');
  const [newKelasRombel, setNewKelasRombel] = useState('');
  
  // State untuk edit nama kelas di tab Wali
  const [editTingkatKelas, setEditTingkatKelas] = useState('');
  const [editRombelKelas, setEditRombelKelas] = useState('');
  
  const handleCreateKelas = async () => {
    if (!newKelasTingkat) { alert('Pilih tingkat kelas terlebih dahulu!'); return; }
  
    const namaKelas = `Kelas ${newKelasTingkat}${newKelasRombel.trim()}`.trim();
    const fase = getFaseByKelas(newKelasTingkat); // langsung dari data kurikulum, tidak menebak-nebak
  
    const { data, error } = await supabase
      .from('kelas')
      .insert({ nama_kelas: namaKelas, guru_id: profile.id, fase })
      .select('id, nama_kelas, fase')
      .single();
  
    if (error) { alert('Gagal membuat kelas: ' + error.message); return; }
  
    setKelasOptions(prev => [...prev, { id: data.id, nama: data.nama_kelas, fase: data.fase }]);
    setKelasId(data.id);
    setKelasNama(data.nama_kelas);
    setFaseKelas(data.fase);
    setEditTingkatKelas(newKelasTingkat);
    setEditRombelKelas(newKelasRombel.trim());
    setNewKelasTingkat('');
    setNewKelasRombel('');
    setShowAddKelas(false);
    alert('✅ Kelas berhasil dibuat!');
  };

  // ===== INISIALISASI =====
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Ambil profile TERBARU langsung dari store (bukan dari closure yang bisa stale)
        let currentProfile = profile;
        if (!currentProfile) {
          await fetchSession();
          currentProfile = useAuthStore.getState().profile;
        }

        if (currentProfile?.id) {
          // Load semua opsi kelas untuk dropdown
          const { data: allKelasData } = await supabase
            .from('kelas')
            .select('id, nama_kelas, fase')
            .eq('guru_id', currentProfile.id)
            .order('nama_kelas');

          if (allKelasData && allKelasData.length > 0) {
            setKelasOptions(allKelasData.map(k => ({ id: k.id, nama: k.nama_kelas, fase: k.fase })));

            const k = allKelasData[0]; // Gunakan kelas pertama sebagai default
            setKelasId(k.id);
            setKelasNama(k.nama_kelas || '');
            setFaseKelas(k.fase || detectFaseFromNama(k.nama_kelas));
            const parsed = parseNamaKelas(k.nama_kelas);
            setEditTingkatKelas(parsed.tingkat);
            setEditRombelKelas(parsed.rombel);

            setGuruData({
              nama: currentProfile.nama || '', email: currentProfile.email || '', nip: currentProfile.nip || '',
              tempat_lahir: currentProfile.tempat_lahir || '', tanggal_lahir: currentProfile.tanggal_lahir || '',
              jenis_kelamin: currentProfile.jenis_kelamin || 'Laki-laki', pendidikan_terakhir: currentProfile.pendidikan_terakhir || '',
              no_telepon: currentProfile.no_telepon || '', alamat: currentProfile.alamat || ''
            });

            if (currentProfile.sekolah_id) {
              const { data: sekolah } = await supabase.from('sekolah').select('*').eq('id', currentProfile.sekolah_id).single();
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
        }
      } catch (err) {
        console.error('Gagal memuat data pengaturan:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // ===== HANDLERS =====
  const handleSaveSekolah = async () => {
    if (!sekolahData.nama || !sekolahData.alamat) { alert('Nama dan alamat sekolah wajib diisi!'); return; }
    const cleanSekolah = { ...sekolahData };
    Object.keys(cleanSekolah).forEach(k => { if (cleanSekolah[k] === '') cleanSekolah[k] = null; });
    try {
      if (!sekolahId) {
        const { data, error } = await supabase.from('sekolah').insert(cleanSekolah).select('id').single();
        if (error) throw error;
        setSekolahId(data.id);
        // await supabase.from('guru').update({ sekolah_id: data.id }).eq('id', profile.id);
        await supabase.from('profiles').update({ sekolah_id: data.id }).eq('id', profile.id);
      } else {
        await supabase.from('sekolah').update(cleanSekolah).eq('id', sekolahId);
      }
      alert('✅ Data sekolah berhasil disimpan!');
      await fetchSession();
    } catch (e) { alert('Gagal: ' + e.message); }
  };

  const handleSaveGuru = async () => {
    const cleanGuru = { ...guruData };
    Object.keys(cleanGuru).forEach(k => { if (cleanGuru[k] === '') cleanGuru[k] = null; });
    const { error } = await supabase.from('profiles').update(cleanGuru).eq('id', profile.id);
    if (error) alert('Gagal: ' + error.message);
    else { alert('✅ Data guru berhasil disimpan!'); await fetchSession(); }
  };

  const handleSaveNamaKelas = async () => {
    if (!kelasId) { alert('Pilih atau buat kelas terlebih dahulu!'); return; }
    if (!editTingkatKelas) { alert('Pilih tingkat kelas!'); return; }
  
    const namaBaru = `Kelas ${editTingkatKelas}${editRombelKelas.trim()}`.trim();
    const faseBaru = getFaseByKelas(editTingkatKelas);
  
    const { error } = await supabase
      .from('kelas')
      .update({ nama_kelas: namaBaru, fase: faseBaru })
      .eq('id', kelasId);
  
    if (error) { alert('Gagal menyimpan nama kelas: ' + error.message); return; }
  
    setKelasNama(namaBaru);
    setFaseKelas(faseBaru);
    setKelasOptions(prev => prev.map(k => k.id === kelasId ? { ...k, nama: namaBaru, fase: faseBaru } : k));
  
    alert(`✅ Nama kelas berhasil disimpan! Fase: ${getFaseLabel(faseBaru)}`);
  };

  const handleSaveTahunAjaran = async () => {
    const payload = { kelas_id: kelasId, ...tahunAjaran };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
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
  if (loading || !profile) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  // Jika belum ada kelas sama sekali, tampilkan form buat kelas — JANGAN return spinner
  if (!kelasId) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
        <p className="text-4xl mb-3">🏫</p>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Kelas</h2>
        <p className="text-sm text-slate-500 mb-4">Buat kelas terlebih dahulu untuk mulai mengisi data.</p>
  
        <div className="grid grid-cols-2 gap-2 mb-3">
          <select
            value={newKelasTingkat}
            onChange={(e) => setNewKelasTingkat(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg text-base font-semibold"
          >
            <option value="">Pilih Tingkat</option>
            {TINGKAT_KELAS_OPTIONS.map(t => (
              <option key={t.value} value={t.value} disabled={!t.tersedia}>
                {t.label} {!t.tersedia ? '(segera hadir)' : ''}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newKelasRombel}
            onChange={(e) => setNewKelasRombel(e.target.value)}
            placeholder="Rombel, mis. A"
            maxLength={3}
            className="px-4 py-3 border border-slate-300 rounded-lg text-base font-semibold"
          />
        </div>
        <p className="text-xs text-slate-400 mb-4">Rombel opsional — kosongkan jika tidak ada kelas paralel</p>
  
        <Button onClick={handleCreateKelas} className="w-full">➕ Buat Kelas</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'sekolah', label: 'Sekolah', icon: '🏫', done: !!sekolahData.nama },
    { id: 'guru', label: 'Wali Kelas', icon: '👨‍🏫', done: !!guruData.nama },
    { id: 'tahunAjaran', label: 'Tahun Ajaran', icon: '📅', done: !!tahunAjaran.tanggal_mulai },
    { id: 'siswa', label: `Siswa (${siswaList.length})`, icon: '👨‍🎓', done: siswaList.length > 0 },
    { id: 'jadwal', label: `Jadwal (${jadwalData.length})`, icon: '🗓️', done: jadwalData.length > 0 },
    { id: 'kartu', label: 'Kartu Siswa', icon: '🎴', done: siswaList.length > 0 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER - Mobile Optimized */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">⚙️ Setup Kelas</h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">Lengkapi data dasar untuk kelas <strong>{kelasNama}</strong> ({getFaseLabel(faseKelas)})</p>
          </div>
        </div>
      </div>

      {/* TABS - Mobile: Dropdown, Desktop: Horizontal Scroll */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-0 sm:bg-transparent sm:border-0 sm:shadow-none">
        {/* Mobile: Dropdown Selector */}
        <div className="sm:hidden">
          <label htmlFor="tab-select" className="sr-only">Pilih Menu</label>
          <select
            id="tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer mobile-input-high-contrast shadow-sm"
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>
                {tab.icon} {tab.label.split(' ')[0]} {tab.done ? '✓' : ''}
              </option>
            ))}
          </select>
          {/* Progress indicator */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span>Progress: {tabs.filter(t => t.done).length}/{tabs.length}</span>
            <div className="flex gap-1">
              {tabs.map(tab => (
                <div 
                  key={tab.id} 
                  className={`w-6 h-2 rounded-full transition-colors ${tab.done ? 'bg-emerald-600' : 'bg-slate-200'}`}
                  title={tab.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Horizontal Tabs */}
        <div className="hidden sm:block sticky top-20 z-20 bg-gradient-to-br from-slate-50 via-slate-100 to-transparent pt-2 pb-1 -mx-6 px-6 backdrop-blur-sm">
          <div className="flex gap-2 border-b border-slate-200 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 flex-shrink-0 ${
                  activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm' 
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label.split(' ')[0]}</span>
                {tab.done && <span className="text-emerald-600 text-sm">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB: SEKOLAH */}
      {activeTab === 'sekolah' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4 sm:mb-6">Informasi Utama Sekolah</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <InputField label="Nama Sekolah" value={sekolahData.nama} onChange={(v) => setSekolahData({...sekolahData, nama: v})} placeholder="SDN 01 Jakarta" required />
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <InputField label="NPSN" value={sekolahData.npsn} onChange={(v) => setSekolahData({...sekolahData, npsn: v})} placeholder="20123456" />
                <InputField label="Jenjang" value={sekolahData.jenjang} onChange={(v) => setSekolahData({...sekolahData, jenjang: v})} options={['SD', 'SMP', 'SMA', 'MI', 'MTs', 'MA']} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <InputField label="Akreditasi" value={sekolahData.akreditasi} onChange={(v) => setSekolahData({...sekolahData, akreditasi: v})} options={['A', 'B', 'C', 'Belum Terakreditasi']} />
                <InputField label="Telepon" value={sekolahData.telepon} onChange={(v) => setSekolahData({...sekolahData, telepon: v})} placeholder="(021) 1234567" />
              </div>
              <InputField label="Email Sekolah" value={sekolahData.email} onChange={(v) => setSekolahData({...sekolahData, email: v})} placeholder="sdn01@sekolah.id" />
              <InputField label="Website" value={sekolahData.website} onChange={(v) => setSekolahData({...sekolahData, website: v})} placeholder="https://sdn01.sch.id" />
              <InputField label="Alamat Lengkap" value={sekolahData.alamat} onChange={(v) => setSekolahData({...sekolahData, alamat: v})} placeholder="Jl. Merdeka No. 1" required rows={2} />
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <InputField label="Kode Pos" value={sekolahData.kode_pos} onChange={(v) => setSekolahData({...sekolahData, kode_pos: v})} placeholder="12345" />
                <InputField label="Kecamatan" value={sekolahData.kecamatan} onChange={(v) => setSekolahData({...sekolahData, kecamatan: v})} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <InputField label="Kabupaten/Kota" value={sekolahData.kabupaten} onChange={(v) => setSekolahData({...sekolahData, kabupaten: v})} />
                <InputField label="Provinsi" value={sekolahData.provinsi} onChange={(v) => setSekolahData({...sekolahData, provinsi: v})} />
              </div>
            </div>
          </div>
      
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4 sm:mb-6">Kepala Sekolah</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <InputField label="Nama Kepala Sekolah" value={sekolahData.kepala_sekolah_nama} onChange={(v) => setSekolahData({...sekolahData, kepala_sekolah_nama: v})} />
              <InputField label="NIP Kepala Sekolah" value={sekolahData.kepala_sekolah_nip} onChange={(v) => setSekolahData({...sekolahData, kepala_sekolah_nip: v})} />
            </div>
          </div>
      
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4 sm:mb-6">Visi & Misi</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <InputField label="Visi Sekolah" value={sekolahData.visi} onChange={(v) => setSekolahData({...sekolahData, visi: v})} rows={3} />
              <InputField label="Misi Sekolah" value={sekolahData.misi} onChange={(v) => setSekolahData({...sekolahData, misi: v})} rows={4} />
            </div>
          </div>
      
          <div className="flex justify-end"><Button onClick={handleSaveSekolah}>💾 Simpan Data Sekolah</Button></div>
        </div>
      )}

      {/* TAB: GURU / WALI KELAS */}
      {activeTab === 'guru' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4 sm:mb-6">🏫 Identitas Kelas</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {kelasOptions.length > 1 && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                    Nama Kelas <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <select
                      value={editTingkatKelas}
                      onChange={(e) => setEditTingkatKelas(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-base font-semibold text-slate-900 bg-white shadow-sm mobile-input-high-contrast"
                    >
                      <option value="">Pilih Tingkat</option>
                      {TINGKAT_KELAS_OPTIONS.map(t => (
                        <option key={t.value} value={t.value} disabled={!t.tersedia}>
                          {t.label} {!t.tersedia ? '(segera hadir)' : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editRombelKelas}
                      onChange={(e) => setEditRombelKelas(e.target.value)}
                      placeholder="Rombel, mis. A"
                      maxLength={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-base font-semibold text-slate-900 bg-white shadow-sm mobile-input-high-contrast"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">💡 Fase kurikulum otomatis mengikuti tingkat yang dipilih</p>
                </div>
              )}
          
              {/* INI YANG BARU: field untuk benar-benar mengubah nama kelas */}
              <InputField
                label="Nama Kelas"
                value={kelasNama}
                onChange={(v) => setKelasNama(v)}
                placeholder="Contoh: Kelas 4A"
                required
              />
          
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">Fase Kurikulum (Otomatis)</label>
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-500 rounded-lg text-emerald-700 font-bold flex items-center gap-2 text-sm">
                  <span>🎓</span> {getFaseLabel(faseKelas)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={handleSaveNamaKelas}>💾 Simpan Nama Kelas</Button></div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4 sm:mb-6">👨‍🏫 Data Diri Wali Kelas</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <InputField label="Nama Lengkap" value={guruData.nama} onChange={(v) => setGuruData({...guruData, nama: v})} required />
              <InputField label="Email" value={guruData.email} onChange={(v) => setGuruData({...guruData, email: v})} type="email" />
              <InputField label="NIP" value={guruData.nip} onChange={(v) => setGuruData({...guruData, nip: v})} placeholder="198501012010011001" />
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <InputField label="Tempat Lahir" value={guruData.tempat_lahir} onChange={(v) => setGuruData({...guruData, tempat_lahir: v})} />
                <InputField label="Tanggal Lahir" value={guruData.tanggal_lahir} onChange={(v) => setGuruData({...guruData, tanggal_lahir: v})} type="date" />
              </div>
              <InputField label="Jenis Kelamin" value={guruData.jenis_kelamin} onChange={(v) => setGuruData({...guruData, jenis_kelamin: v})} options={['Laki-laki', 'Perempuan']} />
              <InputField label="Pendidikan Terakhir" value={guruData.pendidikan_terakhir} onChange={(v) => setGuruData({...guruData, pendidikan_terakhir: v})} options={['D3', 'S1', 'S2', 'S3']} />
              <InputField label="No. Telepon" value={guruData.no_telepon} onChange={(v) => setGuruData({...guruData, no_telepon: v})} placeholder="081234567890" />
              <InputField label="Alamat" value={guruData.alamat} onChange={(v) => setGuruData({...guruData, alamat: v})} rows={2} />
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={handleSaveGuru}>💾 Simpan Data Guru</Button></div>
        </div>
      )}

      {/* TAB: TAHUN AJARAN */}
      {activeTab === 'tahunAjaran' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4 sm:mb-6">Konfigurasi Tahun Ajaran</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <InputField label="Tahun Ajaran" value={tahunAjaran.nama_tahun} onChange={(v) => setTahunAjaran({...tahunAjaran, nama_tahun: v})} placeholder="2025/2026" required />
                <InputField label="Semester Aktif" value={tahunAjaran.semester_aktif} onChange={(v) => setTahunAjaran({...tahunAjaran, semester_aktif: v})} options={['Ganjil', 'Genap']} required />
              </div>
              <InputField label="Tanggal Mulai Semester" value={tahunAjaran.tanggal_mulai} onChange={(v) => setTahunAjaran({...tahunAjaran, tanggal_mulai: v})} type="date" required />
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <InputField label="Tanggal Akhir Semester" value={tahunAjaran.tanggal_selesai} onChange={(v) => setTahunAjaran({...tahunAjaran, tanggal_selesai: v})} type="date" />
                <InputField label="Tanggal Pembagian Rapor" value={tahunAjaran.tanggal_rapor} onChange={(v) => setTahunAjaran({...tahunAjaran, tanggal_rapor: v})} type="date" />
              </div>
              <InputField label="Kota Penetapan" value={tahunAjaran.kota_penetapan} onChange={(v) => setTahunAjaran({...tahunAjaran, kota_penetapan: v})} placeholder="Jakarta" required />
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={handleSaveTahunAjaran}>💾 Simpan Tahun Ajaran</Button></div>
        </div>
      )}

      {/* TAB: SISWA */}
      {activeTab === 'siswa' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase">Daftar Siswa ({siswaList.length})</h3>
              <div className="flex flex-wrap gap-2">
                <label className="px-3 sm:px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm">
                  📥 Import
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportSiswa} className="hidden" />
                </label>
                <Button onClick={() => { if (showAddSiswa) { resetSiswaForm(); } else { setShowAddSiswa(true); } }} className="text-xs sm:text-sm">
                  {showAddSiswa ? '✕ Tutup' : '+ Tambah'}
                </Button>
              </div>
            </div>

            {showAddSiswa && (
              <div className="bg-slate-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-4">{editingSiswa ? '✏️ Edit Data Siswa' : '➕ Data Siswa Baru'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  <InputField label="Nama Lengkap" value={newSiswa.nama} onChange={(v) => setNewSiswa({...newSiswa, nama: v})} required />
                  <InputField label="NISN" value={newSiswa.nisn} onChange={(v) => setNewSiswa({...newSiswa, nisn: v})} placeholder="10 digit" />
                  <InputField label="NIS (Lokal)" value={newSiswa.nis} onChange={(v) => setNewSiswa({...newSiswa, nis: v})} />
                  <InputField label="Tempat Lahir" value={newSiswa.tempat_lahir} onChange={(v) => setNewSiswa({...newSiswa, tempat_lahir: v})} />
                  <InputField label="Tanggal Lahir" value={newSiswa.tanggal_lahir} onChange={(v) => setNewSiswa({...newSiswa, tanggal_lahir: v})} type="date" />
                  <InputField label="Jenis Kelamin" value={newSiswa.jenis_kelamin} onChange={(v) => setNewSiswa({...newSiswa, jenis_kelamin: v})} options={['Laki-laki', 'Perempuan']} />
                  <InputField label="Agama" value={newSiswa.agama} onChange={(v) => setNewSiswa({...newSiswa, agama: v})} options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']} />
                  <InputField label="Golongan Darah" value={newSiswa.golongan_darah} onChange={(v) => setNewSiswa({...newSiswa, golongan_darah: v})} options={['A', 'B', 'AB', 'O', '-']} />
                  <InputField label="No. Telepon Siswa" value={newSiswa.no_telepon} onChange={(v) => setNewSiswa({...newSiswa, no_telepon: v})} />
                  <InputField label="Tinggi Badan (cm)" value={newSiswa.tinggi_badan} onChange={(v) => setNewSiswa({...newSiswa, tinggi_badan: v})} type="number" />
                  <InputField label="Berat Badan (kg)" value={newSiswa.berat_badan} onChange={(v) => setNewSiswa({...newSiswa, berat_badan: v})} type="number" />
                  <InputField label="Anak Ke-" value={newSiswa.anak_ke} onChange={(v) => setNewSiswa({...newSiswa, anak_ke: v})} type="number" />
                  <InputField label="Jumlah Saudara" value={newSiswa.jumlah_saudara} onChange={(v) => setNewSiswa({...newSiswa, jumlah_saudara: v})} type="number" />
                  <InputField label="Alamat Siswa" value={newSiswa.alamat} onChange={(v) => setNewSiswa({...newSiswa, alamat: v})} rows={2} />
                </div>
                
                <h5 className="text-xs font-bold text-slate-600 uppercase mt-4 mb-2">Data Orang Tua</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  <InputField label="Nama Ayah" value={newSiswa.nama_ayah} onChange={(v) => setNewSiswa({...newSiswa, nama_ayah: v})} />
                  <InputField label="Pendidikan Ayah" value={newSiswa.pendidikan_ayah} onChange={(v) => setNewSiswa({...newSiswa, pendidikan_ayah: v})} />
                  <InputField label="Pekerjaan Ayah" value={newSiswa.pekerjaan_ayah} onChange={(v) => setNewSiswa({...newSiswa, pekerjaan_ayah: v})} />
                  <InputField label="Penghasilan Ayah" value={newSiswa.penghasilan_ayah} onChange={(v) => setNewSiswa({...newSiswa, penghasilan_ayah: v})} />
                  <InputField label="Nama Ibu" value={newSiswa.nama_ibu} onChange={(v) => setNewSiswa({...newSiswa, nama_ibu: v})} />
                  <InputField label="Pendidikan Ibu" value={newSiswa.pendidikan_ibu} onChange={(v) => setNewSiswa({...newSiswa, pendidikan_ibu: v})} />
                  <InputField label="Pekerjaan Ibu" value={newSiswa.pekerjaan_ibu} onChange={(v) => setNewSiswa({...newSiswa, pekerjaan_ibu: v})} />
                  <InputField label="Penghasilan Ibu" value={newSiswa.penghasilan_ibu} onChange={(v) => setNewSiswa({...newSiswa, penghasilan_ibu: v})} />
                  <InputField label="No. Telepon Ortu" value={newSiswa.no_telepon_ortu} onChange={(v) => setNewSiswa({...newSiswa, no_telepon_ortu: v})} />
                  <InputField label="Alamat Ortu" value={newSiswa.alamat_ortu} onChange={(v) => setNewSiswa({...newSiswa, alamat_ortu: v})} rows={2} />
                </div>
                
                <h5 className="text-xs font-bold text-slate-600 uppercase mt-4 mb-2">Data Wali (Opsional)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  <InputField label="Nama Wali" value={newSiswa.nama_wali} onChange={(v) => setNewSiswa({...newSiswa, nama_wali: v})} />
                  <InputField label="Pekerjaan Wali" value={newSiswa.pekerjaan_wali} onChange={(v) => setNewSiswa({...newSiswa, pekerjaan_wali: v})} />
                  <InputField label="Alamat Wali" value={newSiswa.alamat_wali} onChange={(v) => setNewSiswa({...newSiswa, alamat_wali: v})} />
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                  <Button onClick={handleSaveSiswa}>💾 {editingSiswa ? 'Update' : 'Simpan'}</Button>
                  <Button variant="secondary" onClick={resetSiswaForm}>Batal</Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {siswaList.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-4xl mb-3">👨‍🎓</p>
                  <p className="text-sm">Belum ada siswa. Klik "Import" atau "+ Tambah".</p>
                </div>
              ) : (
                siswaList.map((siswa, idx) => (
                  <div key={siswa.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm font-bold text-slate-500 w-6 sm:w-8">{idx + 1}.</span>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{siswa.nama}</p>
                        <p className="text-xs text-slate-500">{siswa.nisn ? `NISN: ${siswa.nisn}` : 'NISN belum diisi'} • {siswa.agama || 'Umum'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => handleEditSiswa(siswa)} className="flex-1 sm:flex-none text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap font-medium">✏️ Edit</button>
                      <button onClick={() => handleDeleteSiswa(siswa.id)} className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap font-medium">🗑️ Hapus</button>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase">Jadwal Pelajaran Mingguan</h3>
            <Button onClick={() => setShowAddJadwal(!showAddJadwal)} className="text-xs sm:text-sm">{showAddJadwal ? '✕ Tutup' : '+ Tambah Jadwal'}</Button>
          </div>
          {showAddJadwal && (
            <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3">
                <select value={newJadwal.mapel_id} onChange={(e) => setNewJadwal({...newJadwal, mapel_id: e.target.value})} className="px-3 py-3 border border-slate-300 rounded-lg text-base font-semibold text-slate-900 bg-white shadow-sm col-span-2 lg:col-span-1 mobile-input-high-contrast">
                  <option value="">Pilih Mapel</option>
                  {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
                <select value={newJadwal.hari} onChange={(e) => setNewJadwal({...newJadwal, hari: e.target.value})} className="px-3 py-3 border border-slate-300 rounded-lg text-base font-semibold text-slate-900 bg-white shadow-sm mobile-input-high-contrast">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <input type="time" value={newJadwal.jam_mulai} onChange={(e) => setNewJadwal({...newJadwal, jam_mulai: e.target.value})} className="px-3 py-3 border border-slate-300 rounded-lg text-base font-semibold text-slate-900 bg-white shadow-sm mobile-input-high-contrast" />
                <input type="time" value={newJadwal.jam_selesai} onChange={(e) => setNewJadwal({...newJadwal, jam_selesai: e.target.value})} className="px-3 py-3 border border-slate-300 rounded-lg text-base font-semibold text-slate-900 bg-white shadow-sm mobile-input-high-contrast" />
              </div>
              <div className="flex flex-wrap gap-2"><Button onClick={handleSaveJadwal} className="text-xs sm:text-sm">Simpan</Button><Button variant="secondary" onClick={() => setShowAddJadwal(false)} className="text-xs sm:text-sm">Batal</Button></div>
            </div>
          )}
          <div className="space-y-4">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(hari => {
              const jadwalHari = jadwalData.filter(j => j.hari === hari);
              if (jadwalHari.length === 0) return null;
              return (
                <div key={hari}>
                  <h4 className="text-xs sm:text-sm font-bold text-indigo-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    {hari}
                  </h4>
                  <div className="space-y-2 ml-4">
                    {jadwalHari.map(j => (
                      <div key={j.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="text-xs sm:text-sm font-mono text-slate-600 min-w-[80px] sm:min-w-[100px]">{j.jam_mulai} - {j.jam_selesai}</span>
                          <span className="font-semibold text-slate-900 text-sm">{j.mapel?.nama}</span>
                        </div>
                        <button onClick={() => handleDeleteJadwal(j.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs sm:text-sm self-end sm:self-auto">🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {jadwalData.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-4xl mb-3">🗓️</p>
                <p className="text-sm">Belum ada jadwal. Klik "+ Tambah Jadwal" untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: KARTU SISWA */}
      {activeTab === 'kartu' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase">Kartu Absen Siswa</h3>
          </div>
          
          {siswaList.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm">Belum ada siswa. Tambahkan siswa terlebih dahulu di tab "Siswa".</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {siswaList.map((siswa) => (
                <div key={siswa.id} className="border-2 border-[#2D5BE3] rounded-lg p-4 bg-gradient-to-br from-white to-[#F8FAFC]">
                  <div className="text-center border-b-2 border-[#2D5BE3] pb-2 mb-3">
                    <h4 className="text-xs font-bold text-[#2D5BE3] mb-1">KARTU ABSEN SISWA</h4>
                    <p className="text-[10px] text-[#64748B]">Tahun Ajaran 2024/2025</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#0F172A] mb-2">{siswa.nama}</p>
                      <p className="text-[10px] text-[#64748B]">NIS: {siswa.nis || '-'}</p>
                      <p className="text-[10px] text-[#64748B]">NISN: {siswa.nisn || '-'}</p>
                    </div>
                    
                    <div className="w-16 h-16 bg-white p-1 border border-[#E2E8F0] rounded">
                      <QRCodeSVG
                        value={JSON.stringify({
                          type: 'SISWA',
                          siswa_id: siswa.id,
                          nama: siswa.nama,
                          nis: siswa.nis,
                          timestamp: new Date().toISOString()
                        })}
                        size={56}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center mt-3 pt-2 border-t border-[#E2E8F0]">
                    <p className="text-[8px] text-[#64748B]">Scan QR Code untuk absensi</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const qrData = JSON.stringify({
                        type: 'SISWA',
                        siswa_id: siswa.id,
                        nama: siswa.nama,
                        nis: siswa.nis,
                        timestamp: new Date().toISOString()
                      });
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Kartu Absen - ${siswa.nama}</title>
                          <style>
                            @media print { @page { size: 3.375in 2.125in; margin: 0; } body { margin: 0; padding: 0; } }
                            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }
                            .card { width: 3.375in; height: 2.125in; background: white; border: 2px solid #2D5BE3; border-radius: 8px; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; position: relative; }
                            .header { text-align: center; border-bottom: 2px solid #2D5BE3; padding-bottom: 6px; margin-bottom: 8px; }
                            .header h2 { margin: 0; font-size: 12px; color: #2D5BE3; }
                            .header p { margin: 2px 0 0; font-size: 10px; color: #64748B; }
                            .content { display: flex; flex: 1; gap: 10px; }
                            .info { flex: 1; font-size: 9px; }
                            .info p { margin: 3px 0; }
                            .info strong { color: #0F172A; }
                            .qr { width: 80px; height: 80px; border: 1px solid #E2E8F0; border-radius: 4px; padding: 4px; }
                            .footer { text-align: center; font-size: 8px; color: #64748B; margin-top: 6px; border-top: 1px solid #E2E8F0; padding-top: 4px; }
                          </style>
                        </head>
                        <body>
                          <div class="card">
                            <div class="header">
                              <h2>KARTU ABSEN SISWA</h2>
                              <p>Tahun Ajaran 2024/2025</p>
                            </div>
                            <div class="content">
                              <div class="info">
                                <p><strong>Nama:</strong><br/>${siswa.nama}</p>
                                <p><strong>NIS:</strong> ${siswa.nis || '-'}</p>
                                <p><strong>NISN:</strong> ${siswa.nisn || '-'}</p>
                              </div>
                              <div class="qr">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}" alt="QR Code" />
                              </div>
                            </div>
                            <div class="footer">Scan QR Code untuk absensi</div>
                          </div>
                          <script>window.onload = function() { window.print(); window.close(); };</script>
                        </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }}
                    className="w-full mt-3 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors text-sm font-medium"
                  >
                    🖨️ Cetak Kartu
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
