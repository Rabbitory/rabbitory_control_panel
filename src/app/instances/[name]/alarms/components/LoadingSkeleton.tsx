export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-full h-6 bg-gray-600 rounded-sm"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-full h-6 bg-gray-600 rounded-sm"></div>
        </div>
      </div>
    </div>
  )
}
