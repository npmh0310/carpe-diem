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
import { ArrowRight, ListOrdered, Trash2 } from "lucide-react";
import { EditOrderDialog } from "./EditOrderDialog";

interface AdminProject {
  id: string;
  slug: string;
  title: string;
  src: string;
  display_order?: number | null;
  start_date: string;
  end_date: string;
}

function ProjectCard({
  project,
  saving,
  onDelete,
  deleting,
}: {
  project: AdminProject;
  saving: boolean;
  deleting: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-muted/40">
        <div className="text-xs text-muted-foreground truncate min-w-0">
          {project.slug}
        </div>
        <div className="text-xs text-muted-foreground shrink-0">
          {project.start_date} - {project.end_date}
        </div>
      </div>

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
          Thứ tự hiển thị:{" "}
          {typeof project.display_order === "number"
            ? project.display_order + 1
            : "—"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${project.slug}`} target="_blank">
              Xem
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/admin/edit/${project.id}`}>
              Edit
            </Link>
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(project.id)}
          disabled={deleting || saving}
          className="flex items-center gap-1"
        >
          <Trash2 className="size-4" />
          {deleting ? "Đang xóa..." : "Xóa"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

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
        .select("id, slug, title, src, display_order, start_date, end_date")
        .order("display_order", { ascending: true, nullsFirst: false })
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

  const handleSaveOrder = async (draftIds: string[]) => {
    if (!supabase) return;
    setSavingOrder(true);
    setError(null);
    try {
      const results = await Promise.all(
        draftIds.map((id, i) =>
          supabase!
            .from("projects")
            .update({ display_order: i })
            .eq("id", id)
        )
      );
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) throw firstError;
      setProjects((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        const next: AdminProject[] = [];
        for (const [i, id] of draftIds.entries()) {
          const p = byId.get(id);
          if (!p) return prev;
          next.push({ ...p, display_order: i });
        }
        return next;
      });
      setSavedAt(Date.now());
      setOrderDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu thứ tự.");
    } finally {
      setSavingOrder(false);
    }
  };

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
            Chỉnh thứ tự hiển thị ngoài trang chủ bằng nút Edit order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOrderDialogOpen(true)}
            disabled={savingOrder || loading || projects.length === 0}
            className="flex items-center gap-2"
          >
            <ListOrdered className="size-4" />
            Edit order
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/upload" className="flex items-center gap-2">
              Upload project mới
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {savedAt && (
        <p className="text-sm text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-md">
          Đã lưu thứ tự hiển thị.
        </p>
      )}

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
            <ProjectCard
              key={project.id}
              project={project}
              saving={savingOrder}
              deleting={deletingId === project.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EditOrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        projects={projects}
        saving={savingOrder}
        onSave={handleSaveOrder}
      />
    </div>
  );
}

