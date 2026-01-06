"use client"

import { trafficSources } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const colors = ["bg-sky-400", "bg-orange-400", "bg-amber-400", "bg-violet-400", "bg-emerald-400"]

export function TrafficChart() {
  const total = trafficSources.reduce((acc, s) => acc + s.visits, 0)

  return (
    <div className="space-y-4">
      {trafficSources.map((source, index) => (
        <div key={source.source} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">{source.source}</span>
            <span className="text-muted-foreground">
              {source.visits.toLocaleString()} ({source.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", colors[index])}
              style={{ width: `${source.percentage}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total visitantes</span>
          <span className="text-lg font-bold text-foreground">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
