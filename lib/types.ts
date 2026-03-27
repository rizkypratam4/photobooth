export interface PhotoSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}

export interface FrameConfig {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  slots: PhotoSlot[];
}

export interface PhotoSession {
  frameId: string;
  photos: (string | null)[]; // Base64 strings
}
