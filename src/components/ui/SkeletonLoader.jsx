'use client';

// ── Base skeleton block ────────────────────────────────────
export function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`bg-slate-200 rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

// ── Stat card skeleton ─────────────────────────────────────
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4" aria-hidden="true">
      <SkeletonBlock className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-7 w-16" />
      </div>
    </div>
  );
}

// ── Jadwal item skeleton ───────────────────────────────────
export function SkeletonJadwalItem() {
  return (
    <div className="p-4 flex items-center justify-between gap-4" aria-hidden="true">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="w-[70px] h-12 rounded-xl" />
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonBlock className="w-20 h-9 rounded-xl" />
        <SkeletonBlock className="w-20 h-9 rounded-xl" />
      </div>
    </div>
  );
}

// ── Card with header skeleton ─────────────────────────────
export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" aria-hidden="true">
      <div className="p-5 border-b border-slate-50 flex items-center gap-3">
        <SkeletonBlock className="w-6 h-6 rounded" />
        <SkeletonBlock className="h-5 w-40" />
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Full dashboard skeleton ────────────────────────────────
export function SkeletonDashboard() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-label="Memuat dashboard..." aria-busy="true">
      {/* Hero */}
      <SkeletonBlock className="w-full h-32 sm:h-36 rounded-2xl" />
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      {/* Jadwal */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <SkeletonBlock className="h-5 w-48" />
        </div>
        <SkeletonJadwalItem />
        <SkeletonJadwalItem />
        <SkeletonJadwalItem />
      </div>
      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <SkeletonBlock className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SkeletonBlock className="h-28 rounded-xl" />
          <SkeletonBlock className="h-28 rounded-xl" />
          <SkeletonBlock className="h-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Table skeleton ─────────────────────────────────────────
export function SkeletonTable({ cols = 4, rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" aria-hidden="true">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className={`h-3 flex-1 ${i === 0 ? 'max-w-[120px]' : ''}`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBlock key={j} className={`h-4 flex-1 ${j === 0 ? 'max-w-[120px]' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
