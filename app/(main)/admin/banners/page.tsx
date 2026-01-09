"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { api, type BackendBanner } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Pencil, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Link as LinkIcon } from "lucide-react"

const getApiBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  return raw.replace(/\/api\/?$/, "")
}

function normalizeImageUrl(imagePath: string): string {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
  const base = getApiBaseUrl()
  if (imagePath.startsWith("/")) return `${base}${imagePath}`
  return `${base}/uploads/${imagePath}`
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  // YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string) {
  if (!value) return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

export default function AdminBannersPage() {
  const [items, setItems] = useState<BackendBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const [uiLoading, setUiLoading] = useState(true)
  const [uiSaving, setUiSaving] = useState(false)
  const [uiForm, setUiForm] = useState({
    headerAnnouncement: "Envíos a toda la Habana - Entrega rápida",
    h1: "Envío gratis +50€",
    h2: "30 días devolución",
    h3: "Pago seguro",
    h4: "4.8/5 valoración",
    b1Title: "VARIEDAD",
    b1Desc: "Encuentra desde alimentos hasta materiales de construcción, todo en un solo lugar.",
    b2Title: "DEVOLUCIONES GRATIS",
    b2Desc: "Tienes 30 días para devolver tu producto sin costo adicional.",
    b3Title: "ENTREGA RÁPIDA",
    b3Desc: "Tu pedido sale en menos de 24h y llega en tiempo récord.",
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BackendBanner | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BackendBanner | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    isActive: true,
    order: 0,
    startDate: "",
    endDate: "",
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [linkMode, setLinkMode] = useState<"none" | "combos" | "combo" | "product" | "custom">("none")
  const [comboOptions, setComboOptions] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [productOptions, setProductOptions] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [isLoadingLinkData, setIsLoadingLinkData] = useState(false)
  const [selectedComboId, setSelectedComboId] = useState<string>("")
  const [selectedProductId, setSelectedProductId] = useState<string>("")

  const refresh = async () => {
    setError("")
    setIsLoading(true)
    try {
      const data = await api.getAdminBanners()
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudieron cargar los banners.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadUi = async () => {
      setUiLoading(true)
      try {
        const s = await api.getAdminUiSettings()
        const highlights = Array.isArray((s as any)?.headerHighlights) ? (s as any).headerHighlights : []
        const benefits = Array.isArray((s as any)?.benefits) ? (s as any).benefits : []
        if (cancelled) return
        setUiForm((prev) => ({
          ...prev,
          headerAnnouncement: (s as any)?.headerAnnouncement || prev.headerAnnouncement,
          h1: String(highlights[0] || prev.h1),
          h2: String(highlights[1] || prev.h2),
          h3: String(highlights[2] || prev.h3),
          h4: String(highlights[3] || prev.h4),
          b1Title: String(benefits[0]?.title || prev.b1Title),
          b1Desc: String(benefits[0]?.description || prev.b1Desc),
          b2Title: String(benefits[1]?.title || prev.b2Title),
          b2Desc: String(benefits[1]?.description || prev.b2Desc),
          b3Title: String(benefits[2]?.title || prev.b3Title),
          b3Desc: String(benefits[2]?.description || prev.b3Desc),
        }))
      } catch (e: any) {
        if (!cancelled) {
          // Mostrar error pero no bloquear el resto de la página
          setError(e?.response?.data?.message || e?.message || "No se pudieron cargar los textos del sitio.")
        }
      } finally {
        if (!cancelled) setUiLoading(false)
      }
    }
    loadUi()
    return () => {
      cancelled = true
    }
  }, [])

  const saveUiTexts = async () => {
    setError("")
    setUiSaving(true)
    try {
      await api.updateAdminUiSettings({
        headerAnnouncement: uiForm.headerAnnouncement,
        headerHighlights: [uiForm.h1, uiForm.h2, uiForm.h3, uiForm.h4],
        benefits: [
          { title: uiForm.b1Title, description: uiForm.b1Desc },
          { title: uiForm.b2Title, description: uiForm.b2Desc },
          { title: uiForm.b3Title, description: uiForm.b3Desc },
        ],
      })
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudieron guardar los textos del sitio.")
    } finally {
      setUiSaving(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((b) => {
      const t = (b.title || "").toLowerCase()
      const d = (b.description || "").toLowerCase()
      return t.includes(q) || d.includes(q)
    })
  }, [items, search])

  const total = items.length
  const active = items.filter((b) => b.isActive).length

  const openNew = () => {
    setEditing(null)
    setForm({
      title: "",
      description: "",
      image: "",
      link: "",
      isActive: true,
      order: Math.max(0, ...items.map((x) => x.order || 0)) + 1,
      startDate: "",
      endDate: "",
    })
    setError("")
    setLinkMode("none")
    setSelectedComboId("")
    setSelectedProductId("")
    setDialogOpen(true)
  }

  const openEdit = (b: BackendBanner) => {
    setEditing(b)
    setForm({
      title: b.title || "",
      description: b.description || "",
      image: b.image || "",
      link: b.link || "",
      isActive: !!b.isActive,
      order: typeof b.order === "number" ? b.order : 0,
      startDate: toDatetimeLocal(b.startDate),
      endDate: toDatetimeLocal(b.endDate),
    })
    setError("")

    // Inferir modo link
    const link = (b.link || "").trim()
    if (!link) setLinkMode("none")
    else if (link === "/products?filter=combos") setLinkMode("combos")
    else setLinkMode("custom")

    setSelectedComboId("")
    setSelectedProductId("")
    setDialogOpen(true)
  }

  // Cargar datos para selector de links (combos/productos) solo cuando haga falta
  useEffect(() => {
    if (!dialogOpen) return
    if (linkMode !== "combo" && linkMode !== "product") return

    let cancelled = false
    const loadLinkData = async () => {
      setIsLoadingLinkData(true)
      try {
        const [combosRes, productsRes] = await Promise.all([
          api.getProducts({ page: 1, limit: 100, isCombo: true }),
          api.getProducts({ page: 1, limit: 100, isCombo: false }),
        ])
        if (cancelled) return
        setComboOptions((combosRes.data || []).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug })))
        setProductOptions((productsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug })))
      } catch {
        if (!cancelled) {
          setComboOptions([])
          setProductOptions([])
        }
      } finally {
        if (!cancelled) setIsLoadingLinkData(false)
      }
    }

    loadLinkData()
    return () => {
      cancelled = true
    }
  }, [dialogOpen, linkMode])

  useEffect(() => {
    // Ajustar form.link automáticamente según modo
    if (linkMode === "none") {
      setForm((p) => ({ ...p, link: "" }))
      return
    }
    if (linkMode === "combos") {
      setForm((p) => ({ ...p, link: "/products?filter=combos" }))
      return
    }
  }, [linkMode])

  const pickImage = async (file: File | null) => {
    if (!file) return
    setError("")
    try {
      const url = await api.uploadImage(file)
      setForm((p) => ({ ...p, image: url }))
    } catch (e: any) {
      setError(e?.message || "No se pudo subir la imagen.")
    }
  }

  const save = async () => {
    if (!form.title.trim()) {
      setError("El título es obligatorio.")
      return
    }
    if (!form.image.trim()) {
      setError("La imagen es obligatoria.")
      return
    }

    setIsSaving(true)
    setError("")
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        image: form.image.trim(),
        link: form.link.trim() || undefined,
        isActive: form.isActive,
        order: Number(form.order) || 0,
        startDate: fromDatetimeLocal(form.startDate),
        endDate: fromDatetimeLocal(form.endDate),
      }

      if (editing) {
        await api.updateBanner(editing.id, {
          ...payload,
          description: payload.description ?? null,
          link: payload.link ?? null,
          startDate: payload.startDate ?? null,
          endDate: payload.endDate ?? null,
        })
      } else {
        await api.createBanner(payload)
      }
      await refresh()
      setDialogOpen(false)
      setEditing(null)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo guardar el banner.")
    } finally {
      setIsSaving(false)
    }
  }

  const requestDelete = (b: BackendBanner) => {
    setDeleteTarget(b)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError("")
    try {
      await api.deleteBanner(deleteTarget.id)
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      setConfirmOpen(false)
      setDeleteTarget(null)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo eliminar el banner.")
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleActive = async (b: BackendBanner, checked: boolean) => {
    setItems((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive: checked } : x)))
    try {
      await api.updateBanner(b.id, { isActive: checked })
    } catch (e: any) {
      setItems((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive: !checked } : x)))
      setError(e?.response?.data?.message || e?.message || "No se pudo actualizar el estado.")
    }
  }

  const move = async (b: BackendBanner, dir: "up" | "down") => {
    const sorted = [...items].sort((a, c) => (a.order ?? 0) - (c.order ?? 0))
    const idx = sorted.findIndex((x) => x.id === b.id)
    const swapWith = dir === "up" ? sorted[idx - 1] : sorted[idx + 1]
    if (!swapWith) return

    // swap orders
    const aOrder = b.order ?? 0
    const bOrder = swapWith.order ?? 0

    setItems((prev) =>
      prev.map((x) => {
        if (x.id === b.id) return { ...x, order: bOrder }
        if (x.id === swapWith.id) return { ...x, order: aOrder }
        return x
      }),
    )

    try {
      await Promise.all([
        api.updateBanner(b.id, { order: bOrder }),
        api.updateBanner(swapWith.id, { order: aOrder }),
      ])
      await refresh()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo reordenar.")
      await refresh()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Carrusel principal</h1>
          <p className="text-muted-foreground mt-1">Gestiona los banners del hero (“Nueva colección premium”)</p>
        </div>
        <Button
          onClick={openNew}
          className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo banner
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-habaluna-blue-dark rounded-xl flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{active}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Textos del sitio (Header + Benefits) */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Textos del navbar y beneficios</h2>
            <p className="text-sm text-muted-foreground">
              Esto controla: el mensaje superior, la barra de highlights (4 items) y la sección de beneficios en la home.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Mensaje superior</Label>
            <Input
              value={uiForm.headerAnnouncement}
              onChange={(e) => setUiForm((p) => ({ ...p, headerAnnouncement: e.target.value }))}
              disabled={uiLoading || uiSaving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Highlight 1</Label>
              <Input value={uiForm.h1} onChange={(e) => setUiForm((p) => ({ ...p, h1: e.target.value }))} disabled={uiLoading || uiSaving} />
            </div>
            <div className="grid gap-2">
              <Label>Highlight 2</Label>
              <Input value={uiForm.h2} onChange={(e) => setUiForm((p) => ({ ...p, h2: e.target.value }))} disabled={uiLoading || uiSaving} />
            </div>
            <div className="grid gap-2">
              <Label>Highlight 3</Label>
              <Input value={uiForm.h3} onChange={(e) => setUiForm((p) => ({ ...p, h3: e.target.value }))} disabled={uiLoading || uiSaving} />
            </div>
            <div className="grid gap-2">
              <Label>Highlight 4</Label>
              <Input value={uiForm.h4} onChange={(e) => setUiForm((p) => ({ ...p, h4: e.target.value }))} disabled={uiLoading || uiSaving} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Beneficio 1</Label>
              <Input value={uiForm.b1Title} onChange={(e) => setUiForm((p) => ({ ...p, b1Title: e.target.value }))} disabled={uiLoading || uiSaving} />
              <Textarea value={uiForm.b1Desc} onChange={(e) => setUiForm((p) => ({ ...p, b1Desc: e.target.value }))} rows={3} disabled={uiLoading || uiSaving} />
            </div>
            <div className="space-y-2">
              <Label>Beneficio 2</Label>
              <Input value={uiForm.b2Title} onChange={(e) => setUiForm((p) => ({ ...p, b2Title: e.target.value }))} disabled={uiLoading || uiSaving} />
              <Textarea value={uiForm.b2Desc} onChange={(e) => setUiForm((p) => ({ ...p, b2Desc: e.target.value }))} rows={3} disabled={uiLoading || uiSaving} />
            </div>
            <div className="space-y-2">
              <Label>Beneficio 3</Label>
              <Input value={uiForm.b3Title} onChange={(e) => setUiForm((p) => ({ ...p, b3Title: e.target.value }))} disabled={uiLoading || uiSaving} />
              <Textarea value={uiForm.b3Desc} onChange={(e) => setUiForm((p) => ({ ...p, b3Desc: e.target.value }))} rows={3} disabled={uiLoading || uiSaving} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveUiTexts} disabled={uiLoading || uiSaving} className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg">
              {uiSaving ? "Guardando..." : "Guardar textos"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando banners...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No hay banners para mostrar.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((b) => {
                    const img = normalizeImageUrl(b.image)
                    return (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{b.order ?? 0}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => move(b, "up")}
                                className="h-8 w-8"
                                type="button"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => move(b, "down")}
                                className="h-8 w-8"
                                type="button"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="relative h-12 w-20 rounded-md overflow-hidden bg-muted">
                            <Image src={img} alt={b.title} fill sizes="80px" className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[240px]">
                            <div className="font-medium text-foreground">{b.title}</div>
                            {b.description ? <div className="text-xs text-muted-foreground line-clamp-2">{b.description}</div> : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={!!b.isActive} onCheckedChange={(v) => toggleActive(b, v)} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(b)} className="h-8 w-8" type="button">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => requestDelete(b)}
                              className="h-8 w-8 text-destructive"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar banner" : "Nuevo banner"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="grid gap-2">
              <Label>Subtítulo / Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Imagen *</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="/uploads/archivo.png o URL"
                  value={form.image}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickImage(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Subir
                </Button>
              </div>
              {form.image ? (
                <div className="relative h-40 w-full rounded-lg overflow-hidden bg-muted">
                  <Image src={normalizeImageUrl(form.image)} alt="preview" fill sizes="(max-width: 768px) 90vw, 640px" className="object-cover" />
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>Link (opcional)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <Select value={linkMode} onValueChange={(v: any) => setLinkMode(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tipo de link" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin link</SelectItem>
                      <SelectItem value="combos">Ir a lista de combos</SelectItem>
                      <SelectItem value="combo">Ir a un combo</SelectItem>
                      <SelectItem value="product">Ir a un producto</SelectItem>
                      <SelectItem value="custom">URL personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  {linkMode === "custom" && (
                    <Input value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} placeholder="/products/slug o URL" />
                  )}

                  {linkMode === "combos" && (
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <LinkIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">/products?filter=combos</span>
                    </div>
                  )}

                  {linkMode === "combo" && (
                    <Select
                      value={selectedComboId || undefined}
                      onValueChange={(val) => {
                        setSelectedComboId(val)
                        const picked = comboOptions.find((c) => c.id === val)
                        if (picked?.slug) setForm((p) => ({ ...p, link: `/products/${picked.slug}` }))
                      }}
                      disabled={isLoadingLinkData}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingLinkData ? "Cargando combos..." : "Selecciona un combo"} />
                      </SelectTrigger>
                      <SelectContent>
                        {comboOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {linkMode === "product" && (
                    <Select
                      value={selectedProductId || undefined}
                      onValueChange={(val) => {
                        setSelectedProductId(val)
                        const picked = productOptions.find((c) => c.id === val)
                        if (picked?.slug) setForm((p) => ({ ...p, link: `/products/${picked.slug}` }))
                      }}
                      disabled={isLoadingLinkData}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingLinkData ? "Cargando productos..." : "Selecciona un producto"} />
                      </SelectTrigger>
                      <SelectContent>
                        {productOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              {form.link ? <p className="text-xs text-muted-foreground">Link actual: {form.link}</p> : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Inicio (opcional)</Label>
                <Input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Fin (opcional)</Label>
                <Input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Activo</p>
                <p className="text-xs text-muted-foreground">Si está desactivado, no aparece en la home.</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar banner</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el banner seleccionado.
            </AlertDialogDescription>
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

