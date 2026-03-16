"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getImageVariantUrls } from "@/lib/image-variants";
import {
  type GalleryItemTransform,
  DEFAULT_GALLERY_TRANSFORM,
  getGalleryTransformStyle,
} from "@/lib/gallery-transform";
import { GalleryPreviewModal } from "@/app/admin/upload/components/GalleryPreviewModal";
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
import { ArrowLeft, ImageIcon, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EditGalleryItem = {
  _key: string;
  kind: "existing" | "new";
  // existing
  mediumUrl?: string;
  thumbUrl?: string;
  // new
  file?: File;
  blobUrl?: string;
  // shared
  transform: GalleryItemTransform;
  isDirty: boolean;
};

type ImageVariants = { thumb: File; medium: File; full: File };

// ---------------------------------------------------------------------------
// Pure helpers (copied from upload page)
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(name: string): string {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  const base = name.slice(0, name.length - ext.length);
  const safe = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  return (safe || "image") + ext;
}

async function generateImageVariants(file: File): Promise<ImageVariants> {
  if (!file.type.startsWith("image/")) {
    return { thumb: file, medium: file, full: file };
  }
  const opts = { useWebWorker: true as const };
  const thumb = imageCompression(file, { ...opts, maxWidthOrHeight: 800, initialQuality: 0.8, maxSizeMB: 2 }).catch(() => file);
  const medium = imageCompression(file, { ...opts, maxWidthOrHeight: 1600, initialQuality: 0.85, maxSizeMB: 6 }).catch(() => file);
  const full = imageCompression(file, { ...opts, maxWidthOrHeight: 1600, initialQuality: 0.9, maxSizeMB: 8 }).catch(() => file);
  const [t, m, f] = await Promise.all([thumb, medium, full]);
  return { thumb: t, medium: m, full: f };
}

async function applyImageTransform(file: File, t: GalleryItemTransform): Promise<File> {
  if (t.rotation === 0 && !t.flipH && !t.flipV) return file;
  if (!file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const outW = t.rotation === 90 || t.rotation === 270 ? h : w;
      const outH = t.rotation === 90 || t.rotation === 270 ? w : h;
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate((t.rotation * Math.PI) / 180);
      ctx.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1);
      ctx.translate(-w / 2, -h / 2);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => { resolve(blob ? new File([blob], file.name, { type: file.type }) : file); },
        file.type,
        0.92
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// Sub-component: FormField
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const BUCKET = "project-images";

export function EditProjectPage({ id }: { id: string }) {
  const router = useRouter();

  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [improvingDescription, setImprovingDescription] = useState(false);

  // Metadata form
  const [projectDbId, setProjectDbId] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    startDate: "",
    endDate: "",
    filmName: "",
    camera: "",
    location: "",
    photographer: "",
    lab: "",
    framesCount: 36,
  });

  // Cover
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverDragActive, setCoverDragActive] = useState(false);

  // Gallery
  const [galleryItems, setGalleryItems] = useState<EditGalleryItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch project on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!supabase) {
      setFetchError("Cần cấu hình Supabase.");
      setFetching(false);
      return;
    }
    const load = async () => {
      setFetching(true);
      const { data, error } = await supabase!
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setFetchError(error?.message ?? "Không tìm thấy project.");
        setFetching(false);
        return;
      }
      setProjectDbId(data.id);
      setForm({
        title: data.title ?? "",
        slug: data.slug ?? "",
        description: data.description ?? "",
        startDate: data.start_date ?? "",
        endDate: data.end_date ?? "",
        filmName: data.film_name ?? "",
        camera: data.camera ?? "",
        location: data.location ?? "",
        photographer: data.photographer ?? "",
        lab: data.lab ?? "",
        framesCount: data.frames_count ?? 36,
      });
      setExistingCoverUrl(data.src ?? null);
      const images: string[] = Array.isArray(data.images) ? data.images : [];
      setGalleryItems(
        images.map((mediumUrl: string) => {
          const { thumbUrl } = getImageVariantUrls(mediumUrl);
          return {
            _key: crypto.randomUUID(),
            kind: "existing",
            mediumUrl,
            thumbUrl,
            transform: { ...DEFAULT_GALLERY_TRANSFORM },
            isDirty: false,
          };
        })
      );
      setFetching(false);
    };
    load();
  }, [id]);

  // ---------------------------------------------------------------------------
  // Cover preview blob URL
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setCoverPreview(null);
  }, [coverFile]);

  // Cleanup blob URLs for new gallery items on unmount
  useEffect(() => {
    return () => {
      galleryItems.forEach((item) => {
        if (item.blobUrl) URL.revokeObjectURL(item.blobUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Upload helpers
  // ---------------------------------------------------------------------------

  const uploadFile = useCallback(async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase!.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase!.storage.from(BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  }, []);

  const uploadImageVariants = useCallback(async (
    variants: ImageVariants,
    projectId: string,
    namePart: string
  ): Promise<string> => {
    const [, mediumUrl] = await Promise.all([
      uploadFile(variants.thumb, `${projectId}/thumb_${namePart}`),
      uploadFile(variants.medium, `${projectId}/medium_${namePart}`),
      uploadFile(variants.full, `${projectId}/full_${namePart}`),
    ]);
    return mediumUrl;
  }, [uploadFile]);

  // ---------------------------------------------------------------------------
  // Gallery item handlers
  // ---------------------------------------------------------------------------

  const addGalleryFiles = (files: File[]) => {
    const newItems: EditGalleryItem[] = files.map((file) => ({
      _key: crypto.randomUUID(),
      kind: "new",
      file,
      blobUrl: URL.createObjectURL(file),
      transform: { ...DEFAULT_GALLERY_TRANSFORM },
      isDirty: false,
    }));
    setGalleryItems((prev) => [...prev, ...newItems]);
  };

  const removeGalleryItem = (key: string) => {
    setGalleryItems((prev) => {
      const item = prev.find((i) => i._key === key);
      if (item?.blobUrl) URL.revokeObjectURL(item.blobUrl);
      return prev.filter((i) => i._key !== key);
    });
  };

  const updateGalleryTransform = (index: number, patch: Partial<GalleryItemTransform>) => {
    setGalleryItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, transform: { ...item.transform, ...patch }, isDirty: item.kind === "existing" ? true : item.isDirty }
          : item
      )
    );
  };

  const rotateGalleryItem = (index: number, delta: 90 | -90) => {
    setGalleryItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = ((item.transform.rotation + delta + 360) % 360) as 0 | 90 | 180 | 270;
        return {
          ...item,
          transform: { ...item.transform, rotation: next },
          isDirty: item.kind === "existing" ? true : item.isDirty,
        };
      })
    );
  };

  const reorderGallery = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setGalleryItems((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  };

  const swapGallery = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setGalleryItems((prev) => {
      const next = [...prev];
      if (
        fromIndex < 0 || toIndex < 0 ||
        fromIndex >= next.length || toIndex >= next.length
      ) return prev;
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
  };

  // Derived arrays for GalleryPreviewModal (it expects string[] + GalleryItemTransform[])
  const galleryPreviewUrls = galleryItems.map((item) =>
    item.kind === "existing" ? (item.thumbUrl ?? item.mediumUrl ?? "") : (item.blobUrl ?? "")
  );
  const galleryTransforms = galleryItems.map((item) => item.transform);

  // ---------------------------------------------------------------------------
  // Submit / Save
  // ---------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setSavedAt(null);
    setLoading(true);

    try {
      let newSrc = existingCoverUrl ?? "";

      // 1. Upload new cover if replaced
      if (coverFile) {
        const transformed = await applyImageTransform(coverFile, DEFAULT_GALLERY_TRANSFORM);
        const variants = await generateImageVariants(transformed);
        const namePart = `cover_${sanitizeFileName(coverFile.name)}`;
        newSrc = await uploadImageVariants(variants, projectDbId, namePart);
      }

      // 2. Process gallery items
      const imageUrls: string[] = await Promise.all(
        galleryItems.map(async (item, i) => {
          if (item.kind === "new" && item.file) {
            const transformed = await applyImageTransform(item.file, item.transform);
            const variants = await generateImageVariants(transformed);
            const namePart = `${i}_${sanitizeFileName(item.file.name)}`;
            return uploadImageVariants(variants, projectDbId, namePart);
          }
          if (item.kind === "existing" && item.isDirty && item.mediumUrl) {
            // Download existing medium image, re-apply transform, re-upload (overwrite)
            const res = await fetch(item.mediumUrl);
            const blob = await res.blob();
            const ext = item.mediumUrl.includes(".") ? item.mediumUrl.slice(item.mediumUrl.lastIndexOf(".")) : ".jpg";
            const file = new File([blob], `image_${i}${ext}`, { type: blob.type || "image/jpeg" });
            const transformed = await applyImageTransform(file, item.transform);
            const variants = await generateImageVariants(transformed);
            // Keep same storage path so old files are overwritten
            const pathMatch = item.mediumUrl.match(/\/([^/]+\/medium_[^?]+)/);
            const namePart = pathMatch
              ? pathMatch[1].replace(/^[^/]+\/medium_/, "")
              : `${i}_edited.jpg`;
            return uploadImageVariants(variants, projectDbId, namePart);
          }
          // Existing unchanged — keep URL
          return item.mediumUrl ?? "";
        })
      );

      // 3. UPDATE row
      const { error: updateError } = await supabase!
        .from("projects")
        .update({
          title: form.title,
          slug: form.slug || slugify(form.title),
          description: form.description,
          src: newSrc,
          start_date: form.startDate,
          end_date: form.endDate,
          film_name: form.filmName,
          camera: form.camera,
          location: form.location,
          photographer: form.photographer,
          lab: form.lab,
          frames_count: form.framesCount,
          images: imageUrls.length > 0 ? imageUrls : null,
        })
        .eq("id", projectDbId);

      if (updateError) throw updateError;

      setSavedAt(Date.now());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loi khong xac dinh");
    } finally {
      setLoading(false);
    }
  };

  const handleImproveDescription = async () => {
    if (!form.description.trim()) return;
    setImprovingDescription(true);
    setError(null);
    try {
      const res = await fetch("/api/improve-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: form.description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(typeof data?.error === "string" ? data.error : "Khong the cai thien mo ta.");
      }
      const data = await res.json();
      if (typeof data.text === "string") setForm((f) => ({ ...f, description: data.text }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Da xay ra loi.");
    } finally {
      setImprovingDescription(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (!supabase) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit project</CardTitle>
            <CardDescription>Can cau hinh Supabase.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Dang tai project...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto space-y-4">
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">{fetchError}</p>
        <Button variant="outline" asChild>
          <Link href="/admin">← Quay lai</Link>
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const activeCoverSrc = coverPreview ?? existingCoverUrl;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Quan ly
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Edit project</h1>
          <div className="w-24" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------------------------------------------------------------- */}
          {/* Metadata                                                         */}
          {/* ---------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Thong tin project</CardTitle>
              <CardDescription>Tieu de, mo ta va metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Title" required>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="Maison de Verre"
                  required
                />
              </FormField>
              <FormField label="Slug">
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="maison-de-verre"
                />
              </FormField>
              <FormField label="Description" required>
                <div className="space-y-2">
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Mo ta project..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleImproveDescription}
                      disabled={improvingDescription || !form.description.trim()}
                    >
                      {improvingDescription ? "Dang goi y..." : "Goi y mo ta hay hon"}
                    </Button>
                  </div>
                </div>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start date">
                  <DatePicker
                    value={form.startDate}
                    onChange={(d) => setForm((f) => ({ ...f, startDate: d }))}
                    placeholder="Chon ngay bat dau"
                  />
                </FormField>
                <FormField label="End date">
                  <DatePicker
                    value={form.endDate}
                    onChange={(d) => setForm((f) => ({ ...f, endDate: d }))}
                    placeholder="Chon ngay ket thuc"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Film name">
                  <Input
                    value={form.filmName}
                    onChange={(e) => setForm((f) => ({ ...f, filmName: e.target.value }))}
                    placeholder="Kodak Portra 400"
                  />
                </FormField>
                <FormField label="Camera">
                  <Input
                    value={form.camera}
                    onChange={(e) => setForm((f) => ({ ...f, camera: e.target.value }))}
                    placeholder="Contax T2"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Location">
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Paris, France"
                  />
                </FormField>
                <FormField label="Frames count">
                  <Input
                    type="number"
                    min={1}
                    value={form.framesCount}
                    onChange={(e) => setForm((f) => ({ ...f, framesCount: parseInt(e.target.value, 10) || 36 }))}
                  />
                </FormField>
              </div>
              <FormField label="Photographer">
                <Input
                  value={form.photographer}
                  onChange={(e) => setForm((f) => ({ ...f, photographer: e.target.value }))}
                />
              </FormField>
              <FormField label="Lab">
                <Input
                  value={form.lab}
                  onChange={(e) => setForm((f) => ({ ...f, lab: e.target.value }))}
                  placeholder="Local Lab"
                />
              </FormField>
            </CardContent>
          </Card>

          {/* ---------------------------------------------------------------- */}
          {/* Cover image                                                      */}
          {/* ---------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Anh cover</CardTitle>
              <CardDescription>
                {coverFile ? "Anh cover moi (chua luu)" : "Anh cover hien tai — chon anh khac de thay the"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeCoverSrc ? (
                <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={activeCoverSrc}
                    alt="Cover"
                    className="object-cover w-full h-full"
                  />
                  {coverFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-8"
                      onClick={() => setCoverFile(null)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <label
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    coverDragActive && "border-primary/60 bg-primary/5"
                  )}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setCoverDragActive(true); }}
                  onDragLeave={(e) => { if (e.currentTarget.contains(e.relatedTarget as Node)) return; setCoverDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault(); setCoverDragActive(false);
                    const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
                    if (files[0]) setCoverFile(files[0]);
                  }}
                >
                  <ImageIcon className="size-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click de chon anh cover</span>
                  <Input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
                </label>
              )}
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              />
            </CardContent>
          </Card>

          {/* ---------------------------------------------------------------- */}
          {/* Gallery images                                                   */}
          {/* ---------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Anh gallery</CardTitle>
              <CardDescription>
                Sap xep thu tu, xoay/lat, them hoac xoa anh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {galleryItems.length > 0 ? (
                <>
                  <div
                    data-lenis-prevent
                    className="overflow-x-auto overflow-y-hidden pb-2 -mx-1 scroll-smooth snap-x snap-mandatory w-full max-w-full overscroll-x-contain"
                  >
                    <div className="flex gap-3 min-w-max px-1">
                      {galleryItems.map((item, i) => {
                        const previewSrc = item.kind === "existing"
                          ? (item.thumbUrl ?? item.mediumUrl ?? "")
                          : (item.blobUrl ?? "");
                        return (
                          <div
                            key={item._key}
                            draggable
                            onDragStart={(e) => {
                              setDraggedIndex(i);
                              e.dataTransfer.setData("text/plain", String(i));
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                            onDragEnd={() => setDraggedIndex(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              const from = draggedIndex ?? parseInt(e.dataTransfer.getData("text/plain"), 10);
                              if (Number.isNaN(from)) return;
                              reorderGallery(from, i);
                              setDraggedIndex(null);
                            }}
                            className={cn(
                              "relative shrink-0 size-24 sm:size-32 rounded-lg overflow-hidden border bg-muted group snap-center cursor-grab active:cursor-grabbing",
                              draggedIndex === i && "opacity-60 ring-2 ring-primary"
                            )}
                          >
                            <button
                              type="button"
                              className="absolute inset-0 w-full h-full block focus:outline-none rounded-lg z-0"
                              onClick={() => setPreviewOpen(true)}
                              aria-label={`Xem anh ${i + 1}`}
                            >
                              <img
                                src={previewSrc}
                                alt={`Gallery ${i + 1}`}
                                className="object-cover w-full h-full"
                                style={{
                                  transform: getGalleryTransformStyle(item.transform),
                                  transformOrigin: "center center",
                                }}
                              />
                            </button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => { e.stopPropagation(); removeGalleryItem(item._key); }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white drop-shadow-md bg-black/50 px-1.5 py-0.5 rounded z-10">
                              {i + 1}
                              {item.isDirty && " •"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                    className="gap-2"
                  >
                    <Eye className="size-4" />
                    Xem truoc layout
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Chua co anh gallery nao.</p>
              )}

              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length) addGalleryFiles(files);
                    e.target.value = "";
                  }}
                  className="max-w-xs"
                />
                {galleryItems.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      galleryItems.forEach((item) => { if (item.blobUrl) URL.revokeObjectURL(item.blobUrl); });
                      setGalleryItems([]);
                    }}
                  >
                    Xoa tat ca
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GalleryPreviewModal — reused from upload page */}
          <GalleryPreviewModal
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            previewUrls={galleryPreviewUrls}
            transforms={galleryTransforms}
            onTransformChange={updateGalleryTransform}
            onRotate={rotateGalleryItem}
            onReorder={reorderGallery}
            onSwap={swapGallery}
          />

          {/* Success */}
          {savedAt && (
            <p className="text-sm text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-md">
              Da luu thanh cong.
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Dang luu..." : "Luu thay doi"}
          </Button>
        </form>
      </div>
    </div>
  );
}
