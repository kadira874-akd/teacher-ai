'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getFaseByKelas, getFaseLabel, getElemenCP } from '@/config/curriculumDatabase';
import Button from '@/components/ui/Button';

// ===== DATA PROFIL PANCASILA (6 DIMENSI + ELEMEN) =====
const PROFIL_PANCASILA = [
  {
    id: 'beriman',
    nama: 'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
    icon: '🕌',
    color: '#1B4332',
    accent: '#52B788',
    light: '#F0FFF7',
    desc: 'Menjalankan ajaran agama, menghargai sesama, dan menjaga alam.',
    elemen: [
      'Akhlak Beragama',
      'Akhlak Pribadi',
      'Akhlak kepada Manusia',
      'Akhlak kepada Alam',
      'Akhlak Bernegara'
    ]
  },
  {
    id: 'berkebinekaan',
    nama: 'Berkebinekaan Global',
    icon: '🌏',
    color: '#1D3557',
    accent: '#457B9D',
    light: '#F0F7FF',
    desc: 'Menghargai budaya, berkomunikasi antar budaya, dan berkeadilan sosial.',
    elemen: [
      'Mengenal dan Menghargai Budaya',
      'Komunikasi dan Interaksi Antar Budaya',
      'Refleksi dan Tanggung Jawab terhadap Pengalaman Kebinekaan',
      'Berkeadilan Sosial'
    ]
  },
  {
    id: 'gotongroyong',
    nama: 'Bergotong Royong',
    icon: '🤝',
    color: '#3D2B1F',
    accent: '#C9784B',
    light: '#FFF8F0',
    desc: 'Berkolaborasi, peduli, dan berbagi dengan sesama.',
    elemen: [
      'Kolaborasi',
      'Kepedulian',
      'Berbagi'
    ]
  },
  {
    id: 'mandiri',
    nama: 'Mandiri',
    icon: '🎯',
    color: '#81B29A',
    accent: '#3D405B',
    light: '#F5F7FA',
    desc: 'Bertanggung jawab atas proses dan hasil belajarnya.',
    elemen: [
      'Pemahaman Diri dan Situasi',
      'Regulasi Diri'
    ]
  },
  {
    id: 'bernalar',
    nama: 'Bernalar Kritis',
    icon: '🧠',
    color: '#D62828',
    accent: '#E07A5F',
    light: '#FFF0EC',
    desc: 'Memproses informasi, menganalisis, dan mengambil keputusan.',
    elemen: [
      'Memperoleh dan Memproses Informasi',
      'Menganalisis dan Mengevaluasi Penalaran',
      'Merefleksi Pemikiran',
      'Mengambil Keputusan'
    ]
  },
  {
    id: 'kreatif',
    nama: 'Kreatif',
    icon: '💡',
    color: '#F2CC8F',
    accent: '#7A5F00',
    light: '#FFFBF0',
    desc: 'Menghasilkan gagasan dan karya yang orisinal.',
    elemen: [
      'Menghasilkan Gagasan Original',
      'Menghasilkan Karya dan Tindakan Original',
      'Memiliki Keluwesan Berpikir'
    ]
  }
];

