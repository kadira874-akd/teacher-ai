'use client';

/**
 * Skeleton primitives — used to build loading placeholders that match the
 * real shape of the content underneath, instead of a generic spinner.
 * All pieces use the `.skeleton` shimmer animation already defined in
 * globals.css, so no extra CSS is needed.
 */

export function SkeletonBox({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonText({ width = 'w-full', className = '' }) {
  return <div className={`skeleton h-3.5 rounded-md ${width} ${className}`} />;
}

/** Mirrors .mobile-stat-card / stat cards used on the dashboard */
export function SkeletonStatCard() {
  return (
    <div className="mobile-stat-card sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <SkeletonBox className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-20" className="h-2.5" />
          <SkeletonText width="w-12" className="h-6" />
        </div>
      </div>
    </div>
  );
}

/** Header hero block (gradient banner at top of a page) */
export function SkeletonPageHeader() {
  return (
    <div className="rounded-2xl p-5 sm:p-6 lg:p-8 bg-slate-100 overflow-hidden">
      <SkeletonText width="w-2/3" className="h-6 mb-3" />
      <SkeletonText width="w-1/3" className="h-3.5" />
    </div>
  );
}

/** A generic white card with a title row and N body lines */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <SkeletonText width="w-1/3" className="h-4 mb-4" />
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonText key={i} width={i % 2 === 0 ? 'w-full' : 'w-5/6'} />
        ))}
      </div>
    </div>
  );
}

/** A list-row item (used for jadwal / riwayat rows) */
export function SkeletonListRow() {
  return (
    <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 border-b border-slate-100 last:border-0">
      <SkeletonBox className="w-16 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="w-1/2" />
        <SkeletonText width="w-1/4" className="h-2.5" />
      </div>
      <SkeletonBox className="w-20 h-9 rounded-xl shrink-0" />
    </div>
  );
}

/** Table skeleton — N rows x N columns, wrapped like the app's real tables */
export function SkeletonTable({ rows = 6, cols = 3 }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              {Array.from({ length: cols }).map((_, c) => (
                <th key={c} className="px-4 py-3 text-left">
                  <SkeletonText width="w-16" className="h-3" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="px-4 py-3">
                    <SkeletonText width={c === 0 ? 'w-6' : 'w-24'} />
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

/** Full dashboard-page skeleton: header + stat grid + list card + quick actions */
export function SkeletonDashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <SkeletonText width="w-1/3" className="h-4" />
        </div>
        <SkeletonListRow />
        <SkeletonListRow />
        <SkeletonListRow />
      </div>
      <SkeletonCard lines={2} />
    </div>
  );
}

/** Full page skeleton for management/rekap/rapor style pages: header + filters + table */
export function SkeletonManagementPage() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
        <SkeletonBox className="h-11 rounded-xl w-full sm:w-48" />
        <SkeletonBox className="h-11 rounded-xl w-full sm:w-48" />
        <SkeletonBox className="h-11 rounded-xl w-full sm:w-32 sm:ml-auto" />
      </div>
      <SkeletonTable rows={7} cols={4} />
    </div>
  );
}
