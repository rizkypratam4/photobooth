"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Printer,
  Mail,
  Home,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  X,
  Sparkles,
  Sticker as StickerIcon,
} from "lucide-react";
import { usePhoto } from "@/lib/PhotoContext";
import confetti from "canvas-confetti";
import { sendPhotoToEmail } from "@/app/actions";
import Image from "next/image";

const FILTERS = [
  { id: "none", label: "Normal", css: "none" },
  { id: "grayscale", label: "B&W", css: "grayscale(100%)" },
  { id: "sepia", label: "Sepia", css: "sepia(80%)" },
  {
    id: "warm",
    label: "Warm",
    css: "saturate(130%) hue-rotate(-10deg) brightness(105%)",
  },
  {
    id: "cool",
    label: "Cool",
    css: "saturate(110%) hue-rotate(20deg) brightness(100%)",
  },
  { id: "vivid", label: "Vivid", css: "saturate(160%) contrast(110%)" },
  {
    id: "fade",
    label: "Fade",
    css: "brightness(110%) contrast(85%) saturate(80%)",
  },
  { id: "drama", label: "Drama", css: "contrast(130%) brightness(90%)" },
];

const STICKERS = [
  "🌸",
  "✨",
  "🌙",
  "⭐",
  "💖",
  "🎀",
  "🦋",
  "🌈",
  "🍀",
  "🎉",
  "🔥",
  "💫",
  "🌺",
  "🎊",
  "💝",
  "🌟",
  "🎈",
  "🍓",
  "🌻",
  "💎",
];

type Sticker = {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
};

// Floating dust — sama dengan halaman lain
const GRAINS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 5,
  opacity: Math.random() * 0.18 + 0.04,
}));

