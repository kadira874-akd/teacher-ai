/**
 * SUPABASE DATA SERVICES
 * 
 * Centralized data access layer for all Supabase operations.
 * This service provides type-safe, reusable functions for common database operations.
 * 
 * Usage:
 * import { authService, siswaService, kelasService } from '@/services/supabase';
 */

import { supabase } from '@/config/supabase';

// ============================================================
// AUTH SERVICE
// ============================================================
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  /**
   * Sign up new user
   */
  async signUp(email, password, metadata = {}) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`
      }
    });
  },

  /**
   * Sign out current user
   */
  async signOut() {
    return await supabase.auth.signOut();
  },

  /**
   * Get current session
   */
  async getSession() {
    return await supabase.auth.getSession();
  },

  /**
   * Get current user
   */
  async getUser() {
    return await supabase.auth.getUser();
  },

  /**
   * Reset password for email (forgot password)
   */
  async resetPasswordForEmail(email, redirectTo) {
    return await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword) {
    return await supabase.auth.updateUser({ password: newPassword });
  },

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    return await supabase.auth.updateUser({ data: updates });
  }
};

// ============================================================
// KELAS SERVICE
// ============================================================
export const kelasService = {
  /**
   * Get class by teacher ID
   */
  async getByGuruId(guruId) {
    return await supabase
      .from('kelas')
      .select('*')
      .eq('guru_id', guruId)
      .order('nama_kelas');
  },

  /**
   * Get single class by ID
   */
  async getById(id) {
    return await supabase
      .from('kelas')
      .select('*')
      .eq('id', id)
      .single();
  },

  /**
   * Create new class
   */
  async create(data) {
    return await supabase
      .from('kelas')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update class
   */
  async update(id, data) {
    return await supabase
      .from('kelas')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete class
   */
  async delete(id) {
    return await supabase.from('kelas').delete().eq('id', id);
  }
};

// ============================================================
// SISWA SERVICE
// ============================================================
export const siswaService = {
  /**
   * Get students by class ID
   */
  async getByKelasId(kelasId) {
    return await supabase
      .from('siswa')
      .select('*')
      .eq('kelas_id', kelasId)
      .order('nama');
  },

  /**
   * Get student by ID
   */
  async getById(id) {
    return await supabase
      .from('siswa')
      .select('*')
      .eq('id', id)
      .single();
  },

  /**
   * Create new student
   */
  async create(data) {
    return await supabase
      .from('siswa')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update student
   */
  async update(id, data) {
    return await supabase
      .from('siswa')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete student
   */
  async delete(id) {
    return await supabase.from('siswa').delete().eq('id', id);
  },

  /**
   * Bulk insert students
   */
  async bulkInsert(students) {
    return await supabase
      .from('siswa')
      .insert(students);
  }
};

// ============================================================
// MAPEL SERVICE
// ============================================================
export const mapelService = {
  /**
   * Get subjects by class ID
   */
  async getByKelasId(kelasId) {
    return await supabase
      .from('mapel')
      .select('*')
      .eq('kelas_id', kelasId)
      .order('urutan');
  },

  /**
   * Create new subject
   */
  async create(data) {
    return await supabase
      .from('mapel')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update subject
   */
  async update(id, data) {
    return await supabase
      .from('mapel')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete subject
   */
  async delete(id) {
    return await supabase.from('mapel').delete().eq('id', id);
  }
};

// ============================================================
// ABSENSI SERVICE
// ============================================================
export const absensiService = {
  /**
   * Get attendance by mapel and date
   */
  async getByMapelAndTanggal(mapelId, tanggal) {
    return await supabase
      .from('absensi')
      .select(`
        *,
        siswa (
          id,
          nama,
          nis,
          nisn
        )
      `)
      .eq('mapel_id', mapelId)
      .eq('tanggal', tanggal)
      .order('created_at', { ascending: false });
  },

  /**
   * Record attendance
   */
  async record(data) {
    return await supabase
      .from('absensi')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Bulk record attendance
   */
  async bulkRecord(records) {
    return await supabase
      .from('absensi')
      .insert(records);
  },

  /**
   * Update attendance status
   */
  async updateStatus(id, status) {
    return await supabase
      .from('absensi')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete attendance record
   */
  async delete(id) {
    return await supabase.from('absensi').delete().eq('id', id);
  },

  /**
   * Get attendance recap for student
   */
  async getRecapBySiswa(siswaId, mapelId) {
    return await supabase
      .from('absensi')
      .select('tanggal, status')
      .eq('siswa_id', siswaId)
      .eq('mapel_id', mapelId)
      .order('tanggal', { ascending: true });
  }
};

// ============================================================
// GURU SERVICE
// ============================================================
export const guruService = {
  /**
   * Get teacher profile by ID
   */
  async getById(id) {
    return await supabase
      .from('guru')
      .select('*')
      .eq('id', id)
      .maybeSingle();
  },

  /**
   * Update teacher profile
   */
  async update(id, data) {
    return await supabase
      .from('guru')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Create teacher profile
   */
  async create(data) {
    return await supabase
      .from('guru')
      .insert(data)
      .select()
      .single();
  }
};

// ============================================================
// SEKOLAH SERVICE
// ============================================================
export const sekolahService = {
  /**
   * Get school by ID
   */
  async getById(id) {
    return await supabase
      .from('sekolah')
      .select('*')
      .eq('id', id)
      .single();
  },

  /**
   * Create school
   */
  async create(data) {
    return await supabase
      .from('sekolah')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update school
   */
  async update(id, data) {
    return await supabase
      .from('sekolah')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }
};

// ============================================================
// TAHUN AJARAN SERVICE
// ============================================================
export const tahunAjaranService = {
  /**
   * Get academic year by class ID
   */
  async getByKelasId(kelasId) {
    return await supabase
      .from('tahun_ajaran')
      .select('*')
      .eq('kelas_id', kelasId)
      .single();
  },

  /**
   * Create or update academic year
   */
  async upsert(data) {
    const existing = await this.getByKelasId(data.kelas_id);
    
    if (existing.data) {
      return await this.update(existing.data.id, data);
    } else {
      return await this.create(data);
    }
  },

  /**
   * Create academic year
   */
  async create(data) {
    return await supabase
      .from('tahun_ajaran')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update academic year
   */
  async update(id, data) {
    return await supabase
      .from('tahun_ajaran')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }
};

// ============================================================
// ELEMEN CP SERVICE
// ============================================================
export const elemenCpService = {
  /**
   * Get curriculum elements by mapel ID
   */
  async getByMapelId(mapelId) {
    return await supabase
      .from('elemen_cp')
      .select('*')
      .eq('mapel_id', mapelId)
      .order('urutan');
  },

  /**
   * Create curriculum element
   */
  async create(data) {
    return await supabase
      .from('elemen_cp')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update curriculum element
   */
  async update(id, data) {
    return await supabase
      .from('elemen_cp')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete curriculum element
   */
  async delete(id) {
    return await supabase.from('elemen_cp').delete().eq('id', id);
  }
};

// ============================================================
// TUJUAN PEMBELAJARAN (TP) SERVICE
// ============================================================
export const tpService = {
  /**
   * Get learning objectives by element CP IDs
   */
  async getByElemenCpIds(elemenIds) {
    return await supabase
      .from('tujuan_pembelajaran')
      .select('*')
      .in('elemen_cp_id', elemenIds)
      .order('urutan_global');
  },

  /**
   * Get learning objectives by mapel ID
   */
  async getByMapelId(mapelId) {
    // First get elemen_cp IDs
    const { data: elemenData } = await supabase
      .from('elemen_cp')
      .select('id')
      .eq('mapel_id', mapelId);

    if (!elemenData || elemenData.length === 0) {
      return { data: [], error: null };
    }

    const elemenIds = elemenData.map(e => e.id);
    return await this.getByElemenCpIds(elemenIds);
  },

  /**
   * Create learning objective
   */
  async create(data) {
    return await supabase
      .from('tujuan_pembelajaran')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update learning objective
   */
  async update(id, data) {
    return await supabase
      .from('tujuan_pembelajaran')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete learning objective
   */
  async delete(id) {
    return await supabase.from('tujuan_pembelajaran').delete().eq('id', id);
  }
};

// ============================================================
// LINGKUP MATERI SERVICE
// ============================================================
export const lingkupMateriService = {
  /**
   * Get scope of materials by mapel ID
   */
  async getByMapelId(mapelId) {
    return await supabase
      .from('lingkup_materi')
      .select('*')
      .eq('mapel_id', mapelId)
      .order('urutan');
  },

  /**
   * Create scope of material
   */
  async create(data) {
    return await supabase
      .from('lingkup_materi')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update scope of material
   */
  async update(id, data) {
    return await supabase
      .from('lingkup_materi')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete scope of material
   */
  async delete(id) {
    return await supabase.from('lingkup_materi').delete().eq('id', id);
  }
};

// ============================================================
// NILAI LINGKUP MATERI SERVICE
// ============================================================
export const nilaiLingkupMateriService = {
  /**
   * Get scores by siswa and mapel
   */
  async getBySiswaAndMapel(siswaId, mapelId) {
    return await supabase
      .from('nilai_lingkup_materi')
      .select(`
        *,
        lingkup_materi (
          id,
          nama,
          mapel_id
        )
      `)
      .eq('siswa_id', siswaId)
      .eq('mapel_id', mapelId);
  },

  /**
   * Record or update score
   */
  async upsert(data) {
    const existing = await supabase
      .from('nilai_lingkup_materi')
      .select('id')
      .eq('siswa_id', data.siswa_id)
      .eq('lingkup_materi_id', data.lingkup_materi_id)
      .single();

    if (existing.data) {
      return await supabase
        .from('nilai_lingkup_materi')
        .update({ angka: data.angka })
        .eq('id', existing.data.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('nilai_lingkup_materi')
        .insert(data)
        .select()
        .single();
    }
  },

  /**
   * Bulk insert/update scores
   */
  async bulkUpsert(scores) {
    // For each score, check if exists and update or insert
    const results = [];
    for (const score of scores) {
      const result = await this.upsert(score);
      results.push(result);
    }
    return results;
  }
};

// ============================================================
// NILAI SAS SERVICE
// ============================================================
export const nilaiSasService = {
  /**
   * Get SAS scores by mapel
   */
  async getByMapelId(mapelId) {
    return await supabase
      .from('nilai_sas')
      .select(`
        *,
        siswa (
          id,
          nama
        )
      `)
      .eq('mapel_id', mapelId);
  },

  /**
   * Record or update SAS score
   */
  async upsert(data) {
    const existing = await supabase
      .from('nilai_sas')
      .select('id')
      .eq('siswa_id', data.siswa_id)
      .eq('mapel_id', data.mapel_id)
      .single();

    if (existing.data) {
      return await supabase
        .from('nilai_sas')
        .update({ angka: data.angka })
        .eq('id', existing.data.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('nilai_sas')
        .insert(data)
        .select()
        .single();
    }
  }
};

// ============================================================
// PROFIL PANCASILA SERVICE
// ============================================================
export const profilPancasilaService = {
  /**
   * Get Pancasila profile by siswa ID
   */
  async getBySiswaId(siswaId) {
    return await supabase
      .from('profil_pancasila')
      .select('*')
      .eq('siswa_id', siswaId);
  },

  /**
   * Bulk save Pancasila profile
   */
  async bulkSave(siswaId, records) {
    // Delete existing records
    await supabase
      .from('profil_pancasila')
      .delete()
      .eq('siswa_id', siswaId);

    // Insert new records
    if (records && records.length > 0) {
      return await supabase
        .from('profil_pancasila')
        .insert(records);
    }

    return { data: null, error: null };
  }
};

// ============================================================
// EKSKUL SERVICE
// ============================================================
export const ekskulService = {
  /**
   * Get extracurriculars by class ID
   */
  async getByKelasId(kelasId) {
    return await supabase
      .from('ekskul')
      .select('*')
      .eq('kelas_id', kelasId)
      .order('nama');
  },

  /**
   * Create extracurricular
   */
  async create(data) {
    return await supabase
      .from('ekskul')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update extracurricular
   */
  async update(id, data) {
    return await supabase
      .from('ekskul')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete extracurricular
   */
  async delete(id) {
    return await supabase.from('ekskul').delete().eq('id', id);
  }
};

// ============================================================
// NILAI EKSKUL SERVICE
// ============================================================
export const nilaiEkskulService = {
  /**
   * Get extracurricular scores by siswa ID
   */
  async getBySiswaId(siswaId) {
    return await supabase
      .from('nilai_ekskul')
      .select(`
        *,
        ekskul (
          id,
          nama,
          jenis
        )
      `)
      .eq('siswa_id', siswaId);
  },

  /**
   * Record or update extracurricular score
   */
  async upsert(data) {
    const existing = await supabase
      .from('nilai_ekskul')
      .select('id')
      .eq('siswa_id', data.siswa_id)
      .eq('ekskul_id', data.ekskul_id)
      .single();

    if (existing.data) {
      return await supabase
        .from('nilai_ekskul')
        .update({ 
          predikat: data.predikat, 
          deskripsi: data.deskripsi 
        })
        .eq('id', existing.data.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('nilai_ekskul')
        .insert(data)
        .select()
        .single();
    }
  }
};

// ============================================================
// RAPOR SERVICE
// ============================================================
export const raporService = {
  /**
   * Get report by siswa ID and semester
   */
  async getBySiswaAndSemester(siswaId, semester = 'Ganjil') {
    return await supabase
      .from('rapor')
      .select('*')
      .eq('siswa_id', siswaId)
      .eq('semester', semester)
      .limit(1);
  },

  /**
   * Create or update report
   */
  async upsert(data) {
    const existing = await this.getBySiswaAndSemester(data.siswa_id, data.semester);

    if (existing.data && existing.data.length > 0) {
      return await supabase
        .from('rapor')
        .update(data)
        .eq('id', existing.data[0].id)
        .select()
        .single();
    } else {
      return await supabase
        .from('rapor')
        .insert(data)
        .select()
        .single();
    }
  },

  /**
   * Delete report
   */
  async delete(siswaId, semester = 'Ganjil') {
    return await supabase
      .from('rapor')
      .delete()
      .eq('siswa_id', siswaId)
      .eq('semester', semester);
  }
};

// ============================================================
// MODUL AJAR SERVICE
// ============================================================
export const modulAjarService = {
  /**
   * Get teaching modules by TP ID
   */
  async getByTpId(tpId) {
    return await supabase
      .from('modul_ajar')
      .select(`
        *,
        tujuan_pembelajaran (
          kode_tp,
          teks
        ),
        bahan_ajar (*)
      `)
      .eq('tp_id', tpId)
      .order('created_at', { ascending: false });
  },

  /**
   * Create teaching module
   */
  async create(data) {
    return await supabase
      .from('modul_ajar')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update teaching module
   */
  async update(id, data) {
    return await supabase
      .from('modul_ajar')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete teaching module
   */
  async delete(id) {
    return await supabase.from('modul_ajar').delete().eq('id', id);
  }
};

// ============================================================
// BAHAN AJAR SERVICE
// ============================================================
export const bahanAjarService = {
  /**
   * Get teaching materials by modul ajar ID
   */
  async getByModulAjarId(modulAjarId) {
    return await supabase
      .from('bahan_ajar')
      .select('*')
      .eq('modul_ajar_id', modulAjarId);
  },

  /**
   * Upload file to storage
   */
  async uploadFile(file, bucket = 'bahan-ajar', path) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  },

  /**
   * Create teaching material record
   */
  async create(data) {
    return await supabase
      .from('bahan_ajar')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Delete teaching material
   */
  async delete(id) {
    return await supabase.from('bahan_ajar').delete().eq('id', id);
  }
};

// ============================================================
// JADWAL MAPEL SERVICE
// ============================================================
export const jadwalMapelService = {
  /**
   * Get schedule by class ID
   */
  async getByKelasId(kelasId) {
    return await supabase
      .from('jadwal_mapel')
      .select(`
        *,
        mapel:mapel_id (
          id,
          nama
        )
      `)
      .eq('kelas_id', kelasId)
      .order('hari')
      .order('jam_mulai');
  },

  /**
   * Get schedule by day
   */
  async getByHari(kelasId, hari) {
    return await supabase
      .from('jadwal_mapel')
      .select(`
        *,
        mapel:mapel_id (
          id,
          nama
        )
      `)
      .eq('kelas_id', kelasId)
      .eq('hari', hari)
      .order('jam_mulai');
  },

  /**
   * Create schedule
   */
  async create(data) {
    return await supabase
      .from('jadwal_mapel')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Update schedule
   */
  async update(id, data) {
    return await supabase
      .from('jadwal_mapel')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete schedule
   */
  async delete(id) {
    return await supabase.from('jadwal_mapel').delete().eq('id', id);
  }
};

// ============================================================
// NILAI FORMATIF SERVICE
// ============================================================
export const nilaiFormatifService = {
  /**
   * Get formative scores by mapel ID
   */
  async getByMapelId(mapelId) {
    return await supabase
      .from('nilai_formatif')
      .select(`
        *,
        siswa:siswa_id (
          id,
          nama
        ),
        mapel:mapel_id (
          id,
          nama
        )
      `)
      .eq('mapel_id', mapelId)
      .order('tanggal', { ascending: false });
  },

  /**
   * Record formative score
   */
  async record(data) {
    return await supabase
      .from('nilai_formatif')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Delete formative score
   */
  async delete(id) {
    return await supabase.from('nilai_formatif').delete().eq('id', id);
  }
};

// ============================================================
// NILAI SUMATIF SERVICE
// ============================================================
export const nilaiSumatifService = {
  /**
   * Get summative scores by mapel ID
   */
  async getByMapelId(mapelId) {
    return await supabase
      .from('nilai_sumatif')
      .select(`
        *,
        siswa:siswa_id (
          id,
          nama
        ),
        mapel:mapel_id (
          id,
          nama
        )
      `)
      .eq('mapel_id', mapelId)
      .order('tanggal', { ascending: false });
  },

  /**
   * Record summative score
   */
  async record(data) {
    return await supabase
      .from('nilai_sumatif')
      .insert(data)
      .select()
      .single();
  },

  /**
   * Delete summative score
   */
  async delete(id) {
    return await supabase.from('nilai_sumatif').delete().eq('id', id);
  }
};

// Export all services as default
export default {
  auth: authService,
  kelas: kelasService,
  siswa: siswaService,
  mapel: mapelService,
  absensi: absensiService,
  guru: guruService,
  sekolah: sekolahService,
  tahunAjaran: tahunAjaranService,
  elemenCp: elemenCpService,
  tp: tpService,
  lingkupMateri: lingkupMateriService,
  nilaiLingkupMateri: nilaiLingkupMateriService,
  nilaiSas: nilaiSasService,
  profilPancasila: profilPancasilaService,
  ekskul: ekskulService,
  nilaiEkskul: nilaiEkskulService,
  rapor: raporService,
  modulAjar: modulAjarService,
  bahanAjar: bahanAjarService,
  jadwalMapel: jadwalMapelService,
  nilaiFormatif: nilaiFormatifService,
  nilaiSumatif: nilaiSumatifService
};
