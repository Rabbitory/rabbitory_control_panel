import Dropdown from "./Dropdown"
import Alarm from "../types/alarm";

interface Props {
  storageAlarms: Alarm[];
  onDelete: (type: "storage" | "memory", id: string) => void;
  onTrigger: (type: "storage" | "memory", alarm: Alarm) => void;
}

export default function StorageAlarmsSection({
  storageAlarms,
  onDelete,
  onTrigger,
}: Props) {
  return (
    <div className="mb-15">
      <h2 className="text-md font-heading1 text-headertext1 mb-2">
        Storage Alarms
      </h2>
      <div className="overflow-visible">
        <table className="font-heading1 text-sm w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left border-b">
                Storage Threshold
              </th>
              <th className="p-2 text-left border-b">
                Reminder Interval
              </th>
              <th className="p-2 text-left border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="font-text1 text-sm text-pagetext1">
            {storageAlarms.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-2 text-md text-center text-gray-600">
                  No storage alarms yet.
                </td>
              </tr>
            ) : (
              storageAlarms.map((alarm) => (
                <tr key={alarm.id}>
                  <td className="p-2 border-b">
                    {alarm.data.storageThreshold}
                  </td>
                  <td className="p-2 border-b">
                    {alarm.data.reminderInterval}
                  </td>
                  <td className="p-2 border-b">
                    <Dropdown
                      label="Actions"
                      options={{
                        Delete: () => onDelete("storage", alarm.id),
                        Trigger: () => onTrigger("storage", alarm),
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
