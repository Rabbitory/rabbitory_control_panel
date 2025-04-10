"use client";

import { useInstanceContext } from "../../InstanceContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AlarmsPage() {
  const { instance } = useInstanceContext();
  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCurrentWebhookUrl = async () => {
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/alarms/slack?region=${instance?.region}`,
        );

        setWebhookUrl(response.data.webhookUrl || "");
      } catch (error) {
        console.error("Error fetching webhook url:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentWebhookUrl();
  }, [instance?.name, instance?.region]);

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

  async function testWebhook() {
    await axios.post(
      `/api/instances/${instance?.name}/alarms/slack/test?region=${instance?.region}`,
      { text: "This a test for Rabbitory's alarms" },
    );
    alert("Message sent");
  }

  if (fetching) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-6">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Slack Information</h1>

      <p className="font-text1 text-pagetext1 text-md mb-6">
        <a className="underline hover:text-headertext1"
          href="/slack-alarms-tutorial.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          How to set up Slack
        </a>
      </p>

      <fieldset disabled={saving} className="space-y-4">
        <div className="flex items-center">
          <label className="font-heading1 text-md text-headertext1 w-1/5"
            htmlFor="webhookUrl" >
            Webhook URL
          </label>
          <input className="font-text1 w-4/5 p-2 border rounded-md text-sm"
            id="webhookUrl"
            name="webhookUrl"
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}

          />
        </div>
        <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
            disabled={saving}
            onClick={async (e) => {
              e.preventDefault();
              testWebhook();
            }}
          >
            Test Webhook
          </button>
          <button
            className="px-4 py-2 bg-btn1 hover:bg-btnhover1 text-sm text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
            disabled={saving}
            onClick={async (e) => {
              e.preventDefault();
              setSaving(true);
              const success = await saveWebhookUrl();
              if (success) alert("Webhook URL saved");
              setSaving(false);
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
