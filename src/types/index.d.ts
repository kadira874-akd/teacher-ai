/**
 * Type definitions for TeacherAI Application
 * File ini menyediakan type safety untuk seluruh aplikasi
 */

// ==================== USER & AUTH TYPES ====================
export interface User {
  id: string;
  email: string;
  nama: string;
  nip?: string;
  role: 'guru' | 'admin' | 'wali_kelas';
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

// ==================== KELAS TYPES ====================
export interface Kelas {
  id: string;
  nama_kelas: string;
  tingkat: number;
  tahun_ajaran: string;
  semester: 1 | 2;
  wali_kelas_id?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== SISWA TYPES ====================
export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  kelas_id: string;
  tanggal_lahir?: string;
  tempat_lahir?: string;
  alamat?: string;
  nama_ortu?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== MAPEL TYPES ====================
export interface Mapel {
  id: string;
  nama_mapel: string;
  kode_mapel?: string;
  kategori: 'wajib' | 'muatan_lokal' | 'pilihan';
  jam_pelajaran: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== NILAI TYPES ====================
export interface Nilai {
  id: string;
  siswa_id: string;
  mapel_id: string;
  kelas_id: string;
  nilai_angka: number;
  nilai_predikat: string;
  deskripsi?: string;
  jenis_nilai: 'harian' | 'uts' | 'uas' | 'akhir';
  created_at?: string;
  updated_at?: string;
}

// ==================== ABSENSI TYPES ====================
export interface Absensi {
  id: string;
  siswa_id: string;
  tanggal: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpha';
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== CURRICULUM TYPES ====================
export type Fase = 'A' | 'B' | 'C' | 'D';

export interface CapaianPembelajaran {
  id: string;
  fase: Fase;
  mata_pelajaran: string;
  elemen: string;
  capaian: string;
  created_at?: string;
}

export interface TujuanPembelajaran {
  id: string;
  cp_id: string;
  kode_tp: string;
  deskripsi: string;
  urutan: number;
  created_at?: string;
}

// ==================== RAPOR TYPES ====================
export interface RaporData {
  siswa: Siswa;
  kelas: Kelas;
  nilai: Nilai[];
  absensi: Absensi[];
  ekstrakurikuler: EkstrakurikulerSiswa[];
  catatan_wali?: string;
  tanda_tangan_ortu?: boolean;
}

export interface Ekstrakurikuler {
  id: string;
  nama_ekstra: string;
  deskripsi?: string;
  created_at?: string;
}

export interface EkstrakurikulerSiswa {
  id: string;
  siswa_id: string;
  ekstra_id: string;
  nilai?: string;
  predikat?: string;
  keterangan?: string;
  created_at?: string;
}

// ==================== COMPONENT PROPS TYPES ====================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export interface MapelSelectorProps {
  selectedMapel: string[];
  onChange: (mapelIds: string[]) => void;
  kelasId?: string;
}

export interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  isActive: boolean;
}

// ==================== SERVICE RESPONSE TYPES ====================
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==================== HOOK TYPES ====================
export interface UseAuthStoreReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<User>>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export interface UseManajemenDataReturn {
  kelas: Kelas[];
  mapel: Mapel[];
  siswa: Siswa[];
  isLoading: boolean;
  error: string | null;
  refreshKelas: () => Promise<void>;
  refreshMapel: () => Promise<void>;
  refreshSiswa: () => Promise<void>;
}

// ==================== UTILITY TYPES ====================
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Nullable<T> = T | null;

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== ENVIRONMENT TYPES ====================
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_APP_NAME?: string;
    }
  }
}

export {};
