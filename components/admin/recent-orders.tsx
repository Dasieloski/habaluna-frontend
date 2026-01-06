"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const orders = [
  {
    id: "#ORD-001",
    customer: "María García",
    product: "Producto Premium",
    amount: "€129.00",
    status: "completed",
    date: "Hace 2 horas",
  },
  {
    id: "#ORD-002",
    customer: "Carlos López",
    product: "Pack Especial",
    amount: "€89.50",
    status: "processing",
    date: "Hace 3 horas",
  },
  {
    id: "#ORD-003",
    customer: "Ana Martínez",
    product: "Edición Limitada",
    amount: "€199.00",
    status: "pending",
    date: "Hace 5 horas",
  },
  {
    id: "#ORD-004",
    customer: "Pedro Sánchez",
    product: "Pack Familiar",
    amount: "€249.00",
    status: "completed",
    date: "Hace 6 horas",
  },
  {
    id: "#ORD-005",
    customer: "Laura Fernández",
    product: "Producto Básico",
    amount: "€49.90",
    status: "shipped",
    date: "Hace 8 horas",
  },
]

const statusConfig = {
  completed: { label: "Completado", className: "bg-green-100 text-green-700 border-green-200" },
  processing: { label: "Procesando", className: "bg-blue-100 text-blue-700 border-blue-200" },
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-700 border-amber-200" },
  shipped: { label: "Enviado", className: "bg-purple-100 text-purple-700 border-purple-200" },
}

export function RecentOrders() {
  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <div
          key={order.id}
          className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-habaluna-blue-dark/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{order.id.slice(-3)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{order.customer}</p>
              <p className="text-xs text-muted-foreground">{order.product}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{order.amount}</p>
              <p className="text-xs text-muted-foreground">{order.date}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium",
                statusConfig[order.status as keyof typeof statusConfig].className,
              )}
            >
              {statusConfig[order.status as keyof typeof statusConfig].label}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
