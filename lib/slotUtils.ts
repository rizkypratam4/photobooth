// lib/slotUtils.ts
// Generate slot posisi yang merata otomatis berdasarkan canvas dan jumlah slot

import { PhotoSlot } from "./types";

export function generateEvenSlots(
  canvasWidth: number,
  canvasHeight: number,
  slotCount: number,
): PhotoSlot[] {
  const padding = Math.round(canvasWidth * 0.1); // 10% padding kiri kanan (lebih besar)
  const topPad = Math.round(canvasHeight * 0.05); // 5% padding atas
  const bottomPad = Math.round(canvasHeight * 0.1); // 10% padding bawah (ruang branding)
  const gap = Math.round(canvasHeight * 0.025); // 2.5% gap antar slot (lebih besar)

  const slotWidth = canvasWidth - padding * 2;
  const totalHeight = canvasHeight - topPad - bottomPad;
  const slotHeight = Math.round(
    (totalHeight - gap * (slotCount - 1)) / slotCount,
  );

  return Array.from({ length: slotCount }, (_, i) => ({
    id: `even-slot-${i}`,
    order: i + 1,
    x: padding,
    y: topPad + i * (slotHeight + gap),
    width: slotWidth,
    height: slotHeight,
  }));
}
