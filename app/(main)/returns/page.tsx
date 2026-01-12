import Link from "next/link"
import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Devoluciones | Habaluna",
}

export default function ReturnsPage() {
  return (
    <InfoPage
      title="Devoluciones"
      description="Condiciones, plazos y proceso para devolver un producto."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Sobre Habaluna", href: "/sobre-habaluna" },
        { label: "Devoluciones" },
      ]}
      sections={[
        {
          title: "Condiciones generales",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>El producto debe estar en buen estado y con su embalaje original cuando aplique.</li>
              <li>Algunos productos pueden tener restricciones por higiene o naturaleza del artículo.</li>
            </ul>
          ),
        },
        {
          title: "Cómo iniciar una devolución",
          content: (
            <p>
              Escríbenos desde{" "}
              <Link href="/help" className="text-sky-600 hover:underline">
                Servicio al Cliente
              </Link>{" "}
              indicando número de pedido y motivo.
            </p>
          ),
        },
      ]}
    />
  )
}

