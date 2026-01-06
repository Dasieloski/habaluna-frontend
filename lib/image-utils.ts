export function getFirstImage(images?: string | string[]): string | null {
  if (!images) return null
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed[0] : images
    } catch {
      return images
    }
  }
  return images[0] || null
}

export function getImageUrl(image?: string): string | null {
  if (!image) return null
  if (image.startsWith("http")) return image
  // Si la ruta empieza con /, es una ruta local de public (Next.js sirve public/ desde la raíz)
  if (image.startsWith("/")) return image
  // Si no, usa el API URL del backend
  const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim()
  const base = raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw
  return `${base}${image}`
}
