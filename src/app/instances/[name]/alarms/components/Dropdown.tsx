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
    <ul className="font-heading1 text-headertext1 absolute mt-1 min-w-[150px] bg-card border border-pagetext1 rounded-sm left-0 z-50">
      {Object.keys(options).map((opt, idx) => (
        <li
          key={opt + idx}
          onClick={() => {
            onOptionClick(options[opt]);
          }}
          className="px-4 py-2 hover:text-btnhover1 cursor-pointer border-b border-pagetext1 last:border-none"
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
      <button className="font-heading1 px-4 bg-card text-btn1 border border-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card z-40" 
      onClick={handleClick}>
        {label}
      </button>
      {isOpen && <DropdownOptions options={options} onOptionClick={handleOptionClick} />}
    </div>
  );
}
