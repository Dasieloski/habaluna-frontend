import * as z from "zod"

/**
 * Schema de validación de contraseña con requisitos de seguridad estrictos
 */
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
  .regex(/\d/, "Debe incluir al menos un número")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Debe incluir al menos un símbolo especial")

/**
 * Calcula el score de fortaleza de una contraseña (0-4)
 */
export function validatePasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  // Verificar longitud mínima
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push("Debe tener al menos 8 caracteres")
  }

  // Verificar mayúsculas
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Falta una letra mayúscula")
  }

  // Verificar minúsculas
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Falta una letra minúscula")
  }

  // Verificar números
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push("Falta un número")
  }

  // Verificar símbolos
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    feedback.push("Falta un símbolo especial")
  }

  // Bonus por longitud adicional
  if (password.length >= 12) {
    score = Math.min(score + 1, 5)
  }

  return {
    score: Math.min(score, 4), // Normalizar a máximo 4
    feedback: feedback.length > 0 ? feedback : [],
  }
}

/**
 * Obtiene una descripción del nivel de fortaleza
 */
export function getPasswordStrengthLabel(score: number): {
  label: string
  color: string
  bgColor: string
} {
  if (score === 0) {
    return { label: "Muy débil", color: "text-red-600", bgColor: "bg-red-500" }
  }
  if (score === 1) {
    return { label: "Débil", color: "text-orange-600", bgColor: "bg-orange-500" }
  }
  if (score === 2) {
    return { label: "Media", color: "text-yellow-600", bgColor: "bg-yellow-500" }
  }
  if (score === 3) {
    return { label: "Fuerte", color: "text-green-600", bgColor: "bg-green-500" }
  }
  return { label: "Muy fuerte", color: "text-emerald-600", bgColor: "bg-emerald-500" }
}
