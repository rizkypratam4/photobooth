"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  Clapperboard,
  Move,
  Maximize2,
  Grid3X3,
  Eye,
  Copy,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Layers,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
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

// ── Breakpoint hook ──
type BP = "mobile" | "tablet" | "laptop" | "desktop";
function useBreakpoint(): BP {
  const [bp, setBp] = useState<BP>("desktop");
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) setBp("mobile");
      else if (w < 900) setBp("tablet");
      else if (w < 1280) setBp("laptop");
      else setBp("desktop");
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return bp;
}

// ── Styled inputs ──
function GoldInput({ label, value, onChange, type = "text", ...rest }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            fontWeight: "bold",
            letterSpacing: "0.15em",
            color: "rgba(212,172,94,0.45)",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 4,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
        className="w-full outline-none transition-all"
        style={{
          padding: "8px 12px",
          borderRadius: 10,
          background: focused
            ? "rgba(212,172,94,0.07)"
            : "rgba(212,172,94,0.03)",
          border: focused
            ? "1px solid rgba(212,172,94,0.4)"
            : "1px solid rgba(212,172,94,0.12)",
          color: "rgba(245,228,176,0.8)",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          transition: "all 0.2s",
        }}
      />
    </div>
  );
}

function GoldSelect({ label, value, onChange, children }: any) {
  return (
    <div>
      {label && (
        <label
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            fontWeight: "bold",
            letterSpacing: "0.15em",
            color: "rgba(212,172,94,0.45)",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 4,
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="w-full outline-none transition-all cursor-pointer"
        style={{
          padding: "8px 12px",
          borderRadius: 10,
          background: "rgba(212,172,94,0.04)",
          border: "1px solid rgba(212,172,94,0.12)",
          color: "rgba(245,228,176,0.7)",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
        }}
      >
        {children}
      </select>
    </div>
  );
}

// ── Shared button styles ──
const btnGold = {
  background:
    "linear-gradient(135deg, rgba(212,172,94,0.85), rgba(196,154,58,0.8))",
  border: "1px solid rgba(212,172,94,0.4)",
  color: "#0c0a09",
  fontFamily: "'Courier New', monospace",
  fontSize: 10,
  fontWeight: "bold",
  letterSpacing: "0.1em",
  boxShadow: "0 4px 12px rgba(212,172,94,0.15)",
};
const btnDark = {
  background: "rgba(212,172,94,0.05)",
  border: "1px solid rgba(212,172,94,0.12)",
  color: "rgba(212,172,94,0.55)",
  fontFamily: "'Courier New', monospace",
  fontSize: 10,
  fontWeight: "bold",
  letterSpacing: "0.1em",
};
const btnRose = {
  background: "rgba(244,63,94,0.08)",
  border: "1px solid rgba(244,63,94,0.2)",
  color: "rgba(244,100,120,0.8)",
  fontFamily: "'Courier New', monospace",
  fontSize: 10,
  fontWeight: "bold",
  letterSpacing: "0.1em",
};

// ── Section label ──
function SectionLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: "0.2em",
        color: "rgba(212,172,94,0.3)",
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

// ── Divider ──
function Divider() {
  return <div style={{ height: 1, background: "rgba(212,172,94,0.06)" }} />;
}

// ══════════════════════════════════════════════════════════════
// LEFT PANEL CONTENT (shared between drawer and desktop sidebar)
// ══════════════════════════════════════════════════════════════
function LeftPanelContent({
  frameName,
  setFrameName,
  category,
  setCategory,
  frameImageUrl,
  canvasSize,
  handleFileUpload,
  slots,
  selectedSlotId,
  setSelectedSlotId,
  addSlot,
  duplicateSlot,
  removeSlot,
  savedFrames,
  isLoadingFrames,
  editingId,
  loadFrame,
  setConfirmDelete,
  deletingId,
  resetEditor,
  onClose,
}: any) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "rgba(14,10,5,0.97)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(212,172,94,0.08)" }}
      >
        <SectionLabel>Panel</SectionLabel>
        {onClose && (
          <button
            onClick={onClose}
            style={{ color: "rgba(212,172,94,0.4)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(212,172,94,0.8)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(212,172,94,0.4)")
            }
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-5">
        {/* Frame Info */}
        <div className="space-y-3">
          <SectionLabel>Frame Info</SectionLabel>
          <GoldInput
            label="Nama Frame"
            value={frameName}
            onChange={(e: any) => setFrameName(e.target.value)}
          />
          <GoldSelect
            label="Kategori"
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
          >
            <option value="cute">Cute</option>
            <option value="elegant">Elegant</option>
            <option value="retro">Retro</option>
            <option value="minimalist">Minimalist</option>
          </GoldSelect>
        </div>

        <Divider />

        {/* Frame Asset */}
        <div className="space-y-2">
          <SectionLabel>Frame Asset</SectionLabel>
          {!frameImageUrl ? (
            <label
              className="flex flex-col items-center justify-center gap-2 p-5 cursor-pointer transition-all"
              style={{
                borderRadius: 14,
                border: "2px dashed rgba(212,172,94,0.15)",
                background: "rgba(212,172,94,0.02)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,172,94,0.35)";
                e.currentTarget.style.background = "rgba(212,172,94,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,172,94,0.15)";
                e.currentTarget.style.background = "rgba(212,172,94,0.02)";
              }}
            >
              <Upload
                style={{
                  width: 22,
                  height: 22,
                  color: "rgba(212,172,94,0.35)",
                }}
              />
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10,
                  fontWeight: "bold",
                  color: "rgba(212,172,94,0.35)",
                  letterSpacing: "0.1em",
                }}
              >
                UPLOAD PNG
              </span>
              <input
                type="file"
                accept="image/png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div
              className="relative overflow-hidden"
              style={{
                aspectRatio: "1/2",
                borderRadius: 12,
                border: "1px solid rgba(212,172,94,0.15)",
              }}
            >
              <Image
                src={frameImageUrl}
                alt="Frame Preview"
                fill
                className="object-cover"
              />
              <button
                onClick={() => {
                  /* handled by parent */
                }}
                className="absolute top-2 right-2 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(244,63,94,0.8)",
                  border: "1px solid rgba(244,63,94,0.4)",
                }}
              >
                <Trash2 style={{ width: 14, height: 14, color: "white" }} />
              </button>
              <div
                className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg text-center"
                style={{
                  background: "rgba(12,10,7,0.8)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 8,
                    color: "rgba(212,172,94,0.5)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {canvasSize.width} × {canvasSize.height}px
                </p>
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Photo Slots */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Photo Slots</SectionLabel>
            <button
              onClick={addSlot}
              disabled={!frameImageUrl}
              className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform disabled:opacity-30"
              style={{ width: 24, height: 24, borderRadius: 7, ...btnGold }}
            >
              <Plus style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <p
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              color: "rgba(212,172,94,0.22)",
            }}
          >
            Drag untuk pindah · sudut kanan bawah untuk resize
          </p>
          <div className="space-y-1.5">
            {slots.map((slot: PhotoSlot) => (
              <div
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className="cursor-pointer transition-all"
                style={{
                  padding: "9px 11px",
                  borderRadius: 12,
                  background:
                    selectedSlotId === slot.id
                      ? "rgba(212,172,94,0.08)"
                      : "rgba(212,172,94,0.02)",
                  border:
                    selectedSlotId === slot.id
                      ? "1px solid rgba(212,172,94,0.3)"
                      : "1px solid rgba(212,172,94,0.08)",
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: 10,
                      fontWeight: "bold",
                      color:
                        selectedSlotId === slot.id
                          ? "rgba(212,172,94,0.9)"
                          : "rgba(212,172,94,0.4)",
                    }}
                  >
                    SLOT {String(slot.order).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSlot(slot.id);
                      }}
                      className="cursor-pointer p-1 rounded"
                      style={{ color: "rgba(212,172,94,0.3)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "rgba(212,172,94,0.7)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(212,172,94,0.3)")
                      }
                    >
                      <Copy style={{ width: 11, height: 11 }} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSlot(slot.id);
                      }}
                      className="cursor-pointer p-1 rounded"
                      style={{ color: "rgba(212,172,94,0.3)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "rgba(244,100,120,0.7)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(212,172,94,0.3)")
                      }
                    >
                      <Trash2 style={{ width: 11, height: 11 }} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      ["X", slot.x],
                      ["Y", slot.y],
                      ["W", slot.width],
                      ["H", slot.height],
                    ] as [string, number][]
                  ).map(([k, v]) => (
                    <div key={k} className="text-center">
                      <p
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 7,
                          color: "rgba(212,172,94,0.25)",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {k}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 9,
                          color: "rgba(212,172,94,0.5)",
                          fontWeight: "bold",
                        }}
                      >
                        {Math.round(v)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {slots.length === 0 && (
              <p
                className="text-center py-4"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10,
                  color: "rgba(212,172,94,0.2)",
                  fontStyle: "italic",
                }}
              >
                Belum ada slot foto
              </p>
            )}
          </div>
        </div>

        <Divider />

        {/* Saved Frames */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Frame Tersimpan</SectionLabel>
            {editingId && (
              <button
                onClick={resetEditor}
                className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer active:scale-95 transition-all"
                style={btnDark}
              >
                <Plus style={{ width: 10, height: 10 }} />
                <span style={{ fontSize: 9 }}>BARU</span>
              </button>
            )}
          </div>
          {isLoadingFrames ? (
            <div className="flex justify-center py-4">
              <Loader2
                style={{ width: 16, height: 16, color: "rgba(212,172,94,0.3)" }}
                className="animate-spin"
              />
            </div>
          ) : savedFrames.length === 0 ? (
            <p
              className="text-center py-3"
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 9,
                color: "rgba(212,172,94,0.2)",
                fontStyle: "italic",
              }}
            >
              Belum ada frame
            </p>
          ) : (
            <div className="space-y-1.5">
              {savedFrames.map((frame: FrameConfig) => (
                <div
                  key={frame.id}
                  onClick={() => loadFrame(frame)}
                  className="flex items-center gap-2.5 cursor-pointer transition-all"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    background:
                      editingId === frame.id
                        ? "rgba(212,172,94,0.08)"
                        : "rgba(212,172,94,0.02)",
                    border:
                      editingId === frame.id
                        ? "1px solid rgba(212,172,94,0.2)"
                        : "1px solid rgba(212,172,94,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    if (editingId !== frame.id)
                      e.currentTarget.style.background =
                        "rgba(212,172,94,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (editingId !== frame.id)
                      e.currentTarget.style.background =
                        "rgba(212,172,94,0.02)";
                  }}
                >
                  <div
                    className="relative flex-shrink-0 overflow-hidden"
                    style={{
                      width: 28,
                      height: 36,
                      borderRadius: 6,
                      border: "1px solid rgba(212,172,94,0.15)",
                    }}
                  >
                    <Image
                      src={frame.imageUrl}
                      alt={frame.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 10,
                        fontWeight: "bold",
                        color:
                          editingId === frame.id
                            ? "rgba(245,228,176,0.8)"
                            : "rgba(212,172,94,0.5)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {frame.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 8,
                        color: "rgba(212,172,94,0.25)",
                        textTransform: "capitalize",
                      }}
                    >
                      {frame.category} · {frame.slots.length} slot
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(frame);
                    }}
                    disabled={deletingId === frame.id}
                    className="flex-shrink-0 p-1.5 cursor-pointer transition-all disabled:opacity-40 rounded-lg"
                    style={{ color: "rgba(212,172,94,0.2)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(244,100,120,0.7)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(212,172,94,0.2)")
                    }
                  >
                    {deletingId === frame.id ? (
                      <Loader2
                        style={{ width: 12, height: 12 }}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 style={{ width: 12, height: 12 }} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// RIGHT PANEL (Properties)
// ══════════════════════════════════════════════════════════════
function RightPanelContent({
  selectedSlot,
  updateSlotDirect,
  duplicateSlot,
  removeSlot,
  onClose,
}: any) {
  if (!selectedSlot) return null;
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "rgba(14,10,5,0.97)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(212,172,94,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <SectionLabel>Properties</SectionLabel>
          <span
            style={{
              background: "rgba(212,172,94,0.1)",
              border: "1px solid rgba(212,172,94,0.2)",
              color: "rgba(212,172,94,0.6)",
              fontFamily: "'Courier New', monospace",
              fontSize: 8,
              fontWeight: "bold",
              padding: "2px 8px",
              borderRadius: 6,
            }}
          >
            SLOT {String(selectedSlot.order).padStart(2, "0")}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ color: "rgba(212,172,94,0.4)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(212,172,94,0.8)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(212,172,94,0.4)")
            }
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["x", "y", "width", "height"] as const).map((key) => (
            <GoldInput
              key={key}
              label={
                key === "x"
                  ? "X"
                  : key === "y"
                    ? "Y"
                    : key === "width"
                      ? "W"
                      : "H"
              }
              type="number"
              value={Math.round(selectedSlot[key])}
              onChange={(e: any) =>
                updateSlotDirect(selectedSlot.id, {
                  [key]: parseInt(e.target.value) || 0,
                })
              }
            />
          ))}
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => duplicateSlot(selectedSlot.id)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl cursor-pointer active:scale-95 transition-all"
            style={btnDark}
          >
            <Copy style={{ width: 14, height: 14 }} /> DUPLIKAT
          </button>
          <button
            onClick={() => removeSlot(selectedSlot.id)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl cursor-pointer active:scale-95 transition-all"
            style={btnRose}
          >
            <Trash2 style={{ width: 14, height: 14 }} /> HAPUS
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MOBILE BOTTOM SHEET
// ══════════════════════════════════════════════════════════════
function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 inset-x-0 z-50 flex flex-col overflow-hidden"
            style={{
              maxHeight: "80dvh",
              borderRadius: "20px 20px 0 0",
              background: "rgba(14,10,5,0.99)",
              border: "1px solid rgba(212,172,94,0.12)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: "1px solid rgba(212,172,94,0.08)" }}
            >
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10,
                  fontWeight: "bold",
                  letterSpacing: "0.15em",
                  color: "rgba(212,172,94,0.5)",
                  textTransform: "uppercase",
                }}
              >
                {title}
              </p>
              <button
                onClick={onClose}
                style={{ color: "rgba(212,172,94,0.4)" }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="overflow-y-auto no-scrollbar">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function FrameEditorPage() {
  const { addCustomFrame } = usePhoto();
  const bp = useBreakpoint();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [frameName, setFrameName] = useState("New Frame");
  const [category, setCategory] = useState("cute");
  const [frameImageUrl, setFrameImageUrl] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 1800 });
  const [slots, setSlots] = useState<PhotoSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [scale, setScale] = useState(1);

  const [savedFrames, setSavedFrames] = useState<FrameConfig[]>([]);
  const [isLoadingFrames, setIsLoadingFrames] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FrameConfig | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Mobile/Tablet sheet states
  const [showLeftSheet, setShowLeftSheet] = useState(false);
  const [showRightSheet, setShowRightSheet] = useState(false);

  const dragRef = useRef<DragState | null>(null);
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const isMobileOrTablet = isMobile || isTablet;

  // ── Fetch ──
  useEffect(() => {
    fetchFrames();
  }, []);

  const fetchFrames = async () => {
    setIsLoadingFrames(true);
    try {
      const res = await fetch("/api/frames");
      if (!res.ok) throw new Error();
      setSavedFrames(await res.json());
    } catch {
      showToast("error", "Gagal memuat frame.");
    } finally {
      setIsLoadingFrames(false);
    }
  };

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const loadFrame = (frame: FrameConfig) => {
    setEditingId(frame.id);
    setFrameName(frame.name);
    setCategory(frame.category);
    setFrameImageUrl(frame.imageUrl);
    setCanvasSize({ width: frame.canvasWidth, height: frame.canvasHeight });
    setSlots(frame.slots);
    setSelectedSlotId(null);
    setIsPreview(false);
    setShowLeftSheet(false);
    setShowRightSheet(false);
  };
  const resetEditor = () => {
    setEditingId(null);
    setFrameName("New Frame");
    setCategory("cute");
    setFrameImageUrl(null);
    setSlots([]);
    setSelectedSlotId(null);
  };

  const handleDelete = async (frame: FrameConfig) => {
    setConfirmDelete(null);
    setDeletingId(frame.id);
    try {
      const res = await fetch(`/api/frames/${frame.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", `Frame "${frame.name}" dihapus.`);
      if (editingId === frame.id) resetEditor();
      await fetchFrames();
    } catch {
      showToast("error", "Gagal menghapus frame.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Scale calculation ──
  useEffect(() => {
    const update = () => {
      const headerH = 52;
      const bottomBarH = isMobileOrTablet ? 56 : 0;
      const sidebarW = isMobileOrTablet ? 0 : bp === "desktop" ? 260 : 220;
      const rightW =
        !isMobileOrTablet && selectedSlotId && !isPreview ? 220 : 0;
      const availH = window.innerHeight - headerH - bottomBarH - 48;
      const availW = window.innerWidth - sidebarW - rightW - 48;
      setScale(
        Math.min(1, availH / canvasSize.height, availW / canvasSize.width),
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [canvasSize, bp, isMobileOrTablet, selectedSlotId, isPreview]);

  // ── Drag ──
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const {
        type,
        slotId,
        startX,
        startY,
        startSlotX,
        startSlotY,
        startSlotW,
        startSlotH,
      } = dragRef.current;
      const dx = (e.clientX - startX) / scale,
        dy = (e.clientY - startY) / scale;
      setSlots((prev) =>
        prev.map((s) => {
          if (s.id !== slotId) return s;
          return type === "move"
            ? {
                ...s,
                x: Math.max(
                  0,
                  Math.min(canvasSize.width - s.width, startSlotX + dx),
                ),
                y: Math.max(
                  0,
                  Math.min(canvasSize.height - s.height, startSlotY + dy),
                ),
              }
            : {
                ...s,
                width: Math.max(60, startSlotW + dx),
                height: Math.max(40, startSlotH + dy),
              };
        }),
      );
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
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
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setFrameImageUrl(url);
      const img = new window.Image();
      img.onload = () =>
        setCanvasSize({ width: img.width, height: img.height });
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const addSlot = () => {
    const s: PhotoSlot = {
      id: Math.random().toString(36).substr(2, 9),
      x: 50,
      y: slots.length * 200 + 50,
      width: 500,
      height: 380,
      order: slots.length + 1,
    };
    setSlots([...slots, s]);
    setSelectedSlotId(s.id);
  };
  const duplicateSlot = (id: string) => {
    const src = slots.find((s) => s.id === id);
    if (!src) return;
    const s: PhotoSlot = {
      ...src,
      id: Math.random().toString(36).substr(2, 9),
      x: src.x + 20,
      y: src.y + 20,
      order: slots.length + 1,
    };
    setSlots([...slots, s]);
    setSelectedSlotId(s.id);
  };
  const removeSlot = (id: string) => {
    setSlots(
      slots.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })),
    );
    if (selectedSlotId === id) setSelectedSlotId(null);
  };
  const updateSlotDirect = (id: string, updates: Partial<PhotoSlot>) =>
    setSlots(slots.map((s) => (s.id === id ? { ...s, ...updates } : s)));

  const handleSave = async () => {
    if (!frameImageUrl || slots.length === 0) return;
    setIsSaving(true);
    try {
      const frame: FrameConfig = {
        id: editingId ?? `custom-${Date.now()}`,
        name: frameName,
        category,
        imageUrl: frameImageUrl,
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
        slots,
      };
      await addCustomFrame(frame);
      showToast("success", "Frame berhasil disimpan!");
      await fetchFrames();
      if (!editingId) setEditingId(frame.id);
    } catch {
      showToast("error", "Gagal menyimpan frame.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ name: frameName, canvas: canvasSize, slots }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${frameName.toLowerCase().replace(/\s+/g, "-")}-config.json`;
    a.click();
  };

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  // shared left panel props
  const leftPanelProps = {
    frameName,
    setFrameName,
    category,
    setCategory,
    frameImageUrl,
    canvasSize,
    handleFileUpload,
    slots,
    selectedSlotId,
    setSelectedSlotId,
    addSlot,
    duplicateSlot,
    removeSlot,
    savedFrames,
    isLoadingFrames,
    editingId,
    loadFrame,
    setConfirmDelete,
    deletingId,
    resetEditor,
  };

  const rightPanelProps = {
    selectedSlot,
    updateSlotDirect,
    duplicateSlot,
    removeSlot,
  };

  return (
    <div
      className="flex flex-col"
      style={{ height: "100dvh", background: "#0c0a09", overflow: "hidden" }}
    >
      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-2xl"
            style={{
              background:
                toast.type === "success"
                  ? "rgba(26,17,9,0.95)"
                  : "rgba(26,8,12,0.95)",
              border:
                toast.type === "success"
                  ? "1px solid rgba(212,172,94,0.3)"
                  : "1px solid rgba(244,63,94,0.3)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle2
                style={{ width: 16, height: 16, color: "#d4ac5e" }}
              />
            ) : (
              <AlertTriangle
                style={{
                  width: 16,
                  height: 16,
                  color: "rgba(244,100,120,0.9)",
                }}
              />
            )}
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                fontWeight: "bold",
                color:
                  toast.type === "success"
                    ? "rgba(245,228,176,0.9)"
                    : "rgba(244,150,160,0.9)",
              }}
            >
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONFIRM DELETE ── */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(8px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm p-6 space-y-4"
              style={{
                borderRadius: 20,
                background: "rgba(18,12,6,0.97)",
                border: "1px solid rgba(212,172,94,0.15)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl"
                style={{
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <Trash2
                  style={{
                    width: 20,
                    height: 20,
                    color: "rgba(244,100,120,0.8)",
                  }}
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
                  Hapus Frame?
                </h3>
                <p
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 11,
                    color: "rgba(212,172,94,0.4)",
                    marginTop: 4,
                  }}
                >
                  Frame{" "}
                  <strong style={{ color: "rgba(212,172,94,0.7)" }}>
                    "{confirmDelete.name}"
                  </strong>{" "}
                  akan dihapus permanen.
                </p>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95"
                  style={btnDark}
                >
                  BATAL
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-[2] py-2.5 rounded-xl cursor-pointer transition-all active:scale-95"
                  style={btnRose}
                >
                  YA, HAPUS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      {/* On mobile: z-10 so admin sidebar drawer (z-40/z-50) renders on top */}
      <header
        className="relative flex items-center justify-between px-3 sm:px-5 flex-shrink-0"
        style={{
          height: 52,
          zIndex: isMobile ? 10 : 50,
          background: "rgba(14,10,5,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212,172,94,0.1)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "rgba(212,172,94,0.08)",
              border: "1px solid rgba(212,172,94,0.2)",
            }}
          >
            <Clapperboard
              style={{ width: 15, height: 15, color: "rgba(212,172,94,0.7)" }}
            />
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 8,
                letterSpacing: "0.2em",
                color: "rgba(212,172,94,0.35)",
                textTransform: "uppercase",
              }}
            >
              Lumière Booth
            </p>
            <h1
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: 14,
                fontWeight: 900,
                background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}
            >
              Frame Editor
            </h1>
          </div>
          {editingId && (
            <span
              style={{
                background: "rgba(212,172,94,0.1)",
                border: "1px solid rgba(212,172,94,0.2)",
                color: "rgba(212,172,94,0.6)",
                fontFamily: "'Courier New', monospace",
                fontSize: 8,
                fontWeight: "bold",
                letterSpacing: "0.1em",
                padding: "2px 8px",
                borderRadius: 6,
              }}
            >
              EDITING
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile: left panel toggle */}
          {isMobileOrTablet && (
            <button
              onClick={() => setShowLeftSheet(true)}
              className="flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              style={{ width: 32, height: 32, borderRadius: 8, ...btnDark }}
            >
              <Layers style={{ width: 14, height: 14 }} />
            </button>
          )}

          {/* Mobile: properties toggle (only when slot selected) */}
          {isMobileOrTablet && selectedSlot && !isPreview && (
            <button
              onClick={() => setShowRightSheet(true)}
              className="flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(212,172,94,0.1)",
                border: "1px solid rgba(212,172,94,0.3)",
                color: "rgba(212,172,94,0.7)",
              }}
            >
              <SlidersHorizontal style={{ width: 14, height: 14 }} />
            </button>
          )}

          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 transition-all"
            style={
              isPreview
                ? {
                    background: "rgba(212,172,94,0.15)",
                    border: "1px solid rgba(212,172,94,0.4)",
                    color: "rgba(212,172,94,0.9)",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    fontWeight: "bold",
                    letterSpacing: "0.1em",
                  }
                : btnDark
            }
          >
            <Eye style={{ width: 14, height: 14 }} />
            <span className="hidden sm:inline">
              {isPreview ? "EDIT" : "PREVIEW"}
            </span>
          </button>

          <button
            onClick={handleExport}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 transition-all"
            style={btnDark}
          >
            <Download style={{ width: 14, height: 14 }} /> <span>JSON</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!frameImageUrl || slots.length === 0 || isSaving}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 transition-all disabled:opacity-40"
            style={btnGold}
          >
            {isSaving ? (
              <Loader2
                style={{ width: 14, height: 14 }}
                className="animate-spin"
              />
            ) : (
              <Save style={{ width: 14, height: 14 }} />
            )}
            <span className="hidden sm:inline">
              {isSaving ? "MENYIMPAN…" : "SIMPAN"}
            </span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          BODY
      ══════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── DESKTOP LEFT SIDEBAR ── */}
        {!isMobileOrTablet && (
          <aside
            className="flex flex-col flex-shrink-0 overflow-hidden"
            style={{
              width: bp === "desktop" ? 260 : 220,
              borderRight: "1px solid rgba(212,172,94,0.08)",
            }}
          >
            <LeftPanelContent {...leftPanelProps} />
          </aside>
        )}

        {/* ── CANVAS ── */}
        <section
          className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6 md:p-8"
          style={{ background: "rgba(8,6,3,0.7)" }}
        >
          {frameImageUrl ? (
            <div
              style={{
                width: canvasSize.width * scale,
                height: canvasSize.height * scale,
                flexShrink: 0,
                position: "relative",
                boxShadow:
                  "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,172,94,0.1)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: 2,
                  boxShadow: "0 0 40px rgba(212,172,94,0.06)",
                  pointerEvents: "none",
                  zIndex: 30,
                }}
              />
              <Image
                src={frameImageUrl}
                alt="Frame"
                fill
                className="object-fill pointer-events-none"
                style={{ position: "absolute", zIndex: 10 }}
              />
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
                    border: isPreview
                      ? "none"
                      : selectedSlotId === slot.id
                        ? "2px solid rgba(212,172,94,0.8)"
                        : "2px solid rgba(212,172,94,0.3)",
                    background: isPreview
                      ? "rgba(212,172,94,0.08)"
                      : selectedSlotId === slot.id
                        ? "rgba(212,172,94,0.07)"
                        : "rgba(212,172,94,0.03)",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                >
                  {!isPreview && (
                    <div
                      className="absolute flex items-center justify-center"
                      style={{
                        top: -18,
                        left: -1,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #d4ac5e, #c49a3a)",
                        zIndex: 30,
                        pointerEvents: "none",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 8,
                          fontWeight: "bold",
                          color: "#0c0a09",
                        }}
                      >
                        {slot.order}
                      </span>
                    </div>
                  )}
                  {!isPreview && (
                    <>
                      <div
                        className="absolute inset-0 flex items-center justify-center cursor-move"
                        onMouseDown={(e) => startDrag(e, slot.id, "move")}
                      >
                        <Move
                          style={{
                            width: 20,
                            height: 20,
                            pointerEvents: "none",
                            color: "rgba(212,172,94,0.2)",
                          }}
                        />
                      </div>
                      <div
                        className="absolute bottom-0 right-0 flex items-center justify-center cursor-nwse-resize"
                        style={{
                          width: 16,
                          height: 16,
                          background: "rgba(212,172,94,0.8)",
                          borderRadius: "6px 0 0 0",
                          zIndex: 30,
                        }}
                        onMouseDown={(e) => startDrag(e, slot.id, "resize")}
                      >
                        <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1 7L7 1M4 7L7 4"
                            stroke="#0c0a09"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </>
                  )}
                  {isPreview && (
                    <div className="w-full h-full flex items-center justify-center select-none">
                      <span
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "rgba(212,172,94,0.2)",
                        }}
                      >
                        {slot.order}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div
                className="flex items-center justify-center mx-auto"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: "rgba(212,172,94,0.05)",
                  border: "1px solid rgba(212,172,94,0.12)",
                }}
              >
                <Grid3X3
                  style={{
                    width: 40,
                    height: 40,
                    color: "rgba(212,172,94,0.2)",
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11,
                  color: "rgba(212,172,94,0.3)",
                  letterSpacing: "0.05em",
                }}
              >
                {isMobileOrTablet
                  ? "Ketuk ikon panel untuk upload frame"
                  : "Upload frame PNG untuk mulai mengedit"}
              </p>
            </div>
          )}
        </section>

        {/* ── DESKTOP RIGHT PANEL ── */}
        {!isMobileOrTablet && selectedSlot && !isPreview && (
          <aside
            className="flex flex-col flex-shrink-0 overflow-y-auto no-scrollbar"
            style={{
              width: bp === "desktop" ? 220 : 200,
              borderLeft: "1px solid rgba(212,172,94,0.08)",
            }}
          >
            <RightPanelContent {...rightPanelProps} />
          </aside>
        )}
      </div>

      {/* ══════════════════════════════════════
          MOBILE BOTTOM FAB BAR
      ══════════════════════════════════════ */}
      {isMobileOrTablet && (
        <div
          className="flex items-center justify-between px-4 py-2 flex-shrink-0"
          style={{
            height: 56,
            background: "rgba(14,10,5,0.97)",
            borderTop: "1px solid rgba(212,172,94,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-2">
            {/* Slot count indicator */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(212,172,94,0.05)",
                border: "1px solid rgba(212,172,94,0.1)",
              }}
            >
              <Layers
                style={{ width: 12, height: 12, color: "rgba(212,172,94,0.4)" }}
              />
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10,
                  color: "rgba(212,172,94,0.4)",
                  fontWeight: "bold",
                }}
              >
                {slots.length} SLOT
              </span>
            </div>
            {/* Add slot shortcut */}
            <button
              onClick={addSlot}
              disabled={!frameImageUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 transition-all disabled:opacity-30"
              style={btnGold}
            >
              <Plus style={{ width: 12, height: 12 }} />
              <span>SLOT</span>
            </button>
          </div>
          {/* Export shortcut on mobile */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 transition-all"
            style={btnDark}
          >
            <Download style={{ width: 12, height: 12 }} />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════
          MOBILE BOTTOM SHEETS
      ══════════════════════════════════════ */}
      <BottomSheet
        open={showLeftSheet}
        onClose={() => setShowLeftSheet(false)}
        title="Panel"
      >
        <div className="px-0 py-0">
          <LeftPanelContent
            {...leftPanelProps}
            onClose={() => setShowLeftSheet(false)}
          />
        </div>
      </BottomSheet>

      <BottomSheet
        open={showRightSheet}
        onClose={() => setShowRightSheet(false)}
        title="Properties"
      >
        <div className="px-5 py-4">
          <RightPanelContent
            {...rightPanelProps}
            onClose={() => setShowRightSheet(false)}
          />
        </div>
      </BottomSheet>

      {/* ── TIPS BAR (only on desktop when no frame) ── */}
      {!frameImageUrl && !isMobileOrTablet && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2.5 z-50"
          style={{
            borderRadius: 100,
            background: "rgba(14,10,5,0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(212,172,94,0.15)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <Maximize2
            style={{ width: 14, height: 14, color: "rgba(212,172,94,0.5)" }}
          />
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              color: "rgba(212,172,94,0.45)",
              letterSpacing: "0.05em",
            }}
          >
            Tips: Gunakan frame PNG transparan ukuran 600×1800px
          </span>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { -webkit-font-smoothing: antialiased; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        select option { background: #1a1109; color: rgba(245,228,176,0.8); }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `,
        }}
      />
    </div>
  );
}
