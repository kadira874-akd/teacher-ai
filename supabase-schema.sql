-- =====================================================
-- TEACHERAI - SUPABASE DATABASE SCHEMA
-- Comprehensive Migration Script
-- =====================================================
-- Deskripsi: Schema lengkap untuk aplikasi manajemen sekolah
-- Versi: 1.0.0
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MASTER DATA - SEKOLAH & TAHUN AJARAN
-- =====================================================

CREATE TABLE IF NOT EXISTS sekolah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_sekolah VARCHAR(255) NOT NULL,
    npsn VARCHAR(20) UNIQUE,
    alamat TEXT,
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota_kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(10),
    telepon VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    kepala_sekolah VARCHAR(255),
    nip_kepala_sekolah VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tahun_ajaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_tahun_ajaran VARCHAR(50) NOT NULL,
    semester VARCHAR(20) NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_tahun_ajaran_semester UNIQUE (nama_tahun_ajaran, semester)
);

-- =====================================================
-- 2. MASTER DATA - GURU, SISWA, KELAS, MAPEL
-- =====================================================

CREATE TABLE IF NOT EXISTS guru (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nip VARCHAR(20) UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    gelar_depan VARCHAR(100),
    gelar_belakang VARCHAR(100),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    jenis_kelamin VARCHAR(20) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    agama VARCHAR(50),
    status_kepegawaian VARCHAR(50),
    jabatan_fungsional VARCHAR(100),
    pangkat_golongan VARCHAR(50),
    pendidikan_terakhir VARCHAR(100),
    jurusan VARCHAR(255),
    universitas VARCHAR(255),
    tahun_lulus INTEGER,
    nomor_sertifikasi_guru VARCHAR(50),
    sekolah_id UUID REFERENCES sekolah(id) ON DELETE SET NULL,
    foto_url TEXT,
    no_telepon VARCHAR(20),
    email_pribadi VARCHAR(255),
    alamat_domisili TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat INTEGER NOT NULL,
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    wali_kelas_id UUID REFERENCES guru(id) ON DELETE SET NULL,
    jumlah_siswa INTEGER DEFAULT 0,
    ruang_kelas VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_kelas_tahun_ajaran UNIQUE (nama_kelas, tahun_ajaran_id)
);

CREATE TABLE IF NOT EXISTS siswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nis VARCHAR(20) UNIQUE,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    jenis_kelamin VARCHAR(20) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    agama VARCHAR(50),
    alamat TEXT,
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota_kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(10),
    no_telepon_siswa VARCHAR(20),
    nama_ayah VARCHAR(255),
    pekerjaan_ayah VARCHAR(100),
    no_telepon_ayah VARCHAR(20),
    nama_ibu VARCHAR(255),
    pekerjaan_ibu VARCHAR(100),
    no_telepon_ibu VARCHAR(20),
    nama_wali VARCHAR(255),
    pekerjaan_wali VARCHAR(100),
    no_telepon_wali VARCHAR(20),
    foto_url TEXT,
    tanggal_masuk DATE,
    status_siswa VARCHAR(50) DEFAULT 'Aktif' CHECK (status_siswa IN ('Aktif', 'Pindah', 'Keluar', 'Alumni')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS siswa_kelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    tanggal_masuk DATE DEFAULT CURRENT_DATE,
    tanggal_keluar DATE,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_siswa_kelas_tahun UNIQUE (siswa_id, kelas_id, tahun_ajaran_id)
);

CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_mapel VARCHAR(20) UNIQUE NOT NULL,
    nama_mapel VARCHAR(255) NOT NULL,
    kategori VARCHAR(50) CHECK (kategori IN ('Wajib', 'Muatan Lokal', 'Pilihan', 'Ekskul')),
    kelompok VARCHAR(50),
    jenjang VARCHAR(50),
    ccp_id VARCHAR(100),
    deskripsi TEXT,
    jam_pelajaran_per_minggu INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guru_mapel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    jam_mengajar INTEGER,
    is_wajib BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_guru_mapel_kelas UNIQUE (guru_id, mapel_id, kelas_id, tahun_ajaran_id)
);

-- =====================================================
-- 3. KURIKULUM MERDEKA - CP, TP, ALUR TUJUAN PEMBELAJARAN
-- =====================================================

