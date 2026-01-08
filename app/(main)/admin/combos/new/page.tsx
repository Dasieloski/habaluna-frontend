"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api, type BackendCategory, type BackendProduct } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, ImagePlus, Loader2, Save, X, Search, Boxes } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type SelectedItem = { productId: string; name: string; quantity: number }

export default function NewComboPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  const [images, setImages] = useState<string[]>([]) // previews
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [isOnSale, setIsOnSale] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [autoSlug, setAutoSlug] = useState(true)

  const nameRef = useRef<HTMLInputElement>(null)
  const slugRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const shortDescriptionRef = useRef<HTMLTextAreaElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)
  const comparePriceRef = useRef<HTMLInputElement>(null)
  const stockRef = useRef<HTMLInputElement>(null)
  const categoryIdRef = useRef<string>("")
  const statusRef = useRef<"active" | "draft" | "archived">("draft")

  // Cargar categoría "Combos" automáticamente
  useEffect(() => {
    const loadCombosCategory = async () => {
      try {
        const data = await api.getCategories()
        const combosCategory = data.find((c: BackendCategory) => c.name.toLowerCase() === "combos" || c.slug?.toLowerCase() === "combos")
        if (combosCategory) {
          categoryIdRef.current = combosCategory.id
        }
      } catch {
        // Si no se puede cargar, se manejará en el submit
      }
    }
    loadCombosCategory()
  }, [])

  // Selector de productos del combo
  const [productSearch, setProductSearch] = useState("")
  const [productResults, setProductResults] = useState<Array<{ id: string; name: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selected, setSelected] = useState<SelectedItem[]>([])


  const slugify = (input: string) => {
    return input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugRef.current) return
    const next = slugify(e.target.value)
    if (autoSlug) {
      slugRef.current.value = next
      if (error?.includes("slug")) setError(null)
      return
    }
    // modo manual: solo autocompletar si está vacío
    if (!slugRef.current.value) slugRef.current.value = next
  }

  const isSlugTaken = async (slug: string) => {
    try {
      await api.get(`/products/slug/${encodeURIComponent(slug)}`)
      return true
    } catch (e: any) {
      if (e?.status === 404) return false
      // error de red u otro => no bloquear
      return false
    }
  }

  const findAvailableSlug = async (baseSlug: string) => {
    const base = baseSlug.trim()
    if (!base) return ""
    if (!(await isSlugTaken(base))) return base
    for (let i = 2; i <= 50; i++) {
      const candidate = `${base}-${i}`
      if (!(await isSlugTaken(candidate))) return candidate
    }
    return `${base}-${Date.now()}`
  }

  const checkSlugAvailable = async () => {
    if (autoSlug) return
    const slug = (slugRef.current?.value || "").trim()
    if (!slug) return
    try {
      // Si existe, el backend responde 200 => slug ocupado
      await api.get(`/products/slug/${encodeURIComponent(slug)}`)
      setError(`El slug "${slug}" ya existe. Cambia el slug para poder crear el combo.`)
    } catch (e: any) {
      // 404 => disponible
      if (e?.status === 404) {
        if (error?.includes("slug")) setError(null)
        return
      }
      // Otros errores: no bloquear, pero mostrar si ya había error
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newFiles = Array.from(files)
    setImageFiles((prev) => [...prev, ...newFiles])
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => setImages((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const searchProducts = async () => {
    setIsSearching(true)
    try {
      const res = await api.getProducts({ page: 1, limit: 25, search: productSearch.trim(), isCombo: false })
      const list = (res.data || []).map((p: BackendProduct) => ({ id: p.id, name: p.name }))
      setProductResults(list)
    } catch {
      setProductResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (productSearch.trim().length >= 2) searchProducts()
      else setProductResults([])
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch])

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.productId)), [selected])

  const addSelected = (p: { id: string; name: string }) => {
    if (selectedIds.has(p.id)) return
    setSelected((prev) => [...prev, { productId: p.id, name: p.name, quantity: 1 }])
  }

  const removeSelected = (productId: string) => {
    setSelected((prev) => prev.filter((s) => s.productId !== productId))
  }

  const setQty = (productId: string, quantity: number) => {
    const q = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1
    setSelected((prev) => prev.map((s) => (s.productId === productId ? { ...s, quantity: q } : s)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      if (!nameRef.current?.value) throw new Error("El nombre del combo es requerido")
      if (!slugRef.current?.value) throw new Error("El slug es requerido")
      if (!descriptionRef.current?.value) throw new Error("La descripción es requerida")
      if (!stockRef.current?.value) throw new Error("El stock es requerido")
      if (selected.length === 0) throw new Error("Debes seleccionar al menos 1 producto para el combo")

      // Si no hay categoría asignada, buscar la categoría "Combos"
      if (!categoryIdRef.current) {
        const data = await api.getCategories()
        const combosCategory = data.find((c: BackendCategory) => c.name.toLowerCase() === "combos" || c.slug?.toLowerCase() === "combos")
        if (combosCategory) {
          categoryIdRef.current = combosCategory.id
        } else {
          throw new Error("No se encontró la categoría 'Combos'. Asegúrate de que existe en el sistema.")
        }
      }

      if (autoSlug && slugRef.current && nameRef.current) {
        const base = slugify(slugRef.current.value || nameRef.current.value)
        const available = await findAvailableSlug(base)
        slugRef.current.value = available
      }

      const uploadedImageUrls: string[] = []
      for (const file of imageFiles) {
        try {
          const imageUrl = await api.uploadImage(file)
          uploadedImageUrls.push(imageUrl)
        } catch {
          // ignore individual image
        }
      }

      await api.createProduct({
        name: nameRef.current.value,
        slug: slugRef.current.value,
        description: descriptionRef.current.value,
        shortDescription: shortDescriptionRef.current?.value || undefined,
        priceUSD: priceRef.current?.value ? parseFloat(priceRef.current.value) : undefined,
        comparePriceUSD: isOnSale ? (comparePriceRef.current?.value ? parseFloat(comparePriceRef.current.value) : undefined) : null,
        stock: parseInt(stockRef.current.value),
        categoryId: categoryIdRef.current,
        isActive: statusRef.current === "active",
        isFeatured,
        isCombo: true,
        comboItems: selected.map((s) => ({ productId: s.productId, quantity: s.quantity })),
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      } as any)

      toast({ title: "Éxito", description: "Combo creado correctamente" })
      router.push("/admin/combos")
    } catch (err: any) {
      const msg = err?.message || "Error al crear el combo."
      setError(msg)
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/admin/combos">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Nuevo combo</h1>
          <p className="text-muted-foreground mt-1">Crea un combo seleccionando los productos que lo componen</p>
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
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Información básica</CardTitle>
                <CardDescription>Datos principales del combo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del combo</Label>
                  <Input id="name" ref={nameRef} onChange={handleNameChange} required className="bg-secondary/50 border-transparent focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL amigable (slug)</Label>
                  <div className="flex items-center justify-between rounded-lg border p-3 mb-2">
                    <div>
                      <p className="text-sm font-medium">Generar automáticamente</p>
                      <p className="text-xs text-muted-foreground">
                        Si está activo, se genera desde el nombre y evita duplicados.
                      </p>
                    </div>
                    <Switch
                      checked={autoSlug}
                      onCheckedChange={(v) => {
                        setAutoSlug(v)
                        if (v && nameRef.current && slugRef.current) {
                          slugRef.current.value = slugify(nameRef.current.value || "")
                          if (error?.includes("slug")) setError(null)
                        }
                      }}
                    />
                  </div>
                  <Input
                    id="slug"
                    ref={slugRef}
                    required
                    onBlur={checkSlugAvailable}
                    disabled={autoSlug}
                    className="bg-secondary/50 border-transparent focus:border-primary"
                  />
                  {autoSlug && (
                    <p className="text-xs text-muted-foreground">
                      Slug: <span className="font-medium">{slugRef.current?.value || ""}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descripción corta (opcional)</Label>
                  <Textarea id="shortDescription" ref={shortDescriptionRef} rows={2} className="bg-secondary/50 border-transparent focus:border-primary resize-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" ref={descriptionRef} rows={4} required className="bg-secondary/50 border-transparent focus:border-primary resize-none" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Boxes className="w-5 h-5" />
                  Productos del combo
                </CardTitle>
                <CardDescription>Selecciona exactamente qué productos lleva el combo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos para agregar..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
                  />
                </div>

                {isSearching && <p className="text-sm text-muted-foreground">Buscando...</p>}

                {productResults.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-56 overflow-y-auto divide-y">
                      {productResults.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addSelected(p)}
                          disabled={selectedIds.has(p.id)}
                          className="w-full text-left px-4 py-3 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selected.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Seleccionados</Label>
                    <div className="space-y-2">
                      {selected.map((s) => (
                        <div key={s.productId} className="flex items-center gap-3 border rounded-lg p-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Qty</Label>
                            <Input
                              type="number"
                              value={s.quantity}
                              onChange={(e) => setQty(s.productId, Number(e.target.value))}
                              className="w-20 bg-secondary/50 border-transparent focus:border-primary"
                              min={1}
                            />
                          </div>
                          <Button variant="ghost" size="icon" type="button" onClick={() => removeSelected(s.productId)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aún no has agregado productos al combo.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Imágenes</CardTitle>
                <CardDescription>Sube imágenes del combo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Subir imágenes
                  </Button>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((src, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="preview" className="w-full h-28 object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Precio y stock</CardTitle>
                <CardDescription>Configura precio y disponibilidad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Precio (USD)</Label>
                  <Input ref={priceRef} type="number" step="0.01" className="bg-secondary/50 border-transparent focus:border-primary" />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">En oferta</p>
                    <p className="text-xs text-muted-foreground">Usa comparePrice para marcar descuento</p>
                  </div>
                  <Switch checked={isOnSale} onCheckedChange={setIsOnSale} />
                </div>

                {isOnSale && (
                  <div className="space-y-2">
                    <Label>Precio comparación (USD)</Label>
                    <Input ref={comparePriceRef} type="number" step="0.01" className="bg-secondary/50 border-transparent focus:border-primary" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input ref={stockRef} type="number" className="bg-secondary/50 border-transparent focus:border-primary" required />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Destacado</p>
                    <p className="text-xs text-muted-foreground">Mostrar como producto destacado</p>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select onValueChange={(v) => (statusRef.current = v as any)} defaultValue="draft">
                    <SelectTrigger className="bg-secondary/50 border-transparent focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isLoading ? "Guardando..." : "Crear combo"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

