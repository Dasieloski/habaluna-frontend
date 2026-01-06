function normalizeApiBaseUrl(raw: string): string {
  let url = (raw || "").trim()
  if (!url) return "http://localhost:4000"
  // Si el usuario pegó solo el dominio (sin http/https), asumir https en producción.
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  // Remover /api del final si existe (normalizar)
  url = url.replace(/\/api\/?$/, "")
  return url
}

// Asegurar que API_BASE_URL no termine con /api y que sea URL válida (con protocolo)
let API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")

// Función helper para obtener el token de autenticación
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  
  // Primero intentar obtener del localStorage directo (lo guarda setAuth)
  const directToken = localStorage.getItem('accessToken')
  if (directToken && directToken.trim() !== '') {
    return directToken.trim()
  }
  
  // Si no, intentar obtener del persist storage de Zustand
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage)
      const token = parsed.state?.accessToken
      if (token && token.trim() !== '') {
        // Sincronizar con localStorage directo para futuras consultas
        localStorage.setItem('accessToken', token.trim())
        return token.trim()
      }
    } catch (e) {
      console.error("Error parsing auth-storage:", e)
      return null
    }
  }
  
  return null
}

type ApiError = Error & {
  status?: number
  response?: { data?: { message?: string } }
  url?: string
}

function clearAuthStorage() {
  if (typeof window === "undefined") return
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("auth-storage")
}

function redirectToAdminLoginIfOnAdmin() {
  if (typeof window === "undefined") return
  const path = window.location.pathname || ""
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    window.location.href = "/admin/login"
  }
}

function handleUnauthorized() {
  clearAuthStorage()
  redirectToAdminLoginIfOnAdmin()
}

async function buildApiError(response: Response, finalUrl: string): Promise<ApiError> {
  let errorMessage = `API Error: ${response.status} ${response.statusText}`
  try {
    const errorData = await response.json()
    errorMessage = errorData?.message || errorData?.error || errorMessage
  } catch {
    // ignore
  }
  const err: ApiError = new Error(errorMessage)
  err.status = response.status
  err.url = finalUrl
  err.response = { data: { message: errorMessage } }
  return err
}

// Tipos para la respuesta de la API del backend
export interface BackendProduct {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string | null
  priceUSD?: string | number | null
  priceMNs?: string | number | null
  comparePriceUSD?: string | number | null
  comparePriceMNs?: string | number | null
  stock: number
  isActive: boolean
  isFeatured: boolean
  isCombo?: boolean
  images: string[]
  allergens: string[]
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
  }
  comboItems?: Array<{
    id: string
    productId: string
    quantity: number
    product?: BackendProduct
  }>
  createdAt: string
  updatedAt: string
}

