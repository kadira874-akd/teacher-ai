// ═══════════════════════════════════════════════════════════════
// PATTERN 2 — TAB NAVIGATION COMPONENT
// FILE: src/components/ui/Tabs.jsx (baru)
// DIPAKAI DI: manajemen/page.jsx, pengaturan/page.jsx, rapor/page.jsx
// ═══════════════════════════════════════════════════════════════
export function TabNav({ tabs, active, onChange }) {
  return (
    <div className="tabs-container" role="tablist" aria-label="Navigasi bagian">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`tab-item ${active === tab.id ? 'tab-active' : ''}`}
        >
          {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={`badge ${active === tab.id ? 'badge-primary' : 'badge-neutral'} ml-1`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
