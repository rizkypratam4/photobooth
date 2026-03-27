"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PhotoSession, FrameConfig } from "./types";

interface PhotoContextType {
  session: PhotoSession;
  selectedFrame: FrameConfig | null;
  setFrame: (frameId: string) => void;
  addPhoto: (index: number, photo: string) => void;
  removePhoto: (index: number) => void;
  resetSession: () => void;
  frames: FrameConfig[];
  addCustomFrame: (frame: FrameConfig) => void;
  isLoadingFrames: boolean;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [frames, setFrames] = useState<FrameConfig[]>([]);
  const [isLoadingFrames, setIsLoadingFrames] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState<FrameConfig | null>(null);
  const [session, setSession] = useState<PhotoSession>({
    frameId: "",
    photos: [],
  });

  useEffect(() => {
    async function fetchFrames() {
      try {
        const res = await fetch("/api/frames");
        if (!res.ok) throw new Error();
        const data: FrameConfig[] = await res.json();
        setFrames(data);
      } catch (err) {
        console.error("Error loading frames:", err);
      } finally {
        setIsLoadingFrames(false);
      }
    }
    fetchFrames();
  }, []);

  // User pilih frame → inisialisasi photos sesuai jumlah slot frame
  const setFrame = (frameId: string) => {
    const frame = frames.find((f) => f.id === frameId);
    if (!frame) return;
    setSelectedFrame(frame);
    setSession({ frameId, photos: Array(frame.slots.length).fill(null) });
  };

  const addPhoto = (index: number, photo: string) => {
    setSession((prev) => {
      const newPhotos = [...prev.photos];
      newPhotos[index] = photo;
      return { ...prev, photos: newPhotos };
    });
  };

  const removePhoto = (index: number) => {
    setSession((prev) => {
      const newPhotos = [...prev.photos];
      newPhotos[index] = null;
      return { ...prev, photos: newPhotos };
    });
  };

  const resetSession = () => {
    setSelectedFrame(null);
    setSession({ frameId: "", photos: [] });
  };

  const addCustomFrame = async (frame: FrameConfig) => {
    try {
      const res = await fetch("/api/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(frame),
      });
      if (!res.ok) throw new Error("Gagal simpan frame");
      const { imageUrl } = await res.json();
      const savedFrame = { ...frame, imageUrl };
      setFrames((prev) => {
        // Update jika sudah ada, tambah jika baru
        const exists = prev.find((f) => f.id === savedFrame.id);
        return exists
          ? prev.map((f) => (f.id === savedFrame.id ? savedFrame : f))
          : [...prev, savedFrame];
      });
    } catch (err) {
      console.error("Error saving frame:", err);
      throw err;
    }
  };

  return (
    <PhotoContext.Provider
      value={{
        session,
        selectedFrame,
        setFrame,
        addPhoto,
        removePhoto,
        resetSession,
        frames,
        addCustomFrame,
        isLoadingFrames,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhoto() {
  const context = useContext(PhotoContext);
  if (context === undefined)
    throw new Error("usePhoto must be used within a PhotoProvider");
  return context;
}
