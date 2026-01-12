"use client"

import { useEffect } from "react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/store/auth-store"

/**
 * Bootstrapea sesión al cargar la app:
 * - Intenta refrescar accessToken usando cookie HttpOnly (si existe)
 * - Si hay token, carga /users/me y setea user en store
 * - Marca isBootstrapped para que las páginas protegidas decidan redirecciones correctamente
 */
export function SessionBootstrap() {
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped)
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (isBootstrapped) return
    let cancelled = false

    ;(async () => {
      try {
        // Intentar refrescar token con cookie (si no hay cookie, será 401)
        const refreshed = await api.post("/auth/refresh", {})
        const accessToken = (refreshed as any)?.data?.accessToken
        if (typeof accessToken === "string" && accessToken.trim()) {
          setAccessToken(accessToken.trim())
          // Cargar perfil para tener user
          try {
            const me = await api.get("/users/me")
            const user = (me as any)?.data
            if (!cancelled && user) {
              setAuth(user, accessToken.trim())
            }
          } catch {
            // Si falla /me, al menos nos quedamos con token
          }
        }
      } catch {
        // No hay sesión válida: limpiar
        logout()
      } finally {
        if (!cancelled) setBootstrapped(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isBootstrapped, logout, setAccessToken, setAuth, setBootstrapped])

  return null
}

