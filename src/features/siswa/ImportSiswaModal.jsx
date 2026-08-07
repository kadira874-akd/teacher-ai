'use client';
import { useState, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import Button from '@/components/ui/Button';
import * as XLSX from 'xlsx';

/**
 * Modal Import Siswa dari Excel/CSV
 * Fitur "Anti-Ribet" untuk guru import data siswa massal
 */
export default function ImportSiswaModal({ isOpen, onClose, onSuccess, kelasId }) {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [fileError, setFileError] = useState('');
  const [importStep, setImportStep] = useState('upload'); // upload | preview | importing

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setFileError('Format file tidak didukung. Gunakan Excel (.xlsx) atau CSV.');
      return;
    }

    setLoading(true);
    setFileError('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      if (jsonData.length < 2) {
        setFileError('File kosong atau tidak ada data.');
        setLoading(false);
        return;
      }

      // Parse header dan data
      const headers = jsonData[0].map(h => String(h).toLowerCase().trim());
      const requiredFields = ['nama', 'nisn'];
      const missingFields = requiredFields.filter(field => 
        !headers.some(h => h.includes(field))
      );

      if (missingFields.length > 0) {
        setFileError(`Kolom wajib belum ada: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Mapping data berdasarkan header yang fleksibel
      const mappedData = jsonData.slice(1).map((row, index) => {
        const getData = (keywords) => {
          for (let i = 0; i < headers.length; i++) {
            if (keywords.some(k => headers[i].includes(k))) {
              return row[i] || '';
            }
          }
          return '';
        };

        return {
          rowNumber: index + 2,
          nama: getData(['nama', 'name', 'siswa']) || `Siswa ${index + 1}`,
          nisn: String(getData(['nisn'])).trim(),
          nis: String(getData(['nis', 'nomor induk'])).trim(),
          tempat_lahir: getData(['tempat lahir', 'tmp lahir']),
          tanggal_lahir: parseTanggal(getData(['tanggal lahir', 'tgl lahir', 'lahir'])),
          jenis_kelamin: parseJenisKelamin(getData(['jenis kelamin', 'jk', 'gender'])),
          agama: getData(['agama']),
          alamat: getData(['alamat']),
          no_telepon: parseNoTelepon(getData(['no telepon', 'hp', 'telepon', 'phone'])),
          nama_ayah: getData(['ayah', 'nama ayah']),
          nama_ibu: getData(['ibu', 'nama ibu']),
          pekerjaan_ayah: getData(['pekerjaan ayah']),
          pekerjaan_ibu: getData(['pekerjaan ibu']),
          isValid: true,
          error: ''
        };
      }).filter(row => row.nama); // Filter baris kosong

      // Validasi duplikasi NISN
      const nisnMap = new Map();
      mappedData.forEach((row, idx) => {
        if (row.nisn && nisnMap.has(row.nisn)) {
          row.isValid = false;
          row.error = `NISN duplikat dengan baris ${nisnMap.get(row.nisn)}`;
        } else if (row.nisn) {
          nisnMap.set(row.nisn, idx + 2);
        }
      });

      setPreviewData(mappedData);
      setImportStep('preview');
    } catch (err) {
      console.error('Error parsing file:', err);
      setFileError('Gagal membaca file. Pastikan format Excel/CSV benar.');
    } finally {
      setLoading(false);
    }
  };

  const parseTanggal = (value) => {
    if (!value) return '';
    
    // Coba parse berbagai format tanggal
    if (typeof value === 'number') {
      // Excel date serial
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }
    
    const str = String(value).trim();
    
    // Format YYYY-MM-DD atau DD/MM/YYYY atau DD-MM-YYYY
    const match = str.match(/(\d{1,4})[-/](\d{1,2})[-/](\d{1,4})/);
    if (match) {
      let [_, part1, part2, part3] = match;
      
      // Deteksi format berdasarkan nilai
      if (parseInt(part1) > 31) {
        // YYYY-MM-DD
        return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
      } else if (parseInt(part3) > 31) {
        // DD/MM/YYYY
        return `${part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
      } else {
        // DD/MM/YY
        const year = parseInt(part3) > 50 ? `19${part3}` : `20${part3}`;
        return `${year}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
      }
    }
    
    return str;
  };

  const parseJenisKelamin = (value) => {
    if (!value) return 'Laki-laki';
    const str = String(value).toLowerCase().trim();
    if (['p', 'perempuan', 'wanita', 'female'].some(s => str.includes(s))) {
      return 'Perempuan';
    }
    return 'Laki-laki';
  };

  const parseNoTelepon = (value) => {
    if (!value) return '';
    // Bersihkan dari karakter non-numerik kecuali +
    return String(value).replace(/[^\d+]/g, '');
  };

  const handleImport = async () => {
    const validData = previewData.filter(row => row.isValid && row.nama && row.nisn);
    
    if (validData.length === 0) {
      alert('Tidak ada data valid untuk diimport.');
      return;
    }

    setImportStep('importing');
    setLoading(true);

    try {
      const insertData = validData.map(row => ({
        kelas_id: kelasId,
        nama: row.nama,
        nisn: row.nisn,
        nis: row.nis || null,
        tempat_lahir: row.tempat_lahir || null,
        tanggal_lahir: row.tanggal_lahir || null,
        jenis_kelamin: row.jenis_kelamin,
        agama: row.agama || 'Islam',
        alamat: row.alamat || null,
        no_telepon: row.no_telepon || null,
        nama_ayah: row.nama_ayah || null,
        nama_ibu: row.nama_ibu || null,
        pekerjaan_ayah: row.pekerjaan_ayah || null,
        pekerjaan_ibu: row.pekerjaan_ibu || null
      }));

      // Insert batch
      const { error } = await supabase.from('siswa').insert(insertData);

      if (error) throw error;

      alert(`✅ Berhasil mengimport ${validData.length} siswa!`);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error importing:', err);
      alert('❌ Gagal mengimport data: ' + err.message);
    } finally {
      setLoading(false);
      setImportStep('preview');
    }
  };

  const handleClose = () => {
    setPreviewData([]);
    setFileError('');
    setImportStep('upload');
    onClose();
  };

  if (!isOpen) return null;

  const validCount = previewData.filter(r => r.isValid).length;
  const invalidCount = previewData.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">📥 Import Data Siswa</h2>
            <p className="text-sm text-[#64748B] mt-1">
              {importStep === 'upload' && 'Upload file Excel (.xlsx) atau CSV'}
              {importStep === 'preview' && `Preview: ${validCount} valid, ${invalidCount} tidak valid`}
              {importStep === 'importing' && 'Sedang mengimport data...'}
            </p>
          </div>
          <button onClick={handleClose} className="text-[#64748B] hover:text-[#DC2626] text-2xl">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6">
          {importStep === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-semibold text-[#0F172A] mb-2">Upload File Excel/CSV</h3>
                <p className="text-sm text-[#64748B] mb-4">
                  Format kolom: Nama, NISN (wajib), NIS, Tempat Lahir, Tanggal Lahir, dll.
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-[#2D5BE3] text-white rounded-lg font-medium hover:bg-[#1E40AF] cursor-pointer transition-all"
                >
                  {loading ? 'Memproses...' : 'Pilih File'}
                </label>
              </div>

              {fileError && (
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 text-[#DC2626] text-sm">
                  ⚠️ {fileError}
                </div>
              )}

              <div className="bg-[#F8FAFC] rounded-lg p-4 text-xs text-[#64748B]">
                <h4 className="font-semibold mb-2">💡 Tips:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pastikan kolom <strong>Nama</strong> dan <strong>NISN</strong> ada</li>
                  <li>Format tanggal: DD/MM/YYYY atau YYYY-MM-DD</li>
                  <li>NISN harus unik (tidak boleh duplikat)</li>
                  <li>Data akan otomatis disesuaikan dengan format sistem</li>
                </ul>
              </div>
            </div>
          )}

          {importStep === 'preview' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-[#F0FDF4] text-[#059669] rounded-full text-sm font-medium">
                    ✓ {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-3 py-1 bg-[#FEF2F2] text-[#DC2626] rounded-full text-sm font-medium">
                      ⚠ {invalidCount} Invalid
                    </span>
                  )}
                </div>
                <Button onClick={handleImport} disabled={loading || validCount === 0}>
                  {loading ? 'Mengimport...' : `✅ Import ${validCount} Siswa`}
                </Button>
              </div>

              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F8FAFC] sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left border-b border-[#E2E8F0]">Status</th>
                        <th className="px-4 py-3 text-left border-b border-[#E2E8F0]">Nama</th>
                        <th className="px-4 py-3 text-left border-b border-[#E2E8F0]">NISN</th>
                        <th className="px-4 py-3 text-left border-b border-[#E2E8F0]">L/P</th>
                        <th className="px-4 py-3 text-left border-b border-[#E2E8F0]">Agama</th>
                        <th className="px-4 py-3 text-left border-b border-[#E2E8F0]">No. HP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx} className={`border-b border-[#E2E8F0] ${!row.isValid ? 'bg-[#FEF2F2]' : ''}`}>
                          <td className="px-4 py-3">
                            {row.isValid ? (
                              <span className="text-[#059669]">✓</span>
                            ) : (
                              <span className="text-[#DC2626]" title={row.error}>⚠</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">{row.nama}</td>
                          <td className="px-4 py-3">{row.nisn || '-'}</td>
                          <td className="px-4 py-3">{row.jenis_kelamin?.charAt(0)}</td>
                          <td className="px-4 py-3">{row.agama || '-'}</td>
                          <td className="px-4 py-3">{row.no_telepon || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {importStep === 'importing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5BE3] mx-auto mb-4"></div>
              <p className="text-[#64748B]">Mengimport data siswa...</p>
              <p className="text-xs text-[#64748B] mt-2">Mohon tunggu, jangan tutup halaman ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
