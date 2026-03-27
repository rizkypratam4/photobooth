"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Edit3,
  UserLock,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const MENU_ITEMS = [
  { name: "User Management", path: "/admin/users", icon: UserLock },
  { name: "Gallery", path: "/admin/gallery", icon: History },
  { name: "Frame Editor", path: "/admin/editor", icon: Edit3 },
];

// ── Breakpoints ──
const BP = { tablet: 768, laptop: 1024, desktop: 1280 };

function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "laptop" | "desktop">(
    "desktop",
  );
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < BP.tablet) setBp("mobile");
      else if (w < BP.laptop) setBp("tablet");
      else if (w < BP.desktop) setBp("laptop");
      else setBp("desktop");
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return bp;
}

// ── Camera icon ──
function CameraMini({ size = 36 }: { size?: number }) {
  const h = Math.round(size * 0.72);
  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: h,
        borderRadius: 8,
        background: "linear-gradient(145deg, #2a2015, #1a1309)",
        border: "1px solid rgba(212,172,94,0.3)",
        boxShadow: "inset 0 1px 0 rgba(212,172,94,0.08)",
      }}
    >
      <div
        style={{
          width: size * 0.39,
          height: size * 0.39,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, #0d0a07, #1a1208, #2a1e0d, #0d0a07)",
          border: "1.5px solid rgba(212,172,94,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: size * 0.14,
            height: size * 0.14,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, rgba(212,172,94,0.3), #050302)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 4,
          right: 5,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#d4ac5e",
          boxShadow: "0 0 5px rgba(212,172,94,0.9)",
        }}
      />
    </div>
  );
}

