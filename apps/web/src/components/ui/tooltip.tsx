import * as React from "react"

const TooltipContext = React.createContext<any>(null)

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <span className="relative">{children}</span>
    </TooltipContext.Provider>
  )
}
export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(TooltipContext)
  return React.cloneElement(children as React.ReactElement, {
    onMouseEnter: () => ctx?.setOpen(true),
    onMouseLeave: () => ctx?.setOpen(false),
  })
}
export function TooltipContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(TooltipContext)
  if (!ctx?.open) return null
  return <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded z-50">{children}</div>
} 