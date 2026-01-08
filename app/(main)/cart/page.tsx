"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ChevronDown, ChevronUp, Truck, Gift, ShoppingBag, AlertTriangle } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCartValidation } from "@/hooks/use-cart-validation"

// Productos sugeridos
const suggestedProducts = [
  {
    id: "s1",
    name: "Aceite de Oliva Extra Virgen",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop",
    price: 9.99,
  },
  {
    id: "s2",
    name: "Sal Marina Gourmet",
    image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200&h=200&fit=crop",
    price: 9.99,
  },
  {
    id: "s3",
    name: "Especias Selección Premium",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop",
    price: 9.99,
  },
]

export default function CartPage() {
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const { isAuthenticated } = useAuthStore()
  const { items, subtotal, fetchCart, updateItemQuantity, removeItem } = useCartStore()
  const { validation, getItemErrorMessage, hasItemIssue, getItemAvailableStock } = useCartValidation()

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart()
    }
  }, [fetchCart, isAuthenticated])

  const shippingThreshold = 25.03
  const shipping = subtotal >= 100 ? 0 : 11.99
  const total = subtotal + shipping
  const progressPercent = Math.min((subtotal / shippingThreshold) * 100, 100)
  const isFreeShipping = subtotal >= shippingThreshold

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
        <ShoppingBag className="h-24 w-24 text-gray-300 mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Añade algunos productos para empezar</p>
        <Link
          href="/products"
          className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          Explorar Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-4 md:mb-6">
          <Link href="/" className="hover:text-sky-600">
            Home
          </Link>
          <span className="mx-2">{">"}</span>
          <span className="text-gray-800">Carrito de la compra</span>
        </nav>

        {/* Título */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
          Tu carrito de la compra
        </h1>

        {/* Alertas de stock */}
        {validation && validation.hasIssues && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Problemas de disponibilidad</h3>
                <ul className="space-y-1 text-sm text-red-800">
                  {validation.items
                    .filter((item) => item.issue !== null)
                    .map((item) => {
                      const errorMsg = getItemErrorMessage(item.itemId)
                      return errorMsg ? (
                        <li key={item.itemId} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{errorMsg}</span>
                        </li>
                      ) : null
                    })}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Barra de progreso envío gratis */}
        <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm md:text-base text-gray-700 mb-2">
              {isFreeShipping ? (
                <span className="text-green-600 font-medium">¡El envío es gratis!</span>
              ) : (
                <>Desde ${shippingThreshold.toFixed(2)} de compras, el envío es gratis!</>
              )}
            </p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex-shrink-0 text-sky-500">
            <Truck className="h-8 w-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = Number(item.productVariant?.priceUSD ?? item.product.priceUSD ?? 0)
              const option = item.productVariant?.name || "Producto"
              const image = item.product.images?.[0] || "/placeholder.svg"
              return (
              <div key={item.id} className="bg-white rounded-xl p-4 md:p-6">
                <div className="flex gap-4">
                  {/* Imagen */}
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>

                    {/* Info del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 truncate">{item.product.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">Opción: {option}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sky-600">${price.toFixed(2)}</span>
                    </div>
                    
                    {/* Alerta de stock para este item */}
                    {hasItemIssue(item.id) && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700 font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {getItemErrorMessage(item.id)}
                        </p>
                        {(() => {
                          const availableStock = getItemAvailableStock(item.id)
                          return availableStock !== null && availableStock > 0 ? (
                            <p className="text-xs text-red-600 mt-1">
                              Stock disponible: {availableStock}
                            </p>
                          ) : null
                        })()}
                      </div>
                    )}
                    
                    {/* Indicador de stock disponible */}
                    {!hasItemIssue(item.id) && (() => {
                      const availableStock = getItemAvailableStock(item.id)
                      return availableStock !== null ? (
                        <p className="text-xs text-gray-500 mb-3">
                          {availableStock > 0 
                            ? `${availableStock} disponible${availableStock > 1 ? 's' : ''}`
                            : 'En stock'}
                        </p>
                      ) : null
                    })()}

                    {/* Acciones móvil y desktop */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <Link href={`/products/${item.product.slug}`} className="text-xs md:text-sm text-gray-500 hover:text-sky-600 underline">
                        Ver producto
                      </Link>

                      <div className="flex items-center gap-3">
                        {/* Botón eliminar */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                        </button>

                        {/* Control de cantidad */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-sky-500 hover:text-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Reducir cantidad"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-medium text-sky-600">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const availableStock = getItemAvailableStock(item.id)
                              const maxQuantity = availableStock !== null ? availableStock : item.quantity + 1
                              updateItemQuantity(item.id, Math.min(item.quantity + 1, maxQuantity))
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Aumentar cantidad"
                            disabled={(() => {
                              const availableStock = getItemAvailableStock(item.id)
                              return availableStock !== null && item.quantity >= availableStock
                            })()}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )})}

            {/* Sección Level up your gift */}
            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-sky-500" />
                Mejora tu pedido
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {suggestedProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-32 md:w-40">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xs md:text-sm text-gray-700 mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-sm font-bold text-gray-900 mb-2">
                      ${product.price.toFixed(2)}
                    </p>
                    <button className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs py-2 px-3 rounded-full transition-colors">
                      Añadir al carrito
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 md:p-6 sticky top-24">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Resumen</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-base md:text-lg font-bold">
                  <span>Total. IVA incluido.</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Cupón de descuento */}
              <button
                onClick={() => setShowCoupon(!showCoupon)}
                className="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 mb-4"
              >
                <span className="underline">Cupón de descuento</span>
                {showCoupon ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showCoupon && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Código de descuento"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                    Aplicar
                  </button>
                </div>
              )}

              {/* Fecha estimada de entrega */}
              <div className="bg-sky-50 rounded-lg p-3 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha estimada de entrega:</p>
                  <p className="text-sm font-medium text-gray-900">Lun. 05.01 - Mié. 07.01</p>
                </div>
              </div>

              {/* Botón finalizar compra */}
              <Link
                href="/checkout"
                className={`w-full ${
                  validation && validation.hasIssues
                    ? 'bg-gray-400 cursor-not-allowed pointer-events-none'
                    : 'bg-gray-900 hover:bg-gray-800'
                } text-white py-3 md:py-4 rounded-full font-medium transition-colors block text-center`}
              >
                {validation && validation.hasIssues
                  ? 'Resuelve los problemas de stock'
                  : 'Finalizar compra'}
              </Link>
            </div>
          </div>
        </div>

        {/* Sección de beneficios */}
        <div className="bg-gray-100 rounded-xl mt-8 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <ul className="space-y-3 text-sm md:text-base text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-1">•</span>
                  Dispones de 100 días para devolver los productos sin coste
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-1">•</span>
                  Devolución del dinero garantizada
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-1">•</span>
                  Pago seguro SSL
                </li>
              </ul>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600 mb-2">Qué opinan nuestros clientes</p>
              <div className="inline-block bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">CLIENTES SATISFECHOS</p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  4.00 <span className="text-sm font-normal text-gray-500">/ 5.00</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
