import { toNumber } from "@/lib/money"

interface ProductPriceProps {
  priceUSD?: number
  priceMNs?: number
  comparePriceUSD?: number
  comparePriceMNs?: number
  variant?: "default" | "large"
}

export function ProductPrice({ priceUSD, comparePriceUSD, variant = "default" }: ProductPriceProps) {
  const price = toNumber(priceUSD) ?? 0
  const compare = toNumber(comparePriceUSD)
  const hasDiscount = compare !== null && compare > price

  if (variant === "large") {
    return (
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-foreground">${price.toFixed(2)}</span>
        {hasDiscount && (
          <span className="text-lg text-muted-foreground line-through">${compare!.toFixed(2)}</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-base font-bold text-foreground">${price.toFixed(2)}</span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">${compare!.toFixed(2)}</span>
      )}
    </div>
  )
}
