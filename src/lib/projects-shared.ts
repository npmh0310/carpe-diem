import type { Project } from "@/data/projects";

export type ProjectDbRow = {
  id?: string;
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
  created_at?: string;
};

export interface AdminProjectSummary {
  id: string;
  slug: string;
  title: string;
  src: string;
  start_date: string;
  end_date: string;
}

export const PROJECT_HOME_SELECT =
  "slug,title,src,start_date,end_date,film_name,camera,location,photographer,lab,frames_count,description,images,created_at";

export const PROJECT_ADMIN_SELECT =
  "id,slug,title,src,start_date,end_date,created_at";

export function mapDbRowToProject(row: ProjectDbRow): Project {
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

export function mapDbRowToAdminProject(row: ProjectDbRow): AdminProjectSummary {
  return {
    id: String(row.id ?? ""),
    slug: row.slug,
    title: row.title,
    src: row.src,
    start_date: row.start_date,
    end_date: row.end_date,
  };
}

