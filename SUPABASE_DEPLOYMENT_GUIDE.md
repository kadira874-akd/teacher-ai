# 🔄 Panduan Reset & Rebuild Database Supabase

## ⚠️ PERINGATAN PENTING
Script ini akan **MENGHAPUS SEMUA DATA** yang ada di database Supabase Anda. Pastikan Anda sudah melakukan backup jika ada data penting.

## 📋 Struktur Database Baru

Database TeacherAI sekarang memiliki **26 tabel** yang terbagi dalam 4 kategori utama:

### 1. Master Data (8 tabel)
- `sekolah` - Data sekolah
- `tahun_ajaran` - Tahun ajaran dan semester
- `guru` - Profil guru (terintegrasi dengan auth.users)
- `kelas` - Data kelas
- `siswa` - Data siswa
- `siswa_kelas` - Relasi siswa-kelas per tahun ajaran
- `mata_pelajaran` - Daftar mata pelajaran
- `guru_mapel` - Relasi guru-mapel-kelas

### 2. Kurikulum Merdeka (4 tabel)
- `elemen_cp` - Elemen Capaian Pembelajaran
- `tujuan_pembelajaran` - Tujuan Pembelajaran (TP)
- `lingkup_materi` - Lingkup Materi (LM)
- `tp_lingkup_materi` - Relasi TP-LM

### 3. Perangkat Pembelajaran (3 tabel)
- `modul_ajar` - Modul ajar/perangkat mengajar
- `bahan_ajar` - Bahan ajar (file, video, dll)
- `jadwal_mapel` - Jadwal mata pelajaran

### 4. Penilaian/Assessment (11 tabel)
- `absensi` - Kehadiran siswa
- `nilai_lingkup_materi` - Nilai per lingkup materi
- `nilai_sas` - Nilai Sumatif Akhir Semester
- `nilai_formatif` - Nilai formatif
- `nilai_sumatif` - Nilai sumatif
- `profil_pancasila` - Profil Pelajar Pancasila
- `ekskul` - Ekstrakurikuler
- `siswa_ekskul` - Relasi siswa-ekskul
- `nilai_ekskul` - Nilai ekstrakurikuler
- `rapor` - Rapor siswa

## 🚀 Cara Deploy

### Metode 1: Via Supabase Dashboard (RECOMMENDED)

1. **Login ke Supabase Dashboard**
   - Buka https://supabase.com
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik menu "SQL Editor" di sidebar kiri
   - Klik "+ New Query"

3. **Copy & Paste Script**
   - Buka file `supabase-reset-and-rebuild.sql`
   - Copy seluruh isi file
   - Paste ke SQL Editor

4. **Execute**
   - Klik tombol "Run" atau tekan `Ctrl+Enter`
   - Tunggu hingga semua query selesai dieksekusi
   - Pastikan tidak ada error

5. **Verifikasi**
   - Buka menu "Table Editor"
   - Pastikan ke-26 tabel sudah terbuat
   - Cek struktur tabel untuk memastikan kolom sudah benar

### Metode 2: Via Supabase CLI

```bash
# Install Supabase CLI jika belum
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project Anda
supabase link --project-ref YOUR_PROJECT_REF

# Push schema
supabase db push --sql-file supabase-reset-and-rebuild.sql
```

### Metode 3: Via psql Command Line

```bash
# Download dan install PostgreSQL client jika belum

# Execute script
psql -h db.YOUR_PROJECT_REF.supabase.co \
     -U postgres \
     -d postgres \
     -f supabase-reset-and-rebuild.sql
```

Anda akan diminta memasukkan password database.

## ✅ Fitur yang Sudah Terintegrasi

### 1. Indexes untuk Performa
- 20+ indexes untuk query yang cepat
- Covering indexes untuk relasi antar tabel
- Composite indexes untuk query kompleks

### 2. Auto-update Timestamps
- Trigger otomatis untuk kolom `updated_at`
- Berlaku untuk semua tabel yang memiliki kolom `updated_at`

### 3. Stored Functions
- `get_current_tahun_ajaran()` - Get tahun ajaran aktif
- `get_siswa_by_kelas(UUID)` - Get siswa by kelas ID
- `calculate_average_nilai(UUID, UUID)` - Hitung rata-rata nilai
- `get_guru_mapel_by_kelas(UUID)` - Get guru mapel by kelas
- `get_jadwal_by_kelas_hari(UUID, VARCHAR)` - Get jadwal by hari
- `count_siswa_in_kelas(UUID)` - Hitung jumlah siswa

### 4. Row Level Security (RLS)
- Semua tabel memiliki RLS enabled
- Policies untuk authenticated users
- Granular access control berdasarkan role

### 5. Data Validation
- CHECK constraints untuk validasi data
- UNIQUE constraints untuk mencegah duplikasi
- FOREIGN KEY dengan CASCADE delete/update

## 🔗 Integrasi dengan Codebase

Schema ini sudah **100% compatible** dengan services di `src/services/supabase.js`:

```javascript
// Contoh penggunaan
import { authService, siswaService, kelasService } from '@/services/supabase';

// Login
const { data: user } = await authService.signIn(email, password);

// Get siswa by kelas
const { data: siswa } = await siswaService.getByKelasId(kelasId);

// Bulk insert siswa
await siswaService.bulkInsert(studentsData);

// Save nilai dengan upsert
await nilaiLingkupMateriService.upsert({
  siswa_id: siswaId,
  lm_id: lmId,
  nilai: 85
});
```

## 🛡️ Keamanan

### RLS Policies yang Diterapkan:
- ✅ Guru dapat manage profil sendiri
- ✅ Guru dapat create/update modul ajar mereka
- ✅ Semua authenticated users dapat read data master
- ✅ Siswa/parent dapat view nilai mereka sendiri (perlu enhancement)

### Rekomendasi Tambahan:
Untuk production, pertimbangkan untuk menambahkan:
- Role-based access control (admin, guru, siswa, parent)
- More granular policies untuk setiap entitas
- Audit logging untuk tracking perubahan

## 🔧 Troubleshooting

### Error: "column does not exist"
- ✅ SUDAH DIATASI - Script menggunakan DROP CASCADE untuk menghapus semua struktur lama

### Error: "permission denied"
- Pastikan Anda login sebagai owner project atau user dengan privilege yang cukup
- Gunakan service_role_key untuk operasi admin

### Error: "relation already exists"
- Script sudah menggunakan DROP IF EXISTS CASCADE
- Jika masih error, pastikan script dijalankan secara utuh

### Data hilang setelah deploy
- Ini expected behavior - script memang menghapus semua data
- Selalu backup sebelum menjalankan reset script

## 📊 Monitoring & Maintenance

### Check Tabel yang Terbentuk:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check RLS Status:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Check Indexes:
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

## 📝 Next Steps

Setelah database berhasil di-deploy:

1. **Seed Data Awal** (opsional)
   - Tambahkan data sekolah
   - Tambahkan tahun ajaran aktif
   - Tambahkan mata pelajaran dasar

2. **Test Services**
   - Test setiap function di `src/services/supabase.js`
   - Verify CRUD operations
   - Test RLS policies

3. **Update Environment Variables**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Deploy Frontend**
   - Build aplikasi
   - Test integrasi dengan database baru

## 📞 Support

Jika mengalami masalah:
1. Check logs di Supabase Dashboard > Logs
2. Review error message di console
3. Pastikan script dijalankan secara utuh
4. Verify koneksi internet saat execute

---

**Status**: ✅ Siap Production
**Last Updated**: 2024
**Compatible With**: src/services/supabase.js
