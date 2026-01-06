"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Ventas totales",
    value: "€24,563.00",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "from-primary to-habaluna-blue-dark",
  },
  {
    label: "Pedidos",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "from-habaluna-coral to-orange-400",
  },
  {
    label: "Clientes",
    value: "892",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    color: "from-habaluna-mint to-teal-400",
  },
  {
    label: "Productos activos",
    value: "156",
    change: "-2.4%",
    trend: "down",
    icon: Package,
    color: "from-habaluna-yellow to-amber-400",
  },
]

interface DashboardStatsProps {
  isLoaded: boolean
}

export function DashboardStats({ isLoaded }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className={cn(
            "border-0 shadow-md overflow-hidden transition-all duration-500 hover-lift",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: `${100 + index * 100}ms` }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <div className="flex items-center gap-1.5">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={cn("text-sm font-medium", stat.trend === "up" ? "text-green-500" : "text-red-500")}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs mes anterior</span>
                </div>
              </div>
              <div
                className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", stat.color)}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