export interface BackendBanner {
  id: string
  title: string
  description?: string | null
  image: string
  link?: string | null
  isActive: boolean
  order: number
  startDate?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface BackendUiSettings {
  id: string
  headerAnnouncement: string
  headerHighlights?: any
  benefits?: any
  createdAt: string
  updatedAt: string
}

export interface BackendReview {
  id: string
  productId: string
  userId?: string | null
  authorName: string
  authorEmail?: string | null
  rating: number
  title?: string | null
  content: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export interface BackendAdminReview extends BackendReview {
  product?: {
    id: string
    name: string
    slug: string
  }
}

export interface AdminReviewsResponse {
  data: BackendAdminReview[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface BackendReviewSettings {
  id: string
  autoApproveReviews: boolean
  createdAt: string
  updatedAt: string
}

export interface BackendWishlistItem {
  id: string
  productId: string
  createdAt: string
  product: BackendProduct
}

export interface WishlistResponse {
  items: BackendWishlistItem[]
}

export interface ProductsResponse {
  data: BackendProduct[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface BackendCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  isActive?: boolean
  order?: number
  createdAt: string
  updatedAt: string
}

export interface BackendAdminCategory extends BackendCategory {
  _count?: {
    products?: number
  }
}

export interface BackendAdminCustomer {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  createdAt: string
  isActive: boolean
  totalOrders: number
  totalSpent: number
  lastOrderAt?: string | null
}

export interface AdminCustomersResponse {
  data: BackendAdminCustomer[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type BackendOfferType = "PERCENTAGE" | "FIXED"

export interface BackendAdminOffer {
  id: string
  name: string
  code: string
  type: BackendOfferType
  value: string | number
  minPurchase?: string | number | null
  usageLimit?: number | null
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface OffersResponse {
  data: BackendAdminOffer[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateCategoryData {
  name: string
  slug: string
  description?: string
  image?: string
  isActive?: boolean
  order?: number
}

export interface CreateProductData {
  name: string
  slug: string
  description: string
  shortDescription?: string
  priceUSD?: number
  priceMNs?: number
  comparePriceUSD?: number | null
  comparePriceMNs?: number | null
  stock: number
  isActive?: boolean
  isFeatured?: boolean
  images?: string[]
  allergens?: string[]
  categoryId: string
  sku?: string
  weight?: number
  nutritionalInfo?: any
}

export const api = {
  get: async (endpoint: string) => {
    try {
      // Separar path y query string
      const [pathPart, queryPart] = endpoint.includes('?') ? endpoint.split('?', 2) : [endpoint, '']
      
      // Limpiar el path: remover cualquier /api al inicio
      let cleanPath = pathPart.trim()
      while (cleanPath.startsWith('/api')) {
        cleanPath = cleanPath.substring(4)
      }
      
      // Asegurar que empiece con /
      if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath
      }
      
      // Reconstruir endpoint limpio
      const finalPath = queryPart ? `${cleanPath}?${queryPart}` : cleanPath
      
      // Construir URL final - API_BASE_URL no incluye /api, lo agregamos aquí
      const finalUrl = `${API_BASE_URL}/api${finalPath}`
      
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(finalUrl, {
        headers,
      })
      if (!response.ok) {
        // Si es 401, limpiar tokens (sesión expirada) para evitar spam de requests con token inválido
        if (response.status === 401) {
          handleUnauthorized()
        }
        throw await buildApiError(response, finalUrl)
      }
      const data = await response.json()
      return { data }
    } catch (error) {
      // No spamear consola: 401/404 pueden ser casos normales (sesión expirada / producto no existe)
      throw error
    }
  },

  // Función específica para obtener productos
  getProducts: async (params?: {
    page?: number
    limit?: number
    categoryId?: string
    search?: string
    isFeatured?: boolean
    isCombo?: boolean
  }): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString())
    if (params?.isCombo !== undefined) queryParams.append('isCombo', params.isCombo.toString())

    const queryString = queryParams.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get(endpoint)
    return response.data as ProductsResponse
  },

  // Productos (Admin) - incluye inactivos/borradores
  getAdminProducts: async (params?: {
    page?: number
    limit?: number
    categoryId?: string
    search?: string
    isFeatured?: boolean
    isCombo?: boolean
    isActive?: boolean
  }): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString())
    if (params?.isCombo !== undefined) queryParams.append('isCombo', params.isCombo.toString())
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())

    const queryString = queryParams.toString()
    const endpoint = `/products/admin${queryString ? `?${queryString}` : ''}`

    const response = await api.get(endpoint)
    return response.data as ProductsResponse
  },

  // Productos más vendidos
  getBestSellers: async (limit: number = 8): Promise<BackendProduct[]> => {
    const response = await api.get(`/products/best-sellers?limit=${encodeURIComponent(String(limit))}`)
    return (response.data || []) as BackendProduct[]
  },

  // Función para crear un producto
  createProduct: async (productData: CreateProductData) => {
    const response = await api.post('/products', productData)
    return response.data as BackendProduct
  },

  // Función para actualizar un producto
  updateProduct: async (id: string, productData: Partial<CreateProductData>) => {
    const response = await api.patch(`/products/${id}`, productData)
    return response.data as BackendProduct
  },

  // Función para eliminar un producto
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  // Función para obtener un producto por ID
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`)
    return response.data as BackendProduct
  },

  // Función para obtener categorías
  getCategories: async (): Promise<BackendCategory[]> => {
    const response = await api.get('/categories')
    return (response.data?.data || response.data || []) as BackendCategory[]
  },

  // Función para obtener categorías (Admin)
  getAdminCategories: async (): Promise<BackendAdminCategory[]> => {
    const response = await api.get('/categories/admin')
    return (response.data?.data || response.data || []) as BackendAdminCategory[]
  },

  // Banners (público)
  getBanners: async (): Promise<BackendBanner[]> => {
    const response = await api.get("/banners")
    return (response.data || []) as BackendBanner[]
  },

  // Banners (Admin)
  getAdminBanners: async (): Promise<BackendBanner[]> => {
    const response = await api.get("/banners/admin")
    return (response.data || []) as BackendBanner[]
  },

  createBanner: async (data: {
    title: string
    description?: string
    image: string
    link?: string
    isActive?: boolean
    order?: number
    startDate?: string
    endDate?: string
  }): Promise<BackendBanner> => {
    const response = await api.post("/banners", data)
    return response.data as BackendBanner
  },

  updateBanner: async (
    id: string,
    data: Partial<{
      title: string
      description: string | null
      image: string
      link: string | null
      isActive: boolean
      order: number
      startDate: string | null
      endDate: string | null
    }>,
  ): Promise<BackendBanner> => {
    const response = await api.patch(`/banners/${id}`, data)
    return response.data as BackendBanner
  },

  deleteBanner: async (id: string) => {
    const response = await api.delete(`/banners/${id}`)
    return response.data
  },

  // UI Settings (público/admin)
  getUiSettings: async (): Promise<BackendUiSettings> => {
    const response = await api.get("/ui-settings/public")
    return response.data as BackendUiSettings
  },

  getAdminUiSettings: async (): Promise<BackendUiSettings> => {
    const response = await api.get("/ui-settings/admin")
    return response.data as BackendUiSettings
  },

  updateAdminUiSettings: async (data: Partial<{ headerAnnouncement: string; headerHighlights: string[]; benefits: Array<{ title: string; description: string }> }>) => {
    const response = await api.patch("/ui-settings/admin", data)
    return response.data as BackendUiSettings
  },

  // Clientes (Admin)
  getAdminCustomers: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<AdminCustomersResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const endpoint = `/users/admin/customers${queryString ? `?${queryString}` : ''}`
    const response = await api.get(endpoint)
    return response.data as AdminCustomersResponse
  },

  // Usuario (Admin)
  getAdminUser: async (id: string) => {
    const response = await api.get(`/users/${id}`)
    return response.data as any
  },

  // Activar/Desactivar usuario (Admin)
  setUserActive: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/users/${id}`, { isActive })
    return response.data as any
  },

