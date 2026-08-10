/**
 * Button — Komponen tombol profesional terpusat
 * Menggunakan design system dari globals.css v3.0
 * Semua variant, size, dan state dihandle di sini.
 */
export default function Button({
  children,
  onClick,
  variant  = 'primary',
  size     = 'md',
  type     = 'button',
  disabled  = false,
  loading   = false,
  fullWidth = false,
  icon,
  className = '',
  ...rest
}) {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    success:   'btn-success',
    ghost:     'btn-ghost',
    outline:   'bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--surface-active)] rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs rounded-lg',
    sm: 'px-3.5 py-2 text-[0.8125rem] rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    xl: 'px-8 py-3.5 text-base rounded-2xl',
  };

  // outline variant handles its own padding, skip size padding override
  const sizeClass = variant === 'outline' ? '' : sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'btn',
        variants[variant] || variants.primary,
        sizeClass,
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      ) : icon ? (
        <span className="shrink-0 text-[1.1em]" aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
