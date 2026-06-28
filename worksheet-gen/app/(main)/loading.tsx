export default function Loading() {
  return (
    <div className="px-8 py-7 animate-pulse">
      <div className="h-7 w-44 rounded-lg mb-8" style={{ backgroundColor: '#1C1F27' }} />
      <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 border border-[#252830]" style={{ backgroundColor: '#16191F' }}>
            <div className="h-5 rounded mb-3" style={{ width: '70%', backgroundColor: '#1C1F27' }} />
            <div className="h-3 rounded" style={{ width: '40%', backgroundColor: '#1C1F27' }} />
          </div>
        ))}
      </div>
      <div className="h-5 w-36 rounded mb-4" style={{ backgroundColor: '#1C1F27' }} />
      <div className="rounded-xl border border-[#252830] overflow-hidden" style={{ backgroundColor: '#16191F' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-t border-[#1A1D22] first:border-0">
            <div className="h-4 rounded flex-1" style={{ backgroundColor: '#1C1F27' }} />
            <div className="h-4 w-24 rounded" style={{ backgroundColor: '#1C1F27' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
