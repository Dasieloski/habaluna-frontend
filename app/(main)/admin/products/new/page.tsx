"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, X, Save, ImagePlus, Loader2 } from "lucide-react"
import { api, type BackendCategory } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { slugify } from "@/lib/slug"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<BackendCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [images, setImages] = useState<string[]>([]) // URLs de imágenes subidas
  const [imageFiles, setImageFiles] = useState<File[]>([]) // Archivos de imagen
  const [isOnSale, setIsOnSale] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSlug, setAutoSlug] = useState(true)
  
  // Refs para los campos del formulario
  const nameRef = useRef<HTMLInputElement>(null)
  const slugRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const shortDescriptionRef = useRef<HTMLTextAreaElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)
  const comparePriceRef = useRef<HTMLInputElement>(null)
  const stockRef = useRef<HTMLInputElement>(null)
  const categoryIdRef = useRef<string>("")
  // Por defecto, los productos nuevos deben quedar activos
  const statusRef = useRef<"active" | "draft" | "archived">("active")
  const [isFeatured, setIsFeatured] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const data = await api.getCategories()
      setCategories(data)
    } catch (err) {
      console.error("Error al cargar categorías:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Subir imágenes primero
      const uploadedImageUrls: string[] = []
      for (const file of imageFiles) {
        try {
          const imageUrl = await api.uploadImage(file)
          uploadedImageUrls.push(imageUrl)
        } catch (err) {
          console.error("Error al subir imagen:", err)
          // Continuar aunque falle una imagen
        }
      }

      // Crear el objeto del producto
      const productData = {
        name: nameRef.current.value,
        slug: slugRef.current.value,
        description: descriptionRef.current.value,
        shortDescription: shortDescriptionRef.current?.value || undefined,
        priceUSD: priceRef.current?.value ? parseFloat(priceRef.current.value) : undefined,
        // Si no está en oferta, enviar null para evitar guardar un comparePrice por accidente
        comparePriceUSD: isOnSale
          ? (comparePriceRef.current?.value ? parseFloat(comparePriceRef.current.value) : undefined)
          : null,
        stock: parseInt(stockRef.current.value),
        categoryId: categoryIdRef.current,
        isActive: statusRef.current === "active",
        isFeatured: isFeatured,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      }

      // Enviar al backend
      await api.createProduct(productData)

      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      })

      router.push("/admin/products")
    } catch (err: any) {
      console.error("Error al crear producto:", err)
      const errorMessage = err.message || "Error al crear el producto. Por favor, intenta de nuevo."
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
    setImages(images.filter((_, i) => i !== index))
    setImageFiles(imageFiles.filter((_, i) => i !== index))
  }

  // Generar slug automáticamente desde el nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!nameRef.current || !slugRef.current) return
    if (autoSlug) {
      slugRef.current.value = slugify(e.target.value)
    } else if (!slugRef.current.value) {
      slugRef.current.value = slugify(e.target.value)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Nuevo producto</h1>
          <p className="text-muted-foreground mt-1">Añade un nuevo producto a tu catálogo</p>
        </div>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Información básica</CardTitle>
                <CardDescription>Datos principales del producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto</Label>
                  <Input
                    id="name"
                    ref={nameRef}
                    placeholder="Ej: Aceite de Oliva Virgen Extra"
                    className="bg-secondary/50 border-transparent focus:border-primary"
                    onChange={handleNameChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL amigable (slug)</Label>
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
                    id="slug"
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
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descripción corta (opcional)</Label>
                  <Textarea
                    id="shortDescription"
                    ref={shortDescriptionRef}
                    placeholder="Una breve descripción del producto..."
                    rows={2}
                    className="bg-secondary/50 border-transparent focus:border-primary resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    ref={descriptionRef}
                    placeholder="Describe el producto en detalle..."
                    rows={4}
                    className="bg-secondary/50 border-transparent focus:border-primary resize-none"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Imágenes</CardTitle>
                <CardDescription>Añade fotos del producto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-xl bg-secondary overflow-hidden group">
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
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
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
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Precios</CardTitle>
                <CardDescription>Configura el precio de venta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="price">Precio (USD)</Label>
                    <Input
                      id="price"
                      ref={priceRef}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                      className="bg-secondary/50 border-transparent focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock disponible</Label>
                    <Input
                      id="stock"
                      ref={stockRef}
                      type="number"
                      placeholder="0"
                      min="0"
                      className="bg-secondary/50 border-transparent focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">En oferta</p>
                    <p className="text-sm text-muted-foreground">Mostrar el producto como oferta (requiere precio original)</p>
                  </div>
                  <Switch checked={isOnSale} onCheckedChange={setIsOnSale} />
                </div>
                {isOnSale && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="comparePrice">Precio original (USD)</Label>
                    <Input
                      id="comparePrice"
                      ref={comparePriceRef}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                      className="bg-secondary/50 border-transparent focus:border-primary"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  defaultValue="active"
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
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      categoryIdRef.current = value
                    }}
                    required
                  >
                    <SelectTrigger className="bg-secondary/50 border-transparent">
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
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Destacado</CardTitle>
                <CardDescription>Mostrar en la página principal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Producto destacado</p>
                    <p className="text-sm text-muted-foreground">Aparecerá en la página principal</p>
                  </div>
                  <Switch
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-habaluna-blue-dark/5">
              <CardContent className="p-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg h-12"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar producto
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
