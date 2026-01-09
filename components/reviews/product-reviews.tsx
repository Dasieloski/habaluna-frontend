"use client"

import { useState, useEffect } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { api } from "@/lib/api"
import { ReviewForm } from "./review-form"
import { useAuthStore } from "@/lib/store/auth-store"

interface Review {
  id: string
  rating: number
  title?: string | null
  content: string
  authorName: string
  createdAt: string
  user?: {
    id: string
    firstName?: string | null
    lastName?: string | null
  } | null
}

interface ProductReviewsProps {
  productId: string
  productName: string
  initialReviews?: Review[]
  initialMeta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function ProductReviews({
  productId,
  productName,
  initialReviews = [],
  initialMeta,
}: ProductReviewsProps) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [meta, setMeta] = useState(
    initialMeta || {
      total: 0,
      page: 1,
      limit: 5,
      totalPages: 0,
    }
  )
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)

  const loadReviews = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await api.getProductReviews(productId, page, 5)
      setReviews(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error("Error loading reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Verificar si el usuario ya tiene un review
    if (user && reviews.length > 0) {
      const existing = reviews.find((r) => r.user?.id === user.id)
      if (existing) {
        setUserReview(existing)
      }
    }
  }, [user, reviews])

  const handleReviewCreated = () => {
    setShowForm(false)
    loadReviews(meta.page)
  }

  const handleReviewUpdated = () => {
    setShowForm(false)
    loadReviews(meta.page)
  }

  const handleReviewDeleted = () => {
    setUserReview(null)
    loadReviews(meta.page)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Reseñas ({meta.total})
        </h2>
        {user && !userReview && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Dejar una reseña
          </button>
        )}
      </div>

      {showForm && !userReview && (
        <ReviewForm
          productId={productId}
          productName={productName}
          onSuccess={handleReviewCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {userReview && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">{renderStars(userReview.rating)}</div>
                <span className="text-sm font-medium text-foreground">
                  Tu reseña
                </span>
              </div>
              {userReview.title && (
                <h3 className="font-semibold text-foreground mb-1">
                  {userReview.title}
                </h3>
              )}
              <p className="text-sm text-muted-foreground">
                {userReview.content}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-sky-600 hover:text-sky-700"
              >
                Editar
              </button>
              <button
                onClick={async () => {
                  if (
                    confirm("¿Estás seguro de que quieres eliminar tu reseña?")
                  ) {
                    try {
                      await api.deleteProductReview(userReview.id)
                      handleReviewDeleted()
                    } catch (error) {
                      console.error("Error deleting review:", error)
                      alert("Error al eliminar la reseña")
                    }
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
          {showForm && userReview && (
            <ReviewForm
              productId={productId}
              productName={productName}
              review={userReview}
              onSuccess={handleReviewUpdated}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando reseñas...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay reseñas aún. Sé el primero en dejar una reseña.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm font-medium text-foreground">
                        {review.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {review.title && (
                      <h3 className="font-semibold text-foreground mb-1">
                        {review.title}
                      </h3>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {review.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => loadReviews(meta.page - 1)}
                disabled={meta.page === 1 || loading}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                Página {meta.page} de {meta.totalPages}
              </span>
              <button
                onClick={() => loadReviews(meta.page + 1)}
                disabled={meta.page === meta.totalPages || loading}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
