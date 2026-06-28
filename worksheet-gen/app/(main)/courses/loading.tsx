export default function Loading() {
  return (
    <div className="px-8 py-7 animate-pulse">
      <div className="h-7 w-32 rounded-lg mb-6" style={{ backgroundColor: '#1C1F27' }} />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-6 border border-[#252830]" style={{ backgroundColor: '#16191F' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="h-5 w-48 rounded mb-2" style={{ backgroundColor: '#1C1F27' }} />
                <div className="h-3 w-32 rounded" style={{ backgroundColor: '#1C1F27' }} />
              </div>
              <div className="h-8 w-24 rounded-lg" style={{ backgroundColor: '#1C1F27' }} />
            </div>
            <div className="flex gap-6">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-3 w-20 rounded" style={{ backgroundColor: '#1C1F27' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
