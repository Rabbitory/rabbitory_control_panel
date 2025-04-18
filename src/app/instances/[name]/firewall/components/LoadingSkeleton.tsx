export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse py-2 px-3 border-[0.5] border-gray-700 rounded-md"
        >
          <div className="font-text1 grid grid-cols-12 gap-4 items-start">
            <div className="col-span-2 bg-gray-600 h-6 rounded-sm" />
            <div className="col-span-2 bg-gray-600 h-6 rounded-sm" />
            <div className="col-span-4 bg-gray-600 h-6 rounded-sm" />
            <div className="col-span-3 bg-gray-600 h-6 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}
