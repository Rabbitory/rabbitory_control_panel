import { useInstanceContext } from "../instances/[name]/InstanceContext";
import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  onClose: () => void;
}

export const SlackModal = ({ onClose }: Props) => {
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

        <p className="font-text1 text-pagetext1 text-md mb-6">
          <a className="underline hover:text-headertext1"
            href="/slack-alarms-tutorial.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            How to set up Slack
          </a>
        </p>

        {/* <p className="font-text1 text-sm text-red-300 mb-6"> */}
        {/*   Deleting this instance is permanent and will result in the loss of all data stored on it. This action cannot be undone. */}
        {/* </p> */}
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
          <p className="text-sm text-pagetext1">Note: You must save your endpoint before testing it.</p>
          <button
            className="px-4 py-2 bg-card border border-btn1 text-btn1 rounded-sm hover:shadow-[0_0_8px_#87d9da]"
            disabled={saving}
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
              if (success) alert("Webhook URL saved");
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
