"use client"

import type { ReactNode } from "react"
import { SessionBootstrap } from "@/components/auth/session-bootstrap"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionBootstrap />
      {children}
    </>
  )
}
