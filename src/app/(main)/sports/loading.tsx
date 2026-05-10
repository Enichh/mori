export default function SportsLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card">
        <div className="container-cine text-center py-16">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
            Live Sports
          </h1>
          <p className="text-muted-foreground mt-2">Loading events...</p>
        </div>
      </section>

      {/* Marquee skeleton */}
      <section className="marquee-ticker">
        <div className="marquee-ticker-content">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-7 pr-7">
              <span className="h-3 w-24 bg-card rounded animate-pulse" />
              <span className="text-[rgb(61,61,61)] text-xs">✕</span>
            </span>
          ))}
        </div>
      </section>

      {/* Filter skeleton */}
      <div className="container-cine pt-8 pb-10">
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 rounded-md bg-card animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-card animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
