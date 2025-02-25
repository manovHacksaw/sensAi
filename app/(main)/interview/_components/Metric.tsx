import type React from "react"
import type { ReactNode } from "react"

interface MetricProps {
  label: string
  children: ReactNode
}

export const Metric: React.FC<MetricProps> = ({ label, children }) => {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-xl font-bold">{children}</span>
    </div>
  )
}

