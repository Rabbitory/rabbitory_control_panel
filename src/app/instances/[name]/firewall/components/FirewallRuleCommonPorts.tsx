import { COMMON_PORTS } from "@/utils/firewallConstants";
import { Info } from "lucide-react";
import { FirewallRule } from "@/types/firewall";

interface Props {
  rule: FirewallRule;
  index: number;
  onChange: (index: number, port: string) => void;
}

export default function FirewallRuleCommonPorts({
  rule,
  index,
  onChange,
}: Props) {
  return (
    <div className="col-span-4">
      <label className="text-xs text-headertext1 mb-1 flex items-center">
        Common Ports
      </label>
      <div className="flex flex-wrap gap-2">
        {COMMON_PORTS.map(({ name, port, desc }) => (
          <div
            key={name}
            className="flex items-center space-x-2 relative group"
          >
            <input
              type="checkbox"
              checked={rule.commonPorts.includes(name)}
              onChange={() => onChange(index, name)}
              className="font-text1 bg-checkmark h-3 w-3"
            />
            <span className="text-xs">{name}</span>

            {/* Tooltip Icon */}
            <Info className="h-4 w-4 text-gray-500 cursor-pointer group-hover:text-gray-700" />

            {/* Tooltip Box */}
            <div className="absolute left-0 bottom-full mb-2 hidden w-64 p-2 bg-navbar1 text-headertext1 text-xs rounded-md shadow-md group-hover:block">
              <strong>Port {port}:</strong> {desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
