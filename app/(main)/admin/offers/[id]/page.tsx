"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api, type BackendAdminOffer, type BackendOfferType } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Percent, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export default function EditOfferPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const offerId = params?.id

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [offer, setOffer] = useState<BackendAdminOffer | null>(null)

  const [offerType, setOfferType] = useState<BackendOfferType>("PERCENTAGE")
  const [hasUsageLimit, setHasUsageLimit] = useState(false)
  const [hasMinPurchase, setHasMinPurchase] = useState(false)

  const [form, setForm] = useState({
    name: "",
    code: "",
    value: 0,
    startDate: "",
    endDate: "",
    usageLimit: 0,
    minPurchase: 0,
    isActive: true,
  })

  useEffect(() => {
    const load = async () => {
      if (!offerId) return
      setError("")
      setIsLoading(true)
      try {
        const data = await api.getAdminOffer(offerId)
        setOffer(data)
        setOfferType(data.type)
        setHasUsageLimit(Boolean(data.usageLimit))
        setHasMinPurchase(Boolean(data.minPurchase))
        setForm({
          name: data.name || "",
          code: data.code || "",
          value: parseNumber(data.value),
          startDate: new Date(data.startDate).toISOString().slice(0, 10),
          endDate: new Date(data.endDate).toISOString().slice(0, 10),
          usageLimit: data.usageLimit || 0,
          minPurchase: parseNumber(data.minPurchase),
          isActive: data.isActive,
        })
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "No se pudo cargar la oferta.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [offerId])

  const title = useMemo(() => offer?.name || "Editar oferta", [offer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerId) return
    setError("")
    setIsSaving(true)
    try {
      await api.updateOffer(offerId, {
        name: form.name,
        code: form.code,
        type: offerType,
        value: Number(form.value),
        startDate: form.startDate,
        endDate: form.endDate,
        usageLimit: hasUsageLimit ? Number(form.usageLimit) : null,
        minPurchase: hasMinPurchase ? Number(form.minPurchase) : null,
        isActive: form.isActive,
      })
      router.push("/admin/offers")
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo guardar la oferta.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/admin/offers">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">Actualiza la promoción o descuento</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-6 text-muted-foreground">Cargando...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-foreground">Información básica</CardTitle>
                  <CardDescription>Datos de la oferta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la oferta</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Descuento de verano"
                      className="bg-secondary/50 border-transparent focus:border-primary"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código promocional</Label>
                    <Input
                      id="code"
                      placeholder="SUMMER20"
                      className="bg-secondary/50 border-transparent focus:border-primary uppercase"
                      value={form.code}
                      onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">El código que usarán los clientes al comprar</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div>
                      <p className="font-medium text-foreground text-sm">Activa</p>
                      <p className="text-xs text-muted-foreground">Visible y aplicable</p>
                    </div>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-foreground">Tipo de descuento</CardTitle>
                  <CardDescription>Elige cómo aplicar el descuento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setOfferType("PERCENTAGE")}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        offerType === "PERCENTAGE" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-habaluna-coral to-orange-400 rounded-lg flex items-center justify-center mb-3">
                        <Percent className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-semibold text-foreground">Porcentaje</p>
                      <p className="text-sm text-muted-foreground">Descuento en %</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferType("FIXED")}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        offerType === "FIXED" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-habaluna-blue-dark rounded-lg flex items-center justify-center mb-3">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-semibold text-foreground">Cantidad fija</p>
                      <p className="text-sm text-muted-foreground">Descuento en €</p>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">Valor del descuento</Label>
                    <div className="relative">
                      <Input
                        id="value"
                        type="number"
                        placeholder="0"
                        className="bg-secondary/50 border-transparent focus:border-primary pr-10"
                        value={form.value}
                        onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))}
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {offerType === "PERCENTAGE" ? "%" : "€"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-foreground">Validez</CardTitle>
                  <CardDescription>Período de vigencia de la oferta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Fecha de inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        className="bg-secondary/50 border-transparent focus:border-primary"
                        value={form.startDate}
                        onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Fecha de fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        className="bg-secondary/50 border-transparent focus:border-primary"
                        value={form.endDate}
                        onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-foreground">Restricciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div>
                      <p className="font-medium text-foreground text-sm">Límite de usos</p>
                      <p className="text-xs text-muted-foreground">Máximo de veces</p>
                    </div>
                    <Switch checked={hasUsageLimit} onCheckedChange={setHasUsageLimit} />
                  </div>
                  {hasUsageLimit && (
                    <Input
                      type="number"
                      placeholder="100"
                      className="bg-secondary/50 border-transparent focus:border-primary animate-fade-in"
                      value={form.usageLimit}
                      onChange={(e) => setForm((p) => ({ ...p, usageLimit: Number(e.target.value) }))}
                    />
                  )}

                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div>
                      <p className="font-medium text-foreground text-sm">Compra mínima</p>
                      <p className="text-xs text-muted-foreground">Monto mínimo</p>
                    </div>
                    <Switch checked={hasMinPurchase} onCheckedChange={setHasMinPurchase} />
                  </div>
                  {hasMinPurchase && (
                    <div className="relative animate-fade-in">
                      <Input
                        type="number"
                        placeholder="50"
                        className="bg-secondary/50 border-transparent focus:border-primary pr-8"
                        value={form.minPurchase}
                        onChange={(e) => setForm((p) => ({ ...p, minPurchase: Number(e.target.value) }))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-habaluna-blue-dark/5">
                <CardContent className="p-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg h-12"
                  >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

