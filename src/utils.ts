export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Map a task's (x, y) position to an HSL color.
 * Bottom-left (0,0) = blue (hue 220), top-right (1,1) = red (hue 0).
 */
export function positionToColor(x: number, y: number): string {
  const t = (x + y) / 2; // 0 to 1
  const hue = 220 - t * 220; // 220 → 0
  return `hsl(${hue}, 70%, 65%)`;
}

/**
 * Convert pixel coordinates within a container to normalized 0-1 values.
 * x maps left→right (0→1), y maps bottom→top (0→1).
 */
export function pixelToNormalized(
  px: number,
  py: number,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(1, px / width)),
    y: Math.max(0, Math.min(1, 1 - py / height)),
  };
}

/**
 * Convert normalized 0-1 values to pixel coordinates.
 * x maps 0→left, 1→right. y maps 0→bottom, 1→top.
 */
export function normalizedToPixel(
  nx: number,
  ny: number,
  width: number,
  height: number
): { px: number; py: number } {
  return {
    px: nx * width,
    py: (1 - ny) * height,
  };
}
