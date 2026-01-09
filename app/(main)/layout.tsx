import type React from "react"
import { ConditionalLayout } from "@/components/layout/conditional-layout"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // PageTransition ahora está dentro de ConditionalLayout para evitar doble wrapping
  return <ConditionalLayout>{children}</ConditionalLayout>
}
