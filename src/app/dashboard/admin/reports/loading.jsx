export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Skeleton de tarjetas métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>
        ))}
      </div>

      {/* Skeleton de gráfica */}
      <div className="h-80 bg-muted animate-pulse rounded-xl"></div>
    </div>
  );
}
