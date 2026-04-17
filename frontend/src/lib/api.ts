// ============================================================
// CINAF v2 — Client HTTP (fetch natif TypeScript)
// Base URL : http://localhost:8000/api
// ============================================================

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ─── Types ───────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  isVerified?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user?: User;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  consentRgpd: boolean;
}

export interface RegisterResponse {
  message: string;
  user?: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
  detail?: string;
}

// ─── Types Catalogue ────────────────────────────────────────

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Country {
  id: string;
  name: string;
  isoCode: string;
}

export interface Language {
  id: string;
  name: string;
  isoCode: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  photoUrl?: string;
}

export interface Film {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  year: number;
  duration: number;
  posterUrl?: string;
  trailerBunnyId?: string;
  bunnyVideoId?: string;
  isPremium: boolean;
  viewCount: number;
  avgRating?: number;
  genres: Genre[];
  countries: Country[];
  language?: Language;
  directors: Person[];
  cast: Person[];
  createdAt: string;
}

export interface Season {
  id: string;
  number: number;
  title?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  synopsis?: string;
  duration: number;
  bunnyVideoId?: string;
  isPremium: boolean;
}

export interface Serie {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  year: number;
  posterUrl?: string;
  trailerBunnyId?: string;
  isPremium: boolean;
  viewCount: number;
  avgRating?: number;
  genres: Genre[];
  countries: Country[];
  language?: Language;
  seasons: Season[];
  createdAt: string;
}

export interface FeaturedContent {
  id: string;
  contentType: "film" | "serie";
  contentId: string;
  position: number;
  film?: Film;
  serie?: Serie;
}

export interface StreamInfo {
  embedUrl: string;
  thumbnailUrl: string;
  duration: number;
  title: string;
}

export interface SearchResult {
  films: Film[];
  series: Serie[];
  total: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
}

// ─── Helpers internes ─────────────────────────────────────────

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function buildHeaders(withAuth = true): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (withAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    throw { message: "Non authentifié", statusCode: 401 } as ApiError;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json") || contentType.includes("application/ld+json");

  if (!response.ok) {
    let errorMessage = `Erreur ${response.status}`;
    let detail: string | undefined;

    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorData["hydra:description"] || errorMessage;
        detail = errorData.detail;
      } catch {
        // ignore parse error
      }
    }

    throw { message: errorMessage, statusCode: response.status, detail } as ApiError;
  }

  if (response.status === 204 || !isJson) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  withAuth = true
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(withAuth),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

// ─── Module auth ──────────────────────────────────────────────

export const auth = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register(data: RegisterData): Promise<RegisterResponse> {
    return request<RegisterResponse>("POST", "/auth/register", data, false);
  },

  /**
   * Connexion — retourne access_token + refresh_token
   */
  login(data: LoginData): Promise<LoginResponse> {
    return request<LoginResponse>("POST", "/auth/login", data, false);
  },

  /**
   * Déconnexion — révoque le refresh_token côté serveur
   */
  logout(): Promise<void> {
    return request<void>("POST", "/auth/logout");
  },

  /**
   * Demande de réinitialisation du mot de passe
   */
  forgotPassword(email: string): Promise<void> {
    return request<void>("POST", "/auth/forgot-password", { email }, false);
  },

  /**
   * Réinitialisation du mot de passe avec le token reçu par email
   */
  resetPassword(token: string, password: string): Promise<void> {
    return request<void>("POST", "/auth/reset-password", { token, password }, false);
  },
};

// ─── Module users ─────────────────────────────────────────────

export const users = {
  /**
   * Récupère le profil d'un utilisateur par son ID
   */
  getProfile(id: string): Promise<User> {
    return request<User>("GET", `/users/${id}`);
  },

  /**
   * Met à jour les informations d'un utilisateur
   */
  updateProfile(id: string, data: Partial<User>): Promise<User> {
    return request<User>("PATCH", `/users/${id}`, data);
  },

  /**
   * Supprime le compte d'un utilisateur
   */
  deleteAccount(id: string): Promise<void> {
    return request<void>("DELETE", `/users/${id}`);
  },
};

