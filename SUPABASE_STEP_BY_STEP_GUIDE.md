# 📘 Panduan Step-by-Step: Reset & Rebuild Database Supabase

Panduan ini akan memandu Anda langkah demi langkah untuk menghapus semua struktur database lama di Supabase dan membangun ulang secara komprehensif agar terintegrasi penuh dengan repository TeacherAI.

---

## ⚠️ PERINGATAN PENTING

**Sebelum memulai:**
- ✅ Pastikan Anda memiliki backup data jika ada data penting
- ✅ Script ini akan **MENGHAPUS SEMUA DATA** yang ada di database
- ✅ Pastikan Anda login sebagai owner/admin project Supabase
- ✅ Proses ini tidak dapat dibatalkan (irreversible)

---

## 📋 Prerequisites

1. **Akun Supabase** dengan akses admin ke project
2. **File SQL** sudah tersedia di `/workspace/supabase-reset-and-rebuild.sql`
3. **Environment variables** siap diupdate (`.env`)

---

## 🚀 LANGKAH 1: Buka Supabase Dashboard

1. Buka browser dan kunjungi [https://supabase.com](https://supabase.com)
2. Login dengan akun Anda
3. Pilih project TeacherAI Anda dari dashboard

---

## 🚀 LANGKAH 2: Navigasi ke SQL Editor

1. Di sidebar kiri, klik ikon **SQL Editor** (ikon </> atau "SQL")
2. Klik tombol **"New Query"** di pojok kanan atas editor

---

## 🚀 LANGKAH 3: Copy Script SQL

1. Buka file `/workspace/supabase-reset-and-rebuild.sql` di text editor Anda
2. **Select All** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C) seluruh isi file

---

## 🚀 LANGKAH 4: Paste dan Jalankan Script

1. **Paste** (Ctrl+V / Cmd+V) script ke SQL Editor Supabase
2. Pastikan seluruh script terpaste dengan benar (sekitar 400+ baris)
3. Klik tombol **"Run"** di pojok kanan bawah editor
   - Atau tekan shortcut: `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

---

## 🚀 LANGKAH 5: Verifikasi Eksekusi

Setelah menjalankan script, Anda akan melihat:

### ✅ Jika Berhasil:
```
Success. No rows returned
```
atau
```
✅ Query executed successfully in X ms
```

### ❌ Jika Ada Error:
- Baca pesan error dengan teliti
- Screenshot error tersebut
- Biasanya disebabkan oleh:
  - Izin akses tidak cukup (harus admin/owner)
  - Koneksi internet terputus
  - Script tidak terpaste utuh

---

## 🚀 LANGKAH 6: Verifikasi Tabel Dibuat

1. Di sidebar kiri, klik ikon **Table Editor** (ikon tabel)
2. Anda seharusnya melihat **26 tabel baru**:

### ✅ Daftar Tabel yang Harus Muncul:

#### Master Data (7 tabel):
- ✅ `sekolah`
- ✅ `tahun_ajaran`
- ✅ `guru`
- ✅ `kelas`
- ✅ `siswa`
- ✅ `siswa_kelas`
- ✅ `mata_pelajaran`
- ✅ `guru_mapel`

#### Kurikulum Merdeka (4 tabel):
- ✅ `elemen_cp`
- ✅ `tujuan_pembelajaran`
- ✅ `lingkup_materi`
- ✅ `tp_lingkup_materi`

#### Perangkat Pembelajaran (3 tabel):
- ✅ `modul_ajar`
- ✅ `bahan_ajar`
- ✅ `jadwal_mapel`

#### Penilaian & Asesmen (9 tabel):
- ✅ `absensi`
- ✅ `nilai_lingkup_materi`
- ✅ `nilai_sas`
- ✅ `nilai_formatif`
- ✅ `nilai_sumatif`
- ✅ `profil_pancasila`
- ✅ `ekskul`
- ✅ `siswa_ekskul`
- ✅ `nilai_ekskul`
- ✅ `rapor`

---

## 🚀 LANGKAH 7: Cek Struktur Tabel (Opsional)

1. Klik salah satu tabel, misalnya `guru`
2. Klik tab **"Columns"**
3. Pastikan kolom-kolom berikut ada:
   - `id` (UUID, Primary Key)
   - `nama_guru` (VARCHAR)
   - `nip` (VARCHAR)
   - `jenis_kelamin` (ENUM: L, P)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

---

## 🚀 LANGKAH 8: Update Environment Variables

Setelah database siap, update file `.env` di root project:

```bash
# Buka file .env
nano .env
# atau
code .env
```

Tambahkan/update variabel berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 🔑 Cara Mendapatkan Keys:

1. Di Supabase Dashboard, klik **Settings** (ikon gear) di sidebar
2. Pilih **API**
3. Copy nilai berikut:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (JANGAN share key ini!)

---

## 🚀 LANGKAH 9: Test Koneksi dari Aplikasi

1. Jalankan development server:
   ```bash
   npm run dev
   ```

2. Buka browser ke `http://localhost:3000`

