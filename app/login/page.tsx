"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  LogIn,
  ChevronLeft,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Floating dust — identik semua halaman
const GRAINS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 5,
  opacity: Math.random() * 0.18 + 0.04,
}));

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email atau password salah. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }
    router.push("/admin/history");
    router.refresh();
  };

  return (
    <main
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden font-sans"
      style={{ background: "#0c0a09" }}
    >
      {/* ── BACKGROUND (identik semua halaman) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, #1c1108 0%, #0c0a09 70%)",
        }}
      />
      <div
        className="absolute -top-20 -left-20 pointer-events-none"
        style={{
          width: "45vw",
          height: "45vw",
          maxWidth: 380,
          maxHeight: 380,
          background:
            "radial-gradient(circle, rgba(212,172,94,0.11) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute -bottom-10 -right-10 pointer-events-none"
        style={{
          width: "35vw",
          height: "35vw",
          maxWidth: 300,
          maxHeight: 300,
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
        className="absolute bottom-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden z-20"
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

      {/* ── MAIN CONTENT ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full px-4"
        style={{ maxWidth: 420, paddingTop: 48, paddingBottom: 48 }}
      >
        {/* ── BRAND HEADER ── */}
        <div className="text-center mb-8 md:mb-10">
          {/* Kamera icon — sama dengan welcome page */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              type: "spring",
              stiffness: 120,
            }}
            className="inline-flex flex-col items-center mb-5"
            style={{ filter: "drop-shadow(0 12px 24px rgba(212,172,94,0.15))" }}
          >
            {/* Camera body */}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 72,
                height: 52,
                borderRadius: 14,
                background: "linear-gradient(145deg, #2a2015, #1a1309)",
                border: "1.5px solid rgba(212,172,94,0.25)",
                boxShadow:
                  "inset 0 1px 0 rgba(212,172,94,0.1), 0 6px 20px rgba(0,0,0,0.5)",
              }}
            >
              {/* Lens */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background:
                      "conic-gradient(from 0deg, #0d0a07, #1a1208, #2a1e0d, #0d0a07)",
                    border: "2px solid rgba(212,172,94,0.35)",
                    boxShadow:
                      "0 0 0 3px rgba(0,0,0,0.4), inset 0 0 12px rgba(0,0,0,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 35% 35%, rgba(212,172,94,0.3), rgba(244,63,94,0.1), #050302)",
                    }}
                  />
                </div>
              </motion.div>
              {/* Flash LED */}
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 10,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#d4ac5e",
                  boxShadow: "0 0 6px rgba(212,172,94,0.8)",
                }}
              />
              {/* Viewfinder */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 10,
                  width: 14,
                  height: 9,
                  borderRadius: 2,
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(212,172,94,0.2)",
                }}
              />
              {/* Shutter button */}
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 14,
                  height: 8,
                  borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(to bottom, #3a2a12, #1a1208)",
                  border: "1px solid rgba(212,172,94,0.2)",
                }}
              />
            </div>
          </motion.div>

          {/* Divider label */}
          <div className="flex items-center gap-3 justify-center mb-3">
            <div
              style={{
                height: 1,
                width: 40,
                background:
                  "linear-gradient(to right, transparent, rgba(212,172,94,0.4))",
              }}
            />
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 8,
                fontWeight: "bold",
                letterSpacing: "0.25em",
                color: "rgba(212,172,94,0.45)",
              }}
            >
              ADMIN ACCESS
            </span>
            <div
              style={{
                height: 1,
                width: 40,
                background:
                  "linear-gradient(to left, transparent, rgba(212,172,94,0.4))",
              }}
            />
          </div>

          {/* Brand name */}
          <h1
            className="font-black leading-none tracking-tighter"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(28px, 8vw, 40px)",
              background:
                "linear-gradient(135deg, #d4ac5e 0%, #f5e4b0 40%, #c49a3a 70%, #d4ac5e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Lumière Booth
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              fontSize: 13,
              color: "rgba(245,228,176,0.35)",
            }}
          >
            Panel administrasi eksklusif.
          </p>
        </div>

        {/* ── FORM CARD ── */}
        <div
          className="relative"
          style={{
            borderRadius: 24,
            background: "rgba(22,14,7,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212,172,94,0.15)",
            boxShadow:
              "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,172,94,0.05)",
            padding: "clamp(24px, 5vw, 36px)",
          }}
        >
          {/* Card top accent line */}
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(212,172,94,0.3), transparent)",
            }}
          />

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 flex items-start gap-2.5"
              style={{
                borderRadius: 12,
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
              }}
            >
              <div
                style={{
                  width: 4,
                  height: "100%",
                  minHeight: 16,
                  borderRadius: 2,
                  background: "rgba(244,63,94,0.6)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11,
                  color: "rgba(244,100,120,0.9)",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div>
              <label
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 9,
                  fontWeight: "bold",
                  letterSpacing: "0.2em",
                  color: "rgba(212,172,94,0.45)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                  style={{
                    left: 14,
                    color: focusEmail
                      ? "rgba(212,172,94,0.7)"
                      : "rgba(212,172,94,0.25)",
                  }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusEmail(true)}
                  onBlur={() => setFocusEmail(false)}
                  placeholder="admin@lumièrebooth.com"
                  className="w-full outline-none transition-all"
                  style={{
                    paddingLeft: 40,
                    paddingRight: 16,
                    paddingTop: 13,
                    paddingBottom: 13,
                    borderRadius: 12,
                    background: focusEmail
                      ? "rgba(212,172,94,0.07)"
                      : "rgba(212,172,94,0.03)",
                    border: focusEmail
                      ? "1px solid rgba(212,172,94,0.4)"
                      : "1px solid rgba(212,172,94,0.12)",
                    color: "rgba(245,228,176,0.8)",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 13,
                    transition: "all 0.2s ease",
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 9,
                  fontWeight: "bold",
                  letterSpacing: "0.2em",
                  color: "rgba(212,172,94,0.45)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                  style={{
                    left: 14,
                    color: focusPass
                      ? "rgba(212,172,94,0.7)"
                      : "rgba(212,172,94,0.25)",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusPass(true)}
                  onBlur={() => setFocusPass(false)}
                  placeholder="••••••••"
                  className="w-full outline-none transition-all"
                  style={{
                    paddingLeft: 40,
                    paddingRight: 44,
                    paddingTop: 13,
                    paddingBottom: 13,
                    borderRadius: 12,
                    background: focusPass
                      ? "rgba(212,172,94,0.07)"
                      : "rgba(212,172,94,0.03)",
                    border: focusPass
                      ? "1px solid rgba(212,172,94,0.4)"
                      : "1px solid rgba(212,172,94,0.12)",
                    color: "rgba(245,228,176,0.8)",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 13,
                    transition: "all 0.2s ease",
                    letterSpacing: showPassword ? "normal" : "0.15em",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  style={{ right: 14, color: "rgba(212,172,94,0.3)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(212,172,94,0.7)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(212,172,94,0.3)")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:active:scale-100"
                style={{
                  padding: "14px 24px",
                  borderRadius: 14,
                  background: isLoading
                    ? "rgba(212,172,94,0.3)"
                    : "linear-gradient(135deg, rgba(212,172,94,0.95), rgba(196,154,58,0.9))",
                  border: "1px solid rgba(212,172,94,0.4)",
                  boxShadow: isLoading
                    ? "none"
                    : "0 8px 24px rgba(212,172,94,0.2)",
                  color: "#0c0a09",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 12,
                  fontWeight: "bold",
                  letterSpacing: "0.12em",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading)
                    e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    MEMPROSES…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    MASUK SEKARANG
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Card bottom accent line */}
          <div
            className="absolute bottom-0 left-8 right-8 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(212,172,94,0.1), transparent)",
            }}
          />
        </div>

        {/* Kembali */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            style={{
              color: "rgba(212,172,94,0.3)",
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              fontWeight: "bold",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(212,172,94,0.65)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(212,172,94,0.3)")
            }
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </button>
        </div>

        {/* Frame number detail */}
        <div className="flex justify-center mt-4">
          <span
            style={{
              color: "rgba(212,172,94,0.12)",
              fontFamily: "'Courier New', monospace",
              fontSize: 8,
              letterSpacing: "0.3em",
            }}
          >
            ADMIN PANEL · ISO 400
          </span>
        </div>
      </motion.div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { -webkit-font-smoothing: antialiased; }
        input::placeholder { color: rgba(212,172,94,0.2) !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(26,17,9,1) inset !important;
          -webkit-text-fill-color: rgba(245,228,176,0.8) !important;
          caret-color: rgba(212,172,94,0.8);
        }
      `,
        }}
      />
    </main>
  );
}
