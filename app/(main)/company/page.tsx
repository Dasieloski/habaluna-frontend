import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Aviso legal | Habaluna",
}

export default function CompanyPage() {
  return (
    <InfoPage
      title="Aviso legal"
      description="Información legal del titular del sitio y notas de transparencia. Este texto es orientativo y debe adaptarse a tu negocio."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Aviso legal" },
      ]}
      sections={[
        {
          title: "Titular del sitio",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Nombre comercial: Habaluna</li>
              <li>Contacto: soporte@habaluna.com</li>
              <li>Dirección: (pendiente de completar)</li>
            </ul>
          ),
        },
        {
          title: "Transparencia (Cuba y marco normativo)",
          content: (
            <div className="space-y-3">
              <p>
                Habaluna opera desde <span className="font-medium text-foreground">Cuba</span>.
              </p>
              <p>
                En lo relativo a la actividad empresarial, tomamos como referencia el{" "}
                <span className="font-medium text-foreground">Decreto‑Ley 88/2024</span> del Consejo de Estado (Gaceta Oficial),
                que regula la creación, funcionamiento y extinción de las{" "}
                <span className="font-medium text-foreground">micro, pequeñas y medianas empresas (mipymes)</span>.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Reconoce autonomía empresarial, con deber de cumplir normas del Estado y regulaciones del{" "}
                  <span className="font-medium text-foreground">Ministerio de Finanzas y Precios</span>, incluyendo límites de precios
                  cuando procedan.
                </li>
                <li>
                  Incluye obligaciones como el uso de canales digitales de pago y el respeto a tarifas/precios centralizados cuando
                  correspondan.
                </li>
              </ul>
            </div>
          ),
        },
        {
          title: "Modelo de comisiones con mipymes",
          content: (
            <div className="space-y-2">
              <p>
                En Habaluna, las mipymes que aparecen en la plataforma{" "}
                <span className="font-medium text-foreground">no pagan comisión por reflejar/publicar sus productos</span>.
              </p>
              <p>
                Cada mipyme <span className="font-medium text-foreground">define sus precios</span> y{" "}
                <span className="font-medium text-foreground">recoge su propia utilidad</span>. Habaluna facilita la visibilidad y la
                experiencia de compra sin aplicar comisiones por publicación.
              </p>
            </div>
          ),
        },
        {
          title: "Responsabilidad",
          content: (
            <p>
              El contenido se ofrece con fines informativos. Habaluna se reserva el derecho de modificar y actualizar la
              información cuando sea necesario.
            </p>
          ),
        },
      ]}
    />
  )
}

