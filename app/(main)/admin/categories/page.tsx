"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { api, type BackendAdminCategory } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDescriptionBase,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Pencil, Trash2, FolderTree, Package, Image as ImageIcon } from "lucide-react"

type CategoryRow = BackendAdminCategory & { productCount: number }

const getApiBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  return raw.replace(/\/api\/?$/, "")
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function CategoriesContent() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null)

  // Asociación de productos (solo en edición)
  const [productSearch, setProductSearch] = useState("")
  const [productResults, setProductResults] = useState<{ id: string; name: string; categoryId: string }[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Quitar productos de la categoría actual => mover a "Sin categoría"
  const [removeSearch, setRemoveSearch] = useState("")
  const [removeResults, setRemoveResults] = useState<{ id: string; name: string; categoryId: string }[]>([])
  const [removeSelectedProductIds, setRemoveSelectedProductIds] = useState<string[]>([])
  const [isSearchingRemove, setIsSearchingRemove] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [categories, searchQuery],
  )

  const refreshCategories = async () => {
    setError("")
    setIsLoading(true)
    try {
      const data = await api.getAdminCategories()
      const mapped: CategoryRow[] = (data || []).map((c) => ({
        ...c,
        productCount: c._count?.products ?? 0,
      }))
      setCategories(mapped)
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar las categorías.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCategories()
  }, [])

  const handleSave = async () => {
    setError("")
    setIsSaving(true)
    try {
      const payload = {
        name: newCategory.name,
        slug: newCategory.slug || slugify(newCategory.name),
        description: newCategory.description || undefined,
        image: newCategory.image || undefined,
      }

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload)
      } else {
        await api.createCategory(payload)
      }

      await refreshCategories()
      setIsDialogOpen(false)
      setNewCategory({ name: "", slug: "", description: "", image: "" })
      setEditingCategory(null)
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar la categoría.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (category: CategoryRow) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name ?? "",
      slug: category.slug ?? slugify(category.name ?? ""),
      description: category.description ?? "",
      image: category.image ?? "",
    })
    setError("")
    setProductSearch("")
    setProductResults([])
    setSelectedProductIds([])
    setRemoveSearch("")
    setRemoveResults([])
    setRemoveSelectedProductIds([])
    setIsDialogOpen(true)
  }

  const handleDelete = (category: CategoryRow) => {
    setError("")
    setDeleteTarget(category)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async (mode: "delete_with_products" | "move_products_to_uncategorized") => {
    if (!deleteTarget) return
    setError("")
    setIsDeletingId(deleteTarget.id)
    try {
      await api.deleteCategory(deleteTarget.id, mode)
      await refreshCategories()
      setIsDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch (e: any) {
      setError(e?.message || "No se pudo eliminar la categoría.")
    } finally {
      setIsDeletingId(null)
    }
  }

  const openNewDialog = () => {
    setEditingCategory(null)
    setNewCategory({ name: "", slug: "", description: "", image: "" })
    setError("")
    setProductSearch("")
    setProductResults([])
    setSelectedProductIds([])
    setRemoveSearch("")
    setRemoveResults([])
    setRemoveSelectedProductIds([])
    setIsDialogOpen(true)
  }

  const onPickImage = async (file: File | null) => {
    if (!file) return
    setError("")
    try {
      const url = await api.uploadImage(file)
      setNewCategory((prev) => ({ ...prev, image: url }))
    } catch (e: any) {
      setError(e?.message || "No se pudo subir la imagen.")
    }
  }

  const searchProducts = async () => {
    if (!editingCategory) return
    setError("")
    setIsSearchingProducts(true)
    try {
      const res = await api.getProducts({ search: productSearch, limit: 12, page: 1 })
      const items = (res?.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
      }))
      setProductResults(items)
    } catch (e: any) {
      setError(e?.message || "No se pudieron buscar productos.")
    } finally {
      setIsSearchingProducts(false)
    }
  }

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const assignSelectedProducts = async () => {
    if (!editingCategory) return
    if (selectedProductIds.length === 0) return
    setError("")
    setIsAssigning(true)
    try {
      await api.assignProductsToCategory(editingCategory.id, selectedProductIds)
      await refreshCategories()
      setSelectedProductIds([])
      setProductResults([])
      setProductSearch("")
    } catch (e: any) {
      setError(e?.message || "No se pudieron asociar los productos.")
    } finally {
      setIsAssigning(false)
    }
  }

  const searchProductsToRemove = async () => {
    if (!editingCategory) return
    setError("")
    setIsSearchingRemove(true)
    try {
      const res = await api.getProducts({
        search: removeSearch,
        categoryId: editingCategory.id,
        limit: 12,
        page: 1,
      })
      const items = (res?.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
      }))
      setRemoveResults(items)
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los productos de esta categoría.")
    } finally {
      setIsSearchingRemove(false)
    }
  }

  const toggleRemoveProduct = (id: string) => {
    setRemoveSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const removeSelectedProducts = async () => {
    if (!editingCategory) return
    if (removeSelectedProductIds.length === 0) return
    setError("")
    setIsRemoving(true)
    try {
      const uncategorized = await api.getUncategorizedCategory()
      await api.assignProductsToCategory(uncategorized.id, removeSelectedProductIds)
      await refreshCategories()
      setRemoveSelectedProductIds([])
      setRemoveResults([])
      setRemoveSearch("")
    } catch (e: any) {
      setError(e?.message || "No se pudieron quitar los productos (Sin categoría).")
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-xl lg:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
            <AlertDialogDescriptionBase className="wrap-break-word">
              {deleteTarget ? (
                <div className="space-y-1">
                  <p>
                    Estás por eliminar{" "}
                    <span className="font-semibold text-foreground wrap-break-word">{deleteTarget.name}</span>.
                  </p>
                  <p>
                    Productos asociados:{" "}
                    <span className="font-semibold text-foreground">{deleteTarget.productCount}</span>
                  </p>
                </div>
              ) : (
                "Selecciona una categoría para eliminar."
              )}
            </AlertDialogDescriptionBase>
          </AlertDialogHeader>

          <div className="rounded-lg border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">¿Qué hacemos con los productos?</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li className="wrap-break-word">
                <span className="font-medium text-foreground">Eliminar todo</span>: borra la categoría y sus productos.
              </li>
              <li className="wrap-break-word">
                <span className="font-medium text-foreground">Mover a “Sin categoría”</span>: borra la categoría y mueve
                sus productos a “Sin categoría” dejándolos inactivos.
              </li>
            </ul>
          </div>

          <AlertDialogFooter className="sm:flex-row sm:flex-wrap sm:justify-end">
            <AlertDialogCancel className="w-full sm:w-auto sm:mr-auto" disabled={!!isDeletingId}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete("move_products_to_uncategorized")
              }}
              className="w-full sm:flex-1 sm:min-w-64 whitespace-normal text-center leading-snug bg-linear-to-r from-primary to-habaluna-blue-dark text-primary-foreground"
              disabled={!deleteTarget || !!isDeletingId}
            >
              {isDeletingId ? "Procesando..." : "Eliminar y mover a “Sin categoría”"}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete("delete_with_products")
              }}
              className="w-full sm:flex-1 sm:min-w-64 whitespace-normal text-center leading-snug bg-linear-to-r from-destructive to-habaluna-coral text-destructive-foreground"
              disabled={!deleteTarget || !!isDeletingId}
            >
              {isDeletingId ? "Procesando..." : "Eliminar categoría y productos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Categorías</h1>
          <p className="text-muted-foreground mt-1">Organiza tus productos por categorías</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openNewDialog}
              className="bg-linear-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Modifica los datos de la categoría"
                  : "Añade una nueva categoría para tus productos"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nombre</Label>
                <Input
                  id="cat-name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: prev.slug ? prev.slug : slugify(e.target.value),
                    }))
                  }
                  placeholder="Ej: Aceites"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="ej: aceites-vinagres"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Descripción</Label>
                <Textarea
                  id="cat-desc"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Describe la categoría..."
                  className="bg-secondary/50 border-transparent focus:border-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Foto</Label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center overflow-hidden border border-border">
                    {newCategory.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          newCategory.image.startsWith("/uploads/")
                            ? `${getApiBaseUrl()}${newCategory.image}`
                            : newCategory.image
                        }
                        alt="Categoría"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                    className="bg-secondary/50 border-transparent focus:border-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">La imagen se sube al backend y se guarda en uploads.</p>
              </div>

              {editingCategory && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Asociar productos</Label>
                    <span className="text-xs text-muted-foreground">Mueve productos a esta categoría</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar productos..."
                      className="bg-secondary/50 border-transparent focus:border-primary"
                    />
                    <Button type="button" variant="outline" onClick={searchProducts} disabled={isSearchingProducts}>
                      {isSearchingProducts ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>

                  {productResults.length > 0 && (
                    <div className="max-h-44 overflow-auto rounded-lg border border-border bg-secondary/20">
                      <div className="p-2 space-y-1">
                        {productResults.map((p) => {
                          const checked = selectedProductIds.includes(p.id)
                          const alreadyHere = p.categoryId === editingCategory.id
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleProduct(p.id)}
                              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-secondary/60 text-left"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {alreadyHere ? "Ya está en esta categoría" : "Se moverá a esta categoría"}
                                </p>
                              </div>
                              <span
                                className={[
                                  "text-xs px-2 py-1 rounded-full border",
                                  checked
                                    ? "bg-primary/15 border-primary/30 text-primary"
                                    : "bg-background border-border text-muted-foreground",
                                ].join(" ")}
                              >
                                {checked ? "Seleccionado" : "Seleccionar"}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Seleccionados: <span className="font-semibold text-foreground">{selectedProductIds.length}</span>
                    </p>
                    <Button
                      type="button"
                      onClick={assignSelectedProducts}
                      disabled={isAssigning || selectedProductIds.length === 0}
                      className="bg-linear-to-r from-primary to-habaluna-blue-dark text-primary-foreground"
                    >
                      {isAssigning ? "Asociando..." : "Asociar seleccionados"}
                    </Button>
                  </div>
                </div>
              )}

              {editingCategory && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center justify-between pt-4">
                    <Label>Quitar productos de esta categoría</Label>
                    <span className="text-xs text-muted-foreground">
                      Se moverán a “Sin categoría” y quedarán inactivos
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={removeSearch}
                      onChange={(e) => setRemoveSearch(e.target.value)}
                      placeholder="Buscar dentro de esta categoría..."
                      className="bg-secondary/50 border-transparent focus:border-primary"
                    />
                    <Button type="button" variant="outline" onClick={searchProductsToRemove} disabled={isSearchingRemove}>
                      {isSearchingRemove ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>

                  {removeResults.length > 0 && (
                    <div className="max-h-44 overflow-auto rounded-lg border border-border bg-secondary/20">
                      <div className="p-2 space-y-1">
                        {removeResults.map((p) => {
                          const checked = removeSelectedProductIds.includes(p.id)
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleRemoveProduct(p.id)}
                              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-secondary/60 text-left"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                                <p className="text-xs text-muted-foreground">Mover a “Sin categoría” (inactivo)</p>
                              </div>
                              <span
                                className={[
                                  "text-xs px-2 py-1 rounded-full border",
                                  checked
                                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                                    : "bg-background border-border text-muted-foreground",
                                ].join(" ")}
                              >
                                {checked ? "Seleccionado" : "Seleccionar"}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Seleccionados:{" "}
                      <span className="font-semibold text-foreground">{removeSelectedProductIds.length}</span>
                    </p>
                    <Button
                      type="button"
                      onClick={removeSelectedProducts}
                      disabled={isRemoving || removeSelectedProductIds.length === 0}
                      className="bg-linear-to-r from-destructive to-habaluna-coral text-destructive-foreground"
                    >
                      {isRemoving ? "Quitando..." : "Quitar seleccionados"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-linear-to-r from-primary to-habaluna-blue-dark text-primary-foreground"
              >
                {isSaving ? "Guardando..." : editingCategory ? "Guardar cambios" : "Crear categoría"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary to-habaluna-blue-dark rounded-xl flex items-center justify-center">
                <FolderTree className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                <p className="text-xs text-muted-foreground">Total categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-habaluna-mint to-teal-400 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {categories.reduce((acc, cat) => acc + cat.productCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Productos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-habaluna-yellow to-amber-400 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {categories.length > 0
                    ? Math.round(categories.reduce((acc, cat) => acc + cat.productCount, 0) / categories.length)
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">Promedio por categoría</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="border-0 shadow-md col-span-1 sm:col-span-2 lg:col-span-3">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Cargando categorías...</p>
            </CardContent>
          </Card>
        ) : filteredCategories.length === 0 ? (
          <Card className="border-0 shadow-md col-span-1 sm:col-span-2 lg:col-span-3">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">No hay categorías para mostrar.</p>
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category, index) => (
          <Card
            key={category.id}
            className="border-0 shadow-md hover-lift transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-habaluna-blue-dark/20 rounded-xl flex items-center justify-center">
                  <FolderTree className="w-6 h-6 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(category)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(category)}
                    disabled={isDeletingId === category.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground text-lg">{category.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Productos</span>
                  <span className="font-semibold text-foreground">{category.productCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesContent />
    </Suspense>
  )
}
