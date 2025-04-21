import { configItems } from "@/types/configuration";
import Link from "next/link";
import SubmissionSpinner from "@/app/instances/components/SubmissionSpinner";
import ComponentsFormRow from "./ComponentsFormRow";

interface Props {
  configuration: Record<string, string>;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  pending: boolean;
}

export default function ComponentsForm({
  configuration,
  isLoading,
  onChange,
  onSubmit,
  disabled,
}: Props) {
  return (
    <form onSubmit={onSubmit}>
      <table className="w-full border-collapse">
        <thead className="font-heading1 text-headertext1 text-sm">
          <tr>
            <th className="p-2 text-left border-b">Setting</th>
            <th className="p-2 text-left border-b">Description</th>
            <th className="p-2 text-left border-b">Value</th>
          </tr>
        </thead>
        <tbody
          className={`font-text1 text-sm ${isLoading ? "" : "animate-fade-in"
            }`}
        >
          {configItems.map((item) => (
            <ComponentsFormRow
              key={item.key}
              item={item}
              configuration={configuration}
              isLoading={isLoading}
              onChange={onChange}
            />
          ))}
        </tbody>
      </table>

      <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
        <Link
          href="/"
          className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={disabled}
          className={`px-4 py-2 ${disabled
            ? "bg-btnhover1 opacity-70 cursor-not-allowed"
            : "bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
            }`
          }
        >
          {disabled ? (
            <span className="flex items-center gap-2">
              <SubmissionSpinner />
              Saving ...
            </span>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  )
}
