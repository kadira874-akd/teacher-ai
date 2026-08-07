"use client";

import { useState, useRef } from 'react';

// Komponen Helper untuk QR Code Sederhana (Menggunakan API publik untuk ringan)
// Dalam production nyata, gunakan library 'qrcode.react'
const QRCodeDisplay = ({ value, size = 150 }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  return <img src={qrUrl} alt="QR Code" className="rounded-md border-2 border-black" width={size} height={size} />;
};

export default function HalamanAbsensi() {
  const [activeTab, setActiveTab] = useState('input'); // input, cetak, scan
  const [siswa, setSiswa] = useState({ nis: '', nama: '', kelas: '', jurusan: '' });
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [hasilScan, setHasilScan] = useState(null);
  
  // Ref untuk area cetak
  const printRef = useRef();

  const handleInputChange = (e) => {
    setSiswa({ ...siswa, [e.target.name]: e.target.value });
  };

  const simpanSiswa = () => {
    if (!siswa.nis || !siswa.nama) return alert("Lengkapi data siswa!");
    const dataBaru = { ...siswa, id: Date.now(), qrString: `ABSEN-${siswa.nis}-${siswa.nama}` };
    setDaftarSiswa([...daftarSiswa, dataBaru]);
    setSiswa({ nis: '', nama: '', kelas: '', jurusan: '' });
    alert("Data tersimpan! Silakan tab 'Cetak Kartu'.");
  };

  const handleScanSimulasi = (e) => {
    // Simulasi input dari scanner QR (biasanya scanner bertindak seperti keyboard)
    const kode = e.target.value;
    if (kode.startsWith('ABSEN-')) {
      const parts = kode.split('-');
      const nis = parts[1];
      const nama = parts.slice(2).join(' ');
      
      setHasilScan({
        status: 'Hadir',
        waktu: new Date().toLocaleTimeString(),
        tanggal: new Date().toLocaleDateString(),
        nis,
        nama
      });
      
      // SIMULASI KIRIM KE ORANG TUA (WhatsApp Link)
      const pesan = `Yth. Wali Murid, Ananda ${nama} telah melakukan ABSENSI MASUK pada jam ${new Date().toLocaleTimeString()} dengan selamat.`;
      console.log("Mengirim WA:", pesan);
      
      e.target.value = ''; // Reset input
    }
  };

  const cetakKartu = (data) => {
    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.write(`
      <html><head><title>Kartu Absen ${data.nama}</title>
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .kartu { width: 320px; height: 200px; border: 2px solid #333; padding: 15px; border-radius: 10px; position: relative; background: #fff; }
        .header { font-weight: bold; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        .content { display: flex; gap: 10px; }
        .info { font-size: 12px; line-height: 1.4; }
        .qr { margin-left: auto; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
      </head><body>
        <div class="kartu">
          <div class="header">KARTU ABSENSI SISWA</div>
          <div class="content">
            <div class="info">
              <strong>NIS:</strong> ${data.nis}<br>
              <strong>Nama:</strong> ${data.nama}<br>
              <strong>Kelas:</strong> ${data.kelas}<br>
              <strong>Jurusan:</strong> ${data.jurusan}
            </div>
            <div class="qr">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${data.qrString}" />
            </div>
          </div>
          <div style="position:absolute; bottom:10px; left:15px; font-size:10px; color:#666;">Scan untuk absensi otomatis</div>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">📋 Sistem Absensi QR Code</h1>

      {/* Navigasi Tab */}
      <div className="flex gap-2 mb-6 border-b">
        {['input', 'cetak', 'scan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'input' ? '1. Input Data' : tab === 'cetak' ? '2. Cetak Kartu' : '3. Mode Scanner'}
          </button>
        ))}
      </div>

      {/* TAB 1: INPUT DATA */}
      {activeTab === 'input' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Input Data Siswa Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input dengan Kontras Tinggi (Perbaikan Forensik) */}
            <input name="nis" placeholder="NIS / NISN" value={siswa.nis} onChange={handleInputChange} 
              className="w-full p-3 border-2 border-[#CBD5E1] rounded-lg bg-white text-[#0F172A] font-medium focus:border-blue-500 outline-none" />
            <input name="nama" placeholder="Nama Lengkap" value={siswa.nama} onChange={handleInputChange} 
              className="w-full p-3 border-2 border-[#CBD5E1] rounded-lg bg-white text-[#0F172A] font-medium focus:border-blue-500 outline-none" />
            <input name="kelas" placeholder="Kelas (Contoh: XII RPL 1)" value={siswa.kelas} onChange={handleInputChange} 
              className="w-full p-3 border-2 border-[#CBD5E1] rounded-lg bg-white text-[#0F172A] font-medium focus:border-blue-500 outline-none" />
            <input name="jurusan" placeholder="Jurusan" value={siswa.jurusan} onChange={handleInputChange} 
              className="w-full p-3 border-2 border-[#CBD5E1] rounded-lg bg-white text-[#0F172A] font-medium focus:border-blue-500 outline-none" />
          </div>
          <button onClick={simpanSiswa} className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 w-full md:w-auto">
            💾 Simpan Data Siswa
          </button>
          
          {daftarSiswa.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Daftar Siswa Tersimpan:</h3>
              <ul className="list-disc pl-5 text-slate-700">
                {daftarSiswa.map(s => <li key={s.id}>{s.nama} ({s.kelas})</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CETAK KARTU */}
      {activeTab === 'cetak' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Cetak Kartu Absen</h2>
          {daftarSiswa.length === 0 ? (
            <p className="text-gray-500">Belum ada data siswa. Silakan input data terlebih dahulu.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daftarSiswa.map((s) => (
                <div key={s.id} className="border p-4 rounded-lg flex flex-col items-center text-center hover:shadow-md transition">
                  <QRCodeDisplay value={s.qrString} size={100} />
                  <h3 className="font-bold mt-2 text-slate-800">{s.nama}</h3>
                  <p className="text-sm text-slate-600">{s.kelas} - {s.nis}</p>
                  <button onClick={() => cetakKartu(s)} className="mt-3 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    🖨️ Cetak Kartu
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MODE SCANNER (ONLINE/MANUAL) */}
      {activeTab === 'scan' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Mode Scanner / Absensi Online</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Instruksi:</strong> Arahkan scanner QR Code ke kartu siswa, atau ketik manual kode QR di bawah ini.
              Sistem akan otomatis mencatat kehadiran dan menyiapkan notifikasi WhatsApp.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-slate-700 mb-2">Scan QR Code / Input Manual:</label>
            <input 
              autoFocus
              type="text" 
              onChange={handleScanSimulasi}
              placeholder="Tunggu input dari scanner..." 
              className="w-full p-4 text-center text-xl border-2 border-blue-300 rounded-lg bg-white text-blue-900 font-bold focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>

          {hasilScan && (
            <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl text-center animate-pulse">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-2xl font-bold text-green-800">ABSENSI BERHASIL</h3>
              <p className="text-green-700 mt-2">Nama: <strong>{hasilScan.nama}</strong></p>
              <p className="text-green-700">Waktu: {hasilScan.waktu}</p>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-gray-600 mb-2">Notifikasi Orang Tua:</p>
                <a 
                  href={`https://wa.me/?text=Yth.%20Wali%20Murid,%20Ananda%20${hasilScan.nama}%20telah%20hadir%20pada%20jam%20${hasilScan.waktu}.`}
                  target="_blank"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  📱 Kirim Laporan via WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}