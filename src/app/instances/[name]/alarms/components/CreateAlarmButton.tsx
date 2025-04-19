export default function CreateAlarmButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
      <button
        className="px-4 py-2 bg-btn1 hover:bg-btnhover1 text-sm text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        Create Alarm
      </button>
    </div>
  )
}
