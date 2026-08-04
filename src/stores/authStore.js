import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
      set({ user: session.user, loading: false });

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