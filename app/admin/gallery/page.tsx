"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Download,
  Trash2,
  Calendar,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Clock,
  SlidersHorizontal,
  Film,
  ImageOff,
} from "lucide-react";
import Image from "next/image";

const MOCK_HISTORY = Array.from({ length: 18 }).map((_, i) => ({
  id: `PB-${String(i + 1).padStart(4, "0")}`,
  imageUrl: `https://picsum.photos/seed/photo-${i}/600/1800`,
  frameName: [
    "Retro Strip",
    "Cute Pink",
    "Polaroid Bloom",
    "Dark Minimal",
    "Golden Hour",
    "Film Noir",
  ][i % 6],
  layout: ['Strip 2×6"', 'Postcard 4×6"', 'Square 4×4"'][i % 3],
  category: ["retro", "cute", "elegant", "minimalist", "warm", "retro"][i % 6],
  createdAt: new Date(Date.now() - i * 3_600_000 * 18).toISOString(),
}));

const FRAME_OPTIONS = [
  "Semua Frame",
  "Retro Strip",
  "Cute Pink",
  "Polaroid Bloom",
  "Dark Minimal",
  "Golden Hour",
  "Film Noir",
];
const LAYOUT_OPTIONS = [
  "Semua Layout",
  'Strip 2×6"',
  'Postcard 4×6"',
  'Square 4×4"',
];
const ITEMS_PER_PAGE = 12;
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [selFrame, setSelFrame] = useState("Semua Frame");
  const [selLayout, setSelLayout] = useState("Semua Layout");
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<
    (typeof MOCK_HISTORY)[0] | null
  >(null);
  const [showFilters, setShowFilters] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_HISTORY.filter((item) => {
      const q = search.toLowerCase();
      return (
        (item.frameName.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)) &&
        (selFrame === "Semua Frame" || item.frameName === selFrame) &&
        (selLayout === "Semua Layout" || item.layout === selLayout)
      );
    });
  }, [search, selFrame, selLayout]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleDownload = (url: string, id: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `pixiebooth-${id}.png`;
    a.click();
  };
  const handleDelete = (id: string) => {
    console.log("Delete", id);
    setConfirmDel(null);
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  };

  // ── Shared style tokens ──
  const cardBorder = "1px solid rgba(212,172,94,0.12)";
  const goldText = {
    color: "rgba(212,172,94,0.8)",
    fontFamily: "'Courier New', monospace",
  };
  const dimText = {
    color: "rgba(212,172,94,0.35)",
    fontFamily: "'Courier New', monospace",
  };
  const ghostBtn = {
    background: "rgba(212,172,94,0.05)",
    border: "1px solid rgba(212,172,94,0.12)",
    color: "rgba(212,172,94,0.5)",
    fontFamily: "'Courier New', monospace",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: "0.1em",
    borderRadius: 10,
    padding: "7px 14px",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0c0a09",
        padding: "0 0 60px 0",
      }}
    >
      {/* ── PAGE HEADER ── */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: "rgba(10,7,3,0.96)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212,172,94,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Title */}
          <div className="flex-1 min-w-0">
            <p
              style={{
                ...dimText,
                fontSize: 8,
                fontWeight: "bold",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              PixieBooth · Admin
            </p>
            <h1
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(18px, 4vw, 24px)",
                fontWeight: 900,
                background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
                marginTop: 2,
              }}
            >
              Galeri Photobooth
            </h1>
          </div>

          {/* Search + filter toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors"
                style={{
                  color: focusSearch
                    ? "rgba(212,172,94,0.7)"
                    : "rgba(212,172,94,0.3)",
                }}
              />
              <input
                type="text"
                placeholder="Cari ID / frame…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                onFocus={() => setFocusSearch(true)}
                onBlur={() => setFocusSearch(false)}
                className="outline-none transition-all"
                style={{
                  paddingLeft: 34,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 10,
                  width: "clamp(140px, 30vw, 220px)",
                  background: focusSearch
                    ? "rgba(212,172,94,0.07)"
                    : "rgba(212,172,94,0.03)",
                  border: focusSearch
                    ? "1px solid rgba(212,172,94,0.4)"
                    : "1px solid rgba(212,172,94,0.12)",
                  color: "rgba(245,228,176,0.8)",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(212,172,94,0.3)" }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5"
              style={{
                ...ghostBtn,
                background: showFilters
                  ? "rgba(212,172,94,0.1)"
                  : "rgba(212,172,94,0.04)",
                borderColor: showFilters
                  ? "rgba(212,172,94,0.3)"
                  : "rgba(212,172,94,0.12)",
                color: showFilters
                  ? "rgba(212,172,94,0.8)"
                  : "rgba(212,172,94,0.4)",
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FILTER</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: "hidden",
                borderTop: "1px solid rgba(212,172,94,0.06)",
              }}
            >
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-wrap gap-3 items-center">
                {/* Frame filter */}
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      ...dimText,
                      fontSize: 8,
                      fontWeight: "bold",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    Frame
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FRAME_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelFrame(opt);
                          setPage(1);
                        }}
                        className="px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 9,
                          fontWeight: "bold",
                          letterSpacing: "0.05em",
                          background:
                            selFrame === opt
                              ? "rgba(212,172,94,0.15)"
                              : "rgba(212,172,94,0.03)",
                          border:
                            selFrame === opt
                              ? "1px solid rgba(212,172,94,0.35)"
                              : "1px solid rgba(212,172,94,0.08)",
                          color:
                            selFrame === opt
                              ? "rgba(212,172,94,0.9)"
                              : "rgba(212,172,94,0.35)",
                        }}
                      >
                        {opt === "Semua Frame" ? "SEMUA" : opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    width: 1,
                    height: 20,
                    background: "rgba(212,172,94,0.08)",
                  }}
                />
                {/* Layout filter */}
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      ...dimText,
                      fontSize: 8,
                      fontWeight: "bold",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    Layout
                  </span>
                  <div className="flex gap-1.5">
                    {LAYOUT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelLayout(opt);
                          setPage(1);
                        }}
                        className="px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 9,
                          fontWeight: "bold",
                          background:
                            selLayout === opt
                              ? "rgba(244,63,94,0.1)"
                              : "rgba(212,172,94,0.03)",
                          border:
                            selLayout === opt
                              ? "1px solid rgba(244,63,94,0.3)"
                              : "1px solid rgba(212,172,94,0.08)",
                          color:
                            selLayout === opt
                              ? "rgba(244,120,130,0.9)"
                              : "rgba(212,172,94,0.35)",
                        }}
                      >
                        {opt === "Semua Layout" ? "SEMUA" : opt}
                      </button>
                    ))}
                  </div>
                </div>
                {(selFrame !== "Semua Frame" ||
                  selLayout !== "Semua Layout" ||
                  search) && (
                  <button
                    onClick={() => {
                      setSelFrame("Semua Frame");
                      setSelLayout("Semua Layout");
                      setSearch("");
                      setPage(1);
                    }}
                    className="px-2.5 py-1 rounded-lg cursor-pointer transition-all active:scale-95"
                    style={{
                      ...dimText,
                      fontSize: 9,
                      fontWeight: "bold",
                      background: "rgba(212,172,94,0.03)",
                      border: "1px solid rgba(212,172,94,0.08)",
                    }}
                  >
                    ↺ RESET
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── STATS BAR ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4" style={{ color: "rgba(212,172,94,0.4)" }} />
          <span style={{ ...goldText, fontSize: 11, fontWeight: "bold" }}>
            {filtered.length}
          </span>
          <span style={{ ...dimText, fontSize: 10 }}>foto ditemukan</span>
        </div>
        {filtered.length !== MOCK_HISTORY.length && (
          <span style={{ ...dimText, fontSize: 9 }}>
            dari {MOCK_HISTORY.length} total
          </span>
        )}
        {/* Thin gold line */}
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(to right, rgba(212,172,94,0.1), transparent)",
          }}
        />
        <span
          style={{
            ...dimText,
            fontSize: 8,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Hal. {page}/{totalPages || 1}
        </span>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div
              className="flex items-center justify-center"
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: "rgba(212,172,94,0.05)",
                border: "1px solid rgba(212,172,94,0.1)",
              }}
            >
              <ImageOff
                className="w-10 h-10"
                style={{ color: "rgba(212,172,94,0.2)" }}
              />
            </div>
            <div className="text-center">
              <h3
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "rgba(245,228,176,0.5)",
                }}
              >
                Tidak ada foto
              </h3>
              <p style={{ ...dimText, fontSize: 11, marginTop: 4 }}>
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {paginated.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 24,
                    delay: idx * 0.02,
                  }}
                  onClick={() => setSelectedPhoto(item)}
                  className="group cursor-pointer flex flex-col overflow-hidden"
                  style={{
                    borderRadius: 16,
                    background: "rgba(20,13,6,0.9)",
                    border: cardBorder,
                    transition: "all 0.3s",
                  }}
                  whileHover={{
                    y: -5,
                    boxShadow:
                      "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,172,94,0.25)",
                  }}
                >
                  {/* Photo */}
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "2/3", background: "#0c0a09" }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.frameName}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ background: "rgba(12,10,7,0.55)" }}
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "rgba(212,172,94,0.9)",
                        }}
                      >
                        <Maximize2
                          className="w-4 h-4"
                          style={{ color: "#0c0a09" }}
                        />
                      </div>
                    </div>
                    {/* Frame number badge */}
                    <div
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md"
                      style={{
                        background: "rgba(12,10,7,0.75)",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(212,172,94,0.15)",
                      }}
                    >
                      <span
                        style={{
                          ...dimText,
                          fontSize: 7,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {item.id}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div
                    className="px-3 py-2.5"
                    style={{ borderTop: "1px solid rgba(212,172,94,0.08)" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: 11,
                        fontWeight: "bold",
                        color: "rgba(245,228,176,0.7)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.frameName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        style={{
                          ...dimText,
                          fontSize: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {item.layout}
                      </span>
                      <span style={{ ...dimText, fontSize: 8 }}>
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-10 flex items-center justify-between">
          <span style={{ ...dimText, fontSize: 10 }}>
            {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} dari{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center cursor-pointer disabled:opacity-30 active:scale-90 transition-all"
              style={{
                ...ghostBtn,
                width: 32,
                height: 32,
                borderRadius: 9,
                padding: 0,
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11,
                  fontWeight: "bold",
                  background:
                    page === p
                      ? "linear-gradient(135deg, rgba(212,172,94,0.85), rgba(196,154,58,0.8))"
                      : "rgba(212,172,94,0.04)",
                  border:
                    page === p
                      ? "1px solid rgba(212,172,94,0.4)"
                      : "1px solid rgba(212,172,94,0.1)",
                  color: page === p ? "#0c0a09" : "rgba(212,172,94,0.4)",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center justify-center cursor-pointer disabled:opacity-30 active:scale-90 transition-all"
              style={{
                ...ghostBtn,
                width: 32,
                height: 32,
                borderRadius: 9,
                padding: 0,
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 cursor-pointer"
              style={{
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(8px)",
              }}
              onClick={() => setConfirmDel(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xs p-6 space-y-4"
              style={{
                borderRadius: 20,
                background: "rgba(18,12,6,0.97)",
                border: "1px solid rgba(212,172,94,0.15)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <Trash2
                  className="w-5 h-5"
                  style={{ color: "rgba(244,100,120,0.8)" }}
                />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: 16,
                    fontWeight: 900,
                    color: "rgba(245,228,176,0.9)",
                  }}
                >
                  Hapus Foto?
                </h3>
                <p
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    color: "rgba(212,172,94,0.4)",
                    marginTop: 4,
                  }}
                >
                  ID{" "}
                  <strong style={{ color: "rgba(212,172,94,0.7)" }}>
                    {confirmDel}
                  </strong>{" "}
                  akan dihapus permanen.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDel(null)}
                  className="flex-1 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all"
                  style={{
                    background: "rgba(212,172,94,0.05)",
                    border: "1px solid rgba(212,172,94,0.12)",
                    color: "rgba(212,172,94,0.5)",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                >
                  BATAL
                </button>
                <button
                  onClick={() => handleDelete(confirmDel)}
                  className="flex-[2] py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all"
                  style={{
                    background: "rgba(244,63,94,0.1)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    color: "rgba(244,120,130,0.9)",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                >
                  YA, HAPUS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PHOTO DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="absolute inset-0 cursor-pointer"
              style={{
                background: "rgba(0,0,0,0.88)",
                backdropFilter: "blur(12px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative w-full flex flex-col md:flex-row overflow-hidden"
              style={{
                maxWidth: 820,
                maxHeight: "90dvh",
                borderRadius: 24,
                background: "rgba(16,10,5,0.98)",
                border: "1px solid rgba(212,172,94,0.18)",
                backdropFilter: "blur(20px)",
                boxShadow:
                  "0 60px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,172,94,0.06)",
              }}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-20 flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(212,172,94,0.08)",
                  border: "1px solid rgba(212,172,94,0.15)",
                  color: "rgba(212,172,94,0.5)",
                }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Photo */}
              <div
                className="flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{
                  width: "100%",
                  maxWidth: 280,
                  background: "rgba(8,6,3,0.8)",
                  padding: 24,
                }}
              >
                <div
                  className="relative w-full shadow-2xl"
                  style={{
                    aspectRatio: "1/3",
                    maxHeight: "70dvh",
                    borderRadius: 4,
                    border: "1px solid rgba(212,172,94,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={selectedPhoto.imageUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                  {/* Gold glow */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      boxShadow: "inset 0 0 0 1px rgba(212,172,94,0.08)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Details */}
              <div
                className="flex-1 flex flex-col justify-between overflow-y-auto"
                style={{
                  padding: "28px 24px 24px",
                  borderLeft: "1px solid rgba(212,172,94,0.08)",
                }}
              >
                {/* Top info */}
                <div className="space-y-5">
                  {/* Badge + title */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span
                        style={{
                          background: "rgba(212,172,94,0.1)",
                          border: "1px solid rgba(212,172,94,0.2)",
                          color: "rgba(212,172,94,0.7)",
                          fontFamily: "'Courier New', monospace",
                          fontSize: 8,
                          fontWeight: "bold",
                          letterSpacing: "0.15em",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {selectedPhoto.layout}
                      </span>
                      <span
                        style={{
                          ...dimText,
                          fontSize: 8,
                          letterSpacing: "0.1em",
                        }}
                      >
                        ·
                      </span>
                      <span
                        style={{
                          ...dimText,
                          fontSize: 8,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {selectedPhoto.category}
                      </span>
                    </div>
                    <h2
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "clamp(18px, 3vw, 24px)",
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        lineHeight: 1.1,
                      }}
                    >
                      {selectedPhoto.frameName}
                    </h2>
                    <p
                      style={{
                        ...dimText,
                        fontSize: 9,
                        marginTop: 4,
                        letterSpacing: "0.1em",
                      }}
                    >
                      ID: {selectedPhoto.id}
                    </p>
                  </div>

                  {/* Divider */}
                  <div
                    style={{ height: 1, background: "rgba(212,172,94,0.06)" }}
                  />

                  {/* Meta */}
                  <div className="space-y-3">
                    {[
                      {
                        icon: Calendar,
                        label: "TANGGAL",
                        value: formatDate(selectedPhoto.createdAt),
                      },
                      {
                        icon: Clock,
                        label: "WAKTU",
                        value: formatTime(selectedPhoto.createdAt),
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: "rgba(212,172,94,0.06)",
                            border: "1px solid rgba(212,172,94,0.1)",
                          }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: "rgba(212,172,94,0.4)" }}
                          />
                        </div>
                        <div>
                          <p
                            style={{
                              ...dimText,
                              fontSize: 7,
                              fontWeight: "bold",
                              letterSpacing: "0.2em",
                              textTransform: "uppercase",
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontFamily: "'Courier New', monospace",
                              fontSize: 12,
                              fontWeight: "bold",
                              color: "rgba(245,228,176,0.7)",
                              marginTop: 1,
                            }}
                          >
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Film strip mini decoration */}
                  <div
                    style={{ height: 1, background: "rgba(212,172,94,0.06)" }}
                  />
                  <div
                    className="flex gap-1 overflow-hidden"
                    style={{ height: 16 }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 flex items-center justify-center"
                      >
                        <div
                          style={{
                            width: "60%",
                            height: "55%",
                            borderRadius: 2,
                            background:
                              i % 3 === 0
                                ? "rgba(212,172,94,0.08)"
                                : "rgba(212,172,94,0.03)",
                            border: "1px solid rgba(212,172,94,0.08)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 mt-5">
                  <button
                    onClick={() =>
                      handleDownload(selectedPhoto.imageUrl, selectedPhoto.id)
                    }
                    className="w-full flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    style={{
                      padding: "12px 20px",
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg, rgba(212,172,94,0.9), rgba(196,154,58,0.85))",
                      border: "1px solid rgba(212,172,94,0.4)",
                      color: "#0c0a09",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 11,
                      fontWeight: "bold",
                      letterSpacing: "0.1em",
                      boxShadow: "0 6px 20px rgba(212,172,94,0.2)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
                  >
                    <Download className="w-4 h-4" />
                    UNDUH FOTO
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPhoto(null);
                      setConfirmDel(selectedPhoto.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    style={{
                      padding: "12px 20px",
                      borderRadius: 14,
                      background: "rgba(244,63,94,0.07)",
                      border: "1px solid rgba(244,63,94,0.18)",
                      color: "rgba(244,120,130,0.8)",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 11,
                      fontWeight: "bold",
                      letterSpacing: "0.1em",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(244,63,94,0.12)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(244,63,94,0.07)")
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                    HAPUS FOTO
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { -webkit-font-smoothing: antialiased; }
        input::placeholder { color: rgba(212,172,94,0.2) !important; }
      `,
        }}
      />
    </div>
  );
}
