"use client"

const products = [
  { name: "Aceite de Oliva Premium", sales: 156, revenue: "€4,680", growth: 12 },
  { name: "Pack Gourmet Deluxe", sales: 134, revenue: "€6,700", growth: 8 },
  { name: "Jamón Ibérico", sales: 98, revenue: "€9,800", growth: 15 },
  { name: "Vino Reserva 2018", sales: 87, revenue: "€2,175", growth: -3 },
  { name: "Queso Manchego Curado", sales: 76, revenue: "€1,520", growth: 5 },
]

export function TopProducts() {
  const maxSales = Math.max(...products.map((p) => p.sales))

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={product.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-gradient-to-br from-primary to-habaluna-blue-dark rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sales} ventas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{product.revenue}</p>
              <p className={`text-xs ${product.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                {product.growth >= 0 ? "+" : ""}
                {product.growth}%
              </p>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-habaluna-blue-dark rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(product.sales / maxSales) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
