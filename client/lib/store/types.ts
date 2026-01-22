'use client';

export type GarmentType = 'top' | 'bottom' | 'full';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
}
