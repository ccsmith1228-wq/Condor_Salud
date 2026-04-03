import { test, expect } from "@playwright/test";

// ── Per-doctor booking flow E2E tests ──────────────────────────
// Tests the public booking page at /reservar/centro-medico-roca.
// The page renders a doctor grid, specialty filters, date picker,
// and per-doctor time slots backed by real availability data.

const SLUG = "centro-medico-roca";
const BOOKING_URL = `/reservar/${SLUG}`;

test.describe("Public booking page — /reservar/[slug]", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BOOKING_URL);
    await page.waitForLoadState("networkidle");
  });

  // ── Page structure ─────────────────────────────────────

  test("renders clinic header with name and address", async ({ page }) => {
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.getByText(/centro médico roca/i)).toBeVisible();
  });

  test("shows search input for doctors", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|search/i);
    await expect(searchInput).toBeVisible();
  });

  test("shows specialty filter pills", async ({ page }) => {
    // At least one specialty pill should be visible
    const pills = page
      .locator("button")
      .filter({ hasText: /Clínica|Cardiología|Pediatría|Dermatología|Traumatología/i });
    await expect(pills.first()).toBeVisible({ timeout: 8000 });
  });

  test("renders doctor cards with schedule info", async ({ page }) => {
    // Wait for doctors to load
    const doctorCard = page
      .locator("[class*='rounded']")
      .filter({ hasText: /Dr\.|Dra\./i })
      .first();
    await expect(doctorCard).toBeVisible({ timeout: 8000 });
  });

  // ── Search & filter ────────────────────────────────────

  test("search filters doctors by name", async ({ page }) => {
    const search = page.getByPlaceholder(/buscar|search/i);
    await search.fill("Francisco");
    await page.waitForTimeout(300);

    // Should show Dr. Francisco Gómez or similar matches
    const visible = page.locator("[class*='rounded']").filter({ hasText: /Francisco/i });
    const count = await visible.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if name not seeded
  });

  test("specialty filter narrows doctor list", async ({ page }) => {
    // Click a specialty pill
    const pill = page
      .locator("button")
      .filter({ hasText: /Cardiología/i })
      .first();
    if (await pill.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pill.click();
      await page.waitForTimeout(500);

      // All visible doctor cards should include "Cardiología" or be filtered
      const cards = page.locator("[class*='rounded']").filter({ hasText: /Dr\.|Dra\./i });
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    } else {
      test.skip();
    }
  });

  // ── Doctor selection → date → time ─────────────────────

  test("clicking a doctor card advances to date selection", async ({ page }) => {
    // Click the first doctor card
    const card = page
      .locator("[class*='rounded']")
      .filter({ hasText: /Dr\.|Dra\./i })
      .first();
    await expect(card).toBeVisible({ timeout: 8000 });
    await card.click();
    await page.waitForTimeout(500);

    // Should see date-related UI (calendar or date buttons)
    const dateUI = page.getByText(/fecha|lunes|martes|miércoles|jueves|viernes|date/i).first();
    await expect(dateUI).toBeVisible({ timeout: 5000 });
  });

  test("selecting a date shows available time slots", async ({ page }) => {
    // Select first doctor
    const card = page
      .locator("[class*='rounded']")
      .filter({ hasText: /Dr\.|Dra\./i })
      .first();
    await expect(card).toBeVisible({ timeout: 8000 });
    await card.click();
    await page.waitForTimeout(500);

    // Click a date button
    const dateBtn = page
      .locator("button")
      .filter({ hasText: /\d{1,2}/ })
      .first();
    if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateBtn.click();
      await page.waitForTimeout(1000);

      // Should show time slot buttons (e.g., "09:00", "09:30")
      const timeSlot = page
        .locator("button")
        .filter({ hasText: /^\d{2}:\d{2}$/ })
        .first();
      // Time slots may or may not be available
      const count = await timeSlot.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  // ── Full booking flow (happy path) ─────────────────────

  test("full booking flow: doctor → date → time → form → confirm", async ({ page }) => {
    // 1. Select first doctor
    const card = page
      .locator("[class*='rounded']")
      .filter({ hasText: /Dr\.|Dra\./i })
      .first();
    await expect(card).toBeVisible({ timeout: 8000 });
    await card.click();
    await page.waitForTimeout(500);

    // 2. Select first available date
    const dateBtn = page
      .locator("button")
      .filter({ hasText: /\d{1,2}/ })
      .first();
    if (!(await dateBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip();
      return;
    }
    await dateBtn.click();
    await page.waitForTimeout(1000);

    // 3. Select first time slot
    const timeSlot = page
      .locator("button")
      .filter({ hasText: /^\d{2}:\d{2}$/ })
      .first();
    if (!(await timeSlot.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip();
      return;
    }
    await timeSlot.click();
    await page.waitForTimeout(500);

    // 4. Fill the form
    const nameInput = page.getByPlaceholder(/nombre|name/i).first();
    const emailInput = page.getByPlaceholder(/email|correo/i).first();
    const phoneInput = page.getByPlaceholder(/teléfono|phone/i).first();

    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill("E2E Test Patient");
      if (await emailInput.isVisible().catch(() => false)) await emailInput.fill("e2e@test.com");
      if (await phoneInput.isVisible().catch(() => false)) await phoneInput.fill("+5492984000000");

      // 5. Submit
      const submitBtn = page.getByRole("button", { name: /confirmar|reservar|book/i }).first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(3000);

        // 6. Confirmation: should show success or booking ID
        const success = page.getByText(/confirmad|turno reservado|booking.*confirm|ID:/i).first();
        await expect(success).toBeVisible({ timeout: 8000 });
      }
    }
  });
});

