"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { api } from "@/lib/api"

const schema = z.object({
  email: z.string().email("Email inválido"),
})

type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try {
      setError("")
      setMessage("")
      const res = await api.forgotPassword(data.email)
      setMessage(res.message || "Si el correo está registrado, enviaremos un enlace de recuperación.")
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "No se pudo procesar la solicitud."
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-sky-500 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link href="/auth/login" className="hover:text-sky-500 transition-colors">
            Acceso del cliente
          </Link>
          <span>&gt;</span>
          <span className="text-foreground">Recuperar contraseña</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Recuperar contraseña</h1>
            <p className="text-muted-foreground">Te enviaremos un enlace válido por 1 hora.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
              )}
              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                  {message}
                </div>
              )}

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/auth/login" className="text-sky-500 hover:text-sky-600 hover:underline font-medium">
                  Volver a iniciar sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