3. Test koneksi dengan membuka halaman yang menggunakan Supabase

4. Atau buat test file sederhana:
   ```javascript
   // src/test-connection.js
   import { supabase } from '@/config/supabase';

   async function testConnection() {
     const { data, error } = await supabase.from('sekolah').select('*');
     
     if (error) {
       console.error('❌ Connection failed:', error);
     } else {
       console.log('✅ Connection successful:', data);
     }
   }

   testConnection();
   ```

---

## 🚀 LANGKAH 10: Seed Data Awal (Opsional)

Untuk mengisi data awal, Anda bisa:

### Opsi A: Manual via Table Editor
1. Buka **Table Editor**
2. Pilih tabel `sekolah`
3. Klik **"Insert Row"**
4. Isi data sekolah Anda
5. Klik **"Save"**

### Opsi B: Via SQL Insert
Buat query baru di SQL Editor:

```sql
-- Insert Sekolah
INSERT INTO sekolah (nama_sekolah, npsn, alamat)
VALUES ('SMA Negeri 1 Contoh', '12345678', 'Jl. Pendidikan No. 1');

-- Insert Tahun Ajaran Aktif
INSERT INTO tahun_ajaran (tahun_ajaran, semester, aktif)
VALUES ('2024/2025', 'ganjil', true);

-- Insert Beberapa Mata Pelajaran
INSERT INTO mata_pelajaran (kode_mapel, nama_mapel, kategori)
VALUES 
  ('MTK', 'Matematika', 'wajib'),
  ('IND', 'Bahasa Indonesia', 'wajib'),
  ('ING', 'Bahasa Inggris', 'wajib'),
  ('FIS', 'Fisika', 'pilihan');
```

---

## 🛠️ Troubleshooting

### ❌ Error: "permission denied for table"
**Solusi:** Pastikan Anda login sebagai owner/admin project Supabase

### ❌ Error: "column does not exist"
**Solusi:** Script sudah handle dengan DROP CASCADE. Refresh halaman dan coba lagi.

### ❌ Error: "relation already exists"
**Solusi:** Artinya ada tabel yang belum terhapus. Jalankan manual:
```sql
DROP TABLE IF EXISTS nama_tabel CASCADE;
```

### ❌ Tidak ada tabel muncul setelah run
**Solusi:** 
1. Cek panel "Query Output" di bawah editor
2. Lihat apakah ada error message
3. Pastikan script terpaste utuh (tidak terpotong)

### ❌ RLS Policy blocking access
**Solusi:** Untuk development, Anda bisa disable RLS sementara:
```sql
ALTER TABLE nama_tabel DISABLE ROW LEVEL SECURITY;
```
⚠️ **Jangan lakukan ini di production!**

---

## ✅ Checklist Setelah Selesai

- [ ] 26 tabel berhasil dibuat
- [ ] Tidak ada error di SQL Editor output
- [ ] File `.env` sudah diupdate dengan credentials yang benar
- [ ] Test koneksi berhasil dari aplikasi
- [ ] Data seed awal sudah diisi (opsional)
- [ ] Backup script SQL disimpan dengan aman

---

## 📞 Butuh Bantuan?

Jika mengalami kendala:
1. Screenshot error message lengkap
2. Catat langkah yang sudah dilakukan
3. Periksa log di Supabase Dashboard > Settings > Logs

---

## 🎯 Next Steps

Setelah database siap:
1. Integrasikan dengan frontend menggunakan `src/services/supabase.js`
2. Implementasi autentikasi user
3. Bangun fitur CRUD untuk setiap entitas
4. Setup RLS policies yang lebih ketat untuk production

---

**Database Anda sekarang siap digunakan! 🎉**
