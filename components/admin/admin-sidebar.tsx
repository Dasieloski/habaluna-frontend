"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Users,
  Percent,
  MessageSquare,
  Settings,
  Images,
  ChevronLeft,
  ChevronRight,
  Store,
  X,
} from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/combos", label: "Combos", icon: Boxes },
  { href: "/admin/categories", label: "Categorías", icon: FolderTree },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/offers", label: "Ofertas", icon: Percent },
  { href: "/admin/banners", label: "Carrusel", icon: Images },
  { href: "/admin/reviews", label: "Reseñas", icon: MessageSquare },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function AdminSidebar({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed: controlledIsCollapsed,
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [uncontrolledIsCollapsed, setUncontrolledIsCollapsed] = useState(false)
  const prevPathnameRef = useRef<string | null>(null)
  const isCollapsed = controlledIsCollapsed ?? uncontrolledIsCollapsed

  // Cerrar menú móvil al cambiar de ruta (solo cuando realmente cambia la ruta)
  useEffect(() => {
    // Solo ejecutar si ya teníamos una ruta previa (no en el primer render)
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      // Solo cerrar si realmente cambió la ruta y el menú está abierto
      if (isMobileOpen && onMobileClose) {
        onMobileClose()
      }
    }
    // Actualizar la ruta previa
    prevPathnameRef.current = pathname
  }, [pathname]) // Solo depender de pathname para evitar re-renders innecesarios

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onMobileClose?.()
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r border-border flex flex-col",
          // Transición suave solo en móvil para evitar parpadeos
          "transition-transform duration-300 ease-in-out",
          // Desktop: siempre visible, colapsable, sin transición (mantener fixed para no desplazar el contenido)
          "lg:translate-x-0 lg:transition-none",
          isCollapsed ? "lg:w-20" : "lg:w-72",
          // Mobile: solo visible cuando isMobileOpen es true
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // En móvil, siempre ancho completo
          "w-72"
        )}
        onClick={(e) => {
          // Prevenir que los clicks dentro del sidebar propaguen al overlay
          e.stopPropagation()
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {(!isCollapsed || isMobileOpen) && (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-habaluna-blue-dark rounded-xl flex items-center justify-center shadow-md">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-logo text-2xl text-foreground">Habaluna</span>
            </Link>
          )}
          {isCollapsed && !isMobileOpen && (
            <div className="w-10 h-10 mx-auto bg-gradient-to-br from-primary to-habaluna-blue-dark rounded-xl flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          {/* Botón cerrar en móvil */}
          {isMobileOpen && onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onMobileClose()
              }}
              className="lg:hidden ml-auto"
              type="button"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-habaluna-blue-dark text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  (isCollapsed && !isMobileOpen) && "justify-center px-2",
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse button - Solo en desktop */}
        <div className="p-3 border-t border-border hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = !isCollapsed
              if (onCollapsedChange) onCollapsedChange(next)
              else setUncontrolledIsCollapsed(next)
            }}
            className={cn(
              "w-full justify-center text-muted-foreground hover:text-foreground",
              !isCollapsed && "justify-start",
            )}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!isCollapsed && <span className="ml-2">Colapsar</span>}
          </Button>
        </div>
      </aside>
    </>
  )
}
