import { InfoPage } from "@/components/pages/info-page"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
          title: "Preguntas frecuentes (información y transparencia)",
          content: (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cuba">
                <AccordionTrigger>¿Dónde opera Habaluna?</AccordionTrigger>
                <AccordionContent>
                  Habaluna opera desde <span className="font-medium text-foreground">Cuba</span>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dl88">
                <AccordionTrigger>¿Qué es el Decreto‑Ley 88/2024 y por qué lo mencionamos?</AccordionTrigger>
                <AccordionContent>
                  El <span className="font-medium text-foreground">Decreto‑Ley 88/2024</span> del Consejo de Estado (Gaceta Oficial)
                  regula la creación, funcionamiento y extinción de las{" "}
                  <span className="font-medium text-foreground">micro, pequeñas y medianas empresas (mipymes)</span> en Cuba. Lo
                  mencionamos como referencia del marco normativo aplicable a la actividad empresarial y a los actores que operan en
                  la plataforma.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dl88-detalles">
                <AccordionTrigger>¿Qué establece, de forma general, el Decreto‑Ley 88/2024?</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Define a las mipymes como <span className="font-medium text-foreground">unidades económicas con personalidad jurídica</span> y contempla que
                      puedan ser <span className="font-medium text-foreground">estatales, privadas, mixtas</span> o de{" "}
                      <span className="font-medium text-foreground">organizaciones políticas, de masas o sociales</span>.
                    </li>
                    <li>
                      Las clasifica (micro, pequeña y mediana) según el{" "}
                      <span className="font-medium text-foreground">número de personas ocupadas</span>.
                    </li>
                    <li>
                      Reconoce <span className="font-medium text-foreground">autonomía empresarial</span>, con obligaciones de cumplir normas vigentes del Estado y
                      regulaciones del <span className="font-medium text-foreground">Ministerio de Finanzas y Precios</span>, incluyendo límites de precios cuando
                      procedan.
                    </li>
                    <li>
                      Incluye obligaciones como el uso de <span className="font-medium text-foreground">canales digitales de pago</span>, respetar tarifas/precios
                      centralizados cuando correspondan y no involucrarse en actividades delictivas.
                    </li>
                    <li>Regula causas y procedimientos para la disolución o extinción de una mipyme.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="comision">
                <AccordionTrigger>¿Las mipymes pagan comisión a Habaluna por mostrar sus productos?</AccordionTrigger>
                <AccordionContent>
                  No. En Habaluna, las mipymes que aparecen en la plataforma{" "}
                  <span className="font-medium text-foreground">no pagan comisión por reflejar/publicar sus productos</span>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="utilidad">
                <AccordionTrigger>¿Cómo funciona la utilidad/precio de cada vendedor?</AccordionTrigger>
                <AccordionContent>
                  Cada mipyme <span className="font-medium text-foreground">define sus precios</span> y{" "}
                  <span className="font-medium text-foreground">recoge su propia utilidad</span>. Habaluna facilita la visibilidad y
                  la experiencia de compra sin aplicar comisiones por publicación.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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

