export default function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-bg-card rounded-2xl overflow-hidden shadow-lg shadow-stone-900/20 animate-pulse"
        >
          {/* Poster skeleton */}
          <div className="aspect-video bg-border-light" />
          {/* Content skeleton */}
          <div className="p-6 space-y-3">
            <div className="h-6 bg-border-light rounded w-3/4" />
            <div className="h-4 bg-border-light rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-4 bg-border-light rounded w-24" />
              <div className="h-4 bg-border-light rounded w-20" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 bg-border-light rounded w-20" />
              <div className="h-5 bg-border-light rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
