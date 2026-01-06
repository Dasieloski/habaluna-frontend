"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, type BackendOfferType } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Percent, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NewOfferPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [offerType, setOfferType] = useState<BackendOfferType>("PERCENTAGE")
  const [hasUsageLimit, setHasUsageLimit] = useState(false)
  const [hasMinPurchase, setHasMinPurchase] = useState(false)
  const [error, setError] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await api.createOffer({
        name: form.name,
        code: form.code,
        type: offerType,
        value: Number(form.value),
        startDate: form.startDate,
        endDate: form.endDate,
        usageLimit: hasUsageLimit ? Number(form.usageLimit) : undefined,
        minPurchase: hasMinPurchase ? Number(form.minPurchase) : undefined,
        isActive: form.isActive,
      })
      router.push("/admin/offers")
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo crear la oferta.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/offers">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Nueva oferta</h1>
          <p className="text-muted-foreground mt-1">Crea una nueva promoción o descuento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
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
              </CardContent>
            </Card>

            {/* Discount type */}
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
                      offerType === "PERCENTAGE"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
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

            {/* Validity */}
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

          {/* Sidebar */}
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
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg h-12"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Creando...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear oferta
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
