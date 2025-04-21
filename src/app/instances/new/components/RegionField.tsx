interface RegionFieldProps {
  selectedRegion: string;
  availableRegions: string[];
  onChange: (region: string) => void;
}

export default function RegionField({
  selectedRegion,
  availableRegions,
  onChange,
}: RegionFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="region"
        className="font-heading1 text-md text-headertext1 w-1/4"
      >
        Region:
      </label>
      <select
        id="region"
        name="region"
        value={selectedRegion}
        onChange={(e) => onChange(e.target.value)}
        className="font-text1 w-3/4 p-2 border rounded-md text-sm"
      >
        <option value="">Select a region</option>
        {availableRegions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </div>
  )
}
