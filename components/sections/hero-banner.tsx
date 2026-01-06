"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronRightIcon } from "@/components/icons/streamline-icons"

interface Banner {
  id: string
  title: string
  subtitle?: string
  image?: string
  link?: string
  buttonText?: string
  backgroundColor?: string
}

interface HeroBannerProps {
  banners?: Banner[]
}

const defaultBanners: Banner[] = [
  {
    id: "1",
    title: "PRODUCTOS FRESCOS",
    subtitle: "Spaghettis, coditos y más",
    image: "/fresh-pasta-spaghetti-variety-clean-background.jpg",
    buttonText: "Ver Alimentos",
    backgroundColor: "#e0f2fe",
  },
  {
    id: "2",
    title: "MATERIALES DE CALIDAD",
    subtitle: "Cemento, arena y más",
    image: "/construction-materials-cement-bags-modern.jpg",
    buttonText: "Ver Materiales",
    backgroundColor: "#f0f9ff",
  },
  {
    id: "3",
    title: "BEBIDAS SELECTAS",
    subtitle: "Cervezas artesanales",
    image: "/craft-beer-bottles-elegant-display.jpg",
    buttonText: "Ver Bebidas",
    backgroundColor: "#ecfeff",
  },
]

export function HeroBanner({ banners = defaultBanners }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const displayBanners = banners.length > 0 ? banners : defaultBanners

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setCurrentSlide(index)
      setTimeout(() => setIsAnimating(false), 500)
    },
    [isAnimating],
  )

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % displayBanners.length)
  }, [currentSlide, displayBanners.length, goToSlide])

  useEffect(() => {
    if (displayBanners.length > 1) {
      const timer = setInterval(() => {
        nextSlide()
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [displayBanners.length, nextSlide])

  return (
    <section className="relative overflow-hidden">
      <div
        className="relative transition-colors duration-700 ease-out"
        style={{ backgroundColor: displayBanners[currentSlide]?.backgroundColor || "#e0f2fe" }}
      >
        <div className="relative min-h-[450px] md:min-h-[550px]">
          {displayBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-500 ease-out ${
                index === currentSlide
                  ? "opacity-100 translate-x-0"
                  : index < currentSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
              }`}
            >
              <div className="relative h-full min-h-[450px] md:min-h-[550px]">
                {banner.image && (
                  <img
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
                  <div className="max-w-xl">
                    <h1
                      className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 tracking-tight leading-tight drop-shadow-lg"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {banner.title}
                    </h1>
                    {banner.subtitle && (
                      <p className="text-base md:text-xl text-white/90 mb-4 md:mb-6 font-light drop-shadow-md">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.buttonText && (
                      <a
                        href={banner.link || "#"}
                        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 text-sm md:text-base border border-white/30"
                      >
                        {banner.buttonText}
                        <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots - sin botones de navegación lateral */}
        {displayBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
            {displayBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white w-6 md:w-8" : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
