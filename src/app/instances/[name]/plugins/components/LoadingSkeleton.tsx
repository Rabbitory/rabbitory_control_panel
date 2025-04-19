export default function LoadingSkeleton({ length }: { length: number }) {
  return (
    <div className="space-y-4">
      {[...Array(length)].map((_, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row items-center justify-between border-b border-gray-300 pb-4 animate-pulse"
        >
          <div className="mb-2 md:mb-0">
            <div className="w-32 h-4 bg-gray-600 rounded-sm"></div>
            <div className="w-48 h-3 bg-gray-60 rounded-sm mt-2"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-4 bg-gray-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
