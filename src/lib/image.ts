type SupabaseImageVariant = "grid" | "lightbox" | "cover";
const ENABLE_SUPABASE_RENDER =
  process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGE_TRANSFORM === "true";

const VARIANT_CONFIG: Record<
  SupabaseImageVariant,
  { width: number; quality: number; format: "origin" | "webp" }
> = {
  grid: { width: 900, quality: 65, format: "webp" },
  lightbox: { width: 1600, quality: 75, format: "webp" },
  cover: { width: 1200, quality: 72, format: "webp" },
};

export function getOptimizedImageUrl(src: string, variant: SupabaseImageVariant): string {
  if (!src) return src;

  try {
    const url = new URL(src);
    const isSupabaseHost = url.hostname.endsWith(".supabase.co");
    const isSupabaseObjectPublic = url.pathname.includes("/storage/v1/object/public/");

    if (!isSupabaseHost) return src;

    // Some stored URLs may be http://... while Next config only allows https.
    if (url.protocol === "http:") {
      url.protocol = "https:";
    }

    if (!isSupabaseObjectPublic) return url.toString();
    if (!ENABLE_SUPABASE_RENDER) return url.toString();

    const { width, quality, format } = VARIANT_CONFIG[variant];

    url.pathname = url.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/"
    );
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", String(quality));
    if (format !== "origin") {
      url.searchParams.set("format", format);
    }

    return url.toString();
  } catch {
    return src;
  }
}
