"use client";

// ============================================================
// CINAF v2 — Page d'accueil
// ============================================================

import { useEffect, useState } from "react";
import { catalogue, type Film, type Serie, type FeaturedContent } from "@/lib/api";
import HeroBanner from "@/components/HeroBanner";
import ContentCarousel from "@/components/ContentCarousel";
import ContentGrid from "@/components/ContentGrid";

export default function Home() {
  const [featured, setFeatured] = useState<FeaturedContent[]>([]);
  const [trendingFilms, setTrendingFilms] = useState<Film[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Serie[]>([]);
  const [latestFilms, setLatestFilms] = useState<Film[]>([]);
  const [latestSeries, setLatestSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredData, trendingData, filmsData, seriesData] =
          await Promise.allSettled([
            catalogue.getFeatured(),
            catalogue.getTrending(10),
            catalogue.getFilms(1),
            catalogue.getSeries(1),
          ]);

        if (featuredData.status === "fulfilled") setFeatured(featuredData.value);
        if (trendingData.status === "fulfilled") {
          setTrendingFilms(trendingData.value.films || []);
          setTrendingSeries(trendingData.value.series || []);
        }
        if (filmsData.status === "fulfilled") setLatestFilms(filmsData.value.items);
        if (seriesData.status === "fulfilled") setLatestSeries(seriesData.value.items);
      } catch {
        // Errors are handled per-section
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Determine hero content from featured list
  const heroFeatured = featured[0];
  const heroContent = heroFeatured?.film || heroFeatured?.serie;
  const heroType = heroFeatured?.contentType || "film";

  // Combine trending items for carousel
  const trendingAll: (Film | Serie)[] = [
    ...trendingFilms,
    ...trendingSeries,
  ];

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            style={{ color: "var(--cinaf-gold)", width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p style={{ color: "var(--cinaf-text-muted)" }}>
            Chargement du catalogue...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      {heroContent && (
        <HeroBanner
          content={heroContent}
          type={heroType as "film" | "serie"}
        />
      )}

      {/* If no featured, show a fallback hero */}
      {!heroContent && latestFilms.length > 0 && (
        <HeroBanner content={latestFilms[0]} type="film" />
      )}

      <div className="container py-5">
        {/* Tendances */}
        {trendingAll.length > 0 && (
          <ContentCarousel
            title="Tendances"
            items={trendingAll}
            type="film"
          />
        )}

        {/* Nouveautes Films */}
        {latestFilms.length > 0 && (
          <ContentCarousel
            title="Nouveaux Films"
            items={latestFilms}
            type="film"
            viewAllHref="/films"
          />
        )}

        {/* Nouveautes Series */}
        {latestSeries.length > 0 && (
          <ContentCarousel
            title="Nouvelles Series"
            items={latestSeries}
            type="serie"
            viewAllHref="/series"
          />
        )}

        {/* Section Films grille */}
        {latestFilms.length > 0 && (
          <section className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="section-title mb-0">Films</h4>
              <a
                href="/films"
                style={{
                  color: "var(--cinaf-gold)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                Voir tout <i className="bi bi-arrow-right" />
              </a>
            </div>
            <ContentGrid items={latestFilms.slice(0, 8)} type="film" />
          </section>
        )}

        {/* Section Series grille */}
        {latestSeries.length > 0 && (
          <section className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="section-title mb-0">Series</h4>
              <a
                href="/series"
                style={{
                  color: "var(--cinaf-gold)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                Voir tout <i className="bi bi-arrow-right" />
              </a>
            </div>
            <ContentGrid items={latestSeries.slice(0, 8)} type="serie" />
          </section>
        )}

        {/* Empty state */}
        {latestFilms.length === 0 && latestSeries.length === 0 && (
          <div className="text-center py-5">
            <i
              className="bi bi-camera-reels"
              style={{ fontSize: "4rem", color: "var(--cinaf-text-muted)" }}
            />
            <h3
              className="mt-3"
              style={{ color: "var(--cinaf-text)", fontWeight: 600 }}
            >
              Le catalogue arrive bientot
            </h3>
            <p style={{ color: "var(--cinaf-text-muted)" }}>
              Nos equipes preparent les meilleurs films et series africains pour
              vous.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
