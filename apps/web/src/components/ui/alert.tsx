import * as React from "react"

export function Alert({ children }: { children: React.ReactNode }) {
  return <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">{children}</div>
}
export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <div className="font-bold mb-1">{children}</div>
}
export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground">{children}</div>
} 