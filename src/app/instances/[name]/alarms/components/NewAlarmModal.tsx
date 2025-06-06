import { useInstanceContext } from "../../InstanceContext";
import { useState } from "react";
import ErrorBanner from "@/app/instances/components/ErrorBanner";
import axios from "axios";

interface Alarm {
  id: string;
  data: {
    memoryThreshold: number;
    storageThreshold: number;
    reminderInterval: number;
  };
}
interface Props {
  onClose: () => void;
  onAddAlarms: (alarms: Alarm[], type: string) => void;
}

interface Data {
  memoryThreshold?: number;
  storageThreshold?: number;
  reminderInterval: number;
}

export const NewAlarmModal = ({ onClose, onAddAlarms }: Props) => {
  const { instance } = useInstanceContext();
  const [saving, setSaving] = useState(false);
  const [alarmType, setAlarmType] = useState("");
  const [memoryThreshold, setMemoryThreshold] = useState(60);
  const [storageThreshold, setStorageThreshold] = useState(90);
  const [reminderInterval, setReminderInterval] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  const isValidData = ({
    memoryThreshold,
    storageThreshold,
    reminderInterval,
  }: Data) => {
    if (!memoryThreshold && !storageThreshold) {
      setErrors((prev) => [
        ...prev,
        "A memory or storage threshold is required.",
      ]);
      return false;
    }

    if (reminderInterval <= 0) {
      setErrors((prev) => [
        ...prev,
        "Reminder interval must be greater than 0.",
      ]);
      return false;
    }

    if (memoryThreshold && (memoryThreshold < 1 || memoryThreshold > 100)) {
      setErrors((prev) => [
        ...prev,
        "Memory threshold must be between 1 and 100.",
      ]);
      return false;
    }

    if (storageThreshold && (storageThreshold < 1 || storageThreshold > 100)) {
      setErrors((prev) => [
        ...prev,
        "Storage threshold must be between 1 and 100.",
      ]);
      return false;
    }

    return true;
  };

  const createAlarm = async () => {
    setErrors([]);

    try {
      const data =
        alarmType === "memory"
          ? { memoryThreshold, reminderInterval }
          : { storageThreshold, reminderInterval };
      if (!isValidData(data)) return false;

      const response = await axios.post(
        `/api/instances/${instance?.name}/alarms?region=${instance?.region}`,
        {
          type: alarmType,
          data,
        }
      );
      const alarms =
        alarmType === "memory"
          ? response.data.alarms.memory
          : response.data.alarms.storage;
      onAddAlarms(alarms, alarmType);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const resetError = (msg: string) => {
    setErrors((prev) => prev.filter((e) => e !== msg));
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-white/5 flex justify-center items-center z-50">
      <div className="bg-card text-pagetext1 p-6 rounded-md shadow-lg w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-pagetext1 hover:text-btnhover1 transition-colors"
          aria-label="Close modal"
        >
          X
        </button>
        <h2 className="font-heading1 text-xl text-headertext1 mb-4">
          Create New Alarm
        </h2>
        {errors.length > 0 && (
          <div className="mb-6 space-y-2">
            {errors.map((error, i) => (
              <ErrorBanner
                key={i}
                message={error}
                onClose={() => resetError(error)}
              />
            ))}
          </div>
        )}
        <div className="flex items-center gap-4">
          <label
            className="font-heading1 text-md text-headertext1 w-2/3"
            htmlFor="alarmType"
          >
            New Alarm:
          </label>
          <select
            className="font-text1 text-pagetext1 w-1/4 p-2 border rounded-md text-sm"
            id="alarmType"
            name="alarmType"
            value={alarmType}
            onChange={(e) => setAlarmType(e.target.value)}
          >
            <option value="">Instance type</option>
            <option value="storage">Storage</option>
            <option value="memory">Memory</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label
            className="font-heading1 text-md text-headertext1 w-2/3"
            htmlFor="reminderInterval"
          >
            Reminder Interval (minutes)
          </label>
          <input
            className="font-text1 text-pagetext1 w-1/4 p-2 border rounded-md text-sm"
            id="reminderInterval"
            name="reminderInterval"
            type="number"
            value={reminderInterval}
            onChange={(e) => setReminderInterval(Number(e.target.value))}
          />
        </div>

        {alarmType === "memory" && (
          <div className="flex items-center gap-4">
            <label
              className="font-heading1 text-md text-headertext1 w-2/3"
              htmlFor="memoryThreshold"
            >
              Memory Threshold (%)
            </label>
            <input
              className="font-text1 text-pagetext1 w-1/4 p-2 border rounded-md text-sm"
              id="memoryThreshold"
              name="memoryThreshold"
              type="number"
              value={memoryThreshold}
              onChange={(e) => setMemoryThreshold(Number(e.target.value))}
            />
          </div>
        )}
        {alarmType === "storage" && (
          <div className="flex items-center gap-4">
            <label
              className="font-heading1 text-md text-headertext1 w-2/3"
              htmlFor="memo"
            >
              Storage Threshold (%)
            </label>
            <input
              className="font-text1 text-pagetext1 w-1/4 p-2 border rounded-md text-sm"
              id="storageThreshold"
              name="storageThreshold"
              type="number"
              value={storageThreshold}
              onChange={(e) => setStorageThreshold(Number(e.target.value))}
            />
          </div>
        )}

        <div className="flex justify-end mt-6 gap-4">
          <button
            className="px-4 py-2 bg-card border border-btn1 text-btn1 rounded-sm hover:shadow-[0_0_8px_#87d9da]"
            disabled={saving}
            onClick={async (e) => {
              e.preventDefault();
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-btn1 text-mainbg1 font-semibold rounded-sm hover:bg-btnhover1 hover:shadow-[0_0_10px_#87d9da]"
            disabled={saving || alarmType === ""}
            onClick={async (e) => {
              e.preventDefault();
              setSaving(true);
              const success = await createAlarm();
              if (success) onClose();
              setSaving(false);
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
