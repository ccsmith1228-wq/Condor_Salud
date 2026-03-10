import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Términos de Servicio",
  description: "Términos y condiciones de uso de Cóndor Salud.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Ir al inicio">
            <Image
              src="/logos/condor.png"
              alt="Cóndor Salud"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-sm text-celeste-dark tracking-[2px]">CÓNDOR SALUD</span>
          </Link>
          <Link href="/" className="text-xs text-celeste-dark hover:underline">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-ink mb-2">Términos de Servicio</h1>
        <p className="text-sm text-ink-muted mb-8">Última actualización: 10 de marzo de 2026</p>

        <div className="prose prose-sm max-w-none text-ink-light space-y-6">
          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar Cóndor Salud (&quot;la Plataforma&quot;), usted acepta estos
              Términos de Servicio en su totalidad. Si no está de acuerdo con alguna parte de estos
              términos, no debe utilizar la Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">2. Descripción del Servicio</h2>
            <p>
              Cóndor Salud es una plataforma SaaS de gestión integral para clínicas y centros
              médicos en Argentina. Los servicios incluyen:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Gestión de facturación electrónica a financiadores.</li>
              <li>Seguimiento de cobros y rechazos.</li>
              <li>Administración de agenda y turnos.</li>
              <li>Gestión de inventario de insumos.</li>
              <li>Auditoría automática pre-presentación.</li>
              <li>Reportería y análisis de gestión.</li>
              <li>Verificación de cobertura de afiliados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">3. Registro y Cuenta</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>El usuario debe proporcionar información veraz y actualizada.</li>
              <li>Cada clínica puede tener múltiples usuarios con roles diferenciados.</li>
              <li>El administrador de la clínica es responsable de gestionar los accesos.</li>
              <li>Las credenciales son personales e intransferibles.</li>
              <li>El usuario debe notificar inmediatamente cualquier uso no autorizado.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">4. Planes y Facturación</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Los planes disponibles y sus precios se detallan en la página de precios.</li>
              <li>La facturación es mensual y se realiza por adelantado.</li>
              <li>Los precios pueden ajustarse con 30 días de anticipación.</li>
              <li>El impago por más de 15 días puede resultar en la suspensión del servicio.</li>
              <li>No se ofrecen reembolsos por períodos parciales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">5. Uso Aceptable</h2>
            <p>El usuario se compromete a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Utilizar la Plataforma únicamente para los fines previstos.</li>
              <li>No intentar acceder a datos de otras clínicas.</li>
              <li>No realizar ingeniería inversa del software.</li>
              <li>No utilizar la Plataforma para actividades ilegales.</li>
              <li>Respetar las leyes de protección de datos de pacientes.</li>
              <li>No sobrecargar los sistemas con solicitudes automatizadas excesivas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">6. Propiedad Intelectual</h2>
            <p>
              La Plataforma, su código fuente, diseño, marca y contenido son propiedad de Cóndor
              Salud S.A. Los datos ingresados por la clínica son propiedad de la clínica. Al
              utilizar la Plataforma, no se transfiere ningún derecho de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">7. Disponibilidad y SLA</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nos esforzamos por mantener una disponibilidad del 99.9%.</li>
              <li>Se realizarán mantenimientos programados con aviso previo de 48 horas.</li>
              <li>En caso de interrupciones no programadas, se notificará a los usuarios.</li>
              <li>
                Las compensaciones por incumplimiento del SLA se detallan en el plan Enterprise.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">
              8. Limitación de Responsabilidad
            </h2>
            <p>Cóndor Salud no será responsable por:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Errores en la facturación derivados de datos ingresados incorrectamente.</li>
              <li>Rechazos de financiadores por causas ajenas a la Plataforma.</li>
              <li>Pérdidas derivadas de interrupciones del servicio por causa de fuerza mayor.</li>
              <li>Decisiones tomadas en base a la información mostrada en la Plataforma.</li>
            </ul>
            <p className="mt-2">
              La responsabilidad máxima de Cóndor Salud está limitada al monto pagado por el
              servicio en los últimos 12 meses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">9. Cancelación</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>El usuario puede cancelar su suscripción en cualquier momento.</li>
              <li>Al cancelar, el acceso se mantiene hasta el final del período pagado.</li>
              <li>Los datos pueden exportarse durante 30 días posteriores a la cancelación.</li>
              <li>Pasados 90 días de la cancelación, los datos se eliminan permanentemente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">10. Legislación Aplicable</h2>
            <p>
              Estos Términos se rigen por las leyes de la República Argentina. Para cualquier
              controversia, las partes se someten a la jurisdicción de los Tribunales Ordinarios de
              la Ciudad Autónoma de Buenos Aires.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">11. Contacto</h2>
            <p>Para consultas sobre estos Términos:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Email: <strong>legal@condorsalud.com</strong>
              </li>
              <li>Dirección: Av. Corrientes 1234, Piso 8, CABA, Argentina</li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} Cóndor Salud. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-celeste-dark">
              Política de Privacidad
            </Link>
            <Link href="/" className="hover:text-celeste-dark">
              Inicio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