  // Ofertas (Admin)
  getAdminOffers: async (params?: { page?: number; limit?: number; search?: string }): Promise<OffersResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    const queryString = queryParams.toString()
    const endpoint = `/offers/admin${queryString ? `?${queryString}` : ""}`
    const response = await api.get(endpoint)
    return response.data as OffersResponse
  },

  getAdminOffer: async (id: string): Promise<BackendAdminOffer> => {
    const response = await api.get(`/offers/admin/${id}`)
    return response.data as BackendAdminOffer
  },

  createOffer: async (data: {
    name: string
    code: string
    type: BackendOfferType
    value: number
    minPurchase?: number
    usageLimit?: number
    startDate: string
    endDate: string
    isActive?: boolean
  }): Promise<BackendAdminOffer> => {
    const response = await api.post(`/offers/admin`, data)
    return response.data as BackendAdminOffer
  },

  updateOffer: async (
    id: string,
    data: Partial<{
      name: string
      code: string
      type: BackendOfferType
      value: number
      minPurchase: number | null
      usageLimit: number | null
      startDate: string
      endDate: string
      isActive: boolean
    }>,
  ): Promise<BackendAdminOffer> => {
    const response = await api.patch(`/offers/admin/${id}`, data)
    return response.data as BackendAdminOffer
  },

