"use client";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState, useRef } from "react";

// Floating film grain particles
const GRAIN_COUNT = 18;
const grains = Array.from({ length: GRAIN_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 5,
  opacity: Math.random() * 0.25 + 0.05,
}));

// Filmstrip frames decoration
const FILM_FRAMES = 7;

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const [hoveringBtn, setHoveringBtn] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-4, 4]);

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "#0c0a09" }}
    >
      {/* ── BACKGROUND LAYERS ── */}

      {/* Warm vignette gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, #1c1108 0%, #0c0a09 70%)",
        }}
      />

      {/* Gold light leak top-left */}
      <div
        className="absolute -top-20 -left-20 w-[55vw] h-[55vw] max-w-[500px] max-h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,172,94,0.13) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Pink light leak bottom-right */}
      <div
        className="absolute -bottom-10 -right-10 w-[45vw] h-[45vw] max-w-[420px] max-h-[420px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(244,63,94,0.10) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />

      {/* Floating dust particles */}
      {mounted &&
        grains.map((g) => (
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
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
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

      {/* ── FILMSTRIP DECORATION — TOP ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden h-10 md:h-12">
        {/* Left edge */}
        <div className="w-3 md:w-4 h-full bg-[#1a1109] shrink-0" />
        {/* Frames */}
        <div className="flex flex-1 h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center justify-center">
              <div
                className="w-[60%] rounded-sm"
                style={{
                  height: "55%",
                  background:
                    i % 3 === 0
                      ? "rgba(212,172,94,0.07)"
                      : "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(212,172,94,0.12)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="w-3 md:w-4 h-full bg-[#1a1109] shrink-0" />
      </div>

      {/* ── FILMSTRIP DECORATION — BOTTOM ── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden h-10 md:h-12">
        <div className="w-3 md:w-4 h-full bg-[#1a1109] shrink-0" />
        <div className="flex flex-1 h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-center justify-center">
              <div
                className="w-[60%] rounded-sm"
                style={{
                  height: "55%",
                  background:
                    i % 4 === 1
                      ? "rgba(244,63,94,0.07)"
                      : "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="w-3 md:w-4 h-full bg-[#1a1109] shrink-0" />
      </div>

      {/* ── LEFT VERTICAL FILMSTRIP ── */}
      <div className="absolute left-0 top-10 bottom-10 md:top-12 md:bottom-12 w-8 md:w-10 flex flex-col items-center pointer-events-none overflow-hidden">
        <div className="w-full h-2 bg-[#1a1109]" />
        <div className="flex-1 flex flex-col w-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center justify-center">
              <div
                className="h-[60%] rounded-sm"
                style={{
                  width: "55%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-[#1a1109]" />
      </div>

      {/* ── RIGHT VERTICAL FILMSTRIP ── */}
      <div className="absolute right-0 top-10 bottom-10 md:top-12 md:bottom-12 w-8 md:w-10 flex flex-col items-center pointer-events-none overflow-hidden">
        <div className="w-full h-2 bg-[#1a1109]" />
        <div className="flex-1 flex flex-col w-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center justify-center">
              <div
                className="h-[60%] rounded-sm"
                style={{
                  width: "55%",
                  background:
                    i % 5 === 2
                      ? "rgba(212,172,94,0.06)"
                      : "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-[#1a1109]" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 md:px-16 lg:px-24 py-14 md:py-16 text-center">
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex items-center gap-3 mb-6 md:mb-8"
        >
          <div
            className="h-px flex-1 max-w-[60px] md:max-w-[80px]"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(212,172,94,0.6))",
            }}
          />
          <span
            className="text-[9px] md:text-[10px] font-bold tracking-[0.25em] uppercase"
            style={{
              color: "rgba(212,172,94,0.8)",
              fontFamily: "'Courier New', monospace",
            }}
          >
            Est. 2026 · Akronym Studio
          </span>
          <div
            className="h-px flex-1 max-w-[60px] md:max-w-[80px]"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(212,172,94,0.6))",
            }}
          />
        </motion.div>

        {/* ── LOGO KAMERA — 3D tilt on hover ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.2,
            type: "spring",
            stiffness: 120,
          }}
          style={{ rotateX, rotateY, perspective: 800 }}
          className="mb-6 md:mb-8 lg:mb-10"
        >
          {/* Camera body */}
          <div
            className="relative inline-flex flex-col items-center"
            style={{ filter: "drop-shadow(0 20px 40px rgba(212,172,94,0.2))" }}
          >
            {/* Camera main body */}
            <div
              className="relative w-28 h-20 md:w-36 md:h-24 lg:w-44 lg:h-28 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, #2a2015, #1a1309)",
                border: "1.5px solid rgba(212,172,94,0.25)",
                boxShadow:
                  "inset 0 1px 0 rgba(212,172,94,0.1), 0 8px 32px rgba(0,0,0,0.6)",
              }}
            >
              {/* Lens */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="relative"
              >
                <div
                  className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #0d0a07, #1a1208, #2a1e0d, #0d0a07)",
                    border: "2px solid rgba(212,172,94,0.4)",
                    boxShadow:
                      "0 0 0 4px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.8)",
                  }}
                >
                  <div
                    className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 35% 35%, rgba(212,172,94,0.3), rgba(244,63,94,0.1), #050302)",
                      boxShadow: "inset 0 0 8px rgba(0,0,0,0.9)",
                    }}
                  />
                </div>
              </motion.div>

              {/* Flash indicator */}
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
                className="absolute top-2.5 right-3 md:top-3 md:right-4 w-2 h-2 rounded-full"
                style={{
                  background: "#d4ac5e",
                  boxShadow: "0 0 8px rgba(212,172,94,0.8)",
                }}
              />

              {/* Shutter button */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 md:w-6 md:h-3.5 rounded-t-md"
                style={{
                  background: "linear-gradient(to bottom, #3a2a12, #1a1208)",
                  border: "1px solid rgba(212,172,94,0.2)",
                }}
              />

              {/* Viewfinder */}
              <div
                className="absolute top-2.5 left-3 md:top-3 md:left-4 w-5 h-3.5 md:w-6 md:h-4 rounded-sm"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(212,172,94,0.2)",
                }}
              />
            </div>

            {/* Camera bottom strap lug */}
            <div
              className="w-20 md:w-28 lg:w-32 h-1.5 rounded-b-lg"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(212,172,94,0.15), transparent)",
              }}
            />
          </div>
        </motion.div>

        {/* ── BRAND NAME ── */}
        <div className="overflow-hidden mb-1 md:mb-2">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[8vw] xl:text-[7vw] leading-none font-black tracking-tighter"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              background:
                "linear-gradient(135deg, #d4ac5e 0%, #f5e4b0 40%, #c49a3a 70%, #d4ac5e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              letterSpacing: "-0.03em",
            }}
          >
            Lumière Booth
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-sm md:max-w-md mx-auto leading-relaxed mb-8 md:mb-10 lg:mb-12"
          style={{
            color: "rgba(245,228,176,0.55)",
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
          }}
        >
          Every frame tells a story worth keeping forever.
        </motion.p>

        {/* ── CTA BUTTON ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <Link href="/frames">
            <motion.button
              onHoverStart={() => setHoveringBtn(true)}
              onHoverEnd={() => setHoveringBtn(false)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative cursor-pointer overflow-hidden group"
              style={{
                padding: "clamp(14px, 3vw, 20px) clamp(36px, 8vw, 72px)",
                borderRadius: "100px",
                border: "1.5px solid rgba(212,172,94,0.5)",
                background:
                  "linear-gradient(135deg, rgba(212,172,94,0.15), rgba(212,172,94,0.05))",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: hoveringBtn ? "200%" : "-100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(212,172,94,0.2), transparent)",
                  transform: "skewX(-15deg)",
                }}
              />

              {/* Glow on hover */}
              <motion.div
                animate={{ opacity: hoveringBtn ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow:
                    "0 0 40px rgba(212,172,94,0.25), inset 0 0 30px rgba(212,172,94,0.05)",
                }}
              />

              <span
                className="relative z-10 font-bold tracking-[0.15em] uppercase"
                style={{
                  fontSize: "clamp(11px, 2.5vw, 14px)",
                  color: "#f5e4b0",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                ✦ &nbsp; Mulai Sesi Foto &nbsp; ✦
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* ── BOTTOM BADGES ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex items-center gap-4 md:gap-6 mt-8 md:mt-10 lg:mt-12"
        >
          {["Filter & Stiker", "Cetak Langsung", "Kirim ke Email"].map(
            (label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: "rgba(212,172,94,0.6)" }}
                />
                <span
                  className="text-[8px] sm:text-[9px] md:text-[10px] tracking-widest uppercase whitespace-nowrap"
                  style={{
                    color: "rgba(245,228,176,0.35)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {label}
                </span>
              </div>
            ),
          )}
        </motion.div>
      </div>

      {/* ── CORNER ORNAMENTS ── */}
      {[
        "top-12 left-10 md:top-14 md:left-12",
        "top-12 right-10 md:top-14 md:right-12 rotate-90",
        "bottom-12 left-10 md:bottom-14 md:left-12 -rotate-90",
        "bottom-12 right-10 md:bottom-14 md:right-12 rotate-180",
      ].map((pos, i) => (
        <motion.svg
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 + i * 0.05 }}
          className={`absolute w-6 h-6 md:w-8 md:h-8 pointer-events-none ${pos}`}
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M2 16 L2 2 L16 2"
            stroke="rgba(212,172,94,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.svg>
      ))}

      {/* ── FRAME NUMBER (aesthetic detail) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-12 md:bottom-14 left-0 right-0 flex justify-center pointer-events-none"
      >
        <span
          className="text-[8px] tracking-[0.3em]"
          style={{
            color: "rgba(212,172,94,0.2)",
            fontFamily: "'Courier New', monospace",
          }}
        >
          FRAME 001 ▸ ISO 400
        </span>
      </motion.div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { -webkit-font-smoothing: antialiased; }
        @media (orientation: landscape) and (max-height: 500px) {
          .landscape-compact { padding-top: 56px !important; padding-bottom: 56px !important; }
        }
      `,
        }}
      />
    </main>
  );
}
