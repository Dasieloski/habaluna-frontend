import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Política de Cookies | Habaluna",
}

export default function CookiesPage() {
  return (
    <InfoPage
      title="Política de Cookies"
      description="Explicamos qué cookies utilizamos y para qué sirven."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Sobre Habaluna", href: "/sobre-habaluna" },
        { label: "Política de Cookies" },
      ]}
      sections={[
        {
          title: "¿Qué son las cookies?",
          content: (
            <p>
              Las cookies son pequeños archivos que se guardan en tu dispositivo para mejorar la experiencia, recordar
              preferencias y medir el rendimiento del sitio.
            </p>
          ),
        },
        {
          title: "Tipos de cookies",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium text-foreground">Técnicas</span>: necesarias para funciones básicas (p. ej.
                carrito).
              </li>
              <li>
                <span className="font-medium text-foreground">Preferencias</span>: guardan ajustes como idioma.
              </li>
              <li>
                <span className="font-medium text-foreground">Analítica</span>: ayudan a entender el uso del sitio para
                mejorarlo.
              </li>
            </ul>
          ),
        },
      ]}
    />
  )
}

