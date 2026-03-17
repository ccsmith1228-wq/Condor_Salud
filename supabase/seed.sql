-- =============================================================================
-- Cóndor Salud — Seed Data for First Client
-- Run AFTER all 5 migrations. Uses service_role or direct SQL Editor.
-- =============================================================================

-- ─── 1. Create the first clinic ──────────────────────────────────────────────
INSERT INTO clinics (id, name, cuit, plan_tier, sedes, provincia, localidad, especialidad, phone, email, address, active, onboarding_complete)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Clínica San Martín',
  '30-71234567-9',
  'enterprise',
  1,
  'CABA',
  'Palermo',
  'Clínica médica general',
  '+54 11 5514-0371',
  'admin@condorsalud.com.ar',
  'Av. San Martín 1520, Piso 2°, CABA',
  true,
  true
)
ON CONFLICT DO NOTHING;

-- ─── 2. Financiadores (payers) ───────────────────────────────────────────────
INSERT INTO financiadores (clinic_id, name, type, facturado, cobrado, tasa_rechazo, dias_promedio_pago, facturas_pendientes, convenio_vigente)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'PAMI', 'pami', 0, 0, 0, 68, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'OSDE', 'prepaga', 0, 0, 0, 32, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'Swiss Medical', 'prepaga', 0, 0, 0, 28, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'Galeno', 'prepaga', 0, 0, 0, 35, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'Medifé', 'prepaga', 0, 0, 0, 40, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'IOMA', 'os', 0, 0, 0, 82, 0, true),
  ('00000000-0000-0000-0000-000000000001', 'OSECAC', 'os', 0, 0, 0, 45, 0, true)
ON CONFLICT (clinic_id, name) DO NOTHING;

-- ─── 3. Initial inventory items ──────────────────────────────────────────────
INSERT INTO inventario (clinic_id, nombre, categoria, stock, minimo, unidad, precio, proveedor, vencimiento)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Guantes de latex M', 'Descartables', 500, 100, 'par', 85, 'Distrisur', '2027-06-01'),
  ('00000000-0000-0000-0000-000000000001', 'Jeringa 5ml', 'Descartables', 300, 50, 'unidad', 120, 'Medline', '2027-12-01'),
  ('00000000-0000-0000-0000-000000000001', 'Alcohol 70%', 'Antisépticos', 40, 10, 'litro', 2500, 'Distrisur', '2027-03-01'),
  ('00000000-0000-0000-0000-000000000001', 'Gasas estériles 10x10', 'Descartables', 200, 50, 'paquete', 450, 'Medline', '2027-08-01'),
  ('00000000-0000-0000-0000-000000000001', 'Tensiómetro digital', 'Equipamiento', 3, 1, 'unidad', 45000, 'OmronAR', NULL),
  ('00000000-0000-0000-0000-000000000001', 'Amoxicilina 500mg', 'Medicamentos', 80, 20, 'caja', 8500, 'Roemmers', '2026-11-01'),
  ('00000000-0000-0000-0000-000000000001', 'Ibuprofeno 400mg', 'Medicamentos', 120, 30, 'caja', 4200, 'Bagó', '2026-09-01'),
  ('00000000-0000-0000-0000-000000000001', 'Barbijo quirúrgico', 'Descartables', 1000, 200, 'unidad', 35, 'Medline', '2027-12-01')
ON CONFLICT DO NOTHING;

-- ─── 4. Sample alertas ──────────────────────────────────────────────────────
INSERT INTO alertas (clinic_id, tipo, titulo, detalle, fecha, acento, read)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'rechazo', 'Nuevo rechazo PAMI', 'La factura FC-2026-001234 fue rechazada por código inválido.', CURRENT_DATE, 'gold', false),
  ('00000000-0000-0000-0000-000000000001', 'vencimiento', 'Convenio IOMA por vencer', 'El convenio con IOMA vence en 15 días. Renovar antes del 01/04.', CURRENT_DATE, 'gold', false),
  ('00000000-0000-0000-0000-000000000001', 'nomenclador', 'Actualización nomenclador', 'OSDE actualizó valores del nomenclador para Consultas (+8.5%).', CURRENT_DATE, 'celeste', false),
  ('00000000-0000-0000-0000-000000000001', 'pago', 'Pago recibido Swiss Medical', 'Se acreditó el lote de marzo por $845.000.', CURRENT_DATE, 'celeste', true),
  ('00000000-0000-0000-0000-000000000001', 'inflacion', 'IPC Marzo: 3.2%', 'Pérdida estimada por demora en cobro: $42.300 este mes.', CURRENT_DATE, 'gold', false)
ON CONFLICT DO NOTHING;

-- ─── 5. Sample reportes templates ───────────────────────────────────────────
INSERT INTO reportes (clinic_id, nombre, categoria, descripcion, formato)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Facturación Mensual', 'Finanzas', 'Resumen de facturación por financiador del mes en curso', 'PDF'),
  ('00000000-0000-0000-0000-000000000001', 'Rechazos Pendientes', 'Finanzas', 'Listado de rechazos sin resolver, agrupados por motivo', 'PDF'),
  ('00000000-0000-0000-0000-000000000001', 'Productividad Profesionales', 'Operaciones', 'Atenciones por profesional, horas trabajadas, facturación generada', 'Excel'),
  ('00000000-0000-0000-0000-000000000001', 'Inventario Crítico', 'Operaciones', 'Items por debajo del stock mínimo con sugerencias de reposición', 'PDF'),
  ('00000000-0000-0000-0000-000000000001', 'Análisis IPC', 'Finanzas', 'Impacto de la inflación en la cadena de cobro por financiador', 'Excel')
