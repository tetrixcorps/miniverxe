import * as React from "react"

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={"rounded-lg border bg-card text-card-foreground shadow-sm " + (className || "")}>{children}</div>
}
export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b">{children}</div>
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold leading-none tracking-tight">{children}</h3>
}
export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 pt-0">{children}</div>
} 