"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { usePhoto } from "@/lib/PhotoContext";
import Image from "next/image";

// ── Floating dust (sama dengan welcome & frame page) ──
const GRAINS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 5,
  opacity: Math.random() * 0.18 + 0.04,
}));

function MobileFramePreview({
  selectedFrame,
  session,
  currentSlotIndex,
  removePhoto,
}: {
  selectedFrame: any;
  session: any;
  currentSlotIndex: number;
  removePhoto: (i: number) => void;
}) {
  const isPortraitFrame =
    selectedFrame.canvasHeight > selectedFrame.canvasWidth;
  return (
    <div
      className="relative shadow-2xl mx-auto"
      style={{
        aspectRatio: `${selectedFrame.canvasWidth} / ${selectedFrame.canvasHeight}`,
        maxWidth: "100%",
        maxHeight: "100%",
        width: isPortraitFrame ? "auto" : "100%",
        height: isPortraitFrame ? "100%" : "auto",
        background: "#0c0a09",
        border: "1px solid rgba(212,172,94,0.2)",
        borderRadius: "4px",
      }}
    >
      {selectedFrame.slots.map((slot: any, i: number) => {
        const photo = session.photos[i];
        return (
          <div
            key={slot.id || i}
            className="absolute overflow-hidden transition-all duration-300"
            style={{
              left: `${(slot.x / selectedFrame.canvasWidth) * 100}%`,
              top: `${(slot.y / selectedFrame.canvasHeight) * 100}%`,
              width: `${(slot.width / selectedFrame.canvasWidth) * 100}%`,
              height: `${(slot.height / selectedFrame.canvasHeight) * 100}%`,
              backgroundColor: "#1a1109",
              outline:
                i === currentSlotIndex
                  ? "2px solid rgba(212,172,94,0.6)"
                  : "none",
              outlineOffset: "-2px",
            }}
          >
            {photo ? (
              <div className="relative w-full h-full group">
                <Image src={photo} alt="" fill className="object-cover" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
                  style={{ background: "rgba(12,10,7,0.65)" }}
                >
                  <button
                    onClick={() => removePhoto(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-transform cursor-pointer"
                    style={{
                      background: "rgba(212,172,94,0.9)",
                      color: "#0c0a09",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Ulang
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="font-bold tabular-nums"
                  style={{
                    color:
                      i === currentSlotIndex
                        ? "rgba(212,172,94,0.5)"
                        : "rgba(212,172,94,0.15)",
                    fontFamily: "'Courier New', monospace",
                    fontSize: "clamp(10px, 2vw, 14px)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        );
      })}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Image
          src={selectedFrame.imageUrl}
          alt="Frame"
          fill
          className="object-fill"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

export default function CameraPage() {
  const router = useRouter();
  const { selectedFrame, session, addPhoto, removePhoto } = usePhoto();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const currentSlotIndex = session.photos.findIndex((p) => p === null);
  const allPhotosTaken =
    session.photos.length > 0 && session.photos.every((p) => p !== null);
  const photosTaken = session.photos.filter(Boolean).length;
  const totalPhotos = session.photos.length;

  useEffect(() => {
    if (!selectedFrame) {
      router.push("/frames");
      return;
    }
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch {
        alert("Gagal mengakses kamera.");
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [selectedFrame, router]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || currentSlotIndex === -1)
      return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    addPhoto(currentSlotIndex, canvas.toDataURL("image/png"));
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  }, [currentSlotIndex, addPhoto]);

  const startCountdown = useCallback(
    (slotIndex: number) => {
      if (slotIndex === -1) return;
      setIsCapturing(true);
      setCountdown(5);
      let current = 5;
      const interval = setInterval(() => {
        current -= 1;
        if (current === 0) {
          clearInterval(interval);
          setCountdown(null);
          capturePhoto();
          setIsCapturing(false);
        } else setCountdown(current);
      }, 1000);
    },
    [capturePhoto],
  );

  useEffect(() => {
    if (!hasStarted) return;
    if (
      !isCapturing &&
      !allPhotosTaken &&
      currentSlotIndex !== -1 &&
      isCameraReady
    ) {
      const t = setTimeout(() => startCountdown(currentSlotIndex), 1000);
      return () => clearTimeout(t);
    }
  }, [
    currentSlotIndex,
    isCapturing,
    allPhotosTaken,
    isCameraReady,
    hasStarted,
    startCountdown,
  ]);

  if (!selectedFrame) return null;

  return (
    <main
      className="relative h-[100dvh] w-full overflow-hidden font-sans"
      style={{ background: "#0c0a09" }}
    >
      {/* ── BACKGROUND (identik welcome & frame page) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, #1c1108 0%, #0c0a09 70%)",
        }}
      />
      <div
        className="absolute -top-20 -left-20 w-[40vw] h-[40vw] max-w-[350px] max-h-[350px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,172,94,0.09) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute -bottom-10 -right-10 w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 70%)",
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
      {/* Dust particles */}
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
      <div
        className="absolute top-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden z-20"
        style={{ height: "32px" }}
      >
        <div
          className="w-3 h-full shrink-0"
          style={{ background: "#1a1109" }}
        />
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
                      : "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(212,172,94,0.09)",
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="w-3 h-full shrink-0"
          style={{ background: "#1a1109" }}
        />
      </div>

      {/* ── FILMSTRIP BOTTOM ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden z-20"
        style={{ height: "32px" }}
      >
        <div
          className="w-3 h-full shrink-0"
          style={{ background: "#1a1109" }}
        />
        <div className="flex flex-1 h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-center justify-center">
              <div
                className="w-[60%] rounded-sm"
                style={{
                  height: "55%",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="w-3 h-full shrink-0"
          style={{ background: "#1a1109" }}
        />
      </div>

      {/* ── CORNER ORNAMENTS ── */}
      {[
        "top-9 left-4",
        "top-9 right-4 rotate-90",
        "bottom-9 left-4 -rotate-90",
        "bottom-9 right-4 rotate-180",
      ].map((pos, i) => (
        <svg
          key={i}
          className={`absolute w-5 h-5 pointer-events-none z-20 ${pos}`}
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

      {/* ── MAIN LAYOUT ── */}
      <div
        className="relative z-10 h-full w-full flex flex-col [@media(orientation:landscape)]:flex-row gap-2 p-2 max-w-[1600px] mx-auto"
        style={{ paddingTop: "36px", paddingBottom: "36px" }}
      >
        {/* ════════════════════════════════════════
            KAMERA
        ════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-2xl flex-1 min-h-0 min-w-0 shadow-2xl">
          {/* Subtle gold border */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-30"
            style={{ border: "1px solid rgba(212,172,94,0.15)" }}
          />

          {/* Tombol Kembali */}
          <button
            onClick={() => router.push("/frames")}
            className="cursor-pointer absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:scale-95 transition-all text-sm font-bold"
            style={{
              background: "rgba(12,10,7,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(212,172,94,0.2)",
              color: "rgba(212,172,94,0.9)",
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              letterSpacing: "0.05em",
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            KEMBALI
          </button>

          {/* Dot progress (portrait only) */}
          <div className="absolute top-3 right-3 z-30 flex gap-1.5 [@media(orientation:landscape)]:hidden">
            {session.photos.map((photo, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: photo
                    ? "#d4ac5e"
                    : i === currentSlotIndex
                      ? "rgba(212,172,94,0.5)"
                      : "rgba(212,172,94,0.15)",
                  border: "1px solid rgba(212,172,94,0.3)",
                  boxShadow: photo ? "0 0 6px rgba(212,172,94,0.4)" : "none",
                  animation:
                    i === currentSlotIndex && !photo
                      ? "pulse 1.5s infinite"
                      : "none",
                }}
              />
            ))}
          </div>

          {/* ISO badge — estetik kamera analog */}
          <div
            className="absolute bottom-20 left-3 z-30 hidden [@media(orientation:landscape)]:block"
            style={{
              padding: "2px 8px",
              background: "rgba(12,10,7,0.6)",
              border: "1px solid rgba(212,172,94,0.15)",
              borderRadius: "6px",
              color: "rgba(212,172,94,0.35)",
              fontFamily: "'Courier New', monospace",
              fontSize: "8px",
              letterSpacing: "0.2em",
            }}
          >
            ISO 400 · AUTO
          </div>

          {/* Video */}
          <div className="absolute inset-0 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-700 ${isCameraReady ? "opacity-100" : "opacity-0"}`}
            />
            {/* Vignette overlay on video */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)",
              }}
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "linear",
                  }}
                  className="w-8 h-8 rounded-full border-2 border-t-transparent"
                  style={{
                    borderColor: "rgba(212,172,94,0.5)",
                    borderTopColor: "transparent",
                  }}
                />
                <p
                  className="text-xs tracking-widest uppercase"
                  style={{
                    color: "rgba(212,172,94,0.4)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  Menyiapkan kamera…
                </p>
              </div>
            )}
          </div>

          {/* Flash */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] pointer-events-none"
                style={{ background: "rgba(245,228,176,0.95)" }}
              />
            )}

            {/* Countdown */}
            {countdown !== null && (
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "clamp(72px, 15vw, 120px)",
                    height: "clamp(72px, 15vw, 120px)",
                    borderRadius: "20px",
                    background: "rgba(12,10,7,0.7)",
                    border: "1.5px solid rgba(212,172,94,0.35)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 40px rgba(212,172,94,0.15)",
                  }}
                >
                  <span
                    className="font-black tabular-nums leading-none"
                    style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: "clamp(36px, 8vw, 72px)",
                      background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {countdown}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tombol Capture / Lanjutkan */}
          <div className="absolute bottom-5 left-0 right-0 z-30 flex justify-center">
            {!allPhotosTaken ? (
              !hasStarted && (
                <button
                  onClick={() => {
                    setHasStarted(true);
                    startCountdown(currentSlotIndex);
                  }}
                  disabled={isCapturing}
                  className="cursor-pointer active:scale-90 transition-transform flex items-center justify-center disabled:opacity-40"
                  style={{
                    width: "clamp(52px, 12vw, 68px)",
                    height: "clamp(52px, 12vw, 68px)",
                    borderRadius: "16px",
                    background: "rgba(12,10,7,0.5)",
                    border: "2px solid rgba(212,172,94,0.5)",
                    backdropFilter: "blur(8px)",
                    boxShadow:
                      "0 0 20px rgba(212,172,94,0.15), inset 0 0 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Inner circle — kamera analog shutter */}
                  <div
                    style={{
                      width: "60%",
                      height: "60%",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #d4ac5e, #c49a3a)",
                      boxShadow: "0 2px 8px rgba(212,172,94,0.3)",
                    }}
                  />
                </button>
              )
            ) : (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => router.push("/result")}
                className="flex items-center gap-2 rounded-2xl font-bold active:scale-95 transition-all cursor-pointer"
                style={{
                  padding: "12px 28px",
                  background:
                    "linear-gradient(135deg, rgba(212,172,94,0.9), rgba(196,154,58,0.9))",
                  border: "1px solid rgba(212,172,94,0.5)",
                  color: "#0c0a09",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  boxShadow: "0 8px 24px rgba(212,172,94,0.25)",
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                LANJUT KE HASIL ✦
              </motion.button>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════
            PREVIEW PANEL
        ════════════════════════════════════════ */}
        <div
          className={[
            "flex flex-col overflow-hidden rounded-2xl shadow-xl shrink-0",
            /* Portrait: panel bawah */
            "[@media(orientation:portrait)]:h-[40%]",
            /* Landscape mobile */
            "[@media(max-width:767px)_and_(orientation:landscape)]:w-[36%]",
            /* Landscape tablet */
            "[@media(min-width:768px)_and_(max-width:1023px)_and_(orientation:landscape)]:w-[320px]",
            /* Landscape desktop */
            "[@media(min-width:1024px)_and_(orientation:landscape)]:w-[360px]",
            "[@media(min-width:1280px)_and_(orientation:landscape)]:w-[420px]",
          ].join(" ")}
          style={{
            background: "rgba(22,15,8,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212,172,94,0.15)",
          }}
        >
          {/* Header Panel */}
          <div
            className="shrink-0 px-4 py-3 md:px-5 md:py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(212,172,94,0.1)" }}
          >
            <div>
              <p
                className="text-[8px] md:text-[9px] font-bold tracking-[0.25em] uppercase"
                style={{
                  color: "rgba(212,172,94,0.45)",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                Live Preview
              </p>
              <h2
                className="font-black leading-tight truncate mt-0.5"
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "clamp(12px, 2.5vw, 16px)",
                  background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  maxWidth: "160px",
                }}
              >
                {selectedFrame.name}
              </h2>
            </div>

            {/* Slot indicator dots */}
            <div className="flex gap-1.5">
              {session.photos.map((photo, i) => (
                <div
                  key={i}
                  className="transition-all duration-500"
                  style={{
                    width: "20px",
                    height: "6px",
                    borderRadius: "3px",
                    background: photo
                      ? "linear-gradient(135deg, #d4ac5e, #c49a3a)"
                      : i === currentSlotIndex
                        ? "rgba(212,172,94,0.3)"
                        : "rgba(212,172,94,0.08)",
                    border: "1px solid rgba(212,172,94,0.2)",
                    boxShadow: photo ? "0 0 6px rgba(212,172,94,0.3)" : "none",
                    animation:
                      i === currentSlotIndex && !photo
                        ? "pulse 1.5s infinite"
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Frame preview area */}
          <div
            className="flex-1 min-h-0 flex items-center justify-center overflow-hidden"
            style={{
              padding: "clamp(8px, 2vw, 20px)",
              background: "rgba(12,10,7,0.3)",
            }}
          >
            <MobileFramePreview
              selectedFrame={selectedFrame}
              session={session}
              currentSlotIndex={currentSlotIndex}
              removePhoto={removePhoto}
            />
          </div>

          {/* Footer Progress */}
          <div
            className="shrink-0 px-4 py-3 md:px-5"
            style={{ borderTop: "1px solid rgba(212,172,94,0.08)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[9px] md:text-[10px] font-bold"
                style={{
                  color: "rgba(212,172,94,0.4)",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {photosTaken} / {totalPhotos} FRAME
              </span>
              {photosTaken > 0 && (
                <span
                  className="text-[8px]"
                  style={{
                    color: "rgba(212,172,94,0.25)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  ✦ {Math.round((photosTaken / totalPhotos) * 100)}%
                </span>
              )}
            </div>
            <div className="flex gap-1 md:gap-1.5">
              {session.photos.map((photo, i) => (
                <div
                  key={i}
                  className="flex-1 transition-all duration-500"
                  style={{
                    height: "3px",
                    borderRadius: "2px",
                    background: photo
                      ? "linear-gradient(to right, #d4ac5e, #c49a3a)"
                      : i === currentSlotIndex
                        ? "rgba(212,172,94,0.25)"
                        : "rgba(212,172,94,0.07)",
                    boxShadow: photo ? "0 0 6px rgba(212,172,94,0.25)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { -webkit-font-smoothing: antialiased; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `,
        }}
      />
    </main>
  );
}
