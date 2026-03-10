"use client";

import { useState, useCallback, createContext, useContext, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import {
  Feather,
  LayoutDashboard,
  Users,
  Calendar,
  Search,
  Package,
  FileText,
  AlertTriangle,
  Building2,
  TrendingUp,
  Shield,
  Tag,
  ClipboardList,
  Bell,
  Settings,
  Home,
  HeartPulse,
  DollarSign,
  Lightbulb,
} from "lucide-react";

// ─── Icon map ────────────────────────────────────────────────

export const WIZARD_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  welcome: Feather,
  dashboard: LayoutDashboard,
  pacientes: Users,
  agenda: Calendar,
  verificacion: Search,
  inventario: Package,
  facturacion: FileText,
  rechazos: AlertTriangle,
  financiadores: Building2,
  inflacion: TrendingUp,
  auditoria: Shield,
  nomenclador: Tag,
  reportes: ClipboardList,
  alertas: Bell,
  configuracion: Settings,
};

export const WIZARD_CATEGORY_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Inicio: Home,
  "Gestion Clinica": HeartPulse,
  Finanzas: DollarSign,
  Inteligencia: Lightbulb,
  Sistema: Settings,
};

// ─── Step Data Model ─────────────────────────────────────────

export interface WizardCustomization {
  label: string;
  description: string;
}

export interface WizardStep {
  id: string;
  category: string;
  icon: string;
  title: string;
  route: string;
  summary: string;
  description: string[];
  keyFeatures: string[];
  customizations: WizardCustomization[];
  proTip?: string;
}

// ─── All Steps ───────────────────────────────────────────────

