'use client';

import { StateCreator } from 'zustand';
import type { ImageFile, GarmentType } from './types';

export interface GarmentSlice {
  garmentImages: Record<GarmentType, ImageFile | null>;
  setGarmentImage: (type: GarmentType, image: ImageFile | null) => void;
  clearGarmentImage: (type: GarmentType) => void;
  clearAllGarments: () => void;
  // 单一服装图片（简化版）
  garmentImage: ImageFile | null;
  setSingleGarmentImage: (image: ImageFile | null) => void;
  clearSingleGarmentImage: () => void;
}

export const createGarmentSlice: StateCreator<GarmentSlice> = (set) => ({
  garmentImages: { top: null, bottom: null, full: null },
  setGarmentImage: (type, image) =>
    set((state) => ({
      garmentImages: { ...state.garmentImages, [type]: image },
    })),
  clearGarmentImage: (type) =>
    set((state) => ({
      garmentImages: { ...state.garmentImages, [type]: null },
    })),
  clearAllGarments: () =>
    set({ garmentImages: { top: null, bottom: null, full: null } }),
  // 单一服装图片
  garmentImage: null,
  setSingleGarmentImage: (image) => set({ garmentImage: image }),
  clearSingleGarmentImage: () => set({ garmentImage: null }),
});
