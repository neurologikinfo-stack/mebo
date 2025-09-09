export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-10 w-1/3 bg-gray-200 animate-pulse rounded"></div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
    </div>
  );
}
