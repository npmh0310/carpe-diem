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
import { ArrowLeft, ImageIcon, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";
import {
  type GalleryItemTransform,
  DEFAULT_GALLERY_TRANSFORM,
  getGalleryTransformStyle,
} from "@/lib/gallery-transform";
import { GalleryPreviewModal } from "./components/GalleryPreviewModal";

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

/** Resize/compress ảnh trước upload. Ảnh nhỏ không upscale. File không phải image trả về nguyên bản. */
async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }
  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1600,
      initialQuality: 0.8,
      maxSizeMB: 5,
      useWebWorker: true,
    });
    return compressed;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Không thể xử lý ảnh. Vui lòng thử file khác."
    );
  }
}

type ImageVariants = { thumb: File; medium: File; full: File };

/** Tạo 3 version thumb / medium / full. Fallback file gốc nếu một variant lỗi. */
async function generateImageVariants(file: File): Promise<ImageVariants> {
  if (!file.type.startsWith("image/")) {
    return { thumb: file, medium: file, full: file };
  }
  const opts = {
    useWebWorker: true as const,
  };
  const thumb = imageCompression(file, {
    ...opts,
    maxWidthOrHeight: 800,
    initialQuality: 0.8,
    maxSizeMB: 2,
  }).catch(() => {
    console.warn("generateImageVariants: thumb fallback to original");
    return file;
  });
  const medium = imageCompression(file, {
    ...opts,
    maxWidthOrHeight: 1600,
    initialQuality: 0.85,
    maxSizeMB: 6,
  }).catch(() => {
    console.warn("generateImageVariants: medium fallback to original");
    return file;
  });
  const full = imageCompression(file, {
    ...opts,
    maxWidthOrHeight: 1600,
    initialQuality: 0.9,
    maxSizeMB: 8,
  }).catch(() => {
    console.warn("generateImageVariants: full fallback to original");
    return file;
  });
  const [t, m, f] = await Promise.all([thumb, medium, full]);
  return { thumb: t, medium: m, full: f };
}

