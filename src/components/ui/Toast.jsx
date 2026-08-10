// ═══════════════════════════════════════════════════════════════
// PATTERN 10 — TOAST NOTIFICATION
// FILE: src/components/ui/Toast.jsx (baru, menggantikan alert())
// CARA PAKAI: import { useToast } from '@/hooks/useToast' (sudah ada)
// Ini adalah komponen visual Toast-nya
// ═══════════════════════════════════════════════════════════════
const TOAST_ICONS = {
  success: (
    <svg className="w-4 h-4 text-[var(--color-success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-[var(--color-danger)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-[var(--color-warning)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-[var(--color-info)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/>
    </svg>
  ),
};
 
const TOAST_STYLES = {
  success: { border: '#BBF7D0', bg: '#F0FFF4', dot: 'var(--color-success)' },
  error:   { border: '#FECACA', bg: '#FEF2F2', dot: 'var(--color-danger)' },
  warning: { border: '#FDE68A', bg: '#FFFBEB', dot: 'var(--color-warning)' },
  info:    { border: '#BFDBFE', bg: '#EFF6FF', dot: 'var(--color-info)' },
};
 
export function ToastItem({ type = 'info', message, onClose }) {
  const style = TOAST_STYLES[type] || TOAST_STYLES.info;
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-2xl animate-slide-in-right"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '360px',
        minWidth: '240px',
      }}
    >
      <div className="shrink-0 mt-0.5">{TOAST_ICONS[type]}</div>
      <p className="flex-1 text-sm font-medium text-[var(--text-primary)]">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}
