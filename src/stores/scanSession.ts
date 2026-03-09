import { create } from "zustand";
import type { CapturedImage } from "@/types/scan";
import { MAX_IMAGES } from "@/types/scan";

interface ScanSessionStore {
  images: CapturedImage[];
  addImages: (newImages: CapturedImage[]) => void;
  removeImage: (id: string) => void;
  reset: () => void;
}

export const useScanSessionStore = create<ScanSessionStore>((set) => ({
  images: [],

  addImages: (newImages: CapturedImage[]): void =>
    set((state) => ({
      images: [...state.images, ...newImages].slice(0, MAX_IMAGES),
    })),

  removeImage: (id: string): void =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),

  reset: (): void => set({ images: [] }),
}));
