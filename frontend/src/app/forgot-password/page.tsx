"use client";

// ============================================================
// CINAF v2 — Page Mot de passe oublié
// ============================================================

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { auth } from "@/lib/api";
import type { ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez saisir un email valide.");
      return;
    }

    setIsLoading(true);
    try {
      await auth.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      // On affiche le même message générique pour ne pas révéler si l'email existe
      const apiErr = err as ApiError;
      if (apiErr.statusCode >= 500) {
        setError("Une erreur serveur est survenue. Veuillez réessayer plus tard.");
      } else {
        // Pour tout autre cas (404, etc.) on affiche aussi le message générique de succès
        setSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <Link href="/" className="cinaf-logo-text" style={{ textDecoration: "none" }}>
            CINAF
          </Link>
        </div>

        <div className="cinaf-card p-4">
          {submitted ? (
            /* État : email envoyé */
            <div className="text-center py-2">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--cinaf-gold-light)",
                  border: "2px solid rgba(200, 168, 75, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <i
                  className="bi bi-send-check"
                  style={{ fontSize: "1.5rem", color: "var(--cinaf-gold)" }}
                />
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Email envoyé !
              </h2>
              <p
                style={{
                  color: "var(--cinaf-text-muted)",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  marginBottom: "1.5rem",
                }}
              >
                Si <strong style={{ color: "var(--cinaf-text)" }}>{email}</strong> est
                associé à un compte CINAF, vous recevrez un lien de réinitialisation
                dans quelques minutes.
              </p>
              <p
                style={{
                  color: "var(--cinaf-text-muted)",
                  fontSize: "0.8rem",
                  marginBottom: "1.5rem",
                }}
              >
                Pensez à vérifier vos spams si vous ne trouvez pas l&apos;email.
              </p>
              <Link href="/login" className="btn btn-cinaf w-100">
                <i className="bi bi-arrow-left me-2" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* État : formulaire */
            <>
              <h1
                className="mb-1"
                style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--cinaf-text)" }}
              >
                Mot de passe oublié ?
              </h1>
              <p
                style={{
                  color: "var(--cinaf-text-muted)",
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                  lineHeight: 1.5,
                }}
              >
                Saisissez votre email et nous vous enverrons un lien pour
                réinitialiser votre mot de passe.
              </p>

              {/* Erreur */}
              {error && (
                <div className="alert-cinaf-error p-3 mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-circle-fill" />
                  <span style={{ fontSize: "0.875rem" }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    Adresse email
                  </label>
                  <div className="input-group">
                    <span
                      className="input-group-text"
                      style={{
                        backgroundColor: "var(--cinaf-surface-2)",
                        borderColor: "var(--cinaf-border)",
                        color: "var(--cinaf-text-muted)",
                      }}
                    >
                      <i className="bi bi-envelope" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-cinaf w-100 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2" />
                      Recevoir le lien de réinitialisation
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Lien retour */}
        {!submitted && (
          <p
            className="text-center mt-3"
            style={{ color: "var(--cinaf-text-muted)", fontSize: "0.875rem" }}
          >
            <Link href="/login" style={{ color: "var(--cinaf-gold)" }}>
              <i className="bi bi-arrow-left me-1" />
              Retour à la connexion
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
