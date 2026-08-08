# 🚀 PANDUAN LENGKAP SETUP SUPABASE UNTUK TEACHERAI

## ✅ STEP-BY-STEP SETUP (10 MENIT)

### STEP 1: Konfigurasi Environment Variables

1. Buka file `/workspace/.env.local` yang sudah dibuat
2. Dapatkan credentials dari Supabase Dashboard:
   - Buka https://supabase.com/dashboard
   - Pilih project TeacherAI Anda
   - Go to **Settings** > **API**
3. Copy dan paste ke `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (panjang)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (rahasia!)
   ```

### STEP 2: Jalankan Schema Database

1. Buka **SQL Editor** di Supabase Dashboard
2. Buka file `/workspace/supabase-reset-and-rebuild.sql`
3. **Copy SEMUA isi file** (600 baris)
4. **Paste** ke SQL Editor
5. Klik **Run**
6. Tunggu hingga muncul "Success"

### STEP 3: Setup Auth Trigger & RLS Policies

1. Masih di **SQL Editor**
2. Buka file `/workspace/supabase-auth-trigger.sql`
3. **Copy SEMUA isi file** (164 baris)
4. **Paste** ke SQL Editor
5. Klik **Run**
6. Tunggu hingga muncul "Success"

> ⚠️ **PENTING**: Script ini akan:
> - Membuat trigger otomatis untuk create profil guru saat signup
> - Setup RLS policies untuk keamanan data
> - Memastikan user auth otomatis punya entri di tabel guru

### STEP 4: Verifikasi Tabel

1. Buka **Table Editor** di Supabase Dashboard
2. Pastikan muncul **26 tabel**:
   - ✅ sekolah, tahun_ajaran, guru, kelas, siswa, siswa_kelas
   - ✅ mata_pelajaran, guru_mapel
   - ✅ elemen_cp, tujuan_pembelajaran, lingkup_materi, tp_lingkup_materi
   - ✅ modul_ajar, bahan_ajar, jadwal_mapel
   - ✅ absensi, nilai_lingkup_materi, nilai_sas, nilai_formatif, nilai_sumatif
   - ✅ profil_pancasila, ekskul, siswa_ekskul, nilai_ekskul, rapor

### STEP 5: Enable Email Authentication

1. Buka **Authentication** > **Providers** di Supabase Dashboard
2. Klik **Email** provider
3. Pastikan **Enable Email Signup** = ON
4. Untuk development, set **Enable Email Confirmations** = OFF (agar tidak perlu verifikasi email)
5. Klik **Save**

### STEP 6: Test Signup

1. Jalankan aplikasi: `npm run dev`
2. Buka http://localhost:3000
3. Klik **"Daftar sekarang"**
4. Isi form signup:
   - Email: guru@contoh.com
   - Nama: Dr. Budi Santoso, S.Pd., M.Pd.
   - NRG: 123456789
   - Sekolah: SMA Negeri 1 Jakarta
   - Password: Password123
5. Klik **Daftar Sekarang**
6. Jika berhasil, akan muncul pesan sukses

### STEP 7: Verifikasi Profil Guru

1. Buka **Table Editor** > tabel `guru`
2. Pastikan ada entri baru dengan:
   - `id` = user ID dari auth.users
   - `nama_guru` = nama yang diinput
   - `email` = email yang diinput
   - `nip` = NRG yang diinput

### STEP 8: Login dan Akses Dashboard

1. Kembali ke halaman login
2. Login dengan email dan password yang tadi didaftarkan
3. Jika berhasil, akan redirect ke dashboard
4. Dashboard akan menampilkan nama guru di pojok kanan atas

---

## 🔧 TROUBLESHOOTING

### Error: "column 'nama_guru' does not exist"
**Solusi**: Jalankan ulang `supabase-reset-and-rebuild.sql` untuk rebuild tabel guru dengan kolom yang benar.

### Error: "Row-level security policy violation"
**Solusi**: Jalankan `supabase-auth-trigger.sql` untuk setup RLS policies yang benar.

### User signup tapi tidak ada di tabel guru
**Solusi**: 
1. Cek apakah trigger sudah dibuat dengan benar
2. Jalankan manual insert di SQL Editor:
```sql
INSERT INTO public.guru (id, nama_guru, email, nip)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  email,
  COALESCE(raw_user_meta_data->>'nrg', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.guru);
```

### Email verification required tapi email tidak terkirim
**Solusi**: Disable email confirmation di Development mode:
- Authentication > Providers > Email
- Set "Enable Email Confirmations" = OFF

### "Memuat data guru..." terus-menerus
**Solusi**:
1. Buka browser console (F12)
2. Cek error di tab Console
3. Pastikan `.env.local` sudah terisi dengan benar
4. Pastikan user ada di tabel `guru`

---

## 📋 CHECKLIST FINAL

- [ ] `.env.local` terisi dengan credentials yang benar
- [ ] 26 tabel sudah dibuat di Supabase
- [ ] Trigger `handle_new_user` sudah dibuat
- [ ] RLS policies sudah di-setup
- [ ] Email auth sudah enabled
- [ ] Test signup berhasil
- [ ] Profil guru otomatis terbuat setelah signup
- [ ] Login berhasil dan masuk ke dashboard
- [ ] Nama guru tampil di dashboard

---

## 🎯 FITUR YANG SUDAH SIAP DIGUNAKAN

Setelah setup ini, fitur berikut sudah berfungsi:

✅ **Authentication**
- Signup dengan email/password
- Login
- Logout
- Auto-create profil guru
- Session persistence

✅ **Database**
- 26 tabel dengan relasi lengkap
- Indexes untuk performa
- Triggers untuk otomasi
- RLS policies untuk keamanan

✅ **Services Layer**
- `authService` - operasi auth
- `siswaService` - CRUD siswa
- `kelasService` - CRUD kelas
- Dan 15+ services lainnya

Selamat! Aplikasi TeacherAI siap digunakan! 🎉
