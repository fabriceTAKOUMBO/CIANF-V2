"use client";

// ============================================================
// CINAF v2 — Page Recherche
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { catalogue, type Film, type Serie } from "@/lib/api";
import ContentGrid from "@/components/ContentGrid";
import SearchBar from "@/components/SearchBar";

export default function RecherchePage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const [films, setFilms] = useState<Film[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilms([]);
      setSeries([]);
      return;
    }

    setLoading(true);
    try {
      const [filmsRes, seriesRes] = await Promise.allSettled([
        catalogue.getFilms(1, searchQuery),
        catalogue.getSeries(1, searchQuery),
      ]);

      if (filmsRes.status === "fulfilled") setFilms(filmsRes.value.items);
      if (seriesRes.status === "fulfilled") setSeries(seriesRes.value.items);
    } catch {
      // handled per section
    } finally {
      setLoading(false);
    }
  }, []);

  // Search on mount if query param present
  useEffect(() => {
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [q, doSearch]);

  const handleSearch = (val: string) => {
    setQuery(val);
    doSearch(val);
  };

  const totalResults = films.length + series.length;

  return (
    <div className="container py-4">
      <h2 className="section-title">Recherche</h2>

      {/* Search bar - auto-focused */}
      <div className="mb-4">
        <SearchBar
          mode="inline"
          defaultValue={query}
          onChange={handleSearch}
          placeholder="Rechercher un film, une serie, un acteur..."
          autoFocus
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "var(--cinaf-gold)" }} role="status">
            <span className="visually-hidden">Recherche en cours...</span>
          </div>
        </div>
      ) : query.trim() === "" ? (
        <div className="text-center py-5">
          <i className="bi bi-search" style={{ fontSize: "4rem", color: "var(--cinaf-text-muted)" }} />
          <h4 className="mt-3" style={{ color: "var(--cinaf-text)" }}>
            Que cherchez-vous ?
          </h4>
          <p style={{ color: "var(--cinaf-text-muted)" }}>
            Tapez le nom d&apos;un film, d&apos;une serie ou d&apos;un artiste.
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-emoji-frown" style={{ fontSize: "3rem", color: "var(--cinaf-text-muted)" }} />
          <h4 className="mt-3" style={{ color: "var(--cinaf-text)" }}>
            Aucun resultat pour &laquo;{query}&raquo;
          </h4>
          <p style={{ color: "var(--cinaf-text-muted)" }}>
            Verifiez l&apos;orthographe ou essayez d&apos;autres mots-cles.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}>
            {totalResults} resultat{totalResults !== 1 ? "s" : ""} pour &laquo;{query}&raquo;
          </p>

          {/* Films results */}
          {films.length > 0 && (
            <section className="mb-5">
              <h5 className="mb-3" style={{ color: "var(--cinaf-gold)", fontWeight: 600 }}>
                Films ({films.length} resultat{films.length !== 1 ? "s" : ""})
              </h5>
              <ContentGrid items={films} type="film" />
            </section>
          )}

          {/* Series results */}
          {series.length > 0 && (
            <section className="mb-5">
              <h5 className="mb-3" style={{ color: "var(--cinaf-gold)", fontWeight: 600 }}>
                Series ({series.length} resultat{series.length !== 1 ? "s" : ""})
              </h5>
              <ContentGrid items={series} type="serie" />
            </section>
          )}
        </>
      )}
    </div>
  );
}
