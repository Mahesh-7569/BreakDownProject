import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * @typedef {Object} DropdownOption
 * @property {string | number} value
 * @property {string} label
 */

/**
 * @param {Object} props
 * @param {DropdownOption[]} [props.options]
 * @param {string | number} [props.value]
 * @param {(value: any) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {"sm" | "md"} [props.size]
 */
export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  size = "md",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // ✅ Clean size mapping: "sm" for dashboards/filters, "md" for full form inputs
  const buttonSizeClasses = size === "sm" ? "px-3 py-1.5 text-xs rounded-xl" : "px-4 py-3 text-sm rounded-2xl";
  const listSizeClasses = size === "sm" ? "text-xs py-2" : "text-sm py-2.5";
  const iconSizeClasses = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex w-full items-center justify-between border border-slate-200 
          bg-white shadow-sm transition-all focus:border-[#1c75bc] 
          focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 
          dark:bg-slate-900 dark:text-slate-100 box-border ${buttonSizeClasses}
          ${disabled ? "cursor-not-allowed bg-slate-50 opacity-60 dark:bg-slate-800" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"}
        `}
      >
        <span className={`truncate text-left ${!selectedOption ? "text-slate-400 dark:text-slate-500" : "font-medium text-slate-700 dark:text-slate-200"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`ml-2 text-slate-400 shrink-0 transition-transform duration-200 ${iconSizeClasses} ${isOpen ? "rotate-180 text-[#1c75bc] dark:text-[#1c75bc]" : ""}`}
        />
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 9999,
            marginTop: '6px'
          }}
          className="rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900"
        >
          <ul className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {options.length === 0 ? (
              <li className={`px-4 text-center text-slate-500 dark:text-slate-400 ${listSizeClasses}`}>
                No options available
              </li>
            ) : (
              options.map((option) => {
                const isSelected = String(value) === String(option.value);
                return (
                  <li
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      relative cursor-pointer select-none px-3 mx-2 my-0.5 rounded-xl transition-colors ${listSizeClasses}
                      ${isSelected ? "bg-blue-50 font-bold text-[#1c75bc] dark:bg-[#1c75bc]/10 dark:text-blue-400" : "text-slate-700 font-medium hover:bg-slate-100 hover:text-[#1c75bc] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"}
                    `}
                  >
                    {option.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}  
    </div>
  );
}