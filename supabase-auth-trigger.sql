-- ============================================================================
-- TRIGGER: Auto-create guru profile setelah signup
-- ============================================================================
-- Trigger ini akan otomatis membuat entri di tabel 'guru' setiap kali
-- user baru signup melalui Supabase Auth
-- ============================================================================

-- Fungsi untuk auto-create guru profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.guru (
    id,
    nama_lengkap,
    email_pribadi,
    nip,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nrg', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger jika sudah ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- RLS POLICIES UNTUK TABEL GURU
-- ============================================================================
-- Enable RLS
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.guru;
CREATE POLICY "Users can view own profile"
  ON public.guru
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for trigger)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.guru;
CREATE POLICY "Users can insert own profile"
  ON public.guru
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.guru;
CREATE POLICY "Users can update own profile"
  ON public.guru
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Service role can do anything
DROP POLICY IF EXISTS "Service role full access" ON public.guru;
CREATE POLICY "Service role full access"
  ON public.guru
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES UNTUK TABEL SEKOLAH
-- ============================================================================
ALTER TABLE public.sekolah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view schools" ON public.sekolah;
CREATE POLICY "Authenticated users can view schools"
  ON public.sekolah
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert schools" ON public.sekolah;
CREATE POLICY "Authenticated users can insert schools"
  ON public.sekolah
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES UNTUK TABEL KELAS
-- ============================================================================
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view classes" ON public.kelas;
CREATE POLICY "Authenticated users can view classes"
  ON public.kelas
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert classes" ON public.kelas;
CREATE POLICY "Authenticated users can insert classes"
  ON public.kelas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES UNTUK TABEL SISWA
-- ============================================================================
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view students" ON public.siswa;
CREATE POLICY "Authenticated users can view students"
  ON public.siswa
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert students" ON public.siswa;
CREATE POLICY "Authenticated users can insert students"
  ON public.siswa
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES UNTUK TABEL MATA PELAJARAN
-- ============================================================================
ALTER TABLE public.mata_pelajaran ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view subjects" ON public.mata_pelajaran;
CREATE POLICY "Authenticated users can view subjects"
  ON public.mata_pelajaran
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert subjects" ON public.mata_pelajaran;
CREATE POLICY "Authenticated users can insert subjects"
  ON public.mata_pelajaran
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TESTING: Manual create guru profile (optional)
-- ============================================================================
-- Jika Anda sudah punya user di auth.users tapi tidak ada di tabel guru,
-- jalankan command ini untuk manual create profile:
-- 
-- INSERT INTO public.guru (id, nama_guru, email, nip)
-- SELECT 
--   id,
--   COALESCE(raw_user_meta_data->>'full_name', email),
--   email,
--   COALESCE(raw_user_meta_data->>'nrg', '')
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.guru);
