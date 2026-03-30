# 📋 Guía para Recepcionistas — Centro Médico Roca

> **Cóndor Salud** · Versión 1.0 · Marzo 2026
>
> Esta guía explica paso a paso cómo usar el sistema para las tareas diarias de recepción:
> registrar pacientes, agendar turnos y gestionar la disponibilidad de los profesionales.

---

## 🔑 Cómo ingresar al sistema

1. Abrí el navegador (Chrome o Safari) e ingresá a **condorsalud.com/auth/login**
2. Escribí tu **email** y **contraseña** (te los dio el Dr. Francisco o el administrador)
3. Hacé clic en **Iniciar sesión**
4. Vas a ver el **Panel principal** con el menú a la izquierda

> **💡 Tip:** Si olvidás tu contraseña, hacé clic en "¿Olvidaste tu contraseña?" en la pantalla de login.

---

## 👤 Cómo registrar un paciente nuevo

Los pacientes se registran primero como **consulta nueva** (un potencial paciente) y después se convierten en pacientes del sistema.

### Paso 1 — Crear la consulta

1. En el menú de la izquierda, hacé clic en **Pacientes**
2. Vas a ver arriba tres pestañas. Asegurate de estar en **📥 Consultas nuevas**
3. Hacé clic en el botón verde **+ Nueva consulta** (arriba a la derecha)
4. Se crea automáticamente una nueva ficha de consulta

### Paso 2 — Completar los datos del paciente

Cuando hacés clic en la consulta nueva, se abre un panel a la derecha con los datos. Completá:

| Campo           | Qué poner                     | Ejemplo                             |
| --------------- | ----------------------------- | ----------------------------------- |
| **Nombre**      | Nombre completo del paciente  | María García López                  |
| **Teléfono**    | Celular con código de área    | 299-4551234                         |
| **Email**       | Email del paciente (si tiene) | maria@gmail.com                     |
| **Financiador** | Obra social o prepaga         | PAMI, OSDE, Swiss Medical, etc.     |
| **Motivo**      | Por qué consulta              | "Dolor de espalda", "Control anual" |

### Paso 3 — Avanzar en el estado

Debajo del nombre vas a ver botones de **estado**. Movelos según avance la gestión:

```
📥 Nuevo → 📞 Contactado → 💡 Interesado → 📅 Turno agendado → ✅ Convertido
```

- **Nuevo**: Acaba de llegar la consulta
- **Contactado**: Ya lo llamaste o le escribiste
- **Interesado**: Quiere sacar turno
- **Turno agendado**: Ya tiene turno asignado
- **Convertido**: Ya es paciente del centro (aparece en la pestaña Pacientes)

> **⚠️ Importante:** Cuando marcás "Convertido", el paciente aparece automáticamente en la pestaña **Pacientes** con toda su información.

### Paso 4 — Verificar en la lista de pacientes

1. Hacé clic en la pestaña **👥 Pacientes** (la segunda pestaña)
2. Buscalo por nombre o DNI en el buscador
3. Hacé clic en **Ver ficha** para ver todos sus datos

---

## 📅 Cómo agendar un turno

### Opción A — Desde la Agenda (lo más común)

#### Paso 1 — Ir a la Agenda

1. En el menú de la izquierda, hacé clic en **Agenda**
2. Vas a ver el calendario de la semana con los turnos ya agendados

#### Paso 2 — Crear un nuevo turno

1. Hacé clic en el botón **+ Nuevo turno** (arriba a la derecha)
2. Se abre un formulario. Completá los campos:

| Campo              | Qué poner                       | Ejemplo                                                                    |
| ------------------ | ------------------------------- | -------------------------------------------------------------------------- |
| **📆 Fecha**       | El día del turno                | 2026-04-02                                                                 |
| **🕐 Hora**        | La hora del turno (cada 30 min) | 10:00                                                                      |
| **👤 Paciente**    | Nombre del paciente             | María García López                                                         |
| **👨‍⚕️ Profesional** | Elegí el médico de la lista     | Dr. Vargas Freddy                                                          |
| **📋 Tipo**        | Tipo de consulta                | Consulta / Control / Primera vez / Ecografía / Laboratorio / Procedimiento |
| **🏥 Financiador** | Obra social del paciente        | PAMI / OSDE 310 / Swiss Medical / Particular / etc.                        |
| **📝 Notas**       | Algo importante (opcional)      | "Traer estudios previos"                                                   |

