'use client';
import { useState, useMemo } from 'react';
import { getMapelListForDropdown, getFaseByKelas } from '@/config/curriculumDatabase';

/**
 * MapelSelector - Komponen dropdown dinamis untuk memilih mata pelajaran berdasarkan fase
 * 
 * Fitur:
 * - Dropdown fase kelas (A, B, C, D)
 * - Dropdown mata pelajaran sesuai kurikulum fase terpilih
 * - Panel mapel terpilih (bisa menambah beberapa mapel)
 * - Opsi tambah mapel manual jika tidak ada di daftar
 * - Mencegah kesalahan penulisan dengan menggunakan data kurikulum resmi
 * 
 * @param {Object} props
 * @param {Function} props.onMapelChange - Callback ketika mapel berubah
 * @param {Array} props.selectedMapel - Array mapel yang sudah dipilih
 * @param {string} props.faseAwal - Fase awal (opsional)
 * @param {boolean} props.allowMultiple - Izinkan memilih beberapa mapel (default: true)
 * @param {boolean} props.allowManual - Izinkan tambah mapel manual (default: true)
 */
export default function MapelSelector({ 
  onMapelChange, 
  selectedMapel = [], 
  faseAwal = 'faseB',
  allowMultiple = true,
  allowManual = true 
}) {
  const [fase, setFase] = useState(faseAwal);
  const [selectedMapelName, setSelectedMapelName] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualMapel, setManualMapel] = useState('');

  // Daftar mapel berdasarkan fase terpilih
  const mapelList = useMemo(() => {
    return getMapelListForDropdown(fase);
  }, [fase]);

  // Handle perubahan fase
  const handleFaseChange = (e) => {
    const newFase = e.target.value;
    setFase(newFase);
    setSelectedMapelName(''); // Reset pilihan mapel saat fase berubah
  };

  // Handle pemilihan mapel dari dropdown
  const handleMapelSelect = (e) => {
    const mapelName = e.target.value;
    setSelectedMapelName(mapelName);
    
    if (mapelName && allowMultiple) {
      // Tambahkan ke panel mapel terpilih
      if (!selectedMapel.some(m => m.nama === mapelName)) {
        const mapelData = mapelList.find(m => m.nama === mapelName);
        onMapelChange([...selectedMapel, { 
          nama: mapelName, 
          is_mapel_agama: mapelData?.is_mapel_agama || false,
          sumber: 'kurikulum'
        }]);
      }
      setSelectedMapelName(''); // Reset dropdown setelah pilih
    } else if (mapelName && !allowMultiple) {
      // Single select mode
      const mapelData = mapelList.find(m => m.nama === mapelName);
      onMapelChange([{ 
        nama: mapelName, 
        is_mapel_agama: mapelData?.is_mapel_agama || false,
        sumber: 'kurikulum'
      }]);
    }
  };

  // Handle tambah mapel manual
  const handleAddManualMapel = () => {
    if (manualMapel.trim() && !selectedMapel.some(m => m.nama.toLowerCase() === manualMapel.trim().toLowerCase())) {
      const newMapel = {
        nama: manualMapel.trim(),
        is_mapel_agama: manualMapel.toLowerCase().includes('agama'),
        sumber: 'manual'
      };
      
      if (allowMultiple) {
        onMapelChange([...selectedMapel, newMapel]);
      } else {
        onMapelChange([newMapel]);
      }
      
      setManualMapel('');
      setShowManualInput(false);
    }
  };

  // Handle hapus mapel dari panel terpilih
  const handleRemoveMapel = (mapelName) => {
    onMapelChange(selectedMapel.filter(m => m.nama !== mapelName));
  };

  // Handle enter key untuk input manual
  const handleManualKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddManualMapel();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector Fase */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📚 Pilih Fase Kurikulum
        </label>
        <select
          value={fase}
          onChange={handleFaseChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
        >
          <option value="faseA">Fase A (Kelas 1-2 SD)</option>
          <option value="faseB">Fase B (Kelas 3-4 SD)</option>
          <option value="faseC">Fase C (Kelas 5-6 SD)</option>
          <option value="faseD">Fase D (Kelas 7-9 SMP)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          💡 Pilih fase sesuai kelas siswa untuk menampilkan mata pelajaran yang sesuai kurikulum
        </p>
      </div>

      {/* Dropdown Mata Pelajaran */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📖 Pilih Mata Pelajaran
        </label>
        <div className="flex gap-2">
          <select
            value={selectedMapelName}
            onChange={handleMapelSelect}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            disabled={mapelList.length === 0}
          >
            <option value="">-- Pilih Mata Pelajaran --</option>
            {mapelList.map((mapel) => (
              <option 
                key={mapel.nama} 
                value={mapel.nama}
                disabled={allowMultiple && selectedMapel.some(m => m.nama === mapel.nama)}
              >
                {mapel.nama} {mapel.is_mapel_agama ? '🕌' : ''} ({mapel.total_tp} TP)
              </option>
            ))}
          </select>
          
          {allowManual && (
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
              title="Tambah mata pelajaran manual"
            >
              ➕ Manual
            </button>
          )}
        </div>
        
        {/* Input Manual */}
        {showManualInput && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg animate-fadeIn">
            <label className="block text-xs font-medium text-yellow-800 mb-1">
              ⚠️ Tambah Mata Pelajaran Manual
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualMapel}
                onChange={(e) => setManualMapel(e.target.value)}
                onKeyDown={handleManualKeyDown}
                placeholder="Ketik nama mata pelajaran..."
                className="flex-1 px-3 py-2 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddManualMapel}
                disabled={!manualMapel.trim()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Tambah
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowManualInput(false);
                  setManualMapel('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 transition-all"
              >
                Batal
              </button>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              ℹ️ Gunakan opsi ini hanya jika mata pelajaran tidak tersedia dalam kurikulum. Pastikan penulisan sesuai dengan nama resmi.
            </p>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          📋 Menampilkan {mapelList.length} mata pelajaran untuk {fase.replace('fase', 'Fase ')}
          {mapelList.filter(m => m.is_mapel_agama).length > 0 && ` • ${mapelList.filter(m => m.is_mapel_agama).length} mapel agama`}
        </p>
      </div>

      {/* Panel Mapel Terpilih */}
      {selectedMapel.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-blue-900">
              ✅ Mata Pelajaran Terpilih ({selectedMapel.length})
            </h4>
            {allowMultiple && (
              <button
                type="button"
                onClick={() => onMapelChange([])}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Hapus Semua
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {selectedMapel.map((mapel, index) => (
              <div
                key={`${mapel.nama}-${index}`}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-blue-100 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {mapel.is_mapel_agama ? '🕌' : '📚'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{mapel.nama}</p>
                    <p className="text-xs text-gray-500">
                      {mapel.sumber === 'manual' ? (
                        <span className="text-orange-600">⚠️ Manual</span>
                      ) : (
                        '✅ Dari Kurikulum'
                      )}
                    </p>
                  </div>
                </div>
                
                {allowMultiple && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMapel(mapel.nama)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                    title="Hapus mata pelajaran ini"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedMapel.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm text-gray-500">Belum ada mata pelajaran dipilih</p>
          <p className="text-xs text-gray-400 mt-1">Pilih mata pelajaran dari dropdown atau tambahkan manual</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
