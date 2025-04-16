import { useInstanceContext } from "../instances/[name]/InstanceContext";
import { useState } from "react";
import axios from "axios";
import ErrorBanner from "@/app/instances/components/ErrorBanner";

interface Props {
  url: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

export const SlackModal = ({ url, onSave, onClose, }: Props) => {
  const { instance } = useInstanceContext();
  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(url);
  const [errors, setErrors] = useState<string[]>([]);

  const handleError = (msg: string) => {
    setErrors((prev) => [...prev, msg]);
  };

  const isValidWebhookUrl = () => {
    if (!webhookUrl) {
      return true;
    }

    if (!webhookUrl.startsWith("https://")) {
      handleError("Webhook URL must start with 'https://'.");
      return false;
    }

    if (!webhookUrl.startsWith("https://hooks.slack.com/services/")) {
      handleError("Invalid Slack webhook URL. Valid Slack webhook URLs must begin with 'https://hooks.slack.com/services/'");
      return false;
    }

    const servicePathParts = webhookUrl
      .replace("https://hooks.slack.com/services/", "")
      .split("/");

    if (servicePathParts.length !== 3) {
      handleError("Invalid Slack webhook URL format. Expected three service path components.");
      return false;
    }

    const [workspace, channel, token] = servicePathParts;
    if (!/^[A-Z0-9]{8,12}$/i.test(workspace)) {
      handleError("Invalid workspace identifier in webhook URL.");
      return false;
    }

    if (!/^[A-Z0-9]{8,12}$/i.test(channel)) {
      handleError("Invalid channel identifier in webhook URL.");
      return false;
    }

    if (!/^[A-Z0-9]{24}$/i.test(token)) {
      handleError("Invalid token in webhook URL.");
      return false;
    }

    return true;
  }

  const saveWebhookUrl = async () => {
    setErrors([]);
    if (!isValidWebhookUrl()) return false;

    try {
      await axios.post(
        `/api/instances/${instance?.name}/alarms/slack?region=${instance?.region}`,
        {
          webhookUrl,
        },
      );
      onSave(webhookUrl);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  async function testWebhook() {
    await saveWebhookUrl();
    await axios.post(
      `/api/instances/${instance?.name}/alarms/slack/test?region=${instance?.region}`,
      { text: "This a test for Rabbitory's alarms" },
    );
  }

  const resetError = (msg: string) => {
    setErrors((prev) => prev.filter((e) => e !== msg));
  };


  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-white/5 flex justify-center items-center z-50">
      <div className="bg-card text-pagetext1 p-6 rounded-md shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-pagetext1 hover:text-btnhover1 transition-colors"
          aria-label="Close modal"
        >
          X
        </button>
        <h2 className="font-heading1 text-xl text-headertext1 mb-4">
          Set Up Slack Endpoint
        </h2>

        {errors.length > 0 && (
          <div className="mb-6 space-y-2">
            {errors.map((error, i) => (
              <ErrorBanner key={i} message={error} onClose={() => resetError(error)} />
            ))}
          </div>
        )}

        <p className="font-text1 text-pagetext1 text-md mb-6">
          <a className="underline hover:text-headertext1"
            href="/slack-alarms-tutorial.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            How to set up Slack
          </a>
        </p>

        <p className="font-text1 text-sm mb-2">
          Webhook URL:
        </p>
        <input
          disabled={saving}
          className="w-full p-2 border rounded-sm font-text1 text-btnhover1 border-pagetext1 focus:outline-none"
          id="webhookUrl"
          name="webhookUrl"
          type="text"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <div className="flex justify-end mt-6 gap-4">
          <button
            className="px-4 py-2 bg-card border border-btn1 text-btn1 rounded-sm hover:shadow-[0_0_8px_#87d9da]"
            disabled={saving || !webhookUrl}
            onClick={async (e) => {
              e.preventDefault();
              testWebhook();
            }}
          >
            Test
          </button>
          <button
            className="px-4 py-2 bg-btn1 text-mainbg1 font-semibold rounded-sm hover:bg-btnhover1 hover:shadow-[0_0_10px_#87d9da]"
            disabled={saving}
            onClick={async (e) => {
              e.preventDefault();
              setSaving(true);
              const success = await saveWebhookUrl();
              if (success) onClose();
              setSaving(false);
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