ON CONFLICT DO NOTHING;

-- ─── 6. Doctors directory (public, not clinic-scoped) ────────────────────────
INSERT INTO doctors (name, specialty, location, address, financiadores, rating, review_count, next_slot, available, teleconsulta, experience, bio)
VALUES
  ('Dr. Carlos Rodríguez', 'Clínica Médica', 'Palermo, CABA', 'Av. Santa Fe 3200, 4°B', '["PAMI","OSDE","Swiss Medical","Galeno"]', 4.8, 124, 'Hoy 15:00', true, true, '22 años', 'Médico clínico con especialización en medicina interna.'),
  ('Dra. María Pérez', 'Cardiología', 'Recoleta, CABA', 'Junín 1050, PB', '["OSDE","Swiss Medical","Medifé"]', 4.9, 89, 'Mañana 09:30', true, true, '18 años', 'Cardióloga con sub-especialización en ecocardiografía.'),
  ('Dr. Alejandro Martínez', 'Traumatología', 'Belgrano, CABA', 'Cabildo 2100, 2°', '["PAMI","OSDE","Galeno","IOMA"]', 4.6, 67, 'Hoy 17:00', true, false, '15 años', 'Traumatólogo especialista en rodilla y hombro.'),
  ('Dra. Laura González', 'Pediatría', 'Palermo, CABA', 'Honduras 4500, 1°', '["OSDE","Swiss Medical","Galeno","Medifé"]', 4.9, 201, 'Mañana 10:00', true, true, '20 años', 'Pediatra con foco en desarrollo infantil y vacunación.'),
  ('Dr. Roberto Díaz', 'Dermatología', 'Microcentro, CABA', 'Av. Corrientes 1200, 8°', '["PAMI","OSDE","Swiss Medical"]', 4.5, 45, 'Jueves 11:00', true, true, '12 años', 'Dermatólogo clínico y estético.'),
  ('Dra. Sofía Ramírez', 'Ginecología', 'Recoleta, CABA', 'Arenales 1850, 3°', '["OSDE","Swiss Medical","Medifé","Galeno"]', 4.8, 156, 'Hoy 16:30', true, true, '16 años', 'Ginecóloga obstetra con experiencia en fertilidad.'),
  ('Dr. Martín López', 'Oftalmología', 'Caballito, CABA', 'Av. Rivadavia 5400, 1°', '["PAMI","OSDE","IOMA"]', 4.4, 38, 'Viernes 09:00', true, false, '10 años', 'Oftalmólogo especialista en cirugía refractiva.'),
  ('Dra. Carolina Morales', 'Psiquiatría', 'Palermo, CABA', 'El Salvador 4800, 6°', '["OSDE","Swiss Medical","Galeno"]', 4.7, 72, 'Mañana 14:00', true, true, '14 años', 'Psiquiatra con enfoque en trastornos de ansiedad y depresión.')
ON CONFLICT DO NOTHING;

-- ─── 7. Doctor reviews ──────────────────────────────────────────────────────
-- Get first doctor ID for reviews
DO $$
DECLARE
  doc_id UUID;
BEGIN
  SELECT id INTO doc_id FROM doctors WHERE name = 'Dr. Carlos Rodríguez' LIMIT 1;
  IF doc_id IS NOT NULL THEN
    INSERT INTO doctor_reviews (doctor_id, patient_name, rating, text, verified, date)
    VALUES
      (doc_id, 'Carlos M.', 5, 'Excelente profesional, muy atento.', true, '2026-03-10'),
      (doc_id, 'Ana G.', 5, 'Siempre se toma el tiempo para explicar todo.', true, '2026-03-05'),
      (doc_id, 'Roberto P.', 4, 'Muy buen médico, la espera fue un poco larga.', true, '2026-02-28')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── 8. Sample medications ──────────────────────────────────────────────────
INSERT INTO medications (name, lab, category, price, pami_coverage, os_coverage, prepaga_coverage, stock, requires_prescription)
VALUES
  ('Ibuprofeno 400mg', 'Bagó', 'Antiinflamatorio', 420000, 50, 40, 60, 'Disponible', false),
  ('Amoxicilina 500mg', 'Roemmers', 'Antibiótico', 850000, 70, 50, 70, 'Disponible', true),
  ('Losartán 50mg', 'Gador', 'Antihipertensivo', 680000, 80, 60, 75, 'Disponible', true),
  ('Metformina 850mg', 'Montpellier', 'Antidiabético', 520000, 75, 55, 70, 'Disponible', true),
  ('Omeprazol 20mg', 'Bagó', 'Antiulceroso', 380000, 60, 45, 65, 'Disponible', true),
  ('Paracetamol 500mg', 'Raffo', 'Analgésico', 280000, 40, 30, 50, 'Disponible', false),
  ('Enalapril 10mg', 'Gador', 'Antihipertensivo', 450000, 70, 55, 70, 'Disponible', true),
  ('Atorvastatina 20mg', 'Pfizer', 'Hipolipemiante', 920000, 65, 50, 70, 'Disponible', true)
ON CONFLICT DO NOTHING;

-- ─── Done! ───────────────────────────────────────────────────────────────────
-- The system is ready. When a user signs up via /auth/registro,
-- the handle_new_user() trigger will auto-create their clinic + profile.
-- For the first admin, sign up with metadata:
--   { clinic_name: "Clínica San Martín", full_name: "Dr. Rodríguez", role: "admin" }
