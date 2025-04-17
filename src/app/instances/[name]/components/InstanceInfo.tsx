import formatDate from "@/utils/formatDate";
import { Instance } from "@/types/instance";

export default function InstanceInfo({
  instance }: { instance: Instance }) {
  return (
    <div>
      <h2 className="font-heading1 text-headertext1 text-md pb-4">
        Instance Info
      </h2>
      <table className="text-sm w-full table-auto mb-6">
        <colgroup>
          <col className="w-1/5" />
          <col />
        </colgroup>
        <tbody className="font-text1">
          <tr>
            <td className="py-2">Status:</td>
            <td
              className={
                instance?.state === "running"
                  ? "text-btnhover1"
                  : instance?.state === "stopped" ||
                    instance?.state === "stopping"
                    ? "text-red-300"
                    : instance?.state === "shutting-down"
                      ? "text-pagetext1 italic"
                      : ""
              }
            >
              {instance?.state}
            </td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Host:</td>
            <td className="py-2">{instance?.publicDns}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Created at:</td>
            <td className="py-2">
              {instance?.launchTime && formatDate(instance?.launchTime)}
            </td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Data Center:</td>
            <td className="py-2">{instance?.region}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
