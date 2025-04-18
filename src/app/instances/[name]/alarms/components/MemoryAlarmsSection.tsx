import Dropdown from "./Dropdown"
import Alarm from "../types/alarm";

interface Props {
  memoryAlarms: Alarm[];
  onDelete: (type: "storage" | "memory", id: string) => void;
  onTrigger: (type: "storage" | "memory", alarm: Alarm) => void;
}

export default function MemoryAlarmsSection({
  memoryAlarms,
  onDelete,
  onTrigger,
}: Props) {
  return (
    <div className="mb-15">
      <h2 className="text-md font-heading1 text-headertext1 mb-2">
        Memory Alarms
      </h2>
      <div className="overflow-visible">
        <table className="font-heading1 text-sm w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left border-b">
                Reminder Interval
              </th>
              <th className="p-2 text-left border-b">
                Memory Threshold
              </th>
              <th className="p-2 text-left border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="font-text1 text-sm text-pagetext1">
            {memoryAlarms.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-2 text-center text-gray-600">
                  No memory alarms yet.
                </td>
              </tr>
            ) : (
              memoryAlarms.map((alarm) => (
                <tr key={alarm.id}>
                  <td className="p-2 border-b">
                    {alarm.data.reminderInterval}
                  </td>
                  <td className="p-2 border-b">
                    {alarm.data.memoryThreshold}
                  </td>
                  <td className="p-2 border-b">
                    <Dropdown
                      label="Actions"
                      options={{
                        Delete: () => onDelete("memory", alarm.id),
                        Trigger: () => onTrigger("memory", alarm),
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
