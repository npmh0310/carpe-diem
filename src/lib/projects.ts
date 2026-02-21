import type { Project } from "@/data/projects";
import { PROJECTS as STATIC_PROJECTS } from "@/data/projects";
import { supabase } from "./supabase";

type DbProject = {
  slug: string;
  title: string;
  src: string;
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
    startDate: row.start_date,
    endDate: row.end_date,
    filmName: row.film_name,
    camera: row.camera,
    location: row.location,
    photographer: row.photographer,
    lab: row.lab,
    framesCount: row.frames_count ?? undefined,
    description: row.description,
    images: row.images ?? undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  if (!supabase) return STATIC_PROJECTS;
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getProjects] Failed to fetch from Supabase:", error.message);
    return [];
  }
  if (!data?.length) return [];
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
