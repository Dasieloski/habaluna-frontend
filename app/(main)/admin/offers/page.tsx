"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { api, type BackendAdminOffer } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Copy, Percent, Tag, Calendar, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig = {
  active: { label: "Activa", className: "bg-green-100 text-green-700 border-green-200" },
  scheduled: { label: "Programada", className: "bg-blue-100 text-blue-700 border-blue-200" },
  expired: { label: "Expirada", className: "bg-gray-100 text-gray-700 border-gray-200" },
}

type OfferRow = BackendAdminOffer & {
  status: "active" | "scheduled" | "expired"
}

function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function computeStatus(offer: BackendAdminOffer): OfferRow["status"] {
  if (!offer.isActive) return "expired"
  const now = new Date()
  const start = new Date(offer.startDate)
  const end = new Date(offer.endDate)
  if (start > now) return "scheduled"
  if (end < now) return "expired"
  return "active"
}

function OffersContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [offers, setOffers] = useState<OfferRow[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OfferRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const refreshOffers = async () => {
    setError("")
    setIsLoading(true)
    try {
      const res = await api.getAdminOffers({ page: 1, limit: 100 })
      const rows: OfferRow[] = (res?.data || []).map((o) => ({
        ...o,
        status: computeStatus(o),
      }))
      setOffers(rows)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudieron cargar las ofertas.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshOffers()
  }, [])

  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return offers
    return offers.filter((offer) => {
      const name = (offer.name || "").toLowerCase()
      const code = (offer.code || "").toLowerCase()
      return name.includes(q) || code.includes(q)
    })
  }, [offers, searchQuery])

  const activeOffers = offers.filter((o) => o.status === "active").length
  const totalUsage = offers.reduce((acc, o) => acc + o.usageCount, 0)

  const requestDelete = (offer: OfferRow) => {
    setDeleteTarget(offer)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError("")
    try {
      await api.deleteOffer(deleteTarget.id)
      setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id))
      setConfirmOpen(false)
      setDeleteTarget(null)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo eliminar la oferta.")
    } finally {
      setIsDeleting(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Ofertas</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus promociones y descuentos</p>
        </div>
        <Link href="/admin/offers/new">
          <Button className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nueva oferta
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-habaluna-blue-dark rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{offers.length}</p>
                <p className="text-xs text-muted-foreground">Total ofertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Percent className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeOffers}</p>
                <p className="text-xs text-muted-foreground">Ofertas activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-habaluna-coral to-orange-400 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalUsage}</p>
                <p className="text-xs text-muted-foreground">Usos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-habaluna-yellow to-amber-400 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {offers.filter((o) => o.status === "scheduled").length}
                </p>
                <p className="text-xs text-muted-foreground">Programadas</p>
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
              placeholder="Buscar por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Offers grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center text-muted-foreground">Cargando ofertas...</CardContent>
          </Card>
        )}

        {!isLoading && filteredOffers.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center text-muted-foreground">No hay ofertas para mostrar.</CardContent>
          </Card>
        )}

        {filteredOffers.map((offer, index) => (
          <Card
            key={offer.id}
            className="border-0 shadow-md hover-lift transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        offer.type === "PERCENTAGE"
                          ? "bg-gradient-to-br from-habaluna-coral to-orange-400"
                          : "bg-gradient-to-br from-primary to-habaluna-blue-dark",
                      )}
                    >
                      <span className="text-lg font-bold text-white">
                        {offer.type === "PERCENTAGE" ? `${parseNumber(offer.value)}%` : `€${parseNumber(offer.value)}`}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{offer.name}</h3>
                      <button
                        onClick={() => copyCode(offer.code)}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Copy className="w-3 h-3" />
                        {offer.code}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusConfig[offer.status].className}>
                      {statusConfig[offer.status].label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/offers/${offer.id}`}>
                          <DropdownMenuItem>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => copyCode(offer.code)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar código
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => requestDelete(offer)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Válida</span>
                    <span>
                      {new Date(offer.startDate).toLocaleDateString("es-ES")} -{" "}
                      {new Date(offer.endDate).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  {offer.minPurchase && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Compra mínima</span>
                      <span>€{parseNumber(offer.minPurchase)}</span>
                    </div>
                  )}
                  {offer.usageLimit && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Usos</span>
                        <span>
                          {offer.usageCount} / {offer.usageLimit}
                        </span>
                      </div>
                      <Progress value={(offer.usageCount / offer.usageLimit) * 100} className="h-2" />
                    </div>
                  )}
                  {!offer.usageLimit && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Usos</span>
                      <span>{offer.usageCount} (sin límite)</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar oferta</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `¿Seguro que deseas eliminar "${deleteTarget.name}"?` : "¿Seguro que deseas eliminar esta oferta?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function OffersPage() {
  return (
    <Suspense fallback={null}>
      <OffersContent />
    </Suspense>
  )
}
