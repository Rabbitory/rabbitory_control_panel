"use client";

import { Lightbulb } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function StatusLegend() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!buttonRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          top: rect.top,
          left: rect.right + 10,
        });
      }
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="ml-1 text-btnhover1 hover:text-btn1 p-0.5"
        aria-label="Toggle status legend"
      >
        <Lightbulb className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="fixed z-50 w-64 p-4 text-sm rounded-md backdrop-blur bg-card/70 border border-gray-600 shadow-lg text-headertext1"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <p className="mb-2">
            <span className="text-btn1 font-bold">pending</span>: Instance is
            initializing. Access is{" "}
            <span className="text-red-500">unavailable</span>.
          </p>
          <p className="mb-2">
            <span className="text-btnhover1 font-bold">running</span>: Instance
            is fully ready and <span className="text-green-500">available</span>
            .
          </p>
          <p className="mb-2">
            <span className="text-pagetext1 font-bold">shutting-down</span>:
            Instance is shutting down. Access is{" "}
            <span className="text-red-500">unavailable</span>.
          </p>
          <p className="mb-2">
            <span className="text-pagetext1 font-bold">terminated</span>:
            Instance has been deleted. Access is{" "}
            <span className="text-red-500">unavailable</span>.
          </p>
          <p className="mb-2">
            <span className="text-red-300 font-bold">stopping</span>: Instance
            is being stopped. Access is{" "}
            <span className="text-red-500">unavailable</span>.
          </p>
          <p>
            <span className="text-red-300 font-bold">stopped</span>: Instance
            has been stopped. Access is{" "}
            <span className="text-red-500">unavailable</span>.(check your AWS
            console if you want to restart it)
          </p>
        </div>
      )}
    </>
  );
}
