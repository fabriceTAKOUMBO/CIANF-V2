// ============================================================
// CINAF v2 — Layout global (Root Layout)
// ============================================================

import type { Metadata } from "next";
import localFont from "next/font/local";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";

import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BootstrapClient from "@/components/BootstrapClient";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "CINAF v2 — Le cinéma africain à portée de clic",
    template: "%s | CINAF",
  },
  description:
    "Découvrez les meilleurs films et séries africains en streaming HD. CINAF, la plateforme dédiée aux productions du continent africain.",
  keywords: ["streaming", "films africains", "cinéma africain", "séries africaines"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-bs-theme="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* AuthProvider expose le contexte d'authentification à toute l'app */}
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 64px - 200px)" }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
        {/* Bootstrap JS (dynamique, côté client) */}
        <BootstrapClient />
      </body>
    </html>
  );
}