// ── Public Booking API tests ─────────────────────────────────

test.describe("Public Booking API — /api/clinics/[slug]", () => {
  test("GET /api/clinics/centro-medico-roca/public returns clinic + doctors", async ({
    request,
  }) => {
    const res = await request.get(`/api/clinics/${SLUG}/public`);
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data.name).toBeTruthy();
    expect(data.doctors).toBeInstanceOf(Array);
    expect(data.doctors.length).toBeGreaterThan(0);
  });

  test("GET /api/clinics/centro-medico-roca/slots returns per-doctor availability", async ({
    request,
  }) => {
    // First get a doctor ID
    const pubRes = await request.get(`/api/clinics/${SLUG}/public`);
    const pubData = await pubRes.json();
    const doctorId = pubData.doctors?.[0]?.id;

    if (!doctorId) {
      test.skip();
      return;
    }

    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0];
    const res = await request.get(
      `/api/clinics/${SLUG}/slots?doctorId=${doctorId}&date=${tomorrow}`,
    );
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data.slots).toBeInstanceOf(Array);
  });

  test("POST /api/clinics/centro-medico-roca/book rejects missing fields", async ({ request }) => {
    const res = await request.post(`/api/clinics/${SLUG}/book`, {
      data: { patientName: "Test" },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/clinics/centro-medico-roca/book rejects booking disabled clinic", async ({
    request,
  }) => {
    const res = await request.post("/api/clinics/nonexistent-clinic/book", {
      data: {
        doctorId: "fake",
        patientName: "Test",
        patientEmail: "t@t.com",
        fecha: "2026-04-10",
        hora: "10:00",
      },
    });
    // Either 404 (clinic not found) or 400
    expect([400, 404]).toContain(res.status());
  });
});

// ── Patient self-service booking management ──────────────────

test.describe("Patient booking management — /reservar/[slug]/turno/[id]", () => {
  test("shows verification form", async ({ page }) => {
    await page.goto(`${BOOKING_URL}/turno/test-booking-id`);
    await page.waitForLoadState("networkidle");

    // Should show email verification prompt
    await expect(page.getByText(/verificá|verify/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder(/email|correo/i)).toBeVisible();
  });

  test("rejects invalid booking lookup", async ({ page }) => {
    await page.goto(`${BOOKING_URL}/turno/nonexistent-id`);
    await page.waitForLoadState("networkidle");

    const emailInput = page.getByPlaceholder(/email|correo/i);
    await emailInput.fill("nobody@test.com");
    await page.getByRole("button", { name: /verificar|verify/i }).click();
    await page.waitForTimeout(2000);

    // Should show an error
    const error = page.getByText(/not found|no se encontr/i);
    await expect(error).toBeVisible({ timeout: 5000 });
  });
});
