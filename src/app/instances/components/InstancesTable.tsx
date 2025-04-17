import { StatusLegend } from "@/app/components/statusLegend"
import InstanceRow from "./InstanceRow"
import { Instance } from "../types/instance";

interface InstancesTableProps {
  isLoading: boolean;
  instances: Instance[];
  openDeleteModal: (instance: Instance) => void;
}


export default function InstancesTable({
  isLoading,
  instances,
  openDeleteModal
}: InstancesTableProps) {
  return (
    <table className="table-fixed w-full text-sm font-text1 border-separate border-spacing-y-3">
      <thead>
        <tr className="text-headertext1 font-text1 text-md bg-background">
          <th className="text-left w-[12%] px-4 py-2">Name</th>
          <th className="text-left w-[12%] px-4 py-2">Instance ID</th>
          <th className="text-left w-[10%] px-4 py-2">Data Center</th>
          <th className="text-left w-[10%] px-4 py-2">
            Status <StatusLegend />
          </th>
          <th className="w-[5%]"></th>
        </tr>
      </thead>

      <tbody className={isLoading ? "" : "animate-fade-in"}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
            <tr
              key={idx}
              className="bg-card border border-gray-500/30 animate-pulse"
            >
              <td className="px-4 py-3">
                <div className="w-full h-4 bg-gray-600 rounded"></div>
              </td>
              <td className="px-4 py-3">
                <div className="w-full h-4 bg-gray-600 rounded"></div>
              </td>
              <td className="px-4 py-3">
                <div className="w-full h-4 bg-gray-600 rounded"></div>
              </td>
              <td className="px-4 py-3">
                <div className="w-full h-4 bg-gray-600 rounded"></div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="w-5 h-4 bg-gray-600 rounded ml-auto"></div>
              </td>
            </tr>
          ))
          : instances.map((instance) => (
            <InstanceRow
              key={instance.name}
              instance={instance}
              openDeleteModal={openDeleteModal}
            />
          ))}
      </tbody>
    </table>
  )
}
