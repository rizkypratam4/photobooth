"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  X,
  Mail,
  User,
  Lock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Users,
  SlidersHorizontal,
} from "lucide-react";

// ─── Design Tokens — identical to GalleryPage ────────────────────────────────
const C = {
  bg: "#0c0a09",
  bgCard: "rgba(20,13,6,0.9)",
  bgPanel: "rgba(10,7,3,0.96)",
  bgInput: "rgba(212,172,94,0.03)",
  bgInputFocus: "rgba(212,172,94,0.07)",
  gold: "rgba(212,172,94,0.8)",
  goldDim: "rgba(212,172,94,0.35)",
  goldFaint: "rgba(212,172,94,0.08)",
  goldBorder: "rgba(212,172,94,0.4)",
  goldBorderMd: "rgba(212,172,94,0.18)",
  cream: "rgba(245,228,176,0.8)",
  creamDim: "rgba(245,228,176,0.5)",
  red: "rgba(244,63,94,0.1)",
  redBorder: "rgba(244,63,94,0.25)",
  redText: "rgba(244,120,130,0.9)",
  green: "rgba(52,211,153,0.08)",
  greenBorder: "rgba(52,211,153,0.22)",
  greenText: "rgba(52,211,153,0.75)",
};
const SERIF = "'Georgia', serif";
const MONO = "'Courier New', monospace";

// ─── Shared text style helpers ────────────────────────────────────────────────
const dimText: React.CSSProperties = { color: C.goldDim, fontFamily: MONO };
const goldText: React.CSSProperties = { color: C.gold, fontFamily: MONO };
const creamText: React.CSSProperties = { color: C.cream, fontFamily: MONO };

const ghostBtn: React.CSSProperties = {
  background: C.bgInput,
  border: `1px solid ${C.goldFaint}`,
  color: C.goldDim,
  fontFamily: MONO,
  fontSize: 10,
  fontWeight: "bold",
  letterSpacing: "0.1em",
  borderRadius: 10,
  padding: "7px 14px",
  cursor: "pointer",
  transition: "all 0.2s",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS = Array.from({ length: 8 }).map((_, i) => ({
  id: `user-${i + 1}`,
  name: i === 0 ? "Admin Utama" : `User ${i + 1}`,
  email: i === 0 ? "admin@pixiebooth.com" : `user${i + 1}@gmail.com`,
  createdAt: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  status: i % 3 === 0 ? "inactive" : "active",
  role: i === 0 ? "Admin" : "User",
}));

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({
  children,
  onClick,
  title,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  variant?: "default" | "red" | "green";
}) {
  const [h, setH] = useState(false);
  const bg = h
    ? variant === "red"
      ? "rgba(244,63,94,0.12)"
      : variant === "green"
        ? "rgba(52,211,153,0.1)"
        : "rgba(212,172,94,0.1)"
    : "transparent";
  const color = h
    ? variant === "red"
      ? C.redText
      : variant === "green"
        ? C.greenText
        : C.gold
    : C.goldDim;
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="flex items-center justify-center transition-all active:scale-90"
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        cursor: "pointer",
        background: bg,
        color,
        border: `1px solid ${h ? bg : "transparent"}`,
      }}
    >
      {children}
    </button>
  );
}

