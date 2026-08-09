'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import RaporPDF from '@/components/RaporPDF';
import RaporPDFTemplate from '@/components/RaporPDFTemplate';
import Button from '@/components/ui/Button';
import ImportSiswaModal from '@/features/siswa/ImportSiswaModal';
import TambahSiswaModal from '@/features/siswa/TambahSiswaModal';

export default function RaporPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [raporData, setRaporData] = useState(null);
  const [sekolahData, setSekolahData] = useState(null);
  const [guruData, setGuruData] = useState(null);
  
  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTambahModal, setShowTambahModal] = useState(false);
  
  // Bulk export state
  const [bulkExporting, setBulkExporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const [catatanWali, setCatatanWali] = useState('');
  const [statusKenaikan, setStatusKenaikan] = useState('');
  const [nomorRapor, setNomorRapor] = useState('');
  const [tanggalPenetapan, setTanggalPenetapan] = useState('');
  const [kotaPenetapan, setKotaPenetapan] = useState('');
  const [tanggapanOrtu, setTanggapanOrtu] = useState('');

  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData, error: kelasError } = await supabase.from('kelas').select('id, nama_kelas, fase').eq('guru_id', profile.id).limit(1);
        
        if (kelasError) {
          console.error('Error fetching kelas:', kelasError);
          alert('Gagal memuat data kelas: ' + kelasError.message);
          setLoading(false);
          return;
        }
        
        if (kelasData && kelasData.length > 0) {
          setKelasId(kelasData[0].id);
          const { data: siswaData, error: siswaError } = await supabase.from('siswa').select('*').eq('kelas_id', kelasData[0].id).order('nama');
          
          if (siswaError) {
            console.error('Error fetching siswa:', siswaError);
          } else {
            setSiswaList(siswaData || []);
            if (siswaData && siswaData.length > 0) setSelectedSiswaId(siswaData[0].id);
          }

          if (profile?.sekolah_id) {
            const { data: sekolah, error: sekolahError } = await supabase.from('sekolah').select('*').eq('id', profile.sekolah_id).single();
            if (!sekolahError) setSekolahData(sekolah);
          }

          const { data: guru, error: guruError } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
          if (!guruError) setGuruData(guru);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // ============================================================
  // LOGIKA BARU: FETCH & HITUNG RAPOR BERDASARKAN STRUKTUR HIRARKIS
  // ============================================================
  useEffect(() => {
    const fetchRapor = async () => {
      if (!selectedSiswaId || !kelasId) return;

      const siswa = siswaList.find(s => s.id === selectedSiswaId);
      const agamaSiswa = siswa?.agama || 'Umum';

      // 1. Ambil Mapel
      const { data: mapelList, error: mapelError } = await supabase.from('mapel').select('*').eq('kelas_id', kelasId).order('urutan');
      
      if (mapelError) {
        console.error('Error fetching mapel:', mapelError);
        return;
      }
      
      // 2. Ambil Data Nilai Baru
      const { data: nilaiLMData, error: lmError } = await supabase.from('nilai_lingkup_materi').select('*').eq('siswa_id', selectedSiswaId);
      const { data: nilaiSASData, error: sasError } = await supabase.from('nilai_sas').select('*').eq('siswa_id', selectedSiswaId);
      const { data: absensiData, error: absenError } = await supabase.from('absensi').select('*').eq('siswa_id', selectedSiswaId);
      const { data: pancasilaData, error: pancasilaError } = await supabase.from('profil_pancasila').select('*').eq('siswa_id', selectedSiswaId);
      const { data: ekskulData, error: ekskulError } = await supabase.from('nilai_ekskul').select('*, ekskul:ekskul_id(nama, jenis)').eq('siswa_id', selectedSiswaId);
      const { data: raporExisting, error: raporError } = await supabase.from('rapor').select('*').eq('siswa_id', selectedSiswaId).eq('semester', 'Ganjil').limit(1);

      const nilaiPerMapel = [];

      // 3. Proses Per Mapel
      for (const mapel of mapelList || []) {
        // Ambil LM & TP untuk mapel ini
        const { data: lmList, error: lmDetailError } = await supabase.from('lingkup_materi').select('*').eq('mapel_id', mapel.id).order('urutan');
        
        if (lmDetailError) {
          console.error(`Error fetching lingkup_materi for mapel ${mapel.id}:`, lmDetailError);
          continue;
        }
        
        const { data: tpList, error: tpError } = await supabase.from('tujuan_pembelajaran').select('*').in('lingkup_materi_id', (lmList || []).map(l => l.id)).order('urutan');
        
        if (tpError) {
          console.error(`Error fetching tujuan_pembelajaran:`, tpError);
        }

        // Filter LM sesuai agama siswa
        const relevantLMs = (lmList || []).filter(lm => lm.kategori === agamaSiswa || lm.kategori === 'Umum');
        
        if (relevantLMs.length === 0) continue; // Skip jika tidak ada LM yang relevan

        let sumLM = 0;
        let countLM = 0;
        let highestLM = null;
        let lowestLM = null;

        // Hitung rata-rata LM & cari LM tertinggi/terendah
        relevantLMs.forEach(lm => {
          const nilai = nilaiLMData?.find(n => n.lingkup_materi_id === lm.id)?.angka || 0;
          if (nilai > 0) {
            sumLM += nilai;
            countLM++;
            
            if (!highestLM || nilai > highestLM.nilai) highestLM = { ...lm, nilai };
            if (!lowestLM || nilai < lowestLM.nilai) lowestLM = { ...lm, nilai };
          }
        });

        const avgLM = countLM > 0 ? (sumLM / countLM) : 0;
        const nilaiSAS = nilaiSASData?.find(n => n.mapel_id === mapel.id)?.angka || 0;

        // Rumus Final: (Rata-rata LM + SAS) / 2
        let nilaiAkhir = 0;
        if (countLM > 0 && nilaiSAS > 0) {
          nilaiAkhir = Math.round((avgLM + nilaiSAS) / 2);
        } else if (countLM > 0) {
          nilaiAkhir = Math.round(avgLM); // Fallback jika SAS belum ada
        }

        // 4. Generate Deskripsi Otomatis (Mengambil teks TP dari LM tertinggi/terendah)
        const namaDepan = siswa.nama.split(' ')[0];
        let deskripsiTertinggi = '';
        let deskripsiTerendah = '';

        if (highestLM) {
          // Ambil TP pertama dari LM tertinggi sebagai representasi
          const tpRep = tpList?.find(tp => tp.lingkup_materi_id === highestLM.id);
          const teksTP = tpRep ? tpRep.teks.toLowerCase() : highestLM.nama.toLowerCase();
          const templates = [
            `Ananda ${namaDepan} menunjukkan penguasaan dalam ${teksTP}.`,
            `Ananda ${namaDepan} menunjukkan pemahaman yang sangat baik dalam ${teksTP}.`,
            `Ananda ${namaDepan} sudah mahir dalam ${teksTP}.`
          ];
          deskripsiTertinggi = templates[Math.floor(Math.random() * templates.length)];
        }

        if (lowestLM) {
          // Ambil TP pertama dari LM terendah sebagai representasi area perbaikan
          const tpRep = tpList?.find(tp => tp.lingkup_materi_id === lowestLM.id);
          const teksTP = tpRep ? tpRep.teks.toLowerCase() : lowestLM.nama.toLowerCase();
          const templates = [
            `Ananda ${namaDepan} membutuhkan bimbingan dalam ${teksTP}.`,
            `Ananda ${namaDepan} perlu penguatan lebih lanjut dalam ${teksTP}.`,
            `Ananda ${namaDepan} sudah berkembang, namun perlu latihan lebih dalam ${teksTP}.`
          ];
          deskripsiTerendah = templates[Math.floor(Math.random() * templates.length)];
        }

        nilaiPerMapel.push({
          nama: mapel.nama,
          nilaiAkhir,
          deskripsi: `${deskripsiTertinggi} ${deskripsiTerendah}`, // Digabung jadi 1 paragraf utuh seperti contoh rapor
          deskripsiTertinggi,
          deskripsiTerendah
        });
      }

      // 5. Rekap Kehadiran
      const rekapTotal = { H: 0, S: 0, I: 0, A: 0 };
      absensiData?.forEach(absen => { rekapTotal[absen.status] = (rekapTotal[absen.status] || 0) + 1; });

      // 6. Generate Narasi Kokurikuler (Profil Pancasila)
      let narasiKokurikuler = '';
      if (pancasilaData && pancasilaData.length > 0) {
        const tertinggi = pancasilaData.find(p => p.predikat === 'SB') || pancasilaData[0];
        const terendah = pancasilaData.find(p => p.predikat === 'BB' || p.predikat === 'MB') || pancasilaData[pancasilaData.length - 1];
        narasiKokurikuler = `Ananda ${namaDepan} sudah mahir dalam penerapan subdimensi ${tertinggi?.subdimensi?.toLowerCase() || 'Profil Pelajar Pancasila'}, hal tersebut terlihat pada kegiatan ${tertinggi?.kegiatan?.toLowerCase() || 'pembelajaran sehari-hari'} dan sudah mulai berkembang dalam penerapan subdimensi ${terendah?.subdimensi?.toLowerCase() || 'dimensi lainnya'}, hal tersebut terlihat pada kegiatan ${terendah?.kegiatan?.toLowerCase() || 'aktivitas kelas'}.`;
      }

      setRaporData({ nilaiPerMapel, rekapTotal, pancasilaData: pancasilaData || [], ekskulData: ekskulData || [], narasiKokurikuler });

      if (raporExisting && raporExisting.length > 0) {
        const r = raporExisting[0];
        setCatatanWali(r.catatan_wali || '');
        setStatusKenaikan(r.status_kenaikan || '');
        setNomorRapor(r.nomor_rapor || '');
        setTanggalPenetapan(r.tanggal_penetapan || '');
        setKotaPenetapan(r.kota_penetapan || '');
        setTanggapanOrtu(r.tanggapan_ortu || '');
      }
    };
    fetchRapor();
  }, [selectedSiswaId, kelasId, siswaList]);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('rapor').delete().eq('siswa_id', selectedSiswaId).eq('semester', 'Ganjil');
    const { error } = await supabase.from('rapor').insert({
      siswa_id: selectedSiswaId, semester: 'Ganjil', status: 'Draft',
      catatan_wali: catatanWali, status_kenaikan: statusKenaikan,
      nomor_rapor: nomorRapor, tanggal_penetapan: tanggalPenetapan || null,
      kota_penetapan: kotaPenetapan, tanggapan_ortu: tanggapanOrtu
    });
    if (error) alert('Gagal: ' + error.message);
    else alert('✅ Data rapor berhasil disimpan!');
    setSaving(false);
  };

  const getPredikat = (angka) => {
    if (angka >= 90) return { label: 'A', text: 'Sangat Baik', color: 'bg-[#F0FDF4] text-[#059669]' };
    if (angka >= 80) return { label: 'B', text: 'Baik', color: 'bg-[#EFF6FF] text-[#0369A1]' };
    if (angka >= 70) return { label: 'C', text: 'Cukup', color: 'bg-[#FFFBEB] text-[#D97706]' };
    return { label: 'D', text: 'Perlu Bimbingan', color: 'bg-[#FEF2F2] text-[#DC2626]' };
  };

    if (loading || !profile || !kelasId) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3]"></div></div>;
  
  const selectedSiswa = siswaList.find(s => s.id === selectedSiswaId);

  // Fungsi Bulk Export PDF
  const handleBulkExport = async () => {
    if (siswaList.length === 0) {
      alert('Tidak ada siswa untuk diekspor.');
      return;
    }

    setBulkExporting(true);
    setBulkProgress({ current: 0, total: siswaList.length });

    try {
      const zip = new JSZip();
      const raporFolder = zip.folder('Rapor_Semua_Siswa');

      for (let i = 0; i < siswaList.length; i++) {
        const siswa = siswaList[i];
        setBulkProgress({ current: i + 1, total: siswaList.length });

        // Fetch data rapor untuk siswa ini (sama seperti useEffect fetchRapor)
        const agamaSiswa = siswa.agama || 'Umum';
        const { data: mapelList } = await supabase.from('mapel').select('*').eq('kelas_id', kelasId).order('urutan');
        const { data: nilaiLMData } = await supabase.from('nilai_lingkup_materi').select('*').eq('siswa_id', siswa.id);
        const { data: nilaiSASData } = await supabase.from('nilai_sas').select('*').eq('siswa_id', siswa.id);
        const { data: absensiData } = await supabase.from('absensi').select('*').eq('siswa_id', siswa.id);
        const { data: pancasilaData } = await supabase.from('profil_pancasila').select('*').eq('siswa_id', siswa.id);
        const { data: ekskulData } = await supabase.from('nilai_ekskul').select('*, ekskul:ekskul_id(nama, jenis)').eq('siswa_id', siswa.id);
        const { data: raporExisting } = await supabase.from('rapor').select('*').eq('siswa_id', siswa.id).eq('semester', 'Ganjil').limit(1);

        const nilaiPerMapel = [];
        const namaDepan = siswa.nama.split(' ')[0];

        for (const mapel of mapelList || []) {
          const { data: lmList } = await supabase.from('lingkup_materi').select('*').eq('mapel_id', mapel.id).order('urutan');
          const { data: tpList } = await supabase.from('tujuan_pembelajaran').select('*').in('lingkup_materi_id', (lmList || []).map(l => l.id)).order('urutan');
          const relevantLMs = (lmList || []).filter(lm => lm.kategori === agamaSiswa || lm.kategori === 'Umum');
          
          if (relevantLMs.length === 0) continue;

          let sumLM = 0, countLM = 0, highestLM = null, lowestLM = null;

          relevantLMs.forEach(lm => {
            const nilai = nilaiLMData?.find(n => n.lingkup_materi_id === lm.id)?.angka || 0;
            if (nilai > 0) {
              sumLM += nilai;
              countLM++;
              if (!highestLM || nilai > highestLM.nilai) highestLM = { ...lm, nilai };
              if (!lowestLM || nilai < lowestLM.nilai) lowestLM = { ...lm, nilai };
            }
          });

          const avgLM = countLM > 0 ? (sumLM / countLM) : 0;
          const nilaiSAS = nilaiSASData?.find(n => n.mapel_id === mapel.id)?.angka || 0;
          let nilaiAkhir = 0;
          if (countLM > 0 && nilaiSAS > 0) {
            nilaiAkhir = Math.round((avgLM + nilaiSAS) / 2);
          } else if (countLM > 0) {
            nilaiAkhir = Math.round(avgLM);
          }

          let deskripsiTertinggi = '', deskripsiTerendah = '';
          if (highestLM) {
            const tpRep = tpList?.find(tp => tp.lingkup_materi_id === highestLM.id);
            const teksTP = tpRep ? tpRep.teks.toLowerCase() : highestLM.nama.toLowerCase();
            deskripsiTertinggi = `Ananda ${namaDepan} menunjukkan penguasaan dalam ${teksTP}.`;
          }
          if (lowestLM) {
            const tpRep = tpList?.find(tp => tp.lingkup_materi_id === lowestLM.id);
            const teksTP = tpRep ? tpRep.teks.toLowerCase() : lowestLM.nama.toLowerCase();
            deskripsiTerendah = `Ananda ${namaDepan} membutuhkan bimbingan dalam ${teksTP}.`;
          }

          nilaiPerMapel.push({ nama: mapel.nama, nilaiAkhir, deskripsiTertinggi, deskripsiTerendah, deskripsi: `${deskripsiTertinggi} ${deskripsiTerendah}` });
        }

        const rekapTotal = { H: 0, S: 0, I: 0, A: 0 };
        absensiData?.forEach(absen => { rekapTotal[absen.status] = (rekapTotal[absen.status] || 0) + 1; });

        let narasiKokurikuler = '';
        if (pancasilaData && pancasilaData.length > 0) {
          const tertinggi = pancasilaData.find(p => p.predikat === 'SB') || pancasilaData[0];
          const terendah = pancasilaData.find(p => p.predikat === 'BB' || p.predikat === 'MB') || pancasilaData[pancasilaData.length - 1];
          narasiKokurikuler = `Ananda ${namaDepan} sudah mahir dalam penerapan subdimensi ${tertinggi?.subdimensi?.toLowerCase() || 'Profil Pelajar Pancasila'}, hal tersebut terlihat pada kegiatan ${tertinggi?.kegiatan?.toLowerCase() || 'pembelajaran sehari-hari'} dan sudah mulai berkembang dalam penerapan subdimensi ${terendah?.subdimensi?.toLowerCase() || 'dimensi lainnya'}, hal tersebut terlihat pada kegiatan ${terendah?.kegiatan?.toLowerCase() || 'aktivitas kelas'}.`;
        }

        const siswaRaporData = { nilaiPerMapel, rekapTotal, pancasilaData: pancasilaData || [], ekskulData: ekskulData || [], narasiKokurikuler };
        const raporInfo = raporExisting && raporExisting.length > 0 ? raporExisting[0] : { catatan_wali: '', status_kenaikan: '', nomor_rapor: '', tanggal_penetapan: '', kota_penetapan: '', tanggapan_ortu: '' };

        // Generate PDF blob
        const pdfBlob = await RaporPDFTemplate({ 
          siswa, 
          raporData: siswaRaporData, 
          raporInfo, 
          sekolah: sekolahData, 
          guru: guruData 
        }).toBlob();

        const fileName = `Rapor-${siswa.nama.replace(/\s+/g, '_')}.pdf`;
        raporFolder.file(fileName, pdfBlob);
      }

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Rapor_Semua_Siswa_${new Date().toISOString().split('T')[0]}.zip`);
      alert(`✅ Berhasil mengekspor ${siswaList.length} rapor!`);
    } catch (err) {
      console.error('Error bulk export:', err);
      alert('❌ Gagal mengekspor rapor: ' + err.message);
    } finally {
      setBulkExporting(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  // Fungsi kirim via WhatsApp
  const handleKirimWA = () => {
    if (!selectedSiswa || !raporData) return;
    
    const namaSiswa = selectedSiswa.nama;
    const pesan = `Yth. Orang Tua/Wali Murid,\n\nBerikut adalah rapor ananda ${namaSiswa} untuk semester Ganjil Tahun Pelajaran 2025/2026.\n\nSilakan hubungi wali kelas jika ada yang perlu didiskusikan.\n\nTerima kasih.`;
    
    const encodedPesan = encodeURIComponent(pesan);
    const waLink = `https://wa.me/?text=${encodedPesan}`;
    
    window.open(waLink, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">📋 Preview & Cetak Rapor</h1>
          <p className="text-[#64748B] mt-1">Format resmi Kurikulum Merdeka - Siap cetak dan dikirim ke orang tua</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>📥 Import Excel</Button>
          <Button variant="secondary" onClick={() => setShowTambahModal(true)}>➕ Tambah Siswa</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : '💾 Simpan'}</Button>
          <Button onClick={handleBulkExport} disabled={bulkExporting || siswaList.length === 0}>
            {bulkExporting ? `⏳ ${bulkProgress.current}/${bulkProgress.total}` : '📦 Download Semua Rapor'}
          </Button>
          {selectedSiswa && raporData && (
            <>
              <Button variant="secondary" onClick={handleKirimWA}>💬 Kirim WA</Button>
              <PDFDownloadLink
                document={<RaporPDF siswa={selectedSiswa} raporData={raporData} raporInfo={{ catatan_wali: catatanWali, status_kenaikan: statusKenaikan, nomor_rapor: nomorRapor, tanggal_penetapan: tanggalPenetapan, kota_penetapan: kotaPenetapan, tanggapan_ortu: tanggapanOrtu }} sekolah={sekolahData} guru={guruData} getPredikat={getPredikat} />}
                fileName={`Rapor-${selectedSiswa.nama.replace(/\s+/g, '_')}.pdf`}
                className="px-6 py-2.5 bg-[#2D5BE3] text-white rounded-lg font-medium hover:bg-[#1E40AF] transition-all inline-flex items-center gap-2"
              >
                {({ loading }) => loading ? 'Menyiapkan...' : '📥 Download PDF'}
              </PDFDownloadLink>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar Bulk Export */}
      {bulkExporting && (
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#2D5BE3] h-full transition-all duration-300"
                style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-[#64748B] whitespace-nowrap">
              {bulkProgress.current} dari {bulkProgress.total} siswa
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">⏳ Mohon tunggu, sedang membuat PDF untuk semua siswa...</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <select value={selectedSiswaId} onChange={(e) => setSelectedSiswaId(e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg">
          {siswaList.map(s => <option key={s.id} value={s.id}>{s.nama} ({s.agama || 'Umum'}) - NISN: {s.nisn || '-'}</option>)}
        </select>
      </div>

      {/* Modals */}
      <ImportSiswaModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onSuccess={() => {
          // Refresh siswa list
          supabase.from('siswa').select('*').eq('kelas_id', kelasId).order('nama').then(({ data }) => {
            if (data) setSiswaList(data);
          });
          setShowImportModal(false);
        }}
        kelasId={kelasId}
      />
      
      <TambahSiswaModal
        isOpen={showTambahModal}
        onClose={() => setShowTambahModal(false)}
        onSuccess={() => {
          supabase.from('siswa').select('*').eq('kelas_id', kelasId).order('nama').then(({ data }) => {
            if (data) setSiswaList(data);
          });
          setShowTambahModal(false);
        }}
        kelasId={kelasId}
      />

      {selectedSiswa && raporData && (
        <div className="bg-white rounded-xl border-2 border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#2D5BE3] to-[#7C3AED] text-white p-8 text-center">
            {sekolahData && <><h3 className="text-xl font-bold mb-1">{sekolahData.nama}</h3><p className="text-sm opacity-90">{sekolahData.alamat}</p></>}
            <div className="mt-4 pt-4 border-t border-white/20">
              <h2 className="text-3xl font-bold">LAPORAN HASIL BELAJAR (RAPOR)</h2>
            </div>
          </div>

          {/* IDENTITAS */}
          <div className="p-8 border-b border-[#E2E8F0]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="text-[#64748B]">Nama Peserta Didik</span> <span className="font-semibold">: {selectedSiswa.nama}</span></div>
              <div><span className="text-[#64748B]">NISN</span> <span className="font-semibold">: {selectedSiswa.nisn || '-'}</span></div>
              <div><span className="text-[#64748B]">Kelas</span> <span className="font-semibold">: {kelasId ? 'Kelas' : '-'}</span></div>
              <div><span className="text-[#64748B]">Tahun Pelajaran</span> <span className="font-semibold">: 2025/2026</span></div>
            </div>
          </div>

          {/* NILAI AKADEMIK */}
          <div className="p-8 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Nilai Akademik</h3>
            {raporData.nilaiPerMapel.length === 0 ? (
              <p className="text-center text-[#64748B] py-8">Belum ada data nilai untuk siswa ini.</p>
            ) : (
              <table className="w-full text-sm border border-[#E2E8F0]">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-4 py-3 text-left w-10 border-r border-[#E2E8F0]">No</th>
                    <th className="px-4 py-3 text-left border-r border-[#E2E8F0]">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-center w-24 border-r border-[#E2E8F0]">Nilai Akhir</th>
                    <th className="px-4 py-3 text-left">Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody>
                  {raporData.nilaiPerMapel.map((mapel, idx) => {
                    const pred = getPredikat(mapel.nilaiAkhir);
                    return (
                      <tr key={idx} className="border-b border-[#E2E8F0]">
                        <td className="px-4 py-4 border-r border-[#E2E8F0] text-center">{idx + 1}</td>
                        <td className="px-4 py-4 font-medium border-r border-[#E2E8F0]">{mapel.nama}</td>
                        <td className="px-4 py-4 text-center font-bold border-r border-[#E2E8F0]">{mapel.nilaiAkhir || '-'}</td>
                        <td className="px-4 py-4 text-xs leading-relaxed text-[#334155]">
                          {mapel.deskripsi || 'Belum ada data penilaian.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* EKSTRAKURIKULER */}
          {raporData.ekskulData.length > 0 && (
            <div className="p-8 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Ekstrakurikuler</h3>
              <table className="w-full text-sm border border-[#E2E8F0]">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-4 py-3 text-left w-10 border-r border-[#E2E8F0]">No</th>
                    <th className="px-4 py-3 text-left border-r border-[#E2E8F0]">Ekstrakurikuler</th>
                    <th className="px-4 py-3 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {raporData.ekskulData.map((item, idx) => (
                    <tr key={item.id} className="border-b border-[#E2E8F0]">
                      <td className="px-4 py-4 border-r border-[#E2E8F0] text-center">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium border-r border-[#E2E8F0]">{item.ekskul?.nama}</td>
                      <td className="px-4 py-4 text-xs leading-relaxed text-[#334155]">({item.predikat}): {item.deskripsi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* KOKURIKULER */}
          {raporData.narasiKokurikuler && (
            <div className="p-8 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Kokurikuler</h3>
              <p className="text-sm text-[#334155] leading-relaxed">{raporData.narasiKokurikuler}</p>
            </div>
          )}

          {/* KEPUTUSAN */}
          <div className="p-8 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Keputusan</h3>
            <p className="text-sm text-[#334155]">Berdasarkan pencapaian seluruh kompetensi peserta didik dinyatakan: <strong>{statusKenaikan || 'Naik/ Tinggal *'}</strong> kelas</p>
            <p className="text-xs text-[#64748B] mt-1">(*) coret yang tidak perlu</p>
          </div>

          {/* TANGGAPAN ORANG TUA */}
          <div className="p-8 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Tanggapan Orang Tua/ Wali Murid</h3>
            <textarea value={tanggapanOrtu} onChange={(e) => setTanggapanOrtu(e.target.value)} rows="3" className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm" placeholder="(Diisi oleh orang tua/wali murid)" />
          </div>

          {/* CATATAN WALI KELAS */}
          <div className="p-8 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Catatan Wali Kelas</h3>
            <textarea value={catatanWali} onChange={(e) => setCatatanWali(e.target.value)} rows="3" className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm" placeholder="Catatan perkembangan siswa..." />
          </div>

          {/* KETIDAKHADIRAN */}
          <div className="p-8 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-[#2D5BE3] uppercase tracking-wide mb-4">Ketidakhadiran</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-[#FFFBEB] p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-[#D97706]">{raporData.rekapTotal?.S || 0}</p>
                <p className="text-xs text-[#64748B] mt-1">Sakit (hari)</p>
              </div>
              <div className="bg-[#EFF6FF] p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-[#0369A1]">{raporData.rekapTotal?.I || 0}</p>
                <p className="text-xs text-[#64748B] mt-1">Izin (hari)</p>
              </div>
              <div className="bg-[#FEF2F2] p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-[#DC2626]">{raporData.rekapTotal?.A || 0}</p>
                <p className="text-xs text-[#64748B] mt-1">Tanpa Keterangan (hari)</p>
              </div>
            </div>
          </div>

          {/* TANDA TANGAN */}
          <div className="p-8">
            <div className="grid grid-cols-2 gap-8 text-sm text-center">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala Sekolah</p>
                <div className="h-20"></div>
                <p className="font-bold border-b border-black inline-block px-4">{sekolahData?.kepala_sekolah_nama || 'Nama Kepala Sekolah'}</p>
                <p className="text-xs text-[#64748B]">NIP. {sekolahData?.kepala_sekolah_nip || '-'}</p>
              </div>
              <div>
                <p>{kotaPenetapan || 'Kota'}, {tanggalPenetapan || '___ ___ 2026'}</p>
                <p className="font-semibold">Wali Kelas</p>
                <div className="h-20"></div>
                <p className="font-bold border-b border-black inline-block px-4">{guruData?.nama || 'Nama Wali Kelas'}</p>
                <p className="text-xs text-[#64748B]">NIP. {guruData?.nip || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
