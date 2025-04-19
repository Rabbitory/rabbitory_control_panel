export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 20 }).map((_, index) => (
        <div key={index} className="bg-gray-600 h-4 rounded w-7/8"></div>
      ))}
    </div>
  )
}
