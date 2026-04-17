"use client";

// ============================================================
// CINAF v2 — Contexte d'authentification React
// Persistance : access_token dans localStorage, refresh_token en cookie
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  auth as authApi,
  users as usersApi,
  type User,
  type LoginData,
  type RegisterData,
} from "@/lib/api";

// ─── Types du contexte ────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ message: string }>;
}

// ─── Helpers localStorage / cookie ────────────────────────────

function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", accessToken);
  // Stocker le refresh_token dans un cookie HttpOnly via Set-Cookie n'est pas
  // possible depuis le client. On utilise un cookie classique ici — le backend
  // doit idéalement passer par une route Next.js /api pour le définir en HttpOnly.
  document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`;
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  document.cookie = "refresh_token=; path=/; max-age=0";
}

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

/**
 * Décode la partie payload d'un JWT sans dépendance externe.
 * Retourne null si le token est invalide ou expiré.
 */
function decodeJwt(token: string): { sub: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload as { sub: string; exp: number };
  } catch {
    return null;
  }
}

// ─── Contexte ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charge le profil utilisateur au montage si un token valide est présent
  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const decoded = decodeJwt(token);
    if (!decoded) {
      clearTokens();
      setIsLoading(false);
      return;
    }

    // decoded.sub est l'identifiant de l'utilisateur (ex: IRI "/api/users/1" ou UUID)
    const userId = decoded.sub.startsWith("/api/users/")
      ? decoded.sub.replace("/api/users/", "")
      : decoded.sub;

    usersApi
      .getProfile(userId)
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        clearTokens();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // ── login ──────────────────────────────────────────────────

  const login = useCallback(async (data: LoginData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      saveTokens(response.access_token, response.refresh_token);

      // Si la réponse inclut l'objet user, on l'utilise directement
      if (response.user) {
        setUser(response.user);
        return;
      }

      // Sinon, on décode le JWT pour obtenir l'ID et on charge le profil
      const decoded = decodeJwt(response.access_token);
      if (decoded) {
        const userId = decoded.sub.startsWith("/api/users/")
          ? decoded.sub.replace("/api/users/", "")
          : decoded.sub;
        const profile = await usersApi.getProfile(userId);
        setUser(profile);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── logout ─────────────────────────────────────────────────

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // On nettoie quoi qu'il arrive
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  // ── register ───────────────────────────────────────────────

  const register = useCallback(
    async (data: RegisterData): Promise<{ message: string }> => {
      setIsLoading(true);
      try {
        const response = await authApi.register(data);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook useAuth ─────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return ctx;
}
