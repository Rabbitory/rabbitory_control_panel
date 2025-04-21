interface StorageSizeFieldProps {
  storageSize: number;
  onChange: (size: number) => void;
}

export default function StorageSizeField({
  storageSize,
  onChange,
}: StorageSizeFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="storageSize"
        className="font-heading1 text-md text-headertext1 w-1/4"
      >
        Storage Size (GB):
      </label>
      <input
        id="storageSize"
        name="storageSize"
        type="number"
        value={storageSize}
        onChange={(e) => onChange(Number(e.target.value))}
        className="font-text1 w-3/4 p-2 border rounded-md text-sm"
      />
    </div>
  )
}
