export default function Loading() {
  return (
    <div className="container-cine py-12">
      {/* Hero skeleton */}
      <div className="w-full h-[50vh] md:h-[70vh] rounded-lg bg-card animate-pulse mb-12" />

      {/* Section skeletons */}
      {[...Array(3)].map((_, sectionIdx) => (
        <section key={sectionIdx} className="py-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-56 bg-card rounded animate-pulse" />
            <div className="h-5 w-20 bg-card rounded animate-pulse" />
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[2/3] rounded-lg bg-card animate-pulse" />
                <div className="h-4 w-3/4 bg-card rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-card rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
