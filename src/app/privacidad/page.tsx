import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Cóndor Salud — Cómo protegemos tus datos.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Ir al inicio">
            <Image
              src="/logos/condor-transparent.svg"
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
        <h1 className="text-3xl font-bold text-ink mb-2">Política de Privacidad</h1>
        <p className="text-sm text-ink-muted mb-8">Última actualización: 10 de marzo de 2026</p>

        <div className="prose prose-sm max-w-none text-ink-light space-y-6">
          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">1. Información que recopilamos</h2>
            <p>
              Cóndor Salud recopila la siguiente información para proporcionar nuestros servicios:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Datos de la clínica:</strong> Nombre, CUIT, dirección, datos de contacto.
              </li>
              <li>
                <strong>Datos del usuario:</strong> Nombre, email, rol, acciones realizadas en la
                plataforma.
              </li>
              <li>
                <strong>Datos de pacientes:</strong> Solo se almacenan los datos que la clínica
                ingresa voluntariamente para gestión de facturación y agenda.
              </li>
              <li>
                <strong>Datos de facturación:</strong> Información de facturas, financiadores,
                montos y estados.
              </li>
              <li>
                <strong>Datos técnicos:</strong> Dirección IP, tipo de navegador, sistema operativo,
                para mejorar seguridad y rendimiento.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">2. Cómo usamos la información</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
              <li>Procesar la facturación y gestión de financiadores.</li>
              <li>Enviar alertas y notificaciones relevantes.</li>
              <li>Generar reportes y análisis para la clínica.</li>
              <li>Garantizar la seguridad de la plataforma.</li>
              <li>Cumplir con obligaciones legales y regulatorias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">
              3. Protección de datos de salud
            </h2>
            <p>
              Cóndor Salud cumple con la Ley 25.326 de Protección de Datos Personales de Argentina y
              la Ley 26.529 de Derechos del Paciente. Los datos de salud son tratados con el máximo
              nivel de confidencialidad y seguridad.
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Cifrado en tránsito (TLS 1.3) y en reposo (AES-256).</li>
              <li>Acceso restringido por roles (RBAC).</li>
              <li>Auditoría de accesos y modificaciones.</li>
              <li>Backups automáticos con retención configurable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">4. Compartición de datos</h2>
            <p>No vendemos ni compartimos datos personales con terceros, excepto:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Con financiadores (PAMI, obras sociales, prepagas) cuando la clínica envía facturas
                electrónicamente.
              </li>
              <li>Con AFIP para la generación de comprobantes fiscales.</li>
              <li>Cuando sea requerido por orden judicial o autoridad competente.</li>
              <li>
                Con proveedores de infraestructura (hosting, base de datos) bajo acuerdos de
                confidencialidad.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">5. Derechos del usuario</h2>
            <p>De acuerdo con la Ley 25.326, los usuarios tienen derecho a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Acceso:</strong> Solicitar una copia de sus datos personales.
              </li>
              <li>
                <strong>Rectificación:</strong> Corregir datos inexactos o incompletos.
              </li>
              <li>
                <strong>Supresión:</strong> Solicitar la eliminación de datos personales.
              </li>
              <li>
                <strong>Oposición:</strong> Oponerse al tratamiento de datos en ciertos casos.
              </li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, contactar a <strong>privacidad@condorsalud.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">6. Retención de datos</h2>
            <p>
              Los datos se retienen mientras la cuenta de la clínica esté activa. Los datos de
              facturación se conservan por el plazo legal requerido (10 años según normativa fiscal
              argentina). Al cancelar el servicio, los datos se eliminan en un plazo de 90 días,
              excepto los requeridos por ley.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">
              7. Cookies y tecnologías similares
            </h2>
            <p>
              Utilizamos cookies estrictamente necesarias para el funcionamiento de la plataforma
              (autenticación, preferencias de sesión). No utilizamos cookies de terceros para
              publicidad ni rastreo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink mt-8 mb-3">8. Contacto</h2>
            <p>Para consultas sobre privacidad:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Email: <strong>privacidad@condorsalud.com</strong>
              </li>
              <li>Responsable de Protección de Datos: Dirección Legal, Cóndor Salud S.A.</li>
              <li>Dirección: Av. Corrientes 1234, Piso 8, CABA, Argentina</li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} Cóndor Salud. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/terminos" className="hover:text-celeste-dark">
              Términos de Servicio
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
