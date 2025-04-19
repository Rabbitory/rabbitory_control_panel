import { FirewallRule } from "@/types/firewall";
interface Props {
  rule: FirewallRule;
  index: number;
  onChange: (index: number, value: string) => void;
  onBlur: (value: string) => void;
}

export default function SourceIp({
  rule,
  index,
  onChange,
  onBlur,
}: Props) {
  return (
    <div className="col-span-2">
      <label className="block text-xs text-headertext1 mb-1">
        Source IP
      </label>
      <input
        type="text"
        placeholder="0.0.0.0/0"
        value={rule.sourceIp}
        onChange={(e) =>
          onChange(index, e.target.value)
        }
        onBlur={() => onBlur(rule.sourceIp)}
        className="font-text1 w-full h-9 text-xs p-2 border rounded"
      />
    </div>
  )
}
