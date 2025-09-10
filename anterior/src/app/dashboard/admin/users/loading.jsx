export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Skeleton del título */}
      <div className="h-8 w-1/4 bg-gray-200 animate-pulse rounded"></div>

      {/* Skeleton de la tabla de usuarios */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="bg-gray-100 h-10 animate-pulse"></div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
