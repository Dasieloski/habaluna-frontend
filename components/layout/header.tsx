"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCartStore } from "@/lib/store/cart-store"
import { useWishlistStore } from "@/lib/store/wishlist-store"
import { api } from "@/lib/api"
import { SearchAutocomplete } from "@/components/product/search-autocomplete"
import {
  SearchIcon,
  UserIcon,
  HeartIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
  ChevronDownIcon,
  TruckIcon,
  ReturnIcon,
  ShieldIcon,
  StarIcon,
} from "@/components/icons/streamline-icons"

const navItems = [
  { name: "Novedades", href: "/products?filter=new" },
  { name: "Ofertas", href: "/products?filter=offers" },
  { name: "Alimentos", href: "/products?filter=food", hasDropdown: true },
  { name: "Materiales", href: "/products?filter=materials", hasDropdown: true },
  { name: "Bebidas", href: "/products?filter=drinks" },
  { name: "Otros", href: "/products?filter=other", highlight: true },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, logout } = useAuthStore()
  const authed = useAuthStore((s) => s.user !== null && !!s.accessToken)
  const cartCount = useCartStore((s) => s.getItemCount())
  const fetchCart = useCartStore((s) => s.fetchCart)
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [isHidden, setIsHidden] = useState(false)
  const lastYRef = useRef(0)
  const tickingRef = useRef(false)

  const [ui, setUi] = useState<{
    announcement: string
    highlights: [string, string, string, string]
  }>({
    announcement: "Envíos a toda la Habana - Entrega rápida",
    highlights: ["Envío gratis +50€", "30 días devolución", "Pago seguro", "4.8/5 valoración"],
  })

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    router.push("/")
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    // Sincronizar carrito server cuando hay sesión
    if (authed) {
      fetchCart()
      fetchWishlist()
    }
  }, [authed, fetchCart, fetchWishlist])

  useEffect(() => {
    // Evitar hydration mismatch (persist rehidrata antes del primer paint)
    setMounted(true)
  }, [])

  useEffect(() => {
    // Cargar textos configurables (público)
    let cancelled = false
    api
      .getUiSettings?.()
      .then((res: any) => {
        if (cancelled || !res) return
        const highlights = Array.isArray(res.headerHighlights) ? res.headerHighlights : []
        setUi({
          announcement: res.headerAnnouncement || ui.announcement,
          highlights: [
            String(highlights[0] || ui.highlights[0]),
            String(highlights[1] || ui.highlights[1]),
            String(highlights[2] || ui.highlights[2]),
            String(highlights[3] || ui.highlights[3]),
          ],
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Ocultar al bajar, mostrar al subir (animado)
    lastYRef.current = window.scrollY || 0
    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0
        const delta = y - lastYRef.current

        // Si menú móvil abierto o dropdown de usuario abierto, mantener visible
        if (mobileMenuOpen || userMenuOpen) {
          setIsHidden(false)
          lastYRef.current = y
          tickingRef.current = false
          return
        }

        // Ignorar micro-movimientos
        if (Math.abs(delta) > 12) {
          if (y > 120 && delta > 0) setIsHidden(true)
          if (delta < 0) setIsHidden(false)
        }
        lastYRef.current = y
        tickingRef.current = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [mobileMenuOpen, userMenuOpen])

  // Función para manejar la búsqueda del navbar (se ejecuta al seleccionar sugerencia)
  const handleNavbarSearch = (searchValue: string) => {
    const value = searchValue.trim()
    if (!value) return

    // Cerrar menús móviles
    setSearchOpen(false)
    setMobileMenuOpen(false)

    // Navegar a /products con el término de búsqueda - siempre tiene prioridad
    router.push(`/products?search=${encodeURIComponent(value)}`)
  }

  // Sincronizar searchQuery con la URL solo cuando estamos en /products y la URL cambia externamente
  // PERO solo si NO viene del navbar (para evitar conflictos)
  useEffect(() => {
    // Solo sincronizar si estamos en /products y el cambio viene de fuera (no de nuestro propio input)
    if (pathname === "/products") {
      const urlSearch = searchParams?.get("search") || ""
      // Solo actualizar si es diferente y no estamos escribiendo activamente en el navbar
      const isNavbarInputFocused = document.activeElement?.closest('[data-navbar-search]')
      if (urlSearch !== searchQuery && !isNavbarInputFocused) {
        setSearchQuery(urlSearch)
      }
    } else {
      // Si no estamos en /products, mantener el searchQuery para uso futuro
      // No limpiar para mantener el valor mientras navegas
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.get("search")])

  return (
    <header
      className={`sticky top-0 z-50 bg-background shadow-sm transition-transform duration-500 ease-out ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="bg-gradient-to-r from-sky-100 to-blue-100 text-foreground text-xs md:text-sm py-2.5 text-center">
        <p className="animate-fade-in">{ui.announcement}</p>
      </div>

      {/* Main header */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 -ml-2 hover:bg-secondary rounded-xl transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center group">
              <span
                className="text-3xl md:text-5xl tracking-wide text-sky-600 transition-transform duration-300 group-hover:scale-105"
                style={{ fontFamily: "'Londrina Shadow', cursive" }}
              >
                Habaluna
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={handleNavbarSearch}
                placeholder="¿Qué estás buscando?"
                className="w-full"
              />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 md:gap-3">
              <button
                className="md:hidden p-2.5 hover:bg-secondary rounded-xl transition-colors duration-300"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2.5 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-fade-in-up z-50">
                    {authed && user ? (
                      <>
                        <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-border/30">
                          <p className="text-sm font-medium text-foreground">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-all duration-300"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 text-sky-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                              />
                            </svg>
                            Mi perfil
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-all duration-300"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 text-sky-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                              />
                            </svg>
                            Mis pedidos
                          </Link>
                          {user.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-all duration-300"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <svg
                                className="w-5 h-5 text-sky-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Panel Admin
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-all duration-300 w-full text-left text-red-600"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                              />
                            </svg>
                            Cerrar sesión
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-border/30">
                          <p className="text-sm font-medium text-foreground">Mi cuenta</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Accede o crea tu cuenta</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/auth/login"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-all duration-300"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 text-sky-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                              />
                            </svg>
                            Iniciar sesión
                          </Link>
                          <Link
                            href="/auth/register"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary rounded-xl transition-all duration-300"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 text-sky-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                              />
                            </svg>
                            Crear una cuenta
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/wishlist"
                className="p-2.5 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-105 hidden md:flex"
              >
                <HeartIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/cart"
                className="p-2.5 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-105 relative"
              >
                <CartIcon className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          {searchOpen && (
            <div className="md:hidden pb-4 animate-fade-in-up">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={handleNavbarSearch}
                placeholder="Buscar productos..."
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block border-t border-border/30">
          <div className="container mx-auto px-4">
            <ul className="flex items-center justify-center gap-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-secondary ${
                      item.highlight ? "text-sky-600 font-semibold" : ""
                    }`}
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDownIcon className="w-4 h-4" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 py-2.5 md:py-3 border-b border-sky-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-start md:justify-center gap-4 md:gap-12 text-[11px] md:text-sm overflow-x-auto scrollbar-hide">
            <div
              className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap text-sky-700 animate-fade-in flex-shrink-0"
              style={{ animationDelay: "0.1s" }}
            >
              <TruckIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium">{ui.highlights[0]}</span>
            </div>
            <div
              className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap text-sky-700 animate-fade-in flex-shrink-0"
              style={{ animationDelay: "0.2s" }}
            >
              <ReturnIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium">{ui.highlights[1]}</span>
            </div>
            <div
              className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap text-sky-700 animate-fade-in flex-shrink-0"
              style={{ animationDelay: "0.3s" }}
            >
              <ShieldIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium">{ui.highlights[2]}</span>
            </div>
            <div
              className="hidden lg:flex items-center gap-2 whitespace-nowrap text-sky-700 animate-fade-in flex-shrink-0"
              style={{ animationDelay: "0.4s" }}
            >
              <StarIcon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{ui.highlights[3]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[140px] bg-background z-40 overflow-y-auto animate-fade-in">
          <nav className="container mx-auto px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={item.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-5 py-4 text-base font-medium hover:bg-secondary rounded-2xl transition-all duration-300 ${
                      item.highlight ? "text-sky-600 bg-sky-50" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDownIcon className="w-5 h-5" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
