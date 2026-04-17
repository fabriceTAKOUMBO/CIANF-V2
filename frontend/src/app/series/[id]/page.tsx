"use client";

// ============================================================
// CINAF v2 — Fiche Serie
// ============================================================

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { catalogue, type Serie } from "@/lib/api";
import StarRating from "@/components/StarRating";
import TrailerModal from "@/components/TrailerModal";

export default function SerieDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [serie, setSerie] = useState<Serie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [openSeason, setOpenSeason] = useState<string | null>(null);

  useEffect(() => {
    catalogue
      .getSerie(id)
      .then((data) => {
        setSerie(data);
        // Open first season by default
        if (data.seasons?.length > 0) {
          setOpenSeason(data.seasons[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border" style={{ color: "var(--cinaf-gold)" }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!serie) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-triangle" style={{ fontSize: "3rem", color: "var(--cinaf-gold)" }} />
        <h3 className="mt-3" style={{ color: "var(--cinaf-text)" }}>Serie introuvable</h3>
        <Link href="/series" className="btn btn-cinaf-outline mt-3">
          Retour aux series
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div
        className="detail-banner"
        style={{
          backgroundImage: serie.posterUrl ? `url(${serie.posterUrl})` : undefined,
          backgroundColor: "var(--cinaf-surface)",
        }}
      >
        <div className="detail-banner-overlay" />
      </div>

      <div className="container" style={{ marginTop: "-15rem", position: "relative", zIndex: 2 }}>
        <div className="row g-4">
          {/* Poster */}
          <div className="col-12 col-md-4 col-lg-3">
            <div
              style={{
                aspectRatio: "2 / 3",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--cinaf-border)",
                boxShadow: "var(--cinaf-shadow)",
              }}
            >
              {serie.posterUrl ? (
                <img
                  src={serie.posterUrl}
                  alt={serie.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center h-100"
                  style={{ backgroundColor: "var(--cinaf-surface-2)" }}
                >
                  <i className="bi bi-collection-play" style={{ fontSize: "4rem", color: "var(--cinaf-text-muted)" }} />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="col-12 col-md-8 col-lg-9">
            {serie.isPremium && (
              <span
                className="badge mb-2"
                style={{
                  backgroundColor: "var(--cinaf-gold)",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              >
                <i className="bi bi-star-fill me-1" />
                Premium
              </span>
            )}

            <h1 style={{ color: "var(--cinaf-text)", fontWeight: 800, fontSize: "2rem" }}>
              {serie.title}
            </h1>

            {/* Meta */}
            <div className="d-flex align-items-center gap-3 flex-wrap mt-2 mb-3">
              <span style={{ color: "var(--cinaf-text-muted)" }}>{serie.year}</span>
              <span style={{ color: "var(--cinaf-text-muted)" }}>
                {serie.seasons?.length || 0} saison{(serie.seasons?.length || 0) !== 1 ? "s" : ""}
              </span>
              {serie.language && (
                <span style={{ color: "var(--cinaf-text-muted)" }}>
                  <i className="bi bi-translate me-1" />
                  {serie.language.name}
                </span>
              )}
              {serie.avgRating != null && serie.avgRating > 0 && (
                <StarRating rating={serie.avgRating} />
              )}
              <span style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}>
                <i className="bi bi-eye me-1" />
                {serie.viewCount} vues
              </span>
            </div>

            {/* Genres */}
            <div className="d-flex gap-2 flex-wrap mb-3">
              {serie.genres?.map((g) => (
                <span key={g.id} className="genre-badge">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Countries */}
            {serie.countries?.length > 0 && (
              <p style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}>
                <i className="bi bi-geo-alt me-1" />
                {serie.countries.map((c) => c.name).join(", ")}
              </p>
            )}

            {/* Synopsis */}
            <div className="mb-4">
              <h5 style={{ color: "var(--cinaf-gold)", fontWeight: 600, fontSize: "1rem" }}>
                Synopsis
              </h5>
              <p style={{ color: "var(--cinaf-text)", lineHeight: 1.7 }}>
                {serie.synopsis}
              </p>
            </div>

            {/* Action buttons */}
            <div className="d-flex gap-3 flex-wrap mb-4">
              {serie.trailerBunnyId && (
                <button
                  className="btn btn-cinaf-outline px-4"
                  onClick={() => setShowTrailer(true)}
                >
                  <i className="bi bi-camera-reels me-1" />
                  Bande-annonce
                </button>
              )}
            </div>

            {/* Premium notice */}
            {serie.isPremium && (
              <div
                className="p-3 rounded mb-4"
                style={{
                  backgroundColor: "var(--cinaf-gold-light)",
                  border: "1px solid rgba(200, 168, 75, 0.3)",
                }}
              >
                <i className="bi bi-star-fill me-2" style={{ color: "var(--cinaf-gold)" }} />
                <span style={{ color: "var(--cinaf-gold)", fontSize: "0.9rem" }}>
                  Ce contenu est reserve aux abonnes Premium.{" "}
                  <Link href="/abonnements" style={{ fontWeight: 600, textDecoration: "underline" }}>
                    Decouvrir nos offres
                  </Link>
                </span>
              </div>
            )}

            {/* Seasons accordion */}
            {serie.seasons && serie.seasons.length > 0 && (
              <div className="mb-4">
                <h5 style={{ color: "var(--cinaf-gold)", fontWeight: 600, fontSize: "1rem" }} className="mb-3">
                  Saisons et episodes
                </h5>
                <div className="accordion accordion-cinaf" id="seasonsAccordion">
                  {serie.seasons
                    .sort((a, b) => a.number - b.number)
                    .map((season) => {
                      const isOpen = openSeason === season.id;
                      return (
                        <div key={season.id} className="accordion-item">
                          <h2 className="accordion-header">
                            <button
                              className={`accordion-button ${isOpen ? "" : "collapsed"}`}
                              type="button"
                              onClick={() => setOpenSeason(isOpen ? null : season.id)}
                            >
                              Saison {season.number}
                              {season.title && ` — ${season.title}`}
                              {season.episodes && (
                                <span
                                  className="ms-2"
                                  style={{ fontSize: "0.8rem", color: "var(--cinaf-text-muted)" }}
                                >
                                  ({season.episodes.length} episode{season.episodes.length !== 1 ? "s" : ""})
                                </span>
                              )}
                            </button>
                          </h2>
                          <div className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}>
                            <div className="accordion-body">
                              {season.episodes && season.episodes.length > 0 ? (
                                season.episodes
                                  .sort((a, b) => a.number - b.number)
                                  .map((ep) => (
                                    <div key={ep.id} className="episode-row">
                                      <span
                                        style={{
                                          color: "var(--cinaf-gold)",
                                          fontWeight: 700,
                                          fontSize: "0.85rem",
                                          minWidth: 30,
                                        }}
                                      >
                                        {ep.number}
                                      </span>
                                      <div className="flex-grow-1">
                                        <p
                                          style={{
                                            color: "var(--cinaf-text)",
                                            margin: 0,
                                            fontWeight: 500,
                                            fontSize: "0.9rem",
                                          }}
                                        >
                                          {ep.title}
                                        </p>
                                        {ep.synopsis && (
                                          <p
                                            style={{
                                              color: "var(--cinaf-text-muted)",
                                              margin: 0,
                                              fontSize: "0.8rem",
                                            }}
                                          >
                                            {ep.synopsis}
                                          </p>
                                        )}
                                      </div>
                                      <span style={{ color: "var(--cinaf-text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                                        {ep.duration} min
                                      </span>
                                      {ep.isPremium && (
                                        <span
                                          style={{
                                            fontSize: "0.65rem",
                                            color: "var(--cinaf-gold)",
                                            fontWeight: 600,
                                          }}
                                        >
                                          Premium
                                        </span>
                                      )}
                                      <Link
                                        href={`/watch/episode/${ep.id}`}
                                        className="btn btn-sm btn-cinaf-outline"
                                        style={{ padding: "2px 12px", fontSize: "0.75rem" }}
                                      >
                                        <i className="bi bi-play-fill" />
                                      </Link>
                                    </div>
                                  ))
                              ) : (
                                <p style={{ color: "var(--cinaf-text-muted)", margin: 0 }}>
                                  Aucun episode disponible
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {serie.trailerBunnyId && (
        <TrailerModal
          trailerBunnyId={serie.trailerBunnyId}
          show={showTrailer}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
}
