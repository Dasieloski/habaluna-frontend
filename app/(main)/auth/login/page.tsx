"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/store/auth-store"
import { Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError("")
      const response = await api.post("/auth/login", data)
      const { user, accessToken, refreshToken } = response.data

      setAuth(user, accessToken, refreshToken)
      // Cargar perfil completo (teléfono/dirección/estado, etc.) para usarlo en toda la app
      try {
        const meRes = await api.get("/users/me")
        const me = meRes.data
        setAuth({ ...user, ...me }, accessToken, refreshToken)
      } catch (e) {
        // No bloquear el login si falla el fetch del perfil
      }
      router.push("/")
    } catch (err: any) {
      console.error("Error en login:", err)
      const errorMessage = err.response?.data?.message || err.message || "Error al iniciar sesión. Verifica tus credenciales."
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-sky-500 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-foreground">Acceso del cliente</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-lg mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Acceso del cliente</h1>
            <p className="text-sky-500">¡Bienvenido de nuevo!</p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">Acceder</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Dirección E-Mail <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Dirección E-Mail"
                  {...register("email")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    {...register("password")}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="w-4 h-4 border-gray-300 rounded text-sky-500 focus:ring-sky-400"
                  />
                  <span className="text-sm text-muted-foreground">Recordarme</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-sky-500 hover:text-sky-600 hover:underline transition-colors"
                >
                  ¿Has olvidado tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Iniciando sesión..." : "Continuar"}
              </button>

              {/* Register link */}
              <p className="text-center text-sm text-muted-foreground pt-2">
                ¿Es nuevo aquí?{" "}
                <Link href="/auth/register" className="text-sky-500 hover:text-sky-600 hover:underline font-medium">
                  Crear una cuenta
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}
