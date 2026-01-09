import { api } from "@/lib/api"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProductClient } from "./product-client"

export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  // Si falla el fetch, igual devolvemos algo razonable
  try {
    const response = await api.get(`/products/slug/${encodeURIComponent(slug)}`)
    const product: any = response.data
    return {
      title: product?.name ? `${product.name} | Habaluna` : "Producto | Habaluna",
      description: product?.shortDescription || product?.description || undefined,
    }
  } catch {
    return { title: "Producto | Habaluna" }
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params

  let product: any
  try {
    const response = await api.get(`/products/slug/${encodeURIComponent(slug)}`)
    product = response.data
  } catch {
    notFound()
  }

  let relatedProducts: any[] = []
  try {
    // Si es combo, sugerir otros combos
    if (product?.isCombo) {
      const res = await api.getProducts({ page: 1, limit: 48, isCombo: true })
      relatedProducts = (res.data || []).filter((p: any) => p.id !== product.id).slice(0, 8)
    } else if (product?.categoryId) {
      const res = await api.getProducts({ page: 1, limit: 24, categoryId: product.categoryId })
      relatedProducts = (res.data || []).filter((p: any) => p.id !== product.id).slice(0, 8)
    }
  } catch {
    relatedProducts = []
  }

  let reviewsData: any = null
  try {
    if (product?.id) {
      reviewsData = await api.getProductReviews(product.id, 1, 5)
    }
  } catch {
    reviewsData = null
  }

  return (
    <ProductClient
      product={product}
      relatedProducts={relatedProducts}
      initialReviews={reviewsData?.data || []}
      initialReviewsMeta={reviewsData?.meta}
    />
  )
}