export default function KurikulumPage() {
  const { profile } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [faseKelas, setFaseKelas] = useState('faseB');
  const [activeTab, setActiveTab] = useState('kurikulum');

  // ===== STATE: KURIKULUM (ELEMEN CP → TP) =====
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapelForKurikulum, setSelectedMapelForKurikulum] = useState('');
  const [selectedMapelObj, setSelectedMapelObj] = useState(null);
  const [showAddMapelInKurikulum, setShowAddMapelInKurikulum] = useState(false);
  const [newMapelNameInKurikulum, setNewMapelNameInKurikulum] = useState('');
  const [collectedMapel, setCollectedMapel] = useState([]); // Track mapel yang sudah dipilih/dikoleksi
  
  const [elemenList, setElemenList] = useState([]); 
  const [tpList, setTpList] = useState([]);
  
  const [showAddElemen, setShowAddElemen] = useState(false);
  const [editingElemen, setEditingElemen] = useState(null);
  const [newElemen, setNewElemen] = useState({ nama_elemen: '', deskripsi_cp: '', urutan: 1, kategori: 'Umum' });

  const [showAddTP, setShowAddTP] = useState(false);
  const [editingTP, setEditingTP] = useState(null);
  const [selectedElemenForTP, setSelectedElemenForTP] = useState('');
  const [newTP, setNewTP] = useState({ teks: '', urutan_global: 1 });

  // ===== STATE: PROFIL PANCASILA =====
  const [pancasilaPlan, setPancasilaPlan] = useState({}); // { dimensi_id: { fokus: true, catatan: '' } }
  const [savingPancasila, setSavingPancasila] = useState(false);
  const [expandedDimensi, setExpandedDimensi] = useState(null);

  // ===== STATE: EKSTRAKULIKULER =====
  const [ekskulList, setEkskulList] = useState([]);
  const [showAddEkskul, setShowAddEkskul] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState(null);
  const [newEkskul, setNewEkskul] = useState({ nama: '', pembina: '', hari: 'Senin', jam: '', deskripsi: '' });
  const [siswaList, setSiswaList] = useState([]);
  const [selectedEkskul, setSelectedEkskul] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState('');

  // ===== HANDLER: RELOAD KURIKULUM =====
  const reloadKurikulum = async () => {
    if (!selectedMapelForKurikulum) {
      setElemenList([]);
      setTpList([]);
      return;
    }

    const { data: elemenData } = await supabase
      .from('elemen_cp')
      .select('*')
      .eq('mapel_id', selectedMapelForKurikulum)
      .order('urutan');
    setElemenList(elemenData || []);

    if (elemenData && elemenData.length > 0) {
      const elemenIds = elemenData.map(e => e.id);
      const { data: tpData } = await supabase
        .from('tujuan_pembelajaran')
        .select('*')
        .in('elemen_cp_id', elemenIds)
        .order('urutan_global');
      setTpList(tpData || []);
    } else {
      setTpList([]);
    }
  };

  // ===== HANDLER: SIMPAN ELEMEN CP =====
  const handleSaveElemen = async () => {
    if (!newElemen.nama_elemen.trim()) {
      alert('Nama Elemen CP wajib diisi!');
      return;
    }

    const isAgama = selectedMapelObj?.is_mapel_agama || selectedMapelObj?.nama?.toLowerCase().includes('agama');
    const kategoriFinal = isAgama ? newElemen.kategori : 'Umum';

    if (editingElemen) {
      const { error } = await supabase
        .from('elemen_cp')
        .update({ nama_elemen: newElemen.nama_elemen, deskripsi_cp: newElemen.deskripsi_cp, urutan: newElemen.urutan, kategori: kategoriFinal })
        .eq('id', editingElemen.id);
      
      if (error) alert('Gagal: ' + error.message);
      else {
        alert('✅ Elemen CP berhasil diupdate!');
        setEditingElemen(null);
        setNewElemen({ nama_elemen: '', deskripsi_cp: '', urutan: 1, kategori: 'Umum' });
        setShowAddElemen(false);
        await reloadKurikulum();
      }
    } else {
      const { error } = await supabase
        .from('elemen_cp')
        .insert({ mapel_id: selectedMapelForKurikulum, nama_elemen: newElemen.nama_elemen, deskripsi_cp: newElemen.deskripsi_cp, urutan: newElemen.urutan, kategori: kategoriFinal });
      
      if (error) alert('Gagal: ' + error.message);
      else {
        alert('✅ Elemen CP berhasil ditambahkan!');
        setNewElemen({ nama_elemen: '', deskripsi_cp: '', urutan: 1, kategori: 'Umum' });
        setShowAddElemen(false);
        await reloadKurikulum();
      }
    }
  };

  const handleEditElemen = (elemen) => {
    setEditingElemen(elemen);
    setNewElemen({ nama_elemen: elemen.nama_elemen, deskripsi_cp: elemen.deskripsi_cp || '', urutan: elemen.urutan, kategori: elemen.kategori || 'Umum' });
    setShowAddElemen(true);
  };

  const handleDeleteElemen = async (elemenId) => {
    if (!confirm('Yakin hapus Elemen CP ini?')) return;
    const { error } = await supabase.from('elemen_cp').delete().eq('id', elemenId);
    if (error) alert('Gagal: ' + error.message);
    else {
      await reloadKurikulum();
      alert('✅ Elemen CP berhasil dihapus!');
    }
  };

  // ===== HANDLER: SIMPAN TP =====
  const handleSaveTP = async () => {
    if (!newTP.teks.trim()) {
      alert('Teks TP wajib diisi!');
      return;
    }

    if (editingTP) {
      const { error } = await supabase
        .from('tujuan_pembelajaran')
        .update({ teks: newTP.teks })
        .eq('id', editingTP.id);
      
      if (error) alert('Gagal: ' + error.message);
      else {
        alert('✅ TP berhasil diupdate!');
        setEditingTP(null);
        setNewTP({ teks: '', urutan_global: 1 });
        setShowAddTP(false);
        await reloadKurikulum();
      }
    } else {
      const maxOrder = tpList.length > 0 ? Math.max(...tpList.map(tp => tp.urutan_global)) : 0;
      const newGlobalOrder = maxOrder + 1;
      const newKodeTP = `TP ${newGlobalOrder}`;

      const { error } = await supabase
        .from('tujuan_pembelajaran')
        .insert({ 
          elemen_cp_id: selectedElemenForTP, 
          kode_tp: newKodeTP,
          teks: newTP.teks, 
          urutan_global: newGlobalOrder 
        });
      
      if (error) alert('Gagal: ' + error.message);
      else {
        alert(`✅ ${newKodeTP} berhasil ditambahkan!`);
        setNewTP({ teks: '', urutan_global: 1 });
        setShowAddTP(false);
        await reloadKurikulum();
      }
    }
  };

  const handleEditTP = (tp) => {
    setEditingTP(tp);
    setNewTP({ teks: tp.teks, urutan_global: tp.urutan_global });
    setSelectedElemenForTP(tp.elemen_cp_id);
    setShowAddTP(true);
  };

  const handleDeleteTP = async (tpId) => {
    if (!confirm('Yakin hapus TP ini?')) return;
    const { error } = await supabase.from('tujuan_pembelajaran').delete().eq('id', tpId);
    if (error) alert('Gagal: ' + error.message);
    else {
      await reloadKurikulum();
      alert('✅ TP berhasil dihapus!');
    }
  };

  // ===== HANDLER: TEMPLATE KURIKULUM =====
  const handleUseTemplate = async (mapelNama) => {
    if (!selectedMapelForKurikulum) {
      alert('Pilih mata pelajaran terlebih dahulu!');
      return;
    }

    const mapel = mapelList.find(m => m.id === selectedMapelForKurikulum);
    if (!mapel) {
      alert('Mata pelajaran tidak ditemukan!');
      return;
    }

    if (mapel.nama !== mapelNama) {
      alert(`Template ini khusus untuk "${mapelNama}".`);
      return;
    }

    if (!confirm(`Tambahkan template "${mapelNama}"?`)) return;

    try {
      const fase = faseKelas;
      const elemenData = getElemenCP(fase, mapelNama);

      if (!elemenData || elemenData.length === 0) {
        alert(`Template untuk "${mapelNama}" di ${getFaseLabel(fase)} belum tersedia.`);
        return;
      }

      const { data: existingElements } = await supabase
        .from('elemen_cp')
        .select('id')
        .eq('mapel_id', selectedMapelForKurikulum);
      
      let currentGlobalTPNumber = 1;
      if (existingElements && existingElements.length > 0) {
        const elementIds = existingElements.map(e => e.id);
        const { data: maxTPData } = await supabase
          .from('tujuan_pembelajaran')
          .select('urutan_global')
          .in('elemen_cp_id', elementIds)
          .order('urutan_global', { ascending: false })
          .limit(1);
        
        if (maxTPData && maxTPData.length > 0) {
          currentGlobalTPNumber = maxTPData[0].urutan_global + 1;
        }
      }

      let totalTPAdded = 0;

      for (const elemen of elemenData) {
        const { data: elemenDb, error: elemenError } = await supabase
          .from('elemen_cp')
          .insert({
            mapel_id: selectedMapelForKurikulum,
            nama_elemen: elemen.nama_elemen,
            deskripsi_cp: elemen.deskripsi_cp,
            urutan: elemen.urutan
          })
          .select()
          .single();

        if (elemenError) continue;

        if (elemen.contohTP && elemen.contohTP.length > 0) {
          const tpPayload = elemen.contohTP.map((teks) => {
            const currentTPNumber = currentGlobalTPNumber++;
            totalTPAdded++;
            return {
              elemen_cp_id: elemenDb.id,
              kode_tp: `TP ${currentTPNumber}`,
              teks: teks,
              urutan_global: currentTPNumber
            };
          });

          await supabase.from('tujuan_pembelajaran').insert(tpPayload);
        }
      }

      alert(`✅ Template "${mapelNama}" berhasil!\n📌 ${elemenData.length} Elemen CP\n📌 ${totalTPAdded} TP`);
      await reloadKurikulum();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  };
  
  // ===== HANDLER: TAMBAH MAPEL =====
  const handleAddMapelInKurikulum = async () => {
    if (!newMapelNameInKurikulum.trim()) {
      alert('Nama mata pelajaran wajib diisi!');
      return;
    }

    const urutan = mapelList.length > 0 ? Math.max(...mapelList.map(m => m.urutan || 0)) + 1 : 1;
    const { data, error } = await supabase.from('mapel').insert({
      kelas_id: kelasId,
      nama: newMapelNameInKurikulum.trim(),
      urutan
    }).select();

    if (error) {
      alert('Gagal: ' + error.message);
      return;
    }

    setMapelList([...mapelList, data[0]]);
    setSelectedMapelForKurikulum(data[0].id);
    setNewMapelNameInKurikulum('');
    setShowAddMapelInKurikulum(false);
    alert('✅ Mata pelajaran berhasil ditambahkan!');
  };

  // ===== HANDLER: PROFIL PANCASILA =====
  const handleSavePancasila = async () => {
    setSavingPancasila(true);
    try {
      // Hapus data lama
      await supabase.from('profil_pancasila_plan').delete().eq('kelas_id', kelasId);
      
      // Insert data baru
      const payload = Object.entries(pancasilaPlan)
        .filter(([_, data]) => data.fokus || data.catatan)
        .map(([dimensi_id, data]) => ({
          kelas_id: kelasId,
          dimensi_id,
          fokus: data.fokus || false,
          catatan: data.catatan || null
        }));

      if (payload.length > 0) {
        const { error } = await supabase.from('profil_pancasila_plan').insert(payload);
        if (error) throw error;
      }
      
      alert('✅ Perencanaan Profil Pancasila berhasil disimpan!');
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
    setSavingPancasila(false);
  };

  const togglePancasilaFokus = (dimensiId) => {
    setPancasilaPlan(prev => ({
      ...prev,
      [dimensiId]: {
        ...prev[dimensiId],
        fokus: !prev[dimensiId]?.fokus
      }
    }));
  };

  const updatePancasilaCatatan = (dimensiId, catatan) => {
    setPancasilaPlan(prev => ({
      ...prev,
      [dimensiId]: {
        ...prev[dimensiId],
        catatan
      }
    }));
  };

  // ===== HANDLER: EKSTRAKULIKULER =====
  const handleSaveEkskul = async () => {
    if (!newEkskul.nama.trim()) {
      alert('Nama ekstrakurikuler wajib diisi!');
      return;
    }

    const payload = {
      kelas_id: kelasId,
      nama: newEkskul.nama,
      pembina: newEkskul.pembina || null,
      hari: newEkskul.hari,
      jam: newEkskul.jam || null,
      deskripsi: newEkskul.deskripsi || null
    };

    if (editingEkskul) {
      const { error } = await supabase.from('ekstrakurikuler').update(payload).eq('id', editingEkskul.id);
      if (error) alert('Gagal: ' + error.message);
      else {
        alert('✅ Ekstrakurikuler berhasil diupdate!');
        setEditingEkskul(null);
        setNewEkskul({ nama: '', pembina: '', hari: 'Senin', jam: '', deskripsi: '' });
        setShowAddEkskul(false);
        await loadEkskul();
      }
    } else {
      const { error } = await supabase.from('ekstrakurikuler').insert(payload);
      if (error) alert('Gagal: ' + error.message);
      else {
        alert('✅ Ekstrakurikuler berhasil ditambahkan!');
        setNewEkskul({ nama: '', pembina: '', hari: 'Senin', jam: '', deskripsi: '' });
        setShowAddEkskul(false);
        await loadEkskul();
      }
    }
  };

  const handleEditEkskul = (ekskul) => {
    setEditingEkskul(ekskul);
    setNewEkskul({
      nama: ekskul.nama,
      pembina: ekskul.pembina || '',
      hari: ekskul.hari || 'Senin',
      jam: ekskul.jam || '',
      deskripsi: ekskul.deskripsi || ''
    });
    setShowAddEkskul(true);
  };

  const handleDeleteEkskul = async (id) => {
    if (!confirm('Hapus ekstrakurikuler ini? Data peserta juga akan terhapus.')) return;
    const { error } = await supabase.from('ekstrakurikuler').delete().eq('id', id);
    if (error) alert('Gagal: ' + error.message);
    else {
      alert('✅ Berhasil dihapus!');
      await loadEkskul();
    }
  };

  const loadEkskul = async () => {
    const { data } = await supabase
      .from('ekstrakurikuler')
      .select('*, peserta:ekstrakurikuler_siswa(siswa_id)')
      .eq('kelas_id', kelasId)
      .order('nama');
    setEkskulList(data || []);
  };

  const loadEnrolledStudents = async (ekskulId) => {
    if (!ekskulId) {
      setEnrolledStudents([]);
      return;
    }
    const { data } = await supabase
      .from('ekstrakurikuler_siswa')
      .select('*, siswa:siswa_id(id, nama, nisn)')
      .eq('ekstrakurikuler_id', ekskulId);
    setEnrolledStudents(data || []);
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudentForEnroll || !selectedEkskul) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }

    // Cek duplikat
    if (enrolledStudents.some(e => e.siswa_id === selectedStudentForEnroll)) {
      alert('Siswa sudah terdaftar di ekstrakurikuler ini!');
      return;
    }

    const { error } = await supabase.from('ekstrakurikuler_siswa').insert({
      ekstrakurikuler_id: selectedEkskul,
      siswa_id: selectedStudentForEnroll
    });

    if (error) alert('Gagal: ' + error.message);
    else {
      alert('✅ Siswa berhasil ditambahkan!');
      setSelectedStudentForEnroll('');
      await loadEnrolledStudents(selectedEkskul);
      await loadEkskul(); // Refresh count
    }
  };

  const handleRemoveStudent = async (enrollmentId) => {
    if (!confirm('Keluarkan siswa dari ekstrakurikuler ini?')) return;
    const { error } = await supabase.from('ekstrakurikuler_siswa').delete().eq('id', enrollmentId);
    if (error) alert('Gagal: ' + error.message);
    else {
      alert('✅ Siswa berhasil dikeluarkan!');
      await loadEnrolledStudents(selectedEkskul);
      await loadEkskul();
    }
  };

  // ===== INISIALISASI DATA =====
  useEffect(() => {
    const initData = async () => {
      if (!profile?.id) return;
      const { data: kelasData } = await supabase.from('kelas').select('id, fase').eq('guru_id', profile.id).limit(1);
      if (kelasData?.length > 0) {
        setKelasId(kelasData[0].id);
        setFaseKelas(kelasData[0].fase || 'faseB');
        
        const { data: mapel } = await supabase.from('mapel').select('*').eq('kelas_id', kelasData[0].id).order('urutan');
        setMapelList(mapel || []);

        const { data: siswa } = await supabase.from('siswa').select('id, nama, nisn').eq('kelas_id', kelasData[0].id).order('nama');
        setSiswaList(siswa || []);
      }
    };
    initData();
  }, [profile]);

  useEffect(() => {
    if (!selectedMapelForKurikulum) { 
      setElemenList([]); 
      setTpList([]); 
      return; 
    }
    
    // Tambahkan mapel yang dipilih ke collectedMapel jika belum ada
    const selectedMapel = mapelList.find(m => m.id === selectedMapelForKurikulum);
    if (selectedMapel && !collectedMapel.some(m => m.id === selectedMapel.id)) {
      setCollectedMapel(prev => [...prev, selectedMapel]);
    }
    
    reloadKurikulum();
  }, [selectedMapelForKurikulum, mapelList]);
  
  // Load collectedMapel from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('collectedMapel');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCollectedMapel(parsed);
        }
      } catch (e) {
        console.error('Failed to parse collectedMapel from localStorage', e);
      }
    }
  }, []);

  // Save collectedMapel to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('collectedMapel', JSON.stringify(collectedMapel));
  }, [collectedMapel]);

  useEffect(() => {
    if (kelasId && activeTab === 'pancasila') {
      const loadPancasila = async () => {
        const { data } = await supabase
          .from('profil_pancasila_plan')
          .select('*')
          .eq('kelas_id', kelasId);
        
        const plan = {};
        data?.forEach(item => {
          plan[item.dimensi_id] = { fokus: item.fokus, catatan: item.catatan };
        });
        setPancasilaPlan(plan);
      };
      loadPancasila();
    }
  }, [kelasId, activeTab]);

  useEffect(() => {
    if (kelasId && activeTab === 'ekskul') {
      loadEkskul();
    }
  }, [kelasId, activeTab]);

  useEffect(() => {
    loadEnrolledStudents(selectedEkskul);
  }, [selectedEkskul]);

  const selectedMapelName = mapelList.find(m => m.id === selectedMapelForKurikulum)?.nama || '';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">📚 Manajemen Kurikulum</h1>
        <p className="text-[#64748B]">Kelola Capaian Pembelajaran, Profil Pancasila, dan Ekstrakurikuler.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-[#E2E8F0]">
        {[
          { id: 'kurikulum', label: '📖 Kurikulum (CP & TP)' },
          { id: 'pancasila', label: '🇮🇩 Profil Pancasila' },
          { id: 'ekskul', label: '🏅 Ekstrakurikuler' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id ? 'bg-[#2D5BE3] text-white' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB: KURIKULUM ==================== */}
      {activeTab === 'kurikulum' && (
        <div className="space-y-6">
          {/* Tombol Mapel yang Sudah Dikoleksi */}
          {collectedMapel.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide">
                  📚 Mapel yang Sudah Dipilih ({collectedMapel.length})
                </h3>
                <button 
                  onClick={() => setCollectedMapel([])}
                  className="text-xs text-[#64748B] hover:text-[#DC2626] underline"
                >
                  Reset Semua
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {collectedMapel.map((mapel) => (
                  <button
                    key={mapel.id}
                    onClick={() => {
                      setSelectedMapelForKurikulum(mapel.id);
                      setSelectedMapelObj(mapel);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedMapelForKurikulum === mapel.id
                        ? 'bg-[#2D5BE3] text-white shadow-md scale-105'
                        : 'bg-[#EFF6FF] text-[#2D5BE3] hover:bg-[#DBEAFE] border border-[#BFDBFE]'
                    }`}
                  >
                    {mapel.nama}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide">Pilih Mata Pelajaran</h3>
              <Button onClick={() => setShowAddMapelInKurikulum(!showAddMapelInKurikulum)}>
                {showAddMapelInKurikulum ? '✕ Tutup' : '+ Tambah Mapel'}
              </Button>
            </div>

            {showAddMapelInKurikulum && (
              <div className="bg-[#F8FAFC] p-4 rounded-lg mb-4 border border-[#E2E8F0]">
                <h4 className="text-sm font-bold text-[#0F172A] mb-3">➕ Tambah Mata Pelajaran Baru</h4>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={newMapelNameInKurikulum}
                    onChange={(e) => setNewMapelNameInKurikulum(e.target.value)}
                    placeholder="Contoh: Bahasa Indonesia, Pendidikan Agama"
                    className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A] bg-white"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddMapelInKurikulum(); }}
                  />
                  <Button onClick={handleAddMapelInKurikulum}>💾 Simpan Mapel</Button>
                </div>
              </div>
            )}

            <select
              value={selectedMapelForKurikulum}
              onChange={(e) => {
                setSelectedMapelForKurikulum(e.target.value);
                const mapel = mapelList.find(m => m.id === e.target.value);
                setSelectedMapelObj(mapel || null);
              }}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-base font-medium text-[#0F172A] bg-white"
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>

            {selectedMapelObj && (
              <div className="mt-4 p-4 bg-gradient-to-r from-[#EFF6FF] to-[#F0FDF4] rounded-lg border border-[#2D5BE3]/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      📖 Mapel: <span className="text-[#2D5BE3]">{selectedMapelObj.nama}</span> 
                      <span className="ml-2 text-xs px-2 py-0.5 bg-[#E0E7FF] text-[#3730A3] rounded-full">{getFaseLabel(faseKelas)}</span>
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Total TP saat ini: <strong>{tpList.length}</strong>
                    </p>
                  </div>
                  <Button onClick={() => handleUseTemplate(selectedMapelObj.nama)} className="bg-[#059669] hover:bg-[#047857] text-white">
                    📚 Gunakan Template CP Kemendikbud
                  </Button>
                </div>
              </div>
            )}
          </div>

          {selectedMapelForKurikulum && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#0F172A]">Daftar Elemen & Tujuan Pembelajaran</h3>
                <Button onClick={() => { 
                  setShowAddElemen(true); 
                  setEditingElemen(null); 
                  setNewElemen({ nama_elemen: '', deskripsi_cp: '', urutan: elemenList.length + 1, kategori: selectedMapelObj?.is_mapel_agama ? 'Islam' : 'Umum' }); 
                }}>+ Tambah Elemen CP</Button>
              </div>

              {showAddElemen && (
                <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                  <h4 className="text-sm font-bold text-[#0F172A] mb-3">{editingElemen ? '✏️ Edit' : '➕ Tambah'} Elemen CP</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-[#334155] mb-1">Nama Elemen</label>
                      <input type="text" value={newElemen.nama_elemen} onChange={(e) => setNewElemen({...newElemen, nama_elemen: e.target.value})} placeholder="Contoh: Menulis" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A]" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-[#334155] mb-1">Urutan</label>
                      <input type="number" value={newElemen.urutan} onChange={(e) => setNewElemen({...newElemen, urutan: parseInt(e.target.value) || 1})} min="1" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A]" />
                    </div>
                    {(selectedMapelObj?.is_mapel_agama || selectedMapelObj?.nama?.toLowerCase().includes('agama')) && (
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-[#334155] mb-1">Kategori Agama</label>
                        <select value={newElemen.kategori} onChange={(e) => setNewElemen({...newElemen, kategori: e.target.value})} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm">
                          <option value="Umum">Umum</option>
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-[#334155] mb-1">Deskripsi CP (Narasi Kemendikbud)</label>
                    <textarea value={newElemen.deskripsi_cp} onChange={(e) => setNewElemen({...newElemen, deskripsi_cp: e.target.value})} placeholder="Peserta didik mampu..." rows="2" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveElemen}>💾 {editingElemen ? 'Update' : 'Simpan'} Elemen</Button>
                    <Button variant="secondary" onClick={() => { setShowAddElemen(false); setEditingElemen(null); setNewElemen({ nama_elemen: '', deskripsi_cp: '', urutan: 1, kategori: 'Umum' }); }}>Batal</Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {elemenList.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#E2E8F0]">
                    <p className="text-4xl mb-3">📚</p>
                    <p className="text-[#64748B]">Belum ada Elemen CP. Klik "+ Tambah Elemen CP" atau gunakan Template.</p>
                  </div>
                ) : (
                  elemenList.map((elemen) => {
                    const tpUntukElemenIni = tpList.filter(tp => tp.elemen_cp_id === elemen.id).sort((a, b) => a.urutan_global - b.urutan_global);
                    
                    return (
                      <div key={elemen.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="bg-[#F8FAFC] p-4 border-b border-[#E2E8F0]">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-[#0F172A] text-lg">{elemen.nama_elemen}</h4>
                                {elemen.kategori && elemen.kategori !== 'Umum' && (
                                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                                    elemen.kategori === 'Islam' ? 'bg-[#DCFCE7] text-[#166534]' :
                                    elemen.kategori === 'Kristen' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                                    'bg-[#F3F4F6] text-[#374151]'
                                  }`}>
                                    {elemen.kategori}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#64748B] italic">"{elemen.deskripsi_cp}"</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button onClick={() => handleEditElemen(elemen)} className="text-[#2D5BE3] hover:bg-[#EFF6FF] px-3 py-1.5 rounded text-sm transition-colors">✏️ Edit</button>
                              <button onClick={() => handleDeleteElemen(elemen.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1.5 rounded text-sm transition-colors">🗑️ Hapus</button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="text-sm font-semibold text-[#334155]">Tujuan Pembelajaran ({tpUntukElemenIni.length})</h5>
                            <button 
                              onClick={() => { 
                                setShowAddTP(true); 
                                setSelectedElemenForTP(elemen.id); 
                                setEditingTP(null); 
                                setNewTP({ teks: '', urutan_global: 1 }); 
                              }}
                              className="text-sm text-[#2D5BE3] hover:underline font-medium flex items-center gap-1"
                            >
                              <span className="text-lg leading-none">+</span> Tambah TP
                            </button>
                          </div>

                          {showAddTP && selectedElemenForTP === elemen.id && (
                            <div className="bg-[#F0FDF4] p-3 rounded-lg mb-3 border border-[#059669]/30">
                              <h6 className="text-xs font-bold text-[#059669] mb-2">{editingTP ? '✏️ Edit' : '➕ Tambah'} Tujuan Pembelajaran</h6>
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-[#334155] mb-1">Deskripsi TP (Operasional)</label>
                                <textarea value={newTP.teks} onChange={(e) => setNewTP({...newTP, teks: e.target.value})} placeholder="Contoh: Mengidentifikasi ciri-ciri teks deskripsi" rows="2" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#059669]" />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleSaveTP} className="bg-[#059669] hover:bg-[#047857]">💾 {editingTP ? 'Update' : 'Simpan'} TP</Button>
                                <Button variant="secondary" onClick={() => { setShowAddTP(false); setEditingTP(null); setNewTP({ teks: '', urutan_global: 1 }); }}>Batal</Button>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            {tpUntukElemenIni.length === 0 ? (
                              <p className="text-sm text-[#64748B] text-center py-4 bg-[#F8FAFC] rounded-lg">Belum ada TP. Klik "+ Tambah TP" untuk memulai.</p>
                            ) : (
                              tpUntukElemenIni.map((tp) => (
                                <div key={tp.id} className="flex justify-between items-start p-3 bg-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] transition-colors border border-[#E2E8F0]">
                                  <div className="flex items-start gap-3 flex-1">
                                    <span className="text-sm font-bold text-[#2D5BE3] bg-[#EFF6FF] px-2 py-1 rounded min-w-[60px] text-center mt-0.5">{tp.kode_tp}</span>
                                    <p className="text-sm text-[#0F172A] flex-1 leading-relaxed">{tp.teks}</p>
                                  </div>
                                  <div className="flex gap-2 ml-3">
                                    <button onClick={() => handleEditTP(tp)} className="text-[#2D5BE3] hover:bg-[#EFF6FF] px-2 py-1 rounded text-xs transition-colors">✏️</button>
                                    <button onClick={() => handleDeleteTP(tp.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-2 py-1 rounded text-xs transition-colors">🗑️</button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB: PROFIL PANCASILA ==================== */}
      {activeTab === 'pancasila' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-[#FEF2F2] via-[#FFF7ED] to-[#F0FDF4] p-6 rounded-xl border border-[#E2E8F0]">
            <div className="flex items-start gap-4">
              <span className="text-5xl">🇮🇩</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#0F172A] mb-2">Profil Pelajar Pancasila</h2>
                <p className="text-sm text-[#334155] leading-relaxed">
                  Enam dimensi karakter yang menjadi tujuan Kurikulum Merdeka. 
                  Pilih dimensi yang akan menjadi <strong>fokus utama</strong> semester ini, 
                  dan catat strategi integrasinya ke dalam pembelajaran.
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Dimensi yang dipilih sebagai fokus semester ini</p>
                  <p className="text-lg font-bold text-[#2D5BE3]">
                    {Object.values(pancasilaPlan).filter(p => p.fokus).length} dari 6 Dimensi
                  </p>
                </div>
              </div>
              <Button onClick={handleSavePancasila} disabled={savingPancasila} className="bg-[#059669] hover:bg-[#047857]">
                {savingPancasila ? '💾 Menyimpan...' : '💾 Simpan Perencanaan'}
              </Button>
            </div>
          </div>

          {/* 6 Dimensi Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROFIL_PANCASILA.map((dimensi) => {
              const plan = pancasilaPlan[dimensi.id] || { fokus: false, catatan: '' };
              const isExpanded = expandedDimensi === dimensi.id;
              
              return (
                <div
                  key={dimensi.id}
                  className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                    plan.fokus ? 'border-[#2D5BE3] shadow-lg' : 'border-[#E2E8F0]'
                  }`}
                >
                  {/* Card Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                    onClick={() => setExpandedDimensi(isExpanded ? null : dimensi.id)}
                    style={{ backgroundColor: plan.fokus ? dimensi.light : 'white' }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: dimensi.accent + '20', color: dimensi.accent }}
                      >
                        {dimensi.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[#0F172A] text-sm leading-tight">{dimensi.nama}</h3>
                          {plan.fokus && (
                            <span className="px-2 py-0.5 text-xs bg-[#2D5BE3] text-white rounded-full font-bold">
                              FOKUS
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B]">{dimensi.desc}</p>
                        <p className="text-xs text-[#2D5BE3] mt-2 font-medium">
                          {dimensi.elemen.length} elemen • {isExpanded ? '▲ Tutup' : '▼ Lihat Elemen'}
                        </p>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePancasilaFokus(dimensi.id);
                        }}
                        className={`w-14 h-7 rounded-full transition-colors relative ${
                          plan.fokus ? 'bg-[#2D5BE3]' : 'bg-[#E2E8F0]'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${
                          plan.fokus ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Elemen + Catatan */}
                  {isExpanded && (
                    <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-3">
                      <div>
                        <p className="text-xs font-bold text-[#334155] uppercase tracking-wide mb-2">Elemen:</p>
                        <div className="space-y-1.5">
                          {dimensi.elemen.map((elemen, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-[#2D5BE3] font-bold mt-0.5">✓</span>
                              <span className="text-[#334155]">{elemen}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#334155] uppercase tracking-wide mb-1.5">
                          📝 Catatan Strategi Integrasi:
                        </label>
                        <textarea
                          value={plan.catatan || ''}
                          onChange={(e) => updatePancasilaCatatan(dimensi.id, e.target.value)}
                          placeholder="Contoh: Diintegrasikan melalui proyek P5 'Kearifan Lokal' pada bulan Oktober..."
                          rows="3"
                          className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2D5BE3] bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-r-lg">
            <div className="flex gap-2">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-[#92400E]">
                <p className="font-bold mb-1">Tips P5 (Projek Penguatan Profil Pelajar Pancasila):</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Pilih 2-3 dimensi sebagai fokus utama per tahun ajaran</li>
                  <li>Integrasikan melalui projek lintas mata pelajaran (bukan per mapel)</li>
                  <li>Alokasikan ± 20-30% dari total JP untuk P5</li>
                  <li>Gunakan rubrik penilaian kualitatif (Berkembang, Memulai, Sedang Berkembang, Mahir)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: EKSTRAKULIKULER ==================== */}
      {activeTab === 'ekskul' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">🏅 Daftar Ekstrakurikuler</h3>
                <p className="text-sm text-[#64748B] mt-1">Kelola kegiatan ekstrakurikuler dan peserta didik</p>
              </div>
              <Button onClick={() => { 
                setShowAddEkskul(!showAddEkskul); 
                setEditingEkskul(null); 
                setNewEkskul({ nama: '', pembina: '', hari: 'Senin', jam: '', deskripsi: '' }); 
              }}>
                {showAddEkskul ? '✕ Tutup' : '+ Tambah Ekskul'}
              </Button>
            </div>

            {/* Form Tambah/Edit */}
            {showAddEkskul && (
              <div className="mt-4 bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                <h4 className="text-sm font-bold text-[#0F172A] mb-3">
                  {editingEkskul ? '✏️ Edit' : '➕ Tambah'} Ekstrakurikuler
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-[#334155] mb-1">
                      Nama Ekskul <span className="text-[#DC2626]">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={newEkskul.nama} 
                      onChange={(e) => setNewEkskul({...newEkskul, nama: e.target.value})} 
                      placeholder="Contoh: Pramuka, Futsal, Robotik"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#334155] mb-1">Pembina</label>
                    <input 
                      type="text" 
                      value={newEkskul.pembina} 
                      onChange={(e) => setNewEkskul({...newEkskul, pembina: e.target.value})} 
                      placeholder="Nama pembina"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#334155] mb-1">Hari</label>
                    <select 
                      value={newEkskul.hari} 
                      onChange={(e) => setNewEkskul({...newEkskul, hari: e.target.value})} 
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                    >
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#334155] mb-1">Jam</label>
                    <input 
                      type="text" 
                      value={newEkskul.jam} 
                      onChange={(e) => setNewEkskul({...newEkskul, jam: e.target.value})} 
                      placeholder="Contoh: 14:00 - 16:00"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2D5BE3] text-[#0F172A]" 
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-[#334155] mb-1">Deskripsi</label>
                  <textarea 
                    value={newEkskul.deskripsi} 
                    onChange={(e) => setNewEkskul({...newEkskul, deskripsi: e.target.value})} 
                    placeholder="Deskripsi singkat kegiatan..."
                    rows="2"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2D5BE3]" 
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveEkskul}>
                    💾 {editingEkskul ? 'Update' : 'Simpan'}
                  </Button>
                  <Button variant="secondary" onClick={() => { 
                    setShowAddEkskul(false); 
                    setEditingEkskul(null); 
                    setNewEkskul({ nama: '', pembina: '', hari: 'Senin', jam: '', deskripsi: '' }); 
                  }}>
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Grid Ekskul */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ekskulList.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-[#E2E8F0]">
                <p className="text-4xl mb-3">🏅</p>
                <p className="text-[#64748B]">Belum ada ekstrakurikuler. Klik "+ Tambah Ekskul" untuk memulai.</p>
              </div>
            ) : (
              ekskulList.map((ekskul) => {
                const pesertaCount = ekskul.peserta?.length || 0;
                const isSelected = selectedEkskul === ekskul.id;
                
                return (
                  <div 
                    key={ekskul.id}
                    onClick={() => setSelectedEkskul(isSelected ? '' : ekskul.id)}
                    className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-[#2D5BE3] shadow-lg' : 'border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#0F172A]">{ekskul.nama}</h4>
                      <span className="px-2 py-0.5 text-xs bg-[#EFF6FF] text-[#2D5BE3] rounded-full font-bold">
                        {pesertaCount} siswa
                      </span>
                    </div>
                    {ekskul.pembina && (
                      <p className="text-xs text-[#64748B] mb-1">👤 {ekskul.pembina}</p>
                    )}
                    <p className="text-xs text-[#64748B] mb-2">📅 {ekskul.hari} {ekskul.jam && `• ${ekskul.jam}`}</p>
                    {ekskul.deskripsi && (
                      <p className="text-xs text-[#334155] mb-3">{ekskul.deskripsi}</p>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-[#E2E8F0]">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditEkskul(ekskul); }}
                        className="text-[#2D5BE3] hover:bg-[#EFF6FF] px-3 py-1 rounded text-xs transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteEkskul(ekskul.id); }}
                        className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1 rounded text-xs transition-colors"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel Peserta Ekskul Terpilih */}
          {selectedEkskul && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">
                👥 Peserta {ekskulList.find(e => e.id === selectedEkskul)?.nama}
              </h3>

              {/* Tambah Peserta */}
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedStudentForEnroll}
                  onChange={(e) => setSelectedStudentForEnroll(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2D5BE3]"
                >
                  <option value="">-- Pilih Siswa untuk Ditambahkan --</option>
                  {siswaList
                    .filter(s => !enrolledStudents.some(e => e.siswa_id === s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.nama} {s.nisn && `(${s.nisn})`}</option>
                    ))}
                </select>
                <Button onClick={handleEnrollStudent} disabled={!selectedStudentForEnroll}>
                  + Tambah
                </Button>
              </div>

              {/* Daftar Peserta */}
              <div className="space-y-2">
                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 text-[#64748B] bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">
                    <p className="text-2xl mb-2">👥</p>
                    <p>Belum ada peserta. Pilih siswa dari dropdown di atas.</p>
                  </div>
                ) : (
                  enrolledStudents.map((enrollment, idx) => (
                    <div key={enrollment.id} className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#64748B] w-8">{idx + 1}.</span>
                        <div>
                          <p className="font-medium text-[#0F172A] text-sm">{enrollment.siswa?.nama}</p>
                          <p className="text-xs text-[#64748B]">
                            {enrollment.siswa?.nisn ? `NISN: ${enrollment.siswa.nisn}` : 'NISN belum diisi'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(enrollment.id)}
                        className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        🗑️ Keluarkan
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}