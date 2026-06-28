export default function Loading() {
  return (
    <div className="px-8 py-7 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-48 rounded-lg" style={{ backgroundColor: '#1C1F27' }} />
        <div className="flex gap-2">
          <div className="h-8 w-28 rounded-lg" style={{ backgroundColor: '#1C1F27' }} />
          <div className="h-8 w-20 rounded-lg" style={{ backgroundColor: '#1C1F27' }} />
        </div>
      </div>
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-[#252830]" style={{ backgroundColor: '#16191F' }}>
            <div style={{ paddingBottom: '62%', backgroundColor: '#181B22' }} />
            <div className="px-4 pt-3.5 pb-4 space-y-2.5">
              <div className="h-4 rounded" style={{ width: '80%', backgroundColor: '#1C1F27' }} />
              <div className="h-3 rounded" style={{ width: '55%', backgroundColor: '#1C1F27' }} />
              <div className="h-3 rounded" style={{ width: '65%', backgroundColor: '#1C1F27' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
