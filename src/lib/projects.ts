import type { Project } from "@/data/projects";
import { PROJECTS as STATIC_PROJECTS } from "@/data/projects";
import { createImageVariantSetFromSingleUrl } from "@/lib/image-variants";
import { supabase } from "./supabase";

type DbProject = {
  slug: string;
  title: string;
  src: string;
  display_order?: number | null;
  start_date: string;
  end_date: string;
  film_name: string;
  camera: string;
  location: string;
  photographer: string;
  lab: string;
  frames_count: number | null;
  description: string;
  images: string[] | null;
};

function dbToProject(row: DbProject): Project {
  return {
    slug: row.slug,
    title: row.title,
    src: row.src,
    cover: createImageVariantSetFromSingleUrl(row.src),
    startDate: row.start_date,
    endDate: row.end_date,
    filmName: row.film_name,
    camera: row.camera,
    location: row.location,
    photographer: row.photographer,
    lab: row.lab,
    framesCount: row.frames_count ?? undefined,
    description: row.description,
    images: row.images?.map(createImageVariantSetFromSingleUrl) ?? undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  if (!supabase) return STATIC_PROJECTS;
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error || !data?.length) return STATIC_PROJECTS;
  return data.map((row) => dbToProject(row as DbProject));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!supabase) {
    return STATIC_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) {
    return STATIC_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
  return dbToProject(data as DbProject);
}
