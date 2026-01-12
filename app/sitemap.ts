import type { MetadataRoute } from "next"
import { api } from "@/lib/api"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")

  const routes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/cookies`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ]

  try {
    // Productos públicos: sin auth
    const res = await api.getProducts({ page: 1, limit: 100, sortBy: "created-desc" })
    const products = Array.isArray(res?.data) ? res.data : []
    for (const p of products) {
      if (!p?.slug) continue
      routes.push({
        url: `${siteUrl}/products/${encodeURIComponent(String(p.slug))}`,
        lastModified: new Date(p.updatedAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
  } catch {
    // Si el backend no está disponible, al menos devolvemos sitemap básico.
  }

  return routes
}