#### Paso 3 — Confirmar

1. Revisá que todos los datos estén correctos
2. Hacé clic en **Crear turno**
3. El turno aparece en el calendario con estado **Pendiente** (amarillo)

> **⚠️ Si hay conflicto:** Si el profesional ya tiene un turno a esa hora, el sistema te va a avisar automáticamente. Elegí otro horario.

#### Paso 4 — Gestionar el turno

En la vista de **Lista** (hacé clic en el botón "Lista" arriba), cada turno tiene botones de acción:

| Botón           | Qué hace                      | Cuándo usarlo                         |
| --------------- | ----------------------------- | ------------------------------------- |
| **✓ Confirmar** | Cambia a "Confirmado" (verde) | Cuando el paciente confirma que viene |
| **🕐 Atender**  | Cambia a "Atendido" (azul)    | Cuando el paciente ya fue atendido    |
| **✕ Cancelar**  | Cambia a "Cancelado" (rojo)   | Cuando el paciente cancela            |

---

### Opción B — Desde la ficha del paciente

1. Andá a **Pacientes** → pestaña **👥 Pacientes**
2. Buscá al paciente y hacé clic en **Ver ficha**
3. En la ficha, hacé clic en el botón **Agendar turno**
4. Te lleva a la **Agenda** donde seguís los mismos pasos de arriba

---

## 🌐 Cómo gestionar turnos que llegan por la web

Los pacientes pueden sacar turnos solos desde la página pública del centro:
**condorsalud.com/reservar/centro-medico-roca**

Esos turnos aparecen en una sección especial:

#### Paso 1 — Ver los turnos online

1. En el menú de la izquierda, hacé clic en **Turnos Online**
2. Vas a ver una tabla con todos los turnos que llegaron desde la web

#### Paso 2 — Revisar cada turno

Cada turno muestra:

- **Paciente**: Nombre, email y teléfono
- **Médico**: A quién eligió el paciente
- **Fecha y hora**: Cuándo es el turno
- **Tipo**: Si es presencial o teleconsulta
- **Estado**: Pendiente, confirmado, etc.

#### Paso 3 — Confirmar o cancelar

| Acción        | Cuándo                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| **Confirmar** | Después de verificar que el horario está bien y hay disponibilidad       |
| **Cancelar**  | Si hay algún problema con el horario o el profesional no atiende ese día |

#### Paso 4 — Después de la consulta

| Acción         | Cuándo                          |
| -------------- | ------------------------------- |
| **Completar**  | El paciente vino y fue atendido |
| **No asistió** | El paciente no se presentó      |

> **💡 Tip:** Podés filtrar por estado (pendiente, confirmado, etc.) y por fecha usando los filtros de arriba.

---

## ⏰ Cómo ver y modificar la disponibilidad de los profesionales

La disponibilidad determina qué horarios aparecen como libres para agendar turnos.

#### Paso 1 — Ir a Disponibilidad

1. En el menú de la izquierda, hacé clic en **Disponibilidad**
2. Vas a ver una grilla con los horarios de la semana (lunes a sábado, de 08:00 a 19:30)

#### Paso 2 — Elegir el profesional

1. Arriba hay un **menú desplegable** con los profesionales
2. Elegí el médico cuya disponibilidad querés ver o modificar
3. La grilla se actualiza mostrando sus horarios

#### Paso 3 — Entender los colores

| Color             | Significado                                     |
| ----------------- | ----------------------------------------------- |
| ⬜ **Gris claro** | No disponible (sin turno posible)               |
| 🟩 **Verde**      | Disponible (se pueden agendar turnos)           |
| 🟥 **Rojo**       | Ya tiene un turno agendado (no se puede quitar) |

#### Paso 4 — Agregar disponibilidad

1. Hacé clic en una celda **gris** (vacía) para marcarla como disponible
2. La celda cambia a un **borde celeste punteado** (pendiente de guardar)
3. Repetí para todos los horarios que el profesional atiende

#### Paso 5 — Quitar disponibilidad

1. Hacé clic en una celda **verde** (disponible) para quitarla
2. La celda cambia a un **borde rojo punteado** (pendiente de guardar)
3. Las celdas **rojas** (con turno) no se pueden quitar — primero cancelá el turno

#### Paso 6 — Guardar

