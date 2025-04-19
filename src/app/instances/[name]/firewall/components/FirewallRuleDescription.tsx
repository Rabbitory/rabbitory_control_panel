import { FirewallRule } from "@/types/firewall";

interface Props {
  rule: FirewallRule;
  index: number;
  onChange: (index: number, value: string) => void;
}

export default function FirewallRuleDescription({
  rule,
  index,
  onChange,
}: Props) {
  return (
    <div className="col-span-2">
      <label className="block text-xs text-headertext1 mb-1">
        Description
      </label>
      <input
        type="text"
        value={rule.description}
        onChange={(e) =>
          onChange(index, e.target.value)
        }
        className="font-text1 w-full h-9 text-xs p-2 border rounded"
      />
    </div>
  )
}
