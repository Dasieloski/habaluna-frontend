"use client"

import { useState } from "react"
import { Star, X } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/store/auth-store"

interface Review {
  id: string
  rating: number
  title?: string | null
  content: string
}

interface ReviewFormProps {
  productId: string
  productName: string
  review?: Review
  onSuccess: () => void
  onCancel: () => void
}

export function ReviewForm({
  productId,
  productName,
  review,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { user } = useAuthStore()
  const [rating, setRating] = useState(review?.rating || 5)
  const [title, setTitle] = useState(review?.title || "")
  const [comment, setComment] = useState(review?.content || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (review) {
        // Actualizar review existente
        await api.updateProductReview(review.id, {
          rating,
          title: title || undefined,
          comment,
        })
      } else {
        // Crear nuevo review
        await api.createProductReview(productId, {
          rating,
          title: title || undefined,
          comment,
        })
      }
      onSuccess()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al guardar la reseña"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (currentRating: number, interactive: boolean = true) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => interactive && setRating(i + 1)}
        disabled={!interactive || loading}
        className={`transition-colors ${
          interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
        }`}
      >
        <Star
          className={`h-6 w-6 ${
            i < currentRating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      </button>
    ))
  }

  if (!user) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-muted-foreground">
          Debes iniciar sesión para dejar una reseña.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          {review ? "Editar reseña" : "Dejar una reseña"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Calificación *
          </label>
          <div className="flex gap-1">{renderStars(rating)}</div>
        </div>

        <div>
          <label
            htmlFor="review-title"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Título (opcional)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Excelente producto"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Comentario *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con este producto..."
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 resize-none"
            disabled={loading}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !comment.trim()}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Guardando..."
              : review
                ? "Actualizar reseña"
                : "Publicar reseña"}
          </button>
        </div>
      </form>
    </div>
  )
}
