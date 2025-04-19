interface InstanceSizeFieldProps {
  selectedInstanceSize: string;
  selectedInstanceType: string;
  filteredInstanceTypes: string[];
  onChange: (size: string) => void;
}

export default function InstanceSizeField({
  selectedInstanceSize,
  selectedInstanceType,
  filteredInstanceTypes,
  onChange,
}: InstanceSizeFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="instanceSize"
        className="font-heading1 text-md text-headertext1 w-1/4"
      >
        Instance Size:
      </label>
      <select
        id="instanceSize"
        name="instanceSize"
        value={selectedInstanceSize}
        onChange={(e) => onChange(e.target.value)}
        disabled={!selectedInstanceType}
        className="font-text1 w-3/4 p-2 border rounded-md text-sm"
      >
        <option value="">Select an instance size</option>
        {filteredInstanceTypes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  )
}
