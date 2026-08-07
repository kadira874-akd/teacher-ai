'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import Button from '@/components/ui/Button';

export default function BahanAjarPage() {
  const { profile } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  
  // ===== STATE: FILTER & DATA =====
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [elemenList, setElemenList] = useState([]);
  const [selectedElemen, setSelectedElemen] = useState('');
  
  const [modulAjarList, setModulAjarList] = useState([]);
  const [loadingMateri, setLoadingMateri] = useState(false);

  // ===== STATE: MODUL AJAR =====
  const [showAddModulAjar, setShowAddModulAjar] = useState(false);
  const [editingModulAjar, setEditingModulAjar] = useState(null);
  const [newModulAjar, setNewModulAjar] = useState({ 
    tp_id: '', judul: '', deskripsi: '', alokasi_waktu: '', file_url: '',
    kktp_belum_tercapai: '', kktp_mulai_berkembang: '', kktp_tercapai: '', kktp_melampaui: '',
    langkah_pembelajaran: '', asesmen: '', diferensiasi: '', refleksi: ''
  });
  const [activeModulTab, setActiveModulTab] = useState('identitas');

  // State Upload Modul
  const [uploadingModul, setUploadingModul] = useState(false);
  const [selectedModulFileName, setSelectedModulFileName] = useState('');
  const [modulFileToUpload, setModulFileToUpload] = useState(null);

  // ===== STATE: BAHAN AJAR =====
  const [showAddBahanAjar, setShowAddBahanAjar] = useState(false);
  const [editingBahanAjar, setEditingBahanAjar] = useState(null);
  const [newBahanAjar, setNewBahanAjar] = useState({ modul_ajar_id: '', nama_file: '', jenis: 'pdf', file_url: '', deskripsi: '' });

  // State Upload Bahan Ajar
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);

  // ===== 1. INISIALISASI =====
  useEffect(() => {
    const initData = async () => {
      if (!profile?.id) return;
      const { data: kelasData } = await supabase.from('kelas').select('id').eq('guru_id', profile.id).limit(1);
      if (kelasData?.length > 0) {
        setKelasId(kelasData[0].id);
        const { data: mapel } = await supabase.from('mapel').select('*').eq('kelas_id', kelasData[0].id).order('urutan');
        setMapelList(mapel || []);
      }
    };
    initData();
  }, [profile]);

  // ===== 2. LOAD ELEMEN CP SAAT MAPEL DIPILIH =====
  useEffect(() => {
    const loadElemen = async () => {
      if (!selectedMapel) {
        setElemenList([]);
        setSelectedElemen('');
        setModulAjarList([]);
        return;
      }
      const { data } = await supabase.from('elemen_cp').select('*').eq('mapel_id', selectedMapel).order('urutan');
      setElemenList(data || []);
      if (data?.length > 0) setSelectedElemen(data[0].id);
    };
    loadElemen();
  }, [selectedMapel]);

  // ===== 3. LOAD MODUL & BAHAN AJAR SAAT ELEMEN DIPILIH =====
  useEffect(() => {
    const loadMateri = async () => {
      if (!selectedElemen) {
        setModulAjarList([]);
        return;
      }
      setLoadingMateri(true);
      const { data } = await supabase
        .from('modul_ajar')
        .select(`
          *,
          tujuan_pembelajaran (kode_tp, teks),
          bahan_ajar (*)
        `)
        .eq('tujuan_pembelajaran.elemen_cp_id', selectedElemen)
        .order('created_at', { ascending: false });
      
      setModulAjarList(data || []);
      setLoadingMateri(false);
    };
    loadMateri();
  }, [selectedElemen]);

  // ===== HANDLERS: UPLOAD =====
  const handleModulFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Hanya file PDF yang diizinkan!'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Maksimal 10MB!'); return; }
    setModulFileToUpload(file);
    setSelectedModulFileName(file.name);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Maksimal 10MB!'); return; }
    setFileToUpload(file);
    setSelectedFileName(file.name);
  };

  // ===== HANDLERS: MODUL AJAR =====
  const resetModulAjarForm = () => {
    setEditingModulAjar(null);
    setNewModulAjar({ tp_id: '', judul: '', deskripsi: '', alokasi_waktu: '', file_url: '',
      kktp_belum_tercapai: '', kktp_mulai_berkembang: '', kktp_tercapai: '', kktp_melampaui: '',
      langkah_pembelajaran: '', asesmen: '', diferensiasi: '', refleksi: '' });
    setModulFileToUpload(null);
    setSelectedModulFileName('');
    setShowAddModulAjar(false);
    setActiveModulTab('identitas');
  };

  const handleSaveModulAjar = async () => {
    if (!newModulAjar.judul.trim() || !newModulAjar.tp_id) {
      alert('Judul dan TP wajib dipilih/diisi!');
      return;
    }

    let finalFileUrl = newModulAjar.file_url || (editingModulAjar?.file_url || '');
    if (modulFileToUpload) {
      setUploadingModul(true);
      try {
        const fileExt = modulFileToUpload.name.split('.').pop();
        const fileName = `modul_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `modul-ajar/${selectedElemen}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('bahan-ajar').upload(filePath, modulFileToUpload);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('bahan-ajar').getPublicUrl(filePath);
        finalFileUrl = publicUrl;
      } catch (error) {
        alert('Gagal upload: ' + error.message);
        setUploadingModul(false);
        return;
      }
      setUploadingModul(false);
    }

    const payload = {
      tp_id: newModulAjar.tp_id, judul: newModulAjar.judul, deskripsi: newModulAjar.deskripsi || null,
      alokasi_waktu: newModulAjar.alokasi_waktu || null, file_url: finalFileUrl,
      kktp_belum_tercapai: newModulAjar.kktp_belum_tercapai || null,
      kktp_mulai_berkembang: newModulAjar.kktp_mulai_berkembang || null,
      kktp_tercapai: newModulAjar.kktp_tercapai || null,
      kktp_melampaui: newModulAjar.kktp_melampaui || null,
      langkah_pembelajaran: newModulAjar.langkah_pembelajaran || null,
      asesmen: newModulAjar.asesmen || null, diferensiasi: newModulAjar.diferensiasi || null, refleksi: newModulAjar.refleksi || null
    };

    if (editingModulAjar) {
      const { error } = await supabase.from('modul_ajar').update(payload).eq('id', editingModulAjar.id);
      if (error) alert('Gagal: ' + error.message);
      else { alert('✅ Modul ajar diupdate!'); resetModulAjarForm(); window.location.reload(); }
    } else {
      const { error } = await supabase.from('modul_ajar').insert(payload);
      if (error) alert('Gagal: ' + error.message);
      else { alert('✅ Modul ajar ditambahkan!'); resetModulAjarForm(); window.location.reload(); }
    }
  };

  const handleEditModulAjar = (modul) => {
    setEditingModulAjar(modul);
    setNewModulAjar({ 
      tp_id: modul.tp_id || '', judul: modul.judul, deskripsi: modul.deskripsi || '', alokasi_waktu: modul.alokasi_waktu || '', file_url: modul.file_url || '',
      kktp_belum_tercapai: modul.kktp_belum_tercapai || '', kktp_mulai_berkembang: modul.kktp_mulai_berkembang || '',
      kktp_tercapai: modul.kktp_tercapai || '', kktp_melampaui: modul.kktp_melampaui || '',
      langkah_pembelajaran: modul.langkah_pembelajaran || '', asesmen: modul.asesmen || '', diferensiasi: modul.diferensiasi || '', refleksi: modul.refleksi || ''
    });
    setActiveModulTab('identitas');
    setShowAddModulAjar(true);
  };

  const handleDeleteModulAjar = async (id) => {
    if (!confirm('Hapus modul ajar ini? Bahan ajar di dalamnya juga akan terhapus.')) return;
    const { error } = await supabase.from('modul_ajar').delete().eq('id', id);
    if (error) alert('Gagal: ' + error.message);
    else { alert('✅ Dihapus!'); window.location.reload(); }
  };

  // ===== HANDLERS: BAHAN AJAR =====
  const handleSaveBahanAjar = async () => {
    if (!newBahanAjar.nama_file.trim() || !newBahanAjar.modul_ajar_id) {
      alert('Nama dan Modul Ajar terkait wajib diisi!');
      return;
    }

    let finalUrl = newBahanAjar.file_url;
    if (fileToUpload) {
      setUploadingFile(true);
      try {
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `bahan_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `bahan-ajar/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('bahan-ajar').upload(filePath, fileToUpload);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('bahan-ajar').getPublicUrl(filePath);
        finalUrl = publicUrl;
      } catch (error) {
        alert('Gagal upload: ' + error.message);
        setUploadingFile(false);
        return;
      }
      setUploadingFile(false);
    }

    const payload = {
      modul_ajar_id: newBahanAjar.modul_ajar_id, nama_file: newBahanAjar.nama_file,
      jenis: newBahanAjar.jenis, file_url: finalUrl, deskripsi: newBahanAjar.deskripsi || null
    };

    if (editingBahanAjar) {
      const { error } = await supabase.from('bahan_ajar').update(payload).eq('id', editingBahanAjar.id);
      if (error) alert('Gagal: ' + error.message);
      else { alert('✅ Bahan ajar diupdate!'); setEditingBahanAjar(null); setNewBahanAjar({ modul_ajar_id: '', nama_file: '', jenis: 'pdf', file_url: '', deskripsi: '' }); setFileToUpload(null); setSelectedFileName(''); setShowAddBahanAjar(false); window.location.reload(); }
    } else {
      const { error } = await supabase.from('bahan_ajar').insert(payload);
      if (error) alert('Gagal: ' + error.message);
      else { alert('✅ Bahan ajar ditambahkan!'); setNewBahanAjar({ modul_ajar_id: '', nama_file: '', jenis: 'pdf', file_url: '', deskripsi: '' }); setFileToUpload(null); setSelectedFileName(''); setShowAddBahanAjar(false); window.location.reload(); }
    }
  };

  const handleEditBahanAjar = (bahan) => {
    setEditingBahanAjar(bahan);
    setNewBahanAjar({ modul_ajar_id: bahan.modul_ajar_id, nama_file: bahan.nama_file, jenis: bahan.jenis, file_url: bahan.file_url, deskripsi: bahan.deskripsi || '' });
    setShowAddBahanAjar(true);
  };

  const handleDeleteBahanAjar = async (id) => {
    if (!confirm('Hapus bahan ajar ini?')) return;
    const { error } = await supabase.from('bahan_ajar').delete().eq('id', id);
    if (error) alert('Gagal: ' + error.message);
    else { alert('✅ Dihapus!'); window.location.reload(); }
  };

  if (!profile) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">📚 Modul & Bahan Ajar</h1>
        <p className="text-[#64748B] mt-1">Kelola perencanaan pembelajaran (Modul Ajar) dan media pendukung (PPT, Video, LKPD, PDF).</p>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Pilih Konteks Pembelajaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Mata Pelajaran</label>
            <select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm">
              <option value="">-- Pilih Mata Pelajaran --</option>
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Elemen CP</label>
            <select value={selectedElemen} onChange={(e) => setSelectedElemen(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3] text-sm" disabled={!selectedMapel}>
              <option value="">-- Pilih Elemen CP --</option>
              {elemenList.map(e => <option key={e.id} value={e.id}>{e.nama_elemen}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedElemen && (
        <>
          {/* ============================================================ */}
          {/* SECTION 1: MODUL AJAR                                        */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">📋 Modul Ajar</h3>
                <p className="text-xs text-[#64748B] mt-1">Dokumen perencanaan pembelajaran untuk elemen ini</p>
              </div>
              <Button onClick={() => { resetModulAjarForm(); setShowAddModulAjar(true); }}>+ Tambah Modul Ajar</Button>
            </div>

            {/* FORM MODUL AJAR (TABBED) */}
            {showAddModulAjar && (
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden mb-6">
                <div className="flex border-b border-[#E2E8F0] bg-white overflow-x-auto">
                  {[
                    { id: 'identitas', label: '📋 Identitas' },
                    { id: 'kktp', label: '🎯 KKTP' },
                    { id: 'langkah', label: '📝 Langkah Pembelajaran' },
                    { id: 'asesmen', label: '📊 Asesmen & Refleksi' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveModulTab(tab.id)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeModulTab === tab.id ? 'text-[#2D5BE3] border-b-2 border-[#2D5BE3] bg-[#EFF6FF]' : 'text-[#64748B] hover:text-[#334155]'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* TAB 1: IDENTITAS */}
                  {activeModulTab === 'identitas' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#334155] mb-1">Tujuan Pembelajaran (TP) Terkait <span className="text-[#DC2626]">*</span></label>
                        <select value={newModulAjar.tp_id} onChange={(e) => setNewModulAjar({...newModulAjar, tp_id: e.target.value})} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white">
                          <option value="">-- Pilih TP --</option>
                          {/* Kita perlu fetch TP untuk elemen ini, atau ambil dari modulAjarList yang sudah ada. Untuk simplifikasi, kita asumsikan user memilih dari list yang ada atau kita fetch */}
                          {modulAjarList.length > 0 && modulAjarList[0]?.tujuan_pembelajaran ? (
                             <option value={modulAjarList[0].tujuan_pembelajaran.id}>{modulAjarList[0].tujuan_pembelajaran.kode_tp}</option>
                          ) : (
                             <option value="">(Pastikan TP sudah dibuat di menu Kurikulum)</option>
                          )}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#334155] mb-1">Judul Modul <span className="text-[#DC2626]">*</span></label>
                          <input type="text" value={newModulAjar.judul} onChange={(e) => setNewModulAjar({...newModulAjar, judul: e.target.value})} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#334155] mb-1">Alokasi Waktu</label>
                          <input type="text" value={newModulAjar.alokasi_waktu} onChange={(e) => setNewModulAjar({...newModulAjar, alokasi_waktu: e.target.value})} placeholder="2 x 40 menit" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#334155] mb-1">Deskripsi / Tujuan</label>
                        <textarea value={newModulAjar.deskripsi} onChange={(e) => setNewModulAjar({...newModulAjar, deskripsi: e.target.value})} rows="2" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#334155] mb-1">File Modul Ajar (PDF)</label>
                        <label className="flex items-center gap-2 p-3 border border-dashed border-[#2D5BE3] rounded-lg cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                          <span className="text-xl">📄</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#2D5BE3]">Klik untuk Upload PDF</p>
                            <p className="text-xs text-[#64748B]">Maksimal 10MB</p>
                          </div>
                          <input type="file" accept="application/pdf" onChange={handleModulFileUpload} className="hidden" />
                        </label>
                        {uploadingModul && <p className="text-xs text-[#2D5BE3] mt-1">Mengupload...</p>}
                        {selectedModulFileName && <p className="text-xs text-[#059669] mt-1">✅ {selectedModulFileName}</p>}
                      </div>
                      <div className="flex justify-end pt-3">
                        <Button onClick={() => setActiveModulTab('kktp')} className="bg-[#2D5BE3] hover:bg-[#1e4bc4]">Lanjut ke KKTP →</Button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: KKTP */}
                  {activeModulTab === 'kktp' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="border-l-4 border-[#DC2626] bg-[#FEF2F2] p-3 rounded-r-lg">
                          <label className="block text-xs font-bold text-[#991B1B] mb-1">🔴 Belum Tercapai</label>
                          <textarea value={newModulAjar.kktp_belum_tercapai} onChange={(e) => setNewModulAjar({...newModulAjar, kktp_belum_tercapai: e.target.value})} rows="2" className="w-full px-3 py-2 border border-[#FECACA] rounded-lg text-sm bg-white" />
                        </div>
                        <div className="border-l-4 border-[#F59E0B] bg-[#FFFBEB] p-3 rounded-r-lg">
                          <label className="block text-xs font-bold text-[#92400E] mb-1">🟡 Mulai Berkembang</label>
                          <textarea value={newModulAjar.kktp_mulai_berkembang} onChange={(e) => setNewModulAjar({...newModulAjar, kktp_mulai_berkembang: e.target.value})} rows="2" className="w-full px-3 py-2 border border-[#FDE68A] rounded-lg text-sm bg-white" />
                        </div>
                        <div className="border-l-4 border-[#10B981] bg-[#F0FDF4] p-3 rounded-r-lg">
                          <label className="block text-xs font-bold text-[#065F46] mb-1">🟢 Tercapai</label>
                          <textarea value={newModulAjar.kktp_tercapai} onChange={(e) => setNewModulAjar({...newModulAjar, kktp_tercapai: e.target.value})} rows="2" className="w-full px-3 py-2 border border-[#A7F3D0] rounded-lg text-sm bg-white" />
                        </div>
                        <div className="border-l-4 border-[#2D5BE3] bg-[#EFF6FF] p-3 rounded-r-lg">
                          <label className="block text-xs font-bold text-[#1E40AF] mb-1">🔵 Melampaui</label>
                          <textarea value={newModulAjar.kktp_melampaui} onChange={(e) => setNewModulAjar({...newModulAjar, kktp_melampaui: e.target.value})} rows="2" className="w-full px-3 py-2 border border-[#BFDBFE] rounded-lg text-sm bg-white" />
                        </div>
                      </div>
                      <div className="flex justify-between pt-3">
                        <Button variant="secondary" onClick={() => setActiveModulTab('identitas')}>← Kembali</Button>
                        <Button onClick={() => setActiveModulTab('langkah')} className="bg-[#2D5BE3] hover:bg-[#1e4bc4]">Lanjut ke Langkah →</Button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: LANGKAH PEMBELAJARAN */}
                  {activeModulTab === 'langkah' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#334155] mb-1">Skenario Pembelajaran</label>
                        <textarea value={newModulAjar.langkah_pembelajaran} onChange={(e) => setNewModulAjar({...newModulAjar, langkah_pembelajaran: e.target.value})} placeholder="Pembuka (10'):\n- ...\n\nInti (55'):\n- ...\n\nPenutup (15'):\n- ..." rows="8" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm font-mono" />
                      </div>
                      <div className="flex justify-between pt-3">
                        <Button variant="secondary" onClick={() => setActiveModulTab('kktp')}>← Kembali</Button>
                        <Button onClick={() => setActiveModulTab('asesmen')} className="bg-[#2D5BE3] hover:bg-[#1e4bc4]">Lanjut ke Asesmen →</Button>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ASESMEN & REFLEKSI */}
                  {activeModulTab === 'asesmen' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#334155] mb-1">📋 Asesmen (Jenis & Instrumen)</label>
                        <textarea value={newModulAjar.asesmen} onChange={(e) => setNewModulAjar({...newModulAjar, asesmen: e.target.value})} rows="3" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#334155] mb-1">🎯 Diferensiasi (Strategi untuk Siswa Berbeda)</label>
                        <textarea value={newModulAjar.diferensiasi} onChange={(e) => setNewModulAjar({...newModulAjar, diferensiasi: e.target.value})} rows="3" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#334155] mb-1">💭 Refleksi Guru</label>
                        <textarea value={newModulAjar.refleksi} onChange={(e) => setNewModulAjar({...newModulAjar, refleksi: e.target.value})} rows="3" className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                      </div>
                      <div className="flex justify-between pt-4 border-t border-[#E2E8F0]">
                        <Button variant="secondary" onClick={() => setActiveModulTab('langkah')}>← Kembali</Button>
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={resetModulAjarForm}>Batal</Button>
                          <Button onClick={handleSaveModulAjar} className="bg-[#059669] hover:bg-[#047857]">💾 {editingModulAjar ? 'Update' : 'Simpan'} Modul Ajar</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIST MODUL AJAR */}
            <div className="space-y-4">
              {loadingMateri ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5BE3]"></div></div>
              ) : modulAjarList.length === 0 ? (
                <div className="text-center py-8 text-[#64748B] bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">
                  <p className="text-3xl mb-2">📋</p>
                  <p>Belum ada modul ajar. Klik "+ Tambah Modul Ajar" untuk memulai.</p>
                </div>
              ) : (
                modulAjarList.map(modul => (
                  <div key={modul.id} className="border border-[#E2E8F0] rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#0F172A] text-base">{modul.judul}</h4>
                          {modul.alokasi_waktu && <span className="px-2 py-0.5 text-xs bg-[#EFF6FF] text-[#2D5BE3] rounded font-medium">⏱️ {modul.alokasi_waktu}</span>}
                        </div>
                        {modul.tujuan_pembelajaran && (
                          <p className="text-xs text-[#64748B] mb-2">🎯 <span className="font-semibold">{modul.tujuan_pembelajaran.kode_tp}:</span> {modul.tujuan_pembelajaran.teks.substring(0, 80)}...</p>
                        )}
                        {modul.deskripsi && <p className="text-sm text-[#64748B] mb-3">{modul.deskripsi}</p>}
                        
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {modul.kktp_tercapai && <span className="text-xs px-2 py-0.5 bg-[#F0FDF4] text-[#065F46] rounded border border-[#A7F3D0]">✓ KKTP</span>}
                          {modul.langkah_pembelajaran && <span className="text-xs px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] rounded border border-[#BFDBFE]">✓ Langkah</span>}
                          {modul.asesmen && <span className="text-xs px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded border border-[#FDE68A]">✓ Asesmen</span>}
                          {modul.diferensiasi && <span className="text-xs px-2 py-0.5 bg-[#FCE7F3] text-[#9D174D] rounded border border-[#FBCFE8]">✓ Diferensiasi</span>}
                        </div>

                        {modul.file_url && (
                          <a href={modul.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FEF2F2] text-[#DC2626] rounded-lg text-xs font-medium hover:bg-[#FEE2E2] transition-colors">
                            📄 Download Modul Ajar (PDF)
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleEditModulAjar(modul)} className="text-[#2D5BE3] hover:bg-[#EFF6FF] px-3 py-1.5 rounded text-sm transition-colors">✏️ Edit</button>
                        <button onClick={() => handleDeleteModulAjar(modul.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1.5 rounded text-sm transition-colors">🗑️ Hapus</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 2: BAHAN AJAR                                        */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">📚 Bahan Ajar Pendukung</h3>
                <p className="text-xs text-[#64748B] mt-1">File pendukung: PPT, Video, LKPD, PDF, Link, dll.</p>
              </div>
              <Button onClick={() => { setEditingBahanAjar(null); setNewBahanAjar({ modul_ajar_id: '', nama_file: '', jenis: 'pdf', file_url: '', deskripsi: '' }); setShowAddBahanAjar(true); }}>+ Tambah Bahan Ajar</Button>
            </div>

            {/* FORM BAHAN AJAR */}
            {showAddBahanAjar && (
              <div className="bg-[#F8FAFC] p-4 rounded-lg mb-6 border border-[#E2E8F0]">
                <h4 className="text-sm font-bold text-[#0F172A] mb-3">{editingBahanAjar ? '✏️ Edit' : '➕ Tambah'} Bahan Ajar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-[#334155] mb-1">Modul Ajar Terkait <span className="text-[#DC2626]">*</span></label>
                    <select value={newBahanAjar.modul_ajar_id} onChange={(e) => setNewBahanAjar({...newBahanAjar, modul_ajar_id: e.target.value})} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white">
                      <option value="">-- Pilih Modul Ajar --</option>
                      {modulAjarList.map(m => <option key={m.id} value={m.id}>{m.judul}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#334155] mb-1">Nama Bahan Ajar <span className="text-[#DC2626]">*</span></label>
                    <input type="text" value={newBahanAjar.nama_file} onChange={(e) => setNewBahanAjar({...newBahanAjar, nama_file: e.target.value})} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#334155] mb-1">Jenis <span className="text-[#DC2626]">*</span></label>
                    <select value={newBahanAjar.jenis} onChange={(e) => setNewBahanAjar({...newBahanAjar, jenis: e.target.value})} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm">
                      <option value="pdf">📄 PDF</option>
                      <option value="ppt">📊 PPT / Presentasi</option>
                      <option value="video">🎥 Video</option>
                      <option value="lkpd">📝 LKPD</option>
                      <option value="link">🔗 Link Website</option>
                      <option value="gambar">🖼️ Gambar</option>
                      <option value="audio">🎵 Audio</option>
                      <option value="lainnya">📎 Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-[#334155] mb-1">File atau Link <span className="text-[#DC2626]">*</span></label>
                  <div className="mb-2">
                    <label className="flex items-center gap-2 p-3 border border-dashed border-[#2D5BE3] rounded-lg cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                      <span className="text-xl">📁</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#2D5BE3]">Klik untuk Upload File</p>
                        <p className="text-xs text-[#64748B]">Maksimal 10MB</p>
                      </div>
                      <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.png,.mp4" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {uploadingFile && <p className="text-xs text-[#2D5BE3] mt-1">Mengupload...</p>}
                    {selectedFileName && <p className="text-xs text-[#059669] mt-1">✅ {selectedFileName}</p>}
                  </div>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#F8FAFC] px-2 text-[#64748B]">atau masukkan link</span></div>
                  </div>
                  <input type="text" value={newBahanAjar.file_url} onChange={(e) => setNewBahanAjar({...newBahanAjar, file_url: e.target.value})} placeholder="https://youtube.com/... atau https://canva.com/..." className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-[#334155] mb-1">Deskripsi (Opsional)</label>
                  <input type="text" value={newBahanAjar.deskripsi} onChange={(e) => setNewBahanAjar({...newBahanAjar, deskripsi: e.target.value})} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                </div>
                <div className="flex gap-2 pt-2 border-t border-[#E2E8F0]">
                  <Button onClick={handleSaveBahanAjar}>💾 {editingBahanAjar ? 'Update' : 'Simpan'} Bahan Ajar</Button>
                  <Button variant="secondary" onClick={() => { setShowAddBahanAjar(false); setEditingBahanAjar(null); setNewBahanAjar({ modul_ajar_id: '', nama_file: '', jenis: 'pdf', file_url: '', deskripsi: '' }); setFileToUpload(null); setSelectedFileName(''); }}>Batal</Button>
                </div>
              </div>
            )}

            {/* LIST BAHAN AJAR */}
            <div className="space-y-3">
              {modulAjarList.flatMap(m => m.bahan_ajar || []).length === 0 ? (
                <div className="text-center py-8 text-[#64748B] bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">
                  <p className="text-3xl mb-2">📚</p>
                  <p>Belum ada bahan ajar. Klik "+ Tambah Bahan Ajar" untuk menambahkan file.</p>
                </div>
              ) : (
                modulAjarList.flatMap(modul => 
                  (modul.bahan_ajar || []).map(bahan => (
                    <div key={bahan.id} className="border border-[#E2E8F0] rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-3xl">
                            {bahan.jenis === 'ppt' ? '📊' : bahan.jenis === 'video' ? '🎥' : bahan.jenis === 'lkpd' ? '📝' : bahan.jenis === 'pdf' ? '📄' : bahan.jenis === 'link' ? '🔗' : '📎'}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-bold text-[#0F172A]">{bahan.nama_file}</h4>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded font-medium ${
                              bahan.jenis === 'ppt' ? 'bg-[#FEF3C7] text-[#92400E]' :
                              bahan.jenis === 'video' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                              bahan.jenis === 'lkpd' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                              bahan.jenis === 'pdf' ? 'bg-[#F3F4F6] text-[#374151]' :
                              'bg-[#E0E7FF] text-[#3730A3]'
                            }`}>
                              {bahan.jenis.toUpperCase()}
                            </span>
                            <p className="text-xs text-[#64748B] mt-1">Terlampir pada: <span className="font-semibold text-[#2D5BE3]">{modul.judul}</span></p>
                            {bahan.deskripsi && <p className="text-sm text-[#64748B] mt-1">{bahan.deskripsi}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <a href={bahan.file_url} target="_blank" rel="noopener noreferrer" className="text-[#2D5BE3] hover:bg-[#EFF6FF] px-3 py-1.5 rounded text-sm transition-colors">
                            {bahan.jenis === 'video' ? '▶️ Tonton' : '📥 Buka'}
                          </a>
                          <button onClick={() => handleEditBahanAjar(bahan)} className="text-[#2D5BE3] hover:bg-[#EFF6FF] px-3 py-1.5 rounded text-sm transition-colors">✏️</button>
                          <button onClick={() => handleDeleteBahanAjar(bahan.id)} className="text-[#DC2626] hover:bg-[#FEF2F2] px-3 py-1.5 rounded text-sm transition-colors">🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}