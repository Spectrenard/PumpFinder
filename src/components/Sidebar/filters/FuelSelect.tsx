import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

interface Option {
  value: string;
  label: string;
}

interface FuelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const OPTIONS: Option[] = [
  { value: "sp95", label: "Sans Plomb 95" },
  { value: "sp98", label: "Sans Plomb 98" },
  { value: "gazole", label: "Gazole" },
  { value: "e85", label: "E85" },
  { value: "gplc", label: "GPL" },
];

export default function FuelSelect({ value, onChange }: FuelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = OPTIONS.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[180px]" ref={selectRef}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5
                   bg-zinc-800 hover:bg-zinc-700/80
                   border border-zinc-700/50 rounded-lg
                   text-zinc-100 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500/50
                   transition-colors"
      >
        <span>{selectedOption?.label}</span>
        <FaChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200
                                 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Liste déroulante */}
      {isOpen && (
        <div
          className="absolute top-full left-0 w-full mt-1 py-1
                        bg-zinc-800 border border-zinc-700/50 rounded-lg
                        shadow-lg z-50"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm
                         transition-colors
                         ${
                           option.value === value
                             ? "bg-blue-500/10 text-blue-400"
                             : "text-zinc-100 hover:bg-zinc-700/80"
                         }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
