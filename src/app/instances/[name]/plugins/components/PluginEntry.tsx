import { Plugin } from "@/types/plugins";

interface Props {
  plugin: Plugin;
  isEnabled: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export default function PluginEntry({
  plugin,

  isEnabled,
  disabled,
  onToggle,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-300 pb-4">
      <div className="mb-2 md:mb-0">
        <h2
          className={`font-heading1 text-sm ${
            isEnabled ? "text-btnhover1" : "text-pagetext1"
          }`}
        >
          {plugin.name}
        </h2>
        <p className="font-text1 text-xs text-gray-500">{plugin.description}</p>
      </div>
      <div className="flex items-center gap-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            aria-label={plugin.name}
            onChange={onToggle}
            className="sr-only peer"
            disabled={disabled}
          />
          <div
            className="w-8 h-4 bg-pagetext1/60 rounded-full
               peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
               peer-checked:bg-btnhover1
               peer-checked:after:translate-x-4 peer-checked:after:border-white
               after:content-[''] after:absolute after:top-0.5 after:left-[2px]
               after:bg-white after:border-gray-300 after:border after:rounded-full
               after:h-3 after:w-3 after:transition-all"
          ></div>
        </label>
      </div>
    </div>
  );
}
