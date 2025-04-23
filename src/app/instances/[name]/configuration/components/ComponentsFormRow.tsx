import { ConfigItem } from "@/types/configuration";

interface Props {
  item: ConfigItem;
  configuration: Record<string, string>;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function ComponentsFormRow({
  item,
  configuration,
  isLoading,
  onChange,
}: Props) {
  return (
    <tr key={item.key} className="p-2">
      <td className="p-2 border-b">
        {isLoading ? (
          <div className="w-32 h-4 bg-gray-600 rounded-sm animate-pulse"></div>
        ) : (
          item.key
        )}
      </td>
      <td className="p-2 border-b">
        {isLoading ? (
          <div className="w-48 h-4 bg-gray-600 rounded-sm animate-pulse"></div>
        ) : (
          item.description
        )}
      </td>
      <td className="p-2 border-b w-1/6 text-left">
        {isLoading ? (
          <div className="w-24 h-4 bg-gray-600 rounded-sm animate-pulse"></div>
        ) : item.type === "dropdown" && Array.isArray(item.options) ? (
          <select
            name={item.key}
            value={configuration[item.key] ?? ""}
            onChange={onChange}
            className="w-full p-1 border rounded-sm text-sm"
          >
            {item.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : Boolean(item.readOnly) ? (
          <span className="text-sm w-full py-1 pl-2 ">
            {configuration[item.key] ?? ""}
          </span>
        ) : (
          <input
            type={item.type}
            name={item.key}
            aria-label={item.key}
            readOnly={Boolean(item.readOnly)}
            value={configuration[item.key] ?? ""}
            onChange={onChange}
            className="text-sm w-full py-1 pl-2 pr-1 border rounded-md"
          />
        )}
      </td>
    </tr>
  )
}
