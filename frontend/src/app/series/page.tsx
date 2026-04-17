"use client";

// ============================================================
// CINAF v2 — Page Series (liste paginee)
// ============================================================

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { catalogue, type Serie } from "@/lib/api";
import ContentGrid from "@/components/ContentGrid";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export default function SeriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const q = searchParams.get("q") || "";

  const [series, setSeries] = useState<Serie[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    catalogue
      .getSeries(page, q || undefined)
      .then((res) => {
        setSeries(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, q]);

  const updatePage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/series?${params.toString()}`);
  };

  return (
    <div className="container py-4">
      <h2 className="section-title">Series</h2>

      <div className="mb-4">
        <SearchBar
          mode="inline"
          defaultValue={q}
          onChange={(val) => {
            const params = new URLSearchParams();
            if (val) params.set("q", val);
            params.set("page", "1");
            router.push(`/series?${params.toString()}`);
          }}
          placeholder="Rechercher une serie..."
        />
      </div>

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
      ) : (
        <>
          <p style={{ color: "var(--cinaf-text-muted)", fontSize: "0.85rem" }}>
            {total} serie{total !== 1 ? "s" : ""}
          </p>
          <ContentGrid items={series} type="serie" />
          <Pagination
            currentPage={page}
            totalItems={total}
            onPageChange={updatePage}
          />
        </>
      )}
    </div>
  );
}
