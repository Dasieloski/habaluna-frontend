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

const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirma tu contraseña"),
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "Los apellidos son requeridos"),
    treatment: z.enum(["senor", "senora", "empresa"]).optional(),
    newsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      treatment: "senor",
      newsletter: false,
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError("")
      const response = await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      const { user, accessToken, refreshToken } = response.data

      setAuth(user, accessToken, refreshToken)
      // Cargar perfil completo (por consistencia con login)
      try {
        const meRes = await api.get("/users/me")
        const me = meRes.data
        setAuth({ ...user, ...me }, accessToken, refreshToken)
      } catch (e) {
        // No bloquear el registro si falla el fetch del perfil
      }
      router.push("/")
    } catch (err: any) {
      console.error("Error en registro:", err)
      const errorMessage = err.response?.data?.message || err.message || "Error al registrarse. Por favor, intenta de nuevo."
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
          <span className="text-foreground">Crear una cuenta cliente</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Crear una cuenta cliente</h1>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-foreground">Información Personal</h2>

                {/* Treatment */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Tratamiento <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-6">
                    {[
                      { value: "senor", label: "Señor" },
                      { value: "senora", label: "Señora" },
                      { value: "empresa", label: "Empresa" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={option.value}
                          {...register("treatment")}
                          className="w-4 h-4 border-gray-300 text-sky-500 focus:ring-sky-400"
                        />
                        <span className="text-sm text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Nombre y Apellidos <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Nombre"
                        {...register("firstName")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                      />
                      {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Apellidos"
                        {...register("lastName")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                      />
                      {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Information Section */}
              <div className="space-y-5 pt-4 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-foreground">Información de registro</h2>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Dirección E-Mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
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
                  <p className="text-xs text-muted-foreground">
                    * Para una contraseña segura deberías tener como mínimo 2 tipos de caracteres diferentes
                    (Mayúsculas, Minúsculas, números y caracteres especiales)
                  </p>
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                {/* Newsletter checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("newsletter")}
                    className="w-4 h-4 mt-0.5 border-gray-300 rounded text-sky-500 focus:ring-sky-400"
                  />
                  <span className="text-sm text-muted-foreground">Regístrate para recibir nuestra newsletter</span>
                </label>

                {/* reCAPTCHA notice */}
                <p className="text-xs text-muted-foreground">
                  This form is protected by reCAPTCHA - the{" "}
                  <Link href="/privacy" className="text-sky-500 hover:underline">
                    Google Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="text-sky-500 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  apply.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creando cuenta..." : "Crear una cuenta cliente"}
              </button>

              {/* Login link */}
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="text-sky-500 hover:text-sky-600 hover:underline font-medium">
                  Iniciar sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}
