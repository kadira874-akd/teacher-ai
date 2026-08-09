import { create } from 'zustand';

let counter = 0;

export const useToastStore = create((set) => ({
  toasts: [],

  show: (type, message) => {
    const id = ++counter;
    set(state => ({ toasts: [...state.toasts, { id, type, message }] }));
    return id;
  },

  dismiss: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}));

// ── Hook helper untuk komponen ─────────────────────────────
export function useToast() {
  const { show, dismiss } = useToastStore();
  return {
    toast: {
      success: (msg) => show('success', msg),
      error:   (msg) => show('error', msg),
      warning: (msg) => show('warning', msg),
      info:    (msg) => show('info', msg),
    },
    dismiss,
  };
}

// ── Contoh migrasi dari alert() ────────────────────────────
//
// SEBELUM (di manajemen/page.jsx baris 77):
//   alert('Gagal memuat data kelas: ' + kelasError.message);
//
// SESUDAH:
//   import { useToast } from '@/hooks/useToast';
//   const { toast } = useToast();
//   toast.error('Gagal memuat data kelas: ' + kelasError.message);
//
// SEBELUM (di rapor/page.jsx baris 53):
//   alert('Gagal memuat data kelas: ' + kelasError.message);
//
// SESUDAH:
//   toast.error('Gagal memuat data kelas');
