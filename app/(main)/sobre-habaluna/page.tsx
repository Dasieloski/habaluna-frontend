import Link from "next/link"
import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Sobre Habaluna | Habaluna",
}

export default function SobreHabalunaPage() {
  return (
    <InfoPage
      title="Sobre Habaluna"
      description="Conoce más sobre nuestra tienda, nuestras políticas y cómo trabajamos."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Sobre Habaluna" },
      ]}
      sections={[
        {
          title: "Información",
          content: (
            <div className="space-y-3">
              <p>
                Habaluna opera desde <span className="font-medium text-foreground">Cuba</span>.
              </p>
              <p>
                Cumplimos con el <span className="font-medium text-foreground">Decreto‑Ley 88/2024</span> del Consejo de
                Estado (publicado en la Gaceta Oficial), que regula la creación, funcionamiento y extinción de las{" "}
                <span className="font-medium text-foreground">micro, pequeñas y medianas empresas (mipymes)</span>.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Define a las mipymes como <span className="font-medium text-foreground">unidades económicas con personalidad jurídica</span>{" "}
                  y contempla su posible naturaleza <span className="font-medium text-foreground">estatal, privada, mixta</span> y de{" "}
                  <span className="font-medium text-foreground">organizaciones políticas, de masas o sociales</span>.
                </li>
                <li>
                  Establece su <span className="font-medium text-foreground">clasificación</span> (micro, pequeña y mediana) según el{" "}
                  <span className="font-medium text-foreground">número de personas ocupadas</span>.
                </li>
                <li>
                  Reconoce <span className="font-medium text-foreground">autonomía empresarial</span>, con obligaciones de cumplir las{" "}
                  <span className="font-medium text-foreground">normas vigentes del Estado</span> y las regulaciones del{" "}
                  <span className="font-medium text-foreground">Ministerio de Finanzas y Precios</span>, incluyendo{" "}
                  <span className="font-medium text-foreground">límites de precios centralizados</span> cuando correspondan.
                </li>
                <li>
                  También recoge obligaciones vinculadas a la operación responsable, como{" "}
                  <span className="font-medium text-foreground">no involucrarse en actividades delictivas</span>, el uso de{" "}
                  <span className="font-medium text-foreground">canales digitales de pago</span> y el respeto a{" "}
                  <span className="font-medium text-foreground">tarifas y precios aprobados centralmente</span>.
                </li>
              </ul>
              <p>
                Además, en Habaluna trabajamos con un modelo transparente:{" "}
                <span className="font-medium text-foreground">las mipymes que venden aquí no pagan comisión a la web por reflejar sus productos</span>
                . Cada mipyme define su precio y{" "}
                <span className="font-medium text-foreground">recoge su propia utilidad</span>; Habaluna actúa como plataforma de
                visibilidad y compra, sin descontar comisiones por publicación.
              </p>
            </div>
          ),
        },
        {
          title: "Quiénes somos",
          content: (
            <p>
              Descubre nuestra historia en{" "}
              <Link href="/about" className="text-sky-600 hover:underline">
                Quiénes somos
              </Link>
              .
            </p>
          ),
        },
        {
          title: "Políticas",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/cookies" className="text-sky-600 hover:underline">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sky-600 hover:underline">
                  Gastos de envío
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sky-600 hover:underline">
                  Devoluciones
                </Link>
              </li>
            </ul>
          ),
        },
      ]}
    />
  )
}

