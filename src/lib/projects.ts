import type { Project } from "@/data/projects";
import { PROJECTS as STATIC_PROJECTS } from "@/data/projects";
import { supabase } from "./supabase";
import {
  mapDbRowToProject,
  PROJECT_HOME_SELECT,
  type ProjectDbRow,
} from "./projects-shared";

export async function getProjects(): Promise<Project[]> {
  if (!supabase) return STATIC_PROJECTS;
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_HOME_SELECT)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getProjects] Failed to fetch from Supabase:", error.message);
    return [];
  }
  if (!data?.length) return [];
  return data.map((row) => mapDbRowToProject(row as ProjectDbRow));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!supabase) {
    return STATIC_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_HOME_SELECT)
    .eq("slug", slug)
    .single();
  if (error || !data) {
    return STATIC_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
  return mapDbRowToProject(data as ProjectDbRow);
}
