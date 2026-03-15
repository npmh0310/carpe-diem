"use client";

import { useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  type GalleryItemTransform,
  DEFAULT_GALLERY_TRANSFORM,
  getGalleryTransformStyle,
} from "@/lib/gallery-transform";
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  GripVertical,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type { GalleryItemTransform };

export interface GalleryPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrls: string[];
  transforms: GalleryItemTransform[];
  onTransformChange: (
    index: number,
    patch: Partial<GalleryItemTransform>
  ) => void;
  onRotate: (index: number, delta: 90 | -90) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function SortableGalleryItem({
  id,
  url,
  index,
  transform,
  onRotate,
  onTransformChange,
  transforms,
}: {
  id: number;
  url: string;
  index: number;
  transform: GalleryItemTransform;
  onRotate: (index: number, delta: 90 | -90) => void;
  onTransformChange: (
    index: number,
    patch: Partial<GalleryItemTransform>
  ) => void;
  transforms: GalleryItemTransform[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform: dndTransform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(dndTransform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full min-w-0 flex flex-col rounded-lg border bg-card overflow-hidden group cursor-grab active:cursor-grabbing",
        isDragging && "opacity-60 ring-2 ring-primary z-10"
      )}
    >
      <div
        className="flex items-center justify-between gap-1 flex-wrap bg-muted/50 p-1 border-b shrink-0"
        {...attributes}
        {...listeners}
      >
        <span className="text-xs font-medium text-muted-foreground">
          {index + 1}
        </span>
        <GripVertical
          className="size-4 text-muted-foreground shrink-0"
          aria-hidden
        />
      </div>
      <div className="aspect-square relative w-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
        <img
          src={url}
          alt={`Ảnh ${index + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200 pointer-events-none"
          style={{
            transform: getGalleryTransformStyle(transform),
            transformOrigin: "center center",
          }}
        />
      </div>
      <div className="p-2 flex items-center justify-center gap-0.5 flex-wrap bg-muted/50 border-t shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onRotate(index, -90)}
          aria-label="Xoay trái"
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onRotate(index, 90)}
          aria-label="Xoay phải"
        >
          <RotateCw className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() =>
            onTransformChange(index, {
              flipH: !(transforms[index] ?? DEFAULT_GALLERY_TRANSFORM).flipH,
            })
          }
          aria-label="Lật ngang"
        >
          <FlipHorizontal className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() =>
            onTransformChange(index, {
              flipV: !(transforms[index] ?? DEFAULT_GALLERY_TRANSFORM).flipV,
            })
          }
          aria-label="Lật dọc"
        >
          <FlipVertical className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function GalleryPreviewModal({
  open,
  onOpenChange,
  previewUrls,
  transforms,
  onTransformChange,
  onRotate,
  onReorder,
}: GalleryPreviewModalProps) {
  const itemIds = previewUrls.map((_, i) => i);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 16 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over == null || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(Number(active.id));
    const newIndex = itemIds.indexOf(Number(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (previewUrls.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl w-[calc(100vw-2rem)] h-[90vh] max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0"
        aria-describedby={undefined}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0">
          <DialogTitle>
            Xem trước layout – xoay, lật, sắp xếp thứ tự
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng"
          >
            <X className="size-5" />
          </Button>
        </DialogHeader>

        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y isolate"
          style={{ WebkitOverflowScrolling: "touch" }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-4 sm:px-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-3 items-start">
                  {previewUrls.map((url, i) => (
                    <SortableGalleryItem
                      key={i}
                      id={i}
                      url={url}
                      index={i}
                      transform={transforms[i] ?? DEFAULT_GALLERY_TRANSFORM}
                      onRotate={onRotate}
                      onTransformChange={onTransformChange}
                      transforms={transforms}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <DialogFooter className="px-4 py-3 border-t shrink-0">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Xong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
