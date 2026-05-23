const SkeletonLoader = () => (
    <div className="space-y-4">
      <div className="h-4 w-1/3 rounded-md bg-[rgba(28,28,28,0.08)] animate-pulse" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="h-10 flex-1 rounded-xl bg-[rgba(28,28,28,0.08)] animate-pulse" />
        <div className="h-10 w-32 rounded-xl bg-[rgba(28,28,28,0.08)] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] animate-pulse"
          >
            <div className="space-y-4 p-5">
              <div className="h-4 w-1/4 rounded-md bg-[rgba(28,28,28,0.08)]" />
              <div className="h-6 w-3/4 rounded-md bg-[rgba(28,28,28,0.08)]" />
              <div className="h-4 w-1/2 rounded-md bg-[rgba(28,28,28,0.08)]" />
            </div>
            <div className="border-t border-[var(--border)] p-3">
              <div className="h-8 rounded-xl bg-[rgba(28,28,28,0.08)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  export default SkeletonLoader;