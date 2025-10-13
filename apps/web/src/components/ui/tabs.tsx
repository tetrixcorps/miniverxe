import * as React from "react"

const TabsContext = React.createContext<any>(null)

export function Tabs({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue || "")
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}
export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 border-b mb-2">{children}</div>
}
export function TabsTrigger({ children, value }: { children: React.ReactNode; value: string }) {
  const ctx = React.useContext(TabsContext)
  return (
    <button
      className={ctx?.value === value ? "border-b-2 border-primary" : ""}
      onClick={() => ctx?.setValue(value)}
    >
      {children}
    </button>
  )
}
export function TabsContent({ children, value }: { children: React.ReactNode; value: string }) {
  const ctx = React.useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div>{children}</div>
} 