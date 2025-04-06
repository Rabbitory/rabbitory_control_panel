"use client";

import { useInstanceContext } from "../../InstanceContext";
import { useState } from "react";
import axios from "axios";

export default function AlarmsPage() {
  const { instance } = useInstanceContext();
  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const saveWebhookUrl = async () => {
    try {
      await axios.post(
        `/api/instances/${instance?.name}/alarms/slack?region=${instance?.region}`,
        {
          webhookUrl,
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
        <h1>Slack Information</h1>
        <fieldset disabled={saving} className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="webhookUrl" className="text-xl text-gray-700 w-1/4">
              Webhook URL
            </label>
            <input
              id="webhookUrl"
              name="webhookUrl"
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-3/4 p-2 border rounded-md text-xl"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              disabled={saving}
              onClick={async (e) => {
                e.preventDefault();
                setSaving(true);
                const success = await saveWebhookUrl();
                if (success) alert("Webhook URL saved");
                setSaving(false);
              }}
              className="w-1/4 py-2 bg-green-400 text-white rounded-full hover:bg-green-300 focus:ring-2 focus:ring-green-500 text-xl"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </fieldset>
      </div>
    </>
  );
}
