import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const projects = await getProjects();

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projects.map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: new Date(p.endDate),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
