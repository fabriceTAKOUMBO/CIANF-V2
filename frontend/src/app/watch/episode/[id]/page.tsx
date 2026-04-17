"use client";

// ============================================================
// CINAF v2 — Page Watch Episode (lecteur Bunny.net)
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { catalogue, type Serie, type Episode, type StreamInfo } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import BunnyPlayer from "@/components/BunnyPlayer";

interface EpisodeContext {
  serie: Serie;
  seasonNumber: number;
  episode: Episode;
  prevEpisodeId?: string;
  nextEpisodeId?: string;
}

export default function WatchEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [ctx, setCtx] = useState<EpisodeContext | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load stream info
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        const stream = await catalogue.getEpisodeStream(id);
        setStreamInfo(stream);
      } catch (err: unknown) {
        const apiErr = err as { statusCode?: number };
        if (apiErr.statusCode === 403) {
          setError("premium");
        } else {
          setError("generic");
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isAuthenticated]);

  // Try to get episode context from series data
  // This is a best-effort approach since we only have the episode ID
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadContext() {
      try {
        // We load all series to find which one contains this episode
        // In a real scenario, we would have a dedicated endpoint
        const seriesData = await catalogue.getSeries(1);
        for (const serie of seriesData.items) {
          const fullSerie = await catalogue.getSerie(serie.id);
          for (const season of fullSerie.seasons || []) {
            const allEpisodes = (season.episodes || []).sort((a, b) => a.number - b.number);
            const epIndex = allEpisodes.findIndex((ep) => ep.id === id);
            if (epIndex !== -1) {
              const episode = allEpisodes[epIndex];
              setCtx({
                serie: fullSerie,
                seasonNumber: season.number,
                episode,
                prevEpisodeId: epIndex > 0 ? allEpisodes[epIndex - 1].id : undefined,
                nextEpisodeId: epIndex < allEpisodes.length - 1 ? allEpisodes[epIndex + 1].id : undefined,
              });
              return;
            }
          }
        }
      } catch {
        // Context loading is best-effort
      }
    }
    loadContext();
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
  if (error === "premium") {
    return (
      <div className="watch-page">
        <div className="container py-5">
          <div className="text-center" style={{ maxWidth: 500, margin: "0 auto" }}>
            <i className="bi bi-lock-fill" style={{ fontSize: "4rem", color: "var(--cinaf-gold)" }} />
            <h3 className="mt-3" style={{ color: "var(--cinaf-text)", fontWeight: 700 }}>
              Contenu Premium
            </h3>
            <p style={{ color: "var(--cinaf-text-muted)" }}>
              Cet episode est reserve aux abonnes Premium.
            </p>
            <div className="d-flex gap-3 justify-content-center mt-4">
              <Link href="/abonnements" className="btn btn-cinaf px-4">
                Decouvrir les offres
              </Link>
              {ctx && (
                <Link href={`/series/${ctx.serie.id}`} className="btn btn-cinaf-outline px-4">
                  Retour a la serie
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !streamInfo) {
    return (
      <div className="watch-page">
        <div className="container py-5 text-center">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: "3rem", color: "var(--cinaf-gold)" }} />
          <h3 className="mt-3" style={{ color: "var(--cinaf-text)" }}>Impossible de charger la video</h3>
          <Link href="/series" className="btn btn-cinaf-outline mt-3">
            Retour aux series
          </Link>
        </div>
      </div>
    );
  }

  const videoId = ctx?.episode?.bunnyVideoId || streamInfo.embedUrl.split("/").pop() || "";

  return (
    <div className="watch-page">
      {/* Minimal header */}
      <div
        className="d-flex align-items-center gap-3 px-3 py-2"
        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      >
        {ctx ? (
          <Link
            href={`/series/${ctx.serie.id}`}
            style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}
          >
            <i className="bi bi-arrow-left me-1" />
            {ctx.serie.title}
          </Link>
        ) : (
          <Link
            href="/series"
            style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}
          >
            <i className="bi bi-arrow-left me-1" />
            Retour
          </Link>
        )}
        {ctx && (
          <span style={{ color: "var(--cinaf-text)", fontWeight: 600, fontSize: "0.9rem" }}>
            S{ctx.seasonNumber}E{ctx.episode.number} — {ctx.episode.title}
          </span>
        )}
      </div>

      {/* Player */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem" }}>
        <BunnyPlayer videoId={videoId} autoplay />
      </div>

      {/* Episode info + navigation */}
      <div className="container py-4" style={{ maxWidth: 1200 }}>
        {ctx && (
          <>
            <h4 style={{ color: "var(--cinaf-text)", fontWeight: 700 }}>
              {ctx.episode.title}
            </h4>
            <p style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}>
              {ctx.serie.title} — Saison {ctx.seasonNumber}, Episode {ctx.episode.number}
              {ctx.episode.duration > 0 && ` — ${ctx.episode.duration} min`}
            </p>
            {ctx.episode.synopsis && (
              <p style={{ color: "var(--cinaf-text)", lineHeight: 1.6 }}>
                {ctx.episode.synopsis}
              </p>
            )}

            {/* Episode navigation */}
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: "1px solid var(--cinaf-border)" }}>
              {ctx.prevEpisodeId ? (
                <Link
                  href={`/watch/episode/${ctx.prevEpisodeId}`}
                  className="btn btn-cinaf-outline btn-sm"
                >
                  <i className="bi bi-skip-backward-fill me-1" />
                  Episode precedent
                </Link>
              ) : (
                <div />
              )}
              {ctx.nextEpisodeId && (
                <Link
                  href={`/watch/episode/${ctx.nextEpisodeId}`}
                  className="btn btn-cinaf btn-sm"
                >
                  Episode suivant
                  <i className="bi bi-skip-forward-fill ms-1" />
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
