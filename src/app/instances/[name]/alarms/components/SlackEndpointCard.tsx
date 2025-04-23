interface Props {
  webhookUrl: string;
  onClick: () => void;
}

export default function SlackEndpointCard({
  webhookUrl,
  onClick,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-8">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Slack Endpoint</h1>
      {webhookUrl ? (
        <table className="text-sm w-full table-auto mb-6">
          <colgroup>
            <col className="w-1/5" />
            <col />
          </colgroup>
          <tbody className="font-text1">
            <tr>
              <td className="py-2">Webhook URL:</td>
              <td className="py-2">{webhookUrl}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="font-text1 text-sm mb-6">
          You must set up a slack endpoint before creating alarms.
        </p>
      )}
      <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
        <button
          className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
          onClick={(e) => {
            e.preventDefault();
            onClick();
          }}
        >
          Setup Slack
        </button>
      </div>
    </div>

  )
}
