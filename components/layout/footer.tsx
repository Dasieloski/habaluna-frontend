"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      {/* Main footer */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Logo and language */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-5">
                <span className="text-4xl text-sky-600" style={{ fontFamily: "'Londrina Shadow', cursive" }}>
                  Habaluna
                </span>
              </Link>
              <div className="flex items-center gap-2 mt-5">
                <span className="text-xl">🇪🇸</span>
                <select className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-300">
                  <option>España</option>
                </select>
              </div>
              <div className="flex items-center gap-4 mt-5">
                <a href="#" className="text-muted-foreground hover:text-sky-500 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-sky-500 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links columns */}
            <div>
              <h4 className="font-bold mb-5 text-foreground">Ayuda</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-sky-500 transition-colors">
                    Servicio al Cliente
                  </Link>
                </li>
                <li>
                  <Link href="/payment" className="hover:text-sky-500 transition-colors">
                    Métodos de pago
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-5 text-foreground">Sobre Habaluna</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-sky-500 transition-colors">
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-sky-500 transition-colors">
                    Política de Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-sky-500 transition-colors">
                    Gastos de envío
                  </Link>
                </li>
                <li>
                  <Link href="/tracking" className="hover:text-sky-500 transition-colors">
                    Seguimiento de pedido
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-sky-500 transition-colors">
                    Devoluciones
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-5 text-foreground">Socios</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/press" className="hover:text-sky-500 transition-colors">
                    Prensa
                  </Link>
                </li>
                <li>
                  <Link href="/b2b" className="hover:text-sky-500 transition-colors">
                    Consultas B2B
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-5 text-foreground">Pago seguro</h4>
              <div className="flex flex-wrap gap-2">
                {["VISA", "Mastercard", "PayPal", "Apple Pay"].map((method) => (
                  <div key={method} className="bg-muted px-3 py-2 rounded-lg text-xs font-medium">
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link href="/terms" className="hover:text-sky-500 transition-colors">
                Términos y condiciones
              </Link>
              <Link href="/privacy" className="hover:text-sky-500 transition-colors">
                Privacidad
              </Link>
              <Link href="/company" className="hover:text-sky-500 transition-colors">
                Aviso legal
              </Link>
            </div>
            <p>© {new Date().getFullYear()} Habaluna</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
