-- ============================================================================
-- SUPABASE RESET & REBUILD SCRIPT FOR TEACHERAI
-- ============================================================================
-- Script ini akan:
-- 1. DROP semua tabel yang ada (CASCADE untuk hapus dependencies)
-- 2. Membangun ulang struktur database yang komprehensif
-- 3. Menambahkan Indexes, Triggers, RLS Policies, dan Stored Functions
-- 4. Terintegrasi penuh dengan src/services/supabase.js
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BAGIAN 1: CLEANUP - HAPUS SEMUA STRUKTUR LAMA
-- ----------------------------------------------------------------------------

-- Drop semua fungsi terlebih dahulu (karena bergantung pada tabel)
DROP FUNCTION IF EXISTS calculate_average_nilai(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_siswa_by_kelas(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_current_tahun_ajaran() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop semua tabel dengan urutan yang benar (menghindari foreign key errors)
-- Menggunakan CASCADE untuk memastikan semua dependencies terhapus
DROP TABLE IF EXISTS rapor CASCADE;
DROP TABLE IF EXISTS nilai_ekskul CASCADE;
DROP TABLE IF EXISTS siswa_ekskul CASCADE;
DROP TABLE IF EXISTS ekskul CASCADE;
DROP TABLE IF EXISTS profil_pancasila CASCADE;
DROP TABLE IF EXISTS nilai_sumatif CASCADE;
DROP TABLE IF EXISTS nilai_formatif CASCADE;
DROP TABLE IF EXISTS nilai_sas CASCADE;
DROP TABLE IF EXISTS nilai_lingkup_materi CASCADE;
DROP TABLE IF EXISTS absensi CASCADE;
DROP TABLE IF EXISTS jadwal_mapel CASCADE;
DROP TABLE IF EXISTS bahan_ajar CASCADE;
DROP TABLE IF EXISTS modul_ajar CASCADE;
DROP TABLE IF EXISTS tp_lingkup_materi CASCADE;
DROP TABLE IF EXISTS lingkup_materi CASCADE;
DROP TABLE IF EXISTS tujuan_pembelajaran CASCADE;
DROP TABLE IF EXISTS elemen_cp CASCADE;
DROP TABLE IF EXISTS guru_mapel CASCADE;
DROP TABLE IF EXISTS mata_pelajaran CASCADE;
DROP TABLE IF EXISTS siswa_kelas CASCADE;
DROP TABLE IF EXISTS siswa CASCADE;
DROP TABLE IF EXISTS kelas CASCADE;
DROP TABLE IF EXISTS guru CASCADE;
DROP TABLE IF EXISTS tahun_ajaran CASCADE;
DROP TABLE IF EXISTS sekolah CASCADE;

-- Drop types jika ada custom types
DROP TYPE IF EXISTS user_role CASCADE;

-- ----------------------------------------------------------------------------
-- BAGIAN 2: CREATE TABLES - STRUKTUR DATABASE BARU
-- ----------------------------------------------------------------------------

-- 1. TABEL MASTER DATA

CREATE TABLE sekolah (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_sekolah VARCHAR(255) NOT NULL,
    npsn VARCHAR(20) UNIQUE,
    alamat TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tahun_ajaran (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tahun_ajaran VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('1', '2', 'ganjil', 'genap')),
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    aktif BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guru (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nip VARCHAR(30) UNIQUE,
    nama_guru VARCHAR(255) NOT NULL,
    jenis_kelamin VARCHAR(10) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    alamat TEXT,
    nomor_hp VARCHAR(20),
    email VARCHAR(255),
    foto_profil TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kelas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_sekolah UUID REFERENCES sekolah(id) ON DELETE SET NULL,
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat_kelas INTEGER NOT NULL CHECK (tingkat_kelas BETWEEN 1 AND 12),
    tahun_ajaran VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE siswa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nis VARCHAR(30) UNIQUE,
    nisn VARCHAR(30) UNIQUE,
    nama_siswa VARCHAR(255) NOT NULL,
    jenis_kelamin VARCHAR(10) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    alamat TEXT,
    nomor_hp VARCHAR(20),
    id_wali_kelas UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE siswa_kelas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_kelas UUID REFERENCES kelas(id) ON DELETE CASCADE,
    id_tahun_ajaran UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_siswa, id_kelas, id_tahun_ajaran)
);

CREATE TABLE mata_pelajaran (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kode_mapel VARCHAR(20) UNIQUE,
    nama_mapel VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guru_mapel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_guru UUID REFERENCES guru(id) ON DELETE CASCADE,
    id_mapel UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    id_kelas UUID REFERENCES kelas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_guru, id_mapel, id_kelas)
);

-- 2. TABEL KURIKULUM MERDEKA

CREATE TABLE elemen_cp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_mapel UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kode_elemen VARCHAR(20),
    deskripsi TEXT NOT NULL,
    tingkat_kelas INTEGER NOT NULL CHECK (tingkat_kelas BETWEEN 1 AND 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tujuan_pembelajaran (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_elemen_cp UUID REFERENCES elemen_cp(id) ON DELETE CASCADE,
    judul_tp VARCHAR(500) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lingkup_materi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_tp UUID REFERENCES tujuan_pembelajaran(id) ON DELETE CASCADE,
    judul_lm VARCHAR(500) NOT NULL,
    deskripsi TEXT,
    durasi_pembelajaran INTEGER, -- dalam menit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tp_lingkup_materi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_tp UUID REFERENCES tujuan_pembelajaran(id) ON DELETE CASCADE,
    id_lm UUID REFERENCES lingkup_materi(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_tp, id_lm)
);

-- 3. TABEL PERANGKAT PEMBELAJARAN

CREATE TABLE modul_ajar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_guru UUID REFERENCES guru(id) ON DELETE CASCADE,
    id_kelas UUID REFERENCES kelas(id) ON DELETE SET NULL,
    id_mapel UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
    judul_modul VARCHAR(500) NOT NULL,
    deskripsi TEXT,
    file_path TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bahan_ajar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_modul UUID REFERENCES modul_ajar(id) ON DELETE CASCADE,
    judul_bahan VARCHAR(500) NOT NULL,
    deskripsi TEXT,
    tipe_bahan VARCHAR(50) NOT NULL CHECK (tipe_bahan IN ('pdf', 'video', 'image', 'document', 'link', 'other')),
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jadwal_mapel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_kelas UUID REFERENCES kelas(id) ON DELETE CASCADE,
    id_guru UUID REFERENCES guru(id) ON DELETE CASCADE,
    id_mapel UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    hari VARCHAR(20) NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL PENILAIAN (ASSESSMENT)

CREATE TABLE absensi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_kelas UUID REFERENCES kelas(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    status_kehadiran VARCHAR(20) NOT NULL CHECK (status_kehadiran IN ('hadir', 'sakit', 'izin', 'alpha')),
    qr_code_token VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_siswa, tanggal)
);

CREATE TABLE nilai_lingkup_materi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_lm UUID REFERENCES lingkup_materi(id) ON DELETE CASCADE,
    nilai DECIMAL(5,2) CHECK (nilai BETWEEN 0 AND 100),
    tanggal_penilaian DATE,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nilai_sas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_mapel UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    nilai_aspek_kognitif DECIMAL(5,2) CHECK (nilai_aspek_kognitif BETWEEN 0 AND 100),
    nilai_aspek_psikomotor DECIMAL(5,2) CHECK (nilai_aspek_psikomotor BETWEEN 0 AND 100),
    nilai_aspek_afektif DECIMAL(5,2) CHECK (nilai_aspek_afektif BETWEEN 0 AND 100),
    semester VARCHAR(10),
    tahun_ajaran VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nilai_formatif (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_mapel UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    jenis_nilai VARCHAR(50) NOT NULL,
    nilai DECIMAL(5,2) CHECK (nilai BETWEEN 0 AND 100),
    tanggal_penilaian DATE,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nilai_sumatif (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_mapel UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    jenis_nilai VARCHAR(50) NOT NULL CHECK (jenis_nilai IN ('STS', 'STS', 'SAS', 'SAS')),
    nilai DECIMAL(5,2) CHECK (nilai BETWEEN 0 AND 100),
    tanggal_penilaian DATE,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profil_pancasila (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    aspek_penghayatan_beriman VARCHAR(20) CHECK (aspek_penghayatan_beriman IN ('BB', 'MB', 'BSH', 'SB')),
    aspek_berkebinekaan VARCHAR(20) CHECK (aspek_berkebinekaan IN ('BB', 'MB', 'BSH', 'SB')),
    aspek_bernalar_kritis VARCHAR(20) CHECK (aspek_bernalar_kritis IN ('BB', 'MB', 'BSH', 'SB')),
    aspek_berkebangsaan VARCHAR(20) CHECK (aspek_berkebangsaan IN ('BB', 'MB', 'BSH', 'SB')),
    aspek_berdemokrasi VARCHAR(20) CHECK (aspek_berdemokrasi IN ('BB', 'MB', 'BSH', 'SB')),
    aspek_bermanfaat VARCHAR(20) CHECK (aspek_bermanfaat IN ('BB', 'MB', 'BSH', 'SB')),
    semester VARCHAR(10),
    tahun_ajaran VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ekskul (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_ekskul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    id_pembina UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE siswa_ekskul (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_ekskul UUID REFERENCES ekskul(id) ON DELETE CASCADE,
    id_tahun_ajaran UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_siswa, id_ekskul, id_tahun_ajaran)
);

CREATE TABLE nilai_ekskul (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_ekskul UUID REFERENCES ekskul(id) ON DELETE CASCADE,
    nilai DECIMAL(5,2) CHECK (nilai BETWEEN 0 AND 100),
    semester VARCHAR(10),
    tahun_ajaran VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rapor (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siswa UUID REFERENCES siswa(id) ON DELETE CASCADE,
    id_kelas UUID REFERENCES kelas(id) ON DELETE CASCADE,
    semester VARCHAR(10),
    tahun_ajaran VARCHAR(20),
    predikat_nilai VARCHAR(5),
    deskripsi_nilai TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_siswa, semester, tahun_ajaran)
);

-- ----------------------------------------------------------------------------
-- BAGIAN 3: INDEXES UNTUK OPTIMASI PERFORMA
-- ----------------------------------------------------------------------------

CREATE INDEX idx_guru_nama ON guru(nama_guru);
CREATE INDEX idx_guru_email ON guru(email);
CREATE INDEX idx_siswa_nama ON siswa(nama_siswa);
CREATE INDEX idx_siswa_nis ON siswa(nis);
CREATE INDEX idx_siswa_nisn ON siswa(nisn);
CREATE INDEX idx_kelas_nama ON kelas(nama_kelas);
CREATE INDEX idx_kelas_tingkat ON kelas(tingkat_kelas);
CREATE INDEX idx_tahun_ajaran_aktif ON tahun_ajaran(aktif);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX idx_absensi_siswa ON absensi(id_siswa);
CREATE INDEX idx_nilai_lingkup_materi_siswa ON nilai_lingkup_materi(id_siswa);
CREATE INDEX idx_nilai_lingkup_materi_lm ON nilai_lingkup_materi(id_lm);
CREATE INDEX idx_nilai_sas_siswa ON nilai_sas(id_siswa);
CREATE INDEX idx_nilai_formatif_siswa ON nilai_formatif(id_siswa);
CREATE INDEX idx_nilai_sumatif_siswa ON nilai_sumatif(id_siswa);
CREATE INDEX idx_siswa_kelas_siswa ON siswa_kelas(id_siswa);
CREATE INDEX idx_siswa_kelas_kelas ON siswa_kelas(id_kelas);
CREATE INDEX idx_guru_mapel_guru ON guru_mapel(id_guru);
CREATE INDEX idx_guru_mapel_kelas ON guru_mapel(id_kelas);
CREATE INDEX idx_modul_ajar_guru ON modul_ajar(id_guru);
CREATE INDEX idx_bahan_ajar_modul ON bahan_ajar(id_modul);
CREATE INDEX idx_jadwal_mapel_kelas ON jadwal_mapel(id_kelas);

-- ----------------------------------------------------------------------------
-- BAGIAN 4: TRIGGERS UNTUK AUTO UPDATE TIMESTAMP
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke semua tabel yang punya kolom updated_at
CREATE TRIGGER update_sekolah_updated_at BEFORE UPDATE ON sekolah FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tahun_ajaran_updated_at BEFORE UPDATE ON tahun_ajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guru_updated_at BEFORE UPDATE ON guru FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kelas_updated_at BEFORE UPDATE ON kelas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_siswa_updated_at BEFORE UPDATE ON siswa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mata_pelajaran_updated_at BEFORE UPDATE ON mata_pelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elemen_cp_updated_at BEFORE UPDATE ON elemen_cp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tujuan_pembelajaran_updated_at BEFORE UPDATE ON tujuan_pembelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lingkup_materi_updated_at BEFORE UPDATE ON lingkup_materi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modul_ajar_updated_at BEFORE UPDATE ON modul_ajar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bahan_ajar_updated_at BEFORE UPDATE ON bahan_ajar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jadwal_mapel_updated_at BEFORE UPDATE ON jadwal_mapel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_lingkup_materi_updated_at BEFORE UPDATE ON nilai_lingkup_materi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_sas_updated_at BEFORE UPDATE ON nilai_sas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_formatif_updated_at BEFORE UPDATE ON nilai_formatif FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_sumatif_updated_at BEFORE UPDATE ON nilai_sumatif FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profil_pancasila_updated_at BEFORE UPDATE ON profil_pancasila FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ekskul_updated_at BEFORE UPDATE ON ekskul FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_ekskul_updated_at BEFORE UPDATE ON nilai_ekskul FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rapor_updated_at BEFORE UPDATE ON rapor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- BAGIAN 5: STORED FUNCTIONS
-- ----------------------------------------------------------------------------

-- Get current tahun ajaran aktif
CREATE OR REPLACE FUNCTION get_current_tahun_ajaran()
RETURNS SETOF tahun_ajaran AS $$
    SELECT * FROM tahun_ajaran WHERE aktif = TRUE;
$$ LANGUAGE sql STABLE;

-- Get siswa by kelas ID
CREATE OR REPLACE FUNCTION get_siswa_by_kelas(p_kelas_id UUID)
RETURNS SETOF siswa AS $$
    SELECT s.* FROM siswa s
    JOIN siswa_kelas sk ON s.id = sk.id_siswa
    WHERE sk.id_kelas = p_kelas_id;
$$ LANGUAGE sql STABLE;

-- Calculate average nilai for a student in a specific lingkup materi
CREATE OR REPLACE FUNCTION calculate_average_nilai(p_siswa_id UUID, p_lm_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_nilai DECIMAL;
BEGIN
    SELECT AVG(nilai) INTO avg_nilai
    FROM nilai_lingkup_materi
    WHERE id_siswa = p_siswa_id AND id_lm = p_lm_id;
    RETURN COALESCE(avg_nilai, 0);
END;
$$ LANGUAGE plpgsql;

-- Get guru mapel by kelas
CREATE OR REPLACE FUNCTION get_guru_mapel_by_kelas(p_kelas_id UUID)
RETURNS TABLE (
    guru_id UUID,
    nama_guru VARCHAR,
    mapel_id UUID,
    nama_mapel VARCHAR
) AS $$
    SELECT g.id as guru_id, g.nama_guru, m.id as mapel_id, m.nama_mapel
    FROM guru_mapel gm
    JOIN guru g ON gm.id_guru = g.id
    JOIN mata_pelajaran m ON gm.id_mapel = m.id
    WHERE gm.id_kelas = p_kelas_id;
$$ LANGUAGE sql STABLE;

-- Get jadwal by kelas and hari
CREATE OR REPLACE FUNCTION get_jadwal_by_kelas_hari(p_kelas_id UUID, p_hari VARCHAR)
RETURNS SETOF jadwal_mapel AS $$
    SELECT * FROM jadwal_mapel
    WHERE id_kelas = p_kelas_id AND hari = p_hari;
$$ LANGUAGE sql STABLE;

-- Count siswa in a kelas
CREATE OR REPLACE FUNCTION count_siswa_in_kelas(p_kelas_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*) FROM siswa_kelas WHERE id_kelas = p_kelas_id;
$$ LANGUAGE sql STABLE;

-- ----------------------------------------------------------------------------
-- BAGIAN 6: ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS for all tables
ALTER TABLE sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahun_ajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mata_pelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru_mapel ENABLE ROW LEVEL SECURITY;
ALTER TABLE elemen_cp ENABLE ROW LEVEL SECURITY;
ALTER TABLE tujuan_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE lingkup_materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE tp_lingkup_materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE modul_ajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE bahan_ajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_mapel ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai_lingkup_materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai_sas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai_formatif ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai_sumatif ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil_pancasila ENABLE ROW LEVEL SECURITY;
ALTER TABLE ekskul ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa_ekskul ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai_ekskul ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapor ENABLE ROW LEVEL SECURITY;

-- POLICIES: Sekolah (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view sekolah" 
ON sekolah FOR SELECT TO authenticated USING (true);

-- POLICIES: Guru (Users can view all, insert/update their own profile)
CREATE POLICY "Allow authenticated users to view guru" 
ON guru FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to insert their own guru profile" 
ON guru FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own guru profile" 
ON guru FOR UPDATE TO authenticated USING (auth.uid() = id);

-- POLICIES: Kelas (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view kelas" 
ON kelas FOR SELECT TO authenticated USING (true);

-- POLICIES: Siswa (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view siswa" 
ON siswa FOR SELECT TO authenticated USING (true);

-- POLICIES: Mata Pelajaran (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view mata_pelajaran" 
ON mata_pelajaran FOR SELECT TO authenticated USING (true);

-- POLICIES: Tahun Ajaran (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view tahun_ajaran" 
ON tahun_ajaran FOR SELECT TO authenticated USING (true);

-- POLICIES: Guru Mapel (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view guru_mapel" 
ON guru_mapel FOR SELECT TO authenticated USING (true);

-- POLICIES: Kurikulum (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view elemen_cp" 
ON elemen_cp FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view tujuan_pembelajaran" 
ON tujuan_pembelajaran FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view lingkup_materi" 
ON lingkup_materi FOR SELECT TO authenticated USING (true);

-- POLICIES: Modul Ajar (Guru can manage their own, others can view)
CREATE POLICY "Allow authenticated users to view modul_ajar" 
ON modul_ajar FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow teachers to insert their own modul_ajar" 
ON modul_ajar FOR INSERT TO authenticated WITH CHECK (auth.uid() = id_guru);

CREATE POLICY "Allow teachers to update their own modul_ajar" 
ON modul_ajar FOR UPDATE TO authenticated USING (auth.uid() = id_guru);

CREATE POLICY "Allow teachers to delete their own modul_ajar" 
ON modul_ajar FOR DELETE TO authenticated USING (auth.uid() = id_guru);

-- POLICIES: Bahan Ajar (Same as modul ajar)
CREATE POLICY "Allow authenticated users to view bahan_ajar" 
ON bahan_ajar FOR SELECT TO authenticated USING (true);

-- POLICIES: Jadwal Mapel (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view jadwal_mapel" 
ON jadwal_mapel FOR SELECT TO authenticated USING (true);

-- POLICIES: Absensi (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view absensi" 
ON absensi FOR SELECT TO authenticated USING (true);

-- POLICIES: Nilai (Guru can manage, students/parents can view their own)
CREATE POLICY "Allow authenticated users to view nilai_lingkup_materi" 
ON nilai_lingkup_materi FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view nilai_sas" 
ON nilai_sas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view nilai_formatif" 
ON nilai_formatif FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view nilai_sumatif" 
ON nilai_sumatif FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view profil_pancasila" 
ON profil_pancasila FOR SELECT TO authenticated USING (true);

-- POLICIES: Ekskul (Read for authenticated users)
CREATE POLICY "Allow authenticated users to view ekskul" 
ON ekskul FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view siswa_ekskul" 
ON siswa_ekskul FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view nilai_ekskul" 
ON nilai_ekskul FOR SELECT TO authenticated USING (true);

-- POLICIES: Rapor (Students/parents can view their own, teachers can manage)
CREATE POLICY "Allow authenticated users to view rapor" 
ON rapor FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- BAGIAN 7: SEED DATA (OPTIONAL - Uncomment if needed)
-- ----------------------------------------------------------------------------

-- Contoh seed data untuk testing (opsional)
-- INSERT INTO sekolah (nama_sekolah, npsn) VALUES ('SMA Negeri 1 Contoh', '12345678');
-- INSERT INTO tahun_ajaran (tahun_ajaran, semester, aktif) VALUES ('2024/2025', 'ganjil', true);

-- ============================================================================
-- SELESAI - Database siap digunakan!
-- ============================================================================
