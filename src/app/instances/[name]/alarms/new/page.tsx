"use client";

import { useInstanceContext } from "../../InstanceContext";
import { useState } from "react";
import axios from "axios";

export default function AlarmsPage() {
  const { instance } = useInstanceContext();
  const [saving, setSaving] = useState(false);
  const [alarmType, setAlarmType] = useState("");
  const [memoryThreshold, setMemoryThreshold] = useState(600);
  const [storageThreshold, setStorageThreshold] = useState(90);
  const [reminderInterval, setReminderInterval] = useState(1);

  const createAlarm = async () => {
    try {
      await axios.post(
        `/api/instances/${instance?.name}/alarms?region=${instance?.region}`,
        {
          type: alarmType,
          data: { memoryThreshold, storageThreshold, reminderInterval },
        }
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card text-pagetext1 font-heading1 font-semibold rounded-sm shadow-md mt-8">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Create Alarm</h1>
      <p className="font-text1 mb-6">Current alarms:</p>
      <fieldset className="space-y-4" disabled={saving}>
        <div className="flex items-center gap-4">
          <label className="font-heading1 text-md text-headertext1 w-1/4"
            htmlFor="alarmType">
            New Alarm:
          </label>
          <select className="font-text1 text-pagetext1 w-1/3 p-2 border rounded-md text-sm"
            id="alarmType"
            name="alarmType"
            value={alarmType}
            onChange={(e) => setAlarmType(e.target.value)}
          >
            <option value="">Select an instance type</option>
            <option value="storage">Storage</option>
            <option value="memory">Memory</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <label
            className="font-heading1 text-md text-headertext1 w-1/4"
            htmlFor="memoryThreshold"
          >
            Memory Threshold
          </label>
          <input className="font-text1 text-pagetext1 w-1/8 p-2 border rounded-md text-sm"
            id="memoryThreshold"
            name="memoryThreshold"
            type="number"
            value={memoryThreshold}
            onChange={(e) => setMemoryThreshold(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="font-heading1 text-md text-headertext1 w-1/4"
            htmlFor="memo">
            Storage Threshold
          </label>
          <input className="font-text1 text-pagetext1 w-1/8 p-2 border rounded-md text-sm"
            id="storageThreshold"
            name="storageThreshold"
            type="number"
            value={storageThreshold}
            onChange={(e) => setStorageThreshold(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="font-heading1 text-md text-headertext1 w-1/4"
            htmlFor="reminderInterval"
          >
            Reminder Interval
          </label>
          <input className="font-text1 text-pagetext1 w-1/8 p-2 border rounded-md text-sm"
            id="reminderInterval"
            name="reminderInterval"
            type="number"
            value={reminderInterval}
            onChange={(e) => setReminderInterval(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-end gap-4">
          <button className="px-4 py-2 bg-btn1 hover:bg-btnhover1 text-sm text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
            disabled={saving || alarmType === ""}
            onClick={async (e) => {
              e.preventDefault();
              setSaving(true);
              const success = await createAlarm();
              if (success) alert("Alarm created successfully!");
              setSaving(false);
            }}
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
