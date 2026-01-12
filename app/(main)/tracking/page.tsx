import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Seguimiento de pedido | Habaluna",
}

export default function TrackingPage() {
  return (
    <InfoPage
      title="Seguimiento de pedido"
      description="Consulta el estado de tu pedido y la información de entrega."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Ayuda", href: "/ayuda" },
        { label: "Seguimiento de pedido" },
      ]}
      sections={[
        {
          title: "¿Dónde puedo ver el estado?",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Si tienes cuenta, revisa la sección “Mis pedidos”.</li>
              <li>Si recibiste un enlace de seguimiento, úsalo para ver el progreso del envío.</li>
            </ul>
          ),
        },
        {
          title: "Estados habituales",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Confirmado</li>
              <li>Preparando</li>
              <li>En camino</li>
              <li>Entregado</li>
            </ul>
          ),
        },
      ]}
    />
  )
}

