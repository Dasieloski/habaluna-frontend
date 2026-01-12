import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Privacidad | Habaluna",
}

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacidad"
      description="Información sobre el tratamiento de datos personales. Este texto es orientativo y debe adaptarse a tu negocio."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Privacidad" },
      ]}
      sections={[
        {
          title: "Qué datos recogemos",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Datos de cuenta y contacto (por ejemplo: email).</li>
              <li>Datos de pedidos (dirección de entrega, historial de compras).</li>
              <li>Datos técnicos para funcionamiento y seguridad (p. ej. logs).</li>
            </ul>
          ),
        },
        {
          title: "Para qué los usamos",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Gestionar tu cuenta y tus pedidos.</li>
              <li>Atender solicitudes de soporte.</li>
              <li>Mejorar la experiencia y la seguridad del sitio.</li>
            </ul>
          ),
        },
      ]}
    />
  )
}

