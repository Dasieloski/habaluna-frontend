"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { api, type BackendAdminCustomer } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  UserX,
  UserCheck,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CustomerRow = BackendAdminCustomer

function getCustomerName(c: CustomerRow) {
  const full = `${c.firstName || ""} ${c.lastName || ""}`.trim()
  if (full) return full
  return c.email?.split("@")[0] || "Cliente"
}

function CustomersContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [profileOpen, setProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileData, setProfileData] = useState<any | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<CustomerRow | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  const refreshCustomers = async () => {
    setError("")
    setIsLoading(true)
    try {
      const res = await api.getAdminCustomers({ page: 1, limit: 100 })
      setCustomers(res?.data || [])
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudieron cargar los clientes.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCustomers()
  }, [])

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => {
      const name = getCustomerName(c).toLowerCase()
      const email = (c.email || "").toLowerCase()
      const phone = (c.phone || "").toLowerCase()
      return name.includes(q) || email.includes(q) || phone.includes(q)
    })
  }, [customers, searchQuery])

  const totalRevenue = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0)
  const totalOrders = customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0)
  const activeCustomers = customers.filter((c) => c.isActive).length

  const openProfile = async (customerId: string) => {
    setProfileOpen(true)
    setProfileError("")
    setProfileLoading(true)
    setProfileData(null)
    try {
      const data = await api.getAdminUser(customerId)
      setProfileData(data)
    } catch (e: any) {
      setProfileError(e?.response?.data?.message || e?.message || "No se pudo cargar el perfil.")
    } finally {
      setProfileLoading(false)
    }
  }

  const requestToggle = (customer: CustomerRow) => {
    setConfirmTarget(customer)
    setConfirmOpen(true)
  }

  const doToggle = async () => {
    if (!confirmTarget) return
    setIsToggling(true)
    try {
      const nextActive = !confirmTarget.isActive
      await api.setUserActive(confirmTarget.id, nextActive)
      setCustomers((prev) => prev.map((c) => (c.id === confirmTarget.id ? { ...c, isActive: nextActive } : c)))
      setConfirmOpen(false)
      setConfirmTarget(null)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo actualizar el estado del cliente.")
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu base de clientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary to-habaluna-blue-dark rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                <p className="text-xs text-muted-foreground">Total clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCustomers}</p>
                <p className="text-xs text-muted-foreground">Clientes activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-habaluna-coral to-orange-400 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">Pedidos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-habaluna-mint to-teal-400 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">€{totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Ingresos totales</p>
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
              placeholder="Buscar por nombre o email..."
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

      {/* Customers table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-secondary/30">
          <CardTitle className="text-lg text-foreground">Lista de clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold text-foreground">Cliente</TableHead>
                  <TableHead className="font-semibold text-foreground">Contacto</TableHead>
                  <TableHead className="font-semibold text-foreground">Pedidos</TableHead>
                  <TableHead className="font-semibold text-foreground">Total gastado</TableHead>
                  <TableHead className="font-semibold text-foreground">Estado</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Cargando clientes...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No hay clientes para mostrar.
                    </TableCell>
                  </TableRow>
                )}

                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-primary to-habaluna-blue-dark rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">
                            {getCustomerName(customer)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{getCustomerName(customer)}</p>
                          <p className="text-xs text-muted-foreground">
                            Cliente desde {new Date(customer.createdAt).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-foreground">{customer.email}</p>
                        {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{customer.totalOrders}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">€{customer.totalSpent.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          customer.isActive
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-700 border-gray-200",
                        )}
                      >
                        {customer.isActive ? "Activo" : "Inactivo"}
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
                          <DropdownMenuItem onClick={() => openProfile(customer.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`mailto:${customer.email}`)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {customer.isActive ? (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => requestToggle(customer)}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Desactivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => requestToggle(customer)}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Perfil del cliente</DialogTitle>
          </DialogHeader>
          {profileLoading ? (
            <div className="py-6 text-sm text-muted-foreground">Cargando perfil...</div>
          ) : profileError ? (
            <div className="py-2 text-sm text-destructive">{profileError}</div>
          ) : profileData ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nombre:</span>{" "}
                <span className="text-foreground">
                  {`${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() || "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="text-foreground">{profileData.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Teléfono:</span>{" "}
                <span className="text-foreground">{profileData.phone || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dirección:</span>{" "}
                <span className="text-foreground">{profileData.address || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ciudad:</span>{" "}
                <span className="text-foreground">{profileData.city || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">País:</span>{" "}
                <span className="text-foreground">{profileData.country || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>{" "}
                <span className="text-foreground">{profileData.isActive ? "Activo" : "Inactivo"}</span>
              </div>
            </div>
          ) : (
            <div className="py-2 text-sm text-muted-foreground">—</div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget?.isActive ? "Desactivar cliente" : "Activar cliente"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget
                ? `¿Seguro que deseas ${confirmTarget.isActive ? "desactivar" : "activar"} a "${getCustomerName(
                    confirmTarget,
                  )}"?`
                : "¿Seguro que deseas cambiar el estado de este cliente?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doToggle} disabled={isToggling}>
              {isToggling ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersContent />
    </Suspense>
  )
}
