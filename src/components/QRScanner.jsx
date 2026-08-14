'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * QR Scanner Component yang dioptimalkan untuk mobile
 * - Menggunakan Html5Qrcode langsung untuk kontrol lebih baik
 * - Konfigurasi kamera khusus untuk performa optimal di HP
 * - Tampilan responsif dan user-friendly
 */
export default function QRScanner({ onScanSuccess, onClose }) {
  const [scanError, setScanError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        // Cek permission kamera
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'camera' });
          setCameraPermission(result.state);
          
          result.addEventListener('change', () => {
            setCameraPermission(result.state);
          });
        }

        // Inisialisasi scanner dengan konfigurasi optimal untuk mobile
        const html5QrCode = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = html5QrCode;

        // Dapatkan deviceId kamera belakang
        const cameras = await Html5Qrcode.getCameras();
        const backCamera = cameras.find(cam => 
          cam.label.toLowerCase().includes('back') || 
          cam.label.toLowerCase().includes('rear') ||
          cam.label.toLowerCase().includes('environment')
        );

        const cameraId = backCamera ? backCamera.id : cameras[0]?.id;

        if (!cameraId) {
          throw new Error('Tidak ada kamera yang terdeteksi');
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: 'environment',
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          }
        };

        await html5QrCode.start(
          cameraId,
          config,
          (decodedText, decodedResult) => {
            console.log('QR Code terdeteksi:', decodedText);
            onScanSuccess(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Normal saat scanning, abaikan error sementara
          }
        ).catch((err) => {
          console.error('Gagal memulai scanner:', err);
          setScanError('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
          setIsScanning(false);
        });

        setIsScanning(true);
        setScanError(null);

      } catch (error) {
        console.error('Error initializing scanner:', error);
        setScanError(error.message || 'Gagal mengaktifkan kamera');
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScanSuccess]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop().catch(err => {
          console.error('Error stopping scanner:', err);
        });
        await html5QrCodeRef.current.clear();
      } catch (error) {
        console.error('Error clearing scanner:', error);
      }
    }
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <span className="text-2xl">📷</span>
            Scan QR Code
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F8FAFC] hover:bg-[#DC2626] hover:text-white transition-all flex items-center justify-center text-[#64748B]"
            aria-label="Tutup scanner"
          >
            ✕
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative mb-4">
          <div 
            id="qr-reader" 
            className="w-full rounded-xl overflow-hidden bg-black"
            style={{ minHeight: '300px' }}
          ></div>
          
          {/* Overlay guide */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-64 border-4 border-[#2D5BE3] rounded-lg opacity-50"></div>
            </div>
            {/* Corner markers */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#2D5BE3] rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#2D5BE3] rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#2D5BE3] rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#2D5BE3] rounded-br-lg"></div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {cameraPermission === 'denied' && (
          <div className="mb-4 p-4 bg-[#FEF2F2] border border-[#DC2626] rounded-lg">
            <p className="text-sm text-[#DC2626] font-medium">
              ⚠️ Akses kamera ditolak
            </p>
            <p className="text-xs text-[#DC2626] mt-1">
              Mohon izinkan akses kamera di pengaturan browser Anda
            </p>
          </div>
        )}

        {scanError && (
          <div className="mb-4 p-4 bg-[#FEF2F2] border border-[#DC2626] rounded-lg">
            <p className="text-sm text-[#DC2626]">{scanError}</p>
          </div>
        )}

        {!isScanning && !scanError && cameraPermission !== 'denied' && (
          <div className="mb-4 p-4 bg-[#FEF2F2] border border-[#DC2626] rounded-lg">
            <p className="text-sm text-[#DC2626]">Memulai kamera...</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
          <p className="text-sm text-[#64748B] text-center leading-relaxed">
            <span className="font-semibold text-[#0F172A]">Cara menggunakan:</span>
            <br />
            Arahkan kamera ke QR Code pada kartu absen siswa
            <br />
            <span className="text-xs text-[#94A3B8] mt-2 block">
              💡 Pastikan pencahayaan cukup dan QR Code terlihat jelas
            </span>
          </p>
        </div>

        {/* Loading indicator */}
        {!isScanning && !scanError && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5BE3]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
