# 📘 Supabase Integration Guide - TeacherAI

Panduan lengkap untuk menggunakan integrasi Supabase yang telah direfactor secara komprehensif di repository TeacherAI.

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Struktur File](#struktur-file)
3. [Konfigurasi](#konfigurasi)
4. [Layanan yang Tersedia](#layanan-yang-tersedia)
5. [Cara Penggunaan](#cara-penggunaan)
6. [Best Practices](#best-practices)
7. [Contoh Implementasi](#contoh-implementasi)

---

## Overview

Refactor ini menghadirkan arsitektur data layer yang lebih bersih, terstruktur, dan mudah dipelihara dengan:

- ✅ **Centralized Client Configuration** - Konfigurasi Supabase client di satu tempat
- ✅ **Service-Based Architecture** - Setiap entitas database memiliki service sendiri
- ✅ **Reusable Functions** - Fungsi-fungsi yang dapat digunakan kembali di seluruh aplikasi
- ✅ **Type-Safe Operations** - Operasi database yang konsisten dan aman
- ✅ **Auto Token Refresh** - Manajemen sesi otomatis
- ✅ **Error Handling** - Penanganan error yang terstruktur

---

## Struktur File

```
src/
├── config/
│   └── supabase.js          # Konfigurasi client Supabase
├── services/
│   ├── supabase.js          # Data services layer (semua CRUD operations)
│   ├── curriculumHelpers.js # Helper untuk kurikulum
│   └── deskripsiService.js  # Service untuk generate deskripsi rapor
└── hooks/
    └── useAuthStore.js      # Auth state management dengan Zustand
```

---

## Konfigurasi

### Environment Variables

Pastikan file `.env.local` atau `.env` Anda memiliki variabel berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Client Configuration

File `src/config/supabase.js` menyediakan 3 jenis client:

```javascript
import { supabase, createServerClient, createAdminClient } from '@/config/supabase';

// 1. Main Client (untuk client-side)
const { data, error } = await supabase.from('siswa').select('*');

// 2. Server Client (untuk API routes/server components)
const serverClient = createServerClient();

// 3. Admin Client (untuk operasi khusus dengan service role)
const adminClient = createAdminClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
```

---

## Layanan yang Tersedia

### 🔐 Auth Service
```javascript
import { authService } from '@/services/supabase';

await authService.signIn(email, password);
await authService.signUp(email, password, metadata);
await authService.signOut();
await authService.getSession();
await authService.getUser();
await authService.resetPasswordForEmail(email, redirectTo);
await authService.updatePassword(newPassword);
await authService.updateProfile(updates);
```

### 🏫 Kelas Service
```javascript
import { kelasService } from '@/services/supabase';

await kelasService.getByGuruId(guruId);
await kelasService.getById(id);
await kelasService.create(data);
await kelasService.update(id, data);
await kelasService.delete(id);
```

### 👨‍🎓 Siswa Service
```javascript
import { siswaService } from '@/services/supabase';

await siswaService.getByKelasId(kelasId);
await siswaService.getById(id);
await siswaService.create(data);
await siswaService.update(id, data);
await siswaService.delete(id);
await siswaService.bulkInsert(students); // Import Excel
```

### 📚 Mapel Service
```javascript
import { mapelService } from '@/services/supabase';

await mapelService.getByKelasId(kelasId);
await mapelService.create(data);
await mapelService.update(id, data);
await mapelService.delete(id);
```

### ✅ Absensi Service
```javascript
import { absensiService } from '@/services/supabase';

await absensiService.getByMapelAndTanggal(mapelId, tanggal);
await absensiService.record(data);
await absensiService.bulkRecord(records);
await absensiService.updateStatus(id, status);
await absensiService.delete(id);
await absensiService.getRecapBySiswa(siswaId, mapelId);
```

### 👨‍🏫 Guru Service
```javascript
import { guruService } from '@/services/supabase';

await guruService.getById(id);
await guruService.update(id, data);
await guruService.create(data);
```

### 🏛️ Sekolah Service
```javascript
import { sekolahService } from '@/services/supabase';

await sekolahService.getById(id);
await sekolahService.create(data);
await sekolahService.update(id, data);
```

### 📅 Tahun Ajaran Service
```javascript
import {tahunAjaranService} from '@/services/supabase';

await tahunAjaranService.getByKelasId(kelasId);
await tahunAjaranService.upsert(data); // Auto create/update
await tahunAjaranService.create(data);
await tahunAjaranService.update(id, data);
```

### 📖 Kurikulum Services

#### Elemen CP
```javascript
import { elemenCpService } from '@/services/supabase';

await elemenCpService.getByMapelId(mapelId);
await elemenCpService.create(data);
await elemenCpService.update(id, data);
await elemenCpService.delete(id);
```

#### Tujuan Pembelajaran (TP)
```javascript
import { tpService } from '@/services/supabase';

await tpService.getByElemenCpIds(elemenIds);
await tpService.getByMapelId(mapelId);
await tpService.create(data);
await tpService.update(id, data);
await tpService.delete(id);
```

#### Lingkup Materi
```javascript
import { lingkupMateriService } from '@/services/supabase';

await lingkupMateriService.getByMapelId(mapelId);
await lingkupMateriService.create(data);
await lingkupMateriService.update(id, data);
await lingkupMateriService.delete(id);
```

### 📊 Penilaian Services

#### Nilai Lingkup Materi
```javascript
import { nilaiLingkupMateriService } from '@/services/supabase';

await nilaiLingkupMateriService.getBySiswaAndMapel(siswaId, mapelId);
await nilaiLingkupMateriService.upsert(data); // Auto create/update
await nilaiLingkupMateriService.bulkUpsert(scores);
```

#### Nilai SAS
```javascript
import { nilaiSasService } from '@/services/supabase';

await nilaiSasService.getByMapelId(mapelId);
await nilaiSasService.upsert(data);
```

#### Nilai Formatif
```javascript
import { nilaiFormatifService } from '@/services/supabase';

await nilaiFormatifService.getByMapelId(mapelId);
await nilaiFormatifService.record(data);
await nilaiFormatifService.delete(id);
```

#### Nilai Sumatif
```javascript
import { nilaiSumatifService } from '@/services/supabase';

await nilaiSumatifService.getByMapelId(mapelId);
await nilaiSumatifService.record(data);
await nilaiSumatifService.delete(id);
```

### 🌟 Profil Pancasila Service
```javascript
import { profilPancasilaService } from '@/services/supabase';

await profilPancasilaService.getBySiswaId(siswaId);
await profilPancasilaService.bulkSave(siswaId, records);
```

### 🎭 Ekstrakurikuler Services

#### Ekskul
```javascript
import { ekskulService } from '@/services/supabase';

await ekskulService.getByKelasId(kelasId);
await ekskulService.create(data);
await ekskulService.update(id, data);
await ekskulService.delete(id);
```

#### Nilai Ekskul
```javascript
import { nilaiEkskulService } from '@/services/supabase';

await nilaiEkskulService.getBySiswaId(siswaId);
await nilaiEkskulService.upsert(data);
```

### 📝 Rapor Service
```javascript
import { raporService } from '@/services/supabase';

await raporService.getBySiswaAndSemester(siswaId, semester);
await raporService.upsert(data); // Auto create/update
await raporService.delete(siswaId, semester);
```

### 📦 Modul & Bahan Ajar Services

#### Modul Ajar
```javascript
import { modulAjarService } from '@/services/supabase';

await modulAjarService.getByTpId(tpId);
await modulAjarService.create(data);
await modulAjarService.update(id, data);
await modulAjarService.delete(id);
```

#### Bahan Ajar
```javascript
import { bahanAjarService } from '@/services/supabase';

await bahanAjarService.getByModulAjarId(modulAjarId);
await bahanAjarService.uploadFile(file, bucket, path);
await bahanAjarService.create(data);
await bahanAjarService.delete(id);
```

### 📅 Jadwal Mapel Service
```javascript
import { jadwalMapelService } from '@/services/supabase';

await jadwalMapelService.getByKelasId(kelasId);
await jadwalMapelService.getByHari(kelasId, hari);
await jadwalMapelService.create(data);
await jadwalMapelService.update(id, data);
await jadwalMapelService.delete(id);
```

---

## Cara Penggunaan

### 1. **Import Services**

Anda bisa mengimport service secara individual atau semuanya sekaligus:

```javascript
// Individual import (recommended)
import { authService, siswaService, kelasService } from '@/services/supabase';

// Atau import semua
import supabaseServices from '@/services/supabase';

// Penggunaan
await supabaseServices.siswa.getByKelasId(kelasId);
```

### 2. **Basic CRUD Operations**

```javascript
// CREATE
const { data: newSiswa, error } = await siswaService.create({
  nama: 'John Doe',
  nisn: '1234567890',
  kelas_id: kelasId
});

// READ
const { data: siswaList } = await siswaService.getByKelasId(kelasId);

// UPDATE
const { data: updatedSiswa } = await siswaService.update(siswaId, {
  nama: 'Jane Doe'
});

// DELETE
await siswaService.delete(siswaId);
```

### 3. **Handling Errors**

```javascript
try {
  const { data, error } = await siswaService.create({...});
  
  if (error) {
    console.error('Error:', error.message);
    alert('Gagal menyimpan data: ' + error.message);
    return;
  }
  
  console.log('Success:', data);
} catch (err) {
  console.error('Unexpected error:', err);
}
```

### 4. **Using with React Hooks**

```javascript
'use client';
import { useState, useEffect } from 'react';
import { siswaService, kelasService } from '@/services/supabase';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function MyComponent() {
  const { profile } = useAuthStore();
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSiswa = async () => {
      if (!profile?.id) return;
      
      const { data: kelasData } = await kelasService.getByGuruId(profile.id);
      if (kelasData?.length > 0) {
        const { data: siswa } = await siswaService.getByKelasId(kelasData[0].id);
        setSiswaList(siswa || []);
      }
      setLoading(false);
    };

    loadSiswa();
  }, [profile]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {siswaList.map(siswa => (
        <div key={siswa.id}>{siswa.nama}</div>
      ))}
    </div>
  );
}
```

---

## Best Practices

### ✅ DO

1. **Gunakan Services Layer** - Selalu gunakan service functions daripada memanggil `supabase` langsung
2. **Error Handling** - Selalu handle error dengan baik
3. **Loading States** - Berikan feedback loading pada UI
4. **Type Safety** - Pastikan data yang dikirim sesuai schema
5. **Bulk Operations** - Gunakan `bulkInsert`/`bulkRecord` untuk operasi massal
6. **Upsert Pattern** - Gunakan fungsi `upsert` untuk create/update otomatis

### ❌ DON'T

1. Jangan memanggil `supabase.from()` langsung di komponen
2. Jangan lupa handle error
3. Jangan lakukan operasi database di render loop
4. Jangan hardcode table names di multiple places

---

## Contoh Implementasi

### Contoh 1: Login Page

```javascript
import { authService } from '@/services/supabase';
import { useRouter } from 'next/navigation';

const handleLogin = async (email, password) => {
  const { data, error } = await authService.signIn(email, password);
  
  if (error) {
    alert('Login gagal: ' + error.message);
    return;
  }
  
  router.push('/dashboard');
};
```

### Contoh 2: Import Siswa dari Excel

```javascript
import { siswaService } from '@/services/supabase';

const handleImport = async (studentsData) => {
  const { error } = await siswaService.bulkInsert(studentsData);
  
  if (error) {
    alert('Gagal import: ' + error.message);
    return;
  }
  
  alert('✅ Berhasil import ' + studentsData.length + ' siswa!');
};
```

### Contoh 3: Input Nilai Raport

```javascript
import { nilaiLingkupMateriService, nilaiSasService } from '@/services/supabase';

const handleSaveNilai = async (siswaId, mapelId, lmScores, sasScore) => {
  // Save LM scores
  const lmPromises = lmScores.map(score => 
    nilaiLingkupMateriService.upsert({
      siswa_id: siswaId,
      mapel_id: mapelId,
      lingkup_materi_id: score.lm_id,
      angka: score.nilai
    })
  );
  
  await Promise.all(lmPromises);
  
  // Save SAS score
  await nilaiSasService.upsert({
    siswa_id: siswaId,
    mapel_id: mapelId,
    angka: sasScore
  });
  
  alert('✅ Nilai berhasil disimpan!');
};
```

### Contoh 4: Generate QR Code Kartu Siswa

```javascript
import { siswaService } from '@/services/supabase';

const generateQRData = (siswa) => {
  return JSON.stringify({
    type: 'SISWA',
    siswa_id: siswa.id,
    nama: siswa.nama,
    nis: siswa.nis,
    timestamp: new Date().toISOString()
  });
};

const loadSiswaForCards = async (kelasId) => {
  const { data: siswa } = await siswaService.getByKelasId(kelasId);
  return siswa?.map(s => ({
    ...s,
    qrData: generateQRData(s)
  })) || [];
};
```

---

## Migration Guide

Jika Anda masih menggunakan pattern lama (langsung memanggil `supabase`), berikut cara migrasinya:

### Before (Old Pattern)
```javascript
import { supabase } from '@/config/supabase';

const { data: siswa } = await supabase
  .from('siswa')
  .select('*')
  .eq('kelas_id', kelasId)
  .order('nama');
```

### After (New Pattern)
```javascript
import { siswaService } from '@/services/supabase';

const { data: siswa } = await siswaService.getByKelasId(kelasId);
```

### Benefits of Migration

- ✅ Code lebih readable dan self-documenting
- ✅ Mudah di-maintain dan di-test
- ✅ Konsisten di seluruh aplikasi
- ✅ Mudah dilakukan perubahan di masa depan
- ✅ Error handling lebih terstruktur

---

## Support & Contribution

Jika menemukan bug atau ingin menambahkan fitur baru:

1. Buat issue di repository
2. Fork repository
3. Buat branch baru (`feature/nama-fitur`)
4. Commit perubahan
5. Buat Pull Request

---

**Last Updated:** 2025
**Version:** 1.0.0
