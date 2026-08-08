# 🗄️ Supabase Database Migration Guide

## Overview

Dokumen ini menjelaskan cara melakukan migration database schema TeacherAI ke Supabase secara komprehensif.

## 📋 Prerequisites

1. **Supabase Project** - Pastikan Anda sudah memiliki project di [supabase.com](https://supabase.com)
2. **SQL Editor Access** - Akses ke SQL Editor di dashboard Supabase
3. **Service Role Key** - Untuk menjalankan migration (hanya untuk development/setup awal)

## 🚀 Cara Deploy Schema

### Metode 1: Via Supabase Dashboard (Recommended untuk Development)

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Navigasi ke **SQL Editor** (di sidebar kiri)
4. Klik **New Query**
5. Copy-paste seluruh isi file `supabase-schema.sql`
6. Klik **Run** atau tekan `Ctrl+Enter`
7. Tunggu hingga semua statement berhasil dieksekusi
8. Verifikasi tabel-tabel yang dibuat di menu **Table Editor**

### Metode 2: Via Supabase CLI (Recommended untuk Production)

```bash
# Install Supabase CLI jika belum
npm install -g supabase

# Login ke Supabase
supabase login

# Link project Anda
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
supabase db push --sql-file supabase-schema.sql
```

### Metode 3: Via psql Command Line

```bash
# Dapatkan connection string dari Supabase Dashboard
# Settings -> Database -> Connection string -> URI

psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f supabase-schema.sql
```

## 📊 Struktur Database

### 1. Master Data (10 Tabel)

| Tabel | Deskripsi | Kunci Utama |
|-------|-----------|-------------|
| `sekolah` | Data sekolah | `id` (UUID) |
| `tahun_ajaran` | Tahun ajaran & semester | `id` (UUID) |
| `guru` | Data guru (linked to auth.users) | `id` (UUID) |
| `kelas` | Data kelas | `id` (UUID) |
| `siswa` | Data siswa | `id` (UUID) |
| `siswa_kelas` | Relasi siswa-kelas (history) | `id` (UUID) |
| `mata_pelajaran` | Mata pelajaran | `id` (UUID) |
| `guru_mapel` | Penugasan guru mengajar | `id` (UUID) |

### 2. Kurikulum Merdeka (4 Tabel)

| Tabel | Deskripsi |
|-------|-----------|
| `elemen_cp` | Capaian Pembelajaran per fase |
| `tujuan_pembelajaran` | Tujuan Pembelajaran (TP) |
| `lingkup_materi` | Lingkup Materi per kelas/semester |
| `tp_lingkup_materi` | Relasi TP dengan LM |

### 3. Perangkat Pembelajaran (3 Tabel)

| Tabel | Deskripsi |
|-------|-----------|
| `modul_ajar` | Modul ajar/RPP |
| `bahan_ajar` | Bahan ajar (file, video, link) |
| `jadwal_mapel` | Jadwal mata pelajaran |

### 4. Penilaian (9 Tabel)

| Tabel | Deskripsi |
|-------|-----------|
| `absensi` | Kehadiran siswa |
| `nilai_lingkup_materi` | Nilai per lingkup materi |
| `nilai_sas` | Nilai Sumatif Akhir Semester |
| `nilai_formatif` | Nilai formatif umum |
| `nilai_sumatif` | Nilai sumatif umum |
| `profil_pancasila` | Profil Pelajar Pancasila |
| `ekskul` | Ekstrakurikuler |
| `siswa_ekskul` | Keanggotaan ekskul |
| `nilai_ekskul` | Nilai ekskul |
| `rapor` | Rapor siswa |

## 🔐 Row Level Security (RLS)

Schema ini sudah dilengkapi dengan RLS policies:

### Read Access
- ✅ Semua authenticated users dapat **SELECT** semua tabel

### Write Access
- ✅ Guru dapat INSERT/UPDATE data mereka sendiri (berdasarkan `created_by` atau `guru_id`)
- ✅ Guru dapat DELETE modul ajar dan bahan ajar milik mereka

### Security Best Practices
```sql
-- Contoh policy yang diterapkan
CREATE POLICY "Teachers can insert nilai" ON nilai_lingkup_materi
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = created_by);
```

## ⚡ Performance Optimizations

### Indexes yang Sudah Diterapkan

```sql
-- Siswa
idx_siswa_nisn, idx_siswa_nama, idx_siswa_kelas

-- Kelas  
idx_kelas_tahun_ajaran, idx_kelas_wali, idx_kelas_nama

-- Nilai
idx_nilai_lm_siswa, idx_nilai_lm_mapel, idx_nilai_lm_semester

-- Absensi
idx_absensi_siswa, idx_absensi_tanggal, idx_absensi_kelas
```

### Triggers
- Auto-update `updated_at` timestamp pada semua tabel

## 🛠️ Stored Functions

### 1. Get Current Academic Year
```sql
SELECT * FROM get_current_tahun_ajaran();
```

### 2. Get Students by Class
```sql
SELECT * FROM get_siswa_by_kelas('CLASS_UUID_HERE');
```

### 3. Calculate Average Score
```sql
SELECT calculate_average_nilai(
    'STUDENT_UUID',
    'SUBJECT_UUID',
    'Ganjil',
    'YEAR_UUID'
);
```

### 4. Get Attendance Summary
```sql
SELECT * FROM get_attendance_summary(
    'STUDENT_UUID',
    'Ganjil',
    'YEAR_UUID'
);
```

## 🔄 Integration dengan Services Layer

Setelah schema deployed, services di `src/services/supabase.js` siap digunakan:

```javascript
// Example usage in your React components
import { siswaService, kelasService, authService } from '@/services/supabase';

// Get students by class
const { data: siswa, error } = await siswaService.getByKelasId(kelasId);

// Create new student
const { data: newSiswa, error } = await siswaService.create({
    nisn: '1234567890',
    nama_lengkap: 'John Doe',
    // ... other fields
});

// Bulk insert students
await siswaService.bulkInsert(studentsArray);
```

## 🔧 Troubleshooting

### Error: "relation already exists"
```sql
-- Drop all tables and re-run (DEVELOPMENT ONLY!)
DROP TABLE IF EXISTS rapor CASCADE;
DROP TABLE IF EXISTS nilai_ekskul CASCADE;
-- ... drop all tables ...
-- Then re-run the migration script
```

### Error: "permission denied"
- Pastikan Anda menggunakan **service_role key** saat run migration
- Atau gunakan SQL Editor di dashboard (otomatis sebagai superuser)

### Error: "foreign key violation"
- Urutan pembuatan tabel sudah benar dalam script
- Jika manual, pastikan tabel parent dibuat dulu sebelum child

## 📝 Next Steps

1. ✅ Deploy schema ke Supabase
2. ✅ Test connection dengan `src/config/supabase.js`
3. ✅ Update environment variables:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```
4. ✅ Test services layer dengan komponen React
5. ✅ Migrate existing data (jika ada)

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Webhooks](https://supabase.com/docs/guides/database/webhooks)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained by**: TeacherAI Team
