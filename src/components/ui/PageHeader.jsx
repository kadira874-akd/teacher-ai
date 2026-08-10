// ═══════════════════════════════════════════════════════════════
// PATTERN 1 — PAGE HEADER TEMPLATE
// Dipakai di SEMUA page dashboard sebagai pengganti judul ad-hoc
// FILE: bisa dibuat komponen tersendiri di src/components/ui/PageHeader.jsx
// ═══════════════════════════════════════════════════════════════
export function PageHeader({ title, description, badge, actions, backHref }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {backHref && (
            <a href={backHref}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </a>
          )}
          {badge && <span className="badge badge-primary">{badge}</span>}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
