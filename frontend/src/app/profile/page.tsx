"use client";

// ============================================================
// CINAF v2 — Page Profil utilisateur
// Route protégée : redirige vers /login si non authentifié
// ============================================================

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { users } from "@/lib/api";
import type { ApiError } from "@/lib/api";

interface ProfileForm {
  firstName: string;
  lastName: string;
}

const ROLE_LABELS: Record<string, string> = {
  ROLE_USER: "Utilisateur",
  ROLE_ABONNE: "Abonné",
  ROLE_CREATEUR: "Créateur",
  ROLE_MODERATEUR: "Modérateur",
  ROLE_ADMIN: "Administrateur",
};

function getHighestRole(roles: string[]): string {
  const priority = ["ROLE_ADMIN", "ROLE_MODERATEUR", "ROLE_CREATEUR", "ROLE_ABONNE", "ROLE_USER"];
  for (const r of priority) {
    if (roles.includes(r)) return ROLE_LABELS[r] ?? r;
  }
  return "Utilisateur";
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>({ firstName: "", lastName: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Pre-fill form with current user data
  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName });
    }
  }, [user]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric", month: "long", day: "numeric",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSaveError("Le prénom et le nom sont obligatoires.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await users.updateProfile(user.id, { firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      setSaveSuccess(true);
    } catch (err) {
      const apiErr = err as ApiError;
      setSaveError(apiErr.message ?? "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await users.deleteAccount(user.id);
      logout();
      router.replace("/");
    } catch {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      {/* Header profil */}
      <div className="d-flex align-items-center gap-4 mb-5">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3"
          style={{
            width: 80, height: 80,
            background: "linear-gradient(135deg, #c8a84b, #a0783a)",
            color: "#000", flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <h1 className="fw-bold mb-1" style={{ color: "var(--cinaf-text)" }}>
            {user.firstName} {user.lastName}
          </h1>
          <span
            className="badge px-3 py-1"
            style={{ background: "var(--cinaf-gold)", color: "#000", fontWeight: 600 }}
          >
            {getHighestRole(user.roles)}
          </span>
        </div>
      </div>

      {/* Infos compte */}
      <div className="card border-0 mb-4 p-4" style={{ background: "var(--cinaf-surface)", borderRadius: 12 }}>
        <h5 className="fw-semibold mb-3" style={{ color: "var(--cinaf-gold)" }}>
          <i className="bi bi-person-circle me-2" />
          Informations du compte
        </h5>
        <div className="row g-3">
          <div className="col-sm-6">
            <small style={{ color: "var(--cinaf-text-muted)" }}>Email</small>
            <p className="mb-0 fw-medium" style={{ color: "var(--cinaf-text)" }}>{user.email}</p>
          </div>
          <div className="col-sm-6">
            <small style={{ color: "var(--cinaf-text-muted)" }}>Membre depuis</small>
            <p className="mb-0 fw-medium" style={{ color: "var(--cinaf-text)" }}>{memberSince}</p>
          </div>
          <div className="col-sm-6">
            <small style={{ color: "var(--cinaf-text-muted)" }}>Statut</small>
            <p className="mb-0">
              {user.isVerified
                ? <span className="text-success fw-medium"><i className="bi bi-check-circle-fill me-1" />Compte vérifié</span>
                : <span className="text-warning fw-medium"><i className="bi bi-exclamation-circle-fill me-1" />Email non vérifié</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire modification */}
      <div className="card border-0 mb-4 p-4" style={{ background: "var(--cinaf-surface)", borderRadius: 12 }}>
        <h5 className="fw-semibold mb-3" style={{ color: "var(--cinaf-gold)" }}>
          <i className="bi bi-pencil-square me-2" />
          Modifier le profil
        </h5>
        <form onSubmit={handleSave} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label htmlFor="firstName" className="form-label" style={{ color: "var(--cinaf-text-muted)" }}>
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-control cinaf-input"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-sm-6">
              <label htmlFor="lastName" className="form-label" style={{ color: "var(--cinaf-text-muted)" }}>
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-control cinaf-input"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {saveError && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="alert alert-success py-2 mb-3" role="alert">
              <i className="bi bi-check-circle-fill me-2" />
              Profil mis à jour avec succès.
            </div>
          )}

          <button
            type="submit"
            className="btn fw-semibold px-4"
            disabled={isSaving}
            style={{ background: "var(--cinaf-gold)", color: "#000" }}
          >
            {isSaving ? (
              <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</>
            ) : (
              <><i className="bi bi-check-lg me-2" />Enregistrer</>
            )}
          </button>
        </form>
      </div>

      {/* Zone danger */}
      <div
        className="card border-0 p-4"
        style={{ background: "var(--cinaf-surface)", borderRadius: 12, border: "1px solid #3a1a1a !important" }}
      >
        <h5 className="fw-semibold mb-1 text-danger">
          <i className="bi bi-shield-exclamation me-2" />
          Zone dangereuse
        </h5>
        <p style={{ color: "var(--cinaf-text-muted)", fontSize: "0.9rem" }} className="mb-3">
          La suppression de votre compte est irréversible. Toutes vos données seront effacées (RGPD — droit à l'oubli).
        </p>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => setShowDeleteModal(true)}
        >
          <i className="bi bi-trash3-fill me-2" />
          Supprimer mon compte
        </button>
      </div>

      {/* Modal confirmation suppression */}
      {showDeleteModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0" style={{ background: "var(--cinaf-surface)" }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  Confirmer la suppression
                </h5>
              </div>
              <div className="modal-body" style={{ color: "var(--cinaf-text-muted)" }}>
                Êtes-vous sûr de vouloir supprimer votre compte ?
                Cette action est <strong className="text-danger">irréversible</strong>.
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? <><span className="spinner-border spinner-border-sm me-2" />Suppression...</>
                    : <><i className="bi bi-trash3-fill me-2" />Confirmer la suppression</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
