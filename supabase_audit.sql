-- ==========================================
-- AUDIT STRUKTUR SUPABASE UNTUK TABEL SEKOLAH
-- ==========================================

-- 1. Cek struktur tabel sekolah
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sekolah'
ORDER BY ordinal_position;

-- 2. Cek kebijakan RLS (Row Level Security) pada tabel sekolah
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'sekolah';

-- 3. Cek apakah RLS aktif pada tabel sekolah
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'sekolah';

-- 4. Cek relasi foreign key pada tabel sekolah
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'sekolah';

-- 5. Cek trigger pada tabel sekolah
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'sekolah';

-- 6. Cek struktur tabel profiles (jika ada relasi)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 7. Cek fungsi-fungsi yang terkait dengan tabel sekolah
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_definition ILIKE '%sekolah%'
OR routine_name ILIKE '%sekolah%';
