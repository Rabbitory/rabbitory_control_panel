import { Copy } from "lucide-react";

interface Props {
  logs: string;
  copied: boolean;
  onCopy: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function CopyableLogSection({
  logs,
  copied,
  onCopy,
  scrollContainerRef,
}: Props) {
  const secureWindow = () => {
    return (
      window !== undefined &&
      (new RegExp(/^https/).test(window.location.href) ||
        new RegExp(/^http:\/\/localhost/).test(window.location.href))
    );
  };

  return (
    <div className="relative">
      {secureWindow() && (
        <button
          onClick={onCopy}
          className="font-heading1 absolute top-2 right-2 p-2 text-xs bg-mainbg1 text-btn1 rounded-sm text-center hover:text-checkmark transition-all duration-200"
        >
          <Copy size={18} />
        </button>
      )}

      {copied && (
        <div className="absolute top-8 right-2 text-xs bg-gray-800 text-white p-1 rounded-md">
          Copied logs to clipboard
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-btn1 scrollbar-track-gray-100"
      >
        <pre className="bg-mainbg1 p-4 rounded-lg whitespace-pre-wrap font-text1 text-gray-300 text-sm">
          {logs}
        </pre>
      </div>
    </div>
  )
}
