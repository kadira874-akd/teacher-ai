// ═══════════════════════════════════════════════════════════════
// PATTERN 3 — DATA TABLE DENGAN SEARCH & EMPTY STATE
// FILE: src/components/ui/DataTable.jsx (baru)
// DIPAKAI DI: pengaturan/page.jsx (tabel siswa), manajemen/page.jsx
// ═══════════════════════════════════════════════════════════════
export function DataTable({ columns, rows, emptyTitle, emptyDesc, searchPlaceholder, onSearch }) {
  return (
    <div className="card-section">
      {onSearch && (
        <div className="p-4 border-b border-[var(--border-light)]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              placeholder={searchPlaceholder || 'Cari…'}
              onChange={e => onSearch(e.target.value)}
              className="form-input pl-9"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      )}
      <div className="table-container">
        <table className="table-pro">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 0, border: 'none' }}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                    </div>
                    <p className="empty-state-title">{emptyTitle || 'Belum ada data'}</p>
                    <p className="empty-state-desc">{emptyDesc || 'Data akan muncul di sini.'}</p>
                  </div>
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
