import Link from "next/link"
import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Gastos de envío | Habaluna",
}

export default function ShippingPage() {
  return (
    <InfoPage
      title="Gastos de envío"
      description="Información sobre costes, plazos y condiciones de entrega."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Sobre Habaluna", href: "/sobre-habaluna" },
        { label: "Gastos de envío" },
      ]}
      sections={[
        {
          title: "Costes",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>El coste de envío se calcula en el checkout según destino y peso/volumen.</li>
              <li>Podemos aplicar promociones puntuales (se mostrarán antes de confirmar el pedido).</li>
            </ul>
          ),
        },
        {
          title: "Plazos y seguimiento",
          content: (
            <p>
              Cuando tu pedido esté en camino podrás consultarlo en{" "}
              <Link href="/tracking" className="text-sky-600 hover:underline">
                Seguimiento de pedido
              </Link>
              .
            </p>
          ),
        },
      ]}
    />
  )
}

