import SubmissionSpinner from "@/app/instances/components/SubmissionSpinner";

interface Props {
  onClick: () => void;
  disabled: boolean;
}

export default function ManualBackupButton({
  onClick,
  disabled,
}: Props) {
  return (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={onClick}
        disabled={disabled}
        className="font-heading1 text-sm px-4 py-2 mb-8 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
      >
        {disabled ? (
          <span className="flex items-center gap-2">
            <SubmissionSpinner />
            Adding Manual Backup...
          </span>
        ) : (
          "+ Add Manual Backup"
        )}
      </button>
    </div>
  )
}