  deleteOffer: async (id: string) => {
    const response = await api.delete(`/offers/admin/${id}`)
    return response.data
  },

  // Reseñas (público)
  getProductReviews: async (productId: string): Promise<BackendReview[]> => {
    const response = await api.get(`/products/${productId}/reviews`)
    return (response.data || []) as BackendReview[]
  },

  createProductReview: async (
    productId: string,
    data: {
      authorName: string
      authorEmail?: string
      rating: number
      title?: string
      content: string
    },
  ) => {
    const response = await api.post(`/products/${productId}/reviews`, data)
    return response.data as BackendReview
  },

  // Reseñas (Admin)
  getAdminReviewSettings: async (): Promise<BackendReviewSettings> => {
    const response = await api.get(`/reviews/admin/settings`)
    return response.data as BackendReviewSettings
  },

  updateAdminReviewSettings: async (data: { autoApproveReviews: boolean }): Promise<BackendReviewSettings> => {
    const response = await api.patch(`/reviews/admin/settings`, data)
    return response.data as BackendReviewSettings
  },

  // Wishlist (usuario)
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.get("/wishlist")
    return response.data as WishlistResponse
  },

  addToWishlist: async (productId: string) => {
    const response = await api.post("/wishlist", { productId })
    return response.data as BackendWishlistItem
  },

  removeFromWishlist: async (productId: string) => {
    const response = await api.delete(`/wishlist/${productId}`)
    return response.data
  },

