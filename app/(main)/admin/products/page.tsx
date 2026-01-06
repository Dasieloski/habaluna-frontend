"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { type Product } from "@/lib/mock-data"
import { api, mapBackendProductToFrontend } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Filter, Package, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductViewDialog } from "@/components/admin/product-view-dialog"
import { ProductEditDialog } from "@/components/admin/product-edit-dialog"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { api as apiClient, type BackendCategory } from "@/lib/api"
import { Badge as FilterBadge } from "@/components/ui/badge"

const statusConfig = {
  active: { label: "Activo", className: "bg-green-100 text-green-700 border-green-200" },
  draft: { label: "Borrador", className: "bg-amber-100 text-amber-700 border-amber-200" },
  archived: { label: "Archivado", className: "bg-gray-100 text-gray-700 border-gray-200" },
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([]) // Para calcular stats
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  
  // Filtros
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<boolean | null>(null)
  const [categories, setCategories] = useState<BackendCategory[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts()
    }, 300) // Debounce para búsqueda
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedStatus, selectedCategory, isFeaturedFilter])

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories()
      setCategories(data)
    } catch (err) {
      console.error("Error al cargar categorías:", err)
    }
  }

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Construir parámetros de filtrado
      const params: any = {
        limit: 200, // Cargar muchos productos
      }
      
      // Agregar búsqueda si existe
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      
      // Agregar filtro de categoría
      if (selectedCategory !== "all") {
        params.categoryId = selectedCategory
      }
      
      // Agregar filtro de destacados
      if (isFeaturedFilter !== null) {
        params.isFeatured = isFeaturedFilter
      }
      
      const response = await api.getProducts(params)
      
      // Mapear productos del backend al formato del frontend
      const mappedProducts = response.data.map(mapBackendProductToFrontend)
      
      // Si hay filtro de estado, aplicarlo en el frontend (el backend solo filtra por isActive)
      let filtered = mappedProducts
      if (selectedStatus !== "all") {
        filtered = mappedProducts.filter((p) => {
          if (selectedStatus === "active") return p.status === "active"
          if (selectedStatus === "draft") return p.status === "draft"
          if (selectedStatus === "archived") return p.status === "archived"
          return true
        })
      }
      
      setProducts(filtered)
      setAllProducts(mappedProducts) // Guardar todos para las stats
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError("Error al cargar los productos. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const activeFiltersCount = () => {
    let count = 0
    if (selectedStatus !== "all") count++
    if (selectedCategory !== "all") count++
    if (isFeaturedFilter !== null) count++
    return count
  }

  const clearFilters = () => {
    setSelectedStatus("all")
    setSelectedCategory("all")
    setIsFeaturedFilter(null)
    setSearchQuery("")
  }

  const handleDelete = async () => {
    if (!deleteProduct) return

    try {
      await api.deleteProduct(deleteProduct.id)
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      })
      // Recargar productos
      await loadProducts()
      setDeleteProduct(null)
    } catch (err: any) {
      console.error("Error al eliminar producto:", err)
      toast({
        title: "Error",
        description: err.response?.data?.message || "Error al eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const handleEditSuccess = async () => {
    // Recargar productos después de editar
    await loadProducts()
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadProducts} variant="outline">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu catálogo de productos</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo producto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-habaluna-blue-dark rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{allProducts.length}</p>
                <p className="text-xs text-muted-foreground">Total productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {allProducts.filter((p) => p.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{allProducts.filter((p) => p.stock === 0).length}</p>
                <p className="text-xs text-muted-foreground">Sin stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-habaluna-coral to-orange-400 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{allProducts.filter((p) => p.comparePriceUSD).length}</p>
                <p className="text-xs text-muted-foreground">En oferta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
              />
            </div>
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent relative">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {activeFiltersCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount()}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">Filtros</h4>
                    {activeFiltersCount() > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpiar todo
                      </Button>
                    )}
                  </div>
                  
                  {/* Filtro por Estado */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estado</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="bg-secondary/50 border-transparent">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Categoría */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Categoría</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-secondary/50 border-transparent">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Destacados */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Destacados</Label>
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">Solo destacados</p>
                        <p className="text-xs text-muted-foreground">Mostrar solo productos destacados</p>
                      </div>
                      <Switch
                        checked={isFeaturedFilter === true}
                        onCheckedChange={(checked) => setIsFeaturedFilter(checked ? true : null)}
                      />
                    </div>
                  </div>

                  {/* Mostrar filtros activos */}
                  {activeFiltersCount() > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Filtros activos:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedStatus !== "all" && (
                          <FilterBadge variant="secondary" className="text-xs">
                            Estado: {statusConfig[selectedStatus as "active" | "draft" | "archived"]?.label || selectedStatus}
                            <button
                              onClick={() => setSelectedStatus("all")}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </FilterBadge>
                        )}
                        {selectedCategory !== "all" && (
                          <FilterBadge variant="secondary" className="text-xs">
                            {categories.find(c => c.id === selectedCategory)?.name || "Categoría"}
                            <button
                              onClick={() => setSelectedCategory("all")}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </FilterBadge>
                        )}
                        {isFeaturedFilter === true && (
                          <FilterBadge variant="secondary" className="text-xs">
                            Destacados
                            <button
                              onClick={() => setIsFeaturedFilter(null)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </FilterBadge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-secondary/30">
          <CardTitle className="text-lg text-foreground">Lista de productos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold text-foreground">Producto</TableHead>
                  <TableHead className="font-semibold text-foreground">Categoría</TableHead>
                  <TableHead className="font-semibold text-foreground">Precio</TableHead>
                  <TableHead className="font-semibold text-foreground">Stock</TableHead>
                  <TableHead className="font-semibold text-foreground">Estado</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos con los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: Product) => (
                  <TableRow key={product.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">€{product.priceUSD.toFixed(2)}</span>
                        {product.comparePriceUSD && (
                          <span className="text-xs text-muted-foreground line-through">
                            €{product.comparePriceUSD.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-medium",
                          product.stock === 0
                            ? "text-red-500"
                            : product.stock < 20
                              ? "text-amber-500"
                              : "text-foreground",
                        )}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[product.status].className}>
                        {statusConfig[product.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewProduct(product)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditProduct(product)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteProduct(product)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProductViewDialog
        product={viewProduct}
        open={!!viewProduct}
        onOpenChange={(open) => !open && setViewProduct(null)}
      />

      <ProductEditDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto{" "}
              <strong>{deleteProduct?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
