export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-8 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-slate-200 mb-8">
          <div className="max-w-2xl mx-auto py-6">
            <div className="flex items-center justify-between animate-slide-up">
              <div className="skeleton h-8 w-48 rounded" />
              <div className="skeleton h-6 w-32 rounded" />
            </div>
      </div>
      </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
          >
              <div className="skeleton h-12 w-12 rounded-lg mb-4" />
              <div className="skeleton h-4 w-24 rounded mb-2" />
              <div className="skeleton h-8 w-32 rounded" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm animate-scale-in"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="skeleton h-6 w-40 rounded mb-6" />
              <div className="skeleton h-64 w-full rounded" />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
