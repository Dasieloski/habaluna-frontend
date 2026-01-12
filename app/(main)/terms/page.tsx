import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Términos y condiciones | Habaluna",
}

export default function TermsPage() {
  return (
    <InfoPage
      title="Términos y condiciones"
      description="Condiciones de uso del sitio y de compra. Este texto es orientativo y debe adaptarse a tu negocio."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Términos y condiciones" },
      ]}
      sections={[
        {
          title: "Uso del sitio",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Al navegar o comprar aceptas estos términos.</li>
              <li>Podemos actualizar el contenido del sitio y las condiciones cuando sea necesario.</li>
            </ul>
          ),
        },
        {
          title: "Compras y pedidos",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Los precios y disponibilidad pueden cambiar sin previo aviso.</li>
              <li>La confirmación del pedido se realiza una vez completado el pago/proceso correspondiente.</li>
            </ul>
          ),
        },
      ]}
    />
  )
}

