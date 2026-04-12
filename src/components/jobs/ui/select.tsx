import { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string | null;
}

interface CustomSelectProps {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export const CustomSelect = ({ options, value, onChange, placeholder }: CustomSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder || "Select";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-left text-sm dark:text-gray-100"
      >
        {selectedLabel}
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-sm max-h-60 overflow-auto dark:text-gray-100">
          {options.map((option) => (
            <li
              key={option.value ?? "null"}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
