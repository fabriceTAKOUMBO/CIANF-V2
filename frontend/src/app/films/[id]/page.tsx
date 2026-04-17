"use client";

// ============================================================
// CINAF v2 — Fiche Film
// ============================================================

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { catalogue, type Film } from "@/lib/api";
import StarRating from "@/components/StarRating";
import TrailerModal from "@/components/TrailerModal";

export default function FilmDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    catalogue
      .getFilm(id)
      .then(setFilm)
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

  if (!film) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-triangle" style={{ fontSize: "3rem", color: "var(--cinaf-gold)" }} />
        <h3 className="mt-3" style={{ color: "var(--cinaf-text)" }}>Film introuvable</h3>
        <Link href="/films" className="btn btn-cinaf-outline mt-3">
          Retour aux films
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
          backgroundImage: film.posterUrl ? `url(${film.posterUrl})` : undefined,
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
              {film.posterUrl ? (
                <img
                  src={film.posterUrl}
                  alt={film.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center h-100"
                  style={{ backgroundColor: "var(--cinaf-surface-2)" }}
                >
                  <i className="bi bi-film" style={{ fontSize: "4rem", color: "var(--cinaf-text-muted)" }} />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="col-12 col-md-8 col-lg-9">
            {/* Premium badge */}
            {film.isPremium && (
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
              {film.title}
            </h1>

            {/* Meta */}
            <div className="d-flex align-items-center gap-3 flex-wrap mt-2 mb-3">
              <span style={{ color: "var(--cinaf-text-muted)" }}>{film.year}</span>
              {film.duration > 0 && (
                <span style={{ color: "var(--cinaf-text-muted)" }}>
                  <i className="bi bi-clock me-1" />
                  {film.duration} min
                </span>
              )}
              {film.language && (
                <span style={{ color: "var(--cinaf-text-muted)" }}>
                  <i className="bi bi-translate me-1" />
                  {film.language.name}
                </span>
              )}
              {film.avgRating != null && film.avgRating > 0 && (
                <StarRating rating={film.avgRating} />
              )}
              <span style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}>
                <i className="bi bi-eye me-1" />
                {film.viewCount} vues
              </span>
            </div>

            {/* Genres */}
            <div className="d-flex gap-2 flex-wrap mb-3">
              {film.genres?.map((g) => (
                <span key={g.id} className="genre-badge">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Countries */}
            {film.countries?.length > 0 && (
              <p style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}>
                <i className="bi bi-geo-alt me-1" />
                {film.countries.map((c) => c.name).join(", ")}
              </p>
            )}

            {/* Synopsis */}
            <div className="mb-4">
              <h5 style={{ color: "var(--cinaf-gold)", fontWeight: 600, fontSize: "1rem" }}>
                Synopsis
              </h5>
              <p style={{ color: "var(--cinaf-text)", lineHeight: 1.7 }}>
                {film.synopsis}
              </p>
            </div>

            {/* Action buttons */}
            <div className="d-flex gap-3 flex-wrap mb-4">
              <Link href={`/watch/film/${film.id}`} className="btn btn-cinaf px-4">
                <i className="bi bi-play-fill me-1" />
                Regarder
              </Link>
              {film.trailerBunnyId && (
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
            {film.isPremium && (
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

            {/* Directors */}
            {film.directors?.length > 0 && (
              <div className="mb-4">
                <h5 style={{ color: "var(--cinaf-gold)", fontWeight: 600, fontSize: "1rem" }}>
                  Realisateur{film.directors.length > 1 ? "s" : ""}
                </h5>
                <div className="d-flex gap-3 flex-wrap">
                  {film.directors.map((p) => (
                    <div key={p.id} className="person-card">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`} className="person-photo" />
                      ) : (
                        <div className="person-photo-placeholder">
                          <i className="bi bi-person" style={{ fontSize: "1.5rem", color: "var(--cinaf-text-muted)" }} />
                        </div>
                      )}
                      <p style={{ color: "var(--cinaf-text)", fontSize: "0.8rem", margin: 0 }}>
                        {p.firstName} {p.lastName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cast */}
            {film.cast?.length > 0 && (
              <div className="mb-4">
                <h5 style={{ color: "var(--cinaf-gold)", fontWeight: 600, fontSize: "1rem" }}>
                  Casting
                </h5>
                <div className="d-flex gap-3 flex-wrap">
                  {film.cast.map((p) => (
                    <div key={p.id} className="person-card">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`} className="person-photo" />
                      ) : (
                        <div className="person-photo-placeholder">
                          <i className="bi bi-person" style={{ fontSize: "1.5rem", color: "var(--cinaf-text-muted)" }} />
                        </div>
                      )}
                      <p style={{ color: "var(--cinaf-text)", fontSize: "0.8rem", margin: 0 }}>
                        {p.firstName} {p.lastName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {film.trailerBunnyId && (
        <TrailerModal
          trailerBunnyId={film.trailerBunnyId}
          show={showTrailer}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
}
