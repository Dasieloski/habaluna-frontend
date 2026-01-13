import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")),
  title: {
    default: "Habaluna - Tu tienda de productos originales",
    template: "%s | Habaluna",
  },
  description:
    "Descubre productos únicos: alimentos, materiales y mucho más. Calidad y originalidad en cada compra.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      // Fallback (some browsers still prefer PNG for tab icons)
      { url: "/uploads/logo.png", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/uploads/logo.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Habaluna",
    title: "Habaluna - Tu tienda de productos originales",
    description:
      "Descubre productos únicos: alimentos, materiales y mucho más. Calidad y originalidad en cada compra.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habaluna - Tu tienda de productos originales",
    description:
      "Descubre productos únicos: alimentos, materiales y mucho más. Calidad y originalidad en cada compra.",
  },
  alternates: {
    canonical: "/",
  },
}

export const viewport: Viewport = {
  themeColor: "#e0f2fe",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Londrina+Shadow&display=swap" rel="stylesheet" />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