/** Áp dụng xoay/lật lên ảnh, trả về File mới (dùng canvas). */
async function applyImageTransform(
  file: File,
  t: GalleryItemTransform
): Promise<File> {
  if (
    t.rotation === 0 &&
    !t.flipH &&
    !t.flipV
  ) {
    return file;
  }
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
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate((t.rotation * Math.PI) / 180);
      ctx.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1);
      ctx.translate(-w / 2, -h / 2);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: file.type }));
        },
        file.type,
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
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
  const [improvingDescription, setImprovingDescription] = useState(false);
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
  const [coverDragActive, setCoverDragActive] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryTransforms, setGalleryTransforms] = useState<
    GalleryItemTransform[]
  >([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Giữ galleryTransforms cùng độ dài với galleryFiles (thêm default khi thêm ảnh).
  useEffect(() => {
    setGalleryTransforms((prev) => {
      const len = galleryFiles.length;
      if (prev.length === len) return prev;
      if (prev.length < len) {
        return [
          ...prev,
          ...Array(len - prev.length)
            .fill(null)
            .map(() => ({ ...DEFAULT_GALLERY_TRANSFORM })),
        ];
      }
      return prev.slice(0, len);
    });
  }, [galleryFiles.length]);

  const handleTitleChange = (v: string) => {
    setForm((f) => ({ ...f, title: v, slug: slugify(v) }));
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryTransforms((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGalleryTransform = (
    index: number,
    patch: Partial<GalleryItemTransform>
  ) => {
    setGalleryTransforms((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );
  };

  const rotateGalleryItem = (index: number, delta: 90 | -90) => {
    setGalleryTransforms((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const next =
          (t.rotation + delta + 360) % 360;
        return { ...t, rotation: next as 0 | 90 | 180 | 270 };
      })
    );
  };

  const reorderGallery = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setGalleryFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
    setGalleryTransforms((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  };

  const swapGallery = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setGalleryFiles((prev) => {
      const next = [...prev];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= next.length ||
        toIndex >= next.length
      ) {
        return prev;
      }
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
    setGalleryTransforms((prev) => {
      const next = [...prev];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= next.length ||
        toIndex >= next.length
      ) {
        return prev;
      }
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
  };

  const openPreview = () => {
    setPreviewOpen(true);
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

  /** Upload 3 variant lên Storage, trả về public URL của medium (để lưu DB). */
  const uploadImageVariants = async (
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
      const coverVariants = await generateImageVariants(coverFile);
      const coverNamePart = `cover_${sanitizeFileName(coverFile.name)}`;
      const src = await uploadImageVariants(
        coverVariants,
        projectId,
        coverNamePart
      );

      const galleryWithTransforms = await Promise.all(
        galleryFiles.map((f, i) =>
          applyImageTransform(f, galleryTransforms[i] ?? DEFAULT_GALLERY_TRANSFORM)
        )
      );
      const galleryVariants = await Promise.all(
        galleryWithTransforms.map((f) => generateImageVariants(f))
      );
      const imageUrls = await Promise.all(
        galleryVariants.map((v, i) =>
          uploadImageVariants(
            v,
            projectId,
            `${i}_${sanitizeFileName(galleryWithTransforms[i].name)}`
          )
        )
      );

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

  const handleImproveDescription = async () => {
    if (!form.description.trim()) return;
    setImprovingDescription(true);
    setError(null);
    try {
      const res = await fetch("/api/improve-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: form.description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Không thể cải thiện mô tả. Vui lòng thử lại.";
        throw new Error(message);
      }
      const data = await res.json();
      if (!data || typeof data.text !== "string") {
        throw new Error("Phản hồi không hợp lệ từ server.");
      }
      setForm((f) => ({ ...f, description: data.text }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi cải thiện mô tả."
      );
    } finally {
      setImprovingDescription(false);
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
                <div className="space-y-2">
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
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleImproveDescription}
                      disabled={improvingDescription || !form.description.trim()}
                    >
                      {improvingDescription
                        ? "Đang gợi ý mô tả..."
                        : "Gợi ý mô tả hay hơn"}
                    </Button>
                  </div>
                </div>
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
                <label
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    coverDragActive && "border-primary/60 bg-primary/5"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                    setCoverDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setCoverDragActive(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setCoverDragActive(false);
                    const files = Array.from(e.dataTransfer.files ?? []).filter((f) =>
                      f.type.startsWith("image/")
                    );
                    if (files[0]) {
                      setCoverFile(files[0]);
                    }
                  }}
                >
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
              <CardDescription>
                Nhiều ảnh – click ảnh để xoay/lật, kéo thả sắp xếp, hoặc xem trước layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {galleryPreviews.length > 0 ? (
                <>
                  <div
                    data-lenis-prevent
                    className="overflow-x-auto overflow-y-hidden pb-2 -mx-1 scroll-smooth snap-x snap-mandatory w-full max-w-full overscroll-x-contain"
                  >
                    <div className="flex gap-3 min-w-max px-1">
                      {galleryPreviews.map((url, i) => {
                        const transform = galleryTransforms[i] ?? DEFAULT_GALLERY_TRANSFORM;
                        return (
                          <div
                            key={i}
                            draggable
                            onDragStart={(e) => {
                              setDraggedIndex(i);
                              e.dataTransfer.setData("text/plain", String(i));
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
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
                              className="absolute inset-0 w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg z-0"
                              onClick={() => openPreview()}
                              aria-label={`Xem và sửa ảnh ${i + 1}`}
                            >
                              <img
                                src={url}
                                alt={`Gallery ${i + 1}`}
                                className="object-cover w-full h-full transition-transform duration-200"
                                style={{
                                  transform: getGalleryTransformStyle(transform),
                                  transformOrigin: "center center",
                                }}
                              />
                            </button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeGalleryFile(i);
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white drop-shadow-md bg-black/50 px-1.5 py-0.5 rounded z-10">
                              {i + 1}
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
                    onClick={() => openPreview()}
                    className="gap-2"
                  >
                    <Eye className="size-4" />
                    Xem trước layout
                  </Button>
                </>
              ) : (
                <label
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    galleryDragActive && "border-primary/60 bg-primary/5"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                    setGalleryDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setGalleryDragActive(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setGalleryDragActive(false);
                    const files = Array.from(e.dataTransfer.files ?? []).filter((f) =>
                      f.type.startsWith("image/")
                    );
                    if (files.length) {
                      setGalleryFiles((prev) => [...prev, ...files]);
                    }
                  }}
                >
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

          <GalleryPreviewModal
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            previewUrls={galleryPreviews}
            transforms={galleryTransforms}
            onTransformChange={updateGalleryTransform}
            onRotate={rotateGalleryItem}
            onReorder={reorderGallery}
            onSwap={swapGallery}
          />

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
