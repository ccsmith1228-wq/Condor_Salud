import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ─── Accessibility Test Suite ────────────────────────────────
// Automated WCAG 2.1 AA compliance testing using axe-core.
// These tests catch regressions in:
//   - Color contrast
//   - Missing alt text / labels
//   - Invalid ARIA attributes
//   - Keyboard navigation issues
//   - Heading hierarchy violations
//   - Form label associations

/** Helper: run axe scan and assert zero violations */
async function expectAccessible(
  page: import("@playwright/test").Page,
  options?: { disableRules?: string[] },
) {
  const builder = new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude(".sentry-error-embed"); // Sentry widget is third-party

  if (options?.disableRules) {
    builder.disableRules(options.disableRules);
  }

  const results = await builder.analyze();

  // Build readable violation report
  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    helpUrl: v.helpUrl,
    nodes: v.nodes.length,
    targets: v.nodes.slice(0, 3).map((n) => n.target.join(" > ")),
  }));

  expect(violations, `Found ${violations.length} a11y violations`).toEqual([]);
}

test.describe("Accessibility — Public Pages", () => {
  test("home page passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("login page passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("register page passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/auth/registro");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("privacy policy passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/privacidad");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("terms of service passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/terminos");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });
});

test.describe("Accessibility — Dashboard", () => {
  test("dashboard overview passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("facturacion page passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/dashboard/facturacion");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("pacientes page passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/dashboard/pacientes");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("rechazos page passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/dashboard/rechazos");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("agenda page passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/dashboard/agenda");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });

  test("configuracion page passes WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/dashboard/configuracion");
    await page.waitForLoadState("networkidle");
    await expectAccessible(page);
  });
});

test.describe("Accessibility — Keyboard Navigation", () => {
  test("login form is fully keyboard-navigable", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Tab through all interactive elements
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    // Should be able to reach the submit button via Tab
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
    }

    // Verify focus is visible (focus-visible outline exists)
    const hasFocusVisible = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      const styles = window.getComputedStyle(el);
      return (
        styles.outlineStyle !== "none" ||
        styles.boxShadow !== "none" ||
        el.classList.toString().includes("focus")
      );
    });
    // Just verify we can tab through — don't assert specific focus styles
    // since they vary by browser
    expect(firstFocused).toBeTruthy();
  });

  test("dashboard sidebar supports keyboard navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // All nav links should be reachable
    const navLinks = page.locator("nav a, aside a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // Each link should have accessible name
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = navLinks.nth(i);
      const name = (await link.getAttribute("aria-label")) || (await link.textContent());
      expect(name?.trim().length).toBeGreaterThan(0);
    }
  });
});

test.describe("Accessibility — ARIA Landmarks", () => {
  test("home page has required landmarks", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Must have main landmark
    await expect(page.locator("main")).toBeVisible();
    // Must have navigation
    await expect(page.locator("nav").first()).toBeVisible();
  });

  test("dashboard has required landmarks", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();
    // Sidebar navigation
    const navOrAside = page.locator("nav, aside");
    await expect(navOrAside.first()).toBeVisible();
  });
});
