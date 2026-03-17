import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock jose before importing requireAuth
vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
}));

// Mock logger to prevent output
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("requireAuth", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  function makeRequest(cookies: Record<string, string> = {}): NextRequest {
    const url = new URL("http://localhost:3000/api/test");
    const req = new NextRequest(url);
    for (const [name, value] of Object.entries(cookies)) {
      req.cookies.set(name, value);
    }
    return req;
  }

  it("returns user when valid session cookie is present", async () => {
    const { requireAuth } = await import("@/lib/security/require-auth");
    const session = {
      id: "u1",
      email: "doc@clinica.com",
      name: "Dr. Test",
      role: "admin",
      clinicId: "c1",
      clinicName: "Test Clinic",
    };
    const req = makeRequest({ condor_session: JSON.stringify(session) });
    const result = await requireAuth(req);

    expect(result.error).toBeUndefined();
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe("u1");
    expect(result.user?.email).toBe("doc@clinica.com");
    expect(result.user?.role).toBe("admin");
  });

  it("returns 401 when no cookies at all", async () => {
    const { requireAuth } = await import("@/lib/security/require-auth");
    const req = makeRequest({});
    const result = await requireAuth(req);

    expect(result.error).toBeDefined();
    expect(result.user).toBeUndefined();
    const body = await result.error!.json();
    expect(body.error).toContain("No autorizado");
    expect(result.error!.status).toBe(401);
  });

  it("returns 401 when session cookie is corrupt", async () => {
    const { requireAuth } = await import("@/lib/security/require-auth");
    const req = makeRequest({ condor_session: "not-json" });
    const result = await requireAuth(req);

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
  });

  it("returns 401 when session cookie is missing required fields", async () => {
    const { requireAuth } = await import("@/lib/security/require-auth");
    const partial = { id: "u1" }; // missing email and role
    const req = makeRequest({ condor_session: JSON.stringify(partial) });
    const result = await requireAuth(req);

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
  });

  it("falls back to supabase auth when no condor_session", async () => {
    // Without SUPABASE_JWT_SECRET, presence of sb-access-token is trusted
    const { requireAuth } = await import("@/lib/security/require-auth");
    const req = makeRequest({ "sb-access-token": "some-supabase-token" });
    const result = await requireAuth(req);

    // Without JWT secret configured, it should trust the cookie
    expect(result.error).toBeUndefined();
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe("supabase-user");
  });

  it("returns user when session has all required fields", async () => {
    const { requireAuth } = await import("@/lib/security/require-auth");
    const session = {
      id: "user-123",
      email: "user@test.com",
      name: "Test User",
      role: "medico",
      clinicId: "clinic-456",
      clinicName: "Clinica Test",
    };
    const req = makeRequest({ condor_session: JSON.stringify(session) });
    const result = await requireAuth(req);

    expect(result.error).toBeUndefined();
    expect(result.user?.role).toBe("medico");
    expect(result.user?.clinicId).toBe("clinic-456");
  });
});
