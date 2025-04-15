import { useState, useRef, useEffect } from "react";

interface Options {
  [key: string]: () => void;
}

interface DropdownProps {
  label: string;
  options: Options;
}

interface DropdownOptionsProps {
  options: Options;
  onOptionClick: (callback: () => void) => void;
}

const DropdownOptions = ({ options, onOptionClick }: DropdownOptionsProps) => {
  return (
    <ul className="absolute mt-1 min-w-[150px] bg-white border border-gray-300 rounded-lg shadow-lg left-0 z-50">
      {Object.keys(options).map((opt, idx) => (
        <li
          key={opt + idx}
          onClick={() => {
            onOptionClick(options[opt]);
          }}
          className="px-4 py-2 hover:bg-gray-100 hover:border-gray-300 cursor-pointer border-b border-gray-300 last:border-none"
        >
          {opt}
        </li>
      ))}
    </ul>
  );
};

export default function Dropdown({ label, options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = () => setIsOpen(!isOpen);

  const handleOptionClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button className="px-4 bg-gray-200 rounded-lg z-40" onClick={handleClick}>
        {label}
      </button>
      {isOpen && <DropdownOptions options={options} onOptionClick={handleOptionClick} />}
    </div>
  );
}
