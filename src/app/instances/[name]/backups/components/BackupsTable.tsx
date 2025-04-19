import Backup from "../types/backup";
import { Instance } from "@/types/instance";

interface Props {
  backups: Backup[];
  instance: Instance;
}

export default function BackupsTable({
  backups,
  instance,
}: Props) {
  const handleDownload = (backup: Backup) => {
    const jsonString = JSON.stringify(backup.definitions, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${instance?.name}-${backup.timestamp}.json`);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();
  };

  return (
    <div className="overflow-x-auto text-sm">
      <table className="w-full border-collapse">
        <thead className="font-heading1">
          <tr>
            <th className="p-2 text-left border-b border-gray-300">
              Date Created
            </th>
            <th className="p-2 text-left border-b border-gray-300">
              RabbitMQ Version
            </th>
            <th className="p-2 text-left border-b border-gray-300">
              Trigger
            </th>
            <th className="p-2 text-left border-b border-gray-300"></th>
          </tr>
        </thead>
        <tbody className="font-text1">
          {backups.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-2 text-gray-600">
                No backups found.
              </td>
            </tr>
          ) : (
            backups.map((backup, idx) => (
              <tr key={idx}>
                <td className="p-2 border-b border-gray-300">
                  {backup.timestamp}
                </td>
                <td className="p-2 border-b border-gray-300">
                  {backup.rabbitmq_version}
                </td>
                <td className="p-2 border-b border-gray-300">
                  {backup.trigger}
                </td>
                <td className="p-2 border-b border-gray-300">
                  <button
                    onClick={() => handleDownload(backup)}
                    className="px-3 py-1 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
