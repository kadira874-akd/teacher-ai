'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onClose }) {
  const [scanError, setScanError] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear();
      },
      (error) => {
        setScanError(error);
      }
    );

    return () => {
      scanner.clear().catch(err => console.error('Failed to clear scanner', err));
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#0F172A]">📷 Scan QR Code Absensi</h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#DC2626]"
          >
            ✕
          </button>
        </div>
        <div id="qr-reader" className="w-full"></div>
        {scanError && (
          <p className="text-sm text-[#DC2626] mt-2 text-center">
            {scanError}
          </p>
        )}
        <p className="text-sm text-[#64748B] mt-4 text-center">
          Arahkan kamera ke QR Code yang ditampilkan guru
        </p>
      </div>
    </div>
  );
}
