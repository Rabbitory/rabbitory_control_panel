'use client';

export default function NewInstanceLoadingSkeleton () {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-1/4 h-5 bg-gray-600 rounded"></div>
          <div className="w-3/4 h-5 bg-gray-600 rounded"></div>
        </div>
      ))}
      <div className="border-t border-gray-600 my-6" />
      <div className="flex justify-end gap-4 mt-6">
        <div className="w-24 h-5 bg-gray-600 rounded"></div>
        <div className="w-28 h-5 bg-gray-600 rounded"></div>
      </div>
    </div>
  );
}