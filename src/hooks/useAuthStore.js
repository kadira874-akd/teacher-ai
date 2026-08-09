import { create } from 'zustand';
import { supabase } from '@/config/supabase';

/**
 * @typedef {import('@/types/jsdoc-typedefs').User} User
 * @typedef {import('@/types/jsdoc-typedefs').ApiResponse} ApiResponse
 */

/**
 * @typedef {Object} AuthStoreState
 * @property {User | null} user
 * @property {any | null} profile
 * @property {boolean} loading
 * @property {(user: User | null) => void} setUser
 * @property {(profile: any | null) => void} setProfile
 * @property {(loading: boolean) => void} setLoading
 * @property {() => Promise<void>} fetchSession
 * @property {() => Promise<void>} signOut
 */

/** @type {import('zustand').StoreApi<AuthStoreState>} */
export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  fetchSession: async () => {
    console.log('🔐 [AuthStore] Memulai pemeriksaan sesi...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ [AuthStore] Error getSession:', sessionError);
    }

    if (session?.user) {
      console.log('✅ [AuthStore] Sesi ditemukan untuk:', session.user.email);
      set({ user: /** @type {User} */ (session.user), loading: false });

      console.log('📡 [AuthStore] Mengambil data profil guru dari database...');
      const { data: profile, error: profileError } = await supabase
        .from('guru')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle(); // maybeSingle lebih aman daripada single

      if (profileError) {
        console.error('❌ [AuthStore] Error mengambil profil:', profileError);
      } else if (profile) {
        console.log('🎉 [AuthStore] Profil guru berhasil diambil:', profile.nama);
        set({ profile });
      } else {
        console.warn('⚠️ [AuthStore] User ada di Auth, tapi tidak ada di tabel guru.');
      }
    } else {
      console.log('⚠️ [AuthStore] Tidak ada sesi aktif (Belum login).');
      set({ user: null, profile: null, loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  }
}));