interface InstanceTypeFieldProps {
  selectedInstanceType: string;
  instanceTypes: Record<string, string[]>;
  onChange: (type: string) => void;
}

export default function InstanceTypeField({
  selectedInstanceType,
  instanceTypes,
  onChange,
}: InstanceTypeFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="instanceType"
        className="font-heading1 text-md text-headertext1 w-1/4"
      >
        Instance Type:
      </label>
      <select
        id="instanceType"
        name="instanceType"
        value={selectedInstanceType}
        onChange={(e) => onChange(e.target.value)}
        className="font-text1 w-3/4 p-2 border rounded-md text-sm"
      >
        <option value="">Select an instance type</option>
        {Object.keys(instanceTypes).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  )
}
