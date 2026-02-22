/**
 * Derive thumb / full URL from stored medium URL (Storage path convention: thumb_*, medium_*, full_*).
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
