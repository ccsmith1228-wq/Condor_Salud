"use client";

import { useState, useEffect, useCallback } from "react";

const COOKIE_NAME = "condor_patient_name";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Hook to manage the patient's display name via a cookie.
 *
 * Returns:
 *   name       – current name (null if not set)
 *   setName    – persist a new name into the cookie
 *   clearName  – remove the cookie
 *   initials   – computed initials (e.g. "MG")
 *   firstName  – first word of the name
 *   needsName  – true when no name is stored yet
 */
export function usePatientName() {
  const [name, setNameState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setNameState(getCookie(COOKIE_NAME));
    setLoaded(true);
  }, []);

  const setName = useCallback((newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCookie(COOKIE_NAME, trimmed, COOKIE_MAX_AGE);
    setNameState(trimmed);
  }, []);

  const clearName = useCallback(() => {
    deleteCookie(COOKIE_NAME);
    setNameState(null);
  }, []);

  const initials = name
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("")
    : "?";

  const firstName = name ? name.split(/\s+/)[0] : null;

  return {
    name,
    setName,
    clearName,
    initials,
    firstName,
    needsName: loaded && !name,
    loaded,
  };
}
