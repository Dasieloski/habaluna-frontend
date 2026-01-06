"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    // Dar tiempo para que el store se inicialice
    setIsLoading(false)
    
    // Si no es la página de login y no está autenticado o no es admin, redirigir
    if (!isLoginPage && !isLoading) {
      if (!isAuthenticated() || !isAdmin()) {
        router.push("/admin/login")
      }
    }
    
    // Si está en login pero ya está autenticado como admin, redirigir al admin
    if (isLoginPage && isAuthenticated() && isAdmin()) {
      router.push("/admin")
    }
  }, [user, isAuthenticated, isAdmin, isLoginPage, router, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  // Si no está autenticado o no es admin, no mostrar nada (ya se redirigió)
  if (!isAuthenticated() || !isAdmin()) {
    return null
  }

  const handleMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminSidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={handleMenuClose} 
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <div className={isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}>
        <AdminHeader 
          onMenuToggle={handleMenuToggle}
          isMenuOpen={isMobileMenuOpen}
        />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
