// ============================================================
// CINAF v2 — Lecteur Bunny.net Stream (iframe responsive)
// ============================================================

interface BunnyPlayerProps {
  videoId: string;
  libraryId?: string;
  autoplay?: boolean;
}

export default function BunnyPlayer({
  videoId,
  libraryId,
  autoplay = false,
}: BunnyPlayerProps) {
  const libId = libraryId || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "";
  const src = `https://player.mediadelivery.net/embed/${libId}/${videoId}?autoplay=${autoplay}&preload=true&rememberPosition=true&showSpeed=true`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "56.25%",
        backgroundColor: "#000",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <iframe
        src={src}
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="Lecteur video CINAF"
      />
    </div>
  );
}
