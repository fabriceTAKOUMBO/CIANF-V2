"use client";

// ============================================================
// CINAF v2 — Navbar principale
// ============================================================

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const collapseRef = useRef<HTMLDivElement>(null);

  // Fermer le menu mobile après navigation
  const closeCollapse = () => {
    if (collapseRef.current && collapseRef.current.classList.contains("show")) {
      // Bootstrap 5 collapse API via import dynamique
      import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bs) => {
        const collapseEl = collapseRef.current;
        if (collapseEl) {
          const bsCollapse = bs.Collapse.getInstance(collapseEl);
          bsCollapse?.hide();
        }
      });
    }
  };

  const handleLogout = async () => {
    closeCollapse();
    await logout();
    router.push("/login");
  };

  // Récupère les initiales pour l'avatar
  const getInitials = (): string => {
    if (!user) return "?";
    const f = user.firstName?.[0] ?? "";
    const l = user.lastName?.[0] ?? "";
    return (f + l).toUpperCase() || user.email[0].toUpperCase();
  };

  // Récupère le nom d'affichage
  const getDisplayName = (): string => {
    if (!user) return "";
    if (user.firstName || user.lastName) {
      return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    }
    return user.email;
  };

  useEffect(() => {
    // Initialiser le collapse Bootstrap
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <nav className="navbar navbar-expand-lg cinaf-navbar sticky-top" style={{ zIndex: 1030 }}>
      <div className="container">
        {/* Logo */}
        <Link href="/" className="navbar-brand cinaf-logo-text" onClick={closeCollapse}>
          CINAF
        </Link>

        {/* Toggler mobile */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Ouvrir le menu"
        >
          <i className="bi bi-list" style={{ fontSize: "1.5rem", color: "var(--cinaf-text)" }} />
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarMain" ref={collapseRef}>
          {/* Liens principaux */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/catalogue" className="nav-link" onClick={closeCollapse}>
                Catalogue
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/films" className="nav-link" onClick={closeCollapse}>
                Films
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/series" className="nav-link" onClick={closeCollapse}>
                Series
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/studios" className="nav-link" onClick={closeCollapse}>
                Studios
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/abonnements" className="nav-link" onClick={closeCollapse}>
                Abonnements
              </Link>
            </li>
          </ul>

          {/* Zone droite — recherche + auth */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-lg-block">
              <SearchBar mode="redirect" compact />
            </div>
            {isAuthenticated ? (
              /* Utilisateur connecté */
              <div className="dropdown">
                <button
                  className="btn d-flex align-items-center gap-2 p-0 border-0 bg-transparent"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ cursor: "pointer" }}
                >
                  {/* Avatar initiales */}
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--cinaf-gold), #a07830)",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials()}
                  </span>
                  <span
                    className="d-none d-lg-inline"
                    style={{
                      color: "var(--cinaf-text)",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      maxWidth: 130,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getDisplayName()}
                  </span>
                  <i
                    className="bi bi-chevron-down d-none d-lg-inline"
                    style={{ fontSize: "0.7rem", color: "var(--cinaf-text-muted)" }}
                  />
                </button>

                <ul className="dropdown-menu dropdown-menu-end mt-2">
                  <li>
                    <Link
                      href="/profile"
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={closeCollapse}
                    >
                      <i className="bi bi-person" style={{ color: "var(--cinaf-gold)" }} />
                      Mon profil
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right" style={{ color: "var(--cinaf-danger)" }} />
                      <span style={{ color: "var(--cinaf-danger)" }}>Déconnexion</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              /* Utilisateur non connecté */
              <>
                <Link
                  href="/login"
                  className="btn btn-cinaf-outline btn-sm px-3"
                  onClick={closeCollapse}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="btn btn-cinaf btn-sm px-3"
                  onClick={closeCollapse}
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
