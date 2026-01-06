"use client"

import { useEffect, useState, useRef } from "react"
import { PersonalizeIcon, ReturnIcon, TruckIcon } from "@/components/icons/streamline-icons"
import { api } from "@/lib/api"

export function BenefitsBar() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const defaultBenefits = [
    {
      icon: PersonalizeIcon,
      title: "VARIEDAD",
      description: "Encuentra desde alimentos hasta materiales de construcción, todo en un solo lugar.",
    },
    {
      icon: ReturnIcon,
      title: "DEVOLUCIONES GRATIS",
      description: "Tienes 30 días para devolver tu producto sin costo adicional.",
    },
    {
      icon: TruckIcon,
      title: "ENTREGA RÁPIDA",
      description: "Tu pedido sale en menos de 24h y llega en tiempo récord.",
    },
  ]

  const [benefits, setBenefits] = useState(defaultBenefits)

  useEffect(() => {
    let cancelled = false
    api
      .getUiSettings()
      .then((s) => {
        if (cancelled) return
        const list = Array.isArray((s as any)?.benefits) ? (s as any).benefits : null
        if (!list || list.length === 0) return
        // Mantener íconos actuales y solo cambiar texto
        const next = defaultBenefits.map((b, idx) => ({
          ...b,
          title: String(list[idx]?.title || b.title),
          description: String(list[idx]?.description || b.description),
        }))
        setBenefits(next)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return (
              <div
                key={index}
                className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-5 text-sky-500 bg-sky-50 rounded-2xl transition-all duration-300 hover:scale-110 hover:bg-sky-100">
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-foreground tracking-wider mb-3">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
