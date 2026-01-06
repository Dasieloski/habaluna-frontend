import { Suspense } from "react"
import ProductsClient from "./products-client"

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-sm text-gray-600">Cargando...</div>}>
      <ProductsClient />
    </Suspense>
  )
}

