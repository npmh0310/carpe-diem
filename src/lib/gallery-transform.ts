/** Transform áp dụng cho từng ảnh gallery: xoay + lật. */
export type GalleryItemTransform = {
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
};

export const DEFAULT_GALLERY_TRANSFORM: GalleryItemTransform = {
  rotation: 0,
  flipH: false,
  flipV: false,
};

export function getGalleryTransformStyle(t: GalleryItemTransform): string {
  const { rotation, flipH, flipV } = t;
  const sx = flipH ? -1 : 1;
  const sy = flipV ? -1 : 1;
  return `rotate(${rotation}deg) scale(${sx}, ${sy})`;
}
