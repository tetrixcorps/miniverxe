import * as React from "react"

// Context for controlled value and onChange
interface SelectContextType {
  value: string;
  onChange: (value: string) => void;
}
const SelectContext = React.createContext<SelectContextType | null>(null);

// Controlled Select component
export function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <button className={"border rounded px-3 py-2 bg-background " + (className || "")}>{children}</button>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  return <span>{ctx?.value || placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="absolute left-0 mt-1 w-full bg-white border rounded shadow z-10">{children}</div>;
}

// Controlled SelectItem
export function SelectItem({ value, children, selected, onSelect }: { value: string; children: React.ReactNode; selected?: boolean; onSelect?: () => void }) {
  const ctx = React.useContext(SelectContext);
  const handleClick = () => {
    if (onSelect) onSelect();
    else if (ctx) ctx.onChange(value);
  };
  return (
    <div
      className={`px-3 py-2 hover:bg-accent cursor-pointer${selected ? " bg-accent" : ""}`}
      aria-selected={selected}
      onClick={handleClick}
    >
      {children}
    </div>
  );
} 