/** Canonical site origin for sitemap, robots, and metadata. Override with NEXT_PUBLIC_SITE_URL. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const u = process.env.NEXT_PUBLIC_SITE_URL;
    const normalized = u.startsWith("http") ? u : `https://${u}`;
    return normalized.replace(/\/$/, "");
  }
  // Vercel preview: deployment URL. Production + local dev use the public domain below.
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    const u = process.env.VERCEL_URL;
    const normalized = u.startsWith("http") ? u : `https://${u}`;
    return normalized.replace(/\/$/, "");
  }
  return "https://carpe-diem.io.vn";
}
