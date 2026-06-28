export default function ReportsPage() {
  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Reports</h1>
      <p className="text-sm mb-10" style={{ color: '#5A6070' }}>
        Track student performance and question set analytics.
      </p>

      <div
        className="rounded-2xl p-16 flex flex-col items-center justify-center"
        style={{
          backgroundColor: 'rgba(63,68,110,0.06)',
          border: '1px dashed rgba(77,82,138,0.22)',
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: '#1A1D28', border: '1px solid #252830' }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#4D528A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18V9m5 9V5m5 13v-6m5 6V2" />
            <path d="M1 19.5h20" />
          </svg>
        </div>

        <p className="text-sm font-medium mb-1.5" style={{ color: '#A8B0BE' }}>
          Reports coming soon
        </p>
        <p className="text-xs text-center max-w-xs" style={{ color: '#4B5563' }}>
          Student submission tracking, score breakdowns, and question-level analytics will appear here.
        </p>
      </div>
    </div>
  )
}
