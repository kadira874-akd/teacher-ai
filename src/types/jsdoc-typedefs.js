/**
 * JSDoc Type Definitions untuk Type Safety di JavaScript Files
 * Gunakan import type ini di file .js/.jsx untuk mendapatkan IntelliSense dan type checking
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} nama
 * @property {string} [nip]
 * @property {'guru' | 'admin' | 'wali_kelas'} role
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Kelas
 * @property {string} id
 * @property {string} nama_kelas
 * @property {number} tingkat
 * @property {string} tahun_ajaran
 * @property {1 | 2} semester
 * @property {string} [wali_kelas_id]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Siswa
 * @property {string} id
 * @property {string} nis
 * @property {string} nisn
 * @property {string} nama
 * @property {string} kelas_id
 * @property {string} [tanggal_lahir]
 * @property {string} [tempat_lahir]
 * @property {string} [alamat]
 * @property {string} [nama_ortu]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Mapel
 * @property {string} id
 * @property {string} nama_mapel
 * @property {string} [kode_mapel]
 * @property {'wajib' | 'muatan_lokal' | 'pilihan'} kategori
 * @property {number} jam_pelajaran
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Nilai
 * @property {string} id
 * @property {string} siswa_id
 * @property {string} mapel_id
 * @property {string} kelas_id
 * @property {number} nilai_angka
 * @property {string} nilai_predikat
 * @property {string} [deskripsi]
 * @property {'harian' | 'uts' | 'uas' | 'akhir'} jenis_nilai
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Absensi
 * @property {string} id
 * @property {string} siswa_id
 * @property {string} tanggal
 * @property {'hadir' | 'sakit' | 'izin' | 'alpha'} status
 * @property {string} [keterangan]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {'A' | 'B' | 'C' | 'D'} Fase
 */

/**
 * @typedef {Object} CapaianPembelajaran
 * @property {string} id
 * @property {Fase} fase
 * @property {string} mata_pelajaran
 * @property {string} elemen
 * @property {string} capaian
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} TujuanPembelajaran
 * @property {string} id
 * @property {string} cp_id
 * @property {string} kode_tp
 * @property {string} deskripsi
 * @property {number} urutan
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} Ekstrakurikuler
 * @property {string} id
 * @property {string} nama_ekstra
 * @property {string} [deskripsi]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} EkstrakurikulerSiswa
 * @property {string} id
 * @property {string} siswa_id
 * @property {string} ekstra_id
 * @property {string} [nilai]
 * @property {string} [predikat]
 * @property {string} [keterangan]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} RaporData
 * @property {Siswa} siswa
 * @property {Kelas} kelas
 * @property {Nilai[]} nilai
 * @property {Absensi[]} absensi
 * @property {EkstrakurikulerSiswa[]} ekstrakurikuler
 * @property {string} [catatan_wali]
 * @property {boolean} [tanda_tangan_ortu]
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {T | null} data
 * @property {string | null} error
 * @property {boolean} success
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {T[]} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {boolean} hasMore
 */

/**
 * @typedef {Object} ButtonProps
 * @property {import('react').ReactNode} children
 * @property {'primary' | 'secondary' | 'danger' | 'success'} [variant]
 * @property {'sm' | 'md' | 'lg'} [size]
 * @property {boolean} [isLoading]
 * @property {React.ButtonHTMLAttributes<HTMLButtonElement>} [rest]
 */

/**
 * @typedef {Object} MapelSelectorProps
 * @property {string[]} selectedMapel
 * @property {(mapelIds: string[]) => void} onChange
 * @property {string} [kelasId]
 */

/**
 * @typedef {Object} QRScannerProps
 * @property {(data: string) => void} onScan
 * @property {(error: Error) => void} [onError]
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {(email: string, password: string) => Promise<void>} login
 * @property {() => Promise<void>} logout
 * @property {(user: User | null) => void} setUser
 */

/**
 * @typedef {Object} UseManajemenDataReturn
 * @property {Kelas[]} kelas
 * @property {Mapel[]} mapel
 * @property {Siswa[]} siswa
 * @property {boolean} isLoading
 * @property {string | null} error
 * @property {() => Promise<void>} refreshKelas
 * @property {() => Promise<void>} refreshMapel
 * @property {() => Promise<void>} refreshSiswa
 */

/**
 * @template T, K
 * @typedef {Omit<T, K> & Partial<Pick<T, K>>} Optional
 */

/**
 * @template T
 * @typedef {T | null} Nullable
 */

/**
 * @typedef {Object} BaseEntity
 * @property {string} id
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

module.exports = {};
