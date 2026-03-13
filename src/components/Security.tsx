import { Shield, Lock, Server, Eye, FileCheck, Globe } from "lucide-react";

const certifications = [
  {
    icon: Lock,
    title: "Encriptación end-to-end",
    desc: "TLS 1.3 en tránsito, AES-256 en reposo. Tus datos de salud nunca viajan en texto plano.",
  },
  {
    icon: Shield,
    title: "Ley 25.326 compliant",
    desc: "Cumplimos la Ley de Protección de Datos Personales de Argentina y la Disposición 11/2006 de la AAIP.",
  },
  {
    icon: Server,
    title: "SOC 2 Type II & ISO 27001",
    desc: "Infraestructura certificada con auditorías anuales de seguridad. Uptime 99.95% garantizado.",
  },
  {
    icon: Eye,
    title: "Auditoría de acceso",
    desc: "Logs inmutables de cada acción. Sabé quién accedió a qué, cuándo y desde dónde.",
  },
  {
    icon: FileCheck,
    title: "HIPAA-ready",
    desc: "Arquitectura preparada para cumplir estándares internacionales de datos de salud.",
  },
  {
    icon: Globe,
    title: "Data residency Argentina",
    desc: "Tus datos se almacenan en servidores dentro de Argentina. Sin transferencias internacionales no autorizadas.",
  },
];

export default function Security() {
  return (
    <section className="px-6 py-20 bg-[#FAFCFF] border-t border-border">
      <div className="max-w-[960px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          Seguridad
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          Datos de salud protegidos con{" "}
          <em className="not-italic text-celeste-dark">estándares de clase mundial</em>
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
          Los datos de tus pacientes y tu facturación merecen el más alto nivel de protección.
          Cóndor Salud fue diseñado desde cero con seguridad como prioridad.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((c) => (
            <div
              key={c.title}
              className="bg-white border border-border rounded-xl p-5 hover:border-celeste/30 hover:shadow-sm transition"
            >
              <div className="w-9 h-9 rounded-lg bg-celeste-pale flex items-center justify-center mb-3">
                <c.icon className="w-4.5 h-4.5 text-celeste-dark" />
              </div>
              <h3 className="font-bold text-sm text-ink mb-1.5">{c.title}</h3>
              <p className="text-[12px] text-ink-light leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
