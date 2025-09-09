export default function Loading() {
  return (
    <div className="p-8 space-y-8">
      {/* Skeleton del título */}
      <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded"></div>

      {/* Skeleton de las tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 animate-pulse rounded-xl"
          ></div>
        ))}
      </div>

      {/* Skeleton de tabla o contenido */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="bg-gray-100 h-10 animate-pulse"></div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
