'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';

/**
 * Hook untuk mengelola data awal manajemen kelas
 */
export function useManajemenData(profile, fetchSession, searchParams) {
  const [kelasId, setKelasId] = useState('');
  const [mapelList, setMapelList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [activeTab, setActiveTab] = useState('absensi');

  useEffect(() => {
    const initData = async () => {
      if (!profile) await fetchSession();
      if (profile?.id) {
        setLoading(true);
        const { data: kelasData, error: kelasError } = await supabase
          .from('kelas')
          .select('id')
          .eq('guru_id', profile.id)
          .limit(1);

        if (kelasError) {
          console.error('Error fetching kelas:', kelasError);
          alert('Gagal memuat data kelas: ' + kelasError.message);
          setLoading(false);
          return;
        }

        if (kelasData?.length > 0) {
          const cId = kelasData[0].id;
          setKelasId(cId);

          const { data: mapel, error: mapelError } = await supabase
            .from('mapel')
            .select('*')
            .eq('kelas_id', cId)
            .order('urutan');

          if (mapelError) {
            console.error('Error fetching mapel:', mapelError);
          } else {
            setMapelList(mapel || []);
          }

          const { data: siswa, error: siswaError } = await supabase
            .from('siswa')
            .select('id, nama, nis, nisn')
            .eq('kelas_id', cId)
            .order('nama');

          if (siswaError) {
            console.error('Error fetching siswa:', siswaError);
          } else {
            setSiswaList(siswa || []);
          }

          const mapelParam = searchParams.get('mapel');
          const tabParam = searchParams.get('tab');
          if (mapelParam && mapel?.find(m => m.id === mapelParam)) {
            setSelectedMapel(mapelParam);
          } else if (mapel?.length > 0) {
            setSelectedMapel(mapel[0].id);
          }
          if (tabParam) setActiveTab(tabParam);
        }
        setLoading(false);
      }
    };
    initData();
  }, [profile, fetchSession, searchParams]);

  return {
    kelasId,
    mapelList,
    siswaList,
    loading,
    selectedMapel,
    setSelectedMapel,
    activeTab,
    setActiveTab
  };
}

/**
 * Hook untuk mengelola TP (Tujuan Pembelajaran)
 */
export function useTujuanPembelajaran(selectedMapel) {
  const [tpList, setTpList] = useState([]);

  useEffect(() => {
    const loadTP = async () => {
      if (!selectedMapel) {
        setTpList([]);
        return;
      }

      const { data: elemenData, error: elemenError } = await supabase
        .from('elemen_cp')
        .select('id')
        .eq('mapel_id', selectedMapel);

      if (elemenError) {
        console.error('Error fetching elemen_cp:', elemenError);
        setTpList([]);
        return;
      }

      if (elemenData?.length > 0) {
        const elemenIds = elemenData.map(e => e.id);
        const { data: tpData, error: tpError } = await supabase
          .from('tujuan_pembelajaran')
          .select('*')
          .in('elemen_cp_id', elemenIds)
          .order('urutan_global');

        if (tpError) {
          console.error('Error fetching tujuan_pembelajaran:', tpError);
        }
        setTpList(tpData || []);
      } else {
        setTpList([]);
      }
    };
    loadTP();
  }, [selectedMapel]);

  return { tpList };
}

/**
 * Hook untuk mengelola modul ajar dan bahan ajar
 */
export function useMateriAjar(selectedMapel) {
  const [modulAjarList, setModulAjarList] = useState([]);
  const [bahanAjarList, setBahanAjarList] = useState([]);
  const [selectedModul, setSelectedModul] = useState('');
  const [loadingMateri, setLoadingMateri] = useState(false);

  useEffect(() => {
    const loadModul = async () => {
      if (!selectedMapel) {
        setModulAjarList([]);
        return;
      }

      const { data: elemenData, error: elemenError } = await supabase
        .from('elemen_cp')
        .select('id')
        .eq('mapel_id', selectedMapel);

      if (elemenError) {
        console.error('Error fetching elemen_cp:', elemenError);
        setModulAjarList([]);
        return;
      }

      if (elemenData?.length > 0) {
        const elemenIds = elemenData.map(e => e.id);
        const { data, error: modulError } = await supabase
          .from('modul_ajar')
          .select(`
            *,
            tujuan_pembelajaran (kode_tp, teks),
            bahan_ajar (*)
          `)
          .in('tujuan_pembelajaran.elemen_cp_id', elemenIds)
          .order('created_at', { ascending: false });

        if (modulError) {
          console.error('Error fetching modul_ajar:', modulError);
          setModulAjarList([]);
          return;
        }

        if (data) {
          const modulFiltered = data.filter(m => {
            const tp = m.tujuan_pembelajaran;
            return tp && elemenIds.includes(tp.elemen_cp_id);
          });
          setModulAjarList(modulFiltered);
        } else {
          setModulAjarList([]);
        }
      } else {
        setModulAjarList([]);
      }
    };
    loadModul();
  }, [selectedMapel]);

  useEffect(() => {
    const loadBahanAjar = async () => {
      if (!selectedModul) {
        setBahanAjarList([]);
        return;
      }

      setLoadingMateri(true);
      const { data } = await supabase
        .from('bahan_ajar')
        .select('*')
        .eq('modul_ajar_id', selectedModul)
        .order('created_at', { ascending: false });

      setBahanAjarList(data || []);
      setLoadingMateri(false);
    };
    loadBahanAjar();
  }, [selectedModul]);

  return {
    modulAjarList,
    bahanAjarList,
    selectedModul,
    setSelectedModul,
    loadingMateri
  };
}
