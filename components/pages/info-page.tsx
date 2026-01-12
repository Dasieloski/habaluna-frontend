import type React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export type InfoBreadcrumbItem = {
  label: string
  href?: string
}

export type InfoSection = {
  title: string
  content: React.ReactNode
}

export function InfoPage({
  title,
  description,
  breadcrumbs,
  sections,
}: {
  title: string
  description?: string
  breadcrumbs?: InfoBreadcrumbItem[]
  sections: InfoSection[]
}) {
  const crumbs: InfoBreadcrumbItem[] = breadcrumbs?.length
    ? breadcrumbs
    : [
        { label: "Página de inicio", href: "/" },
        { label: title },
      ]

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            {crumbs.map((c, idx) => {
              const isFirst = idx === 0
              const isLast = idx === crumbs.length - 1

              const item = (
                <>
                  {isFirst && c.href ? (
                    <span className="flex items-center gap-1">
                      <Home className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{c.label}</span>
                    </span>
                  ) : (
                    <span className={isLast ? "text-foreground font-medium" : ""}>{c.label}</span>
                  )}
                </>
              )

              return (
                <span key={`${c.label}-${idx}`} className="flex items-center gap-2">
                  {c.href && !isLast ? (
                    <Link href={c.href} className="hover:text-sky-600 transition-colors flex items-center gap-1">
                      {item}
                    </Link>
                  ) : (
                    item
                  )}
                  {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                </span>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
          {description ? <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-3xl">{description}</p> : null}
        </header>

        <div className="grid gap-4 md:gap-6">
          {sections.map((s) => (
            <section key={s.title} className="rounded-2xl border border-border/50 bg-card p-5 md:p-7 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">{s.title}</h2>
              <div className="mt-3 text-sm md:text-[15px] leading-relaxed text-muted-foreground">{s.content}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

