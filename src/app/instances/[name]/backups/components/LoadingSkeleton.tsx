export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 text-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="font-heading1">
            <tr>
              <th className="p-2 text-left border-b border-gray-600">
                Date Created
              </th>
              <th className="p-2 text-left border-b border-gray-600">
                RabbitMQ Version
              </th>
              <th className="p-2 text-left border-b border-gray-600">
                Trigger
              </th>
              <th className="p-2 text-left border-b border-gray-600"></th>
            </tr>
          </thead>
          <tbody className="font-text1">
            {[...Array(3)].map((_, index) => (
              <tr key={index}>
                <td className="p-2 border-b border-gray-600">
                  <div className="h-4 w-24 bg-gray-600 rounded-sm" />
                </td>
                <td className="p-2 border-b border-gray-600">
                  <div className="h-4 w-32 bg-gray-600 rounded-sm" />
                </td>
                <td className="p-2 border-b border-gray-600">
                  <div className="h-4 w-20 bg-gray-600 rounded-sm" />
                </td>
                <td className="p-2 border-b border-gray-600">
                  <div className="h-6 w-24 bg-gray-600 rounded-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
