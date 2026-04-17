"use client";

// ============================================================
// CINAF v2 — Page Catalogue (recherche + filtres)
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { catalogue, type Film, type Serie, type Genre } from "@/lib/api";
import ContentGrid from "@/components/ContentGrid";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";

export default function CataloguePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
  const type = searchParams.get("type") || "";
  const page = Number(searchParams.get("page")) || 1;

  const [genres, setGenres] = useState<Genre[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [totalFilms, setTotalFilms] = useState(0);
  const [totalSeries, setTotalSeries] = useState(0);
  const [loading, setLoading] = useState(true);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      });
      // Reset page to 1 when filters change
      if (!updates.page) params.set("page", "1");
      router.push(`/catalogue?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Load genres
  useEffect(() => {
    catalogue.getGenres().then(setGenres).catch(() => {});
  }, []);

  // Load content based on filters
  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const showFilms = !type || type === "film";
        const showSeries = !type || type === "serie";

        const promises: Promise<void>[] = [];

        if (showFilms) {
          promises.push(
            catalogue
              .getFilms(page, q || undefined, genre || undefined)
              .then((res) => {
                setFilms(res.items);
                setTotalFilms(res.total);
              })
          );
        } else {
          setFilms([]);
          setTotalFilms(0);
        }

        if (showSeries) {
          promises.push(
            catalogue
              .getSeries(page, q || undefined, genre || undefined)
              .then((res) => {
                setSeries(res.items);
                setTotalSeries(res.total);
              })
          );
        } else {
          setSeries([]);
          setTotalSeries(0);
        }

        await Promise.allSettled(promises);
      } catch {
        // handled per-section
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [q, genre, year, type, page]);

  const total = totalFilms + totalSeries;
  const allItems: (Film | Serie)[] = [...films, ...series];

  return (
    <div className="container py-4">
      {/* Header */}
      <h2 className="section-title">Catalogue</h2>

      {/* Search */}
      <div className="mb-3">
        <SearchBar
          mode="inline"
          defaultValue={q}
          onChange={(val) => updateParams({ q: val || undefined })}
          placeholder="Rechercher dans le catalogue..."
        />
      </div>

      {/* Filters */}
      <FilterBar
        genres={genres}
        selectedGenre={genre || undefined}
        selectedYear={year}
        selectedType={type || undefined}
        onGenreChange={(slug) => updateParams({ genre: slug })}
        onYearChange={(y) => updateParams({ year: y ? String(y) : undefined })}
        onTypeChange={(t) => updateParams({ type: t })}
      />

      {/* Results count */}
      {!loading && (
        <p className="mt-3 mb-4" style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}>
          {total} resultat{total !== 1 ? "s" : ""}
          {q && <> pour &laquo;{q}&raquo;</>}
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ color: "var(--cinaf-gold)" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-search"
            style={{ fontSize: "3rem", color: "var(--cinaf-text-muted)" }}
          />
          <h5 className="mt-3" style={{ color: "var(--cinaf-text)" }}>
            Aucun resultat
          </h5>
          <p style={{ color: "var(--cinaf-text-muted)" }}>
            Essayez de modifier vos filtres ou votre recherche.
          </p>
        </div>
      ) : (
        <>
          {/* Films section */}
          {films.length > 0 && (
            <section className="mb-4">
              {(!type || type !== "serie") && series.length > 0 && (
                <h5 className="mb-3" style={{ color: "var(--cinaf-gold)", fontWeight: 600 }}>
                  Films ({totalFilms})
                </h5>
              )}
              <ContentGrid items={films} type="film" />
            </section>
          )}

          {/* Series section */}
          {series.length > 0 && (
            <section className="mb-4">
              {(!type || type !== "film") && films.length > 0 && (
                <h5 className="mb-3" style={{ color: "var(--cinaf-gold)", fontWeight: 600 }}>
                  Series ({totalSeries})
                </h5>
              )}
              <ContentGrid items={series} type="serie" />
            </section>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalItems={total}
            onPageChange={(p) => updateParams({ page: String(p) })}
          />
        </>
      )}
    </div>
  );
}
