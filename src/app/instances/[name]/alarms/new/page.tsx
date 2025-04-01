"use client";

import { useInstanceContext } from "../../InstanceContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AlarmsPage() {
  const { instance } = useInstanceContext();
  // const [isFetching, setIsFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alarmType, setAlarmType] = useState("");
  const [timeThreshold, setTimeThreshold] = useState(600);
  const [storageThreshold, setStorageThreshold] = useState(90);
  const [reminderInterval, setReminderInterval] = useState(0);

  const createAlarm = async () => {
    try {
      await axios.post(
        `/api/instances/${instance?.name}/alarms?region=${instance?.region}`,
        {
          type: alarmType,
          data: { timeThreshold, storageThreshold, reminderInterval },
        },
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <>
      <div>
        <h1>Alarms</h1>
        <p>Current alarms:</p>
        <fieldset disabled={saving} className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="alarmType" className="text-xl text-gray-700 w-1/4">
              New Alarm:
            </label>
            <select
              id="alarmType"
              name="alarmType"
              value={alarmType}
              onChange={(e) => setAlarmType(e.target.value)}
              className="w-3/4 p-2 border rounded-md text-xl"
            >
              <option value="">Select an instance type</option>
              <option value="storage">Storage</option>
              <option value="memory">Memory</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label
              htmlFor="timeThreshold"
              className="text-xl text-gray-700 w-1/4"
            >
              Time Threshold
            </label>
            <input
              id="timeThreshold"
              name="timeThreshold"
              type="number"
              value={timeThreshold}
              onChange={(e) => setTimeThreshold(Number(e.target.value))}
              className="w-3/4 p-2 border rounded-md text-xl"
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="memo" className="text-xl text-gray-700 w-1/4">
              Storage Threshold
            </label>
            <input
              id="storageThreshold"
              name="storageThreshold"
              type="number"
              value={storageThreshold}
              onChange={(e) => setStorageThreshold(Number(e.target.value))}
              className="w-3/4 p-2 border rounded-md text-xl"
            />
          </div>
          <div className="flex items-center gap-4">
            <label
              htmlFor="reminderInterval"
              className="text-xl text-gray-700 w-1/4"
            >
              Reminder Interval
            </label>
            <input
              id="reminderInterval"
              name="reminderInterval"
              type="number"
              value={reminderInterval}
              onChange={(e) => setReminderInterval(Number(e.target.value))}
              className="w-3/4 p-2 border rounded-md text-xl"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              disabled={saving}
              onClick={async (e) => {
                e.preventDefault();
                setSaving(true);
                const success = await createAlarm();
                if (success) alert("Alarm created successfully!");
                setSaving(false);
              }}
              className="w-1/4 py-2 bg-green-400 text-white rounded-full hover:bg-green-300 focus:ring-2 focus:ring-green-500 text-xl"
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </fieldset>
      </div>
    </>
  );
}
