"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { type Product } from "@/lib/mock-data"
import { api, type BackendCategory, mapBackendProductToFrontend } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ImagePlus, X } from "lucide-react"
import { slugify } from "@/lib/slug"

interface ProductEditDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ProductEditDialog({ product, open, onOpenChange, onSuccess }: ProductEditDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categories, setCategories] = useState<BackendCategory[]>([])
  const [fullProduct, setFullProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isOnSale, setIsOnSale] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSlug, setAutoSlug] = useState(false) // En edición, por defecto manual

  // Refs para los campos del formulario
  const nameRef = useRef<HTMLInputElement>(null)
  const slugRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const shortDescriptionRef = useRef<HTMLTextAreaElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)
  const comparePriceRef = useRef<HTMLInputElement>(null)
  const stockRef = useRef<HTMLInputElement>(null)
  const categoryIdRef = useRef<string>("")
  const statusRef = useRef<"active" | "draft" | "archived">("active")
  const [isFeatured, setIsFeatured] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar categorías y datos del producto cuando se abre el dialog
  useEffect(() => {
    if (open && product) {
      loadCategories()
      loadFullProduct()
    } else if (!open) {
      // Limpiar datos cuando se cierra
      setImages([])
      setImageFiles([])
      setFullProduct(null)
      setError(null)
    }
  }, [open, product])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const data = await api.getCategories()
      setCategories(data)
    } catch (err) {
      console.error("Error al cargar categorías:", err)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const loadFullProduct = async () => {
    if (!product) return

    try {
      setIsLoadingProduct(true)
      // Obtener el producto completo del backend
      const backendProduct = await api.getProduct(product.id)
      // Mapear a formato frontend
      const mappedProduct = mapBackendProductToFrontend(backendProduct)
      setFullProduct(mappedProduct)
      loadProductData(mappedProduct)
    } catch (err) {
      console.error("Error al cargar producto completo:", err)
      // Si falla, usar el producto que tenemos
      loadProductData(product)
      toast({
        title: "Advertencia",
        description: "No se pudieron cargar todos los datos del producto. Usando datos disponibles.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const loadProductData = (productToLoad: Product) => {
    if (!productToLoad) return

    // Cargar datos en los refs
    if (nameRef.current) nameRef.current.value = productToLoad.name || ""
    if (slugRef.current) slugRef.current.value = productToLoad.slug || ""
    if (descriptionRef.current) descriptionRef.current.value = productToLoad.description || ""
    if (shortDescriptionRef.current) shortDescriptionRef.current.value = productToLoad.shortDescription || ""
    if (priceRef.current) priceRef.current.value = productToLoad.priceUSD?.toString() || ""
    if (stockRef.current) stockRef.current.value = productToLoad.stock?.toString() || ""

    // Configurar oferta (en el frontend viene calculado, pero lo dejamos consistente)
    setIsOnSale(!!productToLoad.isOnSale)
    if (comparePriceRef.current && productToLoad.comparePriceUSD) {
      comparePriceRef.current.value = productToLoad.comparePriceUSD.toString()
    }

    // Cargar imágenes - usar normalizeImageUrl si está disponible, sino normalizar manualmente
    const normalizedImages = (productToLoad.images || []).map(img => {
      if (!img) return ''
      // Si ya es una URL completa, retornarla
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img
      }
      // Si empieza con /uploads, construir la URL completa
      if (img.startsWith('/uploads/')) {
        return `http://localhost:4000${img}`
      }
      // Si empieza con /, construir la URL
      if (img.startsWith('/')) {
        return `http://localhost:4000${img}`
      }
      // Si no tiene /, agregarlo
      return `http://localhost:4000/${img}`
    }).filter(img => img !== '')
    setImages(normalizedImages)
    setImageFiles([])

    // Configurar estado
    statusRef.current = productToLoad.status || "draft"
    // Buscar isFeatured - viene del backend pero puede que no esté en el tipo Product del frontend
    // Revisar si el producto tiene isFeatured (puede venir en el objeto original del backend)
    const isProductFeatured = (productToLoad as any).isFeatured ?? false
    setIsFeatured(isProductFeatured)
    categoryIdRef.current = productToLoad.categoryId || ""
    
    // Forzar re-render de los selects con los valores correctos
    setTimeout(() => {
      // Esto asegura que los Select tengan los valores correctos después de cargar
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const productToUpdate = fullProduct || product
    if (!productToUpdate) return

    setError(null)
    setIsLoading(true)

    try {
      // Validaciones básicas
      if (!nameRef.current?.value) {
        throw new Error("El nombre del producto es requerido")
      }
      if (!slugRef.current?.value) {
        throw new Error("El slug es requerido")
      }
      if (!descriptionRef.current?.value) {
        throw new Error("La descripción es requerida")
      }
      if (!categoryIdRef.current) {
        throw new Error("Debes seleccionar una categoría")
      }
      if (!stockRef.current?.value) {
        throw new Error("El stock es requerido")
      }

      // Subir nuevas imágenes primero
      const uploadedImageUrls: string[] = []
      for (const file of imageFiles) {
        try {
          const imageUrl = await api.uploadImage(file)
          uploadedImageUrls.push(imageUrl)
        } catch (err) {
          console.error("Error al subir imagen:", err)
        }
      }

      // Combinar imágenes existentes (que no fueron removidas) con las nuevas
      // Las imágenes que están en imageFiles son nuevas, las demás son existentes
      const existingImages = images.slice(0, images.length - imageFiles.length)
      const allImages = [...existingImages, ...uploadedImageUrls]

      // Crear el objeto del producto actualizado
      const productData = {
        name: nameRef.current.value,
        slug: slugRef.current.value,
        description: descriptionRef.current.value,
        shortDescription: shortDescriptionRef.current?.value || undefined,
        priceUSD: priceRef.current?.value ? parseFloat(priceRef.current.value) : undefined,
        // Si se desmarca la oferta, enviar null para borrar comparePriceUSD en el backend
        comparePriceUSD: isOnSale
          ? (comparePriceRef.current?.value ? parseFloat(comparePriceRef.current.value) : undefined)
          : null,
        stock: parseInt(stockRef.current.value),
        categoryId: categoryIdRef.current,
        isActive: statusRef.current === "active",
        isFeatured: isFeatured,
        images: allImages.length > 0 ? allImages : undefined,
      }

      // Actualizar el producto
      await api.updateProduct(productToUpdate.id, productData)

      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      })

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Error al actualizar producto:", err)
      const errorMessage = err.message || "Error al actualizar el producto. Por favor, intenta de nuevo."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setImageFiles([...imageFiles, ...newFiles])

    // Crear URLs temporales para previsualización
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    const productToUse = fullProduct || product
    const totalExistingImages = productToUse?.images?.length || 0
    const currentExistingImages = images.length - imageFiles.length
    
    // Si la imagen removida es una nueva (agregada en esta sesión)
    if (index >= currentExistingImages) {
      // Es una imagen nueva, removerla de imageFiles
      const newImageIndex = index - currentExistingImages
      setImageFiles(imageFiles.filter((_, i) => i !== newImageIndex))
    }
    // Remover de la lista visual
    setImages(images.filter((_, i) => i !== index))
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!nameRef.current || !slugRef.current) return
    if (autoSlug) {
      slugRef.current.value = slugify(e.target.value)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>Modifica los datos del producto</DialogDescription>
        </DialogHeader>

        {isLoadingProduct && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando datos del producto...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del producto</Label>
              <Input
                id="edit-name"
                ref={nameRef}
                placeholder="Ej: Aceite de Oliva Virgen Extra"
                className="bg-secondary/50 border-transparent focus:border-primary"
                onChange={handleNameChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">URL amigable (slug)</Label>
              <div className="flex items-center justify-between rounded-lg border p-3 mb-2">
                <div>
                  <p className="text-sm font-medium">Generar automáticamente</p>
                  <p className="text-xs text-muted-foreground">
                    Si está activo, se genera desde el nombre.
                  </p>
                </div>
                <Switch
                  checked={autoSlug}
                  onCheckedChange={(v) => {
                    setAutoSlug(v)
                    if (v && nameRef.current && slugRef.current) {
                      slugRef.current.value = slugify(nameRef.current.value || "")
                    }
                  }}
                />
              </div>
              <Input
                id="edit-slug"
                ref={slugRef}
                placeholder="aceite-oliva-virgen-extra"
                className="bg-secondary/50 border-transparent focus:border-primary"
                required
                disabled={autoSlug}
              />
              {autoSlug && (
                <p className="text-xs text-muted-foreground">
                  Slug: <span className="font-medium">{slugRef.current?.value || ""}</span>
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-short-desc">Descripción corta</Label>
                <Textarea
                  id="edit-short-desc"
                  ref={shortDescriptionRef}
                  placeholder="Una breve descripción..."
                  rows={2}
                  className="bg-secondary/50 border-transparent focus:border-primary resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descripción</Label>
                <Textarea
                  id="edit-desc"
                  ref={descriptionRef}
                  placeholder="Descripción detallada..."
                  rows={2}
                  className="bg-secondary/50 border-transparent focus:border-primary resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="space-y-2">
            <Label>Imágenes</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg bg-secondary overflow-hidden group">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Añadir</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Precios y stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio (€)</Label>
              <Input
                id="edit-price"
                ref={priceRef}
                type="number"
                step="0.01"
                placeholder="0.00"
                min="0"
                className="bg-secondary/50 border-transparent focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                ref={stockRef}
                type="number"
                placeholder="0"
                min="0"
                className="bg-secondary/50 border-transparent focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoría</Label>
              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select
                  defaultValue={categoryIdRef.current}
                  onValueChange={(value) => {
                    categoryIdRef.current = value
                  }}
                  required
                >
                  <SelectTrigger id="edit-category" className="bg-secondary/50 border-transparent">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Descuento */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">En oferta</p>
              <p className="text-sm text-muted-foreground">Mostrar el producto como oferta (requiere precio original)</p>
            </div>
            <Switch checked={isOnSale} onCheckedChange={setIsOnSale} />
          </div>
          {isOnSale && (
            <div className="space-y-2">
              <Label htmlFor="edit-compare-price">Precio original (€)</Label>
              <Input
                id="edit-compare-price"
                ref={comparePriceRef}
                type="number"
                step="0.01"
                placeholder="0.00"
                min="0"
                className="bg-secondary/50 border-transparent focus:border-primary"
              />
            </div>
          )}

          {/* Estado y destacado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                defaultValue={statusRef.current}
                key={statusRef.current} // Force re-render when status changes
                onValueChange={(value: "active" | "draft" | "archived") => {
                  statusRef.current = value
                }}
              >
                <SelectTrigger className="bg-secondary/50 border-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Producto destacado</p>
                <p className="text-sm text-muted-foreground">Mostrar en página principal</p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-habaluna-blue-dark text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

