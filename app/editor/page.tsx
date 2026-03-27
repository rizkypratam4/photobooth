"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  ChevronLeft,
  Move,
  Grid3X3,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePhoto } from "@/lib/PhotoContext";
import { FrameConfig, PhotoSlot } from "@/lib/types";
import Image from "next/image";

type DragState = {
  type: "move" | "resize";
  slotId: string;
  startX: number;
  startY: number;
  startSlotX: number;
  startSlotY: number;
  startSlotW: number;
  startSlotH: number;
};

export default function FrameEditorPage() {
  const router = useRouter();
  const { addCustomFrame } = usePhoto();
  const [frameName, setFrameName] = useState("New Frame");
  const [category, setCategory] = useState("cute");
  const [frameImageUrl, setFrameImageUrl] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 1800 });
  const [slots, setSlots] = useState<PhotoSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [scale, setScale] = useState(1);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  // Hitung scale agar canvas muat di layar
  useEffect(() => {
    const updateScale = () => {
      const maxH = window.innerHeight - 160;
      const maxW = window.innerWidth - 380;
      const scaleH = maxH / canvasSize.height;
      const scaleW = maxW / canvasSize.width;
      setScale(Math.min(1, scaleH, scaleW));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [canvasSize]);

  // Global mouse move & up untuk drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const drag = dragRef.current;
      const dx = (e.clientX - drag.startX) / scale;
      const dy = (e.clientY - drag.startY) / scale;

      setSlots((prev) =>
        prev.map((s) => {
          if (s.id !== drag.slotId) return s;
          if (drag.type === "move") {
            return {
              ...s,
              x: Math.max(
                0,
                Math.min(canvasSize.width - s.width, drag.startSlotX + dx),
              ),
              y: Math.max(
                0,
                Math.min(canvasSize.height - s.height, drag.startSlotY + dy),
              ),
            };
          } else {
            // resize
            return {
              ...s,
              width: Math.max(60, drag.startSlotW + dx),
              height: Math.max(40, drag.startSlotH + dy),
            };
          }
        }),
      );
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [scale, canvasSize]);

  const startDrag = (
    e: React.MouseEvent,
    slotId: string,
    type: "move" | "resize",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;
    setSelectedSlotId(slotId);
    dragRef.current = {
      type,
      slotId,
      startX: e.clientX,
      startY: e.clientY,
      startSlotX: slot.x,
      startSlotY: slot.y,
      startSlotW: slot.width,
      startSlotH: slot.height,
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setFrameImageUrl(url);
      const img = new window.Image();
      img.onload = () =>
        setCanvasSize({ width: img.width, height: img.height });
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const addSlot = () => {
    const newSlot: PhotoSlot = {
      id: Math.random().toString(36).substr(2, 9),
      x: 50,
      y: slots.length * 200 + 50,
      width: 500,
      height: 380,
      order: slots.length + 1,
    };
    setSlots([...slots, newSlot]);
    setSelectedSlotId(newSlot.id);
  };

  const removeSlot = (id: string) => {
    setSlots(
      slots.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })),
    );
    if (selectedSlotId === id) setSelectedSlotId(null);
  };

  const handleSave = () => {
    if (!frameImageUrl) return;
    const newFrame: FrameConfig = {
      id: `custom-${Date.now()}`,
      name: frameName,
      category,
      imageUrl: frameImageUrl,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height,
      slots,
    };
    addCustomFrame(newFrame);
    alert("Frame berhasil disimpan!");
    router.push("/frames");
  };

  const handleExport = () => {
    const data = { name: frameName, canvas: canvasSize, slots };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${frameName.toLowerCase().replace(/\s+/g, "-")}-config.json`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-stone-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">FRAME EDITOR (ADMIN)</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              isPreview
                ? "bg-rose-500 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Eye className="w-5 h-5" />
            {isPreview ? "EDIT MODE" : "PREVIEW"}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200"
          >
            <Download className="w-5 h-5" />
            EXPORT JSON
          </button>
          <button
            onClick={handleSave}
            disabled={!frameImageUrl || slots.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            SIMPAN FRAME
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-stone-200 p-6 space-y-8 overflow-y-auto flex-shrink-0">
          {/* Frame Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Frame Info
            </h3>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-600">
                Nama Frame
              </span>
              <input
                type="text"
                value={frameName}
                onChange={(e) => setFrameName(e.target.value)}
                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-stone-600">
                Kategori
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="cute">Cute</option>
                <option value="elegant">Elegant</option>
                <option value="retro">Retro</option>
                <option value="minimalist">Minimalist</option>
              </select>
            </label>
          </div>

          {/* Upload */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Assets
            </h3>
            {!frameImageUrl ? (
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-stone-200 rounded-2xl hover:border-rose-500 hover:bg-rose-50 transition-all cursor-pointer group">
                <Upload className="w-8 h-8 text-stone-300 group-hover:text-rose-500" />
                <span className="text-sm font-bold text-stone-400 group-hover:text-rose-500">
                  Upload Frame PNG
                </span>
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative aspect-[1/3] rounded-xl overflow-hidden border border-stone-200">
                <Image
                  src={frameImageUrl}
                  alt="Frame Preview"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={() => {
                    setFrameImageUrl(null);
                    setSlots([]);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Ukuran canvas info */}
          {frameImageUrl && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Ukuran Canvas
              </h3>
              <p className="text-sm font-mono text-stone-600">
                {canvasSize.width} × {canvasSize.height} px
              </p>
            </div>
          )}

          {/* Slots */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Photo Slots
              </h3>
              <button
                onClick={addSlot}
                disabled={!frameImageUrl}
                className="p-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-400">
              Klik + untuk tambah slot, lalu <strong>drag</strong> kotak untuk
              pindahkan, <strong>drag sudut</strong> untuk resize.
            </p>
            <div className="space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedSlotId === slot.id
                      ? "border-rose-500 bg-rose-50"
                      : "border-stone-100 bg-stone-50 hover:border-stone-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-stone-900">
                      Slot {slot.order}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSlot(slot.id);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-stone-500 uppercase">
                    <div>X: {Math.round(slot.x)}</div>
                    <div>Y: {Math.round(slot.y)}</div>
                    <div>W: {Math.round(slot.width)}</div>
                    <div>H: {Math.round(slot.height)}</div>
                  </div>
                </div>
              ))}
              {slots.length === 0 && (
                <p className="text-center py-4 text-sm text-stone-400 italic">
                  Belum ada slot foto
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 overflow-auto flex items-center justify-center bg-stone-200/50 p-8">
          {frameImageUrl ? (
            <div
              style={{
                width: canvasSize.width * scale,
                height: canvasSize.height * scale,
                flexShrink: 0,
              }}
              className="relative shadow-2xl"
            >
              {/* Frame image */}
              <Image
                src={frameImageUrl}
                alt="Frame"
                fill
                className="object-fill pointer-events-none z-10"
                style={{ position: "absolute" }}
              />

              {/* Slot boxes */}
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    position: "absolute",
                    left: slot.x * scale,
                    top: slot.y * scale,
                    width: slot.width * scale,
                    height: slot.height * scale,
                    zIndex: selectedSlotId === slot.id ? 20 : 5,
                  }}
                  className={`border-2 transition-colors ${
                    isPreview
                      ? "border-transparent bg-stone-300/60"
                      : selectedSlotId === slot.id
                        ? "border-rose-500 bg-rose-500/10"
                        : "border-blue-400 bg-blue-100/30 hover:border-blue-500"
                  }`}
                >
                  {/* Nomor slot */}
                  <div className="absolute -top-4 -left-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow z-30 select-none">
                    {slot.order}
                  </div>

                  {!isPreview && (
                    <>
                      {/* Area drag untuk MOVE — seluruh kotak */}
                      <div
                        className="absolute inset-0 cursor-move flex items-center justify-center"
                        onMouseDown={(e) => startDrag(e, slot.id, "move")}
                      >
                        <Move className="w-6 h-6 text-rose-400/50 pointer-events-none" />
                      </div>

                      {/* Handle resize — sudut kanan bawah */}
                      <div
                        className="absolute bottom-0 right-0 w-5 h-5 bg-rose-500 cursor-nwse-resize rounded-tl-lg z-30"
                        onMouseDown={(e) => startDrag(e, slot.id, "resize")}
                        title="Drag untuk resize"
                      />
                    </>
                  )}

                  {isPreview && (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-3xl select-none">
                      {slot.order}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <Grid3X3 className="w-12 h-12 text-stone-200" />
              </div>
              <p className="text-stone-400 font-medium">
                Upload frame PNG untuk mulai mengedit
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