CREATE TABLE IF NOT EXISTS elemen_cp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    fase VARCHAR(10) NOT NULL,
    elemen VARCHAR(255) NOT NULL,
    deskripsi_cp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_mapel_fase_elemen UNIQUE (mapel_id, fase, elemen)
);

CREATE TABLE IF NOT EXISTS tujuan_pembelajaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    elemen_cp_id UUID REFERENCES elemen_cp(id) ON DELETE CASCADE,
    kode_tp VARCHAR(50) NOT NULL,
    deskripsi_tp TEXT NOT NULL,
    indikator TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lingkup_materi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    nama_lingkup_materi VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    alokasi_waktu INTEGER,
    urutan INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_mapel_kelas_lm UNIQUE (mapel_id, kelas_id, nama_lingkup_materi)
);

CREATE TABLE IF NOT EXISTS tp_lingkup_materi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tp_id UUID REFERENCES tujuan_pembelajaran(id) ON DELETE CASCADE,
    lingkup_materi_id UUID REFERENCES lingkup_materi(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_tp_lm UNIQUE (tp_id, lingkup_materi_id)
);

-- =====================================================
-- 4. PERANGKAT PEMBELAJARAN - MODUL AJAR, BAHAN AJAR
-- =====================================================

CREATE TABLE IF NOT EXISTS modul_ajar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    lingkup_materi_id UUID REFERENCES lingkup_materi(id) ON DELETE SET NULL,
    nama_modul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    alokasi_waktu INTEGER,
    tujuan_pembelajaran TEXT,
    pemahaman_bermakna TEXT,
    pertanyaan_pematik TEXT,
    kegiatan_pendahuluan TEXT,
    kegiatan_inti TEXT,
    kegiatan_penutup TEXT,
    asesmen_formatif TEXT,
    asesmen_sumatif TEXT,
    pengayaan_remedial TEXT,
    refleksi_guru TEXT,
    refleksi_siswa TEXT,
    lampuran_url TEXT[],
    is_published BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bahan_ajar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    lingkup_materi_id UUID REFERENCES lingkup_materi(id) ON DELETE SET NULL,
    judul_bahan VARCHAR(255) NOT NULL,
    jenis_bahan VARCHAR(50) CHECK (jenis_bahan IN ('PDF', 'Video', 'Audio', 'Gambar', 'Link', 'Dokumen', 'Lainnya')),
    deskripsi TEXT,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    durasi INTEGER,
    is_published BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jadwal_mapel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
    hari VARCHAR(20) NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')),
    jam_ke INTEGER NOT NULL,
    durasi INTEGER DEFAULT 40,
    ruang_kelas VARCHAR(50),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_jadwal_kelas_hari_jam UNIQUE (kelas_id, hari, jam_ke, tahun_ajaran_id)
);

-- =====================================================
-- 5. PENILAIAN - ABSENSI, NILAI, RAPOR
-- =====================================================

CREATE TABLE IF NOT EXISTS absensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    status_hadir VARCHAR(20) NOT NULL CHECK (status_hadir IN ('Hadir', 'Sakit', 'Izin', 'Alpha')),
    keterangan TEXT,
    bukti_url TEXT,
    qr_code_scanned_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_absensi_siswa_tanggal UNIQUE (siswa_id, tanggal, mapel_id)
);

CREATE TABLE IF NOT EXISTS nilai_lingkup_materi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    lingkup_materi_id UUID REFERENCES lingkup_materi(id) ON DELETE CASCADE,
    tp_id UUID REFERENCES tujuan_pembelajaran(id) ON DELETE SET NULL,
    angka DECIMAL(5,2) NOT NULL CHECK (angka >= 0 AND angka <= 100),
    predikat VARCHAR(10),
    deskripsi_capaian TEXT,
    bobot DECIMAL(5,2) DEFAULT 1.0,
    jenis_nilai VARCHAR(50) CHECK (jenis_nilai IN ('Formatif', 'Sumatif', 'UTS', 'UAS', 'Tugas', 'Praktikum')),
    tanggal_penilaian DATE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    keterangan TEXT,
    created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_siswa_mapel_lm UNIQUE (siswa_id, mapel_id, lingkup_materi_id)
);

