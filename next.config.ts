import type { NextConfig } from "next";

const esDesarrollo = process.env.NODE_ENV === "development";

// Content-Security-Policy: solo se permite cargar recursos del propio sitio,
// imágenes de Unsplash y conectarse a Supabase. 'unsafe-eval' solo en desarrollo.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

// Cabeceras de seguridad que se envían en TODAS las respuestas
const cabecerasSeguridad = [
  { key: "X-Frame-Options", value: "DENY" }, // evita clickjacking
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // no revela que el sitio usa Next.js
  images: {
    // Fotos libres de Unsplash (next/image las optimiza y las sirve desde el propio sitio)
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: cabecerasSeguridad }];
  },
};

export default nextConfig;
