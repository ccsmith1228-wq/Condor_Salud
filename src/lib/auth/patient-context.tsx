"use client";

// ─── Patient Auth Context ────────────────────────────────────
// React context for patient authentication state.
// Ported from frontend/src/screens/PatientAuthScreens.tsx.
// Token persistence via localStorage instead of AsyncStorage.

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────

export interface PatientUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  insuranceId?: string;
}

interface PatientAuthState {
  patient: PatientUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<PatientUser>) => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────

const PatientAuthContext = createContext<PatientAuthState | null>(null);

const STORAGE_KEY_TOKEN = "condor_patient_token";
const STORAGE_KEY_REFRESH = "condor_patient_refresh";
const STORAGE_KEY_PATIENT = "condor_patient_data";

// ─── Provider ────────────────────────────────────────────────

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const savedPatient = localStorage.getItem(STORAGE_KEY_PATIENT);
      if (savedToken && savedPatient) {
        setToken(savedToken);
        setPatient(JSON.parse(savedPatient));
      }
    } catch {
      // Ignore parse errors
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSession = useCallback(
    (data: { patient: PatientUser; token: string; refreshToken: string }) => {
      setToken(data.token);
      setPatient(data.patient);
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEY_REFRESH, data.refreshToken);
      localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(data.patient));
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/patients/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al iniciar sesión");
      }
      const data = await res.json();
      saveSession(data);
    },
    [saveSession],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await fetch("/api/patients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrarse");
      }
      const data = await res.json();
      saveSession(data);
    },
    [saveSession],
  );

  const logout = useCallback(() => {
    setToken(null);
    setPatient(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_PATIENT);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<PatientUser>) => {
      if (!token) throw new Error("No autenticado");

      const res = await fetch("/api/patients/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar perfil");
      }

      const updated = await res.json();
      setPatient(updated);
      localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(updated));
    },
    [token],
  );

  return (
    <PatientAuthContext.Provider
      value={{ patient, token, loading, login, register, logout, updateProfile }}
    >
      {children}
    </PatientAuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export function usePatientAuth(): PatientAuthState {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) {
    throw new Error("usePatientAuth must be used within <PatientAuthProvider>");
  }
  return ctx;
}