export const WIZARD_STEPS: WizardStep[] = [
  // ── Welcome ────────────────────────────────────────────────
  {
    id: "welcome",
    category: "Inicio",
    icon: "welcome",
    title: "Bienvenido a Cóndor Salud",
    route: "/dashboard",
    summary: "Tu plataforma unificada de inteligencia para el sistema de salud argentino.",
    description: [
      "Cóndor Salud conecta PAMI, obras sociales, prepagas y AFIP en un solo dashboard. Cada pantalla fue diseñada para reducir rechazos, acelerar cobros y proteger tus ingresos contra la inflación.",
      "Este asistente te va a guiar por cada módulo de la plataforma, explicando qué hace, cómo funciona y cómo personalizarlo para tu práctica específica.",
      "Podés navegar paso a paso con los botones de abajo, o saltar a cualquier sección desde el índice lateral.",
    ],
    keyFeatures: [
      "Dashboard ejecutivo con KPIs en tiempo real",
      "Gestión completa del ciclo de facturación",
      "Inteligencia de rechazos y recupero",
      "Tracker de impacto inflacionario",
      "26 módulos integrados en una sola plataforma",
    ],
    customizations: [
      {
        label: "Nombre de la clínica",
        description: "Se muestra en todo el dashboard. Configuralo en Configuracion > Clinica.",
      },
      {
        label: "Logo personalizado",
        description: "Subí el logo de tu práctica para reportes y facturas.",
      },
      {
        label: "Rol de usuario",
        description:
          "Cada miembro del equipo ve solo lo que necesita según su rol (admin, médico, facturación, recepción).",
      },
    ],
    proTip:
      "Usá los atajos rápidos del dashboard principal para acceder a las funciones que más usás.",
  },

  // ── Dashboard Principal ────────────────────────────────────
  {
    id: "dashboard",
    category: "Inicio",
    icon: "dashboard",
    title: "Dashboard Ejecutivo",
    route: "/dashboard",
    summary: "Vista ejecutiva con los indicadores clave de tu práctica en un solo vistazo.",
    description: [
      "El dashboard principal es tu centro de control. Los 4 KPIs superiores muestran facturación, cobros, rechazos e impacto inflacionario del mes actual, con comparativas contra el mes anterior.",
      "Cada tarjeta KPI es clickeable y te lleva al módulo de detalle correspondiente. Debajo encontrás una tabla de rendimiento por financiador, los accesos rápidos a los 6 módulos más usados, la agenda de hoy y las auditorías pendientes.",
      "El gráfico de barras muestra la evolución de facturado vs. cobrado de los últimos 6 meses, permitiéndote identificar tendencias de mora o mejora.",
    ],
    keyFeatures: [
      "4 KPIs principales con tendencia mensual",
      "Tabla de rendimiento por financiador (facturado, cobrado, % rechazo, días de pago)",
      "6 accesos rápidos a módulos frecuentes",
      "Preview de la agenda del día (próximos 4 turnos)",
      "Auditorías pendientes con severidad y monto",
      "Gráfico de ingresos vs. cobros (6 meses)",
    ],
    customizations: [
      {
        label: "KPIs visibles",
        description:
          "Próximamente podrás elegir qué KPIs mostrar y su orden. Los 4 actuales son los más solicitados por clínicas argentinas.",
      },
      {
        label: "Financiadores activos",
        description:
          "La tabla muestra solo los financiadores con los que trabajás. Configurá los tuyos en Configuracion > Integraciones.",
      },
      {
        label: "Período de comparación",
        description: "Las tendencias comparan contra el mes anterior por defecto.",
      },
    ],
    proTip:
      "Si ves un rechazo alto en PAMI o IOMA (>10%), entrá a Rechazos para identificar los motivos más frecuentes y reprocesar los recuperables.",
  },

  // ── Pacientes ──────────────────────────────────────────────
  {
    id: "pacientes",
    category: "Gestión Clínica",
    icon: "pacientes",
    title: "Gestión de Pacientes",
    route: "/dashboard/pacientes",
    summary: "Registro completo de pacientes con datos demográficos, cobertura y actividad.",
    description: [
      "El módulo de pacientes es tu base de datos centralizada. Cada paciente tiene nombre, DNI, financiador, plan, datos de contacto, fecha de nacimiento y estado (activo/inactivo).",
      "Podés buscar por nombre o DNI, filtrar por financiador o estado, y acceder a la ficha completa de cada paciente haciendo click en su fila. La ficha muestra historia clínica resumida, historial de visitas con códigos de facturación, turnos próximos y resumen de facturación por período.",
      "La vista de detalle del paciente (click en cualquier nombre) muestra el perfil 360° con datos médicos, alergias, medicación crónica, antecedentes, y el historial completo de prestaciones facturadas.",
    ],
    keyFeatures: [
      "Búsqueda en tiempo real por nombre o DNI",
      "Filtros por financiador y estado (activo/inactivo)",
      "Ficha del paciente 360° con datos médicos y de cobertura",
      "Historial de visitas con códigos de nomenclador",
      "Turnos próximos del paciente",
      "Resumen de facturación por período",
    ],
    customizations: [
      {
        label: "Campos personalizados",
        description:
          "Agregá campos específicos de tu especialidad (ej: grupo sanguíneo, antecedentes específicos). Configuracion > Clinica.",
      },
      {
        label: "Financiadores disponibles",
        description:
          "El filtro de financiadores se actualiza automáticamente según los que configuraste en Integraciones.",
      },
      {
        label: "Datos requeridos",
        description:
          "Definí qué campos son obligatorios al registrar un nuevo paciente (DNI siempre es obligatorio por normativa).",
      },
      {
        label: "Estados personalizados",
        description:
          "Además de activo/inactivo, podés agregar estados como 'derivado', 'alta médica', etc.",
      },
    ],
    proTip:
      "Mantené actualizados los datos de financiador y plan de cada paciente — esto previene rechazos por 'afiliado no encontrado' que representan ~15% de los rechazos totales.",
  },

  // ── Agenda ─────────────────────────────────────────────────
  {
    id: "agenda",
    category: "Gestión Clínica",
    icon: "agenda",
    title: "Agenda de Turnos",
    route: "/dashboard/agenda",
    summary: "Calendario semanal con gestión de turnos por profesional y horario.",
    description: [
      "La agenda muestra una grilla semanal (lunes a sábado, 08:00 a 17:00) con los turnos de cada profesional diferenciados por color. Podés filtrar por profesional o ver todos simultáneamente.",
      "Cada turno muestra paciente, tipo de consulta (primera vez, control, estudio, procedimiento) y estado (confirmado, pendiente, cancelado, en espera). Los turnos se pueden crear, modificar y cancelar directamente desde la grilla.",
      "La integración con WhatsApp Business (cuando se configure) envía recordatorios automáticos 24 horas antes de cada turno, reduciendo ausentismo en un 30-40% según datos del sector.",
    ],
    keyFeatures: [
      "Vista semanal con grilla de horarios",
      "Codificación por color por profesional",
      "Filtro por profesional individual o todos",
      "Estados de turno: confirmado, pendiente, cancelado, en espera",
      "Cálculo de tasa de ocupación por profesional",
      "Resumen diario con turnos atendidos, cancelados y disponibles",
    ],
    customizations: [
      {
        label: "Horarios de atención",
        description:
          "Configurá el rango horario de cada profesional (ej: Dr. López 08:00-14:00, Dra. Martínez 14:00-20:00).",
      },
      {
        label: "Duración por defecto",
        description:
          "Definí la duración estándar de cada tipo de turno (consulta: 20 min, control: 15 min, estudio: 30 min).",
      },
      {
        label: "Días de atención",
        description: "Configurá qué días atiende cada profesional y los feriados de tu provincia.",
      },
      {
        label: "Recordatorios automáticos",
        description:
          "Activá recordatorios por email o WhatsApp con horario personalizable (24h, 48h o ambos).",
      },
    ],
    proTip:
      "Configurá turnos de 'primera vez' más largos que los controles. Esto mejora la experiencia del paciente nuevo y reduce sobreturno.",
  },

  // ── Verificación ───────────────────────────────────────────
  {
    id: "verificacion",
    category: "Gestión Clínica",
    icon: "verificacion",
    title: "Verificación de Cobertura",
    route: "/dashboard/verificacion",
    summary: "Consulta de elegibilidad en tiempo real antes de atender al paciente.",
    description: [
      "Verificación permite comprobar la cobertura vigente de un paciente antes de la atención, ingresando su DNI o CUIL. El sistema consulta en tiempo real la base de datos del financiador y devuelve: nombre, plan, vigencia, grupo familiar y prestaciones cubiertas.",
      "Esto previene el error más costoso de la facturación médica: atender sin verificar y después descubrir que el paciente no tiene cobertura vigente o cambió de plan. Un rechazo por 'afiliado no encontrado' demora 30-60 días en resolverse.",
      "Cuando se conecten las APIs de PAMI, Swiss Medical, OSDE y demás financiadores, esta verificación será automática y en tiempo real contra los padrones oficiales.",
    ],
    keyFeatures: [
      "Búsqueda por DNI o CUIL",
      "Resultado en tiempo real con datos de cobertura",
      "Muestra plan, vigencia, grupo familiar",
      "Alerta si la cobertura no está vigente",
      "Historial de verificaciones realizadas",
    ],
    customizations: [
      {
        label: "Verificación automática",
        description:
          "Activá la verificación automática al asignar un turno — el sistema verifica cobertura antes de confirmar.",
      },
      {
        label: "Financiadores consultados",
        description: "Configurá qué financiadores consultar según los que acepta tu práctica.",
      },
      {
        label: "Alerta de vencimiento",
        description:
          "Recibí alertas cuando la cobertura de un paciente con turno próximo está por vencer.",
      },
    ],
    proTip:
      "Verificá cobertura al asignar turno, no el día de la atención. Esto te da tiempo de resolver problemas sin cancelar al paciente.",
  },

  // ── Inventario ─────────────────────────────────────────────
  {
    id: "inventario",
    category: "Gestión Clínica",
    icon: "inventario",
    title: "Inventario Médico",
    route: "/dashboard/inventario",
    summary:
      "Control de stock de insumos, medicamentos y descartables con alertas de mínimo y vencimiento.",
    description: [
      "El módulo de inventario controla todo el stock médico: medicamentos, descartables, insumos de laboratorio, reactivos y equipamiento. Cada ítem tiene stock actual, stock mínimo, fecha de vencimiento, proveedor y costo unitario.",
      "El sistema genera alertas automáticas cuando un ítem cae por debajo del stock mínimo (estado 'Bajo' o 'Crítico') o cuando se acerca el vencimiento. El valor total del inventario se calcula automáticamente.",
      "Los filtros permiten ver por categoría (Medicamento, Descartable, Insumo, Reactivo, Equipamiento) y por estado (OK, Bajo, Crítico, Vencido).",
    ],
    keyFeatures: [
      "5 categorías de insumos (medicamento, descartable, insumo, reactivo, equipamiento)",
      "Alertas de stock mínimo y vencimiento próximo",
      "4 estados: OK, Bajo, Crítico, Vencido",
      "Búsqueda por nombre o código",
      "Valor total del inventario",
      "Cálculo automático de necesidades de reposición",
    ],
    customizations: [
      {
        label: "Stock mínimo por ítem",
        description: "Definí el umbral de alerta para cada insumo según tu consumo mensual.",
      },
      {
        label: "Proveedores",
        description: "Asociá proveedores a cada ítem para generar órdenes de compra rápidas.",
      },
      {
        label: "Alertas de vencimiento",
        description:
          "Configurá con cuántos meses de anticipación recibir alerta (por defecto: 6 meses).",
      },
      {
        label: "Categorías custom",
        description:
          "Agregá categorías específicas de tu especialidad (ej: Prótesis, Material quirúrgico).",
      },
    ],
    proTip:
      "Revisá el inventario los viernes — así tenés tiempo de pedir reposición antes de que falte algo el lunes.",
  },

  // ── Facturación ────────────────────────────────────────────
  {
    id: "facturacion",
    category: "Finanzas",
    icon: "facturacion",
    title: "Facturación",
    route: "/dashboard/facturacion",
    summary:
      "Gestión completa de facturas por financiador con filtros, estados y métricas de cobro.",
    description: [
      "El módulo de facturación centraliza todas las facturas emitidas. Los 4 KPIs superiores muestran: total facturado, cobrado (con %), pendiente de cobro y rechazado — calculados automáticamente sobre los datos reales.",
      "Cada factura muestra número, fecha, financiador, paciente, prestación, código de nomenclador, monto y estado (presentada, cobrada, rechazada, pendiente, en observación). Los filtros por financiador y estado permiten encontrar cualquier factura rápidamente.",
      "Cuando se conecte la integración con AFIP (WSFEV1), las facturas se emitirán electrónicamente con CAE automático. La integración ya está preparada en el sistema — solo falta configurar el certificado digital.",
    ],
    keyFeatures: [
      "4 KPIs financieros calculados en tiempo real",
      "Filtros por financiador (PAMI, OSDE, Swiss Medical, etc.) y estado",
      "5 estados de factura con seguimiento visual",
      "Código de nomenclador asociado a cada prestación",
      "Acción de detalle por factura",
      "Preparado para factura electrónica AFIP (Factura C con CAE)",
    ],
    customizations: [
      {
        label: "Financiadores activos",
        description:
          "Mostrá solo los financiadores con los que trabajás. Configurá en Integraciones.",
      },
      {
        label: "Numeración de factura",
        description: "Configurá el punto de venta y la serie de numeración AFIP de tu práctica.",
      },
      {
        label: "Reglas de facturación",
        description:
          "Definí reglas automáticas: agrupar prestaciones del mismo día, facturar al final de la semana, etc.",
      },
      {
        label: "Tipo de comprobante",
        description:
          "Factura C (monotributo), Factura B (responsable inscripto a consumidor final), o Factura A (a otro RI).",
      },
    ],
    proTip:
      "Presentá facturas a PAMI antes del 5 de cada mes — las presentaciones tardías tienen el doble de rechazos según datos del sector.",
  },

  // ── Rechazos ───────────────────────────────────────────────
  {
    id: "rechazos",
    category: "Finanzas",
    icon: "rechazos",
    title: "Gestión de Rechazos",
    route: "/dashboard/rechazos",
    summary: "Auditoría, reprocesamiento y recupero de facturas rechazadas por financiadores.",
    description: [
      "El módulo de rechazos es donde recuperás dinero. Los 4 KPIs muestran: total rechazado, pendientes de gestión, reprocesables (que podés corregir y reenviar) y la tasa de recupero actual.",
      "Cada rechazo muestra el número de factura, financiador, paciente, prestación, monto, motivo detallado y si es reprocesable. Los 7 motivos más comunes son: código inválido, afiliado no encontrado, factura vencida, duplicada, sin autorización, datos incompletos, y nomenclador desactualizado.",
      "La vista expandible de cada rechazo muestra el detalle del motivo con la acción correctiva sugerida. Los rechazos reprocesables se pueden corregir y reenviar directamente desde el sistema.",
    ],
    keyFeatures: [
      "4 KPIs: total rechazado, pendientes, reprocesables, tasa de recupero",
      "7 motivos de rechazo categorizados",
      "Distribución visual de rechazos por motivo",
      "Análisis por financiador (cuál rechaza más y por qué)",
      "Vista expandible con motivo detallado y acción correctiva",
      "Filtros por financiador y estado (pendiente, reprocesado, descartado)",
      "Badge 'Reprocesable' para identificar los que se pueden corregir",
    ],
    customizations: [
      {
        label: "Reglas de reproceso",
        description:
          "Definí reglas automáticas: ej. si el motivo es 'nomenclador desactualizado', actualizar código y reenviar automáticamente.",
      },
      {
        label: "Alertas de rechazo",
        description:
          "Recibí notificación inmediata cuando llega un rechazo de alto monto (configurá el umbral).",
      },
      {
        label: "Asignación de gestión",
        description: "Asigná rechazos a miembros del equipo de facturación para seguimiento.",
      },
      {
        label: "SLA de gestión",
        description:
          "Definí plazos máximos para gestionar cada rechazo (ej: 5 días para pendientes).",
      },
    ],
    proTip:
      "Los rechazos reprocesables son dinero que ya facturaste y podés recuperar corrigiendo un error. Priorizalos por monto — un rechazo de $85K vale más que 10 de $5K.",
  },

  // ── Financiadores ──────────────────────────────────────────
  {
    id: "financiadores",
    category: "Finanzas",
    icon: "financiadores",
    title: "Análisis de Financiadores",
    route: "/dashboard/financiadores",
    summary:
      "Comparativa de rendimiento por obra social y prepaga: facturado, cobrado, rechazos y demora.",
    description: [
      "El módulo de financiadores compara el rendimiento de cada obra social y prepaga con la que trabajás. Los 4 KPIs globales muestran: total facturado, total cobrado (con %), rechazo promedio ponderado y días de pago promedio.",
      "La tabla detallada muestra por cada financiador: monto facturado, monto cobrado, tasa de rechazo (con color semáforo), días promedio de pago, facturas pendientes, último pago y tipo (PAMI, Obra Social, Prepaga).",
      "Esta vista te permite identificar rápidamente qué financiadores son más rentables (cobran rápido, rechazan poco) y cuáles requieren más gestión. Es clave para decidir si conviene seguir trabajando con un financiador que rechaza mucho o demora demasiado.",
    ],
    keyFeatures: [
      "4 KPIs globales con promedios ponderados",
      "Tabla comparativa de todos los financiadores",
      "Semáforo de tasa de rechazo (verde <5%, amarillo 5-10%, rojo >10%)",
      "Semáforo de días de pago (rojo >60 días)",
      "Clasificación por tipo: PAMI, Obra Social, Prepaga",
      "Contacto y última liquidación por financiador",
    ],
    customizations: [
      {
        label: "Financiadores visibles",
        description: "Mostrá solo las obras sociales y prepagas con las que trabajás activamente.",
      },
      {
        label: "Umbrales de alerta",
        description:
          "Configurá tus propios umbrales de rechazo (ej: alerta si PAMI supera 15%) y demora de pago.",
      },
      {
        label: "Datos de contacto",
        description:
          "Guardá el email/teléfono de tu contacto en cada financiador para gestión rápida.",
      },
      {
        label: "Ranking personalizado",
        description:
          "Ordená por facturado, cobrado, rechazo o días de pago según lo que más te importe.",
      },
    ],
    proTip:
      "Si un financiador tiene >60 días de demora promedio, considerá presentar un reclamo formal. PAMI y las obras sociales nacionales tienen plazos legales de pago de 60 días.",
  },

  // ── Inflación ──────────────────────────────────────────────
  {
    id: "inflacion",
    category: "Finanzas",
    icon: "inflacion",
    title: "Impacto Inflacionario",
    route: "/dashboard/inflacion",
    summary: "Calculadora de pérdida real por desfase entre facturación, cobro e IPC mensual.",
    description: [
      "Este es un módulo único de Cóndor Salud, diseñado específicamente para la realidad argentina. Calcula cuánto dinero perdés realmente por la combinación de: (a) inflación mensual, (b) demora en cobros, y (c) aranceles que no se actualizan al ritmo del IPC.",
      "El gráfico de barras muestra la pérdida real en pesos por mes. La tabla detalla: IPC del mes, facturado, cobrado, días de demora promedio, y la pérdida calculada como (monto_cobrado × IPC × dias_demora / 30).",
      "La vista por financiador muestra quién te genera más pérdida: PAMI e IOMA, con 62 y 75 días de demora, provocan pérdidas muy superiores a Swiss Medical con 28 días.",
    ],
    keyFeatures: [
      "IPC mensual de los últimos 6 meses",
      "Cálculo de pérdida real por desfase cobro-inflación",
      "Gráfico de barras de pérdida por mes",
      "Análisis por financiador: quién genera más pérdida",
      "Total acumulado de pérdida por inflación",
      "Comparativa días de demora vs. % de pérdida",
    ],
    customizations: [
      {
        label: "Fuente de IPC",
        description:
          "Por defecto usa IPC INDEC. Podés configurar un índice alternativo (ej: IPC de tu provincia).",
      },
      {
        label: "Fórmula de cálculo",
        description:
          "Ajustá la fórmula de pérdida según cómo actualizás aranceles (mensual, trimestral, anual).",
      },
      {
        label: "Alertas de umbral",
        description:
          "Recibí alerta cuando la pérdida acumulada supera un monto (ej: alerta si >$500K de pérdida mensual).",
      },
    ],
    proTip:
      "Usá este módulo para negociar con financiadores: si PAMI te genera $300K de pérdida por inflación por demora de 62 días, tenés un argumento cuantificado para pedir pagos más rápidos.",
  },

  // ── Auditoría ──────────────────────────────────────────────
  {
    id: "auditoria",
    category: "Inteligencia",
    icon: "auditoria",
    title: "Auditoría Pre-facturación",
    route: "/dashboard/auditoria",
    summary: "Detección automática de errores de facturación antes de presentar a financiadores.",
    description: [
      "La auditoría pre-facturación es tu control de calidad. Antes de presentar facturas a un financiador, el sistema revisa automáticamente cada prestación buscando: códigos incorrectos, falta de autorización, duplicaciones, topes superados, frecuencia inusual, valores discrepantes y documentación faltante.",
      "Cada hallazgo se clasifica por severidad (alta, media, baja) y estado (pendiente, revisado, resuelto). Los de severidad alta bloquean la presentación — son errores que causarán rechazo seguro.",
      "Filtros por severidad y estado permiten enfocarse en lo urgente. El detalle de cada hallazgo incluye la acción correctiva sugerida, reduciendo el tiempo de resolución.",
    ],
    keyFeatures: [
      "Detección automática de 7+ tipos de error",
      "3 niveles de severidad: alta (bloqueante), media, baja",
      "3 estados de gestión: pendiente, revisado, resuelto",
      "Filtros por severidad y estado",
      "Detalle con acción correctiva sugerida",
      "Cálculo de monto en riesgo por hallazgo",
    ],
    customizations: [
      {
        label: "Reglas de auditoría",
        description:
          "Activá/desactivá reglas según tu práctica. Ej: si hacés cirugías, activá la regla de 'autorización previa obligatoria'.",
      },
      {
        label: "Severidad por regla",
        description:
          "Ajustá la severidad de cada regla. Ej: 'duplicado potencial' puede ser media en vez de alta si tenés muchos controles semanales.",
      },
      {
        label: "Automatización",
        description:
          "Configurá la auditoría para ejecutarse automáticamente antes de cada presentación a financiador.",
      },
      {
        label: "Excepciones",
        description:
          "Definí excepciones permanentes (ej: un paciente crónico que sí requiere 2 RMN por mes).",
      },
    ],
    proTip:
      "La auditoría previene rechazos antes de que ocurran. Un rechazo evitado es 60-90 días de gestión que te ahorrás.",
  },

  // ── Nomenclador ────────────────────────────────────────────
  {
    id: "nomenclador",
    category: "Inteligencia",
    icon: "nomenclador",
    title: "Nomenclador de Prestaciones",
    route: "/dashboard/nomenclador",
    summary:
      "Base de códigos SSS con aranceles actualizados por financiador y alertas de actualización.",
    description: [
      "El nomenclador es la referencia de todos los códigos de prestación reconocidos por la Superintendencia de Servicios de Salud (SSS). Cada código tiene: descripción, capítulo, valor unitario SSS, y el arancel específico que paga cada financiador (PAMI, OSDE, Swiss Medical).",
      "Los códigos están organizados por capítulo: Consultas, Laboratorio, Diagnóstico por Imágenes, Cardiología, Rehabilitación, Cirugías. La búsqueda y filtro por capítulo permiten encontrar cualquier código rápidamente.",
      "El sistema te alerta cuando un financiador actualiza sus aranceles, para que actualices tus valores de facturación y evites rechazos por 'nomenclador desactualizado'.",
    ],
    keyFeatures: [
      "Base completa de códigos SSS",
      "Arancel por financiador (SSS, PAMI, OSDE, Swiss Medical)",
      "Organización por capítulo (6 capítulos)",
      "Búsqueda por código o descripción",
      "Filtro por capítulo",
      "Alertas de actualización arancelaria",
    ],
    customizations: [
      {
        label: "Códigos favoritos",
        description:
          "Marcá los códigos que más usás para accederlos rápido (ej: consulta clínica 420101, ECG 420607).",
      },
      {
        label: "Financiadores en tabla",
        description:
          "Mostrá solo las columnas de aranceles de los financiadores con los que trabajás.",
      },
      {
        label: "Alertas de cambio",
        description:
          "Recibí notificación cuando un arancel que usás frecuentemente cambia de valor.",
      },
      {
        label: "Nomenclador propio",
        description:
          "Agregá tus propios códigos internos mapeados a los oficiales (útil para prácticas con nomenclador propio).",
      },
    ],
    proTip:
      "El 12% de los rechazos son por 'nomenclador desactualizado'. Mantené actualizada esta tabla después de cada resolución de la SSS.",
  },

  // ── Reportes ───────────────────────────────────────────────
  {
    id: "reportes",
    category: "Inteligencia",
    icon: "reportes",
    title: "Centro de Reportes",
    route: "/dashboard/reportes",
    summary:
      "10 reportes predefinidos en PDF y Excel para análisis financiero, operativo y ejecutivo.",
    description: [
      "El centro de reportes ofrece 10 informes prediseñados organizados en 5 categorías: Finanzas (facturación mensual, cobranzas pendientes, impacto inflacionario, ranking de financiadores), Gestión Clínica (pacientes activos, agenda ocupacional), Calidad (rechazos por motivo, auditoría de prestaciones), Operaciones (inventario crítico), y Ejecutivo (indicadores KPI).",
      "Cada reporte muestra su última fecha de generación, formato disponible (PDF, Excel, o ambos) y frecuencia recomendada. El historial de generación registra quién generó cada reporte, cuándo y en qué formato.",
      "Los reportes están pensados para tres audiencias: el director médico (ejecutivo), el equipo de facturación (financiero) y el equipo operativo (clínico). Podés generar uno individual o todos los de una categoría.",
    ],
    keyFeatures: [
      "10 reportes prediseñados (PDF + Excel)",
      "5 categorías: Finanzas, Gestión Clínica, Calidad, Operaciones, Ejecutivo",
      "Historial de generación con usuario, fecha y formato",
      "Filtro por categoría",
      "Generación individual o por lote",
      "Links directos al módulo fuente de cada reporte",
    ],
    customizations: [
      {
        label: "Reportes favoritos",
        description:
          "Marcá los que generás mensualmente para accederlos desde el dashboard principal.",
      },
      {
        label: "Envío automático",
        description:
          "Configurá el envío automático por email al cierre de mes (ej: reporte ejecutivo al director el 1° de cada mes).",
      },
      {
        label: "Logo en reportes",
        description:
          "Los reportes PDF incluyen el logo y datos de tu clínica. Configurá en Clínica.",
      },
      {
        label: "Período personalizado",
        description: "Elegí el rango de fechas para cada reporte (por defecto: mes actual).",
      },
    ],
    proTip:
      "Generá el reporte 'Ranking de financiadores' antes de reuniones con tu contador — resume todo el estado financiero en una página.",
  },

  // ── Alertas ────────────────────────────────────────────────
  {
    id: "alertas",
    category: "Sistema",
    icon: "alertas",
    title: "Centro de Alertas",
    route: "/dashboard/alertas",
    summary:
      "Notificaciones inteligentes sobre pagos, rechazos, vencimientos, aranceles e inventario.",
    description: [
      "El centro de alertas concentra todas las notificaciones del sistema en un solo lugar. Las alertas se organizan en 6 categorías: Pagos (acreditaciones, demoras), Rechazos (nuevos rechazos), Aranceles (actualizaciones de nomenclador), Inventario (stock bajo, vencimientos), Vencimientos (plazos de presentación) y Sistema (backups, actualizaciones).",
      "Cada alerta tiene un nivel de prioridad (Urgente, Alta, Media, Baja) con codificación visual, y un botón de acción que te lleva directamente al módulo relevante. Las alertas no leídas se muestran con el badge en el menú lateral.",
      "Los filtros permiten ver por categoría y alternar entre 'todas' y 'solo no leídas'. Las alertas urgentes (stock crítico, demoras >90 días) se destacan con borde rojo.",
    ],
    keyFeatures: [
      "6 categorías de alertas",
      "4 niveles de prioridad con color semáforo",
      "Estado leída/no leída con badge en sidebar",
      "Acción directa: botón que lleva al módulo relevante",
      "Filtros por categoría y estado de lectura",
      "Resumen: total no leídas y total urgentes",
    ],
    customizations: [
      {
        label: "Canales de notificación",
        description:
          "Elegí cómo recibir cada tipo de alerta: en-app, email, push, o WhatsApp. Configurá en Notificaciones.",
      },
      {
        label: "Prioridades personalizadas",
        description:
          "Ajustá qué prioridad asignar a cada tipo de evento (ej: 'stock bajo' puede ser Media en vez de Urgente si tenés proveedor rápido).",
      },
      {
        label: "Silenciar temporalmente",
        description:
          "Silenciá alertas de una categoría por un período (ej: silenciar Sistema durante una migración).",
      },
      {
        label: "Horario de alertas",
        description:
          "Definí en qué horario recibir alertas por email/WhatsApp (ej: solo de 08:00 a 20:00).",
      },
    ],
    proTip:
      "Priorizá siempre las alertas de 'Vencimiento de presentación' — perder el plazo de presentación significa perder el cobro completo.",
  },

  // ── Configuración ──────────────────────────────────────────
  {
    id: "configuracion",
    category: "Sistema",
    icon: "configuracion",
    title: "Configuración del Sistema",
    route: "/dashboard/configuracion",
    summary: "Hub central con 5 módulos de configuración para personalizar la plataforma.",
    description: [
      "La configuración tiene 5 sub-módulos que controlan todo el comportamiento de la plataforma:",
      "• **Datos de la Clínica**: Nombre, razón social, CUIT, matrícula, director médico, dirección, teléfono, email. Estos datos aparecen en facturas y reportes.",
      "• **Equipo**: Gestión de miembros del equipo con 4 roles (Administrador, Médico, Facturación, Recepción). Cada rol tiene permisos específicos — un médico no ve facturación, una recepcionista no ve auditoría.",
      "• **Integraciones**: Conexiones con PAMI, AFIP, Swiss Medical, OSDE, Galeno, WhatsApp, IOMA, Medifé. Estado en tiempo real (conectado, error, desconectado, pendiente) con última sincronización.",
      "• **Facturación & Plan**: Tu plan actual (Starter/Pro/Enterprise), uso de cuota, método de pago, y comparación de planes para upgrade.",
      "• **Notificaciones**: 13 toggles para controlar qué notificaciones recibir por email, push y con qué frecuencia (diario, semanal, mensual).",
    ],
    keyFeatures: [
      "5 sub-módulos de configuración",
      "4 roles de usuario con permisos granulares",
      "8 integraciones con estado en tiempo real",
      "Gestión de plan y facturación del servicio",
      "13 preferencias de notificación configurables",
      "Invitación de nuevos miembros por email",
    ],
    customizations: [
      {
        label: "Roles personalizados",
        description:
          "Además de los 4 roles base, podés crear roles custom con permisos específicos (ej: 'Auditor' con acceso solo a Auditoría y Nomenclador).",
      },
      {
        label: "Multi-sede",
        description:
          "En planes Growth y Enterprise, configurá múltiples sedes con datos independientes.",
      },
      {
        label: "Branding",
        description:
          "Subí tu logo, elegí colores para reportes y configurá el encabezado de facturas.",
      },
      {
        label: "Backup de datos",
        description:
          "Configurá la frecuencia de backup y la retención (por defecto: diario, 30 días).",
      },
    ],
    proTip:
      "Configurá los roles del equipo antes de invitar miembros. Un error común es dar acceso de Admin a todos — solo el titular de la clínica necesita Admin.",
  },
];

