"use client"

import type React from "react"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main>{children}</main>
      <Footer />
    </>
  )
}