// ─── Helpers API Platform (Hydra) ────────────────────────────

/**
 * API Platform retourne les collections au format JSON-LD / Hydra.
 * Cette fonction normalise la réponse en PaginatedResult<T>.
 */
function hydraToPage<T>(data: Record<string, unknown>, page: number): PaginatedResult<T> {
  const members = (data["hydra:member"] ?? data["member"] ?? data["items"] ?? []) as T[];
  const total = (data["hydra:totalItems"] ?? data["totalItems"] ?? data["total"] ?? members.length) as number;
  return { items: members, total, page };
}

// ─── Module catalogue ────────────────────────────────────────

export const catalogue = {
  /** Liste paginée de films */
  async getFilms(page = 1, search?: string, genre?: string): Promise<PaginatedResult<Film>> {
    const params = new URLSearchParams({ page: String(page), itemsPerPage: "20" });
    if (search) params.set("title", search);
    if (genre) params.set("genres.slug", genre);
    const data = await request<Record<string, unknown>>("GET", `/films?${params}`, undefined, false);
    return hydraToPage<Film>(data, page);
  },

  /** Détail d'un film */
  getFilm(id: string): Promise<Film> {
    return request<Film>("GET", `/films/${id}`, undefined, false);
  },

  /** Liste paginée de séries */
  async getSeries(page = 1, search?: string, genre?: string): Promise<PaginatedResult<Serie>> {
    const params = new URLSearchParams({ page: String(page), itemsPerPage: "20" });
    if (search) params.set("title", search);
    if (genre) params.set("genres.slug", genre);
    const data = await request<Record<string, unknown>>("GET", `/series?${params}`, undefined, false);
    return hydraToPage<Serie>(data, page);
  },

  /** Détail d'une série (inclut les saisons) */
  getSerie(id: string): Promise<Serie> {
    return request<Serie>("GET", `/series/${id}`, undefined, false);
  },

  /** Liste de tous les genres */
  async getGenres(): Promise<Genre[]> {
    const data = await request<Record<string, unknown>>("GET", "/genres", undefined, false);
    return (data["hydra:member"] ?? data["member"] ?? data) as Genre[];
  },

  /** Liste de tous les pays */
  async getCountries(): Promise<Country[]> {
    const data = await request<Record<string, unknown>>("GET", "/countries", undefined, false);
    return (data["hydra:member"] ?? data["member"] ?? data) as Country[];
  },

  /** Liste de toutes les langues */
  async getLanguages(): Promise<Language[]> {
    const data = await request<Record<string, unknown>>("GET", "/languages", undefined, false);
    return (data["hydra:member"] ?? data["member"] ?? data) as Language[];
  },

  /** Recherche unifiée films + séries */
  async search(params: {
    q?: string;
    genre?: string;
    year?: number;
    type?: string;
    page?: number;
  }): Promise<SearchResult> {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.genre) qs.set("genre", params.genre);
    if (params.year) qs.set("year", String(params.year));
    if (params.type) qs.set("type", params.type);
    if (params.page) qs.set("page", String(params.page));
    return request<SearchResult>("GET", `/catalogue/search?${qs}`, undefined, false);
  },

  /** Contenus mis en avant (hero banner) */
  getFeatured(): Promise<FeaturedContent[]> {
    return request<FeaturedContent[]>("GET", "/catalogue/featured", undefined, false);
  },

  /** Contenus tendances */
  async getTrending(limit = 10): Promise<{ films: Film[]; series: Serie[] }> {
    return request<{ films: Film[]; series: Serie[] }>(
      "GET",
      `/catalogue/trending?limit=${limit}`,
      undefined,
      false
    );
  },

  /** Stream info film (protégé ROLE_USER) */
  getFilmStream(id: string): Promise<StreamInfo> {
    return request<StreamInfo>("GET", `/films/${id}/stream`, undefined, true);
  },

  /** Stream info épisode (protégé ROLE_USER) */
  getEpisodeStream(id: string): Promise<StreamInfo> {
    return request<StreamInfo>("GET", `/episodes/${id}/stream`, undefined, true);
  },
};
