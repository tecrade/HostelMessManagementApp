import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function SpecialSelector({ specials = [], selectedIds = [], onChange, currency = "₹" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleToggle = (specialId) => {
    const newSelectedIds = selectedIds.includes(specialId)
      ? selectedIds.filter((id) => id !== specialId)
      : [...selectedIds, specialId];
    onChange(newSelectedIds);
  };

  const activeSpecials = specials.filter((s) => s.enabled !== false);
  const selectedCount = selectedIds.length;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-slate hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-text-dark rounded-xl transition-all cursor-pointer select-none min-w-[90px] justify-between"
      >
        <span className="truncate">
          {selectedCount === 0 ? "Select..." : `${selectedCount} Spec.`}
        </span>
        <ChevronDown className={`h-3 w-3 text-text-gray transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-1.5 animate-fade-in divide-y divide-gray-150">
          {activeSpecials.length === 0 ? (
            <div className="px-3.5 py-2 text-[10px] text-text-gray text-center">
              No active specials configured. Add them in the "Specials" tab first.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {activeSpecials.map((special) => {
                const checked = selectedIds.includes(special.id);
                return (
                  <label
                    key={special.id}
                    className="flex items-center justify-between px-3.5 py-2 hover:bg-primary-light/40 cursor-pointer select-none text-[11px] font-bold text-text-dark"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggle(special.id)}
                        className="accent-primary h-3.5 w-3.5 cursor-pointer rounded"
                      />
                      <span>{special.name}</span>
                    </div>
                    <span className="text-primary font-extrabold">{currency}{special.price}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
