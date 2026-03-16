export type ImageVariantKind = "small" | "medium" | "full";

export interface ImageVariant {
  url: string;
}

export interface ImageVariantSet {
  small: ImageVariant;
  medium: ImageVariant;
  full: ImageVariant;
}

/** Compression presets for each variant size (used on the client before upload). */
export const IMAGE_VARIANT_COMPRESSION_PRESETS = {
  small: {
    maxWidthOrHeight: 800,
    initialQuality: 0.8,
    maxSizeMB: 2,
  },
  medium: {
    maxWidthOrHeight: 1600,
    initialQuality: 0.85,
    maxSizeMB: 6,
  },
  full: {
    maxWidthOrHeight: 2800,
    initialQuality: 0.9,
    maxSizeMB: 10,
  },
} as const;

/** Filename prefixes for each variant when storing in Supabase Storage. */
export const IMAGE_VARIANT_STORAGE_PREFIX = {
  small: "thumb_",
  medium: "medium_",
  full: "full_",
} as const;

/** Helper to quickly build a full variant set from a single URL. */
export function createImageVariantSetFromSingleUrl(url: string): ImageVariantSet {
  const v = { url };
  return {
    small: v,
    medium: v,
    full: v,
  };
}

/**
 * Legacy helper: derive thumb / full URL from stored medium URL (Storage path convention: thumb_*, medium_*, full_*).
 * Fallback: if URL does not contain "medium_", return same URL for all (e.g. legacy single-version data).
 */
export function getImageVariantUrls(mediumUrl: string): {
  thumbUrl: string;
  mediumUrl: string;
  fullUrl: string;
} {
  if (!mediumUrl || !mediumUrl.includes("medium_")) {
    return { thumbUrl: mediumUrl, mediumUrl, fullUrl: mediumUrl };
  }
  const thumbUrl = mediumUrl.replace("/medium_", "/thumb_");
  const fullUrl = mediumUrl.replace("/medium_", "/full_");
  return { thumbUrl, mediumUrl, fullUrl };
}

