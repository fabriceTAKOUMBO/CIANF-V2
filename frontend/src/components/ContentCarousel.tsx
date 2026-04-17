"use client";

// ============================================================
// CINAF v2 — Carousel horizontal de contenus
// ============================================================

import { useRef } from "react";
import type { Film, Serie } from "@/lib/api";
import ContentCard from "./ContentCard";

interface ContentCarouselProps {
  title: string;
  items: (Film | Serie)[];
  type: "film" | "serie";
  viewAllHref?: string;
}

export default function ContentCarousel({
  title,
  items,
  type,
  viewAllHref,
}: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  return (
    <section className="carousel-section">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4
          style={{
            color: "var(--cinaf-gold)",
            fontWeight: 700,
            fontSize: "1.3rem",
            margin: 0,
          }}
        >
          {title}
        </h4>
        <div className="d-flex align-items-center gap-2">
          {viewAllHref && (
            <a
              href={viewAllHref}
              style={{
                color: "var(--cinaf-gold)",
                fontSize: "0.85rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Voir tout <i className="bi bi-arrow-right" />
            </a>
          )}
          <button
            className="btn btn-sm carousel-arrow"
            onClick={() => scroll("left")}
            aria-label="Defiler vers la gauche"
          >
            <i className="bi bi-chevron-left" />
          </button>
          <button
            className="btn btn-sm carousel-arrow"
            onClick={() => scroll("right")}
            aria-label="Defiler vers la droite"
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div className="carousel-scroll" ref={scrollRef}>
        {items.map((item) => (
          <div key={item.id} className="carousel-item-wrapper">
            <ContentCard content={item} type={type} />
          </div>
        ))}
      </div>
    </section>
  );
}
