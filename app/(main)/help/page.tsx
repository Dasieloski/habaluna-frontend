import Link from "next/link"
import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Servicio al Cliente | Habaluna",
}

export default function HelpPage() {
  return (
    <InfoPage
      title="Servicio al Cliente"
      description="Encuentra respuestas rápidas, gestiona tus pedidos y contacta con nosotros si necesitas ayuda."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Ayuda", href: "/ayuda" },
        { label: "Servicio al Cliente" },
      ]}
      sections={[
        {
          title: "Contacto",
          content: (
            <div className="space-y-2">
              <p>Si necesitas asistencia, escríbenos y te responderemos lo antes posible.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium text-foreground">Email</span>: soporte@habaluna.com
                </li>
                <li>
                  <span className="font-medium text-foreground">Horario</span>: Lunes a Viernes, 9:00–18:00
                </li>
              </ul>
            </div>
          ),
        },
        {
          title: "Gestiones frecuentes",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Consultar el estado:{" "}
                <Link href="/tracking" className="text-sky-600 hover:underline">
                  Seguimiento de pedido
                </Link>
              </li>
              <li>
                Información de envío:{" "}
                <Link href="/shipping" className="text-sky-600 hover:underline">
                  Gastos de envío
                </Link>
              </li>
              <li>
                Cambios y devoluciones:{" "}
                <Link href="/returns" className="text-sky-600 hover:underline">
                  Devoluciones
                </Link>
              </li>
              <li>
                Cómo pagar:{" "}
                <Link href="/payment" className="text-sky-600 hover:underline">
                  Métodos de pago
                </Link>
              </li>
            </ul>
          ),
        },
      ]}
    />
  )
}

