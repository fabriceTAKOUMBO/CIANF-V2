"use client";

// ============================================================
// CINAF v2 — Page Watch Film (lecteur Bunny.net)
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { catalogue, type Film, type StreamInfo } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import BunnyPlayer from "@/components/BunnyPlayer";

export default function WatchFilmPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [film, setFilm] = useState<Film | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load film data and stream info
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        const [filmData, stream] = await Promise.all([
          catalogue.getFilm(id),
          catalogue.getFilmStream(id),
        ]);
        setFilm(filmData);
        setStreamInfo(stream);
      } catch (err: unknown) {
        const apiErr = err as { statusCode?: number; message?: string };
        if (apiErr.statusCode === 403) {
          setError("premium");
        } else {
          setError("generic");
        }
        // Still try to load film info
        try {
          const filmData = await catalogue.getFilm(id);
          setFilm(filmData);
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isAuthenticated]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="watch-page d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border" style={{ color: "var(--cinaf-gold)" }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="watch-page d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: "var(--cinaf-gold)", width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p style={{ color: "var(--cinaf-text-muted)" }}>Preparation du lecteur...</p>
        </div>
      </div>
    );
  }

  // Premium gate
  if (error === "premium" && film) {
    return (
      <div className="watch-page">
        <div className="container py-5">
          <div className="text-center" style={{ maxWidth: 500, margin: "0 auto" }}>
            <i className="bi bi-lock-fill" style={{ fontSize: "4rem", color: "var(--cinaf-gold)" }} />
            <h3 className="mt-3" style={{ color: "var(--cinaf-text)", fontWeight: 700 }}>
              Contenu Premium
            </h3>
            <p style={{ color: "var(--cinaf-text-muted)" }}>
              <strong>{film.title}</strong> est un contenu reserve aux abonnes Premium.
              Abonnez-vous pour profiter de tout le catalogue CINAF.
            </p>
            <div className="d-flex gap-3 justify-content-center mt-4">
              <Link href="/abonnements" className="btn btn-cinaf px-4">
                Decouvrir les offres
              </Link>
              <Link href={`/films/${film.id}`} className="btn btn-cinaf-outline px-4">
                Retour a la fiche
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic error
  if (error || !streamInfo) {
    return (
      <div className="watch-page">
        <div className="container py-5 text-center">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: "3rem", color: "var(--cinaf-gold)" }} />
          <h3 className="mt-3" style={{ color: "var(--cinaf-text)" }}>Impossible de charger la video</h3>
          <Link href="/films" className="btn btn-cinaf-outline mt-3">
            Retour aux films
          </Link>
        </div>
      </div>
    );
  }

  // Extract bunny video ID from embedUrl or use film data
  const videoId = film?.bunnyVideoId || streamInfo.embedUrl.split("/").pop() || "";

  return (
    <div className="watch-page">
      {/* Minimal header */}
      <div
        className="d-flex align-items-center gap-3 px-3 py-2"
        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      >
        <Link
          href={`/films/${id}`}
          style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}
        >
          <i className="bi bi-arrow-left me-1" />
          Retour
        </Link>
        {film && (
          <span style={{ color: "var(--cinaf-text)", fontWeight: 600, fontSize: "0.9rem" }}>
            {film.title}
          </span>
        )}
      </div>

      {/* Player */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem" }}>
        <BunnyPlayer videoId={videoId} autoplay />
      </div>

      {/* Film info below player */}
      {film && (
        <div className="container py-4" style={{ maxWidth: 1200 }}>
          <h3 style={{ color: "var(--cinaf-text)", fontWeight: 700 }}>{film.title}</h3>
          <div className="d-flex align-items-center gap-3 flex-wrap mt-2 mb-3">
            <span style={{ color: "var(--cinaf-text-muted)" }}>{film.year}</span>
            {film.duration > 0 && (
              <span style={{ color: "var(--cinaf-text-muted)" }}>{film.duration} min</span>
            )}
            {film.genres?.map((g) => (
              <span key={g.id} className="genre-badge">{g.name}</span>
            ))}
          </div>
          <p style={{ color: "var(--cinaf-text)", lineHeight: 1.6 }}>{film.synopsis}</p>
        </div>
      )}
    </div>
  );
}
