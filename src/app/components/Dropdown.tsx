import { useState } from "react";
interface Options {
  [key: string]: () => void;
}

interface DropdownProps {
  label: string;
  options: Options;
}

interface DropdownOptionsProps {
  options: Options;
}

const DropdownOptions = ({ options }: DropdownOptionsProps) => {
  return (
    <ul className="absolute mt-2 min-w-[150px] bg-white border border-gray-300 rounded-lg shadow-lg right-0">
      {Object.keys(options).map((opt, idx) => (
        <li
          key={opt + idx}
          onClick={options[opt]}
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

  const handleClick = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button className="px-4 bg-gray-200 rounded-lg" onClick={handleClick}>
        {label}
      </button>
      {isOpen && <DropdownOptions options={options} />}
    </div>
  );
}