// ── Sidebar inner content ──
function SidebarContent({
  expanded,
  pathname,
  handleLogout,
  isLoggingOut,
  onClose,
  size = "normal",
}: {
  expanded: boolean;
  pathname: string;
  handleLogout: () => void;
  isLoggingOut: boolean;
  onClose?: () => void;
  size?: "compact" | "normal" | "large";
}) {
  const iconSize = size === "compact" ? 14 : size === "large" ? 18 : 16;
  const fontSize = size === "compact" ? 10 : size === "large" ? 12 : 11;
  const camSize = size === "compact" ? 30 : size === "large" ? 42 : 36;
  const logoSize = size === "compact" ? 14 : size === "large" ? 18 : 16;

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ background: "rgba(14,10,5,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Left filmstrip accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(212,172,94,0.35), rgba(212,172,94,0.05), rgba(212,172,94,0.35))",
        }}
      />

      {/* ── Logo header ── */}
      <div
        className="flex items-center gap-3 px-4"
        style={{
          borderBottom: "1px solid rgba(212,172,94,0.1)",
          height: 52,
          flexShrink: 0,
        }}
      >
        <CameraMini size={camSize} />

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col overflow-hidden"
            >
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 7,
                  fontWeight: "bold",
                  letterSpacing: "0.22em",
                  color: "rgba(212,172,94,0.35)",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Admin Panel
              </p>
              <h2
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: logoSize,
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                }}
              >
                Lumière Booth
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto cursor-pointer p-1 rounded-lg transition-colors"
            style={{ color: "rgba(212,172,94,0.4)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(212,172,94,0.8)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(212,172,94,0.4)")
            }
          >
            <X style={{ width: iconSize, height: iconSize }} />
          </button>
        )}
      </div>

      {/* ── Section label ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 pt-4 pb-1"
          >
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 7,
                fontWeight: "bold",
                letterSpacing: "0.22em",
                color: "rgba(212,172,94,0.2)",
                textTransform: "uppercase",
              }}
            >
              Navigasi
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2.5 py-2 space-y-0.5">
        {MENU_ITEMS.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 rounded-xl transition-all relative group"
              style={{
                padding: expanded ? "10px 12px" : "10px",
                justifyContent: expanded ? "flex-start" : "center",
                background: isActive ? "rgba(212,172,94,0.1)" : "transparent",
                border: isActive
                  ? "1px solid rgba(212,172,94,0.2)"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(212,172,94,0.05)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Active pill */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "#d4ac5e" }}
                />
              )}

              {/* Icon */}
              <item.icon
                style={{
                  width: iconSize,
                  height: iconSize,
                  flexShrink: 0,
                  color: isActive ? "#d4ac5e" : "rgba(212,172,94,0.3)",
                  transition: "color 0.15s",
                }}
              />

              {/* Label */}
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: fontSize,
                      fontWeight: "bold",
                      letterSpacing: "0.04em",
                      color: isActive
                        ? "rgba(245,228,176,0.9)"
                        : "rgba(212,172,94,0.3)",
                      flex: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && expanded && (
                <ChevronRight
                  style={{
                    width: 12,
                    height: 12,
                    flexShrink: 0,
                    color: "rgba(212,172,94,0.4)",
                  }}
                />
              )}

              {/* Tooltip when collapsed */}
              {!expanded && (
                <div
                  className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                  style={{
                    background: "rgba(26,17,9,0.96)",
                    border: "1px solid rgba(212,172,94,0.2)",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    fontWeight: "bold",
                    color: "rgba(212,172,94,0.7)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Film aesthetic detail ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 py-2.5 flex justify-center"
            style={{ borderTop: "1px solid rgba(212,172,94,0.06)" }}
          >
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 7,
                letterSpacing: "0.28em",
                color: "rgba(212,172,94,0.1)",
              }}
            >
              ISO 400 · AUTO
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Logout ── */}
      <div
        className="px-2.5 pb-4 pt-2"
        style={{ borderTop: "1px solid rgba(212,172,94,0.08)" }}
      >
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 relative group"
          style={{
            padding: expanded ? "10px 12px" : "10px",
            justifyContent: expanded ? "flex-start" : "center",
            border: "1px solid transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(244,63,94,0.07)";
            e.currentTarget.style.borderColor = "rgba(244,63,94,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          {isLoggingOut ? (
            <Loader2
              style={{
                width: iconSize,
                height: iconSize,
                flexShrink: 0,
                color: "rgba(244,100,120,0.6)",
              }}
              className="animate-spin"
            />
          ) : (
            <LogOut
              style={{
                width: iconSize,
                height: iconSize,
                flexShrink: 0,
                color: "rgba(244,100,120,0.4)",
              }}
            />
          )}
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: fontSize,
                  fontWeight: "bold",
                  color: "rgba(244,100,120,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {isLoggingOut ? "KELUAR…" : "LOGOUT"}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip when collapsed */}
          {!expanded && (
            <div
              className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{
                background: "rgba(26,9,14,0.96)",
                border: "1px solid rgba(244,63,94,0.2)",
                fontFamily: "'Courier New', monospace",
                fontSize: 10,
                fontWeight: "bold",
                color: "rgba(244,100,120,0.7)",
                backdropFilter: "blur(12px)",
              }}
            >
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main layout ──
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const bp = useBreakpoint();

  // Desktop: expanded by default on laptop+, collapsed on tablet
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Auto-collapse on tablet, expand on laptop+
  useEffect(() => {
    if (bp === "tablet") setExpanded(false);
    if (bp === "laptop" || bp === "desktop") setExpanded(true);
    if (bp !== "mobile") setMobileOpen(false);
  }, [bp]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const isLaptop = bp === "laptop";
  const isDesktop = bp === "desktop";

  // Sidebar widths
  const sidebarWidth = expanded ? (isDesktop ? 240 : isLaptop ? 220 : 200) : 60;

  const sizeVariant = isDesktop ? "large" : isTablet ? "compact" : "normal";

  return (
    <div className="min-h-screen flex" style={{ background: "#0c0a09" }}>
      {/* ══════════════════════════════════════
          DESKTOP / TABLET SIDEBAR (md+)
      ══════════════════════════════════════ */}
      {!isMobile && (
        <>
          {/* Sidebar — overflow visible so toggle button is not clipped */}
          <aside
            className="hidden md:block fixed inset-y-0 left-0 z-50"
            style={{
              width: sidebarWidth,
              transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
              borderRight: "1px solid rgba(212,172,94,0.1)",
            }}
          >
            {/* Inner clip wrapper — content clips normally */}
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <SidebarContent
                expanded={expanded}
                pathname={pathname}
                handleLogout={handleLogout}
                isLoggingOut={isLoggingOut}
                size={sizeVariant}
              />
            </div>
          </aside>

          {/* Toggle chevron — fixed, positioned at sidebar right edge, z above sidebar */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="hidden md:flex fixed z-[60] items-center justify-center rounded-full cursor-pointer"
            style={{
              width: 22,
              height: 22,
              left: sidebarWidth - 11,
              top: 15,
              transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
              background: "#1c1208",
              border: "1px solid rgba(212,172,94,0.3)",
              color: "rgba(212,172,94,0.7)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2a1c0c";
              e.currentTarget.style.color = "rgba(212,172,94,1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1c1208";
              e.currentTarget.style.color = "rgba(212,172,94,0.7)";
            }}
          >
            {expanded ? (
              <ChevronLeft style={{ width: 11, height: 11 }} />
            ) : (
              <ChevronRight style={{ width: 11, height: 11 }} />
            )}
          </button>
        </>
      )}

      {/* ══════════════════════════════════════
          MOBILE TOPBAR
      ══════════════════════════════════════ */}
      {isMobile && (
        <div
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4"
          style={{
            height: 52,
            background: "rgba(14,10,5,0.97)",
            borderBottom: "1px solid rgba(212,172,94,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <CameraMini size={30} />
            <span
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: 15,
                fontWeight: 900,
                background: "linear-gradient(135deg, #d4ac5e, #f5e4b0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Lumière Booth
            </span>
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="cursor-pointer p-2 rounded-lg transition-colors"
            style={{ color: "rgba(212,172,94,0.6)" }}
          >
            {mobileOpen ? (
              <X style={{ width: 20, height: 20 }} />
            ) : (
              <Menu style={{ width: 20, height: 20 }} />
            )}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(4px)",
              }}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 overflow-hidden"
              style={{
                width: Math.min(280, window.innerWidth * 0.78),
                borderRight: "1px solid rgba(212,172,94,0.1)",
              }}
            >
              <SidebarContent
                expanded={true}
                pathname={pathname}
                handleLogout={handleLogout}
                isLoggingOut={isLoggingOut}
                onClose={() => setMobileOpen(false)}
                size="normal"
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main
        className="flex-1"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          marginTop: isMobile ? 52 : 0,
          height: "100dvh",
          overflow: "hidden",
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {children}
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,172,94,0.15); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,172,94,0.3); }
      `,
        }}
      />
    </div>
  );
}
