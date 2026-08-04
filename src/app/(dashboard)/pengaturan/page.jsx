'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getFaseByKelas, getFaseLabel, getCurriculumData } from '@/data/curriculumDatabase';
import Button from '@/components/ui/Button';

  // Helper untuk Input Field
  const InputField = ({ label, value, onChange, type = 'text', placeholder = '', required = false, options = [], rows }) => (
    <div>
      <label className="block text-sm font-medium text-[#334155] mb-1.5">
        {label} {required && <span className="text-[#DC2626]">*</span>}
      </label>
      {options.length > 0 ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm" />
      )}
    </div>
  );

export default function PengaturanPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [kelasNama, setKelasNama] = useState('');
  const [faseKelas, setFaseKelas] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sekolah');

  // ===== STATE: SEKOLAH =====
  const [sekolahData, setSekolahData] = useState({
    nama: '', npsn: '', alamat: '', jenjang: 'SD', akreditasi: 'A',
    kepala_sekolah_nama: '', kepala_sekolah_nip: '',
    telepon: '', email: '', website: '', kode_pos: '',
    kecamatan: '', kabupaten: '', provinsi: '',
    visi: '', misi: ''
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
  const [newSiswa, setNewSiswa] = useState({
    nama: '', nisn: '', nis: '', tempat_lahir: '', tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki', agama: 'Islam', golongan_darah: '',
    alamat: '', no_telepon: '', tinggi_badan: '', berat_badan: '',
    anak_ke: '', jumlah_saudara: '',
    nama_ayah: '', pendidikan_ayah: '', pekerjaan_ayah: '', penghasilan_ayah: '',
    nama_ibu: '', pendidikan_ibu: '', pekerjaan_ibu: '', penghasilan_ibu: '',
    alamat_ortu: '', no_telepon_ortu: '',
    nama_wali: '', pekerjaan_wali: '', alamat_wali: ''
  });

  // ===== STATE: KURIKULUM =====
  const [mapelList, setMapelList] = useState([]);
  const [kurikulumData, setKurikulumData] = useState({});

  // ===== STATE: JADWAL =====
  const [jadwalData, setJadwalData] = useState([]);
  const [showAddJadwal, setShowAddJadwal] = useState(false);
  const [newJadwal, setNewJadwal] = useState({ mapel_id: '', hari: 'Senin', jam_mulai: '07:00', jam_selesai: '08:00' });

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
          setFaseKelas(k.fase || getFaseByKelas(k.nama_kelas) || 'faseB');

          // Load profile guru
          setGuruData({
            nama: profile.nama || '', email: profile.email || '',
            nip: profile.nip || '', tempat_lahir: profile.tempat_lahir || '',
            tanggal_lahir: profile.tanggal_lahir || '', jenis_kelamin: profile.jenis_kelamin || 'Laki-laki',
            pendidikan_terakhir: profile.pendidikan_terakhir || '', no_telepon: profile.no_telepon || '',
            alamat: profile.alamat || ''
          });

          // Load sekolah
          if (profile.sekolah_id) {
            const { data: sekolah } = await supabase.from('sekolah').select('*').eq('id', profile.sekolah_id).single();
            if (sekolah) {
              setSekolahId(sekolah.id);
              setSekolahData({
                nama: sekolah.nama || '', npsn: sekolah.npsn || '', alamat: sekolah.alamat || '',
                jenjang: sekolah.jenjang || 'SD', akreditasi: sekolah.akreditasi || 'A',
                kepala_sekolah_nama: sekolah.kepala_sekolah_nama || '', kepala_sekolah_nip: sekolah.kepala_sekolah_nip || '',
                telepon: sekolah.telepon || '', email: sekolah.email || '', website: sekolah.website || '',
                kode_pos: sekolah.kode_pos || '', kecamatan: sekolah.kecamatan || '',
                kabupaten: sekolah.kabupaten || '', provinsi: sekolah.provinsi || '',
                visi: sekolah.visi || '', misi: sekolah.misi || ''
              });
            }
          }

          // Load tahun ajaran
          const { data: ta } = await supabase.from('tahun_ajaran').select('*').eq('kelas_id', k.id).single();
          if (ta) {
            setTahunAjaranId(ta.id);
            setTahunAjaran({
              nama_tahun: ta.nama_tahun || '2025/2026', semester_aktif: ta.semester_aktif || 'Ganjil',
              tanggal_mulai: ta.tanggal_mulai || '', tanggal_selesai: ta.tanggal_selesai || '',
              tanggal_rapor: ta.tanggal_rapor || '', kota_penetapan: ta.kota_penetapan || ''
            });
          }

          // Load siswa
          const { data: siswa } = await supabase.from('siswa').select('*').eq('kelas_id', k.id).order('nama');
          setSiswaList(siswa || []);

          // Load mapel & kurikulum
          const { data: mapel } = await supabase.from('mapel').select('*').eq('kelas_id', k.id).order('urutan');
          setMapelList(mapel || []);
          const { data: kurikulum } = await supabase.from('kurikulum_kelas').select('*').eq('kelas_id', k.id);
          const kMap = {};
          kurikulum?.forEach(kk => { kMap[kk.mapel_id] = { cp: kk.cp, tp: kk.tp }; });
          setKurikulumData(kMap);

          // Load jadwal
          const { data: jadwal } = await supabase.from('jadwal_mapel').select('*, mapel:mapel_id(nama)').eq('kelas_id', k.id).order('hari').order('jam_mulai');
          setJadwalData(jadwal || []);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // ===== HELPER: Hitung Progress =====
  const getProgress = () => {
    let total = 0, filled = 0;
    const checks = [
      { key: 'sekolah', done: !!sekolahData.nama && !!sekolahData.alamat },
      { key: 'guru', done: !!guruData.nama && !!guruData.nip },
      { key: 'tahunAjaran', done: !!tahunAjaran.tanggal_mulai && !!tahunAjaran.kota_penetapan },
      { key: 'siswa', done: siswaList.length > 0 },
      { key: 'kurikulum', done: Object.keys(kurikulumData).length > 0 },
      { key: 'jadwal', done: jadwalData.length > 0 },
    ];
    checks.forEach(c => { total++; if (c.done) filled++; });
    return { percent: Math.round((filled / total) * 100), checks };
  };

  const progress = getProgress();

  // ===== HANDLER: SEKOLAH =====
  const handleSaveSekolah = async () => {
    if (!sekolahData.nama || !sekolahData.alamat) { alert('Nama dan alamat sekolah wajib diisi!'); return; }
    try {
      if (!sekolahId) {
        const { data, error } = await supabase.from('sekolah').insert(sekolahData).select('id').single();
        if (error) throw error;
        setSekolahId(data.id);
        await supabase.from('guru').update({ sekolah_id: data.id }).eq('id', profile.id);
      } else {
        const { error } = await supabase.from('sekolah').update(sekolahData).eq('id', sekolahId);
        if (error) throw error;
      }
      alert('✅ Data sekolah berhasil disimpan!');
      await fetchSession();
    } catch (e) { alert('Gagal: ' + e.message); }
  };

  // ===== HANDLER: GURU =====
  const handleSaveGuru = async () => {
    const { error } = await supabase.from('guru').update(guruData).eq('id', profile.id);
    if (error) alert('Gagal: ' + error.message);
    else { alert('✅ Data guru berhasil disimpan!'); await fetchSession(); }
  };

  // ===== HANDLER: TAHUN AJARAN =====
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

  // ===== HANDLER: SISWA =====
  const handleSaveSiswa = async () => {
    if (!newSiswa.nama) { alert('Nama siswa wajib diisi!'); return; }
    const cleanData = { ...newSiswa };
    Object.keys(cleanData).forEach(k => { if (cleanData[k] === '') cleanData[k] = null; });
    const { data, error } = await supabase.from('siswa').insert({ ...cleanData, kelas_id: kelasId }).select();
    if (error) { alert('Gagal: ' + error.message); return; }
    setSiswaList([...siswaList, data[0]]);
    setNewSiswa({ nama: '', nisn: '', nis: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', agama: 'Islam', golongan_darah: '', alamat: '', no_telepon: '', tinggi_badan: '', berat_badan: '', anak_ke: '', jumlah_saudara: '', nama_ayah: '', pendidikan_ayah: '', pekerjaan_ayah: '', penghasilan_ayah: '', nama_ibu: '', pendidikan_ibu: '', pekerjaan_ibu: '', penghasilan_ibu: '', alamat_ortu: '', no_telepon_ortu: '', nama_wali: '', pekerjaan_wali: '', alamat_wali: '' });
    setShowAddSiswa(false);
    alert('✅ Siswa berhasil ditambahkan!');
  };

  const handleDeleteSiswa = async (id) => {
    if (!confirm('Yakin hapus siswa ini?')) return;
    const { error } = await supabase.from('siswa').delete().eq('id', id);
    if (!error) setSiswaList(siswaList.filter(s => s.id !== id));
  };

  // ===== HANDLER: KURIKULUM =====
  const handleLoadTemplate = async (mapelId, mapelName) => {
    const template = getCurriculumData(faseKelas, mapelName);
    if (!template) { alert('Template tidak ditemukan.'); return; }
    const tpArray = template.tp.map((text, idx) => ({ id: `tp_${idx}`, text, urutan: idx + 1 }));
    const newK = { ...kurikulumData, [mapelId]: { cp: template.cp, tp: tpArray } };
    setKurikulumData(newK);
    await supabase.from('kurikulum_kelas').upsert({ kelas_id: kelasId, mapel_id: mapelId, fase: faseKelas, cp: template.cp, tp: tpArray }, { onConflict: 'kelas_id,mapel_id' });
    alert(`✅ Template ${mapelName} dimuat!`);
  };

  const handleSaveKurikulum = async (mapelId) => {
    const data = kurikulumData[mapelId];
    const { error } = await supabase.from('kurikulum_kelas').upsert({ kelas_id: kelasId, mapel_id: mapelId, fase: faseKelas, cp: data.cp, tp: data.tp }, { onConflict: 'kelas_id,mapel_id' });
    if (error) alert('Gagal: ' + error.message);
    else alert('✅ Kurikulum disimpan!');
  };

  // ===== HANDLER: JADWAL =====
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
    { id: 'sekolah', label: 'Sekolah', icon: '🏫', done: !!sekolahData.nama && !!sekolahData.alamat },
    { id: 'guru', label: 'Wali Kelas', icon: '👨‍🏫', done: !!guruData.nama && !!guruData.nip },
    { id: 'tahunAjaran', label: 'Tahun Ajaran', icon: '📅', done: !!tahunAjaran.tanggal_mulai && !!tahunAjaran.kota_penetapan },
    { id: 'siswa', label: `Siswa (${siswaList.length})`, icon: '👨‍🎓', done: siswaList.length > 0 },
    { id: 'kurikulum', label: 'Kurikulum', icon: '📖', done: Object.keys(kurikulumData).length > 0 },
    { id: 'jadwal', label: `Jadwal (${jadwalData.length})`, icon: '🗓️', done: jadwalData.length > 0 },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER + PROGRESS */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">⚙️ Setup Kelas</h1>
            <p className="text-[#64748B] mt-1">Lengkapi data untuk kelas <strong>{kelasNama}</strong> ({getFaseLabel(faseKelas)})</p>
          </div>
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="35" stroke="#E2E8F0" strokeWidth="6" fill="none" />
                <circle cx="40" cy="40" r="35" stroke="#2D5BE3" strokeWidth="6" fill="none"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress.percent / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#2D5BE3]">{progress.percent}%</span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Kelengkapan</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 border-b border-[#E2E8F0] overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
            activeTab === tab.id 
              ? 'border-[#2D5BE3] text-[#2D5BE3] bg-[#EFF6FF]' 
              : 'border-transparent text-[#64748B] hover:text-[#334155] hover:bg-[#F8FAFC]'
          }`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.done && <span className="text-[#059669]">✓</span>}
          </button>
        ))}
      </div>

      {/* ==================== TAB: SEKOLAH ==================== */}
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
              <InputField label="Website" value={sekolahData.website} onChange={(v) => setSekolahData({...sekolahData, website: v})} placeholder="www.sdn01.sch.id" />
              <div className="md:col-span-2"><InputField label="Alamat Lengkap" value={sekolahData.alamat} onChange={(v) => setSekolahData({...sekolahData, alamat: v})} placeholder="Jl. Merdeka No. 1" required /></div>
              <InputField label="Kode Pos" value={sekolahData.kode_pos} onChange={(v) => setSekolahData({...sekolahData, kode_pos: v})} placeholder="10110" />
              <InputField label="Kecamatan" value={sekolahData.kecamatan} onChange={(v) => setSekolahData({...sekolahData, kecamatan: v})} />
              <InputField label="Kabupaten/Kota" value={sekolahData.kabupaten} onChange={(v) => setSekolahData({...sekolahData, kabupaten: v})} />
              <InputField label="Provinsi" value={sekolahData.provinsi} onChange={(v) => setSekolahData({...sekolahData, provinsi: v})} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">Kepala Sekolah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nama Kepala Sekolah" value={sekolahData.kepala_sekolah_nama} onChange={(v) => setSekolahData({...sekolahData, kepala_sekolah_nama: v})} placeholder="Dr. Budi Santoso, M.Pd." />
              <InputField label="NIP Kepala Sekolah" value={sekolahData.kepala_sekolah_nip} onChange={(v) => setSekolahData({...sekolahData, kepala_sekolah_nip: v})} placeholder="196501011990031001" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">Visi & Misi (Opsional)</h3>
            <div className="space-y-4">
              <InputField label="Visi Sekolah" value={sekolahData.visi} onChange={(v) => setSekolahData({...sekolahData, visi: v})} rows={3} placeholder="Terwujudnya peserta didik yang beriman, bertakwa, dan berakhlak mulia..." />
              <InputField label="Misi Sekolah" value={sekolahData.misi} onChange={(v) => setSekolahData({...sekolahData, misi: v})} rows={4} placeholder="1. Menanamkan nilai-nilai keimanan...&#10;2. Melaksanakan pembelajaran yang aktif..." />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSekolah}>💾 Simpan Data Sekolah</Button>
          </div>
        </div>
      )}

      {/* ==================== TAB: GURU ==================== */}
      {activeTab === 'guru' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-6">Data Diri Wali Kelas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nama Lengkap" value={guruData.nama} onChange={(v) => setGuruData({...guruData, nama: v})} required />
              <InputField label="Email" value={guruData.email} onChange={(v) => setGuruData({...guruData, email: v})} type="email" />
              <InputField label="NIP" value={guruData.nip} onChange={(v) => setGuruData({...guruData, nip: v})} placeholder="198501012010011001" />
              <InputField label="No. Telepon" value={guruData.no_telepon} onChange={(v) => setGuruData({...guruData, no_telepon: v})} placeholder="081234567890" />
              <InputField label="Tempat Lahir" value={guruData.tempat_lahir} onChange={(v) => setGuruData({...guruData, tempat_lahir: v})} />
              <InputField label="Tanggal Lahir" value={guruData.tanggal_lahir} onChange={(v) => setGuruData({...guruData, tanggal_lahir: v})} type="date" />
              <InputField label="Jenis Kelamin" value={guruData.jenis_kelamin} onChange={(v) => setGuruData({...guruData, jenis_kelamin: v})} options={['Laki-laki', 'Perempuan']} />
              <InputField label="Pendidikan Terakhir" value={guruData.pendidikan_terakhir} onChange={(v) => setGuruData({...guruData, pendidikan_terakhir: v})} options={['S1', 'S2', 'S3', 'D3', 'D4']} />
              <div className="md:col-span-2"><InputField label="Alamat" value={guruData.alamat} onChange={(v) => setGuruData({...guruData, alamat: v})} rows={2} /></div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveGuru}>💾 Simpan Data Guru</Button>
          </div>
        </div>
      )}

      {/* ==================== TAB: TAHUN AJARAN ==================== */}
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
          <div className="flex justify-end">
            <Button onClick={handleSaveTahunAjaran}>💾 Simpan Tahun Ajaran</Button>
          </div>
        </div>
      )}

      {/* ==================== TAB: SISWA ==================== */}
      {activeTab === 'siswa' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#2D5BE3] uppercase">Daftar Siswa ({siswaList.length})</h3>
              <Button onClick={() => setShowAddSiswa(!showAddSiswa)}>{showAddSiswa ? '✕ Tutup' : '+ Tambah Siswa'}</Button>
            </div>

            {showAddSiswa && (
              <div className="bg-[#F8FAFC] p-6 rounded-lg mb-6 border border-[#E2E8F0]">
                <h4 className="text-sm font-bold text-[#0F172A] mb-4">Data Siswa Baru</h4>
                
                {/* Identitas Siswa */}
                <p className="text-xs font-bold text-[#2D5BE3] uppercase tracking-wide mb-3">Identitas Siswa</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <InputField label="Nama Lengkap" value={newSiswa.nama} onChange={(v) => setNewSiswa({...newSiswa, nama: v})} required />
                  <InputField label="NISN" value={newSiswa.nisn} onChange={(v) => setNewSiswa({...newSiswa, nisn: v})} />
                  <InputField label="NIS (Lokal)" value={newSiswa.nis} onChange={(v) => setNewSiswa({...newSiswa, nis: v})} />
                  <InputField label="Tempat Lahir" value={newSiswa.tempat_lahir} onChange={(v) => setNewSiswa({...newSiswa, tempat_lahir: v})} />
                  <InputField label="Tanggal Lahir" value={newSiswa.tanggal_lahir} onChange={(v) => setNewSiswa({...newSiswa, tanggal_lahir: v})} type="date" />
                  <InputField label="Jenis Kelamin" value={newSiswa.jenis_kelamin} onChange={(v) => setNewSiswa({...newSiswa, jenis_kelamin: v})} options={['Laki-laki', 'Perempuan']} />
                  <InputField label="Agama" value={newSiswa.agama} onChange={(v) => setNewSiswa({...newSiswa, agama: v})} options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']} />
                  <InputField label="Gol. Darah" value={newSiswa.golongan_darah} onChange={(v) => setNewSiswa({...newSiswa, golongan_darah: v})} options={['', 'A', 'B', 'AB', 'O']} />
                  <InputField label="Anak Ke-" value={newSiswa.anak_ke} onChange={(v) => setNewSiswa({...newSiswa, anak_ke: v})} type="number" />
                  <InputField label="Jumlah Saudara" value={newSiswa.jumlah_saudara} onChange={(v) => setNewSiswa({...newSiswa, jumlah_saudara: v})} type="number" />
                  <InputField label="Tinggi Badan (cm)" value={newSiswa.tinggi_badan} onChange={(v) => setNewSiswa({...newSiswa, tinggi_badan: v})} type="number" />
                  <InputField label="Berat Badan (kg)" value={newSiswa.berat_badan} onChange={(v) => setNewSiswa({...newSiswa, berat_badan: v})} type="number" />
                </div>
                <div className="mb-6"><InputField label="Alamat Siswa" value={newSiswa.alamat} onChange={(v) => setNewSiswa({...newSiswa, alamat: v})} rows={2} /></div>

                {/* Data Ayah */}
                <p className="text-xs font-bold text-[#2D5BE3] uppercase tracking-wide mb-3">Data Ayah</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <InputField label="Nama Ayah" value={newSiswa.nama_ayah} onChange={(v) => setNewSiswa({...newSiswa, nama_ayah: v})} />
                  <InputField label="Pendidikan Ayah" value={newSiswa.pendidikan_ayah} onChange={(v) => setNewSiswa({...newSiswa, pendidikan_ayah: v})} options={['', 'SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3']} />
                  <InputField label="Pekerjaan Ayah" value={newSiswa.pekerjaan_ayah} onChange={(v) => setNewSiswa({...newSiswa, pekerjaan_ayah: v})} />
                  <InputField label="Penghasilan Ayah" value={newSiswa.penghasilan_ayah} onChange={(v) => setNewSiswa({...newSiswa, penghasilan_ayah: v})} options={['', '< Rp 1.000.000', 'Rp 1.000.000 - 3.000.000', 'Rp 3.000.000 - 5.000.000', 'Rp 5.000.000 - 10.000.000', '> Rp 10.000.000']} />
                </div>

                {/* Data Ibu */}
                <p className="text-xs font-bold text-[#2D5BE3] uppercase tracking-wide mb-3">Data Ibu</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <InputField label="Nama Ibu" value={newSiswa.nama_ibu} onChange={(v) => setNewSiswa({...newSiswa, nama_ibu: v})} />
                  <InputField label="Pendidikan Ibu" value={newSiswa.pendidikan_ibu} onChange={(v) => setNewSiswa({...newSiswa, pendidikan_ibu: v})} options={['', 'SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3']} />
                  <InputField label="Pekerjaan Ibu" value={newSiswa.pekerjaan_ibu} onChange={(v) => setNewSiswa({...newSiswa, pekerjaan_ibu: v})} />
                  <InputField label="Penghasilan Ibu" value={newSiswa.penghasilan_ibu} onChange={(v) => setNewSiswa({...newSiswa, penghasilan_ibu: v})} options={['', '< Rp 1.000.000', 'Rp 1.000.000 - 3.000.000', 'Rp 3.000.000 - 5.000.000', 'Rp 5.000.000 - 10.000.000', '> Rp 10.000.000']} />
                </div>

                {/* Kontak & Wali */}
                <p className="text-xs font-bold text-[#2D5BE3] uppercase tracking-wide mb-3">Kontak & Wali (Opsional)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <InputField label="Alamat Orang Tua" value={newSiswa.alamat_ortu} onChange={(v) => setNewSiswa({...newSiswa, alamat_ortu: v})} />
                  <InputField label="No. HP Orang Tua" value={newSiswa.no_telepon_ortu} onChange={(v) => setNewSiswa({...newSiswa, no_telepon_ortu: v})} />
                  <InputField label="Nama Wali (jika ada)" value={newSiswa.nama_wali} onChange={(v) => setNewSiswa({...newSiswa, nama_wali: v})} />
                  <InputField label="Pekerjaan Wali" value={newSiswa.pekerjaan_wali} onChange={(v) => setNewSiswa({...newSiswa, pekerjaan_wali: v})} />
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#E2E8F0]">
                  <Button onClick={handleSaveSiswa}>💾 Simpan Siswa</Button>
                  <Button variant="secondary" onClick={() => setShowAddSiswa(false)}>Batal</Button>
                </div>
              </div>
            )}

            {/* Daftar Siswa */}
            <div className="space-y-2">
              {siswaList.length === 0 ? (
                <div className="text-center py-8 text-[#64748B]">
                  <p className="text-4xl mb-3">👨‍🎓</p>
                  <p>Belum ada siswa. Klik "+ Tambah Siswa" untuk memulai.</p>
                </div>
              ) : (
                siswaList.map((siswa, idx) => (
                  <div key={siswa.id} className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#64748B] w-8">{idx + 1}.</span>
                      <div>
                        <p className="font-medium text-[#0F172A] text-sm">{siswa.nama}</p>
                        <p className="text-xs text-[#64748B]">{siswa.nisn ? `NISN: ${siswa.nisn}` : 'NISN belum diisi'}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteSiswa(siswa.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1.5 rounded-lg text-sm transition-colors">🗑️ Hapus</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: KURIKULUM ==================== */}
      {activeTab === 'kurikulum' && (
        <div className="space-y-4">
          {mapelList.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-[#64748B]">Belum ada mata pelajaran. Silakan tambahkan terlebih dahulu.</p>
            </div>
          ) : (
            mapelList.map(mapel => {
              const kurikulum = kurikulumData[mapel.id];
              return (
                <div key={mapel.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-[#0F172A]">{mapel.nama}</h3>
                      {kurikulum ? <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#059669] text-xs rounded font-medium">✓ Terisi</span> : <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#DC2626] text-xs rounded font-medium">Belum diisi</span>}
                    </div>
                    <div className="flex gap-2">
                      {!kurikulum && <Button onClick={() => handleLoadTemplate(mapel.id, mapel.nama)}>📥 Muat Template</Button>}
                      {kurikulum && <Button onClick={() => handleSaveKurikulum(mapel.id)}>💾 Simpan</Button>}
                    </div>
                  </div>
                  {kurikulum ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Capaian Pembelajaran (CP)</label>
                        <textarea value={kurikulum.cp} onChange={(e) => setKurikulumData({...kurikulumData, [mapel.id]: {...kurikulum, cp: e.target.value}})} rows="3" className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium">Tujuan Pembelajaran ({kurikulum.tp.length} TP)</label>
                          <button onClick={() => { const updated = {...kurikulumData}; updated[mapel.id].tp.push({ id: `tp_${Date.now()}`, text: 'TP Baru', urutan: updated[mapel.id].tp.length + 1 }); setKurikulumData(updated); }} className="text-sm text-[#2D5BE3] hover:underline">+ Tambah TP</button>
                        </div>
                        <div className="space-y-2">
                          {kurikulum.tp.map((tp, idx) => (
                            <div key={tp.id} className="flex items-start gap-2 bg-[#F8FAFC] p-3 rounded-lg">
                              <span className="text-sm font-bold text-[#64748B] mt-2 min-w-[24px]">{idx + 1}.</span>
                              <input type="text" value={tp.text} onChange={(e) => { const updated = {...kurikulumData}; updated[mapel.id].tp[idx].text = e.target.value; setKurikulumData(updated); }} className="flex-1 px-3 py-1.5 border border-[#E2E8F0] rounded text-sm" />
                              <button onClick={() => { const updated = {...kurikulumData}; updated[mapel.id].tp.splice(idx, 1); setKurikulumData(updated); }} className="text-[#DC2626] hover:bg-[#FEF2F2] px-2 py-1 rounded">🗑️</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : <p className="text-sm text-[#64748B]">Klik "Muat Template" untuk mengimpor CP & TP standar Kemendikbud.</p>}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ==================== TAB: JADWAL ==================== */}
      {activeTab === 'jadwal' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase">Jadwal Pelajaran Mingguan</h3>
            <Button onClick={() => setShowAddJadwal(!showAddJadwal)}>{showAddJadwal ? '✕ Tutup' : '+ Tambah Jadwal'}</Button>
          </div>

          {showAddJadwal && (
            <div className="bg-[#F8FAFC] p-4 rounded-lg mb-4 border border-[#E2E8F0]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <select value={newJadwal.mapel_id} onChange={(e) => setNewJadwal({...newJadwal, mapel_id: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm">
                  <option value="">Pilih Mapel</option>
                  {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
                <select value={newJadwal.hari} onChange={(e) => setNewJadwal({...newJadwal, hari: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <input type="time" value={newJadwal.jam_mulai} onChange={(e) => setNewJadwal({...newJadwal, jam_mulai: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm" />
                <input type="time" value={newJadwal.jam_selesai} onChange={(e) => setNewJadwal({...newJadwal, jam_selesai: e.target.value})} className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm" />
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