1. Cuando terminés de hacer cambios, hacé clic en **Guardar cambios** (arriba a la derecha)
2. Los cambios se aplican inmediatamente

> **💡 Tip:** Podés navegar entre semanas con las flechas ← → de arriba. El botón "Hoy" te lleva a la semana actual.

---

## 🔍 Guía rápida: ¿Con qué profesional agendo?

### Por especialidad

| Especialidad                          | Profesionales                               |
| ------------------------------------- | ------------------------------------------- |
| **Clínica Médica / Medicina General** | Dr. Vargas Freddy · Dra. Irene Gutiérrez    |
| **Traumatología**                     | Dr. Álvaro Contreras · Dr. Maximiliano Ríos |
| **Ginecología**                       | Dra. Pamela Núñez · Dra. Valeria González   |
| **Pediatría**                         | Dra. Mariela Figueroa · Dra. Carolina Nigro |
| **Cardiología**                       | Dr. Emilio Fuentes                          |
| **Dermatología**                      | Dra. Lorena Castro                          |
| **Oftalmología**                      | Dr. Sergio Navarro                          |
| **Otorrinolaringología (ORL)**        | Dr. Pablo Herrera                           |
| **Urología**                          | Dr. Federico Romero                         |
| **Endocrinología**                    | Dra. Andrea Morales                         |
| **Gastroenterología**                 | Dr. Ricardo Delgado                         |
| **Neurología**                        | Dra. Camila Soria                           |
| **Kinesiología / Fisioterapia**       | Lic. Natalia Vega · Lic. Martín Rivas       |
| **Nutrición**                         | Lic. Carolina Méndez                        |
| **Psicología**                        | Lic. Verónica Aguirre · Lic. Julieta Luna   |
| **Fonoaudiología**                    | Lic. Daniela Peralta                        |
| **Enfermería**                        | Enf. Claudia Bustos                         |
| **Ecografía**                         | Dr. Leandro Torres                          |
| **Laboratorio**                       | Dra. Silvia Ramírez                         |
| **Odontología**                       | Dr. Gustavo Peña                            |
| **Psiquiatría**                       | Dr. Rubén Acosta                            |
| **Neumonología**                      | Dra. Mariana Iglesias                       |

### Profesionales que atienden cada quince días

Estos profesionales vienen semanas alternadas — verificá en **Disponibilidad** si tienen horarios cargados esa semana:

- **Dr. Alejandro Urbieta** (Traumatología)
- **Dr. Gabriel Angelotti** (Cirugía)
- **Dra. Patricia Jiménez** (Reumatología)

---

## 📱 Mensajes de WhatsApp

Podés ver y responder mensajes de pacientes desde el sistema:

1. Andá a **Pacientes** → pestaña **💬 Mensajes**
2. A la izquierda ves las conversaciones, a la derecha los mensajes
3. Hacé clic en una conversación para leerla
4. Escribí tu respuesta abajo y hacé clic en **Enviar**

---

## ❓ Problemas frecuentes

### "No puedo crear un turno"

- Verificá que el profesional tenga **disponibilidad cargada** para ese día y hora
- Revisá que no haya **conflicto** con otro turno a la misma hora
- Probá otro horario cercano

### "No encuentro un paciente"

- Buscá por **nombre** o por **DNI** en la pestaña Pacientes
- Si es un paciente nuevo, primero hay que crearlo como **consulta nueva** (pestaña Consultas nuevas)

### "Un profesional no aparece en la lista"

- Verificá en **Disponibilidad** que tenga horarios cargados para esa semana
- Si no aparece, avisale al Dr. Francisco o al administrador

### "Llegó un turno online pero no sé si está bien"

- Andá a **Turnos Online**, revisá los datos del paciente y del profesional
- Si todo está correcto, hacé clic en **Confirmar**
- Si hay un problema, hacé clic en **Cancelar** y contactá al paciente

---

## 📞 ¿Necesitás ayuda?

- **Dr. Francisco López** (Administrador): flopezmd@gmail.com
- **Soporte Cóndor Salud**: Escribí por WhatsApp desde el ícono verde que aparece abajo a la derecha en el sistema

---

> **Recordá:** Este sistema está en constante mejora. Si ves algo que no funciona como esperás o tenés una sugerencia, avisale al Dr. Francisco. ¡Tu feedback nos ayuda a mejorar! 🚀
