import { FirewallRule } from "@/types/firewall";
import { Trash2 } from "lucide-react";

interface Props {
  rule: FirewallRule;
  index: number;
  onChange: (index: number, value: string) => void;
  removeRule: (index: number) => void;
}

export default function FirewallRuleCustomPortds({
  rule,
  index,
  onChange,
  removeRule,
}: Props) {
  return (
    <div className="col-span-3">
      <label className="block text-xs text-headertext1 mb-1">
        Custom Ports
      </label>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="5671, 8080"
          value={rule.customPorts}
          onChange={(e) =>
            onChange(index, e.target.value)
          }
          className="font-text1 flex-grow h-9 text-xs p-2 border rounded"
        />

        {/* Drop Button */}
        <div className="pl-2">
          <button
            onClick={() => removeRule(index)}
            className="font-heading1 text-pagetext1 text-xs h-9 px-2 rounded hover:text-btnhover1 cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
