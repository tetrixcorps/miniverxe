import * as React from "react"

const SelectContext = React.createContext<any>(null)

export function Select({ children }: { children: React.ReactNode }) {
  const [value, setValue] = React.useState("")
  return (
    <SelectContext.Provider value={{ value, setValue }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <button className={"border rounded px-3 py-2 bg-background " + (className || "")}>{children}</button>
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  return <span>{ctx?.value || placeholder}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="absolute left-0 mt-1 w-full bg-white border rounded shadow z-10">{children}</div>
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)
  return (
    <div
      className="px-3 py-2 hover:bg-accent cursor-pointer"
      onClick={() => ctx?.setValue(value)}
    >
      {children}
    </div>
  )
} 