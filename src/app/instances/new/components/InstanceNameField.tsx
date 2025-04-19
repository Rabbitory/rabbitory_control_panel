interface InstanceNameFieldProps {
  instanceName: string;
  onGenerate: () => void;
  onChange: (name: string) => void;
}

export default function InstanceNameField({
  instanceName,
  onGenerate,
  onChange,
}: InstanceNameFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="instanceName"
        className="font-heading1 text-md text-headertext1 w-1/4"
      >
        Instance Name:
      </label>
      <div className="flex gap-2 w-3/4">
        <input
          id="instanceName"
          name="instanceName"
          type="text"
          value={instanceName}
          onChange={(e) => onChange(e.target.value)}
          className="font-text1 text-btnhover1 w-9/16 p-2 border border-pagetext1 rounded-md text-sm"
        />
        <button
          type="button"
          onClick={onGenerate}
          className="font-heading1 text-xs ml-2 px-6 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
        >
          Generate random name
        </button>
      </div>
    </div>

  )
}
