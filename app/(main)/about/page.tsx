import Link from "next/link"
import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Quiénes somos | Habaluna",
}

export default function AboutPage() {
  return (
    <InfoPage
      title="Quiénes somos"
      description="Habaluna es una tienda de productos originales con foco en calidad, cercanía y una experiencia de compra simple."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Sobre Habaluna", href: "/sobre-habaluna" },
        { label: "Quiénes somos" },
      ]}
      sections={[
        {
          title: "Nuestra misión",
          content: <p>Ofrecer productos únicos y una compra sin fricción, con atención cercana y envíos claros.</p>,
        },
        {
          title: "Transparencia y confianza",
          content: (
            <p>
              Queremos que tengas toda la información a mano:{" "}
              <Link href="/shipping" className="text-sky-600 hover:underline">
                gastos de envío
              </Link>
              ,{" "}
              <Link href="/returns" className="text-sky-600 hover:underline">
                devoluciones
              </Link>{" "}
              y{" "}
              <Link href="/terms" className="text-sky-600 hover:underline">
                términos y condiciones
              </Link>
              .
            </p>
          ),
        },
      ]}
    />
  )
}