// ─── Category grouping ──────────────────────────────────────

export const WIZARD_CATEGORIES = [
  { name: "Inicio", icon: "Inicio", stepIds: ["welcome", "dashboard"] },
  {
    name: "Gestión Clínica",
    icon: "Gestion Clinica",
    stepIds: ["pacientes", "agenda", "verificacion", "inventario"],
  },
  {
    name: "Finanzas",
    icon: "Finanzas",
    stepIds: ["facturacion", "rechazos", "financiadores", "inflacion"],
  },
  { name: "Inteligencia", icon: "Inteligencia", stepIds: ["auditoria", "nomenclador", "reportes"] },
  { name: "Sistema", icon: "Sistema", stepIds: ["alertas", "configuracion"] },
];

// ─── Context ─────────────────────────────────────────────────

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  step: WizardStep;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  canNext: boolean;
  canPrev: boolean;
  progress: number;
  completedSteps: Set<number>;
  markComplete: (index: number) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = WIZARD_STEPS.length;
  const step = WIZARD_STEPS[currentStep];
  const canNext = currentStep < totalSteps - 1;
  const canPrev = currentStep > 0;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStep(index);
        setCompletedSteps((prev) => {
          const next = new Set(Array.from(prev));
          next.add(currentStep);
          return next;
        });
      }
    },
    [currentStep, totalSteps],
  );

  const next = useCallback(() => {
    if (canNext) {
      setCompletedSteps((prev) => {
        const n = new Set(Array.from(prev));
        n.add(currentStep);
        return n;
      });
      setCurrentStep((s) => s + 1);
    }
  }, [canNext, currentStep]);

  const prev = useCallback(() => {
    if (canPrev) setCurrentStep((s) => s - 1);
  }, [canPrev]);

  const markComplete = useCallback((index: number) => {
    setCompletedSteps((prev) => {
      const n = new Set(Array.from(prev));
      n.add(index);
      return n;
    });
  }, []);

  const value = useMemo(
    () => ({
      currentStep,
      totalSteps,
      step,
      goTo,
      next,
      prev,
      canNext,
      canPrev,
      progress,
      completedSteps,
      markComplete,
    }),
    [
      currentStep,
      totalSteps,
      step,
      goTo,
      next,
      prev,
      canNext,
      canPrev,
      progress,
      completedSteps,
      markComplete,
    ],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
