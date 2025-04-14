import { Lightbulb } from "lucide-react";

interface StorageTableCellProps {
  children: React.ReactNode;
}

function StorageTableCell({ children }: StorageTableCellProps) {
  return (
    <td className="font-text1 text-pagetext1 px-3 py-2 border-b border-gray-700">
      {children}
    </td>
  );
}

export function StorageDetails() {
  return (
    <details className="py-4 bg-card text-sm text-gray-700">
      <summary className="cursor-pointer font-text1 text-md text-pagetext1 mb-2 flex items-center gap-2 hover:text-headertext1">
        <Lightbulb className="w-6 h-6 text-btnhover1" />
        This is the storage volume attached to your instance. Minimum size is 8 GB. Click here for recommendations
      </summary>
      <div className="px-8 mt-2 space-y-2">
        <p className="text-btn1 font-text1 py-6">
          Here are some approximate numbers showing how many messages you could
          store at a given average message size and storage size.
        </p>
        <table className="w-full text-left border-pagetext1 text-sm">
          <thead className="bg-headertext1 font-heading1">
            <tr>
              <th className="px-3 py-2 border-b">Storage Size</th>
              <th className="px-3 py-2 border-b">1KB Avg Msg</th>
              <th className="px-3 py-2 border-b">10KB Avg Msg</th>
              <th className="px-3 py-2 border-b">100KB Avg Msg</th>
              <th className="px-3 py-2 border-b">1MB Avg Msg</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs px-3 py-2 border-b border-gray-700">
                8GB
              </td>
              <StorageTableCell>4.19 M</StorageTableCell>
              <StorageTableCell>419 K</StorageTableCell>
              <StorageTableCell>41.9 K</StorageTableCell>
              <StorageTableCell>4,096</StorageTableCell>
            </tr>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs px-3 py-2 border-b border-gray-700">
                25GB
              </td>
              <StorageTableCell>22.0 M</StorageTableCell>
              <StorageTableCell>2.20 M</StorageTableCell>
              <StorageTableCell>220 K</StorageTableCell>
              <StorageTableCell>21,504</StorageTableCell>
            </tr>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs px-3 py-2 border-b border-gray-700">
                50GB
              </td>
              <StorageTableCell>48.2 M</StorageTableCell>
              <StorageTableCell>4.82 M</StorageTableCell>
              <StorageTableCell>482 K</StorageTableCell>
              <StorageTableCell>47,104</StorageTableCell>
            </tr>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs px-3 py-2 border-b border-gray-700">
                100GB
              </td>
              <StorageTableCell>100.7 M</StorageTableCell>
              <StorageTableCell>10.07 M</StorageTableCell>
              <StorageTableCell>1.01 M</StorageTableCell>
              <StorageTableCell>98,304</StorageTableCell>
            </tr>
            <tr>
              <td className="font-heading1 text-headertext1 text-xs px-3 py-2 border-b border-gray-700">
                500GB
              </td>
              <StorageTableCell>520.1 M</StorageTableCell>
              <StorageTableCell>52.0 M</StorageTableCell>
              <StorageTableCell>5.20 M</StorageTableCell>
              <StorageTableCell>507,904</StorageTableCell>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}
