import type React from "react"
import { ConditionalLayout } from "@/components/layout/conditional-layout"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ConditionalLayout>{children}</ConditionalLayout>
}
