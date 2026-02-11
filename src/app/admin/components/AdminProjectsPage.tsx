"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Trash2 } from "lucide-react";

interface AdminProject {
  id: string;
  slug: string;
  title: string;
  src: string;
  start_date: string;
  end_date: string;
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError(
        "Cần cấu hình Supabase (.env.local) để sử dụng trang admin."
      );
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase!
        .from("projects")
        .select("id, slug, title, src, start_date, end_date")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProjects((data ?? []) as AdminProject[]);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const handleDelete = async (projectId: string) => {
    if (!supabase) return;
    const confirmed = window.confirm("Bạn có chắc muốn xóa project này?");
    if (!confirmed) return;

    setDeletingId(projectId);
    setError(null);

    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      setError(error.message);
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }

    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Danh sách album</h1>
          <p className="text-sm text-muted-foreground">
            Xem nhanh các project và xóa nếu cần.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/upload" className="flex items-center gap-2">
            Upload project mới
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có project nào. Hãy tạo mới ở trang Upload.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={project.src}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-1">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {project.start_date} - {project.end_date}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${project.slug}`} target="_blank">
                    Xem trên site
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                  disabled={deletingId === project.id}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="size-4" />
                  {deletingId === project.id ? "Đang xóa..." : "Xóa nhanh"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