  getAdminReviews: async (params?: {
    page?: number
    limit?: number
    search?: string
    productId?: string
    isApproved?: boolean
  }): Promise<AdminReviewsResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.productId) queryParams.append("productId", params.productId)
    if (params?.isApproved !== undefined) queryParams.append("isApproved", params.isApproved.toString())
    const queryString = queryParams.toString()
    const endpoint = `/reviews/admin${queryString ? `?${queryString}` : ""}`
    const response = await api.get(endpoint)
    return response.data as AdminReviewsResponse
  },

  createAdminReview: async (data: {
    productId: string
    authorName: string
    authorEmail?: string
    rating: number
    title?: string
    content: string
    isApproved?: boolean
  }): Promise<BackendAdminReview> => {
    const response = await api.post(`/reviews/admin`, data)
    return response.data as BackendAdminReview
  },

  updateAdminReview: async (
    id: string,
    data: Partial<{
      productId: string
      authorName: string
      authorEmail: string | null
      rating: number
      title: string | null
      content: string
      isApproved: boolean
    }>,
  ): Promise<BackendAdminReview> => {
    const response = await api.patch(`/reviews/admin/${id}`, data)
    return response.data as BackendAdminReview
  },

  deleteAdminReview: async (id: string) => {
    const response = await api.delete(`/reviews/admin/${id}`)
    return response.data
  },

  // Obtener/crear categoría especial "Sin categoría" (Admin)
  getUncategorizedCategory: async (): Promise<BackendAdminCategory> => {
    const response = await api.get('/categories/uncategorized')
    return response.data as BackendAdminCategory
  },

  // Crear categoría (Admin)
  createCategory: async (categoryData: CreateCategoryData) => {
    const response = await api.post('/categories', categoryData)
    return response.data as BackendAdminCategory
  },

  // Actualizar categoría (Admin)
  updateCategory: async (id: string, categoryData: Partial<CreateCategoryData>) => {
    const response = await api.patch(`/categories/${id}`, categoryData)
    return response.data as BackendAdminCategory
  },

  // Eliminar categoría (Admin)
  deleteCategory: async (
    id: string,
    mode: 'delete_with_products' | 'move_products_to_uncategorized',
  ) => {
    const response = await api.delete(`/categories/${id}?mode=${encodeURIComponent(mode)}`)
    return response.data
  },

  // Asociar productos a una categoría (Admin) - mueve productos seteando categoryId
  assignProductsToCategory: async (categoryId: string, productIds: string[]) => {
    const response = await api.patch(`/categories/${categoryId}/products`, { productIds })
    return response.data as BackendAdminCategory
  },

  // Función para subir una imagen
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = getAuthToken()
    const headers: HeadersInit = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const url = `${API_BASE_URL}/api/upload/single`
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      // No incluir Content-Type header, el navegador lo hace automáticamente con FormData
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized()
      }
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.url // Retorna la URL de la imagen subida
  },

  // Función genérica PATCH
  patch: async (endpoint: string, data: any) => {
    try {
      // Normalizar endpoint igual que en get
      const [pathPart, queryPart] = endpoint.includes('?') ? endpoint.split('?', 2) : [endpoint, '']
      
      let cleanPath = pathPart.trim()
      while (cleanPath.startsWith('/api')) {
        cleanPath = cleanPath.substring(4)
      }
      
      if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath
      }
      
      const finalPath = queryPart ? `${cleanPath}?${queryPart}` : cleanPath
      const finalUrl = `${API_BASE_URL}/api${finalPath}`
      
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (!token) {
        const errorMessage = "No estás autenticado. Por favor, inicia sesión nuevamente."
        // En admin, redirigir directamente al login; fuera del admin, solo lanzar 401.
        redirectToAdminLoginIfOnAdmin()
        const err: any = new Error(errorMessage)
        err.status = 401
        err.response = { data: { message: errorMessage } }
        throw err
      }
      
      headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(finalUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        // Si es 401, el token puede haber expirado o no ser válido
        if (response.status === 401) {
          handleUnauthorized()
          throw new Error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.")
        }
        
        let errorMessage = `API Error: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // Si no se puede parsear el error, usar el mensaje por defecto
        }
        const error: any = new Error(errorMessage)
        error.status = response.status
        error.response = { data: { message: errorMessage } }
        throw error
      }
      
      const responseData = await response.json()
      return { data: responseData }
    } catch (error: any) {
      if (error.response || error.status) {
        throw error
      }
      const formattedError: any = new Error(error.message || "Error de conexión")
      formattedError.status = error.status || 500
      formattedError.response = { data: { message: error.message || "Error de conexión" } }
      throw formattedError
    }
  },

  // Función genérica DELETE
  delete: async (endpoint: string) => {
    try {
      // Normalizar endpoint igual que en get
      const [pathPart, queryPart] = endpoint.includes('?') ? endpoint.split('?', 2) : [endpoint, '']
      
      let cleanPath = pathPart.trim()
      while (cleanPath.startsWith('/api')) {
        cleanPath = cleanPath.substring(4)
      }
      
      if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath
      }
      
      const finalPath = queryPart ? `${cleanPath}?${queryPart}` : cleanPath
      const finalUrl = `${API_BASE_URL}/api${finalPath}`
      
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(finalUrl, {
        method: 'DELETE',
        headers,
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
        }
        let errorMessage = `API Error: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // Si no se puede parsear el error, usar el mensaje por defecto
        }
        const error: any = new Error(errorMessage)
        error.status = response.status
        error.response = { data: { message: errorMessage } }
        throw error
      }
      
      // DELETE puede no retornar contenido
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json()
        return { data: responseData }
      }
      return { data: { success: true } }
    } catch (error: any) {
      if (error.response || error.status) {
        throw error
      }
      const formattedError: any = new Error(error.message || "Error de conexión")
      formattedError.status = error.status || 500
      formattedError.response = { data: { message: error.message || "Error de conexión" } }
      throw formattedError
    }
  },

  // Función genérica POST
  post: async (endpoint: string, data: any) => {
    try {
      // Normalizar endpoint igual que en get
      const [pathPart, queryPart] = endpoint.includes('?') ? endpoint.split('?', 2) : [endpoint, '']
      
      let cleanPath = pathPart.trim()
      while (cleanPath.startsWith('/api')) {
        cleanPath = cleanPath.substring(4)
      }
      
      if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath
      }
      
      const finalPath = queryPart ? `${cleanPath}?${queryPart}` : cleanPath
      const finalUrl = `${API_BASE_URL}/api${finalPath}`
      
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
        }
        // Intentar obtener el mensaje de error del backend
        let errorMessage = `API Error: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // Si no se puede parsear el error, usar el mensaje por defecto
        }
        const error: any = new Error(errorMessage)
        error.status = response.status
        error.response = { data: { message: errorMessage } }
        throw error
      }
      
      const responseData = await response.json()
      return { data: responseData }
    } catch (error: any) {
      // Si el error ya tiene formato correcto, re-lanzarlo
      if (error.response || error.status) {
        throw error
      }
      // Si no, crear un error con formato estándar
      const formattedError: any = new Error(error.message || "Error de conexión")
      formattedError.status = error.status || 500
      formattedError.response = { data: { message: error.message || "Error de conexión" } }
      throw formattedError
    }
  },
}

// Función para normalizar URLs de imágenes
function normalizeImageUrl(imagePath: string): string {
  // Si ya es una URL completa, retornarla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Si empieza con /uploads, construir la URL completa del backend
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`
  }
  
  // Si empieza con /, asumir que es una ruta relativa del backend
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`
  }
  
  // Si no tiene prefijo, asumir que es relativa a uploads
  return `${API_BASE_URL}/uploads/${imagePath}`
}

// Función para mapear productos del backend al formato del frontend
export function mapBackendProductToFrontend(backendProduct: BackendProduct): import('./mock-data').Product {
  const priceUSD = backendProduct.priceUSD 
    ? (typeof backendProduct.priceUSD === 'string' ? parseFloat(backendProduct.priceUSD) : backendProduct.priceUSD)
    : 0
  
  const comparePriceUSD = backendProduct.comparePriceUSD
    ? (typeof backendProduct.comparePriceUSD === 'string' ? parseFloat(backendProduct.comparePriceUSD) : backendProduct.comparePriceUSD)
    : undefined

  // Determinar si está en oferta (tiene precio comparación)
  const isOnSale = !!comparePriceUSD && comparePriceUSD > priceUSD
  const salePercentage = isOnSale && comparePriceUSD
    ? Math.round(((comparePriceUSD - priceUSD) / comparePriceUSD) * 100)
    : undefined

  // Convertir isActive a status
  let status: "active" | "draft" | "archived" = "active"
  if (!backendProduct.isActive) {
    status = "archived"
  }

  // Normalizar URLs de imágenes
  const images = backendProduct.images.length > 0 
    ? backendProduct.images.map(normalizeImageUrl)
    : ['/placeholder.svg']

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    slug: backendProduct.slug,
    shortDescription: backendProduct.shortDescription || '',
    description: backendProduct.description,
    details: '', // El backend no tiene este campo específico, dejar vacío o usar description
    category: backendProduct.category.name,
    categoryId: backendProduct.categoryId,
    priceUSD: priceUSD,
    comparePriceUSD: comparePriceUSD,
    stock: backendProduct.stock,
    images: images,
    status: status,
    isOnSale: isOnSale,
    salePercentage: salePercentage,
    createdAt: backendProduct.createdAt,
    // Incluir isFeatured como propiedad adicional (no está en el tipo Product pero lo necesitamos)
    isFeatured: backendProduct.isFeatured ?? false,
    // Incluir isCombo como propiedad adicional (no está en el tipo Product pero lo necesitamos)
    isCombo: backendProduct.isCombo ?? false,
  } as import('./mock-data').Product & { isFeatured: boolean }
}
