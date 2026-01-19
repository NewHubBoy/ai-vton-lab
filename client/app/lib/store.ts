'use client';

import { create } from 'zustand';

export type GarmentType = 'top' | 'bottom' | 'full';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export interface TryOnState {
  // Model image
  modelImage: ImageFile | null;
  setModelImage: (image: ImageFile | null) => void;
  clearModelImage: () => void;

  // Garment images
  garmentImages: Record<GarmentType, ImageFile | null>;
  setGarmentImage: (type: GarmentType, image: ImageFile | null) => void;
  clearGarmentImage: (type: GarmentType) => void;
  clearAllGarments: () => void;

  // Settings
  resolution: '1K' | '2K' | '4K';
  setResolution: (resolution: '1K' | '2K' | '4K') => void;

  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
  setAspectRatio: (ratio: '1:1' | '4:5' | '9:16' | '16:9') => void;

  fit: 'loose' | 'fit' | 'tight';
  setFit: (fit: 'loose' | 'fit' | 'tight') => void;

  preserveIdentity: boolean;
  setPreserveIdentity: (preserve: boolean) => void;

  advancedSettingsOpen: boolean;
  setAdvancedSettingsOpen: (open: boolean) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  jobId: string | null;
  setJobId: (jobId: string | null) => void;

  resultImage: string | null;
  setResultImage: (url: string | null) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Computed
  canGenerate: () => boolean;
}

export const useTryOnStore = create<TryOnState>((set, get) => ({
  // Model image
  modelImage: null,
  setModelImage: (image) => set({ modelImage: image }),
  clearModelImage: () => set({ modelImage: null }),

  // Garment images
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

  // Settings
  resolution: '2K',
  setResolution: (resolution) => set({ resolution }),

  aspectRatio: '1:1',
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),

  fit: 'fit',
  setFit: (fit) => set({ fit }),

  preserveIdentity: true,
  setPreserveIdentity: (preserveIdentity) => set({ preserveIdentity }),

  advancedSettingsOpen: true,
  setAdvancedSettingsOpen: (open) => set({ advancedSettingsOpen: open }),

  // Generation state
  isGenerating: false,
  setIsGenerating: (generating) => set({ isGenerating: generating }),

  jobId: null,
  setJobId: (jobId) => set({ jobId }),

  resultImage: null,
  setResultImage: (url) => set({ resultImage: url }),

  error: null,
  setError: (error) => set({ error }),

  // Computed
  canGenerate: () => {
    const state = get();
    const hasModel = state.modelImage !== null;
    const hasGarment =
      state.garmentImages.top !== null ||
      state.garmentImages.bottom !== null ||
      state.garmentImages.full !== null;
    return hasModel && hasGarment && !state.isGenerating;
  },
}));
