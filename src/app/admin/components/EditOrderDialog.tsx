"use client";

import { useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface OrderProject {
  id: string;
  slug: string;
  title: string;
  src: string;
}

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: OrderProject[];
  saving: boolean;
  onSave: (orderedIds: string[]) => void;
}

export function EditOrderDialog({
  open,
  onOpenChange,
  projects,
  saving,
  onSave,
}: EditOrderDialogProps) {
  const [orderDraft, setOrderDraft] = useState<string[]>([]);

  useEffect(() => {
    if (open) setOrderDraft(projects.map((p) => p.id));
  }, [open, projects]);

  const projectById = new Map(projects.map((p) => [p.id, p]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-4">
        <DialogHeader>
          <DialogTitle>Edit order</DialogTitle>
          <DialogDescription>
            Chọn thứ tự mới rồi bấm Save. Danh sách bên ngoài sẽ không đổi cho đến khi bạn lưu.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-2">
          <div className="space-y-2">
            {orderDraft.map((id, idx) => {
              const p = projectById.get(id);
              if (!p) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-md border px-3 py-2"
                >
                  {/* Position badge */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-muted">
                    <img
                      src={p.src}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.slug}</div>
                  </div>

                  {/* Position selector */}
                  <div className="shrink-0">
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={String(idx + 1)}
                      onChange={(e) => {
                        const nextPos = Number(e.target.value);
                        if (!Number.isFinite(nextPos) || nextPos < 1) return;
                        setOrderDraft((prev) => {
                          const from = prev.indexOf(id);
                          const to = nextPos - 1;
                          if (from === -1 || to === from) return prev;
                          return arrayMove(prev, from, to);
                        });
                      }}
                      disabled={saving}
                      aria-label={`Set order for ${p.title}`}
                    >
                      {Array.from({ length: projects.length }, (_, i) => (
                        <option key={i} value={String(i + 1)}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(orderDraft)}
            disabled={saving || orderDraft.length !== projects.length}
            className="flex items-center gap-2"
          >
            <Save className="size-4" />
            {saving ? "Đang lưu..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
