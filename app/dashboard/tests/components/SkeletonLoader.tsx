const SkeletonLoader = () => (
    <div className="p-5 h-full theme-bg">
      <div className="h-4 w-1/3 theme-bg-subtle rounded-md mb-4 animate-pulse" />
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="h-10 flex-1 theme-bg-subtle rounded-md animate-pulse" />
        <div className="h-10 w-32 theme-bg-subtle rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-md border-2 border-dashed theme-border-color animate-pulse"
          >
            <div className="p-4 space-y-4">
              <div className="h-4 w-1/4 theme-bg-subtle rounded-md" />
              <div className="h-6 w-3/4 theme-bg-subtle rounded-md" />
              <div className="h-4 w-1/2 theme-bg-subtle rounded-md" />
            </div>
            <div className="p-2 border-t-2 border-dashed theme-border-color">
              <div className="h-8 theme-bg-subtle rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  export default SkeletonLoader;