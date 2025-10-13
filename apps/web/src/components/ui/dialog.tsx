import * as React from "react"

const DialogContext = React.createContext<any>(null)

export function Dialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}
export function DialogTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)
  const child = React.Children.only(children) as React.ReactElement<any>
  const existingOnClick = child.props.onClick
  return React.cloneElement(child, {
    onClick: (e: React.MouseEvent) => {
      ctx?.setOpen(true)
      if (existingOnClick) existingOnClick(e)
    },
  })
}
export function DialogContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)
  if (!ctx?.open) return null
  return <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><div className="bg-white p-6 rounded shadow-lg">{children}</div></div>
}
export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold mb-2">{children}</h2>
} 