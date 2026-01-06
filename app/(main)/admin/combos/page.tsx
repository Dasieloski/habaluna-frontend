"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { api, type BackendProduct } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { Plus, Search, Trash2, ExternalLink, Boxes } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminCombosPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<BackendProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BackendProduct | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setError("")
    setLoading(true)
    try {
      const res = await api.getAdminProducts({ page: 1, limit: 200, ...(search.trim() ? { search: search.trim() } : {}), isCombo: true })
      // Doble filtro por seguridad (si el backend ignora el query param, aquí no se cuelan productos normales)
      setItems((res.data || []).filter((p: any) => !!p?.isCombo))
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudieron cargar los combos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q))
  }, [items, search])

  const requestDelete = (p: BackendProduct) => {
    setDeleteTarget(p)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError("")
    try {
      await api.deleteProduct(deleteTarget.id)
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      toast({ title: "Eliminado", description: "Combo eliminado correctamente." })
      setConfirmOpen(false)
      setDeleteTarget(null)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo eliminar el combo.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Combos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los combos (productos con composición)</p>
        </div>
        <Link href="/admin/combos/new">
          <Button className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo combo
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar combos por nombre o slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {error && <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">{error}</div>}

      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando combos...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No hay combos para mostrar.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {p.isActive ? "Sí" : "No"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${p.slug}`} target="_blank" className="inline-flex">
                          <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/combos/${p.id}`}>
                          <Button variant="secondary" size="sm" type="button">
                            Editar
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => requestDelete(p)} type="button">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar combo</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

