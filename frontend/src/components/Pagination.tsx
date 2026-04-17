// ============================================================
// CINAF v2 — Pagination Bootstrap styled CINAF
// ============================================================

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (totalPages <= 1) return null;

  // Show max 7 page numbers
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav aria-label="Navigation des pages" className="d-flex justify-content-center mt-4">
      <ul className="pagination cinaf-pagination">
        <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <i className="bi bi-chevron-left" />
          </button>
        </li>
        {pages.map((p, i) =>
          p === "..." ? (
            <li key={`ellipsis-${i}`} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
              <button className="page-link" onClick={() => onPageChange(p)}>
                {p}
              </button>
            </li>
          )
        )}
        <li className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