// ─── Form Input ───────────────────────────────────────────────────────────────
function FormInput({
  icon: Icon,
  label,
  ...props
}: {
  icon: React.ElementType;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [f, setF] = useState(false);
  return (
    <div>
      <p
        style={{
          ...dimText,
          fontSize: 8,
          fontWeight: "bold",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors"
          style={{ color: f ? C.gold : C.goldDim }}
        />
        <input
          {...props}
          onFocus={(e) => {
            setF(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setF(false);
            props.onBlur?.(e);
          }}
          className="w-full outline-none transition-all"
          style={{
            paddingLeft: 34,
            paddingRight: 12,
            paddingTop: 10,
            paddingBottom: 10,
            borderRadius: 10,
            background: f ? C.bgInputFocus : C.bgInput,
            border: `1px solid ${f ? C.goldBorder : C.goldFaint}`,
            color: C.cream,
            fontFamily: MONO,
            fontSize: 11,
          }}
        />
      </div>
    </div>
  );
}

// ─── Form Select ──────────────────────────────────────────────────────────────
function FormSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [f, setF] = useState(false);
  return (
    <div>
      <p
        style={{
          ...dimText,
          fontSize: 8,
          fontWeight: "bold",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors"
          style={{ color: f ? C.gold : C.goldDim }}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          className="w-full outline-none appearance-none transition-all"
          style={{
            paddingLeft: 34,
            paddingRight: 12,
            paddingTop: 10,
            paddingBottom: 10,
            borderRadius: 10,
            background: f ? C.bgInputFocus : C.bgInput,
            border: `1px solid ${f ? C.goldBorder : C.goldFaint}`,
            color: C.cream,
            fontFamily: MONO,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          {options.map((o) => (
            <option
              key={o.value}
              value={o.value}
              style={{ background: "#0c0a09", color: C.cream }}
            >
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Film Strip Decoration ────────────────────────────────────────────────────
function FilmStrip() {
  return (
    <div style={{ display: "flex", gap: 4, height: 14, overflow: "hidden" }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "60%",
              height: "55%",
              borderRadius: 2,
              background:
                i % 3 === 0 ? "rgba(212,172,94,0.08)" : "rgba(212,172,94,0.03)",
              border: `1px solid ${C.goldFaint}`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const q = search.toLowerCase();
        return (
          (u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)) &&
          (statusFilter === "all" || u.status === statusFilter)
        );
      }),
    [search, statusFilter, users],
  );

  const openModal = (user: any = null) => {
    setEditingUser(user);
    setFormData(
      user
        ? { name: user.name, email: user.email, password: "", role: user.role }
        : { name: "", email: "", password: "", role: "User" },
    );
    setIsModalOpen(true);
  };

  const toggleStatus = (id: string) =>
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u,
      ),
    );

  const deleteUser = (id: string) => {
    if (confirm("Hapus user ini dari arsip?"))
      setUsers(users.filter((u) => u.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)),
      );
    } else {
      setUsers([
        {
          id: `user-${Date.now()}`,
          ...formData,
          status: "active",
          createdAt: new Date().toISOString(),
        },
        ...users,
      ]);
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ minHeight: "100dvh", background: C.bg, paddingBottom: 60 }}>
      {/* ══ STICKY HEADER ══ */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: C.bgPanel,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${C.goldFaint}`,
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
                fontFamily: SERIF,
                fontSize: "clamp(18px,4vw,24px)",
                fontWeight: 900,
                background: "linear-gradient(135deg,#d4ac5e,#f5e4b0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
                marginTop: 2,
              }}
            >
              User Management
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors"
                style={{ color: focusSearch ? C.gold : C.goldDim }}
              />
              <input
                type="text"
                placeholder="Cari nama / email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocusSearch(true)}
                onBlur={() => setFocusSearch(false)}
                className="outline-none transition-all"
                style={{
                  paddingLeft: 34,
                  paddingRight: search ? 32 : 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 10,
                  width: "clamp(140px,30vw,220px)",
                  background: focusSearch ? C.bgInputFocus : C.bgInput,
                  border: `1px solid ${focusSearch ? C.goldBorder : C.goldFaint}`,
                  color: C.cream,
                  fontFamily: MONO,
                  fontSize: 11,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: C.goldDim }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5"
              style={{
                ...ghostBtn,
                background: showFilters ? "rgba(212,172,94,0.1)" : C.bgInput,
                borderColor: showFilters ? "rgba(212,172,94,0.3)" : C.goldFaint,
                color: showFilters ? C.gold : C.goldDim,
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FILTER</span>
            </button>

            {/* Add user */}
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1.5 active:scale-95 transition-all"
              style={{
                ...ghostBtn,
                background:
                  "linear-gradient(135deg,rgba(212,172,94,0.85),rgba(196,154,58,0.8))",
                border: `1px solid ${C.goldBorder}`,
                color: "#0c0a09",
                boxShadow: "0 4px 16px rgba(212,172,94,0.15)",
              }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TAMBAH USER</span>
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
                borderTop: `1px solid ${C.goldFaint}`,
              }}
            >
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-wrap gap-3 items-center">
                <span
                  style={{
                    ...dimText,
                    fontSize: 8,
                    fontWeight: "bold",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Status
                </span>
                <div className="flex gap-1.5">
                  {(
                    [
                      ["all", "SEMUA"],
                      ["active", "AKTIF"],
                      ["inactive", "NONAKTIF"],
                    ] as const
                  ).map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setStatusFilter(val)}
                      className="px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        fontWeight: "bold",
                        letterSpacing: "0.05em",
                        background:
                          statusFilter === val
                            ? "rgba(212,172,94,0.15)"
                            : "rgba(212,172,94,0.03)",
                        border:
                          statusFilter === val
                            ? "1px solid rgba(212,172,94,0.35)"
                            : `1px solid ${C.goldFaint}`,
                        color: statusFilter === val ? C.gold : C.goldDim,
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                {(statusFilter !== "all" || search) && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setSearch("");
                    }}
                    className="px-2.5 py-1 rounded-lg cursor-pointer transition-all active:scale-95"
                    style={{
                      ...dimText,
                      fontSize: 9,
                      fontWeight: "bold",
                      background: "rgba(212,172,94,0.03)",
                      border: `1px solid ${C.goldFaint}`,
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

      {/* ══ STATS BAR ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users
            className="w-4 h-4"
            style={{ color: "rgba(212,172,94,0.4)" }}
          />
          <span style={{ ...goldText, fontSize: 11, fontWeight: "bold" }}>
            {filteredUsers.length}
          </span>
          <span style={{ ...dimText, fontSize: 10 }}>user ditemukan</span>
        </div>
        {filteredUsers.length !== users.length && (
          <span style={{ ...dimText, fontSize: 9 }}>
            dari {users.length} total
          </span>
        )}
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(to right,rgba(212,172,94,0.1),transparent)",
          }}
        />
      </div>

      {/* ══ TABLE ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${C.goldFaint}`,
            overflow: "hidden",
            background: C.bgCard,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  style={{
                    background: "rgba(10,7,3,0.8)",
                    borderBottom: `1px solid ${C.goldFaint}`,
                  }}
                >
                  {[
                    "NAMA & EMAIL",
                    "ROLE",
                    "TGL. DAFTAR",
                    "STATUS",
                    "AKSI",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={i === 4 ? "text-right" : ""}
                      style={{
                        padding: "14px 20px",
                        ...dimText,
                        fontSize: 8,
                        fontWeight: "bold",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ padding: "80px 20px", textAlign: "center" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(212,172,94,0.05)",
                            border: `1px solid ${C.goldFaint}`,
                          }}
                        >
                          <Users
                            className="w-8 h-8"
                            style={{ color: "rgba(212,172,94,0.2)" }}
                          />
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: SERIF,
                              fontSize: 16,
                              fontWeight: 900,
                              color: C.creamDim,
                            }}
                          >
                            Tidak ada user
                          </p>
                          <p style={{ ...dimText, fontSize: 10, marginTop: 4 }}>
                            Coba ubah filter atau kata kunci
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="group transition-colors"
                      style={{
                        borderBottom: `1px solid rgba(212,172,94,0.06)`,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(212,172,94,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Name / Email */}
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background:
                                "linear-gradient(135deg,rgba(212,172,94,0.12),rgba(212,172,94,0.05))",
                              border: `1px solid ${C.goldFaint}`,
                              fontFamily: SERIF,
                              fontSize: 14,
                              fontWeight: 900,
                              color: C.gold,
                            }}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p
                              style={{
                                fontFamily: SERIF,
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.cream,
                                lineHeight: 1.2,
                              }}
                            >
                              {user.name}
                            </p>
                            <p
                              style={{ ...dimText, fontSize: 10, marginTop: 1 }}
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontFamily: MONO,
                            fontSize: 8,
                            fontWeight: "bold",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            ...(user.role === "Admin"
                              ? {
                                  background: "rgba(212,172,94,0.12)",
                                  border: "1px solid rgba(212,172,94,0.3)",
                                  color: C.gold,
                                }
                              : {
                                  background: "rgba(212,172,94,0.04)",
                                  border: `1px solid ${C.goldFaint}`,
                                  color: C.goldDim,
                                }),
                          }}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ ...dimText, fontSize: 11 }}>
                          {formatDate(user.createdAt)}
                        </p>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontFamily: MONO,
                            fontSize: 9,
                            fontWeight: "bold",
                            letterSpacing: "0.08em",
                            ...(user.status === "active"
                              ? {
                                  background: C.green,
                                  border: `1px solid ${C.greenBorder}`,
                                  color: C.greenText,
                                }
                              : {
                                  background: C.red,
                                  border: `1px solid ${C.redBorder}`,
                                  color: C.redText,
                                }),
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background:
                                user.status === "active"
                                  ? C.greenText
                                  : C.redText,
                            }}
                          />
                          {user.status === "active" ? "AKTIF" : "NONAKTIF"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 4,
                          }}
                        >
                          <ActionBtn
                            onClick={() => openModal(user)}
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => toggleStatus(user.id)}
                            title={
                              user.status === "active"
                                ? "Nonaktifkan"
                                : "Aktifkan"
                            }
                            variant={user.status === "active" ? "red" : "green"}
                          >
                            {user.status === "active" ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => deleteUser(user.id)}
                            title="Hapus"
                            variant="red"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer / pagination */}
          <div
            style={{
              padding: "14px 20px",
              background: "rgba(10,7,3,0.6)",
              borderTop: `1px solid ${C.goldFaint}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                ...dimText,
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Total {filteredUsers.length} Users
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Prev */}
              <button
                disabled
                className="disabled:opacity-30 transition-all"
                style={{
                  ...ghostBtn,
                  width: 32,
                  height: 32,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {/* Current page */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9,
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: "bold",
                  background:
                    "linear-gradient(135deg,rgba(212,172,94,0.85),rgba(196,154,58,0.8))",
                  border: `1px solid ${C.goldBorder}`,
                  color: "#0c0a09",
                }}
              >
                1
              </div>
              {/* Next */}
              <button
                className="transition-all"
                style={{
                  ...ghostBtn,
                  width: 32,
                  height: 32,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODAL ══ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 cursor-pointer"
              style={{
                background: "rgba(0,0,0,0.88)",
                backdropFilter: "blur(12px)",
              }}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative w-full overflow-hidden"
              style={{
                maxWidth: 420,
                borderRadius: 24,
                background: "rgba(16,10,5,0.98)",
                border: `1px solid ${C.goldBorder}`,
                backdropFilter: "blur(20px)",
                boxShadow:
                  "0 60px 120px rgba(0,0,0,0.7),0 0 0 1px rgba(212,172,94,0.06)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "22px 24px 18px",
                  borderBottom: `1px solid ${C.goldFaint}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg,rgba(212,172,94,0.85),rgba(196,154,58,0.8))",
                      border: `1px solid ${C.goldBorder}`,
                    }}
                  >
                    <UserPlus
                      className="w-4 h-4"
                      style={{ color: "#0c0a09" }}
                    />
                  </div>
                  <h2
                    style={{
                      fontFamily: SERIF,
                      fontSize: 18,
                      fontWeight: 900,
                      background: "linear-gradient(135deg,#d4ac5e,#f5e4b0)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {editingUser ? "Edit User" : "Tambah User Baru"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center justify-center transition-all active:scale-90"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    cursor: "pointer",
                    background: "rgba(212,172,94,0.06)",
                    border: `1px solid ${C.goldFaint}`,
                    color: C.goldDim,
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form body */}
              <form
                onSubmit={handleSubmit}
                style={{
                  padding: "20px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <FormInput
                  icon={User}
                  label="Nama Lengkap"
                  type="text"
                  required
                  placeholder="Contoh: John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <FormInput
                  icon={Mail}
                  label="Email Address"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {!editingUser && (
                  <FormInput
                    icon={Lock}
                    label="Password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                )}
                <FormSelect
                  icon={Shield}
                  label="Role Akses"
                  value={formData.role}
                  onChange={(v) => setFormData({ ...formData, role: v })}
                  options={[
                    { value: "User", label: "User (Standard)" },
                    { value: "Admin", label: "Admin (Full Access)" },
                  ]}
                />

                {/* Film strip */}
                <div
                  style={{
                    height: 1,
                    background: C.goldFaint,
                    margin: "4px 0",
                  }}
                />
                <FilmStrip />

                {/* Buttons */}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 active:scale-95 transition-all"
                    style={{
                      padding: "12px 20px",
                      borderRadius: 14,
                      background: "rgba(212,172,94,0.05)",
                      border: `1px solid ${C.goldFaint}`,
                      color: C.goldDim,
                      fontFamily: MONO,
                      fontSize: 10,
                      fontWeight: "bold",
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                    }}
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] active:scale-95 transition-all"
                    style={{
                      padding: "12px 20px",
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg,rgba(212,172,94,0.9),rgba(196,154,58,0.85))",
                      border: `1px solid ${C.goldBorder}`,
                      color: "#0c0a09",
                      fontFamily: MONO,
                      fontSize: 10,
                      fontWeight: "bold",
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(212,172,94,0.2)",
                    }}
                  >
                    {editingUser ? "SIMPAN PERUBAHAN" : "SIMPAN USER"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { -webkit-font-smoothing: antialiased; }
        input::placeholder { color: rgba(212,172,94,0.25) !important; }
        select option { background: #0c0a09; color: rgba(245,228,176,0.8); }
      `,
        }}
      />
    </div>
  );
}