export default function ResultPage() {
  const router = useRouter();
  const { selectedFrame, session, resetSession } = usePhoto();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startPX: number;
    startPY: number;
  } | null>(null);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState("none");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [activeTab, setActiveTab] = useState<"filter" | "sticker">("filter");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!selectedFrame || session.photos.some((p) => p === null)) {
      router.push("/frames");
      return;
    }
    generate("none", []);
  }, []);

  const generate = useCallback(
    async (filterId: string, stickerList: Sticker[]) => {
      if (!selectedFrame || !canvasRef.current) return;
      setIsGenerating(true);
      setResultImage(null);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = selectedFrame.canvasWidth;
      canvas.height = selectedFrame.canvasHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const filterCss = FILTERS.find((f) => f.id === filterId)?.css ?? "none";
      for (let i = 0; i < session.photos.length; i++) {
        const photoData = session.photos[i];
        const slot = selectedFrame.slots[i];
        if (!photoData || !slot) continue;
        const img = new window.Image();
        img.src = photoData;
        await new Promise<void>((r) => {
          img.onload = () => r();
        });
        const pa = img.width / img.height,
          sa = slot.width / slot.height;
        let dw: number, dh: number, ox: number, oy: number;
        if (pa > sa) {
          dh = slot.height;
          dw = dh * pa;
          ox = slot.x - (dw - slot.width) / 2;
          oy = slot.y;
        } else {
          dw = slot.width;
          dh = dw / pa;
          ox = slot.x;
          oy = slot.y - (dh - slot.height) / 2;
        }
        ctx.save();
        ctx.filter = filterCss;
        ctx.beginPath();
        ctx.rect(slot.x, slot.y, slot.width, slot.height);
        ctx.clip();
        ctx.drawImage(img, ox, oy, dw, dh);
        ctx.restore();
      }
      const frameImg = new window.Image();
      frameImg.crossOrigin = "anonymous";
      frameImg.src = selectedFrame.imageUrl;
      await new Promise<void>((r) => {
        frameImg.onload = () => r();
      });
      ctx.filter = "none";
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
      for (const s of stickerList) {
        const px = (s.x / 100) * canvas.width,
          py = (s.y / 100) * canvas.height;
        ctx.font = `${s.size * (canvas.width / 300)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, px, py);
      }
      setResultImage(canvas.toDataURL("image/png"));
      setIsGenerating(false);
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 },
        colors: ["#d4ac5e", "#f5e4b0", "#c49a3a"],
      });
    },
    [selectedFrame, session.photos],
  );

  const handlePickFilter = async (id: string) => {
    setActiveFilter(id);
    await generate(id, stickers);
  };
  const handleAddSticker = async (emoji: string) => {
    const s: Sticker = {
      id: Math.random().toString(36).slice(2),
      emoji,
      x: 50,
      y: 50,
      size: 40,
    };
    const up = [...stickers, s];
    setStickers(up);
    await generate(activeFilter, up);
  };
  const handleRemoveSticker = async (id: string) => {
    const up = stickers.filter((s) => s.id !== id);
    setStickers(up);
    await generate(activeFilter, up);
  };
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const s = stickers.find((x) => x.id === id);
    if (!s) return;
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      startPX: s.x,
      startPY: s.y,
    };
  };
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
      const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
      setStickers((prev) =>
        prev.map((s) =>
          s.id === dragRef.current!.id
            ? {
                ...s,
                x: Math.max(5, Math.min(95, dragRef.current!.startPX + dx)),
                y: Math.max(5, Math.min(95, dragRef.current!.startPY + dy)),
              }
            : s,
        ),
      );
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setStickers((prev) => {
        setTimeout(() => generate(activeFilter, prev), 0);
        return prev;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [activeFilter, generate]);

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = `pixiebooth-${Date.now()}.png`;
    a.click();
  };
  const handlePrint = () => {
    if (!resultImage || !selectedFrame) return;
    const ar = selectedFrame.canvasWidth / selectedFrame.canvasHeight;
    const h = 6,
      w = +(h * ar).toFixed(4);
    const pw = window.open("", "_blank");
    if (!pw) return;
    pw.document.write(
      `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:${w}in;height:${h}in;background:#fff;}@page{size:${w}in ${h}in;margin:0;}img{width:${w}in;height:${h}in;object-fit:fill;display:block;}</style></head><body><img src="${resultImage}"/><script>window.onload=()=>setTimeout(()=>{window.print();window.close();},300)<\/script></body></html>`,
    );
    pw.document.close();
  };
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultImage || !email) return;
    setIsSendingEmail(true);
    try {
      await sendPhotoToEmail(email, resultImage);
      setEmailSent(true);
      setTimeout(() => {
        setShowEmailForm(false);
        setEmailSent(false);
      }, 3000);
    } catch {
      alert("Gagal mengirim email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!selectedFrame) return null;

  return (
    <main
      className="relative w-full font-sans overflow-y-auto lg:overflow-hidden"
      style={{ minHeight: "100dvh", background: "#0c0a09" }}
    >
      {/* ── BACKGROUND (identik semua halaman) ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, #1c1108 0%, #0c0a09 70%)",
        }}
      />
      <div
        className="fixed -top-20 -left-20 pointer-events-none"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: 360,
          maxHeight: 360,
          background:
            "radial-gradient(circle, rgba(212,172,94,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="fixed -bottom-10 -right-10 pointer-events-none"
        style={{
          width: "32vw",
          height: "32vw",
          maxWidth: 300,
          maxHeight: 300,
          background:
            "radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />
      {GRAINS.map((g) => (
        <motion.div
          key={g.id}
          className="fixed rounded-full pointer-events-none"
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            width: g.size,
            height: g.size,
            background: `rgba(212,172,94,${g.opacity})`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [g.opacity, g.opacity * 2, g.opacity],
          }}
          transition={{
            repeat: Infinity,
            duration: g.duration,
            delay: g.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ── FILMSTRIP TOP ── */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden z-20"
        style={{ height: 32 }}
      >
        <div
          style={{
            width: 12,
            height: "100%",
            background: "#1a1109",
            flexShrink: 0,
          }}
        />
        <div className="flex flex-1 h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center justify-center">
              <div
                style={{
                  width: "60%",
                  height: "55%",
                  borderRadius: 3,
                  background:
                    i % 4 === 0
                      ? "rgba(212,172,94,0.08)"
                      : "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(212,172,94,0.09)",
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            width: 12,
            height: "100%",
            background: "#1a1109",
            flexShrink: 0,
          }}
        />
      </div>

      {/* ── FILMSTRIP BOTTOM ── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden z-20"
        style={{ height: 32 }}
      >
        <div
          style={{
            width: 12,
            height: "100%",
            background: "#1a1109",
            flexShrink: 0,
          }}
        />
        <div className="flex flex-1 h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-center justify-center">
              <div
                style={{
                  width: "60%",
                  height: "55%",
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            width: 12,
            height: "100%",
            background: "#1a1109",
            flexShrink: 0,
          }}
        />
      </div>

      {/* ── CORNER ORNAMENTS ── */}
      {[
        "fixed top-9 left-4",
        "fixed top-9 right-4 rotate-90",
        "fixed bottom-9 left-4 -rotate-90",
        "fixed bottom-9 right-4 rotate-180",
      ].map((pos, i) => (
        <svg
          key={i}
          className={`${pos} w-5 h-5 pointer-events-none z-20`}
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M2 16 L2 2 L16 2"
            stroke="rgba(212,172,94,0.25)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ))}

      {/* ── MAIN CARD ── */}
      <div
        className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row"
        style={{ minHeight: "100dvh", paddingTop: 36, paddingBottom: 36 }}
      >
        {/* ════════════════════════════════════════
            KIRI: PREVIEW FOTO
        ════════════════════════════════════════ */}
        <section
          className="relative flex flex-col w-full lg:flex-1 min-h-0"
          style={{ borderRight: "1px solid rgba(212,172,94,0.08)" }}
        >
          {/* Tombol Retake & Home */}
          <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
            <button
              onClick={() => router.push("/camera")}
              className="pointer-events-auto flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                background: "rgba(12,10,7,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(212,172,94,0.2)",
                color: "rgba(212,172,94,0.9)",
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                fontWeight: "bold",
                letterSpacing: "0.08em",
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              RETAKE
            </button>
            <button
              onClick={() => {
                resetSession();
                router.push("/");
              }}
              className="pointer-events-auto active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: "12px",
                background: "rgba(12,10,7,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(212,172,94,0.15)",
                color: "rgba(212,172,94,0.6)",
              }}
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Foto hasil */}
          <div className="flex-1 flex items-center justify-center p-4 pt-16 pb-6 lg:p-10 lg:pt-16 overflow-hidden">
            <div
              className="relative transition-all duration-500"
              style={{
                aspectRatio: `${selectedFrame.canvasWidth} / ${selectedFrame.canvasHeight}`,
                maxWidth: "min(100%, 420px)",
                maxHeight: "min(60vh, 560px)",
                width: "100%",
              }}
            >
              {/* Gold frame glow saat selesai render */}
              {resultImage && !isGenerating && (
                <div
                  className="absolute -inset-1 rounded-sm pointer-events-none"
                  style={{
                    boxShadow:
                      "0 0 40px rgba(212,172,94,0.08), 0 0 1px rgba(212,172,94,0.2)",
                  }}
                />
              )}

              {isGenerating && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-40"
                  style={{
                    background: "rgba(12,10,7,0.85)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: "linear",
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "2px solid rgba(212,172,94,0.15)",
                      borderTopColor: "rgba(212,172,94,0.7)",
                    }}
                  />
                  <p
                    style={{
                      color: "rgba(212,172,94,0.4)",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 10,
                      letterSpacing: "0.2em",
                    }}
                  >
                    RENDERING…
                  </p>
                </div>
              )}

              {resultImage && (
                <img
                  src={resultImage}
                  alt="Hasil Photobooth"
                  className={`w-full h-full object-contain transition-opacity duration-300 ${isGenerating ? "opacity-0" : "opacity-100"}`}
                />
              )}

              {/* Sticker layer */}
              <div
                ref={previewRef}
                className="absolute inset-0 z-20 pointer-events-auto"
              >
                {!isGenerating &&
                  stickers.map((s) => (
                    <div
                      key={s.id}
                      onPointerDown={(e) => handlePointerDown(e, s.id)}
                      className="absolute cursor-move select-none group"
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        transform: "translate(-50%,-50%)",
                        fontSize: "2rem",
                        lineHeight: 1,
                      }}
                    >
                      <div className="relative">
                        {s.emoji}
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => handleRemoveSticker(s.id)}
                          className="absolute -top-3 -right-3 w-5 h-5 rounded-full opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 flex items-center justify-center transition-all z-30 cursor-pointer"
                          style={{ background: "rgba(244,63,94,0.9)" }}
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Label frame number bawah */}
          <div className="hidden lg:flex justify-center pb-4">
            <span
              style={{
                color: "rgba(212,172,94,0.15)",
                fontFamily: "'Courier New', monospace",
                fontSize: 8,
                letterSpacing: "0.3em",
              }}
            >
              PIXIEBOOTH · HASIL FOTO
            </span>
          </div>
        </section>

        {/* ════════════════════════════════════════
            KANAN: KONTROL
        ════════════════════════════════════════ */}
        <aside
          className="w-full flex flex-col shrink-0 overflow-y-auto no-scrollbar"
          style={{
            background: "rgba(18,12,6,0.6)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Untuk desktop: fixed width */}
          <div
            className="flex flex-col gap-5 p-5 md:p-6 lg:p-8 h-full"
            style={{ width: "100%", maxWidth: "100%" }}
          >
            {/* Header */}
            <div className="pt-2 lg:pt-0">
              <p
                className="text-[9px] font-bold tracking-[0.25em] uppercase mb-1"
                style={{
                  color: "rgba(212,172,94,0.4)",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                PixieBooth · Hasil
              </p>
              <h2
                className="font-black leading-tight"
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "clamp(20px, 5vw, 28px)",
                  background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Hasil Fotomu! ✦
              </h2>
              <p
                style={{
                  color: "rgba(245,228,176,0.35)",
                  fontSize: 12,
                  marginTop: 4,
                  fontStyle: "italic",
                  fontFamily: "'Georgia', serif",
                }}
              >
                Pilih filter atau tambahkan stiker sebelum diunduh.
              </p>
            </div>

            {/* ── Tab Filter / Stiker ── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(26,17,9,0.8)",
                border: "1px solid rgba(212,172,94,0.12)",
              }}
            >
              {/* Tab switcher */}
              <div
                className="flex"
                style={{ borderBottom: "1px solid rgba(212,172,94,0.08)" }}
              >
                {(["filter", "sticker"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 transition-all cursor-pointer"
                    style={{
                      background:
                        activeTab === tab
                          ? "rgba(212,172,94,0.08)"
                          : "transparent",
                      borderBottom:
                        activeTab === tab
                          ? "2px solid rgba(212,172,94,0.5)"
                          : "2px solid transparent",
                      color:
                        activeTab === tab
                          ? "rgba(212,172,94,0.9)"
                          : "rgba(212,172,94,0.3)",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 10,
                      fontWeight: "bold",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    {tab === "filter" ? (
                      <Sparkles className="w-3.5 h-3.5" />
                    ) : (
                      <StickerIcon className="w-3.5 h-3.5" />
                    )}
                    {tab === "filter" ? "Filter" : "Stiker"}
                  </button>
                ))}
              </div>

              {/* Filter thumbnails */}
              {activeTab === "filter" && (
                <div className="p-3">
                  <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handlePickFilter(f.id)}
                        disabled={isGenerating}
                        className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer hover:-translate-y-1 transition-transform"
                      >
                        <div
                          className="overflow-hidden relative transition-all duration-300"
                          style={{
                            width: 52,
                            height: 68,
                            borderRadius: 10,
                            outline:
                              activeFilter === f.id
                                ? "2px solid rgba(212,172,94,0.7)"
                                : "1px solid rgba(212,172,94,0.1)",
                            outlineOffset: activeFilter === f.id ? "2px" : "0",
                            transform:
                              activeFilter === f.id
                                ? "scale(0.93)"
                                : "scale(1)",
                          }}
                        >
                          {resultImage ? (
                            <Image
                              src={resultImage}
                              alt={f.label}
                              fill
                              className="object-cover"
                              style={{ filter: f.css }}
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{
                                background: "rgba(212,172,94,0.05)",
                                filter: f.css,
                              }}
                            />
                          )}
                          {activeFilter === f.id && (
                            <div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ background: "rgba(212,172,94,0.15)" }}
                            >
                              <CheckCircle2
                                className="w-5 h-5"
                                style={{ color: "#d4ac5e" }}
                              />
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: "bold",
                            fontFamily: "'Courier New', monospace",
                            color:
                              activeFilter === f.id
                                ? "rgba(212,172,94,0.9)"
                                : "rgba(212,172,94,0.3)",
                          }}
                        >
                          {f.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stiker grid */}
              {activeTab === "sticker" && (
                <div className="p-3">
                  <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                    {STICKERS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddSticker(emoji)}
                        disabled={isGenerating}
                        className="text-2xl hover:scale-125 active:scale-95 transition-transform aspect-square flex items-center justify-center rounded-xl cursor-pointer"
                        style={{ background: "transparent" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(212,172,94,0.06)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {stickers.length > 0 && (
                    <div
                      className="mt-3 pt-3 flex flex-wrap gap-2"
                      style={{ borderTop: "1px solid rgba(212,172,94,0.08)" }}
                    >
                      {stickers.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-1.5 rounded-full"
                          style={{
                            paddingLeft: 10,
                            paddingRight: 4,
                            paddingTop: 3,
                            paddingBottom: 3,
                            background: "rgba(212,172,94,0.07)",
                            border: "1px solid rgba(212,172,94,0.15)",
                          }}
                        >
                          <span className="text-sm">{s.emoji}</span>
                          <button
                            onClick={() => handleRemoveSticker(s.id)}
                            className="flex items-center justify-center rounded-full transition-colors cursor-pointer"
                            style={{
                              width: 18,
                              height: 18,
                              background: "rgba(244,63,94,0.15)",
                            }}
                          >
                            <X
                              className="w-2.5 h-2.5"
                              style={{ color: "rgba(244,63,94,0.8)" }}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="hidden lg:block flex-1 min-h-0" />

            {/* ── Tombol Aksi ── */}
            <div className="space-y-2.5 pb-2 lg:pb-0">
              {/* Simpan + Cetak */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownload}
                  disabled={!resultImage || isGenerating}
                  className="group flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                  style={{
                    padding: "14px 8px",
                    borderRadius: "16px",
                    background:
                      "linear-gradient(135deg, rgba(212,172,94,0.9), rgba(196,154,58,0.85))",
                    border: "1px solid rgba(212,172,94,0.4)",
                    boxShadow: "0 8px 24px rgba(212,172,94,0.2)",
                  }}
                  onMouseEnter={(e) =>
                    !e.currentTarget.disabled &&
                    (e.currentTarget.style.transform = "translateY(-3px)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
                >
                  <Download className="w-5 h-5" style={{ color: "#0c0a09" }} />
                  <span
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: 9,
                      fontWeight: "bold",
                      letterSpacing: "0.12em",
                      color: "#0c0a09",
                    }}
                  >
                    SIMPAN
                  </span>
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!resultImage || isGenerating}
                  className="group flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                  style={{
                    padding: "14px 8px",
                    borderRadius: "16px",
                    background: "rgba(26,17,9,0.8)",
                    border: "1px solid rgba(212,172,94,0.2)",
                  }}
                  onMouseEnter={(e) =>
                    !e.currentTarget.disabled &&
                    (e.currentTarget.style.transform = "translateY(-3px)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
                >
                  <Printer
                    className="w-5 h-5"
                    style={{ color: "rgba(212,172,94,0.7)" }}
                  />
                  <span
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: 9,
                      fontWeight: "bold",
                      letterSpacing: "0.12em",
                      color: "rgba(212,172,94,0.6)",
                    }}
                  >
                    CETAK
                  </span>
                </button>
              </div>

              {/* Email */}
              <button
                onClick={() => setShowEmailForm(true)}
                disabled={!resultImage || isGenerating}
                className="w-full flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                style={{
                  padding: "14px",
                  borderRadius: "16px",
                  background: "rgba(244,63,94,0.12)",
                  border: "1px solid rgba(244,63,94,0.25)",
                  color: "rgba(244,120,130,0.9)",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10,
                  fontWeight: "bold",
                  letterSpacing: "0.12em",
                }}
                onMouseEnter={(e) =>
                  !e.currentTarget.disabled &&
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
              >
                <Mail className="w-4 h-4" />
                KIRIM KE EMAIL
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── MODAL EMAIL ── */}
      <AnimatePresence>
        {showEmailForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSendingEmail && setShowEmailForm(false)}
              className="absolute inset-0 cursor-pointer"
              style={{
                background: "rgba(6,4,2,0.8)",
                backdropFilter: "blur(8px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              className="relative w-full max-w-sm p-6"
              style={{
                borderRadius: "24px",
                background: "rgba(22,14,7,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(212,172,94,0.2)",
                boxShadow:
                  "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,172,94,0.08)",
              }}
            >
              {emailSent ? (
                <div className="text-center py-6 space-y-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                    style={{
                      background: "rgba(212,172,94,0.1)",
                      border: "1px solid rgba(212,172,94,0.2)",
                    }}
                  >
                    <CheckCircle2
                      className="w-7 h-7"
                      style={{ color: "#d4ac5e" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-black"
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: 18,
                        color: "rgba(245,228,176,0.9)",
                      }}
                    >
                      Terkirim!
                    </h3>
                    <p
                      style={{
                        color: "rgba(212,172,94,0.4)",
                        fontSize: 12,
                        marginTop: 4,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      Cek inbox emailmu ya.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{
                        background: "rgba(244,63,94,0.1)",
                        border: "1px solid rgba(244,63,94,0.2)",
                      }}
                    >
                      <Mail
                        className="w-5 h-5"
                        style={{ color: "rgba(244,100,120,0.9)" }}
                      />
                    </div>
                    <h3
                      className="font-black"
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: 18,
                        color: "rgba(245,228,176,0.9)",
                      }}
                    >
                      Kirim Digital
                    </h3>
                    <p
                      style={{
                        color: "rgba(212,172,94,0.35)",
                        fontSize: 11,
                        marginTop: 4,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      Dapatkan salinan foto di emailmu.
                    </p>
                  </div>
                  <form onSubmit={handleSendEmail} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full outline-none transition-all"
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: "rgba(212,172,94,0.05)",
                        border: "1px solid rgba(212,172,94,0.2)",
                        color: "rgba(245,228,176,0.8)",
                        fontFamily: "'Courier New', monospace",
                        fontSize: 13,
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(212,172,94,0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "rgba(212,172,94,0.2)")
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        disabled={isSendingEmail}
                        className="flex-1 py-3 cursor-pointer transition-all active:scale-95"
                        style={{
                          borderRadius: 12,
                          background: "rgba(212,172,94,0.05)",
                          border: "1px solid rgba(212,172,94,0.12)",
                          color: "rgba(212,172,94,0.4)",
                          fontFamily: "'Courier New', monospace",
                          fontSize: 11,
                          fontWeight: "bold",
                        }}
                      >
                        BATAL
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingEmail}
                        className="flex-[2] py-3 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        style={{
                          borderRadius: 12,
                          background:
                            "linear-gradient(135deg, rgba(244,63,94,0.8), rgba(220,40,70,0.8))",
                          border: "1px solid rgba(244,63,94,0.3)",
                          color: "#fff",
                          fontFamily: "'Courier New', monospace",
                          fontSize: 11,
                          fontWeight: "bold",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                            MENGIRIM…
                          </>
                        ) : (
                          "KIRIM SEKARANG"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { -webkit-font-smoothing: antialiased; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input::placeholder { color: rgba(212,172,94,0.25) !important; }
        /* Desktop: sidebar kanan fixed width */
        @media (min-width: 1024px) {
          aside { width: 400px !important; max-width: 440px; }
        }
        @media (min-width: 1280px) {
          aside { width: 460px !important; }
        }
      `,
        }}
      />
    </main>
  );
}
