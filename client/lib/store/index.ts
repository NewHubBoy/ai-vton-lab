'use client';

import { create } from 'zustand';
import { createModelSlice, ModelSlice } from './modelSlice';
import { createGarmentSlice, GarmentSlice } from './garmentSlice';
import { createSettingsSlice, SettingsSlice } from './settingsSlice';
import { createGenerationSlice, GenerationSlice } from './generationSlice';

export type TryOnState = ModelSlice & GarmentSlice & SettingsSlice & GenerationSlice;

export const useTryOnStore = create<TryOnState>((...args) => ({
  ...createModelSlice(...args),
  ...createGarmentSlice(...args),
  ...createSettingsSlice(...args),
  ...createGenerationSlice(...args),
}));

// 重新导出类型
export type { ImageFile, GarmentType } from './types';
