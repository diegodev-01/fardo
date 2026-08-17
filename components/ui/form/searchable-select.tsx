"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  searchTerms?: string; // Búsqueda extendida: teléfono, DNI, código, etc.
};

type SearchableSelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  error,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const query = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.searchTerms && opt.searchTerms.toLowerCase().includes(query)),
    );
  }, [options, searchTerm]);

  return (
    <div className="relative w-full">
      {/* Botón activador */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-mono text-left"
      >
        <span
          className={selectedOption ? "text-text" : "text-muted-foreground"}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-text/50 shrink-0 ml-2" />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 flex flex-col font-mono text-sm">
          {/* Campo de búsqueda interna */}
          <div className="p-2 border-b border-border flex items-center gap-2">
            <Search className="w-4 h-4 text-text/50 shrink-0" />
            <input
              type="text"
              className="w-full bg-transparent focus:outline-none text-xs"
              placeholder="Buscar por nombre, código o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Opciones filtradas */}
          <ul className="overflow-y-auto flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <li className="p-2 text-xs text-muted-foreground text-center">
                Sin resultados
              </li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`flex items-center justify-between p-2 rounded-sm cursor-pointer hover:bg-accent text-xs ${
                    opt.value === value ? "bg-accent/50 font-semibold" : ""
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
