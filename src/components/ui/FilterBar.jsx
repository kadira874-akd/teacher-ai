// ═══════════════════════════════════════════════════════════════
// PATTERN 6 — SELECT MAPEL & TANGGAL BAR
// Dipakai di manajemen, absensi, riwayat-rekap
// FILE: src/components/ui/FilterBar.jsx (baru)
// ═══════════════════════════════════════════════════════════════
export function FilterBar({ mapelList, selectedMapel, onMapelChange, tanggal, onTanggalChange, showDate = true }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label className="form-label">Mata Pelajaran</label>
        <select
          value={selectedMapel}
          onChange={e => onMapelChange(e.target.value)}
          className="form-select"
        >
          <option value="">— Pilih Mata Pelajaran —</option>
          {mapelList.map(m => (
            <option key={m.id} value={m.id}>{m.nama}</option>
          ))}
        </select>
      </div>
      {showDate && (
        <div className="sm:w-48">
          <label className="form-label">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={e => onTanggalChange(e.target.value)}
            className="form-input"
          />
        </div>
      )}
    </div>
  );
}
