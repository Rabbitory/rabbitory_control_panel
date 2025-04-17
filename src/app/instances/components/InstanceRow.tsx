import { Trash2 } from "lucide-react";
import Link from "next/link";
import { InstanceRowProps } from "../types/instanceTableTypes";

export default function InstanceRow({
  instance,
  openDeleteModal
}: InstanceRowProps) {
  return (
    <tr
      key={instance.name}
      className="bg-card border border-gray-500/30"
    >
      <td className="px-4 py-3 relative">
        {instance.state === "pending" ||
          instance.state === "shutting-down" ||
          instance.state === "terminated" ? (
          <span className="text-pagetext1 truncate block group cursor-not-allowed">
            {instance.name}
          </span>
        ) : (
          <Link
            href={`/instances/${instance.name}?region=${instance.region}`}
            className="text-pagetext1 hover:text-btnhover1 truncate block"
          >
            {instance.name}
          </Link>
        )}
      </td>
      <td className="px-4 py-3 text-pagetext1 truncate">
        {instance.id}
      </td>
      <td className="px-4 py-3 text-pagetext1">
        {instance.region}
      </td>
      <td
        className={`px-4 py-3 ${instance.state === "running"
          ? "text-btnhover1"
          : instance.state === "pending" ||
            instance.state === "initializing"
            ? "text-btn1 italic"
            : instance.state === "stopped" ||
              instance.state === "stopping"
              ? "text-red-300"
              : instance.state === "shutting-down" ||
                instance.state === "terminated"
                ? "text-pagetext1 italic"
                : ""
          }`}
      >
        {instance.state}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => openDeleteModal(instance)}
          className={`
                  text-gray-400 
                  ${instance.state === "pending" ||
              instance.state === "shutting-down" ||
              instance.state === "terminated"
              ? "cursor-not-allowed"
              : "hover:text-btnhover1 hover:shadow-btnhover1"
            }
                `}
          aria-label="Delete instance"
          disabled={
            instance.state === "pending" ||
            instance.state === "shutting-down" ||
            instance.state === "terminated"
          }
        >
          <Trash2 size={20} />
        </button>
      </td>
    </tr>
  )
}
