"use client"

import { useEffect, useMemo, useState } from "react"
import { api, type BackendAdminReview } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Trash2, Pencil, Star, MessageSquare, CheckCircle2, Clock, Plus } from "lucide-react"

type ReviewRow = BackendAdminReview

function clampRating(v: number) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 5
  return Math.max(1, Math.min(5, Math.round(n)))
}

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [onlyApproved, setOnlyApproved] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [settingsLoading, setSettingsLoading] = useState(true)
  const [autoApproveReviews, setAutoApproveReviews] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ReviewRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createProductId, setCreateProductId] = useState("")
  const [createAuthorName, setCreateAuthorName] = useState("")
  const [createAuthorEmail, setCreateAuthorEmail] = useState("")
  const [createRating, setCreateRating] = useState(5)
  const [createTitle, setCreateTitle] = useState("")
  const [createContent, setCreateContent] = useState("")
  const [createPublishDirect, setCreatePublishDirect] = useState(true)

  const refresh = async () => {
    setIsLoading(true)
    setError("")
    try {
      const res = await api.getAdminReviews({
        page: 1,
        limit: 200,
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        ...(onlyApproved === null ? {} : { isApproved: onlyApproved }),
      })
      setReviews(res.data || [])
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudieron cargar las reseñas.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      refresh()
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, onlyApproved])

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadSettings = async () => {
      setSettingsLoading(true)
      try {
        const s = await api.getAdminReviewSettings()
        setAutoApproveReviews(!!s?.autoApproveReviews)
      } catch {
        // Si falla (no auth, etc) no bloqueamos la UI
      } finally {
        setSettingsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const stats = useMemo(() => {
    const total = reviews.length
    const approved = reviews.filter((r) => r.isApproved).length
    const pending = total - approved
    const avg =
      total > 0
        ? reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / total
        : 0
    return { total, approved, pending, avg }
  }, [reviews])

  const requestDelete = (r: ReviewRow) => {
    setDeleteTarget(r)
    setConfirmOpen(true)
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.deleteAdminReview(deleteTarget.id)
      setReviews((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      setConfirmOpen(false)
      setDeleteTarget(null)
      toast({ title: "Reseña eliminada" })
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || e?.message || "No se pudo eliminar la reseña.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleApproved = async (r: ReviewRow, next: boolean) => {
    // Optimista
    setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, isApproved: next } : x)))
    try {
      await api.updateAdminReview(r.id, { isApproved: next })
    } catch (e: any) {
      // Revertir
      setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, isApproved: r.isApproved } : x)))
      toast({
        title: "Error",
        description: e?.response?.data?.message || e?.message || "No se pudo actualizar el estado.",
        variant: "destructive",
      })
    }
  }

  const openEdit = (r: ReviewRow) => {
    setEditTarget({ ...r })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editTarget) return
    setEditSaving(true)
    try {
      const updated = await api.updateAdminReview(editTarget.id, {
        authorName: editTarget.authorName,
        authorEmail: editTarget.authorEmail ?? null,
        rating: clampRating(editTarget.rating),
        title: editTarget.title ?? null,
        content: editTarget.content,
        isApproved: editTarget.isApproved,
      })
      setReviews((prev) => prev.map((x) => (x.id === updated.id ? { ...(updated as any) } : x)))
      setEditOpen(false)
      setEditTarget(null)
      toast({ title: "Reseña actualizada" })
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || e?.message || "No se pudo guardar la reseña.",
        variant: "destructive",
      })
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reseñas</h1>
          <p className="text-muted-foreground mt-1">Aprueba, edita o elimina reseñas de productos</p>
        </div>
        <Button
          className="bg-linear-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva reseña
        </Button>
      </div>

      {/* Settings */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Auto-publicar reseñas de clientes</p>
              <p className="text-sm text-muted-foreground">
                Si está activo, las reseñas enviadas desde la página del producto se publican sin aprobación.
              </p>
            </div>
            <Switch
              disabled={settingsLoading}
              checked={autoApproveReviews}
              onCheckedChange={async (checked) => {
                setAutoApproveReviews(checked)
                try {
                  await api.updateAdminReviewSettings({ autoApproveReviews: checked })
                  toast({ title: "Configuración actualizada" })
                } catch (e: any) {
                  setAutoApproveReviews(!checked)
                  toast({
                    title: "Error",
                    description: e?.response?.data?.message || e?.message || "No se pudo guardar la configuración.",
                    variant: "destructive",
                  })
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary to-habaluna-blue-dark rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Aprobadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-habaluna-coral to-orange-400 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avg.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Rating medio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por autor, producto o contenido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Solo aprobadas</span>
                <Switch
                  checked={onlyApproved === true}
                  onCheckedChange={(checked) => setOnlyApproved(checked ? true : null)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-secondary/30">
          <CardTitle className="text-lg text-foreground">Lista de reseñas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold text-foreground">Producto</TableHead>
                  <TableHead className="font-semibold text-foreground">Autor</TableHead>
                  <TableHead className="font-semibold text-foreground">Rating</TableHead>
                  <TableHead className="font-semibold text-foreground">Estado</TableHead>
                  <TableHead className="font-semibold text-foreground">Fecha</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Cargando reseñas...
                    </TableCell>
                  </TableRow>
                ) : reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay reseñas para mostrar.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((r) => (
                    <TableRow key={r.id} className="hover:bg-secondary/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground line-clamp-1">{r.product?.name || r.productId}</span>
                          {r.product?.slug && <span className="text-xs text-muted-foreground">{r.product.slug}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{r.authorName}</span>
                          {r.authorEmail && <span className="text-xs text-muted-foreground">{r.authorEmail}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i}>{i < (Number(r.rating) || 0) ? "★" : "☆"}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={r.isApproved ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                            {r.isApproved ? "Aprobada" : "Pendiente"}
                          </Badge>
                          <Switch checked={r.isApproved} onCheckedChange={(checked) => toggleApproved(r, checked)} />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-ES") : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => requestDelete(r)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => !editSaving && setEditOpen(open)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar reseña</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Autor</Label>
                  <Input
                    value={editTarget.authorName}
                    onChange={(e) => setEditTarget({ ...editTarget, authorName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email (opcional)</Label>
                  <Input
                    value={editTarget.authorEmail || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, authorEmail: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rating (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={editTarget.rating}
                    onChange={(e) => setEditTarget({ ...editTarget, rating: clampRating(Number(e.target.value)) })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Título (opcional)</Label>
                  <Input
                    value={editTarget.title || ""}
                    onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <Textarea
                  rows={5}
                  value={editTarget.content}
                  onChange={(e) => setEditTarget({ ...editTarget, content: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">Aprobada</p>
                  <p className="text-xs text-muted-foreground">Solo las aprobadas se muestran en el producto</p>
                </div>
                <Switch
                  checked={editTarget.isApproved}
                  onCheckedChange={(checked) => setEditTarget({ ...editTarget, isApproved: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={editSaving}>
              {editSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !createSaving && setCreateOpen(open)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva reseña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID del producto</Label>
              <Input
                value={createProductId}
                onChange={(e) => setCreateProductId(e.target.value)}
                placeholder="Ej: 1a84b02d-aa86-4103-b694-a3e7f9046f35"
              />
              <p className="text-xs text-muted-foreground">
                Tip: puedes copiar el ID desde <strong>Admin → Productos</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input value={createAuthorName} onChange={(e) => setCreateAuthorName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email (opcional)</Label>
                <Input value={createAuthorEmail} onChange={(e) => setCreateAuthorEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Rating (1–5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={createRating}
                  onChange={(e) => setCreateRating(clampRating(Number(e.target.value)))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Título (opcional)</Label>
                <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contenido</Label>
              <Textarea rows={5} value={createContent} onChange={(e) => setCreateContent(e.target.value)} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="font-medium text-foreground">Publicar directo</p>
                <p className="text-xs text-muted-foreground">Se crea aprobada y aparece inmediatamente en el producto</p>
              </div>
              <Switch checked={createPublishDirect} onCheckedChange={setCreatePublishDirect} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSaving}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!createProductId.trim()) {
                  toast({ title: "Falta el ID del producto", variant: "destructive" })
                  return
                }
                if (!createAuthorName.trim()) {
                  toast({ title: "Falta el autor", variant: "destructive" })
                  return
                }
                if (!createContent.trim()) {
                  toast({ title: "Falta el contenido", variant: "destructive" })
                  return
                }
                setCreateSaving(true)
                try {
                  const created = await api.createAdminReview({
                    productId: createProductId.trim(),
                    authorName: createAuthorName.trim(),
                    authorEmail: createAuthorEmail.trim() ? createAuthorEmail.trim() : undefined,
                    rating: clampRating(createRating),
                    title: createTitle.trim() ? createTitle.trim() : undefined,
                    content: createContent.trim(),
                    isApproved: createPublishDirect,
                  })
                  setReviews((prev) => [created as any, ...prev])
                  setCreateOpen(false)
                  setCreateProductId("")
                  setCreateAuthorName("")
                  setCreateAuthorEmail("")
                  setCreateRating(5)
                  setCreateTitle("")
                  setCreateContent("")
                  setCreatePublishDirect(true)
                  toast({ title: "Reseña creada" })
                } catch (e: any) {
                  toast({
                    title: "Error",
                    description: e?.response?.data?.message || e?.message || "No se pudo crear la reseña.",
                    variant: "destructive",
                  })
                } finally {
                  setCreateSaving(false)
                }
              }}
              disabled={createSaving}
            >
              {createSaving ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar reseña</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar la reseña de "${deleteTarget.authorName}"?`
                : "¿Seguro que deseas eliminar esta reseña?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

