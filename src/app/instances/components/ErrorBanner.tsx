"use client";

import { AlertTriangle } from "lucide-react";

type ErrorBannerProps = {
  message: string;
  onClose?: () => void;
};

export default function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 bg-red-900/70 border border-red-500 text-red-100 px-4 py-3 rounded-md mb-6 animate-fade-in">
      <AlertTriangle className="mt-0.5 w-5 h-5 text-red-200" />
      <div className="flex-1 text-sm font-text1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-200 hover:text-white ml-2 font-bold text-sm"
        >
          ×
        </button>
      )}
    </div>
  );
}