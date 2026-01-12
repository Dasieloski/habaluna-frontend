import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Métodos de pago | Habaluna",
}

export default function PaymentPage() {
  return (
    <InfoPage
      title="Métodos de pago"
      description="Pagos seguros y opciones claras para que compres con tranquilidad."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Ayuda", href: "/ayuda" },
        { label: "Métodos de pago" },
      ]}
      sections={[
        {
          title: "Tarjetas y wallets",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>VISA</li>
              <li>Mastercard</li>
              <li>PayPal</li>
              <li>Apple Pay</li>
            </ul>
          ),
        },
        {
          title: "Seguridad",
          content: (
            <div className="space-y-2">
              <p>
                Tus datos se transmiten de forma cifrada. Recomendamos usar una conexión segura y no compartir tus datos
                de acceso.
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}

