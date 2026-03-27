"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Loader2,
  Search,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import { usePhoto } from "@/lib/PhotoContext";
import { FrameConfig } from "@/lib/types";
import Image from "next/image";

const CATEGORIES = ["Semua", "cute", "elegant", "retro", "minimalist"];

function getPaperSize(w: number, h: number): string {
  const ratio = w / h;
  if (ratio <= 0.37) return 'Strip 2×6"';
  if (ratio <= 0.72) return 'Postcard 4×6"';
  if (ratio >= 0.95 && ratio <= 1.05) return 'Square 4×4"';
  return `${w}×${h}px`;
}

// Floating dust particles — sama seperti welcome page
const GRAINS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 5,
  opacity: Math.random() * 0.2 + 0.04,
}));

export default function FrameSelectionPage() {
  const router = useRouter();
  const { frames, isLoadingFrames, setFrame } = usePhoto();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activePaperSize, setActivePaperSize] = useState("Semua");

  const paperSizes = useMemo(() => {
    const sizes = new Set(
      frames.map((f) => getPaperSize(f.canvasWidth, f.canvasHeight)),
    );
    return ["Semua", ...Array.from(sizes)];
  }, [frames]);

  const filtered = useMemo(() => {
    return frames.filter((f) => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "Semua" || f.category === activeCategory;
      const matchSize =
        activePaperSize === "Semua" ||
        getPaperSize(f.canvasWidth, f.canvasHeight) === activePaperSize;
      return matchSearch && matchCat && matchSize;
    });
  }, [frames, search, activeCategory, activePaperSize]);

  const handleSelect = (frame: FrameConfig) => {
    setFrame(frame.id);
    router.push("/camera");
  };

  return (
    <main
      className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center font-sans"
      style={{ background: "#0c0a09" }}
    >
      {/* ── BACKGROUND LAYERS (sama persis welcome) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, #1c1108 0%, #0c0a09 70%)",
        }}
      />
      <div
        className="absolute -top-20 -left-20 w-[45vw] h-[45vw] max-w-[400px] max-h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,172,94,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute -bottom-10 -right-10 w-[35vw] h-[35vw] max-w-[340px] max-h-[340px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />
      {/* Floating dust */}
      {GRAINS.map((g) => (
        <motion.div
          key={g.id}
          className="absolute rounded-full pointer-events-none"
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
      <div className="absolute top-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden h-8 md:h-10 z-20">
        <div className="w-3 h-full bg-[#1a1109] shrink-0" />
        <div className="flex flex-1 h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center justify-center">
              <div
                className="w-[60%] rounded-sm"
                style={{
                  height: "55%",
                  background:
                    i % 4 === 0
                      ? "rgba(212,172,94,0.08)"
                      : "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(212,172,94,0.10)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="w-3 h-full bg-[#1a1109] shrink-0" />
      </div>

      {/* ── FILMSTRIP BOTTOM ── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden h-8 md:h-10 z-20">
        <div className="w-3 h-full bg-[#1a1109] shrink-0" />
        <div className="flex flex-1 h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-center justify-center">
              <div
                className="w-[60%] rounded-sm"
                style={{
                  height: "55%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="w-3 h-full bg-[#1a1109] shrink-0" />
      </div>

      {/* ── CORNER ORNAMENTS ── */}
      {[
        "top-9 left-4 md:top-11 md:left-5",
        "top-9 right-4 md:top-11 md:right-5 rotate-90",
        "bottom-9 left-4 md:bottom-11 md:left-5 -rotate-90",
        "bottom-9 right-4 md:bottom-11 md:right-5 rotate-180",
      ].map((pos, i) => (
        <svg
          key={i}
          className={`absolute w-5 h-5 md:w-6 md:h-6 pointer-events-none z-20 ${pos}`}
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M2 16 L2 2 L16 2"
            stroke="rgba(212,172,94,0.3)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ))}

      {/* ── MAIN APP CARD ── */}
      <div
        className="
          relative z-10
          w-full h-full
          mx-auto
          flex flex-col md:flex-row
          overflow-hidden
          /* inset dari filmstrip */
          mt-8 mb-8 md:mt-10 md:mb-10
          /* padding horizontal */
          px-0
        "
        style={{ maxHeight: "calc(100dvh - 64px)" }}
      >
        {/* ════════════════════════════════════════
            LEFT PANEL — Filters & Search
        ════════════════════════════════════════ */}
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="
            shrink-0
            /* Mobile: strip horizontal di atas */
            w-full
            /* Desktop: sidebar kiri */
            md:w-[280px] lg:w-[320px]
            flex flex-col
            /* Mobile: auto height, border bawah */
            border-b md:border-b-0 md:border-r
            overflow-y-auto
          "
          style={{
            background: "rgba(26,17,9,0.7)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(212,172,94,0.12)",
          }}
        >
          {/* Brand header */}
          <div
            className="px-5 py-4 md:px-6 md:py-6 border-b shrink-0"
            style={{ borderColor: "rgba(212,172,94,0.1)" }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="cursor-pointer p-2 rounded-xl transition-all active:scale-90"
                style={{
                  background: "rgba(212,172,94,0.08)",
                  border: "1px solid rgba(212,172,94,0.2)",
                }}
              >
                <ChevronLeft
                  className="w-4 h-4 md:w-5 md:h-5"
                  style={{ color: "#d4ac5e" }}
                />
              </button>
              <div>
                <p
                  className="text-[8px] md:text-[9px] tracking-[0.25em] uppercase font-bold"
                  style={{
                    color: "rgba(212,172,94,0.5)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  PixieBooth · Koleksi
                </p>
                <h1
                  className="text-base md:text-lg font-black tracking-tight leading-none mt-0.5"
                  style={{
                    fontFamily: "'Georgia', serif",
                    background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Pilih Frame
                </h1>
              </div>
              {/* Count badge */}
              <div
                className="ml-auto px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold"
                style={{
                  background: "rgba(212,172,94,0.12)",
                  border: "1px solid rgba(212,172,94,0.2)",
                  color: "rgba(212,172,94,0.8)",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {filtered.length} frame
              </div>
            </div>
          </div>

          {/* Scrollable filter area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-5 space-y-5 md:space-y-6 no-scrollbar">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: "rgba(212,172,94,0.5)" }}
              />
              <input
                type="text"
                placeholder="Cari desain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl outline-none text-sm font-medium transition-all"
                style={{
                  background: "rgba(212,172,94,0.06)",
                  border: "1px solid rgba(212,172,94,0.15)",
                  color: "rgba(245,228,176,0.8)",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "12px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(212,172,94,0.4)";
                  e.target.style.background = "rgba(212,172,94,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(212,172,94,0.15)";
                  e.target.style.background = "rgba(212,172,94,0.06)";
                }}
              />
            </div>

            {/* Separator */}
            <div
              className="h-px"
              style={{ background: "rgba(212,172,94,0.08)" }}
            />

            {/* Kategori */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <LayoutGrid
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(212,172,94,0.5)" }}
                />
                <span
                  className="text-[9px] font-bold tracking-[0.2em] uppercase"
                  style={{
                    color: "rgba(212,172,94,0.5)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  Kategori
                </span>
              </div>
              {/* Mobile: horizontal scroll; Desktop: wrap */}
              <div className="flex md:flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
                    style={
                      activeCategory === cat
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(212,172,94,0.9), rgba(196,154,58,0.9))",
                            color: "#0c0a09",
                            boxShadow: "0 4px 16px rgba(212,172,94,0.25)",
                          }
                        : {
                            background: "rgba(212,172,94,0.06)",
                            border: "1px solid rgba(212,172,94,0.12)",
                            color: "rgba(245,228,176,0.45)",
                          }
                    }
                  >
                    {cat === "Semua"
                      ? "Semua"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div
              className="h-px"
              style={{ background: "rgba(212,172,94,0.08)" }}
            />

            {/* Ukuran Kertas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  className="w-3.5 h-3.5"
                  style={{ color: "rgba(212,172,94,0.5)" }}
                />
                <span
                  className="text-[9px] font-bold tracking-[0.2em] uppercase"
                  style={{
                    color: "rgba(212,172,94,0.5)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  Ukuran Kertas
                </span>
              </div>
              <div className="flex md:flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {paperSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setActivePaperSize(size)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
                    style={
                      activePaperSize === size
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(244,63,94,0.8), rgba(220,40,70,0.8))",
                            color: "#fff",
                            boxShadow: "0 4px 16px rgba(244,63,94,0.2)",
                          }
                        : {
                            background: "rgba(244,63,94,0.06)",
                            border: "1px solid rgba(244,63,94,0.12)",
                            color: "rgba(245,228,176,0.4)",
                          }
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {(search ||
              activeCategory !== "Semua" ||
              activePaperSize !== "Semua") && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Semua");
                  setActivePaperSize("Semua");
                }}
                className="w-full py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                style={{
                  border: "1px solid rgba(212,172,94,0.15)",
                  color: "rgba(212,172,94,0.5)",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                ↺ Reset Filter
              </button>
            )}
          </div>

          {/* Bottom label */}
          <div
            className="hidden md:flex items-center justify-center py-3 border-t shrink-0"
            style={{ borderColor: "rgba(212,172,94,0.08)" }}
          >
            <span
              className="text-[8px] tracking-[0.25em]"
              style={{
                color: "rgba(212,172,94,0.18)",
                fontFamily: "'Courier New', monospace",
              }}
            >
              FRAME COLLECTION · ISO 400
            </span>
          </div>
        </motion.aside>

        {/* ════════════════════════════════════════
            RIGHT PANEL — Frame Grid
        ════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex-1 min-w-0 overflow-y-auto no-scrollbar"
          style={{ background: "rgba(14,11,7,0.5)" }}
        >
          {/* Loading */}
          {isLoadingFrames && (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              >
                <Loader2
                  className="w-8 h-8"
                  style={{ color: "rgba(212,172,94,0.6)" }}
                />
              </motion.div>
              <p
                className="text-xs tracking-widest uppercase"
                style={{
                  color: "rgba(212,172,94,0.35)",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                Memuat koleksi...
              </p>
            </div>
          )}

          {/* Grid */}
          {!isLoadingFrames && filtered.length > 0 && (
            <div className="p-4 md:p-6 lg:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((frame, idx) => (
                    <motion.div
                      key={frame.id}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 24,
                        delay: idx * 0.025,
                      }}
                      onClick={() => handleSelect(frame)}
                      className="group cursor-pointer flex flex-col"
                      style={{
                        borderRadius: "16px",
                        background: "rgba(26,17,9,0.8)",
                        border: "1px solid rgba(212,172,94,0.1)",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                      }}
                      whileHover={{
                        y: -6,
                        boxShadow:
                          "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,172,94,0.3)",
                      }}
                    >
                      {/* Frame image area */}
                      <div
                        className="relative w-full overflow-hidden"
                        style={{
                          aspectRatio: "2 / 3",
                          background: "rgba(12,10,7,0.8)",
                        }}
                      >
                        <Image
                          src={frame.imageUrl}
                          alt={frame.name}
                          fill
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        {/* Dark overlay on hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                          style={{ background: "rgba(12,10,7,0.55)" }}
                        >
                          <span
                            className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
                            style={{
                              background:
                                "linear-gradient(135deg, #d4ac5e, #c49a3a)",
                              color: "#0c0a09",
                              fontFamily: "'Courier New', monospace",
                            }}
                          >
                            ✦ Pilih
                          </span>
                        </div>

                        {/* Paper size badge */}
                        <div
                          className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold"
                          style={{
                            background: "rgba(12,10,7,0.75)",
                            border: "1px solid rgba(212,172,94,0.2)",
                            color: "rgba(212,172,94,0.7)",
                            fontFamily: "'Courier New', monospace",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          {getPaperSize(frame.canvasWidth, frame.canvasHeight)}
                        </div>

                        {/* Frame number */}
                        <div
                          className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[7px] font-bold"
                          style={{
                            color: "rgba(212,172,94,0.25)",
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          {String(idx + 1).padStart(3, "0")}
                        </div>
                      </div>

                      {/* Text info */}
                      <div
                        className="px-3 py-2.5 border-t"
                        style={{ borderColor: "rgba(212,172,94,0.08)" }}
                      >
                        <p
                          className="text-xs font-bold truncate leading-tight"
                          style={{
                            color: "rgba(245,228,176,0.75)",
                            fontFamily: "'Georgia', serif",
                          }}
                        >
                          {frame.name}
                        </p>
                        <p
                          className="text-[9px] capitalize mt-0.5"
                          style={{
                            color: "rgba(212,172,94,0.35)",
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          {frame.category}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingFrames && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center gap-4 p-8"
            >
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center rotate-12"
                style={{
                  background: "rgba(212,172,94,0.08)",
                  border: "1px solid rgba(212,172,94,0.15)",
                }}
              >
                <Search
                  className="w-7 h-7 md:w-9 md:h-9 -rotate-12"
                  style={{ color: "rgba(212,172,94,0.4)" }}
                />
              </div>
              <div className="text-center">
                <h3
                  className="text-base md:text-lg font-black"
                  style={{
                    fontFamily: "'Georgia', serif",
                    color: "rgba(245,228,176,0.6)",
                  }}
                >
                  Tidak ada frame
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "rgba(212,172,94,0.35)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Semua");
                  setActivePaperSize("Semua");
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,172,94,0.15), rgba(212,172,94,0.08))",
                  border: "1px solid rgba(212,172,94,0.25)",
                  color: "#d4ac5e",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                ↺ Reset Pencarian
              </button>
            </motion.div>
          )}
        </motion.section>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input::placeholder { color: rgba(212,172,94,0.3) !important; }
        * { -webkit-font-smoothing: antialiased; }
      `,
        }}
      />
    </main>
  );
}
