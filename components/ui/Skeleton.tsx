export function CardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="rail__track rail__track--skeleton" aria-busy="true" aria-label="Loading channels">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card card--skeleton skeleton" key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return <div className="hero hero--skeleton skeleton" aria-busy="true" aria-label="Loading featured channel" />;
}
