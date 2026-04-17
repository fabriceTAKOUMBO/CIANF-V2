// ============================================================
// CINAF v2 — Affichage note en etoiles (lecture seule)
// ============================================================

interface StarRatingProps {
  rating: number; // 0 a 5
  size?: string;
}

export default function StarRating({ rating, size = "0.85rem" }: StarRatingProps) {
  const stars = [];
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <i
          key={i}
          className="bi bi-star-fill"
          style={{ color: "var(--cinaf-gold)", fontSize: size }}
        />
      );
    } else if (i === full && half) {
      stars.push(
        <i
          key={i}
          className="bi bi-star-half"
          style={{ color: "var(--cinaf-gold)", fontSize: size }}
        />
      );
    } else {
      stars.push(
        <i
          key={i}
          className="bi bi-star"
          style={{ color: "var(--cinaf-text-muted)", fontSize: size }}
        />
      );
    }
  }

  return (
    <span className="d-inline-flex align-items-center gap-1">
      {stars}
      <span style={{ fontSize: size, color: "var(--cinaf-text-muted)", marginLeft: 4 }}>
        {clamped.toFixed(1)}
      </span>
    </span>
  );
}
