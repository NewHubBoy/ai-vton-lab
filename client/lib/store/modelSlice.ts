'use client';

import { StateCreator } from 'zustand';
import type { ImageFile } from './types';

export interface ModelSlice {
  modelImage: ImageFile | null;
  setModelImage: (image: ImageFile | null) => void;
  clearModelImage: () => void;
}

export const createModelSlice: StateCreator<ModelSlice> = (set) => ({
  modelImage: null,
  setModelImage: (image) => set({ modelImage: image }),
  clearModelImage: () => set({ modelImage: null }),
});
