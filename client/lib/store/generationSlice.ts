'use client';

import { StateCreator } from 'zustand';
import type { ModelSlice } from './modelSlice';
import type { GarmentSlice } from './garmentSlice';

export interface GenerationSlice {
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  jobId: string | null;
  setJobId: (jobId: string | null) => void;

  resultImage: string | null;
  setResultImage: (url: string | null) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // History 刷新触发器
  historyVersion: number;
  triggerHistoryRefresh: () => void;

  canGenerate: () => boolean;
}

export const createGenerationSlice: StateCreator<
  GenerationSlice & ModelSlice & GarmentSlice,
  [],
  [],
  GenerationSlice
> = (set, get) => ({
  isGenerating: false,
  setIsGenerating: (generating) => set({ isGenerating: generating }),

  jobId: null,
  setJobId: (jobId) => set({ jobId }),

  resultImage: null,
  setResultImage: (url) => set({ resultImage: url }),

  error: null,
  setError: (error) => set({ error }),

  // History 刷新触发器
  historyVersion: 0,
  triggerHistoryRefresh: () => set((state) => ({ historyVersion: state.historyVersion + 1 })),

  canGenerate: () => {
    const state = get() as GenerationSlice & ModelSlice & GarmentSlice;
    const hasModel = state.modelImage !== null;
    const hasGarment = state.garmentImage !== null;
    return hasModel && hasGarment && !state.isGenerating;
  },
});
