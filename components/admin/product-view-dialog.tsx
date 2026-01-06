"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { type Product } from "@/lib/mock-data"
import { toNumber } from "@/lib/money"
import { Image as ImageIcon } from "lucide-react"

interface ProductViewDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductViewDialog({ product, open, onOpenChange }: ProductViewDialogProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>Detalles del producto</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Imágenes */}
          {product.images && product.images.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Imágenes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg bg-secondary overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-secondary rounded-lg">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
                <p className="text-sm">Sin imágenes</p>
              </div>
            </div>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Nombre</label>
              <p className="text-foreground">{product.name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Slug</label>
              <p className="text-foreground font-mono text-sm">{product.slug}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Categoría</label>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Estado</label>
              <Badge
                variant="outline"
                className={
                  product.status === "active"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : product.status === "draft"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                }
              >
                {product.status === "active" ? "Activo" : product.status === "draft" ? "Borrador" : "Archivado"}
              </Badge>
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Precio</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">€{(toNumber(product.priceUSD) ?? 0).toFixed(2)}</span>
                {toNumber(product.comparePriceUSD) !== null && (
                  <span className="text-lg text-muted-foreground line-through">
                    €{toNumber(product.comparePriceUSD)!.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Stock</label>
              <p className="text-foreground text-xl font-semibold">{product.stock} unidades</p>
            </div>
          </div>

          {/* Descripciones */}
          {product.shortDescription && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Descripción corta</label>
              <p className="text-foreground">{product.shortDescription}</p>
            </div>
          )}

          {product.description && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Descripción</label>
              <p className="text-foreground whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {product.isOnSale && product.salePercentage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>En oferta:</strong> {product.salePercentage}% de descuento
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

