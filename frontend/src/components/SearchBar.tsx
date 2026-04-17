"use client";

// ============================================================
// CINAF v2 — Barre de recherche avec debounce
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  /** Mode "redirect" : navigue vers /recherche?q=  |  "inline" : appelle onChange */
  mode?: "redirect" | "inline";
  onChange?: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  compact?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  mode = "redirect",
  onChange,
  placeholder = "Rechercher un film, une serie...",
  defaultValue = "",
  compact = false,
  autoFocus = false,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounce = useCallback(
    (val: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (mode === "redirect") {
          router.push(`/recherche?q=${encodeURIComponent(val)}`);
        } else if (onChange) {
          onChange(val);
        }
      }, 300);
    },
    [mode, onChange, router]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    if (val.trim().length >= 2) {
      debounce(val.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (mode === "redirect") {
        router.push(`/recherche?q=${encodeURIComponent(value.trim())}`);
      } else if (onChange) {
        onChange(value.trim());
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className={`input-group ${compact ? "input-group-sm" : ""}`}
      style={{ maxWidth: compact ? 260 : undefined }}
    >
      <span
        className="input-group-text"
        style={{
          backgroundColor: "var(--cinaf-surface-2)",
          borderColor: "var(--cinaf-border)",
          color: "var(--cinaf-text-muted)",
        }}
      >
        <i className="bi bi-search" />
      </span>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />
    </div>
  );
}