CREATE TABLE IF NOT EXISTS nilai_sas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    angka DECIMAL(5,2) NOT NULL CHECK (angka >= 0 AND angka <= 100),
    predikat VARCHAR(10),
    deskripsi_capaian TEXT,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    tanggal_penilaian DATE,
    created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_siswa_mapel_sas UNIQUE (siswa_id, mapel_id, semester, tahun_ajaran_id)
);

CREATE TABLE IF NOT EXISTS nilai_formatif (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    nama_penilaian VARCHAR(255) NOT NULL,
    angka DECIMAL(5,2) NOT NULL CHECK (angka >= 0 AND angka <= 100),
    bobot DECIMAL(5,2) DEFAULT 1.0,
    jenis_nilai VARCHAR(50),
    tanggal_penilaian DATE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nilai_sumatif (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    nama_penilaian VARCHAR(255) NOT NULL,
    angka DECIMAL(5,2) NOT NULL CHECK (angka >= 0 AND angka <= 100),
    bobot DECIMAL(5,2) DEFAULT 1.0,
    tanggal_penilaian DATE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profil Pelajar Pancasila
CREATE TABLE IF NOT EXISTS profil_pancasila (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    beriman_bertaqwa VARCHAR(500),
    berkebinekaan_global VARCHAR(500),
    bergotong_royong VARCHAR(500),
    mandiri VARCHAR(500),
    bernalar_kritis VARCHAR(500),
    kreatif VARCHAR(500),
    catatan_guru TEXT,
    created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_siswa_semester_panca UNIQUE (siswa_id, semester, tahun_ajaran_id)
);

-- Ekstrakurikuler
CREATE TABLE IF NOT EXISTS ekskul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_ekskul VARCHAR(255) NOT NULL,
    kategori VARCHAR(50),
    deskripsi TEXT,
    pembina_id UUID REFERENCES guru(id) ON DELETE SET NULL,
    jadwal TEXT,
    lokasi TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS siswa_ekskul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    ekskul_id UUID REFERENCES ekskul(id) ON DELETE CASCADE,
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    tanggal_bergabung DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_siswa_ekskul_tahun UNIQUE (siswa_id, ekskul_id, tahun_ajaran_id)
);

CREATE TABLE IF NOT EXISTS nilai_ekskul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    ekskul_id UUID REFERENCES ekskul(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    nilai_angka DECIMAL(5,2) CHECK (nilai_angka >= 0 AND nilai_angka <= 100),
    predikat VARCHAR(10),
    deskripsi_capaian TEXT,
    created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_siswa_ekskul_semester UNIQUE (siswa_id, ekskul_id, semester, tahun_ajaran_id)
);

-- Rapor
CREATE TABLE IF NOT EXISTS rapor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
    rata_rata_nilai DECIMAL(5,2),
    peringkat_kelas INTEGER,
    jumlah_siswa_sekelas INTEGER,
    catatan_wali TEXT,
    tanda_tangan_wali_url TEXT,
    is_locked BOOLEAN DEFAULT false,
    created_by UUID REFERENCES guru(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_siswa_kelas_semester UNIQUE (siswa_id, kelas_id, semester, tahun_ajaran_id)
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_siswa_nisn ON siswa(nisn);
CREATE INDEX IF NOT EXISTS idx_siswa_nama ON siswa(nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_siswa_kelas ON siswa_kelas(siswa_id);
CREATE INDEX IF NOT EXISTS idx_siswa_kelas_current ON siswa_kelas(siswa_id, is_current);
CREATE INDEX IF NOT EXISTS idx_kelas_tahun_ajaran ON kelas(tahun_ajaran_id);
CREATE INDEX IF NOT EXISTS idx_kelas_wali ON kelas(wali_kelas_id);
CREATE INDEX IF NOT EXISTS idx_kelas_nama ON kelas(nama_kelas);
CREATE INDEX IF NOT EXISTS idx_guru_sekolah ON guru(sekolah_id);
CREATE INDEX IF NOT EXISTS idx_guru_nama ON guru(nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_nilai_lm_siswa ON nilai_lingkup_materi(siswa_id);
CREATE INDEX IF NOT EXISTS idx_nilai_lm_mapel ON nilai_lingkup_materi(mapel_id);
CREATE INDEX IF NOT EXISTS idx_nilai_lm_semester ON nilai_lingkup_materi(semester, tahun_ajaran_id);
CREATE INDEX IF NOT EXISTS idx_nilai_sas_siswa ON nilai_sas(siswa_id);
CREATE INDEX IF NOT EXISTS idx_nilai_sas_semester ON nilai_sas(semester, tahun_ajaran_id);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa ON absensi(siswa_id);
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_kelas ON absensi(kelas_id);
CREATE INDEX IF NOT EXISTS idx_elemen_cp_mapel ON elemen_cp(mapel_id);
CREATE INDEX IF NOT EXISTS idx_tp_elemen ON tujuan_pembelajaran(elemen_cp_id);
CREATE INDEX IF NOT EXISTS idx_lingkup_materi_mapel ON lingkup_materi(mapel_id, kelas_id);
CREATE INDEX IF NOT EXISTS idx_modul_ajar_guru ON modul_ajar(guru_id);
CREATE INDEX IF NOT EXISTS idx_bahan_ajar_guru ON bahan_ajar(guru_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_kelas ON jadwal_mapel(kelas_id, hari, jam_ke);

-- =====================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sekolah_updated_at BEFORE UPDATE ON sekolah FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tahun_ajaran_updated_at BEFORE UPDATE ON tahun_ajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guru_updated_at BEFORE UPDATE ON guru FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kelas_updated_at BEFORE UPDATE ON kelas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_siswa_updated_at BEFORE UPDATE ON siswa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_siswa_kelas_updated_at BEFORE UPDATE ON siswa_kelas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mata_pelajaran_updated_at BEFORE UPDATE ON mata_pelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guru_mapel_updated_at BEFORE UPDATE ON guru_mapel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elemen_cp_updated_at BEFORE UPDATE ON elemen_cp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tujuan_pembelajaran_updated_at BEFORE UPDATE ON tujuan_pembelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lingkup_materi_updated_at BEFORE UPDATE ON lingkup_materi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modul_ajar_updated_at BEFORE UPDATE ON modul_ajar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bahan_ajar_updated_at BEFORE UPDATE ON bahan_ajar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jadwal_mapel_updated_at BEFORE UPDATE ON jadwal_mapel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_absensi_updated_at BEFORE UPDATE ON absensi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_lingkup_materi_updated_at BEFORE UPDATE ON nilai_lingkup_materi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_sas_updated_at BEFORE UPDATE ON nilai_sas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_formatif_updated_at BEFORE UPDATE ON nilai_formatif FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_sumatif_updated_at BEFORE UPDATE ON nilai_sumatif FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profil_pancasila_updated_at BEFORE UPDATE ON profil_pancasila FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ekskul_updated_at BEFORE UPDATE ON ekskul FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_siswa_ekskul_updated_at BEFORE UPDATE ON siswa_ekskul FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_ekskul_updated_at BEFORE UPDATE ON nilai_ekskul FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rapor_updated_at BEFORE UPDATE ON rapor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

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

-- Select policies for all tables
CREATE POLICY "select_sekolah" ON sekolah FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_tahun_ajaran" ON tahun_ajaran FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_guru" ON guru FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_kelas" ON kelas FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_siswa" ON siswa FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_siswa_kelas" ON siswa_kelas FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_mata_pelajaran" ON mata_pelajaran FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_guru_mapel" ON guru_mapel FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_elemen_cp" ON elemen_cp FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_tujuan_pembelajaran" ON tujuan_pembelajaran FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_lingkup_materi" ON lingkup_materi FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_tp_lingkup_materi" ON tp_lingkup_materi FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_modul_ajar" ON modul_ajar FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_bahan_ajar" ON bahan_ajar FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_jadwal_mapel" ON jadwal_mapel FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_absensi" ON absensi FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_nilai_lingkup_materi" ON nilai_lingkup_materi FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_nilai_sas" ON nilai_sas FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_nilai_formatif" ON nilai_formatif FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_nilai_sumatif" ON nilai_sumatif FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_profil_pancasila" ON profil_pancasila FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_ekskul" ON ekskul FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_siswa_ekskul" ON siswa_ekskul FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_nilai_ekskul" ON nilai_ekskul FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_rapor" ON rapor FOR SELECT TO authenticated USING (true);

-- Insert/Update/Delete policies for teachers
CREATE POLICY "insert_guru" ON guru FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_guru" ON guru FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_modul_ajar" ON modul_ajar FOR INSERT TO authenticated WITH CHECK (auth.uid() = guru_id);
CREATE POLICY "update_modul_ajar" ON modul_ajar FOR UPDATE TO authenticated USING (auth.uid() = guru_id);
CREATE POLICY "delete_modul_ajar" ON modul_ajar FOR DELETE TO authenticated USING (auth.uid() = guru_id);
CREATE POLICY "insert_bahan_ajar" ON bahan_ajar FOR INSERT TO authenticated WITH CHECK (auth.uid() = guru_id);
CREATE POLICY "update_bahan_ajar" ON bahan_ajar FOR UPDATE TO authenticated USING (auth.uid() = guru_id);
CREATE POLICY "delete_bahan_ajar" ON bahan_ajar FOR DELETE TO authenticated USING (auth.uid() = guru_id);
CREATE POLICY "insert_absensi" ON absensi FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_absensi" ON absensi FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "insert_nilai_lingkup_materi" ON nilai_lingkup_materi FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_nilai_lingkup_materi" ON nilai_lingkup_materi FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "insert_nilai_sas" ON nilai_sas FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_nilai_sas" ON nilai_sas FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "insert_nilai_formatif" ON nilai_formatif FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_nilai_formatif" ON nilai_formatif FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "insert_nilai_sumatif" ON nilai_sumatif FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_nilai_sumatif" ON nilai_sumatif FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "insert_profil_pancasila" ON profil_pancasila FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_profil_pancasila" ON profil_pancasila FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "insert_nilai_ekskul" ON nilai_ekskul FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_nilai_ekskul" ON nilai_ekskul FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "insert_rapor" ON rapor FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_rapor" ON rapor FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- =====================================================
-- 9. FUNCTIONS & STORED PROCEDURES
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_tahun_ajaran()
RETURNS TABLE (id UUID, nama_tahun_ajaran VARCHAR, semester VARCHAR, tanggal_mulai DATE, tanggal_selesai DATE) AS $$
BEGIN
    RETURN QUERY
    SELECT ta.id, ta.nama_tahun_ajaran, ta.semester, ta.tanggal_mulai, ta.tanggal_selesai
    FROM tahun_ajaran ta WHERE ta.is_active = true LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_siswa_by_kelas(p_kelas_id UUID)
RETURNS TABLE (id UUID, nis VARCHAR, nisn VARCHAR, nama_lengkap VARCHAR, tempat_lahir VARCHAR, tanggal_lahir DATE, jenis_kelamin VARCHAR, foto_url TEXT, status_siswa VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.nis, s.nisn, s.nama_lengkap, s.tempat_lahir, s.tanggal_lahir, s.jenis_kelamin, s.foto_url, s.status_siswa
    FROM siswa s JOIN siswa_kelas sk ON s.id = sk.siswa_id
    WHERE sk.kelas_id = p_kelas_id AND sk.is_current = true ORDER BY s.nama_lengkap ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_average_nilai(p_siswa_id UUID, p_mapel_id UUID, p_semester VARCHAR, p_tahun_ajaran_id UUID)
RETURNS DECIMAL AS $$
DECLARE avg_score DECIMAL;
BEGIN
    SELECT AVG(angka) INTO avg_score FROM nilai_lingkup_materi
    WHERE siswa_id = p_siswa_id AND mapel_id = p_mapel_id AND semester = p_semester AND tahun_ajaran_id = p_tahun_ajaran_id;
    RETURN avg_score;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_attendance_summary(p_siswa_id UUID, p_semester VARCHAR, p_tahun_ajaran_id UUID)
RETURNS TABLE (hadir INTEGER, sakit INTEGER, izin INTEGER, alpha INTEGER, total INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT COUNT(*) FILTER (WHERE status_hadir = 'Hadir')::INTEGER,
           COUNT(*) FILTER (WHERE status_hadir = 'Sakit')::INTEGER,
           COUNT(*) FILTER (WHERE status_hadir = 'Izin')::INTEGER,
           COUNT(*) FILTER (WHERE status_hadir = 'Alpha')::INTEGER,
           COUNT(*)::INTEGER
    FROM absensi WHERE siswa_id = p_siswa_id AND semester = p_semester AND tahun_ajaran_id = p_tahun_ajaran_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================
