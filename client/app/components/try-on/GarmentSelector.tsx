'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useTryOnStore, ImageFile, GarmentType } from '@/app/lib/store';
import { generateId, cn } from '@/app/lib/utils';

interface GarmentSelectorProps {
  className?: string;
}

const garmentTypes: { type: GarmentType; label: string }[] = [
  { type: 'top', label: 'Top' },
  { type: 'bottom', label: 'Bottom' },
  { type: 'full', label: 'Full' },
];

export function GarmentSelector({ className }: GarmentSelectorProps) {
  const { garmentImages, setGarmentImage, clearGarmentImage } = useTryOnStore();
  const [activeTab, setActiveTab] = useState<GarmentType>('top');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File, type: GarmentType) => {
      if (!file.type.startsWith('image/')) return;

      const imageFile: ImageFile = {
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      };
      setGarmentImage(type, imageFile);
    },
    [setGarmentImage]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file, activeTab);
    },
    [handleFile, activeTab]
  );

  const allImages = garmentTypes
    .filter((item) => garmentImages[item.type] !== null)
    .map((item) => ({
      type: item.type,
      image: garmentImages[item.type]!,
    }));

  const activeIndex = garmentTypes.findIndex((item) => item.type === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn('space-y-2', className)}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Garments
        </h3>
      </div>

      {/* Tabs */}
      <div className="relative flex gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        {garmentTypes.map((item, index) => (
          <button
            key={item.type}
            onClick={() => setActiveTab(item.type)}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors z-10',
              activeTab === item.type
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            )}
          >
            {item.label}
          </button>
        ))}
        {/* Animated tab indicator */}
        <motion.div
          className="absolute top-0.5 bottom-0.5 rounded-md bg-white dark:bg-zinc-700 shadow-sm"
          initial={false}
          animate={{
            left: `${activeIndex * (100 / 3)}%`,
            width: `${100 / 3}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </div>

      {/* Thumbnail Grid */}
      <motion.div
        // key={activeTab}
        // initial={{ opacity: 0, y: 10 }}
        // animate={{ opacity: 1, y: 0 }}
        // transition={{ duration: 0.2 }}
        className="grid grid-cols-4 gap-2"
      >
        {allImages.map((item) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800"
          >
            <img
              src={item.image.preview}
              alt={item.type}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => clearGarmentImage(item.type)}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <X className="w-3 h-3 text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-1.5 py-0.5">
              <span className="text-[10px] text-white font-medium capitalize">
                {item.type}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Add button for active tab */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-violet-400 dark:hover:border-violet-500 cursor-pointer transition-colors flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50"
        >
          <Plus className="w-4 h-4 text-zinc-400" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </button>
      </motion.div>
    </motion.div>
  );
}
