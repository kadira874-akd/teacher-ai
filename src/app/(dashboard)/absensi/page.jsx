'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';

export default function AbsensiPage() {
  const { profile, fetchSession } = useAuthStore();
  const [kelasId, setKelasId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filter
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState(new Date().toISOString().split('T')[0]);
  
  // Data
  const [siswaList, setSiswaList] = useState([]);
  const [attendance, setAttendance] = useState({}); // { 'siswa_id': 'H' }

  // 1. Inisialisasi
  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      
      if (profile?.id) {
        setLoading(true);
        
        // Ambil kelas
        const { data: kelasData } = await supabase
          .from('kelas')
          .select('id')
          .eq('guru_id', profile.id)
          .limit(1);

        if (kelasData && kelasData.length > 0) {
          const currentKelasId = kelasData[0].id;
          setKelasId(currentKelasId);

          // Ambil mapel
          const { data: mapelData } = await supabase
            .from('mapel')
            .select('id, nama')
            .eq('kelas_id', currentKelasId)
            .order('urutan', { ascending: true });

          setMapelList(mapelData || []);
          if (mapelData && mapelData.length > 0) {
            setSelectedMapel(mapelData[0].id);
          }

          // Ambil siswa
          const { data: siswaData } = await supabase
            .from('siswa')
            .select('id, nama')
            .eq('kelas_id', currentKelasId)
            .order('nama', { ascending: true });
          
          setSiswaList(siswaData || []);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession]);

  // 2. Ambil absensi yang sudah ada untuk mapel & tanggal yang dipilih
  useEffect(() => {
    const loadAbsensi = async () => {
      if (!selectedMapel || !kelasId) return;

      const { data } = await supabase
        .from('absensi')
        .select('siswa_id, status')
        .eq('mapel_id', selectedMapel)
        .eq('tanggal', selectedTanggal);

      // Format ke object
      const formatted = {};
      data?.forEach(item => {
        formatted[item.siswa_id] = item.status;
      });
      
      // Default: semua siswa "H" (Hadir) jika belum ada data
      siswaList.forEach(siswa => {
        if (!formatted[siswa.id]) {
          formatted[siswa.id] = 'H';
        }
      });
      
      setAttendance(formatted);
    };

    loadAbsensi();
  }, [selectedMapel, selectedTanggal, kelasId, siswaList]);

  // 3. Handle perubahan status
  const handleStatusChange = (siswaId, status) => {
    setAttendance(prev => ({ ...prev, [siswaId]: status }));
  };

  // 4. Simpan absensi
  const handleSave = async () => {
    setSaving(true);
    
    // Siapkan payload
    const payload = Object.entries(attendance).map(([siswa_id, status]) => ({
      siswa_id,
      mapel_id: selectedMapel,
      tanggal: selectedTanggal,
      status
    }));

    // Upsert absensi
    const { error } = await supabase
      .from('absensi')
      .upsert(payload, { 
        onConflict: 'siswa_id,mapel_id,tanggal' 
      });

    if (error) {
      alert('Gagal menyimpan absensi: ' + error.message);
    } else {
      const mapelName = mapelList.find(m => m.id === selectedMapel)?.nama || 'Mapel';
      alert(`✅ Absensi ${mapelName} tanggal ${selectedTanggal} berhasil disimpan!`);
    }
    setSaving(false);
  };

  // Helper untuk styling tombol status
  const getStatusStyle = (currentStatus, targetStatus) => {
    const isMatch = currentStatus === targetStatus;
    const base = "px-3 py-1.5 rounded-md text-xs font-bold transition-all border ";
    
    switch (targetStatus) {
      case 'H': return base + (isMatch ? "bg-[#059669] text-white border-[#059669]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#059669]");
      case 'S': return base + (isMatch ? "bg-[#D97706] text-white border-[#D97706]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#D97706]");
      case 'I': return base + (isMatch ? "bg-[#0369A1] text-white border-[#0369A1]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0369A1]");
      case 'A': return base + (isMatch ? "bg-[#DC2626] text-white border-[#DC2626]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#DC2626]");
      default: return base;
    }
  };

  if (loading || !profile || !kelasId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5BE3] mb-3"></div>
          <p className="text-[#64748B]">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  if (mapelList.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-4xl mb-3">📚</p>
          <h3 className="text-lg font-semibold text-[#0F172A]">Belum ada mata pelajaran</h3>
          <p className="text-[#64748B] mt-2">Silakan pilih kurikulum terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  const selectedMapelName = mapelList.find(m => m.id === selectedMapel)?.nama || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Plus_Jakarta_Sans']">Absensi Per Mata Pelajaran</h1>
          <p className="text-[#64748B] mt-1">Catat kehadiran siswa per mata pelajaran dengan fleksibel.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="md:w-auto w-full">
          {saving ? 'Menyimpan...' : '💾 Simpan Absensi'}
        </Button>
      </div>

      {/* FILTER */}
      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Mata Pelajaran</label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
            >
              {mapelList.map(m => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Tanggal</label>
            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]"
            />
          </div>
        </div>
      </div>

      {/* INFO BOX */}
      <div className="bg-[#F0FDF4] border-l-4 border-[#059669] p-4 rounded-r-lg flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-[#059669]">Tip Cepat:</p>
          <p className="text-sm text-[#0369A1]">
            Secara default, semua siswa ditandai <strong>Hadir (H)</strong>. Anda hanya perlu mengklik <strong>S, I, atau A</strong> untuk siswa yang tidak hadir. 
            Tanggal bisa dipilih <strong>bebas</strong> (hari ini, tanggal lalu, atau tanggal depan).
          </p>
        </div>
      </div>

      {/* TABEL ABSENSI */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-sm font-bold text-[#2D5BE3]">
            Absensi {selectedMapelName} — Tanggal: {selectedTanggal}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#334155] w-16">No</th>
                <th className="px-6 py-4 font-semibold text-[#334155]">Nama Siswa</th>
                <th className="px-6 py-4 font-semibold text-[#334155] text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {siswaList.map((siswa, index) => (
                <tr key={siswa.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 text-[#64748B]">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-[#0F172A]">{siswa.nama}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {['H', 'S', 'I', 'A'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(siswa.id, status)}
                          className={getStatusStyle(attendance[siswa.id], status)}
                          title={
                            status === 'H' ? 'Hadir' : 
                            status === 'S' ? 'Sakit' : 
                            status === 'I' ? 'Izin' : 'Alpha'
                          }
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INFO TAMBAHAN */}
      <div className="bg-[#EFF6FF] border-l-4 border-[#0369A1] p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-[#0369A1] mb-1">💡 Fitur Fleksibel:</p>
        <ul className="text-sm text-[#334155] space-y-1 list-disc list-inside">
          <li>Absensi dicatat <strong>per mata pelajaran</strong> (lebih akurat)</li>
          <li>Tanggal bisa dipilih <strong>bebas</strong> (bisa input tanggal lalu)</li>
          <li>Sistem akan <strong>otomatis merekap</strong> total kehadiran per siswa untuk rapor</li>
          <li>Anda bisa <strong>input bertahap</strong> (absen Matematika hari ini, IPAS besok)</li>
        </ul>
      </div>
    </div>
  );
}