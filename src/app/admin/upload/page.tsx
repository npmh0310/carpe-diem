"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BUCKET = "project-images";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Sanitize filename cho Supabase Storage: chỉ giữ a-z, 0-9, -, _, . */
function sanitizeFileName(name: string): string {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  const base = name.slice(0, name.length - ext.length);
  const safe = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  return (safe || "image") + ext;
}

function FormField({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    filmName: "",
    camera: "",
    location: "",
    photographer: "",
    lab: "",
    framesCount: 36,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setCoverPreview(null);
  }, [coverFile]);

  useEffect(() => {
    galleryFiles.forEach((f) => {
      const url = URL.createObjectURL(f);
      return () => URL.revokeObjectURL(url);
    });
    const urls = galleryFiles.map((f) => URL.createObjectURL(f));
    setGalleryPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [galleryFiles]);

  const handleTitleChange = (v: string) => {
    setForm((f) => ({ ...f, title: v, slug: slugify(v) }));
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase!.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase!.storage
      .from(BUCKET)
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  if (!supabase) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload project</CardTitle>
            <CardDescription>
              Cần cấu hình Supabase. Tạo file <code>.env.local</code> với{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> và{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Xem{" "}
              <code>.env.local.example</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/">← Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!coverFile) {
        throw new Error("Chọn ảnh cover");
      }
      const projectId = crypto.randomUUID();
      const coverPath = `${projectId}/cover_${sanitizeFileName(coverFile.name)}`;
      const src = await uploadFile(coverFile, coverPath);

      const imageUrls: string[] = [];
      for (let i = 0; i < galleryFiles.length; i++) {
        const f = galleryFiles[i];
        const path = `${projectId}/gallery_${i}_${sanitizeFileName(f.name)}`;
        const url = await uploadFile(f, path);
        imageUrls.push(url);
      }

      const { error } = await supabase!.from("projects").insert({
        slug: form.slug || slugify(form.title),
        title: form.title,
        src,
        start_date: form.startDate,
        end_date: form.endDate,
        film_name: form.filmName,
        camera: form.camera,
        location: form.location,
        photographer: form.photographer,
        lab: form.lab,
        frames_count: form.framesCount,
        description: form.description,
        images: imageUrls,
      });

      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Về trang chủ
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Upload project mới</h1>
          <div className="w-24" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin project</CardTitle>
              <CardDescription>Tiêu đề, mô tả và metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Title" required>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Maison de Verre"
                  required
                />
              </FormField>
              <FormField label="Slug">
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="maison-de-verre"
                />
              </FormField>
              <FormField label="Description" required>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Mô tả project..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start date">
                  <DatePicker
                    value={form.startDate}
                    onChange={(d) =>
                      setForm((f) => ({ ...f, startDate: d }))
                    }
                    placeholder="Chọn ngày bắt đầu"
                  />
                </FormField>
                <FormField label="End date">
                  <DatePicker
                    value={form.endDate}
                    onChange={(d) =>
                      setForm((f) => ({ ...f, endDate: d }))
                    }
                    placeholder="Chọn ngày kết thúc"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Film name">
                  <Input
                    value={form.filmName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, filmName: e.target.value }))
                    }
                    placeholder="Kodak Portra 400"
                  />
                </FormField>
                <FormField label="Camera">
                  <Input
                    value={form.camera}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, camera: e.target.value }))
                    }
                    placeholder="Contax T2"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Location">
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="Paris, France"
                  />
                </FormField>
                <FormField label="Frames count">
                  <Input
                    type="number"
                    min={1}
                    value={form.framesCount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        framesCount: parseInt(e.target.value, 10) || 36,
                      }))
                    }
                  />
                </FormField>
              </div>
              <FormField label="Photographer">
                <Input
                  value={form.photographer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, photographer: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Lab">
                <Input
                  value={form.lab}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lab: e.target.value }))
                  }
                  placeholder="Local Lab"
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ảnh cover</CardTitle>
              <CardDescription>1 ảnh chính cho project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverPreview ? (
                <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 size-8"
                    onClick={() => setCoverFile(null)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="size-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click để chọn ảnh cover
                  </span>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      setCoverFile(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
              )}
              {!coverPreview && (
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ảnh gallery</CardTitle>
              <CardDescription>Nhiều ảnh – xem trước bên dưới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {galleryPreviews.length > 0 ? (
                <div
                  data-lenis-prevent
                  className="overflow-x-auto overflow-y-hidden pb-2 -mx-1 scroll-smooth snap-x snap-mandatory w-full max-w-full overscroll-x-contain"
                >
                  <div className="flex gap-3 min-w-max px-1">
                    {galleryPreviews.map((url, i) => (
                      <div
                        key={i}
                        className="relative shrink-0 size-24 sm:size-32 rounded-lg overflow-hidden border bg-muted group snap-center"
                      >
                        <img
                          src={url}
                          alt={`Gallery ${i + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeGalleryFile(i)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                        <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white drop-shadow-md bg-black/50 px-1.5 py-0.5 rounded">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="size-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click để chọn nhiều ảnh
                  </span>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      setGalleryFiles(Array.from(e.target.files ?? []))
                    }
                  />
                </label>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files ?? []);
                    setGalleryFiles((prev) => [...prev, ...newFiles]);
                    e.target.value = "";
                  }}
                  className="max-w-xs"
                />
                {galleryPreviews.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setGalleryFiles([])}
                  >
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Đang upload..." : "Tạo project"}
          </Button>
        </form>
      </div>
    </div>
  );
}
