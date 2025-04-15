import { Lightbulb } from "lucide-react";

export function InstanceDetails() {
  return (
    <details className="py-4 bg-card text-sm text-gray-700">
      <summary className="cursor-pointer font-text1 text-md text-pagetext1 mb-2 flex items-center gap-2 hover:text-headertext1">
        <Lightbulb className="w-6 h-6 text-btnhover1" />
        Want advice on choosing the best instance for your needs? Click
        here for recommendations
      </summary>
      <div className="px-8 mt-2 space-y-2">
        <p className="text-btn1 font-text1 py-6">
          Here are some suggested EC2 instance types for running
          RabbitMQ based on your workload:
        </p>
        <table className="w-full text-left border-pagetext1 text-sm">
          <thead className="bg-headertext1 font-heading1">
            <tr>
              <th className="px-3 py-2 border-b">Use Case</th>
              <th className="px- py-2 border-b">Instance Type</th>
              <th className="px-3 py-2 border-b">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs px-3 py-2 border-b border-gray-700">Testing</td>
              <td className="font-text1 text-pagetext1 px-3 py-2 border-b border-gray-700">t2.micro, t2.small</td>
              <td className="text-pagetext1 font-text1 text-sm px-3 py-2 border-b border-gray-700">Very low cost, good for dev or trials</td>
            </tr>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs px-3 py-2 border-b border-gray-700">
                Low Throughput
              </td>
              <td className="font-text1 text-pagetext1 px-3 py-2 border-b border-gray-700">
                m8g.medium
              </td>
              <td className="text-pagetext1 font-text1 text-sm px-3 py-2 border-b border-gray-700">
                Balanced performance with Graviton4
              </td>
            </tr>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs px-3 py-2 border-b border-gray-700">
                Medium Throughput
              </td>
              <td className="font-text1 text-pagetext1 px-3 py-2 border-b border-gray-700">
                c8g.large
              </td>
              <td className="text-pagetext1 font-text1 text-sm px-3 py-2 border-b border-gray-700">
                Compute-optimized, strong networking
              </td>
            </tr>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs  px-3 py-2 border-b border-gray-700">
                High Throughput
              </td>
              <td className="font-text1 text-pagetext1 px-3 py-2 border-b border-gray-700">
                c7gn.large, m7gd.large
              </td>
              <td className="text-pagetext1 font-text1 text-sm px-3 py-2 border-b border-gray-700">
                Great for high I/O or network-heavy workloads
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-btn1 font-text1 pt-6 pb-2">
          You can still choose from all available instance types below.
        </p>
      </div>
    </details>
  );
}