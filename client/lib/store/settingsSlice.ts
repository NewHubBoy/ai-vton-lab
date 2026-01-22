'use client';

import { StateCreator } from 'zustand';

export interface SettingsSlice {
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
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
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
});
